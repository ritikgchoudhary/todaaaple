import mongoose from 'mongoose';

const OneminuteResultSchema = mongoose.Schema({

    manualNumber: {
    type: Number
  },
 
});

export default mongoose.model('1minuteManual', OneminuteResultSchema, '1minute_period');