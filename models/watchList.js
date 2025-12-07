const mongoose =require("mongoose")

const WatchList = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tmdbId: { type: String, required: true },
  title: String,
  description: String,
  rating: Number,
  poster: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WatchList", WatchList);
