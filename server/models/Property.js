const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  propertyType: { type: String, enum: ["apartment", "house", "condo"], required: true },
  listingType: { type: String, enum: ["sale", "rent"], required: true },
  description: { type: String, trim: true },
  imageUrls: { type: [String], default: [] },
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  area: { type: Number, min: 0 },
  yearBuilt: { type: Number },
  garage: { type: Number, min: 0 },
  amenities: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["pending", "available", "sold", "rented", "rejected"],
    default: "pending",
  },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Property", propertySchema);
