import express from "express";
import {
  signin,
  signup,
  getUserData,
  getTimer,
  getRecordData,
  getHistoryData,
  getFullRecordData,
  getFullHistoryData,
  addBank,
  addAddress,
  accountSecurity,
  resetPassword,
  upiCreateOrder,
  upiVerifyPayment,
  oldPromotion,
  newPromotion,
  getPromotionLiveBalance,
  setServerDown,
  viewDownUsers,
  getUserDataHome,
  promotionMembers,
  upiCreateOrderV2,
  imbCreateOrder,
  setServerDownLevel,
  getUserDataWithdrawal,
} from "../controller/user.js";
import {
  bidData,
  applyBonus,
  getPricing,
  setResult,
  applyWithdrawal,
  getWithdrawal,
  getAllWithdrawal,
  processWithdrawal,
  getHighBalanceUsers,
  playerJankaari,
  updataUserBalance,
  getCurrentNumber,
  playerJankaarilevelData,
  getAllUserWithdrawal,
  updataUserBonus,
  setAutoMode,
  updateWithdrawalType,
  ClearUserContri,
  getUserBonus,
  minute1_getCurrentNumber,
  minute1_setResult,
  minute1_getTimer,
  minute1_bidData,
  minute1_getRecordData,
  minute1_getFullRecordData,
  minute1_getHistoryData,
  minute1_getPricing,
  minute3_getCurrentNumber,
  minute3_setResult,
  minute3_getTimer,
  minute3_bidData,
  minute3_getRecordData,
  minute3_getFullRecordData,
  minute3_getHistoryData,
  minute3_getFullHistoryData,
  minute3_getPricing,
  minute1_getFullHistoryData,
  minute5_getCurrentNumber,
  minute5_setResult,
  minute5_getTimer,
  minute5_bidData,
  minute5_getRecordData,
  minute5_getFullRecordData,
  minute5_getHistoryData,
  minute5_getFullHistoryData,
  minute5_getPricing,
  applyWithdrawalUSDT,
  getAllWithdrawalUSDT,
} from "../controller/bidData.js";
import checkAuth from "../middleware/secure.js";
import Dotenv from "dotenv";
import axios from "axios";
Dotenv.config({ path: "./config.env" });
import User from "../model/userSchema.js";
import otp from "../model/otp.js";
import crypto from "crypto";
import {
  claimEnvelop,
  createEnvelop,
  generateEnvelop,
  getUserEnvelop,
  redeemEnvelop,
  validateEnvelop,
} from "../controller/redEnvelop.js";
import Withdrawal from "../model/withdrawal.js";
import {
  UPIPointGateway,
  cashfreeCreateOrder,
  cashfreeVerify,
  checkPhonePeStatus,
  chineasePay,
  createAirpayOrder,
  createCryptoUpayOrder,
  createQRTrans,
  createUPIintent,
  getGateway,
  getGatewayOut,
  getRechargeSettings,
  updateRechargeSettings,
  getPayouts,
  getRecentRecharge,
  getShuffleUPI,
  getShuffleUPIV4,
  imbupiGatewayWebhooktdv1,
  paycialCallback,
  paycialCreateOrder,
  paygicUPICallback,
  payoutWith,
  phonepePG,
  phonepePGEcom,
  phonepepgredirect,
  processphonepePG,
  razorpayCreateOrder,
  razorpayVerify,
  setGateway,
  setGatewayOut,
  submitUTR,
  updateUpi,
  updateUpiV3,
  upiGatewayWebhooktdv1,
  upiPointGatewayWebhooktdv1,
  verifyCryptoSign,
  rupeeRushCreateOrder,
  rupeeRushCallback,
  rupeeRushPayout,
  rupeeRushPayoutCallback,
  rupeeRushBalanceFetch,
  watchPayCreateOrder,
  watchPayCallback,
  watchPayPayout,
  watchPayBalanceFetch,
  lgPayCreateOrder,
  lgPayCallback,
  lgPayBalanceFetch,
} from "../controller/gateways.js";
import {
  launchGame,
  gameCallback
} from "../controller/game.js";
import {
  getCarousel,
  getCarouselAdmin,
  uploadCarouselImage,
  updateCarouselOrder,
  deleteCarouselImage,
} from "../controller/carousel.js";
import { uploadSingle } from "../middleware/uploadCarousel.js";
import { getSiteSettings, getSiteSettingsAdmin, uploadLogo, uploadApk, updateSiteSettings } from "../controller/siteSettings.js";
import { uploadLogoSingle } from "../middleware/uploadLogo.js";
import { uploadApkSingle } from "../middleware/uploadApk.js";
import Daily from "../model/daily.js";
import Trans from "../model/transaction.js";
import With from "../model/withdrawal.js";
import bidHistory from "../model/bidHistory.js";
import rateLimit from "../middleware/rateLimit.js";
import aviatorHistory from "../model/aviator/bidHistory.js";
import {
  aviator_currentBid,
  aviator_getFullHistoryData,
  aviator_getPricing,
  aviator_setResult,
  getAviatorFullRecordData,
  getAviatorRecordData,
  getAviatorReport,
} from "../controller/aviator/game.js";
import {
  checkMinesSessions,
  getExtra,
  getMinesFullHistoryData,
  getMinesFullHistoryDataAdmin,
  getMinesHistoryData,
  getMinesReport,
  getMinesSessionsAdmin,
  setExtra,
  setMinesManual,
} from "../controller/mines/game.js";
import {
  fastParity_bidData,
  fastParity_getCurrentNumber,
  fastParity_getFullHistoryData,
  fastParity_getFullRecordData,
  fastParity_getHistoryData,
  fastParity_getPricing,
  fastParity_getRecordData,
  fastParity_getTimer,
  fastParity_setAutoMode,
  fastParity_setResult,
} from "../controller/fastParity/fastParity.js";
import FastBidHistory from "../model/fastParity/bidHistory.js";
import BigBidHistory from "../model/bigsmall/bidHistory.js";
import { claimDailyTask, claimInvitationBonus, claimSalary, getAgentEarning, getDailyTask, getInviteBonusData, getInviteRecord, getSalaryTask, getOfferTransactions, getSalaryRecordAdmin } from "../controller/salary.js";
import {
  agentActive,
  agentLogin,
  agent_toddRechargegetApproveTransaction,
  agent_toddRechargegetPendingTransaction,
  agent_toddRechargeupdatePendingTransaction,
  updateUPIAgent,
} from "../controller/agent.js";
import {
  cricket_getCurrentBidHistory,
  cricket_getbidHistory,
} from "../controller/cricket/cricket.js";
import { bigsmall_bidData, bigsmall_getCurrentNumber, bigsmall_getFullHistoryData, bigsmall_getFullRecordData, bigsmall_getHistoryData, bigsmall_getPricing, bigsmall_getRecordData, bigsmall_getTimer, bigsmall_setAutoMode, bigsmall_setResult } from "../controller/bigsmall/bigsmall.js";
import { claimContriBonus, claimPeriodWonBonus, getWinStreakData } from "../controller/offer.js";
import extra from "../model/extra.js";
import BidHistory1 from "../model/1minute/bidHistory.js";
import BidHistory3 from "../model/3minute/bidHistory.js";
import BidHistory5 from "../model/5minute/bidHistory.js";
import toddUsers from "../model/toddUsers.js";
import playHistory from "../model/playHistory.js";

import {
  createGameCatalogAdmin,
  deleteGameCatalogAdmin,
  getGamesCatalogAdmin,
  getGamesCatalogPublic,
  updateGameCatalogAdmin,
} from "../controller/gameCatalog.js";
import {
  getAllUsersAdmin,
  getAdminStats,
  updateUserAdmin,
  getAllWithdrawalsAdmin,
  updateWithdrawalAdmin,
  getAdminTransactions,
} from "../controller/admin.js";
import {
  getCommissionConfigs,
  updateCommissionConfig,
  createCommissionConfig,
  getAgentConfigs,
  updateAgentConfig,
  getAffiliateStats,
} from "../controller/commission.js";


// const successIMB = schedule.scheduleJob('*/3 * * * *', async function(){
//   const date = new Date();
//   const localDate = (date / 1000 + 19800) * 1000;
//   const newDatefor = new Date(localDate);
//   const day = newDatefor.getDate();
//   const month = newDatefor.getMonth() + 1;
//   const year = newDatefor.getFullYear();

//   var daySorted;
//   var monthSorted;
//   if (day < 10) {
//     daySorted = `0${day}`;
//   } else {
//     daySorted = `${day}`;
//   }
//   if (month < 10) {
//     monthSorted = `0${month}`;
//   } else {
//     monthSorted = `${month}`;
//   }
//   const newDate = `${daySorted}-${monthSorted}-${year}`;
//   try {
//     const getTrans = await Trans.find({
//       gateway: "IMB",
//       status: "created",
//     }).sort({ createDate: -1 });
//     getTrans.forEach(async (element) => {
//       try {
//         const sData = {
//           user_token: process.env.imbToken,
//           order_id: element.id
//         }
//         const postDataString = querystring.stringify(sData);
//         const getTransaction = await axios.post(
//           "https://pay.imb.org.in/api/check-order-status",
//           postDataString,
//           {
//             headers: {
//               'Content-Type': "application/x-www-form-urlencoded"

//             }
//           }
//         );

//         if (getTransaction.data.result.status === "SUCCESS") {
//           const findTrans = await Trans.findOne({id: element.id,status: 'created'});
//           if(findTrans){
//             var amount = parseFloat(getTransaction.data.result.amount);
//             const user = await User.findOne({ id: element.userId });
//             var firstRecharge = 0;
//             const updatedDoc = await Trans.findOneAndUpdate(
//               { id: element.id, status: 'created' },
//               {status: 'success',expired: true,$inc: {__v: 1}},
//               { new: true, runValidators: true }
//             );

//             if(updatedDoc){
//               await daily.updateOne(
//                 { id: newDate },
//                 { $inc: { count: +1, amount: amount } },
//                 { upsert: true }
//               );
//               if (!user.firstRecharge) {
//                 firstRecharge = amount;
//                 await User.updateOne(
//                   { id: user.upLine[0] },
//                   {
//                     $inc: { balance: +151 },
//                     $push: {
//                       walletHistory: {
//                         amount: 151,
//                         date: Date.now(),
//                         credit: true,
//                         note: `Referal Reward User: ${user.id}`,
//                       },
//                     },
//                   }
//                 );
//                 await offerBonus.updateOne(
//                   { userId: user.upLine[0] },
//                   {
//                     userId: user.upLine[0],
//                     $inc: { amount: +151 },
//                     $push: {
//                       history: {
//                         credit: "wallet",
//                         amount: 151,
//                         note: `Referal Reward User: ${user.id}`,
//                         date: Date.now(),
//                       },
//                     },
//                   },
//                   {upsert: true}
//                 );
//                 if (amount > 4999) {
//                   const bonus = (amount * 10) / 100;
//                   amount = amount + bonus;
//                 }
//                 await User.updateOne(
//                   { id: user.id },
//                   {
//                     firstRecharge: true, $inc: { balance: +amount },
//                     $push: {
//                       rechargeHistory: {
//                         amount: amount,
//                         date: Date.now(),
//                         status: "Success",
//                       },
//                       walletHistory: {
//                         amount: amount,
//                         date: Date.now(),
//                         credit: true,
//                         note: `Add money ID: ${element.number}`,
//                       },
//                     },
//                   }
//                 );
//               }else{

//                 const bonus = (amount * 5) / 100;
//                 amount = amount + bonus;
//                 await User.updateOne(
//                   { id: user.id },
//                   {
//                     firstRecharge: true, $inc: { balance: +amount },
//                     $push: {
//                       rechargeHistory: {
//                         amount: amount,
//                         date: Date.now(),
//                         status: "Success",
//                       },
//                       walletHistory: {
//                         amount: amount,
//                         date: Date.now(),
//                         credit: true,
//                         note: `Add money ID: ${element.number}`,
//                       },
//                     },
//                   }
//                 );
//                 await User.updateOne(
//                   { id: user.upLine[0] },
//                   {
//                     $inc: { balance: bonus },

//                   }
//                 );
//                 await offerBonus.updateOne(
//                   { userId: user.upLine[0] },
//                   {
//                     userId: user.upLine[0],
//                     $inc: { amount: +bonus },
//                     $push: {
//                       history: {
//                         credit: "wallet",
//                         amount: bonus,
//                         note: `Recharge bonus: ${element.number}`,
//                         date: Date.now(),
//                       },
//                     },
//                   },
//                   {upsert: true}
//                 );
//               }



//               const userDate = new Date(user.date);
//               const userDateLocal = (userDate / 1000 + 19800) * 1000;
//               const newuserDate = new Date(userDateLocal);
//               const abhiDate = new Date();
//               const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
//               const newabhirDate = new Date(abhiDateLocal);
//               const day = newabhirDate.getDate();
//               const month = newabhirDate.getMonth() + 1;
//               const year = newabhirDate.getFullYear();

//                 const dayMonth = `${day}/${month}/${year}`;

