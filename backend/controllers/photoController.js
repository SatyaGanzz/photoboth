const localStorage = require('../services/storage/local.storage');

exports.getPhotos = (req, res, next) => {
  try {
    const { sessionId, limit = 50, offset = 0 } = req.query;
    const result = localStorage.getPhotos(sessionId, parseInt(limit, 10), parseInt(offset, 10));
    res.json({
      status: 'success',
      code: 200,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.getPhoto = (req, res, next) => {
  try {
    const photo = localStorage.getPhoto(req.params.photoId);
    if (!photo) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        error: { type: 'NOT_FOUND', message: 'Photo not found' }
      });
    }
    res.json({
      status: 'success',
      code: 200,
      data: photo
    });
  } catch (err) {
    next(err);
  }
};

exports.selectPhotos = (req, res, next) => {
  try {
    const { sessionId, selectedPhotoIds = [] } = req.body;
    if (selectedPhotoIds.length > 3) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        error: { type: 'VALIDATION_ERROR', message: 'Maximum 3 photos allowed for 3x1 layout' }
      });
    }

    res.json({
      status: 'success',
      code: 200,
      data: {
        selectedPhotos: selectedPhotoIds,
        count: selectedPhotoIds.length,
        layout: '3x1'
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePhoto = (req, res, next) => {
  try {
    const success = localStorage.deletePhoto(req.params.photoId);
    if (!success) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        error: { type: 'NOT_FOUND', message: 'Photo not found or already deleted' }
      });
    }
    res.json({
      status: 'success',
      code: 200,
      message: 'Photo deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBatch = (req, res, next) => {
  try {
    const { photoIds = [] } = req.body;
    let deleted = 0;
    photoIds.forEach((id) => {
      if (localStorage.deletePhoto(id)) deleted++;
    });
    res.json({
      status: 'success',
      code: 200,
      data: { deleted, remaining: Object.keys(localStorage.memoryStore.photos).length }
    });
  } catch (err) {
    next(err);
  }
};
