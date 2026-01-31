import mongoose from 'mongoose';

const PriceSchema = mongoose.Schema({
 
   '0price': {
    type: Number,
   },
   '1price': {
      type: Number,
   },
   '2price': {
      type: Number,
   },
   '3price': {
      type: Number,
   },
   'game0': {
    type: Array,
   },
   'game1': {
      type: Array,
   },
   'game2': {
   type: Array,
   },
   'game3': {
      type: Array,
   },
   
   
});

export default mongoose.model('Price', PriceSchema, 'newPrice');
