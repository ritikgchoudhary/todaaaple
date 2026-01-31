import mongoose from "mongoose";

const AviatorResultSchema = mongoose.Schema({
  date: {
    type: Number,
  },
  period: {
    type: Number,
  },
  crash: {
    type: Boolean,
    default: false,
  },
  manualNumber: {
    type: Number,
  },
  players: {
    type: Object,
  },
});

export default mongoose.model(
  "aviatorPeriod",
  AviatorResultSchema,
  "aviatorPeriod"
);
