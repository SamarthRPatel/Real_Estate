const dns = require("dns");
const mongoose = require("mongoose");

// Node's resolver can end up pointed at a local stub (e.g. 127.0.0.1) that
// doesn't answer SRV queries, even though the OS resolver works fine. That
// breaks mongodb+srv:// lookups. Point Node at a public resolver instead.
if (dns.getServers().every((server) => server === "127.0.0.1" || server === "::1")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;

    console.log("Connecting to MongoDB...");

    await mongoose.connect(uri);

    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Error:");
    console.error(err);
    process.exit(1);
  }
}

module.exports = connectDB;
