import mongoose from 'mongoose';

const OneminutebidDataSchema = mongoose.Schema({
  players: {
    type: Array,
    
  },
  date: {
    type: Number
  },
  

 
});

export default mongoose.model('1minutePeriod', OneminutebidDataSchema, '1minute_period');
