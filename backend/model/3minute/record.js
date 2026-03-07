import mongoose from 'mongoose';

const ThreeminuteRecordSchema = mongoose.Schema({

  id: { type: Number },
  date: { type: Number },
  number: { type: Number },
  color: { type: String },
  price: { type: Number },
  big: { type: Boolean }
});

export default mongoose.model('3minutePeriodResult', ThreeminuteRecordSchema, '3minute_PeriodResult');
