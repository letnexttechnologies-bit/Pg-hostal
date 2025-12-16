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
    // Settings field for Settings page (NEW - ADD THIS)
    settings: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      marketingEmails: { type: Boolean, default: false },
      profileVisibility: { type: String, default: 'public' },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      twoFactorAuth: { type: Boolean, default: false }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);