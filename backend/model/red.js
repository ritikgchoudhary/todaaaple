import mongoose from 'mongoose';

const RedSchema = mongoose.Schema({
    id: {
      type: String,
    },
    number:{
      type: Number,
    },
    amount: {
     type: Number,
    },
    qty: {
      type: Number
    },
    type: {
      type: String,
    },
    date: {
      type: Number,  
    },
    expired: {
      type: Boolean
    },
    userId: {
      type: Number,
    },
    claimer: {
      type: Array,
      default: []
    },
    luckyDraw: {
      type: Array,
    }
 

});

export default mongoose.model('Red', RedSchema, 'redEnvelop');