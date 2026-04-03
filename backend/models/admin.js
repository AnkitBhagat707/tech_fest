const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  mustChangePassword: {
    type: Boolean,
    default: true
  },

  lastLogin: {
    type: Date
  }

}, { timestamps: true });



module.exports = mongoose.model("Admin", adminSchema);