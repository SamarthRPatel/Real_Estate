require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const favoriteRoutes = require("./routes/favorites");
const inquiryRoutes = require("./routes/inquiries");
const subscriberRoutes = require("./routes/subscribers");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contact");
const requestRoutes = require("./routes/requests");

const app = express();
const FRONTEND_DIR = path.join(__dirname, "..", "real-estate");

app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/requests", requestRoutes);

app.use(express.static(FRONTEND_DIR));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
