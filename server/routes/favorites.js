const express = require("express");
const Favorite = require("../models/Favorite");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user.id }).populate("propertyId");
  res.json({
    favorites: favorites
      .filter((fav) => fav.propertyId)
      .map((fav) => fav.propertyId),
  });
});

router.post("/", async (req, res) => {
  const { propertyId } = req.body;
  if (!propertyId) {
    return res.status(400).json({ error: "propertyId is required" });
  }
  try {
    await Favorite.create({ userId: req.user.id, propertyId });
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Already in favorites" });
    }
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

router.delete("/:propertyId", async (req, res) => {
  await Favorite.deleteOne({ userId: req.user.id, propertyId: req.params.propertyId });
  res.json({ ok: true });
});

module.exports = router;
