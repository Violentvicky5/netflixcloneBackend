const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "Netflix User" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, default: "Basic" }, // Mobile, Basic, Standard, Premium
  token: { type: String },
  tokenExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

module.exports = mongoose.model("NetflixUser", userSchema);
