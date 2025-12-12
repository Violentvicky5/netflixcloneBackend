const express = require("express");
const auths = require("../middlewares/auths");
const WatchList = require("../models/watchList");
const router = express.Router();

// Add to watchlist
router.post("/add", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tmdbId, title, description, rating, poster, category, videoUrl } = req.body;

    if (!tmdbId) return res.status(400).json({ message: "tmdbId is required" });

    let list = await WatchList.findOne({ userId });

    // If no document - create one
    if (!list) {
      list = new WatchList({
        userId,
        movies: [{
          tmdbId,
          title,
          description,
          rating,
          poster,
          category,
          videoUrl,
          watchlisted: true
        }]
      });

      await list.save();
      return res.json({ message: "Added to watchlist", data: list });
    }

    // Check duplicate movie
    const exists = list.movies.some(movie => movie.tmdbId === tmdbId);
    if (exists) return res.status(400).json({ message: "Already in watchlist" });

    // Push new movie
    list.movies.push({
      tmdbId,
      title,
      description,
      rating,
      poster,
      category,
      videoUrl,
      watchlisted: true
    });

    await list.save();

    res.json({ message: "Movie added", data: list });

  } catch (err) {
    console.error("Add WatchList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Remove from watchlist
router.delete("/remove/:tmdbId", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const tmdbId = Number(req.params.tmdbId);

    const list = await WatchList.findOne({ userId });
    if (!list) return res.status(404).json({ message: "Watchlist not found" });

    list.movies = list.movies.filter(movie => movie.tmdbId !== tmdbId);

    await list.save();
    res.json({ message: "Removed from watchlist" });

  } catch (err) {
    console.error("Remove WatchList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's watchlist
router.get("/my", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await WatchList.findOne({ userId });

    res.json(list ? list.movies : []);
  } catch (err) {
    console.error("Get WatchList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if a movie is in watchlist
router.get("/check/:tmdbId", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const tmdbId = Number(req.params.tmdbId);

    const list = await WatchList.findOne({ userId });

    if (!list) return res.json({ exists: false });

    const exists = list.movies.some(movie => movie.tmdbId === tmdbId);

    res.json({ exists });

  } catch (err) {
    console.error("Check WatchList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
