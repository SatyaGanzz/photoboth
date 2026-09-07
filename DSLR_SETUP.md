# 📷 DSLR Camera Setup Guide

Panduan lengkap setup dan konfigurasi DSLR camera untuk Photobooth.

---

## 🎯 Supported Cameras

### Canon
- ✅ EOS 5D Mark IV/III
- ✅ EOS 6D Mark II
- ✅ EOS 7D Mark II
- ✅ EOS R5/R6/R7/R8
- ✅ PowerShot series (beberapa model)

**Note**: Gunakan Canon EOS SDK atau gphoto2

### Nikon
- ✅ D850 / D780
- ✅ D7500 / D7200
- ✅ Z9 / Z8 / Z6 / Z7 series
- ✅ D610 / D700 series

**Note**: Gunakan Nikon SDK atau gphoto2

### Other Brands
- ✅ Sony (via gphoto2)
- ✅ Fujifilm (via gphoto2)
- ✅ Panasonic (via gphoto2)

---

## 🔧 Installation & Setup

### Prerequisites

#### Windows

```bash
# Install Visual C++ Redistributable
# Download from: https://support.microsoft.com/en-us/help/2977003

# Install USB drivers untuk camera
# Canon: https://www.canon.com/en/support/
# Nikon: https://www.nikon.com/en/support/
```

#### macOS

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install gphoto2
brew install gphoto2 libgphoto2

# Install libusb (for USB communication)
brew install libusb
```

#### Linux (Ubuntu/Debian)

```bash
# Install dependencies
sudo apt-get update
sudo apt-get install -y gphoto2 libgphoto2-dev libusb-1.0-0-dev

# Add current user to dialout group (for USB access)
sudo usermod -a -G dialout $USER

# Logout and login untuk apply group changes
```

---

## 🚀 Quick Start - gphoto2 (Cross-platform)

### 1. Check Camera Connection

```bash
# List connected cameras
gphoto2 --auto-detect

# Expected output:
# Model                          Port
# ---------------------          -----
# Canon EOS 5D Mark IV           usb:001,003
```

### 2. Test Camera Control

```bash
# Get camera info
gphoto2 --get-info

# Capture test photo
gphoto2 --capture-image

# List photos on camera
gphoto2 --list-files

# Download photo
gphoto2 --get-file=1 --filename photo.jpg
```

### 3. Enable USB Debugging (Canon Only)

Beberapa Canon cameras perlu USB debugging diaktifkan:

```
Camera Menu:
  → Setup Menu (wrench icon)
  → Communication Settings
  → USB Terminal → Off (biarkan default)
  → atau: 
  Camera Menu
    → Custom Functions
    → C.Fn IV: Operation / Others
    → C.Fn 20: USB device class → Mass Storage Device
```

### 4. Configure for Live View (Optional)

```bash
# Enable live view on camera
# Menu → Live View Settings → Enable

# Test live view stream
gphoto2 --get-livestream | ffmpeg -i - output.mp4
```

---

## 🔌 Integration dengan Node.js

### Install Dependencies

```bash
npm install gphoto2 dotenv
# atau
npm install node-gphoto2-api
```

### Node.js Code Example

```javascript
// backend/services/camera/dslr.service.js

const gphoto2 = require('gphoto2');
const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

class DSLRService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.gphoto2 = new gphoto2.GPhoto2();
    this.camera = null;
    this.isConnected = false;
  }

  /**
   * Initialize & connect to camera
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      this.gphoto2.list((cameras) => {
        if (cameras.length === 0) {
          reject(new Error('No camera found'));
          return;
        }

        const camera = cameras[0];
        camera.getConfig((config) => {
          this.camera = camera;
          this.isConnected = true;
          this.emit('connected');
          
          console.log('✓ Camera connected:', camera.model);
          resolve(camera);
        });
      });
    });
  }

  /**
   * Capture photo
   */
  async capturePhoto(outputPath) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Camera not connected'));
        return;
      }

      this.camera.capturePhoto((err, data) => {
        if (err) {
          reject(err);
          return;
        }

        // Save file
        fs.writeFile(outputPath, data, (err) => {
          if (err) {
            reject(err);
            return;
          }

          console.log('✓ Photo captured:', outputPath);
          this.emit('photo-captured', outputPath);
          resolve(outputPath);
        });
      });
    });
  }

  /**
   * Get live view stream
   */
  async getLiveViewStream() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Camera not connected'));
        return;
      }

      this.camera.on('error', reject);
      this.camera.on('frame', (data) => {
        resolve(data);
      });

      this.camera.startLiveView();
    });
  }

  /**
   * Stop live view
   */
  stopLiveView() {
    if (this.camera) {
      this.camera.stopLiveView();
    }
  }

  /**
   * Get camera status
   */
  async getStatus() {
    return {
      connected: this.isConnected,
      model: this.camera?.model || 'Unknown',
      battery: this.camera?.battery || 'N/A',
      mode: 'Ready'
    };
  }

  /**
   * Disconnect camera
   */
  disconnect() {
    if (this.camera) {
      this.camera.close();
      this.isConnected = false;
      this.emit('disconnected');
      console.log('✓ Camera disconnected');
    }
  }
}

