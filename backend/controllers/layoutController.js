const localStorage = require('../services/storage/local.storage');
const imageProcessor = require('../services/image/image.processor');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

exports.generateLayout = async (req, res, next) => {
  try {
    const {
      sessionId = 'default_session',
      photoIds = [],
      template = '3x1',
      padding = 16,
      backgroundColor = '#FFFFFF'
    } = req.body;

    if (!photoIds.length) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        error: { message: 'Must provide at least 1 photo for layout generation' }
      });
    }

    const photoPaths = [];
    photoIds.forEach((id) => {
      const p = localStorage.getPhoto(id);
      if (p && p.filepath) photoPaths.push(p.filepath);
    });

    const layoutId = `layout_${Date.now()}_${uuidv4().substring(0, 6)}`;
    const filename = `${layoutId}.jpg`;
    const outputPath = path.join(__dirname, '../../photos', sessionId, filename);

    await imageProcessor.generate3x1Layout(photoPaths, outputPath, {
      padding: parseInt(padding, 10) || 16,
      backgroundColor
    });

    const layoutRecord = {
      layoutId,
      sessionId,
      photoIds,
      template,
      padding,
      backgroundColor,
      url: `/photos/${sessionId}/${filename}`,
      preview: `/photos/${sessionId}/${filename}`,
      generatedAt: new Date().toISOString(),
      metadata: {
        width: 1800,
        height: 600,
        format: 'jpg'
      }
    };

    localStorage.saveLayout(layoutRecord);

    res.json({
      status: 'success',
      code: 200,
      data: layoutRecord
    });
  } catch (err) {
    next(err);
  }
};

exports.getPreview = (req, res, next) => {
  try {
    const { layoutId } = req.query;
    const layout = localStorage.getLayout(layoutId);
    if (!layout) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        error: { message: 'Layout not found' }
      });
    }
    res.json({
      status: 'success',
      code: 200,
      data: layout
    });
  } catch (err) {
    next(err);
  }
};

exports.rearrangeLayout = async (req, res, next) => {
  try {
    const { layoutId, photoIds = [] } = req.body;
    const existing = localStorage.getLayout(layoutId);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        error: { message: 'Layout not found' }
      });
    }

    const photoPaths = [];
    photoIds.forEach((id) => {
      const p = localStorage.getPhoto(id);
      if (p && p.filepath) photoPaths.push(p.filepath);
    });

    const outputPath = path.join(
      __dirname,
      '../../photos',
      existing.sessionId,
      `${layoutId}.jpg`
    );

    await imageProcessor.generate3x1Layout(photoPaths, outputPath, {
      padding: existing.padding || 16,
      backgroundColor: existing.backgroundColor || '#FFFFFF'
    });

    existing.photoIds = photoIds;
    existing.url = `/photos/${existing.sessionId}/${layoutId}.jpg?t=${Date.now()}`;
    existing.preview = existing.url;
    localStorage.saveLayout(existing);

    res.json({
      status: 'success',
      code: 200,
      data: existing
    });
  } catch (err) {
    next(err);
  }
};
