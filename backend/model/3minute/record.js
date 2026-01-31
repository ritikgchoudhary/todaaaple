import mongoose from 'mongoose';

const ThreeminuteRecordSchema = mongoose.Schema({

  id: {
    type: Number,
  
},
});

export default mongoose.model('3minutePeriodResult', ThreeminuteRecordSchema, '3minute_PeriodResult');
