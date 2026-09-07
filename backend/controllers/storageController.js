const localStorage = require('../services/storage/local.storage');
const path = require('path');
const fs = require('fs');

exports.listStorage = (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const result = localStorage.getPhotos(sessionId, 100, 0);
    res.json({
      status: 'success',
      code: 200,
      data: {
        files: result.photos,
        total: result.total
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.downloadArchive = async (req, res, next) => {
  try {
    const { sessionId = 'default_session' } = req.body;
    const exportFilename = `photobooth_${sessionId}_${Date.now()}.zip`;
    const exportPath = path.join(__dirname, '../../public/exports', exportFilename);

    await localStorage.createZipArchive(sessionId, exportPath);

    res.download(exportPath, exportFilename, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    next(err);
  }
};

exports.exportSession = async (req, res, next) => {
  try {
    const { sessionId = 'default_session' } = req.body;
    const exportFilename = `photobooth_${sessionId}_${Date.now()}.zip`;
    const exportPath = path.join(__dirname, '../../public/exports', exportFilename);

    await localStorage.createZipArchive(sessionId, exportPath);

    res.json({
      status: 'success',
      code: 200,
      data: {
        exportId: `export_${Date.now()}`,
        url: `/exports/${exportFilename}`,
        filename: exportFilename,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.cleanup = (req, res) => {
  res.json({
    status: 'success',
    code: 200,
    data: {
      deletedSessions: 1,
      freedSpace: '12MB'
    }
  });
};
