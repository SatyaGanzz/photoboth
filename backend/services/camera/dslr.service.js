const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DSLRService extends EventEmitter {
  constructor() {
    super();
    this.connected = true;
    this.model = 'Canon EOS 5D Mark IV (Simulated/USB Ready)';
    this.battery = '95%';
    this.mode = 'Ready';
    this.settings = {
      iso: 400,
      shutter: '1/250',
      aperture: 'f/8',
      whiteBalance: 'auto',
      quality: 'jpeg'
    };
  }

  async getStatus() {
    return {
      connected: this.connected,
      model: this.model,
      battery: this.battery,
      mode: this.mode,
      liveViewSupported: true,
      liveViewActive: true,
      settings: this.settings
    };
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  async capture(sessionId, photoIndex, base64Data = null) {
    const sessionDir = path.join(__dirname, '../../photos', sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const photoId = `photo_${photoIndex || Date.now()}_${uuidv4().substring(0, 6)}`;
    const filename = `${photoId}.jpg`;
    const targetPath = path.join(sessionDir, filename);

    if (base64Data) {
      // Decode base64 if sent from frontend camera capture
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(targetPath, buffer);
    } else {
      // Fallback generate a realistic sample photobooth frame using SVG-to-JPEG or solid buffer
      const svg = `
      <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF6B81"/>
            <stop offset="100%" stop-color="#FF4757"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="600" cy="380" r="180" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="600" cy="340" r="80" fill="#2C3E50"/>
        <path d="M 460 520 Q 600 450 740 520 Q 600 580 460 520" fill="#2C3E50"/>
        <text x="600" y="700" font-family="Segoe UI, sans-serif" font-size="44" font-weight="bold" fill="#FFFFFF" text-anchor="middle">PHOTOBOOTH STUDIO</text>
        <text x="600" y="760" font-family="Segoe UI, sans-serif" font-size="28" fill="#FFE5E5" text-anchor="middle">Photo #${photoIndex} - ${new Date().toLocaleTimeString()}</text>
      </svg>`;

      try {
        const sharp = require('sharp');
        await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(targetPath);
      } catch (err) {
        // Pure fallback without sharp yet
        fs.writeFileSync(targetPath.replace('.jpg', '.svg'), svg);
      }
    }

    return {
      photoId,
      filename,
      filepath: targetPath,
      url: `/photos/${sessionId}/${filename}`,
      sessionId
    };
  }
}

module.exports = new DSLRService();
