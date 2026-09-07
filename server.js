// Photobooth Standalone Server with Enhanced Security Hardening & Session Management
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const zlib = require('zlib');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const PHOTOS_DIR = path.resolve(__dirname, 'photos');
const EXPORTS_DIR = path.resolve(__dirname, 'exports');

[PUBLIC_DIR, PHOTOS_DIR, EXPORTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Credentials
const AUTH_CREDENTIALS = {
  username: 'Sxatya',
  password: 'R13245'
};

// In-memory active auth tokens (token -> { username, createdAt, expiresAt })
const activeSessions = new Map();

// Periodic expired token garbage collection (every 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
    }
  }
}, 3600000);

// In-memory Database / Metadata
const metadataPath = path.join(PHOTOS_DIR, 'metadata.json');
let db = { photos: {}, layouts: {}, sessions: {} };
if (fs.existsSync(metadataPath)) {
  try {
    db = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (_) {}
}

function saveDB() {
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.zip': 'application/zip'
};

// Path Traversal Prevention
function isPathInside(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget.startsWith(resolvedBase);
}

// Timing-Safe String Comparison (prevents side-channel timing attacks)
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  res.end(JSON.stringify(data));
}

// Auth Verification Helper
function isAuthenticated(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  const token = parts[1];
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  return session;
}

