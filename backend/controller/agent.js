import Agent from "../model/agent.js";
import daily from "../model/daily.js";
import extra from "../model/extra.js";
import offerBonus from "../model/offerBonus.js";
import promotion from "../model/promotion.js";
import Trans from "../model/transaction.js";
import User from "../model/userSchema.js";

export const agentLogin = async(req,res) => {
const id = req.body.id;

const agent = await Agent.findOne({id});
if(agent){
    if(agent.expired){
        return res.status(200).send('fail');

    }else{
       await Agent.updateOne({id},{expired: true});
       return res.status(200).send('Success');
    }
}else{
    return res.status(200).send('fail');

}
}

export const updateUPIAgent = async(req, res) => {
    
    const upi1 = req.body.upi1;
    const upi2 = req.body.upi2;
    const upi3 = req.body.upi3;
    const upi4 = req.body.upi4;
    const id = req.body.id;
    
    if(req.params.api === process.env.ToddAgentRecharge){
      
        
  
        if(req.body.number === '1'){
            const field = `upi.v2.agent.${id}.upis`
            await extra.updateOne({id:1},{[field]: upi1});
    
          }
    
          if(req.body.number === '2'){
            const field = `upi.agent.${id}.arr2`
            await extra.updateOne({id:1},{[field]: upi2});}
    
          if(req.body.number === '3'){
            const field = `upi.agent.${id}.arr3`
            await extra.updateOne({id:1},{[field]: upi3});}
    
          if(req.body.number === '4'){
            const field = `upi.agent.${id}.arr4`
            await extra.updateOne({id:1},{[field]: upi4});}
    
       
  
    }
     
    res.status(200).send('done');
  
  }
  

  export const agentActive = async(req,res) => {
    const mode = req.body.mode;
    const id = req.body.id;
    const api = req.params.api;

    if(api === process.env.ToddAgentRecharge){
        const field = `upi.v2.agent.${id}.active`;
        await extra.updateOne({id: 1},{[field]: mode});
    }
  }


  export const agent_toddRechargegetPendingTransaction = async (req, res) => {
    const api = req.params.api;
    const agent = req.params.id;
    if (api === process.env.ToddAgentRecharge) {
      const getTrans = await Trans.find({
        status: "created",
        gateway: "QR",
        agent
      }).sort({ date: -1 });
      res.status(200).send(getTrans);
    } else {
      res.status(200).send("done");
    }
  };

  export const agent_toddRechargeupdatePendingTransaction = async (req, res) => {
    const api = req.params.api;
    const status = req.params.status;
    const agentId = req.params.agentId;
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
    if (api === process.env.ToddAgentRecharge) {
      if (status === "approve") {
        const tempTran = await Trans.findOne({ _id: id, status: "success" });
        if (!tempTran) {
          const getTran = await Trans.findOne({ _id: id });
          var amount = getTran.amount;
          await Trans.updateOne(
            { _id: id },
            { status: "success",expired: true}
          );
          //await Trans.create({id: clientId, date: Date.now(), userId, amount: amount});
          const user = await User.findOne({ id: getTran.userId });
          var firstRecharge = 0;
          const fieldAgent = `agent.${agentId}.amount`;
          const fieldAgentCount = `agent.${agentId}.count`;
          await daily.updateOne(
            { id: newDate },
            { $inc: { count: +1, amount: amount,[fieldAgent]: amount,[fieldAgentCount]: +1} },
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
              {upsert: true}
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
          }else{
           
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
              {upsert: true}
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
        await Trans.updateOne({ _id: id }, { status: "expired" });
      }
      res.status(200).send("done");
    } else {
      res.status(200).send("done");
    }
  };

  export const agent_toddRechargegetApproveTransaction = async (req, res) => {
    const api = req.params.api;
    const agent = req.params.id;
    if (api === process.env.ToddAgentRecharge) {
      const getTrans = await Trans.find({
        status: "success",
        gateway: "QR",
        agent
      }).sort({ date: -1 });
      res.status(200).send(getTrans);
    } else {
      res.status(200).send("done");
    }
  };

  export const toddRechargegetDeniedTransaction = async (req, res) => {
    const api = req.params.api;
    
    if (api === process.env.ToddAgentRecharge) {
      const currentTime = new Date();
    const currentEpoch = currentTime.getTime() / 1000;
    const diff = (currentEpoch - 172800) * 1000;
      const getTrans = await Trans.find({
        status: "expired",
        gateway: "QR",
        date: {$gt: diff},
        expired: false,
        
      }).sort({ date: -1 });
      res.status(200).send(getTrans);
    } else {
      res.status(200).send("done");
    }
  };