const express = require("express");
const router = express.Router();
const AddedMovie = require("../models/addedMovie");

// POST /api/movies/add
router.post("/add", async (req, res) => {
  try {
    const { tmdbId } = req.body;

    // Check if movie already exists
    const existing = await AddedMovie.findOne({ tmdbId });
    if (existing) {
      return res.status(400).json({ message: "Movie already exists in the collection" });
    }

    const movie = new AddedMovie(req.body); // req.body must match schema
    await movie.save();
    res.json({ message: "Movie added successfully", movie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//userdashboard fetching movies here
router.get("/grouped", async (req, res) => {
  try {
    const movies = await AddedMovie.find({});

    
    const grouped = movies.reduce((acc, movie) => {
      const category = movie.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(movie);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Fetch all movies from DB for banner
router.get("/banner", async (req, res) => {
  try {
    const movies = await AddedMovie.find({}); 
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all movies
router.get("/deletemovies", async (req, res) => {
  try {
    const movies = await AddedMovie.find({});
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete movie by ID
router.delete("/:id", async (req, res) => {
  try {
    const movie = await AddedMovie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  const movies = await AddedMovie.find();
  res.json(movies);
});


module.exports = router;
