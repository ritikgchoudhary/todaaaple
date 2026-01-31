import mongoose from 'mongoose';

const FiveminutebidHistorySchema = mongoose.Schema({
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

export default mongoose.model('5minuteBidHistory', FiveminutebidHistorySchema, '5minute_history');
