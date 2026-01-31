import CricketBid from "../../model/cricket/bidHistory.js"

export const cricket_getbidHistory = async(req,res) => {
  const userId = req.params.id;
  const matchId = req.params.matchId;
  const firld = `bid.${userId}`;
  
  // try {
    const getBid = await CricketBid.find({[firld]: {$exists: true}},{[firld]: 1,matchId: 1});
    // var newBid = {
    //   odds: [],
    //   fancyHistory: [],
    //   fancy2History: [],
    // };
    // getBid.forEach(element => {
    //   try {
    //     if(element.bid[`${userId}`]?.history)
    //     newBid.odds.push(element);

    //     if(element.bid[`${userId}`]?.fancyHistory)
    //     newBid.fancyHistory.push(element);

    //     if(element.bid[`${userId}`]?.fancy2History)
    //     newBid.fancy2History.push(element);
    //   } catch (error) {
    //     console.log(error);
    //   }
      
    // });
  
    res.status(200).send(getBid);

}
export const cricket_getCurrentBidHistory = async(req,res) => {

  const userId = req.params.id;
  const matchId = req.params.matchId;
  const firld = `bid.${userId}`;
  
  // try {
    const getBid = await CricketBid.findOne({ matchId, [firld]: {$exists: true}},{[firld]:1,matchId});
  
    res.status(200).send(getBid);

  // } catch (error) {
  //   res.status(200).send("No Data");
  // }

  
  
  
}