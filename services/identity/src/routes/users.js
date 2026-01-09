const express = require('express');
const PerdoruesiController = require('../controllers/PerdoruesiController');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
/**
 * @swagger
 * /users/qytetet:
 *   get:
 *     summary: Get all cities (Public)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get('/qytetet', PerdoruesiController.getQytetet);

// Admin routes (require admin role)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authMiddleware, adminMiddleware, PerdoruesiController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
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
 *         description: User updated
 */
router.put('/:id', authMiddleware, adminMiddleware, PerdoruesiController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
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
 *         description: User deleted
 */
router.delete('/:id', authMiddleware, adminMiddleware, PerdoruesiController.deleteUser);

// Protected routes (require authentication)
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My profile
 */
router.get('/me', authMiddleware, PerdoruesiController.getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emri:
 *                 type: string
 *               adresa:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/me', authMiddleware, PerdoruesiController.updateMe);

/**
 * @swagger
 * /users/me/professional:
 *   post:
 *     summary: Become a professional
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Professional profile created
 */
router.post('/me/professional', authMiddleware, PerdoruesiController.becomeProfessional);

/**
 * @swagger
 * /users/me/professional:
 *   put:
 *     summary: Update professional details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Professional profile updated
 */
router.put('/me/professional', authMiddleware, PerdoruesiController.updateProfessional);

// Public user lookup (must be after /me to avoid conflict)
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', PerdoruesiController.getById);

module.exports = router;
