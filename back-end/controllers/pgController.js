// controllers/pgController.js
const PG = require("../models/PG");

// ===============================
// @desc    Get all PGs with optional filters
// @route   GET /api/pgs
// @access  Public
// ===============================
exports.getAllPGs = async (req, res) => {
  try {
    const { search, gender, minPrice, maxPrice, sharingType, stayType } = req.query;
    
    console.log("📥 GET /api/pgs - Query params:", req.query);
    
    // Build query object
    let query = { isActive: true };
    
    // Search by name, location, or address
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }
    
    // Filter by gender
    if (gender && gender !== "all") {
      query.gender = gender;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Filter by sharing type
    if (sharingType && sharingType !== "all") {
      query.sharingType = sharingType;
    }
    
    // Filter by stay type
    if (stayType && stayType !== "all") {
      query.stayType = stayType;
    }
    
    console.log("🔍 MongoDB Query:", JSON.stringify(query, null, 2));
    
    // Execute query
    const pgs = await PG.find(query).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${pgs.length} PGs`);
    
    res.status(200).json({
      success: true,
      count: pgs.length,
      data: pgs
    });
  } catch (error) {
    console.error("❌ Error in getAllPGs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching PGs",
      error: error.message
    });
  }
};

// ===============================
// @desc    Get single PG by ID
// @route   GET /api/pgs/:id
// @access  Public
// ===============================
exports.getPGById = async (req, res) => {
  try {
    console.log(`📥 GET /api/pgs/${req.params.id}`);
    
    const pg = await PG.findById(req.params.id);
    
    if (!pg) {
      console.log(`❌ PG not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "PG not found"
      });
    }
    
    console.log(`✅ Found PG: ${pg.name}`);
    
    res.status(200).json({
      success: true,
      data: pg
    });
  } catch (error) {
    console.error("❌ Error in getPGById:", error);
    
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid PG ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error fetching PG",
      error: error.message
    });
  }
};

// ===============================
// @desc    Create new PG
// @route   POST /api/pgs
// @access  Private/Admin
// ===============================
exports.createPG = async (req, res) => {
  try {
    console.log("📥 POST /api/pgs - Creating new PG");
    console.log("Body:", req.body);
    
    const pg = await PG.create(req.body);
    
    console.log(`✅ Created PG: ${pg.name}`);
    
    res.status(201).json({
      success: true,
      message: "PG created successfully",
      data: pg
    });
  } catch (error) {
    console.error("❌ Error in createPG:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }
    
    res.status(400).json({
      success: false,
      message: "Error creating PG",
      error: error.message
    });
  }
};

// ===============================
// @desc    Update PG
// @route   PUT /api/pgs/:id
// @access  Private/Admin
// ===============================
exports.updatePG = async (req, res) => {
  try {
    console.log(`📥 PUT /api/pgs/${req.params.id}`);
    console.log("Body:", req.body);
    
    const pg = await PG.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!pg) {
      console.log(`❌ PG not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "PG not found"
      });
    }
    
    console.log(`✅ Updated PG: ${pg.name}`);
    
    res.status(200).json({
      success: true,
      message: "PG updated successfully",
      data: pg
    });
  } catch (error) {
    console.error("❌ Error in updatePG:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }
    
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid PG ID format"
      });
    }
    
    res.status(400).json({
      success: false,
      message: "Error updating PG",
      error: error.message
    });
  }
};

// ===============================
// @desc    Delete PG
// @route   DELETE /api/pgs/:id
// @access  Private/Admin
// ===============================
exports.deletePG = async (req, res) => {
  try {
    console.log(`📥 DELETE /api/pgs/${req.params.id}`);
    
    const pg = await PG.findByIdAndDelete(req.params.id);
    
    if (!pg) {
      console.log(`❌ PG not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "PG not found"
      });
    }
    
    console.log(`✅ Deleted PG: ${pg.name}`);
    
    res.status(200).json({
      success: true,
      message: "PG deleted successfully",
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error("❌ Error in deletePG:", error);
    
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Invalid PG ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error deleting PG",
      error: error.message
    });
  }
};