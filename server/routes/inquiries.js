const express = require("express");
const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const { sendInquiryNotificationEmail } = require("../utils/mailer");

const router = express.Router();

router.post("/", async (req, res) => {
  const { propertyId, name, email, phone, message } = req.body;
  if (!propertyId || !name || !email || !message) {
    return res.status(400).json({ error: "propertyId, name, email, and message are required" });
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const inquiry = await Inquiry.create({ propertyId, name, email, phone, message });
  res.status(201).json({ inquiry });

  // Best-effort notification — the inquiry is already saved, so a failed/unconfigured
  // email setup shouldn't block the buyer's request or leak a server error to them.
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  User.findById(property.sellerId)
    .then((seller) => {
      if (!seller) return;
      return sendInquiryNotificationEmail(seller.email, {
        sellerName: seller.firstName,
        propertyId: property._id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyAddress: property.location,
        // Email clients (Gmail especially) block/strip inline base64 data: URIs in <img src>,
        // so the image must be served from a real URL, not the raw stored data URI.
        propertyImage: property.imageUrls?.[0] ? `${appUrl}/api/properties/${property._id}/image/0` : undefined,
        propertyType: property.propertyType,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        buyerName: name,
        buyerEmail: email,
        buyerPhone: phone,
        message,
      });
    })
    .catch((err) => console.error("Inquiry notification email failed:", err.message));
});

router.get("/mine", requireAuth, async (req, res) => {
  const myProperties = await Property.find({ sellerId: req.user.id }).select("_id");
  const propertyIds = myProperties.map((p) => p._id);

  const inquiries = await Inquiry.find({ propertyId: { $in: propertyIds } })
    .populate("propertyId", "title location")
    .sort({ createdAt: -1 });

  res.json({ inquiries });
});

module.exports = router;
