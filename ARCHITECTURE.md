# 🏗️ Photobooth Technical Architecture

Dokumentasi lengkap arsitektur sistem Photobooth untuk production-ready implementation.

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHOTOBOOTH APPLICATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐        ┌──────────────────────┐      │
│  │   FRONTEND LAYER     │◄──────►│   BACKEND LAYER      │      │
│  │  (React/Next.js)     │  HTTP  │  (Node.js/Python)    │      │
│  │                      │  REST  │                      │      │
│  │ - UI Components      │        │ - DSLR Controller    │      │
│  │ - State Management   │        │ - Image Processing   │      │
│  │ - Camera Preview     │        │ - Layout Generator   │      │
│  │ - Photo Gallery      │        │ - File Management    │      │
│  │ - Editor             │        │ - Printer Driver     │      │
│  │                      │        │ - Cloud Sync         │      │
│  └──────────────────────┘        └──────────────────────┘      │
│           │                              │                     │
│           │                              │                     │
│  ┌────────┴──────────────────────────────┴──────┐              │
│  │                                               │              │
│  ▼                ▼                ▼              ▼              │
│ ┌──────┐    ┌─────────┐      ┌─────────┐   ┌─────────┐        │
│ │ DSLR │    │ Storage │      │Printer  │   │ Google  │        │
│ │Camera│    │  Local  │      │ Driver  │   │ Drive   │        │
│ │(USB) │    │   Disk  │      │  CUPS   │   │  API    │        │
│ └──────┘    └─────────┘      └─────────┘   └─────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### Flow: Capture to Print

```
┌─────────────┐
│ User Click  │
│  CAPTURE    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend: CameraPreview.jsx         │
│  - Menampilkan live feed             │
│  - User klik tombol CAPTURE          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  API Call: POST /api/camera/capture  │
│  - Send capture command ke backend   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend: dslr_controller.py         │
│  - Control DSLR via gphoto2/SDK      │
│  - Trigger shutter                   │
│  - Retrieve raw image data           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend: image_processor.py         │
│  - Process raw image                 │
│  - Resize & optimize                 │
│  - Save to local storage             │
│  - Generate thumbnail                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Storage: /photos/{session_id}/      │
│  - photo_001.jpg (raw)               │
│  - photo_001_thumb.jpg               │
│  - metadata.json                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend: Gallery.jsx               │
│  - Display photo thumbnail           │
│  - Allow selection (max 3)           │
│  - Show counter: 1/3, 2/3, 3/3       │
└──────┬──────────────────────────────┘
       │
       ├─► [Edit] ──┐
       │            ▼
       │    ┌──────────────────────────┐
       │    │  PhotoEditor.jsx         │
       │    │  - Crop, rotate, adjust  │
       │    │  - Apply filters         │
       │    │  - Preview changes       │
       │    └──────────────────────────┘
       │
       ├─► [Layout] ──┐
       │              ▼
       │    ┌──────────────────────────┐
       │    │  LayoutBuilder.jsx       │
       │    │  - Arrange 3 fotos 3x1   │
       │    │  - Drag & drop           │
       │    │  - Preview output        │
       │    └──────────────────────────┘
       │
       └─► [Print] ──┐
                     ▼
          ┌──────────────────────────┐
          │  POST /api/print/send    │
          │  - Format untuk printer  │
          │  - DPI & paper size      │
          │  - Send to printer       │
          └──────┬───────────────────┘
                 │
                 ▼
          ┌──────────────────────────┐
          │  printer_driver.py       │
          │  - CUPS API / Win API    │
          │  - Manage print queue    │
          │  - Get printer status    │
          └──────┬───────────────────┘
                 │
                 ▼
          ┌──────────────────────────┐
          │   Printer (Physical)     │
          │   - Print 3x1 layout     │
          │   - Output photo paper   │
          └──────────────────────────┘
```

---

## 📁 Module Architecture

### Frontend Modules

