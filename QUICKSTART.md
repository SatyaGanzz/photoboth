# 🚀 Photobooth Quick Start Guide

Panduan instalasi dan setup cepat untuk development.

---

## 📋 Prerequisites

- **Node.js**: 16.x atau lebih baru
- **npm** atau **yarn**: Package manager
- **Python** (optional): 3.8+ jika pakai Python backend
- **Git**: Version control
- **DSLR Camera**: Canon/Nikon/Sony dengan USB cable
- **Printer** (optional): Network atau USB printer

---

## ⚡ 5-Minute Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/photobooth.git
cd photobooth
```

### 2. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend (Node.js)
```bash
cd ../backend
npm install
```

Atau Backend (Python)
```bash
cd ../backend
pip install -r requirements.txt --break-system-packages
```

### 3. Setup Environment Variables

Create `.env` file di root directory:

```env
# Frontend
VITE_API_URL=http://localhost:5000
VITE_DEBUG=true

# Backend
NODE_ENV=development
PORT=5000
HOST=localhost

# Camera
CAMERA_TYPE=CANON
CAMERA_DEBUG=true

# Storage
STORAGE_PATH=./photos
TEMP_PATH=./temp

# Printer
PRINTER_ENABLED=false

# Google Drive (optional)
GOOGLE_DRIVE_ENABLED=false
```

### 4. Start Development Server

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# atau python app.py
```

Output:
```
✓ Server running on http://localhost:5000
✓ Camera initialized
✓ Ready for connections
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Output:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 5. Open Browser

Visit: http://localhost:5173

---

## 📁 Project Structure Setup

```bash
# Create project from scratch
mkdir photobooth
cd photobooth

# Create directories
mkdir frontend backend docs tests

# Frontend structure
cd frontend
npm create vite@latest . -- --template react
npm install tailwind-css zustand axios konva react-camera-pro

# Backend structure
cd ../backend
npm init -y
npm install express cors dotenv sharp gphoto2 sqlite3 axios multer body-parser
```

---

## 🔧 Detailed Setup Instructions

### Frontend Setup

#### 1. Create Vite Project

```bash
cd frontend
npm create vite@latest . -- --template react
cd ..
```

#### 2. Install Dependencies

```bash
cd frontend
npm install
```

Required packages:
```bash
npm install \
  tailwind-css \
  postcss \
  autoprefixer \
  zustand \
  axios \
  konva \
  react-konva \
  react-camera-pro \
  react-router-dom \
  react-hot-toast
```

Dev dependencies:
```bash
npm install -D \
  @vite/plugin-react \
  @tailwindcss/forms \
  eslint \
  eslint-plugin-react
```

#### 3. Configure Tailwind CSS

Create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-white': '#F8F8F8',
        'neo-red': '#FF4757',
        'neo-red-dark': '#E74C3C',
      },
      boxShadow: {
        'neo': '8px 8px 16px #D4D4D4, -8px -8px 16px #FFFFFF',
        'neo-raised': '12px 12px 24px #D4D4D4, -12px -12px 24px #FFFFFF',
      },
    },
  },
  plugins: [],
}
```

Create `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 4. Create Directory Structure

```bash
mkdir -p src/{components,pages,hooks,store,styles,services,utils,config}

