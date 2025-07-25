const mongoose = require("mongoose");

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
  singer: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'At least one singer is required.'
    }
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