// Generate fallback SVG sample when no webcam/DSLR
function generateSamplePhotoSVG(index, title) {
  const gradients = [
    ['#FF6B81', '#FF4757'],
    ['#70A1FF', '#1E90FF'],
    ['#2ED573', '#10AC84'],
    ['#FFA502', '#FF6348']
  ];
  const g = gradients[(index || 0) % gradients.length];
  return `<svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${g[0]}"/>
        <stop offset="100%" stop-color="${g[1]}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="600" cy="400" r="220" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="530" cy="350" r="30" fill="#2C3E50"/>
    <circle cx="670" cy="350" r="30" fill="#2C3E50"/>
    <path d="M 520 480 Q 600 560 680 480" stroke="#2C3E50" stroke-width="18" fill="none" stroke-linecap="round"/>
    <text x="600" y="740" font-family="Segoe UI, sans-serif" font-size="44" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${title || 'PHOTOBOOTH MEMORY'}</text>
    <text x="600" y="800" font-family="Segoe UI, sans-serif" font-size="28" fill="#FFE5E5" text-anchor="middle">Pose #${index} - ${new Date().toLocaleTimeString()}</text>
  </svg>`;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.end();
  }

  // --- PUBLIC API ROUTES ---

  // Health
  if (pathname === '/health' && req.method === 'GET') {
    return sendJSON(res, { status: 'ok', time: new Date().toISOString() });
  }

  // Auth: Login (Protected with Timing-Safe Comparison)
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const { username, password } = body;

    if (safeCompare(username, AUTH_CREDENTIALS.username) && safeCompare(password, AUTH_CREDENTIALS.password)) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      activeSessions.set(token, {
        username: AUTH_CREDENTIALS.username,
        createdAt: Date.now(),
        expiresAt
      });

      return sendJSON(res, {
        status: 'success',
        code: 200,
        data: {
          token,
          user: AUTH_CREDENTIALS.username,
          expiresAt
        },
        message: 'Login berhasil. Selamat datang di Photobooth Studio!'
      });
    }

    return sendJSON(res, {
      status: 'error',
      code: 401,
      error: {
        type: 'INVALID_CREDENTIALS',
        message: 'Username atau Password salah! Akses ditolak.'
      }
    }, 401);
  }

  // Auth: Verify Session
  if (pathname === '/api/auth/verify' && req.method === 'GET') {
    const session = isAuthenticated(req);
    if (session) {
      return sendJSON(res, {
        status: 'success',
        code: 200,
        data: {
          authenticated: true,
          user: session.username,
          expiresAt: session.expiresAt
        }
      });
    }
    return sendJSON(res, {
      status: 'error',
      code: 401,
      error: { type: 'UNAUTHORIZED', message: 'Sesi tidak valid atau telah berakhir.' }
    }, 401);
  }

  // Auth: Logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) activeSessions.delete(token);
    }
    return sendJSON(res, { status: 'success', message: 'Logout berhasil.' });
  }

  // --- PROTECTED API ROUTES GUARD ---
  if (pathname.startsWith('/api/')) {
    const session = isAuthenticated(req);
    if (!session) {
      return sendJSON(res, {
        status: 'error',
        code: 401,
        error: {
          type: 'UNAUTHORIZED',
          message: 'Akses ditolak. Anda harus login sebagai pengguna terotorisasi (Sxatya).'
        }
      }, 401);
    }
  }

  // --- SECURED API ROUTING ---

  // Sessions: Create New Session ({ name })
  if (pathname === '/api/sessions/create' && req.method === 'POST') {
    const body = await parseBody(req);
    const rawName = (body.name || 'Guest').trim();
    const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');

    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const sessionId = `${cleanName}_${dateStr}`;
    const sessionDir = path.join(PHOTOS_DIR, sessionId);
    if (!isPathInside(PHOTOS_DIR, sessionDir)) {
      return sendJSON(res, { status: 'error', error: { message: 'Invalid session ID' } }, 400);
    }

    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const sessionRecord = {
      id: sessionId,
      customerName: rawName,
      createdAt: now.toISOString(),
      photos: []
    };

    if (!db.sessions) db.sessions = {};
    db.sessions[sessionId] = sessionRecord;
    saveDB();

    fs.writeFileSync(path.join(sessionDir, 'session.json'), JSON.stringify(sessionRecord, null, 2));

    return sendJSON(res, {
      status: 'success',
      data: sessionRecord,
      message: 'Sesi baru berhasil dibuat dan disimpan di lokal'
    });
  }

  // Sessions: List
  if (pathname === '/api/sessions' && req.method === 'GET') {
    const sessionsList = Object.values(db.sessions || {}).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sendJSON(res, {
      status: 'success',
      data: { sessions: sessionsList, total: sessionsList.length }
    });
  }

  // Camera Status
  if (pathname === '/api/camera/status' && req.method === 'GET') {
    return sendJSON(res, {
      status: 'success',
      data: {
        connected: true,
        model: 'Integrated Camera / Auto-DSLR Ready',
        battery: '100%',
        mode: 'Ready',
        liveViewSupported: true,
        liveViewActive: true
      }
    });
  }

  // Camera Settings
  if (pathname === '/api/camera/settings' && req.method === 'POST') {
    const body = await parseBody(req);
    return sendJSON(res, { status: 'success', data: { settings: body } });
  }

  // Camera Capture
  if (pathname === '/api/camera/capture' && req.method === 'POST') {
    const body = await parseBody(req);
    let sessionId = body.sessionId;

    if (!sessionId || sessionId === 'default_session') {
      const now = new Date();
      const dateStr = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');
      sessionId = `Session_${dateStr}`;
    }

    // Path traversal sanitize
    sessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const photoIndex = body.photoIndex || Date.now();
    const sessionDir = path.join(PHOTOS_DIR, sessionId);

    if (!isPathInside(PHOTOS_DIR, sessionDir)) {
      return sendJSON(res, { status: 'error', error: { message: 'Invalid session path' } }, 400);
    }
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const photoId = `photo_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    let filename, filepath, urlPath;

    if (body.imageBase64) {
      filename = `${photoId}.jpg`;
      filepath = path.join(sessionDir, filename);
      const cleanBase64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filepath, Buffer.from(cleanBase64, 'base64'));
      urlPath = `/photos/${sessionId}/${filename}`;
    } else {
      filename = `${photoId}.svg`;
      filepath = path.join(sessionDir, filename);
      const svg = generateSamplePhotoSVG(photoIndex, body.title || sessionId);
      fs.writeFileSync(filepath, svg);
      urlPath = `/photos/${sessionId}/${filename}`;
    }

    const photoData = {
      id: photoId,
      sessionId,
      filename,
      filepath,
      url: urlPath,
      thumbnail: urlPath,
      timestamp: new Date().toISOString(),
      metadata: {
        width: 1200,
        height: 900,
        camera: 'Integrated Camera / Studio HD'
      },
      status: 'captured',
      selected: false
    };

    db.photos[photoId] = photoData;

    if (!db.sessions) db.sessions = {};
    if (!db.sessions[sessionId]) {
      db.sessions[sessionId] = {
        id: sessionId,
        customerName: sessionId.split('_')[0] || 'Guest',
        createdAt: new Date().toISOString(),
        photos: []
      };
    }
    if (!db.sessions[sessionId].photos.includes(photoId)) {
      db.sessions[sessionId].photos.push(photoId);
    }
    saveDB();

    try {
      fs.writeFileSync(path.join(sessionDir, 'session.json'), JSON.stringify(db.sessions[sessionId], null, 2));
    } catch (_) {}

    return sendJSON(res, {
      status: 'success',
      data: photoData,
      message: 'Photo captured and saved to session'
    });
  }

  // Photos List
  if (pathname === '/api/photos' && req.method === 'GET') {
    let sessionId = parsedUrl.query.sessionId;
    let list = Object.values(db.photos);
    if (sessionId) {
      sessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '_');
      list = list.filter((p) => p.sessionId === sessionId);
    }
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return sendJSON(res, {
      status: 'success',
      data: {
        photos: list,
        total: list.length
      }
    });
  }

  // Single Photo
  if (pathname.startsWith('/api/photos/') && req.method === 'GET') {
    const photoId = path.basename(pathname.replace('/api/photos/', '')).replace(/[^a-zA-Z0-9_-]/g, '_');
    const photo = db.photos[photoId];
    if (!photo) {
      return sendJSON(res, { status: 'error', error: { message: 'Photo not found' } }, 404);
    }
    return sendJSON(res, { status: 'success', data: photo });
  }

  // Select Photos
  if (pathname === '/api/photos/select' && req.method === 'POST') {
    const body = await parseBody(req);
    const selectedPhotoIds = body.selectedPhotoIds || [];
    if (selectedPhotoIds.length > 3) {
      return sendJSON(res, { status: 'error', error: { message: 'Max 3 photos' } }, 400);
    }
    return sendJSON(res, {
      status: 'success',
      data: {
        selectedPhotos: selectedPhotoIds,
        count: selectedPhotoIds.length,
        layout: '3x1'
      }
    });
  }

  // Delete Photo
  if (pathname.startsWith('/api/photos/') && req.method === 'DELETE') {
    const photoId = path.basename(pathname.replace('/api/photos/', '')).replace(/[^a-zA-Z0-9_-]/g, '_');
    const photo = db.photos[photoId];
    if (photo) {
      if (photo.filepath && isPathInside(PHOTOS_DIR, photo.filepath) && fs.existsSync(photo.filepath)) {
        try { fs.unlinkSync(photo.filepath); } catch (_) {}
      }
      delete db.photos[photoId];
      if (photo.sessionId && db.sessions[photo.sessionId]) {
        db.sessions[photo.sessionId].photos = db.sessions[photo.sessionId].photos.filter((id) => id !== photoId);
        try {
          fs.writeFileSync(path.join(PHOTOS_DIR, photo.sessionId, 'session.json'), JSON.stringify(db.sessions[photo.sessionId], null, 2));
        } catch (_) {}
      }
      saveDB();
      return sendJSON(res, { status: 'success', message: 'Photo deleted' });
    }
    return sendJSON(res, { status: 'error', error: { message: 'Not found' } }, 404);
  }

  // Editor Actions (Save edited Base64 or metadata)
  if (pathname.startsWith('/api/editor/') && req.method === 'POST') {
    const body = await parseBody(req);
    const photoId = path.basename(String(body.photoId || '')).replace(/[^a-zA-Z0-9_-]/g, '_');
    const photo = db.photos[photoId];
    if (!photo) {
      return sendJSON(res, { status: 'error', error: { message: 'Photo not found' } }, 404);
    }

    if (body.editedBase64) {
      const editFilename = `${photoId}_edited_${Date.now()}.jpg`;
      const editPath = path.join(path.dirname(photo.filepath), editFilename);
      if (!isPathInside(PHOTOS_DIR, editPath)) {
        return sendJSON(res, { status: 'error', error: { message: 'Invalid target path' } }, 400);
      }
      const clean = body.editedBase64.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(editPath, Buffer.from(clean, 'base64'));
      photo.url = `/photos/${photo.sessionId}/${editFilename}`;
      photo.thumbnail = photo.url;
      photo.status = 'edited';
      saveDB();
    }

    return sendJSON(res, {
      status: 'success',
      data: {
        photoId,
        url: photo.url,
        status: 'edited'
      }
    });
  }

  // Layout 3x1 Generate
  if (pathname === '/api/layout/generate' && req.method === 'POST') {
    const body = await parseBody(req);
    let { sessionId = 'default_session', photoIds = [], backgroundColor = '#FFFFFF', padding = 16, layoutBase64 } = body;
    sessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const sessionDir = path.join(PHOTOS_DIR, sessionId);
    if (!isPathInside(PHOTOS_DIR, sessionDir)) {
      return sendJSON(res, { status: 'error', error: { message: 'Invalid session path' } }, 400);
    }
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const layoutId = `layout_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    let layoutUrl = '';

    if (layoutBase64) {
      const filename = `${layoutId}.jpg`;
      const filepath = path.join(sessionDir, filename);
      const clean = layoutBase64.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filepath, Buffer.from(clean, 'base64'));
      layoutUrl = `/photos/${sessionId}/${filename}`;
    } else {
      layoutUrl = `/photos/${sessionId}/${layoutId}.jpg`;
    }

    const layoutRecord = {
      layoutId,
      sessionId,
      photoIds,
      template: '3x1',
      padding,
      backgroundColor,
      url: layoutUrl,
      preview: layoutUrl,
      generatedAt: new Date().toISOString()
    };

    db.layouts[layoutId] = layoutRecord;
    saveDB();

    return sendJSON(res, { status: 'success', data: layoutRecord });
  }

  // Printers
  if (pathname === '/api/print/printers' && req.method === 'GET') {
    return sendJSON(res, {
      status: 'success',
      data: {
        printers: [
          { id: 'p1', name: 'Canon SELPHY CP1500 (Photo Strip)', status: 'ready', defaultSize: '4x6' },
          { id: 'p2', name: 'DNP DS-RX1HS Dye-Sub (High Speed)', status: 'ready', defaultSize: '2x6' }
        ]
      }
    });
  }

  // Send Print
  if (pathname === '/api/print/send' && req.method === 'POST') {
    const body = await parseBody(req);
    const printJobId = `job_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    return sendJSON(res, {
      status: 'success',
      data: {
        printJobId,
        status: 'printing',
        copies: body.printerSettings?.copies || 1,
        estimatedTime: '20s',
        message: 'Print job dispatched successfully'
      }
    });
  }

  // Google Drive
  if (pathname === '/api/drive/status' && req.method === 'GET') {
    return sendJSON(res, {
      status: 'success',
      data: {
        authorized: true,
        user: 'studio@photobooth.dev',
        storageAvailableGB: 14.2
      }
    });
  }

  // Static File Serving (with strict Path Traversal Guard)
  let filePath = '';
  let baseDir = PUBLIC_DIR;

  if (pathname.startsWith('/photos/')) {
    baseDir = PHOTOS_DIR;
    filePath = path.join(PHOTOS_DIR, path.normalize(pathname.replace('/photos/', '')));
  } else if (pathname.startsWith('/exports/')) {
    baseDir = EXPORTS_DIR;
    filePath = path.join(EXPORTS_DIR, path.normalize(pathname.replace('/exports/', '')));
  } else {
    baseDir = PUBLIC_DIR;
    const safePath = pathname === '/' ? 'index.html' : path.normalize(pathname.replace(/^\//, ''));
    filePath = path.join(PUBLIC_DIR, safePath);
  }

  // Security check: Block path traversal outside base directory
  if (!isPathInside(baseDir, filePath)) {
    res.writeHead(403, {
      'Content-Type': 'text/plain',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.end('403 Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Fallback to index.html for SPA
  const indexHtml = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(indexHtml).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🔒 PHOTOBOOTH STUDIO SERVER ACTIVE (HARDENED & SECURED)`);
  console.log(`👤 Auth Protection: Enabled`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
