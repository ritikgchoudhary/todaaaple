import mongoose from 'mongoose';

const CricketbidHistorySchema = mongoose.Schema({
  matchId: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number
  },
  calc : {
    type: Object,
  },
  exp: {
    type: Object
  },
  bid: {
    type: Object,
    required: true,
  },
});

export default mongoose.model('CricketbidHistory', CricketbidHistorySchema, 'cricket_history');
