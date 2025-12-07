const express = require("express");
const auths = require("../middlewares/auths");
const WatchList = require("../models/watchList"); // <-- FIXED
const router = express.Router();

// Add to watchList
router.post("/add", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const movie = req.body;

    // Check duplicate
    const exists = await WatchList.findOne({ userId, tmdbId: movie.tmdbId }); // FIXED

    if (exists) {
      return res.status(400).json({ message: "Already in watchList" });
    }

    const newItem = new WatchList({ // FIXED
      userId,
      tmdbId: movie.tmdbId,
      title: movie.title,
      description: movie.description,
      rating: movie.rating,
      poster: movie.poster,
      category: movie.category
    });

    await newItem.save();
    res.json({ message: "Added to watchList", data: newItem });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove from watchList
router.delete("/remove/:tmdbId", auths, async (req, res) => {
  try {
    const userId = req.user.id;

    await WatchList.findOneAndDelete({ // FIXED
      userId,
      tmdbId: req.params.tmdbId
    });

    res.json({ message: "Removed from watchList" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's watchList
router.get("/my", auths, async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await WatchList.find({ userId }); // FIXED

    res.json(items);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
