import mongoose from "mongoose";

const OfferBonus = mongoose.Schema({
  userId: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  history: {
    type: Array,
  },
  todayProfit: {
    type: Object
  },
  
  totalReferral: {
    type: Number,
  },
  totalDailyTask: {
    type: Number,
  },
  totalLevel0: {
    type: Number,
  },
  totalLevel1: {
    type: Number,
  },
  totalLevel2: {
    type: Number,
  },
  totalLevel3: {
    type: Number,
  },
  totalLevel4: {
    type: Number,
  },
  totalLevel5: {
    type: Number,
  },
  totalLevel6: {
    type: Number,
  },
  totalInviteBonus: {
    type: Number,
  },
  
  
});

export default mongoose.model("bonusCredit", OfferBonus);
