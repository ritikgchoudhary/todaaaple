import mongoose from 'mongoose';

const FiveminuteRecordSchema = mongoose.Schema({

  id: {
    type: Number,
  
},
});

export default mongoose.model('5minutePeriodResult', FiveminuteRecordSchema, '5minute_PeriodResult');
