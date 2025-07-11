const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/owner/ratings', authenticateJWT, authorizeRoles('Owner'), ownerController.getStoreRatings);
router.get('/owner/average', authenticateJWT, authorizeRoles('Owner'), ownerController.getAverageRating);
router.get('/owner/store', authenticateJWT, authorizeRoles('Owner'), ownerController.getMyStore);
router.post('/owner/update-password', authenticateJWT, authorizeRoles('Owner'), ownerController.updatePassword);

module.exports = router; 