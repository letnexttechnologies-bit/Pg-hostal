const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware - CORS should be configured ONCE at the top
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

// Increase payload limit for image uploads (ADD THESE LINES)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const pgRoutes = require("./routes/pgRoutes");
const wishlistRoutes = require('./routes/wishlist');
const profileRoutes = require('./routes/profile'); 

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// API routes - All routes should be defined BEFORE MongoDB connection
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pgs", pgRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api', profileRoutes);

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });