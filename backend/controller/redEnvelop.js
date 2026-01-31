import ErrorResponse from "../utils/error.js";
import User from "../model/userSchema.js";
import Red from "../model/red.js";
import otp from "../model/otp.js"
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export const createEnvelop = async (req, res, next) => {

  try {

    const token = req.body.auth.split(" ")[1];
    const decoded = jwt.verify(token, "hjbfhv12hbb3hb434343");

    const code = parseInt(req.body.code);
  const type = req.body.type;
  const amount = parseInt(req.body.amount);
  const qty = req.body.qty;
  const id = req.body.userId;

  const getUser = await User.findOne({ id });
  if (getUser.demo) return next(new ErrorResponse("Not allowed for demo users", 400));
  if (getUser.block) return next(new ErrorResponse("Account Suspended", 400));

  if (amount < 1) return next(new ErrorResponse("Minimum amount ₹1", 400));
  if (qty < 1) return next(new ErrorResponse("Minimum Count 1", 400));
  if (qty > 1000) return next(new ErrorResponse("Max Count 1000", 400));
  if (amount > getUser.balance)
    return next(new ErrorResponse("Insufficient funds", 400));
  if (!code)
  return next(new ErrorResponse("Please enter code", 400));  
  const getOTP = await otp.findOne({ id: getUser.phone }).sort({ date: -1 });
  if (!getOTP) return next(new ErrorResponse("Invalid OTP", 400));
  var diff = 1900;
  const lastTime = getOTP.date.getTime() / 1000;
  const currentTime = new Date();
  const currentEpoch = currentTime.getTime() / 1000;
  diff = currentEpoch - lastTime;
  if (diff > 1800) return next(new ErrorResponse("OTP Expired", 400));

  if (getOTP.code !== code) return next(new ErrorResponse("Invalid OTP", 400));

  const lastEnvelop = await Red.findOne().sort({ number: -1 });
  const newNumber = lastEnvelop?.number??0 + 1;
  const uniqueId = uuidv4();

  if(type === 'Lucky Draw'){
    var luckyDraw;
    function divvy(number, parts, min) {

        var randombit = number - min * parts;
        var out = [];
        
        for (var i=0; i < parts; i++) {
          out.push(Math.random());
        }
        
        var mult = randombit / out.reduce(function (a,b) {return a+b;});
        
        return out.map(function (el) { return el * mult + min; });
      }
       luckyDraw = divvy(amount, qty, 0)
      

    await Red.create({
        id: uniqueId,
        number: newNumber,
        amount,
        type,
        qty,
        userId: id,
        date: Date.now(),
        expired: false,
        luckyDraw
      });
    
  }else{
    await Red.create({
        id: uniqueId,
        number: newNumber,
        amount,
        type,
        qty,
        userId: id,
        date: Date.now(),
        expired: false,
      });

  }

  await User.updateOne({ id }, { $inc: { balance: -amount },$push: {'walletHistory': {'amount': amount,'date':  Date.now(),'credit': false, 'note': `Red Envelope Created ID: ${newNumber}`}} });

    
  } catch (error) {

    console.log(error)
    
  }
  
  // const token = req.body.auth.split(" ")[1];
  // const decoded = jwt.verify(token, 'hjbfhv12hbb3hb434343');

  res.status(200).send("Done");
};

