const mongoose = require("mongoose");
const config = require("./config.js");

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Connection Error ❌:", error.message);
    process.exit(1); // stop server if DB fails
  }
}

module.exports = connectDB; 