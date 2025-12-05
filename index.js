require("dotenv").config(); // Load .env

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const movieRoutes = require("./routes/movies");
const authRoutes = require("./routes/auth");
const adminStats =require("./routes/adminStats");
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (no /api prefix)
app.use("/", authRoutes);

//moviesmanagemnt
app.use("/api/movies", movieRoutes);
//adminstats
app.use("/api/admin", adminStats);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
