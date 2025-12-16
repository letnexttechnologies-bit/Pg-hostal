// routes/pgRoutes.js
const express = require("express");
const router = express.Router();
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

// Admin routes (you can add authentication middleware later)
router.post("/", createPG);
router.put("/:id", updatePG);
router.delete("/:id", deletePG);

module.exports = router;