const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ===============================
   CORS CONFIG (FIXED)
   =============================== */
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // Local development
      "https://pg-hostel.netlify.app"   // Netlify production
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ===============================
   BODY PARSERS
   =============================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ===============================
   ROUTES
   =============================== */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const pgRoutes = require("./routes/pgRoutes");
const wishlistRoutes = require("./routes/wishlist");
const profileRoutes = require("./routes/profile");

/* ===============================
   TEST ROUTE
   =============================== */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running successfully 🚀");
});

/* ===============================
   API ROUTES
   =============================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", profileRoutes);

/* ===============================
   DATABASE + SERVER START
   =============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
