import mongoose from 'mongoose';

const bidDataSchema = mongoose.Schema({
  players0: {
    type: Array,
    
  },
  players1: {
    type: Array,
    
  },
  players2: {
    type: Array,
    
  },
  players3: {
    type: Array,
    
  },
 
});

export default mongoose.model('Period', bidDataSchema, 'newPeriod');
