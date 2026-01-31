import mongoose from 'mongoose';

const otpScheme = mongoose.Schema({
    id: {
        type: Number,
    },
  date: {
      type: Date,
  },
  expired: {
   type: Boolean,
  },
  code: {
      type: Number,
  },
  phone: {
      type: Number
  }
 
});

export default mongoose.model('otp', otpScheme, 'otp');