```
frontend/
├── components/
│   ├── CameraPreview/
│   │   ├── CameraPreview.jsx
│   │   ├── CameraPreview.module.css
│   │   ├── LiveFeed.jsx
│   │   └── CameraControls.jsx
│   │
│   ├── PhotoGallery/
│   │   ├── PhotoGallery.jsx
│   │   ├── PhotoThumbnail.jsx
│   │   ├── PhotoThumbnail.module.css
│   │   └── SelectionCounter.jsx
│   │
│   ├── PhotoEditor/
│   │   ├── PhotoEditor.jsx
│   │   ├── Toolbar.jsx
│   │   ├── CropTool.jsx
│   │   ├── RotateTool.jsx
│   │   ├── BrightnessControl.jsx
│   │   └── FilterPresets.jsx
│   │
│   ├── LayoutBuilder/
│   │   ├── LayoutBuilder.jsx
│   │   ├── Layout3x1.jsx
│   │   ├── DragDropContainer.jsx
│   │   ├── LayoutPreview.jsx
│   │   └── LayoutBuilder.module.css
│   │
│   ├── PrintPreview/
│   │   ├── PrintPreview.jsx
│   │   ├── PrintSettings.jsx
│   │   └── PrintPreview.module.css
│   │
│   ├── Common/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── StatusBar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Common.module.css
│   │
│   └── Layout/
│       ├── Header.jsx
│       ├── Navigation.jsx
│       └── Footer.jsx
│
├── pages/
│   ├── CaptureScreen.jsx
│   ├── GalleryScreen.jsx
│   ├── EditScreen.jsx
│   ├── LayoutScreen.jsx
│   └── PrintScreen.jsx
│
├── hooks/
│   ├── useCamera.js         # Camera control logic
│   ├── useStorage.js        # Local storage access
│   ├── usePrinter.js        # Printer communication
│   ├── usePhotoEditor.js    # Photo editing logic
│   ├── useLayout.js         # Layout management
│   └── useApi.js            # API communication
│
├── store/
│   ├── photoStore.js        # Zustand store
│   │   ├── State:
│   │   │   - photos[]
│   │   │   - selectedPhotos[]
│   │   │   - currentEditingPhoto
│   │   │   - layoutTemplate
│   │   │   - printSettings
│   │   │   - cameraStatus
│   │   │
│   │   └── Actions:
│   │       - addPhoto()
│   │       - removePhoto()
│   │       - selectPhoto()
│   │       - deselectPhoto()
│   │       - updateLayout()
│   │       - setPrintSettings()
│   │
│   ├── cameraStore.js
│   │   - cameraConnected
│   │   - liveStreamUrl
│   │   - cameraSettings
│   │
│   └── uiStore.js
│       - currentScreen
│       - modalOpen
│       - notifications
│
├── utils/
│   ├── imageUtils.js        # Image manipulation helpers
│   ├── fileUtils.js         # File operations
│   ├── formatters.js        # Data formatters
│   ├── validators.js        # Input validation
│   └── constants.js         # App constants
│
├── styles/
│   ├── neomorph.css         # Neomorph design tokens
│   ├── global.css           # Global styles
│   ├── animations.css       # Keyframe animations
│   ├── responsive.css       # Media queries
│   └── variables.css        # CSS custom properties
│
├── services/
│   ├── api.js               # API client (Axios/Fetch)
│   ├── storage.js           # Local storage service
│   ├── printer.js           # Printer service
│   └── drive.js             # Google Drive service
│
├── config/
│   ├── api.config.js
│   ├── camera.config.js
│   └── app.config.js
│
├── App.jsx
├── App.css
├── main.jsx
└── vite.config.js
```

### Backend Modules (Node.js)

