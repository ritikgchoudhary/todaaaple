import Bid from "../model/bidData.js";
import Manual from "../model/result.js";
import Price from "../model/period.js";
import BidHistory from "../model/bidHistory.js";
import ErrorResponse from "../utils/error.js";
import User from "../model/userSchema.js";
import Record from "../model/record.js";
import With from "../model/withdrawal.js";
import jwt from "jsonwebtoken";
import Trans from "../model/transaction.js";
import Daily from "../model/daily.js";
import PlayHistory from "../model/playHistory.js";
import extra from "../model/extra.js";
import promotion from "../model/promotion.js";
import daily from "../model/daily.js";
import salary from "../model/salary.js";
import offerBonus from "../model/offerBonus.js";
import Bid1 from "../model/1minute/bidData.js";
import Record1 from "../model/1minute/record.js";
import BidHistory1 from "../model/1minute/bidHistory.js";
import Manual1 from "../model/1minute/result.js";
import Price1 from "../model/1minute/period.js";

import Bid3 from "../model/3minute/bidData.js";
import Record3 from "../model/3minute/record.js";
import BidHistory3 from "../model/3minute/bidHistory.js";
import Manual3 from "../model/3minute/result.js";
import Price3 from "../model/3minute/period.js";
import { creditCommission } from "./commission.js";

import Bid5 from "../model/5minute/bidData.js";
import Record5 from "../model/5minute/record.js";
import BidHistory5 from "../model/5minute/bidHistory.js";
import Manual5 from "../model/5minute/result.js";
import Price5 from "../model/5minute/period.js";
import reports from "../model/reports.js";

