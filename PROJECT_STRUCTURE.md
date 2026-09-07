# 📁 Photobooth Project Structure

Complete directory structure dan penjelasan setiap folder.

---

## 🎯 Project Layout

```
photobooth/
├── 📁 frontend/                    # React/Vite Frontend Application
│   ├── src/
│   │   ├── 📁 components/          # Reusable React components
│   │   │   ├── CameraPreview/
│   │   │   │   ├── CameraPreview.jsx
│   │   │   │   ├── CameraPreview.module.css
│   │   │   │   ├── LiveFeed.jsx
│   │   │   │   └── CameraControls.jsx
│   │   │   │
│   │   │   ├── PhotoGallery/
│   │   │   │   ├── PhotoGallery.jsx
│   │   │   │   ├── PhotoGallery.module.css
│   │   │   │   ├── PhotoThumbnail.jsx
│   │   │   │   └── SelectionCounter.jsx
│   │   │   │
│   │   │   ├── PhotoEditor/
│   │   │   │   ├── PhotoEditor.jsx
│   │   │   │   ├── Toolbar.jsx
│   │   │   │   ├── CropTool.jsx
│   │   │   │   ├── RotateTool.jsx
│   │   │   │   ├── BrightnessControl.jsx
│   │   │   │   ├── FilterPresets.jsx
│   │   │   │   └── PhotoEditor.module.css
│   │   │   │
│   │   │   ├── LayoutBuilder/
│   │   │   │   ├── LayoutBuilder.jsx
│   │   │   │   ├── Layout3x1.jsx
│   │   │   │   ├── DragDropContainer.jsx
│   │   │   │   ├── LayoutPreview.jsx
│   │   │   │   └── LayoutBuilder.module.css
│   │   │   │
│   │   │   ├── PrintPreview/
│   │   │   │   ├── PrintPreview.jsx
│   │   │   │   ├── PrintSettings.jsx
│   │   │   │   └── PrintPreview.module.css
│   │   │   │
│   │   │   └── Common/
│   │   │       ├── Button.jsx          # Reusable button
│   │   │       ├── Modal.jsx           # Modal dialog
│   │   │       ├── StatusBar.jsx       # Status indicator
│   │   │       ├── LoadingSpinner.jsx  # Loading animation
│   │   │       ├── Toast.jsx           # Toast notifications
│   │   │       └── Common.module.css
│   │   │
│   │   ├── 📁 pages/                # Full-page components
│   │   │   ├── CaptureScreen.jsx    # Camera capture page
│   │   │   ├── GalleryScreen.jsx    # Photo gallery page
│   │   │   ├── EditScreen.jsx       # Photo editor page
│   │   │   ├── LayoutScreen.jsx     # Layout builder page
│   │   │   └── PrintScreen.jsx      # Print preview page
│   │   │
│   │   ├── 📁 hooks/                # Custom React hooks
│   │   │   ├── useCamera.js         # Camera control logic
│   │   │   ├── useStorage.js        # Local storage access
│   │   │   ├── usePrinter.js        # Printer communication
│   │   │   ├── usePhotoEditor.js    # Photo editing logic
│   │   │   ├── useLayout.js         # Layout management
│   │   │   ├── useApi.js            # API communication
│   │   │   └── useMountEffect.js    # Lifecycle helpers
│   │   │
│   │   ├── 📁 store/                # Zustand state management
│   │   │   ├── photoStore.js
│   │   │   │   ├── State: photos[], selectedPhotos[], etc
│   │   │   │   └── Actions: addPhoto(), selectPhoto(), etc
│   │   │   │
│   │   │   ├── cameraStore.js
│   │   │   │   ├── State: connected, stream, settings
│   │   │   │   └── Actions: connect(), capture(), etc
│   │   │   │
│   │   │   ├── uiStore.js
│   │   │   │   ├── State: currentScreen, modal, notifications
│   │   │   │   └── Actions: setScreen(), openModal(), etc
│   │   │   │
│   │   │   └── printerStore.js
│   │   │       ├── State: available printers, settings
│   │   │       └── Actions: selectPrinter(), updateSettings()
│   │   │
│   │   ├── 📁 services/             # External service handlers
│   │   │   ├── api.js               # Axios/Fetch wrapper
│   │   │   ├── storage.js           # IndexedDB/localStorage
│   │   │   ├── printer.js           # Printer API
│   │   │   └── drive.js             # Google Drive API
│   │   │
│   │   ├── 📁 utils/                # Helper functions
│   │   │   ├── imageUtils.js        # Image manipulation
│   │   │   ├── fileUtils.js         # File operations
│   │   │   ├── formatters.js        # Data formatters
│   │   │   ├── validators.js        # Input validation
│   │   │   ├── constants.js         # App constants
│   │   │   └── logger.js            # Logging utility
│   │   │
│   │   ├── 📁 config/               # Configuration files
│   │   │   ├── api.config.js        # API endpoints
│   │   │   ├── camera.config.js     # Camera settings
│   │   │   └── app.config.js        # App constants
│   │   │
│   │   ├── 📁 styles/               # Global styles
│   │   │   ├── neomorph.css         # Neomorph design tokens
│   │   │   ├── global.css           # Global styles
│   │   │   ├── animations.css       # Keyframe animations
│   │   │   ├── responsive.css       # Media queries
│   │   │   └── variables.css        # CSS custom properties
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   ├── App.css                  # Root styles
│   │   ├── main.jsx                 # Entry point
│   │   └── index.html               # HTML template
│   │
│   ├── 📁 public/                   # Static assets
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── 📁 tests/                    # Frontend tests
│   │   ├── unit/
│   │   │   ├── components.test.jsx
│   │   │   ├── hooks.test.js
│   │   │   └── utils.test.js
│   │   │
│   │   └── e2e/
│   │       ├── capture-flow.test.js
│   │       ├── editor-flow.test.js
│   │       └── print-flow.test.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── README.md
│
├── 📁 backend/                      # Node.js/Python Backend
│   ├── 📁 app/                      # Application code (if Python)
│   │   ├── 📁 api/
│   │   │   ├── 📁 routes/
│   │   │   │   ├── camera.py
│   │   │   │   ├── photos.py
│   │   │   │   ├── editor.py
│   │   │   │   ├── layout.py
│   │   │   │   ├── print.py
│   │   │   │   └── storage.py
│   │   │   │
│   │   │   └── 📁 schemas/
│   │   │       ├── camera.py
│   │   │       ├── photo.py
│   │   │       ├── layout.py
│   │   │       └── print.py
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── 📁 camera/
│   │   │   │   ├── dslr.py          # DSLR controller
│   │   │   │   └── gphoto2.py       # gphoto2 wrapper
│   │   │   │
│   │   │   ├── 📁 image/
│   │   │   │   ├── processor.py     # Image processing
│   │   │   │   ├── editor.py        # Photo editing
│   │   │   │   └── filters.py       # Filter effects
│   │   │   │
│   │   │   ├── 📁 layout/
│   │   │   │   └── generator.py     # Layout generation
│   │   │   │
│   │   │   ├── 📁 printer/
│   │   │   │   ├── driver.py        # Printer driver
│   │   │   │   └── formatter.py     # Print formatting
│   │   │   │
│   │   │   └── 📁 storage/
│   │   │       ├── local.py         # Local storage
│   │   │       └── cloud.py         # Google Drive
│   │   │
│   │   ├── 📁 models/
│   │   │   ├── photo.py
│   │   │   ├── session.py
│   │   │   └── print_job.py
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── logger.py
│   │   │   ├── validators.py
│   │   │   ├── helpers.py
│   │   │   └── constants.py
│   │   │
│   │   ├── 📁 config/
│   │   │   ├── settings.py
│   │   │   └── database.py
│   │   │
│   │   └── main.py                  # FastAPI app
│   │
│   ├── 📁 routes/                   # Routes (if Node.js)
│   │   ├── camera.routes.js
│   │   ├── photos.routes.js
│   │   ├── editor.routes.js
│   │   ├── layout.routes.js
│   │   ├── print.routes.js
│   │   └── storage.routes.js
│   │
│   ├── 📁 controllers/              # Route handlers (if Node.js)
│   │   ├── cameraController.js
│   │   ├── photoController.js
│   │   ├── editorController.js
│   │   ├── layoutController.js
│   │   └── printerController.js
│   │
│   ├── 📁 services/                 # Business logic (if Node.js)
│   │   ├── 📁 camera/
│   │   │   ├── dslr.service.js
│   │   │   └── gphoto2.wrapper.js
│   │   │
│   │   ├── 📁 image/
│   │   │   ├── image.processor.js
│   │   │   ├── editor.service.js
│   │   │   └── filter.service.js
│   │   │
│   │   ├── 📁 layout/
│   │   │   └── layout.generator.js
│   │   │
│   │   ├── 📁 printer/
│   │   │   ├── printer.driver.js
│   │   │   └── print.formatter.js
│   │   │
│   │   └── 📁 storage/
│   │       ├── local.storage.js
│   │       └── cloud.sync.js
│   │
│   ├── 📁 middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── requestLogger.middleware.js
│   │   └── cors.middleware.js
│   │
│   ├── 📁 utils/
│   │   ├── logger.js
│   │   ├── errorHandler.js
│   │   ├── validators.js
│   │   └── constants.js
│   │
│   ├── 📁 config/
│   │   ├── database.config.js
│   │   ├── camera.config.js
│   │   └── server.config.js
│   │
│   ├── 📁 tests/
│   │   ├── unit/
│   │   │   ├── camera.test.js
│   │   │   ├── image.processor.test.js
│   │   │   └── printer.test.js
│   │   │
│   │   └── integration/
│   │       ├── camera-flow.test.js
│   │       └── print-flow.test.js
│   │
│   ├── app.js                       # Express app (if Node.js)
│   ├── server.js                    # Server entry point
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── requirements.txt             # Python dependencies
│   └── README.md
│
├── 📁 docs/                         # Documentation
│   ├── README.md                    # Main README
│   ├── QUICKSTART.md                # Setup guide
│   ├── ARCHITECTURE.md              # System design
│   ├── DESIGN.md                    # UI/UX guidelines
│   ├── DSLR_SETUP.md                # Camera setup
│   ├── API.md                       # API documentation
│   ├── DEVELOPMENT.md               # Development guide
│   ├── PROJECT_STRUCTURE.md         # This file
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── TROUBLESHOOTING.md           # Common issues
│   └── CHANGELOG.md                 # Version history
│
├── 📁 tests/                        # Integration tests
│   ├── fixtures/                    # Test data
│   │   ├── sample-photo.jpg
│   │   └── camera-mock.js
│   │
│   ├── e2e/
│   │   ├── capture-to-print.test.js
│   │   └── full-workflow.test.js
│   │
│   └── performance/
│       ├── image-processing.bench.js
│       └── api-load.bench.js
│
├── 📁 config/                       # Global config
│   ├── eslint.config.js
│   ├── prettier.config.js
│   └── jest.config.js
│
├── .github/                         # GitHub specific
│   ├── workflows/
│   │   ├── ci.yml                   # CI/CD pipeline
│   │   └── release.yml              # Release automation
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   │
│   └── pull_request_template.md
│
├── 📁 docker/                       # Docker configuration
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── 📁 scripts/                      # Utility scripts
│   ├── setup.sh                     # Setup script
│   ├── build.sh                     # Build script
│   ├── deploy.sh                    # Deploy script
│   ├── test.sh                      # Test script
│   └── lint.sh                      # Linting script
│
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── .dockerignore                    # Docker ignore rules
├── package.json                     # Root package (monorepo)
├── package-lock.json
├── README.md                        # Project root README
├── QUICKSTART.md                    # Quick start guide
├── ARCHITECTURE.md                  # Architecture docs
├── DESIGN.md                        # Design guidelines
├── DSLR_SETUP.md                    # Camera setup
├── API.md                           # API documentation
├── DEVELOPMENT.md                   # Development guide
├── PROJECT_STRUCTURE.md             # This file
├── LICENSE                          # License file
└── .editorconfig                    # Editor configuration
```

