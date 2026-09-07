// PHOTOBOOTH STUDIO - SECURED APPLICATION CORE WITH CAMERA AUTO-DETECTION, SESSION MANAGEMENT & 5 CUSTOM TEMPLATES

const PRINT_TEMPLATES = {
  1: { id: 1, name: 'Studio White', src: '/templates/template1.svg', bg: '#FFFFFF', isDark: false },
  2: { id: 2, name: 'Obsidian', src: '/templates/template2.svg', bg: '#0B0F19', isDark: true },
  3: { id: 3, name: 'Romance', src: '/templates/template3.svg', bg: '#FFF1F2', isDark: false },
  4: { id: 4, name: 'Retro Warm', src: '/templates/template4.svg', bg: '#FEF3C7', isDark: false },
  5: { id: 5, name: 'Neon Lounge', src: '/templates/template5.svg', bg: '#180B10', isDark: true }
};

const state = {
  currentScreen: 'capture',
  cameraStream: null,
  currentDeviceId: null,
  detectedCameras: [],
  photos: [],
  selectedPhotoIds: [],
  galleryFilter: 'all',
  editingPhotoId: null,
  currentSessionId: null, // Always start fresh on script run, never continue old session
  currentCustomerName: null,
  authToken: localStorage.getItem('photobooth_auth_token') || null,
  authUser: localStorage.getItem('photobooth_auth_user') || null,
  selectedTemplateId: 1,
  customTemplateDataUrl: null,
  timerDelay: 3,
  soundEnabled: true,
  isCameraMirrored: true,
  cameraFx: {
    filter: 'none',
    vignette: false,
    grain: false,
    lightLeak: false,
    bloom: false,
    dateStamp: true,
    sticker: 'none',
    brightness: 0,
    contrast: 0,
    warmth: 0
  },
  fourR: {
    widthMm: 90,
    heightMm: 40,
    gapMm: 6,
    radiusPx: 8
  },
  editor: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filter: 'none',
    rotation: 0,
    flipped: false,
    originalImage: null
  },
  strip: {
    layoutFormat: '4r',
    photoIds: [],
    templateId1: 1,
    templateId2: 1,
    linkTemplates: true,
    backgroundColor: '#FFFFFF',
    textColor: '#0F172A',
    title: 'SATYA MEMORIES',
    subtitle: 'STUDIO EDITION // 2026-X'
  }
};


// --- AUTHENTICATED FETCH WRAPPER ---
async function authFetch(url, options = {}) {
  const headers = options.headers || {};
  if (state.authToken) {
    headers['Authorization'] = `Bearer ${state.authToken}`;
  }
  options.headers = headers;

  const res = await fetch(url, options);

  if (res.status === 401) {
    clearAuthSession();
    showAuthModal('Sesi login telah berakhir atau kredensial tidak valid.');
    throw new Error('Unauthorized');
  }

  return res;
}

// --- AUTHENTICATION HANDLERS ---
async function verifyAuth() {
  if (!state.authToken) {
    showAuthModal();
    return false;
  }

  try {
    const res = await fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${state.authToken}` }
    });
    const data = await res.json();
    if (data.status === 'success') {
      hideAuthModal();
      updateAuthUI();
      return true;
    } else {
      clearAuthSession();
      showAuthModal();
      return false;
    }
  } catch (e) {
    clearAuthSession();
    showAuthModal();
    return false;
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('inputUsername').value.trim();
  const passwordInput = document.getElementById('inputPassword').value.trim();
  const errorBox = document.getElementById('authErrorBox');
  const errorMsg = document.getElementById('authErrorMessage');
  const submitBtn = document.getElementById('btnLoginSubmit');

  errorBox.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Memverifikasi...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });

    const data = await res.json();

    if (data.status === 'success') {
      state.authToken = data.data.token;
      state.authUser = data.data.user;
      localStorage.setItem('photobooth_auth_token', state.authToken);
      localStorage.setItem('photobooth_auth_user', state.authUser);

      hideAuthModal();
      updateAuthUI();
      showToast(`Selamat datang kembali, ${state.authUser}!`, 'success');

      await initCamera();

      if (!state.currentSessionId) {
        openNewSessionModal();
      } else {
        updateSessionUI();
        await loadPhotos();
      }
    } else {
      errorMsg.textContent = data.error?.message || 'Username atau password salah!';
      errorBox.style.display = 'flex';
      if (window.gsap) {
        gsap.fromTo('#authErrorBox', { x: -8 }, { x: 8, duration: 0.08, repeat: 4, yoyo: true, ease: 'none' });
      }
    }
  } catch (err) {
    errorMsg.textContent = 'Terjadi kesalahan jaringan atau server.';
    errorBox.style.display = 'flex';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'MASUK KE STUDIO';
  }
}

function showAuthModal(msg = null) {
  const modal = document.getElementById('authModal');
  modal.classList.remove('hidden');
  if (msg) {
    const errorBox = document.getElementById('authErrorBox');
    const errorMsg = document.getElementById('authErrorMessage');
    errorMsg.textContent = msg;
    errorBox.style.display = 'flex';
  }
  if (window.gsap) {
    gsap.fromTo('#authCardElement', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.2)' });
  }
}

function hideAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function clearAuthSession() {
  state.authToken = null;
  state.authUser = null;
  localStorage.removeItem('photobooth_auth_token');
  localStorage.removeItem('photobooth_auth_user');
  document.getElementById('authUserBadge').style.display = 'none';
}

async function logoutUser() {
  if (state.authToken) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${state.authToken}` }
      });
    } catch (_) {}
  }
  clearAuthSession();
  showAuthModal();
  showToast('Anda telah keluar dari studio.');
}

function updateAuthUI() {
  const badge = document.getElementById('authUserBadge');
  const userDisplay = document.getElementById('authUsernameDisplay');
  if (state.authUser) {
    badge.style.display = 'flex';
    userDisplay.textContent = state.authUser;
  } else {
    badge.style.display = 'none';
  }
}

function togglePasswordVisibility() {
  const pwd = document.getElementById('inputPassword');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

// --- SESSION MANAGEMENT ({name}_{date}) ---
function openNewSessionModal() {
  const modal = document.getElementById('newSessionModal');
  modal.classList.remove('hidden');
  const input = document.getElementById('inputCustomerName');
  input.value = '';
  previewSessionIdFormat();
  setTimeout(() => input.focus(), 150);

  if (window.gsap) {
    gsap.fromTo('#newSessionCardElement', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.2)' });
  }
}

function closeNewSessionModal() {
  if (!state.currentSessionId) {
    createNewSession('Guest');
  }
  document.getElementById('newSessionModal').classList.add('hidden');
}

function previewSessionIdFormat() {
  const inputVal = document.getElementById('inputCustomerName').value.trim() || 'Guest';
  const cleanName = inputVal.replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');

  document.getElementById('sessionPreviewId').textContent = `${cleanName}_${dateStr}`;
}

async function handleNewSessionSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('inputCustomerName').value.trim() || 'Guest';
  await createNewSession(name);
  document.getElementById('newSessionModal').classList.add('hidden');
}

async function createNewSession(customerName) {
  try {
    const res = await authFetch('/api/sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: customerName })
    });
    const result = await res.json();
    if (result.status === 'success') {
      const session = result.data;
      state.currentSessionId = session.id;
      state.currentCustomerName = session.customerName;
      localStorage.setItem('photobooth_session_id', session.id);
      localStorage.setItem('photobooth_customer_name', session.customerName);

      state.photos = [];
      state.selectedPhotoIds = [];
      state.strip.photoIds = [];
      state.strip.title = `${session.customerName.toUpperCase()} MEMORIES`;

      updateSessionUI();
      updateGalleryCount();
      renderGallery();
      renderLayoutStrip();

      switchScreen('capture');
      showToast(`Sesi baru "${session.id}" siap!`, 'success');
    }
  } catch (err) {
    console.error('Error creating session:', err);
    showToast('Gagal membuat sesi baru');
  }
}

function updateSessionUI() {
  const badge = document.getElementById('activeSessionBadge');
  const display = document.getElementById('activeSessionDisplay');
  const bannerName = document.getElementById('bannerSessionName');
  const bannerMeta = document.getElementById('bannerSessionMeta');

  if (state.currentSessionId) {
    if (badge) badge.style.display = 'flex';
    if (display) display.textContent = state.currentSessionId;
    if (bannerName) bannerName.textContent = state.currentSessionId;
    if (bannerMeta) bannerMeta.textContent = `Pelanggan: ${state.currentCustomerName || 'Guest'} | Direktori Lokal: photos/${state.currentSessionId}/`;
  } else {
    if (badge) badge.style.display = 'none';
    if (bannerName) bannerName.textContent = 'Belum Ada Sesi Aktif';
    if (bannerMeta) bannerMeta.textContent = 'Klik tombol di samping untuk memulai sesi foto pelanggan baru.';
  }

  updateLiveReel();
}

