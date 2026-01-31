import mongoose from 'mongoose';

const BigSmallbidHistorySchema = mongoose.Schema({
  _id: {
    type: Number,
    required: true,
  },
  bid: {
    type: Array,
    required: true,
  },
});

export default mongoose.model('BigSmallBidHistory', BigSmallbidHistorySchema, 'bigsmall_history');
