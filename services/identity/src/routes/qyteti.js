const express = require('express');
const { Qyteti } = require('../models');

const router = express.Router();

/**
 * GET /api/qytetet
 * Returns all cities for dropdown selection
 */
router.get('/', async (req, res, next) => {
    try {
        const cities = await Qyteti.findAll({
            order: [['emri', 'ASC']]
        });
        res.json(cities);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
