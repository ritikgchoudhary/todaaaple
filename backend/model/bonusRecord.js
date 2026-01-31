import mongoose from 'mongoose';

const BonusRecordSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  amount: {
      type: Number,
      required: true,
  },
  userId: {
      type: Number,
      required: true,
  },

 
});

export default mongoose.model('Bonus', BonusRecordSchema, 'bonusRecord');
