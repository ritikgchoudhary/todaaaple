import mongoose from 'mongoose';

const SalarySchema = mongoose.Schema({

    userId: {
    type: Number
  },
  date: {
    type: Object
  },
  
});

export default mongoose.model('salary', SalarySchema);