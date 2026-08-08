const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inquiry", inquirySchema);
