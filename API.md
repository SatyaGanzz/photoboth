# 🔌 Photobooth API Documentation

Complete REST API reference untuk Photobooth backend.

---

## 📋 Base Information

**Base URL**: `http://localhost:5000`

**Content-Type**: `application/json`

**Response Format**: All responses return JSON

---

## 📊 Response Format

### Success Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status": "error",
  "code": 400,
  "error": {
    "type": "ERROR_TYPE",
    "message": "Error description",
    "details": "Additional context"
  }
}
```

---

## 🎥 Camera Endpoints

### POST `/api/camera/capture`
Capture photo dari DSLR camera.

**Request:**
```json
{
  "sessionId": "sess_12345",
  "photoIndex": 1
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "photoId": "photo_001",
    "url": "/photos/sess_12345/photo_001.jpg",
    "thumbnail": "/photos/sess_12345/photo_001_thumb.jpg",
    "timestamp": "2026-09-06T10:30:00Z",
    "metadata": {
      "width": 4000,
      "height": 3000,
      "fileSize": 2500000,
      "camera": "Canon EOS 5D Mark IV"
    }
  }
}
```

**Status Codes:**
- `200` - Photo captured successfully
- `400` - Invalid request
- `500` - Camera error / DSLR disconnected

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/camera/capture \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_12345",
    "photoIndex": 1
  }'
```

---

### GET `/api/camera/status`
Get camera connection status.

**Response:**
```json
{
  "status": "success",
  "data": {
    "connected": true,
    "model": "Canon EOS 5D Mark IV",
    "battery": "100%",
    "mode": "Ready",
    "liveViewSupported": true,
    "liveViewActive": false
  }
}
```

**Example cURL:**
```bash
curl http://localhost:5000/api/camera/status
```

---

### GET `/api/camera/livestream`
Get live preview stream dari DSLR (MJPEG format).

**Headers:**
```
Accept: multipart/x-mixed-replace
```

**Response Format:**
```
Multipart JPEG stream (MJPEG)
```

**Example (dalam HTML):**
```html
<img src="http://localhost:5000/api/camera/livestream" alt="Live Preview">
```

---

### POST `/api/camera/settings`
Update camera settings.

**Request:**
```json
{
  "iso": 400,
  "shutter": "1/250",
  "aperture": "f/8",
  "whiteBalance": "auto",
  "quality": "jpeg"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "settings": {
      "iso": 400,
      "shutter": "1/250",
      "aperture": "f/8",
      "whiteBalance": "auto",
      "quality": "jpeg"
    }
  }
}
```

---

## 📸 Photo Endpoints

### GET `/api/photos`
Get list of captured photos.

**Query Parameters:**
```
?sessionId=sess_12345
?limit=10
?offset=0
?sort=newest  (newest, oldest, size)
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "photos": [
      {
        "id": "photo_001",
        "url": "/photos/sess_12345/photo_001.jpg",
        "thumbnail": "/photos/sess_12345/photo_001_thumb.jpg",
        "timestamp": "2026-09-06T10:30:00Z",
        "metadata": {
          "width": 4000,
          "height": 3000,
          "fileSize": 2500000
        },
        "status": "captured",
        "selected": false
      }
    ],
    "total": 6,
    "limit": 10,
    "offset": 0
  }
}
```

**Example cURL:**
```bash
curl "http://localhost:5000/api/photos?sessionId=sess_12345&limit=10"
```

---

