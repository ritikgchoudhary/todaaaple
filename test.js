import express from 'express';
import {signin, signup, getUserData, getTimer, getRecordData, getHistoryData, getFullRecordData,getFullHistoryData, addBank,addUpi,addAddress,accountSecurity,resetPassword,upiCreateOrder, upiVerifyPayment} from '../controller/user.js';
import {bidData,applyBonus, getPricing, setResult, applyWithdrawal,getWithdrawal,getAllWithdrawal,processWithdrawal,getHighBalanceUsers, playerJankaari, updataUserBalance, getCurrentNumber, playerJankaarilevelData, getAllUserWithdrawal} from '../controller/bidData.js';
import checkAuth from '../middleware/secure.js';
import Razorpay from "razorpay";
import Dotenv from 'dotenv';
import axios from 'axios';
Dotenv.config({path: './config.env'});
import User from "../model/userSchema.js";
import Trans from '../model/transaction.js';
import otp from "../model/otp.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { claimEnvelop, createEnvelop, generateEnvelop, getUserEnvelop, redeemEnvelop, validateEnvelop } from '../controller/redEnvelop.js';
import Withdrawal from '../model/withdrawal.js';
import Red from '../model/red.js';
import { checkPhonePeStatus, phonepePG, phonepepgredirect, processphonepePG } from '../controller/gateways.js';

import Daily from '../model/daily.js';
import pack from 'locutus/php/misc/pack.js';





const router = express.Router();

router.get('/test', async(req,res) => {

  const ip = req.connection.remoteAddress;
  console.log(ip);
  res.send('done');
});

router.get('/fristRecharge', async(req,res) => {

  const getUsers = await User.find({firstRecharge: false,'rechargeHistory.0': {$exists: true} },{id: 1});
  // getUsers.forEach(async element => {
  //   await User.updateOne({id: element.id},{firstRecharge: true})
  // });
  console.log(getUsers.length)
  res.send('done');
});








// router.post("/paymentSuccess", async (req, res) => {
//     try {
        
//         const body = orderId + "|" + req.body.razorpayPaymentId;
//         var expectedSignature = crypto.createHmac("sha256", process.env.razorSecret).update(body.toString()).digest("hex");
//         console.log(orderId);
//         console.log(req.body.razorpayPaymentId);
//         console.log(expectedSignature);
//         console.log(req.body.razorpaySignature);
//         if(expectedSignature !== req.body.razorpaySignature)
//         return res.status(400).json({ msg: "Transaction not legit!" });

        
            

//         // THE PAYMENT IS LEGIT & VERIFIED
//         // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
//         var amount = req.body.amount;
//         if(!req.body.firstRecharge){
//             const date = new Date(`${req.body.userDate}`);
//             const oldDate = date.getMonth();
//             if(oldDate > 7){
//                 await User.updateOne({id: req.body.upLine},{$inc: {'balance': +135}});
//                 if(amount > 4999){
//                     const bonus = req.body.amount * 10/100;
//                     amount = req.body.amount + bonus;
//                 }
               

//             }
//         }
        
//         console.log('success');
//         await User.updateOne({id: req.body.userId}, {firstRecharge: true, $inc: {'balance': +amount}});
//         await User.updateOne({id: req.body.userId}, {$push: {'rechargeHistory': {amount: req.body.amount,date: Date.now(),status: 'Success'}}});
//         res.send("Success", 200);
//     } catch (error) {
//         console.log(error);
//         res.status(500).send(error);
//     }
// });



// router.post("/rojpgResponse", async (req, res) => {
//   const secret = "scr45JCcOzn4BIt2iOtSZlmoJvHY8V0S70y";
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
//           const getOffer = await Home.findOne();
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
//               const getPer = getOffer.getOffer;
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

//           res.redirect('https://win8x.truewin.club/rechargeHistory');
//         }else{
//           res.redirect('https://truewin.club');
//         }
//       } else {
//         res.redirect('https://truewin.club');

//       }
//     }
//   );
// });

