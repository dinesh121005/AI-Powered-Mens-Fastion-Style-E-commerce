const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    size: [String], // e.g. S, M, L, XL
    fit: String, // e.g. Slim, Regular, Loose
    material: String, // e.g. Cotton, Polyester
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