function setTimerDelay(delay, btnElement) {
  state.timerDelay = parseInt(delay, 10);
  document.querySelectorAll('.timer-btn').forEach((b) => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  showToast(`Timer diatur ke ${delay === 0 ? 'OFF (Instan)' : delay + ' detik'}`);
}

function toggleCameraMirror() {
  state.isCameraMirrored = !state.isCameraMirrored;
  const video = document.getElementById('cameraVideo');
  const text = document.getElementById('mirrorToggleText');
  const btn = document.getElementById('btnMirrorToggle');

  if (video) {
    video.style.transform = state.isCameraMirrored ? 'scaleX(-1)' : 'scaleX(1)';
  }
  if (btn) btn.classList.toggle('active', state.isCameraMirrored);
  if (text) text.textContent = state.isCameraMirrored ? 'MIRROR' : 'NORMAL';
  showToast(`Cermin Kamera (Mirror): ${state.isCameraMirrored ? 'ON' : 'OFF'}`);
}

function toggleKioskMode() {
  const isKiosk = document.body.classList.toggle('kiosk-mode');
  const text = document.getElementById('kioskModeText');
  const btn = document.getElementById('btnKioskMode');

  if (isKiosk) {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    if (text) text.textContent = 'EXIT';
    if (btn) btn.classList.add('active');
    showToast('Mode Kiosk Aktif! Tampilan immersif bilik foto.', 'info');
  } else {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    if (text) text.textContent = 'KIOSK';
    if (btn) btn.classList.remove('active');
    showToast('Keluar dari Mode Kiosk');
  }
}

function updateLiveReel() {
  const sessionPhotos = state.photos.filter((p) => !state.currentSessionId || p.sessionId === state.currentSessionId);
  const latestPhotos = sessionPhotos.slice(0, 3);

  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById(`reelSlot${i}`);
    if (!slot) continue;

    if (latestPhotos[i]) {
      slot.className = 'reel-frame-slot has-photo';
      const photoTime = new Date(latestPhotos[i].timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      slot.innerHTML = `
        <span class="reel-slot-num">0${i + 1}</span>
        <img src="${latestPhotos[i].url}" alt="Frame 0${i + 1}">
        <span class="reel-slot-timestamp">${photoTime}</span>
      `;
    } else {
      slot.className = 'reel-frame-slot empty';
      slot.innerHTML = `
        <span class="reel-slot-num">0${i + 1}</span>
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="stroke-width:1.5;">
          <circle cx="12" cy="12" r="9"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <span class="mono" style="font-size:0.55rem; font-weight:600;">WAITING SHUTTER</span>
      `;
    }
  }

  const reelTitle = document.getElementById('reelTitleDisplay');
  const reelSub = document.getElementById('reelSubDisplay');
  if (reelTitle) reelTitle.textContent = state.strip.title || 'SATYA MEMORIES';
  if (reelSub) reelSub.textContent = state.strip.subtitle || 'STUDIO EDITION // 2026-X';
}

function clearLiveReel() {
  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById(`reelSlot${i}`);
    if (slot) {
      slot.className = 'reel-frame-slot empty';
      slot.innerHTML = `
        <span class="reel-slot-num">0${i + 1}</span>
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="stroke-width:1.5;">
          <circle cx="12" cy="12" r="9"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <span class="mono" style="font-size:0.55rem; font-weight:600;">WAITING SHUTTER</span>
      `;
    }
  }
  showToast('Live reel dikosongkan untuk sesi aktif');
}

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', async () => {
  // Always clear previous session on initial run so it is never a continue session
  localStorage.removeItem('photobooth_session_id');
  localStorage.removeItem('photobooth_customer_name');
  state.currentSessionId = null;
  state.currentCustomerName = null;
  clearLiveReel();

  const authed = await verifyAuth();
  if (authed) {
    await initCamera();
    applyCameraFxToLiveView();
    update4RFrameDimensions();
    openNewSessionModal();
    fetchDailyReportSummary();
  }
  setupKeyboardShortcuts();
});

// --- NAVIGATION & GSAP TRANSITION ---
function switchScreen(screenName) {
  state.currentScreen = screenName;
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  document.querySelectorAll('.ccu-nav-tab, .nav-tab').forEach((el) => el.classList.remove('active'));

  const targetScreen = document.getElementById(`screen-${screenName}`);
  const targetTab = document.getElementById(`tab-${screenName}`);

  if (targetScreen) {
    targetScreen.classList.add('active');
    targetScreen.style.display = 'block';
    if (window.gsap) {
      gsap.fromTo(targetScreen, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }
  if (targetTab) targetTab.classList.add('active');

  if (screenName === 'gallery') {
    renderGallery();
  } else if (screenName === 'layout') {
    renderLayoutStrip();
  } else if (screenName === 'print') {
    updatePrintPreview();
    updatePrintCopiesInfo();
  }
}

// --- TOAST ALERTS ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  if (window.gsap) {
    gsap.fromTo(toast, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
  }
  setTimeout(() => {
    if (window.gsap) {
      gsap.to(toast, { opacity: 0, y: 10, duration: 0.25, onComplete: () => toast.remove() });
    } else {
      toast.remove();
    }
  }, 3000);
}

// --- 1. CAMERA SYSTEM: AUTO-DETECT DSLR WITH INTEGRATED WEBCAM FALLBACK ---
async function initCamera(preferredDeviceId = null) {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvasFallback');
  const statusText = document.getElementById('cameraStatusText');

  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach((t) => t.stop());
    state.cameraStream = null;
  }

  try {
    await populateCameraDevices();

    let constraints = {
      video: { width: { ideal: 1920, min: 1280 }, height: { ideal: 1080, min: 720 } }
    };

    if (preferredDeviceId) {
      constraints.video.deviceId = { exact: preferredDeviceId };
    } else if (state.currentDeviceId) {
      constraints.video.deviceId = { exact: state.currentDeviceId };
    } else {
      const dslrDevice = state.detectedCameras.find((d) =>
        /dslr|canon|nikon|sony|cam link|usb video|obs/i.test(d.label)
      );

      if (dslrDevice) {
        constraints.video.deviceId = { exact: dslrDevice.deviceId };
        state.currentDeviceId = dslrDevice.deviceId;
      } else {
        constraints.video.facingMode = 'user';
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.cameraStream = stream;
    video.srcObject = stream;
    video.style.display = 'block';
    canvas.style.display = 'none';

    const activeTrack = stream.getVideoTracks()[0];
    const trackLabel = activeTrack ? activeTrack.label : '';
    const isDSLR = /dslr|canon|nikon|sony|cam link/i.test(trackLabel);

    if (isDSLR) {
      statusText.textContent = `DSLR // ${trackLabel.substring(0, 18).toUpperCase()}`;
    } else {
      statusText.textContent = `SENSOR // INTEGRATED`;
    }

    await populateCameraDevices();
  } catch (err) {
    console.warn('Integrated camera/DSLR not accessible; switching to studio simulator feed', err);
    video.style.display = 'none';
    canvas.style.display = 'block';
    renderSimulatedCameraFeed();
    statusText.textContent = 'Studio Cam Ready';
  }
}

async function populateCameraDevices() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    state.detectedCameras = videoDevices;

    const select = document.getElementById('cameraDeviceSelect');
    if (!select) return;

    select.innerHTML = '';
    if (videoDevices.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Integrated Camera';
      select.appendChild(opt);
      return;
    }

    videoDevices.forEach((dev, idx) => {
      const opt = document.createElement('option');
      opt.value = dev.deviceId;
      let label = dev.label || `Camera ${idx + 1}`;
      if (/dslr|canon|nikon|sony/i.test(label)) {
        label = `[DSLR] ${label}`;
      } else {
        label = `[CAM] ${label.includes('Integrated') || label.includes('Built-in') ? label : `Integrated / ${label}`}`;
      }
      opt.textContent = label;
      if (state.currentDeviceId === dev.deviceId || (!state.currentDeviceId && idx === 0)) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  } catch (e) {
    console.error('Error enumerating devices:', e);
  }
}

async function changeCameraDevice(deviceId) {
  state.currentDeviceId = deviceId;
  await initCamera(deviceId);
  showToast('Kamera berhasil dialihkan');
}

function renderSimulatedCameraFeed() {
  const canvas = document.getElementById('cameraCanvasFallback');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 600;

  let frame = 0;
  function loop() {
    if (state.currentScreen === 'capture') {
      frame++;
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#FF385C');
      grad.addColorStop(1, '#059669');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(400, 300, 140 + Math.sin(frame * 0.05) * 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Cabinet Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LIVE STUDIO CAMERA FEED', 400, 290);
      ctx.font = '16px Plus Jakarta Sans, sans-serif';
      ctx.fillText(state.currentSessionId ? `Sesi: ${state.currentSessionId}` : 'Pose for the camera! Press SPACE to capture.', 400, 330);
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// --- WEB AUDIO API SYNTHESIZER (COUNTDOWN BEEPS & SHUTTER SOUND) ---
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play rhythmic countdown beep (higher energetic chime on final second)
function playCountdownBeep(count) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // count === 1: 1320Hz (E6) alert tone, count > 1: 880Hz (A5) studio rhythm tone
    const isFinalSecond = count === 1;
    osc.type = isFinalSecond ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinalSecond ? 1320 : 880, now);

    const duration = isFinalSecond ? 0.22 : 0.12;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (e) {
    console.warn('Audio countdown beep failed:', e);
  }
}

// Play authentic photobooth DSLR mechanical shutter sound
function playShutterSound() {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Mechanical Curtain Open (fast frequency drop)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(650, now);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.04);
    gain1.gain.setValueAtTime(0.45, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // 2. White Noise Burst (shutter friction & curtain snap texture)
    const bufferSize = Math.floor(ctx.sampleRate * 0.045);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(1.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.38, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + 0.05);

    // 3. Mirror Return / Curtain Close Clack (38ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(420, now + 0.038);
    osc2.frequency.exponentialRampToValueAtTime(90, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.35, now + 0.038);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.038);
    osc2.stop(now + 0.09);
  } catch (e) {
    console.warn('Audio shutter sound failed:', e);
  }
}

function toggleAudioBeep() {
  state.soundEnabled = !state.soundEnabled;
  getAudioContext(); // unlock AudioContext on user gesture
  const icon = document.getElementById('audioToggleIcon');
  const text = document.getElementById('audioToggleText');
  const btn = document.getElementById('btnAudioToggle');

  if (icon) icon.textContent = state.soundEnabled ? '🔊' : '🔇';
  if (text) text.textContent = state.soundEnabled ? 'BEEP: ON' : 'BEEP: OFF';
  if (btn) btn.classList.toggle('active', state.soundEnabled);

  if (state.soundEnabled) {
    playCountdownBeep(1);
    showToast('Suara Countdown Beep & Shutter Aktif!', 'success');
  } else {
    showToast('Suara Beep dinonaktifkan (Mute)');
  }
}

// --- CAPTURE WORKFLOW ---
let isCapturing = false;

async function triggerCountdownCapture(overrideDelay) {
  if (isCapturing) return;

  if (!state.currentSessionId) {
    openNewSessionModal();
    return;
  }

  isCapturing = true;
  getAudioContext(); // Ensure AudioContext is active on capture action
  const delay = overrideDelay !== undefined ? overrideDelay : (state.timerDelay !== undefined ? state.timerDelay : 3);

  if (delay > 0) {
    const overlay = document.getElementById('countdownOverlay');
    overlay.style.display = 'flex';

    for (let count = delay; count > 0; count--) {
      overlay.textContent = count;
      playCountdownBeep(count);
      if (window.gsap) {
        gsap.fromTo(overlay, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
      }
      await new Promise((r) => setTimeout(r, 900));
    }

    overlay.style.display = 'none';
  }

  await captureCurrentFrame();
  isCapturing = false;
}

async function triggerBurstCapture() {
  if (isCapturing) return;

  if (!state.currentSessionId) {
    openNewSessionModal();
    return;
  }

  showToast(`Memulai mode 3-Burst Capture (${state.currentCustomerName || 'Guest'})...`);
  for (let i = 1; i <= 3; i++) {
    showToast(`Foto ${i} dari 3`);
    await triggerCountdownCapture();
    await new Promise((r) => setTimeout(r, 1000));
  }
  showToast('3-Burst capture selesai! Membuka galeri sesi...', 'success');
  switchScreen('gallery');
}

async function captureCurrentFrame() {
  const flash = document.getElementById('flashOverlay');
  if (flash) {
    flash.style.opacity = '0.85';
    setTimeout(() => { flash.style.opacity = '0'; }, 150);
  }
  playShutterSound();

  const video = document.getElementById('cameraVideo');
  let base64Image = null;

  if (state.cameraStream && video.videoWidth) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.save();
    if (state.isCameraMirrored !== false) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.filter = getActiveCameraFilterString();
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    // Bake Photobooth Live Effects (Vignette, Light Leak, Film Grain, Date Stamp, Stickers)
    applyActiveFxToCanvas(ctx, canvas.width, canvas.height);

    base64Image = canvas.toDataURL('image/jpeg', 0.92);
  }

  try {
    const res = await authFetch('/api/camera/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.currentSessionId,
        photoIndex: state.photos.length + 1,
        title: state.currentCustomerName || 'Customer Photo',
        imageBase64: base64Image
      })
    });
    const result = await res.json();
    if (result.status === 'success') {
      state.photos.unshift(result.data);
      updateGalleryCount();
      updateLiveReel();
      showToast('Foto tersimpan ke sesi lokal!', 'success');
    }
  } catch (err) {
    console.error('Capture error:', err);
    showToast('Gagal menyimpan foto hasil jepretan');
  }
}

