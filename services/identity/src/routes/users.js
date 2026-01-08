const express = require('express');
const PerdoruesiController = require('../controllers/PerdoruesiController');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/qytetet', PerdoruesiController.getQytetet);

// Admin routes (require admin role)
router.get('/', authMiddleware, adminMiddleware, PerdoruesiController.getAllUsers);
router.put('/:id', authMiddleware, adminMiddleware, PerdoruesiController.updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, PerdoruesiController.deleteUser);

// Protected routes (require authentication)
router.get('/me', authMiddleware, PerdoruesiController.getMe);
router.put('/me', authMiddleware, PerdoruesiController.updateMe);
router.post('/me/professional', authMiddleware, PerdoruesiController.becomeProfessional);
router.put('/me/professional', authMiddleware, PerdoruesiController.updateProfessional);

// Public user lookup (must be after /me to avoid conflict)
router.get('/:id', PerdoruesiController.getById);

module.exports = router;