### GET `/api/photos/:photoId`
Get specific photo details.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "photo_001",
    "url": "/photos/sess_12345/photo_001.jpg",
    "thumbnail": "/photos/sess_12345/photo_001_thumb.jpg",
    "timestamp": "2026-09-06T10:30:00Z",
    "metadata": {
      "width": 4000,
      "height": 3000,
      "fileSize": 2500000,
      "camera": "Canon EOS 5D Mark IV"
    },
    "edits": null,
    "status": "captured",
    "selected": false
  }
}
```

---

### POST `/api/photos/select`
Select multiple photos untuk layout.

**Request:**
```json
{
  "sessionId": "sess_12345",
  "selectedPhotoIds": [
    "photo_001",
    "photo_003",
    "photo_005"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "selectedPhotos": [
      "photo_001",
      "photo_003",
      "photo_005"
    ],
    "count": 3,
    "layout": "3x1"
  }
}
```

**Validation:**
- Max 3 photos untuk 3x1 layout
- Return error jika > 3

---

### DELETE `/api/photos/:photoId`
Delete single photo.

**Response:**
```json
{
  "status": "success",
  "message": "Photo deleted successfully"
}
```

---

### POST `/api/photos/delete-batch`
Delete multiple photos.

**Request:**
```json
{
  "photoIds": [
    "photo_001",
    "photo_002",
    "photo_003"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "deleted": 3,
    "remaining": 3
  }
}
```

---

## ✏️ Photo Editor Endpoints

### POST `/api/editor/crop`
Crop photo.

**Request:**
```json
{
  "photoId": "photo_001",
  "crop": {
    "x": 100,
    "y": 100,
    "width": 3000,
    "height": 2000
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "photoId": "photo_001",
    "editId": "edit_crop_001",
    "preview": "/photos/sess_12345/photo_001_preview.jpg",
    "metadata": {
      "width": 3000,
      "height": 2000
    }
  }
}
```

---

### POST `/api/editor/rotate`
Rotate photo.

**Request:**
```json
{
  "photoId": "photo_001",
  "angle": 90
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "photoId": "photo_001",
    "editId": "edit_rotate_001",
    "angle": 90,
    "preview": "/photos/sess_12345/photo_001_preview.jpg"
  }
}
```

**Angle Values:**
- `90` - Rotate 90° clockwise
- `180` - Rotate 180°
- `270` - Rotate 270° clockwise (atau -90°)

---

### POST `/api/editor/adjust`
Adjust brightness, contrast, saturation.

**Request:**
```json
{
  "photoId": "photo_001",
  "adjustments": {
    "brightness": 20,
    "contrast": 15,
    "saturation": 10
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "photoId": "photo_001",
    "editId": "edit_adjust_001",
    "adjustments": {
      "brightness": 20,
      "contrast": 15,
      "saturation": 10
    },
    "preview": "/photos/sess_12345/photo_001_preview.jpg"
  }
}
```

**Value Range:**
- `brightness`: -100 to +100
- `contrast`: -100 to +100
- `saturation`: -100 to +100

---

### POST `/api/editor/filter`
Apply filter to photo.

**Request:**
```json
{
  "photoId": "photo_001",
  "filter": "sepia"
}
```

**Available Filters:**
- `sepia`
- `grayscale`
- `warm`
- `cool`
- `vintage`
- `pop`

**Response:**
```json
{
  "status": "success",
  "data": {
    "photoId": "photo_001",
    "editId": "edit_filter_001",
    "filter": "sepia",
    "preview": "/photos/sess_12345/photo_001_preview.jpg"
  }
}
```

---

### POST `/api/editor/apply`
Apply all pending edits ke photo.

**Request:**
```json
{
  "photoId": "photo_001"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "photoId": "photo_001",
    "url": "/photos/sess_12345/photo_001.jpg",
    "edits": [
      "edit_crop_001",
      "edit_rotate_001",
      "edit_adjust_001"
    ],
    "status": "edited"
  }
}
```

---

### POST `/api/editor/revert`
Revert edits ke original photo.

**Request:**
```json
{
  "photoId": "photo_001"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "photoId": "photo_001",
    "url": "/photos/sess_12345/photo_001.jpg",
    "status": "captured"
  }
}
```

---

## 🎨 Layout Endpoints

### POST `/api/layout/generate`
Generate 3x1 layout dari 3 photos.

**Request:**
```json
{
  "sessionId": "sess_12345",
  "photoIds": [
    "photo_001",
    "photo_003",
    "photo_005"
  ],
  "template": "3x1",
  "padding": 8,
  "backgroundColor": "#FFFFFF"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "layoutId": "layout_001",
    "url": "/photos/sess_12345/layout_001.jpg",
    "preview": "/photos/sess_12345/layout_001_preview.jpg",
    "metadata": {
      "width": 6000,
      "height": 2000,
      "format": "jpg"
    },
    "generatedAt": "2026-09-06T10:35:00Z"
  }
}
```

---

### GET `/api/layout/preview`
Get preview of current layout.

**Query Parameters:**
```
?layoutId=layout_001
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "layoutId": "layout_001",
    "preview": "/photos/sess_12345/layout_001_preview.jpg",
    "metadata": {
      "width": 6000,
      "height": 2000,
      "photoIds": [
        "photo_001",
        "photo_003",
        "photo_005"
      ]
    }
  }
}
```

---

### POST `/api/layout/rearrange`
Rearrange order of photos dalam layout.

**Request:**
```json
{
  "layoutId": "layout_001",
  "photoIds": [
    "photo_005",    // Swapped positions
    "photo_001",
    "photo_003"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "layoutId": "layout_001",
    "url": "/photos/sess_12345/layout_001.jpg",
    "preview": "/photos/sess_12345/layout_001_preview.jpg",
    "photoIds": [
      "photo_005",
      "photo_001",
      "photo_003"
    ]
  }
}
```

---

## 🖨️ Printer Endpoints

### GET `/api/print/printers`
Get list of available printers.

**Response:**
```json
{
  "status": "success",
  "data": {
    "printers": [
      {
        "id": "printer_001",
        "name": "Canon Photo Printer",
        "status": "idle",
        "paperSizes": ["4x6", "5x7", "6x8"],
        "defaultPaperSize": "4x6",
        "location": "Office"
      },
      {
        "id": "printer_002",
        "name": "Epson Pro",
        "status": "idle",
        "paperSizes": ["4x6", "5x7", "6x8", "8x10"],
        "defaultPaperSize": "5x7"
      }
    ],
    "total": 2
  }
}
```

---

### GET `/api/print/settings`
Get print settings options.

**Response:**
```json
{
  "status": "success",
  "data": {
    "paperSizes": [
      { "value": "4x6", "label": "4x6 inches" },
      { "value": "5x7", "label": "5x7 inches" },
      { "value": "6x8", "label": "6x8 inches" },
      { "value": "8x10", "label": "8x10 inches" }
    ],
    "dpiOptions": [200, 300, 600],
    "colorModes": ["color", "bw", "grayscale"],
    "qualityOptions": ["draft", "normal", "high", "photo"]
  }
}
```

---

### POST `/api/print/preview`
Preview photo sebelum print.

**Request:**
```json
{
  "layoutId": "layout_001",
  "printerSettings": {
    "printerId": "printer_001",
    "paperSize": "4x6",
    "dpi": 300,
    "colorMode": "color",
    "quality": "photo",
    "copies": 1,
    "borderless": true
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "previewUrl": "/print-previews/layout_001_preview.pdf",
    "settings": {
      "paperSize": "4x6",
      "dpi": 300,
      "colorMode": "color",
      "quality": "photo",
      "copies": 1
    },
    "estimatedTime": "45 seconds"
  }
}
```

---

### POST `/api/print/send`
Send layout ke printer.

**Request:**
```json
{
  "layoutId": "layout_001",
  "printerSettings": {
    "printerId": "printer_001",
    "paperSize": "4x6",
    "dpi": 300,
    "colorMode": "color",
    "quality": "photo",
    "copies": 1
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "printJobId": "print_001",
    "status": "queued",
    "printerId": "printer_001",
    "layoutId": "layout_001",
    "copies": 1,
    "estimatedTime": "45 seconds",
    "queuePosition": 1,
    "sentAt": "2026-09-06T10:40:00Z"
  }
}
```

---

### GET `/api/print/status/:printJobId`
Get status of print job.

**Response:**
```json
{
  "status": "success",
  "data": {
    "printJobId": "print_001",
    "status": "printing",
    "printerId": "printer_001",
    "layoutId": "layout_001",
    "copies": 1,
    "progress": 75,
    "startedAt": "2026-09-06T10:40:05Z",
    "estimatedCompletionTime": "30 seconds"
  }
}
```

**Status Values:**
- `queued` - Menunggu antrian
- `printing` - Sedang print
- `completed` - Selesai
- `error` - Error
- `paused` - Dijeda

---

## 💾 Storage Endpoints

### GET `/api/storage/list`
List files dalam session.

**Query Parameters:**
```
?sessionId=sess_12345
?type=photo  (photo, layout, all)
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "files": [
      {
        "id": "photo_001",
        "filename": "photo_001.jpg",
        "path": "./photos/sess_12345/photo_001.jpg",
        "size": 2500000,
        "type": "photo",
        "createdAt": "2026-09-06T10:30:00Z"
      }
    ],
    "total": 6,
    "totalSize": 15000000
  }
}
```

---

### POST `/api/storage/download`
Download photo atau layout ke local disk.

**Request:**
```json
{
  "sessionId": "sess_12345",
  "fileIds": ["photo_001", "layout_001"],
  "format": "zip"
}
```

**Response:**
```
Content-Type: application/zip
Content-Disposition: attachment; filename=photobooth_sess_12345.zip