const handleBidData = async (
  req,
  res,
  next,
  BidModel,
  RecordModel,
  BidHistoryModel,
  PriceModel,
  gameName
) => {
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
          const dateFormated = `${newDate.getDate()}/${newDate.getMonth() + 1
            }/${newDate.getFullYear()}`;

          const levels = Array.from(
            { length: 7 },
            (_, i) => `activeMembers.${dateFormated}.${i}`
          );

          for (let i = 0; i < 7; i++) {
            if (user.upLine.length > i && user.upLine[i] !== "null") {
              await promotion.updateOne(
                { userId: user.upLine[i] },
                { $addToSet: { [levels[i]]: user.id } }
              );
            }
          }

          const SalarybidToday = `date.${dateFormated}.active.${user.phone}`;

          // Update salary records for all upline levels (0-6)
          for (let i = 0; i < 7; i++) {
            if (user.upLine.length > i && user.upLine[i] !== "null" && user.upLine[i] !== undefined && user.upLine[i] !== null) {
              await salary.updateOne(
                { userId: user.upLine[i] },
                {
                  userId: user.upLine[i],
                  $inc: {
                    [SalarybidToday]: bidAmount,
                  },
                },
                { upsert: true }
              );
            }
          }

          var userBid = [];
          var recordId = await RecordModel.find().sort({ date: -1 }).limit(1);
          var newRecord = recordId[0].id + 1;

          await BidHistoryModel.find({
            _id: newRecord,
          }).then((result) => {
            if (result.length > 0) {
              const rowData = result[0].bid;

              rowData.forEach((bid) => {
                if (bid.userId === userId) {
                  userBid.push(bid);
                }
              });
            }
          });

          var deductAmount = 0;
          var repeatedBid = false;
          userBid.forEach((element) => {
            if (element.select.includes("Green") && bidOn.includes("Red")) {
              repeatedBid = true;
              deductAmount = element.amount;
            }
            if (element.select.includes("Red") && bidOn.includes("Green")) {
              repeatedBid = true;
              deductAmount = element.amount;
            }
            if (element.select.includes("Big") && bidOn.includes("Small")) {
              repeatedBid = true;
              deductAmount = element.amount;
            }
            if (element.select.includes("Small") && bidOn.includes("Big")) {
              repeatedBid = true;
              deductAmount = element.amount;
            }
          });

          const bidToday = "bidToday." + dateFormated;
          if (repeatedBid) {
            await User.updateOne(
              { id: user.id },
              {
                $inc: { balance: -bidAmount, [bidToday]: +bidAmount },
                $push: { bidHistory: { amount: bidAmount, date: Date.now() } },
              }
            );
          } else {
            var withWalletAmount = user.withWallet ?? 0;
            var newWithWallet = withWalletAmount + bidAmount;
            if (user.balance - bidAmount < newWithWallet) {
              newWithWallet = user.balance - bidAmount;
            }
            await User.updateOne(
              { id: user.id },
              {
                withWallet: newWithWallet,
                $inc: { balance: -bidAmount, [bidToday]: +bidAmount },
                $push: { bidHistory: { amount: bidAmount, date: Date.now() } },
              }
            );
          }

          const lastFastParityPeriod = await BidModel.findOne().sort({
            date: -1,
          });
          const putBidData = await BidModel.updateOne(
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
          await BidHistoryModel.updateOne(
            { _id: newRecord },
            { $push: { bid: bidHistoryData } },
            { upsert: true }
          );

          if (!user.demo) {
            const priceUpdates = [
              { condition: "Join Green", id: "60caeecff05bddd15313d771" },
              { condition: "Join Red", id: "60caeecff05bddd15313d772" },
              { condition: "Join Violet", id: "60caeecff05bddd15313d773" },
              { condition: "Big", id: "67cf1b13f29375d7b8cae9c0" },
              { condition: "Small", id: "67cf1b13f29375d7b8cae9bf" },
              ...Array.from({ length: 10 }, (_, i) => ({
                condition: `Select ${i}`,
                id: "60caeecff05bddd15313d774",
                field: `game.${i}`,
              })),
            ];

            for (const { condition, id, field = "price" } of priceUpdates) {
              if (bidOn === condition) {
                await PriceModel.updateOne(
                  { _id: id },
                  { $inc: { [field]: +bidAmount } }
                );
              }
            }
          }

          if (user["upLine"] != null) {
            const commissionRates = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
            for (let i = 0; i < 7; i++) {
              if (user.upLine.length > i && user.upLine[i] !== "null") {
                const commission = (bidAmount * commissionRates[i]) / 100;
                await User.updateOne(
                  { id: user["upLine"][i] },
                  {
                    $inc: {
                      [`level${i}contribution`]: +commission,
                      bonus: +commission,
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
                  game: gameName,
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
              { id: gameName },
              { $inc: { "states.placed": bidAmount, "states.bids": +1 } },
              { upsert: true }
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

          if (dayMonth === userdayMonth) {
            const phoneBids = Array.from(
              { length: 7 },
              (_, i) => `newlevel${i}.${dayMonth}.${user.phone}.bidToday`
            );

            for (let i = 0; i < 7; i++) {
              if (user.upLine.length > i && user.upLine[i] !== "null") {
                await promotion.updateOne(
                  { userId: user.upLine[i] },
                  {
                    userId: user.upLine[i],
                    $inc: {
                      [phoneBids[i]]: bidAmount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
          res.send("Done");
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};

export const minute1_bidData = (req, res, next) =>
  handleBidData(req, res, next, Bid1, Record1, BidHistory1, Price1, "1minute");
export const minute3_bidData = (req, res, next) =>
  handleBidData(req, res, next, Bid3, Record3, BidHistory3, Price3, "3minute");
export const minute5_bidData = (req, res, next) =>
  handleBidData(req, res, next, Bid5, Record5, BidHistory5, Price5, "5minute");

const handleGetPricing = async (req, res, PriceModel) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    const pricing = await PriceModel.find();
    res.send(pricing);
  } else {
    res.send("permission denied");
  }
};

export const minute1_getPricing = (req, res) =>
  handleGetPricing(req, res, Price1);
export const minute3_getPricing = (req, res) =>
  handleGetPricing(req, res, Price3);
export const minute5_getPricing = (req, res) =>
  handleGetPricing(req, res, Price5);

const handleSetResult = async (req, res, ManualModel) => {
  const number = req.params.id;
  const api = req.params.api;
  const manual = "manualNumber";
  if (!api || api === process.env.AdminAPI) {
    const currentPeriod = await ManualModel.find().sort({ date: -1 });

    await ManualModel.updateOne(
      { _id: currentPeriod[0]._id },
      { [manual]: parseInt(number) }
    );

    res.send("done");
  } else {
    res.send("permission denied");
  }
};

export const minute1_setResult = (req, res) =>
  handleSetResult(req, res, Manual1);
export const minute3_setResult = (req, res) =>
  handleSetResult(req, res, Manual3);
export const minute5_setResult = (req, res) =>
  handleSetResult(req, res, Manual5);

const handleGetTimer = async (req, res, RecordModel) => {
  const lastDate = await RecordModel.find().sort({ date: -1 }).limit(1);
  res.send(lastDate);
};

export const minute1_getTimer = (req, res) => handleGetTimer(req, res, Record1);
export const minute3_getTimer = (req, res) => handleGetTimer(req, res, Record3);
export const minute5_getTimer = (req, res) => handleGetTimer(req, res, Record5);

const handleGetRecordData = async (req, res, RecordModel) => {
  try {
    const records = await RecordModel.find().sort({ date: -1 }).limit(10);
    res.send(records.length > 0 ? records : "No Data");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const handleGetFullRecordData = async (req, res, RecordModel) => {
  try {
    const records = await RecordModel.find().sort({ date: -1 });
    res.send(records.length > 0 ? records : "No Data");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const handleGetHistoryData = async (req, res, RecordModel, BidHistoryModel) => {
  try {
    const userId = req.params.id;
    const lastDate = await RecordModel.find().sort({ date: -1 }).limit(1);
    const history = await BidHistoryModel.find({
      _id: { $in: [parseInt(lastDate[0].id) + 1, parseInt(lastDate[0].id)] },
    });

    const newBid = [];
    if (history.length > 0) {
      const rowData = history[0].bid;
      rowData.forEach((bid) => {
        if (bid.userId === parseInt(userId)) {
          newBid.push(bid);
        }
      });
      if (history.length > 1) {
        history[1].bid.forEach((bid) => {
          if (bid.userId === parseInt(userId)) {
            newBid.push(bid);
          }
        });
      }
    }
    res.status(200).send(newBid.length > 0 ? newBid.reverse() : []);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const handleGetFullHistoryData = async (req, res, BidHistoryModel) => {
  try {
    const userId = req.params.id;
    const history = await BidHistoryModel.find({
      "bid.userId": parseInt(userId),
    }).sort({ "bid.period": -1 });

    const newBid = [];
    if (history.length > 0) {
      for (const record of history) {
        record.bid.forEach((bid) => {
          if (bid.userId === parseInt(userId)) {
            newBid.push(bid);
          }
        });
      }
    }

    // Sort the bid history by date in descending order (newest first)
    newBid.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).send(newBid.length > 0 ? newBid : "No Data");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const handleGetCurrentNumber = async (req, res, ManualModel, extraField) => {
  try {
    const api = req.params.api;
    if (!api || api === process.env.AdminAPI) {
      const currentPeriod = await ManualModel.find().sort({ date: -1 });
      const getExtra = await extra.findOne({ id: 1 });
      const getData = await ManualModel.findOne({ _id: currentPeriod[0]._id });
      res.send({ data: getData, auto: getExtra[extraField] });
    } else {
      res.send("permission denied");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

export const minute1_getRecordData = (req, res) =>
  handleGetRecordData(req, res, Record1);
export const minute3_getRecordData = (req, res) =>
  handleGetRecordData(req, res, Record3);
export const minute5_getRecordData = (req, res) =>
  handleGetRecordData(req, res, Record5);

export const minute1_getFullRecordData = (req, res) =>
  handleGetFullRecordData(req, res, Record1);
export const minute3_getFullRecordData = (req, res) =>
  handleGetFullRecordData(req, res, Record3);
export const minute5_getFullRecordData = (req, res) =>
  handleGetFullRecordData(req, res, Record5);

export const minute1_getHistoryData = (req, res) =>
  handleGetHistoryData(req, res, Record1, BidHistory1);
export const minute3_getHistoryData = (req, res) =>
  handleGetHistoryData(req, res, Record3, BidHistory3);
export const minute5_getHistoryData = (req, res) =>
  handleGetHistoryData(req, res, Record5, BidHistory5);

export const minute1_getFullHistoryData = (req, res) =>
  handleGetFullHistoryData(req, res, BidHistory1);
export const minute3_getFullHistoryData = (req, res) =>
  handleGetFullHistoryData(req, res, BidHistory3);
export const minute5_getFullHistoryData = (req, res) =>
  handleGetFullHistoryData(req, res, BidHistory5);

export const minute1_getCurrentNumber = (req, res) =>
  handleGetCurrentNumber(req, res, Manual1, "fastParity");
export const minute3_getCurrentNumber = (req, res) =>
  handleGetCurrentNumber(req, res, Manual3, "fastParity");
export const minute5_getCurrentNumber = (req, res) =>
  handleGetCurrentNumber(req, res, Manual5, "fastParity");

export const bidData = async (req, res, next) => {
  try {
    const token = req.body.auth.split(" ")[1];

    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    const bidOn = req.body.bidOn;
    const game = req.body.game;
    const bidAmount = req.body.bidAmount;
    const userId = req.body.userId;
    const fieldName = "players" + `${game}`;
    var user = await User.findOne({ id: userId });

    if (user.block) return next(new ErrorResponse("Account Suspended", 400));
    if (user.temp) return next(new ErrorResponse("Something went wrong", 400));
    var userUp = await User.findOne({ id: user.upLine[0] }, { levelDown: 1 });
    if (userUp.levelDown)
      return next(new ErrorResponse("Something went wrong", 400));

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
          const dateFormated = `${newDate.getDate() +
            "/" +
            (newDate.getMonth() + 1) +
            "/" +
            newDate.getFullYear()
            }`;

          var userBid = [];
          var recordId = await Record.find().sort({ date: -1 }).limit(1);
          var newRecord = recordId[0].id + 1;

          await BidHistory.find({
            _id: newRecord,
          }).then((result) => {
            if (result.length > 0) {
              const rowData = result[0].bid;

              rowData.forEach((bid) => {
                if (bid.userId === userId) {
                  userBid.push(bid);
                }
              });
            }
          });
          var deductAmount = 0;
          var repeatedBid = false;
          userBid.forEach((element) => {
            if (element.game === game) {
              if (element.select.includes("Green") && bidOn.includes("Red")) {
                repeatedBid = true;
                deductAmount = element.amount;
              }
              if (element.select.includes("Red") && bidOn.includes("Green")) {
                repeatedBid = true;
                deductAmount = element.amount;
              }
            }
          });
          const bidToday = "bidToday." + dateFormated;
          if (repeatedBid) {
            await User.updateOne(
              { id: user.id },

              { $inc: { balance: -bidAmount, [bidToday]: +bidAmount } }
            );
          } else {
            var withWalletAmount = user.withWallet ?? 0;
            var newWithWallet = withWalletAmount + bidAmount;
            if (user.balance - bidAmount < newWithWallet) {
              newWithWallet = user.balance - bidAmount;
            }
            await User.updateOne(
              { id: user.id },

              {
                withWallet: newWithWallet,
                $inc: { balance: -bidAmount, [bidToday]: +bidAmount },
              }
            );
          }

          Bid.find()
            .sort({ date: -1 })
            .then(async (result) => {
              Bid.updateOne(
                { _id: result[0]._id },
                {
                  $push: {
                    [fieldName]: {
                      bidOn: bidOn,
                      bidAmount: bidAmount,
                      userId: user.id,
                    },
                  },
                }
              )
                .then((result) => { })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((err) => console.log(err));

          const bidHistoryData = [
            {
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
            },
          ];
          await BidHistory.updateOne(
            { _id: newRecord },
            { $push: { bid: bidHistoryData } },
            { upsert: true }
          );
          if (user.demo) {
          } else {
            if (game === 0) {
              if (bidOn === "Join Green") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d771" },
                  { $inc: { "0price": +bidAmount } }
                );
              }
              if (bidOn === "Join Red") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d772" },
                  { $inc: { "0price": +bidAmount } }
                );
              }
              if (bidOn === "Join Violet") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d773" },
                  { $inc: { "0price": +bidAmount } }
                );
              }
              if (bidOn === "Select 0") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.0": +bidAmount } }
                );
              }
              if (bidOn === "Select 1") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.1": +bidAmount } }
                );
              }
              if (bidOn === "Select 2") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.2": +bidAmount } }
                );
              }
              if (bidOn === "Select 3") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.3": +bidAmount } }
                );
              }
              if (bidOn === "Select 4") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.4": +bidAmount } }
                );
              }
              if (bidOn === "Select 5") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.5": +bidAmount } }
                );
              }
              if (bidOn === "Select 6") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.6": +bidAmount } }
                );
              }
              if (bidOn === "Select 7") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.7": +bidAmount } }
                );
              }
              if (bidOn === "Select 8") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.8": +bidAmount } }
                );
              }
              if (bidOn === "Select 9") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game0.9": +bidAmount } }
                );
              }
            }
            if (game === 1) {
              if (bidOn === "Join Green") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d771" },
                  { $inc: { "1price": +bidAmount } }
                );
              }
              if (bidOn === "Join Red") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d772" },
                  { $inc: { "1price": +bidAmount } }
                );
              }
              if (bidOn === "Join Violet") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d773" },
                  { $inc: { "1price": +bidAmount } }
                );
              }
              if (bidOn === "Select 0") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.0": +bidAmount } }
                );
              }
              if (bidOn === "Select 1") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.1": +bidAmount } }
                );
              }
              if (bidOn === "Select 2") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.2": +bidAmount } }
                );
              }
              if (bidOn === "Select 3") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.3": +bidAmount } }
                );
              }
              if (bidOn === "Select 4") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.4": +bidAmount } }
                );
              }
              if (bidOn === "Select 5") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.5": +bidAmount } }
                );
              }
              if (bidOn === "Select 6") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.6": +bidAmount } }
                );
              }
              if (bidOn === "Select 7") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.7": +bidAmount } }
                );
              }
              if (bidOn === "Select 8") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.8": +bidAmount } }
                );
              }
              if (bidOn === "Select 9") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game1.9": +bidAmount } }
                );
              }
            }
            if (game === 2) {
              if (bidOn === "Join Green") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d771" },
                  { $inc: { "2price": +bidAmount } }
                );
              }
              if (bidOn === "Join Red") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d772" },
                  { $inc: { "2price": +bidAmount } }
                );
              }
              if (bidOn === "Join Violet") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d773" },
                  { $inc: { "2price": +bidAmount } }
                );
              }
              if (bidOn === "Select 0") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.0": +bidAmount } }
                );
              }
              if (bidOn === "Select 1") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.1": +bidAmount } }
                );
              }
              if (bidOn === "Select 2") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.2": +bidAmount } }
                );
              }
              if (bidOn === "Select 3") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.3": +bidAmount } }
                );
              }
              if (bidOn === "Select 4") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.4": +bidAmount } }
                );
              }
              if (bidOn === "Select 5") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.5": +bidAmount } }
                );
              }
              if (bidOn === "Select 6") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.6": +bidAmount } }
                );
              }
              if (bidOn === "Select 7") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.7": +bidAmount } }
                );
              }
              if (bidOn === "Select 8") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.8": +bidAmount } }
                );
              }
              if (bidOn === "Select 9") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game2.9": +bidAmount } }
                );
              }
            }
            if (game === 3) {
              if (bidOn === "Join Green") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d771" },
                  { $inc: { "3price": +bidAmount } }
                );
              }
              if (bidOn === "Join Red") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d772" },
                  { $inc: { "3price": +bidAmount } }
                );
              }
              if (bidOn === "Join Violet") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d773" },
                  { $inc: { "3price": +bidAmount } }
                );
              }
              if (bidOn === "Select 0") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.0": +bidAmount } }
                );
              }
              if (bidOn === "Select 1") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.1": +bidAmount } }
                );
              }
              if (bidOn === "Select 2") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.2": +bidAmount } }
                );
              }
              if (bidOn === "Select 3") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.3": +bidAmount } }
                );
              }
              if (bidOn === "Select 4") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.4": +bidAmount } }
                );
              }
              if (bidOn === "Select 5") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.5": +bidAmount } }
                );
              }
              if (bidOn === "Select 6") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.6": +bidAmount } }
                );
              }
              if (bidOn === "Select 7") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.7": +bidAmount } }
                );
              }
              if (bidOn === "Select 8") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.8": +bidAmount } }
                );
              }
              if (bidOn === "Select 9") {
                await Price.updateOne(
                  { _id: "60caeecff05bddd15313d774" },
                  { $inc: { "game3.9": +bidAmount } }
                );
              }
            }
          }

          if (user["upLine"] != null) {
            var commission1 = (bidAmount * 0.9) / 100;
            var commission2 = (bidAmount * 0.9) / 100;
            var commission3 = (bidAmount * 0.9) / 100;
            if (user.upLine[0] !== "null") {
              await User.updateOne(
                { id: user["upLine"][0] },
                {
                  $inc: {
                    level0contribution: +commission1,
                    bonus: +commission1,
                  },
                }
              );
            }
            if (user["upLine"].length === 2) {
              if (user.upLine[1] !== "null") {
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
              if (user.upLine[2] !== "null") {
                await User.updateOne(
                  { id: user["upLine"][1] },
                  {
                    $inc: {
                      level1contribution: +commission2,
                      bonus: +commission2,
                    },
                  }
                );

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
                  game: "Wingo",
                  credit: false,
                  date: Date.now(),
                  id: newRecord,
                  note: "play",
                },
              },
            },
            { upsert: true }
          );

          const SalarybidToday = `date.${dateFormated}.active.${user.phone}`;

          const level0 = "activeMembers." + `${dateFormated}` + ".0";
          const level1 = "activeMembers." + `${dateFormated}` + ".1";
          const level2 = "activeMembers." + `${dateFormated}` + ".2";

          if (user.upLine[0] !== "null") {
            await promotion.updateOne(
              { userId: user.upLine[0] },
              { $addToSet: { [level0]: user.id } }
            );
          }
          if (user.upLine.length > 1) {
            if (user.upLine[1] !== "null") {
              await promotion.updateOne(
                { userId: user.upLine[1] },
                { $addToSet: { [level1]: user.id } }
              );
            }
          }
          if (user.upLine.length > 2) {
            if (user.upLine[2] !== "null") {
              await promotion.updateOne(
                { userId: user.upLine[2] },
                { $addToSet: { [level2]: user.id } }
              );
            }
          }

          // Update salary records for all upline levels (0-6)
          for (let i = 0; i < 7; i++) {
            if (user.upLine.length > i && user.upLine[i] !== "null") {
              await salary.updateOne(
                { userId: user.upLine[i] },
                {
                  userId: user.upLine[i],
                  $inc: {
                    [SalarybidToday]: bidAmount,
                  },
                },
                { upsert: true }
              );
            }
          }

          const userDate = new Date(user.date);
          const userDateLocal = (userDate / 1000 + 19800) * 1000;
          const newuserDate = new Date(userDateLocal);
          const day = newDate.getDate();
          const month = newDate.getMonth() + 1;
          const year = newDate.getFullYear();
          const dayMonth = `${day}/${month}/${year}`;

          const userday = newuserDate.getDate();
          const usermonth = newuserDate.getMonth() + 1;
          const userYear = newuserDate.getFullYear();
          const userdayMonth = `${userday}/${usermonth}/${userYear}`;

          if (dayMonth === userdayMonth) {
            const phone0Bid = `newlevel0.${dayMonth}.${user.phone}.bidToday`;
            const phone1Bid = `newlevel1.${dayMonth}.${user.phone}.bidToday`;
            const phone2Bid = `newlevel2.${dayMonth}.${user.phone}.bidToday`;

            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                if (user.upLine[0] !== "null") {
                  await promotion.updateOne(
                    { userId: user.upLine[0] },
                    {
                      userId: user.upLine[0],
                      $inc: {
                        [phone0Bid]: bidAmount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  if (user.upLine[1] !== "null") {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1Bid]: bidAmount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }
              if (user.upLine[1] && user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  if (user.upLine[1] !== "null") {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1Bid]: bidAmount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }

                if (user.upLine[2] && user.upLine[2].length !== 0) {
                  if (user.upLine[2] !== "null") {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [phone2Bid]: bidAmount,
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
    console.log(error);
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};

export const getPricing = async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    const price1 = await Price1.find();
    const price3 = await Price3.find();
    const price5 = await Price5.find();
    res.send({ price1, price3, price5 });
  } else {
    res.send("permission denied");
  }
};

export const setAutoMode = async (req, res) => {
  const auto = req.params.auto;
  await extra.updateOne(
    { id: 1 },
    { "wingo.auto": auto === "true" ? true : false }
  );
};
export const setResult = async (req, res) => {
  const game = req.params.game;
  var number = req.params.id;
  var integerNumber = parseInt(number);
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    if (!isNaN(integerNumber) && number === "" + integerNumber) {
      if (game === "1") {
        const currentPeriod = await Manual1.find().sort({ date: -1 });
        await Manual1.updateOne(
          { _id: currentPeriod[0]._id },
          { manualNumber: parseInt(number) }
        );
      }
      if (game === "3") {
        const currentPeriod = await Manual3.find().sort({ date: -1 });
        await Manual3.updateOne(
          { _id: currentPeriod[0]._id },
          { manualNumber: parseInt(number) }
        );
      }
      if (game === "5") {
        const currentPeriod = await Manual5.find().sort({ date: -1 });
        await Manual5.updateOne(
          { _id: currentPeriod[0]._id },
          { manualNumber: parseInt(number) }
        );
      }
    } else {
    }

    res.send("done");
  } else {
    res.send("permission denied");
  }
};

export const applyBonus = async (req, res, next) => {
  try {
    const token = req.body.auth.split(" ")[1];
    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    var userId = req.body.userId;
    const amount = req.body.amount;
    var user = await User.findOne({ id: userId });
    if (user.block) return next(new ErrorResponse("Account Suspended", 400));
    if (!user) {
      console.log("no user");
    } else {
      if (user.bonus < amount) {
        console.log("Insufficient Bonus !");
        next(new ErrorResponse("Insufficient Bonus", 500));
      } else {
        if (amount < 10) {
          next(new ErrorResponse("Minimum ₹10", 500));
        } else {
          await User.updateOne(
            { id: userId },
            {
              $inc: { balance: +amount, bonus: -amount, withWallet: amount },
              $push: {
                bonusRecord: {
                  date: Date.now(),
                  amount: amount,
                  userId: user.id,
                },
              },
            }
          );
          next(new ErrorResponse("Success", 200));
        }

        // await Bid.create({ bidOn, bidAmount, userId });

        // await BidHistory.create({period: 2021051762, select: bidOn, status: 'Pending', openPrice: 'Pending', result: 'Pending', winning: 'Pending', amount: bidAmount, userId: 1000002});
      }
    }
  } catch (error) {
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};
export const processWithdrawal = async (req, res) => {
  const id = req.params.id;
  const _id = req.params._id;
  const status = req.params.status;
  const amount = req.params.amount;
  const userId = req.params.userId;
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    if (status !== "Success") {
      await User.updateOne(
        { id: parseInt(userId) },
        { $inc: { balance: parseInt(amount), withWallet: parseInt(amount) } }
      );
      await With.updateOne({ _id: _id }, { status: status });
    } else {
      await User.updateOne(
        { id: parseInt(userId) },
        {
          $push: {
            walletHistory: {
              credit: false,
              amount: amount,
              note: `Redeem Successful ID: ${id}`,
              date: Date.now(),
            },
          },
        }
      );
      await With.updateOne({ _id: _id }, { status: status });

      // Commission Credit Logic
      const withdrawalDoc = await With.findById(_id);
      if (withdrawalDoc && withdrawalDoc.withdrawalFee > 0) {
        await creditCommission('WITHDRAWAL_FEE', parseInt(userId), withdrawalDoc.withdrawalFee, id);
      }

      const user = await User.findOne({ id: userId });
      const date = new Date();
      const localDate = (date / 1000 + 19800) * 1000;
      const newDatefor = new Date(localDate);
      const day = newDatefor.getDate();
      const month = newDatefor.getMonth() + 1;
      const year = newDatefor.getFullYear();

      const userDate = new Date(user.date);
      const userDateLocal = (userDate / 1000 + 19800) * 1000;
      const newuserDate = new Date(userDateLocal);

      const dayMonth = `${day}/${month}/${year}`;

      const userday = newuserDate.getDate();
      const usermonth = newuserDate.getMonth() + 1;
      const userdayMonth = `${userday}/${usermonth}/${year}`;
      var daySorted;
      var monthSorted;
      if (day < 10) {
        daySorted = `0${day}`;
      } else {
        daySorted = `${day}`;
      }
      if (month < 10) {
        monthSorted = `0${month}`;
      } else {
        monthSorted = `${month}`;
      }
      const newDate = `${daySorted}-${monthSorted}-${year}`;
      await Daily.updateOne(
        { id: newDate },
        { $inc: { redeem: amount, redeemCount: +1 } },
        { upsert: true }
      );

      if (dayMonth === userdayMonth) {
        if (user.upLine !== null) {
          // Handle all levels (0-6) for today's withdrawal
          for (let i = 0; i < 7; i++) {
            if (user.upLine[i]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[i] ?? 1 },
                {
                  userId: user.upLine[i] ?? 1,
                  $inc: {
                    [`newlevel${i}.${dayMonth}.${user.phone}.todayWithdrawal`]:
                      parseInt(amount),
                  },
                },
                { upsert: true }
              );
            }
          }
        }
      }

      if (user.upLine !== null) {
        // Handle all levels (0-6) for total withdrawal
        for (let i = 0; i < 7; i++) {
          if (user.upLine[i]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[i] ?? 1 },
              {
                userId: user.upLine[i] ?? 1,
                $inc: {
                  [`level${i}.${user.phone}.totalWithdrawal`]: parseInt(amount),
                },
              },
              { upsert: true }
            );
          }
        }
      }
    }

    res.send("Done");
  } else {
    res.send("permission denied");
  }
};
export const updateWithdrawalType = async (req, res) => {
  const api = req.params.api;
  const type = req.params.type;
  const _id = req.params._id;

  if (api === process.env.AdminAPI) {
    await With.updateOne({ _id }, { type });
    res.status(200).send("done");
  } else {
    res.status(200).send("done");
  }
};
export const getHighBalanceUsers = async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    const user = await User.find(
      { demo: { $exists: false } },
      { balance: 1, phone: 1, id: 1, _id: 0, username: 1, temp: 1 }
    )
      .sort({ balance: -1 })
      .limit(30);
    res.send(user);
  } else {
    res.send("permission denied");
  }
};
export const applyWithdrawal = async (req, res, next) => {
  try {
    const token = req.body.auth.split(" ")[1];
    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    var userId = req.body.userId;
    const amount = req.body.amount;
    var bank = [];
    var user = await User.findOne({ id: userId });

    // Basic validation checks
    if (user.block) return next(new ErrorResponse("Account Suspended", 400));
    if (!user.firstRecharge)
      return next(new ErrorResponse("Minimum 1 Recharge is compulsory", 400));
    if (user.balance < amount)
      return next(new ErrorResponse("Insufficient Fund", 400));
    if (!user.bank) return next(new ErrorResponse("Add Bank", 500));
    if (!user.bank[0]) return next(new ErrorResponse("Add Bank", 500));

    // Calculate total recharge from recharge history
    const totalBid = user.bidToday
      ? Object.values(user.bidToday).reduce((sum, amount) => sum + amount, 0)
      : 0;
    const totalRecharge = user.rechargeHistory
      ? user.rechargeHistory.reduce((sum, record) => {
        if (record.status === "Success") {
          return sum + record.amount;
        }
        return sum;
      }, 0)
      : 0;

    var canWithdraw = 0;
    const balance = user.balance;

    // Case 1: If balance is 0, withdrawal is 0
    if (balance <= 0) {
      canWithdraw = 0;
    }
    // Case 2: If total recharge is 0, withdrawal is 0
    else if (totalRecharge <= 0) {
      canWithdraw = 0;
    }
    // Case 3: If total bid is 0, withdrawal is 0
    else if (totalBid <= 0) {
      canWithdraw = 0;
    }
    // Case 4 & 5: Check if bids after recharge date are sufficient
    else {
      // Get the latest recharge date
      const latestRecharge = user.rechargeHistory
        .filter((record) => record.status === "Success")
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      // Calculate total bids made after the latest recharge
      const bidsAfterRecharge = user.bidHistory
        ? user.bidHistory
          .filter((history) => history.date >= latestRecharge.date)
          .reduce((sum, history) => {
            return sum + history.amount;
          }, 0)
        : 0;

      // If bids after recharge are less than total recharge, withdrawal is 0
      if (bidsAfterRecharge < latestRecharge.amount) {
        canWithdraw = 0;
      }
      // If bids after recharge are sufficient, withdrawal is min(balance, totalRecharge)
      else {
        canWithdraw = balance;
      }
    }
    console.log(canWithdraw, amount);
    // Check if user meets the bid requirement (bid amount should be equal to or greater than recharge amount)
    if (canWithdraw < amount) {
      return next(
        new ErrorResponse(`The amount you can withdraw is ${canWithdraw}`, 400)
      );
    }

    // Check if withdrawal amount is within allowed limit (50% of total recharge)
    // const maxWithdrawal = totalRecharge * 0.5;
    // if (amount > maxWithdrawal) {
    //   return next(new ErrorResponse(`Maximum withdrawal amount is ₹${maxWithdrawal}`, 400));
    // }

    bank.push(user.bank);
    function between(x, min, max) {
      return x >= min && x <= max;
    }

    const date = new Date();
    const epochNow = Date.now();
    var hour = date.getHours();
    var day = date.getDay();

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const epoch = startOfDay.getTime();

    if (between(day, 1, 5) && between(hour, 6, 11)) {
      if (!user) {
        console.log("no user");
      } else {
        if (user.balance < amount) {
          return next(new ErrorResponse("Insufficient Balance", 500));
        } else {
          const lastWithdrawals = await With.find({
            userId: user.id,
            epoch: { $gt: epoch },
          });

          if (lastWithdrawals.length >= 3) {
            return next(
              new ErrorResponse("You can withdrawal 3 times a day", 500)
            );
          } else {
            const lastWithId = await With.findOne().sort({ id: -1 });

            await User.updateOne(
              { id: userId },
              { $inc: { balance: -amount } }
            );

            await With.create({
              id: lastWithId?.id ?? 0 + 1,
              status: "Placed",
              userId: userId,
              date: Date.now(),
              amount: amount,
              method: bank,
              phone: user.phone,
              epoch: epochNow,
              balance: user.balance - amount,
            });
            return next(new ErrorResponse("Request Placed Successfully", 200));
          }
        }
      }
    } else {
      return next(new ErrorResponse("Check Withdrawal Time !", 500));
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};
export const applyWithdrawalUSDT = async (req, res, next) => {
  try {

    const token = req.body.auth.split(" ")[1];
    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    var userId = req.body.userId;
    const usdt = parseFloat(req.body.amount);
    const walletAddress = req.body.walletAddress;
    var bank = [];
    var user = await User.findOne({ id: userId });
    var amount = usdt * parseFloat(process.env.USD_RATE);
    // Basic validation checks
    if (user.block) return next(new ErrorResponse("Account Suspended", 400));
    if (!user.firstRecharge)
      return next(new ErrorResponse("Minimum 1 Recharge is compulsory", 400));
    if (user.balance < amount)
      return next(new ErrorResponse("Insufficient Fund", 400));
    if (!walletAddress) return next(new ErrorResponse("Wallet Address is required", 400));
    const getRecharge = await Trans.findOne({ userId: userId, gateway: "Upay", status: "success" });
    if (!getRecharge) return next(new ErrorResponse("Atleast 1 USDT Recharge is required", 400));

    // Calculate total recharge from recharge history
    const totalBid = user.bidToday
      ? Object.values(user.bidToday).reduce((sum, amount) => sum + amount, 0)
      : 0;
    const totalRecharge = user.rechargeHistory
      ? user.rechargeHistory.reduce((sum, record) => {
        if (record.status === "Success") {
          return sum + record.amount;
        }
        return sum;
      }, 0)
      : 0;

    var canWithdraw = 0;
    const balance = user.balance;

    // Case 1: If balance is 0, withdrawal is 0
    if (balance <= 0) {
      canWithdraw = 0;
    }
    // Case 2: If total recharge is 0, withdrawal is 0
    else if (totalRecharge <= 0) {
      canWithdraw = 0;
    }
    // Case 3: If total bid is 0, withdrawal is 0
    else if (totalBid <= 0) {
      canWithdraw = 0;
    }
    // Case 4 & 5: Check if bids after recharge date are sufficient
    else {
      // Get the latest recharge date
      const latestRecharge = user.rechargeHistory
        .filter((record) => record.status === "Success")
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      // Calculate total bids made after the latest recharge
      const bidsAfterRecharge = user.bidHistory
        ? user.bidHistory
          .filter((history) => history.date >= latestRecharge.date)
          .reduce((sum, history) => {
            return sum + history.amount;
          }, 0)
        : 0;

      // If bids after recharge are less than total recharge, withdrawal is 0
      if (bidsAfterRecharge < latestRecharge.amount) {
        canWithdraw = 0;
      }
      // If bids after recharge are sufficient, withdrawal is min(balance, totalRecharge)
      else {
        canWithdraw = balance;
      }
    }
    console.log(canWithdraw, amount);
    // Check if user meets the bid requirement (bid amount should be equal to or greater than recharge amount)
    if (canWithdraw < amount) {
      return next(
        new ErrorResponse(`The amount you can withdraw is ${canWithdraw / parseFloat(process.env.USD_RATE)} USDT`, 400)
      );
    }

    // Check if withdrawal amount is within allowed limit (50% of total recharge)
    // const maxWithdrawal = totalRecharge * 0.5;
    // if (amount > maxWithdrawal) {
    //   return next(new ErrorResponse(`Maximum withdrawal amount is ₹${maxWithdrawal}`, 400));
    // }


    function between(x, min, max) {
      return x >= min && x <= max;
    }

    const date = new Date();
    const epochNow = Date.now();
    var hour = date.getHours();
    var day = date.getDay();

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const epoch = startOfDay.getTime();

    if (between(day, 1, 5) && between(hour, 6, 11)) {
      if (!user) {
        console.log("no user");
      } else {
        if (user.balance < amount) {
          return next(new ErrorResponse("Insufficient Balance", 500));
        } else {
          const lastWithdrawals = await With.find({
            userId: user.id,
            epoch: { $gt: epoch },
          });

          if (lastWithdrawals.length >= 3) {
            return next(
              new ErrorResponse("You can withdrawal 3 times a day", 500)
            );
          } else {
            const lastWithId = await With.findOne().sort({ id: -1 });

            await User.updateOne(
              { id: userId },
              { $inc: { balance: -amount } }
            );

            await With.create({
              id: lastWithId.id + 1,
              status: "Placed",
              userId: userId,
              date: Date.now(),
              amount: amount,
              walletAddress: walletAddress,
              usdt: usdt,
              method: bank,
              phone: user.phone,
              epoch: epochNow,
              balance: user.balance - amount,
            });
            return next(new ErrorResponse("Request Placed Successfully", 200));
          }
        }
      }
    } else {
      return next(new ErrorResponse("Check Withdrawal Time !", 500));
    }
  } catch (error) {
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};
export const getWithdrawal = async (req, res, next) => {
  const userId = req.params.id;
  const withdrawal = await With.find({ userId: parseInt(userId) }).sort({
    date: -1,
  });
  res.send(withdrawal.length > 0 ? withdrawal : "No data");
};

export async function getPlayHistoryList(userId) {
  const uid = parseInt(userId, 10) || userId;
  let doc = await PlayHistory.findOne({ userId: uid }).lean();
  if (!doc && userId) {
    doc = await PlayHistory.findOne({ userId }).lean();
  }
  const list = (doc && Array.isArray(doc.history)) ? [...doc.history] : [];
  const user = await User.findOne({ id: uid }, { walletHistory: 1 }).lean();
  if (user && Array.isArray(user.walletHistory)) {
    const gameWalletEntries = user.walletHistory.filter(
      (e) =>
        e &&
        e.note &&
        (String(e.note).includes("Game Bet") ||
          String(e.note).includes("Game Win") ||
          String(e.note).includes("Game Launched"))
    );
    for (const e of gameWalletEntries) {
      list.push({
        game: "Casino",
        amount: e.amount != null ? e.amount : 0,
        credit: !!e.credit,
        date: e.date,
        note: e.note || "",
        id: e._id || e.date,
      });
    }
  }
  list.sort((a, b) => (b.date || 0) - (a.date || 0));
  return list;
}

export const getPlayHistory = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const list = await getPlayHistoryList(userId);
    res.json(list);
  } catch (err) {
    console.error("getPlayHistory error:", err);
    res.status(500).json({ message: "Failed to fetch game history" });
  }
};
export const getAllWithdrawal = async (req, res, next) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    const withdrawal = await With.find({ status: "Placed", usdt: { $exists: false } }).sort({ date: -1 });
    res.send(withdrawal.length > 0 ? withdrawal : "No data");
  } else {
    res.send("permission denied");
  }
};
export const getAllWithdrawalUSDT = async (req, res, next) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    const withdrawal = await With.find({ status: "Placed", usdt: { $exists: true } }).sort({ date: -1 });
    res.send(withdrawal.length > 0 ? withdrawal : "No data");
  } else {
    res.send("permission denied");
  }
};

