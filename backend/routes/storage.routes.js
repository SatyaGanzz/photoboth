const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');

router.get('/list', storageController.listStorage);
router.post('/download', storageController.downloadArchive);
router.post('/export', storageController.exportSession);
router.delete('/cleanup', storageController.cleanup);

module.exports = router;
