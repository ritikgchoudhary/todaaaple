import mongoose from 'mongoose';

const ThreeminutebidHistorySchema = mongoose.Schema({
  _id: {
    type: Number,
    required: true,
  },
  bid: {
    type: Array,
    required: true,
  },
  
  streakClaim: {
    type: Array
  }
});

export default mongoose.model('3minuteBidHistory', ThreeminutebidHistorySchema, '3minute_history');
