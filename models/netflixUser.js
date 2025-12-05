const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, default: "Netflix User" },
  name: { type: String, required: true, default: "Netflix User" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
plan: {
  name: { type: String, default: null },
  price: { type: Number, default: null },
  quality: { type: String, default: null },
  start: { type: Date, default: null },
  expiry: { type: Date, default: null }
},
  token: { type: String },
  tokenExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

});

module.exports = mongoose.model("NetflixUser", userSchema);
