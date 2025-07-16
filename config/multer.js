const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/audio'); // or split by type if you like
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

const audioUpload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'audio') {
      if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp4' || file.mimetype === 'audio/x-m4a') {
        cb(null, true);
      } else {
        cb(new Error('Only MP3 or M4A audio files are allowed!'));
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