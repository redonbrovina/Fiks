/**
 * Review Routes
 * API endpoints for review management
 */

const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');

// Get all reviews (with optional filters via query params)
router.get('/', ReviewController.getAllReviews);

// Get review by ID
router.get('/:id', ReviewController.getReviewById);

// Get all reviews for a specific professional
router.get('/professional/:id', ReviewController.getReviewsByProfessional);

// Get average rating for a professional
router.get('/professional/:id/rating', ReviewController.getAverageRating);

// Create a new review
router.post('/', ReviewController.createReview);

// Update a review
router.put('/:id', ReviewController.updateReview);

// Delete a review
router.delete('/:id', ReviewController.deleteReview);

// Create a response to a review (by professional)
router.post('/:id/response', ReviewController.createReviewResponse);

module.exports = router;
