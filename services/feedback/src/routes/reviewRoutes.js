/**
 * Review Routes
 * API endpoints for review management
 */

const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');

// Get all reviews (with optional filters via query params)
/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/', ReviewController.getAllReviews);

// Get review by ID
/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review details
 */
router.get('/:id', ReviewController.getReviewById);

// Get all reviews for a specific professional
/**
 * @swagger
 * /reviews/professional/{id}:
 *   get:
 *     summary: Get reviews for professional
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/professional/:id', ReviewController.getReviewsByProfessional);

// Get average rating for a professional
/**
 * @swagger
 * /reviews/professional/{id}/rating:
 *   get:
 *     summary: Get average rating
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Average rating
 */
router.get('/professional/:id/rating', ReviewController.getAverageRating);

// Create a new review
/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profesionisti_id, shfrytezuesi_id, rating, komenti]
 *             properties:
 *               profesionisti_id:
 *                 type: integer
 *               shfrytezuesi_id:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               komenti:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/', ReviewController.createReview);

// Update a review
/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update review
 *     tags: [Reviews]
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
 *         description: Updated
 */
router.put('/:id', ReviewController.updateReview);

// Delete a review
/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
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
 *         description: Deleted
 */
router.delete('/:id', ReviewController.deleteReview);

// Create a response to a review (by professional)
/**
 * @swagger
 * /reviews/{id}/response:
 *   post:
 *     summary: Respond to review
 *     tags: [Reviews]
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
 *         description: Response added
 */
router.post('/:id/response', ReviewController.createReviewResponse);

module.exports = router;
