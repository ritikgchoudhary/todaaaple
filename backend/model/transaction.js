import mongoose from "mongoose";

const transaction = mongoose.Schema({
  id: {
    type: String,
  },
  createDate: {
    type: Number,
  },
  txnId: {
    type: String,
  },
  gateway: {
    type: String,
    default: 'UPI'
  },
  date: {
    type: Number,
  },
  expired: {
    default: false,
    type: Boolean,
  },
  amount: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  number: {
    type: Number,
  },
  status: {
    type: String,
  },
  transDate: {
    type: String,
  },
  response: {
    type: String,
  },
  name:{
    type: String,

  },
  email:{
    type: String
  },
  phone: {
    type: Number
  },
  upi: {
    type: String,
  },
  agent: {
    type: String,
  },
  utr: {
    type: String,
  },
  key: {
    type: Object,
  },
  utr: {
    type: String
  },
  __v: { type: Number}
});

export default mongoose.model("transaction", transaction);
