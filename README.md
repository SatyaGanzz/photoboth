# 📸 Photobooth - DSLR Photo Studio Application

Aplikasi photobooth modern yang menghubungkan camera DSLR untuk capture foto, edit, dan export ke printer dengan layout 3x1.

## 🎯 Fitur Utama

- ✅ **Live Camera Feed** - Tampilkan preview real-time dari DSLR
- ✅ **Photo Capture** - Ambil foto menggunakan DSLR via USB/Network
- ✅ **Photo Editing** - Edit foto (crop, rotate, adjust color)
- ✅ **Layout Builder** - Pilih 3 foto untuk layout 3x1 print-ready
- ✅ **Print Formatter** - Export dengan format siap cetak
- ✅ **Cloud Sync** - Upload ke Google Drive (optional)
- ✅ **Local Storage** - Simpan foto di local disk
- ✅ **Batch Print** - Max 3x print per session

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│           Photobooth Application                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐      ┌──────────────────┐│
│  │  Frontend (UI)   │◄────►│  Backend (Core)  ││
│  │  React/Vue.js    │      │  Python/Node.js  ││
│  │  Neomorph Style  │      │  DSLR Control    ││
│  └──────────────────┘      │  Image Process   ││
│                            └──────────────────┘│
│                                 │              │
│          ┌──────────────────────┼────────────────┐
│          ▼                      ▼                ▼
│      ┌─────────┐           ┌─────────┐     ┌──────────┐
│      │  DSLR   │           │ Storage │     │ Printer  │
│      │ Camera  │           │ Local   │     │ Driver   │
│      └─────────┘           └─────────┘     └──────────┘
│
└─────────────────────────────────────────────────┘
```

---

## 📋 Tech Stack

### Frontend
- **Framework**: React 18 / Vite
- **Styling**: Tailwind CSS + Custom CSS (Neomorph)
- **State Management**: Zustand
- **Camera**: react-camera-pro atau html5-camera-preview
- **Image Editing**: Konva.js atau Fabric.js

### Backend
- **Runtime**: Node.js (Electron) atau Python (FastAPI)
- **DSLR Control**: 
  - **Windows**: Canon EOS SDK / Nikon SDK
  - **Cross-platform**: gphoto2 (open-source)
- **Image Processing**: Sharp (Node) / Pillow (Python)
- **File Management**: fs module
- **API**: Express.js / FastAPI

### External
- **Cloud Storage**: Google Drive API (optional)
- **Printer**: Node-printer atau CUPS API
- **Database**: SQLite (optional, untuk history)

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 16+
node --version

# Python 3.8+ (jika pakai Python backend)
python --version

# DSLR drivers
# Windows: Canon/Nikon SDK
# Linux/Mac: sudo apt-get install gphoto2 libgphoto2-dev
```

### Installation

```bash
# Clone repo
git clone https://github.com/yourusername/photobooth.git
cd photobooth

# Install dependencies
npm install
# atau: pip install -r requirements.txt

# Setup DSLR connection
# Lihat DSLR_SETUP.md

# Jalankan aplikasi
npm run dev
# atau: python app.py
```

---

## 📱 User Flow

```
1. STARTUP
   └─► Camera Preview (live feed)
       ├─► Tombol: CAPTURE / VIEW GALLERY
       └─► Status: Connected/Disconnected

2. CAPTURE PHASE
   └─► User siap ambil foto
       ├─► Klik CAPTURE
       ├─► Foto tersimpan di local storage
       ├─► Counter: 1/3, 2/3, 3/3
       └─► Pilihan: Lanjut ambil / Review foto

3. SELECTION PHASE
   └─► Pilih 3 dari N foto
       ├─► Thumbnail grid
       ├─► Select max 3 foto
       ├─► Preview layout 3x1
       └─► Tombol: EDIT / PRINT / DOWNLOAD

4. EDITING PHASE
   └─► Edit sebelum print
       ├─► Crop, Rotate, Adjust brightness/contrast
       ├─► Filter (optional)
       ├─► Preview
       └─► Tombol: APPLY / CANCEL

5. OUTPUT PHASE
   ├─► PRINT: Send ke printer dengan format
   ├─► DOWNLOAD: Save ke local folder / Drive
   └─► SHARE: QR code atau link (optional)
```

---

## 📂 Project Structure

