import extra from "../../model/extra.js";
import Mines from "../../model/mines/sessions.js";
import playHistory from "../../model/playHistory.js";
import reports from "../../model/reports.js";
import userSchema from "../../model/userSchema.js";

export const getMinesHistoryData = async (req, res) => {
  var userId = req.params.id;
  const getBids = await Mines.find(
    {
      userId,
    },
    { id: 1, states: 1, userId: 1, amount: 1, date: 1, status: 1 }
  )
    .sort({ id: -1 })
    .limit(3);
  res.status(200).send(getBids);
};
export const getMinesFullHistoryData = async (req, res) => {
  var userId = req.params.id;
  const getBids = await Mines.find(
    {
      userId,
    },
    { id: 1, states: 1, userId: 1, amount: 1, date: 1, status: 1 }
  ).sort({ id: -1 });

  res.status(200).send(getBids);
};

export const getMinesFullHistoryDataAdmin = async (req, res) => {
  var userId = req.params.id;
  const api = req.params.api;
  if(api === process.env.AdminAPI){
  const getBids = await Mines.find(
    {
      userId,
    },
    { id: 1, states: 1, userId: 1, amount: 1, date: 1, status: 1 }
  ).sort({ id: -1 });

  res.status(200).send(getBids);
  }else{
    
  }
};

export const getExtra = async (req, res) => {
  const api = req.params.api;
  if (api === process.env.AdminAPI) {
    const getExtra = await extra.findOne({ id: 1 });
    res.status(200).send(getExtra);
  } else {
    res.status(200).send("done");
  }
};

export const setExtra = async (req, res) => {
  const data = req.body;
  const game = req.params.game;
  const api = req.params.api;
  if (api === process.env.AdminAPI) {
    if (game === "mines") {
      console.log(data);
      await extra.updateOne({ id: 1 }, { mines: data }, { upsert: true });
      res.status(200).send("done");
    }
    if (game === "fastParity") {
      await extra.updateOne({ id: 1 }, { fastParity: data }, { upsert: true });
      res.status(200).send("done");
    }
    if (game === "aviator") {
      await extra.updateOne({ id: 1 }, { aviator: data }, { upsert: true });
      res.status(200).send("done");
    }
  } else {
    res.status(200).send("done");
  }
};

export const getMinesSessionsAdmin = async (req, res) => {
  const api = req.params.api;
  if (api === process.env.AdminAPI) {
    const getData = await Mines.find({ expired: false, demo:false});
    res.status(200).send(getData);
  } else {
    res.status(200).send("done");
  }
};

export const setMinesManual = async (req, res) => {
  const data = req.body;

  const api = req.params.api;
  if (api === process.env.AdminAPI) {
    await Mines.updateOne({ id: data.id }, { manual: data.number });
    res.status(200).send("done");
  } else {
    res.status(200).send("done");
  }
};

export const checkMinesSessions = async (req, res) => {
  const api = req.params.api;

  if (api === "vcjhefcywe556ffd") {

    const getSessions = await Mines.find({ expired: false });
    getSessions.forEach(async (element) => {
      var diff = 3600 ;
      const lastTime = element.date / 1000 ;
      const currentTime = new Date();
      const currentEpoch = currentTime.getTime() / 1000 ;
      diff = currentEpoch - lastTime;
      if (diff > 3600) {
        var amount = element.amount - ((element.amount * 2)/100)
        const user = await userSchema.findOne({id: element.userId});
        await playHistory.updateOne(
            { userId: element.userId },
            { userId: element.userId,$push: {'history': {amount, note: 'expired', game: 'Mines',id: element.id,credit: true,date: Date.now()}}},{upsert: true}
          );
          await Mines.updateOne(
            { id: element.id },
            { status: "expired", expired: true,'states.winning': amount}
          );
          await userSchema.updateOne({id: element.userId},{$inc:{balance: amount}});
          if(!user.demo)
          await reports.updateOne({id: "minesAuto"},{id: "minesAuto", date: Date.now(),game: 'mines',$inc: {'states.cashout': amount,'states.sessionsExpired': +1}},{upsert: true});
        }
    });
  }

  res.status(200).send("Done");
};

export const getMinesReport = async (req, res) => {
    const api = req.params.api;
  
    if (api === process.env.AdminAPI) {
       const getReports = await reports.findOne({id: "minesAuto"});
       res.status(200).send(getReports);
    }else{
        res.status(200).send("done");

    }
  
  };

// export const createMinesReport = async (req, res) => {
//     const api = req.params.api;
  
//     if (api === "vcjhefcywe556ffd") {
  
//       const getMines = await Mines.find().sort({id: -1});
      
//       getMines.forEach(async element => {
//         if(element.id <= 3986){
//             const user = await userSchema.findOne({id: element.userId});
//             if(!user.demo){
//                await reports.updateOne({id: "manual"},{id: "manual", date: Date.now(),game: 'mines',$inc: {'states.placed': element.amount,'states.sessions': +1}},{upsert: true});
//                if(element.status === 'Cashout'){
//                 await reports.updateOne({id: "manual"},{id: "manual", date: Date.now(),game: 'mines',$inc: {'states.cashout': element.states.winning,'states.sessionsCashout': +1}},{upsert: true});

//                }
//                if(element.status === 'Loss'){
//                 await reports.updateOne({id: "manual"},{id: "manual", date: Date.now(),game: 'mines',$inc: {'states.loss': element.amount,'states.sessionsLoss': +1}},{upsert: true});

//                }
//                if(element.status === 'Won'){
//                 await reports.updateOne({id: "manual"},{id: "manual", date: Date.now(),game: 'mines',$inc: {'states.Won': element.states.winning,'states.sessionsWon': +1}},{upsert: true});

//                }

                

//             }
//             if(user.block){
//                 console.log(`blocked ${user.id}`);
//             }
//         }
//       });
//     }
  
//     res.status(200).send("Done");
//   };