const express = require("express");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  await ContactMessage.create({ name, email, message });
  res.status(201).json({ ok: true });
});

module.exports = router;
