const express = require("express");
const router = express.Router();

const { checkAuthenticated, authorizeRoles } = require("../middlewares/auth.Middleware");
const { GetAllAudios, adminDeleteAudio } = require("../controllers/audio.Controller");
const validateObjectId = require("../middlewares/validateObjectId");

// === Admin: Get ALL audios ===
router.get("/admin/audios", checkAuthenticated, authorizeRoles("admin"), GetAllAudios);

// === Admin: Delete any audio ===
router.delete("/admin/audio/:id", checkAuthenticated, authorizeRoles("admin"), validateObjectId, adminDeleteAudio);

module.exports = router;
