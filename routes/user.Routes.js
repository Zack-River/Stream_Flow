const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.Controller')
const authController = require('../controllers/auth.Controller');
const {checkAuthenticated , authorizeRoles} = require('../middlewares/auth.Middleware');

// admin routes
router.get('/admin/users' , checkAuthenticated, authorizeRoles('admin'), userController.getUsers);
router.post('/admin/user' , checkAuthenticated, authorizeRoles('admin'), userController.createUser);
router.get('/admin/users/:username' , checkAuthenticated, authorizeRoles('admin'), userController.getUser);
router.put('/admin/users/:username' , checkAuthenticated, authorizeRoles('admin'), userController.updateUser);
router.delete('/admin/users/:username' , checkAuthenticated, authorizeRoles('admin'), userController.deleteUser);

// user routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.get('/profile', checkAuthenticated, authController.showProfile);
router.get('/:username' , checkAuthenticated, userController.getUser);

module.exports = router;