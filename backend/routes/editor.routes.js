const express = require('express');
const router = express.Router();
const editorController = require('../controllers/editorController');

router.post('/crop', editorController.cropPhoto);
router.post('/rotate', editorController.rotatePhoto);
router.post('/adjust', editorController.adjustPhoto);
router.post('/filter', editorController.filterPhoto);
router.post('/apply', editorController.applyEdits);
router.post('/revert', editorController.revertEdits);

module.exports = router;
