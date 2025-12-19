const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ===============================
   CORS CONFIG
   =============================== */
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // Local development
      "https://pg-hostel.netlify.app"   // Netlify production
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ===============================
   BODY PARSERS
   =============================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ===============================
   REQUEST LOGGING
   =============================== */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Log Authorization header (for debugging)
  if (req.header('Authorization')) {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log('📨 Auth header present:', token.substring(0, 20) + '...');
  }
  
  next();
});

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
  res.status(200).json({
    success: true,
    message: "PG Hostel Backend API is running successfully 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      pgs: "/api/pgs",
      wishlist: "/api/wishlist",
      profile: "/api/profile"
    }
  });
});

/* ===============================
   HEALTH CHECK
   =============================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    jwtSecret: process.env.JWT_SECRET ? "SET ✅" : "MISSING ❌"
  });
});

/* ===============================
   API ROUTES
   =============================== */
app.use("/api/auth", authRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);

/* ===============================
   404 HANDLER
   =============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

/* ===============================
   GLOBAL ERROR HANDLER
   =============================== */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry found",
      field: Object.keys(err.keyPattern)[0]
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ===============================
   DATABASE + SERVER START
   =============================== */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'SET ✅' : 'MISSING ❌'}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
      console.log(`📍 API Docs: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ===============================
   PROCESS SAFETY
   =============================== */
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Closing MongoDB...");
  mongoose.connection.close(() => {
    console.log("✅ MongoDB closed");
    process.exit(0);
  });
});