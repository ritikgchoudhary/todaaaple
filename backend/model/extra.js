import mongoose from 'mongoose';

const ExtraScheme = mongoose.Schema({
    id: {
        type: Number,
    },
    mines:{
        type: Object,
    },
    fastParity:{
        type: Object,
    },
    wingo:{
        type: Object,
    },
    aviator: {
        type: Object,
    },
    gateway: {
        type: String,
    },
    gatewayOut: {
        type: String,
    },
    upi: {
        type: Object
    },
    cricket: {
        type: Object

    },
    notice: {
        type: Object
    },
    ip: {
        type: Array
    }
  
  
 
});

export default mongoose.model('Extra', ExtraScheme);
