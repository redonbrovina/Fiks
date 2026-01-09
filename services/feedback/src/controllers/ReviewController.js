/**
 * Review Controller
 * Handles CRUD operations for reviews and professional responses
 */

const { Review, ReviewResponse } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new review
 */
const KafkaProducer = require('../services/KafkaProducer');

/**
 * Create a new review
 */
exports.createReview = async (req, res) => {
    try {
        const { score, mesazhi, profesionisti_id, perdoruesi_id, termini_id } = req.body;

        // Validate required fields
        if (!score || !profesionisti_id || !perdoruesi_id) {
            return res.status(400).json({
                error: { message: 'Score, profesionisti_id, and perdoruesi_id are required' }
            });
        }

        // Validate score range
        if (score < 1 || score > 5) {
            return res.status(400).json({
                error: { message: 'Score must be between 1 and 5' }
            });
        }

        // Check if user already reviewed this professional for the same appointment
        if (termini_id) {
            const existingReview = await Review.findOne({
                where: {
                    termini_id,
                    perdoruesi_id
                }
            });

            if (existingReview) {
                return res.status(409).json({
                    error: { message: 'You have already reviewed this appointment' }
                });
            }
        }

        const review = await Review.create({
            score,
            mesazhi: mesazhi || null,
            profesionisti_id,
            perdoruesi_id,
            termini_id: termini_id || null
        });

        console.log(`[REVIEW] Created review ID: ${review.review_id} for professional: ${profesionisti_id}`);

        // --- Calculate new average rating ---
        const allReviews = await Review.findAll({
            where: { profesionisti_id },
            attributes: ['score']
        });
        const totalScore = allReviews.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / allReviews.length;
        const roundedRating = Math.round(averageRating * 10) / 10;

        // --- Publish Event ---
        await KafkaProducer.publish('review_created', {
            profesionisti_id,
            rating: roundedRating,
            total_reviews: allReviews.length,
            review_id: review.review_id,
            score: review.score
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

/**
 * Get all reviews with optional filters
 */
exports.getAllReviews = async (req, res) => {
    try {
        const { profesionisti_id, perdoruesi_id } = req.query;
        const whereClause = {};

        if (profesionisti_id) {
            whereClause.profesionisti_id = parseInt(profesionisti_id);
        }

        if (perdoruesi_id) {
            whereClause.perdoruesi_id = parseInt(perdoruesi_id);
        }

        const reviews = await Review.findAll({
            where: whereClause,
            include: [{
                model: ReviewResponse,
                as: 'pergjigje'
            }],
            order: [['koha_krijimit', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

/**
 * Get review by ID
 */
exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id, {
            include: [{
                model: ReviewResponse,
                as: 'pergjigje'
            }]
        });

        if (!review) {
            return res.status(404).json({ error: { message: 'Review not found' } });
        }

        res.json(review);
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

/**
 * Get all reviews for a specific professional
 */
exports.getReviewsByProfessional = async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await Review.findAll({
            where: { profesionisti_id: parseInt(id) },
            include: [{
                model: ReviewResponse,
                as: 'pergjigje'
            }],
            order: [['koha_krijimit', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews for professional:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

/**
 * Get average rating for a professional
 */
exports.getAverageRating = async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await Review.findAll({
            where: { profesionisti_id: parseInt(id) },
            attributes: ['score']
        });

        if (reviews.length === 0) {
            return res.json({
                profesionisti_id: parseInt(id),
                average_rating: 0,
                total_reviews: 0
            });
        }

        const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
        const averageRating = totalScore / reviews.length;

        res.json({
            profesionisti_id: parseInt(id),
            average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            total_reviews: reviews.length
        });
    } catch (error) {
        console.error('Error calculating average rating:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

/**
 * Update a review (only by owner)
 */
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, mesazhi, perdoruesi_id } = req.body;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: { message: 'Review not found' } });
        }

        // Check ownership if perdoruesi_id is provided
        if (perdoruesi_id && review.perdoruesi_id !== parseInt(perdoruesi_id)) {
            return res.status(403).json({
                error: { message: 'You can only update your own reviews' }
            });
        }

        // Validate score if provided
        if (score && (score < 1 || score > 5)) {
            return res.status(400).json({
                error: { message: 'Score must be between 1 and 5' }
            });
        }

        await review.update({
            score: score || review.score,
            mesazhi: mesazhi !== undefined ? mesazhi : review.mesazhi
        });

        res.json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { perdoruesi_id, is_admin } = req.query;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: { message: 'Review not found' } });
        }

        // Check ownership unless admin
        if (!is_admin && perdoruesi_id && review.perdoruesi_id !== parseInt(perdoruesi_id)) {
            return res.status(403).json({
                error: { message: 'You can only delete your own reviews' }
            });
        }

        // Delete associated response first if exists
        if (review.review_response_id) {
            await ReviewResponse.destroy({
                where: { review_response_id: review.review_response_id }
            });
        }

        await review.destroy();

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

/**
 * Create a response to a review (by professional)
 */
exports.createReviewResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { mesazhi, profesionisti_id } = req.body;

        if (!mesazhi) {
            return res.status(400).json({
                error: { message: 'Response message is required' }
            });
        }

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: { message: 'Review not found' } });
        }

        // Verify the professional owns this review
        if (profesionisti_id && review.profesionisti_id !== parseInt(profesionisti_id)) {
            return res.status(403).json({
                error: { message: 'You can only respond to reviews for your profile' }
            });
        }

        // Check if already has a response
        if (review.review_response_id) {
            return res.status(409).json({
                error: { message: 'This review already has a response' }
            });
        }

        // Create the response
        const response = await ReviewResponse.create({
            mesazhi
        });

        // Link response to review
        await review.update({
            review_response_id: response.review_response_id
        });

        // Fetch updated review with response
        const updatedReview = await Review.findByPk(id, {
            include: [{
                model: ReviewResponse,
                as: 'pergjigje'
            }]
        });

        console.log(`[REVIEW] Professional ${profesionisti_id} responded to review ${id}`);

        res.status(201).json(updatedReview);
    } catch (error) {
        console.error('Error creating review response:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};
