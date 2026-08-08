const express = require("express");
const Property = require("../models/Property");
const User = require("../models/User");
const ContactMessage = require("../models/ContactMessage");
const Inquiry = require("../models/Inquiry");
const PropertyRequest = require("../models/PropertyRequest");
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
  const [
    totalUsers,
    adminCount,
    properties,
    users,
    totalInquiries,
    requestCounts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    Property.find().sort({ createdAt: -1 }),
    User.find().select("createdAt"),
    Inquiry.countDocuments(),
    Promise.all([
      PropertyRequest.countDocuments({ status: "pending" }),
      PropertyRequest.countDocuments({ status: "accepted" }),
      PropertyRequest.countDocuments({ status: "declined" }),
    ]),
  ]);

  const [requestsPending, requestsAccepted, requestsDeclined] = requestCounts;

  // Signups over time, for the line chart.
  const signupsByDay = {};
  for (const user of users) {
    const day = user.createdAt.toISOString().slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  }
  const userActivity = Object.entries(signupsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([login_date, total_users]) => ({ login_date, total_users }));

  // Breakdowns computed once from the same property list — small dataset,
  // no need for separate aggregation queries.
  const statusBreakdown = { pending: 0, available: 0, sold: 0, rented: 0, rejected: 0 };
  const listingTypeBreakdown = { sale: 0, rent: 0 };
  const propertyTypeBreakdown = { apartment: 0, house: 0, condo: 0 };

  for (const p of properties) {
    if (p.status in statusBreakdown) statusBreakdown[p.status]++;
    if (p.listingType in listingTypeBreakdown) listingTypeBreakdown[p.listingType]++;
    if (p.propertyType in propertyTypeBreakdown) propertyTypeBreakdown[p.propertyType]++;
  }

  res.json({
    totals: {
      users: totalUsers,
      admins: adminCount,
      listings: properties.length,
      sold: statusBreakdown.sold,
      rented: statusBreakdown.rented,
      available: statusBreakdown.available,
      pendingApproval: statusBreakdown.pending,
      inquiries: totalInquiries,
      requestsPending,
      requestsAccepted,
      requestsDeclined,
    },
    statusBreakdown,
    listingTypeBreakdown,
    propertyTypeBreakdown,
    user_activity: userActivity,
    // Kept for backward compatibility with the existing sales table.
    total_sold: statusBreakdown.sold + statusBreakdown.rented,
    properties: properties.map((p) => ({
      title: p.title,
      price: p.price,
      status: p.status,
      sold: p.status === "sold" || p.status === "rented",
      sold_date: p.status === "sold" || p.status === "rented" ? p.createdAt : null,
    })),
  });
});

module.exports = router;
