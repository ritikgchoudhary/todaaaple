import mongoose from 'mongoose';

const AviatorBidHistorySchema = mongoose.Schema({
  _id: {
    type: Number,
    required: true,
  },
  bid: {
    type: Array,
    required: true,
  },
});

export default mongoose.model('AviatorBidHistory', AviatorBidHistorySchema, 'aviator_history');
