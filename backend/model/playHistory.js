import mongoose from 'mongoose';

const PlayHistory = mongoose.Schema({
   userId: {
     type: Number,
    },
    history: {
      type: Array,
    },
 

});

export default mongoose.model('playHistory', PlayHistory);