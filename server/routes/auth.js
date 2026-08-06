const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const { sendPasswordResetEmail } = require("../utils/mailer");

const router = express.Router();
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function publicUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    // Every account can buy, sell, and rent — there's no separate seller role to
    // grant here. role is always "user"; "admin" is only ever set directly in the DB.
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: "user",
    });

    setSessionCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    setSessionCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: publicUser(user) });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  await user.save();

  res.json({ user: publicUser(user) });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal whether the email exists.
    return res.json({ ok: true });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password.html?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    return res.status(500).json({ error: "Could not send reset email: " + err.message });
  }

  res.json({ ok: true });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token and new password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: new Date() },
  }).select("+resetTokenHash +resetTokenExpires");

  if (!user) {
    return res.status(400).json({ error: "This reset link is invalid or has expired" });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ ok: true });
});

module.exports = router;