// // {
// //   respData: 'RNBXuh5VC+uZnWnGsDB+lkwCcVkDTqXrlgL+XlVeuHnKwmbmxhJ02R/WUYRuqOXHhd2wOPoRGBI/CYLwfjKvQLM6gdEHhWUBN8aX/jNTtGELKR3X3hOchX5Juzz2Y3rNQU7MewY67ShQF/AlmtyoLxgGsZsY1lzBRPpkqDoNpVWBkRDA+pU8ubkHi0MouU5wLEI+KhuZcx9y1VIGnsIrop0V65pAeR0v1Z+xWVeQ+3m7N4LU019YL/C5nahEALnA+1zdkg53Yb6UnldLs6U53wg0sN2BzY0990HfP4iEwmoNBqzELiBizO0frvjv9pXL',
// //   checkSum: '8B83E2ED736CC6794E8BE928412C2C2FF9EA9AC2A60E73A9E499C51949F04FE8079781EF30BF4BF155960735FC6016B8E62A1F29E08546392DD084FCDA7FA484',
// //   mid: '100000000000001'
// // }

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
//     const responseURL = "http://localhost:4000/rojpgResponse";

//     const lastTrans = await Trans.findOne().sort({ number: -1 });
//     const newTrans = lastTrans.number + 1;
//     const newOderId = `ORD${newTrans}`;
//     await Trans.create({
//       id: newOderId,
//       gateway: 'RojPG',
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

// router.get("/paymentTrigger/:id", async (req, res) => {

//     if(req.params.id === "vcjhefcywe556ffd"){
//         var getTran = await Trans.find({ status: "created", });
//         console.log(getTran.length);
        
      
//         //const newDate = `20-10-2022`;
//         getTran.forEach(async (doc) => {
//         const date = new Date(doc.date);
//         const day = date.getDate();
//         const month = date.getMonth() + 1;
//         var daySorted;
//         var monthSorted;
//         if (day < 10) {
//           daySorted = `0${day}`;
//         } else {
//           daySorted = `${day}`;
//         }
//         if (month < 10) {
//           monthSorted = `0${month}`;
//         } else {
//           monthSorted = `${month}`;
//         }
//         const newDate = `${daySorted}-${monthSorted}-2023`;
//           const getTransaction = await axios.post(
//             "https://merchant.upigateway.com/api/check_order_status",
//             {
//               key: "be5b56cb-914c-4e1d-87c3-8e4494043f7c",
//               client_txn_id: doc.id,
//               txn_date: newDate,
//             }
//           );
//           if (getTransaction.data.status === true) {
//             if (getTransaction.data.data.status === "success") {
//               var amount = getTransaction.data.data.amount;
      
//               await Trans.updateOne(
//                 { id: doc.id },
//                 { date: Date.now(), status: "success", }
//               );
              
//               const user = await User.findOne({ id: doc.userId });
//               if (!user.firstRecharge) {
//                 await User.updateOne(
//                   { id: user.upLine[0] },
//                   {
//                     $inc: { balance: +150 },
                   
//                   }
//                 );
//                 if(amount > 4999){
//                 const bonus = (amount * 10) / 100;
//                 amount = amount + bonus;
//                 }
//               }
//               await User.updateOne(
//                 { id: doc.userId },
//                 {
//                   firstRecharge: true,
//                   $inc: { balance: +amount },
//                   $push: {
//                     rechargeHistory: {
//                       amount: amount,
//                       date: Date.now(),
//                       status: "Success",
//                     },
                    
//                   },
//                 }
//               );
//               console.log(`updated ${doc.number}`);
      
//               //res.redirect('https://win8x.truewin.club/rechargeHistory');
//             } else {
//                 var diff = 300;
//                 const lastTime = doc.date/1000;
//                 const currentTime = new Date();
//                 const currentEpoch = currentTime.getTime()/1000;
//                 diff = currentEpoch - lastTime;
//                 if(diff > 300){
//                     await Trans.updateOne(
//                         { id: doc.id },
//                         { status: "expired", expired: true }
//                       );
//                       console.log(`marked as expired ${doc.number}`);
    
//                 }else{
//                     console.log(`new transaction ${doc.number}`);
//                 }
              
