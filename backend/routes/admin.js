const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { registerValidator, createStoreValidator } = require('../middleware/validators');
const { validationResult } = require('express-validator');

// Middleware to handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// All routes protected: must be Admin
router.post('/admin/users', authenticateJWT, authorizeRoles('Admin'), registerValidator, handleValidationErrors, adminController.createUser);
router.post('/admin/stores', authenticateJWT, authorizeRoles('Admin'), createStoreValidator, handleValidationErrors, adminController.createStore);
router.get('/admin/dashboard', authenticateJWT, authorizeRoles('Admin'), adminController.dashboard);
router.get('/admin/users', authenticateJWT, authorizeRoles('Admin'), adminController.listUsers);
router.get('/admin/stores', authenticateJWT, authorizeRoles('Admin'), adminController.listStores);
router.put('/admin/users/:id', authenticateJWT, authorizeRoles('Admin'), adminController.updateUser);
router.delete('/admin/users/:id', authenticateJWT, authorizeRoles('Admin'), adminController.deleteUser);
router.put('/admin/stores/:id', authenticateJWT, authorizeRoles('Admin'), adminController.updateStore);
router.delete('/admin/stores/:id', authenticateJWT, authorizeRoles('Admin'), adminController.deleteStore);
router.post('/admin/update-password', authenticateJWT, authorizeRoles('Admin'), adminController.updatePassword);

module.exports = router; 