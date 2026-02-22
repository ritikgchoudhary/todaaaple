import mongoose from "mongoose";

const gameCatalogSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // examples: sports, casino, slots, crash, lottery, cards, other
    },
    type: {
      type: String,
      default: "grid",
      trim: true,
      // examples: featured, grid
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    charImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    backgroundUrl: {
      type: String,
      default: "",
      trim: true,
    },
    onClickPath: {
      // internal route, e.g. /cricket, /casino
      type: String,
      default: "",
      trim: true,
    },
    externalUrl: {
      // optional external link
      type: String,
      default: "",
      trim: true,
    },
    softapiGameUid: {
      // optional: for SoftAPI launch
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

gameCatalogSchema.index({ category: 1, enabled: 1, sortOrder: 1 });

export default mongoose.model("GameCatalog", gameCatalogSchema, "gameCatalog");

