import User from "../../model/userSchema.js";
import FastParityPeriod from "../../model/bigsmall/bidData.js";
import Manual from "../../model/bigsmall/result.js";
import Price from "../../model/bigsmall/period.js";
import BidHistory from "../../model/bigsmall/bidHistory.js";
import ErrorResponse from "../../utils/error.js";
import Record from "../../model/bigsmall/record.js";
import jwt from "jsonwebtoken";
import PlayHistory from "../../model/playHistory.js";
import extra from "../../model/extra.js";
import reports from "../../model/reports.js";
import promotion from "../../model/promotion.js";
import salary from "../../model/salary.js";

export const bigsmall_bidData = async (req, res, next) => {
  try {
    const token = req.body.auth.split(" ")[1];
    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    const bidOn = req.body.bidOn;
    const game = req.body.game;
    const bidAmount = req.body.bidAmount;
    const userId = req.body.userId;
    const fieldName = "players";

    var user = await User.findOne({ id: userId });
    if (user.block) return next(new ErrorResponse("Account Suspended", 400));
    if (!user) {
      console.log("no user");
    } else {
      if (user.balance < bidAmount) {
        next(new ErrorResponse("Insufficient Fund", 500));
      } else {
        if (bidAmount < 1) {
          next(new ErrorResponse("Insufficient Fund", 500));
        } else {
          const date = new Date();
          const localDate = (date / 1000 + 19800) * 1000;
          const newDate = new Date(localDate);
          const dateFormated = `${newDate.getDate() + "/" + (newDate.getMonth()+1) + "/" + newDate.getFullYear()}`;

          const level0 =
          "activeMembers." + `${dateFormated}` + ".0";
        const level1 =
          "activeMembers." + `${dateFormated}` + ".1";
        const level2 =
          "activeMembers." + `${dateFormated}` + ".2";
          
          if(user.upLine[0] !== "null"){

            await promotion.updateOne(
              { userId: user.upLine[0] },
              { $addToSet: { [level0]: user.id } }
            );
              }
            if (user.upLine.length > 1) {
              if(user.upLine[1] !== "null"){
  
              await promotion.updateOne(
                { userId: user.upLine[1] },
                { $addToSet: { [level1]: user.id } }
              );}
            }
            if (user.upLine.length > 2) {
              if(user.upLine[2] !== "null"){
  
              await promotion.updateOne(
                { userId: user.upLine[2] },
                { $addToSet: { [level2]: user.id } }
              );}
            }

            const SalarybidToday =
            `date.${dateFormated}.active.${user.phone}`;
            
            await salary.updateOne(
              { userId: user.upLine[0] },
              {
                userId: user.upLine[0],
                $inc: {
                  [SalarybidToday]: bidAmount
                },
              },
              { upsert: true }
            );
          
            var userBid = [];
            var recordId = await Record.find().sort({ date: -1 }).limit(1);
            var newRecord = recordId[0].id + 1;
  
            await BidHistory
            .find({
              _id: newRecord,
            })
            .then((result) => {
              
              if (result.length > 0) {
                const rowData = result[0].bid;
                
                rowData.forEach((bid) => {
                  if (bid.userId === userId) {
                    
                    userBid.push(bid);
                  }
                });
                
              }
              
            })
            var deductAmount = 0;
            var repeatedBid = false;
            userBid.forEach(element => {
             
                if(element.select.includes('Green') && bidOn.includes('Red')){
                  repeatedBid = true;
                  deductAmount = element.amount;
                }
                if(element.select.includes('Red') && bidOn.includes('Green')){
                  repeatedBid = true;
                  deductAmount = element.amount;
                }
                if(element.select.includes('Big') && bidOn.includes('Small')){
                  repeatedBid = true;
                  deductAmount = element.amount;
                }
                if(element.select.includes('Small') && bidOn.includes('Big')){
                  repeatedBid = true;
                  deductAmount = element.amount;
                }
              
            });
            const bidToday = "bidToday." + dateFormated;
            if(repeatedBid){
              
           
            await User.updateOne(
              { id: user.id },
            
              {$inc: { balance: -bidAmount, [bidToday]: +bidAmount} }
            );
  
            }else{
              var withWalletAmount = user.withWallet??0;
              var newWithWallet = withWalletAmount + bidAmount;
              if((user.balance - bidAmount) < newWithWallet){
                newWithWallet = (user.balance - bidAmount);
              }
              await User.updateOne(
                { id: user.id },
              
                {withWallet: newWithWallet,$inc: { balance: -bidAmount, [bidToday]: +bidAmount} }
              );
            }
          const lastFastParityPeriod = await FastParityPeriod.findOne().sort({
            date: -1,
          });
          const putBidData = await FastParityPeriod.updateOne(
            { _id: lastFastParityPeriod._id },
            {
              $push: {
                players: {
                  bidOn: bidOn,
                  bidAmount: bidAmount,
                  userId: user.id,
                },
              },
            }
          );
         
          const bidHistoryData = {
            period: newRecord,
            date: Date.now(),
            select: bidOn,
            status: "Pending",
            openPrice: "Pending",
            result: "Pending",
            winning: "Pending",
            amount: bidAmount,
            userId: userId,
            game: game,
          };
          await BidHistory.updateOne(
            { _id: newRecord },
            { $push: { bid: bidHistoryData } },
            { upsert: true }
          );
          if (user.demo) {
          } else {
            if (bidOn === "Join Green") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d771" },
                { $inc: { price: +bidAmount } }
              );
            }
            if (bidOn === "Big") {
              await Price.updateOne(
                { id: "big" },
                { $inc: { price: +bidAmount } }
              );
            }
            if (bidOn === "Small") {
              await Price.updateOne(
                { id: "small" },
                { $inc: { price: +bidAmount } }
              );
            }

            if (bidOn === "Join Red") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d772" },
                { $inc: { price: +bidAmount } }
              );
            }
            if (bidOn === "Join Violet") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d773" },
                { $inc: { price: +bidAmount } }
              );
            }
            if (bidOn === "Select 0") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.0": +bidAmount } }
              );
            }
            if (bidOn === "Select 1") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.1": +bidAmount } }
              );
            }
            if (bidOn === "Select 2") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.2": +bidAmount } }
              );
            }
            if (bidOn === "Select 3") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.3": +bidAmount } }
              );
            }
            if (bidOn === "Select 4") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.4": +bidAmount } }
              );
            }
            if (bidOn === "Select 5") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.5": +bidAmount } }
              );
            }
            if (bidOn === "Select 6") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.6": +bidAmount } }
              );
            }
            if (bidOn === "Select 7") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.7": +bidAmount } }
              );
            }
            if (bidOn === "Select 8") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.8": +bidAmount } }
              );
            }
            if (bidOn === "Select 9") {
              await Price.updateOne(
                { _id: "60caeecff05bddd15313d774" },
                { $inc: { "game.9": +bidAmount } }
              );
            }
          }

          if (user["upLine"] != null) {
            var commission1 = (bidAmount * 0.9) / 100;
            var commission2 = (bidAmount * 0.9) / 100;
            var commission3 = (bidAmount * 0.9) / 100;
            if(user.upLine[0] !== "null"){

            await User.updateOne(
              { id: user["upLine"][0] },
              {
                $inc: { level0contribution: +commission1, bonus: +commission1 },
              }
            );}

            if (user["upLine"].length === 2) {
              if(user.upLine[1] !== "null"){

              await User.updateOne(
                { id: user["upLine"][1] },
                {
                  $inc: {
                    level1contribution: +commission2,
                    bonus: +commission2,
                  },
                }
              );
              }
            }
            if (user["upLine"].length === 3) {
              if(user.upLine[1] !== "null"){

              await User.updateOne(
                { id: user["upLine"][1] },
                {
                  $inc: {
                    level1contribution: +commission2,
                    bonus: +commission2,
                  },
                }
              );
              }
              if(user.upLine[2] !== "null"){

              await User.updateOne(
                { id: user["upLine"][2] },
                {
                  $inc: {
                    level2contribution: +commission3,
                    bonus: +commission3,
                  },
                }
              );
              }
            }
          }
          await PlayHistory.updateOne(
            { userId: user.id },
            {
              userId: user.id,
              $push: {
                history: {
                  amount: bidAmount,
                  game: "bigsmall",
                  credit: false,
                  date: Date.now(),
                  id: newRecord,
                  note: "play",
                },
              },
            },
            { upsert: true }
          );
          if (!user.demo)
            await reports.updateOne(
              { id: "bigsmall" },
              { $inc: { "states.placed": bidAmount, "states.bids": +1 } },
              {upsert: true}
            );
            const userDate = new Date(user.date);
            const userDateLocal = (userDate / 1000 + 19800) * 1000;
            const newuserDate = new Date(userDateLocal);
            const day = newDate.getDate();
            const month = newDate.getMonth() + 1;
            const year = newDate.getFullYear();
            const dayMonth = `${day}/${month}/${year}`;
           
            const userday = newuserDate.getDate();
            const usermonth = newuserDate.getMonth() + 1;
            const useryear = newuserDate.getFullYear();
            const userdayMonth = `${userday}/${usermonth}/${useryear}`;
        
            if(dayMonth === userdayMonth){
              const phone0Bid = `newlevel0.${dayMonth}.${user.phone}.bidToday`;
              const phone1Bid = `newlevel1.${dayMonth}.${user.phone}.bidToday`;
              const phone2Bid = `newlevel2.${dayMonth}.${user.phone}.bidToday`;
        
                if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  if(user.upLine[0] !== "null"){

                  await promotion.updateOne(
                    { userId: user.upLine[0] },
                    {
                      userId: user.upLine[0],
                      $inc: {
                        [phone0Bid]: bidAmount
                      },
                    },
                    { upsert: true }
                  );
                  }
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    if(user.upLine[1] !== "null"){

                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1Bid]: bidAmount
                        },
                      },
                      { upsert: true }
                    );
                    }
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    if(user.upLine[1] !== "null"){

                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1Bid]: bidAmount
                        },
                      },
                      { upsert: true }
                    );
                    }
                  }
        
                  if (user.upLine[2].length !== 0) {
                    if(user.upLine[2] !== "null"){

                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [phone2Bid]: bidAmount
                        },
                      },
                      { upsert: true }
                    );
                    }
                  }
                }
              }
            }
          res.send("Done");
        }
      }
    }
  } catch (error) {
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};

