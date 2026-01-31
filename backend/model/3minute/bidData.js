import mongoose from 'mongoose';

const ThreeminutebidDataSchema = mongoose.Schema({
  players: {
    type: Array,
    
  },
  date: {
    type: Number
  },
  

 
});

export default mongoose.model('3minutePeriod', ThreeminutebidDataSchema, '3minute_period');