//                 const userday = newuserDate.getDate();
//                 const usermonth = newuserDate.getMonth() + 1;
//                 const useryear = newuserDate.getFullYear();

//                 const userdayMonth = `${userday}/${usermonth}/${useryear}`;
//               const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
//               const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
//               const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

//               const phone0recharge = `level0.${user.phone}.totalRecharge`;
//               const phone1recharge = `level1.${user.phone}.totalRecharge`;
//               const phone2recharge = `level2.${user.phone}.totalRecharge`;

//               const phone0first = `level0.${user.phone}.firstRecharge`;
//               const phone1first = `level1.${user.phone}.firstRecharge`;
//               const phone2first = `level2.${user.phone}.firstRecharge`;

//               if (dayMonth === userdayMonth) {
//                 if (user.upLine !== null) {
//                   if (user.upLine[0].length !== 0) {
//                     await promotion.updateOne(
//                       { userId: user.upLine[0] ?? 1 },
//                       {
//                         userId: user.upLine[0] ?? 1,
//                         $inc: {
//                           [newphone0recharge]: amount,
//                         },
//                       },
//                       { upsert: true }
//                     );
//                   }
//                   if (user.upLine.length === 2) {
//                     if (user.upLine[1].length !== 0) {
//                       await promotion.updateOne(
//                         { userId: user.upLine[1] ?? 1 },
//                         {
//                           userId: user.upLine[1] ?? 1,
//                           $inc: {
//                             [newphone1recharge]: amount,
//                           },
//                         },
//                         { upsert: true }
//                       );
//                     }
//                   }
//                   if (user.upLine.length === 3) {
//                     if (user.upLine[1].length !== 0) {
//                       await promotion.updateOne(
//                         { userId: user.upLine[1] ?? 1 },
//                         {
//                           userId: user.upLine[1] ?? 1,
//                           $inc: {
//                             [newphone1recharge]: amount,
//                           },
//                         },
//                         { upsert: true }
//                       );
//                     }

//                     if (user.upLine[2].length !== 0) {
//                       await promotion.updateOne(
//                         { userId: user.upLine[2] ?? 1 },
//                         {
//                           userId: user.upLine[2] ?? 1,
//                           $inc: {
//                             [newphone2recharge]: amount,
//                           },
//                         },
//                         { upsert: true }
//                       );
//                     }
//                   }
//                 }
//               }

//               if (user.upLine !== null) {
//                 if (user.upLine[0].length !== 0) {
//                   await promotion.updateOne(
//                     { userId: user.upLine[0] ?? 1 },
//                     {
//                       userId: user.upLine[0] ?? 1,
//                       $inc: {
//                         [phone0first]: firstRecharge,
//                         [phone0recharge]: amount,
//                       },
//                     },
//                     { upsert: true }
//                   );
//                 }
//                 if (user.upLine.length === 2) {
//                   if (user.upLine[1].length !== 0) {
//                     await promotion.updateOne(
//                       { userId: user.upLine[1] ?? 1 },
//                       {
//                         userId: user.upLine[1] ?? 1,
//                         $inc: {
//                           [phone1first]: firstRecharge,
//                           [phone1recharge]: amount,
//                         },
//                       },
//                       { upsert: true }
//                     );
//                   }
//                 }
//                 if (user.upLine.length === 3) {
//                   if (user.upLine[1].length !== 0) {
//                     await promotion.updateOne(
//                       { userId: user.upLine[1] ?? 1 },
//                       {
//                         userId: user.upLine[1] ?? 1,
//                         $inc: {
//                           [phone1first]: firstRecharge,
//                           [phone1recharge]: amount,
//                         },
//                       },
//                       { upsert: true }
//                     );
//                   }

//                   if (user.upLine[2].length !== 0) {
//                     await promotion.updateOne(
//                       { userId: user.upLine[2] ?? 1 },
//                       {
//                         userId: user.upLine[2] ?? 1,
//                         $inc: {
//                           [phone2first]: firstRecharge,
//                           [phone2recharge]: amount,
//                         },
//                       },
//                       { upsert: true }
//                     );
//                   }
//                 }
//               }
//             }
//           }


//         }else{
//           var diff = 300;
//           const lastTime = element.date / 1000;
//           const currentTime = new Date();
//           const currentEpoch = currentTime.getTime() / 1000;
//           diff = currentEpoch - lastTime;
//           if (diff > 300) {
//             await Trans.updateOne(
//               { id: element.id },
//               { status: "expired", expired: true }
//             );
//           }
//         }

//       } catch (error) {
//         console.log(error.message)
//       }




//     });

//   } catch (error) {
//     console.log(error.message)
//   }



// });
// const clearLimit = schedule.scheduleJob('*/5 * * * *', async function(){


//   const getCreatedTrans = await Trans.find({gateway: 'UPI',status: "created"},{_id: 1,date: 1,amount: 1,key: 1});
//   getCreatedTrans.forEach(async element => {


//   const localDate = (element.date / 1000 + 19800) * 1000;
//   const newDatefor = new Date(localDate);
//   const day = newDatefor.getDate();
//   const month = newDatefor.getMonth() + 1;
//   const year = newDatefor.getFullYear();

//   var daySorted;
//   var monthSorted;
//   if (day < 10) {
//     daySorted = `0${day}`;
//   } else {
//     daySorted = `${day}`;
//   }
//   if (month < 10) {
//     monthSorted = `0${month}`;
//   } else {
//     monthSorted = `${month}`;
//   }
//   const dayMonth = `${daySorted}-${monthSorted}-${year}`;
//     var diff = 180;
//     const lastTime = element.date / 1000;
//     const currentTime = new Date();
//     const currentEpoch = currentTime.getTime() / 1000;
//     diff = currentEpoch - lastTime;



//     if (diff > 180) {
//       await Trans.updateOne(
//         { _id: element._id },
//         { status: "expired", expired: true }
//       );
//       if(element.key){
//         const field = `payment.${element.key.id}.limit`;

//         await daily.updateOne({id: dayMonth},{$inc: {[field] : - element.amount}})
//       }
//     }


//   });

// });


const router = express.Router();
// Minute 1 Routes
router.get("/minute1_getCurrentNumber/:api", minute1_getCurrentNumber);
router.get("/minute1_setResult/:id/:api", minute1_setResult);
router.get("/minute1_getTimer", minute1_getTimer);
router.post("/minute1_bidData", minute1_bidData);
router.get("/minute1_getRecordData", minute1_getRecordData); 
router.get("/minute1_getFullRecordData", minute1_getFullRecordData);
router.get("/minute1_getHistoryData/:id", minute1_getHistoryData);
router.get("/minute1_getFullHistoryData/:id", minute1_getFullHistoryData);
router.get("/minute1_getPricing/:api", minute1_getPricing);

// Minute 3 Routes
router.get("/minute3_getCurrentNumber/:api", minute3_getCurrentNumber);
router.get("/minute3_setResult/:id/:api", minute3_setResult);
router.get("/minute3_getTimer", minute3_getTimer);
router.post("/minute3_bidData", minute3_bidData);
router.get("/minute3_getRecordData", minute3_getRecordData);
router.get("/minute3_getFullRecordData", minute3_getFullRecordData);
router.get("/minute3_getHistoryData/:id", minute3_getHistoryData);
router.get("/minute3_getFullHistoryData/:id", minute3_getFullHistoryData);
router.get("/minute3_getPricing/:api", minute3_getPricing);

// Minute 5 Routes
router.get("/minute5_getCurrentNumber/:api", minute5_getCurrentNumber);
router.get("/minute5_setResult/:id/:api", minute5_setResult);
router.get("/minute5_getTimer", minute5_getTimer);
router.post("/minute5_bidData", minute5_bidData);
router.get("/minute5_getRecordData", minute5_getRecordData);
router.get("/minute5_getFullRecordData", minute5_getFullRecordData);
router.get("/minute5_getHistoryData/:id", minute5_getHistoryData);
router.get("/minute5_getFullHistoryData/:id", minute5_getFullHistoryData);
router.get("/minute5_getPricing/:api", minute5_getPricing);

router.post("/signin", signin); // secured
router.post("/bidData", bidData); // secured
router.post("/signup", signup); // secured
router.post("/applyBonus", applyBonus); // secured
router.post("/applyWithdrawal", applyWithdrawal);
router.post("/applyWithdrawalUSDT", applyWithdrawalUSDT);

// Games Catalog (public + master admin)
import { getAllProviders } from "../controller/providerController.js";
router.get("/getProviders", getAllProviders);

router.get("/gamesCatalog", getGamesCatalogPublic);
router.get("/gamesCatalogAdmin/:api", getGamesCatalogAdmin);
router.post("/gamesCatalogAdmin/:api", createGameCatalogAdmin);
router.put("/gamesCatalogAdmin/:id/:api", updateGameCatalogAdmin);
router.delete("/gamesCatalogAdmin/:id/:api", deleteGameCatalogAdmin);

router.post("/addBank", addBank);
//router.post('/addUpi',  addUpi);
router.post("/resetPassword", resetPassword); //secured
router.get("/setAutoMode/:auto/:api", setAutoMode);
router.get("/setResult/:game/:id/:api", setResult);
router.get("/getCurrentNumber/:api", getCurrentNumber); // secured
router.post("/addAddress", addAddress); // secured
router.post("/accountSecurity", accountSecurity); // secured
router.get("/getUser/:id", checkAuth, getUserData);
router.get("/getUserHome/:id", checkAuth, getUserDataHome); // secured
router.get("/getUserWithdrawal/:id", checkAuth, getUserDataWithdrawal); // secured

// secured
router.get("/getRecord", getRecordData); // secured
router.get("/getFullRecord", getFullRecordData); // secured
router.get("/getTimer", getTimer); // secured
router.get("/getWithdrawal/:id/", checkAuth, getWithdrawal); //secured
router.get("/getAllWithdrawal/:api", getAllWithdrawal); // secured
router.get("/getAllWithdrawalUSDT/:api", getAllWithdrawalUSDT); // secured
router.get("/admin-api/stats/:api", getAdminStats);
router.get("/admin-api/users/:api", getAllUsersAdmin);
router.post("/admin-api/updateUser/:api", updateUserAdmin);
router.get("/admin-api/withdrawals/:api", getAllWithdrawalsAdmin);
router.post("/admin-api/updateWithdrawal/:api", updateWithdrawalAdmin);
router.get("/admin-api/transactions/:api", getAdminTransactions);

// Commission Management
router.get("/admin-api/commission/configs/:api", getCommissionConfigs);
router.post("/admin-api/commission/configs/:api", createCommissionConfig);
router.put("/admin-api/commission/configs/:id/:api", updateCommissionConfig);
router.get("/admin-api/commission/agents/:api", getAgentConfigs);
router.post("/admin-api/commission/agents/:userId/:api", updateAgentConfig);
router.get("/user/affiliate/stats/:id", checkAuth, getAffiliateStats);

// Game Routes
router.post("/game/launch/:id", checkAuth, launchGame);
router.post("/api/gameCallback", gameCallback);

router.get(
  "/processWithdrawal/:id/:status/:amount/:userId/:api/:_id",
  processWithdrawal
);
router.get("/updateWithdrawalType/:type/:_id/:api", updateWithdrawalType); // secured
router.get("/getHighBalanceUsers/:api", getHighBalanceUsers); // secured
router.get("/getBidHistory/:id/", checkAuth, getHistoryData); // secured
router.get("/getFullBidHistory/:id", checkAuth, getFullHistoryData); // secured
router.get("/getPricing/:api", getPricing); // secured
router.get("/playerJankaari/:id/:api", playerJankaari);
router.get("/updataUserBalancegyf46/:id/:api/:balance", updataUserBalance);
router.get("/updataUserBonus/:id/:api/:bonus", updataUserBonus);
router.get("/ClearUserContri/:id/:api", ClearUserContri);

// secured// secured
router.get("/getUserBonusHistory/:api/:id", getUserBonus)
router.get("/setServerDown/:id/:api/:down", setServerDown); // secured// secured
router.get("/viewDownUSers/:api", viewDownUsers);
router.get("/setServerDownLevel/:id/:api/:down", setServerDownLevel); // secured// secured

//red Evelop
router.post("/createEnvelop", createEnvelop);
router.get("/generateEnvelop/:amount/:api", generateEnvelop);
router.get("/validateEnvelop/:id/:userId", validateEnvelop);
router.get("/claimEnvelop/:id/:userId", claimEnvelop);
router.get("/getUserEnvelop/:id", getUserEnvelop);
router.get("/redeemEnvelop/:redId/:id", checkAuth, redeemEnvelop);

router.get("/health-check", async (req, res) => {
  res.status(200).json({ ok: true });
});

router.post("/sendOTPEnv", [rateLimit()], async (req, res) => {
  const phone = req.body.phone;

  try {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

    await otp.create({
      id: phone,
      phone: phone,
      expired: false,
      code: code,
      date: Date.now(),
    });

    // Send OTP using the new API
    const apiUrl = `https://apihome.in/panel/api/bulksms/?key=${process.env.API_KEY}&mobile=${phone}&otp=${code}`;

    try {
      const smsResponse = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('SMS Response:', smsResponse.data);
    } catch (smsError) {
      console.error('SMS Error:', smsError);

    }
    res.send("Done");
  } catch (error) {
    console.error('Error:', error);
    res.send("Done");
  }
});

