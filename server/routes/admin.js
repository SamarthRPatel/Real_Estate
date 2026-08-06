const express = require("express");
const Property = require("../models/Property");
const User = require("../models/User");
const ContactMessage = require("../models/ContactMessage");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/properties", async (req, res) => {
  const properties = await Property.find().sort({ createdAt: -1 });
  res.json({ properties });
});

router.get("/contact-messages", async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({ messages });
});

router.get("/users", async (req, res) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ users, currentUserId: req.user.id });
});

router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "You can't change your own role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.role = role;
  await user.save();
  res.json({ ok: true });
});

router.delete("/users/:id", async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "You can't delete your own account" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  await user.deleteOne();
  res.json({ ok: true });
});

router.get("/reports", async (req, res) => {
  const [totalSold, properties, users] = await Promise.all([
    Property.countDocuments({ status: { $in: ["sold", "rented"] } }),
    Property.find().sort({ createdAt: -1 }),
    User.find().select("createdAt"),
  ]);

  const signupsByDay = {};
  for (const user of users) {
    const day = user.createdAt.toISOString().slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  }
  const userActivity = Object.entries(signupsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([login_date, total_users]) => ({ login_date, total_users }));

  res.json({
    total_sold: totalSold,
    properties: properties.map((p) => ({
      title: p.title,
      price: p.price,
      sold: p.status === "sold" || p.status === "rented",
      sold_date: p.status === "sold" || p.status === "rented" ? p.createdAt : null,
    })),
    user_activity: userActivity,
  });
});

module.exports = router;
