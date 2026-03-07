import mongoose from 'mongoose';

const OneminuteRecordSchema = mongoose.Schema({

  id: { type: Number },
  date: { type: Number },
  number: { type: Number },
  color: { type: String },
  price: { type: Number },
  big: { type: Boolean }
});

export default mongoose.model('1minutePeriodResult', OneminuteRecordSchema, '1minute_PeriodResult');
