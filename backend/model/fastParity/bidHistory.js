import mongoose from 'mongoose';

const FastParitybidHistorySchema = mongoose.Schema({
  _id: {
    type: Number,
    required: true,
  },
  bid: {
    type: Array,
    required: true,
  },
});

export default mongoose.model('FastParityBidHistory', FastParitybidHistorySchema, 'fastParity_history');
