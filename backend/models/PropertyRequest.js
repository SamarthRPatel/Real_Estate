const mongoose = require("mongoose");

const propertyRequestSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestType: { type: String, enum: ["buy", "rent"], required: true },
  status: { type: String, enum: ["pending", "accepted", "declined", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PropertyRequest", propertyRequestSchema);
