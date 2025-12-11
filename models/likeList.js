const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true },
  title: String,
  description: String,
  rating: Number,
  poster: String,
  category: String,
  videoUrl: String,
  likelisted: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now },
});

const LikeListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  movies: [MovieSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LikeList", LikeListSchema);
