const path = require("path");
const fs = require("fs");
const Audio = require("../models/addio.Models"); // تأكد من اسم الملف الصحيح

// 1. POST /api/audio
const uploadAudio = async (req, res) => {
  try {
    const { title, genre, isPrivate } = req.body;

    if (!req.files || !req.files.audio || !req.files.cover) {
      return res.status(400).json({ message: "Audio and cover image are required." });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover[0];

    const newAudio = new Audio({
      title,
      genre,
      isPrivate: isPrivate === "true",
      audioUrl: `/uploads/${audioFile.filename}`,
      coverImageUrl: `/uploads/${coverFile.filename}`,
      uploadedBy: req.user._id,
    });

    await newAudio.save();
    res.status(201).json({ message: "Audio uploaded successfully.", audio: newAudio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while uploading audio." });
  }
};

// 2. GET /api/audio
const getPublicAudios = async (req, res) => {
  try {
    const audios = await Audio.find({ isPrivate: false }).populate("uploadedBy", "name email");
    res.json(audios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch public audios." });
  }
};

// 3. GET /api/audio/mine
const getMyAudios = async (req, res) => {
  try {
    const audios = await Audio.find({ uploadedBy: req.user._id });
    res.json(audios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch your audios." });
  }
};

// 4. GET /api/audio/stream/:id
const streamAudio = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: "Audio not found." });

    const filePath = path.join(__dirname, "..", audio.audioUrl);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const stream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mpeg",
      });

      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error streaming audio." });
  }
};

// 5. PUT /api/audio/:id
const updateAudio = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: "Audio not found." });

    if (audio.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own audios." });
    }

    const { title, genre, isPrivate } = req.body;
    if (title) audio.title = title;
    if (genre) audio.genre = genre;
    if (isPrivate !== undefined) audio.isPrivate = isPrivate === "true";

    if (req.files && req.files.cover) {
      const coverFile = req.files.cover[0];
      audio.coverImageUrl = `/uploads/${coverFile.filename}`;
    }

    await audio.save();
    res.json({ message: "Audio updated successfully.", audio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update audio." });
  }
};

// 6. DELETE /api/audio/:id
const deleteAudio = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: "Audio not found." });

    if (audio.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own audios." });
    }

    await audio.deleteOne();
    res.json({ message: "Audio deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete audio." });
  }
};

module.exports = {
  uploadAudio,
  getPublicAudios,
  getMyAudios,
  streamAudio,
  updateAudio,
  deleteAudio,
};