# Create component directories
mkdir -p src/components/{CameraPreview,PhotoGallery,PhotoEditor,LayoutBuilder,PrintPreview,Common}
```

#### 5. Create Main App Component

`src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CaptureScreen from './pages/CaptureScreen';
import GalleryScreen from './pages/GalleryScreen';
import EditScreen from './pages/EditScreen';
import LayoutScreen from './pages/LayoutScreen';
import PrintScreen from './pages/PrintScreen';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CaptureScreen />} />
        <Route path="/gallery" element={<GalleryScreen />} />
        <Route path="/edit/:photoId" element={<EditScreen />} />
        <Route path="/layout" element={<LayoutScreen />} />
        <Route path="/print" element={<PrintScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

#### 6. Start Development

```bash
npm run dev
```

---

### Backend Setup (Node.js)

#### 1. Initialize Project

```bash
cd backend
npm init -y
```

#### 2. Install Dependencies

```bash
npm install \
  express \
  cors \
  dotenv \
  sharp \
  axios \
  multer \
  body-parser \
  uuid \
  sqlite3 \
  node-gphoto2-api
```

Dev dependencies:
```bash
npm install -D \
  nodemon \
  eslint \
  jest
```

#### 3. Create `package.json` scripts

```json
{
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

#### 4. Create Directory Structure

```bash
mkdir -p {routes,controllers,services,middleware,utils,config,models,lib}
```

#### 5. Create Main App File

`app.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api/camera', require('./routes/camera.routes'));
app.use('/api/photos', require('./routes/photos.routes'));
app.use('/api/editor', require('./routes/editor.routes'));
app.use('/api/layout', require('./routes/layout.routes'));
app.use('/api/print', require('./routes/print.routes'));
app.use('/api/storage', require('./routes/storage.routes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    error: {
      type: 'SERVER_ERROR',
      message: err.message
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
```

#### 6. Create `.env` file

```env
NODE_ENV=development
PORT=5000
HOST=localhost

CAMERA_TYPE=CANON
CAMERA_DEBUG=true
CAMERA_TIMEOUT=5000

STORAGE_PATH=./photos
TEMP_PATH=./temp
MAX_PHOTOS_PER_SESSION=30

PRINTER_ENABLED=false
PRINTER_NAME=Canon_Photo_Printer

GOOGLE_DRIVE_ENABLED=false
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
```

#### 7. Start Development

```bash
npm run dev
```

---

### Backend Setup (Python)

#### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Create `requirements.txt`:

```
fastapi==0.104.0
uvicorn==0.24.0
python-dotenv==1.0.0
pillow==10.1.0
gphoto2==2.3.2
aiofiles==23.2.1
python-multipart==0.0.6
pydantic==2.5.0
google-auth==2.25.1
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.2.0
google-api-python-client==2.106.0
requests==2.31.0
```

#### 3. Create Directory Structure

```bash
mkdir -p app/{api,services,models,utils,config}
```

#### 4. Create Main App File

`app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import camera, photos, editor, layout, printer, storage

app = FastAPI(title="Photobooth API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(camera.router, prefix="/api/camera")
app.include_router(photos.router, prefix="/api/photos")
app.include_router(editor.router, prefix="/api/editor")
app.include_router(layout.router, prefix="/api/layout")
app.include_router(printer.router, prefix="/api/print")
app.include_router(storage.router, prefix="/api/storage")

# Static files
app.mount("/photos", StaticFiles(directory="photos"), name="photos")

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

#### 5. Create `.env` file

```env
CAMERA_TYPE=CANON
CAMERA_DEBUG=true

STORAGE_PATH=./photos
TEMP_PATH=./temp
MAX_PHOTOS_PER_SESSION=30

PRINTER_ENABLED=false
PRINTER_NAME=Canon_Photo_Printer

GOOGLE_DRIVE_ENABLED=false
```

#### 6. Start Development

```bash
python -m app.main
# atau
uvicorn app.main:app --reload --port 5000
```

---

## 🧪 Testing Connection

### 1. Test Backend API

```bash
# Check server health
curl http://localhost:5000/health

# Expected response:
# {"status":"ok"}

# Check camera status
curl http://localhost:5000/api/camera/status

# Expected response:
# {"status":"success","data":{"connected":true,"model":"Canon EOS 5D Mark IV"}}
```

### 2. Test Frontend

Open browser → http://localhost:5173

You should see:
- Camera preview (atau error jika camera tidak connected)
- Capture button
- Navigation menu

### 3. Test Full Flow

```bash
# 1. Capture photo
curl -X POST http://localhost:5000/api/camera/capture \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_session","photoIndex":1}'

# 2. List photos
curl http://localhost:5000/api/photos

# 3. Generate layout
curl -X POST http://localhost:5000/api/layout/generate \
  -H "Content-Type: application/json" \
  -d '{"photoIds":["photo_001","photo_002","photo_003"]}'
```

---

## 🛠️ Development Tools

### Recommended VS Code Extensions

```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier
- ESLint
- Thunder Client (API testing)
- REST Client
```

### Install Extensions

```bash
# Dalam VS Code
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension rangav.vscode-thunder-client
```

### Useful Commands

```bash
# Format code
cd frontend
npm run lint:fix

cd ../backend
npm run lint:fix

# Run tests
npm test

# Build for production
npm run build

# View bundle size
npm run build -- --report
```

---

## 🚨 Troubleshooting

### Camera Not Found

```bash
# Check USB connection
gphoto2 --auto-detect

# Try different USB port
# Check device manager (Windows) atau system_profiler (Mac)

# Update drivers
# Canon: https://www.canon.com/en/support/
# Nikon: https://www.nikon.com/en/support/
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000          # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>          # Mac/Linux
taskkill /PID <PID> /F # Windows

# Or use different port
PORT=5001 npm run dev
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install
```

### Memory Issues

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run dev

# Or in .env
NODE_OPTIONS=--max-old-space-size=4096
```

---

## 📚 Next Steps

1. ✅ Setup completed
2. 📖 Read [DESIGN.md](./DESIGN.md) untuk UI guidelines
3. 🏗️ Read [ARCHITECTURE.md](./ARCHITECTURE.md) untuk system design
4. 📷 Read [DSLR_SETUP.md](./DSLR_SETUP.md) untuk camera setup
5. 🚀 Start building features!

---

## 📞 Support

- 🐛 Found a bug? Open an issue on GitHub
- 💡 Have an idea? Start a discussion
- 📧 Email: support@photobooth.dev

---

**Last Updated**: September 2026  
**Quick Start v1.0**
