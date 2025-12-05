const express = require("express");
const router = express.Router();
const User = require("../models/netflixUser");
const AddedMovie = require("../models/addedMovie");
const deletedUser = require("../models/deletedUser");

router.get("/stats", async (req, res) => {
  try {
    // Users
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const notVerifiedUsers = await User.countDocuments({ isVerified: false });
    const delUser = await deletedUser.countDocuments();
    // Movies
    const totalMovies = await AddedMovie.countDocuments();

    // Get distinct categories dynamically
    const categories = await AddedMovie.distinct("category");
    const categoryCounts = {};

    for (let cat of categories) {
      const count = await AddedMovie.countDocuments({ category: { $regex: `^${cat}$`, $options: "i" } }); //to make case insensive to match both strings
      categoryCounts[cat] = count;
    }

    res.json({
      totalUsers,
      verifiedUsers,
      notVerifiedUsers,
    delUser,
      totalMovies,
      categories: categoryCounts, // {categoryCounts will show res like this- {popular: 5, toprated: 10, upcoming: 8} }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