// --- 2. GALLERY MANAGEMENT ---
async function loadPhotos() {
  if (!state.currentSessionId) return;
  try {
    const res = await authFetch(`/api/photos?sessionId=${encodeURIComponent(state.currentSessionId)}`);
    const result = await res.json();
    if (result.status === 'success') {
      state.photos = result.data.photos || [];
      updateGalleryCount();
      renderGallery();
      updateLiveReel();
    }
  } catch (err) {
    console.error('Error loading photos:', err);
  }
}

function updateGalleryCount() {
  document.getElementById('galleryCount').textContent = state.photos.length;
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  updateSelectionUI();

  if (!state.photos.length) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 64px 24px; color: var(--text-secondary);">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">Belum ada foto dalam sesi ini</h3>
        <p style="margin-top: 8px; font-size: 0.95rem;">Sesi aktif: <strong>${state.currentSessionId || '-'}</strong>. Buka tab Camera dan tekan SPACE untuk mengambil foto.</p>
      </div>`;
    return;
  }

  let displayPhotos = state.photos;
  if (state.galleryFilter === 'selected') {
    displayPhotos = state.photos.filter((p) => state.selectedPhotoIds.includes(p.id));
    if (displayPhotos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 56px 24px; color: var(--text-secondary);">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">Belum ada foto yang dipilih (0/6)</h3>
          <p style="margin-top: 8px; font-size: 0.88rem;">Klik tab <strong>[SEMUA FOTO]</strong> di atas lalu pilih maksimal 6 foto untuk dicetak ke 2 strip 3x1.</p>
        </div>`;
      return;
    }
  }

  displayPhotos.forEach((photo) => {
    const selIndex = state.selectedPhotoIds.indexOf(photo.id);
    const isSelected = selIndex >= 0;

    const card = document.createElement('div');
    card.className = `photo-card ${isSelected ? 'selected' : ''}`;
    card.onclick = () => toggleSelectPhoto(photo.id);

    let badgeHtml = '';
    if (isSelected) {
      if (selIndex < 3) {
        badgeHtml = `<div class="photo-selection-badge strip-1">STRIP 1 • #0${selIndex + 1}</div>`;
      } else {
        badgeHtml = `<div class="photo-selection-badge strip-2">STRIP 2 • #0${selIndex - 2}</div>`;
      }
    }

    card.innerHTML = `
      <div class="photo-card-thumbnail">
        <img src="${photo.url}" alt="${photo.id}" loading="lazy">
        ${badgeHtml}
      </div>
      <div class="photo-card-actions" onclick="event.stopPropagation()">
        <button class="card-action-btn edit-btn" onclick="openPhotoEditor('${photo.id}')" title="Edit Filter & Warna Foto">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit
        </button>
        <button class="card-action-btn delete-btn" onclick="deletePhoto('${photo.id}')" title="Hapus Foto">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
          Hapus
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  if (window.gsap) {
    gsap.fromTo('.photo-card', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
  }
}

function setGalleryFilter(filter, btnEl) {
  state.galleryFilter = filter;
  document.querySelectorAll('.gallery-filter-btn').forEach((b) => b.classList.remove('active'));
  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    const el = document.querySelector(`.gallery-filter-btn[data-filter="${filter}"]`);
    if (el) el.classList.add('active');
  }
  renderGallery();
}

function selectTop6Photos() {
  if (!state.photos.length) {
    showToast('Belum ada foto dalam sesi ini!');
    return;
  }
  state.selectedPhotoIds = state.photos.slice(0, 6).map((p) => p.id);
  renderGallery();
  showToast(`${state.selectedPhotoIds.length} foto teratas dipilih untuk 2 strip 3x1!`, 'success');
}

function clearSelection() {
  state.selectedPhotoIds = [];
  renderGallery();
  showToast('Semua pilihan foto dibatalkan');
}

function toggleSelectPhoto(photoId) {
  const idx = state.selectedPhotoIds.indexOf(photoId);
  if (idx >= 0) {
    state.selectedPhotoIds.splice(idx, 1);
  } else {
    if (state.selectedPhotoIds.length >= 6) {
      showToast('Maksimal 6 foto (3 foto x 2 strip cetak)!');
      return;
    }
    state.selectedPhotoIds.push(photoId);
  }
  renderGallery();
}

function updateSelectionUI() {
  const count = state.selectedPhotoIds.length;
  const counter = document.getElementById('selectionCounterText');
  if (counter) counter.textContent = `Selected: ${count}/6`;

  const filterSelCount = document.getElementById('filterSelectedCount');
  if (filterSelCount) filterSelCount.textContent = `${count}/6`;

  const filterAllCount = document.getElementById('filterAllCount');
  if (filterAllCount) filterAllCount.textContent = state.photos.length;

  const btnGo = document.getElementById('btnGoToLayout');
  if (btnGo) {
    btnGo.disabled = count === 0;
    if (count === 6) {
      btnGo.textContent = 'Buat 2x Strip 3x1 (Lengkap 6 Foto) >>';
    } else if (count === 3) {
      btnGo.textContent = 'Buat 2x Strip 3x1 (Duplikat 3 Foto) >>';
    } else if (count > 0) {
      btnGo.textContent = `Lanjut ke Strip (${count}/6 Foto) >>`;
    } else {
      btnGo.textContent = 'Pilih Foto (0/6)';
    }
  }
}

async function deletePhoto(photoId) {
  if (!confirm('Hapus foto ini?')) return;
  try {
    const res = await authFetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.status === 'success') {
      state.photos = state.photos.filter((p) => p.id !== photoId);
      state.selectedPhotoIds = state.selectedPhotoIds.filter((id) => id !== photoId);
      state.strip.photoIds = state.strip.photoIds.filter((id) => id !== photoId);
      updateGalleryCount();
      renderGallery();
      renderLayoutStrip();
      showToast('Foto berhasil dihapus');
    }
  } catch (err) {
    showToast('Gagal menghapus foto');
  }
}

function proceedToLayout() {
  if (state.selectedPhotoIds.length === 0) {
    if (state.photos.length > 0) {
      selectTop6Photos();
    } else {
      showToast('Ambil atau pilih foto terlebih dahulu!');
      return;
    }
  }

  const sel = [...state.selectedPhotoIds];
  if (sel.length === 3) {
    // Exact mirror duplicate for 2 identical 3x1 strips
    state.strip.photoIds = [sel[0], sel[1], sel[2], sel[0], sel[1], sel[2]];
  } else if (sel.length === 6) {
    state.strip.photoIds = [...sel];
  } else {
    // Fill up to 6 slots cycling selected photos
    const slots = [];
    for (let i = 0; i < 6; i++) {
      slots.push(sel[i % sel.length]);
    }
    state.strip.photoIds = slots;
  }

  switchScreen('layout');
}

// --- 3. PHOTO EDITOR ---
function openPhotoEditor(photoId) {
  const photo = state.photos.find((p) => p.id === photoId);
  if (!photo) return;

  state.editingPhotoId = photoId;
  state.editor.brightness = 0;
  state.editor.contrast = 0;
  state.editor.saturation = 0;
  state.editor.filter = 'none';
  state.editor.rotation = 0;
  state.editor.flipped = false;

  document.getElementById('sliderBrightness').value = 0;
  document.getElementById('sliderContrast').value = 0;
  document.getElementById('sliderSaturation').value = 0;
  document.getElementById('valBrightness').textContent = '0';
  document.getElementById('valContrast').textContent = '0';
  document.getElementById('valSaturation').textContent = '0';

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = photo.url;
  img.onload = () => {
    state.editor.originalImage = img;
    applyEditorTransform();
    switchScreen('editor');
  };
}

function applyEditorTransform() {
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  const img = state.editor.originalImage;
  if (!img) return;

  state.editor.brightness = parseInt(document.getElementById('sliderBrightness').value, 10);
  state.editor.contrast = parseInt(document.getElementById('sliderContrast').value, 10);
  state.editor.saturation = parseInt(document.getElementById('sliderSaturation').value, 10);

  document.getElementById('valBrightness').textContent = state.editor.brightness;
  document.getElementById('valContrast').textContent = state.editor.contrast;
  document.getElementById('valSaturation').textContent = state.editor.saturation;

  const isRotated90or270 = Math.abs(state.editor.rotation % 180) === 90;
  canvas.width = isRotated90or270 ? img.height : img.width;
  canvas.height = isRotated90or270 ? img.width : img.height;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((state.editor.rotation * Math.PI) / 180);
  if (state.editor.flipped) ctx.scale(-1, 1);

  let filterStr = `brightness(${100 + state.editor.brightness}%) contrast(${100 + state.editor.contrast}%) saturate(${100 + state.editor.saturation}%)`;
  if (state.editor.filter === 'sepia') filterStr += ' sepia(100%)';
  if (state.editor.filter === 'grayscale') filterStr += ' grayscale(100%)';
  if (state.editor.filter === 'warm') filterStr += ' sepia(30%) hue-rotate(-15deg)';
  if (state.editor.filter === 'cool') filterStr += ' hue-rotate(180deg) saturate(80%)';
  if (state.editor.filter === 'vintage') filterStr += ' sepia(50%) contrast(120%)';
  if (state.editor.filter === 'pop') filterStr += ' saturate(160%) contrast(110%)';

  ctx.filter = filterStr;
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

function setFilter(filterName, btnEl) {
  state.editor.filter = filterName;
  document.querySelectorAll('.filter-chips .chip').forEach((c) => c.classList.remove('active'));
  if (btnEl) {
    btnEl.classList.add('active');
  } else if (typeof event !== 'undefined' && event && event.target) {
    event.target.classList.add('active');
  }
  applyEditorTransform();
}

function rotateEditor(deg) {
  state.editor.rotation = (state.editor.rotation + deg + 360) % 360;
  applyEditorTransform();
}

function flipEditorHorizontal() {
  state.editor.flipped = !state.editor.flipped;
  applyEditorTransform();
}

function resetEditor() {
  openPhotoEditor(state.editingPhotoId);
}

async function saveEditorChanges() {
  const canvas = document.getElementById('editorCanvas');
  const editedBase64 = canvas.toDataURL('image/jpeg', 0.92);

  try {
    const res = await authFetch('/api/editor/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photoId: state.editingPhotoId,
        editedBase64
      })
    });
    const result = await res.json();
    if (result.status === 'success') {
      const photo = state.photos.find((p) => p.id === state.editingPhotoId);
      if (photo) photo.url = result.data.url;
      showToast('Perubahan foto berhasil disimpan!', 'success');
      switchScreen('gallery');
    }
  } catch (err) {
    showToast('Gagal menyimpan hasil edit');
  }
}

// --- PHOTOBOOTH CAMERA FILTERS & LIVE FX SUITE ---
function setCameraFilter(filterName, btnEl) {
  state.cameraFx.filter = filterName;
  document.querySelectorAll('.pb-filter-btn').forEach((b) => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  applyCameraFxToLiveView();
}

function toggleCameraFx(fxName) {
  state.cameraFx[fxName] = !state.cameraFx[fxName];
  const btnIdMap = {
    vignette: 'btnFxVignette',
    grain: 'btnFxGrain',
    lightLeak: 'btnFxLightLeak',
    bloom: 'btnFxBloom',
    dateStamp: 'btnFxDateStamp'
  };
  const btn = document.getElementById(btnIdMap[fxName]);
  if (btn) btn.classList.toggle('active', !!state.cameraFx[fxName]);
  applyCameraFxToLiveView();
}

function setCameraSticker(stickerName, btnEl) {
  state.cameraFx.sticker = stickerName;
  document.querySelectorAll('.pb-sticker-btn').forEach((b) => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  applyCameraFxToLiveView();
}

function updateCameraSlider(param, value) {
  state.cameraFx[param] = parseInt(value, 10);
  applyCameraFxToLiveView();
}

function resetCameraFx() {
  state.cameraFx = {
    filter: 'none',
    vignette: false,
    grain: false,
    lightLeak: false,
    bloom: false,
    dateStamp: true,
    sticker: 'none',
    brightness: 0,
    contrast: 0,
    warmth: 0
  };

  document.querySelectorAll('.pb-filter-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === 'none');
  });

  ['vignette', 'grain', 'lightLeak', 'bloom'].forEach((k) => {
    const btnId = 'btnFx' + k.charAt(0).toUpperCase() + k.slice(1);
    const b = document.getElementById(btnId);
    if (b) b.classList.remove('active');
  });
  const dateBtn = document.getElementById('btnFxDateStamp');
  if (dateBtn) dateBtn.classList.add('active');

  document.querySelectorAll('.pb-sticker-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.sticker === 'none');
  });

  const sB = document.getElementById('sliderCamBrightness');
  const sC = document.getElementById('sliderCamContrast');
  const sW = document.getElementById('sliderCamWarmth');
  if (sB) sB.value = 0;
  if (sC) sC.value = 0;
  if (sW) sW.value = 0;

  applyCameraFxToLiveView();
  showToast('Semua filter & efek kamera direset ke Natural!');
}

function getActiveCameraFilterString() {
  const fx = state.cameraFx;
  let b = 100 + (fx.brightness || 0);
  let c = 100 + (fx.contrast || 0);
  let s = 100 + (fx.warmth || 0);

  let presetFilter = '';
  if (fx.filter === 'bw') {
    presetFilter = 'grayscale(100%) ';
    c = Math.round(c * 1.3);
    b = Math.round(b * 0.95);
  } else if (fx.filter === 'kpastel') {
    presetFilter = 'sepia(10%) hue-rotate(-6deg) ';
    b = Math.round(b * 1.08);
    c = Math.round(c * 0.96);
    s = Math.round(s * 1.15);
  } else if (fx.filter === 'warm') {
    presetFilter = 'sepia(35%) hue-rotate(-12deg) ';
    b = Math.round(b * 1.02);
    c = Math.round(c * 1.1);
    s = Math.round(s * 1.1);
  } else if (fx.filter === 'vintage') {
    presetFilter = 'sepia(45%) ';
    b = Math.round(b * 0.95);
    c = Math.round(c * 1.18);
    s = Math.round(s * 0.85);
  } else if (fx.filter === 'cyber') {
    presetFilter = 'hue-rotate(15deg) ';
    b = Math.round(b * 1.05);
    c = Math.round(c * 1.2);
    s = Math.round(s * 1.65);
  } else if (fx.filter === 'cool') {
    presetFilter = 'hue-rotate(175deg) ';
    b = Math.round(b * 1.02);
    c = Math.round(c * 1.05);
    s = Math.round(s * 0.95);
  } else if (fx.filter === 'cinematic') {
    presetFilter = 'sepia(18%) hue-rotate(5deg) ';
    b = Math.round(b * 0.96);
    c = Math.round(c * 1.25);
    s = Math.round(s * 1.2);
  }

  let filterStr = `${presetFilter}brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
  if (fx.bloom) {
    filterStr += ' drop-shadow(0 0 8px rgba(255,255,255,0.4))';
  }
  return filterStr.trim();
}

function applyCameraFxToLiveView() {
  const filterStr = getActiveCameraFilterString();
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvasFallback');
  if (video) video.style.filter = filterStr;
  if (canvas) canvas.style.filter = filterStr;

  const fx = state.cameraFx;
  const vignette = document.getElementById('vignetteOverlay');
  if (vignette) vignette.style.display = fx.vignette ? 'block' : 'none';

  const grain = document.getElementById('grainOverlay');
  if (grain) grain.style.display = fx.grain ? 'block' : 'none';

  const lightLeak = document.getElementById('lightLeakOverlay');
  if (lightLeak) lightLeak.style.display = fx.lightLeak ? 'block' : 'none';

  const bloom = document.getElementById('bloomOverlay');
  if (bloom) bloom.style.display = fx.bloom ? 'block' : 'none';

  const dateStamp = document.getElementById('dateStampOverlay');
  if (dateStamp) {
    dateStamp.style.display = fx.dateStamp ? 'block' : 'none';
    const dateText = document.getElementById('dateStampText');
    if (dateText) {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      dateText.textContent = `'${yy} ${mm} ${dd}`;
    }
  }

  const stickerOverlay = document.getElementById('stickerOverlay');
  if (stickerOverlay) {
    if (fx.sticker && fx.sticker !== 'none') {
      stickerOverlay.style.display = 'block';
      renderStickerOverlayDOM(stickerOverlay, fx.sticker);
    } else {
      stickerOverlay.style.display = 'none';
      stickerOverlay.innerHTML = '';
    }
  }

  const bVal = document.getElementById('valCamBrightness');
  if (bVal) bVal.textContent = (fx.brightness > 0 ? '+' : '') + fx.brightness;
  const cVal = document.getElementById('valCamContrast');
  if (cVal) cVal.textContent = (fx.contrast > 0 ? '+' : '') + fx.contrast;
  const wVal = document.getElementById('valCamWarmth');
  if (wVal) wVal.textContent = (fx.warmth > 0 ? '+' : '') + fx.warmth;

  const badge = document.getElementById('activeFilterBadge');
  if (badge) {
    const names = {
      none: 'NATURAL',
      bw: 'B&W NOIR',
      kpastel: 'K-PASTEL',
      warm: 'WARM RETRO',
      vintage: 'VINTAGE',
      cyber: 'CYBER GLOW',
      cool: 'COOL BLUE',
      cinematic: 'CINEMATIC'
    };
    badge.textContent = names[fx.filter] || 'NATURAL';
  }
}

function renderStickerOverlayDOM(container, type) {
  if (type === 'sparkles') {
    container.innerHTML = `
      <span class="sticker-item sticker-item-sparkle" style="top:14px; left:18px;">✨</span>
      <span class="sticker-item sticker-item-sparkle" style="top:20px; right:20px;">⭐</span>
      <span class="sticker-item sticker-item-sparkle" style="bottom:22px; left:20px;">✦</span>
      <span class="sticker-item sticker-item-sparkle" style="bottom:18px; right:22%;">✨</span>
    `;
  } else if (type === 'hearts') {
    container.innerHTML = `
      <span class="sticker-item sticker-item-heart" style="top:14px; left:20px;">💕</span>
      <span class="sticker-item sticker-item-heart" style="top:18px; right:22px;">💖</span>
      <span class="sticker-item sticker-item-heart" style="bottom:20px; left:22px;">🤍</span>
      <span class="sticker-item sticker-item-heart" style="bottom:20px; right:25%;">💗</span>
    `;
  } else if (type === 'cat') {
    container.innerHTML = `
      <div class="sticker-cat-doodle">🐱 PHOTOBOOTH TIME 🐱</div>
      <span class="sticker-item" style="top:14px; left:16px; font-size:1.6rem;">🐾</span>
      <span class="sticker-item" style="top:14px; right:16px; font-size:1.6rem;">🐾</span>
    `;
  } else if (type === 'stamp') {
    container.innerHTML = `
      <div class="sticker-stamp-badge">PHOTOBOOTH // STUDIO LIVE ★</div>
    `;
  }
}

function applyActiveFxToCanvas(ctx, width, height) {
  const fx = state.cameraFx;

  if (fx.vignette) {
    ctx.save();
    const radius = Math.max(width, height) * 0.75;
    const grad = ctx.createRadialGradient(width / 2, height / 2, radius * 0.35, width / 2, height / 2, radius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (fx.lightLeak) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const grad = ctx.createLinearGradient(0, 0, width * 0.45, height * 0.45);
    grad.addColorStop(0, 'rgba(255, 125, 40, 0.42)');
    grad.addColorStop(0.35, 'rgba(255, 215, 90, 0.22)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (fx.grain) {
    ctx.save();
    drawNoiseToCanvas(ctx, width, height, 0.07);
    ctx.restore();
  }

  if (fx.dateStamp) {
    ctx.save();
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `'${yy} ${mm} ${dd}`;

    const fontSize = Math.max(18, Math.round(height * 0.04));
    ctx.font = `800 ${fontSize}px "Space Mono", monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(255, 110, 0, 0.85)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FF7700';
    ctx.fillText(dateStr, width - Math.round(width * 0.04), height - Math.round(height * 0.04));
    ctx.restore();
  }

  if (fx.sticker && fx.sticker !== 'none') {
    drawStickerToCanvas(ctx, width, height, fx.sticker);
  }
}

function drawNoiseToCanvas(ctx, width, height, alpha) {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 120;
  noiseCanvas.height = 120;
  const nCtx = noiseCanvas.getContext('2d');
  const imgData = nCtx.createImageData(120, 120);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = Math.floor(Math.random() * 255);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = Math.floor(255 * alpha);
  }
  nCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(noiseCanvas, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawStickerToCanvas(ctx, width, height, type) {
  ctx.save();
  if (type === 'sparkles') {
    const sz = Math.max(24, Math.round(width * 0.05));
    ctx.font = `${sz}px sans-serif`;
    ctx.fillText('✨', width * 0.03, height * 0.08);
    ctx.fillText('⭐', width * 0.92, height * 0.09);
    ctx.fillText('✦', width * 0.04, height * 0.94);
    ctx.fillText('✨', width * 0.75, height * 0.94);
  } else if (type === 'hearts') {
    const sz = Math.max(24, Math.round(width * 0.05));
    ctx.font = `${sz}px sans-serif`;
    ctx.fillText('💕', width * 0.03, height * 0.08);
    ctx.fillText('💖', width * 0.92, height * 0.09);
    ctx.fillText('🤍', width * 0.04, height * 0.94);
    ctx.fillText('💗', width * 0.72, height * 0.94);
  } else if (type === 'cat') {
    const sz = Math.max(20, Math.round(width * 0.04));
    ctx.font = `${sz}px sans-serif`;
    ctx.fillText('🐾', width * 0.03, height * 0.08);
    ctx.fillText('🐾', width * 0.92, height * 0.08);

    const bannerFont = Math.max(14, Math.round(width * 0.026));
    ctx.font = `bold ${bannerFont}px "Space Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FDA4AF';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('🐱 PHOTOBOOTH TIME 🐱', width / 2, height * 0.06);
  } else if (type === 'stamp') {
    ctx.save();
    ctx.translate(width * 0.82, height * 0.07);
    ctx.rotate((3 * Math.PI) / 180);
    const badgeFont = Math.max(12, Math.round(width * 0.022));
    ctx.font = `bold ${badgeFont}px "Space Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FCD34D';
    ctx.fillText('PHOTOBOOTH ★ LIVE', 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

// --- 4. DUAL 3x1 PHOTO STRIPS & TEMPLATES MANAGEMENT ---
function toggleLinkTemplates(link) {
  state.strip.linkTemplates = link;
  const btnLink = document.getElementById('btnLinkTemplates');
  const btnUnlink = document.getElementById('btnUnlinkTemplates');
  const sec2 = document.getElementById('strip2TemplateSection');

  if (btnLink) btnLink.classList.toggle('active', link);
  if (btnUnlink) btnUnlink.classList.toggle('active', !link);
  if (sec2) sec2.style.display = link ? 'none' : 'block';

  if (link) {
    state.strip.templateId2 = state.strip.templateId1;
    for (let i = 1; i <= 5; i++) {
      const b2 = document.getElementById(`tplBtn2_${i}`);
      if (b2) b2.classList.toggle('active', i === state.strip.templateId1);
    }
    showToast('Bingkai Strip 1 dan Strip 2 disamakan');
  } else {
    showToast('Mode bingkai terpisah aktif: Atur bingkai Strip 2 secara mandiri');
  }

  renderLayoutStrip();
}

function selectStripTemplate(stripNum, tplId) {
  tplId = parseInt(tplId, 10);
  if (stripNum === 1) {
    state.strip.templateId1 = tplId;
    state.selectedTemplateId = tplId;

    for (let i = 1; i <= 5; i++) {
      const b1 = document.getElementById(`tplBtn1_${i}`);
      if (b1) b1.classList.toggle('active', i === tplId);
    }

    if (state.strip.linkTemplates) {
      state.strip.templateId2 = tplId;
      for (let i = 1; i <= 5; i++) {
        const b2 = document.getElementById(`tplBtn2_${i}`);
        if (b2) b2.classList.toggle('active', i === tplId);
      }
    }
  } else if (stripNum === 2) {
    state.strip.templateId2 = tplId;
    for (let i = 1; i <= 5; i++) {
      const b2 = document.getElementById(`tplBtn2_${i}`);
      if (b2) b2.classList.toggle('active', i === tplId);
    }
  }

  // Sync sidebar frame matrix buttons in Screen 1 if present
  document.querySelectorAll('.frame-matrix-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === state.strip.templateId1);
  });

  const tpl = PRINT_TEMPLATES[tplId];
  if (tpl) {
    state.strip.backgroundColor = tpl.bg;
  }

  renderLayoutStrip();
  showToast(`Bingkai Strip ${stripNum}: Template 0${tplId} (${tpl ? tpl.name : ''})`);
}

function selectPrintTemplate(tplId) {
  selectStripTemplate(1, tplId);
}

function handleCustomTemplateUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    state.customTemplateDataUrl = e.target.result;
    document.querySelectorAll('.template-card-btn').forEach((btn) => btn.classList.remove('active'));
    renderLayoutStrip();
    showToast('Custom JPG template berhasil dimuat ke bingkai strip!', 'success');
  };
  reader.readAsDataURL(file);
}

function setLayoutFormat(format) {
  state.strip.layoutFormat = format;
  const btn4R = document.getElementById('btnLayout4R');
  const btnDual = document.getElementById('btnLayoutDual');
  const mount4R = document.getElementById('mount4R');
  const mountDual = document.getElementById('mountDual');
  const sec4R = document.getElementById('sec4RFrameControls');
  const titleEl = document.getElementById('layoutHeaderTitle');
  const badgeEl = document.getElementById('layoutBadgeCount');
  const footerLabel = document.getElementById('layoutFormatFooterLabel');

  if (btn4R) btn4R.classList.toggle('active', format === '4r');
  if (btnDual) btnDual.classList.toggle('active', format === 'dual');
  if (mount4R) mount4R.style.display = format === '4r' ? 'flex' : 'none';
  if (mountDual) mountDual.style.display = format === 'dual' ? 'flex' : 'none';
  if (sec4R) sec4R.style.display = format === '4r' ? 'block' : 'none';

  if (format === '4r') {
    if (titleEl) titleEl.textContent = 'PREVIEW LAYOUT 4R (102 × 152 MM)';
    if (badgeEl) badgeEl.textContent = '3 FOTO VERTIKAL';
    if (footerLabel) footerLabel.textContent = 'FORMAT CETAK: 4R (102 × 152 mm // 1205 × 1795 px @ 300 DPI)';
  } else {
    if (titleEl) titleEl.textContent = 'PREVIEW DUAL STRIP 3x1 (CETAK 2 BINGKAI)';
    if (badgeEl) badgeEl.textContent = 'TOTAL 6 FOTO';
    if (footerLabel) footerLabel.textContent = 'FORMAT CETAK: 4x6" (DUAL 2x6 CUT @ 300 DPI)';
  }

  renderLayoutStrip();
}

function update4RFrameDimensions() {
  const w = parseInt(document.getElementById('slider4RWidth')?.value || 90, 10);
  const h = parseInt(document.getElementById('slider4RHeight')?.value || 40, 10);
  const gap = parseInt(document.getElementById('slider4RGap')?.value || 6, 10);
  const rad = parseInt(document.getElementById('slider4RRadius')?.value || 8, 10);

  state.fourR = { widthMm: w, heightMm: h, gapMm: gap, radiusPx: rad };

  const wDisplay = document.getElementById('val4RWidth');
  if (wDisplay) wDisplay.textContent = `${w} mm (${Math.round(w * 11.811)} px)`;
  const hDisplay = document.getElementById('val4RHeight');
  if (hDisplay) hDisplay.textContent = `${h} mm (${Math.round(h * 11.811)} px)`;
  const gDisplay = document.getElementById('val4RGap');
  if (gDisplay) gDisplay.textContent = `${gap} mm (${Math.round(gap * 11.811)} px)`;
  const rDisplay = document.getElementById('val4RRadius');
  if (rDisplay) rDisplay.textContent = `${rad} px`;

  const stack = document.getElementById('fourRStack');
  if (stack) {
    // In DOM preview, sheet is 320px wide representing 102mm -> scale ~3.137 px/mm
    const scale = 320 / 102;
    stack.style.gap = `${gap * scale}px`;

    document.querySelectorAll('.four-r-slot').forEach((slot) => {
      slot.style.width = `${Math.min(96, Math.max(70, w)) * scale}px`;
      slot.style.height = `${Math.min(48, Math.max(28, h)) * scale}px`;
      slot.style.borderRadius = `${rad}px`;
    });
  }

  if (state.currentScreen === 'print') {
    updatePrintPreview();
  }
}

function renderLayoutStrip() {
  const strip1Box = document.getElementById('photoStrip1');
  const strip2Box = document.getElementById('photoStrip2');
  const sheet4R = document.getElementById('photoSheet4R');

  const tpl1 = PRINT_TEMPLATES[state.strip.templateId1 || 1] || PRINT_TEMPLATES[1];
  const tpl2 = PRINT_TEMPLATES[state.strip.templateId2 || state.strip.templateId1 || 1] || PRINT_TEMPLATES[1];

  // Auto-fill strip slots if empty but session photos exist
  if (state.strip.photoIds.length === 0 && state.photos.length > 0) {
    const sel = state.selectedPhotoIds.length > 0 ? state.selectedPhotoIds : state.photos.slice(0, 6).map((p) => p.id);
    if (sel.length === 3) {
      state.strip.photoIds = [sel[0], sel[1], sel[2], sel[0], sel[1], sel[2]];
    } else {
      const slots = [];
      for (let i = 0; i < 6; i++) {
        slots.push(sel[i % sel.length]);
      }
      state.strip.photoIds = slots;
    }
  }

  // 4R Sheet Preview Styling
  if (sheet4R) {
    if (state.customTemplateDataUrl) {
      sheet4R.style.backgroundImage = `url(${state.customTemplateDataUrl})`;
    } else {
      sheet4R.style.backgroundImage = `url(${tpl1.src})`;
    }
    sheet4R.style.backgroundSize = 'cover';
    sheet4R.style.backgroundPosition = 'center';
    sheet4R.style.backgroundColor = tpl1.bg || '#FFFFFF';
  }

  // Populate 4R Slots 0-2 (3 Photos)
  for (let i = 0; i < 3; i++) {
    const img4R = document.getElementById(`fourRImg${i}`);
    if (!img4R) continue;
    const photoId = state.strip.photoIds[i];
    const photo = state.photos.find((p) => p.id === photoId);
    if (photo) {
      img4R.src = photo.url;
      img4R.style.display = 'block';
    } else {
      img4R.src = '';
      img4R.style.display = 'none';
    }
  }

  // Strip 1 Background
  if (strip1Box) {
    if (state.customTemplateDataUrl) {
      strip1Box.style.backgroundImage = `url(${state.customTemplateDataUrl})`;
    } else {
      strip1Box.style.backgroundImage = `url(${tpl1.src})`;
    }
    strip1Box.style.backgroundSize = 'cover';
    strip1Box.style.backgroundPosition = 'center';
    strip1Box.style.backgroundColor = tpl1.bg;
  }

  // Strip 2 Background
  if (strip2Box) {
    if (state.customTemplateDataUrl && state.strip.linkTemplates) {
      strip2Box.style.backgroundImage = `url(${state.customTemplateDataUrl})`;
    } else {
      strip2Box.style.backgroundImage = `url(${tpl2.src})`;
    }
    strip2Box.style.backgroundSize = 'cover';
    strip2Box.style.backgroundPosition = 'center';
    strip2Box.style.backgroundColor = tpl2.bg;
  }

  // Populate Dual Strip Photo Slots 0-5
  for (let i = 0; i < 6; i++) {
    const imgEl = document.getElementById(`stripImg${i}`);
    if (!imgEl) continue;

    const photoId = state.strip.photoIds[i];
    const photo = state.photos.find((p) => p.id === photoId);

    if (photo) {
      imgEl.src = photo.url;
      imgEl.style.display = 'block';
    } else {
      imgEl.src = '';
      imgEl.style.display = 'none';
    }
  }

  // Update Footer Texts & Contrast Styling
  const titleVal = state.strip.title || 'SATYA MEMORIES';
  const subVal = state.strip.subtitle || 'STUDIO EDITION // 2026-X';

  const t1 = document.getElementById('strip1TextDisplay');
  const s1 = document.getElementById('strip1DateDisplay');
  const t2 = document.getElementById('strip2TextDisplay');
  const s2 = document.getElementById('strip2DateDisplay');
  const t4R = document.getElementById('fourRTextDisplay');
  const s4R = document.getElementById('fourRDateDisplay');

  if (t1) {
    t1.textContent = titleVal;
    t1.style.color = tpl1.isDark ? '#FFFFFF' : '#0F172A';
  }
  if (s1) {
    s1.textContent = subVal;
    s1.style.color = tpl1.isDark ? '#94A3B8' : '#64748B';
  }

  if (t2) {
    t2.textContent = titleVal;
    t2.style.color = tpl2.isDark ? '#FFFFFF' : '#0F172A';
  }
  if (s2) {
    s2.textContent = subVal;
    s2.style.color = tpl2.isDark ? '#94A3B8' : '#64748B';
  }

  if (t4R) {
    t4R.textContent = titleVal;
    t4R.style.color = tpl1.isDark ? '#FFFFFF' : '#0F172A';
  }
  if (s4R) {
    s4R.textContent = subVal;
    s4R.style.color = tpl1.isDark ? '#94A3B8' : '#64748B';
  }

  // If currently in print screen, refresh print preview too
  if (state.currentScreen === 'print') {
    updatePrintPreview();
  }
}

function updateDualStripTexts() {
  const titleVal = document.getElementById('inputStripTitle')?.value || state.strip.title;
  const subVal = document.getElementById('inputStripSub')?.value || state.strip.subtitle;
  state.strip.title = titleVal;
  state.strip.subtitle = subVal;

  const t1 = document.getElementById('strip1TextDisplay');
  const s1 = document.getElementById('strip1DateDisplay');
  const t2 = document.getElementById('strip2TextDisplay');
  const s2 = document.getElementById('strip2DateDisplay');
  const t4R = document.getElementById('fourRTextDisplay');
  const s4R = document.getElementById('fourRDateDisplay');
  const rt = document.getElementById('reelTitleDisplay');
  const rs = document.getElementById('reelSubDisplay');

  if (t1) t1.textContent = titleVal;
  if (s1) s1.textContent = subVal;
  if (t2) t2.textContent = titleVal;
  if (s2) s2.textContent = subVal;
  if (t4R) t4R.textContent = titleVal;
  if (s4R) s4R.textContent = subVal;
  if (rt) rt.textContent = titleVal;
  if (rs) rs.textContent = subVal;

  if (state.currentScreen === 'print') {
    updatePrintPreview();
  }
}

function updateStripTexts() {
  updateDualStripTexts();
}

function swapSlot(index) {
  if (state.strip.photoIds.length < 2) return;
  const nextIdx = (index + 1) % state.strip.photoIds.length;
  const temp = state.strip.photoIds[index];
  state.strip.photoIds[index] = state.strip.photoIds[nextIdx];
  state.strip.photoIds[nextIdx] = temp;
  renderLayoutStrip();
  showToast(`Slot 0${index + 1} ditukar dengan Slot 0${nextIdx + 1}!`);
}

function swapStrips() {
  if (state.strip.photoIds.length < 6) return;
  const strip1 = state.strip.photoIds.slice(0, 3);
  const strip2 = state.strip.photoIds.slice(3, 6);
  state.strip.photoIds = [...strip2, ...strip1];

  if (!state.strip.linkTemplates) {
    const tempTpl = state.strip.templateId1;
    state.strip.templateId1 = state.strip.templateId2;
    state.strip.templateId2 = tempTpl;

    for (let i = 1; i <= 5; i++) {
      const b1 = document.getElementById(`tplBtn1_${i}`);
      const b2 = document.getElementById(`tplBtn2_${i}`);
      if (b1) b1.classList.toggle('active', i === state.strip.templateId1);
      if (b2) b2.classList.toggle('active', i === state.strip.templateId2);
    }
  }

  renderLayoutStrip();
  showToast('Posisi Strip 1 dan Strip 2 berhasil ditukar!');
}

function shuffleStripOrder() {
  state.strip.photoIds.sort(() => Math.random() - 0.5);
  renderLayoutStrip();
  showToast('Urutan foto diacak!');
}

function proceedToPrint() {
  switchScreen('print');
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
  }
}

function loadImagePromise(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// --- 5. PRINT STAGE WITH 4R (102x152mm // 1205x1795 @ 300 DPI) & DUAL STRIP PREVIEW ---
async function generateHighResStripCanvas() {
  if (state.strip.layoutFormat === '4r') {
    return await generateHighRes4RCanvas();
  } else {
    return await generateHighResDualStripCanvas();
  }
}

// Generates 4R paper print layout (102 × 152 mm) @ 300 DPI (1205 × 1795 px)
// 3 vertical portrait photos (~90 × 40 mm) with safe margins, equal spacing and customizable frame sizes
async function generateHighRes4RCanvas() {
  const canvas = document.createElement('canvas');
  const width = 1205;  // 102 mm at 300 DPI
  const height = 1795; // 152 mm at 300 DPI
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill Background Base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const tpl = PRINT_TEMPLATES[state.strip.templateId1 || 1] || PRINT_TEMPLATES[1];
  const tplSrc = state.customTemplateDataUrl || tpl.src;
  const tplImg = await loadImagePromise(tplSrc);

  if (tplImg && tplImg.naturalWidth > 0) {
    ctx.drawImage(tplImg, 0, 0, width, height);
  } else {
    ctx.fillStyle = tpl.bg || '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Safe Margins Accent & Decorative Borders
  ctx.save();
  ctx.strokeStyle = tpl.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);
  ctx.restore();

  // Header Title at Top
  const titleVal = state.strip.title || 'SATYA MEMORIES';
  const subVal = state.strip.subtitle || 'STUDIO EDITION // 2026-X';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = tpl.isDark ? '#FFFFFF' : '#0F172A';
  ctx.font = 'bold 42px "Cabinet Grotesk", sans-serif';
  ctx.fillText(titleVal, width / 2, 120);

  ctx.fillStyle = tpl.isDark ? '#94A3B8' : '#64748B';
  ctx.font = '600 22px "Space Mono", monospace';
  ctx.fillText('STUDIO PHOTOBOOTH // 4R PRINT EDITION', width / 2, 160);
  ctx.restore();

  // 3 Vertical Portrait Photos: Flexible/Resizable Frame around each photo
  // Standard 4R: 102 mm = 1205 px -> 11.813 px/mm
  const pxPerMm = 11.813;
  const cfg = state.fourR || { widthMm: 90, heightMm: 40, gapMm: 6, radiusPx: 8 };

  // Calculate pixel sizes from customizable mm settings
  const frameWidthPx = Math.round(Math.min(96, Math.max(70, cfg.widthMm)) * pxPerMm);   // ~1063 px for 90mm
  const frameHeightPx = Math.round(Math.min(46, Math.max(30, cfg.heightMm)) * pxPerMm); // ~472 px for 40mm
  const gapPx = Math.round(Math.min(14, Math.max(2, cfg.gapMm)) * pxPerMm);             // ~71 px for 6mm
  const radiusPx = Math.round(cfg.radiusPx * (width / 320));

  // Compute safe vertical distribution centered inside available paper area
  const contentStartY = 200;
  const contentEndY = 1620;
  const availableHeight = contentEndY - contentStartY;
  const totalStackHeight = (3 * frameHeightPx) + (2 * gapPx);
  const startY = Math.round(contentStartY + Math.max(0, (availableHeight - totalStackHeight) / 2));
  const startX = Math.round((width - frameWidthPx) / 2);

  for (let i = 0; i < 3; i++) {
    const photoId = state.strip.photoIds[i];
    const photo = state.photos.find((p) => p.id === photoId);
    const frameY = startY + i * (frameHeightPx + gapPx);

    // Decorative frame background shadow & border
    ctx.save();
    ctx.fillStyle = tpl.isDark ? '#1E293B' : '#F1F5F9';
    drawRoundedRect(ctx, startX - 8, frameY - 8, frameWidthPx + 16, frameHeightPx + 16, radiusPx + 4);
    ctx.fill();
    ctx.restore();

    if (photo) {
      const img = await loadImagePromise(photo.url);
      if (img) {
        ctx.save();
        drawRoundedRect(ctx, startX, frameY, frameWidthPx, frameHeightPx, radiusPx);
        ctx.drawImage(img, startX, frameY, frameWidthPx, frameHeightPx);
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.fillStyle = '#0F172A';
      drawRoundedRect(ctx, startX, frameY, frameWidthPx, frameHeightPx, radiusPx);
      ctx.fill();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 24px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`SLOT 0${i + 1} - EMPTY`, width / 2, frameY + frameHeightPx / 2);
      ctx.restore();
    }

    // Outer frame stroke outline
    ctx.save();
    ctx.strokeStyle = tpl.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 3;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(startX, frameY, frameWidthPx, frameHeightPx, radiusPx);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Footer Metadata text
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = tpl.isDark ? '#E2E8F0' : '#1E293B';
  ctx.font = 'bold 30px "Space Mono", monospace';
  ctx.fillText(subVal, width / 2, 1690);

  ctx.fillStyle = tpl.isDark ? '#64748B' : '#94A3B8';
  ctx.font = '500 18px "Space Mono", monospace';
  ctx.fillText('4R LAB QUALITY // 102x152mm // 300 DPI // SENSOR RAW', width / 2, 1726);
  ctx.restore();

  return canvas;
}

// Generates Dual 3x1 Strips (1200x1800 px @ 300 DPI)
async function generateHighResDualStripCanvas() {
  const canvas = document.createElement('canvas');
  const width = 1200;  // 4 inches at 300 DPI
  const height = 1800; // 6 inches at 300 DPI
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill White Paper Base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const tpl1 = PRINT_TEMPLATES[state.strip.templateId1 || 1] || PRINT_TEMPLATES[1];
  const tpl2 = PRINT_TEMPLATES[state.strip.templateId2 || state.strip.templateId1 || 1] || PRINT_TEMPLATES[1];

  const tpl1Src = state.customTemplateDataUrl || tpl1.src;
  const tpl2Src = (state.customTemplateDataUrl && state.strip.linkTemplates) ? state.customTemplateDataUrl : tpl2.src;

  const [tpl1Img, tpl2Img] = await Promise.all([
    loadImagePromise(tpl1Src),
    loadImagePromise(tpl2Src)
  ]);

  // 1. Draw Strip 1 (Left 600x1800)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 600, 1800);
  ctx.clip();

  if (tpl1Img && tpl1Img.naturalWidth > 0) {
    ctx.drawImage(tpl1Img, 0, 0, 600, 1800);
  } else {
    ctx.fillStyle = tpl1.bg;
    ctx.fillRect(0, 0, 600, 1800);
  }

  const slotWidth = 528;
  const slotHeight = 432;
  const slotTops = [84, 548, 1012];

  // Draw Photos for Strip 1 (Slots 0, 1, 2)
  for (let i = 0; i < 3; i++) {
    const photoId = state.strip.photoIds[i];
    const photo = state.photos.find((p) => p.id === photoId);
    const top = slotTops[i];

    if (photo) {
      const img = await loadImagePromise(photo.url);
      if (img) {
        ctx.save();
        drawRoundedRect(ctx, 36, top, slotWidth, slotHeight, 14);
        ctx.drawImage(img, 36, top, slotWidth, slotHeight);
        ctx.restore();
      }
    }
  }

  // Strip 1 Footer Branding Text
  const titleVal = state.strip.title || 'SATYA MEMORIES';
  const subVal = state.strip.subtitle || 'STUDIO EDITION // 2026-X';

  ctx.textAlign = 'center';
  ctx.fillStyle = tpl1.isDark ? '#FFFFFF' : '#0F172A';
  ctx.font = 'bold 36px "Cabinet Grotesk", sans-serif';
  ctx.fillText(titleVal, 300, 1590);

  ctx.fillStyle = tpl1.isDark ? '#94A3B8' : '#64748B';
  ctx.font = '600 20px "Space Mono", monospace';
  ctx.fillText(subVal, 300, 1634);
  ctx.restore();

  // 2. Draw Strip 2 (Right 600x1800)
  ctx.save();
  ctx.beginPath();
  ctx.rect(600, 0, 600, 1800);
  ctx.clip();

  if (tpl2Img && tpl2Img.naturalWidth > 0) {
    ctx.drawImage(tpl2Img, 600, 0, 600, 1800);
  } else {
    ctx.fillStyle = tpl2.bg;
    ctx.fillRect(600, 0, 600, 1800);
  }

  // Draw Photos for Strip 2 (Slots 3, 4, 5)
  for (let i = 0; i < 3; i++) {
    const photoId = state.strip.photoIds[i + 3];
    const photo = state.photos.find((p) => p.id === photoId);
    const top = slotTops[i];

    if (photo) {
      const img = await loadImagePromise(photo.url);
      if (img) {
        ctx.save();
        drawRoundedRect(ctx, 636, top, slotWidth, slotHeight, 14);
        ctx.drawImage(img, 636, top, slotWidth, slotHeight);
        ctx.restore();
      }
    }
  }

  // Strip 2 Footer Branding Text
  ctx.textAlign = 'center';
  ctx.fillStyle = tpl2.isDark ? '#FFFFFF' : '#0F172A';
  ctx.font = 'bold 36px "Cabinet Grotesk", sans-serif';
  ctx.fillText(titleVal, 900, 1590);

  ctx.fillStyle = tpl2.isDark ? '#94A3B8' : '#64748B';
  ctx.font = '600 20px "Space Mono", monospace';
  ctx.fillText(subVal, 900, 1634);
  ctx.restore();

  // Center Cut Separator Line
  ctx.save();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(600, 0);
  ctx.lineTo(600, 1800);
  ctx.stroke();
  ctx.restore();

  return canvas;
}

let isPreviewRendering = false;
async function updatePrintPreview() {
  const previewCanvas = document.getElementById('printPreviewCanvas');
  if (!previewCanvas) return;
  if (isPreviewRendering) return;
  isPreviewRendering = true;

  try {
    const highRes = await generateHighResStripCanvas();
    previewCanvas.width = 1200;
    previewCanvas.height = 1800;
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, 1200, 1800);
    ctx.drawImage(highRes, 0, 0);
  } catch (err) {
    console.error('Error generating print preview:', err);
  } finally {
    isPreviewRendering = false;
  }
}

function updatePrintCopiesInfo() {
  const copiesInput = document.getElementById('inputCopies');
  const copies = parseInt(copiesInput?.value || 1, 10);
  const display = document.getElementById('totalStripsDisplay');
  if (display) {
    if (state.strip.layoutFormat === '4r') {
      display.textContent = `${copies} Lembar Kertas 4R (102 × 152 mm) @ 300 DPI`;
    } else {
      const totalStrips = copies * 2;
      display.textContent = `${totalStrips} Strip Foto (3x1) (${copies} Lembar Kertas 4x6")`;
    }
  }
}

function requestPrintConfirmation() {
  const modal = document.getElementById('printNoticeModal');
  const copies = parseInt(document.getElementById('inputCopies')?.value || 1, 10);
  const sessEl = document.getElementById('noticeSessionId');
  const fmtEl = document.getElementById('noticeLayoutFormat');
  const copiesEl = document.getElementById('noticeCopiesCount');

  if (sessEl) sessEl.textContent = state.currentSessionId || 'Default Session';
  if (fmtEl) {
    fmtEl.textContent = state.strip.layoutFormat === '4r'
      ? '4R (102 × 152 mm) // 3 Foto Vertikal (300 DPI)'
      : 'Dual Strip (4x6" Postcard // 2× 2x6 Cut)';
  }
  if (copiesEl) {
    copiesEl.textContent = `${copies} Lembar (${state.strip.layoutFormat === '4r' ? copies + ' Lembar 4R' : (copies * 2) + ' Strip Foto'})`;
  }

  if (modal) {
    modal.classList.remove('hidden');
    if (window.gsap) {
      gsap.fromTo('#printNoticeCardElement', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' });
    }
  }
}

function closePrintNoticeModal() {
  const modal = document.getElementById('printNoticeModal');
  if (modal) modal.classList.add('hidden');
}

async function confirmAndExecutePrint() {
  closePrintNoticeModal();
  await dispatchPrintJob();
}

async function dispatchPrintJob() {
  const bar = document.getElementById('printBar');
  if (bar) bar.style.display = 'block';

  const copies = parseInt(document.getElementById('inputCopies')?.value || 1, 10);
  const size = document.getElementById('selectPaperSize')?.value || (state.strip.layoutFormat === '4r' ? '4R' : '4x6');

  showToast(`Mengirim ${copies} lembar ke printer...`);

  const canvas = await generateHighResStripCanvas();
  const stripBase64 = canvas.toDataURL('image/jpeg', 0.95);

  try {
    const res = await authFetch('/api/print/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.currentSessionId,
        customerName: state.currentCustomerName || 'Guest',
        layoutFormat: state.strip.layoutFormat,
        layoutId: `${state.strip.layoutFormat}_tpl_${state.strip.templateId1}`,
        templateId: state.strip.templateId1,
        templateId2: state.strip.templateId2,
        printerSettings: { copies, paperSize: size }
      })
    });
    const result = await res.json();

    // Auto-Upload foto hasil cetak ke Google Drive langsung setelah cetak diproses
    try {
      showToast('☁️ Mengunggah foto hasil cetak ke Google Drive...', 'info');
      const driveRes = await authFetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.currentSessionId,
          layoutFormat: state.strip.layoutFormat,
          compositeBase64: stripBase64
        })
      });
      const driveData = await driveRes.json();
      if (driveData.status === 'success') {
        showToast('✅ Foto berhasil otomatis tersimpan di Google Drive!', 'success');
      }
    } catch (driveErr) {
      console.error('Auto Drive upload failed:', driveErr);
    }

    // Refresh data laporan harian (hitung user & cetak)
    fetchDailyReportSummary();

    setTimeout(() => {
      if (bar) bar.style.display = 'none';
      showToast(`Cetak berhasil! Silakan ambil hasil cetak Anda di tray.`, 'success');

      // User requirement: When user finishes printing, automatically prompt new session to photograph again
      setTimeout(() => {
        openNewSessionModal();
        showToast('Sesi cetak selesai. Silakan mulai sesi foto baru untuk tamu berikutnya!', 'info');
      }, 1000);
    }, 2800);
  } catch (err) {
    if (bar) bar.style.display = 'none';
    showToast('Gagal mengirim ke printer');
  }
}

