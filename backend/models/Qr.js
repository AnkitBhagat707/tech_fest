const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  used: { type: Boolean, default: false },
  scannedAt: { type: Date }
});

module.exports = mongoose.model("QR", qrSchema);