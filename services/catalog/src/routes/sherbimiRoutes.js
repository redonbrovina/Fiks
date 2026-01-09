const express = require('express');
const { body } = require('express-validator');
const {
    getProfessionalServices,
    getService,
    createService,
    updateService,
    deleteService,
    getCategories,
    getAllServices
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
    body('pershkrimi').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    body('kategoria_id').optional().isInt().withMessage('Category ID must be an integer'),
    body('cmimi').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('koha_punes').optional().isLength({ max: 50 }).withMessage('Work time must not exceed 50 characters')
];

// Public routes
/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/services', getAllServices);
/**
 * @swagger
 * /services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service details
 */
router.get('/services/:serviceId', getService);
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Generic]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', getCategories);

// Professional services (public view)
/**
 * @swagger
 * /professional/{profesionistiId}/services:
 *   get:
 *     summary: Get services for a professional
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: profesionistiId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/professional/:profesionistiId/services', getProfessionalServices);

// Protected routes (require authentication)
/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulli]
 *             properties:
 *               titulli:
 *                 type: string
 *               cmimi:
 *                 type: number
 *     responses:
 *       201:
 *         description: Service created
 */
router.post('/services', authenticateToken, createServiceValidation, createService);
/**
 * @swagger
 * /services/{serviceId}:
 *   put:
 *     summary: Update service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service updated
 */
router.put('/services/:serviceId', authenticateToken, serviceValidation, updateService);
/**
 * @swagger
 * /services/{serviceId}:
 *   delete:
 *     summary: Delete service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service deleted
 */
router.delete('/services/:serviceId', authenticateToken, deleteService);

module.exports = router;
