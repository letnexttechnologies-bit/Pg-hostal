// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // ADD THESE NEW FIELDS FOR PROFILE
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: String,
    },
    gender: {
      type: String,
      // enum: ["Male", "Female", "Other", ""],
    },
    occupation: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String, // Base64 encoded image string
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PG",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);