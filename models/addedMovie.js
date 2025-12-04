const mongoose = require("mongoose");

const addedMovieSchema = new mongoose.Schema({
  tmdbId: Number,
  title: String,
  description: String,
  rating: Number,
  poster: String,
  backdrop: String,
  category: String,
});

module.exports = mongoose.model("AddedMovie", addedMovieSchema);
