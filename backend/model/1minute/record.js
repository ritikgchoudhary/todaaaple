import mongoose from 'mongoose';

const OneminuteRecordSchema = mongoose.Schema({

  id: {
    type: Number,
  
},
});

export default mongoose.model('1minutePeriodResult', OneminuteRecordSchema, '1minute_PeriodResult');
