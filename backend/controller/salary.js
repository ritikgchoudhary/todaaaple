import User from "../model/userSchema.js";
import promotion from "../model/promotion.js";
import withdrawal from "../model/withdrawal.js";
import salary from "../model/salary.js";
import offerBonus from "../model/offerBonus.js";
import daily from "../model/daily.js";

export const getAgentEarning = async (req, res) => {
  try {
    const userId = req.params.id;
    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDate = new Date(localDate);
    const day = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    const dayMonth = `${day}/${month}/${year}`;

    var dailyTaskToday = 0;
    var todayReferral = 0;
    // Initialize today's level variables
    var todayLevel0 = 0;
    var todayLevel1 = 0;
    var todayLevel2 = 0;
    var todayLevel3 = 0;
    var todayLevel4 = 0;
    var todayLevel5 = 0;
    var todayLevel6 = 0;

    // Initialize total level variables
    var totalLevel0 = 0;
    var totalLevel1 = 0;
    var totalLevel2 = 0;
    var totalLevel3 = 0;
    var totalLevel4 = 0;
    var totalLevel5 = 0;
    var totalLevel6 = 0;
    var totalTask = 0;
    var totalReferral = 0;

    const getAgentProfit = await offerBonus.findOne(
      { userId },
      {
        [`todayProfit.${dayMonth}`]: 1,
        totalLevel0: 1,
        totalLevel1: 1,
        totalLevel2: 1,
        totalLevel3: 1,
        totalLevel4: 1,
        totalLevel5: 1,
        totalLevel6: 1,
        totalReferral: 1,
        totalDailyTask: 1,
      }
    );

    if (getAgentProfit) {
      // Get total values with null coalescing
      totalLevel0 = getAgentProfit.totalLevel0 ?? 0;
      totalLevel1 = getAgentProfit.totalLevel1 ?? 0;
      totalLevel2 = getAgentProfit.totalLevel2 ?? 0;
      totalLevel3 = getAgentProfit.totalLevel3 ?? 0;
      totalLevel4 = getAgentProfit.totalLevel4 ?? 0;
      totalLevel5 = getAgentProfit.totalLevel5 ?? 0;
      totalLevel6 = getAgentProfit.totalLevel6 ?? 0;
      totalTask = getAgentProfit.totalDailyTask ?? 0;
      totalReferral = getAgentProfit.totalReferral ?? 0;

      if (getAgentProfit.todayProfit) {
        if (getAgentProfit.todayProfit[`${dayMonth}`]) {
          const todayProfit = getAgentProfit.todayProfit[`${dayMonth}`];
          // Get today's values with null coalescing
          todayLevel0 = todayProfit.level0 ?? 0;
          todayLevel1 = todayProfit.level1 ?? 0;
          todayLevel2 = todayProfit.level2 ?? 0;
          todayLevel3 = todayProfit.level3 ?? 0;
          todayLevel4 = todayProfit.level4 ?? 0;
          todayLevel5 = todayProfit.level5 ?? 0;
          todayLevel6 = todayProfit.level6 ?? 0;
          dailyTaskToday = todayProfit.dailyTask ?? 0;
          todayReferral = todayProfit.referral ?? 0;
        }
      }
    }

    res.status(200).send({
      dailyTask: { today: dailyTaskToday, total: totalTask },
      refer: { today: todayReferral, total: totalReferral },
      level0: { today: todayLevel0, total: totalLevel0 },
      level1: { today: todayLevel1, total: totalLevel1 },
      level2: { today: todayLevel2, total: totalLevel2 },
      level3: { today: todayLevel3, total: totalLevel3 },
      level4: { today: todayLevel4, total: totalLevel4 },
      level5: { today: todayLevel5, total: totalLevel5 },
      level6: { today: todayLevel6, total: totalLevel6 },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
};

export const getSalaryTask = async (req, res) => {
  const userId = req.params.id;
  var totalActive = 0;
  var level0Active = 0;
  var otherLevelsActive = 0;
  var totalBid = 0;
  var downlineWithRecharge = 0;
  var salary1 = false;
  var salary2 = false;
  var salary3 = false;
  var salary4 = false;
  var salary5 = false;
  var salary6 = false;
  var salary7 = false;
  var salary8 = false;
  var salary9 = false;
  var activeMembers = []; // Array to store active members with bid progress

  const date = new Date();
  const localDate = (date / 1000 + 19800) * 1000;
  const newDate = new Date(localDate);
  const currentHour = newDate.getHours();

  // Determine the date to check based on current time
  let checkDate = new Date(localDate);
  let performanceDay;
  let canClaim = false;

  if (currentHour >= 0 && currentHour < 10) {
    // Between 12am-10am: Check previous day's performance for claiming
    checkDate.setDate(checkDate.getDate() - 1);
    canClaim = true;
  } else {
    // Between 10am-12am: Check today's performance (not claimable)
    // checkDate remains as today
    canClaim = false;
  }

  performanceDay = `${
    checkDate.getDate() +
    "/" +
    (checkDate.getMonth() + 1) +
    "/" +
    checkDate.getFullYear()
  }`;

  console.log(`Current hour: ${currentHour}, Checking performance for: ${performanceDay}, Can claim: ${canClaim}`);

  const getTodayDoc = await salary.findOne({ userId });
  const getPromotion = await promotion.findOne({ userId });
  
  // Count downline members with recharge from the performance day
  if (getPromotion) {
    // Check newLevel0
    if (getPromotion.newlevel0 && getPromotion.newlevel0[performanceDay]) {
      const level0Users = Object.keys(getPromotion.newlevel0[performanceDay]);
      for (const user of level0Users) {
        if (getPromotion.newlevel0[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel1
    if (getPromotion.newlevel1 && getPromotion.newlevel1[performanceDay]) {
      const level1Users = Object.keys(getPromotion.newlevel1[performanceDay]);
      for (const user of level1Users) {
        if (getPromotion.newlevel1[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel2
    if (getPromotion.newlevel2 && getPromotion.newlevel2[performanceDay]) {
      const level2Users = Object.keys(getPromotion.newlevel2[performanceDay]);
      for (const user of level2Users) {
        if (getPromotion.newlevel2[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel3
    if (getPromotion.newlevel3 && getPromotion.newlevel3[performanceDay]) {
      const level3Users = Object.keys(getPromotion.newlevel3[performanceDay]);
      for (const user of level3Users) {
        if (getPromotion.newlevel3[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel4
    if (getPromotion.newlevel4 && getPromotion.newlevel4[performanceDay]) {
      const level4Users = Object.keys(getPromotion.newlevel4[performanceDay]);
      for (const user of level4Users) {
        if (getPromotion.newlevel4[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel5
    if (getPromotion.newlevel5 && getPromotion.newlevel5[performanceDay]) {
      const level5Users = Object.keys(getPromotion.newlevel5[performanceDay]);
      for (const user of level5Users) {
        if (getPromotion.newlevel5[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel6
    if (getPromotion.newlevel6 && getPromotion.newlevel6[performanceDay]) {
      const level6Users = Object.keys(getPromotion.newlevel6[performanceDay]);
      for (const user of level6Users) {
        if (getPromotion.newlevel6[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
  }

  if (getTodayDoc && getTodayDoc.date[`${performanceDay}`]) {
    if (getTodayDoc.date[`${performanceDay}`].active) {
      const activeUsers = getTodayDoc.date[`${performanceDay}`].active;
      const keys = Object.keys(activeUsers);

      // Process each active user
      for (const userKey of keys) {
        const bidAmount = activeUsers[userKey];
        
        // Get user details to identify level
        const userDetails = await User.findOne({ phone: userKey }, { upLine: 1, name: 1 });
        const userLevel = userDetails ? (userDetails.upLine && userDetails.upLine[0] === userId ? "level0" : "other") : "unknown";
        
        // Add to activeMembers array
        activeMembers.push({
          phone: userKey,
          name: userDetails?.name || userKey,
          bidAmount: bidAmount,
          active: bidAmount >= 300,
          level: userLevel
        });
        
        if (bidAmount >= 300) { // Changed from 500 to 300
          // Determine level
          if (userDetails && userDetails.upLine && userDetails.upLine[0] === userId) {
            level0Active++;
          } else {
            otherLevelsActive++;
          }
          totalBid += bidAmount;
        }
      }
      
      totalActive = level0Active + otherLevelsActive;
    }

    if (getTodayDoc.date[`${performanceDay}`].claimed) {
      const claimed = getTodayDoc.date[`${performanceDay}`].claimed;
      salary1 = claimed.salary1 || false;
      salary2 = claimed.salary2 || false;
      salary3 = claimed.salary3 || false;
      salary4 = claimed.salary4 || false;
      salary5 = claimed.salary5 || false;
      salary6 = claimed.salary6 || false;
      salary7 = claimed.salary7 || false;
      salary8 = claimed.salary8 || false;
      salary9 = claimed.salary9 || false;
    }
  }

  const getUser = await promotion.findOne({ userId }, { level0: 1 });
  var totalMembers = 0;
  if (getUser && getUser.level0) {
    totalMembers = Object.keys(getUser.level0).length;
  }

  var task = [
    {
      id: 1,
      members: totalMembers,
      active: { 
        target: 10,
        current: totalActive > 10 ? 10 : totalActive,
        level0: level0Active > 5 ? 5 : level0Active,
        downlineRecharge: downlineWithRecharge > 3 ? 3 : downlineWithRecharge,
        required: { total: 10, level0: 5, downlineRecharge: 3 }
      },
      bid: { target: 5000, current: totalBid > 5000 ? 5000 : totalBid },
      eligible: totalActive >= 10 && level0Active >= 5 && downlineWithRecharge >= 3 ? true : false,
      salary: 600,
      claimed: salary1,
    },
    {
      id: 2,
      active: { 
        target: 20,
        current: totalActive > 20 ? 20 : totalActive,
        level0: level0Active > 8 ? 8 : level0Active,
        downlineRecharge: downlineWithRecharge > 6 ? 6 : downlineWithRecharge,
        required: { total: 20, level0: 8, downlineRecharge: 6 }
      },
      bid: { target: 10000, current: totalBid > 10000 ? 10000 : totalBid },
      eligible: totalActive >= 20 && level0Active >= 8 && downlineWithRecharge >= 6 ? true : false,
      salary: 1100,
      claimed: salary2,
    },
    {
      id: 3,
      active: { 
        target: 40,
        current: totalActive > 40 ? 40 : totalActive,
        level0: level0Active > 11 ? 11 : level0Active,
        downlineRecharge: downlineWithRecharge > 9 ? 9 : downlineWithRecharge,
        required: { total: 40, level0: 11, downlineRecharge: 9 }
      },
      bid: { target: 20000, current: totalBid > 20000 ? 20000 : totalBid },
      eligible: totalActive >= 40 && level0Active >= 11 && downlineWithRecharge >= 9 ? true : false,
      salary: 2600,
      claimed: salary3,
    },
    {
      id: 4,
      active: { 
        target: 60,
        current: totalActive > 60 ? 60 : totalActive,
        level0: level0Active > 14 ? 14 : level0Active,
        downlineRecharge: downlineWithRecharge > 13 ? 13 : downlineWithRecharge,
        required: { total: 60, level0: 14, downlineRecharge: 13 }
      },
      bid: { target: 30000, current: totalBid > 30000 ? 30000 : totalBid },
      eligible: totalActive >= 60 && level0Active >= 14 && downlineWithRecharge >= 13 ? true : false,
      salary: 4100,
      claimed: salary4,
    },
    {
      id: 5,
      active: { 
        target: 80,
        current: totalActive > 80 ? 80 : totalActive,
        level0: level0Active > 17 ? 17 : level0Active,
        downlineRecharge: downlineWithRecharge > 16 ? 16 : downlineWithRecharge,
        required: { total: 80, level0: 17, downlineRecharge: 16 }
      },
      bid: { target: 40000, current: totalBid > 40000 ? 40000 : totalBid },
      eligible: totalActive >= 80 && level0Active >= 17 && downlineWithRecharge >= 16 ? true : false,
      salary: 6100,
      claimed: salary5,
    },
    {
      id: 6,
      active: { 
        target: 100,
        current: totalActive > 100 ? 100 : totalActive,
        level0: level0Active > 21 ? 21 : level0Active,
        downlineRecharge: downlineWithRecharge > 19 ? 19 : downlineWithRecharge,
        required: { total: 100, level0: 21, downlineRecharge: 19 }
      },
      bid: { target: 50000, current: totalBid > 50000 ? 50000 : totalBid },
      eligible: totalActive >= 100 && level0Active >= 21 && downlineWithRecharge >= 19 ? true : false,
      salary: 8100,
      claimed: salary6,
    },
    {
      id: 7,
      active: { 
        target: 125,
        current: totalActive > 125 ? 125 : totalActive,
        level0: level0Active > 24 ? 24 : level0Active,
        downlineRecharge: downlineWithRecharge > 22 ? 22 : downlineWithRecharge,
        required: { total: 125, level0: 24, downlineRecharge: 22 }
      },
      bid: { target: 62500, current: totalBid > 62500 ? 62500 : totalBid },
      eligible: totalActive >= 125 && level0Active >= 24 && downlineWithRecharge >= 22 ? true : false,
      salary: 10000,
      claimed: salary7,
    },
    {
      id: 8,
      active: { 
        target: 150,
        current: totalActive > 150 ? 150 : totalActive,
        level0: level0Active > 27 ? 27 : level0Active,
        downlineRecharge: downlineWithRecharge > 25 ? 25 : downlineWithRecharge,
        required: { total: 150, level0: 27, downlineRecharge: 25 }
      },
      bid: { target: 75000, current: totalBid > 75000 ? 75000 : totalBid },
      eligible: totalActive >= 150 && level0Active >= 27 && downlineWithRecharge >= 25 ? true : false,
      salary: 13000,
      claimed: salary8,
    },
    {
      id: 9,
      active: { 
        target: 200,
        current: totalActive > 200 ? 200 : totalActive,
        level0: level0Active > 30 ? 30 : level0Active,
        downlineRecharge: downlineWithRecharge > 28 ? 28 : downlineWithRecharge,
        required: { total: 200, level0: 30, downlineRecharge: 28 }
      },
      bid: { target: 100000, current: totalBid > 100000 ? 100000 : totalBid },
      eligible: totalActive >= 200 && level0Active >= 30 && downlineWithRecharge >= 28 ? true : false,
      salary: 20000,
      claimed: salary9,
    }
  ];
  
  // Implement "highest available claiming" logic
  // Find the highest eligible salary level
  let highestEligibleLevel = 0;
  for (let i = task.length - 1; i >= 0; i--) {
    if (task[i].eligible && !task[i].claimed) {
      highestEligibleLevel = task[i].id;
      break;
    }
  }
  
  // Mark all lower levels as claimed if a higher level is available
  if (highestEligibleLevel > 0) {
    for (let i = 0; i < task.length; i++) {
      if (task[i].id < highestEligibleLevel && task[i].eligible) {
        task[i].claimed = true; // Mark as done
      }
    }
  }
  
  // Sort members by bid amount in descending order
  activeMembers.sort((a, b) => b.bidAmount - a.bidAmount);
  
  // Console log the highest bid user
  if (activeMembers.length > 0) {
    const highestBidUser = activeMembers[0];
    console.log(`Highest bid user for ${performanceDay}:`, {
      name: highestBidUser.name,
      phone: highestBidUser.phone,
      bidAmount: highestBidUser.bidAmount,
      level: highestBidUser.level
    });
  } else {
    console.log(`No active users found for ${performanceDay}`);
  }
  
  // Return both tasks and member progress with timing info
  res.status(200).send({
    tasks: task,
    memberProgress: activeMembers,
    highestAvailable: highestEligibleLevel,
    performanceDate: performanceDay,
    canClaim: canClaim,
    currentHour: currentHour,
    claimWindow: "12:00 AM - 10:00 AM",
    message: canClaim ? "Claiming is open - showing previous day performance" : "Claim window closed - showing today's performance"
  });
};

export const getSalaryRecordAdmin = async (req, res) => {
  const api = req.params.api;
  if(api === process.env.AdminAPI){
  try {
    const { date } = req.body; // Get date from query parameters

    if (!date) {
      return res.status(400).send("Date parameter is required");
    }

    // Get all salary records
    const salaryRecords = await salary.find({});
    
    // Array to store results
    const claimedSalaries = [];
    
    // Process each salary record
    for (const record of salaryRecords) {
      const userId = record.userId;
      
      // Check if there are claims for the specified date
      if (record.date && record.date[date] && record.date[date].claimed) {
        const claims = record.date[date].claimed;
        const claimedAmounts = [];
        
        // Process each salary claim
        for (const [salaryLevel, amount] of Object.entries(claims)) {
          claimedAmounts.push({
            level: salaryLevel,
            amount: amount
          });
        }
        
        // Only add to results if there are claims
        if (claimedAmounts.length > 0) {
          claimedSalaries.push({
            userId: userId,
            claimed: claimedAmounts
          });
        }
      }
    }
    
    res.status(200).send(claimedSalaries);
    
  } catch (error) {
    console.error("Error in getSalaryRecordAdmin:", error);
    res.status(500).send("Server Error");
  }
}else{
  res.status(401).send("Unauthorized");
}
};

export const getDailyTask = async (req, res) => {
  try {
    const userId = req.params.id;
    var level0 = 0;
    var active = 0;
    var bid = 0;
    var task1 = false;
    var task2 = false;
    var task3 = false;
    var task4 = false;
    var task5 = false;
    var task6 = false;
    var task7 = false;

    const getOldData = await promotion.findOne({ userId });
    if (getOldData) {
      const date = new Date();
      const localDate = (date / 1000 + 19800) * 1000;
      const newDate = new Date(localDate);
      const day = newDate.getDate();
      const month = newDate.getMonth() + 1;
      const year = newDate.getFullYear();
      const dayMonth = `${day}/${month}/${year}`;
      if (
        getOldData.newlevel0 &&
        getOldData.newlevel0[dayMonth] &&
        getOldData.newlevel0[dayMonth]
      ) {
        level0 = Object.keys(getOldData.newlevel0[dayMonth]).length;
        var keys = Object.keys(getOldData.newlevel0[dayMonth]);
        for (var i = 0; i < keys.length; i++) {
          var val = getOldData.newlevel0[dayMonth][keys[i]].todayRecharge;
          if (val) {
            active++;
          }
          bid += val;
        }
        if (getOldData.taskClaimed) {
          if (getOldData.taskClaimed[dayMonth]) {
            if (getOldData.taskClaimed[dayMonth].task1) {
              task1 = true;
            }
            if (getOldData.taskClaimed[dayMonth].task2) {
              task2 = true;
            }

            if (getOldData.taskClaimed[dayMonth].task3) {
              task3 = true;
            }
            if (getOldData.taskClaimed[dayMonth].task4) {
              task4 = true;
            }
            if (getOldData.taskClaimed[dayMonth].task5) {
              task5 = true;
            }
            if (getOldData.taskClaimed[dayMonth].task6) {
              task6 = true;
            }
            if (getOldData.taskClaimed[dayMonth].task7) {
              task7 = true;
            }
          }
        }
      }
    }

    var task = [
      {
        members: level0,
        id: 1,
        active: { target: 3, current: active > 3 ? 3 : active },
        bid: { target: 1000, current: bid > 1000 ? 1000 : bid },
        eligible: active >= 3 ? (bid >= 1000 ? true : false) : false,
        salary: 200,
        claimed: task1,
      },
      {
        id: 2,
        active: { target: 5, current: active > 5 ? 5 : active },
        bid: { target: 1500, current: bid > 1500 ? 1500 : bid },
        eligible: active >= 5 ? (bid >= 1500 ? true : false) : false,
        salary: 500,
        claimed: task2,
      },
      {
        id: 3,
        active: { target: 10, current: active > 10 ? 10 : active },
        bid: { target: 3000, current: bid > 3000 ? 3000 : bid },
        eligible: active >= 10 ? (bid >= 3000 ? true : false) : false,
        salary: 1200,
        claimed: task3,
      },
      {
        id: 4,
        active: { target: 15, current: active > 15 ? 15 : active },
        bid: { target: 5000, current: bid > 5000 ? 5000 : bid },
        eligible: active >= 15 ? (bid >= 5000 ? true : false) : false,
        salary: 1800,
        claimed: task4,
      },
      {
        id: 5,
        active: { target: 20, current: active > 20 ? 20 : active },
        bid: { target: 7500, current: bid > 7500 ? 7500 : bid },
        eligible: active >= 20 ? (bid >= 7500 ? true : false) : false,
        salary: 2500,
        claimed: task5,
      },
      {
        id: 6,
        active: { target: 35, current: active > 35 ? 35 : active },
        bid: { target: 12500, current: bid > 12500 ? 12500 : bid },
        eligible: active >= 35 ? (bid >= 12500 ? true : false) : false,
        salary: 3800,
        claimed: task6,
      },
      {
        id: 7,
        active: { target: 50, current: active > 50 ? 50 : active },
        bid: { target: 20000, current: bid > 20000 ? 20000 : bid },
        eligible: active >= 50 ? (bid >= 20000 ? true : false) : false,
        salary: 6500,
        claimed: task7,
      },
    ];
    res.status(200).send(task);
  } catch (error) {
    console.log(error);
  }
};
export const claimDailyTask = async (req, res) => {
  const number = req.params.number;
  const userId = req.params.id;
  const date = new Date();
  const localDate = (date / 1000 + 19800) * 1000;
  const newDate = new Date(localDate);
  var active = 0;
  var bid = 0;
  const todayDay = `${
    newDate.getDate() +
    "/" +
    (newDate.getMonth() + 1) +
    "/" +
    newDate.getFullYear()
  }`;

  const getOldData = await promotion.findOne({ userId });
  if (getOldData) {
    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDate = new Date(localDate);
    const day = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    const dayMonth = `${day}/${month}/${year}`;

    if (
      getOldData.newlevel0 &&
      getOldData.newlevel0[dayMonth] &&
      getOldData.newlevel0[dayMonth]
    ) {
      var keys = Object.keys(getOldData.newlevel0[dayMonth]);

      for (var i = 0; i < keys.length; i++) {
        var val = getOldData.newlevel0[dayMonth][keys[i]].todayRecharge;
        if (val) {
          active++;
        }
        bid += val;
      }
      if (getOldData.taskClaimed) {
        if (getOldData.taskClaimed[dayMonth]) {
          if (getOldData.taskClaimed[dayMonth][`task${number}`]) {
            return res.status(200).send("done");
          }
        }
      }
      var amount = 0;
      if (number === "1") {
        if (active >= 3 && bid >= 1000) {
          amount = 200;
        }
      }
      if (number === "2") {
        if (active >= 5 && bid >= 1500) {
          amount = 500;
        }
      }
      if (number === "3") {
        if (active >= 10 && bid >= 3000) {
          amount = 3000;
        }
      }
      if (number === "4") {
        if (active >= 15 && bid >= 5000) {
          amount = 5000;
        }
      }
      if (number === "5") {
        if (active >= 20 && bid >= 7500) {
          amount = 7500;
        }
      }
      if (number === "6") {
        if (active >= 35 && bid >= 12500) {
          amount = 12500;
        }
      }
      if (number === "7") {
        if (active >= 50 && bid >= 20000) {
          amount = 20000;
        }
      }
      if (amount > 0) {
        await User.updateOne(
          { id: userId },
          {
            $inc: { balance: amount, withWallet: amount },
          }
        );
        const filedNamee = `todayProfit.${dayMonth}.dailyTask`;
        await offerBonus.updateOne(
          { userId: userId },
          {
            userId: userId,
            $inc: { amount: amount, [filedNamee]: amount, totalDailyTask: amount},

            $push: {
              history: {
                credit: "wallet",
                amount: amount,
                note: `Daily Task Claim ${number}`,
                date: Date.now(),
              },
            },
          },
          { upsert: true }
        );

        const filedName = `taskClaimed.${dayMonth}.task${number}`;
        await promotion.updateOne({ userId }, { [filedName]: amount });
      }
      res.status(200).send("done");
    } else {
      res.status(200).send("done");
    }
  }
};
export const claimSalary = async (req, res) => {
  const number = req.params.number;
  const userId = req.params.id;
  const date = new Date();
  const localDate = (date / 1000 + 19800) * 1000;
  const newDate = new Date(localDate);
  const currentHour = newDate.getHours();
  
  // Check if claiming is allowed (12am to 10am only) AND check previous day performance
  if (currentHour >= 10) {
    return res.status(400).send("Salary claiming is only allowed between 12:00 AM - 10:00 AM for previous day performance");
  }
  
  var totalActive = 0;
  var level0Active = 0;
  var otherLevelsActive = 0;
  var totalBid = 0;
  var downlineWithRecharge = 0;

  // Calculate previous day's date for performance check (only during claim window)
  let performanceDate = new Date(localDate);
  performanceDate.setDate(performanceDate.getDate() - 1);

  const performanceDay = `${
    performanceDate.getDate() +
    "/" +
    (performanceDate.getMonth() + 1) +
    "/" +
    performanceDate.getFullYear()
  }`;

  console.log(`Claim attempt at hour ${currentHour} for previous day performance: ${performanceDay}`);

  const getTodayDoc = await salary.findOne({ userId });
  const getPromotion = await promotion.findOne({ userId });
  
  // Count downline members with previous day's recharge from all levels
  if (getPromotion) {
    // Check newLevel0
    if (getPromotion.newlevel0 && getPromotion.newlevel0[performanceDay]) {
      const level0Users = Object.keys(getPromotion.newlevel0[performanceDay]);
      for (const user of level0Users) {
        if (getPromotion.newlevel0[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel1
    if (getPromotion.newlevel1 && getPromotion.newlevel1[performanceDay]) {
      const level1Users = Object.keys(getPromotion.newlevel1[performanceDay]);
      for (const user of level1Users) {
        if (getPromotion.newlevel1[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel2
    if (getPromotion.newlevel2 && getPromotion.newlevel2[performanceDay]) {
      const level2Users = Object.keys(getPromotion.newlevel2[performanceDay]);
      for (const user of level2Users) {
        if (getPromotion.newlevel2[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel3
    if (getPromotion.newlevel3 && getPromotion.newlevel3[performanceDay]) {
      const level3Users = Object.keys(getPromotion.newlevel3[performanceDay]);
      for (const user of level3Users) {
        if (getPromotion.newlevel3[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel4
    if (getPromotion.newlevel4 && getPromotion.newlevel4[performanceDay]) {
      const level4Users = Object.keys(getPromotion.newlevel4[performanceDay]);
      for (const user of level4Users) {
        if (getPromotion.newlevel4[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel5
    if (getPromotion.newlevel5 && getPromotion.newlevel5[performanceDay]) {
      const level5Users = Object.keys(getPromotion.newlevel5[performanceDay]);
      for (const user of level5Users) {
        if (getPromotion.newlevel5[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
    
    // Check newLevel6
    if (getPromotion.newlevel6 && getPromotion.newlevel6[performanceDay]) {
      const level6Users = Object.keys(getPromotion.newlevel6[performanceDay]);
      for (const user of level6Users) {
        if (getPromotion.newlevel6[performanceDay][user].todayRecharge > 0) {
          downlineWithRecharge++;
        }
      }
    }
  }
  
  if (getTodayDoc && getTodayDoc.date[`${performanceDay}`]) {
    // Check if already claimed
    if (getTodayDoc.date[`${performanceDay}`].claimed) {
      if (getTodayDoc.date[`${performanceDay}`].claimed[`salary${number}`]) {
        return res.status(200).send("done");
      }
    }

    // Count active users and bids
    if (getTodayDoc.date[`${performanceDay}`].active) {
      const activeUsers = getTodayDoc.date[`${performanceDay}`].active;
      const keys = Object.keys(activeUsers);

      // Process each active user
      for (const userKey of keys) {
        const bidAmount = activeUsers[userKey];
        if (bidAmount >= 300) { // Changed from 500 to 300
          // Check if user is from level 0 or other levels
          const userLevel = await User.findOne({ phone: userKey }, { upLine: 1 });
          if (userLevel && userLevel.upLine && userLevel.upLine[0] === userId) {
            level0Active++;
          } else {
            otherLevelsActive++;
          }
          totalBid += bidAmount;
        }
      }
      
      totalActive = level0Active + otherLevelsActive;
    }

    var amount = 0;
    // Define salary levels with original requirements
    const salaryLevels = [
      { level: 1, totalActive: 10, level0Active: 5, downlineRecharge: 3, totalBid: 5000, amount: 600 },
      { level: 2, totalActive: 20, level0Active: 8, downlineRecharge: 6, totalBid: 10000, amount: 1100 },
      { level: 3, totalActive: 40, level0Active: 11, downlineRecharge: 9, totalBid: 20000, amount: 2600 },
      { level: 4, totalActive: 60, level0Active: 14, downlineRecharge: 13, totalBid: 30000, amount: 4100 },
      { level: 5, totalActive: 80, level0Active: 17, downlineRecharge: 16, totalBid: 40000, amount: 6100 },
      { level: 6, totalActive: 100, level0Active: 21, downlineRecharge: 19, totalBid: 50000, amount: 8100 },
      { level: 7, totalActive: 125, level0Active: 24, downlineRecharge: 22, totalBid: 62500, amount: 10000 },
      { level: 8, totalActive: 150, level0Active: 27, downlineRecharge: 25, totalBid: 75000, amount: 13000 },
      { level: 9, totalActive: 200, level0Active: 30, downlineRecharge: 28, totalBid: 100000, amount: 20000 }
    ];

    // Find the highest eligible salary level
    let highestEligibleLevel = 0;
    let highestEligibleAmount = 0;
    
    for (let i = salaryLevels.length - 1; i >= 0; i--) {
      const level = salaryLevels[i];
      if (totalActive >= level.totalActive && 
          level0Active >= level.level0Active && 
          downlineWithRecharge >= level.downlineRecharge && 
          totalBid >= level.totalBid) {
        highestEligibleLevel = level.level;
        highestEligibleAmount = level.amount;
        break;
      }
    }

    // Check if user is trying to claim the highest available level
    if (parseInt(number) !== highestEligibleLevel) {
      return res.status(400).send("You can only claim the highest available salary level");
    }

    // Set amount for the highest eligible level
    var amount = highestEligibleAmount;

    if (amount > 0) {
      // Update user balance
      await User.updateOne(
        { id: userId },
        {
          $inc: { balance: amount, withWallet: amount },
        }
      );

      // Update offer bonus
      const currentDay = `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
      const filedNamee = `todayProfit.${currentDay}.dailyTask`;
      await offerBonus.updateOne(
        { userId: userId },
        {
          userId: userId,
          $inc: { amount: amount, [filedNamee]: amount, totalDailyTask: amount },
          $push: {
            history: {
              credit: "wallet",
              amount: amount,
              note: `Salary Bonus Level ${number}`,
              date: Date.now(),
            },
          },
        },
        { upsert: true }
      );

      // Mark salary as claimed for the performance date
      const filedName = `date.${performanceDay}.claimed.salary${number}`;
      await salary.updateOne({ userId }, { [filedName]: amount });

      // Mark all lower levels as claimed (auto-complete)
      const updateFields = {};
      for (let i = 1; i < highestEligibleLevel; i++) {
        const lowerLevelField = `date.${performanceDay}.claimed.salary${i}`;
        updateFields[lowerLevelField] = true; // Mark as done
      }
      
      if (Object.keys(updateFields).length > 0) {
        await salary.updateOne({ userId }, updateFields);
      }
    }
    res.status(200).send("done");
  } else {
    res.status(200).send("done");
  }
};
export const getInviteBonusData = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get promotion data for the user
    const promotionData = await promotion.findOne({ userId });
    if (!promotionData || !promotionData.level0) {
      // Define reward tiers
      const rewardTiers = [
        { invitees: 1, rechargeAmount: 300, reward: 55 },
        { invitees: 3, rechargeAmount: 400, reward: 155 },
        { invitees: 10, rechargeAmount: 500, reward: 555 },
        { invitees: 30, rechargeAmount: 800, reward: 1555 },
        { invitees: 50, rechargeAmount: 1200, reward: 2775 },
        { invitees: 75, rechargeAmount: 1200, reward: 4165 },
        { invitees: 100, rechargeAmount: 1200, reward: 5555 },
        { invitees: 200, rechargeAmount: 1200, reward: 11111 },
        { invitees: 500, rechargeAmount: 1200, reward: 27777 },
        { invitees: 1000, rechargeAmount: 1200, reward: 55555 },
        { invitees: 2000, rechargeAmount: 1200, reward: 111111 },
        { invitees: 5000, rechargeAmount: 1200, reward: 277777 }
      ];

      // Return all tiers as remaining targets
      const remainingTargets = rewardTiers.map(tier => ({
        invitees: tier.invitees,
        rechargeAmount: tier.rechargeAmount,
        reward: tier.reward,
        remaining: tier.invitees // Since there are no invitees yet, remaining is same as target
      }));

      return res.status(200).send({
        totalInvitees: 0,
        qualifiedInvitees: 0,
        eligibleTiers: [],
        remainingTargets,
        previousClaimed: []
      });
    }

    // Count total invitees and calculate their total recharge
    const invitees = Object.keys(promotionData.level0);
    const totalInvitees = invitees.length;
    let qualifiedInvitees = 0;

    // Define reward tiers
    const rewardTiers = [
      { invitees: 1, rechargeAmount: 300, reward: 55 },
      { invitees: 3, rechargeAmount: 400, reward: 155 },
      { invitees: 10, rechargeAmount: 500, reward: 555 },
      { invitees: 30, rechargeAmount: 800, reward: 1555 },
      { invitees: 50, rechargeAmount: 1200, reward: 2775 },
      { invitees: 75, rechargeAmount: 1200, reward: 4165 },
      { invitees: 100, rechargeAmount: 1200, reward: 5555 },
      { invitees: 200, rechargeAmount: 1200, reward: 11111 },
      { invitees: 500, rechargeAmount: 1200, reward: 27777 },
      { invitees: 1000, rechargeAmount: 1200, reward: 55555 },
      { invitees: 2000, rechargeAmount: 1200, reward: 111111 },
      { invitees: 5000, rechargeAmount: 1200, reward: 277777 }
    ];

    // Count qualified invitees (those who met minimum recharge requirement)
    for (const invitee of invitees) {
      const inviteeData = promotionData.level0[invitee];
      if (inviteeData && inviteeData.totalRecharge) {
        // Find applicable tier based on current qualified invitees count
        const applicableTier = rewardTiers.find(tier => qualifiedInvitees < tier.invitees);
        const requiredRecharge = applicableTier ? applicableTier.rechargeAmount : rewardTiers[rewardTiers.length - 1].rechargeAmount;
        
        // Check against the tier's recharge requirement
        if (inviteeData.totalRecharge >= requiredRecharge) {
          qualifiedInvitees++;
        }
      }
    }

    // Find highest eligible tier index
    let highestEligibleTierIndex = -1;
    for (let i = rewardTiers.length - 1; i >= 0; i--) {
      if (qualifiedInvitees >= rewardTiers[i].invitees) {
        highestEligibleTierIndex = i;
        break;
      }
    }

    // Prepare eligible and claimed tiers
    const eligibleTiers = [];
    const previousClaimed = [];

    for (let i = 0; i <= highestEligibleTierIndex; i++) {
      const tier = rewardTiers[i];
      const claimed = promotionData.inviteBonusClaimed && promotionData.inviteBonusClaimed[`tier${i + 1}`];
      
      // Add to appropriate array based on claimed status
      if (claimed) {
        previousClaimed.push({
          tier: i + 1,
          invitees: tier.invitees,
          rechargeAmount: tier.rechargeAmount,
          reward: tier.reward,
          claimedAt: claimed
        });
      } else {
        eligibleTiers.push({
          tier: i + 1,
          invitees: tier.invitees,
          rechargeAmount: tier.rechargeAmount,
          reward: tier.reward
        });
      }
    }

    // Set next target
    let remainingTargets = [];
    for (let i = highestEligibleTierIndex + 1; i < rewardTiers.length; i++) {
      const target = rewardTiers[i];
      remainingTargets.push({
        invitees: target.invitees,
        rechargeAmount: target.rechargeAmount,
        reward: target.reward,
        remaining: target.invitees - qualifiedInvitees
      });
    }

    // If no remaining targets, use the highest tier
    if (remainingTargets.length === 0) {
      const highestTier = rewardTiers[rewardTiers.length - 1];
      remainingTargets.push({
        invitees: highestTier.invitees,
        rechargeAmount: highestTier.rechargeAmount,
        reward: highestTier.reward,
        remaining: Math.max(0, highestTier.invitees - qualifiedInvitees)
      });
    }

    res.status(200).send({
      totalInvitees,
      qualifiedInvitees,
      eligibleTiers,  // Unclaimed tiers that user can claim now
      remainingTargets,  // All future tiers to achieve
      previousClaimed  // Tiers that user has already claimed
    });

  } catch (error) {
    console.error("Error in getInviteBonusData:", error);
    res.status(500).send("Server Error");
  }
};

export const claimInvitationBonus = async (req, res) => {
  try {
    const userId = req.params.id;
    const tier = parseInt(req.params.tier);

    // Validate tier parameter
    if (!tier || isNaN(tier)) {
      return res.status(400).send("Invalid tier number");
    }

    // Define reward tiers
    const rewardTiers = [
      { invitees: 1, rechargeAmount: 300, reward: 55 },
      { invitees: 3, rechargeAmount: 300, reward: 155 },
      { invitees: 10, rechargeAmount: 500, reward: 555 },
      { invitees: 30, rechargeAmount: 800, reward: 1555 },
      { invitees: 50, rechargeAmount: 1200, reward: 2775 },
      { invitees: 75, rechargeAmount: 1200, reward: 4165 },
      { invitees: 100, rechargeAmount: 1200, reward: 5555 },
      { invitees: 200, rechargeAmount: 1200, reward: 11111 },
      { invitees: 500, rechargeAmount: 1200, reward: 27777 },
      { invitees: 1000, rechargeAmount: 1200, reward: 55555 },
      { invitees: 2000, rechargeAmount: 1200, reward: 111111 },
      { invitees: 5000, rechargeAmount: 1200, reward: 277777 }
    ];

    // Validate tier number is within range
    if (tier < 1 || tier > rewardTiers.length) {
      return res.status(400).send("Invalid tier number");
    }

    // Get promotion data
    const promotionData = await promotion.findOne({ userId });
    if (!promotionData || !promotionData.level0) {
      return res.status(400).send("No promotion data found");
    }

    // Check if already claimed
    if (promotionData.inviteBonusClaimed && promotionData.inviteBonusClaimed[`tier${tier}`]) {
      return res.status(400).send("This tier has already been claimed");
    }

    // Count qualified invitees
    const invitees = Object.keys(promotionData.level0);
    const totalInvitees = invitees.length;
    let qualifiedInvitees = 0;

    for (const invitee of invitees) {
      const inviteeData = promotionData.level0[invitee];
      if (inviteeData && inviteeData.totalRecharge) {
        // Find applicable tier based on current qualified invitees count
        const applicableTier = rewardTiers.find(tier => qualifiedInvitees < tier.invitees);
        const requiredRecharge = applicableTier ? applicableTier.rechargeAmount : rewardTiers[rewardTiers.length - 1].rechargeAmount;
        
        // Check against the tier's recharge requirement
        if (inviteeData.totalRecharge >= requiredRecharge) {
          qualifiedInvitees++;
        }
      }
    }

    // Get target tier requirements
    const targetTier = rewardTiers[tier - 1];

    // Check if user meets requirements for requested tier
    if (qualifiedInvitees < targetTier.invitees) {
      return res.status(400).send("Not enough qualified invitees for this tier");
    }

    // Process the claim
    const amount = targetTier.reward;
    const now = Date.now();

    // Update user balance
    await User.updateOne(
      { id: userId },
      {
        $inc: { balance: amount, withWallet: amount },
      }
    );

    // Update offer bonus
    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDate = new Date(localDate);
    const day = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    const dayMonth = `${day}/${month}/${year}`;

    await offerBonus.updateOne(
      { userId },
      {
        userId,
        $inc: { 
          amount: amount,
          [`todayProfit.${dayMonth}.inviteBonus`]: amount,
          totalInviteBonus: amount 
        },
        $push: {
          history: {
            credit: "wallet",
            amount: amount,
            note: `Invitation Bonus Tier ${tier}`,
            date: now,
          },
        },
      },
      { upsert: true }
    );

    // Mark tier as claimed
    await promotion.updateOne(
      { userId },
      { 
        [`inviteBonusClaimed.tier${tier}`]: now
      }
    );

    res.status(200).send({
      success: true,
      message: `Successfully claimed Tier ${tier} bonus`,
      amount: amount,
      tier: tier
    });

  } catch (error) {
    console.error("Error in claimInvitationBonus:", error);
    res.status(500).send("Server Error");
  }
};

export const getInviteRecord = async (req, res) => {
  try {
    const userId = req.params.id;
    const getInvites = await promotion.findOne({ userId }, { level0: 1 });
    
    if (!getInvites || !getInvites.level0) {
      return res.status(200).send([]);
    }

    // Get all invitee data
    const inviteRecords = [];
    const phones = Object.keys(getInvites.level0);

    // Process each invitee
    for (const phone of phones) {
      const inviteeData = getInvites.level0[phone];
      if (inviteeData) {
        // Mask phone number (show only last 4 digits)
        const maskedPhone = `xxx****${phone.slice(-4)}`;

        // Format date
        const dateInvited = inviteeData.date 
          ? new Date(inviteeData.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          : 'N/A';

        // Format recharge amount
        const totalRecharge = inviteeData.totalRecharge 
          ? `₹${inviteeData.totalRecharge.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 0
            })}`
          : '₹0';

        inviteRecords.push({
          name: maskedPhone,
          dateInvited,
          totalRecharge
        });
      }
    }

    // Sort records by date (most recent first)
    inviteRecords.sort((a, b) => {
      const dateA = a.dateInvited !== 'N/A' ? new Date(a.dateInvited.split('/').reverse().join('-')) : new Date(0);
      const dateB = b.dateInvited !== 'N/A' ? new Date(b.dateInvited.split('/').reverse().join('-')) : new Date(0);
      return dateB - dateA;
    });

    res.status(200).send(inviteRecords);

  } catch (error) {
    console.error("Error in getInviteRecord:", error);
    res.status(500).send("Server Error");
  }
};

export const getOfferTransactions = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get offer bonus data for the user
    const offerData = await offerBonus.findOne({ userId });
    
    if (!offerData || !offerData.history) {
      return res.status(200).send([]);
    }

    // Transform and format the history data
    const transactions = offerData.history.map(transaction => ({
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.note,
      status: transaction.credit === "wallet" ? "Completed" : "Failed"
    }));

    // Sort transactions by date (most recent first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).send(transactions);

  } catch (error) {
    console.error("Error in getOfferTransactions:", error);
    res.status(500).send("Server Error");
  }
};