```
backend/
├── app.js                   # Main Express app
├── server.js                # Server entry point
├── package.json
│
├── routes/
│   ├── camera.routes.js
│   │   - POST   /capture
│   │   - GET    /status
│   │   - GET    /livestream
│   │   - POST   /settings
│   │
│   ├── photos.routes.js
│   │   - GET    /photos
│   │   - POST   /photos/select
│   │   - GET    /photos/:id
│   │   - DELETE /photos/:id
│   │   - POST   /photos/delete-batch
│   │
│   ├── editor.routes.js
│   │   - POST   /edit/crop
│   │   - POST   /edit/rotate
│   │   - POST   /edit/adjust
│   │   - POST   /edit/filter
│   │
│   ├── layout.routes.js
│   │   - POST   /layout/generate
│   │   - GET    /layout/preview
│   │   - POST   /layout/save
│   │
│   ├── print.routes.js
│   │   - GET    /printers
│   │   - GET    /print-settings
│   │   - POST   /print/preview
│   │   - POST   /print/send
│   │
│   ├── storage.routes.js
│   │   - GET    /storage/list
│   │   - POST   /storage/download
│   │   - POST   /storage/delete
│   │
│   └── drive.routes.js
│       - POST   /drive/auth
│       - POST   /drive/upload
│       - GET    /drive/status
│
├── controllers/
│   ├── cameraController.js
│   │   - capturePhoto()
│   │   - getLiveStream()
│   │   - getStatus()
│   │
│   ├── photoController.js
│   │   - getPhotos()
│   │   - getPhoto()
│   │   - deletePhoto()
│   │
│   ├── editorController.js
│   │   - cropPhoto()
│   │   - rotatePhoto()
│   │   - adjustBrightness()
│   │
│   ├── layoutController.js
│   │   - generateLayout3x1()
│   │   - previewLayout()
│   │
│   ├── printerController.js
│   │   - getPrinters()
│   │   - sendToPrinter()
│   │
│   └── storageController.js
│       - listPhotos()
│       - downloadPhoto()
│
├── services/
│   ├── camera/
│   │   ├── dslr.service.js
│   │   │   - Controls DSLR via USB/Network
│   │   │   - Uses gphoto2 library
│   │   │   - Methods: capture(), livePreview(), getStatus()
│   │   │
│   │   ├── gphoto2.wrapper.js
│   │   │   - Wrapper around gphoto2 CLI
│   │   │
│   │   └── camera.factory.js
│   │       - Factory untuk different camera types
│   │
│   ├── image/
│   │   ├── image.processor.js
│   │   │   - Process raw image dari DSLR
│   │   │   - Compress, resize, optimize
│   │   │
│   │   ├── editor.service.js
│   │   │   - Crop, rotate, adjust color
│   │   │   - Uses Sharp library
│   │   │
│   │   └── filter.service.js
│   │       - Apply filters
│   │
│   ├── layout/
│   │   ├── layout.generator.js
│   │   │   - Generate 3x1 layout
│   │   │   - Composite 3 images
│   │   │   - Add padding/borders
│   │   │
│   │   └── template.service.js
│   │       - Load & manage templates
│   │
│   ├── printer/
│   │   ├── printer.driver.js
│   │   │   - CUPS API (Linux/Mac)
│   │   │   - Windows Print API
│   │   │
│   │   ├── print.formatter.js
│   │   │   - Format untuk printer
│   │   │   - Handle DPI, paper size
│   │   │
│   │   └── print.queue.js
│   │       - Manage print jobs
│   │
│   ├── storage/
│   │   ├── local.storage.js
│   │   │   - File operations
│   │   │   - Session management
│   │   │
│   │   ├── cloud.sync.js
│   │   │   - Google Drive sync
│   │   │   - Upload/download
│   │   │
│   │   └── cleanup.service.js
│   │       - Auto cleanup old photos
│   │
│   └── database/
│       ├── sqlite.service.js
│       │   - Persist session data
│       │   - Photo metadata
│       │   - Print history
│       │
│       └── models/
│           ├── Photo.js
│           ├── PrintJob.js
│           └── Session.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── errorHandler.middleware.js
│   ├── requestLogger.middleware.js
│   ├── fileUpload.middleware.js
│   └── cors.middleware.js
│
├── utils/
│   ├── logger.js
│   ├── errorHandler.js
│   ├── validators.js
│   ├── helpers.js
│   └── constants.js
│
├── config/
│   ├── database.config.js
│   ├── camera.config.js
│   ├── printer.config.js
│   ├── storage.config.js
│   └── server.config.js
│
├── lib/
│   ├── gphoto2.lib.js
│   ├── printer.lib.js
│   └── sharp.wrapper.js
│
├── temp/
│   └── (temporary working directory)
│
├── public/
│   ├── uploads/
│   └── stream/ (live feed)
│
└── logs/
    └── app.log
```

