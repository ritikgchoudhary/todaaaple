import mongoose from 'mongoose';

const CricketMatchSchema = mongoose.Schema({
  id: {
    type: Number
  },
  matches: {
    type: Array,
    required: true,
  },
  series: {
    type: Array,
    required: true,
  },
  token: {
    type: Array
  }
});

export default mongoose.model('CricketMatch', CricketMatchSchema, );
