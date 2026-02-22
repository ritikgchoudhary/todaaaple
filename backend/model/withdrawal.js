import mongoose from "mongoose";

const WithdrawalSchema = mongoose.Schema({
  id: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  date: {
    type: Date,
  },
  epoch: {
    type: Number
  },
  status: {
    type: String,
  },
  method: {
    type: Array,
  },
  phone: {
    type: Number,
  },
  balance: {
    type: Number,
  },
  payout: {
    type: String,
  },
  txnId: {
    type: String,
  },
  type: {
    type: String,
    default: 'manual'
  },
  usdt: {
    type: Number,
  },
  walletAddress: {
    type: String,
  },
  withdrawalFee: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("With", WithdrawalSchema, "newWithdrawalHistory");
