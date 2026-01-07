const express = require('express');
const profiliRoutes = require('./profiliRoutes');
const sherbimiRoutes = require('./sherbimiRoutes');

const router = express.Router();

// Mount routes
router.use('/api/v1/catalog', profiliRoutes);
router.use('/api/v1/catalog', sherbimiRoutes);

module.exports = router;
