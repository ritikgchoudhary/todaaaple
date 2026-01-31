import mongoose from 'mongoose';

const BigSmallResultSchema = mongoose.Schema({

    manualNumber: {
    type: Number
  },
 
});

export default mongoose.model('BigsmallManual', BigSmallResultSchema, 'bigsmall_period');