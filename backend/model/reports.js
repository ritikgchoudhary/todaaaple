import mongoose from 'mongoose';

const ReportsSchema = mongoose.Schema({

    id: {
    type: String
  },
  game: {
    type: String
  },
  states:{
    type: Object
  },
  date: {
    type: Number
  }
});

export default mongoose.model('Reports', ReportsSchema);