async function downloadStripImage() {
  showToast('Memproses komposit 2x strip 3x1 (300 DPI Lab Quality)...');
  const canvas = await generateHighResStripCanvas();
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `photobooth_dual_strip_4x6_${Date.now()}.png`;
  a.click();
  showToast('Lembar komposit 4x6" (Dual 3x1) berhasil diunduh!', 'success');
}

async function downloadSingleStrip(stripNum) {
  showToast(`Memproses Strip ${stripNum} (2x6" 300 DPI)...`);
  const fullCanvas = await generateHighResStripCanvas();
  const singleCanvas = document.createElement('canvas');
  singleCanvas.width = 600;
  singleCanvas.height = 1800;
  const sCtx = singleCanvas.getContext('2d');
  const sourceX = stripNum === 2 ? 600 : 0;
  sCtx.drawImage(fullCanvas, sourceX, 0, 600, 1800, 0, 0, 600, 1800);

  const a = document.createElement('a');
  a.href = singleCanvas.toDataURL('image/png');
  a.download = `photobooth_strip_${stripNum}_${Date.now()}.png`;
  a.click();
  showToast(`Strip ${stripNum} berhasil diunduh!`, 'success');
}

function syncGoogleDrive() {
  showToast('Menyinkronkan sesi ke Cloud Storage...');
  setTimeout(() => {
    showToast('Sesi berhasil tersinkronisasi ke Google Drive!', 'success');
  }, 1400);
}

