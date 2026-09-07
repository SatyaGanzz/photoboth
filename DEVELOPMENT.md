# 👨‍💻 Photobooth Development Guide

Panduan lengkap untuk development, testing, dan deployment.

---

## 📋 Development Checklist

### Phase 1: Setup & Foundation ✅

- [ ] Clone repository
- [ ] Install dependencies (frontend & backend)
- [ ] Setup environment variables
- [ ] Test camera connection
- [ ] Verify backend API running
- [ ] Verify frontend running on localhost:3000

### Phase 2: Core Features

#### Camera & Capture
- [ ] Implement camera connection handler
- [ ] Create live preview component
- [ ] Implement photo capture endpoint
- [ ] Handle raw image processing
- [ ] Create thumbnail generation
- [ ] Test with real DSLR

#### Photo Gallery
- [ ] Create photo gallery component
- [ ] Implement photo selection logic (max 3)
- [ ] Add thumbnail display
- [ ] Implement delete functionality
- [ ] Add selection counter

#### Photo Editor
- [ ] Implement crop tool
- [ ] Implement rotate function
- [ ] Add brightness/contrast controls
- [ ] Implement filter system
- [ ] Add undo/revert functionality
- [ ] Create editor preview

#### Layout Builder
- [ ] Create 3x1 layout template
- [ ] Implement photo arrangement logic
- [ ] Add drag-and-drop functionality
- [ ] Create layout preview
- [ ] Implement rearrange feature

#### Print System
- [ ] Detect available printers
- [ ] Create print settings dialog
- [ ] Implement print formatting
- [ ] Add print preview
- [ ] Implement print queue
- [ ] Test actual printing

### Phase 3: Storage & Cloud

#### Local Storage
- [ ] Implement local file saving
- [ ] Create session management
- [ ] Add storage cleanup logic
- [ ] Implement export functionality

#### Google Drive (Optional)
- [ ] Setup Google OAuth
- [ ] Implement upload functionality
- [ ] Add sync status indicator
- [ ] Implement download functionality

### Phase 4: UI/UX Polish

#### Neomorph Design
- [ ] Apply color variables
- [ ] Implement shadow system
- [ ] Add neomorph components
- [ ] Create button states
- [ ] Add animations & transitions
- [ ] Responsive design testing

#### User Experience
- [ ] Add loading indicators
- [ ] Implement error messages
- [ ] Add success notifications
- [ ] Create help tooltips
- [ ] Add keyboard shortcuts

### Phase 5: Testing & QA

#### Unit Tests
- [ ] Test camera service
- [ ] Test image processor
- [ ] Test layout generator
- [ ] Test storage functions
- [ ] Test printer driver

#### Integration Tests
- [ ] Test full capture flow
- [ ] Test edit pipeline
- [ ] Test layout generation
- [ ] Test print workflow
- [ ] Test cloud sync

#### End-to-End Tests
- [ ] Test complete user flow
- [ ] Test error scenarios
- [ ] Test multiple sessions
- [ ] Test with different cameras
- [ ] Test with different printers

#### Performance Testing
- [ ] Profile image processing
- [ ] Check memory usage
- [ ] Measure load times
- [ ] Test with large batches
- [ ] Optimize bottlenecks

### Phase 6: Documentation

- [ ] Complete README.md
- [ ] Complete API documentation
- [ ] Create user guide
- [ ] Create troubleshooting guide
- [ ] Add code comments
- [ ] Create deployment guide

### Phase 7: Deployment

- [ ] Setup production environment
- [ ] Configure CD/CI pipeline
- [ ] Setup monitoring & logging
- [ ] Create backup system
- [ ] Test production deployment
- [ ] Create runbooks

---

## 🔧 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin develop

# 2. Create feature branch
git checkout -b feature/camera-live-preview

# 3. Start development servers
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# 4. Make changes, commit regularly
git add .
git commit -m "feat: add camera live preview"

# 5. Push when feature complete
git push origin feature/camera-live-preview

# 6. Create Pull Request on GitHub
```

### Git Workflow

```bash
# Main branches
main           # Production release
develop        # Development base
staging        # Pre-production

# Feature branches
feature/xxx    # New features
bugfix/xxx     # Bug fixes
refactor/xxx   # Code refactoring
docs/xxx       # Documentation

# Naming convention
feature/camera-capture-implementation
feature/print-layout-builder
bugfix/photo-deletion-crash
```

### Commit Messages

```
feat: add camera live preview
fix: resolve photo deletion bug
refactor: simplify image processor logic
docs: update API documentation
style: apply neomorph styling to buttons
test: add unit tests for layout generator
perf: optimize image compression
chore: update dependencies
```

---

## 🧪 Testing Guide

### Running Tests

```bash
# Frontend tests
cd frontend
npm test
npm test -- --coverage

