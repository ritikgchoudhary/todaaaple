import mongoose from 'mongoose';

const AviatorRecordSchema = mongoose.Schema({

  id: {
    type: Number,
  
}, date: {
  type: Number,

},
number: {
  type: Number,

},
});

export default mongoose.model('aviatorRecord', AviatorRecordSchema, 'aviatorPeriodResult');
