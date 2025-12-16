// controllers/pgController.js
const PG = require("../models/PG");

// Get all PGs
exports.getAllPGs = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { isActive: true };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }
    
    const pgs = await PG.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: pgs.length,
      pgs: pgs
    });
  } catch (error) {
    console.error("Error fetching PGs:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching PGs" 
    });
  }
};

// Get single PG by ID
exports.getPGById = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    
    if (!pg) {
      return res.status(404).json({ 
        success: false,
        message: "PG not found" 
      });
    }
    
    res.json({
      success: true,
      pg: pg
    });
  } catch (error) {
    console.error("Error fetching PG:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching PG details" 
    });
  }
};

// Create new PG (Admin only)
exports.createPG = async (req, res) => {
  try {
    const pgData = req.body;
    
    const pg = new PG(pgData);
    await pg.save();
    
    res.status(201).json({
      success: true,
      message: "PG created successfully",
      pg: pg
    });
  } catch (error) {
    console.error("Error creating PG:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating PG" 
    });
  }
};

// Update PG (Admin only)
exports.updatePG = async (req, res) => {
  try {
    const pg = await PG.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!pg) {
      return res.status(404).json({ 
        success: false,
        message: "PG not found" 
      });
    }
    
    res.json({
      success: true,
      message: "PG updated successfully",
      pg: pg
    });
  } catch (error) {
    console.error("Error updating PG:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating PG" 
    });
  }
};

// Delete PG (Admin only)
exports.deletePG = async (req, res) => {
  try {
    const pg = await PG.findByIdAndDelete(req.params.id);
    
    if (!pg) {
      return res.status(404).json({ 
        success: false,
        message: "PG not found" 
      });
    }
    
    res.json({
      success: true,
      message: "PG deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting PG:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting PG" 
    });
  }
};