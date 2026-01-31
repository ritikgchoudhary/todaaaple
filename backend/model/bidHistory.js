import mongoose from 'mongoose';

const bidHistorySchema = mongoose.Schema({
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

export default mongoose.model('NewBidHistory', bidHistorySchema, 'history');
