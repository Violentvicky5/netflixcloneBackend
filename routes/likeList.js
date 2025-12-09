const express = require("express");
const auths = require("../middlewares/auths");
const LikeList = require("../models/likeList");
const router = express.Router();

//add to liked list
router.post("/add", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    let { tmdbId, title, description, rating, poster, category } = req.body;
    tmdbId = Number(tmdbId);
    if (!tmdbId) return res.status(400).json({ message: "tmdbId is required" });

    let list = await LikeList.findOne({ userId });

    // If no document - create one
    if (!list) {
      list = new LikeList({
        userId,
        movies: [{
          tmdbId,
          title,
          description,
          rating,
          poster,
          category,
          likelisted: true
        }]
      });

      await list.save();
      return res.json({ message: "Added to LikeList", data: list });
    }

    // Check duplicate movie
    const exists = list.movies.some(movie => movie.tmdbId === tmdbId);
    if (exists) return res.status(400).json({ message: "Already in LikeList" });

    // Push new movie
    list.movies.push({
      tmdbId,
      title,
      description,
      rating,
      poster,
      category,
      likelisted: true
    });

    await list.save();

    res.json({ message: "Movie added", data: list });

  } catch (err) {
    console.error("Add LikeList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//like-remove api
router.delete("/remove/:tmdbId", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const tmdbId = Number(req.params.tmdbId);

    const list = await LikeList.findOne({ userId });
    if (!list) return res.status(404).json({ message: "LikeList not found" });

    list.movies = list.movies.filter(movie => movie.tmdbId !== tmdbId);

    await list.save();
    res.json({ message: "Removed from LikeList" });

  } catch (err) {
    console.error("Remove LikeList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's likelist
router.get("/my", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await LikeList.findOne({ userId });

    res.json(list ? list.movies : []);
  } catch (err) {
    console.error("Get LikeList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if a movie is in likelist
router.get("/check/:tmdbId", auths, async (req, res) => {
  try {
    const userId = req.user.id;
    const tmdbId = Number(req.params.tmdbId);

    const list = await LikeList.findOne({ userId });

    if (!list) return res.json({ exists: false });

    const exists = list.movies.some(movie => movie.tmdbId === tmdbId);

    res.json({ exists });

  } catch (err) {
    console.error("Check LikeList Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
