const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const auth = require("../middlewares/auth.Middleware");

const {
  uploadAudio,
  getPublicAudios,
  getMyAudios,
  streamAudio,
  updateAudio,
  deleteAudio
} = require("../controllers/audioController");
const validateObjectId = require("../middlewares/validateObjectId");

// === Upload audio ===
router.post(
  "/audio",
  auth,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  uploadAudio
);

// === List all public audios ===
router.get("/", getPublicAudios);

// === List own audios ===
router.get("/mine", auth, getMyAudios);

// === Stream audio by ID ===
router.get("/stream/:id", streamAudio);

router.put("/:id", auth, validateObjectId , upload.fields([{ name: "cover", maxCount: 1 }]), updateAudio);
router.delete("/:id", auth, validateObjectId, deleteAudio);

module.exports = router;
