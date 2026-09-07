const dslrService = require('../services/camera/dslr.service');
const imageProcessor = require('../services/image/image.processor');
const localStorage = require('../services/storage/local.storage');
const path = require('path');

exports.capturePhoto = async (req, res, next) => {
  try {
    const { sessionId = 'default_session', photoIndex = 1, imageBase64 } = req.body;
    const result = await dslrService.capture(sessionId, photoIndex, imageBase64);

    const thumbPath = path.join(
      __dirname,
      '../../photos',
      sessionId,
      `${result.photoId}_thumb.jpg`
    );

    await imageProcessor.generateThumbnail(result.filepath, thumbPath, 300);

    const photoRecord = {
      id: result.photoId,
      sessionId,
      filename: result.filename,
      filepath: result.filepath,
      thumbnailPath: thumbPath,
      url: result.url,
      thumbnail: `/photos/${sessionId}/${result.photoId}_thumb.jpg`,
      timestamp: new Date().toISOString(),
      metadata: {
        width: 1200,
        height: 900,
        camera: dslrService.model
      },
      status: 'captured',
      selected: false
    };

    localStorage.recordPhoto(photoRecord);

    res.json({
      status: 'success',
      code: 200,
      data: photoRecord,
      message: 'Photo captured successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const status = await dslrService.getStatus();
    res.json({
      status: 'success',
      code: 200,
      data: status
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await dslrService.updateSettings(req.body);
    res.json({
      status: 'success',
      code: 200,
      data: { settings }
    });
  } catch (err) {
    next(err);
  }
};