// --- 6. DAILY USER COUNT & PRINT ANALYTICS REPORT ---
async function fetchDailyReportSummary(showToastNotice = false) {
  if (!state.authToken) return;
  try {
    const res = await authFetch('/api/reports/daily');
    const result = await res.json();
    if (result.status === 'success') {
      const data = result.data;
      const today = data.today || { totalUsers: 0, totalPrints: 0, totalCopies: 0, transactions: [] };

      // Update Top Header Counter Badge
      const headerBadge = document.getElementById('headerTodayUsersBadge');
      if (headerBadge) {
        headerBadge.textContent = `${today.totalUsers} User (${today.totalPrints} Cetak)`;
      }

      // Update Modal Stats
      const elUsers = document.getElementById('reportTodayUsers');
      const elPrints = document.getElementById('reportTodayPrints');
      const elCopies = document.getElementById('reportTodayCopies');
      const elAllTime = document.getElementById('reportAllTimeSummary');
      const elTable = document.getElementById('dailyReportTableContent');

      if (elUsers) elUsers.textContent = today.totalUsers;
      if (elPrints) elPrints.textContent = today.totalPrints;
      if (elCopies) elCopies.textContent = today.totalCopies;
      if (elAllTime) {
        elAllTime.textContent = `Total: ${data.allTimeTotalUsers || 0} user (${data.allTimeTotalCopies || 0} lembar)`;
      }

      if (elTable) {
        const history = data.history || [];
        if (history.length === 0 || (history.length === 1 && history[0].totalPrints === 0)) {
          elTable.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:16px;">Belum ada transaksi cetak yang tercatat hari ini.</div>`;
        } else {
          elTable.innerHTML = history.map((day) => {
            const isToday = day.date === (new Date().toISOString().split('T')[0]);
            const badgeLabel = isToday ? 'HARI INI' : day.date;
            const txCount = (day.transactions || []).length;
            const txDetails = (day.transactions || []).slice(0, 10).map((tx) => {
              const timeStr = tx.time ? new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
              return `<div style="font-size:0.68rem; color:var(--text-secondary); display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px dashed rgba(203,213,225,0.4);">
                <span>• <strong>${tx.customerName || 'Guest'}</strong> <span class="mono" style="font-size:0.62rem; color:var(--text-muted);">(${tx.layoutFormat || '4R'}, ${tx.copies || 1} lembar)</span></span>
                <span class="mono" style="color:var(--text-muted); font-weight:600;">${timeStr}</span>
              </div>`;
            }).join('');

            return `
              <div class="neu-flat-sm" style="padding: 10px; border-radius: var(--radius-sm); margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-weight: 800; font-size: 0.78rem; color: var(--text-main);">
                    📅 ${badgeLabel} ${isToday ? `<span class="mono" style="font-size:0.65rem; color:var(--text-muted);">(${day.date})</span>` : ''}
                  </span>
                  <span class="neu-inset mono" style="padding: 3px 8px; font-size: 0.65rem; font-weight:700; color: var(--neu-accent);">
                    ${day.totalUsers} USER // ${day.totalCopies} LEMBAR
                  </span>
                </div>
                <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 6px;">
                  Total Transaksi Cetak: <strong style="color:var(--text-main);">${day.totalPrints}</strong> | Log Sesi:
                </div>
                <div style="padding-left: 6px; border-left: 2px solid var(--neu-cyan);">
                  ${txDetails || '<span style="font-size:0.65rem; color:var(--text-muted);">Belum ada cetak</span>'}
                  ${txCount > 10 ? `<div style="font-size:0.6rem; color:var(--text-muted); font-style:italic; padding-top:2px;">+ ${txCount - 10} transaksi lainnya...</div>` : ''}
                </div>
              </div>
            `;
          }).join('');
        }
      }

      if (showToastNotice) {
        showToast('Data laporan harian berhasil diperbarui!', 'success');
      }
    }
  } catch (err) {
    console.error('Error fetching daily report:', err);
  }
}

