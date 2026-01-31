import mongoose from 'mongoose';

const FiveminutePriceSchema = mongoose.Schema({
 
   'price': {
    type: Number,
   },
   
   'game': {
    type: Array,
   },
   
   
   
});

export default mongoose.model('5minutePrice', FiveminutePriceSchema, '5minute_price');
