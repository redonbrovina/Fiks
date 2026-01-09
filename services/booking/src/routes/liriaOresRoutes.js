const express = require('express');
const router = express.Router();
const liriaOresController = require('../controllers/liriaOresController');

router.post('/', liriaOresController.createLiriaOres);
router.get('/:profesionisti_id/slots', liriaOresController.getAvailableSlots);
router.get('/:profesionisti_id', liriaOresController.getLiriaOresByProfesionistiId);
router.delete('/:id', liriaOresController.deleteLiriaOres);

module.exports = router;
