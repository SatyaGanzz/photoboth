exports.auth = (req, res) => {
  res.json({
    status: 'success',
    code: 200,
    data: {
      authorized: true,
      user: 'studio@photobooth.dev',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    }
  });
};

exports.upload = (req, res) => {
  const { sessionId = 'default_session', files = [] } = req.body;
  res.json({
    status: 'success',
    code: 200,
    data: {
      uploadId: `drive_up_${Date.now()}`,
      fileCount: files.length || 3,
      totalSize: 4500000,
      driveUrl: `https://drive.google.com/drive/folders/photobooth_${sessionId}`,
      uploadedAt: new Date().toISOString()
    }
  });
};

exports.getStatus = (req, res) => {
  res.json({
    status: 'success',
    code: 200,
    data: {
      authorized: true,
      user: 'studio@photobooth.dev',
      storageLimitGB: 15,
      storageUsedGB: 2.1,
      storageAvailableGB: 12.9
    }
  });
};

exports.disconnect = (req, res) => {
  res.json({
    status: 'success',
    code: 200,
    message: 'Google Drive disconnected'
  });
};