export const getAllUserWithdrawal = async (req, res, next) => {
  const phone = req.params.phone;
  const api = req.params.api;

  if (!api || api === process.env.AdminAPI) {
    var length = 0;
    var amount = 0;
    var withdrawal = [];
    if (phone.length === 5) {
      withdrawal = await With.find({ userId: phone }).sort({ date: -1 });
    } else {
      const getUSer = await User.findOne({ phone }, { id: 1 });
      withdrawal = await With.find({ userId: getUSer.id }).sort({ date: -1 });
    }
    for (const element of withdrawal) {
      if (element.status === "Success") {
        amount += element.amount;
        length++;
      }
    }
    res.send({ withdrawal, success: { length, amount } });
  } else {
    res.send("permission denied");
  }
};

export const playerJankaari = async (req, res) => {
  const id = req.params.id;
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var data;
    if (id.length === 5) {
      data = await User.findOne(
        { id: id },
        {
          id: 1,
          balance: 1,
          rechargeHistory: 1,
          upLine: 1,
          bank: 1,
          phone: 1,
          block: 1,
          date: 1,
          walletHistory: 1,
          bidToday: 1,
          level0contribution: 1,
          level1contribution: 1,
          level2contribution: 1,
          level3contribution: 1,
          level4contribution: 1,
          level5contribution: 1,
          level6contribution: 1,
          levelDown: 1,
        }
      );
    } else {
      data = await User.findOne(
        { phone: id },
        {
          id: 1,
          balance: 1,
          rechargeHistory: 1,
          upLine: 1,
          bank: 1,
          phone: 1,
          block: 1,
          date: 1,
          walletHistory: 1,
          bidToday: 1,
          level0contribution: 1,
          level1contribution: 1,
          level2contribution: 1,
          level3contribution: 1,
          level4contribution: 1,
          level5contribution: 1,
          level6contribution: 1,
        }
      );
    }

    if (data) {
      const getNumber = await User.findOne(
        { id: data.upLine[0] },
        { phone: 1 }
      );
      res.status(200).send({ data: data, upLine: getNumber?.phone ?? 0 });
    } else {
      res.status(200).send({});
    }
  } else {
    res.send("permission denied");
  }
};

