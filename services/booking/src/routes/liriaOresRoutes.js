const express = require('express');
const router = express.Router();
const liriaOresController = require('../controllers/liriaOresController');

/**
 * @swagger
 * /liria-ores:
 *   post:
 *     summary: Create Time Off / Availability
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', liriaOresController.createLiriaOres);
/**
 * @swagger
 * /liria-ores/{profesionisti_id}/slots:
 *   get:
 *     summary: Get available slots
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: profesionisti_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Slots
 */
router.get('/:profesionisti_id/slots', liriaOresController.getAvailableSlots);
/**
 * @swagger
 * /liria-ores/{profesionisti_id}:
 *   get:
 *     summary: Get time off by professional
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: profesionisti_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List
 */
router.get('/:profesionisti_id', liriaOresController.getLiriaOresByProfesionistiId);
/**
 * @swagger
 * /liria-ores/{id}:
 *   delete:
 *     summary: Delete time off
 *     tags: [Availability]
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
router.delete('/:id', liriaOresController.deleteLiriaOres);

module.exports = router;
