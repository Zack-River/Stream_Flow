const express = require("express");
const router = express.Router();

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

router.post(
  "/audio",
  checkAuthenticated,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  uploadAudio
);

router.get("/", getPublicAudios);
router.get("/mine", checkAuthenticated, getMyAudios);
router.get("/stream/:id", streamAudio);

router.put("/:id", checkAuthenticated, validateObjectId, upload.fields([{ name: "cover", maxCount: 1 }]), updateAudio);
router.delete("/:id", checkAuthenticated, validateObjectId, deleteAudio);

module.exports = router;
