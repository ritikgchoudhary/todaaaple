import axios from "axios";
import { createHash } from "crypto";
import ErrorResponse from "../utils/error.js";
import Trans from "../model/transaction.js";
import User from "../model/userSchema.js";
import promotion from "../model/promotion.js";
import payout from "../model/payout.js";
import Daily from "../model/daily.js";
import withdrawal from "../model/withdrawal.js";
import daily from "../model/daily.js";
import extra from "../model/extra.js";
import crypto from "crypto";
import https from "https";
import dns from "dns";
import qs from "qs";
import offerBonus from "../model/offerBonus.js";
import querystring from "querystring";
import { error } from "console";
import Razorpay from "razorpay";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import sha256 from "sha256";
import dateFormat from "dateformat";
import md5 from "md5";
import Joi from "joi";
import { creditCommission } from "./commission.js";

/** Rupee Rush IP whitelist is often IPv4-only; server may egress via IPv6 first. Force A-record / IPv4 for their API. Set RUPEERUSH_FORCE_IPV4=0 to use default DNS order. */
function createRupeeRushHttpsAgent() {
  if (process.env.RUPEERUSH_FORCE_IPV4 === "0") {
    return new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
    });
  }
  return new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    lookup(hostname, _options, callback) {
      dns.lookup(hostname, { family: 4, all: false }, callback);
    },
  });
}

/** Payer / client IP for Rupee Rush payin (API rejects missing IP with "Invalid IP address: undefined"). */
function getRupeeRushClientIp(req) {
  const fixed = process.env.RUPEERUSH_FIXED_CLIENT_IP;
  if (fixed != null && String(fixed).trim() !== "") {
    return String(fixed).trim();
  }

  const normalizeIp = (s) => {
    let v = String(s || "").trim();
    if (!v) return "";
    if (v.startsWith("::ffff:")) v = v.slice(7);
    if (v === "::1") v = "127.0.0.1";
    return v;
  };
  const isUsable = (s) => {
    const v = normalizeIp(s);
    return v && v !== "127.0.0.1" && v !== "localhost";
  };

  const xff = req.headers["x-forwarded-for"];
  const fromXff =
    typeof xff === "string" && xff.trim()
      ? xff.split(",")[0].trim()
      : "";
  const fromHeader =
    fromXff ||
    (typeof req.headers["x-real-ip"] === "string" ? req.headers["x-real-ip"].trim() : "") ||
    (typeof req.headers["cf-connecting-ip"] === "string"
      ? req.headers["cf-connecting-ip"].trim()
      : "");
  const fromExpressIp =
    typeof req.ip === "string" && req.ip.trim() ? req.ip.trim() : "";
  const fromSocket =
    req.socket?.remoteAddress || req.connection?.remoteAddress || "";

  let ip = "";
  if (isUsable(fromHeader)) ip = normalizeIp(fromHeader);
  else if (isUsable(fromExpressIp)) ip = normalizeIp(fromExpressIp);
  else if (isUsable(fromSocket)) ip = normalizeIp(fromSocket);
  else ip = normalizeIp(fromHeader || fromExpressIp || fromSocket);
  if (ip) return ip;

  const bodyIp = req.body?.client_ip ?? req.body?.clientIp ?? req.body?.ip;
  if (bodyIp != null && String(bodyIp).trim() !== "") {
    let b = String(bodyIp).trim();
    if (b.startsWith("::ffff:")) b = b.slice(7);
    return b;
  }

  const envIp = process.env.RUPEERUSH_DEFAULT_CLIENT_IP;
  if (envIp != null && String(envIp).trim() !== "") return String(envIp).trim();

  return "";
}
var seospay = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOGQwNzcyMWIwZTE5NjQ5MTJlNmQzNjBjZmM3MzhkYmU3MTgzMTEyZTA0Y2UzMzgzODFkYWRjMjQwMmRmMWRhODg5ZTc0YWFhNjAwZWUxMmIiLCJpYXQiOjE3MTU2ODEzNTkuMjY0Njg4MDE0OTg0MTMwODU5Mzc1LCJuYmYiOjE3MTU2ODEzNTkuMjY0NjkyMDY4MDk5OTc1NTg1OTM3NSwiZXhwIjoxNzE2Mjg2MTU5LjI2MjM4MTA3NjgxMjc0NDE0MDYyNSwic3ViIjoiMzciLCJzY29wZXMiOltdfQ.AUkEk-FdzkDDxLyAjnvsRWxVoZ3DrjKAcLwfW4VbhO7LgZ20uZ7vf8pQ3QNXHYUuMM_SEYfwCsda_Jl6koKRSnqMNSImQQufankHrr5qLEGlaIk4PLoMQj4dSrI5IjbLuVrudQc4loTWNeEcN3jxdapa7svx9uD9YZg6BcF2OHZ4z8thFSaUvkXfganbpKplNPEhTvPCm1MS6H1gaJjep5vdC6QOvk2U6yLJpdKnmrQ3Nc4IlsIAIrDJtfx4X3a1xEMIEjoxl0jkVOox5Id2n8V9_sRo7LHjQLQ9OcW5qJHXYBNysKByqQBA7fuil-tr8dDfIZVzSQ54QPCRMBDd0b7j6TpViwQxnR1ksgOGBR9G9KNUGBWWyCWujilG8jNZ_sJPCDsL0VdWCxhHUbtvo3E4HCWsIHOAhiGeR_yaFNSsVaDC4mELgdDKrLOUR7Pc2mzYxgpt-eFvoAjFboPNpzIsiZ7nQFAAlCMNdX7-i2fFABl9Fh2e2IGPn9psAXD3xBY3XwGX9rcICUuka8pE0gSkbhQQEvFORiLGu216ahgw5wXl-DEvqswdqWfFkUGvxrEZjqgHOvZaIJP5Xlz5nUs0UwOvdPM45KE_PvMajR-Ddc_G5y-EaM4WQ4TRaHIon3wbuemKYXsQ6SFllm3V-u31akW8yMHC1AHU23Ah5hw"
var token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbElkIjoiZ3M3NDM0MEBnbWFpbC5jb20iLCJwYXNzd29yZCI6Im16aTl6cjY3aWJ5ZHA1azN0Y2t6IiwiaWF0IjoxNjk2NTA0NDk3LCJleHAiOjE2OTY2NzcyOTd9.U3iNorsmGO26VMeX-yFQ0FHCjVbGIWGrV3nzcD7HqrE";
var pToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NjQ0NjI5NDY5IiwibmFtZWlkIjoiMTQ1IiwiZW1haWwiOiJnb29lYXdzMkBnbWFpbC5jb20iLCJqdGkiOiJhZWJjNGIwNC02M2ZlLTRmNWUtYjUxYS05ZWM2MjVjNmM0ZTkiLCJleHAiOjE2OTgyMTkyNTIsImlzcyI6IkV6dWxpeGIyYiIsImF1ZCI6IkV6dWxpeGIyYiJ9.Ond7rfPuCG8awg269DSlrqxLDSRZGzs6Noof3s0ehnk";
var KSLtoken =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzNSIsImlhdCI6MTcwMjYyMTA0OSwiZXhwIjoxNzAyNjQ5ODQ5fQ.klXuAcxnlHtPwXoCkazbY22Ip1gFwpTDBXpRW0s53g2_g1U7XvCZtnbV4wru7lU-N8GhJGDb0IV8L8Uw5KDxIg";
var planetC =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjMyIiwibmFtZSI6IjRTQU5FIEdBTUlORyBQUklWQVRFIExJTUlURUQiLCJ1c2VybmFtZSI6IjRzYW5lcGx0MjMxMiIsIm1vYmlsZSI6Ijk5ODE1ODM5NjEiLCJjcmVhdGVkX2F0IjoiMjAyMy0xMi0yMyAxODozMToxNiIsInRpbWUiOjE3MDM1OTM1MTJ9.UDBPgBNzSMnPUfB-1sNDqLME9CfwqtUlvrvTbZTY0jM";

const razorpay = new Razorpay({
  key_id: 'rzp_live_fJzOc7KpYoTdkk',
  key_secret: 'Y9tTG0rE2sryUoDbxokaWhzU',
});

export const createUPIintent = async (req, res) => {
  const token = process.env.paygicToken;
  const userId = req.params.id;
  const amount = req.body.amount;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const id = Math.random().toString(16).slice(2);
  try {
    const options = {
      method: "POST",
      url: "https://server.paygic.in/api/v2/createPaymentRequest",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "token": `${token}`,
      },
      data: {
        "mid": "CHOUHANKRI", //Example - PAYGIC
        "amount": amount,//Example - 200
        "merchantReferenceId": id,//Example- bd79da4cc3ff1
        "customer_name": customer_name,
        "customer_email": customer_email,
        "customer_mobile": customer_mobile
      },
    };

    axios
      .request(options)
      .then(async function (response) {
        const lastTrans = await Trans.findOne().sort({ number: -1 });
        const newIncreament = lastTrans.number + 1;
        await Trans.create({
          id: id,
          number: newIncreament,
          date: Date.now(),
          userId,
          gateway: "Paygic",
          amount: amount,
          status: "created",
        });

        if (response.data.status) {
          res.status(200).send(response.data.data);
        } else {
          console.log(response.data)
          res.status(400).send(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
        return next(new ErrorResponse(error.message, 400));
      });



  } catch (error) {
    console.log(error)
    return res.status(400).send({ status: false, statusCode: 400, msg: error.message })

  }
}
export const paygicUPICallback = async (req, res) => {
  const data = req.body;
  const clientId = data.data.merchantReferenceId;

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

  if (data.status) {
    const paygicStatus = await axios.post(`https://server.paygic.in/api/v2/checkPaymentStatus`, {
      "mid": "CHOUHANKRI", //Example - PAYGIC
      "merchantReferenceId": clientId,//Example- bd79da4cc3ff1
    }, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "token": `${process.env.paygicToken}`,
      },
    }
    );

    if (paygicStatus.data.txnStatus === "SUCCESS") {

      try {



        const tempTran = await Trans.findOne({
          id: clientId,
          status: "created",
        });
        if (tempTran) {
          console.log("**************** WebHooked Paygic *********************");
          const lastTransId = await Trans.findOne(
            { id: clientId },
            { number: 1, userId: 1, amount: 1 }
          );
          var amount = lastTransId.amount;
          const updatedDoc = await Trans.findOneAndUpdate(
            { id: clientId, status: 'created' },
            { status: 'success', expired: true, $inc: { __v: 1 } },
            { new: true, runValidators: true }
          );

          if (updatedDoc) {
            const user = await User.findOne({ id: lastTransId.userId });
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
                { id: user.id },
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
              //     const level1profit = (amount * 0) /100;
              //     const level2profit = (amount * 0) /100;


              // user.upLine.forEach(async (element,index) => {
              //   if(index === 0){
              //   const fieldName = `todayProfit.${todayProfit}.level${index}`;
              //   const totallevel = `totalLevel${index}`;
              //   await User.updateOne(
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
              //   }
              // });
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

            res.status(200).send("done");

          } else {
            res.status(200).send('done');
          }
        } else {
          res.status(200).send("done");
        }

      } catch (error) {
        console.log(error.message);
        res.status(200).send("done");
      }
    } else {

      res.status(200).send("done");
    }

  } else {
    res.status(200).send("done");
  }

}

export const createAirpayOrder = async (req, res) => {
  const userId = req.params.id;
  const amount = req.body.amount;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const id = Math.random().toString(16).slice(2);
  const secret = process.env.airpay;
  const username = process.env.airpayUsername;
  const password = process.env.airpayPass;
  try {


    const alldata = customer_email + customer_name + " " + " " + " " + " " + " " + `${amount}` + id;
    const udata = username + ':|:' + password;
    const privatekey = sha256(secret + '@' + udata);
    const keySha256 = sha256(username + "~:~" + password);
    var now = new Date();
    const aldata = alldata + dateFormat(now, 'yyyy-mm-dd');
    const checksum = sha256(keySha256 + '@' + aldata); //md5(aldata+privatekey);

    const lastTrans = await Trans.findOne().sort({ number: -1 });
    const newIncreament = lastTrans.number + 1;
    await Trans.create({
      id: id,
      number: newIncreament,
      date: Date.now(),
      userId,
      gateway: "Airpay",
      amount: amount,
      status: "created",
    });



    return res.status(200).send({ privatekey: privatekey, checksum: checksum, data: { id, amount } })
  } catch (error) {
    console.log(error)
    return res.status(400).send({ status: false, statusCode: 400, msg: error.message })

  }
}

