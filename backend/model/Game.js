import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        game_name: { type: String, required: true }, // Changed from name
        game_code: { type: String, required: true },
        brand_id: { type: Number, required: true, ref: 'Brand' }, // Changed from provider_id
        category: { type: String }, // Changed from type
        status: { type: Number, default: 1 }, // 1 = Active, 0 = Inactive
        game_img: { type: String }, // Changed from image
        game_img_cdn: { type: String },
        brand_desc: { type: String } // Changed from desc
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model("Game", gameSchema);