# Backend tests
cd backend
npm test
npm test -- --coverage

# E2E tests
npm run test:e2e
```

### Test Coverage Goals

```
Target Coverage:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%
```

### Unit Test Example (Backend)

```javascript
// tests/services/image-processor.test.js

const ImageProcessor = require('../../services/image/image.processor');
const fs = require('fs-extra');

describe('ImageProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new ImageProcessor();
  });

  describe('processImage', () => {
    it('should compress image', async () => {
      const inputPath = './test-fixtures/photo.jpg';
      const outputPath = './test-output/photo-compressed.jpg';

      await processor.processImage(inputPath, outputPath, {
        quality: 85,
        maxWidth: 2000,
        maxHeight: 1500
      });

      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeLessThan(2500000);
    });

    it('should generate thumbnail', async () => {
      const inputPath = './test-fixtures/photo.jpg';
      const outputPath = './test-output/photo-thumb.jpg';

      await processor.generateThumbnail(inputPath, outputPath, 300);

      expect(fs.existsSync(outputPath)).toBe(true);
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeLessThan(100000);
    });
  });
});
```

### Unit Test Example (Frontend)

```javascript
// frontend/src/components/PhotoGallery.test.jsx

import { render, screen, fireEvent } from '@testing-library/react';
import PhotoGallery from './PhotoGallery';
import { usePhotoStore } from '../store/photoStore';

jest.mock('../store/photoStore');