### Backend Modules (Python Alternative)

```
backend/
├── app.py                   # Main FastAPI app
├── requirements.txt
├── config.py
│
├── api/
│   ├── __init__.py
│   ├── routes/
│   │   ├── camera.py
│   │   ├── photos.py
│   │   ├── editor.py
│   │   ├── layout.py
│   │   ├── printer.py
│   │   └── storage.py
│   │
│   └── schemas/
│       ├── camera.py
│       ├── photo.py
│       ├── layout.py
│       └── print.py
│
├── services/
│   ├── camera/
│   │   ├── dslr.py
│   │   └── gphoto2.py
│   │
│   ├── image/
│   │   ├── processor.py
│   │   ├── editor.py
│   │   └── filters.py
│   │
│   ├── layout/
│   │   └── generator.py
│   │
│   ├── printer/
│   │   ├── driver.py
│   │   └── formatter.py
│   │
│   └── storage/
│       ├── local.py
│       └── cloud.py
│
├── models/
│   ├── photo.py
│   ├── session.py
│   └── print_job.py
│
├── utils/
│   ├── logger.py
│   ├── validators.py
│   ├── helpers.py
│   └── constants.py
│
├── temp/
└── logs/
```

---

## 🔌 API Communication Layer

### Request/Response Pattern

```javascript
// Frontend Request
{
  "method": "POST",
  "endpoint": "/api/camera/capture",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token"
  },
  "body": {
    "sessionId": "sess_123456",
    "photoIndex": 1
  }
}

// Backend Response (Success)
{
  "status": "success",
  "code": 200,
  "data": {
    "photoId": "photo_001",
    "url": "/photos/photo_001.jpg",
    "timestamp": "2026-09-06T10:30:00Z",
    "metadata": {
      "width": 4000,
      "height": 3000,
      "fileSize": 2500000,
      "camera": "Canon EOS 5D"
    }
  },
  "message": "Photo captured successfully"
}

// Backend Response (Error)
{
  "status": "error",
  "code": 500,
  "error": {
    "type": "CAMERA_ERROR",
    "message": "DSLR disconnected",
    "details": "Connection timeout after 5s"
  }
}
```

---

## 🗄️ Data Models

### Photo Schema
```javascript
{
  id: String,                // photo_001
  sessionId: String,         // sess_123456
  filename: String,          // photo_001.jpg
  filepath: String,          // ./photos/sess_123456/photo_001.jpg
  thumbnailPath: String,     // ./photos/sess_123456/photo_001_thumb.jpg
  
  // Image Metadata
  metadata: {
    width: Number,
    height: Number,
    fileSize: Number,
    format: String,            // jpg, png, raw
    camera: String,            // Camera model
    lens: String,
    iso: Number,
    shutter: String,           // 1/500
    aperture: String,          // f/2.8
    focalLength: Number,       // 50mm
  },
  
  // Capture Info
  capturedAt: DateTime,
  displayIndex: Number,        // 1, 2, 3
  
  // Editing
  edits: {
    crop: { x, y, width, height },
    rotate: Number,            // degrees
    brightness: Number,        // -100 to +100
    contrast: Number,
    saturation: Number,
    filters: String[]
  },
  
  // Status
  status: String,             // captured, edited, selected, printed
  selected: Boolean,
  printedAt: DateTime,
  uploadedToDrive: Boolean,
  
  // Relationships
  layoutId: String,           // Reference to layout job
  printJobId: String,         // Reference to print job
}
```

### Session Schema
```javascript
{
  id: String,                // sess_123456
  startedAt: DateTime,
  endedAt: DateTime,
  
  status: String,            // active, completed, cancelled
  
  photos: String[],          // Array of photo IDs
  selectedPhotos: String[],  // Selected 3 photos (max)
  
  layout: {
    templateId: String,      // 3x1
    generatedAt: DateTime,
    outputPath: String
  },
  
  printJobs: {
    id: String,
    status: String,          // pending, printing, completed, failed
    printerName: String,
    sentAt: DateTime,
    completedAt: DateTime
  }[],
  
  storage: {
    localPath: String,
    cloudPath: String,       // Google Drive path
    uploadedAt: DateTime
  },
  
  metadata: {
    totalPhotos: Number,
    printCount: Number,
    downloadedAt: DateTime
  }
}
```

