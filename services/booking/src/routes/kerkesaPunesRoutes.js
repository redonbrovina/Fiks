const express = require('express');
const router = express.Router();
const kerkesaPunesController = require('../controllers/kerkesaPunesController');

router.post('/', kerkesaPunesController.createKerkesaPunes);
router.get('/', kerkesaPunesController.getAllKerkesaPunes);
router.get('/:id', kerkesaPunesController.getKerkesaPunesById);
router.put('/:id', kerkesaPunesController.updateKerkesaPunes);
router.delete('/:id', kerkesaPunesController.deleteKerkesaPunes);

module.exports = router;
