const express = require("express");
const router = express.Router();

const upload = require("../config/multer"); 
const auth = require("../middlewares/auth.Middleware"); 

const { uploadAudio , getPublicAudios , getMyAudios , streamAudio , updateAudio , deleteAudio } = require("../controllers/audioController");

router.post("/", auth , upload.fields([{ name: "audio", maxCount: 1 } , { name: "cover", maxCount: 1 },]),uploadAudio);

router.get("/", getPublicAudios);
router.get("/mine", auth, getMyAudios);
router.get("/stream/:id", streamAudio);
router.put( "/:id", auth , upload.fields([{ name: "cover", maxCount: 1 }]) , updateAudio );

router.delete("/:id", auth, deleteAudio);

module.exports = router;
