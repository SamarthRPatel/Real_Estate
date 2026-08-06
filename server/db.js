const dns = require("dns");
const mongoose = require("mongoose");

// Node's resolver can end up pointed at a local stub (e.g. 127.0.0.1) that
// doesn't answer SRV queries, even though the OS resolver works fine. That
// breaks mongodb+srv:// lookups. Point Node at a public resolver instead.
if (dns.getServers().every((server) => server === "127.0.0.1" || server === "::1")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
