import bidHistory from "../model/bidHistory.js";
import oneminuteBidHistory from "../model/1minute/bidHistory.js";
import threeminuteBidHistory from "../model/3minute/bidHistory.js";
import fiveminuteBidHistory from "../model/5minute/bidHistory.js";
import offerBonus from "../model/offerBonus.js";
import User from "../model/userSchema.js";

export const claimContriBonus = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findOne({ id }, { id: 1, level0contribution: 1,demo: 1});
    if (user.demo) {
      return res.status(200).send("Not valid for demo accounts");
    }
    if (user.block) {
      return res.status(200).send("Account Suspended");
    }
    if (user.level0contribution < 10000) {
      return res.status(200).send("Minimum contibution should 10,000");
    } else {
      var amount = (user.level0contribution * 25) / 100;
      await User.updateOne(
        { id },
        { $inc: { bonus: amount }, level0contribution: 0 }
      );
      await offerBonus.updateOne(
        { userId: id },
        {
          userId: id,
          $inc: { amount },
          $push: {
            history: {
              credit: "bonus",
              amount,
              note: "Contribution Claim",
              date: Date.now(),
            },
          },
        },
        {upsert: true}
      );
      return res.status(200).send(`Claim ${amount} Success`);
    }
  } catch (error) {}
};

export const getWinStreakData = async (req, res) => {
  try {
    const id = req.params.id;
    const game = parseInt(req.params.game);
    
    // Validate user
    const user = await User.findOne({ id }, { id: 1, demo: 1, block: 1});
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.demo) {
      return res.status(400).send("Not valid for demo accounts");
    }
    if (user.block) {
      return res.status(400).send("Account Suspended");
    }
    
    // Determine which bidHistory model to use based on game type
    let BidHistoryModel;
    let gameName;
    
    switch(game) {
      case 1:
        BidHistoryModel = oneminuteBidHistory;
        gameName = "1minute";
        break;
      case 3:
        BidHistoryModel = threeminuteBidHistory;
        gameName = "3minute";
        break;
      case 5:
        BidHistoryModel = fiveminuteBidHistory;
        gameName = "5minute";
        break;
      default:
        return res.status(400).send("Invalid game type. Valid games: 1 (1minute), 3 (3minute), 5 (5minute)");
    }
    
    // Define win streak reward tiers
    const streakTiers = [
      { streakLength: 5, bonusPercentage: 10, minBetAmount: 1 },
      { streakLength: 10, bonusPercentage: 20, minBetAmount: 1 },
      { streakLength: 20, bonusPercentage: 30, minBetAmount: 1 },
      { streakLength: 30, bonusPercentage: 40, minBetAmount: 1 },
      { streakLength: 40, bonusPercentage: 50, minBetAmount: 1 },
      { streakLength: 50, bonusPercentage: 100, minBetAmount: 1 }
    ];
    
    // Get bid history and calculate current streak
    var bids = [];
    var streak = [];
    var totalBettingAmount = 0;
    
    const bidHis = await BidHistoryModel.find({'bid.userId': parseInt(id)}).sort({'bid.date': -1}).limit(100);
   
    bidHis.forEach(element => {
      element.bid.forEach(bid => {
        if(bid.userId === parseInt(id)){
          bids.push(bid);
        }
      });
    });
    
    var canRun = true;
    bids.forEach(element => {
      if(element.amount >= 1){
        if(element.status === 'Fail' || element.status === 'Pending'){
          canRun = false;
        }
      } else {
        canRun = false;
      }

      if(canRun){
        if(!streak.includes(element.period)) {
          streak.push(element.period);
          totalBettingAmount += element.amount;
        }
      }
    });
    
    // Find unclaimed streaks
    let unclaimedStreak = [];
    let currentUnclaimedStreak = [];
    const originalStreakLength = streak.length;
    let claimedCount = 0;
    
    if(streak.length >= 5) {
      for (let index = 0; index < streak.length; index++) {
        const alreadyClaimed = await BidHistoryModel.findOne({_id: streak[index]},{streakClaim: 1});
        const isClaimed = alreadyClaimed && alreadyClaimed.streakClaim && alreadyClaimed.streakClaim.includes(id);
        
        if(isClaimed) {
          claimedCount++;
        }
        
        if(!isClaimed) {
          currentUnclaimedStreak.push(streak[index]);
        } else {
          if(currentUnclaimedStreak.length > unclaimedStreak.length) {
            unclaimedStreak = [...currentUnclaimedStreak];
          }
          currentUnclaimedStreak = [];
        }
      }
      
      if(currentUnclaimedStreak.length > unclaimedStreak.length) {
        unclaimedStreak = [...currentUnclaimedStreak];
      }
      
      // Recalculate total betting amount for unclaimed periods only
      totalBettingAmount = 0;
      bids.forEach(element => {
        if(unclaimedStreak.includes(element.period) && element.amount >= 1) {
          totalBettingAmount += element.amount;
        }
      });
    }
    
    const currentUnclaimedStreakLength = unclaimedStreak.length;
    
    // Find highest eligible tier index
    let highestEligibleTierIndex = -1;
    for (let i = streakTiers.length - 1; i >= 0; i--) {
      if (currentUnclaimedStreakLength >= streakTiers[i].streakLength) {
        highestEligibleTierIndex = i;
        break;
      }
    }
    
    // Prepare eligible and next targets
    const eligibleTiers = [];
    
    // For current unclaimed streak, ALL tiers up to the highest eligible are claimable
    for (let i = 0; i <= highestEligibleTierIndex; i++) {
      const tier = streakTiers[i];
      const tierNumber = i + 1;
      const reward = Math.floor((totalBettingAmount * tier.bonusPercentage) / 100);
      
      eligibleTiers.push({
        tier: tierNumber,
        streakLength: tier.streakLength,
        bonusPercentage: tier.bonusPercentage,
        reward: reward
      });
    }
    
    // Set next targets
    let remainingTargets = [];
    
    if (currentUnclaimedStreakLength === 0) {
      // If no current unclaimed streak, show all tiers as targets
      for (let i = 0; i < streakTiers.length; i++) {
        const target = streakTiers[i];
        remainingTargets.push({
          streakLength: target.streakLength,
          bonusPercentage: target.bonusPercentage,
          reward: 0, // No reward estimate since no current betting amount
          remaining: target.streakLength
        });
      }
    } else {
      // Show targets higher than current eligible tier
      for (let i = highestEligibleTierIndex + 1; i < streakTiers.length; i++) {
        const target = streakTiers[i];
        const reward = Math.floor((totalBettingAmount * target.bonusPercentage) / 100);
        remainingTargets.push({
          streakLength: target.streakLength,
          bonusPercentage: target.bonusPercentage,
          reward: reward,
          remaining: target.streakLength - currentUnclaimedStreakLength
        });
      }
      
      // If no remaining targets, show the highest tier
      if (remainingTargets.length === 0 && currentUnclaimedStreakLength >= 50) {
        const highestTier = streakTiers[streakTiers.length - 1];
        const reward = Math.floor((totalBettingAmount * highestTier.bonusPercentage) / 100);
        remainingTargets.push({
          streakLength: highestTier.streakLength,
          bonusPercentage: highestTier.bonusPercentage,
          reward: reward,
          remaining: 0
        });
      }
    }
    
    res.status(200).send({
      gameName,
      totalStreak: originalStreakLength,
      currentUnclaimedStreak: currentUnclaimedStreakLength,
      totalBettingAmount,
      claimedStreaks: claimedCount,
      eligibleTiers,  // All tiers that can be claimed for current unclaimed streak
      remainingTargets  // All future tiers to achieve
    });
    
  } catch (error) {
    console.error("Error in getWinStreakData:", error);
    res.status(500).send("Server Error");
  }
};

