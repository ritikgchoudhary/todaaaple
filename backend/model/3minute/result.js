import mongoose from 'mongoose';

const ThreeminuteResultSchema = mongoose.Schema({

    manualNumber: {
    type: Number
  },
 
});

export default mongoose.model('3minuteManual', ThreeminuteResultSchema, '3minute_period');