module.exports = DSLRService;
```

### Express Route Example

```javascript
// backend/routes/camera.routes.js

const express = require('express');
const DSLRService = require('../services/camera/dslr.service');
const router = express.Router();

const dsrlService = new DSLRService({});

// Connect camera on startup
dsrlService.initialize().catch(err => {
  console.error('Camera init error:', err);
});

/**
 * POST /api/camera/capture
 * Capture photo dari DSLR
 */
router.post('/capture', async (req, res) => {
  try {
    const { sessionId, photoIndex } = req.body;
    
    // Create output path
    const photoDir = `./photos/${sessionId}`;
    const photoPath = `${photoDir}/photo_${photoIndex}.jpg`;
    
    // Ensure directory exists
    if (!fs.existsSync(photoDir)) {
      fs.mkdirSync(photoDir, { recursive: true });
    }

    // Capture photo
    const outputPath = await dsrlService.capturePhoto(photoPath);

    // Generate thumbnail
    const thumbPath = `${photoDir}/photo_${photoIndex}_thumb.jpg`;
    await generateThumbnail(outputPath, thumbPath);

    res.json({
      status: 'success',
      data: {
        photoId: `photo_${photoIndex}`,
        url: `/photos/${sessionId}/photo_${photoIndex}.jpg`,
        thumbnail: `/photos/${sessionId}/photo_${photoIndex}_thumb.jpg`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        type: 'CAPTURE_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * GET /api/camera/status
 * Get camera status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await dsrlService.getStatus();
    res.json({
      status: 'success',
      data: status
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * GET /api/camera/livestream
 * Get live view stream (MJPEG)
 */
router.get('/livestream', (req, res) => {
  res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=--BoundaryString');

  // Emit live frames
  dsrlService.on('frame', (data) => {
    res.write('--BoundaryString\r\n');
    res.write('Content-Type: image/jpeg\r\n');
    res.write('Content-Length: ' + data.length + '\r\n\r\n');
    res.write(data);
    res.write('\r\n');
  });

  req.on('close', () => {
    dsrlService.stopLiveView();
  });
});

module.exports = router;
```

---

## 🐍 Integration dengan Python

### Install Dependencies

```bash
pip install gphoto2 --break-system-packages
pip install pillow   # untuk image processing
```

### Python Code Example

```python
# backend/services/camera/dslr.py

import gphoto2 as gp
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class DSLRService:
    def __init__(self):
        self.camera = None
        self.context = None
        self.is_connected = False

    def initialize(self) -> bool:
        """Connect to camera"""
        try:
            self.context = gp.Context()
            cameras = gp.check_result(gp.gp_camera_list_detect(self.context))
            
            if not cameras:
                logger.error('No camera found')
                return False

            camera_name, camera_path = cameras[0]
            self.camera = gp.check_result(gp.gp_camera_new())
            
            port_info_list = gp.check_result(
                gp.gp_port_info_list_new()
            )
            gp.check_result(
                gp.gp_port_info_list_load(port_info_list)
            )
            
            index = gp.check_result(
                gp.gp_port_info_list_lookup_path(
                    port_info_list, camera_path
                )
            )
            
            port_info = gp.check_result(
                gp.gp_port_info_list_get_info(port_info_list, index)
            )
            
            gp.check_result(
                gp.gp_camera_set_port_info(self.camera, port_info)
            )
            gp.check_result(
                gp.gp_camera_init(self.camera, self.context)
            )
            
            self.is_connected = True
            logger.info(f'✓ Camera connected: {camera_name}')
            return True

        except gp.GPhoto2Error as e:
            logger.error(f'Camera init error: {e}')
            return False

    def capture_photo(self, output_path: str) -> bool:
        """Capture photo from camera"""
        if not self.is_connected:
            logger.error('Camera not connected')
            return False

        try:
            # Trigger capture
            camera_file = gp.check_result(
                gp.gp_camera_capture(
                    self.camera,
                    gp.GP_CAPTURE_IMAGE,
                    self.context
                )
            )

            # Download file
            os_file = gp.check_result(
                gp.gp_file_new()
            )
            gp.check_result(
                gp.gp_camera_file_get(
                    self.camera,
                    camera_file.folder,
                    camera_file.name,
                    gp.GP_FILE_TYPE_NORMAL,
                    os_file,
                    self.context
                )
            )

            # Save to disk
            gp.check_result(
                gp.gp_file_save(os_file, output_path)
            )

            logger.info(f'✓ Photo captured: {output_path}')
            return True

        except gp.GPhoto2Error as e:
            logger.error(f'Capture error: {e}')
            return False

    def get_status(self) -> dict:
        """Get camera status"""
        return {
            'connected': self.is_connected,
            'ready': self.is_connected
        }

    def disconnect(self):
        """Disconnect camera"""
        if self.camera:
            gp.check_result(gp.gp_camera_exit(self.camera, self.context))
            self.is_connected = False
            logger.info('✓ Camera disconnected')
```

---

## ⚙️ Configuration File

### .env

```env
# DSLR Camera Settings
CAMERA_TYPE=CANON                    # CANON, NIKON, GENERIC
CAMERA_MODE=USB                      # USB, NETWORK
CAMERA_TIMEOUT=5000                  # milliseconds
CAMERA_RETRY_COUNT=3

# Live View Settings
LIVE_VIEW_ENABLED=true
LIVE_VIEW_INTERVAL=100               # milliseconds
LIVE_VIEW_QUALITY=70                 # JPEG quality %

# Image Processing
PHOTO_FORMAT=jpg                     # jpg, png, raw
PHOTO_QUALITY=85                     # JPEG quality %
PHOTO_MAX_WIDTH=2000
PHOTO_MAX_HEIGHT=1500

# Storage
CAPTURE_PATH=./photos
TEMP_PATH=./temp
MAX_PHOTOS_PER_SESSION=30
AUTO_CLEANUP_HOURS=24

# Debug
CAMERA_DEBUG=false
CAMERA_LOG_LEVEL=info
```

---

## 🧪 Testing Camera Connection

### Terminal Test

```bash
# Test connection
gphoto2 --auto-detect

# Test capture
gphoto2 --capture-image

# Test live view
gphoto2 --get-livestream | ffmpeg -i pipe:0 -vframes 1 -f image2 test.jpg
```

### Node.js Test Script

```javascript
// test-camera.js

const DSLRService = require('./backend/services/camera/dslr.service');

async function testCamera() {
  const camera = new DSLRService();

  try {
    console.log('Connecting to camera...');
    await camera.initialize();

    console.log('Getting camera status...');
    const status = await camera.getStatus();
    console.log('Status:', status);

    console.log('Capturing test photo...');
    await camera.capturePhoto('./test_photo.jpg');

    console.log('✓ All tests passed!');
  } catch (error) {
    console.error('✗ Test failed:', error);
  } finally {
    camera.disconnect();
  }
}

testCamera();
```

### Run Test

```bash
node test-camera.js
```

---

## 🐛 Troubleshooting

### Camera Not Detected

**Windows:**
```bash
# Re-install USB drivers
# Canon: https://www.canon.com/en/support/
# Nikon: https://www.nikon.com/en/support/

# Check Device Manager
# Devices → Cameras → Right click → Update Driver

# Or try different USB port
```

**macOS:**
```bash
# Restart gphoto2
brew uninstall gphoto2
brew install gphoto2

# Check USB connection
system_profiler SPUSBDataType | grep Canon # or Nikon
```

**Linux:**
```bash
# Check USB devices
lsusb

# Check camera detection
gphoto2 --auto-detect

# Fix permission issues
sudo chmod 666 /dev/bus/usb/00*/00*
```

### Camera Freezes During Capture

```
Solusi:
1. Unplug USB cable
2. Power cycle camera (off → on)
3. Clear camera temp folder
4. Update firmware
5. Try different USB port/cable
6. Disable Windows USB Selective Suspend (Windows)
   Device Manager → USB hubs → Properties → Power Management
   Uncheck "Allow computer to turn off this device"
```

### Live View Not Working

```
Solusi:
1. Enable Live View on camera menu
2. Check camera battery (low battery dapat disable live view)
3. Update gphoto2 version
4. Try manual capture instead
5. Check USB bandwidth (live view butuh banyak bandwidth)
```

### Permission Denied Error (Linux)

```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Logout dan login
# Atau restart

# Verify
groups $USER
# Output harus include 'dialout'
```

---

## 📊 Camera Specifications

### Resolution & Quality

```
Recommended Settings:
- Resolution: Native maximum (5472x3648 untuk Canon 5D IV)
- ISO: 100-400 (tunggu lighting bagus)
- Shutter Speed: 1/250 (untuk natural light)
- Aperture: f/8 (untuk sharp focus)
- White Balance: Auto atau tunggu cahaya bagus
- Format: JPEG (RAW butuh processing lebih lama)
```

### File Sizes

```
Canon EOS 5D Mark IV:
- RAW: 65-85 MB
- JPEG max quality: 8-12 MB
- JPEG 85% quality: 2-4 MB (RECOMMENDED)
- Thumbnail: 50-100 KB

Processing Speed:
- Capture: 1-2 seconds
- Download: 2-5 seconds (depends USB 2.0/3.0)
- JPEG compression: 1-2 seconds
- Thumbnail generation: 0.5-1 second
```

---

## 🔗 Resources

- [gphoto2 Official](http://www.gphoto.org/)
- [gphoto2 Documentation](http://www.gphoto.org/doc/)
- [node-gphoto2-api](https://github.com/maro85/node-gphoto2-api)
- [Canon SDK](https://www.canon.com/en/support/)
- [Nikon SDK](https://www.nikon.com/en/support/)

---

**Last Updated**: September 2026  
**DSLR Setup v1.0**
