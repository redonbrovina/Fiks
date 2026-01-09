const express = require('express');
const { body } = require('express-validator');
const {
    getAllProfiles,
    getProfile,
    updateProfile,
    updateProfileById,
    createProfile,
    deleteProfile,
    deleteProfileById,
    uploadProfileImage,
    serveUploads
} = require('../controllers/profiliController');
const { authenticateToken, authorizeProfileAccess, adminAuth } = require('../middleware/auth');
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
    body('profesionisti_id').notEmpty().withMessage('Professional ID is required'),
    body('nr_telefonit').optional().isLength({ min: 9, max: 20 }).withMessage('Phone number must be between 9 and 20 characters'),
    body('imazh').optional().isURL().withMessage('Image must be a valid URL')
];

// Admin routes (require admin role)
/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Get all profiles (Admin only)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of profiles
 */
router.get('/profiles', authenticateToken, adminAuth, getAllProfiles);
/**
 * @swagger
 * /profiles/{id}:
 *   put:
 *     summary: Update profile by ID (Admin only)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profiles/:id', authenticateToken, adminAuth, profileValidation, updateProfileById);
/**
 * @swagger
 * /profiles/{id}:
 *   delete:
 *     summary: Delete profile by ID (Admin only)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router.delete('/profiles/:id', authenticateToken, adminAuth, deleteProfileById);

// Routes
// Public route for getting profile (can be accessed without authentication)
/**
 * @swagger
 * /profile/{profesionistiId}:
 *   get:
 *     summary: Get professional profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: profesionistiId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Professional ID
 *     responses:
 *       200:
 *         description: Profile details
 *       404:
 *         description: Profile not found
 */
router.get('/profile/:profesionistiId', getProfile);

// Protected routes (require authentication)
/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Create a new professional profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emri, email, profesionisti_id]
 *             properties:
 *               emri:
 *                 type: string
 *               email:
 *                 type: string
 *               profesionisti_id:
 *                 type: integer
 *               nr_telefonit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profile created
 */
router.post('/profile', authenticateToken, createProfileValidation, createProfile);
/**
 * @swagger
 * /profile/{profesionistiId}:
 *   put:
 *     summary: Update own profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profesionistiId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emri:
 *                 type: string
 *               nr_telefonit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile/:profesionistiId', authenticateToken, authorizeProfileAccess, profileValidation, updateProfile);
/**
 * @swagger
 * /profile/{profesionistiId}:
 *   delete:
 *     summary: Delete own profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profesionistiId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router.delete('/profile/:profesionistiId', authenticateToken, authorizeProfileAccess, deleteProfile);

// Upload profile image
/**
 * @swagger
 * /profile/{profesionistiId}/upload-image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: profesionistiId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: formData
 *         name: image
 *         type: file
 *         description: The file to upload.
 *     responses:
 *       200:
 *         description: Image uploaded
 */
router.post('/profile/:profesionistiId/upload-image', authenticateToken, authorizeProfileAccess, upload.single('image'), uploadProfileImage);

// Serve uploaded files
router.get('/uploads/:path(*)', serveUploads);

module.exports = router;