router.post("/sendOTPBank", [rateLimit()], async (req, res) => {
  const phone = req.body.phone.toString();

  try {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

    await otp.create({
      id: phone,
      phone: phone,
      expired: false,
      code: code,
      date: Date.now(),
    });

    // Send OTP using the new API
    const apiUrl = `https://apihome.in/panel/api/bulksms/?key=${process.env.API_KEY}&mobile=${phone}&otp=${code}`;

    try {
      const smsResponse = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('SMS Response:', smsResponse.data);
    } catch (smsError) {
      console.error('SMS Error:', smsError);

    }
    res.send("Done");
  } catch (error) {
    console.error('Error:', error);
    res.send("Done");
  }
});

router.post("/sendOTPFor", [rateLimit()], async (req, res) => {
  const phone = req.body.phone.toString();

  try {
    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

    await otp.create({
      id: phone,
      phone: phone,
      expired: false,
      code: code,
      date: Date.now(),
    });

    // Send OTP using the new API
    const apiUrl = `https://apihome.in/panel/api/bulksms/?key=${process.env.API_KEY}&mobile=${phone}&otp=${code}`;

    try {
      const smsResponse = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('SMS Response:', smsResponse.data);
    } catch (smsError) {
      console.error('SMS Error:', smsError);

    }
    res.send("Done");
  } catch (error) {
    console.error('Error:', error);
    res.send("Done");
  }
});

router.post("/sendOTP", [rateLimit()], async (req, res) => {
  const token = req.body.token;
  const phone = req.body.phone.toString();
  const secret_key = process.env.g_secret_key;
  const googleUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

  try {
    console.log('Sending OTP for Phone:', phone, 'with token:', token);
    const response = await axios.post(googleUrl);
    console.log('reCAPTCHA response:', response.data);
    if (response.data.success) {
      const code = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

      await otp.create({
        id: phone,
        phone: phone,
        expired: false,
        code: code,
        date: Date.now(),
      });

      // Send OTP using the new API
      const apiUrl = `https://apihome.in/panel/api/bulksms/?key=${process.env.API_KEY}&mobile=${phone}&otp=${code}`;

      try {
        const smsResponse = await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('SMS Response:', smsResponse.data);
      } catch (smsError) {
        console.error('SMS Error:', smsError);
        // Fallback to existing SMS service if new one fails
        const message = `Dear user, Your Requested OTP is ${code} Please don't share your OTP to anyone.\r\nRegards VGA Team`;
        const fallbackUrl = `https://api.textlocal.in/send/?apikey=${process.env.TextLocal}=&numbers=91${phone}&sender=VGACLB&message=${encodeURIComponent(message)}`;
        await axios.post(fallbackUrl);
      }
    }
    res.send("Done");
  } catch (error) {
    console.error('Error:', error);
    res.send("Done");
  }
});

router.post("/upiCreateOrder", upiCreateOrder);
router.post("/upiCreateOrderV2", upiCreateOrderV2);
router.get("/upiVerifyPayment/:id", upiVerifyPayment);
router.post("/upiGatewayWebhooktdv1", upiGatewayWebhooktdv1);
//router.post("/upiFinFlyWebhooktdf575v1", finflyupiGatewayWebhooktdv1);
router.post("/upiIMBWebhooktdf57578v1", imbupiGatewayWebhooktdv1);

//UPI Point
router.post("/createUPIPointOrder", UPIPointGateway);
router.post("/upiPointWebhookjfhv8", upiPointGatewayWebhooktdv1);


//router.post("/createFinflyOrder",finflyCreateOrder)
router.post("/createIMBOrder", imbCreateOrder);

router.post("/initiatePhonePePG/:id", checkAuth, phonepePG);
router.post("/initiatePhonePeGatewayEcom", phonepePGEcom);

router.post("/processphonepepg", processphonepePG);
router.post("/phonepepgredirect/:id/:userId", phonepepgredirect);
router.get("/checkPhonePeStatus/:id", checkPhonePeStatus);

//Razorpay
router.post("/razarpay/create-order/:id", checkAuth, razorpayCreateOrder);
router.post('/razarpay/verify/:id', checkAuth, razorpayVerify);

//Cashfree
router.post("/cashfree/create-order/:id", checkAuth, cashfreeCreateOrder);
router.post('/cashfree/verify', cashfreeVerify);

//Paygic Gateway
router.post("/v2/createUPIintent/:id", checkAuth, createUPIintent);
router.post("/paygicUPICallbackuyefg7346/", paygicUPICallback);

//Airpay Gateway
router.post("/v2/createAirpayOrder/:id", checkAuth, createAirpayOrder);

//Crypto UPAY
router.post("/createCryptoUpayOrder/:id", checkAuth, createCryptoUpayOrder);
router.post("/cryptoUpayCallback", verifyCryptoSign);

//Paycial Gateway
router.post("/paycialCreateOrder/:id", checkAuth, paycialCreateOrder);
router.post("/paycialCallbackV1", paycialCallback);

router.get("/getPromotionMembers/:id", checkAuth, promotionMembers);

router.get("/getPromotionFull/:id", checkAuth, oldPromotion);
router.get("/getPromotionNew/:id", checkAuth, newPromotion);
router.get(
  "/getPromotionLiveBalance/:id/:phone",
  checkAuth,
  getPromotionLiveBalance
);

router.post("/createTransactionQR/:id/:amount", checkAuth, createQRTrans);
router.get("/getShuffleUPI/:id", checkAuth, getShuffleUPI);
router.get("/getShuffleUPIV4/:id", checkAuth, getShuffleUPIV4);
router.post("/submitUTR/:id/:amount", checkAuth, submitUTR);
router.get("/getRecentRecharges/:id", checkAuth, getRecentRecharge);


//router.get("/getPendingTransactions/:api", getPendingTransaction);
//router.post("/updatePendingTransaction/:api/:id/:status", updatePendingTransaction);

// router.get(
//   "/toddRecharge/getPendingTransactions/:api",
//   toddRechargegetPendingTransaction
// );
// router.get(
//   "/toddRecharge/getPendingTransactionsPaytm/:api",
//   toddRechargegetPendingTransactionPaytm
// );
// router.post(
//   "/toddRecharge/updatePendingTransaction/:api/:id/:status",
//   toddRechargeupdatePendingTransaction
// );
// router.get(
//   "/toddRecharge/getDeniedTransactions/:api",
//   toddRechargegetDeniedTransaction
// );
// router.get(
//   "/toddRecharge/getAllApprovedTransactions/:api",
//   toddRechargegetAllApprovedTransaction
// );

//PIN WALLET
// router.post("/createPinWalletIntent",createPinWalletIntent);
// router.post("/pinWalletCallBack",pinWalletCallback);
// router.post("/pinWalletPayoutygj/:api",pinWalletPayout);
// router.get('/pinCheckBal/:api',pinCheckBalance);

router.post("/processPayoutWith/:api", payoutWith)
router.post("/getPayouts/:api", getPayouts);

router.get("/userLevelData/:id/:phone", checkAuth, async (req, res) => {
  const phone = req.params.phone;
  const id = req.params.id;
  var firstRecharge = 0;
  var balance = 0;
  var todayBet = 0;
  var todayRecharge = 0;
  var todayWithdrawal = 0;
  var totalRecharge = 0;

  const date = new Date();
  const localDate = (date / 1000 + 19800) * 1000;
  const newDate = new Date(localDate);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const dayMonth = `${day}/${month}`;
  console.log(dayMonth);
  const getUser = await User.findOne({ phone });
  if (getUser.bidToday) {
    todayBet = getUser.bidToday[`${day}/${month - 1}`] ?? 0;
  }
  const getWithdraw = await Withdrawal.findOne({ userId: getUser.id }).sort({
    date: -1,
  });
  if (getWithdraw) todayWithdrawal = getWithdraw.amount;
  balance = getUser.balance.toFixed(2);
  if (getUser.rechargeHistory.length > 0) {
    firstRecharge = getUser.rechargeHistory[0].amount;

    getUser.rechargeHistory.forEach((doc) => {
      totalRecharge += doc.amount;

      const _date = new Date(doc.date);
      const _day = _date.getDate();
      const _month = _date.getMonth();
      const _dayMonth = `${_day}/${_month}`;

      if (dayMonth === _dayMonth) {
        todayRecharge += doc.amount;
      }
    });
  }

  res.status(200).send({
    firstRecharge,
    balance,
    todayBet,
    todayRecharge,
    todayWithdrawal,
    totalRecharge,
  });
});
router.get("/userLevelDataAdmin/:phone/:api", async (req, res) => {
  const phone = req.params.phone;
  const api = req.params.api;
  var firstRecharge = 0;
  var balance = 0;
  var todayBet = 0;
  var todayRecharge = 0;
  var todayWithdrawal = 0;
  var totalRecharge = 0;

  const date = new Date();
  const localDate = (date / 1000 + 19800) * 1000;
  const newDate = new Date(localDate);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const dayMonth = `${day}/${month}`;
  console.log(dayMonth);
  if (api === process.env.AdminAPI) {
    const getUser = await User.findOne({ phone });
    if (getUser.bidToday) {
      todayBet = getUser.bidToday[`${day}/${month - 1}`] ?? 0;
    }
    const getWithdraw = await Withdrawal.findOne({ userId: getUser.id }).sort({
      date: -1,
    });
    if (getWithdraw) todayWithdrawal = getWithdraw.amount;
    balance = getUser.balance.toFixed(2);
    if (getUser.rechargeHistory.length > 0) {
      firstRecharge = getUser.rechargeHistory[0].amount;

      getUser.rechargeHistory.forEach((doc) => {
        totalRecharge += parseFloat(doc.amount);

        const _date = new Date(doc.date);
        const _day = _date.getDate();
        const _month = _date.getMonth();
        const _dayMonth = `${_day}/${_month}`;

        if (dayMonth === _dayMonth) {
          todayRecharge += parseFloat(doc.amount);
        }
      });
    }

    res.status(200).send({
      firstRecharge,
      balance,
      todayBet,
      todayRecharge: todayRecharge.toFixed(2),
      todayWithdrawal,
      totalRecharge: totalRecharge.toFixed(2),
    });
  } else {
    res.status("dpne");
  }
});

//Kindent
// router.post("/KSLcallbacktodd", KSLcallbacktodd);
// router.post("/KSLcallbacktoddpayout", KSLcallbacktodd);
// //router.post("/KSLcreatelinktodd", KSLcreatelinktodd);
// router.post("/KSLpayouttodd/:api", KSLpayouttodd);

//PlanetC

// router.post("/planetCreateLink", planetCreateLink);
// router.post("/planetCallback", planetCallback);

// router.post("/planetPayout/:api", planetCPayout);
// router.post("/planetPayoutCallback", planetCallbackpayout);

//Payhub....
// router.post("/payhubCallBackURLv1", payhubCallBackURLv1);
// router.post('/createPayhubPayment',createPayhubPayment);

//chinease

router.get("/chineaseRushPay", chineasePay);

//Rupee Rush Gateway
router.post("/rupeeRushCreateOrder/:id", checkAuth, rupeeRushCreateOrder);
router.post("/rupeeRushCallback", rupeeRushCallback);
router.post("/rupeeRushPayout/:api", rupeeRushPayout);
router.post("/rupeeRushPayoutCallback", rupeeRushPayoutCallback);
router.get("/rupeeRushBalance/:api", rupeeRushBalanceFetch);

//WatchPay Gateway
router.post("/watchPayCreateOrder/:id", checkAuth, watchPayCreateOrder);
router.post("/watchPayCallback", watchPayCallback);
router.post("/watchPayPayout/:api", watchPayPayout);
router.get("/watchPayBalance/:api", watchPayBalanceFetch);

//lgPay Gateway
router.post("/lgPayCreateOrder/:id", checkAuth, lgPayCreateOrder);
router.post("/lgPayCallback", lgPayCallback);
router.get("/lgPayBalance/:api", lgPayBalanceFetch);

