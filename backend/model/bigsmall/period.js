import mongoose from 'mongoose';

const BigSmallPriceSchema = mongoose.Schema({
 
   'price': {
    type: Number,
   },
   
   'game': {
    type: Array,
   },
   
   
   
});

export default mongoose.model('BigsmallPrice', BigSmallPriceSchema, 'bigsmall_price');
