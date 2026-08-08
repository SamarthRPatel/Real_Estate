const express = require("express");
const Property = require("../models/Property");
const PropertyRequest = require("../models/PropertyRequest");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

router.get("/", async (req, res) => {
  const { listingType, propertyType, search, minBedrooms, minBathrooms, minPrice, maxPrice, sort, status } = req.query;
  // By default only actively available listings show up (Buy/Rent pages).
  // Passing status=sold_or_rented switches to the public "Sold/Rented" archive page instead.
  const filter = { status: status === "sold_or_rented" ? { $in: ["sold", "rented"] } : "available" };
  if (listingType) filter.listingType = listingType;
  if (propertyType) filter.propertyType = propertyType;
  if (search) filter.title = { $regex: search, $options: "i" };
  if (minBedrooms) filter.bedrooms = { $gte: parseInt(minBedrooms, 10) };
  if (minBathrooms) filter.bathrooms = { $gte: parseInt(minBathrooms, 10) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseInt(minPrice, 10);
    if (maxPrice) filter.price.$lte = parseInt(maxPrice, 10);
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const sortOrder = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [properties, total] = await Promise.all([
    Property.find(filter).sort(sortOrder).skip((page - 1) * limit).limit(limit),
    Property.countDocuments(filter),
  ]);

  res.json({ properties, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get("/mine", requireAuth, async (req, res) => {
  const properties = await Property.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
  res.json({ properties });
});

router.get("/pending", requireAuth, requireRole("admin"), async (req, res) => {
  const properties = await Property.find({ status: "pending" }).sort({ createdAt: 1 });
  res.json({ properties });
});

router.get("/:id", async (req, res) => {
  const property = await Property.findById(req.params.id).catch(() => null);
  if (!property) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json({ property });
});

router.get("/:id/image/:index", async (req, res) => {
  const property = await Property.findById(req.params.id).catch(() => null);
  if (!property) {
    return res.status(404).send("Not found");
  }

  const dataUrl = property.imageUrls?.[parseInt(req.params.index, 10)];
  if (!dataUrl) {
    return res.status(404).send("Not found");
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
  if (!match) {
    return res.status(404).send("Not found");
  }

  const [, mimeType, base64Data] = match;
  res.set("Content-Type", mimeType);
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.send(Buffer.from(base64Data, "base64"));
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title, location, price, propertyType, listingType, description, imageUrls,
      bedrooms, bathrooms, area, yearBuilt, garage, amenities,
    } = req.body;
    if (!title || !location || !price || !propertyType || !listingType) {
      return res.status(400).json({ error: "Title, location, price, propertyType, and listingType are required" });
    }

    const property = await Property.create({
      title,
      location,
      price,
      propertyType,
      listingType,
      description,
      imageUrls: Array.isArray(imageUrls) ? imageUrls.slice(0, 8) : [],
      bedrooms,
      bathrooms,
      area,
      yearBuilt,
      garage,
      amenities,
      sellerId: req.user.id,
      status: "pending",
    });

    res.status(201).json({ property });
  } catch (err) {
    res.status(500).json({ error: "Failed to create listing" });
  }
});

router.post("/:id/request", requireAuth, async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (property.status !== "available") {
    return res.status(400).json({ error: "This property isn't available anymore" });
  }
  if (property.sellerId.toString() === req.user.id) {
    return res.status(400).json({ error: "You can't request your own listing" });
  }

  const existing = await PropertyRequest.findOne({
    propertyId: property._id,
    buyerId: req.user.id,
    status: "pending",
  });
  if (existing) {
    return res.status(409).json({ error: "You already have a pending request for this property" });
  }

  const request = await PropertyRequest.create({
    propertyId: property._id,
    buyerId: req.user.id,
    sellerId: property.sellerId,
    requestType: property.listingType === "rent" ? "rent" : "buy",
  });

  res.status(201).json({ request });
});

router.patch("/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: "Listing not found" });
  }
  property.status = "available";
  await property.save();
  res.json({ property });
});

router.patch("/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: "Listing not found" });
  }
  property.status = "rejected";
  await property.save();
  res.json({ property });
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!["available", "sold", "rented"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const property = await Property.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (property.sellerId.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized" });
  }

  property.status = status;
  await property.save();
  res.json({ property });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (property.sellerId.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized" });
  }

  await property.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
