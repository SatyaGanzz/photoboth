const http = require('http');

// Start server inline
process.env.PORT = '5055';
require('../server.js');

function request(options, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (data) {
      headers['Content-Type'] = 'application/json';
    }

    const req = http.request({ ...options, port: 5055, headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch (_) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  await new Promise((r) => setTimeout(r, 600)); // wait for server listen
  console.log('🔒 Running Photobooth Authentication & Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;
  let authToken = null;

  async function assert(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health check (Public)
  await assert('Health check /health (Public)', async () => {
    const res = await request({ hostname: 'localhost', path: '/health', method: 'GET' });
    if (res.status !== 200 || res.data.status !== 'ok') throw new Error(`Unexpected response: ${JSON.stringify(res)}`);
  });

  // 2. Reject unauthenticated API access
  await assert('Reject unauthorized access /api/camera/status -> 401', async () => {
    const res = await request({ hostname: 'localhost', path: '/api/camera/status', method: 'GET' });
    if (res.status !== 401 || res.data.status !== 'error') throw new Error('Expected 401 Unauthorized');
  });

  // 3. Reject wrong login credentials
  await assert('Reject invalid credentials /api/auth/login -> 401', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/auth/login', method: 'POST' },
      { username: 'Sxatya', password: 'wrongpassword' }
    );
    if (res.status !== 401) throw new Error('Expected 401 for wrong password');
  });

  // 4. Successful Login
  await assert('Login with valid operator credentials -> 200 OK + Token', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/auth/login', method: 'POST' },
      { username: 'Sxatya', password: 'R13245' }
    );
    if (res.status !== 200 || !res.data.data.token || res.data.data.user !== 'Sxatya') {
      throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
    }
    authToken = res.data.data.token;
  });

  // 5. Verify Session Token
  await assert('Verify token /api/auth/verify -> 200 OK', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/auth/verify', method: 'GET' },
      null,
      authToken
    );
    if (res.status !== 200 || !res.data.data.authenticated) throw new Error('Token verification failed');
  });

  // 5b. Create New Session ({name}_{date})
  let testSessionId = '';
  await assert('Create New Session /api/sessions/create ({name}_{date})', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/sessions/create', method: 'POST' },
      { name: 'Satya' },
      authToken
    );
    if (res.status !== 200 || !res.data.data.id || !res.data.data.id.startsWith('Satya_')) {
      throw new Error(`Session creation failed: ${JSON.stringify(res.data)}`);
    }
    testSessionId = res.data.data.id;
  });

  // 6. Camera Status (Authenticated)
  await assert('Camera Status /api/camera/status (Authenticated)', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/camera/status', method: 'GET' },
      null,
      authToken
    );
    if (res.status !== 200 || !res.data.data.connected) throw new Error('Camera not connected');
  });

  // 7. Camera Capture (Authenticated)
  let capturedPhotoId = '';
  await assert('Camera Capture /api/camera/capture (Authenticated)', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/camera/capture', method: 'POST' },
      { sessionId: 'test_session', photoIndex: 1 },
      authToken
    );
    if (res.status !== 200 || !res.data.data.id) throw new Error('Capture failed');
    capturedPhotoId = res.data.data.id;
  });

  // 8. Photos List (Authenticated)
  await assert('Photos List /api/photos (Authenticated)', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/photos', method: 'GET' },
      null,
      authToken
    );
    if (res.status !== 200 || !Array.isArray(res.data.data.photos)) throw new Error('Photos list invalid');
  });

  // 9. Layout Generate (Authenticated)
  await assert('Layout Generate /api/layout/generate (Authenticated)', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/layout/generate', method: 'POST' },
      { photoIds: [capturedPhotoId], template: '3x1', backgroundColor: '#FFFFFF' },
      authToken
    );
    if (res.status !== 200 || !res.data.data.layoutId) throw new Error('Layout generation failed');
  });

  // 10. Printers List & Send (Authenticated)
  await assert('Printers List & Send /api/print/send (Authenticated)', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/print/send', method: 'POST' },
      { layoutId: '4r_tpl_1', printerSettings: { copies: 1, paperSize: '4R' } },
      authToken
    );
    if (res.status !== 200 || res.data.data.status !== 'printing') throw new Error('Print job send failed');
  });

  // 10b. Google Drive Auto Upload /api/drive/upload (Authenticated)
  await assert('Google Drive Auto Upload /api/drive/upload (Authenticated)', async () => {
    const res = await request(
      { hostname: 'localhost', path: '/api/drive/upload', method: 'POST' },
      { sessionId: 'test_session', layoutFormat: '4R', compositeBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' },
      authToken
    );
    if (res.status !== 200 || res.data.status !== 'success' || !res.data.data.driveUrl) {
      throw new Error('Google Drive upload failed');
    }
  });

  // 11. Static frontend assets, 4R, Photobooth Filters & Audio Beep
  await assert('Frontend UI Serving /index.html with Notice Alert, 4R, Filters & Audio Beep', async () => {
    const res = await request({ hostname: 'localhost', path: '/', method: 'GET' });
    if (res.status !== 200 || typeof res.data !== 'string') throw new Error('Failed to load index.html');
    if (!res.data.includes('printNoticeModal')) throw new Error('Missing printNoticeModal in index.html');
    if (!res.data.includes('btnLayout4R')) throw new Error('Missing 4R layout selector in index.html');
    if (!res.data.includes('pb-filter-grid')) throw new Error('Missing photobooth filter grid in index.html');
    if (!res.data.includes('btnAudioToggle')) throw new Error('Missing audio toggle button in index.html');
  });

  // 12. Template Asset Serving
  await assert('Template Asset Serving /templates/template1.svg', async () => {
    const res = await request({ hostname: 'localhost', path: '/templates/template1.svg', method: 'GET' });
    if (res.status !== 200 || typeof res.data !== 'string' || !res.data.includes('svg')) {
      throw new Error('Template SVG not served correctly');
    }
  });

  // 13. Security Hardening: Block Path Traversal Attack
  await assert('Security: Block Path Traversal Attempt -> 403 Forbidden', async () => {
    const res = await request({ hostname: 'localhost', path: '/photos/../../server.js', method: 'GET' });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden on path traversal, got status ${res.status}`);
    }
  });

  console.log(`\n========================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
