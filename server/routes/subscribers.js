const express = require("express");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    await Subscriber.create({ email });
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ ok: true });
    }
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

module.exports = router;
