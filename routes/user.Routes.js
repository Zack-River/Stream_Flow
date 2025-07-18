const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.Controller')
const authController = require('../controllers/auth.Controller');
const {checkAuthenticated} = require('../middlewares/auth.Middleware');
const { registerValidator, loginValidator } = require('../validators/user.Validators');
const { validateRequest } = require('../middlewares/validate');
const upload = require('../middlewares/uploadProfileImg');
const path = require('path');
const jwtHelper = require('../utils/jwt');
const User = require('../models/user.Model');

//global routes
router.get('/force-new-token', async (req, res) => {
  const user = await User.findOne({ username: 'lzackriverl' }); // or however you find the user
  const refreshToken = jwtHelper.generateRefreshToken(user);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: false, // or true if using HTTPS
  });
  res.send({ message: 'New refresh token set!', refreshToken });
});

router.get('/register', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated) {
    return res.redirect('/');
  }
  return res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});
router.post('/register', upload.single('profileImg'), registerValidator ,validateRequest ,authController.register);
router.get('/login', checkAuthenticated, (req, res) => {
  if (req.isAuthenticated) {
    return res.redirect('/');
  }
  return res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/logout', authController.logout);

router.get('/profile' , checkAuthenticated, (req,res) => {
  return res.sendFile(path.join(__dirname, '..', 'public', 'profile.html'));
});

router.get('/settings' , checkAuthenticated, (req,res) => {
  return res.sendFile(path.join(__dirname, '..', 'public', 'edit-profile.html'));
});

router.get('/profile/data', checkAuthenticated, userController.showProfile);
router.put('/profile', upload.single('profileImg'), checkAuthenticated, userController.editProfile);
// user routes
router.get('/user/:username' , checkAuthenticated, userController.getUser);
// router.get('/profile' , checkAuthenticated, userController.showProfile);

module.exports = router;