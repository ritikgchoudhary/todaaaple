import mongoose from 'mongoose';

const FastParityResultSchema = mongoose.Schema({

    manualNumber: {
    type: Number
  },
 
});

export default mongoose.model('FastParityManual', FastParityResultSchema, 'fastParity_period');