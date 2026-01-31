import mongoose from "mongoose";

const dailySchema = mongoose.Schema({
  id: {
    type: String,
  },
  amount: {
    type: Number,
  },
  redeem: {
    type: Number,
  },
  redeemCount: {
    type: Number,
  },

  count: {
    type: Number
  },
  agent:{
    type: Object
  },
  payment: {
    type: Object
  }
});

export default mongoose.model("daily", dailySchema, 'daily');