describe('PhotoGallery', () => {
  beforeEach(() => {
    usePhotoStore.mockImplementation(() => ({
      photos: [
        { id: '1', url: '/photo1.jpg' },
        { id: '2', url: '/photo2.jpg' }
      ],
      selectPhoto: jest.fn(),
      deselectPhoto: jest.fn()
    }));
  });

  it('should render photo thumbnails', () => {
    render(<PhotoGallery />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('should select photo on click', () => {
    const mockSelect = jest.fn();
    usePhotoStore.mockImplementation(() => ({
      photos: [{ id: '1', url: '/photo1.jpg' }],
      selectPhoto: mockSelect,
      deselectPhoto: jest.fn()
    }));

    render(<PhotoGallery />);
    const thumbnail = screen.getByRole('img');
    fireEvent.click(thumbnail);
    expect(mockSelect).toHaveBeenCalledWith('1');
  });
});
```

### E2E Test Example

```javascript
// tests/e2e/capture-flow.test.js

describe('Capture Flow E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should complete full capture workflow', () => {
    // 1. Check camera connected
    cy.get('[data-cy=camera-status]')
      .should('contain', 'Connected');

    // 2. Capture photo
    cy.get('[data-cy=capture-button]').click();
    cy.wait(3000); // Wait for capture

    // 3. Verify photo in gallery
    cy.get('[data-cy=gallery]').should('be.visible');
    cy.get('[data-cy=photo-thumbnail]').should('have.length', 1);

    // 4. Select photo
    cy.get('[data-cy=photo-thumbnail]').click();
    cy.get('[data-cy=selection-counter]').should('contain', '1/3');

    // 5. Go to layout
    cy.get('[data-cy=layout-button]').click();
    cy.url().should('include', '/layout');

    // 6. Preview print
    cy.get('[data-cy=preview-button]').click();
    cy.get('[data-cy=layout-preview]').should('be.visible');
  });
});
```

---

## 🐛 Debugging

### Backend Debugging

#### Using VS Code

1. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/app.js",
      "restart": true,
      "runtimeArgs": ["--inspect"],
      "console": "integratedTerminal"
    }
  ]
}
```

2. Press F5 untuk start debugging
3. Set breakpoints dengan click di line number
4. Inspect variables di debugger console

#### Using Chrome DevTools

```bash
# Start node with inspect flag
node --inspect backend/app.js

# Open Chrome DevTools
chrome://inspect

# Inspect available processes
```

### Frontend Debugging

#### React Developer Tools

1. Install Chrome extension: React Developer Tools
2. Open DevTools → Components tab
3. Inspect component tree
4. Monitor state changes

#### Redux DevTools

1. Install extension: Redux DevTools
2. View action history
3. Time-travel debugging
4. Inspect state changes

---

## 📊 Performance Optimization

### Image Processing Pipeline

```javascript
// backend/services/image/image.processor.js

const sharp = require('sharp');

class ImageProcessor {
  async optimizeImage(inputPath, outputPath) {
    // Pipeline
    const metadata = await sharp(inputPath).metadata();
    
    await sharp(inputPath)
      // Resize jika terlalu besar
      .resize(2000, 1500, {
        fit: 'inside',
        withoutEnlargement: true
      })
      // Compress JPEG
      .jpeg({ quality: 85, progressive: true })
      // Optimize
      .withMetadata()
      .toFile(outputPath);
  }
}
```

### React Performance

```javascript
// frontend/src/components/PhotoGallery.jsx

import React, { memo } from 'react';

// Memoize thumbnail component
const PhotoThumbnail = memo(({ photo, onSelect }) => {
  return (
    <img
      src={photo.thumbnail}
      onClick={() => onSelect(photo.id)}
      loading="lazy"  // Lazy load images
    />
  );
});

// Use virtualization untuk large lists
import { FixedSizeList } from 'react-window';

function PhotoGallery() {
  return (
    <FixedSizeList
      height={600}
      itemCount={100}
      itemSize={150}
    >
      {({ index, style }) => (
        <PhotoThumbnail
          photo={photos[index]}
          style={style}
        />
      )}
    </FixedSizeList>
  );
}
```

### API Performance

```javascript
// backend/middleware/cache.js

const cache = new Map();

function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  
  if (cache.has(key)) {
    return res.json(cache.get(key));
  }

  const originalJson = res.json;
  res.json = function(data) {
    cache.set(key, data);
    // Clear cache after 5 minutes
    setTimeout(() => cache.delete(key), 5 * 60 * 1000);
    return originalJson.call(this, data);
  };

  next();
}

module.exports = cacheMiddleware;
```

---

## 🔒 Security Checklist

- [ ] Validate all user inputs
- [ ] Sanitize file uploads
- [ ] Implement rate limiting
- [ ] Use HTTPS in production
- [ ] Secure camera credentials
- [ ] Encrypt sensitive data
- [ ] Implement CORS properly
- [ ] Add authentication if needed
- [ ] Log security events
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

---

## 📝 Code Style Guide

### JavaScript/Node.js

```javascript
// ✅ Good
const capturePhoto = async (sessionId) => {
  try {
    const photo = await camera.capture();
    const processed = await processImage(photo);
    return processed;
  } catch (error) {
    logger.error('Capture failed:', error);
    throw error;
  }
};

// ❌ Bad
function capturePhoto(sessionId) {
  var photo = camera.capture();  // var, not const/let
  var processed = processImage(photo);  // No async
  return processed;
}
```

### React/JSX

```jsx
// ✅ Good
function PhotoGallery({ photos, onSelect }) {
  return (
    <div className="gallery">
      {photos.map(photo => (
        <PhotoThumbnail
          key={photo.id}
          photo={photo}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ❌ Bad
function PhotoGallery(props) {
  return (
    <div>
      {props.photos.map((photo, index) => (  // index as key
        <img
          key={index}
          src={photo.url}
          onClick={() => props.onSelect(photo)}
        />
      ))}
    </div>
  );
}
```

### CSS/Tailwind

```css
/* ✅ Good */
.photo-frame {
  @apply w-full rounded-lg shadow-neo border-2 border-gray-200;
  aspect-ratio: 3 / 1;
}

/* ❌ Bad */
.photo-frame {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 8px 8px 16px #D4D4D4, -8px -8px 16px #FFFFFF;
}
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run full test suite
- [ ] Check code coverage
- [ ] Run linter / formatter
- [ ] Update version number
- [ ] Update CHANGELOG.md
- [ ] Review security vulnerabilities
- [ ] Load test the application
- [ ] Test with production camera
- [ ] Test with production printer

### Production Build

```bash
# Frontend
cd frontend
npm run build

# Verify build
npm run preview

# Backend
cd backend
npm run build
```

### Deployment

```bash
# Copy files to server
scp -r build/ user@server:/var/www/photobooth/

# Restart services
ssh user@server "systemctl restart photobooth"

# Verify deployment
curl https://photobooth.yourdomain.com/health
```

### Post-Deployment

- [ ] Verify all endpoints working
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Test user workflows
- [ ] Announce to users
- [ ] Prepare rollback plan

---

## 📚 Useful Resources

### Learning
- React: https://react.dev
- Express.js: https://expressjs.com
- FastAPI: https://fastapi.tiangolo.com
- Tailwind CSS: https://tailwindcss.com
- Testing: https://jestjs.io

### Tools
- Postman: https://www.postman.com
- VS Code: https://code.visualstudio.com
- Chrome DevTools: Built-in
- Git: https://git-scm.com

### Monitoring
- New Relic
- Datadog
- Sentry
- LogRocket

---

## 💬 Team Communication

### Standups
- 🕐 Daily at 09:00 AM
- Duration: 15 minutes
- Format: What I did, what I'll do, blockers

### Code Review Process
1. Open PR with description
2. Link related issues
3. Request review from team lead
4. Address feedback
5. Merge after approval

### Documentation Updates
- Update docs when code changes
- Create ADRs for major decisions
- Document known issues & workarounds
- Keep README.md current

---

**Last Updated**: September 2026  
**Development Guide v1.0**
