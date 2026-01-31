import mongoose from 'mongoose';

const FastParityPriceSchema = mongoose.Schema({
 
   'price': {
    type: Number,
   },
   
   'game': {
    type: Array,
   },
   
   
   
});

export default mongoose.model('FastParityPrice', FastParityPriceSchema, 'fastParity_price');
