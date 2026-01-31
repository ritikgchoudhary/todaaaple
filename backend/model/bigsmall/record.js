import mongoose from 'mongoose';

const BigsmallRecordSchema = mongoose.Schema({

  id: {
    type: Number,
  
},
});

export default mongoose.model('BigsmallPeriodResult', BigsmallRecordSchema, 'bigsmall_PeriodResult');
