const express = require("express");
const router = express.Router();
const path = require('path');
const upload = require("../config/multer");
const { checkAuthenticated } = require("../middlewares/auth.Middleware");
const validateObjectId = require("../middlewares/validateObjectId");

const {
  uploadAudio,
  getPublicAudios,
  getMyAudios,
  streamAudio,
  updateAudio,
  deleteAudio
} = require("../controllers/audio.Controller");

// // Upload page (HTML)
// router.get('/upload', checkAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'public', 'upload-audio.html'));
// });

// ✅ Final upload route — matches your fetch
router.post(
  "/upload", // <-- correct path!
  checkAuthenticated,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  uploadAudio
);

// Other routes
router.get("/song/", getPublicAudios);
router.get("/mine", checkAuthenticated, getMyAudios);
router.get("/stream/:id", streamAudio);
router.put("/:id", checkAuthenticated, validateObjectId, upload.fields([{ name: "cover", maxCount: 1 }]), updateAudio);
router.delete("/:id", checkAuthenticated, validateObjectId, deleteAudio);

module.exports = router;