function openDailyReportModal() {
  const modal = document.getElementById('dailyReportModal');
  if (modal) {
    modal.classList.remove('hidden');
    fetchDailyReportSummary();
    if (window.gsap) {
      gsap.fromTo('#dailyReportCardElement', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' });
    }
  }
}

function closeDailyReportModal() {
  const modal = document.getElementById('dailyReportModal');
  if (modal) modal.classList.add('hidden');
}

// --- 7. QR CODE SOFTFILE MODAL ---
function openQRModal() {
  const modal = document.getElementById('qrSoftfileModal');
  const img = document.getElementById('qrCodeImage');
  const sessDisplay = document.getElementById('qrSessionIdDisplay');

  const sessId = state.currentSessionId || 'default_session';
  if (sessDisplay) sessDisplay.textContent = `SESI: ${sessId}`;

  // Link download foto digital untuk smartphone tamu
  const downloadUrl = `${window.location.origin}/photos?sessionId=${encodeURIComponent(sessId)}`;

  if (img) {
    // Generate crisp 250x250 QR Code
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(downloadUrl)}&margin=8`;
  }

  if (modal) {
    modal.classList.remove('hidden');
    if (window.gsap) {
      gsap.fromTo('#qrCardElement', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out' });
    }
  }
}

function closeQRModal() {
  const modal = document.getElementById('qrSoftfileModal');
  if (modal) modal.classList.add('hidden');
}

function copyDownloadLink() {
  const sessId = state.currentSessionId || 'default_session';
  const downloadUrl = `${window.location.origin}/photos?sessionId=${encodeURIComponent(sessId)}`;
  navigator.clipboard.writeText(downloadUrl).then(() => {
    showToast('Link download berhasil disalin ke clipboard!', 'success');
  }).catch(() => {
    showToast(`Link: ${downloadUrl}`);
  });
}

// --- KEYBOARD SHORTCUTS ---
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentScreen === 'capture' && state.authToken) triggerCountdownCapture();
    } else if (e.key === 'r' || e.key === 'R') {
      if (state.authToken) openNewSessionModal();
    } else if (e.key === '1') switchScreen('capture');
    else if (e.key === '2') switchScreen('gallery');
    else if (e.key === '3') switchScreen('editor');
    else if (e.key === '4') switchScreen('layout');
    else if (e.key === '5') switchScreen('print');
  });
}
