const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
  tokenExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

module.exports = mongoose.model("NetflixUser", userSchema);
