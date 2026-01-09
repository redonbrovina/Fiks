const express = require('express');
const profiliRoutes = require('./profiliRoutes');
const sherbimiRoutes = require('./sherbimiRoutes');
const pervojaRoutes = require('./pervojaRoutes');

const router = express.Router();

// Mount routes
router.use('/api/v1/catalog', profiliRoutes);
router.use('/api/v1/catalog', sherbimiRoutes);
router.use('/api/v1/catalog', pervojaRoutes);

module.exports = router;

