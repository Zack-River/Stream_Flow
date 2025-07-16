const multer = require("multer");
const path = require("path");
const fs = require("fs");

const audioTypes = [".mp3", ".m4a"];
const imageTypes = [".jpg", ".jpeg", ".png"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user?._id?.toString() || "anonymous";
    let subFolder = "others";

    if (file.fieldname === "audio") {
      subFolder = `audio/user_${userId}`;
    } else if (file.fieldname === "covers") {
      subFolder = `covers/user_${userId}`;
    } else if (file.fieldname === "profiles") {
      subFolder = `profiles/user_${userId}`;
    }

    const folderPath = path.join("uploads", subFolder);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const fileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "audio" && audioTypes.includes(ext)) {
    cb(null, true);
  } else if ((file.fieldname === "covers" || file.fieldname === "profiles") && imageTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const limits = {
  fileSize: 50 * 1024 * 1024, // max 50MB per file
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;