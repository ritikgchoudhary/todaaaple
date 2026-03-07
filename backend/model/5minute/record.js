import mongoose from 'mongoose';

const FiveminuteRecordSchema = mongoose.Schema({

  id: { type: Number },
  date: { type: Number },
  number: { type: Number },
  color: { type: String },
  price: { type: Number },
  big: { type: Boolean }
});

export default mongoose.model('5minutePeriodResult', FiveminuteRecordSchema, '5minute_PeriodResult');