export const bigsmall_getPricing = async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    const pricing = await Price.find();
    res.send(pricing);
  } else {
    res.send("permission denied");
  }
};

export const bigsmall_setAutoMode = async (req, res) => {
  const auto = req.params.auto;
  await extra.updateOne(
    { id: 1 },
    { "bigsmall.auto": auto === "true" ? true : false }
  );
};

export const bigsmall_setResult = async (req, res) => {
  const number = req.params.id;
  const api = req.params.api;
  const manual = "manualNumber";
  if (!api || api === process.env.AdminAPI) {
    const currentPeriod = await Manual.find().sort({ date: -1 });

    await Manual.updateOne(
      { _id: currentPeriod[0]._id },
      { [manual]: parseInt(number) }
    );

    res.send("done");
  } else {
    res.send("permission denied");
  }
};

export const bigsmall_getTimer = async (req, res) => {
  const lastDate = await Record.find().sort({ date: -1 }).limit(1);

  res.send(lastDate);
};
export const bigsmall_getRecordData = (req, res) => {
  Record.find()
    .sort({ date: -1 })
    .limit(10)
    .then((result) => {
      res.send(result.length > 0 ? result : "No Data");
    })
    .catch((err) => {
      console.log(err);
    });
};
export const bigsmall_getFullRecordData = (req, res) => {
  Record.find()
    .sort({ date: -1 })
    .then((result) => {
      res.send(result.length > 0 ? result : "No Data");
    })
    .catch((err) => {
      console.log(err);
    });
};
export const bigsmall_getHistoryData = async (req, res) => {
  var userId = req.params.id;
  const lastDate = await Record.find().sort({ date: -1 }).limit(1);
  BidHistory.find({
    _id: { $in: [parseInt(lastDate[0].id) + 1, parseInt(lastDate[0].id)] },
  })
    .then((result) => {
      var newBid = [];
      if (result.length > 0) {
        const rowData = result[0].bid;

        rowData.forEach((bid) => {
          if (bid.userId === parseInt(userId)) {
            newBid.push(bid);
          }
        });
        if (result.length > 1)
          result[1].bid.forEach((bid) => {
            if (bid.userId === parseInt(userId)) {
              newBid.push(bid);
            }
          });
      }
      res.status(200).send(newBid.length > 0 ? newBid.reverse() : []);
    })
    .catch((err) => {
      console.log(err);
    });
};
export const bigsmall_getFullHistoryData = async (req, res) => {
  var userId = req.params.id;
  BidHistory.find({ "bid.userId": parseInt(userId) })
    .sort({ "bid.period": -1 })
    .then((result) => {
      if (result.length > 0) {
        var newBid = [];

        for (var i = 0; i < result.length; i++) {
          result[i].bid.forEach((bid) => {
            if (bid.userId === parseInt(userId)) {
              newBid.push(bid);
            }
          });
        }
      }
      res.status(200).send(result.length > 0 ? newBid : "No Data");
    })
    .catch((err) => {
      console.log(err);
    });
};
export const bigsmall_getCurrentNumber = async (req, res) => {
  const api = req.params.api;

  if (!api || api === process.env.AdminAPI) {
    const currentPeriod = await Manual.find().sort({ date: -1 });
    const getExtra = await extra.findOne({ id: 1 });
    const getData = await Manual.findOne({ _id: currentPeriod[0]._id });
    res.send({ data: getData, auto: getExtra.fastParity });
  } else {
    res.send("permission denied");
  }
};
