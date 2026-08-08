const express = require("express");
const PropertyRequest = require("../models/PropertyRequest");
const Property = require("../models/Property");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/mine-incoming", async (req, res) => {
  const requests = await PropertyRequest.find({ sellerId: req.user.id })
    .populate("propertyId", "title location price listingType status")
    .populate("buyerId", "firstName lastName email phone")
    .sort({ createdAt: -1 });
  res.json({ requests });
});

router.get("/mine-outgoing", async (req, res) => {
  const requests = await PropertyRequest.find({ buyerId: req.user.id })
    .populate("propertyId", "title location price listingType status")
    .sort({ createdAt: -1 });
  res.json({ requests });
});

router.patch("/:id/accept", async (req, res) => {
  const request = await PropertyRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }
  if (request.sellerId.toString() !== req.user.id) {
    return res.status(403).json({ error: "Not authorized" });
  }
  if (request.status !== "pending") {
    return res.status(400).json({ error: "This request has already been handled" });
  }

  const property = await Property.findById(request.propertyId);
  if (!property) {
    return res.status(404).json({ error: "Listing no longer exists" });
  }

  request.status = "accepted";
  await request.save();

  property.status = request.requestType === "rent" ? "rented" : "sold";
  await property.save();

  // Any other still-pending requests for this property are now moot.
  await PropertyRequest.updateMany(
    { propertyId: property._id, status: "pending", _id: { $ne: request._id } },
    { status: "declined" }
  );

  res.json({ request });
});

router.patch("/:id/decline", async (req, res) => {
  const request = await PropertyRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }
  if (request.sellerId.toString() !== req.user.id) {
    return res.status(403).json({ error: "Not authorized" });
  }
  if (request.status !== "pending") {
    return res.status(400).json({ error: "This request has already been handled" });
  }

  request.status = "declined";
  await request.save();
  res.json({ request });
});

module.exports = router;
