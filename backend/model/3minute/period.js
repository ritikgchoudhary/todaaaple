import mongoose from 'mongoose';

const ThreeminutePriceSchema = mongoose.Schema({
 
   'price': {
    type: Number,
   },
   
   'game': {
    type: Array,
   },
   
   
   
});

export default mongoose.model('3minutePrice', ThreeminutePriceSchema, '3minute_price');