export const playerJankaarilevelData = async (req, res) => {
  const id = req.params.id;
  const btn = req.params.btn;
  const api = req.params.api;

  var userData = [];
  if (!api || api === process.env.AdminAPI) {
    if (btn === "lvl1") {
      //const data = await User.findOne({ id }, { level0: 1 });
      const getPromotion = await promotion.findOne({ userId: id });
      if (getPromotion) {
        var amount = 0;
        if (getPromotion.level0) {
          var keys = Object.keys(getPromotion.level0);

          for (var i = 0; i < keys.length; i++) {
            var val = getPromotion.level0[keys[i]]["firstRecharge"];
            amount = val;
            userData.push({
              mobile: keys[i],
              datetime: getPromotion.level0[keys[i]].date,
              amount,
            });
            // use val
          }
        }
      }

      res.status(200).send(userData);
    }
    if (btn === "lvl2") {
      const getPromotion = await promotion.findOne({ userId: id });
      if (getPromotion) {
        if (getPromotion.level1) {
          var keys = Object.keys(getPromotion.level1);

          for (var i = 0; i < keys.length; i++) {
            var val = getPromotion.level1[keys[i]]["firstRecharge"];
            amount = val;
            userData.push({
              mobile: keys[i],
              datetime: getPromotion.level1[keys[i]].date,
              amount,
            });
            // use val
          }
        }
      }

      res.status(200).send(userData);
    }
    if (btn === "lvl3") {
      const getPromotion = await promotion.findOne({ userId: id });

      if (getPromotion) {
        if (getPromotion.level2) {
          var keys = Object.keys(getPromotion.level2);

          for (var i = 0; i < keys.length; i++) {
            var val = getPromotion.level2[keys[i]]["firstRecharge"];
            amount = val;
            userData.push({
              mobile: keys[i],
              datetime: getPromotion.level2[keys[i]].date,
              amount,
            });
            // use val
          }
        }
      }

      res.status(200).send(userData);
    }
    if (btn === "lvl4") {
      const getPromotion = await promotion.findOne({ userId: id });

      if (getPromotion) {
        if (getPromotion.level3) {
          var keys = Object.keys(getPromotion.level3);

          for (var i = 0; i < keys.length; i++) {
            var val = getPromotion.level3[keys[i]]["firstRecharge"];
            amount = val;
            userData.push({
              mobile: keys[i],
              datetime: getPromotion.level3[keys[i]].date,
              amount,
            });
            // use val
          }
        }
      }

      res.status(200).send(userData);
    }
    if (btn === "lvl5") {
      const getPromotion = await promotion.findOne({ userId: id });

      if (getPromotion) {
        if (getPromotion.level4) {
          var keys = Object.keys(getPromotion.level4);

          for (var i = 0; i < keys.length; i++) {
            var val = getPromotion.level4[keys[i]]["firstRecharge"];
            amount = val;
            userData.push({
              mobile: keys[i],
              datetime: getPromotion.level4[keys[i]].date,
              amount,
            });
            // use val
          }
        }
      }

      res.status(200).send(userData);
    }
    if (btn === "lvl6") {
      const getPromotion = await promotion.findOne({ userId: id });

      if (getPromotion) {
        if (getPromotion.level5) {
          var keys = Object.keys(getPromotion.level5);

          for (var i = 0; i < keys.length; i++) {
            var val = getPromotion.level5[keys[i]]["firstRecharge"];
            amount = val;
            userData.push({
              mobile: keys[i],
              datetime: getPromotion.level5[keys[i]].date,
              amount,
            });
            // use val
          }
        }
      }

      res.status(200).send(userData);
    }
    if (btn === "lvl7") {
      const getPromotion = await promotion.findOne({ userId: id });

      if (getPromotion) {
        if (getPromotion.level6) {
          var keys = Object.keys(getPromotion.level6);

          for (var i = 0; i < keys.length; i++) {
            var val = getPromotion.level6[keys[i]]["firstRecharge"];
            amount = val;
            userData.push({
              mobile: keys[i],
              datetime: getPromotion.level6[keys[i]].date,
              amount,
            });
            // use val
          }
        }
      }

      res.status(200).send(userData);
    }
    if (btn === "more") {
      const date = new Date();
      const localDate = (date / 1000 + 19800) * 1000;
      const newDate = new Date(localDate);
      const day = newDate.getDate();
      const month = newDate.getMonth() + 1;
      const year = newDate.getFullYear();
      const dayMonth = `${day}/${month}/${year}`;
      var level0 = {};

      var level1 = {};
      var level2 = {};
      var level3 = {};
      var level4 = {};
      var level5 = {};
      var level6 = {};

      const getPromotion = await promotion.findOne({ userId: id });

      if (getPromotion) {
        var recharge0 = 0;
        var recharge1 = 0;
        var recharge2 = 0;
        var recharge3 = 0;
        var recharge4 = 0;
        var recharge5 = 0;
        var recharge6 = 0;
        if (getPromotion.level0)
          Object.keys(getPromotion.level0).map((element) => {
            if (getPromotion.level0[element].firstRecharge > 0) {
              recharge0++;
            }
          });
        if (getPromotion.level1)
          Object.keys(getPromotion.level1).map((element) => {
            if (getPromotion.level1[element].firstRecharge > 0) {
              recharge1++;
            }
          });
        if (getPromotion.level2)
          Object.keys(getPromotion.level2).map((element) => {
            if (getPromotion.level2[element].firstRecharge > 0) {
              recharge2++;
            }
          });
        if (getPromotion.level3)
          Object.keys(getPromotion.level3).map((element) => {
            if (getPromotion.level3[element].firstRecharge > 0) {
              recharge3++;
            }
          });
        if (getPromotion.level4)
          Object.keys(getPromotion.level4).map((element) => {
            if (getPromotion.level4[element].firstRecharge > 0) {
              recharge4++;
            }
          });
        if (getPromotion.level5)
          Object.keys(getPromotion.level5).map((element) => {
            if (getPromotion.level5[element].firstRecharge > 0) {
              recharge5++;
            }
          });
        if (getPromotion.level6)
          Object.keys(getPromotion.level6).map((element) => {
            if (getPromotion.level6[element].firstRecharge > 0) {
              recharge6++;
            }
          });
        level0 = {
          count: getPromotion.level0
            ? Object.keys(getPromotion.level0).length
            : 0,
          active: recharge0,
          today: 0,
        };
        if (getPromotion.activeMembers) {
          if (`${dayMonth}` in getPromotion.activeMembers) {
            if (getPromotion.activeMembers[`${dayMonth}`][0]) {
              level0.today =
                getPromotion.activeMembers[`${dayMonth}`][0].length;
            }
          }
        }

        level1 = {
          count: getPromotion.level1
            ? Object.keys(getPromotion.level1).length
            : 0,
          active: recharge1,
          today: 0,
        };
        if (getPromotion.activeMembers) {
          if (`${dayMonth}` in getPromotion.activeMembers) {
            if (getPromotion.activeMembers[`${dayMonth}`][1]) {
              level1.today =
                getPromotion.activeMembers[`${dayMonth}`][1].length;
            }
          }
        }
        level2 = {
          count: getPromotion.level2
            ? Object.keys(getPromotion.level2).length
            : 0,
          active: recharge2,
          today: 0,
        };
        if (getPromotion.activeMembers) {
          if (`${dayMonth}` in getPromotion.activeMembers) {
            if (getPromotion.activeMembers[`${dayMonth}`][2]) {
              level2.today =
                getPromotion.activeMembers[`${dayMonth}`][2].length;
            }
          }
        }

        level3 = {
          count: getPromotion.level3
            ? Object.keys(getPromotion.level3).length
            : 0,
          active: recharge3,
          today: 0,
        };
        if (getPromotion.activeMembers) {
          if (`${dayMonth}` in getPromotion.activeMembers) {
            if (getPromotion.activeMembers[`${dayMonth}`][3]) {
              level3.today =
                getPromotion.activeMembers[`${dayMonth}`][3].length;
            }
          }
        }

        level4 = {
          count: getPromotion.level4
            ? Object.keys(getPromotion.level4).length
            : 0,
          active: recharge4,
          today: 0,
        };
        if (getPromotion.activeMembers) {
          if (`${dayMonth}` in getPromotion.activeMembers) {
            if (getPromotion.activeMembers[`${dayMonth}`][4]) {
              level4.today =
                getPromotion.activeMembers[`${dayMonth}`][4].length;
            }
          }
        }

        level5 = {
          count: getPromotion.level5
            ? Object.keys(getPromotion.level5).length
            : 0,
          active: recharge5,
          today: 0,
        };
        if (getPromotion.activeMembers) {
          if (`${dayMonth}` in getPromotion.activeMembers) {
            if (getPromotion.activeMembers[`${dayMonth}`][5]) {
              level5.today =
                getPromotion.activeMembers[`${dayMonth}`][5].length;
            }
          }
        }

        level6 = {
          count: getPromotion.level6
            ? Object.keys(getPromotion.level6).length
            : 0,
          active: recharge6,
          today: 0,
        };
        if (getPromotion.activeMembers) {
          if (`${dayMonth}` in getPromotion.activeMembers) {
            if (getPromotion.activeMembers[`${dayMonth}`][6]) {
              level6.today =
                getPromotion.activeMembers[`${dayMonth}`][6].length;
            }
          }
        }
      } else {
        level0 = {
          count: 0,
          active: 0,
          today: 0,
        };
        level1 = {
          count: 0,
          active: 0,
          today: 0,
        };
        level2 = {
          count: 0,
          active: 0,
          today: 0,
        };
        level3 = {
          count: 0,
          active: 0,
          today: 0,
        };
        level4 = {
          count: 0,
          active: 0,
          today: 0,
        };
        level5 = {
          count: 0,
          active: 0,
          today: 0,
        };
        level6 = {
          count: 0,
          active: 0,
          today: 0,
        };
      }

      res.status(200).send({ level0, level1, level2, level3, level4, level5, level6 });
    }
  } else {
    res.send("permission denied");
  }
};

