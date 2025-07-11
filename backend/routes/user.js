const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/auth');
const { ratingValidator, updateRatingValidator } = require('../middleware/validators');
const { validationResult } = require('express-validator');
const { authorizeRoles } = require('../middleware/auth');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/stores', authenticateJWT, userController.getStores);
router.post('/ratings', authenticateJWT, ratingValidator, handleValidationErrors, userController.submitRating);
router.put('/ratings/:storeId', authenticateJWT, updateRatingValidator, handleValidationErrors, userController.updateRating);
router.get('/ratings/:storeId', authenticateJWT, userController.getUserStoreRating);
router.post('/user/update-password', authenticateJWT, authorizeRoles('User'), userController.updatePassword);

// Aliases to match frontend requests
router.post('/user/rate', authenticateJWT, ratingValidator, handleValidationErrors, userController.submitRating);
router.get('/user/rate/:storeId', authenticateJWT, userController.getUserStoreRating);

module.exports = router; 