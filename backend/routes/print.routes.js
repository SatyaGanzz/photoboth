const express = require('express');
const router = express.Router();
const printerController = require('../controllers/printerController');

router.get('/printers', printerController.getPrinters);
router.get('/settings', printerController.getSettings);
router.post('/preview', printerController.previewPrint);
router.post('/send', printerController.sendToPrinter);
router.get('/status/:printJobId', printerController.getJobStatus);

module.exports = router;
