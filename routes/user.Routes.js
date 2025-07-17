const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.Controller')
const authController = require('../controllers/auth.Controller');
const {checkAuthenticated} = require('../middlewares/auth.Middleware');
const { registerValidator, loginValidator } = require('../validators/user.Validators');
const { validateRequest } = require('../middlewares/validate');
const upload = require('../middlewares/uploadProfileImg');
const path = require('path');

//global routes
router.get('/login', checkAuthenticated , (req,res) => {
  if(req.user){
    res.redirect('/')
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});
router.post('/register', upload.single('profileImg'), registerValidator ,validateRequest ,authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);

// user routes
router.get('/:username' , checkAuthenticated, userController.getUser);
router.get('/profile' , checkAuthenticated, userController.showProfile);
router.put('/profile' , upload.single('profileImg'), checkAuthenticated, userController.editProfile);

module.exports = router;