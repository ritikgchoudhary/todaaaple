import mongoose from 'mongoose';

const FastParityRecordSchema = mongoose.Schema({

  id: {
    type: Number,
  
},
});

export default mongoose.model('PastParityPeriodResult', FastParityRecordSchema, 'fastParity_PeriodResult');
