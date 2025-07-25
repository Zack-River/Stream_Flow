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

    const safeProfileImg = 
      req.user.profileImg && req.user.profileImg !== 'No Profile Picture'
      ? req.user.profileImg
      : '/assets/images/default-profile.jpg';

    res.status(200).json({
      message: 'User profile fetched successfully.',
      user: {
        name: req.user.name,
        username: req.user.username,
        phone: req.user.phone,
        profileImg: safeProfileImg,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while fetching profile.' });
  }
};

exports.editProfile = async function (req, res) {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  console.log('editProfile originalUrl:', req.originalUrl);

  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.body.name && req.body.name.trim()) user.name = req.body.name.trim();
  if (req.body.username && req.body.username.trim()) user.username = req.body.username.trim();
  if (req.body.phone && req.body.phone.trim()) user.phone = req.body.phone.trim();

  if (req.file) {
    user.profileImg = `/uploads/profiles/${req.file.filename}`;
  }

  await user.save();

  res.status(200).json({
    message: 'Profile updated!',
    user: {
      name: user.name,
      username: user.username,
      phone: user.phone,
      profileImg: user.profileImg
    }
  });
};