import mongoose from 'mongoose';

const FastParitybidDataSchema = mongoose.Schema({
  players: {
    type: Array,
    
  },
  date: {
    type: Number
  },
  

 
});

export default mongoose.model('FastParityPeriod', FastParitybidDataSchema, 'fastParity_period');
