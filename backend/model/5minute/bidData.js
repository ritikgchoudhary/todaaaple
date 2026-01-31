import mongoose from 'mongoose';

const FiveminutebidDataSchema = mongoose.Schema({
  players: {
    type: Array,
    
  },
  date: {
    type: Number
  },
  

 
});

export default mongoose.model('5minutePeriod', FiveminutebidDataSchema, '5minute_period');
