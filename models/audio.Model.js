const mongoose = require("mongoose");
const User = require("./user.Model")
const audioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  coverImageUrl: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Audio = mongoose.model("Audio", audioSchema);

module.exports = Audio;