```
photobooth/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraPreview.jsx
│   │   │   ├── PhotoGallery.jsx
│   │   │   ├── LayoutBuilder.jsx
│   │   │   ├── PhotoEditor.jsx
│   │   │   └── PrintPreview.jsx
│   │   ├── pages/
│   │   │   ├── Capture.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Edit.jsx
│   │   │   └── Print.jsx
│   │   ├── styles/
│   │   │   ├── neomorph.css
│   │   │   └── global.css
│   │   ├── hooks/
│   │   │   ├── useCamera.js
│   │   │   ├── useStorage.js
│   │   │   └── usePrinter.js
│   │   ├── store/
│   │   │   └── photoStore.js (Zustand)
│   │   └── App.jsx
│   ├── public/
│   └── vite.config.js
│
├── backend/
│   ├── app.py (atau server.js)
│   ├── camera/
│   │   ├── dslr_controller.py
│   │   └── camera_interface.py
│   ├── processing/
│   │   ├── image_processor.py
│   │   ├── layout_generator.py
│   │   └── print_formatter.py
│   ├── storage/
│   │   ├── local_storage.py
│   │   └── cloud_sync.py
│   ├── printer/
│   │   └── printer_driver.py
│   └── config/
│       └── settings.py
│
├── docs/
│   ├── DESIGN.md
│   ├── DSLR_SETUP.md
│   ├── API.md
│   └── PRINTER_SETUP.md
│
├── tests/
│   ├── test_camera.py
│   ├── test_image_processor.py
│   └── test_printer.py
│
├── .env.example
├── requirements.txt (Python)
├── package.json
├── README.md
└── LICENSE
```

---

## 🎨 UI Components Overview

### 1. **Camera Preview Screen**
```
┌─────────────────────────────────────┐
│  🔴 LIVE CAMERA PREVIEW             │
│                                     │
│       ┌──────────────────┐          │
│       │                  │          │
│       │   📷 Live Feed   │          │
│       │                  │          │
│       └──────────────────┘          │
│                                     │
│   [📷 CAPTURE]  [🖼️ GALLERY]        │
│                                     │
│   Status: Connected ✓               │
└─────────────────────────────────────┘
```

### 2. **Gallery Screen**
```
┌─────────────────────────────────────┐
│  📷 YOUR PHOTOS (6)                 │
├─────────────────────────────────────┤
│  ☐ [1] ☐ [2] ☐ [3]                 │
│  ☐ [4] ☐ [5] ☐ [6]                 │
│                                     │
│  Selected: 2/3                      │
│                                     │
│  [🔧 EDIT]  [📤 PRINT]  [💾 SAVE]   │
└─────────────────────────────────────┘
```

### 3. **Layout Builder (3x1)**
```
┌─────────────────────────────────────┐
│  🎨 LAYOUT 3x1                      │
├─────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┐   │
│  │ [Foto1] │ [Foto2] │ [Foto3] │   │
│  └─────────┴─────────┴─────────┘   │
│                                     │
│  [🔄 REARRANGE]  [✏️ EDIT]          │
│  [📄 FORMAT]  [🖨️ PRINT]            │
└─────────────────────────────────────┘
```

---

## 🔧 Configuration

Buat file `.env`:
```env
# DSLR Settings
CAMERA_TYPE=CANON # CANON, NIKON, GENERIC
CAMERA_USB_PORT=COM3
CAMERA_NETWORK_IP=192.168.1.100

# Storage
STORAGE_PATH=./photos
TEMP_PATH=./temp
MAX_PHOTOS_PER_SESSION=30

# Printer
PRINTER_NAME=Canon_Photo_Printer
PRINTER_PAPER_SIZE=4x6 # 4x6, 5x7, 6x8, custom
PRINT_DPI=300

# Google Drive (optional)
GOOGLE_DRIVE_ENABLED=false
GOOGLE_DRIVE_FOLDER_ID=xxxxx

# Server
BACKEND_PORT=5000
FRONTEND_PORT=3000
```

---

## 🌐 API Endpoints

```
POST   /api/camera/capture          - Ambil foto
GET    /api/camera/status           - Status kamera
GET    /api/photos                  - List foto
POST   /api/photos/select           - Pilih 3 foto
POST   /api/photos/edit             - Edit foto
POST   /api/layout/generate         - Generate layout 3x1
POST   /api/print/preview           - Preview print
POST   /api/print/send              - Kirim ke printer
POST   /api/storage/download        - Download ke local
POST   /api/drive/upload            - Upload ke Google Drive
DELETE /api/photos/:id              - Hapus foto
```

---

## 📖 Documentation

- **[DESIGN.md](./docs/DESIGN.md)** - UI/UX & Neomorph styling
- **[DSLR_SETUP.md](./docs/DSLR_SETUP.md)** - Konfigurasi camera
- **[API.md](./docs/API.md)** - API documentation lengkap
- **[PRINTER_SETUP.md](./docs/PRINTER_SETUP.md)** - Konfigurasi printer

---

## 🛠️ Development

### Run Development Mode
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Build Production
```bash
npm run build
# atau: pyinstaller untuk standalone app
```

---

## 🤝 Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/nama-fitur`)
3. Commit changes (`git commit -m 'Add fitur'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Open Pull Request

---

## 📝 License

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan

---

## 💬 Support & Contact

- 📧 Email: support@photobooth.dev
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/photobooth/issues)
- 💡 Discussions: [GitHub Discussions](https://github.com/yourusername/photobooth/discussions)

---

**Last Updated**: September 2026  
**Version**: 1.0.0-beta
