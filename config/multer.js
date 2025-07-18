const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/audio');
  },
  filename: function (req, file, cb) {
    // If this is the first file, create a base name
    if (!req.uploadBaseName) {
      req.uploadBaseName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    }

    let ext = path.extname(file.originalname).toLowerCase();

    // Optional: force cover to always be .jpg
    if (file.fieldname === 'cover') {
      ext = '.jpg';
    }

    cb(null, `${req.uploadBaseName}${ext}`);
  }
});

const audioUpload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files allowed!'));
      }
    } else if (file.fieldname === 'cover') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files allowed for cover.'));
      }
    } else {
      cb(new Error('Invalid file field.'));
    }
  },
});

module.exports = audioUpload;