[Binary zip file data]
```

---

### POST `/api/storage/export`
Export session ke file.

**Request:**
```json
{
  "sessionId": "sess_12345",
  "includePhotos": true,
  "includeLayout": true,
  "includeMetadata": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "exportId": "export_001",
    "url": "/exports/photobooth_sess_12345.zip",
    "size": 25000000,
    "createdAt": "2026-09-06T10:45:00Z"
  }
}
```

---

### DELETE `/api/storage/cleanup`
Delete old sessions (auto cleanup).

**Request:**
```json
{
  "olderThanHours": 24
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "deletedSessions": 5,
    "freedSpace": "500MB"
  }
}
```

---

## 🌐 Google Drive Endpoints

### POST `/api/drive/auth`
Authorize Google Drive access.

**Request:**
```json
{
  "accessToken": "ya29.xxxxx",
  "refreshToken": "1//xxxxx"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "authorized": true,
    "user": "user@gmail.com",
    "expiresAt": "2026-09-06T12:00:00Z"
  }
}
```

---

### POST `/api/drive/upload`
Upload session ke Google Drive.

**Request:**
```json
{
  "sessionId": "sess_12345",
  "parentFolderId": "folder_id",
  "files": [
    "photo_001",
    "layout_001"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "uploadId": "upload_001",
    "fileCount": 2,
    "totalSize": 8000000,
    "driveUrl": "https://drive.google.com/drive/folders/xxxxx",
    "uploadedAt": "2026-09-06T10:50:00Z"
  }
}
```

---

### GET `/api/drive/status`
Get Google Drive integration status.

**Response:**
```json
{
  "status": "success",
  "data": {
    "authorized": true,
    "user": "user@gmail.com",
    "storageLimitGB": 15,
    "storageUsedGB": 8.5,
    "storageAvailableGB": 6.5
  }
}
```

---

### POST `/api/drive/disconnect`
Disconnect Google Drive.

**Response:**
```json
{
  "status": "success",
  "message": "Google Drive disconnected"
}
```

---

## 🔐 Error Codes

| Code | Type | Description |
|------|------|-------------|
| 400 | BAD_REQUEST | Invalid request format |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Access denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 413 | PAYLOAD_TOO_LARGE | File size exceeded |
| 500 | SERVER_ERROR | Internal server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily down |
| 1001 | CAMERA_ERROR | Camera disconnected / error |
| 1002 | PRINTER_ERROR | Printer not available |
| 1003 | STORAGE_ERROR | Storage access error |
| 1004 | DRIVE_ERROR | Google Drive error |

---

## 📝 Request Examples

### Node.js (Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/camera/capture', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sessionId: 'sess_12345',
    photoIndex: 1
  })
});

const data = await response.json();
console.log(data);
```

### Python (Requests)

```python
import requests

response = requests.post(
  'http://localhost:5000/api/camera/capture',
  json={
    'sessionId': 'sess_12345',
    'photoIndex': 1
  }
)

data = response.json()
print(data)
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const response = await axios.post(
  'http://localhost:5000/api/camera/capture',
  {
    sessionId: 'sess_12345',
    photoIndex: 1
  }
);

console.log(response.data);
```

---

## 🧪 Testing dengan Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import collection: [postman-collection.json](./postman-collection.json)
3. Set environment variables
4. Run requests

---

**Last Updated**: September 2026  
**API v1.0**
