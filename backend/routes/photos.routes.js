const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');

router.get('/', photoController.getPhotos);
router.get('/:photoId', photoController.getPhoto);
router.post('/select', photoController.selectPhotos);
router.delete('/:photoId', photoController.deletePhoto);
router.post('/delete-batch', photoController.deleteBatch);

module.exports = router;
