import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
  },
  balance: {
    type: Number,
  },
  exp: {
    type: Number,
  },
  bonus: {
    type: Number,
  },
  date: {
    type: Date,
  },
  username: {
    type: String,
  },

  level0contribution: {
    type: Number,
  },
  level1contribution: {
    type: Number,
  },
  level2contribution: {
    type: Number,
  },
  level3contribution: {
    type: Number,
  },
  level4contribution: {
    type: Number,
  },  
  level5contribution: {
    type: Number,
  },
  level6contribution: {
    type: Number,
  },
  upLine: {
    type: Array,
  },
  bank: {
    type: Array
  },
  upi: {
    type: String
  },
  address: {
    type: Array
  },
  rechargeHistory: {
    type: Array,
  },
  withdrawal: {
    type: Array
  },
  bonusRecord: {
    type: Array
  },
  demo: {
    type: Boolean
  },
  firstRecharge: {
    type: Boolean
  },
  token: {
    type: String
  },
  bidToday: {
    type: Object
  },
  bidHistory: {
    type: Array,
  },
  walletHistory: {
    type: Array,
  },
  block: {
    type: Boolean
  },
  temp:{
    type: Boolean
  },
  exp: {
    type: Number
  },
  withWallet:
  {
    type: Number
  },
  levelDown: {
    type: Boolean
  }
});

export default mongoose.model('User', userSchema, 'newUsers');
