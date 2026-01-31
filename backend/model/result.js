import mongoose from 'mongoose';

const ResultSchema = mongoose.Schema({

    manualNumber0: {
    type: Number
  },
  manualNumber1: {
    type: Number
  },
  manualNumber2: {
    type: Number
  },
  manualNumber3: {
    type: Number
  },
});

export default mongoose.model('Manual', ResultSchema, 'newPeriod');