//               //res.send('done', 200);
//             }
//           } else {
//             console.log(`not found ${doc.number}`);
//             //res.send('done', 200);
//           }
//         });
//         res.send("done", 200);
    
//     }else{
//         res.send("Auth Failed", 200);
    
        
    
//     }
    
      
//     });

// router.post('/payment/payumoney', payUMoneyPayment);

// router.post('/payment/worldLine', worldLineHash);
// router.post('/payment/worldLine/response', worldLineResponse);

// router.post('/payment/cashfree', cashFreePaymentGateway);
// router.post('/payment/return/:id', returnCashFreePayment);



// router.post('/payment/payumoney/response/:id', payUMoneyPaymentResponse);
// router.post('/payment/fail', async(req, res) => {
//         res.redirect('https://thegooe.com/preOrder');
//     });
    
//router.post('/payment/asanPay', asanPayHash);

// router.get('/sendMail/:api/:name/:email/:phone/:msg/:subject/:contact', async(req,res) => {
//     const api = req.params.api;
//     const name = req.params.name;
//     const email = req.params.email;
//     const phone = req.params.phone;
//     const msg = req.params.msg;
//     const subject = req.params.subject;
//     const isContact = req.params.contact;
//     if(api === "hfbesdgvfyjiithh35r"){

//         var transporter = nodemailer.createTransport({
//             service: "gmail",
            
//             auth: {
//               user: 'citi.umesh@gmail.com',
//               pass: 'emdbhfcezfzmdwwx'
//             }
//           });
//           if(isContact === 'true'){
//             var mailOptions = {
//                 from: email,
//                 to: 'support@rashmiexporthouse.com',
//                 subject: subject,
//                 text: `Name: ${name}\r\nEmail: ${email}\r\nMessage: ${msg}`,
//               };
              
//               transporter.sendMail(mailOptions, function(error, info){
                
//               });

//           }else{
//             var mailOptions = {
//                 from: email,
//                 to: 'support@rashmiexporthouse.com',
//                 subject: "Quotation Recieved",
//                 text: `Name: ${name}\r\nEmail: ${email}\r\nMobile Number: ${phone}\r\nMessage: ${msg}` ,
//               };
              
//               transporter.sendMail(mailOptions, function(error, info){
                
//               });

//           }
//           res.status(200).json({msg: 'Success'});
          
          


//     }else{
//         res.status(400).json({msg: 'Error'});
//     }
    
// });





// router.get("/getDailyData/:api", async (req, res) => {
//   const api = req.params.api;
//   if(!api || api === process.env.AdminAPI){
//     const date = new Date();
//   const localDate = (date / 1000 + 19800) * 1000;
//   const newDatefor = new Date(localDate);
//   const day = newDatefor.getDate();
//   const month = newDatefor.getMonth() + 1;
  
//       var daySorted;
//       var monthSorted;
//       if (day < 10) {
//         daySorted = `0${day}`;
//       } else {
//         daySorted = `${day}`;
//       }
//       if (month < 10) {
//         monthSorted = `0${month}`;
//       } else {
//         monthSorted = `${month}`;
//       }
//       const newDate = `${daySorted}-${monthSorted}-2023`;
//       console.log(newDate);
//   const daily = await Daily.findOne({ id: newDate });

//   res.send(daily, 200);

//   }else{
//     res.status(401).send({'msg': 'Auth Failed'});

//   }
  
// });

// router.get("/processSuspension/:id/:block/:api", async (req, res) => {
  
//   const block = req.params.block ;
//   const id = req.params.id;
//   const api = req.params.api;
//   if(!api || api === process.env.AdminAPI){
//     if(block === 'true'){
//       await User.updateOne({id},{block: true});
//     }else{
//       await User.updateOne({id},{block: false});
//     }
//     console.log('here1');

//   res.send('done', 200);

//   }else{
//     res.status(401).send({'msg': 'Auth Failed'});

//   }
  
// });

// router.get('/playerJankaarilevelData/:id/:btn/:api', playerJankaarilevelData);
// router.get('/getAllUserWithdrawal/:phone/:api', getAllUserWithdrawal);






export default router;