const path = require('path');
const fs = require('fs');
const Audio = require('../models/audio.Model');

// === Upload Audio ===
// === Upload Audio ===
exports.uploadAudio = async (req, res, next) => {
  try {
    const { title, genre, isPrivate, singer } = req.body;

    // Validate files exist
    if (!req.files?.audio?.length || !req.files?.cover?.length) {
      return res.status(400).json({ message: 'Audio and cover image are required.' });
    }

    if (!title || !genre) {
      return res.status(400).json({ message: 'Title and genre are required.' });
    }

    // ✅ Correct singer parsing
    let singerArray = [];

    if (Array.isArray(singer)) {
      singerArray = singer;
    } else if (typeof singer === 'string') {
      try {
        // Try JSON.parse first (handles '["A","B"]')
        const parsed = JSON.parse(singer);
        if (Array.isArray(parsed)) {
          singerArray = parsed;
        } else {
          singerArray = singer.split(',').map(s => s.trim()).filter(Boolean);
        }
      } catch {
        // If not JSON, fallback to comma-split
        singerArray = singer.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (!Array.isArray(singerArray) || singerArray.length === 0) {
      return res.status(400).json({ message: 'At least one singer is required.' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover[0];

    const audio = new Audio({
      title: title.trim(),
      genre: genre.trim(),
      isPrivate: isPrivate === 'true',
      singer: singerArray,
      audioUrl: `/uploads/audio/${audioFile.filename}`,
      coverImageUrl: `/uploads/audio/${coverFile.filename}`,
      uploadedBy: req.user._id,
    });

    await audio.save();
    res.status(201).json({ message: 'Audio uploaded successfully.', audio });
  } catch (err) {
    next(err);
  }
};

// === Get Public Audios ===
exports.getPublicAudios = async (req, res, next) => {
  try {
    const audios = await Audio.find({ isPrivate: false }).populate('uploadedBy', 'name email');
    res.json({ count: audios.length, audios });
  } catch (err) {
    next(err);
  }
};

// === Get My Audios ===
exports.getMyAudios = async (req, res, next) => {
  try {
    const audios = await Audio.find({ uploadedBy: req.user._id });
    res.json({ count: audios.length, audios });
  } catch (err) {
    next(err);
  }
};

// === Stream Audio ===
exports.streamAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: 'Audio not found.' });

    const filePath = path.join(__dirname, '..', audio.audioUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file missing on server.' });
    }

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : stat.size - 1;

      if (start >= stat.size) {
        return res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + stat.size);
      }

      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};

// === Update Audio ===
exports.updateAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: 'Audio not found.' });
    if (audio.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden. Not your audio.' });
    }

    const { title, genre, isPrivate, singer } = req.body;
    if (title) audio.title = title.trim();
    if (genre) audio.genre = genre.trim();
    if (isPrivate !== undefined) audio.isPrivate = isPrivate === 'true';
    if (singer) {
      const singers = JSON.parse(singer);
      if (Array.isArray(singers) && singers.length > 0) {
        audio.singer = singers;
      }
    }

    if (req.files?.cover?.length) {
      audio.coverImageUrl = `/uploads/audio/${req.files.cover[0].filename}`;
    }

    await audio.save();
    res.json({ message: 'Audio updated.', audio });
  } catch (err) {
    next(err);
  }
};

// === Delete Audio ===
exports.deleteAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: 'Audio not found.' });
    if (audio.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden. Not your audio.' });
    }

    await audio.deleteOne();
    res.json({ message: 'Audio deleted.' });
  } catch (err) {
    next(err);
  }
};

// === Admin Delete Audio ===
exports.adminDeleteAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: 'Audio not found.' });

    await audio.deleteOne();
    res.json({ message: 'Audio deleted by admin.' });
  } catch (err) {
    next(err);
  }
};

// === Admin Get All Audios ===
exports.adminGetAllAudios = async (req, res, next) => {
  try {
    const audios = await Audio.find().populate('uploadedBy', 'name email');
    res.json({ count: audios.length, audios });
  } catch (err) {
    next(err);
  }
};