export const createCryptoUpayOrder = async (req, res) => {
  const userId = req.params.id;
  const inrAmount = parseFloat(req.body.amount);
  const usdRate = parseFloat(process.env.USD_RATE || 95);
  const amountInUsd = (inrAmount / usdRate).toFixed(4);
  const id = Math.random().toString(16).slice(2);
  const secret = process.env.UPAY_APP_SECRET;
  const app = process.env.UPAY_APP_ID;
  try {
    function generateSignature(params, appSecret) {
      const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`);
      const stringToSign = sortedParams.join('&') + `&appSecret=${appSecret}`;
      const md5Hash = crypto.createHash('md5').update(stringToSign).digest('hex');
      const signature = md5Hash.toUpperCase();
      return signature;
    }
    const baseUrl = req.get('origin') || `${req.protocol}://${req.get('host')}`;
    const params = {
      appId: app,
      chainType: '1',
      merchantOrderNo: id,
      fiatAmount: `${amountInUsd}`,
      fiatCurrency: "USD",
      notifyUrl: `${baseUrl}/cryptoUpayCallback`
    };
    const signature = generateSignature(params, secret);

    const options = {
      method: "POST",
      url: `${process.env.UPAY_API_URL}/v1/api/open/order/apply`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        ...params,
        "redirectUrl": `${baseUrl}/depositHistory`,
        "signature": signature
      },
    };

    axios.request(options)
      .then(async function (response) {
        if (response.data.code === '1') {
          const lastTrans = await Trans.findOne().sort({ number: -1 });
          const newIncreament = (lastTrans?.number || 0) + 1;
          await Trans.create({
            id: id,
            number: newIncreament,
            date: Date.now(),
            userId,
            gateway: "Upay",
            amount: inrAmount,
            status: "created",
          });
          return res.status(200).send({ url: response.data.data.payUrl })
        } else {
          return res.status(400).send(response.data.msg)
        }
      }).catch(function (error) {
        return res.status(400).send(error)
      });
  } catch (error) {
    return res.status(400).send({ status: false, statusCode: 400, msg: error.message })
  }
}
export const verifyCryptoSign = async (req, res) => {

  function verifySignature(data, signature, appSecret) {
    const sortedParams = Object.keys(data).sort().map(key => `${key}=${data[key]}`);
    const stringToSign = sortedParams.join('&') + `&appSecret=${appSecret}`;
    const calculatedSignature = crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
    return calculatedSignature === signature;
  }

  try {
    // Extract signature and all other data
    const { signature: receivedSignature, ...callbackData } = req.body;
    const appSecret = process.env.UPAY_APP_SECRET;

    // Use the verified working parameter combination for UPay callback signature
    const receivedData = {
      appId: callbackData.appId,
      orderNo: callbackData.orderNo,
      merchantOrderNo: callbackData.merchantOrderNo,
      chainType: callbackData.chainType,
      crypto: callbackData.crypto,
      actualCrypto: callbackData.actualCrypto,
      poundage: callbackData.poundage,
      actualPoundage: callbackData.actualPoundage,
      status: callbackData.status,
      createdAt: callbackData.createdAt,
      completedAt: callbackData.completedAt
    };

    // Remove empty/undefined values
    Object.keys(receivedData).forEach(key => {
      if (receivedData[key] === undefined || receivedData[key] === null || receivedData[key] === '') {
        delete receivedData[key];
      }
    });

    const isValid = verifySignature(receivedData, receivedSignature, appSecret);

    if (isValid) {
      // Process the successful payment
      if (callbackData.status === "1") {
        // Payment completed successfully
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
        const clientId = callbackData.merchantOrderNo;

        try {



          const tempTran = await Trans.findOne({
            id: clientId,
            status: "created",
          });
          if (tempTran) {
            console.log("**************** WebHooked Upay *********************");
            const lastTransId = await Trans.findOne(
              { id: clientId },
              { number: 1, userId: 1, amount: 1 }
            );
            var amount = lastTransId.amount;
            const updatedDoc = await Trans.findOneAndUpdate(
              { id: clientId, status: 'created' },
              { status: 'success', expired: true, $inc: { __v: 1 } },
              { new: true, runValidators: true }
            );

            if (updatedDoc) {
              const user = await User.findOne({ id: lastTransId.userId });
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
                  { id: user.id },
                  {
                    firstRecharge: true, $inc: { balance: +bonusAmount },
                    $push: {
                      rechargeHistory: {
                        amount: bonusAmount,
                        date: Date.now(),
                        status: "Success",
                        usdt: callbackData.actualCrypto
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
                //     const level1profit = (amount * 0) /100;
                //     const level2profit = (amount * 0) /100;


                // user.upLine.forEach(async (element,index) => {
                //   if(index === 0){
                //   const fieldName = `todayProfit.${todayProfit}.level${index}`;
                //   const totallevel = `totalLevel${index}`;
                //   await User.updateOne(
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
                //   }
                // });
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
                    firstRecharge: true, $inc: { balance: +bonusAmount },
                    $push: {
                      rechargeHistory: {
                        amount: bonusAmount,
                        date: Date.now(),
                        status: "Success",
                        usdt: callbackData.actualCrypto
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

              res.status(200).send("ok");

            } else {
              res.status(200).send('ok');
            }
          } else {
            res.status(200).send("ok");
          }

        } catch (error) {
          console.log(error.message);
          res.status(200).send("ok");
        }

        // return res.status(200).send("SUCCESS");
      } else {
        console.log('Payment not completed, status:', callbackData.status);
        return res.status(200).send("PENDING");
      }
    } else {
      console.log('Invalid signature verification');
      return res.status(400).send("INVALID_SIGNATURE");
    }

  } catch (error) {
    console.error('Error in verifyCryptoSign:', error);
    return res.status(500).send("ERROR");
  }
}




export const paycialCreateOrder = async (req, res) => {
  const token = process.env.paycial_client;
  const userId = req.params.id;
  const amount = req.body.amount;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const id = Math.random().toString(16).slice(2);
  try {
    const options = {
      method: "POST",
      url: "https://prod.api.thepayer.in/v1/account/create-payment-link",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",

      },
      data: {
        "clientId": token,
        "amount": amount,
        "orderId": id,
        "redirectUrl": "https://winkaro.online/rechargeHistory",
        "initiated": "api"
      }
    };

    axios
      .request(options)
      .then(async function (response) {
        const lastTrans = await Trans.findOne().sort({ number: -1 });
        const newIncreament = lastTrans.number + 1;
        await Trans.create({
          id: id,
          number: newIncreament,
          date: Date.now(),
          userId,
          gateway: "Paycial",
          amount: amount,
          status: "created",
        });

        if (response.data.status) {
          res.status(200).send(response.data.data);
        } else {
          console.log(response.data)
          res.status(400).send("error");
        }
      })
      .catch(function (error) {
        console.log(error);
        return next(new ErrorResponse(error.message, 400));
      });



  } catch (error) {
    console.log(error)
    return res.status(400).send({ status: false, statusCode: 400, msg: error.message })

  }
}

export const paycialCallback = async (req, res) => {
  const data = req.body;
  const decryptData = (encryptionKey, encryptedObj) => {
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    const ivBuffer = Buffer.from(encryptedObj.iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);

    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    console.log(JSON.parse(decrypted))

    return JSON.parse(decrypted);

  };

  const callbackData = decryptData(process.env.paycial, data);
  if (callbackData.status === "approved") {

    const clientId = callbackData.orderId;

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

    try {



      const tempTran = await Trans.findOne({
        id: clientId,
        status: "created",
      });
      if (tempTran) {
        console.log("**************** WebHooked Paycial *********************");
        const lastTransId = await Trans.findOne(
          { id: clientId },
          { number: 1, userId: 1, amount: 1 }
        );
        var amount = callbackData.amount;
        const updatedDoc = await Trans.findOneAndUpdate(
          { id: clientId, status: 'created' },
          { status: 'success', expired: true, $inc: { __v: 1 } },
          { new: true, runValidators: true }
        );

        if (updatedDoc) {
          const user = await User.findOne({ id: lastTransId.userId });
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
            if (amount > 4999) {
              const bonus = (amount * 10) / 100;
              bonusAmount = amount + bonus;
            }
            await User.updateOne(
              { id: user.id },
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

            const level0profit = (amount * 9) / 100;
            const level1profit = (amount * 4) / 100;
            const level2profit = (amount * 3) / 100;


            user.upLine.forEach(async (element, index) => {
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
            });
          } else {
            var bonus;
            var bonusAmount = amount;
            // if (amount > 200) {
            //    bonus = (amount * 5) / 100;
            //   bonusAmount = amount + bonus;
            // }
            await User.updateOne(
              { id: user.id },
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
            const level0profit = (amount * 9) / 100;
            const level1profit = (amount * 4) / 100;
            const level2profit = (amount * 3) / 100;

            user.upLine.forEach(async (element, index) => {
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
          const useryear = newuserDate.getFullYear();

          const userdayMonth = `${userday}/${usermonth}/${useryear}`;
          const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
          const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

          const phone0recharge = `level0.${user.phone}.totalRecharge`;
          const phone1recharge = `level1.${user.phone}.totalRecharge`;
          const phone2recharge = `level2.${user.phone}.totalRecharge`;

          const phone0first = `level0.${user.phone}.firstRecharge`;
          const phone1first = `level1.${user.phone}.firstRecharge`;
          const phone2first = `level2.${user.phone}.firstRecharge`;

          if (dayMonth === userdayMonth) {
            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[0] ?? 1 },
                  {
                    userId: user.upLine[0] ?? 1,
                    $inc: {
                      [newphone0recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [newphone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [newphone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }

                if (user.upLine[2].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[2] ?? 1 },
                    {
                      userId: user.upLine[2] ?? 1,
                      $inc: {
                        [newphone2recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }
          }

          if (user.upLine !== null) {
            if (user.upLine[0].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] ?? 1 },
                {
                  userId: user.upLine[0] ?? 1,
                  $inc: {
                    [phone0first]: firstRecharge,
                    [phone0recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
            if (user.upLine.length === 2) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [phone1first]: firstRecharge,
                      [phone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
            if (user.upLine.length === 3) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [phone1first]: firstRecharge,
                      [phone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }

              if (user.upLine[2].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[2] ?? 1 },
                  {
                    userId: user.upLine[2] ?? 1,
                    $inc: {
                      [phone2first]: firstRecharge,
                      [phone2recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }

          res.status(200).send("done");

        } else {
          res.status(200).send('done');
        }
      } else {
        res.status(200).send("done");
      }

    } catch (error) {
      console.log(error.message);
      res.status(200).send("done");
    }

  } else {
    res.status(200).send("Done")

  }


}
export const cashfreeCreateOrder = async (req, res, next) => {


  const userId = req.params.id;
  const amount = req.body.amount;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.phone.toString();
  const id = Math.random().toString(16).slice(2);
  try {
    const options = {
      method: "POST",
      url: "https://api.cashfree.com/pg/orders",
      headers: {
        accept: "application/json",
        "x-client-id": process.env.cashfree_id,
        "x-client-secret": process.env.cashfree_secret,
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01"

      },
      data: {
        "order_id": id,

        "order_amount": amount,
        "order_currency": "INR",
        "customer_details": {
          "customer_id": userId,
          "customer_phone": customer_mobile
        },
        "order_meta": {
          "return_url": `https://winkaro.online/reachargeHistory`
        }
        // "redirectUrl":"https://winkaro.online/rechargeHistory",
        // "initiated":"api" 
      }
    };

    axios
      .request(options)
      .then(async function (response) {

        const lastTrans = await Trans.findOne().sort({ number: -1 });
        const newIncreament = lastTrans.number + 1;
        await Trans.create({
          id: id,
          number: newIncreament,
          date: Date.now(),
          userId,
          gateway: "Cashfree",
          amount: amount,
          status: "created",
        });

        res.status(200).send(response.data);



      })
      .catch(function (error) {
        console.log(error);
        return next(new ErrorResponse(error.message, 400));
      });



  } catch (error) {
    console.log(error)
    return res.status(400).send({ status: false, statusCode: 400, msg: error.message })

  }

}
export const cashfreeVerify = async (req, res) => {

  const data = req.body;

  try {

    const order_id = data.data.order.order_id;
    const cf_payment_id = data.data.payment.cf_payment_id;
    if (data.data.payment.payment_status === "SUCCESS") {
      const options = {
        method: "GET",
        url: `https://api.cashfree.com/pg/orders/${order_id}`,
        headers: {
          accept: "application/json",
          "x-client-id": process.env.cashfree_id,
          "x-client-secret": process.env.cashfree_secret,
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01"

        },

      };

      axios
        .request(options)
        .then(async function (response) {

          if (response.data.order_status == "PAID") {
            const clientId = order_id;

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

            try {



              const tempTran = await Trans.findOne({
                id: clientId,
                status: "created",
              });
              if (tempTran) {
                const lastTransId = await Trans.findOne(
                  { id: clientId },
                  { number: 1, userId: 1, amount: 1 }
                );
                var amount = lastTransId.amount;
                const updatedDoc = await Trans.findOneAndUpdate(
                  { id: clientId, status: 'created' },
                  { status: 'success', expired: true, $inc: { __v: 1 } },
                  { new: true, runValidators: true }
                );

                if (updatedDoc) {
                  const user = await User.findOne({ id: lastTransId.userId });
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
                    if (amount > 4999) {
                      const bonus = (amount * 10) / 100;
                      bonusAmount = amount + bonus;
                    }
                    await User.updateOne(
                      { id: user.id },
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

                    const level0profit = (amount * 9) / 100;
                    const level1profit = (amount * 4) / 100;
                    const level2profit = (amount * 3) / 100;


                    user.upLine.forEach(async (element, index) => {
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
                    });
                  } else {
                    var bonus;
                    var bonusAmount = amount;
                    // if (amount > 200) {
                    //    bonus = (amount * 5) / 100;
                    //   bonusAmount = amount + bonus;
                    // }
                    await User.updateOne(
                      { id: user.id },
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
                    const level0profit = (amount * 9) / 100;
                    const level1profit = (amount * 4) / 100;
                    const level2profit = (amount * 3) / 100;

                    user.upLine.forEach(async (element, index) => {
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
                  const useryear = newuserDate.getFullYear();

                  const userdayMonth = `${userday}/${usermonth}/${useryear}`;
                  const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
                  const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
                  const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

                  const phone0recharge = `level0.${user.phone}.totalRecharge`;
                  const phone1recharge = `level1.${user.phone}.totalRecharge`;
                  const phone2recharge = `level2.${user.phone}.totalRecharge`;

                  const phone0first = `level0.${user.phone}.firstRecharge`;
                  const phone1first = `level1.${user.phone}.firstRecharge`;
                  const phone2first = `level2.${user.phone}.firstRecharge`;

                  if (dayMonth === userdayMonth) {
                    if (user.upLine !== null) {
                      if (user.upLine[0].length !== 0) {
                        await promotion.updateOne(
                          { userId: user.upLine[0] ?? 1 },
                          {
                            userId: user.upLine[0] ?? 1,
                            $inc: {
                              [newphone0recharge]: amount,
                            },
                          },
                          { upsert: true }
                        );
                      }
                      if (user.upLine.length === 2) {
                        if (user.upLine[1].length !== 0) {
                          await promotion.updateOne(
                            { userId: user.upLine[1] ?? 1 },
                            {
                              userId: user.upLine[1] ?? 1,
                              $inc: {
                                [newphone1recharge]: amount,
                              },
                            },
                            { upsert: true }
                          );
                        }
                      }
                      if (user.upLine.length === 3) {
                        if (user.upLine[1].length !== 0) {
                          await promotion.updateOne(
                            { userId: user.upLine[1] ?? 1 },
                            {
                              userId: user.upLine[1] ?? 1,
                              $inc: {
                                [newphone1recharge]: amount,
                              },
                            },
                            { upsert: true }
                          );
                        }

                        if (user.upLine[2].length !== 0) {
                          await promotion.updateOne(
                            { userId: user.upLine[2] ?? 1 },
                            {
                              userId: user.upLine[2] ?? 1,
                              $inc: {
                                [newphone2recharge]: amount,
                              },
                            },
                            { upsert: true }
                          );
                        }
                      }
                    }
                  }

                  if (user.upLine !== null) {
                    if (user.upLine[0].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[0] ?? 1 },
                        {
                          userId: user.upLine[0] ?? 1,
                          $inc: {
                            [phone0first]: firstRecharge,
                            [phone0recharge]: amount,
                          },
                        },
                        { upsert: true }
                      );
                    }
                    if (user.upLine.length === 2) {
                      if (user.upLine[1].length !== 0) {
                        await promotion.updateOne(
                          { userId: user.upLine[1] ?? 1 },
                          {
                            userId: user.upLine[1] ?? 1,
                            $inc: {
                              [phone1first]: firstRecharge,
                              [phone1recharge]: amount,
                            },
                          },
                          { upsert: true }
                        );
                      }
                    }
                    if (user.upLine.length === 3) {
                      if (user.upLine[1].length !== 0) {
                        await promotion.updateOne(
                          { userId: user.upLine[1] ?? 1 },
                          {
                            userId: user.upLine[1] ?? 1,
                            $inc: {
                              [phone1first]: firstRecharge,
                              [phone1recharge]: amount,
                            },
                          },
                          { upsert: true }
                        );
                      }

                      if (user.upLine[2].length !== 0) {
                        await promotion.updateOne(
                          { userId: user.upLine[2] ?? 1 },
                          {
                            userId: user.upLine[2] ?? 1,
                            $inc: {
                              [phone2first]: firstRecharge,
                              [phone2recharge]: amount,
                            },
                          },
                          { upsert: true }
                        );
                      }
                    }
                  }

                  res.status(200).json({ status: 'ok' });

                } else {
                  res.status(200).send('done');
                }
              } else {
                res.status(200).send("done");
              }

            } catch (error) {
              console.log(error.message);
              res.status(200).send("done");
            }
          }

        }).catch(function (error) {

        })
    }








    //console.log("Payment verification successful");

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }

}
export const razorpayCreateOrder = async (req, res) => {

  try {
    const { amount, currency, receipt, notes } = req.body;
    const userId = req.params.id;
    const options = {
      amount: amount * 100, // Convert amount to paise
      currency: "INR",
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);

    // Read current orders, add new order, and write back to the file
    // const orders = readData();
    // orders.push({
    //   order_id: order.id,
    //   amount: order.amount,
    //   currency: order.currency,
    //   receipt: order.receipt,
    //   status: 'created',
    // });
    // writeData(orders);
    const lastTrans = await Trans.findOne().sort({ number: -1 });
    const newIncreament = lastTrans.number + 1;
    await Trans.create({
      id: order.id,
      number: newIncreament,
      date: Date.now(),
      userId,
      gateway: "Razorpay",
      amount: amount,
      status: "created",
    });

    res.json(order); // Send order details to frontend, including order ID
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
}
export const razorpayVerify = async (req, res) => {



  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.razLive;
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
    if (isValidSignature) {
      // Update the order with payment details

      // const orders = readData();
      // const order = orders.find(o => o.order_id === razorpay_order_id);
      // if (order) {
      //   order.status = 'paid';
      //   order.payment_id = razorpay_payment_id;
      //   writeData(orders);
      // }
      const clientId = razorpay_order_id;

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

      try {



        const tempTran = await Trans.findOne({
          id: clientId,
          status: "created",
        });
        if (tempTran) {
          const lastTransId = await Trans.findOne(
            { id: clientId },
            { number: 1, userId: 1, amount: 1 }
          );
          var amount = lastTransId.amount;
          const updatedDoc = await Trans.findOneAndUpdate(
            { id: clientId, status: 'created' },
            { status: 'success', expired: true, $inc: { __v: 1 } },
            { new: true, runValidators: true }
          );

          if (updatedDoc) {
            const user = await User.findOne({ id: lastTransId.userId });
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
              if (amount > 4999) {
                const bonus = (amount * 10) / 100;
                bonusAmount = amount + bonus;
              }
              await User.updateOne(
                { id: user.id },
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

              const level0profit = (amount * 9) / 100;
              const level1profit = (amount * 4) / 100;
              const level2profit = (amount * 3) / 100;


              user.upLine.forEach(async (element, index) => {
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
              });
            } else {
              var bonus;
              var bonusAmount = amount;
              // if (amount > 200) {
              //    bonus = (amount * 5) / 100;
              //   bonusAmount = amount + bonus;
              // }
              await User.updateOne(
                { id: user.id },
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
              const level0profit = (amount * 9) / 100;
              const level1profit = (amount * 4) / 100;
              const level2profit = (amount * 3) / 100;

              user.upLine.forEach(async (element, index) => {
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
            const useryear = newuserDate.getFullYear();

            const userdayMonth = `${userday}/${usermonth}/${useryear}`;
            const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

            const phone0recharge = `level0.${user.phone}.totalRecharge`;
            const phone1recharge = `level1.${user.phone}.totalRecharge`;
            const phone2recharge = `level2.${user.phone}.totalRecharge`;

            const phone0first = `level0.${user.phone}.firstRecharge`;
            const phone1first = `level1.${user.phone}.firstRecharge`;
            const phone2first = `level2.${user.phone}.firstRecharge`;

            if (dayMonth === userdayMonth) {
              if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[0] ?? 1 },
                    {
                      userId: user.upLine[0] ?? 1,
                      $inc: {
                        [newphone0recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }

                  if (user.upLine[2].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [newphone2recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }
            }

            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[0] ?? 1 },
                  {
                    userId: user.upLine[0] ?? 1,
                    $inc: {
                      [phone0first]: firstRecharge,
                      [phone0recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }

                if (user.upLine[2].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[2] ?? 1 },
                    {
                      userId: user.upLine[2] ?? 1,
                      $inc: {
                        [phone2first]: firstRecharge,
                        [phone2recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }

            res.status(200).json({ status: 'ok' });

          } else {
            res.status(200).send('done');
          }
        } else {
          res.status(200).send("done");
        }

      } catch (error) {
        console.log(error.message);
        res.status(200).send("done");
      }

      //console.log("Payment verification successful");
    } else {
      res.status(400).json({ status: 'verification_failed' });
      console.log("Payment verification failed");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }

}
export const phonepePGEcom = async (req, res, next) => {

  const amount = parseInt(req.body.totalPrice);

  const id = Math.random().toString(16).slice(2);
  const index = 1;
  const key = process.env.phonepe;
  const data = {
    merchantId: "M22JSDQOQ5AZ2",
    merchantTransactionId: id,
    amount: amount * 100,
    merchantUserId: id,

    redirectUrl: `https://vgaserver-679685875451.asia-south1.run.app/phonepepgredirect/${id}/${id}`,
    redirectMode: "POST",
    callbackUrl: "https://vgaserver-679685875451.asia-south1.run.app/processphonepepg",
    paymentInstrument: {
      type: "PAY_PAGE",
    },

    mobileNumber: 8889875410,
  };
  const base64 = Buffer.from(JSON.stringify(data)).toString("base64");

  const hash = createHash("sha256")
    .update(`${base64}/pg/v1/pay${key}`)
    .digest("hex");
  //const back = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));

  const options = {
    method: "POST",
    url: "https://api.phonepe.com/apis/hermes/pg/v1/pay",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": `${hash}###${index}`,
    },
    data: { request: base64 },
  };

  axios
    .request(options)
    .then(async function (response) {
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncreament = lastTrans.number + 1;


      res.status(200).send(response.data.data.instrumentResponse.redirectInfo);
    })
    .catch(function (error) {
      console.log(error);
      return next(new ErrorResponse(error.message, 400));
    });
};


export const phonepePG = async (req, res, next) => {
  const userId = req.body.userId;
  const amount = parseInt(req.body.amount) ?? 200;
  const phone = req.body.phone;
  const id = Math.random().toString(16).slice(2);
  const index = 1;
  const key = process.env.phonepe;
  const data = {
    merchantId: "M22JSDQOQ5AZ2",
    merchantTransactionId: id,
    amount: amount * 100,
    merchantUserId: userId,

    redirectUrl: `https://vgaserver-679685875451.asia-south1.run.app/phonepepgredirect/${id}/${userId}`,
    redirectMode: "POST",
    callbackUrl: "https://vgaserver-679685875451.asia-south1.run.app/processphonepepg",
    paymentInstrument: {
      type: "PAY_PAGE",
    },

    mobileNumber: phone,
  };
  const base64 = Buffer.from(JSON.stringify(data)).toString("base64");

  const hash = createHash("sha256")
    .update(`${base64}/pg/v1/pay${key}`)
    .digest("hex");
  //const back = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));

  const options = {
    method: "POST",
    url: "https://api.phonepe.com/apis/hermes/pg/v1/pay",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": `${hash}###${index}`,
    },
    data: { request: base64 },
  };

  axios
    .request(options)
    .then(async function (response) {
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncreament = lastTrans.number + 1;
      await Trans.create({
        id: id,
        number: newIncreament,
        date: Date.now(),
        userId,
        gateway: "PhonePe",
        amount: amount,
        status: "created",
      });
      console.log(response.data)
      res.status(200).send(response.data.data.instrumentResponse.redirectInfo);
    })
    .catch(function (error) {
      console.log(error);
      return next(new ErrorResponse(error.message, 400));
    });
};

export const phonepepgredirect = async (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const response = req.body;

  const user = await User.findOne({ id: userId }, { token: 1 });
  res.redirect(
    `https://CHOUHANKRItechnologies.online/placeOrder/${userId}/${user.token}`
  );
};

export const checkPhonePeStatus = async (req, res) => {
  if (req.params.id === "vcjhefcywe556ffd") {
    const index = 1;
    const key = process.env.phonepe;

    const merchantId = "M22JSDQOQ5AZ2";

    const getTrans = await Trans.find({
      gateway: "PhonePe",
      status: "created",
    }).sort({ createDate: -1 });
    getTrans.forEach((element) => {
      const hash = createHash("sha256")
        .update(`/pg/v1/status/${merchantId}/${element.id}${key}`)
        .digest("hex");
      const options = {
        method: "GET",
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${element.id}`,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": `${hash}###${index}`,
          "X-MERCHANT-ID": merchantId,
        },
      };

      // {
      //   success: true,
      //   code: 'PAYMENT_SUCCESS',
      //   message: 'Your payment is successful.',
      //   data: {
      //     merchantId: 'TODDAPPLEGAMINGONLINE',
      //     merchantTransactionId: '91fccfd629a5',
      //     transactionId: 'T2304101118253473546960',
      //     amount: 100,
      //     state: 'COMPLETED',
      //     responseCode: 'PAYMENT_SUCCESS',
      //     paymentInstrument: {
      //       type: 'CARD',
      //       cardType: 'DEBIT_CARD',
      //       pgTransactionId: '17151745268',
      //       bankTransactionId: null,
      //       pgAuthorizationCode: 'UNI000',
      //       arn: null,
      //       bankId: 'PUNB'
      //     }
      //   }
      // }

      axios
        .request(options)
        .then(async function (response) {
          const result = response.data;

          if (result.success) {
            if (result.code === "PAYMENT_SUCCESS") {
              if (result.data.state === "COMPLETED") {
                var amount = result.data.amount / 100;
                const user = await User.findOne({ id: element.userId });
                var firstRecharge = 0;
                await Trans.updateOne(
                  { id: element.id },
                  { status: "success", date: Date.now(), expired: true }
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
                  await offerBonus.updateOne(
                    { userId: user.upLine[0] },
                    {
                      userId: user.upLine[0],
                      $inc: { amount: +151 },
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
                  if (amount > 4999) {
                    const bonus = (amount * 10) / 100;
                    amount = amount + bonus;
                  }
                  await User.updateOne(
                    { id: user.id },
                    {
                      firstRecharge: true, $inc: { balance: +amount },
                      $push: {
                        rechargeHistory: {
                          amount: amount,
                          date: Date.now(),
                          status: "Success",
                        },
                        walletHistory: {
                          amount: amount,
                          date: Date.now(),
                          credit: true,
                          note: `Add money ID: ${element.number}`,
                        },
                      },
                    }
                  );
                } else {
                  var bonus;
                  if (amount > 4999) {
                    bonus = (amount * 10) / 100;
                    amount = amount + bonus;
                  }
                  await User.updateOne(
                    { id: user.id },
                    {
                      firstRecharge: true, $inc: { balance: +amount },
                      $push: {
                        rechargeHistory: {
                          amount: amount,
                          date: Date.now(),
                          status: "Success",
                        },
                        walletHistory: {
                          amount: amount,
                          date: Date.now(),
                          credit: true,
                          note: `Add money ID: ${element.number}`,
                        },
                      },
                    }
                  );
                  // await User.updateOne(
                  //   { id: user.upLine[0] },
                  //   {
                  //     $inc: { balance: bonus },

                  //   }
                  // );
                  // await offerBonus.updateOne(
                  //   { userId: user.upLine[0] },
                  //   {
                  //     userId: user.upLine[0],
                  //     $inc: { amount: +bonus },
                  //     $push: {
                  //       history: {
                  //         credit: "wallet",
                  //         amount: bonus,
                  //         note: `Recharge bonus: ${element.number}`,
                  //         date: Date.now(),
                  //       },
                  //     },
                  //   },
                  //   {upsert: true}
                  // );
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
                const useryear = newuserDate.getFullYear();

                const userdayMonth = `${userday}/${usermonth}/${useryear}`;
                const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
                const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
                const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

                const phone0recharge = `level0.${user.phone}.totalRecharge`;
                const phone1recharge = `level1.${user.phone}.totalRecharge`;
                const phone2recharge = `level2.${user.phone}.totalRecharge`;

                const phone0first = `level0.${user.phone}.firstRecharge`;
                const phone1first = `level1.${user.phone}.firstRecharge`;
                const phone2first = `level2.${user.phone}.firstRecharge`;

                if (dayMonth === userdayMonth) {
                  if (user.upLine !== null) {
                    if (user.upLine[0].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[0] ?? 1 },
                        {
                          userId: user.upLine[0] ?? 1,
                          $inc: {
                            [newphone0recharge]: amount,
                          },
                        },
                        { upsert: true }
                      );
                    }
                    if (user.upLine.length === 2) {
                      if (user.upLine[1].length !== 0) {
                        await promotion.updateOne(
                          { userId: user.upLine[1] ?? 1 },
                          {
                            userId: user.upLine[1] ?? 1,
                            $inc: {
                              [newphone1recharge]: amount,
                            },
                          },
                          { upsert: true }
                        );
                      }
                    }
                    if (user.upLine.length === 3) {
                      if (user.upLine[1].length !== 0) {
                        await promotion.updateOne(
                          { userId: user.upLine[1] ?? 1 },
                          {
                            userId: user.upLine[1] ?? 1,
                            $inc: {
                              [newphone1recharge]: amount,
                            },
                          },
                          { upsert: true }
                        );
                      }

                      if (user.upLine[2].length !== 0) {
                        await promotion.updateOne(
                          { userId: user.upLine[2] ?? 1 },
                          {
                            userId: user.upLine[2] ?? 1,
                            $inc: {
                              [newphone2recharge]: amount,
                            },
                          },
                          { upsert: true }
                        );
                      }
                    }
                  }
                }

                if (user.upLine !== null) {
                  if (user.upLine[0].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[0] ?? 1 },
                      {
                        userId: user.upLine[0] ?? 1,
                        $inc: {
                          [phone0first]: firstRecharge,
                          [phone0recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                  if (user.upLine.length === 2) {
                    if (user.upLine[1].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[1] ?? 1 },
                        {
                          userId: user.upLine[1] ?? 1,
                          $inc: {
                            [phone1first]: firstRecharge,
                            [phone1recharge]: amount,
                          },
                        },
                        { upsert: true }
                      );
                    }
                  }
                  if (user.upLine.length === 3) {
                    if (user.upLine[1].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[1] ?? 1 },
                        {
                          userId: user.upLine[1] ?? 1,
                          $inc: {
                            [phone1first]: firstRecharge,
                            [phone1recharge]: amount,
                          },
                        },
                        { upsert: true }
                      );
                    }

                    if (user.upLine[2].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[2] ?? 1 },
                        {
                          userId: user.upLine[2] ?? 1,
                          $inc: {
                            [phone2first]: firstRecharge,
                            [phone2recharge]: amount,
                          },
                        },
                        { upsert: true }
                      );
                    }
                  }
                }
              }
            }
          } else {
            var diff = 300;
            const lastTime = element.date / 1000;
            const currentTime = new Date();
            const currentEpoch = currentTime.getTime() / 1000;
            diff = currentEpoch - lastTime;
            if (diff > 300) {
              await Trans.updateOne(
                { number: element.number },
                { status: "expired", expired: true }
              );
            }
          }
        })
        .catch(function (error) {
          console.log("not found");
        });
    });
  }

  res.status(200).send("Done");
};

export const processphonepePG = async (req, res) => {
  const index = 1;
  const key = process.env.phonepe;
  const merchantId = "M22JSDQOQ5AZ2";
  const response = req.body.response;
  const back = JSON.parse(Buffer.from(response, "base64").toString("utf-8"));
  const mtid = back.data.merchantTransactionId;
  var amount = back.data.amount / 100;
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

  if (back.success) {
    if (back.code === "PAYMENT_SUCCESS") {
      if (back.data.state === "COMPLETED") {
        const fetchTransaction = await Trans.findOne({
          id: mtid,
          status: "created",
          expired: false,
        });
        if (fetchTransaction) {
          const hash = createHash("sha256")
            .update(`/pg/v1/status/${merchantId}/${mtid}${key}`)
            .digest("hex");
          const options = {
            method: "GET",
            url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${mtid}`,
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              "X-VERIFY": `${hash}###${index}`,
              "X-MERCHANT-ID": merchantId,
            },
          };

          axios.request(options).then(async function (response) {
            const result = response.data;
            if (result.success) {
              if (result.code === "PAYMENT_SUCCESS") {
                if (result.data.state === "COMPLETED") {
                  await daily.updateOne(
                    { id: newDate },
                    { $inc: { count: +1, amount: amount } },
                    { upsert: true }
                  );
                  amount = result.data.amount / 100;

                  const user = await User.findOne({
                    id: fetchTransaction.userId,
                  });
                  var firstRecharge = 0;
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
                            note: `Add money ID: ${fetchTransaction.number}`,
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
                  } else {
                    var bonusAmount = amount;
                    var bonus;
                    if (amount > 200) {
                      bonus = (amount * 3) / 100;
                      bonusAmount = amount + bonus;
                    }
                    await User.updateOne(
                      { id: user.id },
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
                            note: `Add money ID: ${fetchTransaction.number}`,
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
                    // await User.updateOne(
                    //   { id: user.upLine[0] },
                    //   {
                    //     $inc: { balance: bonus },

                    //   }
                    // );
                    // await offerBonus.updateOne(
                    //   { userId: user.upLine[0] },
                    //   {
                    //     userId: user.upLine[0],
                    //     $inc: { amount: +bonus },
                    //     $push: {
                    //       history: {
                    //         credit: "wallet",
                    //         amount: bonus,
                    //         note: `Recharge bonus: ${fetchTransaction.number}`,
                    //         date: Date.now(),
                    //       },
                    //     },
                    //   },
                    //   {upsert: true}
                    // );
                  }
                  await Trans.updateOne(
                    { id: fetchTransaction.id },
                    { status: "success", date: Date.now(), expired: true }
                  );
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
                }
              }
            }
          });
        }
      }
    }
  }

  res.status(200).send("done");
};

export const createQRTrans = async (req, res) => {
  const key = "2ade2a01-1954-45f9-ab67-5d757a875f7d";
  const client_txn_id = Math.random().toString(16).slice(2);
  const amount = req.body.amount;
  const p_info = req.body.p_info;
  const userId = req.body.userId;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const redirect_url = req.body.redirect_url;
  const app = req.body.app;

  const getUpi = await extra.findOne();
  const lastTrans = await Trans.findOne().sort({ number: -1 });
  const newIncreament = lastTrans.number + 1;
  var link = "";
  if (amount < getUpi.upi.limit.value) {
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
    await Trans.create({
      id: client_txn_id,
      number: newIncreament,
      date: Date.now(),
      userId,
      amount: amount.toString(),
      status: "created",
      name: customer_name,
      email: customer_email,
      phone: customer_mobile,
      key: {
        id: 8120441687,
        key: "2ade2a01-1954-45f9-ab67-5d757a875f7d"
      }
    });

    link = createOrder.data.data.payment_url;
  } else {


    var randomValue = Math.floor(Math.random() * 10) + 1;
    var newAmount = amount - randomValue;



    var upis = [];
    var upi = "";
    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }
    var agents = getUpi.upi.v4.agent;
    var keys = Object.keys(agents);

    var acitveAgents = [];
    var upis = [];

    for (var i = 0; i < keys.length; i++) {
      if (getUpi.upi.v4.agent[keys[i]].active) {
        acitveAgents.push(keys[i]);
      }
    }

    if (acitveAgents.length != 0) {
      for (var i = 0; i < acitveAgents.length; i++) {
        agents[`${acitveAgents[i]}`].upis.forEach((element) => {
          upis.push({ agent: acitveAgents[i], upi: element });
        });
      }
    } else {

      upis.push({ agent: keys[0], upi: getUpi.upi.v4.agent[keys[0]].upis[0] });

    }
    shuffleArray(upis);


    upi = upis[0].upi;
    // if (amount <= 5000) {
    //   function shuffleArray(array) {
    //     for (var i = array.length - 1; i > 0; i--) {
    //       var j = Math.floor(Math.random() * (i + 1));
    //       var temp = array[i];
    //       array[i] = array[j];
    //       array[j] = temp;
    //     }
    //   }

    //   const arr = getUpi.upi.arr1;
    //   shuffleArray(arr);
    //   upi = arr[0];
    // }
    // if (amount <= 15000 && amount > 5000) {
    //   function shuffleArray(array) {
    //     for (var i = array.length - 1; i > 0; i--) {
    //       var j = Math.floor(Math.random() * (i + 1));
    //       var temp = array[i];
    //       array[i] = array[j];
    //       array[j] = temp;
    //     }
    //   }
    //   const arr = getUpi.upi.arr2;
    //   shuffleArray(arr);
    //   upi = arr[0];
    // }
    // if (amount <= 30000 && amount > 15000) {
    //   function shuffleArray(array) {
    //     for (var i = array.length - 1; i > 0; i--) {
    //       var j = Math.floor(Math.random() * (i + 1));
    //       var temp = array[i];
    //       array[i] = array[j];
    //       array[j] = temp;
    //     }
    //   }
    //   const arr = getUpi.upi.arr3;
    //   shuffleArray(arr);
    //   upi = arr[0];
    // }
    // if (amount > 30000) {
    //   function shuffleArray(array) {
    //     for (var i = array.length - 1; i > 0; i--) {
    //       var j = Math.floor(Math.random() * (i + 1));
    //       var temp = array[i];
    //       array[i] = array[j];
    //       array[j] = temp;
    //     }
    //   }
    //   const arr = getUpi.upi.arr4;
    //   shuffleArray(arr);
    //   upi = arr[0];
    // }
    await Trans.create({
      gateway: "QR",
      createDate: Date.now(),
      date: Date.now(),
      userId,
      amount: newAmount,
      number: newIncreament,
      status: "created",
      phone: customer_mobile,
      agent: upis[0].agent,
      upi: upi,
    });
    link = `upi://pay?pa=${upi}&pn=${getUpi.upi.pn}&am=${newAmount}&cu=INR&mc=5411`;

    if (app === "phonepe") {
      link = `phonepe://pay?pa=${upi}&pn=${getUpi.upi.pn}&am=${newAmount}&cu=INR&mc=5411`;
    }
    if (app === "upi") {
      link = `upi://pay?pa=${upi}&pn=${getUpi.upi.pn}&am=${newAmount}&cu=INR&mc=5411`;
    }
    if (app === "gpay") {
      link = `tez://upi/pay?pa=${upi}&pn=${getUpi.upi.pn}&am=${newAmount}&cu=INR&mc=5411`;
    }
    if (app === "paytm") {
      link = `paytmmp://pay?pa=${upi}&pn=${getUpi.upi.pn}&am=${newAmount}&cu=INR&mc=5411`;
    }
  }



  res.status(200).send({ link: link });
};

export const getRecentRecharge = async (req, res) => {
  const userId = req.params.id;
  // Sort by date so all gateways (WatchPay, RupeeRush, etc.) show in history even without createDate
  const getRecharge = await Trans.find({ userId }).sort({ date: -1 }).limit(50);
  return res.status(200).send(getRecharge);
}
export const getShuffleUPI = async (req, res) => {
  const getUpi = await extra.findOne();

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
  var agents = getUpi.upi.v2.agent;
  var keys = Object.keys(agents);

  var acitveAgents = [];
  var upis = [];

  for (var i = 0; i < keys.length; i++) {
    if (getUpi.upi.v2.agent[keys[i]].active) {
      acitveAgents.push(keys[i]);
    }
  }

  if (acitveAgents.length != 0) {
    for (var i = 0; i < acitveAgents.length; i++) {
      agents[`${acitveAgents[i]}`].upis.forEach((element) => {
        upis.push({ agent: acitveAgents[i], upi: element });
      });
    }
  } else {
    getUpi.upi.v2.upis.forEach((element) => {
      upis.push({ upi: element });
    });
  }
  shuffleArray(upis);

  res.status(200).send([upis[0], upis[1], upis[2]]);
};

export const getShuffleUPIV4 = async (req, res) => {
  const getUpi = await extra.findOne();

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
  var agents = getUpi.upi.v2.agent;
  var keys = Object.keys(agents);

  var acitveAgents = [];
  var upis = [];

  for (var i = 0; i < keys.length; i++) {
    if (getUpi.upi.v2.agent[keys[i]].active) {
      acitveAgents.push(keys[i]);
    }
  }

  if (acitveAgents.length != 0) {
    for (var i = 0; i < acitveAgents.length; i++) {
      agents[`${acitveAgents[i]}`].upis.forEach((element) => {
        upis.push({ agent: acitveAgents[i], upi: element });
      });
    }
  } else {
    getUpi.upi.v2.upis.forEach((element) => {
      upis.push({ upi: element });
    });
  }
  shuffleArray(upis);

  res.status(200).send([upis[0], upis[1], upis[2]]);
};

export const submitUTR = async (req, res) => {
  const amount = req.body.amount;
  const userId = req.body.userId;
  const customer_mobile = req.body.customer_mobile;
  const upi = req.body.upi;
  const utr = req.body.utr;
  const lastTrans = await Trans.findOne().sort({ number: -1 });
  const newIncreament = lastTrans.number + 1;

  await Trans.create({
    gateway: "QR",
    createDate: Date.now(),
    userId: userId,
    amount: amount,
    number: newIncreament,
    status: "created",
    phone: customer_mobile,
    upi: upi.upi,
    utr,
    agent: upi?.agent ?? 'toddRecharge',
  });

  res.status(200).send('done');
};

export const getPendingTransaction = async (req, res) => {
  const api = req.params.api;

  if (api === process.env.AdminAPI) {
    const getTrans = await Trans.find({
      status: "created",
      gateway: "UPI",
    }).sort({ date: -1 });
    res.status(200).send(getTrans);
  } else {
    res.status(200).send("done");
  }
};

export const updatePendingTransaction = async (req, res) => {
  // const api = req.params.api;
  // const status = req.params.status;
  // const id = req.params.id;
  // if (api === process.env.AdminAPI) {
  //   if (status === "approve") {
  //     const tempTran = await Trans.findOne({ _id: id, status: "success" });
  //     if (!tempTran) {
  //       const getTran = await Trans.findOne({ _id: id });
  //       var amount = getTran.amount;
  //       await Trans.updateOne(
  //         { _id: id },
  //         { status: "success", expired: true }
  //       );
  //       //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
  //       const user = await User.findOne({ id: getTran.userId });
  //       var firstRecharge = 0;
  //       if (!user.firstRecharge) {
  //         firstRecharge = amount;
  //         await User.updateOne(
  //           { id: user.upLine[0] },
  //           {
  //             $inc: { balance: +151 },
  //             $push: {
  //               walletHistory: {
  //                 amount: 151,
  //                 date: Date.now(),
  //                 credit: true,
  //                 note: `Referal Reward User: ${user.id}`,
  //               },
  //             },
  //           }
  //         );
  //         if (amount > 4999) {
  //           const bonus = (amount * 10) / 100;
  //           amount = amount + bonus;
  //         }
  //       }
  //       await User.updateOne(
  //         { id: getTran.userId },
  //         { firstRecharge: true, $inc: { balance: +amount } }
  //       );

  //       await User.updateOne(
  //         { id: getTran.userId },
  //         {
  //           $push: {
  //             rechargeHistory: {
  //               amount: amount,
  //               date: Date.now(),
  //               status: "Success",
  //             },
  //             walletHistory: {
  //               amount: amount,
  //               date: Date.now(),
  //               credit: true,
  //               note: `Add money ID: ${getTran.number}`,
  //             },
  //           },
  //         }
  //       );
  //       const userDate = new Date(user.date);
  //       const userDateLocal = (userDate / 1000 + 19800) * 1000;
  //       const newuserDate = new Date(userDateLocal);
  //       const abhiDate = new Date();
  //       const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
  //       const newabhirDate = new Date(abhiDateLocal);
  //       const day = newabhirDate.getDate();
  //       const month = newabhirDate.getMonth() + 1;
  //       const dayMonth = `${day}/${month}`;

  //       const userday = newuserDate.getDate();
  //       const usermonth = newuserDate.getMonth() + 1;
  //       const userdayMonth = `${userday}/${usermonth}`;
  //       const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
  //       const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
  //       const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

  //       const phone0recharge = `level0.${user.phone}.totalRecharge`;
  //       const phone1recharge = `level1.${user.phone}.totalRecharge`;
  //       const phone2recharge = `level2.${user.phone}.totalRecharge`;

  //       const phone0first = `level0.${user.phone}.firstRecharge`;
  //       const phone1first = `level1.${user.phone}.firstRecharge`;
  //       const phone2first = `level2.${user.phone}.firstRecharge`;

  //       if (dayMonth === userdayMonth) {
  //         if (user.upLine !== null) {
  //           if (user.upLine[0].length !== 0) {
  //             await promotion.updateOne(
  //               { userId: user.upLine[0] ?? 1 },
  //               {
  //                 userId: user.upLine[0] ?? 1,
  //                 $inc: {
  //                   [newphone0recharge]: amount,
  //                 },
  //               },
  //               { upsert: true }
  //             );
  //           }
  //           if (user.upLine.length === 2) {
  //             if (user.upLine[1].length !== 0) {
  //               await promotion.updateOne(
  //                 { userId: user.upLine[1] ?? 1 },
  //                 {
  //                   userId: user.upLine[1] ?? 1,
  //                   $inc: {
  //                     [newphone1recharge]: amount,
  //                   },
  //                 },
  //                 { upsert: true }
  //               );
  //             }
  //           }
  //           if (user.upLine.length === 3) {
  //             if (user.upLine[1].length !== 0) {
  //               await promotion.updateOne(
  //                 { userId: user.upLine[1] ?? 1 },
  //                 {
  //                   userId: user.upLine[1] ?? 1,
  //                   $inc: {
  //                     [newphone1recharge]: amount,
  //                   },
  //                 },
  //                 { upsert: true }
  //               );
  //             }

  //             if (user.upLine[2].length !== 0) {
  //               await promotion.updateOne(
  //                 { userId: user.upLine[2] ?? 1 },
  //                 {
  //                   userId: user.upLine[2] ?? 1,
  //                   $inc: {
  //                     [newphone2recharge]: amount,
  //                   },
  //                 },
  //                 { upsert: true }
  //               );
  //             }
  //           }
  //         }
  //       }

  //       if (user.upLine !== null) {
  //         if (user.upLine[0].length !== 0) {
  //           await promotion.updateOne(
  //             { userId: user.upLine[0] ?? 1 },
  //             {
  //               userId: user.upLine[0] ?? 1,
  //               $inc: {
  //                 [phone0first]: firstRecharge,
  //                 [phone0recharge]: amount,
  //               },
  //             },
  //             { upsert: true }
  //           );
  //         }
  //         if (user.upLine.length === 2) {
  //           if (user.upLine[1].length !== 0) {
  //             await promotion.updateOne(
  //               { userId: user.upLine[1] ?? 1 },
  //               {
  //                 userId: user.upLine[1] ?? 1,
  //                 $inc: {
  //                   [phone1first]: firstRecharge,
  //                   [phone1recharge]: amount,
  //                 },
  //               },
  //               { upsert: true }
  //             );
  //           }
  //         }
  //         if (user.upLine.length === 3) {
  //           if (user.upLine[1].length !== 0) {
  //             await promotion.updateOne(
  //               { userId: user.upLine[1] ?? 1 },
  //               {
  //                 userId: user.upLine[1] ?? 1,
  //                 $inc: {
  //                   [phone1first]: firstRecharge,
  //                   [phone1recharge]: amount,
  //                 },
  //               },
  //               { upsert: true }
  //             );
  //           }

  //           if (user.upLine[2].length !== 0) {
  //             await promotion.updateOne(
  //               { userId: user.upLine[2] ?? 1 },
  //               {
  //                 userId: user.upLine[2] ?? 1,
  //                 $inc: {
  //                   [phone2first]: firstRecharge,
  //                   [phone2recharge]: amount,
  //                 },
  //               },
  //               { upsert: true }
  //             );
  //           }
  //         }
  //       }
  //     }
  //   } else {
  //     await Trans.updateOne({ _id: id }, { status: "expired", expired: true });
  //   }
  //   res.status(200).send("done");
  // } else {
  //   res.status(200).send("done");
  // }
  res.status(200).send("done");
};

export const toddRechargegetPendingTransaction = async (req, res) => {
  const api = req.params.api;

  if (api === process.env.ToddRecharge) {
    const getTrans = await Trans.find({
      status: "created",
      gateway: "QR",
      agent: 'toddRecharge',
    }).sort({ date: -1 });
    res.status(200).send(getTrans);
  } else {
    res.status(200).send("done");
  }
};
export const toddRechargegetPendingTransactionPaytm = async (req, res) => {
  const api = req.params.api;

  if (api === process.env.ToddRecharge) {
    const getTrans = await Trans.find({
      status: "created",
      gateway: "QR",

      agent: { $exists: false },
    }).sort({ date: -1 });
    res.status(200).send(getTrans);
  } else {
    res.status(200).send("done");
  }
};

export const toddRechargegetAllApprovedTransaction = async (req, res) => {
  const api = req.params.api;

  if (api === process.env.ToddRecharge) {
    const currentTime = new Date();
    const currentEpoch = currentTime.getTime() / 1000;
    const diff = (currentEpoch - 172800) * 1000;
    const getTrans = await Trans.find({
      status: "success",
      gateway: "QR",
      date: { $gt: diff },
    }).sort({ date: -1 });
    res.status(200).send(getTrans);
  } else {
    res.status(200).send("done");
  }
};

export const toddRechargeupdatePendingTransaction = async (req, res) => {
  const api = req.params.api;
  const status = req.params.status;
  const id = req.params.id;
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
  if (api === process.env.ToddRecharge) {
    if (status === "approve") {
      const tempTran = await Trans.findOne({ _id: id, status: "success" });
      if (!tempTran) {
        const getTran = await Trans.findOne({ _id: id });
        var amount = getTran.amount;
        await Trans.updateOne(
          { _id: id },
          { status: "success", expired: true }
        );
        //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
        const user = await User.findOne({ id: getTran.userId });
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
          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: { amount: +151 },
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
          if (amount > 4999) {
            const bonus = (amount * 10) / 100;
            amount = amount + bonus;
          }
          await User.updateOne(
            { id: getTran.userId },
            {
              firstRecharge: true, $inc: { balance: +amount },
              $push: {
                rechargeHistory: {
                  amount: amount,
                  date: Date.now(),
                  status: "Success",
                },
                walletHistory: {
                  amount: amount,
                  date: Date.now(),
                  credit: true,
                  note: `Add money ID: ${getTran.number}`,
                },
              },
            }
          );
        } else {

          const bonus = (amount * 5) / 100;
          amount = amount + bonus;
          await User.updateOne(
            { id: getTran.userId },
            {
              firstRecharge: true, $inc: { balance: +amount },
              $push: {
                rechargeHistory: {
                  amount: amount,
                  date: Date.now(),
                  status: "Success",
                },
                walletHistory: {
                  amount: amount,
                  date: Date.now(),
                  credit: true,
                  note: `Add money ID: ${getTran.number}`,
                },
              },
            }
          );
          await User.updateOne(
            { id: user.upLine[0] },
            {
              $inc: { balance: bonus },

            }
          );
          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: { amount: +bonus },
              $push: {
                history: {
                  credit: "wallet",
                  amount: bonus,
                  note: `Recharge bonus: ${user.id}`,
                  date: Date.now(),
                },
              },
            },
            { upsert: true }
          );
        }
        const userDate = new Date(user.date);
        const userDateLocal = (userDate / 1000 + 19800) * 1000;
        const newuserDate = new Date(userDateLocal);
        const abhiDate = new Date();
        const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
        const newabhirDate = new Date(abhiDateLocal);
        const day = newabhirDate.getDate();
        const month = newabhirDate.getMonth() + 1;
        const year = newabhirDate.getUTCFullYear();
        const dayMonth = `${day}/${month}/${year}`;

        const userday = newuserDate.getDate();
        const usermonth = newuserDate.getMonth() + 1;
        const useryear = newuserDate.getUTCFullYear();

        const userdayMonth = `${userday}/${usermonth}/${useryear}`;
        const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

        const phone0recharge = `level0.${user.phone}.totalRecharge`;
        const phone1recharge = `level1.${user.phone}.totalRecharge`;
        const phone2recharge = `level2.${user.phone}.totalRecharge`;

        const phone0first = `level0.${user.phone}.firstRecharge`;
        const phone1first = `level1.${user.phone}.firstRecharge`;
        const phone2first = `level2.${user.phone}.firstRecharge`;

        if (dayMonth === userdayMonth) {
          if (user.upLine !== null) {
            if (user.upLine[0].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] ?? 1 },
                {
                  userId: user.upLine[0] ?? 1,
                  $inc: {
                    [newphone0recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
            if (user.upLine.length === 2) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
            if (user.upLine.length === 3) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }

              if (user.upLine[2].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[2] ?? 1 },
                  {
                    userId: user.upLine[2] ?? 1,
                    $inc: {
                      [newphone2recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
        }

        if (user.upLine !== null) {
          if (user.upLine[0].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[0] ?? 1 },
              {
                userId: user.upLine[0] ?? 1,
                $inc: {
                  [phone0first]: firstRecharge,
                  [phone0recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
          if (user.upLine.length === 2) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
          if (user.upLine.length === 3) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            if (user.upLine[2].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[2] ?? 1 },
                {
                  userId: user.upLine[2] ?? 1,
                  $inc: {
                    [phone2first]: firstRecharge,
                    [phone2recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
        }
      }
    } else {
      await Trans.updateOne({ _id: id }, { status: "expired", expired: true });
    }
    res.status(200).send("done");
  } else {
    res.status(200).send("done");
  }
};

export const createPinWalletIntent = async (req, res) => {
  const client_txn_id = Math.random().toString(16).slice(2);
  const amount = req.body.amount;
  const p_info = req.body.p_info;
  const userId = req.body.userId;
  const customer_name = req.body.customer_name;
  const customer_email = req.body.customer_email;
  const customer_mobile = req.body.customer_mobile;
  const redirect_url = req.body.redirect_url;

  // const createToken = await axios.post(
  //   "https://app.pinwallet.in/api/token/create",
  //   {
  //     userName: "9644629469",
  //     password:
  //       "c8542699a0d9c1cfcde475f141ef0e807a60c01ead782ee483c6cb6b811ab13c",
  //   }
  // );

  const createOrder = await axios.post(
    "https://app.huntood.com/api/DyupiV2/V4/GenerateUPI",
    {
      Name: customer_name,
      ReferenceId: client_txn_id,
      Email: customer_email,
      Phone: customer_mobile,
      amount: amount,
    },
    {
      headers: {
        IPAddress: "3.7.234.129",
        AuthKey:
          "5e2d407dbead4e37cbe14e97738d5dcee7d415414529c60c10fd591c90695ffe",
      },
    }
  );

  if (createOrder.data.responseCode === 200) {
    const lastTrans = await Trans.findOne().sort({ number: -1 });
    const newIncreament = lastTrans.number + 1;
    await Trans.create({
      gateway: "PinWallet",
      txnId: createOrder.data.data.walletTransactionId,
      id: client_txn_id,
      number: newIncreament,
      date: Date.now(),
      userId,
      amount: amount,
      status: "created",
      name: customer_name,
      email: customer_email,
      phone: customer_mobile,
    });

    res.status(200).send({ link: createOrder.data.data.qr });
  } else {
    console.log(createOrder);
  }
};

export const pinWalletCallback = async (req, res) => {
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

  if (req.body.event === "Payout") {
    if (req.body.Data.Status === "SUCCESS") {
      const getPayout = await payout.findOne({
        id: req.body.Data.APITransactionId,
      });

      if (getPayout) {
        if (getPayout.status === "pending") {
          var amount = getPayout.amount;
          if (getPayout.type === "withdrawal") {
            await payout.updateOne(
              { id: req.body.Data.APITransactionId },
              { status: "success", rrn: req.body.Data.RRN }
            );
            await withdrawal.updateOne(
              { _id: getPayout.withdrawalId },
              {
                status: "Success",
                payout: req.body.Data.APITransactionId,
                txnId: req.body.Data.RRN,
              }
            );
            await User.updateOne(
              { id: getPayout.userId },
              {
                $push: {
                  walletHistory: {
                    credit: false,
                    amount,
                    note: `Redeem Successful ID: ${req.body.Data.APITransactionId}`,
                    date: Date.now(),
                  },
                },
              }
            );

            const user = await User.findOne({ id: getPayout.userId });
            const date = new Date();
            const localDate = (date / 1000 + 19800) * 1000;
            const newDatefor = new Date(localDate);
            const day = newDatefor.getDate();
            const month = newDatefor.getMonth() + 1;
            const year = newDatefor.getFullYear();

            const userDate = new Date(user.date);
            const userDateLocal = (userDate / 1000 + 19800) * 1000;
            const newuserDate = new Date(userDateLocal);

            const dayMonth = `${day}/${month}`;

            const userday = newuserDate.getDate();
            const usermonth = newuserDate.getMonth() + 1;
            const userdayMonth = `${userday}/${usermonth}`;
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

            const phone0with = `level0.${user.phone}.totalWithdrawal`;
            const phone1with = `level1.${user.phone}.totalWithdrawal`;
            const phone2with = `level2.${user.phone}.totalWithdrawal`;
            const newphone0with = `newlevel0.${dayMonth}.${user.phone}.todayWithdrawal`;
            const newphone1with = `newlevel1.${dayMonth}.${user.phone}.todayWithdrawal`;
            const newphone2with = `newlevel2.${dayMonth}.${user.phone}.todayWithdrawal`;

            if (dayMonth === userdayMonth) {
              if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[0] ?? 1 },
                    {
                      userId: user.upLine[0] ?? 1,
                      $inc: {
                        [newphone0with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }

                  if (user.upLine[2].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [newphone2with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }
            }

            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[0] ?? 1 },
                  {
                    userId: user.upLine[0] ?? 1,
                    $inc: {
                      [phone0with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }

                if (user.upLine[2].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[2] ?? 1 },
                    {
                      userId: user.upLine[2] ?? 1,
                      $inc: {
                        [phone2with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }
          } else {
            await payout.updateOne(
              { id: req.body.Data.APITransactionId },
              { status: "success", rrn: req.body.Data.RRN }
            );
          }
        }
      }
    }

    // console.log(req.body);
    // if(req.body.Data.Status === 'SUCCESS'){
    //   const findExist = await payout.findOne({id: })
    //   await payout.create({createDate: Date.now(),})

    // }
  } else {
    if (req.body.Data.TxnStatus === "SUCCESS") {
      const id = req.body.Data.ApiUserReferenceId;
      const findTran = await Trans.findOne({ id, status: "success" });
      const getTran = await Trans.findOne({ id });
      var amount = Number(req.body.Data.PayerAmount);
      if (!findTran) {
        await Trans.updateOne({ id }, { date: Date.now(), status: "success" });
        //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
        const user = await User.findOne({ id: getTran.userId });
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
          if (amount > 4999) {
            const bonus = (amount * 10) / 100;
            amount = amount + bonus;
          }
        }
        await User.updateOne(
          { id: getTran.userId },
          { firstRecharge: true, $inc: { balance: +amount } }
        );

        await User.updateOne(
          { id: getTran.userId },
          {
            $push: {
              rechargeHistory: {
                amount: amount,
                date: Date.now(),
                status: "Success",
              },
              walletHistory: {
                amount: amount,
                date: Date.now(),
                credit: true,
                note: `Add money ID: ${getTran.number}`,
              },
            },
          }
        );
        const userDate = new Date(user.date);
        const userDateLocal = (userDate / 1000 + 19800) * 1000;
        const newuserDate = new Date(userDateLocal);
        const abhiDate = new Date();
        const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
        const newabhirDate = new Date(abhiDateLocal);
        const day = newabhirDate.getDate();
        const month = newabhirDate.getMonth() + 1;
        const dayMonth = `${day}/${month}`;

        const userday = newuserDate.getDate();
        const usermonth = newuserDate.getMonth() + 1;
        const userdayMonth = `${userday}/${usermonth}`;
        const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

        const phone0recharge = `level0.${user.phone}.totalRecharge`;
        const phone1recharge = `level1.${user.phone}.totalRecharge`;
        const phone2recharge = `level2.${user.phone}.totalRecharge`;

        const phone0first = `level0.${user.phone}.firstRecharge`;
        const phone1first = `level1.${user.phone}.firstRecharge`;
        const phone2first = `level2.${user.phone}.firstRecharge`;

        if (dayMonth === userdayMonth) {
          if (user.upLine !== null) {
            if (user.upLine[0].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] ?? 1 },
                {
                  userId: user.upLine[0] ?? 1,
                  $inc: {
                    [newphone0recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
            if (user.upLine.length === 2) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
            if (user.upLine.length === 3) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }

              if (user.upLine[2].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[2] ?? 1 },
                  {
                    userId: user.upLine[2] ?? 1,
                    $inc: {
                      [newphone2recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
        }

        if (user.upLine !== null) {
          if (user.upLine[0].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[0] ?? 1 },
              {
                userId: user.upLine[0] ?? 1,
                $inc: {
                  [phone0first]: firstRecharge,
                  [phone0recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
          if (user.upLine.length === 2) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
          if (user.upLine.length === 3) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            if (user.upLine[2].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[2] ?? 1 },
                {
                  userId: user.upLine[2] ?? 1,
                  $inc: {
                    [phone2first]: firstRecharge,
                    [phone2recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
        }
      }
    }
  }

  res.status(200).send("done");
};

export const upiGatewayWebhooktdv1 = async (req, res) => {
  const data = req.body;
  var splitString = data.txnAt.split("-");
  var newStr = `${splitString[2]}-${splitString[1]}-${splitString[0]}`;
  const clientId = data.client_txn_id;
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
  const todayProfit = `${day}/${month}/${year}`;
  const newDate = `${daySorted}-${monthSorted}-${year}`;

  if (data.status === "success") {
    const getId = await Trans.findOne({
      id: clientId,

    });
    const getTransaction = await axios.post(
      "https://merchant.upigateway.com/api/check_order_status",
      {
        key: getId.key.key,
        client_txn_id: clientId,
        txn_date: newStr,
      }
    );
    if (getTransaction.data.status === true) {
      if (getTransaction.data.data.status === "success") {
        var amount = getTransaction.data.data.amount;
        const tempTran = await Trans.findOne({
          id: clientId,
          status: "success",
        });
        if (!tempTran) {
          console.log("**************** WebHooked *********************");
          const lastTransId = await Trans.findOne(
            { id: clientId },
            { number: 1, userId: 1 }
          );
          await Trans.updateOne(
            { id: clientId },
            { date: Date.now(), status: "success", expired: true }
          );
          const user = await User.findOne({ id: lastTransId.userId });
          var firstRecharge = 0;
          var bonus = (amount * 10) / 100;
          var bonusAmount = amount + bonus;

          await daily.updateOne(
            { id: newStr },
            { $inc: { count: +1, amount: amount } },
            { upsert: true }
          );

          if (!user.firstRecharge) {
            firstRecharge = amount;
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
              { id: user.id },
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

            //   const level0profit = (amount * 3) /100;
            // const level1profit = (amount * 0) /100;
            // const level2profit = (amount * 0) /100;


            //   user.upLine.forEach(async (element,index) => {
            //     if(index === 0){
            //     const fieldName = `todayProfit.${todayProfit}.level${index}`;
            //     const totallevel = `totalLevel${index}`;
            //     await User.updateOne(
            //       { id: element },
            //       {
            //         $inc: { balance: index === 0 ?level0profit : index === 1 ?  level1profit : level2profit  },

            //       }
            //     );
            //     await offerBonus.updateOne(
            //       { userId: element },
            //       {
            //         userId: element,
            //         $inc: { amount: index === 0 ?level0profit : index === 1 ?  level1profit : level2profit, [fieldName]:  index === 0 ?level0profit : index === 1 ?  level1profit : level2profit,[totallevel]: index === 0 ?level0profit : index === 1 ?  level1profit : level2profit },
            //         $push: {
            //           history: {
            //             credit: "wallet",
            //             amount: bonus,
            //             note: `Recharge bonus: ${user.id}`,
            //             date: Date.now(),
            //           },
            //         },
            //       },
            //       {upsert: true}
            //     );
            //   }
            //   });
          } else {
            var bonusAmount = amount;
            var bonus;
            if (amount > 200) {
              bonus = (amount * 3) / 100;
              bonusAmount = amount + bonus;
            }
            await User.updateOne(
              { id: user.id },
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

          res.status(200).send("done");
        } else {
          res.status(200).send("done");
        }
      } else {
        res.status(200).send("done");
      }
    } else {
      res.status(200).send("done");
    }
  } else {
    res.status(200).send("done");
  }
};
export const finflyupiGatewayWebhooktdv1 = async (req, res) => {
  const data = req.body;
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

  const clientId = data.order_id;

  if (data.status === "SUCCESS") {

    const sData = {
      user_token: "fb8ad7c492d10bf65ee1c9451eccb114",
      order_id: data.order_id
    }
    const postDataString = querystring.stringify(sData);
    const getTransaction = await axios.post(
      "https://finfly.xyz/api/check-order-status",
      postDataString,
      {
        headers: {
          'Content-Type': "application/x-www-form-urlencoded"

        }
      }
    );


    if (getTransaction.data.status === true) {
      if (getTransaction.data.result.txnStatus === "SUCCESS") {
        try {


          var amount = parseFloat(getTransaction.data.result.amount);
          const tempTran = await Trans.findOne({
            id: clientId,
            status: "success",
          });
          if (!tempTran) {
            console.log("**************** WebHooked *********************");
            const lastTransId = await Trans.findOne(
              { id: clientId },
              { number: 1, userId: 1 }
            );
            await Trans.updateOne(
              { id: clientId },
              { date: Date.now(), status: "success", expired: true, utr: getTransaction.data.result.utr }
            );
            const user = await User.findOne({ id: lastTransId.userId });
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
              await offerBonus.updateOne(
                { userId: user.upLine[0] },
                {
                  userId: user.upLine[0],
                  $inc: { amount: +151 },
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
              if (amount > 4999) {
                const bonus = (amount * 10) / 100;
                amount = amount + bonus;
              }
              await User.updateOne(
                { id: user.id },
                {
                  firstRecharge: true, $inc: { balance: +amount },
                  $push: {
                    rechargeHistory: {
                      amount: amount,
                      date: Date.now(),
                      status: "Success",
                    },
                    walletHistory: {
                      amount: amount,
                      date: Date.now(),
                      credit: true,
                      note: `Add money ID: ${lastTransId.number}`,
                    },
                  },
                }
              );
            } else {

              const bonus = (amount * 5) / 100;
              amount = amount + bonus;
              await User.updateOne(
                { id: user.id },
                {
                  firstRecharge: true, $inc: { balance: +amount },
                  $push: {
                    rechargeHistory: {
                      amount: amount,
                      date: Date.now(),
                      status: "Success",
                    },
                    walletHistory: {
                      amount: amount,
                      date: Date.now(),
                      credit: true,
                      note: `Add money ID: ${lastTransId.number}`,
                    },
                  },
                }
              );
              await User.updateOne(
                { id: user.upLine[0] },
                {
                  $inc: { balance: bonus },

                }
              );
              await offerBonus.updateOne(
                { userId: user.upLine[0] },
                {
                  userId: user.upLine[0],
                  $inc: { amount: +bonus },
                  $push: {
                    history: {
                      credit: "wallet",
                      amount: bonus,
                      note: `Recharge bonus: ${user.id}`,
                      date: Date.now(),
                    },
                  },
                },
                { upsert: true }
              );
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
            const useryear = newuserDate.getFullYear();

            const userdayMonth = `${userday}/${usermonth}/${useryear}`;
            const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

            const phone0recharge = `level0.${user.phone}.totalRecharge`;
            const phone1recharge = `level1.${user.phone}.totalRecharge`;
            const phone2recharge = `level2.${user.phone}.totalRecharge`;

            const phone0first = `level0.${user.phone}.firstRecharge`;
            const phone1first = `level1.${user.phone}.firstRecharge`;
            const phone2first = `level2.${user.phone}.firstRecharge`;

            if (dayMonth === userdayMonth) {
              if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[0] ?? 1 },
                    {
                      userId: user.upLine[0] ?? 1,
                      $inc: {
                        [newphone0recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }

                  if (user.upLine[2].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [newphone2recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }
            }

            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[0] ?? 1 },
                  {
                    userId: user.upLine[0] ?? 1,
                    $inc: {
                      [phone0first]: firstRecharge,
                      [phone0recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }

                if (user.upLine[2].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[2] ?? 1 },
                    {
                      userId: user.upLine[2] ?? 1,
                      $inc: {
                        [phone2first]: firstRecharge,
                        [phone2recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }

            res.status(200).send("done");
          } else {
            res.status(200).send("done");
          }

        } catch (error) {
          console.log(error.message);
          res.status(200).send("done");
        }
      } else {
        res.status(200).send("done");
      }
    } else {
      res.status(200).send("done");
    }
  } else {
    res.status(200).send("done");
  }
  //res.status(200).send("done");
};
export const imbupiGatewayWebhooktdv1 = async (req, res) => {
  const data = req.body;
  const date = new Date();
  const localDate = (date / 1000 + 19800) * 1000;
  const newDatefor = new Date(localDate);
  const day = newDatefor.getDate();
  const month = newDatefor.getMonth() + 1;
  const year = newDatefor.getFullYear();
  console.log(data.order_id)
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

  const clientId = data.order_id;



  if (data.status === "SUCCESS") {
    console.log('success');

    const sData = {
      user_token: process.env.imbToken,
      order_id: data.order_id
    }
    const postDataString = querystring.stringify(sData);
    const getTransaction = await axios.post(
      "https://pay.imb.org.in/api/check-order-status",
      postDataString,
      {
        headers: {
          'Content-Type': "application/x-www-form-urlencoded"

        }
      }
    );
    if (getTransaction.data.result.status === "SUCCESS") {
      try {



        const tempTran = await Trans.findOne({
          id: clientId,
          status: "created",
        });
        if (tempTran) {
          console.log("**************** WebHooked *********************");
          const lastTransId = await Trans.findOne(
            { id: clientId },
            { number: 1, userId: 1, amount: 1 }
          );
          var amount = lastTransId.amount;
          const updatedDoc = await Trans.findOneAndUpdate(
            { id: clientId, status: 'created' },
            { status: 'success', expired: true, $inc: { __v: 1 } },
            { new: true, runValidators: true }
          );

          if (updatedDoc) {
            const user = await User.findOne({ id: lastTransId.userId });
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
              await offerBonus.updateOne(
                { userId: user.upLine[0] },
                {
                  userId: user.upLine[0],
                  $inc: { amount: +151 },
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
              if (amount > 4999) {
                const bonus = (amount * 10) / 100;
                amount = amount + bonus;
              }
              await User.updateOne(
                { id: user.id },
                {
                  firstRecharge: true, $inc: { balance: +amount },
                  $push: {
                    rechargeHistory: {
                      amount: amount,
                      date: Date.now(),
                      status: "Success",
                    },
                    walletHistory: {
                      amount: amount,
                      date: Date.now(),
                      credit: true,
                      note: `Add money ID: ${lastTransId.number}`,
                    },
                  },
                }
              );
            } else {

              var bonus;
              if (amount > 4999) {
                bonus = (amount * 10) / 100;
                amount = amount + bonus;
              }
              await User.updateOne(
                { id: user.id },
                {
                  firstRecharge: true, $inc: { balance: +amount },
                  $push: {
                    rechargeHistory: {
                      amount: amount,
                      date: Date.now(),
                      status: "Success",
                    },
                    walletHistory: {
                      amount: amount,
                      date: Date.now(),
                      credit: true,
                      note: `Add money ID: ${lastTransId.number}`,
                    },
                  },
                }
              );
              // await User.updateOne(
              //   { id: user.upLine[0] },
              //   {
              //     $inc: { balance: bonus },

              //   }
              // );
              // await offerBonus.updateOne(
              //   { userId: user.upLine[0] },
              //   {
              //     userId: user.upLine[0],
              //     $inc: { amount: +bonus },
              //     $push: {
              //       history: {
              //         credit: "wallet",
              //         amount: bonus,
              //         note: `Recharge bonus: ${user.id}`,
              //         date: Date.now(),
              //       },
              //     },
              //   },
              //   {upsert: true}
              // );
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
            const useryear = newuserDate.getFullYear();

            const userdayMonth = `${userday}/${usermonth}/${useryear}`;
            const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

            const phone0recharge = `level0.${user.phone}.totalRecharge`;
            const phone1recharge = `level1.${user.phone}.totalRecharge`;
            const phone2recharge = `level2.${user.phone}.totalRecharge`;

            const phone0first = `level0.${user.phone}.firstRecharge`;
            const phone1first = `level1.${user.phone}.firstRecharge`;
            const phone2first = `level2.${user.phone}.firstRecharge`;

            if (dayMonth === userdayMonth) {
              if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[0] ?? 1 },
                    {
                      userId: user.upLine[0] ?? 1,
                      $inc: {
                        [newphone0recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }

                  if (user.upLine[2].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [newphone2recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }
            }

            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[0] ?? 1 },
                  {
                    userId: user.upLine[0] ?? 1,
                    $inc: {
                      [phone0first]: firstRecharge,
                      [phone0recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }

                if (user.upLine[2].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[2] ?? 1 },
                    {
                      userId: user.upLine[2] ?? 1,
                      $inc: {
                        [phone2first]: firstRecharge,
                        [phone2recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }

            res.status(200).send("done");

          } else {
            res.status(200).send('done');
          }
        } else {
          res.status(200).send("done");
        }

      } catch (error) {
        console.log(error.message);
        res.status(200).send("done");
      }
    } else {
      res.status(200).send("done");
    }

    // const sData = {
    //   user_token: "36aba66c0f9b097a7c2b9fd30ff5b687",
    //   order_id: data.order_id
    // }
    // const postDataString = querystring.stringify(sData);
    // const getTransaction = await axios.post(
    //   "https://pay.imb.org.in/api/check-order-status",
    //   postDataString,
    //   {
    //     headers: {
    //       'Content-Type': "application/x-www-form-urlencoded"

    //     }
    //   }
    // );
    // console.log(getTransaction.data)  

    // if (getTransaction.data.status === 'COMPLETED') {
    //   if (getTransaction.data.result.status === "SUCCESS") {
    //     //console.log(getTransaction.data.result.utr)

    //    } else {
    //     res.status(200).send("done");
    //   }
    // } else {
    //   res.status(200).send("done");
    // }
  } else {
    res.status(200).send("done");
  }
  //res.status(200).send("done");
};


export const pinWalletPayout = async (req, res) => {
  const account = req.body.account;
  const IFSC = req.body.ifsc.toUpperCase();
  const name = req.body.name;
  const pamount = req.body.amount;
  const api = req.params.api;
  const type = req.body.type;
  const userId = req.body.userId;
  const withdrawalId = req.body.withdrawalId;

  var amount = pamount;
  if (type === "withdrawal") {
    if (pamount <= 1000) {
      amount = pamount - 30;
    } else {
      amount = pamount - (pamount * 3) / 100;
    }
    if (pamount === 10) {
      amount = pamount;
    }
  }

  if (api === process.env.PayoutAPI) {
    if (type === "withdrawal") {
      const checkStatus = await withdrawal.findOne({ _id: withdrawalId });
      if (checkStatus.status === "Success") {
        return res.status(200).send({ status: "success", rrn: "" });
      }
    }

    const options = {
      method: "POST",
      url: "https://app.huntood.com/api/payout/v1/dotransaction",
      headers: {
        IPAddress: "3.7.234.129",
        AuthKey:
          "5e2d407dbead4e37cbe14e97738d5dcee7d415414529c60c10fd591c90695ffe",

        //  authorization: `Bearer ${pToken}`
      },
      data: {
        BenificiaryAccount: account,
        BenificiaryIfsc: IFSC,
        BenificiaryName: name,
        Amount: amount,
        TransactionId: `${Date.now()}`,
        Latitude: "22.7196",
        Longitude: "75.8577",
      },
    };

    axios
      .request(options)
      .then(async function (response) {
        if (
          response.data.data.status === "PENDING" ||
          response.data.data.status === "SUCCESS"
        ) {
          if (type === "withdrawal") {
            await payout.create({
              id: response.data.data.apiTransactionId,
              txnId: response.data.data.pinwalletTransactionId,
              amount,
              bank: { account, IFSC, name },
              status: "pending",
              rrn: response.data.data.rrn,
              type: "withdrawal",
              withdrawalId,
              userId,
            });
          } else {
            await payout.create({
              id: response.data.data.apiTransactionId,
              txnId: response.data.data.pinwalletTransactionId,
              amount,
              bank: { account, IFSC, name },
              status: "pending",
              rrn: response.data.data.rrn,
              type: "admin",
            });
          }
          res
            .status(200)
            .send({ status: "success", rrn: response.data.data.rrn });
        } else {
          console.log(response.data);
          res.status(200).send({ status: "failed", error: "error" });
        }
      })
      .catch(async function (error) {
        console.log(error);
        res.status(200).send({ status: "failed", error: "error" });
        //   const createToken = await axios.post(
        //     "⁠https://app.huntood.com/api/token/create",
        //     {
        //       userName: "9644629469",
        //       password:
        //         "39a797b1dc88edab7f88fd70d2cd21a3398e809eb6f2965bacd381f6a22fcf7a",
        //     }
        //   );
        //  pToken = createToken.data.data.token;
        //   const options1 = {
        //     method: "POST",
        //     url: "⁠https://app.huntood.com/api/payout/v1/dotransaction",
        //     headers: {

        //       IPAddress: "3.7.234.129",
        //       AuthKey:
        //         "39a797b1dc88edab7f88fd70d2cd21a3398e809eb6f2965bacd381f6a22fcf7a",
        //      authorization: `Bearer ${createToken.data.data.token}`

        //     },
        //     data: {
        //       BenificiaryAccount: account,
        //       BenificiaryIfsc: IFSC,
        //       BenificiaryName: name,
        //       Amount: amount,
        //       TransactionId: `${Date.now()}`,
        //       Latitude: "22.7196",
        //       Longitude: "75.8577",
        //     },
        //   };

        //   axios
        //     .request(options1)
        //     .then(async function (response) {
        //       if(response.data.data.status === 'SUCCESS'){
        //         if(type === 'withdrawal'){
        //           await payout.create({id: response.data.data.apiTransactionId, txnId: response.data.data.pinwalletTransactionId,amount,bank:{account,IFSC,name},status: 'success',rrn: response.data.data.rrn,type: 'withdrawal',withdrawalId,userId});
        //           await withdrawal.updateOne({_id: withdrawalId},{status: 'Success', payout: response.data.data.apiTransactionId,txnId: response.data.data.rrn});
        //           await User.updateOne(
        //             { id: userId },
        //             {
        //               $push: {
        //                 walletHistory: {
        //                   credit: false,
        //                   amount: amount,
        //                   note: `Redeem Successful ID: ${response.data.data.apiTransactionId}`,
        //                   date: Date.now(),
        //                 },
        //               },
        //             }
        //           );

        //           const user = await User.findOne({id: userId});
        //           const date = new Date();
        //           const localDate = (date / 1000 + 19800) * 1000;
        //           const newDatefor = new Date(localDate);
        //           const day = newDatefor.getDate();
        //           const month = newDatefor.getMonth() + 1;
        //           const userDate = new Date(user.date);
        //           const userDateLocal = (userDate / 1000 + 19800) * 1000;
        //           const newuserDate = new Date(userDateLocal);

        //           const dayMonth = `${day}/${month}`;

        //           const userday = newuserDate.getDate();
        //           const usermonth = newuserDate.getMonth() + 1;
        //           const userdayMonth = `${userday}/${usermonth}`;
        //           var daySorted;
        //           var monthSorted;
        //           if (day < 10) {
        //             daySorted = `0${day}`;
        //           } else {
        //             daySorted = `${day}`;
        //           }
        //           if (month < 10) {
        //             monthSorted = `0${month}`;
        //           } else {
        //             monthSorted = `${month}`;
        //           }
        //           const newDate = `${daySorted}-${monthSorted}-2023`;
        //           await Daily.updateOne(
        //             { id: newDate },
        //             { $inc: { redeem: amount, redeemCount: +1 } },
        //             { upsert: true }
        //           );

        //           const phone0with = `level0.${user.phone}.totalWithdrawal`;
        //           const phone1with = `level1.${user.phone}.totalWithdrawal`;
        //           const phone2with = `level2.${user.phone}.totalWithdrawal`;
        //           const newphone0with = `newlevel0.${dayMonth}.${user.phone}.todayWithdrawal`;
        //           const newphone1with = `newlevel1.${dayMonth}.${user.phone}.todayWithdrawal`;
        //           const newphone2with = `newlevel2.${dayMonth}.${user.phone}.todayWithdrawal`;

        //           if(dayMonth === userdayMonth){
        //             if (user.upLine !== null) {
        //               if (user.upLine[0].length !== 0) {
        //                 await promotion.updateOne(
        //                   { userId: user.upLine[0] ?? 1 },
        //                   {
        //                     userId: user.upLine[0] ?? 1,
        //                     $inc: {

        //                       [newphone0with]: parseInt(amount),
        //                     },
        //                   },
        //                   { upsert: true }
        //                 );
        //               }
        //               if (user.upLine.length === 2) {
        //                 if (user.upLine[1].length !== 0) {
        //                   await promotion.updateOne(
        //                     { userId: user.upLine[1] ?? 1 },
        //                     {
        //                       userId: user.upLine[1] ?? 1,
        //                       $inc: {

        //                         [newphone1with]: parseInt(amount),
        //                       },
        //                     },
        //                     { upsert: true }
        //                   );
        //                 }
        //               }
        //               if (user.upLine.length === 3) {
        //                 if (user.upLine[1].length !== 0) {
        //                   await promotion.updateOne(
        //                     { userId: user.upLine[1] ?? 1 },
        //                     {
        //                       userId: user.upLine[1] ?? 1,
        //                       $inc: {

        //                         [newphone1with]: parseInt(amount),
        //                       },
        //                     },
        //                     { upsert: true }
        //                   );
        //                 }

        //                 if (user.upLine[2].length !== 0) {
        //                   await promotion.updateOne(
        //                     { userId: user.upLine[2] ?? 1 },
        //                     {
        //                       userId: user.upLine[2] ?? 1,
        //                       $inc: {

        //                         [newphone2with]: parseInt(amount) ,
        //                       },
        //                     },
        //                     { upsert: true }
        //                   );
        //                 }

        //               }
        //             }

        //           }

        //              if (user.upLine !== null) {
        //             if (user.upLine[0].length !== 0) {
        //               await promotion.updateOne(
        //                 { userId: user.upLine[0] ?? 1 },
        //                 {
        //                   userId: user.upLine[0] ?? 1,
        //                   $inc: {

        //                     [phone0with]: parseInt(amount),
        //                   },
        //                 },
        //                 { upsert: true }
        //               );
        //             }
        //             if (user.upLine.length === 2) {
        //               if (user.upLine[1].length !== 0) {
        //                 await promotion.updateOne(
        //                   { userId: user.upLine[1] ?? 1 },
        //                   {
        //                     userId: user.upLine[1] ?? 1,
        //                     $inc: {

        //                       [phone1with]: parseInt(amount),
        //                     },
        //                   },
        //                   { upsert: true }
        //                 );
        //               }
        //             }
        //             if (user.upLine.length === 3) {
        //               if (user.upLine[1].length !== 0) {
        //                 await promotion.updateOne(
        //                   { userId: user.upLine[1] ?? 1 },
        //                   {
        //                     userId: user.upLine[1] ?? 1,
        //                     $inc: {

        //                       [phone1with]: parseInt(amount),
        //                     },
        //                   },
        //                   { upsert: true }
        //                 );
        //               }

        //               if (user.upLine[2].length !== 0) {
        //                 await promotion.updateOne(
        //                   { userId: user.upLine[2] ?? 1 },
        //                   {
        //                     userId: user.upLine[2] ?? 1,
        //                     $inc: {

        //                       [phone2with]: parseInt(amount) ,
        //                     },
        //                   },
        //                   { upsert: true }
        //                 );
        //               }

        //             }
        //           }
        //         }else{
        //         await payout.create({id: response.data.data.apiTransactionId, txnId: response.data.data.pinwalletTransactionId,amount,bank:{account,IFSC,name},status: 'success',rrn: response.data.data.rrn,type: 'admin'});
        //          }
        //           res.status(200).send({status: 'success',rrn: response.data.data.rrn});
        //       }else{
        //         res.status(200).send({status: 'failed', error: 'error'});

        //       }

        //     })
        //     .catch( function (error) {

        //       res.status(200).send({status: 'failed', error});

        //     });
      });
  }
};

export const createPayhubPayment = async (req, res) => {
  const client_txn_id = Math.random().toString(16).slice(2);
  const amount = req.body.amount;
  const p_info = req.body.p_info;
  const userId = req.body.userId;

  const customer_mobile = req.body.customer_mobile;
  const redirect_url = req.body.redirect_url;
  const options = {
    method: "POST",
    url: "https://server.payhub.link/user/sendpayinrequest",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      apiKey: "U2FsdGVkX1/Qdbrd0sUa/uKSXkNW+ZVcxlkAJtbOGTc=",
      token: token,
    },
    data: {
      emailId: "gs74340@gmail.com",

      upiId: "upi@paytm",
      amount: amount,
      username: "govind",

      phone: customer_mobile,
    },
  };

  const createOrder = await axios.request(options);
  if (createOrder.data.responseMessage === "invalid token") {
    console.log("token Expired");
    const createToken = await axios.post(
      "https://server.payhub.link/user/login",
      {
        emailId: "gs74340@gmail.com",
        password: "mzi9zr67ibydp5k3tckz",
      }
    );
    token = createToken.data.responseData.token;
    const options2 = {
      method: "POST",
      url: "https://server.payhub.link/user/sendpayinrequest",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        apiKey: "U2FsdGVkX1/Qdbrd0sUa/uKSXkNW+ZVcxlkAJtbOGTc=",
        token: token,
      },
      data: {
        emailId: "gs74340@gmail.com",

        upiId: "upi@paytm",
        amount: amount,
        username: "govind",

        phone: customer_mobile,
      },
    };
    const createOrderNew = await axios.request(options2);
    if (createOrderNew.data.responseCode === 200) {
      console.log("token New");

      const urlParams = new URLSearchParams(createOrder.data.responseData);
      const txid = urlParams.get("txid");
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncreament = lastTrans.number + 1;
      await Trans.create({
        gateway: "Payhub",
        id: client_txn_id,
        txnId: txid,
        number: newIncreament,
        date: Date.now(),
        userId,
        amount: amount,
        status: "created",

        phone: customer_mobile,
      });

      res.status(200).send({ link: createOrderNew.data.responseData });
    }
  }
  if (createOrder.data.responseCode === 200) {
    console.log("token old");

    const urlParams = new URLSearchParams(createOrder.data.responseData);
    const txid = urlParams.get("txid");
    const lastTrans = await Trans.findOne().sort({ number: -1 });
    const newIncreament = lastTrans.number + 1;
    await Trans.create({
      gateway: "Payhub",
      id: client_txn_id,
      txnId: txid,
      number: newIncreament,
      date: Date.now(),
      userId,
      amount: amount,
      status: "created",

      phone: customer_mobile,
    });

    res.status(200).send({ link: createOrder.data.responseData });
  }
};

export const payhubCallBackURLv1 = async (req, res) => {
  if (req.body.status === "success") {
    const id = req.body.transaction_id;
    const findTran = await Trans.findOne({
      gateway: "Payhub",
      txnId: id,
      status: "success",
    });
    const getTran = await Trans.findOne({ gateway: "Payhub", txnId: id });
    var amount = req.body.amount;
    if (!findTran) {
      await Trans.updateOne(
        { gateway: "Payhub", txnId: id },
        { date: Date.now(), status: "success" }
      );
      //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
      const user = await User.findOne({ id: getTran.userId });
      var firstRecharge = 0;
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
        if (amount > 4999) {
          const bonus = (amount * 10) / 100;
          amount = amount + bonus;
        }
      }
      await User.updateOne(
        { id: getTran.userId },
        { firstRecharge: true, $inc: { balance: +amount } }
      );

      await User.updateOne(
        { id: getTran.userId },
        {
          $push: {
            rechargeHistory: {
              amount: amount,
              date: Date.now(),
              status: "Success",
            },
            walletHistory: {
              amount: amount,
              date: Date.now(),
              credit: true,
              note: `Add money ID: ${getTran.number}`,
            },
          },
        }
      );
      const userDate = new Date(user.date);
      const userDateLocal = (userDate / 1000 + 19800) * 1000;
      const newuserDate = new Date(userDateLocal);
      const abhiDate = new Date();
      const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
      const newabhirDate = new Date(abhiDateLocal);
      const day = newabhirDate.getDate();
      const month = newabhirDate.getMonth() + 1;
      const dayMonth = `${day}/${month}`;

      const userday = newuserDate.getDate();
      const usermonth = newuserDate.getMonth() + 1;
      const userdayMonth = `${userday}/${usermonth}`;
      const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
      const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
      const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

      const phone0recharge = `level0.${user.phone}.totalRecharge`;
      const phone1recharge = `level1.${user.phone}.totalRecharge`;
      const phone2recharge = `level2.${user.phone}.totalRecharge`;

      const phone0first = `level0.${user.phone}.firstRecharge`;
      const phone1first = `level1.${user.phone}.firstRecharge`;
      const phone2first = `level2.${user.phone}.firstRecharge`;

      if (dayMonth === userdayMonth) {
        if (user.upLine !== null) {
          if (user.upLine[0].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[0] ?? 1 },
              {
                userId: user.upLine[0] ?? 1,
                $inc: {
                  [newphone0recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
          if (user.upLine.length === 2) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [newphone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
          if (user.upLine.length === 3) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [newphone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            if (user.upLine[2].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[2] ?? 1 },
                {
                  userId: user.upLine[2] ?? 1,
                  $inc: {
                    [newphone2recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
        }
      }

      if (user.upLine !== null) {
        if (user.upLine[0].length !== 0) {
          await promotion.updateOne(
            { userId: user.upLine[0] ?? 1 },
            {
              userId: user.upLine[0] ?? 1,
              $inc: {
                [phone0first]: firstRecharge,
                [phone0recharge]: amount,
              },
            },
            { upsert: true }
          );
        }
        if (user.upLine.length === 2) {
          if (user.upLine[1].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[1] ?? 1 },
              {
                userId: user.upLine[1] ?? 1,
                $inc: {
                  [phone1first]: firstRecharge,
                  [phone1recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
        }
        if (user.upLine.length === 3) {
          if (user.upLine[1].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[1] ?? 1 },
              {
                userId: user.upLine[1] ?? 1,
                $inc: {
                  [phone1first]: firstRecharge,
                  [phone1recharge]: amount,
                },
              },
              { upsert: true }
            );
          }

          if (user.upLine[2].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[2] ?? 1 },
              {
                userId: user.upLine[2] ?? 1,
                $inc: {
                  [phone2first]: firstRecharge,
                  [phone2recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
        }
      }
    }
  }

  res.status(200).send("done");
};

export const pinCheckBalance = async (req, res) => {
  const api = req.params.api;

  if (api === process.env.AdminAPI) {
    const options = {
      method: "GET",
      url: "⁠https://app.huntood.com/api/wallet/getbalance",
      headers: {
        accept: "application/json",
        IPAddress: "3.7.234.129",
        AuthKey:
          "39a797b1dc88edab7f88fd70d2cd21a3398e809eb6f2965bacd381f6a22fcf7a",
        authorization: `Bearer ${pToken}`,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        res.status(200).send({ status: "success", response: response.data });
      })
      .catch(async function (error) {
        const createToken = await axios.post(
          "⁠https://app.huntood.com/api/token/create",
          {
            userName: "9644629469",
            password:
              "39a797b1dc88edab7f88fd70d2cd21a3398e809eb6f2965bacd381f6a22fcf7a",
          }
        );
        pToken = createToken.data.data.token;
        const options1 = {
          method: "GET",
          url: "⁠https://app.huntood.com/api/wallet/getbalance",
          headers: {
            accept: "application/json",
            IPAddress: "3.7.234.129",
            AuthKey:
              "39a797b1dc88edab7f88fd70d2cd21a3398e809eb6f2965bacd381f6a22fcf7a",
            authorization: `Bearer ${createToken.data.data.token}`,
          },
        };

        axios
          .request(options1)
          .then(function (response) {
            res
              .status(200)
              .send({ status: "success", response: response.data });
          })
          .catch(async function (error) {
            res.status(200).send({ status: "fail", response: error });
          });
      });
  }
};

export const getPayouts = async (req, res) => {
  var payouts = "";
  if (req.params.api === process.env.AdminAPI) {
    payouts = await payout.find({ status: "success" }).sort({ id: -1 });
  }
  res.status(200).send(payouts);
};

export const KSLcallbacktodd = async (req, res) => {
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

  if (req.body.status === "SUCCESS") {
    const id = req.body.orderId;
    const findTran = await Trans.findOne({ id, status: "success" });
    const getTran = await Trans.findOne({ id });
    var amount = req.body.amount;
    if (getTran) {
      if (!findTran) {
        await Trans.updateOne({ id }, { date: Date.now(), status: "success" });
        //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
        const user = await User.findOne({ id: getTran.userId });
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
          if (amount > 4999) {
            const bonus = (amount * 10) / 100;
            amount = amount + bonus;
          }
        }
        await User.updateOne(
          { id: getTran.userId },
          { firstRecharge: true, $inc: { balance: +amount } }
        );

        await User.updateOne(
          { id: getTran.userId },
          {
            $push: {
              rechargeHistory: {
                amount: amount,
                date: Date.now(),
                status: "Success",
              },
              walletHistory: {
                amount: amount,
                date: Date.now(),
                credit: true,
                note: `Add money ID: ${getTran.number}`,
              },
            },
          }
        );
        const userDate = new Date(user.date);
        const userDateLocal = (userDate / 1000 + 19800) * 1000;
        const newuserDate = new Date(userDateLocal);
        const abhiDate = new Date();
        const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
        const newabhirDate = new Date(abhiDateLocal);
        const day = newabhirDate.getDate();
        const month = newabhirDate.getMonth() + 1;
        const dayMonth = `${day}/${month}`;

        const userday = newuserDate.getDate();
        const usermonth = newuserDate.getMonth() + 1;
        const userdayMonth = `${userday}/${usermonth}`;
        const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

        const phone0recharge = `level0.${user.phone}.totalRecharge`;
        const phone1recharge = `level1.${user.phone}.totalRecharge`;
        const phone2recharge = `level2.${user.phone}.totalRecharge`;

        const phone0first = `level0.${user.phone}.firstRecharge`;
        const phone1first = `level1.${user.phone}.firstRecharge`;
        const phone2first = `level2.${user.phone}.firstRecharge`;

        if (dayMonth === userdayMonth) {
          if (user.upLine !== null) {
            if (user.upLine[0].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] ?? 1 },
                {
                  userId: user.upLine[0] ?? 1,
                  $inc: {
                    [newphone0recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
            if (user.upLine.length === 2) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
            if (user.upLine.length === 3) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }

              if (user.upLine[2].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[2] ?? 1 },
                  {
                    userId: user.upLine[2] ?? 1,
                    $inc: {
                      [newphone2recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
        }

        if (user.upLine !== null) {
          if (user.upLine[0].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[0] ?? 1 },
              {
                userId: user.upLine[0] ?? 1,
                $inc: {
                  [phone0first]: firstRecharge,
                  [phone0recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
          if (user.upLine.length === 2) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
          if (user.upLine.length === 3) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            if (user.upLine[2].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[2] ?? 1 },
                {
                  userId: user.upLine[2] ?? 1,
                  $inc: {
                    [phone2first]: firstRecharge,
                    [phone2recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
        }
      }
    }

    res.status(200).send("done");
  }
};

export const KSLcallbacktoddpayout = async (req, res) => {
  if (response.data.status === "SUCCESS") {
    const getPayout = await payout.findOne({ id: res.data.data.orderId });

    if (getPayout) {
      if (getPayout.status === "pending") {
        var amount = getPayout.amount;
        if (getPayout.type === "withdrawal") {
          await payout.updateOne(
            { id: req.body.Data.APITransactionId },
            { status: "success", rrn: req.body.Data.RRN }
          );
          await withdrawal.updateOne(
            { _id: getPayout.withdrawalId },
            {
              status: "Success",
              payout: req.body.Data.APITransactionId,
              txnId: req.body.Data.RRN,
            }
          );
          await User.updateOne(
            { id: getPayout.userId },
            {
              $push: {
                walletHistory: {
                  credit: false,
                  amount,
                  note: `Redeem Successful ID: ${req.body.Data.APITransactionId}`,
                  date: Date.now(),
                },
              },
            }
          );

          const user = await User.findOne({ id: getPayout.userId });
          const date = new Date();
          const localDate = (date / 1000 + 19800) * 1000;
          const newDatefor = new Date(localDate);
          const day = newDatefor.getDate();
          const month = newDatefor.getMonth() + 1;
          const year = newDatefor.getFullYear();

          const userDate = new Date(user.date);
          const userDateLocal = (userDate / 1000 + 19800) * 1000;
          const newuserDate = new Date(userDateLocal);

          const dayMonth = `${day}/${month}`;

          const userday = newuserDate.getDate();
          const usermonth = newuserDate.getMonth() + 1;
          const userdayMonth = `${userday}/${usermonth}`;
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

          const phone0with = `level0.${user.phone}.totalWithdrawal`;
          const phone1with = `level1.${user.phone}.totalWithdrawal`;
          const phone2with = `level2.${user.phone}.totalWithdrawal`;
          const newphone0with = `newlevel0.${dayMonth}.${user.phone}.todayWithdrawal`;
          const newphone1with = `newlevel1.${dayMonth}.${user.phone}.todayWithdrawal`;
          const newphone2with = `newlevel2.${dayMonth}.${user.phone}.todayWithdrawal`;

          if (dayMonth === userdayMonth) {
            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[0] ?? 1 },
                  {
                    userId: user.upLine[0] ?? 1,
                    $inc: {
                      [newphone0with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [newphone1with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [newphone1with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }

                if (user.upLine[2].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[2] ?? 1 },
                    {
                      userId: user.upLine[2] ?? 1,
                      $inc: {
                        [newphone2with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }
          }

          if (user.upLine !== null) {
            if (user.upLine[0].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] ?? 1 },
                {
                  userId: user.upLine[0] ?? 1,
                  $inc: {
                    [phone0with]: parseInt(amount),
                  },
                },
                { upsert: true }
              );
            }
            if (user.upLine.length === 2) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [phone1with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }
            }
            if (user.upLine.length === 3) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [phone1with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }

              if (user.upLine[2].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[2] ?? 1 },
                  {
                    userId: user.upLine[2] ?? 1,
                    $inc: {
                      [phone2with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
        } else {
          await payout.updateOne(
            { id: req.body.Data.APITransactionId },
            { status: "success", rrn: req.body.Data.RRN }
          );
        }
      }
    }
  }
};

export const KSLcreatelinktodd = async (req, res) => {
  const amount = req.body.amount;
  const userId = req.body.userId;

  const id = `${Date.now()}`;

  const createOrder = await axios.post(
    "https://kindentsolutions.in/v3/generatePaymentLink",
    {
      userKey: "KBSd5fc8ae951",
      userToken: "d0f0ee18231122dcf8b43931e7f339a0",
      genrateToken: KSLtoken,
      amount: amount,
      option: "QR",
      orderId: id,
    }
  );
  if (createOrder.data.error === "Unauthorized") {
    const createToken = await axios.post(
      "https://kindentsolutions.in/v3/generateToken",
      {
        userKey: "KBSd5fc8ae951",
        userToken: "d0f0ee18231122dcf8b43931e7f339a0",
      }
    );
    KSLtoken = createToken.data.data.token;

    const createOrder = await axios.post(
      "https://kindentsolutions.in/v3/generatePaymentLink",
      {
        userKey: "KBSd5fc8ae951",
        userToken: "d0f0ee18231122dcf8b43931e7f339a0",
        genrateToken: KSLtoken,
        amount: amount,
        option: "QR",
        orderId: id,
      }
    );
    const lastTrans = await Trans.findOne().sort({ number: -1 });
    const newIncreament = lastTrans.number + 1;
    await Trans.create({
      gateway: "Kindent",
      txnId: createOrder.data.data.txnId,
      id,
      number: newIncreament,
      date: Date.now(),
      userId,
      amount: amount,
      status: "created",
    });

    res.status(200).send({ link: createOrder.data.data.paymentData });
  } else {
    const lastTrans = await Trans.findOne().sort({ number: -1 });
    const newIncreament = lastTrans.number + 1;
    await Trans.create({
      gateway: "Kindent",
      txnId: createOrder.data.data.txnId,
      id,
      number: newIncreament,
      date: Date.now(),
      userId,
      amount: amount,
      status: "created",
    });

    res.status(200).send({ link: createOrder.data.data.paymentData });
  }
};

export const KSLpayouttodd = async (req, res) => {
  const account = req.body.account;
  const IFSC = req.body.ifsc.toUpperCase();
  const name = req.body.name;
  const pamount = req.body.amount;
  const api = req.params.api;
  const type = req.body.type;
  const userId = req.body.userId;
  const withdrawalId = req.body.withdrawalId;
  const id = `${Date.now()}`;
  const orderId = `ORD${id.substring(0, 10)}`;
  var amount = pamount;
  if (type === "withdrawal") {
    if (pamount <= 1000) {
      amount = pamount - 30;
    } else {
      amount = pamount - (pamount * 3) / 100;
    }
    if (pamount === 10) {
      amount = pamount;
    }
  }

  if (api === process.env.PayoutAPI) {
    if (type === "withdrawal") {
      const checkStatus = await withdrawal.findOne({ _id: withdrawalId });
      if (checkStatus.status === "Success") {
        return res.status(200).send({ status: "success", rrn: "" });
      }
    }

    const options = {
      method: "POST",
      url: "https://kindentsolutions.in/v3/doPayout",

      data: {
        userKey: "KBSd5fc8ae951",
        userToken: "d0f0ee18231122dcf8b43931e7f339a0",
        orderId: orderId,
        accountHolderName: name,
        bankName: "PNB",
        accountNumer: account,
        ifscCode: IFSC,
        mobileNumber: "8120441687",
        email: "gs74340@gmail.com",
        amount: amount,
        genrateToken: KSLtoken,
      },
    };

    axios
      .request(options)
      .then(async function (response) {
        if (response.data.status === "SUCCESS") {
          const getPayout = await payout.findOne({
            orderId: response.data.data.orderId,
          });

          if (!getPayout) {
            if (type === "withdrawal") {
              await payout.create({
                orderId: response.data.data.orderId,
                txnId: response.data.data.txn_id,
                amount,
                bank: { account, IFSC, name },
                status: "success",
                type: "withdrawal",
                withdrawalId,
                userId,
                rrn: response.data.data.utr,
              });
              await withdrawal.updateOne(
                { _id: withdrawalId },
                {
                  status: "Success",
                  payout: response.data.data.orderId,
                  txnId: response.data.data.utr,
                }
              );
              await User.updateOne(
                { id: userId },
                {
                  $push: {
                    walletHistory: {
                      credit: false,
                      amount,
                      note: `Redeem Successful ID: ${response.data.data.orderId}`,
                      date: Date.now(),
                    },
                  },
                }
              );

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

              const dayMonth = `${day}/${month}`;

              const userday = newuserDate.getDate();
              const usermonth = newuserDate.getMonth() + 1;
              const userdayMonth = `${userday}/${usermonth}`;
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

              const phone0with = `level0.${user.phone}.totalWithdrawal`;
              const phone1with = `level1.${user.phone}.totalWithdrawal`;
              const phone2with = `level2.${user.phone}.totalWithdrawal`;
              const newphone0with = `newlevel0.${dayMonth}.${user.phone}.todayWithdrawal`;
              const newphone1with = `newlevel1.${dayMonth}.${user.phone}.todayWithdrawal`;
              const newphone2with = `newlevel2.${dayMonth}.${user.phone}.todayWithdrawal`;

              if (dayMonth === userdayMonth) {
                if (user.upLine !== null) {
                  if (user.upLine[0].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[0] ?? 1 },
                      {
                        userId: user.upLine[0] ?? 1,
                        $inc: {
                          [newphone0with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                  if (user.upLine.length === 2) {
                    if (user.upLine[1].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[1] ?? 1 },
                        {
                          userId: user.upLine[1] ?? 1,
                          $inc: {
                            [newphone1with]: parseInt(amount),
                          },
                        },
                        { upsert: true }
                      );
                    }
                  }
                  if (user.upLine.length === 3) {
                    if (user.upLine[1].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[1] ?? 1 },
                        {
                          userId: user.upLine[1] ?? 1,
                          $inc: {
                            [newphone1with]: parseInt(amount),
                          },
                        },
                        { upsert: true }
                      );
                    }

                    if (user.upLine[2].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[2] ?? 1 },
                        {
                          userId: user.upLine[2] ?? 1,
                          $inc: {
                            [newphone2with]: parseInt(amount),
                          },
                        },
                        { upsert: true }
                      );
                    }
                  }
                }
              }

              if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[0] ?? 1 },
                    {
                      userId: user.upLine[0] ?? 1,
                      $inc: {
                        [phone0with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }

                  if (user.upLine[2].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [phone2with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }
            } else {
              await payout.create({
                orderId: response.data.data.orderId,
                txnId: response.data.data.txn_id,
                amount,
                bank: { account, IFSC, name },
                status: "success",
                type: "admin",
                rrn: response.data.data.utr,
              });
            }
            return res
              .status(200)
              .send({ status: "success", rrn: response.data.data.utr });
          }
        }

        if (response.data.status === "PROCESSING") {
          if (type === "withdrawal") {
            await payout.create({
              orderId: response.data.data.orderId,
              txnId: response.data.data.txn_id,
              amount,
              bank: { account, IFSC, name },
              status: "pending",
              type: "withdrawal",
              withdrawalId,
              userId,
            });
          } else {
            await payout.create({
              orderId: response.data.data.orderId,
              txnId: response.data.data.txn_id,
              amount,
              bank: { account, IFSC, name },
              status: "pending",
              type: "admin",
            });
          }
          return res
            .status(200)
            .send({ status: "Processing", rrn: response.data.data.orderId });
        }

        if (response.data.status != "PROCESSING" || "SUCCESS") {
          console.log(response.data);
          const createToken = await axios.post(
            "https://kindentsolutions.in/v3/generateToken",
            {
              userKey: "KBSd5fc8ae951",
              userToken: "d0f0ee18231122dcf8b43931e7f339a0",
            }
          );
          console.log(createToken.data);
          KSLtoken = createToken.data.data.token;
          res.status(200).send({ status: "failed", error: "error" });
        }
      })
      .catch(async function (error) {
        console.log(error);
        const createToken = await axios.post(
          "https://kindentsolutions.in/v3/generateToken",
          {
            userKey: "KBSd5fc8ae951",
            userToken: "d0f0ee18231122dcf8b43931e7f339a0",
          }
        );
        KSLtoken = createToken.data.data.token;
        res.status(200).send({ status: "Token Expired", error: "error" });
      });
  }
};

const DEFAULT_GATEWAY_ORDER = ["auto", "manual", "card", "lgpay", "watchpay", "rupeerush", "uzpay"];

function mergeGatewayOrder(stored) {
  const order =
    Array.isArray(stored) && stored.length ? [...stored] : [...DEFAULT_GATEWAY_ORDER];
  for (const id of DEFAULT_GATEWAY_ORDER) {
    if (!order.includes(id)) order.push(id);
  }
  return order;
}

export const getGateway = async (req, res) => {
  const doc = await extra.findOne({}, { gateway: 1, upi: 1, rechargeEnabled: 1, gatewayOrder: 1, gatewayEnabled: 1 });
  const rechargeEnabled = doc.rechargeEnabled !== false;
  const order = mergeGatewayOrder(doc.gatewayOrder);
  const enabled = doc.gatewayEnabled && typeof doc.gatewayEnabled === "object" ? doc.gatewayEnabled : {};
  const gatewayList = order.filter((id) => enabled[id] !== false);
  res.status(200).send({
    gateway: doc.gateway,
    limit: doc.upi?.limit,
    upi: doc.upi,
    rechargeEnabled,
    gatewayOrder: order,
    gatewayEnabled: enabled,
    gatewayList,
  });
};
export const setGateway = async (req, res) => {
  const gateway = req.params.gateway;

  if (req.params.api === process.env.ToddRecharge) {
    await extra.updateOne({ id: 1 }, { gateway });
  }

  res.status(200).send("done");
};

export const updateUpi = async (req, res) => {
  const enableLimit = req.body.enable;
  const upi1 = req.body.upi1;
  const upi2 = req.body.upi2;
  const upi3 = req.body.upi3;
  const upi4 = req.body.upi4;

  const value = req.params.value;

  if (req.params.api === process.env.ToddRecharge) {
    if (value === "array") {
      if (req.body.number === "1") {
        await extra.updateOne({ id: 1 }, { "upi.v2.upis": upi1 });
      }

      // if (req.body.number === "2") {
      //   await extra.updateOne({ id: 1 }, { "upi.arr2": upi2 });
      // }

      // if (req.body.number === "3") {
      //   await extra.updateOne({ id: 1 }, { "upi.arr3": upi3 });
      // }

      // if (req.body.number === "4") {
      //   await extra.updateOne({ id: 1 }, { "upi.arr4": upi4 });
      // }
    }

    if (value === "limit") {
      await extra.updateOne(
        { id: 1 },
        { "upi.limit.auto": enableLimit === "true" ? true : false }
      );
    }
    if (value === "upi") {
      if (upi1.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id1": upi1 });
      }

      if (upi2.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id2": upi2 });
      }

      if (upi3.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id3": upi3 });
      }

      if (upi4.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id4": upi4 });
      }
    }
  }

  res.status(200).send("done");
};

export const updateUpiV3 = async (req, res) => {
  const enableLimit = req.body.enable;
  const upi1 = req.body.upi1;
  const upi2 = req.body.upi2;
  const upi3 = req.body.upi3;
  const upi4 = req.body.upi4;

  const value = req.params.value;

  if (req.params.api === process.env.ToddRecharge) {
    if (value === "array") {
      if (req.body.number === "1") {
        await extra.updateOne({ id: 1 }, { "upi.v3.upis": upi1 });
      }

      // if (req.body.number === "2") {
      //   await extra.updateOne({ id: 1 }, { "upi.arr2": upi2 });
      // }

      // if (req.body.number === "3") {
      //   await extra.updateOne({ id: 1 }, { "upi.arr3": upi3 });
      // }

      // if (req.body.number === "4") {
      //   await extra.updateOne({ id: 1 }, { "upi.arr4": upi4 });
      // }
    }

    if (value === "limit") {
      await extra.updateOne(
        { id: 1 },
        { "upi.limit.auto": enableLimit === "true" ? true : false }
      );
    }
    if (value === "upi") {
      if (upi1.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id1": upi1 });
      }

      if (upi2.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id2": upi2 });
      }

      if (upi3.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id3": upi3 });
      }

      if (upi4.length !== 0) {
        await extra.updateOne({ id: 1 }, { "upi.id4": upi4 });
      }
    }
  }

  res.status(200).send("done");
};

export const getGatewayOut = async (req, res) => {
  const gateway = await extra.findOne({}, { gatewayOut: 1 });
  res.status(200).send({ gateway: gateway.gatewayOut });
};
export const setGatewayOut = async (req, res) => {
  const gateway = req.params.gateway;

  if (req.params.api === process.env.AdminAPI) {
    await extra.updateOne({ id: 1 }, { gatewayOut: gateway });
  }

  res.status(200).send("done");
};

export const getRechargeSettings = async (req, res) => {
  const api = req.params.api;
  if (api !== process.env.AdminAPI) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const doc = await extra.findOne({ id: 1 }, { rechargeEnabled: 1, gatewayOrder: 1, gatewayEnabled: 1, gateway: 1, upi: 1 });
  const rechargeEnabled = doc.rechargeEnabled !== false;
  const gatewayOrder = mergeGatewayOrder(doc.gatewayOrder);
  const gatewayEnabled = doc.gatewayEnabled && typeof doc.gatewayEnabled === "object"
    ? doc.gatewayEnabled
    : { auto: true, manual: true, card: true, lgpay: true, watchpay: true, rupeerush: true, uzpay: true };
  res.status(200).json({
    rechargeEnabled,
    gatewayOrder,
    gatewayEnabled,
    currentGateway: doc.gateway,
    upiLimit: doc.upi?.limit,
  });
};

export const updateRechargeSettings = async (req, res) => {
  const api = req.params.api;
  if (api !== process.env.AdminAPI) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { rechargeEnabled, gatewayOrder, gatewayEnabled } = req.body;
  const update = {};
  if (typeof rechargeEnabled === "boolean") update.rechargeEnabled = rechargeEnabled;
  if (Array.isArray(gatewayOrder)) update.gatewayOrder = gatewayOrder;
  if (gatewayEnabled && typeof gatewayEnabled === "object") update.gatewayEnabled = gatewayEnabled;
  if (Object.keys(update).length) {
    await extra.updateOne({ id: 1 }, { $set: update });
  }
  res.status(200).json({ success: true });
};

export const chineasePay = async (req, res) => {
  const order = Date.now();
  //   if($bank_code != ""){
  //     $signStr = $signStr."bank_code=".$bank_code."&";
  // }

  // $signStr = $signStr."goods_name=".$goods_name."&";
  // $signStr = $signStr."mch_id=".$mch_id."&";
  // $signStr = $signStr."mch_order_no=".$mch_order_no."&";
  // if($mch_return_msg != ""){
  //     $signStr = $signStr."mch_return_msg=".$mch_return_msg."&";
  // }
  // $signStr = $signStr."notify_url=".$notify_url."&";
  // $signStr = $signStr."order_date=".$order_date."&";
  // if($page_url != ""){
  //     $signStr = $signStr."page_url=".$page_url."&";
  // }
  // $signStr = $signStr."pay_type=".$pay_type."&";
  // $signStr = $signStr."trade_amount=".$trade_amount."&";
  // $signStr = $signStr."version=".$version;
  // $signAPI = new signapi();
  // $sign = $signAPI->sign($signStr,$merchant_key);

  const dataString = `goods_name=test56&mch_id=100528265&mch_order_no=1234567890&mch_return_msg=test&notify_url=https://ludo.toddapples.com/chineasePayCallback&order_date=2023-12-22 00:47:00&pay_type=151&trade_amount=100&version=1.0&key=2110c9dd69614ad7b8e6d90e14fde979`;
  const md5 = crypto.createHash("md5").update(dataString).digest("hex");
  console.log(md5);
  const requestData = {
    version: "1.0",
    mch_id: "100528265",
    notify_url: "https://ludo.toddapples.com/chineasePayCallback",
    mch_order_no: `ORD1234567890`,
    pay_type: "151",
    trade_amount: "100",
    order_date: "2023-12-22 00:47:00",
    goods_name: "test56",
    sign_type: "MD5",
    sign: md5,
  };

  const createOrder = await axios.post(
    "https://pay6de1c7.wowpayglb.com/pay/web",
    requestData,
    {
      headers: {
        "Content-Type": "x-www-form-urlencoded",
      },
    }
  );

  //   goods_name=test, mch_id=977977111, mch_order_no=20210422130900, mch_return_msg=test, notify_url=http://mll168.natapp1.cc/paytest/localhostB2C&H5/Notify_Url.jsp, order_date=2021-04-22 13:09:00, page_url=https://wwww.baidu.com, pay_type=101, sign=c387149b46ccf169d83b2a16b2ce1755, sign_type=MD5, trade_amount=100, version=1.0
  // }
  res.status(200).send(createOrder.data);
};

export const chineaseRushPay = async (req, res) => { }

// Rupee Rush Payment Gateway Integration
export const rupeeRushCreateOrder = async (req, res) => {
  try {
    const userId = req.params.id;
    const rawMobile = req.body.customer_mobile ?? req.user?.phone;
    const customer_mobile =
      rawMobile != null && String(rawMobile).trim() !== ''
        ? String(rawMobile).trim()
        : null;
    const customer_name = req.body.customer_name || req.user?.username || 'User';
    const customer_email = req.body.customer_email || req.user?.email || '';
    const amount = req.body.amount;

    // Validate required fields
    if (!amount || !userId || !customer_mobile) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required fields: amount, userId, customer_mobile'
      });
    }

    // Check if user exists and is not blocked
    const user = await User.findOne({ id: parseInt(userId) });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User not found'
      });
    }

    if (user.block) {
      return res.status(400).json({
        code: 400,
        message: 'Account suspended'
      });
    }

    // Check if user is demo user
    if (user.demo) {
      // For demo users, simulate successful payment
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncrement = lastTrans ? lastTrans.number + 1 : 1;

      await Trans.create({
        id: `DEMO_${Date.now()}`,
        number: newIncrement,
        date: Date.now(),
        userId: parseInt(userId),
        amount: parseFloat(amount),
        status: "success",
        gateway: "RupeeRush",
        name: customer_name || "Demo User",
        email: customer_email || "demo@example.com",
        phone: customer_mobile,
      });

      // Update user balance for demo
      await User.updateOne(
        { id: parseInt(userId) },
        { $inc: { balance: parseFloat(amount) } }
      );

      return res.status(200).json({
        code: 200,
        message: 'Demo payment successful',
        redirect_url: `${process.env.CLIENT_URL}/#/wallet/RechargeHistory`
      });
    }

    // Rupee Rush API Configuration
    const PAY_URL = process.env.RUPEERUSH_API_URL || "https://api.rupeerush.cc/payin/create";
    const MER_NO = process.env.RUPEERUSH_MER_NO || "RUP251002132137025";
    const SECRET_KEY = process.env.RUPEERUSH_SECRET_KEY || "697F58B0E39DDC16C8B86286F591ED29";

    // Generate unique order ID and random number
    const timestamp = Date.now().toString();
    const randomNo = timestamp.substring(timestamp.length - 14); // Last 14 digits as per spec
    const outTradeNo = "ORD" + timestamp.substring(timestamp.length - 17); // 20 chars max

    // Random data for payment
    const names = ["rahul", "anjali", "ravi", "priya", "amit", "neha"];
    const banks = ["ICICI", "HDFC", "SBI", "AXIS", "PNB", "BOB"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomBank = banks[Math.floor(Math.random() * banks.length)];

    // Format phone number according to spec: +91XXXXXXXXXX (12 digits total)
    const mobileStr =
      typeof customer_mobile === 'string'
        ? customer_mobile.trim()
        : String(customer_mobile ?? '').trim();
    let formattedPhone = mobileStr;
    if (mobileStr && !mobileStr.startsWith('+91')) {
      const cleanPhone = mobileStr.replace(/^\+?91?/, '');
      if (cleanPhone.length === 10) {
        formattedPhone = `+91${cleanPhone}`;
      } else {
        formattedPhone = `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
      }
    }

    // Prepare payment parameters (exclude sign initially)
    // Get payment types from environment or use defaults
    const paymentTypesConfig = process.env.RUPEERUSH_PAYMENT_TYPES || "INRO, INRT, SCAN";
    const paymentTypes = paymentTypesConfig.split(',').map(type => type.trim());

    console.log('Available payment types:', paymentTypes);

    const clientIp = getRupeeRushClientIp(req);
    if (!clientIp) {
      return res.status(400).json({
        code: 400,
        message:
          "Could not determine payer IP. Configure nginx/apache to pass X-Forwarded-For (or set RUPEERUSH_DEFAULT_CLIENT_IP in config.env).",
      });
    }

    // Rupee Rush docs/samples often use "ip" (not "clientIp"); wrong key → upstream "Invalid IP address: undefined"
    const ipJsonKey = process.env.RUPEERUSH_IP_JSON_KEY || "ip";

    const params = {
      merNo: MER_NO,
      currencyCode: "INR",
      payType: "SCAN", // Will be updated in the loop
      randomNo: randomNo,
      outTradeNo: outTradeNo,
      totalAmount: parseFloat(amount).toFixed(2),
      notifyUrl: `${process.env.SERVER_URL}/rupeeRushCallback`,
      payCardNo: "123456", // Fixed value as per documentation
      payBankCode: "PAY", // Fixed value as per documentation
      payName: customer_name || randomName,
      payEmail: customer_email || `${randomName}${Math.floor(Math.random() * 9000 + 1000)}@email.com`,
      payPhone: formattedPhone,
      [ipJsonKey]: clientIp,
    };

    // Generate signature according to documentation
    const generateSign = (params, merchantKey) => {
      // Filter out empty values and sign field
      const filteredParams = {};
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (key !== 'sign' && value !== null && value !== '' && value !== undefined && value !== false) {
          filteredParams[key] = value;
        }
      });

      // Sort by ASCII (lexicographical order)
      const sortedKeys = Object.keys(filteredParams).sort();
      const sortedParams = {};
      sortedKeys.forEach(key => {
        sortedParams[key] = filteredParams[key];
      });

      // Create JSON string and append merchant key
      const jsonStr = JSON.stringify(sortedParams);
      const stringToSign = jsonStr + merchantKey;

      console.log('String to sign:', stringToSign);

      // MD5 hash and convert to uppercase
      return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
    };

    params.sign = generateSign(params, SECRET_KEY);

    console.log('Rupee Rush Request Params:', JSON.stringify(params, null, 2));

    // Create axios instance with SSL bypass for Rupee Rush API (IPv4 egress for whitelist)
    const rupeeRushAxios = axios.create({
      httpsAgent: createRupeeRushHttpsAgent(),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/Rupee-Rush-Client'
      },
      maxRedirects: 5
    });

    // Try different payment types if one fails
    let lastError = null;
    let result = null;

    for (let i = 0; i < paymentTypes.length; i++) {
      const currentPayType = paymentTypes[i];
      params.payType = currentPayType;

      // Regenerate signature with new payType
      params.sign = generateSign(params, SECRET_KEY);

      console.log(`Trying payment type: ${currentPayType}`);
      console.log('Rupee Rush Request Params:', JSON.stringify(params, null, 2));

      try {
        // Make API request to Rupee Rush
        const response = await rupeeRushAxios.post(PAY_URL, params);
        result = response.data;

        console.log('Rupee Rush Response:', result);

        if (result.resultCode === "0000" && result.payURL) {
          // Success! Store transaction in database
          const lastTrans = await Trans.findOne().sort({ number: -1 });
          const newIncrement = lastTrans ? lastTrans.number + 1 : 1;

          await Trans.create({
            id: outTradeNo,
            number: newIncrement,
            date: Date.now(),
            userId: parseInt(userId),
            amount: parseFloat(amount),
            status: "created",
            gateway: "RupeeRush",
            gatewayOrderId: result.payOrderNo,
            paymentType: currentPayType,
            name: customer_name || randomName,
            email: customer_email || params.payEmail,
            phone: customer_mobile,
            paymentUrl: result.payURL
          });

          return res.status(200).json({
            code: 200,
            message: 'Payment URL generated successfully',
            payment_url: result.payURL,
            order_id: outTradeNo,
            gateway_order_id: result.payOrderNo,
            payment_type: currentPayType
          });
        } else if (result.resultCode === "9999" && result.stateInfo && result.stateInfo.includes('temporarily unavailable')) {
          // Payment type temporarily unavailable, try next one
          console.log(`Payment type ${currentPayType} temporarily unavailable: ${result.stateInfo}`);
          lastError = result;
          continue;
        } else {
          // Other error, try next payment type
          console.log(`Payment type ${currentPayType} failed: ${result.stateInfo || result.resultMsg}`);
          lastError = result;
          continue;
        }
      } catch (error) {
        console.error(`Error with payment type ${currentPayType}:`, error.message);
        lastError = { error: error.message, payType: currentPayType };
        continue;
      }
    }

    // All payment types failed
    console.error('All payment types failed. Last error:', lastError);
    return res.status(400).json({
      code: 400,
      message: lastError?.stateInfo || lastError?.resultMsg || lastError?.error || 'All payment methods temporarily unavailable',
      resultCode: lastError?.resultCode || 'ALL_FAILED',
      triedPaymentTypes: paymentTypes
    });

  } catch (error) {
    console.error('Rupee Rush Create Order Error:', error);

    // Log more details about the error
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }

    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
};

// Rupee Rush Payment Callback Handler
export const rupeeRushCallback = async (req, res) => {
  try {
    console.log('Rupee Rush Callback received:', req.body);

    const {
      merNo,
      outTradeNo,
      payOrderNo,
      totalAmount,
      currencyCode,
      payState,
      payType,
      payDate,
      sign
    } = req.body;

    // Validate required callback parameters
    if (!outTradeNo || !payOrderNo || !totalAmount || !payState) {
      console.error('Missing required callback parameters');
      return res.status(400).send('FAIL');
    }

    // Verify signature
    const SECRET_KEY = process.env.RUPEERUSH_SECRET_KEY || "697F58B0E39DDC16C8B86286F591ED29";

    const generateCallbackSign = (params, merchantKey) => {
      // Filter out empty values and sign field
      const filteredParams = {};
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (key !== 'sign' && value !== null && value !== '' && value !== undefined && value !== false) {
          filteredParams[key] = value;
        }
      });

      // Sort by ASCII (lexicographical order)
      const sortedKeys = Object.keys(filteredParams).sort();
      const sortedParams = {};
      sortedKeys.forEach(key => {
        sortedParams[key] = filteredParams[key];
      });

      // Create JSON string and append merchant key
      const jsonStr = JSON.stringify(sortedParams);
      const stringToSign = jsonStr + merchantKey;

      console.log('Callback string to sign:', stringToSign);

      // MD5 hash and convert to uppercase
      return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
    };

    const expectedSign = generateCallbackSign(req.body, SECRET_KEY);

    console.log('Signature verification:');
    console.log('Received sign:', sign);
    console.log('Expected sign:', expectedSign);

    if (sign !== expectedSign) {
      console.error('Invalid signature in callback');
      console.error('Signature mismatch - callback rejected');
      return res.status(400).send('FAIL');
    }

    console.log('Signature verified successfully');

    // Find the transaction
    const transaction = await Trans.findOne({ id: outTradeNo });
    if (!transaction) {
      console.error('Transaction not found:', outTradeNo);
      return res.status(404).send('FAIL');
    }

    // Check if already processed
    if (transaction.status === 'success') {
      console.log('Transaction already processed:', outTradeNo);
      return res.status(200).send('SUCCESS');
    }

    // Process successful payment
    if (payState === "0000") {
      const user = await User.findOne({ id: transaction.userId });
      if (!user) {
        console.error('User not found for transaction:', outTradeNo);
        return res.status(404).send('FAIL');
      }

      const amount = parseFloat(totalAmount);

      // Update transaction status
      await Trans.updateOne(
        { id: outTradeNo },
        {
          status: 'success',
          gatewayOrderId: payOrderNo,
          completedAt: Date.now()
        }
      );

      // Credit Commission
      await creditCommission('PACKAGE_PURCHASE', transaction.userId, amount, outTradeNo);
      await creditCommission('KYC_PAYMENT', transaction.userId, amount, outTradeNo);

      // Process recharge logic (similar to existing gateways)
      const date = new Date();
      const localDate = (date / 1000 + 19800) * 1000;
      const newDatefor = new Date(localDate);
      const day = newDatefor.getDate();
      const month = newDatefor.getMonth() + 1;
      const year = newDatefor.getFullYear();

      var daySorted = day < 10 ? `0${day}` : `${day}`;
      var monthSorted = month < 10 ? `0${month}` : `${month}`;
      const newDate = `${daySorted}-${monthSorted}-${year}`;
      const todayProfit = `${day}/${month}/${year}`;

      // Update daily statistics
      await daily.updateOne(
        { id: newDate },
        { $inc: { count: +1, amount: amount } },
        { upsert: true }
      );

      var firstRecharge = 0;
      var bonusAmount = amount;

      // First recharge bonus logic
      if (!user.firstRecharge) {
        firstRecharge = amount;

        // Give referral bonus to upline
        if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
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

          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: {
                amount: +151,
                [`todayProfit.${todayProfit}.referral`]: +151,
                totalReferral: +151
              },
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
        }

        // First recharge bonus (10%)
        const bonus = (amount * 10) / 100;
        bonusAmount = amount + bonus;

        // Update user with first recharge
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
                note: `Add money ID: ${transaction.number}`,
              },
            },
          }
        );

        // Level commissions for first recharge
        const level0profit = (amount * 3) / 100;

        if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
          await User.updateOne(
            { id: user.upLine[0] },
            { $inc: { balance: level0profit } }
          );

          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: {
                amount: level0profit,
                [`todayProfit.${todayProfit}.level0`]: level0profit,
                totalLevel0: level0profit,
              },
              $push: {
                history: {
                  credit: "wallet",
                  amount: level0profit,
                  note: `Recharge bonus: ${user.id}`,
                  date: Date.now(),
                },
              },
            },
            { upsert: true }
          );
        }
      } else {
        // Subsequent recharge bonus (3% for amounts > 200)
        var bonus = 0;
        if (amount > 200) {
          bonus = (amount * 3) / 100;
          bonusAmount = amount + bonus;
        }

        await User.updateOne(
          { id: user.id },
          {
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
                note: `Add money ID: ${transaction.number}`,
              },
            },
          }
        );

        // Level commissions for subsequent recharge
        const level0profit = (amount * 3) / 100;

        if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
          await User.updateOne(
            { id: user.upLine[0] },
            { $inc: { balance: level0profit } }
          );

          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: {
                amount: level0profit,
                [`todayProfit.${todayProfit}.level0`]: level0profit,
                totalLevel0: level0profit,
              },
              $push: {
                history: {
                  credit: "wallet",
                  amount: level0profit,
                  note: `Recharge bonus: ${user.id}`,
                  date: Date.now(),
                },
              },
            },
            { upsert: true }
          );
        }
      }

      // Update promotion data for upline levels
      const userDate = new Date(user.date);
      const userDateLocal = (userDate / 1000 + 19800) * 1000;
      const newuserDate = new Date(userDateLocal);
      const dayMonth = `${day}/${month}/${year}`;
      const userday = newuserDate.getDate();
      const usermonth = newuserDate.getMonth() + 1;
      const userYear = newuserDate.getFullYear();
      const userdayMonth = `${userday}/${usermonth}/${userYear}`;

      if (dayMonth === userdayMonth && user.upLine) {
        // Handle all levels (0-6) for today's recharge
        for (let i = 0; i < 7; i++) {
          if (user.upLine[i] && user.upLine[i] !== "null") {
            await promotion.updateOne(
              { userId: user.upLine[i] },
              {
                userId: user.upLine[i],
                $inc: {
                  [`newlevel${i}.${dayMonth}.${user.phone}.todayRecharge`]: amount,
                },
              },
              { upsert: true }
            );
          }
        }
      }

      if (user.upLine) {
        // Handle all levels (0-6) for total recharge and first recharge
        for (let i = 0; i < 7; i++) {
          if (user.upLine[i] && user.upLine[i] !== "null") {
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

      console.log('Rupee Rush payment processed successfully:', outTradeNo);
      return res.status(200).send('SUCCESS');
    } else {
      // Payment failed
      await Trans.updateOne(
        { id: outTradeNo },
        {
          status: 'failed',
          failureReason: `Payment failed with status: ${payState}`,
          completedAt: Date.now()
        }
      );

      console.log('Rupee Rush payment failed:', outTradeNo, 'payState:', payState);
      return res.status(200).send('SUCCESS');
    }

  } catch (error) {
    console.error('Rupee Rush Callback Error:', error);
    return res.status(500).send('FAIL');
  }
};

// ============================
// WatchPay Gateway Integration
// ============================

// WatchPay Create Order
export const watchPayCreateOrder = async (req, res) => {
  try {
    const userId = req.params.id;
    const customer_mobile = req.body.customer_mobile || req.user?.phone;
    const customer_name = req.body.customer_name || req.user?.username || 'User';
    const customer_email = req.body.customer_email || req.user?.email || 'user@example.com';
    const amount = req.body.amount;

    // Validate required fields
    if (!amount || !userId || !customer_mobile) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required fields: amount, userId, customer_mobile'
      });
    }

    // Check if user exists and is not blocked
    const user = await User.findOne({ id: parseInt(userId) });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User not found'
      });
    }

    if (user.block) {
      return res.status(400).json({
        code: 400,
        message: 'Account suspended'
      });
    }

    // Check if user is demo user
    if (user.demo) {
      // For demo users, simulate successful payment
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncrement = lastTrans ? lastTrans.number + 1 : 1;

      await Trans.create({
        id: `DEMO_${Date.now()}`,
        number: newIncrement,
        date: Date.now(),
        userId: parseInt(userId),
        amount: parseFloat(amount),
        status: "success",
        gateway: "WatchPay",
        name: customer_name || "Demo User",
        email: customer_email || "demo@example.com",
        phone: customer_mobile,
      });

      // Update user balance for demo
      await User.updateOne(
        { id: parseInt(userId) },
        { $inc: { balance: parseFloat(amount) } }
      );

      return res.status(200).json({
        code: 200,
        message: 'Demo payment successful',
        redirect_url: `${process.env.CLIENT_URL}/#/wallet/RechargeHistory`
      });
    }

    // WatchPay API Configuration
    const API_URL = process.env.WATCHPAY_API_URL || "https://api.watchglb.com/pay/web";
    const MCH_ID = process.env.WATCHPAY_MCH_ID || "100225573";
    const MERCHANT_KEY = process.env.WATCHPAY_MERCHANT_KEY || "4444ddddd68344ab8207a6f40a076bc7";

    // Generate unique order number
    const mchOrderNo = Date.now().toString() + Math.floor(Math.random() * 1000);
    const orderDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Prepare payment parameters
    const params = {
      version: "1.0",
      mch_id: MCH_ID,
      notify_url: `${process.env.SERVER_URL}/watchPayCallback`,
      page_url: `${process.env.CLIENT_URL}/#/wallet/RechargeHistory`,
      mch_order_no: mchOrderNo,
      pay_type: "101",
      trade_amount: parseFloat(amount).toString(),
      order_date: orderDate,
      goods_name: "Recharge",
      mch_return_msg: "test",
      sign_type: "MD5"
    };

    // Generate signature
    const generateWatchPaySign = (params, merchantKey) => {
      // Filter out empty values and sign field
      const filteredParams = {};
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== "" && value !== null && value !== undefined && key !== "sign" && key !== "sign_type") {
          filteredParams[key] = value;
        }
      });

      // Sort by key name
      const sortedKeys = Object.keys(filteredParams).sort();

      // Create query string
      let queryString = "";
      sortedKeys.forEach(key => {
        queryString += key + "=" + filteredParams[key] + "&";
      });
      queryString += "key=" + merchantKey;

      console.log('WatchPay String to sign:', queryString);

      // MD5 hash and convert to lowercase
      return crypto.createHash('md5').update(queryString).digest('hex').toLowerCase();
    };

    params.sign = generateWatchPaySign(params, MERCHANT_KEY);

    console.log('WatchPay Request Params:', JSON.stringify(params, null, 2));

    // Create axios instance
    const watchPayAxios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
      }),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Convert params to form-urlencoded format
    const formData = new URLSearchParams(params).toString();

    // Make API request
    const response = await watchPayAxios.post(API_URL, formData);
    const result = response.data;

    console.log('WatchPay Response:', result);

    if (result.respCode === "SUCCESS" && result.payInfo) {
      // Store transaction in database
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncrement = lastTrans ? lastTrans.number + 1 : 1;

      await Trans.create({
        id: mchOrderNo,
        number: newIncrement,
        createDate: Date.now(),
        date: Date.now(),
        userId: parseInt(userId),
        amount: parseFloat(amount),
        status: "created",
        gateway: "WatchPay",
        gatewayOrderId: result.orderNo,
        name: customer_name || "Customer",
        email: customer_email || "",
        phone: customer_mobile,
        paymentUrl: result.payInfo
      });

      return res.status(200).json({
        code: 200,
        message: 'Payment URL generated successfully',
        payment_url: result.payInfo,
        order_id: mchOrderNo,
        gateway_order_id: result.orderNo
      });
    } else {
      console.error('WatchPay API Error:', result);
      return res.status(400).json({
        code: 400,
        message: result.respMsg || 'Payment gateway error',
        respCode: result.respCode
      });
    }

  } catch (error) {
    console.error('WatchPay Create Order Error:', error);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }

    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// WatchPay Payment Callback Handler
export const watchPayCallback = async (req, res) => {
  try {
    console.log('WatchPay Callback received:', req.body);

    const {
      tradeResult,
      mchId,
      mchOrderNo,
      oriAmount,
      originalAmount,
      amount,
      orderDate,
      orderNo,
      merRetMsg,
      signType,
      sign
    } = req.body;

    // Use oriAmount or originalAmount (PHP uses both)
    const finalOriAmount = oriAmount || originalAmount;

    // Validate required callback parameters
    if (!mchOrderNo || !orderNo || !tradeResult) {
      console.error('Missing required callback parameters');
      return res.status(400).send('sign error');
    }

    // Verify signature
    const MERCHANT_KEY = process.env.WATCHPAY_MERCHANT_KEY || "4444ddddd68344ab8207a6f40a076bc7";

    const generateCallbackSign = (params, merchantKey) => {
      // Create a copy and remove sign and signType
      const filteredParams = {};
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== "" && value !== null && value !== undefined && key !== "sign" && key !== "signType") {
          filteredParams[key] = value;
        }
      });

      // Sort by key name
      const sortedKeys = Object.keys(filteredParams).sort();

      // Create query string
      let queryString = "";
      sortedKeys.forEach(key => {
        queryString += key + "=" + filteredParams[key] + "&";
      });
      queryString += "key=" + merchantKey;

      console.log('WatchPay Callback string to sign:', queryString);

      // MD5 hash and convert to lowercase
      return crypto.createHash('md5').update(queryString).digest('hex').toLowerCase();
    };

    const expectedSign = generateCallbackSign(req.body, MERCHANT_KEY);

    console.log('WatchPay Signature verification:');
    console.log('Received sign:', sign);
    console.log('Expected sign:', expectedSign);

    if (sign !== expectedSign) {
      console.error('Invalid signature in callback');
      console.error('Signature mismatch - callback rejected');
      return res.status(400).send('sign error');
    }

    console.log('Signature verified successfully');

    // Check if payment successful
    if (tradeResult !== "1") {
      console.log('WatchPay payment failed:', mchOrderNo, 'tradeResult:', tradeResult);
      return res.status(200).send('fail');
    }

    // Find the transaction
    const transaction = await Trans.findOne({ id: mchOrderNo });
    if (!transaction) {
      console.error('Transaction not found:', mchOrderNo);
      return res.status(200).send('success'); // Still return success to avoid repeated callbacks
    }

    // Check if already processed
    if (transaction.status === 'success') {
      console.log('Transaction already processed:', mchOrderNo);
      return res.status(200).send('success');
    }

    // Find user
    const user = await User.findOne({ id: transaction.userId });
    if (!user) {
      console.error('User not found for transaction:', mchOrderNo);
      return res.status(200).send('success');
    }

    const paymentAmount = parseFloat(transaction.amount);

    // Update transaction status
    await Trans.updateOne(
      { id: mchOrderNo },
      {
        status: 'success',
        gatewayOrderId: orderNo,
        completedAt: Date.now()
      }
    );

    // Credit Commission
    await creditCommission('PACKAGE_PURCHASE', transaction.userId, paymentAmount, mchOrderNo);
    await creditCommission('KYC_PAYMENT', transaction.userId, paymentAmount, mchOrderNo);

    // Process recharge logic
    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDatefor = new Date(localDate);
    const day = newDatefor.getDate();
    const month = newDatefor.getMonth() + 1;
    const year = newDatefor.getFullYear();

    var daySorted = day < 10 ? `0${day}` : `${day}`;
    var monthSorted = month < 10 ? `0${month}` : `${month}`;
    const newDate = `${daySorted}-${monthSorted}-${year}`;
    const todayProfit = `${day}/${month}/${year}`;

    // Update daily statistics
    await daily.updateOne(
      { id: newDate },
      { $inc: { count: +1, amount: paymentAmount } },
      { upsert: true }
    );

    var firstRecharge = 0;
    var bonusAmount = paymentAmount;

    // Check if this is first recharge
    const rechargeCount = await Trans.countDocuments({
      userId: transaction.userId,
      status: 'success',
      gateway: { $in: ['lgPay', 'WatchPay', 'RupeeRush', 'UzPay', 'Cashfree', 'PhonePe', 'Razorpay'] }
    });

    // First recharge bonus logic
    if (!user.firstRecharge || rechargeCount === 1) {
      firstRecharge = paymentAmount;

      console.log('🎉 First recharge for user', user.id);

      // Give referral bonus to upline (10% of recharge amount)
      if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
        const referralBonus = Math.round(paymentAmount * 0.10 * 100) / 100; // 10%

        await User.updateOne(
          { id: user.upLine[0] },
          {
            $inc: { balance: referralBonus },
            $push: {
              walletHistory: {
                amount: referralBonus,
                date: Date.now(),
                credit: true,
                note: `Referral Reward User: ${user.id}`,
              },
            },
          }
        );

        await offerBonus.updateOne(
          { userId: user.upLine[0] },
          {
            userId: user.upLine[0],
            $inc: {
              amount: referralBonus,
              [`todayProfit.${todayProfit}.referral`]: referralBonus,
              totalReferral: referralBonus
            },
            $push: {
              history: {
                credit: "wallet",
                amount: referralBonus,
                note: `Referral Reward User: ${user.id}`,
                date: Date.now(),
              },
            },
          },
          { upsert: true }
        );

        console.log(`🎁 Referral reward of ${referralBonus} given to user ${user.upLine[0]}`);
      }

      // Update user with first recharge
      await User.updateOne(
        { id: transaction.userId },
        {
          firstRecharge: true,
          $inc: { balance: bonusAmount },
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
              note: `Add money ID: ${transaction.number}`,
            },
          },
        }
      );

      // Level commissions for first recharge
      const level0profit = (paymentAmount * 3) / 100;

      if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
        await User.updateOne(
          { id: user.upLine[0] },
          { $inc: { balance: level0profit } }
        );

        await offerBonus.updateOne(
          { userId: user.upLine[0] },
          {
            userId: user.upLine[0],
            $inc: {
              amount: level0profit,
              [`todayProfit.${todayProfit}.level0`]: level0profit,
              totalLevel0: level0profit,
            },
            $push: {
              history: {
                credit: "wallet",
                amount: level0profit,
                note: `Recharge bonus: ${user.id}`,
                date: Date.now(),
              },
            },
          },
          { upsert: true }
        );
      }
    } else {
      // Subsequent recharge bonus (3% for amounts > 200)
      if (paymentAmount > 200) {
        const level0profit = (paymentAmount * 3) / 100;
        bonusAmount = paymentAmount + level0profit;

        if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
          await User.updateOne(
            { id: user.upLine[0] },
            { $inc: { balance: level0profit } }
          );

          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: {
                amount: level0profit,
                [`todayProfit.${todayProfit}.level0`]: level0profit,
                totalLevel0: level0profit,
              },
              $push: {
                history: {
                  credit: "wallet",
                  amount: level0profit,
                  note: `Recharge bonus: ${user.id}`,
                  date: Date.now(),
                },
              },
            },
            { upsert: true }
          );
        }
      }

      // Update user balance
      await User.updateOne(
        { id: transaction.userId },
        {
          $inc: { balance: bonusAmount },
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
              note: `Add money ID: ${transaction.number}`,
            },
          },
        }
      );
    }

    // Update promotion data for upline levels
    const userDate = new Date(user.date);
    const userDateLocal = (userDate / 1000 + 19800) * 1000;
    const newuserDate = new Date(userDateLocal);
    const dayMonth = `${day}/${month}/${year}`;
    const userday = newuserDate.getDate();
    const usermonth = newuserDate.getMonth() + 1;
    const userYear = newuserDate.getFullYear();
    const userdayMonth = `${userday}/${usermonth}/${userYear}`;

    if (dayMonth === userdayMonth && user.upLine) {
      // Handle all levels (0-6) for today's recharge
      for (let i = 0; i < 7; i++) {
        if (user.upLine[i] && user.upLine[i] !== "null") {
          await promotion.updateOne(
            { userId: user.upLine[i] },
            {
              userId: user.upLine[i],
              $inc: {
                [`newlevel${i}.${dayMonth}.${user.phone}.todayRecharge`]: paymentAmount,
              },
            },
            { upsert: true }
          );
        }
      }
    } else if (user.upLine) {
      // Handle all levels for total recharge
      for (let i = 0; i < 7; i++) {
        if (user.upLine[i] && user.upLine[i] !== "null") {
          await promotion.updateOne(
            { userId: user.upLine[i] },
            {
              userId: user.upLine[i],
              $inc: {
                [`level${i}.${user.phone}.totalRecharge`]: paymentAmount,
              },
            },
            { upsert: true }
          );
        }
      }
    }

    console.log('WatchPay payment processed successfully:', mchOrderNo);
    return res.status(200).send('success');

  } catch (error) {
    console.error('WatchPay Callback Error:', error);
    return res.status(500).send('fail');
  }
};

// ============================
// lgPay Gateway Integration
// ============================

// lgPay Create Order
export const lgPayCreateOrder = async (req, res) => {
  try {
    const userId = req.params.id;
    const customer_mobile = req.body.customer_mobile || req.user?.phone;
    const customer_name = req.body.customer_name || req.user?.username || 'User';
    const customer_email = req.body.customer_email || req.user?.email || 'user@example.com';
    const amount = req.body.amount;

    // Validate required fields
    if (!amount || !userId || !customer_mobile) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required fields: amount, userId, customer_mobile'
      });
    }

    // Check if user exists and is not blocked
    const user = await User.findOne({ id: parseInt(userId) });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User not found'
      });
    }

    if (user.block) {
      return res.status(400).json({
        code: 400,
        message: 'Account suspended'
      });
    }

    // Check if user is demo user
    if (user.demo) {
      // For demo users, simulate successful payment
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncrement = lastTrans ? lastTrans.number + 1 : 1;

      await Trans.create({
        id: `DEMO_${Date.now()}`,
        number: newIncrement,
        date: Date.now(),
        userId: parseInt(userId),
        amount: parseFloat(amount),
        status: "success",
        gateway: "lgPay",
        name: customer_name || "Demo User",
        email: customer_email || "demo@example.com",
        phone: customer_mobile,
      });

      // Update user balance for demo
      await User.updateOne(
        { id: parseInt(userId) },
        { $inc: { balance: parseFloat(amount) } }
      );

      return res.status(200).json({
        code: 200,
        message: 'Demo payment successful',
        redirect_url: `${process.env.CLIENT_URL}/#/wallet/RechargeHistory`
      });
    }

    // lgPay API Configuration
    const API_URL = process.env.LGPAY_API_URL || "https://www.lg-pay.com/api/order/create";
    const APP_ID = process.env.LGPAY_APP_ID || "YD4179";
    const SECRET_KEY = process.env.LGPAY_SECRET_KEY || "Y1CJKWSbcOkSQQsxi0ztanJe5li3nxh1";

    // Generate unique order number
    const date = new Date();
    const dateStr = date.toISOString().replace(/[-:T]/g, '').substring(0, 8);
    const timestamp = Math.floor(Date.now() / 1000);
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    const orderSn = `${dateStr}${timestamp}${randomNum}`;

    // Format amount with 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Convert amount to paise (multiply by 100)
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    // Get client IP address
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      '127.0.0.1';

    // Prepare payment parameters
    const params = {
      ip: clientIp,
      remark: 'lg pay',
      notify_url: `${process.env.SERVER_URL}/lgPayCallback`,
      money: amountInPaise.toString(),
      app_id: APP_ID,
      trade_type: 'INRUPI',
      order_sn: orderSn,
      return_url: `${process.env.CLIENT_URL}/#/wallet/RechargeHistory`
    };

    // Generate signature
    const generateLgPaySign = (params, secretKey) => {
      // Sort by key name
      const sortedKeys = Object.keys(params).sort();

      // Create query string
      let signString = "";
      sortedKeys.forEach(key => {
        signString += key + "=" + params[key] + "&";
      });
      signString += "key=" + secretKey;

      console.log('lgPay String to sign:', signString);

      // MD5 hash and convert to UPPERCASE
      return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    };

    params.sign = generateLgPaySign(params, SECRET_KEY);

    console.log('lgPay Request Params:', JSON.stringify(params, null, 2));

    // Create axios instance
    const lgPayAxios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
      }),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Convert params to form-urlencoded format
    const formData = new URLSearchParams(params).toString();

    // Make API request
    const response = await lgPayAxios.post(API_URL, formData);
    const result = response.data;

    console.log('lgPay Response:', result);

    if (result.status === 1 && result.data && result.data.pay_url) {
      // Store transaction in database
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncrement = lastTrans ? lastTrans.number + 1 : 1;

      await Trans.create({
        id: orderSn,
        number: newIncrement,
        date: Date.now(),
        userId: parseInt(userId),
        amount: parseFloat(formattedAmount),
        status: "created",
        gateway: "lgPay",
        gatewayOrderId: orderSn,
        name: customer_name || "Customer",
        email: customer_email || "",
        phone: customer_mobile,
        paymentUrl: result.data.pay_url
      });

      return res.status(200).json({
        code: 200,
        message: 'Payment URL generated successfully',
        payment_url: result.data.pay_url,
        order_id: orderSn,
        amount: formattedAmount
      });
    } else {
      console.error('lgPay API Error:', result);
      return res.status(400).json({
        code: 400,
        message: result.msg || result.message || 'Payment gateway error',
        status: result.status
      });
    }

  } catch (error) {
    console.error('lgPay Create Order Error:', error);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }

    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// lgPay Payment Callback Handler
export const lgPayCallback = async (req, res) => {
  try {
    console.log('lgPay Callback received:', req.body);

    const {
      order_sn,
      money,
      status,
      pay_time,
      msg,
      remark,
      sign
    } = req.body;

    // Validate required callback parameters
    if (!order_sn || !money || !status) {
      console.error('Missing required callback parameters');
      return res.status(400).json({
        message: 'fail(sign not exists)',
        status: false
      });
    }

    // Verify signature
    const SECRET_KEY = process.env.LGPAY_SECRET_KEY || "Y1CJKWSbcOkSQQsxi0ztanJe5li3nxh1";

    const generateCallbackSign = (params, secretKey) => {
      // Filter params for signature
      const paramArray = {
        order_sn: params.order_sn,
        money: params.money,
        status: params.status,
        pay_time: params.pay_time,
        msg: params.msg,
        remark: params.remark
      };

      // Filter out null/undefined values
      const filteredParams = {};
      Object.keys(paramArray).forEach(key => {
        const value = paramArray[key];
        if (value !== null && value !== '' && value !== undefined) {
          filteredParams[key] = value;
        }
      });

      // Sort by key name
      const sortedKeys = Object.keys(filteredParams).sort();

      // Create query string
      let signString = "";
      sortedKeys.forEach(key => {
        signString += key + "=" + filteredParams[key] + "&";
      });
      signString += "key=" + secretKey;

      console.log('lgPay Callback string to sign:', signString);

      // MD5 hash and convert to UPPERCASE
      return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    };

    const expectedSign = generateCallbackSign(req.body, SECRET_KEY);

    console.log('lgPay Signature verification:');
    console.log('Received sign:', sign);
    console.log('Expected sign:', expectedSign);

    if (sign !== expectedSign) {
      console.error('Invalid signature in callback');
      console.error('Signature mismatch - callback rejected');
      return res.status(400).json({
        message: 'fail(verify fail)',
        status: false
      });
    }

    console.log('Signature verified successfully');

    // Find the transaction
    const transaction = await Trans.findOne({ id: order_sn });
    if (!transaction) {
      console.error('Transaction not found:', order_sn);
      return res.status(200).send('ok'); // Still return ok to avoid repeated callbacks
    }

    // Check if already processed
    if (transaction.status === 'success') {
      console.log('Transaction already processed:', order_sn);
      return res.status(200).send('ok');
    }

    // Find user
    const user = await User.findOne({ id: transaction.userId });
    if (!user) {
      console.error('User not found for transaction:', order_sn);
      return res.status(200).send('ok');
    }

    const paymentAmount = parseFloat(transaction.amount);

    // Update transaction status
    await Trans.updateOne(
      { id: order_sn },
      {
        status: 'success',
        completedAt: Date.now()
      }
    );

    // Credit Commission
    await creditCommission('PACKAGE_PURCHASE', transaction.userId, paymentAmount, order_sn);
    await creditCommission('KYC_PAYMENT', transaction.userId, paymentAmount, order_sn);

    // Process recharge logic
    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDatefor = new Date(localDate);
    const day = newDatefor.getDate();
    const month = newDatefor.getMonth() + 1;
    const year = newDatefor.getFullYear();

    var daySorted = day < 10 ? `0${day}` : `${day}`;
    var monthSorted = month < 10 ? `0${month}` : `${month}`;
    const newDate = `${daySorted}-${monthSorted}-${year}`;
    const todayProfit = `${day}/${month}/${year}`;

    // Update daily statistics
    await daily.updateOne(
      { id: newDate },
      { $inc: { count: +1, amount: paymentAmount } },
      { upsert: true }
    );

    var firstRecharge = 0;
    var bonusAmount = paymentAmount;

    // Check if this is first recharge
    const rechargeCount = await Trans.countDocuments({
      userId: transaction.userId,
      status: 'success',
      gateway: { $in: ['lgPay', 'WatchPay', 'RupeeRush', 'UzPay', 'Cashfree', 'PhonePe', 'Razorpay'] }
    });

    // First recharge bonus logic
    if (!user.firstRecharge || rechargeCount === 1) {
      firstRecharge = paymentAmount;

      console.log('🎉 First recharge for user', user.id);

      // Give referral bonus to upline (10% of recharge amount)
      if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
        const referralBonus = Math.round(paymentAmount * 0.10 * 100) / 100; // 10%

        await User.updateOne(
          { id: user.upLine[0] },
          {
            $inc: { balance: referralBonus },
            $push: {
              walletHistory: {
                amount: referralBonus,
                date: Date.now(),
                credit: true,
                note: `Referral Reward User: ${user.id}`,
              },
            },
          }
        );

        await offerBonus.updateOne(
          { userId: user.upLine[0] },
          {
            userId: user.upLine[0],
            $inc: {
              amount: referralBonus,
              [`todayProfit.${todayProfit}.referral`]: referralBonus,
              totalReferral: referralBonus
            },
            $push: {
              history: {
                credit: "wallet",
                amount: referralBonus,
                note: `Referral Reward User: ${user.id}`,
                date: Date.now(),
              },
            },
          },
          { upsert: true }
        );

        console.log(`🎁 Referral reward of ${referralBonus} given to user ${user.upLine[0]}`);
      }

      // Update user with first recharge
      await User.updateOne(
        { id: transaction.userId },
        {
          firstRecharge: true,
          $inc: { balance: bonusAmount },
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
              note: `Add money ID: ${transaction.number}`,
            },
          },
        }
      );

      // Level commissions for first recharge
      const level0profit = (paymentAmount * 3) / 100;

      if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
        await User.updateOne(
          { id: user.upLine[0] },
          { $inc: { balance: level0profit } }
        );

        await offerBonus.updateOne(
          { userId: user.upLine[0] },
          {
            userId: user.upLine[0],
            $inc: {
              amount: level0profit,
              [`todayProfit.${todayProfit}.level0`]: level0profit,
              totalLevel0: level0profit,
            },
            $push: {
              history: {
                credit: "wallet",
                amount: level0profit,
                note: `Recharge bonus: ${user.id}`,
                date: Date.now(),
              },
            },
          },
          { upsert: true }
        );
      }
    } else {
      // Subsequent recharge bonus (3% for amounts > 200)
      if (paymentAmount > 200) {
        const level0profit = (paymentAmount * 3) / 100;
        bonusAmount = paymentAmount + level0profit;

        if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
          await User.updateOne(
            { id: user.upLine[0] },
            { $inc: { balance: level0profit } }
          );

          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: {
                amount: level0profit,
                [`todayProfit.${todayProfit}.level0`]: level0profit,
                totalLevel0: level0profit,
              },
              $push: {
                history: {
                  credit: "wallet",
                  amount: level0profit,
                  note: `Recharge bonus: ${user.id}`,
                  date: Date.now(),
                },
              },
            },
            { upsert: true }
          );
        }
      }

      // Update user balance
      await User.updateOne(
        { id: transaction.userId },
        {
          $inc: { balance: bonusAmount },
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
              note: `Add money ID: ${transaction.number}`,
            },
          },
        }
      );
    }

    // Update promotion data for upline levels
    const userDate = new Date(user.date);
    const userDateLocal = (userDate / 1000 + 19800) * 1000;
    const newuserDate = new Date(userDateLocal);
    const dayMonth = `${day}/${month}/${year}`;
    const userday = newuserDate.getDate();
    const usermonth = newuserDate.getMonth() + 1;
    const userYear = newuserDate.getFullYear();
    const userdayMonth = `${userday}/${usermonth}/${userYear}`;

    if (dayMonth === userdayMonth && user.upLine) {
      // Handle all levels (0-6) for today's recharge
      for (let i = 0; i < 7; i++) {
        if (user.upLine[i] && user.upLine[i] !== "null") {
          await promotion.updateOne(
            { userId: user.upLine[i] },
            {
              userId: user.upLine[i],
              $inc: {
                [`newlevel${i}.${dayMonth}.${user.phone}.todayRecharge`]: paymentAmount,
              },
            },
            { upsert: true }
          );
        }
      }
    } else if (user.upLine) {
      // Handle all levels for total recharge
      for (let i = 0; i < 7; i++) {
        if (user.upLine[i] && user.upLine[i] !== "null") {
          await promotion.updateOne(
            { userId: user.upLine[i] },
            {
              userId: user.upLine[i],
              $inc: {
                [`level${i}.${user.phone}.totalRecharge`]: paymentAmount,
              },
            },
            { upsert: true }
          );
        }
      }
    }

    console.log('lgPay payment processed successfully:', order_sn);
    return res.status(200).send('ok');

  } catch (error) {
    console.error('lgPay Callback Error:', error);
    return res.status(500).json({
      message: 'fail(database error)',
      status: false
    });
  }
};

// LG Pay Balance Fetch
export const lgPayBalanceFetch = async (req, res) => {
  try {
    // Check admin authentication
    const api = req.params.api;
    if (api !== process.env.AdminAPI) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized access"
      });
    }

    // LG Pay Balance API Configuration
    const APP_ID = process.env.LGPAY_APP_ID || "YD4179";
    const SECRET_KEY = process.env.LGPAY_SECRET_KEY || "Y1CJKWSbcOkSQQsxi0ztanJe5li3nxh1";
    const API_URL = "https://www.lg-pay.com/api/deposit/balance";

    // Current Unix timestamp in seconds
    const timestamp = Math.floor(Date.now() / 1000);

    // Prepare request parameters
    const params = {
      app_id: APP_ID,
      time: timestamp
    };

    // Generate signature (same as PHP logic)
    const generateLgPayBalanceSign = (params, secretKey) => {
      // Sort parameters alphabetically
      const sortedKeys = Object.keys(params).sort();

      // Create query string: key1=value1&key2=value2
      let signString = "";
      sortedKeys.forEach(key => {
        signString += key + "=" + params[key] + "&";
      });

      // Remove trailing "&" and append secret key
      signString = signString.slice(0, -1);
      signString += "&key=" + secretKey;

      console.log('LG Pay Balance String to sign:', signString);

      // MD5 hash and convert to UPPERCASE
      return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    };

    // Generate and add signature
    params.sign = generateLgPayBalanceSign(params, SECRET_KEY);

    console.log('LG Pay Balance Request Params:', JSON.stringify(params, null, 2));

    // Create axios instance with SSL config
    const lgPayAxios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Convert params to form data
    const formData = new URLSearchParams(params).toString();

    // Make API request (POST with form data)
    const response = await lgPayAxios.post(API_URL, formData);
    const result = response.data;

    console.log('LG Pay Balance Response:', JSON.stringify(result, null, 2));

    // Handle response
    if (result.status === 1) {
      // Balance is in cents, convert to actual amount
      const balanceInCents = parseFloat(result.data.balance || 0);
      const actualBalance = balanceInCents / 100;

      return res.status(200).json({
        status: "success",
        message: "Balance fetched successfully",
        balance: actualBalance.toFixed(2),
        balanceInCents: balanceInCents,
        data: result.data
      });
    } else {
      console.error('LG Pay Balance API Error:', result);
      return res.status(400).json({
        status: "error",
        message: result.msg || "Failed to fetch balance",
        data: result
      });
    }

  } catch (error) {
    console.error('LG Pay Balance Fetch Error:', error);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      error: error.response?.data || error.message
    });
  }
};

export const admPay = async (req, res) => {


  function generateSignature(data, privateKey) {
    // Sort the parameters by ASCII code (dictionary order)
    const sortedKeys = Object.keys(data).sort();
    let stringA = '';

    // Concatenate parameters into a string (key1=value1&key2=value2...)
    for (const key of sortedKeys) {
      const value = data[key];
      if (value !== null && value !== '') {
        stringA += `${key}=${value}&`;
      }
    }

    // Append the private key
    const stringSignTemp = stringA.slice(0, -1) + '&key=' + privateKey;

    // Perform MD5 operation and convert to lowercase
    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toLowerCase();
  }


  const privateKey = '68853b0b8e2a4e7cb16d36d431707f58';
  const url = 'https://api.wpay.one/v1/balance';
  const order_id = 'jhdvjhwg874hjd'; // Replace with your actual order ID
  const amount = '100.00'; // Replace with your actual amount
  const callbackurl = 'https://winkaro.online'; // Replace with your actual callback URL
  const data = {
    mchId: 1492,
    currency: 'INR',
    // out_trade_no: order_id,
    // pay_type: 'UPI',
    // money: amount,
    // notify_url: callbackurl,
    // returnUrl: `https://${process.env.SERVER_NAME}/success`, // Assuming you have SERVER_NAME in your environment
  };

  // Generate the signature
  data.sign = generateSignature(data, privateKey);

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'charset': 'utf-8',
      },
    });

    const responseData = response.data;

    // Check if the response contains the payment URL
    if (responseData.data && responseData.data.url) {
      const payment_link = responseData.data.url;

      // Update the payment_links table with the generated link (replace with your actual database logic)
      const update_sql = `UPDATE payment_links SET is_already_link = 'yes', bytevip_link = '${payment_link}' WHERE link_token = '${link_token}' AND order_id = '${order_id}'`;
      setXbyY(update_sql); // Replace setXbyY with your database update function

      // Redirect to the payment URL
      console.log(`Redirecting to: ${payment_link}`);
      // You would typically use a server-side redirect here (e.g., with Express.js res.redirect)
      // For this example, we'll just log the URL
    } else {
      console.error('No payment URL found in the response:', responseData);
    }
  } catch (error) {
    console.error('Error:', error);
  }


};

export const planetCreateLink = async (req, res) => {
  const amount = req.body.amount;
  const userId = req.body.userId;
  const name = req.body.customer_name;
  const email = req.body.customer_email;
  const phone = req.body.customer_mobile;

  const id = `ORD${Date.now()}`;

  const options = {
    method: "POST",
    url: "https://planetctechnology.com/planetcapi/api/v1/Payin",
    headers: {
      Authorization: planetC,
      "content-type": "application/x-www-form-urlencoded;charset=utf-8",

      //  authorization: `Bearer ${pToken}`
    },
    data: qs.stringify({
      amount: amount,
      clientReferenceNo: id,
      customer_name: name,
      customer_email: email,
      customer_mobile: phone,
      token_key: "7ff777d7221fa6cb2fdbf27f93dcbfc6",
      option: "Intent",
    }),
  };

  axios
    .request(options)
    .then(async function (response) {
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncreament = lastTrans.number + 1;
      await Trans.create({
        gateway: "PlanetC",
        txnId: response.data.data.data.merchantTransactionId,
        id,
        number: newIncreament,
        date: Date.now(),
        userId,
        amount: amount,
        status: "created",
      });

      res.status(200).send({ link: response.data.data.data.url });
    })
    .catch(function (error) {
      const options1 = {
        method: "POST",
        url: "https://planetctechnology.com/planetcapi/auth/user/generateToken",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",

          //  authorization: `Bearer ${pToken}`
        },
        data: qs.stringify({
          user_name: "8120441687",
          password: "abc@123",
        }),
      };

      axios
        .request(options1)
        .then(async function (response) {
          planetC = response.data.data.token;

          axios
            .request(options)
            .then(async function (response) {
              const lastTrans = await Trans.findOne().sort({ number: -1 });
              const newIncreament = lastTrans.number + 1;
              await Trans.create({
                gateway: "PlanetC",
                txnId: response.data.data.data.merchantTransactionId,
                id,
                number: newIncreament,
                date: Date.now(),
                userId,
                amount: amount,
                status: "created",
              });

              res.status(200).send({ link: response.data.data.data.url });
            })
            .catch(function (error) { });
        })
        .catch(function (error) { });
    });

  // const createOrder = await axios.post(
  //   "https://planetctechnology.com/planetcapi/api/v1/Payin",
  //   {
  //     headers: {
  //       'Authorization': planetC
  //     }
  //   },
  //   {
  //     "clientReferenceNo": id,
  //     "customer_name": 'Govind',
  //     "customer_email": 'ankitrt7@gmail.com',
  //     "customer_mobile": '9981583961',
  //     "token_key": "4b98bfc589a0f6ede1038caa5ea1d198",
  //     "option": 'Intent',
  //     }

  // );
  // console.log(createOrder.data);
  // if(!createOrder.data.status){

  //    const createToken = await axios.post(
  //   "https://planetctechnology.com/planetcapi/auth/user/generateToken",
  //   {
  //     "user_name":"9981583961",
  //     "password":"1111"
  //     }

  // );
  // planetC = createToken.data.data.token;
  // console.log(createToken.data);

  // // const createOrder = await axios.post(
  // //   "https://kindentsolutions.in/v3/generatePaymentLink",
  // //   {
  // //     "userKey":"KBSd5fc8ae951",
  // //     "userToken":"d0f0ee18231122dcf8b43931e7f339a0",
  // //     "genrateToken": KSLtoken,
  // //     "amount": amount,
  // //     "option":"QR",
  // //     "orderId": id
  // //     },

  // // );
  // // const lastTrans = await Trans.findOne().sort({ number: -1 });
  // //   const newIncreament = lastTrans.number + 1;
  // //   await Trans.create({
  // //     gateway: "Kindent",
  // //     txnId: createOrder.data.data.txnId,
  // //     id,
  // //     number: newIncreament,
  // //     date: Date.now(),
  // //     userId,
  // //     amount: amount,
  // //     status: "created",
  // //     });

  // res.status(200).send({ link: createOrder.data.data.paymentData });

  // }else{

  //   const lastTrans = await Trans.findOne().sort({ number: -1 });
  //   const newIncreament = lastTrans.number + 1;
  //   await Trans.create({
  //     gateway: "Kindent",
  //     txnId: createOrder.data.data.txnId,
  //     id,
  //     number: newIncreament,
  //     date: Date.now(),
  //     userId,
  //     amount: amount,
  //     status: "created",
  //     });

  //     res.status(200).send({ link: createOrder.data.data.paymentData });

  // }
};

export const planetCallback = async (req, res) => {
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
  var keyObject;

  try {
    keyObject = JSON.parse(Object.keys(req.body)[0]);
  } catch (error) {
    keyObject = req.body;
  }

  if (keyObject.status === "success") {
    const id = keyObject.clientid;
    const findTran = await Trans.findOne({ id, status: "success" });
    const getTran = await Trans.findOne({ id });
    var amount = parseInt(keyObject.amount);
    if (getTran) {
      if (!findTran) {
        await Trans.updateOne({ id }, { date: Date.now(), status: "success" });
        //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
        const user = await User.findOne({ id: getTran.userId });
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
          if (amount > 4999) {
            const bonus = (amount * 10) / 100;
            amount = amount + bonus;
          }
        }
        await User.updateOne(
          { id: getTran.userId },
          { firstRecharge: true, $inc: { balance: +amount } }
        );

        await User.updateOne(
          { id: getTran.userId },
          {
            $push: {
              rechargeHistory: {
                amount: amount,
                date: Date.now(),
                status: "Success",
              },
              walletHistory: {
                amount: amount,
                date: Date.now(),
                credit: true,
                note: `Add money ID: ${getTran.number}`,
              },
            },
          }
        );
        const userDate = new Date(user.date);
        const userDateLocal = (userDate / 1000 + 19800) * 1000;
        const newuserDate = new Date(userDateLocal);
        const abhiDate = new Date();
        const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
        const newabhirDate = new Date(abhiDateLocal);
        const day = newabhirDate.getDate();
        const month = newabhirDate.getMonth() + 1;
        const dayMonth = `${day}/${month}`;

        const userday = newuserDate.getDate();
        const usermonth = newuserDate.getMonth() + 1;
        const userdayMonth = `${userday}/${usermonth}`;
        const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
        const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

        const phone0recharge = `level0.${user.phone}.totalRecharge`;
        const phone1recharge = `level1.${user.phone}.totalRecharge`;
        const phone2recharge = `level2.${user.phone}.totalRecharge`;

        const phone0first = `level0.${user.phone}.firstRecharge`;
        const phone1first = `level1.${user.phone}.firstRecharge`;
        const phone2first = `level2.${user.phone}.firstRecharge`;

        if (dayMonth === userdayMonth) {
          if (user.upLine !== null) {
            if (user.upLine[0].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] ?? 1 },
                {
                  userId: user.upLine[0] ?? 1,
                  $inc: {
                    [newphone0recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
            if (user.upLine.length === 2) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
            if (user.upLine.length === 3) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }

              if (user.upLine[2].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[2] ?? 1 },
                  {
                    userId: user.upLine[2] ?? 1,
                    $inc: {
                      [newphone2recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
        }

        if (user.upLine !== null) {
          if (user.upLine[0].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[0] ?? 1 },
              {
                userId: user.upLine[0] ?? 1,
                $inc: {
                  [phone0first]: firstRecharge,
                  [phone0recharge]: amount,
                },
              },
              { upsert: true }
            );
          }
          if (user.upLine.length === 2) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
          if (user.upLine.length === 3) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1first]: firstRecharge,
                    [phone1recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }

            if (user.upLine[2].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[2] ?? 1 },
                {
                  userId: user.upLine[2] ?? 1,
                  $inc: {
                    [phone2first]: firstRecharge,
                    [phone2recharge]: amount,
                  },
                },
                { upsert: true }
              );
            }
          }
        }
      }
    }

    res.status(200).send("done");
  }
};

export const planetCallbackpayout = async (req, res) => {
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

  var keyObject;

  try {
    keyObject = JSON.parse(Object.keys(req.body)[0]);
  } catch (error) {
    keyObject = req.body;
  }

  if (keyObject.event === "TRANSFER_SUCCESS") {
    const id = keyObject.clientid;

    const getpayout = await payout.findOne({
      orderId: id,
      status: "pending",
      gateway: "planetC",
    });
    if (getpayout) {
      if (getpayout.type === "withdrawal") {
        await withdrawal.updateOne({ _id: getpayout.withdrawalId }),
          { status: "Success", payout: id, txnId: keyObject.utr };
        await payout.updateOne(
          { orderId: id },
          { status: "success", rrn: keyObject.utr }
        );

        await Daily.updateOne(
          { id: newDate },
          { $inc: { redeem: getpayout.amount, redeemCount: +1 } },
          { upsert: true }
        );
        const amount = `${getpayout.amount}`;

        await User.updateOne(
          { id: getpayout.userId },
          {
            $push: {
              walletHistory: {
                credit: false,
                amount,
                note: `Redeem Successful ID: ${id}`,
                date: Date.now(),
              },
            },
          }
        );

        const user = await User.findOne({ id: getpayout.userId });
        const date = new Date();
        const localDate = (date / 1000 + 19800) * 1000;
        const newDatefor = new Date(localDate);
        const day = newDatefor.getDate();
        const month = newDatefor.getMonth() + 1;
        const userDate = new Date(user.date);
        const userDateLocal = (userDate / 1000 + 19800) * 1000;
        const newuserDate = new Date(userDateLocal);

        const dayMonth = `${day}/${month}`;

        const userday = newuserDate.getDate();
        const usermonth = newuserDate.getMonth() + 1;
        const userdayMonth = `${userday}/${usermonth}`;
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

        const phone0with = `level0.${user.phone}.totalWithdrawal`;
        const phone1with = `level1.${user.phone}.totalWithdrawal`;
        const phone2with = `level2.${user.phone}.totalWithdrawal`;
        const newphone0with = `newlevel0.${dayMonth}.${user.phone}.todayWithdrawal`;
        const newphone1with = `newlevel1.${dayMonth}.${user.phone}.todayWithdrawal`;
        const newphone2with = `newlevel2.${dayMonth}.${user.phone}.todayWithdrawal`;

        if (dayMonth === userdayMonth) {
          if (user.upLine !== null) {
            if (user.upLine[0].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[0] ?? 1 },
                {
                  userId: user.upLine[0] ?? 1,
                  $inc: {
                    [newphone0with]: parseInt(amount),
                  },
                },
                { upsert: true }
              );
            }
            if (user.upLine.length === 2) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }
            }
            if (user.upLine.length === 3) {
              if (user.upLine[1].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[1] ?? 1 },
                  {
                    userId: user.upLine[1] ?? 1,
                    $inc: {
                      [newphone1with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }

              if (user.upLine[2].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[2] ?? 1 },
                  {
                    userId: user.upLine[2] ?? 1,
                    $inc: {
                      [newphone2with]: parseInt(amount),
                    },
                  },
                  { upsert: true }
                );
              }
            }
          }
        }

        if (user.upLine !== null) {
          if (user.upLine[0].length !== 0) {
            await promotion.updateOne(
              { userId: user.upLine[0] ?? 1 },
              {
                userId: user.upLine[0] ?? 1,
                $inc: {
                  [phone0with]: parseInt(amount),
                },
              },
              { upsert: true }
            );
          }
          if (user.upLine.length === 2) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1with]: parseInt(amount),
                  },
                },
                { upsert: true }
              );
            }
          }
          if (user.upLine.length === 3) {
            if (user.upLine[1].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[1] ?? 1 },
                {
                  userId: user.upLine[1] ?? 1,
                  $inc: {
                    [phone1with]: parseInt(amount),
                  },
                },
                { upsert: true }
              );
            }

            if (user.upLine[2].length !== 0) {
              await promotion.updateOne(
                { userId: user.upLine[2] ?? 1 },
                {
                  userId: user.upLine[2] ?? 1,
                  $inc: {
                    [phone2with]: parseInt(amount),
                  },
                },
                { upsert: true }
              );
            }
          }
        }
      } else {
        await payout.updateOne(
          { orderId: id },
          { status: "success", rrn: keyObject.utr }
        );
      }
    }
  }
  res.status(200).send("done");
};

export const planetCPayout = async (req, res) => {
  const account = req.body.account;
  const IFSC = req.body.ifsc.toUpperCase();
  const name = req.body.name;
  const pamount = req.body.amount;
  const api = req.params.api;
  const type = req.body.type;
  const userId = req.body.userId;
  const withdrawalId = req.body.withdrawalId;
  const id = `${Date.now()}`;
  const orderId = `ORD${id.substring(0, 10)}`;
  var amount = pamount;
  if (type === "withdrawal") {
    if (pamount <= 1000) {
      amount = pamount - 30;
    } else {
      amount = pamount - (pamount * 3) / 100;
    }
    if (pamount === 10) {
      amount = pamount;
    }
  }

  if (api === process.env.PayoutAPI) {
    if (type === "withdrawal") {
      const checkStatus = await withdrawal.findOne({ _id: withdrawalId });
      if (checkStatus.status === "Success") {
        return res.status(200).send({ status: "success", rrn: "" });
      }
    }

    const options = {
      method: "POST",
      url: " https://planetctechnology.com/planetcapi/auth/payout/payoutApi",
      headers: {
        Authorization: planetC,
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",

        //  authorization: `Bearer ${pToken}`
      },

      data: qs.stringify({
        beneName: name,
        beneAccountNo: account,
        clientReferenceNo: orderId,

        beneBankName: "PNB",

        beneifsc: IFSC,
        benePhoneNo: "8120441687",
        fundTransferType: "imps",
        amount: amount,
        token_key: "7ff777d7221fa6cb2fdbf27f93dcbfc6",
        lat: 22.8031731,
        long: 22.8031731,
        remarks: "withdrawal",
      }),
    };

    axios
      .request(options)
      .then(async function (response) {
        if (response.data.status) {
          if (type === "withdrawal") {
            await payout.create({
              orderId: response.data.data.data.clientTransid,
              txnId: response.data.data.data.merchantid,
              amount,
              bank: { account, IFSC, name },
              status: "pending",
              type: "withdrawal",
              withdrawalId,
              userId,
              gateway: "planetC",
            });
          } else {
            await payout.create({
              orderId: response.data.data.data.clientTransid,
              txnId: response.data.data.data.merchantid,
              amount,
              bank: { account, IFSC, name },
              status: "pending",
              type: "admin",
              gateway: "planetC",
            });
          }
          return res.status(200).send({ status: "success", rrn: orderId });
        } else {
          return res.status(200).send({ status: "Failed" });
        }
      })
      .catch(async function (error) {
        const options1 = {
          method: "POST",
          url: "https://planetctechnology.com/planetcapi/auth/user/generateToken",
          headers: {
            "content-type": "application/x-www-form-urlencoded;charset=utf-8",

            //  authorization: `Bearer ${pToken}`
          },
          data: qs.stringify({
            user_name: "8120441687",
            password: "abc@123",
          }),
        };

        axios.request(options1).then(async function (response) {
          planetC = response.data.data.token;

          axios
            .request(options)
            .then(async function (response) {
              if (response.data.status) {
                if (type === "withdrawal") {
                  await payout.create({
                    orderId: response.data.data.data.clientTransid,
                    txnId: response.data.data.data.merchantid,
                    amount,
                    bank: { account, IFSC, name },
                    status: "pending",
                    type: "withdrawal",
                    withdrawalId,
                    userId,
                    gateway: "planetC",
                  });
                } else {
                  await payout.create({
                    orderId: response.data.data.data.clientTransid,
                    txnId: response.data.data.data.merchantid,
                    amount,
                    bank: { account, IFSC, name },
                    status: "pending",
                    type: "admin",
                    gateway: "planetC",
                  });
                }
                return res
                  .status(200)
                  .send({ status: "success", rrn: orderId });
              } else {
                return res.status(200).send({ status: "Failed" });
              }
            })
            .catch(async function (error) {
              res.status(200).send({ status: "Failed", error: "error" });
            });
        });
      });
  }
};

export const payoutWith = async (req, res) => {
  const account = req.body.account;
  const IFSC = req.body.ifsc.toUpperCase();
  const name = req.body.name;
  const pamount = req.body.amount;
  const api = req.params.api;
  const type = req.body.type;
  const userId = req.body.userId;
  const phone = req.body.phone;
  const withdrawalId = req.body.withdrawalId;
  const id = `${Date.now()}`;
  const orderId = 'ORD' + id.substring(0, 10);
  var amount = pamount;
  if (type === "withdrawal") {
    if (pamount <= 1000) {
      amount = pamount - 30;
    } else {
      amount = pamount - (pamount * 3) / 100;
    }
    if (pamount === 10) {
      amount = pamount;
    }
  }
  amount = Math.round(amount);


  try {

    if (api === process.env.PayoutAPI) {
      if (type === "withdrawal") {
        const checkStatus = await withdrawal.findOne({ _id: withdrawalId });
        if (checkStatus.status === "Success") {
          return res.status(200).send({ status: "success", rrn: "" });
        }
      }
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${seospay}`);
      myHeaders.append("AuthKey", "5e5860051bf3");
      myHeaders.append("AuthToken", "715fbf60dfa657340deb94e12a5bf64ce43a1286");
      myHeaders.append("AuthCode", "7865493");
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "name": name,
        "accountNumber": account,
        "referenceNumber": orderId,
        "beneBankName": "PNB",
        "bankIfsc": IFSC,
        "mobileNumber": 8120441687,
        "transferMode": "IMPS",
        "transferAmount": amount
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };


      fetch("https://api.seospay.in/api/new/v1/payout/docashtransfer", requestOptions)
        .then((res) => res.json())
        .then(async (response) => {
          if (response.data)
            if (response.status === "PENDING") {
              if (type === "withdrawal") {
                await payout.create({
                  orderId: orderId,
                  txnId: response.data.txn_id,
                  amount,
                  bank: { account, IFSC, name },
                  status: "pending",
                  type: "withdrawal",
                  withdrawalId,
                  userId,
                  gateway: "seospay",
                });
              } else {
                await payout.create({
                  orderId: orderId,
                  txnId: response.data.txn_id,
                  amount,
                  bank: { account, IFSC, name },
                  status: "pending",
                  type: "admin",
                  gateway: "seospay",
                });
              }
              return res.status(200).send({ status: "pending", rrn: response.data.txn_id });
            }

          if (response.status === "FAILED") {

            return res.status(200).send({ status: "Failed", rrn: response.data.txn_id });
          }

          if (response.status === "SUCCESS") {
            if (type === "withdrawal") {
              await payout.create({
                orderId: orderId,
                txnId: response.data.bank_ref,
                amount,
                bank: { account, IFSC, name },
                status: "success",
                type: "withdrawal",
                withdrawalId,
                userId,
                gateway: "seospay",
              });
              await User.updateOne(
                { id: parseInt(userId) },
                {
                  $push: {
                    walletHistory: {
                      credit: false,
                      amount: amount,
                      note: `Redeem Successful ID: ${withdrawalId}`,
                      date: Date.now(),
                    },
                  },
                }
              );
              await withdrawal.updateOne({ _id: withdrawalId }, { status: "Success", payout: 'seospay', txnId: response.data.bank_ref });
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

              const dayMonth = `${day}/${month}`;

              const userday = newuserDate.getDate();
              const usermonth = newuserDate.getMonth() + 1;
              const userdayMonth = `${userday}/${usermonth}`;
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

              const phone0with = `level0.${user.phone}.totalWithdrawal`;
              const phone1with = `level1.${user.phone}.totalWithdrawal`;
              const phone2with = `level2.${user.phone}.totalWithdrawal`;
              const newphone0with = `newlevel0.${dayMonth}.${user.phone}.todayWithdrawal`;
              const newphone1with = `newlevel1.${dayMonth}.${user.phone}.todayWithdrawal`;
              const newphone2with = `newlevel2.${dayMonth}.${user.phone}.todayWithdrawal`;
              if (dayMonth === userdayMonth) {
                if (user.upLine !== null) {
                  if (user.upLine[0].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[0] ?? 1 },
                      {
                        userId: user.upLine[0] ?? 1,
                        $inc: {
                          [newphone0with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                  if (user.upLine.length === 2) {
                    if (user.upLine[1].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[1] ?? 1 },
                        {
                          userId: user.upLine[1] ?? 1,
                          $inc: {
                            [newphone1with]: parseInt(amount),
                          },
                        },
                        { upsert: true }
                      );
                    }
                  }
                  if (user.upLine.length === 3) {
                    if (user.upLine[1].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[1] ?? 1 },
                        {
                          userId: user.upLine[1] ?? 1,
                          $inc: {
                            [newphone1with]: parseInt(amount),
                          },
                        },
                        { upsert: true }
                      );
                    }

                    if (user.upLine[2].length !== 0) {
                      await promotion.updateOne(
                        { userId: user.upLine[2] ?? 1 },
                        {
                          userId: user.upLine[2] ?? 1,
                          $inc: {
                            [newphone2with]: parseInt(amount),
                          },
                        },
                        { upsert: true }
                      );
                    }
                  }
                }
              }

              if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[0] ?? 1 },
                    {
                      userId: user.upLine[0] ?? 1,
                      $inc: {
                        [phone0with]: parseInt(amount),
                      },
                    },
                    { upsert: true }
                  );
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [phone1with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }

                  if (user.upLine[2].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [phone2with]: parseInt(amount),
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }

            } else {
              await payout.create({
                orderId: orderId,
                txnId: response.data.bank_ref,
                amount,
                bank: { account, IFSC, name },
                status: "success",
                type: "admin",
                gateway: "seospay",
              });
            }
            return res.status(200).send({ status: "success", rrn: response.data.bank_ref });
          }
          if (!response.status) {
            console.log(response);
            const options1 = {
              method: "POST",
              url: "https://api.seospay.in/api/new/generateToken",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",

                "AuthKey": "5e5860051bf3",
                "AuthToken": "715fbf60dfa657340deb94e12a5bf64ce43a1286",
              },
              data: {
                "email": "avishawakarma43@gmail.com",
                "password": "OKH%^$8934"
              },
            };

            axios.request(options1).then(async function (response) {
              seospay = response.data.token;
            }).catch(async function (error) {
              console.log('here1')
              console.log(error)
              //return res.status(200).send({ status: "Failed", error: "Try again" , message: error});

            })
            return res.status(200).send({ status: "Failed", error: "Try again", message: error });
          }


        })
        .catch((error) => {
          console.log('main error')
          console.log(error);
          return res.status(200).send({ status: "Failed", error: "Try again", message: error });

        });


    }

  } catch (error) {
    console.log('try catch error');
    console.log(error);
    res.status(200).send({ status: "Failed", error: "error", message: error });

  }


};

export const UPIPointGateway = async (req, res) => {

  try {

    var user_token = process.env.upipoint;
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
      url: "https://upipoint.com/api/create-order",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: postDataString,
    };

    axios.request(config)
      .then(async (response) => {

        axios.get(`${response.data.result.payment_url}`).then(async (resp) => {

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

          });
          res.status(200).send(resp.data);
        }).catch((err) => {
          console.log(err)
          res.status(200).send({ error: err });
        })

      })
      .catch((error) => {
        //console.log('here');
        console.log(error)
        res.status(200).send({ error: error });
      });


  } catch (error) {
    console.log(error)
    res.status(200).send({ error: error });
  }





};
export const upiPointGatewayWebhooktdv1 = async (req, res) => {
  const data = req.body;
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

  const clientId = data.order_id;

  if (data.status === "SUCCESS") {

    const sData = {
      user_token: process.env.upipoint,
      order_id: data.order_id
    }
    const postDataString = querystring.stringify(sData);
    const getTransaction = await axios.post(
      "https://upipoint.com/api/check-order-status",
      postDataString,
      {
        headers: {
          'Content-Type': "application/x-www-form-urlencoded"

        }
      }
    );


    if (getTransaction.data.status === true) {
      if (getTransaction.data.result.txnStatus === "SUCCESS") {
        try {


          var amount = parseFloat(getTransaction.data.result.amount);
          const tempTran = await Trans.findOne({
            id: clientId,
            status: "success",
          });
          if (!tempTran) {
            console.log("**************** WebHooked *********************");
            const lastTransId = await Trans.findOne(
              { id: clientId },
              { number: 1, userId: 1 }
            );
            await Trans.updateOne(
              { id: clientId },
              { date: Date.now(), status: "success", expired: true, utr: getTransaction.data.result.utr }
            );
            const user = await User.findOne({ id: lastTransId.userId });
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
              await offerBonus.updateOne(
                { userId: user.upLine[0] },
                {
                  userId: user.upLine[0],
                  $inc: { amount: +151 },
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
              if (amount > 4999) {
                const bonus = (amount * 10) / 100;
                amount = amount + bonus;
              }
              await User.updateOne(
                { id: user.id },
                {
                  firstRecharge: true, $inc: { balance: +amount },
                  $push: {
                    rechargeHistory: {
                      amount: amount,
                      date: Date.now(),
                      status: "Success",
                    },
                    walletHistory: {
                      amount: amount,
                      date: Date.now(),
                      credit: true,
                      note: `Add money ID: ${lastTransId.number}`,
                    },
                  },
                }
              );
            } else {
              var bonus;
              if (amount > 4999) {
                bonus = (amount * 10) / 100;
                amount = amount + bonus;
              }

              await User.updateOne(
                { id: user.id },
                {
                  firstRecharge: true, $inc: { balance: +amount },
                  $push: {
                    rechargeHistory: {
                      amount: amount,
                      date: Date.now(),
                      status: "Success",
                    },
                    walletHistory: {
                      amount: amount,
                      date: Date.now(),
                      credit: true,
                      note: `Add money ID: ${lastTransId.number}`,
                    },
                  },
                }
              );

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
            const useryear = newuserDate.getFullYear();

            const userdayMonth = `${userday}/${usermonth}/${useryear}`;
            const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
            const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

            const phone0recharge = `level0.${user.phone}.totalRecharge`;
            const phone1recharge = `level1.${user.phone}.totalRecharge`;
            const phone2recharge = `level2.${user.phone}.totalRecharge`;

            const phone0first = `level0.${user.phone}.firstRecharge`;
            const phone1first = `level1.${user.phone}.firstRecharge`;
            const phone2first = `level2.${user.phone}.firstRecharge`;

            if (dayMonth === userdayMonth) {
              if (user.upLine !== null) {
                if (user.upLine[0].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[0] ?? 1 },
                    {
                      userId: user.upLine[0] ?? 1,
                      $inc: {
                        [newphone0recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
                if (user.upLine.length === 2) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
                if (user.upLine.length === 3) {
                  if (user.upLine[1].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[1] ?? 1 },
                      {
                        userId: user.upLine[1] ?? 1,
                        $inc: {
                          [newphone1recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }

                  if (user.upLine[2].length !== 0) {
                    await promotion.updateOne(
                      { userId: user.upLine[2] ?? 1 },
                      {
                        userId: user.upLine[2] ?? 1,
                        $inc: {
                          [newphone2recharge]: amount,
                        },
                      },
                      { upsert: true }
                    );
                  }
                }
              }
            }

            if (user.upLine !== null) {
              if (user.upLine[0].length !== 0) {
                await promotion.updateOne(
                  { userId: user.upLine[0] ?? 1 },
                  {
                    userId: user.upLine[0] ?? 1,
                    $inc: {
                      [phone0first]: firstRecharge,
                      [phone0recharge]: amount,
                    },
                  },
                  { upsert: true }
                );
              }
              if (user.upLine.length === 2) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
              if (user.upLine.length === 3) {
                if (user.upLine[1].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[1] ?? 1 },
                    {
                      userId: user.upLine[1] ?? 1,
                      $inc: {
                        [phone1first]: firstRecharge,
                        [phone1recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }

                if (user.upLine[2].length !== 0) {
                  await promotion.updateOne(
                    { userId: user.upLine[2] ?? 1 },
                    {
                      userId: user.upLine[2] ?? 1,
                      $inc: {
                        [phone2first]: firstRecharge,
                        [phone2recharge]: amount,
                      },
                    },
                    { upsert: true }
                  );
                }
              }
            }

            res.status(200).send("done");
          } else {
            res.status(200).send("done");
          }

        } catch (error) {
          console.log(error.message);
          res.status(200).send("done");
        }
      } else {
        res.status(200).send("done");
      }
    } else {
      res.status(200).send("done");
    }
  } else {
    res.status(200).send("done");
  }
  //res.status(200).send("done");
};

// ============================
// WatchPay Payout Integration
// ============================

// Bank code mapping for WatchPay
const WATCHPAY_BANK_CODES = {
  'IDPT0001': 'Canara Bank',
  'IDPT0002': 'DCB Bank',
  'IDPT0003': 'Federal Bank',
  'IDPT0004': 'HDFC Bank',
  'IDPT0005': 'Punjab National Bank',
  'IDPT0006': 'Indian Bank',
  'IDPT0007': 'ICICI Bank',
  'IDPT0008': 'Syndicate Bank',
  'IDPT0009': 'Karur Vysya Bank',
  'IDPT0010': 'Union Bank of India',
  'IDPT0011': 'Kotak Mahindra Bank',
  'IDPT0012': 'IDFC First Bank',
  'IDPT0013': 'Andhra Bank',
  'IDPT0014': 'Karnataka Bank',
  'IDPT0015': 'ICICI Corporate Bank',
  'IDPT0016': 'Axis Bank',
  'IDPT0017': 'UCO Bank',
  'IDPT0018': 'South Indian Bank',
  'IDPT0019': 'Yes Bank',
  'IDPT0020': 'Standard Chartered Bank',
  'IDPT0021': 'State Bank of India',
  'IDPT0022': 'Indian Overseas Bank',
  'IDPT0023': 'Bandhan Bank',
  'IDPT0024': 'Central Bank of India',
  'IDPT0025': 'Bank of Baroda'
};

export const watchPayPayout = async (req, res) => {
  const account = req.body.account;
  const bankCode = req.body.bankCode; // WATCHPAY bank code like IDPT0021 (this is what goes to API)
  const name = req.body.name;
  const pamount = req.body.amount;
  const api = req.params.api;
  const type = req.body.type;
  const userId = req.body.userId;
  const ifsc = req.body.ifsc;
  const withdrawalId = req.body.withdrawalId;
  const remark = ifsc; // Optional remark or use bankCode

  // Calculate actual payout amount after fees
  var amount = pamount;
  if (type === "withdrawal") {
    if (pamount <= 1000) {
      amount = pamount - 30;
    } else {
      amount = pamount - (pamount * 3) / 100;
    }
    if (pamount === 10) {
      amount = pamount;
    }
  }
  amount = Math.round(amount);

  try {
    if (api === process.env.PayoutAPI) {
      // Check if withdrawal already processed
      if (type === "withdrawal") {
        const checkStatus = await withdrawal.findOne({ _id: withdrawalId });
        if (!checkStatus) {
          return res.status(400).send({ status: "error", message: "Withdrawal not found" });
        }
        if (checkStatus.status === "Success") {
          return res.status(200).send({ status: "success", message: "Already processed" });
        }
      }

      // WatchPay Payout API Configuration
      const MCH_ID = process.env.WATCHPAY_MCH_ID || "100225573";
      const MERCHANT_KEY = process.env.WATCHPAY_MERCHANT_KEY_PAY || "QOSH8PGJNROQWHWR3DDQD9CKMRLE6WUJ";
      const API_URL = process.env.WATCHPAY_PAYOUT_URL || "https://api.watchglb.com/pay/transfer";

      // Generate unique transfer ID
      const mchTransferId = Date.now().toString() + Math.floor(Math.random() * 10000);
      const applyDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Prepare payout parameters (matching PHP code exactly)
      const params = {
        sign_type: "MD5",
        mch_id: MCH_ID,
        mch_transferId: mchTransferId,
        transfer_amount: amount.toString(),
        apply_date: applyDate,
        bank_code: bankCode,        // WatchPay's proprietary code (e.g., IDPT0021) - NOT actual IFSC!
        receive_name: name,
        receive_account: account,
        remark: remark
      };

      // Generate signature (same as PHP logic)
      const generateWatchPayPayoutSign = (params, merchantKey) => {
        // Filter out empty values and sign field
        const filteredParams = {};
        Object.keys(params).forEach(key => {
          const value = params[key];
          if (value !== "" && value !== null && value !== undefined && key !== "sign" && key !== "sign_type") {
            filteredParams[key] = value;
          }
        });

        // Sort by key name alphabetically
        const sortedKeys = Object.keys(filteredParams).sort();

        // Build query string
        let queryString = "";
        sortedKeys.forEach(key => {
          queryString += key + "=" + filteredParams[key] + "&";
        });
        queryString += "key=" + merchantKey;

        console.log('WatchPay Payout String to sign:', queryString);

        // MD5 hash and convert to lowercase
        return crypto.createHash('md5').update(queryString).digest('hex').toLowerCase();
      };

      // Generate and add signature
      params.sign = generateWatchPayPayoutSign(params, MERCHANT_KEY);

      console.log('WatchPay Payout Request Params:', JSON.stringify(params, null, 2));

      // Create axios instance with SSL config
      const watchPayAxios = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
          keepAlive: true
        }),
        timeout: 60000, // 60 seconds for payout
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Convert params to form-urlencoded format
      const formData = new URLSearchParams(params).toString();

      // Make API request
      const response = await watchPayAxios.post(API_URL, formData);
      const result = response.data;

      console.log('WatchPay Payout Response:', JSON.stringify(result, null, 2));

      // Handle response
      if (result.respCode === "SUCCESS") {




        console.log('WatchPay Payout Success:', mchTransferId);

        return res.status(200).json({
          status: "success",
          message: "Transfer successful",
          tradeNo: result.tradeNo,
          transferAmount: result.transferAmount || amount,
          mchTransferId: mchTransferId
        });

      } else {
        // Payout failed
        console.error('WatchPay Payout Failed:', result);

        // Update withdrawal status to Failed and refund user

        return res.status(400).json({
          status: "error",
          message: result.errorMsg || result.respMsg || "Transfer failed",
          respCode: result.respCode
        });
      }

    } else {
      return res.status(401).send({ status: "error", message: "Auth Failed" });
    }

  } catch (error) {
    console.error('WatchPay Payout Error:', error);



    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      error: error.response?.data || error.message
    });
  }
};

// WatchPay Balance Fetch
export const watchPayBalanceFetch = async (req, res) => {
  try {
    // Check admin authentication
    const api = req.params.api;
    if (api !== process.env.AdminAPI) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized access"
      });
    }
    // WatchPay Balance API Configuration
    const MCH_ID = process.env.WATCHPAY_MCH_ID || "100225573";
    const MERCHANT_KEY = process.env.WATCHPAY_MERCHANT_KEY_PAY || "QOSH8PGJNROQWHWR3DDQD9CKMRLE6WUJ";
    const API_URL = "https://api.watchglb.com/query/balance";

    // Prepare parameters
    const params = {
      mch_id: MCH_ID,
      sign_type: "MD5"
    };

    // Generate signature (exclude 'sign' and 'sign_type')
    const generateBalanceSign = (params, merchantKey) => {
      // Filter out empty values, sign, and sign_type
      const filteredParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== "" && params[key] !== null && key !== "sign" && key !== "sign_type") {
          filteredParams[key] = params[key];
        }
      });

      // Sort parameters alphabetically
      const sortedKeys = Object.keys(filteredParams).sort();

      // Build query string
      let queryString = "";
      sortedKeys.forEach(key => {
        queryString += key + "=" + filteredParams[key] + "&";
      });
      queryString += "key=" + merchantKey;

      console.log('WatchPay Balance String to sign:', queryString);

      // MD5 hash and convert to lowercase
      return crypto.createHash('md5').update(queryString).digest('hex').toLowerCase();
    };

    // Generate and add signature
    params.sign = generateBalanceSign(params, MERCHANT_KEY);

    console.log('WatchPay Balance Request Params:', JSON.stringify(params, null, 2));

    // Create axios instance with SSL config
    const watchPayAxios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Convert params to form data
    const formData = new URLSearchParams(params).toString();

    // Make API request
    const response = await watchPayAxios.post(API_URL, formData);
    const result = response.data;

    console.log('WatchPay Balance Response:', JSON.stringify(result, null, 2));

    // Handle response
    if (result.respCode === "SUCCESS" && result.availableAmount !== undefined) {
      return res.status(200).json({
        status: "success",
        message: "Balance fetched successfully",
        availableAmount: result.availableAmount,
        data: result
      });
    } else {
      console.error('WatchPay Balance API Error:', result);
      return res.status(400).json({
        status: "error",
        message: result.errorMsg || result.respMsg || "Failed to fetch balance",
        data: result
      });
    }

  } catch (error) {
    console.error('WatchPay Balance Fetch Error:', error);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      error: error.response?.data || error.message
    });
  }
};

// ============================
// RupeeRush Payout Integration
// ============================

export const rupeeRushPayout = async (req, res) => {
  const account = req.body.account; // bankAcctNo
  const ifsc = req.body.ifsc; // identityNo (IFSC code)
  const name = req.body.name; // bankAcctName
  const pamount = req.body.amount;
  const api = req.params.api;
  const type = req.body.type;
  const userId = req.body.userId;
  const withdrawalId = req.body.withdrawalId;

  // Calculate actual payout amount after fees
  var amount = pamount;
  if (type === "withdrawal") {
    if (pamount <= 1000) {
      amount = pamount - 30;
    } else {
      amount = pamount - (pamount * 3) / 100;
    }
    if (pamount === 10) {
      amount = pamount;
    }
  }
  amount = Math.round(amount);

  try {
    if (api === process.env.PayoutAPI) {
      // Check if withdrawal already processed
      if (type === "withdrawal") {
        const checkStatus = await withdrawal.findOne({ _id: withdrawalId });
        if (!checkStatus) {
          return res.status(400).send({ status: "error", message: "Withdrawal not found" });
        }
        if (checkStatus.status === "Success") {
          return res.status(200).send({ status: "success", message: "Already processed" });
        }
      }

      // RupeeRush Payout API Configuration
      const MER_NO = process.env.RUPEERUSH_PAYOUT_MER_NO || "RUP250918225212461";
      const SECRET_KEY = process.env.RUPEERUSH_PAYOUT_SECRET_KEY || "ACB6313A8AED3E2975B65C05CF2008E6";
      const API_URL = process.env.RUPEERUSH_PAYOUT_API_URL || "https://api.rupeerush.cc/cashOutExc/create";
      const CALLBACK_URL = process.env.RUPEERUSH_PAYOUT_CALLBACK_URL || `${process.env.SERVER_URL}/rupeeRushPayoutCallback`;

      // Generate required values
      const randomNo = String(Math.floor(Math.random() * 90000000000000) + 10000000000000);
      const outTradeNo = withdrawalId || `WD${Date.now()}`;
      const reqTimeStamp = String(Date.now());
      const totalAmount = amount.toFixed(2);

      // Prepare payout parameters
      const params = {
        merNo: MER_NO,
        randomNo: randomNo,
        currencyCode: "INR",
        totalAmount: totalAmount,
        outTradeNo: outTradeNo,
        reqTimeStamp: reqTimeStamp,
        bankCode: "IMPS",
        bankAcctName: name,
        bankAcctNo: account,
        accPhone: "+917024564094",
        accEmail: "ritiksolutions@gmail.com",
        notifyUrl: CALLBACK_URL,
        identityNo: ifsc,
        identityType: "IMPS"
      };

      // Generate signature (RupeeRush specific)
      const generateRupeeRushPayoutSign = (params, merchantKey) => {
        // Remove sign field if exists
        const signParams = { ...params };
        delete signParams.sign;

        // Filter out null, empty string, and false values
        const filtered = {};
        Object.keys(signParams).forEach(key => {
          const value = signParams[key];
          if (value !== null && value !== '' && value !== false) {
            filtered[key] = value;
          }
        });

        // Sort alphabetically
        const sortedKeys = Object.keys(filtered).sort();
        const sorted = {};
        sortedKeys.forEach(key => {
          sorted[key] = filtered[key];
        });

        // Create JSON string and append merchant key
        const jsonString = JSON.stringify(sorted);
        const signString = jsonString + merchantKey;

        console.log('RupeeRush Payout Sign String:', signString);

        // MD5 hash and convert to uppercase
        return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
      };

      // Generate and add signature
      params.sign = generateRupeeRushPayoutSign(params, SECRET_KEY);

      console.log('RupeeRush Payout Request Params:', JSON.stringify(params, null, 2));

      // Create axios instance (IPv4 egress for Rupee Rush whitelist)
      const rupeeRushAxios = axios.create({
        httpsAgent: createRupeeRushHttpsAgent(),
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Make API request
      const response = await rupeeRushAxios.post(API_URL, params);
      const result = response.data;

      console.log('RupeeRush Payout Response:', JSON.stringify(result, null, 2));

      // Verify response signature
      if (result.sign) {
        const respSign = result.sign;
        const verifyParams = { ...result };
        delete verifyParams.sign;
        const expectedSign = generateRupeeRushPayoutSign(verifyParams, SECRET_KEY);

        console.log('Response Sign:', respSign);
        console.log('Expected Sign:', expectedSign);

        if (respSign !== expectedSign) {
          console.error('RupeeRush Payout Signature Mismatch');
          throw new Error('Signature verification failed');
        }
      }

      // Handle response
      if (result.resultCode === "0000") {




        console.log('RupeeRush Payout Success:', outTradeNo);

        return res.status(200).json({
          status: "success",
          message: "Transfer successful",
          outTradeNo: result.outTradeNo,
          totalAmount: result.totalAmount || totalAmount,
          resultCode: result.resultCode
        });

      } else {
        // Payout failed
        console.error('RupeeRush Payout Failed:', result);



        return res.status(400).json({
          status: "error",
          message: result.resultMsg || "Transfer failed",
          resultCode: result.resultCode
        });
      }

    } else {
      return res.status(401).send({ status: "error", message: "Auth Failed" });
    }

  } catch (error) {
    console.error('RupeeRush Payout Error:', error);


    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      error: error.response?.data || error.message
    });
  }
};

// RupeeRush Payout Callback Handler
export const rupeeRushPayoutCallback = async (req, res) => {
  try {
    console.log('RupeeRush Payout Callback received:', req.body);

    const result = req.body;
    const SECRET_KEY = process.env.RUPEERUSH_PAYOUT_SECRET_KEY || "ACB6313A8AED3E2975B65C05CF2008E6";

    // Verify signature
    if (result.sign) {
      const respSign = result.sign;
      const verifyParams = { ...result };
      delete verifyParams.sign;

      // Filter and sort
      const filtered = {};
      Object.keys(verifyParams).forEach(key => {
        const value = verifyParams[key];
        if (value !== null && value !== '' && value !== false) {
          filtered[key] = value;
        }
      });

      const sortedKeys = Object.keys(filtered).sort();
      const sorted = {};
      sortedKeys.forEach(key => {
        sorted[key] = filtered[key];
      });

      const jsonString = JSON.stringify(sorted);
      const signString = jsonString + SECRET_KEY;
      const expectedSign = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();

      console.log('Callback Sign Verification:');
      console.log('Received sign:', respSign);
      console.log('Expected sign:', expectedSign);

      if (respSign !== expectedSign) {
        console.error('Invalid signature in callback');
        return res.status(400).send('sign error');
      }
    }

    // Handle callback based on status
    if (result.resultCode === "0000") {
      const outTradeNo = result.outTradeNo;

      // Update withdrawal if needed
      // const withdrawalRecord = await withdrawal.findOne({ _id: outTradeNo });
      // if (withdrawalRecord && withdrawalRecord.status !== "Success") {
      //   await withdrawal.updateOne(
      //     { _id: outTradeNo },
      //     { status: "Success", txnId: result.outTradeNo }
      //   );
      //   console.log('Withdrawal status updated via callback:', outTradeNo);
      // }
    }

    return res.status(200).send('SUCCESS');

  } catch (error) {
    console.error('RupeeRush Payout Callback Error:', error);
    return res.status(500).send('FAIL');
  }
};

// RupeeRush Balance Fetch
export const rupeeRushBalanceFetch = async (req, res) => {
  try {
    // Check admin authentication
    const api = req.params.api;
    if (api !== process.env.AdminAPI) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized access"
      });
    }

    // RupeeRush Balance API Configuration
    const MER_NO = process.env.RUPEERUSH_MER_NO || "RUP251002132137025";
    const SECRET_KEY = process.env.RUPEERUSH_SECRET_KEY || "697F58B0E39DDC16C8B86286F591ED29";
    const API_URL = "https://api.rupeerush.cc/query/balance";
    const CURRENCY_CODE = "INR"; // Default currency

    // Prepare request data
    const requestData = {
      merNo: MER_NO,
      currencyCode: CURRENCY_CODE
    };

    // Generate signature (same as PHP logic)
    const generateRupeeRushBalanceSign = (params, secretKey) => {
      // Remove sign if exists
      const filtered = {};
      Object.keys(params).forEach(key => {
        const value = params[key];
        // Filter out null, empty string, and false values
        if (value !== null && value !== '' && value !== false && key !== 'sign') {
          filtered[key] = value;
        }
      });

      // Sort by key
      const sortedKeys = Object.keys(filtered).sort();
      const sorted = {};
      sortedKeys.forEach(key => {
        sorted[key] = filtered[key];
      });

      // JSON encode (no escaped slashes)
      const jsonString = JSON.stringify(sorted);

      // Append secret key and generate MD5 (uppercase)
      const signString = jsonString + secretKey;

      console.log('RupeeRush Balance String to sign:', signString);

      return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    };

    // Generate and attach signature
    requestData.sign = generateRupeeRushBalanceSign(requestData, SECRET_KEY);

    console.log('RupeeRush Balance Request Data:', JSON.stringify(requestData, null, 2));

    // Create axios instance (IPv4 egress for Rupee Rush whitelist)
    const rupeeRushAxios = axios.create({
      httpsAgent: createRupeeRushHttpsAgent(),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Make API request (POST with JSON payload)
    const response = await rupeeRushAxios.post(API_URL, requestData);
    const result = response.data;

    console.log('RupeeRush Balance Response:', JSON.stringify(result, null, 2));

    // Handle response
    if (result.resultCode === "0000") {
      // Subtract 3000 from balance as per PHP logic
      const adjustedBalance = parseFloat(result.balance || 0) - 3000;

      return res.status(200).json({
        status: "success",
        message: "Balance fetched successfully",
        balance: adjustedBalance.toFixed(2),
        rawBalance: result.balance,
        currencyCode: result.currencyCode || CURRENCY_CODE,
        data: result
      });
    } else {
      console.error('RupeeRush Balance API Error:', result);
      return res.status(400).json({
        status: "error",
        message: result.resultMsg || "Failed to fetch balance",
        resultCode: result.resultCode,
        data: result
      });
    }

  } catch (error) {
    console.error('RupeeRush Balance Fetch Error:', error);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }

    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      error: error.response?.data || error.message
    });
  }
};

