import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    imageUrl: { type: String },
    description: { type: String },
    skinTypes: [{ type: String }],
    concerns: [{ type: String }],
    ageRanges: [{ type: String }],
    ingredients: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);


