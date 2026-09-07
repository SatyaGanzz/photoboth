const express = require('express');
const router = express.Router();
const layoutController = require('../controllers/layoutController');

router.post('/generate', layoutController.generateLayout);
router.get('/preview', layoutController.getPreview);
router.post('/rearrange', layoutController.rearrangeLayout);

module.exports = router;
