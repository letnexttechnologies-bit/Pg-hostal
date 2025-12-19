// routes/pgRoutes.js
const express = require("express");
const router = express.Router();

// Import controller functions (NOT the model directly)
const {
  getAllPGs,
  getPGById,
  createPG,
  updatePG,
  deletePG
} = require("../controllers/pgController");

// Public routes
router.get("/", getAllPGs);
router.get("/:id", getPGById);

// Admin routes (add auth middleware when needed)
router.post("/", createPG);
router.put("/:id", updatePG);
router.delete("/:id", deletePG);

module.exports = router;