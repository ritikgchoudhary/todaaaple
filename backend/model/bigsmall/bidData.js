import mongoose from 'mongoose';

const BigsmallbidDataSchema = mongoose.Schema({
  players: {
    type: Array,
    
  },
  date: {
    type: Number
  },
  

 
});

export default mongoose.model('BigsmallPeriod', BigsmallbidDataSchema, 'bigsmall_period');
