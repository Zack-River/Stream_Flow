const User = require("../models/user.Model");
const jwt = require('jsonwebtoken');

exports.getUser = async function (req, res) {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ message: "username is required!" });
    }

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json({
      user,
      isOwner: req.user.username === username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.showProfile = function (req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated!' });
    }

    res.status(200).json({
      message: 'User profile fetched successfully.',
      user: {
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        phone: req.user.phone,
        profileImg: req.user.profileImg,
        role: req.user.role,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while fetching profile.' });
  }
};

exports.editProfile = async function (req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(400).json({ message: 'Invalid or Expired Token!' });
    }

    const payload = jwt.decode(token);
    const currentUsername = payload.username;

    if (!currentUsername) {
      return res.status(400).json({ message: 'Username is required!' });
    }

    const user = await User.findOne({ username: currentUsername });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const { name, username, phone } = req.body;

    if (name) user.name = name;
    if (username) user.username = username;
    if (phone) user.phone = phone;

    // Check if a file was uploaded by multer
    if (req.file) {
      user.profileImg = `/uploads/profiles/${req.file.filename}`;
    } else if (req.body.profileImg) {
      // Optional: if you also want to allow passing a URL
      user.profileImg = req.body.profileImg;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        profileImg: user.profileImg,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};