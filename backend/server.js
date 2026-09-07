require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const cameraRoutes = require('./routes/camera.routes');
const photoRoutes = require('./routes/photos.routes');
const editorRoutes = require('./routes/editor.routes');
const layoutRoutes = require('./routes/layout.routes');
const printRoutes = require('./routes/print.routes');
const storageRoutes = require('./routes/storage.routes');
const driveRoutes = require('./routes/drive.routes');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure directories
['photos', 'temp', 'public/uploads', 'public/exports'].forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use('/exports', express.static(path.join(__dirname, 'public/exports')));
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/camera', cameraRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/layout', layoutRoutes);
app.use('/api/print', printRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/drive', driveRoutes);

// Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`✓ Photobooth Backend running on http://localhost:${PORT}`);
});

module.exports = { app, server };