---

## 📊 Directory Size Guide

Typical directory sizes:

```
frontend/node_modules/          ~500 MB   (Don't commit!)
backend/node_modules/           ~300 MB   (Don't commit!)
photos/ (sessions)              Variable  (Get deleted after 24h)
frontend/build/                 ~50 MB    (Build output)
backend/dist/                   ~20 MB    (Build output)
.git/                          Variable  (Git history)

Total Development:              ~1-2 GB
Total Production:              ~100 MB (without node_modules)
```

---

## 🔍 Important Files

### Frontend Entry Points
- `frontend/src/main.jsx` - React entry point
- `frontend/vite.config.js` - Build configuration
- `frontend/tailwind.config.js` - Tailwind configuration

### Backend Entry Points
- `backend/app.js` - Express app (Node.js)
- `backend/app/main.py` - FastAPI app (Python)
- `backend/server.js` - Server startup

### Configuration
- `.env.example` - Environment template
- `.env` - Local environment (don't commit)
- `.eslintrc.json` - Linting rules
- `.prettierrc` - Code formatting

### Documentation
- `README.md` - Overview
- `QUICKSTART.md` - Setup guide
- `ARCHITECTURE.md` - System design
- `API.md` - API documentation

---

## 📦 .gitignore Template

```gitignore
# Dependencies
node_modules/
venv/
__pycache__/
*.pyc

# Environment
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
frontend/build/
backend/dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary
temp/
tmp/
*.tmp

# Photos (local session data)
photos/
*.raw
```

---

## 🔄 File Dependencies

### Frontend Components

```
App.jsx
├── CaptureScreen
│   └── CameraPreview
│       ├── useCamera hook
│       ├── cameraStore
│       └── api.service
│
├── GalleryScreen
│   └── PhotoGallery
│       ├── PhotoThumbnail
│       ├── useStorage hook
│       └── photoStore
│
├── EditScreen
│   └── PhotoEditor
│       ├── CropTool
│       ├── RotateTool
│       ├── BrightnessControl
│       ├── usePhotoEditor hook
│       └── api.service
│
├── LayoutScreen
│   └── LayoutBuilder
│       ├── Layout3x1
│       ├── DragDropContainer
│       ├── useLayout hook
│       └── api.service
│
└── PrintScreen
    └── PrintPreview
        ├── PrintSettings
        ├── usePrinter hook
        └── api.service
```

### Backend Routes

```
Express App
├── /api/camera
│   └── cameraController
│       └── dslr.service
│
├── /api/photos
│   └── photoController
│       └── local.storage
│
├── /api/editor
│   └── editorController
│       └── image.processor
│
├── /api/layout
│   └── layoutController
│       └── layout.generator
│
├── /api/print
│   └── printerController
│       └── printer.driver
│
└── /api/storage
    └── storageController
        └── cloud.sync
```

---

## 📝 File Naming Conventions

### React Components
```
ComponentName.jsx           # Component file
ComponentName.module.css    # Component styles
ComponentName.test.jsx      # Component tests
index.jsx                   # Directory export
```

### Utilities
```
camelCaseUtility.js         # Utility functions
camelCaseUtility.test.js    # Utility tests
```

### Styles
```
variables.css               # CSS variables
global.css                  # Global styles
neomorph.css                # Design system
responsive.css              # Media queries
animations.css              # Animations
```

### Configuration
```
camelCase.config.js         # Config files
.env                        # Environment variables
.env.example                # Environment template
```

---

## 🎯 Quick Navigation

Untuk menemukan file dengan cepat:

| Apa yang dicari | Lokasi |
|---|---|
| React component | `frontend/src/components/` |
| Page/screen | `frontend/src/pages/` |
| API endpoint | `backend/routes/` |
| Business logic | `backend/services/` |
| Styling | `frontend/src/styles/` |
| Tests | `frontend/tests/` atau `backend/tests/` |
| Documentation | `docs/` |
| Config | `.env`, `vite.config.js`, `tailwind.config.js` |

---

**Last Updated**: September 2026  
**Project Structure v1.0**
