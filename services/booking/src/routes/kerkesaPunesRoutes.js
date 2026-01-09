const express = require('express');
const router = express.Router();
const kerkesaPunesController = require('../controllers/kerkesaPunesController');

/**
 * @swagger
 * /kerkesa-punes:
 *   post:
 *     summary: Create work request
 *     tags: [WorkRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', kerkesaPunesController.createKerkesaPunes);
/**
 * @swagger
 * /kerkesa-punes:
 *   get:
 *     summary: Get all work requests
 *     tags: [WorkRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests
 */
router.get('/', kerkesaPunesController.getAllKerkesaPunes);
/**
 * @swagger
 * /kerkesa-punes/{id}/approve:
 *   post:
 *     summary: Approve work request
 *     tags: [WorkRequests]
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
 *         description: Approved
 */
router.post('/:id/approve', kerkesaPunesController.approveKerkesaPunes);

/**
 * @swagger
 * /kerkesa-punes/{id}/deny:
 *   post:
 *     summary: Deny work request
 *     tags: [WorkRequests]
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
 *         description: Denied
 */
router.post('/:id/deny', kerkesaPunesController.denyKerkesaPunes);

/**
 * @swagger
 * /kerkesa-punes/{id}/assign-professional:
 *   post:
 *     summary: Assign professional
 *     tags: [WorkRequests]
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
 *         description: Assigned
 */
router.post('/:id/assign-professional', kerkesaPunesController.assignProfessional);

/**
 * @swagger
 * /kerkesa-punes/{id}/create-appointment:
 *   post:
 *     summary: Create appointment from request
 *     tags: [WorkRequests]
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
 *         description: Appointment created
 */
router.post('/:id/create-appointment', kerkesaPunesController.createAppointmentForRequest);

/**
 * @swagger
 * /kerkesa-punes/{id}:
 *   get:
 *     summary: Get request by ID
 *     tags: [WorkRequests]
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
 *         description: Details
 */
router.get('/:id', kerkesaPunesController.getKerkesaPunesById);

/**
 * @swagger
 * /kerkesa-punes/{id}:
 *   put:
 *     summary: Update request
 *     tags: [WorkRequests]
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
router.put('/:id', kerkesaPunesController.updateKerkesaPunes);

/**
 * @swagger
 * /kerkesa-punes/{id}:
 *   delete:
 *     summary: Delete request
 *     tags: [WorkRequests]
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
router.delete('/:id', kerkesaPunesController.deleteKerkesaPunes);

// Deny route must come before the :id route to be matched correctly
// This is handled above, but let's ensure it's properly ordered

module.exports = router;