export const claimPeriodWonBonus = async(req,res) => {
  const id = req.params.id;
  const game = parseInt(req.params.game);
  
  var bids = [];
  var streak = [];
  var winning = 0;
  var totalBettingAmount = 0;
  var bonusPercentage = 0;
  
  try {
    const user = await User.findOne({ id }, { id: 1, level0contribution: 1, demo: 1, block: 1});
    if (user.demo) {
      return res.status(400).send("Not valid for demo accounts");
    }
    if (user.block) {
      return res.status(400).send("Account Suspended");
    }
    
    // Determine which bidHistory model to use based on game type
    let BidHistoryModel;
    let gameName;
    
    switch(game) {
      case 1:
        BidHistoryModel = oneminuteBidHistory;
        gameName = "1minute";
        break;
      case 3:
        BidHistoryModel = threeminuteBidHistory;
        gameName = "3minute";
        break;
      case 5:
        BidHistoryModel = fiveminuteBidHistory;
        gameName = "5minute";
        break;
      default:
        return res.status(400).send("Invalid game type. Valid games: 1 (1minute), 3 (3minute), 5 (5minute)");
    }
    
    // Get more bid history to check for longer streaks
    var bidHis = await BidHistoryModel.find({'bid.userId': parseInt(id)}).sort({'bid.date': -1}).limit(100);
   
    bidHis.forEach(element => {
      element.bid.forEach(bid => {
        if(bid.userId === parseInt(id)){
             bids.push(bid);
        }
      });
    });
    bidHis.sort((a, b) => new Date(b.date) - new Date(a.date));
    var canRun = true;
    
    bids.forEach(element => {
      if(element.amount >= 1){
        if(element.status === 'Fail' || element.status === 'Pending'){
          canRun = false;
        }
      }else{
        canRun = false;
      }

      if(canRun){
        if(!streak.includes(element.period))
        streak.push(element.period)
        totalBettingAmount += element.amount;
      }
    });
    
    // Find the longest unclaimed consecutive win streak
    let unclaimedStreak = [];
    let currentUnclaimedStreak = [];
    const originalStreakLength = streak.length;
    let claimedCount = 0;
    
    if(streak.length >= 5) {
      for (let index = 0; index < streak.length; index++) {
        const alreadyClaimed = await BidHistoryModel.findOne({_id: streak[index]},{streakClaim: 1});
        const isClaimed = alreadyClaimed && alreadyClaimed.streakClaim && alreadyClaimed.streakClaim.includes(id);
        
        if(isClaimed) {
          claimedCount++;
        }
        
        if(!isClaimed) {
          // Add to current unclaimed streak
          currentUnclaimedStreak.push(streak[index]);
        } else {
          // Claimed period found, check if current streak is longer than previous best
          if(currentUnclaimedStreak.length > unclaimedStreak.length) {
            unclaimedStreak = [...currentUnclaimedStreak];
          }
          // Reset current streak
          currentUnclaimedStreak = [];
        }
      }
      
      // Check final streak in case it's the longest
      if(currentUnclaimedStreak.length > unclaimedStreak.length) {
        unclaimedStreak = [...currentUnclaimedStreak];
      }
      
      // Update streak to only include unclaimed periods
      streak = unclaimedStreak;
      
      // Recalculate total betting amount for unclaimed periods only
      totalBettingAmount = 0;
      bids.forEach(element => {
        if(streak.includes(element.period) && element.amount >= 1) {
          totalBettingAmount += element.amount;
        }
      });
    }
    
    // Determine bonus percentage based on consecutive wins (highest eligible only)
    if(streak.length >= 50){
      bonusPercentage = 100; // 100%
    } else if(streak.length >= 40){
      bonusPercentage = 50;  // 50%
    } else if(streak.length >= 30){
      bonusPercentage = 40;  // 40%
    } else if(streak.length >= 20){
      bonusPercentage = 30;  // 30%
    } else if(streak.length >= 10){
      bonusPercentage = 20;  // 20%
    } else if(streak.length >= 5){
      bonusPercentage = 10;  // 10%
    }
    
    // Calculate winning amount
    if(bonusPercentage > 0) {
      winning = Math.floor((totalBettingAmount * bonusPercentage) / 100);
    }
    
    if(winning === 0 || streak.length < 5){
      return res.status(400).send({
        success: false,
        message: "Minimum 5 consecutive unclaimed wins required",
        currentStreak: streak.length,
        totalStreak: originalStreakLength,
        claimedCount: claimedCount
      });
    } else {
      await User.updateOne(
        { id },
        { $inc: { balance: winning, withWallet: winning} }
      );
      
      const date = new Date();
      const localDate = (date / 1000 + 19800) * 1000;
      const newDate = new Date(localDate);
      const day = newDate.getDate();
      const month = newDate.getMonth() + 1;
      const year = newDate.getFullYear();
      const dayMonth = `${day}/${month}/${year}`;
      
      await offerBonus.updateOne(
        { userId: id },
        {
          userId: id,
          $inc: { 
            amount: winning,
            [`todayProfit.${dayMonth}.winStreak`]: winning,
            totalWinStreak: winning 
          },
          $push: {
            history: {
              credit: "wallet",
              amount: winning,
              note: `${gameName} Win Streak ${streak.length} - ${bonusPercentage}% Bonus`,
              date: Date.now(),
            },
          },
        },
        {upsert: true}
      );
      
      // Mark periods as claimed
      streak.forEach(async element => {
        await BidHistoryModel.updateOne({_id: element},{$push: {streakClaim: id}})
      });
      
      res.status(200).send({
        success: true,
        message: `Successfully claimed ${gameName} win streak bonus`,
        amount: winning,
        streakLength: streak.length,
        bonusPercentage: bonusPercentage,
        totalBettingAmount: totalBettingAmount,
        gameName: gameName
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).send('Error processing win streak bonus')
  }
}