---

## 🚀 Deployment Architecture

### Local Development
```
laptop:3000  ←→  localhost:5000
(Frontend)        (Backend)
   ↓
  DSLR (USB)
   ↓
  Printer (Network/USB)
   ↓
  Google Drive (Optional)
```

### Production/Kiosk
```
Touch Screen / Laptop
    ↓
┌─────────────────────────┐
│ Electron App            │
│ - All bundled           │
│ - Auto-updates          │
│ - Offline-first         │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Internal Server         │
│ - Express/FastAPI       │
│ - localhost:5000        │
└─────────────────────────┘
    ↓
┌───┬─────────┬─────────┐
│   │         │         │
DSLR Printer  Storage  Drive
```

---

## 🔄 State Management Flow (Frontend)

```
┌─────────────────────────────────────┐
│        Zustand Store                │
│   (photoStore + cameraStore)        │
└────────┬────────────────────────────┘
         │
         ├──► photos: Photo[]
         ├──► selectedPhotos: Photo[]
         ├──► currentEditingPhoto: Photo
         ├──► layoutData: Layout
         ├──► printSettings: Settings
         ├──► cameraStatus: Status
         └──► uiState: UI
         
         │
         ▼
┌─────────────────────────────────────┐
│      React Components               │
│   (Use store via hooks)             │
│   - CameraPreview                   │
│   - Gallery                         │
│   - Editor                          │
│   - LayoutBuilder                   │
│   - PrintPreview                    │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       API Service Layer             │
│   - api.js (Axios/Fetch wrapper)    │
│   - storage.js (Local storage)      │
│   - printer.js (Printer control)    │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       Backend API Endpoints         │
│   - Express.js / FastAPI            │
└─────────────────────────────────────┘
```

---

## 📊 Performance Considerations

### Image Processing Pipeline

```
Raw DSLR Image (20MB+)
       ↓
   [Decompress]
       ↓
   [Resize] → 2000px width (≈2-3MB)
       ↓
   [Compress] → JPEG 85% quality (≈800KB)
       ↓
   [Create Thumbnail] → 300px width (≈50KB)
       ↓
   [Save to Disk + Memory Cache]
       ↓
   Display in UI
```

### Optimization Strategies

1. **Lazy Loading**: Load thumbnails initially, full images on demand
2. **Image Caching**: Keep processed images in memory during session
3. **Async Operations**: Use workers for heavy image processing
4. **Pagination**: Load photos in batches (10 per page)
5. **Compression**: Aggressive JPEG compression untuk speed

---

## 🔒 Security Considerations

```javascript
// API Authentication (Simple Session-based)
- Generate sessionId on app start
- Include in all requests
- Validate on backend
- Expire after 24 hours

// File Security
- Validate file types (whitelist: jpg, png)
- Check file size (max 50MB)
- Scan for malware (optional)
- Encrypt sensitive paths

// Printer Security
- Whitelist approved printers
- Validate print settings
- Log all print jobs
- Prevent unauthorized access

// Cloud Integration
- Use OAuth 2.0 for Google Drive
- Encrypt credentials
- Minimal scopes required
- User consent before upload
```

---

## ⚙️ System Requirements

### Minimum
- CPU: Intel i5 / AMD Ryzen 5
- RAM: 8GB
- Storage: 256GB SSD
- USB: 3.0 (for DSLR)
- Network: Gigabit Ethernet (optional)

### Recommended
- CPU: Intel i7 / AMD Ryzen 7
- RAM: 16GB
- Storage: 512GB+ SSD
- USB: 3.1 (for DSLR)
- Network: Gigabit + WiFi 6

### Operating System
- Windows 10/11
- macOS 11+
- Ubuntu 20.04+

---

**Last Updated**: September 2026  
**Architecture v1.0**
