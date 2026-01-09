const express = require('express');
const router = express.Router();
const kerkesaPunesController = require('../controllers/kerkesaPunesController');

router.post('/', kerkesaPunesController.createKerkesaPunes);
router.get('/', kerkesaPunesController.getAllKerkesaPunes);
router.post('/:id/approve', kerkesaPunesController.approveKerkesaPunes);
router.post('/:id/deny', kerkesaPunesController.denyKerkesaPunes);
router.post('/:id/assign-professional', kerkesaPunesController.assignProfessional);
router.post('/:id/create-appointment', kerkesaPunesController.createAppointmentForRequest);
router.get('/:id', kerkesaPunesController.getKerkesaPunesById);
router.put('/:id', kerkesaPunesController.updateKerkesaPunes);
router.delete('/:id', kerkesaPunesController.deleteKerkesaPunes);

// Deny route must come before the :id route to be matched correctly
// This is handled above, but let's ensure it's properly ordered

module.exports = router;
