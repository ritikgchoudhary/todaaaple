import mongoose from 'mongoose';

const cricketResultSchema = mongoose.Schema({
  matchId: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

export default mongoose.model('CricketResult', cricketResultSchema, 'cricket_result');
