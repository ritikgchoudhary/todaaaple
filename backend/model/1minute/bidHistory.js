import mongoose from 'mongoose';

const OneminutebidHistorySchema = mongoose.Schema({
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

export default mongoose.model('1minuteBidHistory', OneminutebidHistorySchema, '1minute_history');