// Test endpoint for lgPay
router.get("/testLgPay", async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "lgPay gateway is integrated and ready",
      endpoints: {
        createOrder: "/lgPayCreateOrder/:id (requires authentication)",
        callback: "/lgPayCallback",
        balance: "/lgPayBalance/:api (requires admin API key)"
      },
      config: {
        appId: process.env.LGPAY_APP_ID ? "Configured" : "Not configured",
        secretKey: process.env.LGPAY_SECRET_KEY ? "Configured" : "Not configured",
        apiUrl: process.env.LGPAY_API_URL || "Using default",
        serverUrl: process.env.SERVER_URL || "Not configured",
        clientUrl: process.env.CLIENT_URL || "Not configured"
      },
      sampleRequest: {
        method: "POST",
        url: "/lgPayCreateOrder/{userId}",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer {your_jwt_token}"
        },
        body: {
          amount: 100,
          customer_name: "John Doe",
          customer_email: "john@example.com",
          customer_mobile: "9876543210"
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// Test endpoint for WatchPay
router.get("/testWatchPay", async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "WatchPay gateway is integrated and ready",
      endpoints: {
        createOrder: "/watchPayCreateOrder/:id (requires authentication)",
        callback: "/watchPayCallback",
        balance: "/watchPayBalance",
        payout: "/watchPayPayout/:api"
      },
      config: {
        merchantId: process.env.WATCHPAY_MCH_ID ? "Configured" : "Not configured",
        merchantKey: process.env.WATCHPAY_MERCHANT_KEY ? "Configured" : "Not configured",
        apiUrl: process.env.WATCHPAY_API_URL || "Using default",
        serverUrl: process.env.SERVER_URL || "Not configured",
        clientUrl: process.env.CLIENT_URL || "Not configured"
      },
      sampleRequest: {
        method: "POST",
        url: "/watchPayCreateOrder/{userId}",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer {your_jwt_token}"
        },
        body: {
          amount: 100,
          customer_name: "John Doe",
          customer_email: "john@example.com",
          customer_mobile: "9876543210"
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// Test endpoint for Rupee Rush
router.get("/testRupeeRush", async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Rupee Rush gateway is integrated and ready",
      endpoints: {
        createOrder: "/rupeeRushCreateOrder/:id (requires authentication)",
        callback: "/rupeeRushCallback",
        balance: "/rupeeRushBalance/:api (requires admin API key)",
        payout: "/rupeeRushPayout/:api"
      },
      config: {
        merchantNo: process.env.RUPEERUSH_MER_NO ? "Configured" : "Not configured",
        secretKey: process.env.RUPEERUSH_SECRET_KEY ? "Configured" : "Not configured",
        apiUrl: process.env.RUPEERUSH_API_URL || "Using default",
        serverUrl: process.env.SERVER_URL || "Not configured",
        clientUrl: process.env.CLIENT_URL || "Not configured",
        paymentTypes: process.env.RUPEERUSH_PAYMENT_TYPES ? process.env.RUPEERUSH_PAYMENT_TYPES.split(',') : ["UPI", "PAYTM", "PHONEPE", "GPAY", "INRO"]
      },
      sampleRequest: {
        method: "POST",
        url: "/rupeeRushCreateOrder/{userId}",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer {your_jwt_token}"
        },
        body: {
          amount: 100.00,
          customer_name: "John Doe",
          customer_email: "john@example.com",
          customer_mobile: "9876543210"
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// Get today's all transactions
router.get("/getTodayTransactions/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    try {
      // Get current timestamp and subtract 24 hours
      const now = Date.now();
      const last24Hours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const startTimestamp = now - last24Hours;
      const endTimestamp = now;

      // Find all transactions from last 24 hours
      const transactions = await Trans.find({
        date: {
          $gt: startTimestamp,
          $lt: endTimestamp
        }
      }).sort({ date: -1 }); // Sort by newest first

      res.status(200).json({
        status: "success",
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/getNotice", async (req, res) => {
  try {
    const getNotice = await extra.findOne({ id: 1 }, { notice: 1 });
    if (getNotice && getNotice.notice) {
      res.status(200).send({ notice: getNotice.notice });
    } else {
      res.status(200).send({ notice: { heading: "Welcome", body: "Win Big Daily!" } });
    }
  } catch (err) {
    console.error("Notice Error:", err.message);
    res.status(200).send({ notice: { heading: "Welcome", body: "Win Big Daily!" } });
  }
});


//daily Task

router.get("/getDailyTask/:id", checkAuth, getDailyTask);
router.get("/claimDailyTask/:id/:number", checkAuth, claimDailyTask);

// Agent Earning
router.get("/getAgentEarnings/:id", checkAuth, getAgentEarning);

//Invite Bonus
router.get("/getInviteBonusData/:id", checkAuth, getInviteBonusData);
router.get("/claimInvitationBonus/:id/:tier", checkAuth, claimInvitationBonus);
router.get("/getInvitationRecords/:id", checkAuth, getInviteRecord);
//Salary System
router.get("/getSalaryTask/:id", checkAuth, getSalaryTask);
router.get("/claimSalary/:id/:number", checkAuth, claimSalary);

router.post("/getSalaryRecordAdmin/:api", getSalaryRecordAdmin);

// Offer transaction history route
router.get("/getOfferTransactions/:id", checkAuth, getOfferTransactions);

router.get("/getCurrentGateway", getGateway);
router.post("/setCurrentGateway/:api/:gateway", setGateway);

router.post("/updateUpi/:api/:value", updateUpi);
router.post("/updateUpiV3/:api/:value", updateUpiV3);

router.get("/getCurrentGatewayOut", getGatewayOut);
router.post("/setCurrentGatewayOut/:api/:gateway", setGatewayOut);

router.get("/admin/recharge-settings/:api", getRechargeSettings);
router.post("/admin/recharge-settings/:api", updateRechargeSettings);

router.get("/carousel", getCarousel);
router.get("/admin/carousel/:api", getCarouselAdmin);
router.post("/admin/carousel/upload/:api", (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed" });
    next();
  });
}, uploadCarouselImage);
router.post("/admin/carousel/order/:api", updateCarouselOrder);
router.post("/admin/carousel/delete/:api", deleteCarouselImage);

router.get("/site-settings", getSiteSettings);
router.get("/admin/site-settings/:api", getSiteSettingsAdmin);
router.post("/admin/site-settings/logo/upload/:api", uploadLogoSingle, uploadLogo);
router.post("/admin/site-settings/apk/upload/:api", uploadApkSingle, uploadApk);
router.post("/updateSiteSettings/:api", updateSiteSettings);

router.get("/getDailyData/:api", async (req, res) => {
  const api = req.params.api;

  if (api === process.env.AdminAPI || api === process.env.ToddRecharge || api === process.env.ToddAgentRecharge) {
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

    const daily = await Daily.findOne({ id: newDate });
    if (daily) {
      res.status(200).send(daily);

    } else {
      res.status(200).send("no data");

    }

  } else {

    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/getAllDailyData/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var totalSent = 0;
    var totalRec = 0;

    const daily = await Daily.find();
    // for (const element of daily){
    //   totalRec += element.amount;
    //   totalSent += element.redeem??0;
    // }

    // console.log(totalRec);
    // console.log(totalSent);
    res.status(200).send(daily.reverse());
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/processSuspension/:id/:block/:api", async (req, res) => {
  const block = req.params.block;
  const id = req.params.id;
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    if (block === "true") {
      await User.updateOne({ id }, { block: true });
    } else {
      await User.updateOne({ id }, { block: false });
    }
    console.log("here1");

    res.send("done", 200);
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});
router.get("/processSuspensionLEVEL/:id/:block/:api", async (req, res) => {
  const block = req.params.block;
  const id = req.params.id;
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    if (block === "true") {
      await User.updateOne({ phone: id }, { block: true });
    } else {
      await User.updateOne({ id }, { block: false });
    }
    console.log("here1");

    res.send("done", 200);
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/playerJankaarilevelData/:id/:btn/:api", playerJankaarilevelData);
//router.get("/levelMigrate/:id", migratePlayerJankaarilevelData);
//router.get("/migrateOldPromotion/:id", migrateOldPromotion);

router.get("/getAllUserWithdrawal/:phone/:api", getAllUserWithdrawal);

router.get("/getDashboard/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    const totalUsers = await User.countDocuments();
    const demoUsers = await User.countDocuments({ demo: true });
    const rechargeUsers = await User.countDocuments({ firstRecharge: true });
    const blocked = await User.countDocuments({ block: true });
    const totalWithdrawal = await With.countDocuments({ status: "Success" });
    const recharges = await Trans.countDocuments({ status: "success" });
    res.status(200).send({
      totalUsers,
      demoUsers,
      rechargeUsers,
      totalWithdrawal,
      recharges,
      blocked,
    });
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/getBidHistoryAdmin/:id/:api", async (req, res) => {
  const id = req.params.id;
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {

    bidHistory
      .find({ "bid.userId": parseInt(id) })
      .sort({ "bid.period": -1 })
      .then((result) => {
        if (result.length > 0) {
          var newBid = [];

          for (var i = 0; i < result.length; i++) {
            result[i].bid.forEach((bid) => {
              if (bid.userId === parseInt(id)) {
                newBid.push(bid);
              }
            });
          }
        }

        res.status(200).send(newBid ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {

    res.status(401).send({ msg: "Auth Failed" });
  }
});

// router.post("/rojpgResponse", async (req, res) => {
//   const secret = "scrJ9dtQ7EuPv1qBqGld6aXnmg9CfeMCPtB";
//   const toDecrypt = req.body.respData;

//   crypto.pbkdf2(
//     secret,
//     "Asdf@1234",
//     65536,
//     256 / 8,
//     "sha256",
//     async (err, derivedKey) => {
//       var binKey = pack("C*", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
//       const decipher = crypto.createDecipheriv(
//         "aes-256-cbc",
//         derivedKey,
//         binKey
//       );
//       let decrypted = decipher.update(toDecrypt, "base64", "utf8");

//       var spilitedDecrypt = decrypted.split(/\s*,\s*/);

//       if (spilitedDecrypt[23] === "Transaction Successful") {
//         const getTrans = await Trans.findOne({
//           id: spilitedDecrypt[1],
//           status: "created",
//         });
//         if (getTrans) {
//           var amount = getTrans.amount;
//           await Trans.updateOne(
//             { id: spilitedDecrypt[1] },
//             {
//               date: Date.now(),
//               rojpgTxnId: spilitedDecrypt[2],
//               status: "success",
//               expired: true,
//             }
//           );
//           const user = await User.findOne({ id: getTrans.userId });

//           if (!user.firstRecharge) {
//             var referAddition = (amount * 20) / 100;
//             if (referAddition > 1500) {
//               referAddition = 1500;
//             }

//             await User.updateOne(
//               { id: user.upLine[0] },
//               {
//                 $inc: { balance: +referAddition },
//                 $push: {
//                   walletHistory: {
//                     amount: referAddition,
//                     date: Date.now(),
//                     credit: true,
//                     note: `Referal Reward User: ${user.id}`,
//                   },
//                 },
//               }
//             );
//             // if(amount > 4999){
//             const getPer = getOffer.getOffer;
//             const bonus = (amount * getPer) / 100;

//             amount = amount + bonus;
//             // }
//             await User.updateOne(
//               { id: getTrans.userId },
//               {
//                 firstRecharge: true,
//                 $inc: { balance: +amount },
//                 $push: {
//                   rechargeHistory: {
//                     amount: amount,
//                     date: Date.now(),
//                     status: "Success",
//                   },
//                   walletHistory: {
//                     amount: amount,
//                     date: Date.now(),
//                     credit: true,
//                     note: `Add money ID: ${getTrans.number}`,
//                   },
//                 },
//               }
//             );
//           } else {
//             if (amount > 4999) {
//               const getPer = 10;
//               const bonus = (amount * getPer) / 100;

//               amount = amount + bonus;
//             }
//             await User.updateOne(
//               { id: getTrans.userId },
//               {
//                 firstRecharge: true,
//                 $inc: { balance: +amount },
//                 $push: {
//                   rechargeHistory: {
//                     amount: amount,
//                     date: Date.now(),
//                     status: "Success",
//                   },
//                   walletHistory: {
//                     amount: amount,
//                     date: Date.now(),
//                     credit: true,
//                     note: `Add money ID: ${getTrans.number}`,
//                   },
//                 },
//               }
//             );
//           }

//           res.redirect("https://game.toddapples.com");
//         } else {
//           res.redirect("https://toddapples.com");
//         }
//       } else {
//         res.redirect("https://toddapples.com");
//       }
//     }
//   );
// });

// router.get("/rojpgSubmit", async (req, res) => {
//   const token = req.query.token;
//   const userId = req.query.id;

//   const user = await User.findOne({ id: userId });

//   if (user.token !== token) {
//     return res.status(401).json({
//       message: "Auth Failed",
//     });
//   } else {
//     const email = req.query.email;
//     const phone = req.query.phone;

//     const mid = "900000000000224";
//     const amount = parseInt(req.query.amount) * 100;
//     const salt = "salcFSgRvYOu9SiKaq4Pu4PrlJDZd29ND";
//     const secret = "scrJ9dtQ7EuPv1qBqGld6aXnmg9CfeMCPtB";
//     const responseURL = "https://server.toddapples.com/rojpgResponse";

//     const lastTrans = await Trans.findOne().sort({ number: -1 });
//     const newTrans = lastTrans.number + 1;
//     const newOderId = `ORD${newTrans}`;
//     await Trans.create({
//       id: newOderId,
//       gateway: "RojPG",
//       createDate: Date.now(),
//       userId,
//       amount: parseInt(req.query.amount),
//       number: newTrans,
//       status: "created",
//     });

//     const orderNoAmountString = `${newOderId},${amount}`;
//     const data = `${mid},${newOderId},${amount},INR,S,null,null,null,null,null,null,null,null,null,null,${email},${phone},Indore,Indore,MP,452001,null,null,null,${responseURL},intent,intent,null`;

//     crypto.pbkdf2(
//       secret,
//       "Asdf@1234",
//       65536,
//       256 / 8,
//       "sha256",
//       (err, derivedKey) => {
//         if (err) throw err;
//         var binKey = pack("C*", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

//         const cipher = crypto.createCipheriv("aes-256-cbc", derivedKey, binKey);
//         let encrypted = cipher.update(data, "utf8", "base64"); // 1st Base64 encoding
//         encrypted += cipher.final("base64");

//         const saltKeybase64 = Buffer.from(salt).toString("base64");

//         let hmac = crypto.createHmac("sha512", saltKeybase64);
//         let signed = hmac
//           .update(Buffer.from(orderNoAmountString, "utf-8"))
//           .digest("hex");
//         const finalHex = signed.toUpperCase();

//         // https://pg.rojpaymentz.com/RequestPG
//         // <input type="hidden" name="mid" value="100000000000001" />
//         //   <input type="hidden" name="encryptReq" value={rojpgData.encryptReq} />
//         //   <input type="hidden" name="checkSum" value={rojpgData.checkSum} />

//         //res.send({ encrypted: encrypted, hex: finalHex });
//         res.send(`<form method="post" name="payment" action="https://pg.Sambhavpay.com/RequestPG">
//               <input type="hidden" name="mid" value="900000000000224" />
//           <input type="hidden" name="encryptReq" value="${encrypted}" />
//                   <input type="hidden" name="checkSum" value="${finalHex}" />
//           </form>
//           <script language="javascript">document.payment.submit();</script>`);
//       }
//     );
//   }
// });

// ***** Aviator *****

router.get("/getAviatorRecordData", getAviatorRecordData);
router.get("/getAviatorFullRecordData", getAviatorFullRecordData);
router.get(
  "/getAviatorFullBidHistory/:id",
  checkAuth,
  aviator_getFullHistoryData
);
router.get("/getAviatorReport/:api", getAviatorReport);
router.get("/getPriceAviator/:api", aviator_getPricing);
router.post("/setResultAviator/:api", aviator_setResult);
router.get("/getAviatorBidHistory/:id", checkAuth, aviator_currentBid);

router.get("/getAviatorBidHistoryAdmin/:id/:api", async (req, res) => {
  const id = req.params.id;
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    aviatorHistory
      .find({ "bid.userId": parseInt(id) })
      .sort({ "bid.period": -1 })
      .then((result) => {
        if (result.length > 0) {
          var newBid = [];

          for (var i = 0; i < result.length; i++) {
            result[i].bid.forEach((bid) => {
              if (bid.userId === parseInt(id)) {
                newBid.push(bid);
              }
            });
          }
        }
        res.status(200).send(newBid);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

// router.get("/aviatorGenerateReport", async(req,res) => {
//   const getHistories = await playHistory.find({'history.game': "Aviator"});
//   var placed = 0;
//   var placedN = 0
//   var winning = 0;
//   var winningN = 0;
//   for(const element of getHistories){

//     if(element.userId === 34188 || element.userId === 1155 || element.userId === 2641){
//       console.log(element.userId);
//      }else{
//        const user = await User.findOne({id: element.userId},{demo: 1});
//        if(user){
//         if(user.demo){

//         }else{
//         for(const doc of element.history){
//          if(doc.game === "Aviator"){

//         if(doc.credit){
//            winning += doc.amount;
//            winningN++;
//         }else{
//           placed += doc.amount;
//            placedN++;

//         }
//       }
//         }}

//        }else{
//         console.log('no')

//        }

//      }

//   }

//   console.log(`placed - ${placed}`);
//   console.log(`placedN - ${placedN}`);

//   console.log(`win - ${winning}`);
//   console.log(`winN - ${winningN}`);

//   res.status(200).send('done');

// })

// ***** Mines *****

router.get("/getMinesBidHistory/:id", checkAuth, getMinesHistoryData);
router.get("/getMinesFullBidHistory/:id", checkAuth, getMinesFullHistoryData);
router.get("/getExtra/:api", getExtra);
router.post("/setExtra/:api/:game", setExtra);
router.post("/setMinesManual/:api", setMinesManual);
router.get("/getMinesSessionsAdmin/:api", getMinesSessionsAdmin);
router.get("/checkMinesSessions/:api", checkMinesSessions);
router.get("/getMinesReport/:api", getMinesReport);
// router.get("/createMinesReport/:api", createMinesReport);

router.get(
  "/getMinesFullBidHistoryAdmin/:id/:api",
  getMinesFullHistoryDataAdmin
);

// **** Fast Parity *****
router.get("/fastParity_getCurrentNumber/:api", fastParity_getCurrentNumber);
router.get("/fastParity_setAutoMode/:auto/:api", fastParity_setAutoMode);
router.get("/fastParity_setResult/:id/:api", fastParity_setResult);
router.post("/fastParity_bidData", fastParity_bidData);
router.get("/fastParity_getRecord", fastParity_getRecordData); // secured
router.get("/fastParity_getFullRecord", fastParity_getFullRecordData); // secured
router.get("/fastParity_getTimer", fastParity_getTimer);
router.get(
  "/fastParity_getBidHistory/:id/",
  checkAuth,
  fastParity_getHistoryData
); // secured
router.get(
  "/fastParity_getFullBidHistory/:id",
  checkAuth,
  fastParity_getFullHistoryData
); // secured
router.get("/fastParity_getPricing/:api", fastParity_getPricing);

router.get("/fastParity_getFullBidHistoryAdmin/:id/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var userId = req.params.id;
    FastBidHistory.find({ "bid.userId": parseInt(userId) })
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
        res.status(200).send(newBid ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

// **** Big Small *****

router.get("/bigsmall_getCurrentNumber/:api", bigsmall_getCurrentNumber);
router.get("/bigsmall_setAutoMode/:auto/:api", bigsmall_setAutoMode);
router.get("/bigsmall_setResult/:id/:api", bigsmall_setResult);
router.post("/bigsmall_bidData", bigsmall_bidData);
router.get("/bigsmall_getRecord", bigsmall_getRecordData); // secured
router.get("/bigsmall_getFullRecord", bigsmall_getFullRecordData); // secured
router.get("/bigsmall_getTimer", bigsmall_getTimer);
router.get(
  "/bigsmall_getBidHistory/:id/",
  checkAuth,
  bigsmall_getHistoryData
); // secured
router.get(
  "/bigsmall_getFullBidHistory/:id",
  checkAuth,
  bigsmall_getFullHistoryData
); // secured
router.get("/bigsmall_getPricing/:api", bigsmall_getPricing);

router.get("/bigsmall_getFullBidHistoryAdmin/:id/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var userId = req.params.id;
    BigBidHistory.find({ "bid.userId": parseInt(userId) })
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
        res.status(200).send(newBid ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/minute1_getFullBidHistoryAdmin/:id/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var userId = req.params.id;
    BidHistory1.find({ "bid.userId": parseInt(userId) })
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
        res.status(200).send(newBid ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/minute3_getFullBidHistoryAdmin/:id/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var userId = req.params.id;
    BidHistory3.find({ "bid.userId": parseInt(userId) })
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
        res.status(200).send(newBid ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});

router.get("/minute5_getFullBidHistoryAdmin/:id/:api", async (req, res) => {
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var userId = req.params.id;
    BidHistory5.find({ "bid.userId": parseInt(userId) })
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
        res.status(200).send(newBid ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.status(401).send({ msg: "Auth Failed" });
  }
});
//bonus and offfer


router.get("/claimContriBonus/:id", checkAuth, claimContriBonus);
router.get("/claimPeriodStreakBonus/:id/:game", checkAuth, claimPeriodWonBonus);
router.get("/claimPeriodStreakBonus/:id/:game/:tier", checkAuth, claimPeriodWonBonus);
router.get("/getWinStreakData/:id/:game", checkAuth, getWinStreakData);


//Agent
router.post("/agentLogin", agentLogin);
router.post("/updateUPIAgent/:api", updateUPIAgent);
router.post("/agentUpdateMode/:api", agentActive);
router.get(
  "/toddRecharge/getPendingTransactionsAgent/:id/:api",
  agent_toddRechargegetPendingTransaction
);
router.post(
  "/toddRecharge/updatePendingTransactionAgent/:agentId/:api/:id/:status",
  agent_toddRechargeupdatePendingTransaction
);
router.get(
  "/toddRecharge/getApproveTransactionsAgent/:id/:api",
  agent_toddRechargegetApproveTransaction
);

//cricket

router.get(
  "/cricket_getbidHistory/:matchId/:id",
  checkAuth,
  cricket_getbidHistory
);
router.get(
  "/cricket_getCurrentbidHistory/:matchId/:id",
  checkAuth,
  cricket_getCurrentBidHistory
);

//router.get("/getCricketBetsAdmin");
// router.get("/admPay", admPay);

// router.get("/testC", async(req,res) =  > {

// var connection = mysql.createConnection({
//   host     : '103.211.218.202',
//   user     : 'toddalad_test',
//   password : 'O;B+YXOJABgz',
//   database : 'toddalad_trash'
// });

// connection.connect();
// res.send('pk');
// });

// router.get("/cbp", async (req, res) => {
//   const projField = `bid.2641`;
//   const getBid = await CricketBid.findOne({ matchId: 33433284 });
//   const keys = Object.keys(getBid.bid);
//   var newBid = {};
//   const Loser = "Seattle Orcas";
//   const winner = "Texas Super Kings";
//   const winnerTeam = "teamA";
//   var winnningMatchAmount=0;
//   var winningBookmaker=0;
//   var amount = 0;
//   var amountBook = 0;
//   keys.forEach(async (element) => {

//       var _bid = [];
//       var winningAmount = 0;
//       var winningBook = 0;

//       var exp = 0;
//       if(getBid.bid[`${element}`].exp){
//         var matchExp = 0
//         var bookExp = 0
//         if(getBid.bid[`${element}`].exp.match){

//           matchExp = getBid.bid[`${element}`].exp.match;
//           if( matchExp< 0){
//             amount += Math.abs(matchExp);
//           }
//         }
//         if(getBid.bid[`${element}`].exp.book){
//           bookExp = getBid.bid[`${element}`].exp.book;
//           if( bookExp< 0){
//             amountBook += Math.abs(bookExp);
//           }
//         }
//         exp = Math.abs(matchExp)+Math.abs(bookExp);
//       }
//       if (getBid.bid[`${element}`].final) {
//         //new
//           // if(getBid.bid[`${element}`].final.teamAAmount < 0 && getBid.bid[`${element}`].final.teamBAmount <0){
//           //   console.log(element)
//           // }
//           if (getBid.bid[`${element}`].final.teamAAmount > 0) {
//             if (getBid.bid[`${element}`].final.teamBAmount >= 0) {
//               winningAmount = getBid.bid[`${element}`].final.teamAAmount;
//             } else {
//               winningAmount =
//                 getBid.bid[`${element}`].final.teamAAmount +
//                 Math.abs(
//                   (winningAmount = getBid.bid[`${element}`].final.teamBAmount)
//                 );
//             }
//           }




//       }
//       if (getBid.bid[`${element}`].finalBook) {
//         console.log(element);
//         if (getBid.bid[`${element}`].finalBook.teamBAmount > 0) {
//           if (getBid.bid[`${element}`].finalBook.teamAAmount >= 0) {
//             winningBook = getBid.bid[`${element}`].finalBook.teamBAmount;
//           } else {
//             winningBook =
//               getBid.bid[`${element}`].finalBook.teamBAmount +
//               Math.abs(
//                 (winningBook = getBid.bid[`${element}`].finalBook.teamAAmount)
//               );
//           }
//         } 
//       }
//       if(getBid.bid[`${element}`].history){
//       getBid.bid[`${element}`].history.forEach((bid) => {
//          if(bid.bid.includes('YES') || bid.bid.includes('NO')){
//           console.log(`completed match ${bid.userId}`);
//         }
//         if (bid.bid === `Back ${winner}` || bid.bid === `Lay ${Loser}`) {
//           if (bid.type === "match") {
//             _bid.push({ ...bid, states: "Success", winning: winningAmount });
//           } else {
//             _bid.push({ ...bid, states: "Success", winning: winningBook });
//           }
//         } else {
//           _bid.push({ ...bid, states: "Fail" });
//         }
//         newBid[`${element}`] = _bid;
//       });
//       }
//       const userWinField = `bid.${element}.winning`;
//       const userField = `bid.${element}.history`;
//       // console.log(`${element} - ${winningAmount}`);
//       winnningMatchAmount += winningAmount;
//       winningBookmaker += winningBook
//       await CricketBid.updateOne(
//         { matchId: 33433284 },
//         {
//           [userField]: _bid,
//           [userWinField]: (winningAmount + winningBook),
//           $inc: { "calc.matchWin": winningAmount, 'calc.bookWinning': winningBook },
//         }
//       );

//       if (winningAmount + winningBook) {
//         await User.updateOne(
//           { id: element },
//           {
//             $inc: { balance: (winningAmount + winningBook),exp: exp},
//             $push: {
//               walletHistory: {
//                 amount: (winningAmount + winningBook),
//                 date: Date.now(),
//                 credit: true,
//                 note: `Cricket Winning: ${33433284}`,
//               },
//             },
//           }
//         );
//       }else{
//         await User.updateOne(
//           { id: element },
//           {
//             $inc: { exp: exp},
//           }
//         );
//       }

//   });
//   // await CricketBid.updateOne(
//   //   { matchId: 33214375 },
//   //   {
//   //     //[userField]: _bid,
//   //     //[userWinField]: (winningAmount + winningBook),
//   //     "calc.book": amountBook,"calc.match": amount, "calc.matchWin": winnningMatchAmount, 'calc.bookWinning': winningBookmaker 
//   //   }
//   // );
//   console.log(winnningMatchAmount);
//   console.log(winningBookmaker);
//    console.log(amount);
//    console.log(amountBook);
//   res.status(200).send(newBid);
// });
// router.get("/cbpB", async (req, res) => {
//   const projField = `bid.9008`;
//   const getBid = await CricketBid.findOne({ matchId: 33429408 });
//   const keys = Object.keys(getBid.bid);
//   var newBid = {};
//   const Loser = "Los Angeles Knight Riders"
//   const winner = "MI New York";
//   const winnerTeam = "teamB";
//   var winnningMatchAmount=0;
//   var winningBookmaker=0;
//   var amount = 0;
//   var amountbook = 0;
//   keys.forEach(async (element) => {

//       var _bid = [];
//       var winningAmount = 0;
//       var winningBook = 0;

//       var exp = 0;
//       if(getBid.bid[`${element}`].exp){
//         var matchExp = 0
//         var bookExp = 0
//         if(getBid.bid[`${element}`].exp.match){
//           matchExp = getBid.bid[`${element}`].exp.match;
//           if( matchExp< 0){
//             amount += Math.abs(matchExp);
//           }
//         }
//         if(getBid.bid[`${element}`].exp.book){
//           bookExp = getBid.bid[`${element}`].exp.book;
//           if( bookExp< 0){
//             amountbook += Math.abs(bookExp);
//           }
//         }
//         exp = Math.abs(matchExp)+Math.abs(bookExp);
//       }

//       if (getBid.bid[`${element}`].final) {

//         if (getBid.bid[`${element}`].final.teamBAmount > 0) {
//           if (getBid.bid[`${element}`].final.teamAAmount >= 0) {
//             winningAmount = getBid.bid[`${element}`].final.teamBAmount;
//           } else {
//             winningAmount =
//               getBid.bid[`${element}`].final.teamBAmount +
//               Math.abs(
//                 (winningAmount = getBid.bid[`${element}`].final.teamAAmount)
//               );
//           }
//         } 

//         // if(getBid.bid[`${element}`].final.teamBAmount < 0 && getBid.bid[`${element}`].final.teamAAmount < 0)



//       }

//       if (getBid.bid[`${element}`].finalBook) {
//         console.log(`${element}`);
//         if (getBid.bid[`${element}`].finalBook.teamAAmount > 0) {
//           if (getBid.bid[`${element}`].finalBook.teamBAmount >= 0) {
//             winningBook = getBid.bid[`${element}`].finalBook.teamAAmount;
//           } else {
//             winningBook =
//               getBid.bid[`${element}`].finalBook.teamAAmount +
//               Math.abs(
//                 (winningBook = getBid.bid[`${element}`].finalBook.teamBAmount)
//               );
//           }
//         } 


//       }
//       if(getBid.bid[`${element}`].history){

//       getBid.bid[`${element}`].history.forEach((bid) => {
//         if(bid.bid.includes('YES') || bid.bid.includes('NO')){
//           console.log(`completed match ${bid.userId}`);
//         }
//         if (bid.bid === `Back ${winner}` || bid.bid === `Lay ${Loser}`) {
//           if (bid.type === "match") {
//             _bid.push({ ...bid, states: "Success", winning: winningAmount });
//           } else {
//             _bid.push({ ...bid, states: "Success", winning: winningBook });
//           }
//         } else {
//           _bid.push({ ...bid, states: "Fail" });
//         }
//         newBid[`${element}`] = _bid;
//       });
//       }
//       const userWinField = `bid.${element}.winning`
//       const userField = `bid.${element}.history`;
//       winnningMatchAmount += winningAmount;
//       winningBookmaker += winningBook
//       await CricketBid.updateOne(
//         { matchId: 33429408 },
//         {
//           [userField]: _bid,
//           [userWinField]: (winningAmount + winningBook),
//           $inc: { "calc.matchWin": winningAmount, 'calc.bookWinning': winningBook },
//         }
//       );
//       if (winningAmount + winningBook) {
//         await User.updateOne(
//           { id: element },
//           {
//             $inc: { balance: (winningAmount + winningBook), exp: exp},
//             $push: {
//               walletHistory: {
//                 amount: (winningAmount+winningBook),
//                 date: Date.now(),
//                 credit: true,
//                 note: `Cricket Winning: ${33429408}`,
//               },
//             },
//           }
//         );
//       }else{
//         await User.updateOne(
//           { id: element },
//           {
//             $inc: { exp: exp},

//           }
//         );
//       }

//   });
//   // await CricketBid.updateOne(
//   //   { matchId: 33208913 },
//   //   {
//   //     //[userField]: _bid,
//   //     //[userWinField]: (winningAmount + winningBook),
//   //     "calc.book": amountbook,"calc.match": amount, "calc.matchWin": winnningMatchAmount, 'calc.bookWinning': winningBookmaker 
//   //   }
//   // );
//   console.log(winnningMatchAmount);
//   console.log(winningBookmaker);

//   console.log(amount);
//   console.log(amountbook);


//   res.status(200).send(newBid);
// });
// router.get("/cbpT", async (req, res) => {
//   const projField = `bid.2641`;
//   const getBid = await CricketBid.findOne({ matchId: 33321208 });
//   const keys = Object.keys(getBid.bid);
//   var newBid = {};
//   const Loser = "Delhi Capitals";
//   const winner = "Royal Challengers Bengaluru";
//   var returnAmount = 0;
//   var amount = 0;
//   var amountBook = 0;
//   keys.forEach(async (element) => {

//       var _bid = [];


//       var exp = 0;
//       if(getBid.bid[`${element}`].exp){
//         var matchExp = 0
//         var bookExp = 0
//         if(getBid.bid[`${element}`].exp.match){

//           matchExp = getBid.bid[`${element}`].exp.match;
//           if( matchExp< 0){
//             exp += Math.abs(matchExp)
//             amount += Math.abs(matchExp);
//           }
//         }
//         if(getBid.bid[`${element}`].exp.book){
//           bookExp = getBid.bid[`${element}`].exp.book;
//           if( bookExp< 0){
//             exp += Math.abs(bookExp)
//             amountBook += Math.abs(bookExp);
//           }
//         }

//       }

//       returnAmount +=exp;

//       if(getBid.bid[`${element}`].history){
//       getBid.bid[`${element}`].history.forEach((bid) => {

//         if (bid.bid === `Back ${winner}` || bid.bid === `Lay ${Loser}`) {
//           if (bid.type === "match") {
//             _bid.push({ ...bid, states: "Fail", winning: 0 });
//           } else {
//             _bid.push({ ...bid, states: "Fail", winning: 0 });
//           }
//         } else {
//           _bid.push({ ...bid, states: "Fail" });
//         }
//         newBid[`${element}`] = _bid;
//       });
//       }
//       const userWinField = `bid.${element}.winning`;
//       const userField = `bid.${element}.history`;


//       await CricketBid.updateOne(
//         { matchId: 33321208 },
//         {
//           [userField]: _bid,
//           [userWinField]: 0,
//           'calc.tied': true,

//         }
//       );

//       await User.updateOne(
//             { id: element },
//             {

//               $inc: {exp: exp},
//             }
//           );



//   });

//    console.log(amount);
//    console.log(amountBook);
//    console.log(returnAmount);
//   res.status(200).send(newBid);
// });

// router.get("/cbaband", async (req, res) => {
//   const projField = `bid.2641`;
//   const getBid = await CricketBid.findOne({ matchId: 33407026 });
//   const keys = Object.keys(getBid.bid);
//   var newBid = {};
//   const Loser = "Delhi Capitals";
//   const winner = "Royal Challengers Bengaluru";
//   const winnerTeam = "teamA";
//   var winnningMatchAmount=0;
//   var returnAmount = 0;
//   var winningBookmaker=0;
//   var amount = 0;
//   var amountBook = 0;
//   keys.forEach(async (element) => {

//       var _bid = [];
//       var winningAmount = 0;
//       var winningBook = 0;

//       var exp = 0;
//       if(getBid.bid[`${element}`].exp){
//         var matchExp = 0
//         var bookExp = 0
//         if(getBid.bid[`${element}`].exp.match){

//           matchExp = getBid.bid[`${element}`].exp.match;
//           if( matchExp< 0){
//             exp += Math.abs(matchExp)
//             amount += Math.abs(matchExp);
//           }
//         }
//         if(getBid.bid[`${element}`].exp.book){
//           bookExp = getBid.bid[`${element}`].exp.book;
//           if( bookExp< 0){
//             exp += Math.abs(bookExp)
//             amountBook += Math.abs(bookExp);
//           }
//         }

//       }

//       returnAmount +=exp;
//       if (getBid.bid[`${element}`].finalBook) {

//         if (getBid.bid[`${element}`].finalBook.teamBAmount > 0) {
//           if (getBid.bid[`${element}`].finalBook.teamAAmount >= 0) {
//             winningBook = getBid.bid[`${element}`].finalBook.teamBAmount;
//           } else {
//             winningBook =
//               getBid.bid[`${element}`].finalBook.teamBAmount +
//               Math.abs(
//                 (winningBook = getBid.bid[`${element}`].finalBook.teamAAmount)
//               );
//           }
//         } 
//       }
//       if(getBid.bid[`${element}`].history){
//       getBid.bid[`${element}`].history.forEach((bid) => {
//          if(bid.bid.includes('YES') || bid.bid.includes('NO')){
//           console.log(bid.userId);
//         }
//         if (bid.bid === `Back ${winner}` || bid.bid === `Lay ${Loser}`) {
//           if (bid.type === "match") {
//             _bid.push({ ...bid, states: "Cancel", winning: winningAmount });
//           } else {
//             _bid.push({ ...bid, states: "Cancel", winning: winningBook });
//           }
//         } else {
//           _bid.push({ ...bid, states: "Cancel" });
//         }
//         newBid[`${element}`] = _bid;
//       });
//       }
//       const userWinField = `bid.${element}.winning`;
//       const userField = `bid.${element}.history`;
//       // console.log(`${element} - ${winningAmount}`);
//       winnningMatchAmount += winningAmount;
//       winningBookmaker += winningBook
//       await CricketBid.updateOne(
//         { matchId: 33407026 },
//         {
//           [userField]: _bid,
//           [userWinField]: 0,
//           'calc.cancelled': true,
//           //$inc: { "calc.matchWin": winningAmount, 'calc.bookWinning': winningBook },
//         }
//       );

//       await User.updateOne(
//             { id: element },
//             {

//               $inc: {balance: exp, exp: exp},
//             }
//           );



//   });

//   console.log(winnningMatchAmount);
//   console.log(winningBookmaker);
//    console.log(amount);
//    console.log(amountBook);
//    console.log(returnAmount);
//   res.status(200).send(newBid);
// });

// router.get("/prevFancy", async (req, res) => {
//   const getBid = await CricketBid.findOne({ matchId: 33160617 });
//   const keys = Object.keys(getBid.bid);
//   var newBid = {};
//   const Loser = "Kolkata Knight Riders";
//   const winner = "Chennai Super Kings";
//   const winnerTeam = "teamA";
//   var winnningMatchAmount=0;
//   var winningBookmaker=0;
//   var amount = 0;
//   var amountt = 0;

//   keys.forEach(async (element) => {
//     var _bid = [];
//   //  if(getBid['bid'][`${element}`].fancyHistory){
//   //   getBid['bid'][`${element}`].fancyHistory.forEach(ele => {
//   //     amount ++;
//   //     if( ele.date < 1712671980000){
//   //       amountt ++;
//   //      _bid.push(ele);
//   //     }
//   //   });
//   //   newBid[`${element}`] = _bid;
//   //  }
//    if(getBid['bid'][`${element}`].fancyHistory){
//     var index = -1;
//     getBid['bid'][`${element}`].fancyHistory.forEach(async ele => {
//      index++

//       amount ++;
//       if( ele.date < 1712671980000){
//         const _field = `bid.${ele.userId}.fancyHistory.${index}.states`;
//         const _field1 = `bid.${ele.userId}.fancyHistory.${index}.winning`;

//         if(ele.states === 'Success'){
//           _bid.push(ele);
//             await CricketBid.updateOne({matchId: 33160617},{[`${_field}`] : 'Refunded',[`${_field1}`] : 0});

//           if(ele.bid.includes('Back')){
//   await User.updateOne({id: ele.userId},{$inc: {balance: -ele.winning}, $push: {
//                         walletHistory: {
//                           amount: ele.winning,
//                           date: Date.now(),
//                           credit: false,
//                           note: `Cricket Fancy Recovery: ${33160617}`,
//                         },},})
//           }else{
//               await User.updateOne({id: ele.userId},{$inc: {balance: -ele.originalAmount}, $push: {
//                         walletHistory: {
//                           amount: ele.originalAmount,
//                           date: Date.now(),
//                           credit: false,
//                           note: `Cricket Fancy Recovery: ${33160617}`,
//                         },},})
//           }

//         }else{

//         }
//       }
//     });
//     newBid[`${element}`] = _bid;

//   res.status(200).send(newBid);
// });


// router.get('/getTotalRechagre', async(req, res) => {
//   const id = req.params.id;
//   const user = await Trans.find({date: {$gt: 1722537000000},});
//   var amount = 0;
//   var upi = 0;
//   var manual = 0;
//   var count = 0;
//   console.log(user.length);
//   user.forEach(element => {

//     if(element.status === 'success'){
//       count++;
//       if(element.gateway === "IMB"){
//        amount+=element.amount;
//       }
//       if(element.gateway === "UPI" && element.id !== 'manual'){
//         upi+=element.amount;
//        }
//       if(element.id === 'manual'){
//         manual+=element.amount;
//       }
//     }


//   });


//   res.send({amount,manual,count,upi,total: (upi+amount+manual)});
// })
// router.get('/checkStatus', async(req, res) => {


//   res.send({});
// })

// router.get("/calcUsers", async(req,res) => {
//   const users = await User.find({'walletHistory.date': {$gt: 1722537000000},});
//   const recharge = await Trans.find({gateway: 'UPI','date': {$gt: 1722450600000},status: 'success'},{userId: 1,number: 1});
//   var reUsers = [];
//   var rechargeUsers = [];
//   console.log(recharge.length)
//   var dublicate;
//   var transId = [];
// //   let check_duplicate_in_array = (input_array) => {
// //     let duplicate_elements = []
// //     for (num in input_array) {
// //         for (num2 in input_array) {
// //             if (num === num2) {
// //                 continue;
// //             }
// //             else {
// //                 if (input_array[num] === input_array[num2]) {
// //                     duplicate_elements.push(input_array[num]);
// //                 }
// //             }
// //         }
// //     }
// //     return [...new Set(duplicate_elements)];
// // }

//   recharge.forEach(element => {

//      rechargeUsers.push(element.userId);
//      transId.push(element.number);
//   });
//   users.forEach(element => {
//     var count = 0;
//     if(rechargeUsers.includes(element.id)){

//         element.walletHistory.forEach(his => {
//           transId.forEach(ele => {
//             if(his.note.includes(ele)){
//               count++
//             }
//           });


//         });
//         reUsers.push({id: element.id, count});
//     }

//   });



//   res.status(200).send({rechargeUsers,reUsers});
// })
// router.get("/calcRech", async(req,res) => {
//   const users = await User.find({'walletHistory.date': {$gt: 1722537000000},});
//   //const recharge = await Trans.find({gateway: 'UPI','date': {$gt: 1722537000000},status: 'success'},{userId: 1,number: 1});
//   var recahrgeList = [];
//   var nume = [2,3,5,2];
//   var newNume = [];
//   users.forEach(element => {
//     element.walletHistory.forEach(ele => {
//       if(ele.date > 1722537000000){
//       if(ele.note.includes('Add money')){

//         recahrgeList.push(ele)
//         var numfind = ele.note.split(": ")[1];
//         nume.push(parseInt(numfind));
//             }}
//     });

//   });
//    var amount = 0;
//    recahrgeList.forEach(element => {
//     amount+=element.amount;

//    });

//    for (var ele of nume) {
//     var transs = await Trans.findOne({number: ele},{status: 1});
//     if(transs){
//       if(transs.status === 'success'){
//         newNume.push({id: ele,status: 'success'})
//       }else{
//         newNume.push({id: ele,status: 'fail'})
//       }
//     }


//    }
//    const check_duplicate_in_array=(input_array)=>{
//     const duplicates =input_array.filter((item, index) =>input_array.indexOf(item) !== index);
//     return Array.from(new Set(duplicates));
// }

// var dup = check_duplicate_in_array(nume);

//   res.status(200).send({amount,recahrgeList,length: recahrgeList.length,dup,newNume});
// })
// router.get("/test", async (req,res) =>{
//   const start = 1715731200000;
//   const end = 1715817600000;
//   var amount = 0;
//   var oamount = 0;
//   const getTrans = await Trans.find({status: 'success',date: {$gt: start, $lt: end}, key: {$exists: true}});
//   getTrans.forEach(element => {
//     if(element.key.key === "2ade2a01-1954-45f9-ab67-5d757a875f7d"){
//       amount += element.amount
//     }else{
//       oamount += element.amount;
//     }
//   });
//   console.log(amount);
//   console.log(oamount);
//   res.status(200).send('done')
// })

// router.get("/withWallet", async(req,res) => {
//   const user = await User.find({demo: {$exists: false}},{_id: 1,id: 1});

//   const arrayList = [];
//   for (var ele of user) {
//     console.log(ele.id);
//     arrayList.push({
//       updateOne: {
//         filter: { _id: ele._id },
//         update: { level0contribution: 0,level1contribution: 0,level2contribution: 0},
//       },
//     });

//   }
//   await User.bulkWrite(arrayList,{ ordered : false });
//   console.log(user.length);
//   res.status(200).send('done')
// })


// router.get("/lastTrans", async(req,res) => {

//   const date = new Date();
//   const localDate = (date / 1000 + 19800) * 1000;
//   const newDatefor = new Date(localDate);
//   const day = newDatefor.getDate();
//   const month = newDatefor.getMonth() + 1;
//   const year = newDatefor.getFullYear();

//   var daySorted;
//   var monthSorted;
//   if (day < 10) {
//     daySorted = `0${day}`;
//   } else {
//     daySorted = `${day}`;
//   }
//   if (month < 10) {
//     monthSorted = `0${month}`;
//   } else {
//     monthSorted = `${month}`;
//   }
//   const newDate = `${daySorted}-${monthSorted}-${year}`;
//   const getId = await Trans.find({
//     date: {$gt: 1715884200000},
//     'key.id': {$ne: '8120441687'},
//     gateway: 'UPI',

//     status: 'expired'

//   });
//   console.log(getId.length);
//   var success = 0;
//   var samount = 0;

//   for (var element of getId) {
//      var clientId = element.id;
//      var userId = element.userId;
//         const getTransaction = await axios.post(
//     "https://merchant.upigateway.com/api/check_order_status",
//     {
//       key: "2ade2a01-1954-45f9-ab67-5d757a875f7d",
//       client_txn_id: clientId,
//       txn_date: newDate,
//     }
//   );
//   if (getTransaction.data.status === true) {
//     if (getTransaction.data.data.status === "success") {
//       console.log(userId);
//       var amount = getTransaction.data.data.amount;
//       success ++;
//       samount += amount
//       const user = await User.findOne({ id: userId });
//       if(!user.firstRecharge){
//         console.log(`not recharged ${userId}`);

//       }
//       //const tempTran = await Trans.findOne({ id: clientId, status: "success" });
//       // if (!tempTran) {
//       //   await Trans.updateOne(
//       //     { id: clientId },
//       //     { date: Date.now(), status: "success" }
//       //   );
//       //   //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
//       //   const user = await User.findOne({ id: userId });
//       //   var firstRecharge = 0;
//       //   await daily.updateOne(
//       //     { id: newDate },
//       //     { $inc: { count: +1, amount: amount } },
//       //     { upsert: true }
//       //   );
//       //   if (!user.firstRecharge) {
//       //     firstRecharge = amount;
//       //     await User.updateOne(
//       //       { id: user.upLine[0] },
//       //       {
//       //         $inc: { balance: +151 },
//       //         $push: {
//       //           walletHistory: {
//       //             amount: 151,
//       //             date: Date.now(),
//       //             credit: true,
//       //             note: `Referal Reward User: ${user.id}`,
//       //           },
//       //         },
//       //       }
//       //     );
//       //     // await offerBonus.updateOne(
//       //     //   { userId: user.upLine[0] },
//       //     //   {
//       //     //     userId: user.upLine[0],
//       //     //     $inc: { amount: +151 },
//       //     //     $push: {
//       //     //       history: {
//       //     //         credit: "wallet",
//       //     //         amount: 151,
//       //     //         note: `Referal Reward User: ${user.id}`,
//       //     //         date: Date.now(),
//       //     //       },
//       //     //     },
//       //     //   },
//       //     //   {upsert: true}
//       //     // );
//       //     if (amount > 4999) {
//       //       const bonus = (amount * 10) / 100;
//       //       amount = amount + bonus;
//       //     }
//       //     await User.updateOne(
//       //       { id: userId },
//       //       {
//       //         firstRecharge: true, $inc: { balance: +amount },
//       //         $push: {
//       //           rechargeHistory: {
//       //             amount: amount,
//       //             date: Date.now(),
//       //             status: "Success",
//       //           },
//       //           walletHistory: {
//       //             amount: amount,
//       //             date: Date.now(),
//       //             credit: true,
//       //             note: `Add money ID: ${element.number}`,
//       //           },
//       //         },
//       //       }
//       //     );
//       //   }else{

//       //     const bonus = (amount * 5) / 100;
//       //     amount = amount + 0;
//       //     await User.updateOne(
//       //       { id: userId },
//       //       {
//       //         firstRecharge: true, $inc: { balance: +amount },
//       //         $push: {
//       //           rechargeHistory: {
//       //             amount: amount,
//       //             date: Date.now(),
//       //             status: "Success",
//       //           },
//       //           walletHistory: {
//       //             amount: amount,
//       //             date: Date.now(),
//       //             credit: true,
//       //             note: `Add money ID: ${element.number}`,
//       //           },
//       //         },
//       //       }
//       //     );
//       //     // await User.updateOne(
//       //     //   { id: user.upLine[0] },
//       //     //   {
//       //     //     $inc: { balance: bonus },

//       //     //   }
//       //     // );
//       //     // await offerBonus.updateOne(
//       //     //   { userId: user.upLine[0] },
//       //     //   {
//       //     //     userId: user.upLine[0],
//       //     //     $inc: { amount: +bonus },
//       //     //     $push: {
//       //     //       history: {
//       //     //         credit: "wallet",
//       //     //         amount: bonus,
//       //     //         note: `Recharge bonus: ${user.id}`,
//       //     //         date: Date.now(),
//       //     //       },
//       //     //     },
//       //     //   },
//       //     //   {upsert: true}
//       //     // );
//       //   }

//       //   const userDate = new Date(user.date);
//       //   const userDateLocal = (userDate / 1000 + 19800) * 1000;
//       //   const newuserDate = new Date(userDateLocal);
//       //   const abhiDate = new Date();
//       //   const abhiDateLocal = (abhiDate / 1000 + 19800) * 1000;
//       //   const newabhirDate = new Date(abhiDateLocal);
//       //   const day = newabhirDate.getDate();
//       //   const month = newabhirDate.getMonth() + 1;
//       //   const year = newabhirDate.getFullYear();

//       //   const dayMonth = `${day}/${month}/${year}`;

//       //   const userday = newuserDate.getDate();
//       //   const usermonth = newuserDate.getMonth() + 1;
//       //   const useryear = newuserDate.getFullYear();

//       //   const userdayMonth = `${userday}/${usermonth}/${useryear}`;
//       //   const newphone0recharge = `newlevel0.${dayMonth}.${user.phone}.todayRecharge`;
//       //   const newphone1recharge = `newlevel1.${dayMonth}.${user.phone}.todayRecharge`;
//       //   const newphone2recharge = `newlevel2.${dayMonth}.${user.phone}.todayRecharge`;

//       //   const phone0recharge = `level0.${user.phone}.totalRecharge`;
//       //   const phone1recharge = `level1.${user.phone}.totalRecharge`;
//       //   const phone2recharge = `level2.${user.phone}.totalRecharge`;

//       //   const phone0first = `level0.${user.phone}.firstRecharge`;
//       //   const phone1first = `level1.${user.phone}.firstRecharge`;
//       //   const phone2first = `level2.${user.phone}.firstRecharge`;

//       //   if (dayMonth === userdayMonth) {
//       //     if (user.upLine !== null) {
//       //       if (user.upLine[0].length !== 0) {
//       //         await promotion.updateOne(
//       //           { userId: user.upLine[0] ?? 1 },
//       //           {
//       //             userId: user.upLine[0] ?? 1,
//       //             $inc: {
//       //               [newphone0recharge]: amount,
//       //             },
//       //           },
//       //           { upsert: true }
//       //         );
//       //       }
//       //       if (user.upLine.length === 2) {
//       //         if (user.upLine[1].length !== 0) {
//       //           await promotion.updateOne(
//       //             { userId: user.upLine[1] ?? 1 },
//       //             {
//       //               userId: user.upLine[1] ?? 1,
//       //               $inc: {
//       //                 [newphone1recharge]: amount,
//       //               },
//       //             },
//       //             { upsert: true }
//       //           );
//       //         }
//       //       }
//       //       if (user.upLine.length === 3) {
//       //         if (user.upLine[1].length !== 0) {
//       //           await promotion.updateOne(
//       //             { userId: user.upLine[1] ?? 1 },
//       //             {
//       //               userId: user.upLine[1] ?? 1,
//       //               $inc: {
//       //                 [newphone1recharge]: amount,
//       //               },
//       //             },
//       //             { upsert: true }
//       //           );
//       //         }

//       //         if (user.upLine[2].length !== 0) {
//       //           await promotion.updateOne(
//       //             { userId: user.upLine[2] ?? 1 },
//       //             {
//       //               userId: user.upLine[2] ?? 1,
//       //               $inc: {
//       //                 [newphone2recharge]: amount,
//       //               },
//       //             },
//       //             { upsert: true }
//       //           );
//       //         }
//       //       }
//       //     }
//       //   }

//       //   if (user.upLine !== null) {
//       //     if (user.upLine[0].length !== 0) {
//       //       await promotion.updateOne(
//       //         { userId: user.upLine[0] ?? 1 },
//       //         {
//       //           userId: user.upLine[0] ?? 1,
//       //           $inc: {
//       //             [phone0first]: firstRecharge,
//       //             [phone0recharge]: amount,
//       //           },
//       //         },
//       //         { upsert: true }
//       //       );
//       //     }
//       //     if (user.upLine.length === 2) {
//       //       if (user.upLine[1].length !== 0) {
//       //         await promotion.updateOne(
//       //           { userId: user.upLine[1] ?? 1 },
//       //           {
//       //             userId: user.upLine[1] ?? 1,
//       //             $inc: {
//       //               [phone1first]: firstRecharge,
//       //               [phone1recharge]: amount,
//       //             },
//       //           },
//       //           { upsert: true }
//       //         );
//       //       }
//       //     }
//       //     if (user.upLine.length === 3) {
//       //       if (user.upLine[1].length !== 0) {
//       //         await promotion.updateOne(
//       //           { userId: user.upLine[1] ?? 1 },
//       //           {
//       //             userId: user.upLine[1] ?? 1,
//       //             $inc: {
//       //               [phone1first]: firstRecharge,
//       //               [phone1recharge]: amount,
//       //             },
//       //           },
//       //           { upsert: true }
//       //         );
//       //       }

//       //       if (user.upLine[2].length !== 0) {
//       //         await promotion.updateOne(
//       //           { userId: user.upLine[2] ?? 1 },
//       //           {
//       //             userId: user.upLine[2] ?? 1,
//       //             $inc: {
//       //               [phone2first]: firstRecharge,
//       //               [phone2recharge]: amount,
//       //             },
//       //           },
//       //           { upsert: true }
//       //         );
//       //       }
//       //     }
//       //   }
//       //   //res.redirect("https://game.toddapples.com/rechargeHistory");
//       // } else {
//        //res.redirect("https://game.toddapples.com");
//       }
//     } else {

//     }

//     }
//     console.log(samount)
//     console.log(success)
//     res.status(200).send('done');


// })


router.get("/ipProtectedRoute", async (req, res) => {
  const clientIp = req.ip;
  const getIp = await extra.findOne({ id: 1 }, { ip: 1 });
  if (getIp.ip.includes(clientIp)) {
    res.status(200).send({ status: 200, message: `Your IP ${clientIp} is autherized` });


  } else {
    res.status(200).send({ status: 401, message: `Your IP ${clientIp} is not autherized` });
  }
});

router.get("/getManualRecharge", async (req, res) => {
  const getRech = await Trans.find({ createDate: { $gt: 1748716200000 }, id: "manual", status: "success" });
  var amount = 0;
  var users = [];
  getRech.forEach(async (element) => {
    amount += element.amount;
    users.push({ userId: element.userId, amount: element.amount });
  });
  res.status(200).send({ status: 200, amount, users });
});

// router.get('/test', async(req,res) => {
//   const getofferBonus = await offerBonus.find();
//   var count = 0
//   for(var element of getofferBonus){
//     count++

//     var totalReferral = 0;
//     var totalDailyTask = 0;
//     for(var history of element.history){
//       if(history.note.includes("Referal Reward User")){
//         totalReferral += history.amount;
//       }
//       if(history.note.includes("Daily Task Claim")){
//         totalDailyTask +=history.amount
//       }
//     }

//     await offerBonus.updateOne({userId: element.userId},{totalReferral,totalDailyTask});
//     console.log(count);
//   }
//   res.status(200).send('done')
// })
// router.get('/getAllUsersByRecharge',async(req,res) => {
//   const getUsers = await toddUsers.find({"rechargeHistory.4": {$exists: true}});
//   var users = [];
//   getUsers.forEach(async(element) => {
//     console.log(element.id);
//     var totalRecharge = 0;
//     var totalWithdraw = 0;
//     element.rechargeHistory.forEach(async(history) => {
//       if(history.type !== "Bonus"){
//         totalRecharge += parseFloat(history.amount);
//       }
//     });
//     element.walletHistory.forEach(async(history) => {
//       if(history.note.includes("Redeem Successful ID")){
//         totalWithdraw += parseFloat(history.amount);
//       }
//     });

//     users.push({phone: element.phone, name: element?.bank?.[0]?.name??'N/A', totalRecharge, totalWithdraw});
//   });

//   users.sort((a,b) => b.totalRecharge - a.totalRecharge);

//   // Generate CSV data
//   const csvFields = ['Phone', 'Name', 'Total Recharge', 'Total Withdraw'];
//   let csvData = csvFields.join(',') + '\n';

//   users.forEach(user => {
//     const row = [
//       user.phone,
//       `"${user.name.replace(/"/g, '""')}"`, // Escape quotes in name
//       user.totalRecharge,
//       user.totalWithdraw
//     ];
//     csvData += row.join(',') + '\n';
//   });

//   // Set headers for CSV download
//   res.setHeader('Content-Type', 'text/csv');
//   res.setHeader('Content-Disposition', 'attachment; filename=users_recharge_data.csv');

//   res.status(200).send(csvData);
// })

// router.get("/manualBidProcess", async(req,res) => {
//   const bidHistory = await BidHistory1.findOne({_id: "20250506717"});
//   var number = 2;
//   var color = "Red";
//   var winnersNumber = [];
//   var winnersColor = [];
//   var winnersWithViolet = [];
//   var winnersViolet = [];
//   var winnersBigSmall = [];
//   var newBidHistoryData = [];
//   var price = 0;
//   var newId = 20250506239;

//    bidHistory.bid.forEach((doc) => {
//       if (doc.select.includes(`${number}`)) {
//         winnersNumber.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//       }
//       if (doc.select.includes(`${color}`)) {
//         winnersColor.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//       }
//       if (color === "Red Violet") {
//         if (doc.select.includes("Red")) {
//           winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//         }
//         if (doc.select.includes("Violet")) {
//           winnersViolet.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//         }
//       }
//       if (color === "Green Violet") {
//         if (doc.select.includes("Green")) {
//           winnersWithViolet.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//         }
//         if (doc.select.includes("Violet")) {
//           winnersViolet.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//         }
//       }
//       if(number >= 5){
//          if(doc.select === 'Big' ){
//             winnersBigSmall.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//          }
//       }else{
//         if(doc.select === 'Small' ){
//             winnersBigSmall.push({ userId: doc.userId, price: doc.bidAmount || doc.amount });
//          }
//       }

//     });

//     winnersNumber.forEach(async (doc) => {
//       var commission = (doc.price * 2) / 100;
//       var newPrice = doc.price - commission;
//       var amount = newPrice * 9;
//       var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;

//       await User.updateOne(
//         { id: doc.userId },
//         { $inc: { balance: +fixedAmount } }
//       );
//       await playHistory.updateOne(
//         { userId: doc.userId },
//         {
//           userId: doc.userId,
//           $push: {
//             history: {
//               amount: fixedAmount,
//               game: "3minute",
//               credit: true,
//               date: Date.now(),
//               id: newId,
//               note: "win",
//             },
//           },
//         },
//         { upsert: true }
//       );

//     });

//     // winners color

//     winnersColor.forEach(async (doc) => {
//       var commission = (doc.price * 2) / 100;
//       var newPrice = doc.price - commission;
//       var amount = newPrice * 2;
//       var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
//       await User.updateOne(
//         { id: doc.userId },
//         { $inc: { balance: +fixedAmount } }
//       );
//       await playHistory.updateOne(
//         { userId: doc.userId },
//         {
//           $push: {
//             history: {
//               amount: fixedAmount,
//               game: "3minute",
//               credit: true,
//               date: Date.now(),
//               id: newId,
//               note: "win",
//             },
//           },
//         }
//       );

//     });

//     //winners BigSmall
//     winnersBigSmall.forEach(async (doc) => {
//         var commission = (doc.price * 7) / 100;
//         var newPrice = doc.price - commission;
//         var amount = newPrice * 2;
//         var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
//         await User.updateOne(
//           { id: doc.userId },
//           { $inc: { balance: +fixedAmount } }
//         );
//         await playHistory.updateOne(
//           { userId: doc.userId },
//           {
//             $push: {
//               history: {
//                 amount: fixedAmount,
//                 game: "3minute",
//                 credit: true,
//                 date: Date.now(),
//                 id: newId,
//                 note: "win",
//               },
//             },
//           }
//         );

//       });

//     // winners with Violet

//     winnersWithViolet.forEach(async (doc) => {
//       var commission = (doc.price * 2) / 100;
//       var newPrice = doc.price - commission;
//       var amount = newPrice * 1.5;
//       var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
//       await User.updateOne(
//         { id: doc.userId },
//         { $inc: { balance: +fixedAmount } }
//       );
//       await playHistory.updateOne(
//         { userId: doc.userId },
//         {
//           $push: {
//             history: {
//               amount: fixedAmount,
//               game: "3minute",
//               credit: true,
//               date: Date.now(),
//               id: newId,
//               note: "win",
//             },
//           },
//         }
//       );

//     });

//     //winner Violet

//     winnersViolet.forEach(async (doc) => {
//       var commission = (doc.price * 2) / 100;
//       var newPrice = doc.price - commission;
//       var amount = newPrice * 4.5;
//       var fixedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;
//       await User.updateOne(
//         { id: doc.userId },
//         { $inc: { balance: +fixedAmount } }
//       );
//       await playHistory.updateOne(
//         { userId: doc.userId },
//         {
//           $push: {
//             history: {
//               amount: fixedAmount,
//               game: "3minute",
//               credit: true,
//               date: Date.now(),
//               id: newId,
//               note: "win",
//             },
//           },
//         }
//       );

//     });

//     bidHistory.bid.forEach((doc) => {
//       var newAmount = doc.amount - (doc.amount * 2) / 100;
//       var status = "Fail";
//       var wonAmount = 0;
//       var fixedWonAmount = 0;

//       // game 0
//       if(number >= 5){
//         if(doc.select === 'Big' ){
//           status = "Success";
//           wonAmount = newAmount * 2;
//           fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//         }
//      }else{
//        if(doc.select === 'Small' ){
//         status = "Success";
//         wonAmount = newAmount * 2;
//         fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//         }
//      }

//       if (color === "Green Violet") {
//         if (doc.select.includes("Green")) {
//           status = "Success";
//           wonAmount = newAmount * 1.5;
//           fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//         }
//         if (doc.select.includes("Violet")) {
//           status = "Success";
//           wonAmount = newAmount * 4.5;
//           fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//         }
//       }

//       if (color === "Red Violet") {
//         if (doc.select.includes("Red")) {
//           status = "Success";
//           wonAmount = newAmount * 1.5;
//           fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//         }
//         if (doc.select.includes("Violet")) {
//           status = "Success";
//           wonAmount = newAmount * 4.5;
//           fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//         }
//       }

//       if (doc.select.includes(color)) {
//         status = "Success";
//         wonAmount = newAmount * 2;
//         fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//       }
//       if (doc.select.includes(number)) {
//         status = "Success";
//         wonAmount = newAmount * 9;
//         fixedWonAmount = Math.round((wonAmount + Number.EPSILON) * 100) / 100;
//       }
//       newBidHistoryData.push({
//         winning: fixedWonAmount,
//         result: `${number} ${color}`,
//         status: status,
//         select: doc.select,
//         date: doc.date,
//         amount: doc.amount,
//         period: doc.period,
//         userId: doc.userId,
//         openPrice: price,
//         game: 0,
//       });
//     });
//     console.log(newBidHistoryData);
//     if (newId) {
//       await BidHistory1.updateOne({ _id: newId }, { bid: newBidHistoryData });
//       res.status(200).send({ success: true, message: "Bid process completed successfully" });
//     } else {
//       res.status(404).send({ success: false, message: "Bid history not found" });
//     }
// });


export default router;
