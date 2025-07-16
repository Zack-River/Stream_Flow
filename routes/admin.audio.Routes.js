const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.Middleware");
const { adminGetAllAudios, adminDeleteAudio } = require("../controllers/audioController");

// Middleware to check JWT + admin role
const { authorizeRoles } = require("../middlewares/auth.Middleware");
const validateObjectId = require("../middlewares/validateObjectId");

// === Admin: Get ALL audios ===
router.get("/admin/audios", auth, authorizeRoles("admin"), adminGetAllAudios);

// === Admin: Delete any audio ===
router.delete("/admin/audio/:id", auth, authorizeRoles("admin"), validateObjectId ,adminDeleteAudio);

module.exports = router;