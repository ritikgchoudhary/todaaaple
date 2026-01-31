import mongoose from "mongoose";

const payoutSchema = mongoose.Schema({
  id: {
    type: Number,
  },
  orderId: {
    type: String,
  },
  txnId: {
    type: String,
  },
  gateway: {
    type: String,
    default: 'PinWallet'
  },
  bank:{
    type: Object
  },
  rrn:{
    type:Number
  },
  
  amount: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  withdrawalId: {
    type: String,
  },
  number: {
    type: Number,
  },
  status: {
    type: String,
  },
  type: {
    type: String
  }
});

export default mongoose.model("payout", payoutSchema);
