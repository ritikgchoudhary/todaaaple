import mongoose from 'mongoose';

const agentScheme = mongoose.Schema({
    id: {
        type: String,
    },
  date: {
      type: Date,
  },
  expired: {
   type: Boolean,
  },
  name: {
    type: String
  },
  
  phone: {
      type: Number
  }
 
});

export default mongoose.model('agent', agentScheme);
