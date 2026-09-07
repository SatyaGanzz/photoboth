const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');

router.post('/capture', cameraController.capturePhoto);
router.get('/status', cameraController.getStatus);
router.post('/settings', cameraController.updateSettings);

module.exports = router;
