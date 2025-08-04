const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.Controller')
const {checkAuthenticated , authorizeRoles} = require('../middlewares/auth.Middleware');

// admin routes
router.post('/admin/user' , checkAuthenticated, authorizeRoles('admin'), adminController.createUser);
router.get('/admin/users' , checkAuthenticated, authorizeRoles('admin'), adminController.getUsers);
router.get('/admin/users/:username' , checkAuthenticated, authorizeRoles('admin'), adminController.getUser);
router.put('/admin/users/:username' , checkAuthenticated, authorizeRoles('admin'), adminController.updateUser);
router.delete('/admin/users/:username' , checkAuthenticated, authorizeRoles('admin'), adminController.deactivateUser);

module.exports = router;