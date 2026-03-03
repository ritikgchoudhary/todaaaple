import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
    {
        brand_id: { type: Number, unique: true }, // Changed from id
        brand_title: { type: String }, // Changed from name
        brand_img: { type: String }, // Changed from logo
        brand_img_cdn: { type: String },
        status: { type: Number, default: 1 }, // 1 = Active, 0 = Inactive
        brand_cat: { type: String }, // Changed from service_code
        game_count: { type: Number, default: 0 }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model("Brand", brandSchema);