export const updataUserBalance = async (req, res) => {
  try {
    var amount;
    const id = req.params.id;
    const api = req.params.api;
    const balance = parseInt(req.params.balance);
    amount = balance;

    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDatefor = new Date(localDate);
    const day = newDatefor.getDate();
    const month = newDatefor.getMonth() + 1;
    const year = newDatefor.getFullYear();

    var daySorted;
    var monthSorted;
    if (day < 10) {
      daySorted = `0${day}`;
    } else {
      daySorted = `${day}`;
    }
    if (month < 10) {
      monthSorted = `0${month}`;
    } else {
      monthSorted = `${month}`;
    }
    const newDate = `${daySorted}-${monthSorted}-${year}`;
    const todayProfit = `${day}/${month}/${year}`;
    if (!api || api === process.env.AdminAPI) {
      if (balance >= 200) {
        const user = await User.findOne({ id });
        if (user.demo) {
          await User.updateOne(
            { id: parseInt(id) },
            { $inc: { balance: balance } }
          );
        } else {
          const lastTrans = await Trans.findOne().sort({ number: -1 });
          const newIncreament = lastTrans.number + 1;
          await Trans.create({
            id: "manual",
            createDate: Date.now(),
            userId: id,
            amount: balance,
            number: newIncreament,
            status: "success",
            date: Date.now(),
            expired: true,
          });
          var firstRecharge = 0;
          await daily.updateOne(
            { id: newDate },
            { $inc: { count: +1, amount: amount } },
            { upsert: true }
          );
          if (!user.firstRecharge) {
            firstRecharge = amount;
            await User.updateOne(
              { id: user.upLine[0] },
              {
                $inc: { balance: +151 },
                $push: {
                  walletHistory: {
                    amount: 151,
                    date: Date.now(),
                    credit: true,
                    note: `Referal Reward User: ${user.id}`,
                  },
                },
              }
            );
            const filedName = `todayProfit.${todayProfit}.referral`;
            await offerBonus.updateOne(
              { userId: user.upLine[0] },
              {
                userId: user.upLine[0],
                $inc: { amount: +151, [filedName]: +151, totalReferral: +151 },
                $push: {
                  history: {
                    credit: "wallet",
                    amount: 151,
                    note: `Referal Reward User: ${user.id}`,
                    date: Date.now(),
                  },
                },
              },
              { upsert: true }
            );

            var bonusAmount = amount;

            const bonus = (amount * 10) / 100;
            bonusAmount = amount + bonus;

            await User.updateOne(
              { id: user.id },
              {
                firstRecharge: true,
                $inc: { balance: +bonusAmount },
                $push: {
                  rechargeHistory: {
                    amount: bonusAmount,
                    date: Date.now(),
                    status: "Success",
                  },
                  walletHistory: {
                    amount: bonusAmount,
                    date: Date.now(),
                    credit: true,
                    note: `Add money ID: ${newIncreament}`,
                  },
                },
              }
            );

            const level0profit = (amount * 3) / 100;
            const level1profit = (amount * 0) / 100;
            const level2profit = (amount * 0) / 100;

            user.upLine.forEach(async (element, index) => {
              if (index === 0) {
                const fieldName = `todayProfit.${todayProfit}.level${index}`;
                const totallevel = `totalLevel${index}`;
                await User.updateOne(
                  { id: element },
                  {
                    $inc: {
                      balance:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                    },
                  }
                );
                await offerBonus.updateOne(
                  { userId: element },
                  {
                    userId: element,
                    $inc: {
                      amount:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                      [fieldName]:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                      [totallevel]:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                    },
                    $push: {
                      history: {
                        credit: "wallet",
                        amount:
                          index === 0
                            ? level0profit
                            : index === 1
                              ? level1profit
                              : level2profit,
                        note: `Recharge bonus: ${user.id}`,
                        date: Date.now(),
                      },
                    },
                  },
                  { upsert: true }
                );
              }
            });
          } else {
            var bonus;
            var bonusAmount = amount;
            if (amount > 200) {
              bonus = (amount * 3) / 100;
              bonusAmount = amount + bonus;
            }
            await User.updateOne(
              { id: user.id },
              {
                firstRecharge: true,
                $inc: { balance: +bonusAmount },
                $push: {
                  rechargeHistory: {
                    amount: bonusAmount,
                    date: Date.now(),
                    status: "Success",
                  },
                  walletHistory: {
                    amount: bonusAmount,
                    date: Date.now(),
                    credit: true,
                    note: `Add money ID: ${newIncreament}`,
                  },
                },
              }
            );
            const level0profit = (amount * 3) / 100;
            const level1profit = (amount * 0) / 100;
            const level2profit = (amount * 0) / 100;

            user.upLine.forEach(async (element, index) => {
              if (index === 0) {
                const fieldName = `todayProfit.${todayProfit}.level${index}`;
                const totallevel = `totalLevel${index}`;
                await User.updateOne(
                  { id: element },
                  {
                    $inc: {
                      balance:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                    },
                  }
                );
                await offerBonus.updateOne(
                  { userId: element },
                  {
                    userId: element,
                    $inc: {
                      amount:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                      [fieldName]:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                      [totallevel]:
                        index === 0
                          ? level0profit
                          : index === 1
                            ? level1profit
                            : level2profit,
                    },
                    $push: {
                      history: {
                        credit: "wallet",
                        amount:
                          index === 0
                            ? level0profit
                            : index === 1
                              ? level1profit
                              : level2profit,
                        note: `Recharge bonus: ${user.id}`,
                        date: Date.now(),
                      },
                    },
                  },
                  { upsert: true }
                );
              }
            });
          }

          const userDate = new Date(user.date);
          const userDateLocal = (userDate / 1000 + 19800) * 1000;
          const newuserDate = new Date(userDateLocal);
          const abhiDate = new Date();
          const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
          const newabhirDate = new Date(abhiDateLocal);
          const day = newabhirDate.getDate();
          const month = newabhirDate.getMonth() + 1;
          const year = newabhirDate.getFullYear();
          const dayMonth = `${day}/${month}/${year}`;

          const userday = newuserDate.getDate();
          const usermonth = newuserDate.getMonth() + 1;
          const userYear = newuserDate.getFullYear();
          const userdayMonth = `${userday}/${usermonth}/${userYear}`;
          const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone3recharge = `newlevel3.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone4recharge = `newlevel4.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone5recharge = `newlevel5.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone6recharge = `newlevel6.${dayMonth}.${user.phone}.todayRecharge`;

          const phone0recharge = `level0.${user.phone}.totalRecharge`;
          const phone1recharge = `level1.${user.phone}.totalRecharge`;
          const phone2recharge = `level2.${user.phone}.totalRecharge`;
          const phone3recharge = `level3.${user.phone}.totalRecharge`;
          const phone4recharge = `level4.${user.phone}.totalRecharge`;
          const phone5recharge = `level5.${user.phone}.totalRecharge`;
          const phone6recharge = `level6.${user.phone}.totalRecharge`;

          const phone0first = `level0.${user.phone}.firstRecharge`;
          const phone1first = `level1.${user.phone}.firstRecharge`;
          const phone2first = `level2.${user.phone}.firstRecharge`;
          const phone3first = `level3.${user.phone}.firstRecharge`;
          const phone4first = `level4.${user.phone}.firstRecharge`;
          const phone5first = `level5.${user.phone}.firstRecharge`;
          const phone6first = `level6.${user.phone}.firstRecharge`;

          if (dayMonth === userdayMonth) {
            if (user.upLine !== null) {
              // Handle all levels (0-6) for today's recharge
              for (let i = 0; i < 7; i++) {
                if (user.upLine[i]?.length > 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[i] },
                    {
                      userId: user.upLine[i],
                      $inc: {
                        [`newlevel${i}.${dayMonth}.${user.phone}.todayRecharge`]:
                          amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }
          }

          if (user.upLine !== null) {
            // Handle all levels (0-6) for total recharge and first recharge
            for (let i = 0; i < 7; i++) {
              if (user.upLine[i]?.length > 0) {
                await promotion.updateOne(
                  { userId: user.upLine[i] },
                  {
                    userId: user.upLine[i],
                    $inc: {
                      [`level${i}.${user.phone}.firstRecharge`]: firstRecharge,
                      [`level${i}.${user.phone}.totalRecharge`]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
        }
      } else {
        await User.updateOne(
          { id: parseInt(id) },
          { $inc: { balance: balance } }
        );
      }

      res.send("done");
    } else {
      res.send("permission denied");
    }
  } catch (error) {
    res.send("done");
  }
};

export const ClearUserContri = async (req, res) => {
  const id = req.params.id;
  const api = req.params.api;

  if (!api || api === process.env.AdminAPI) {
    await User.updateOne(
      { id: parseInt(id) },
      {
        level0contribution: 0,
        level1contribution: 0,
        level2contribution: 0,
        bonus: 0,
      }
    );
    res.send("done");
  } else {
    res.send("permission denied");
  }
};

export const updataUserBonus = async (req, res) => {
  var amount;
  const id = req.params.id;
  const api = req.params.api;
  const balance = parseInt(req.params.bonus);
  amount = balance;
  if (!api || api === process.env.AdminAPI) {
    if (balance >= 1) {
      const user = await User.findOne({ id });
      if (user.demo) {
        await User.updateOne(
          { id: parseInt(id) },
          { $inc: { balance: balance } }
        );
      } else {
        await User.updateOne(
          { id },
          {
            $inc: { balance: +amount },
            $push: {
              rechargeHistory: {
                type: "Bonus",
                amount: amount,
                date: Date.now(),
                status: "Success",
              },
              walletHistory: {
                amount: amount,
                date: Date.now(),
                credit: true,
                note: `Bonus Added`,
              },
            },
          }
        );
      }
    } else {
      await User.updateOne(
        { id: parseInt(id) },
        { $inc: { balance: balance } }
      );
    }

    res.send("done");
  } else {
    res.send("permission denied");
  }
};

export const getUserBonus = async (req, res) => {
  const api = req.params.api;
  const userId = req.params.id;
  try {
    if (!api || api === process.env.AdminAPI) {
      const getBonus = await offerBonus.findOne(
        { userId },
        { amount: 1, history: 1 }
      );
      res.status(200).send(getBonus);
    } else {
      res.status(200).send("done");
    }
  } catch (error) {
    res.status(200).send("done");
  }
};

export const getCurrentNumber = async (req, res) => {
  const api = req.params.api;

  if (!api || api === process.env.AdminAPI) {
    const currentPeriod1 = await Manual1.find().sort({ date: -1 });
    const getData1 = await Manual1.findOne({ _id: currentPeriod1[0]._id });
    const currentPeriod3 = await Manual3.find().sort({ date: -1 });
    const getData3 = await Manual3.findOne({ _id: currentPeriod3[0]._id });
    const currentPeriod5 = await Manual5.find().sort({ date: -1 });
    const getData5 = await Manual5.findOne({ _id: currentPeriod5[0]._id });
    res.send({
      1: { data: getData1 },
      3: { data: getData3 },
      5: { data: getData5 },
    });
  } else {
    res.send("permission denied");
  }
};

export const migratePlayerJankaarilevelData = async (req, res) => {
  const id = req.params.id;

  var userData = [];

  res.status(200).send("done");
};
