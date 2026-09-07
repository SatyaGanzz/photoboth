const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');

router.post('/auth', driveController.auth);
router.post('/upload', driveController.upload);
router.get('/status', driveController.getStatus);
router.post('/disconnect', driveController.disconnect);

module.exports = router;
