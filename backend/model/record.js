import mongoose from 'mongoose';

const RecordSchema = mongoose.Schema({

  id: {
    type: Number,
  
},
});

export default mongoose.model('newPeriodResult', RecordSchema, 'newPeriodResult');
