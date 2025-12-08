const mongoose = require("mongoose");

const LikedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likedMovies: [
    {
      tmdbId: { type: Number, required: true },
      title: String,
      poster: String,
      rating: Number,
      category: String,
      description: String,
      isLiked: { type: Boolean, default: true }, // Track if liked
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

// Optional: Prevent duplicate tmdbId per user
LikedSchema.index({ userId: 1, "likedMovies.tmdbId": 1 }, { unique: true });

module.exports = mongoose.model("Liked", LikedSchema);
