const mongoose = require("mongoose");

const DeletedUserSchema = new mongoose.Schema(
  {
    originalId: { type: String, required: true },
    name: String,
    email: String,
    plan: String,
    isVerified: Boolean,
    deletedAt: { type: Date, default: Date.now }
  },
  { collection: "deletedusers" }
);

module.exports = mongoose.model("DeletedUser", DeletedUserSchema);
