const express = require('express');
const PerdoruesiController = require('../controllers/PerdoruesiController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/qytetet', PerdoruesiController.getQytetet);
router.get('/:id', PerdoruesiController.getById);

// Protected routes (require authentication)
router.get('/me', authMiddleware, PerdoruesiController.getMe);
router.put('/me', authMiddleware, PerdoruesiController.updateMe);
router.post('/me/professional', authMiddleware, PerdoruesiController.becomeProfessional);
router.put('/me/professional', authMiddleware, PerdoruesiController.updateProfessional);

module.exports = router;
