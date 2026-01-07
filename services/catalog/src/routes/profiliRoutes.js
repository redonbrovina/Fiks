const express = require('express');
const { body } = require('express-validator');
const {
    getProfile,
    updateProfile,
    createProfile,
    deleteProfile,
    uploadProfileImage,
    serveUploads
} = require('../controllers/profiliController');
const { authenticateToken, authorizeProfileAccess } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const profileValidation = [
    body('emri').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('nr_telefonit').optional().isLength({ min: 9, max: 20 }).withMessage('Phone number must be between 9 and 20 characters'),
    body('imazh').optional().isURL().withMessage('Image must be a valid URL')
];

const createProfileValidation = [
    body('emri').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email'),
    body('profesionisti_id').notEmpty().withMessage('Professional ID is required').isUUID().withMessage('Professional ID must be a valid UUID'),
    body('nr_telefonit').optional().isLength({ min: 9, max: 20 }).withMessage('Phone number must be between 9 and 20 characters'),
    body('imazh').optional().isURL().withMessage('Image must be a valid URL')
];

// Routes
// Public route for getting profile (can be accessed without authentication)
router.get('/profile/:profesionistiId', getProfile);

// Protected routes (require authentication)
router.post('/profile', authenticateToken, createProfileValidation, createProfile);
router.put('/profile/:profesionistiId', authenticateToken, authorizeProfileAccess, profileValidation, updateProfile);
router.delete('/profile/:profesionistiId', authenticateToken, authorizeProfileAccess, deleteProfile);

// Upload profile image
router.post('/profile/:profesionistiId/upload-image', authenticateToken, authorizeProfileAccess, upload.single('image'), uploadProfileImage);

// Serve uploaded files
router.get('/uploads/:path(*)', serveUploads);

module.exports = router;
