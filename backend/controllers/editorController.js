const localStorage = require('../services/storage/local.storage');
const imageProcessor = require('../services/image/image.processor');
const path = require('path');
const fs = require('fs');

exports.cropPhoto = async (req, res, next) => {
  try {
    const { photoId, crop } = req.body;
    const photo = localStorage.getPhoto(photoId);
    if (!photo) {
      return res.status(404).json({ status: 'error', error: { message: 'Photo not found' } });
    }

    const editFilename = `${photo.id}_edited.jpg`;
    const outputPath = path.join(path.dirname(photo.filepath), editFilename);

    await imageProcessor.crop(photo.filepath, outputPath, crop);

    // Update thumbnail as well
    const thumbPath = path.join(path.dirname(photo.filepath), `${photo.id}_thumb.jpg`);
    await imageProcessor.generateThumbnail(outputPath, thumbPath, 300);

    photo.url = `/photos/${photo.sessionId}/${editFilename}?t=${Date.now()}`;
    photo.thumbnail = `/photos/${photo.sessionId}/${photo.id}_thumb.jpg?t=${Date.now()}`;
    photo.status = 'edited';
    localStorage.recordPhoto(photo);

    res.json({
      status: 'success',
      code: 200,
      data: {
        photoId,
        preview: photo.url,
        thumbnail: photo.thumbnail
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.rotatePhoto = async (req, res, next) => {
  try {
    const { photoId, angle = 90 } = req.body;
    const photo = localStorage.getPhoto(photoId);
    if (!photo) {
      return res.status(404).json({ status: 'error', error: { message: 'Photo not found' } });
    }

    const editFilename = `${photo.id}_edited.jpg`;
    const outputPath = path.join(path.dirname(photo.filepath), editFilename);

    await imageProcessor.rotate(photo.filepath, outputPath, angle);

    const thumbPath = path.join(path.dirname(photo.filepath), `${photo.id}_thumb.jpg`);
    await imageProcessor.generateThumbnail(outputPath, thumbPath, 300);

    photo.url = `/photos/${photo.sessionId}/${editFilename}?t=${Date.now()}`;
    photo.thumbnail = `/photos/${photo.sessionId}/${photo.id}_thumb.jpg?t=${Date.now()}`;
    photo.status = 'edited';
    localStorage.recordPhoto(photo);

    res.json({
      status: 'success',
      code: 200,
      data: {
        photoId,
        angle,
        preview: photo.url,
        thumbnail: photo.thumbnail
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.adjustPhoto = async (req, res, next) => {
  try {
    const { photoId, adjustments = {} } = req.body;
    const photo = localStorage.getPhoto(photoId);
    if (!photo) {
      return res.status(404).json({ status: 'error', error: { message: 'Photo not found' } });
    }

    const editFilename = `${photo.id}_edited.jpg`;
    const outputPath = path.join(path.dirname(photo.filepath), editFilename);

    await imageProcessor.adjust(photo.filepath, outputPath, adjustments);

    const thumbPath = path.join(path.dirname(photo.filepath), `${photo.id}_thumb.jpg`);
    await imageProcessor.generateThumbnail(outputPath, thumbPath, 300);

    photo.url = `/photos/${photo.sessionId}/${editFilename}?t=${Date.now()}`;
    photo.thumbnail = `/photos/${photo.sessionId}/${photo.id}_thumb.jpg?t=${Date.now()}`;
    photo.status = 'edited';
    localStorage.recordPhoto(photo);

    res.json({
      status: 'success',
      code: 200,
      data: {
        photoId,
        adjustments,
        preview: photo.url,
        thumbnail: photo.thumbnail
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.filterPhoto = async (req, res, next) => {
  try {
    const { photoId, filter = 'none' } = req.body;
    const photo = localStorage.getPhoto(photoId);
    if (!photo) {
      return res.status(404).json({ status: 'error', error: { message: 'Photo not found' } });
    }

    const editFilename = `${photo.id}_edited.jpg`;
    const outputPath = path.join(path.dirname(photo.filepath), editFilename);

    await imageProcessor.applyFilter(photo.filepath, outputPath, filter);

    const thumbPath = path.join(path.dirname(photo.filepath), `${photo.id}_thumb.jpg`);
    await imageProcessor.generateThumbnail(outputPath, thumbPath, 300);

    photo.url = `/photos/${photo.sessionId}/${editFilename}?t=${Date.now()}`;
    photo.thumbnail = `/photos/${photo.sessionId}/${photo.id}_thumb.jpg?t=${Date.now()}`;
    photo.status = 'edited';
    localStorage.recordPhoto(photo);

    res.json({
      status: 'success',
      code: 200,
      data: {
        photoId,
        filter,
        preview: photo.url,
        thumbnail: photo.thumbnail
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.applyEdits = (req, res) => {
  const { photoId } = req.body;
  const photo = localStorage.getPhoto(photoId);
  if (!photo) {
    return res.status(404).json({ status: 'error', error: { message: 'Photo not found' } });
  }
  res.json({
    status: 'success',
    code: 200,
    data: {
      photoId,
      url: photo.url,
      status: 'edited'
    }
  });
};

exports.revertEdits = async (req, res, next) => {
  try {
    const { photoId } = req.body;
    const photo = localStorage.getPhoto(photoId);
    if (!photo) {
      return res.status(404).json({ status: 'error', error: { message: 'Photo not found' } });
    }

    photo.url = `/photos/${photo.sessionId}/${photo.filename}`;
    photo.thumbnail = `/photos/${photo.sessionId}/${photo.id}_thumb.jpg`;
    photo.status = 'captured';
    localStorage.recordPhoto(photo);

    res.json({
      status: 'success',
      code: 200,
      data: {
        photoId,
        url: photo.url,
        status: 'captured'
      }
    });
  } catch (err) {
    next(err);
  }
};
