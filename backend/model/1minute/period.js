import mongoose from 'mongoose';

const OneminutePriceSchema = mongoose.Schema({
 
   'price': {
    type: Number,
   },
   
   'game': {
    type: Array,
   },
   
   
   
});

export default mongoose.model('1minutePrice', OneminutePriceSchema, '1minute_price');
