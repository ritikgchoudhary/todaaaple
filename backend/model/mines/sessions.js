import mongoose from 'mongoose';

const Mines = mongoose.Schema({
  id: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  amount: {
    type: Number
  },
  date: {
    type: Number
  },
  states: {
    type: Object
  },
  status: {
    type: String,
  },
  expired: {
    type: Boolean,
  },
  bomb: {
    type: Array,
  },
  manual: {
    type: Number,
  },
  demo:{
    type: Boolean,
  }
 
});

export default mongoose.model('Mines', Mines, 'minesSessions');