export const validateEnvelop = async (req, res) => {
  const id = req.params.id;
  const userId = parseInt(req.params.userId);
  const fetchEnvelop = await Red.findOne({ id, expired: false });
  var isFound = false;
  if (!fetchEnvelop) return res.status(200).send({ expired: true });

  if (fetchEnvelop) {
    
    if(fetchEnvelop.claimer.length < 1)
    return res.status(200).send({ expired: false });

    if(fetchEnvelop.qty <= fetchEnvelop.claimer.length)
    return res.status(200).send({ expired: true });

    for (const element of fetchEnvelop.claimer) {
      if(element.userId === userId){
        isFound = true;

      }
    }

    // fetchEnvelop.claimer.forEach(element => {
    //     if(element.userId === userId){
    //       isFound = true;

    //     }
    // });
    return res.status(200).send({ expired: isFound });
  }

  // res.send(data);
};
export const claimEnvelop = async (req, res) => {
  const id = req.params.id;
  const userId = parseInt(req.params.userId);
  const fetchEnvelop = await Red.findOne({ id, expired: false });
  if (!fetchEnvelop) return res.status(200).send('expired');

  if (fetchEnvelop) {
    
    

    if(fetchEnvelop.qty <= fetchEnvelop.claimer.length)
    return res.status(200).send('expired');

    for (const element of fetchEnvelop.claimer) {
      if(element.userId === userId){
        return res.status(200).send({ expired: true });

      }
    }
    
    // fetchEnvelop.claimer.forEach(element => {
    //     if(element.userId === userId){
    //       isFound = true;
            

    //     }
    // });
    if(fetchEnvelop.type === 'Lucky Draw'){

        const amount = fetchEnvelop.luckyDraw[fetchEnvelop.claimer.length];
        const diff = fetchEnvelop.qty - fetchEnvelop.claimer.length;
        await User.updateOne({id: userId}, {$inc: {balance: +amount},$push: {'walletHistory': {'amount': amount,'date':  Date.now(),'credit': true, 'note': `Red Envelope Claim ID: ${fetchEnvelop.number}`}}});
        await Red.updateOne({id}, {$push: {claimer: {amount,userId,date: Date.now()}},expired: diff === 1 ? true : false});
        return res.status(200).send({amount});



    }else{

        const amount = fetchEnvelop.amount/fetchEnvelop.qty;
        const diff = fetchEnvelop.qty - fetchEnvelop.claimer.length;
        await User.updateOne({id: userId}, {$inc: {balance: +amount},$push: {'walletHistory': {'amount': amount,'date':  Date.now(),'credit': true, 'note': `Red Envelope Claim ID: ${fetchEnvelop.number}`}}});
        await Red.updateOne({id}, {$push: {claimer: {amount,userId,date: Date.now()}},expired: diff === 1 ? true : false});
        return res.status(200).send({amount});

    }

    
  }

  
};

export const getUserEnvelop = async(req, res) => {
    const userId = req.params.id;
    const getEnvelop = await Red.find({userId}).sort({number: -1});
    res.status(200).send(getEnvelop);
}

export const redeemEnvelop = async(req, res) => {
  

    const id = req.params.redId;
    const userId = req.params.id;
    var amount = 0;

    const getEnvelop = await Red.findOne({id,expired: false});
    
    if(getEnvelop){
        const claimer = getEnvelop.claimer.length;
        const envAmount = getEnvelop.amount;
        const qty = getEnvelop.qty;

        if(getEnvelop.type === 'Lucky Draw'){
            if(claimer === 0){
                amount = envAmount
            }
            for(var i = 0; i < claimer;i ++){
                amount += getEnvelop.luckyDraw[i];

            }

        }else{
            var eachAmount = envAmount / qty ;
            amount = envAmount - (eachAmount * claimer);
            
        }
        await User.updateOne({id: userId},{$inc: {balance: +amount},$push: {'walletHistory': {'amount': amount,'date':  Date.now(),'credit': true, 'note': `Red Envelope Redeemed ID: ${getEnvelop.number}`}}});
        await Red.updateOne({id},{expired: true});

    }
    res.status(200).send({amount});
    
  

}

export const generateEnvelop = async (req, res) => {
  const amount = req.params.amount;
  const api = req.params.api;
  if (!api || api === process.env.AdminAPI) {
    var id = Math.floor(100000000 + Math.random() * 900000000);

    const data = await Red.create({
      _id: id,
      amount: amount,
      date: Date.now(),
      expired: false,
    });
    res.send(data);
  } else {
    res.send("permission denied");
  }
};
