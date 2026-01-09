const express = require('express');
const { body } = require('express-validator');
const {
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience
} = require('../controllers/pervojaController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const experienceValidation = [
    body('pozicioni').notEmpty().withMessage('Position is required').isLength({ max: 200 }).withMessage('Position must be at most 200 characters'),
    body('data_fillimit').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid date format'),
    body('data_mbarimit').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    body('roli').optional().isLength({ max: 200 }).withMessage('Role must be at most 200 characters'),
    body('pershkrimi').optional()
];

const createExperienceValidation = [
    body('profesionisti_id').notEmpty().withMessage('Professional ID is required'),
    ...experienceValidation
];

// Routes
// Public route for getting experiences
router.get('/experience/:profesionistiId', getExperiences);

// Protected routes (require authentication)
router.post('/experience', authenticateToken, createExperienceValidation, createExperience);
router.put('/experience/:id', authenticateToken, experienceValidation, updateExperience);
router.delete('/experience/:id', authenticateToken, deleteExperience);

module.exports = router;
