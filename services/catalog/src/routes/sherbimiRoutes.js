const express = require('express');
const { body } = require('express-validator');
const {
    getProfessionalServices,
    getService,
    createService,
    updateService,
    deleteService,
    getCategories
} = require('../controllers/sherbimiController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const serviceValidation = [
    body('titulli').optional().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
    body('pershkrimi').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    body('kategoria_id').optional().isInt().withMessage('Category ID must be an integer'),
    body('cmimi').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('koha_punes').optional().isLength({ max: 50 }).withMessage('Work time must not exceed 50 characters')
];

const createServiceValidation = [
    body('titulli').notEmpty().withMessage('Title is required').isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
    body('profili_id').notEmpty().withMessage('Profile ID is required').isInt().withMessage('Profile ID must be an integer'),
    body('pershkrimi').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    body('kategoria_id').optional().isInt().withMessage('Category ID must be an integer'),
    body('cmimi').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('koha_punes').optional().isLength({ max: 50 }).withMessage('Work time must not exceed 50 characters')
];

// Public routes
router.get('/services/:serviceId', getService);
router.get('/categories', getCategories);

// Professional services (public view)
router.get('/professional/:profesionistiId/services', getProfessionalServices);

// Protected routes (require authentication)
router.post('/services', authenticateToken, createServiceValidation, createService);
router.put('/services/:serviceId', authenticateToken, serviceValidation, updateService);
router.delete('/services/:serviceId', authenticateToken, deleteService);

module.exports = router;
