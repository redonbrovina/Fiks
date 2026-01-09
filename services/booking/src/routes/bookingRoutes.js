const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profesionisti_id, shfrytezuesi_id, data_fillimit, data_mbarimit, totali]
 *             properties:
 *               profesionisti_id:
 *                 type: integer
 *               shfrytezuesi_id:
 *                 type: integer
 *               data_fillimit:
 *                 type: string
 *                 format: date-time
 *               data_mbarimit:
 *                 type: string
 *                 format: date-time
 *               totali:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', bookingController.createBooking);
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', bookingController.getAllBookings);
/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking details
 */
router.get('/:id', bookingController.getBookingById);
/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
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
 *         description: Booking updated
 */
router.put('/:id', bookingController.updateBooking);
/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete booking
 *     tags: [Bookings]
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
 *         description: Booking deleted
 */
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
