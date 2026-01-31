import aviatorRecord from "../../model/aviator/record.js";
import AviatorBidHistory from "../../model/aviator/bidHistory.js";
import AviatorPrice from "../../model/aviator/price.js";
import aviatorPeriod from "../../model/aviator/result.js"
import reports from "../../model/reports.js";

export const getAviatorTimer = async (req, res) => {
    const lastDate = await Record.find().sort({ date: -1 }).limit(1);
  
    res.send(lastDate);
  };
  export const getAviatorRecordData = (req, res) => {
    aviatorRecord.find()
      .sort({ date: -1 })
      .limit(5)
      .then((result) => {
        
        res.send(result.length > 0 ? result : "No Data");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  export const getAviatorFullRecordData = (req, res) => {
    aviatorRecord.find()
      .sort({ date: -1 })
      .then((result) => {
        res.send(result.length > 0 ? result : "No Data");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  export const aviator_getFullHistoryData = async (req, res) => {
    var userId = req.params.id;
    AviatorBidHistory.find({ "bid.userId": parseInt(userId) })
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
  export const getAviatorReport = async (req, res) => {
    const api = req.params.api;
  
    if (api === process.env.AdminAPI) {
       const getReports = await reports.findOne({id: "aviator"});
       res.status(200).send(getReports);
    }else{
        res.status(200).send("done");

    }
  
  };
  export const aviator_getPricing = async (req, res) => {
    const api = req.params.api;
    if (!api || api === process.env.AdminAPI) {
      const pricing = await AviatorPrice.find();
      res.send(pricing);
    } else {
      res.send("permission denied");
    }
  };

  export const aviator_setResult = async (req, res) => {
    const number = req.body.number;
    const api = req.params.api;
    
    if (!api || api === process.env.AdminAPI) {
      const currentPeriod = await aviatorPeriod.find().sort({ date: -1 });
      await aviatorPeriod.updateOne(
        { _id: currentPeriod[0]._id },
        { manualNumber: number }
      );
      res.send("done");
    } else {
      res.send("permission denied");
    }
  };
  export const aviator_currentBid = async (req, res) => {
    
    var userId = req.params.id;
    aviatorPeriod.findOne()
      .sort({ "date": -1 })
      .then((result) => {
        var newBid = [];
        if (result.players) {
          
          Object.keys(result.players).map((element) => {
            if(parseInt(userId) === result.players[`${element}`].userId){
              newBid.push(result.players[`${element}`]);
            }
         
        })
        }
        
        res.status(200).send(newBid);
      })
      .catch((err) => {
        console.log(err);
      });
  };