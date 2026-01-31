import mongoose from 'mongoose';

const PromotionSchema = mongoose.Schema({

  date: {
    type: Number
  },
  userId: {
    type: Number
  },
  level0: {
    type: Object
  },
  level1: {
    type: Object
  },
  level2: {
    type: Object
  },
  level3: {
    type: Object
  },
  level4: {
    type: Object
  },
  level5: {
    type: Object
  },
  level6: {
    type: Object
  },
  newlevel0: {
    type: Object
  },
  newlevel1: {
    type: Object
  },
  newlevel2: {
    type: Object
  },
  newlevel3: {
    type: Object
  },
  newlevel4: {
    type: Object
  },
  newlevel5: {
    type: Object
  },
  newlevel6: {
    type: Object
  },
  salaryActive:{
    type: Object
  },
  activeMembers: {
    type: Object
  },
  taskClaimed:{
    type: Object
  },
  inviteBonusClaimed:{
    type: Object
  }
  


});

export default mongoose.model('Promotion', PromotionSchema,);
