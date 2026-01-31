import mongoose from 'mongoose';

const FiveminuteResultSchema = mongoose.Schema({

    manualNumber: {
    type: Number
  },
 
});

export default mongoose.model('5minuteManual', FiveminuteResultSchema, '5minute_period');