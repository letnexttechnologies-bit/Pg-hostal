// models/PG.js
const mongoose = require("mongoose");

const pgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Co-living"],
      required: true,
    },
    stayType: {
      type: String,
      default: "PG",
    },
    sharingType: {
      type: String,
      default: "Multiple Options",
    },
    description: {
      type: String,
      default: "A comfortable and well-maintained PG accommodation.",
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    image: {
      type: String, // For backward compatibility
    },
    amenities: {
      type: [String],
      default: [],
    },
    rules: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    ownerName: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PG", pgSchema);