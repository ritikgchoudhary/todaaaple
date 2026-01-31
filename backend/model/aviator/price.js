import mongoose from 'mongoose';

const AviatorPriceSchema = mongoose.Schema({
 
   '0price': {
    type: Number,
   },
   '1price': {
      type: Number,
   },
   
});

export default mongoose.model('AviatorPrice', AviatorPriceSchema, 'aviator_price');
