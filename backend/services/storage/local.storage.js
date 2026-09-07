const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class LocalStorageService {
  constructor() {
    this.metadataFile = path.join(__dirname, '../../photos/metadata.json');
    this.memoryStore = this.loadMetadata();
  }

  loadMetadata() {
    try {
      if (fs.existsSync(this.metadataFile)) {
        return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading metadata file:', e);
    }
    return { photos: {}, sessions: {}, layouts: {} };
  }

  saveMetadata() {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(this.memoryStore, null, 2));
    } catch (e) {
      console.error('Error saving metadata file:', e);
    }
  }

  recordPhoto(photoData) {
    const { id, sessionId } = photoData;
    this.memoryStore.photos[id] = {
      ...photoData,
      createdAt: new Date().toISOString()
    };
    if (!this.memoryStore.sessions[sessionId]) {
      this.memoryStore.sessions[sessionId] = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        photos: []
      };
    }
    if (!this.memoryStore.sessions[sessionId].photos.includes(id)) {
      this.memoryStore.sessions[sessionId].photos.push(id);
    }
    this.saveMetadata();
    return this.memoryStore.photos[id];
  }

  getPhotos(sessionId, limit = 20, offset = 0) {
    let list = Object.values(this.memoryStore.photos);
    if (sessionId) {
      list = list.filter((p) => p.sessionId === sessionId);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = list.length;
    const photos = list.slice(offset, offset + limit);
    return { photos, total, limit, offset };
  }

  getPhoto(photoId) {
    return this.memoryStore.photos[photoId] || null;
  }

  deletePhoto(photoId) {
    const photo = this.memoryStore.photos[photoId];
    if (photo) {
      if (fs.existsSync(photo.filepath)) {
        try { fs.unlinkSync(photo.filepath); } catch (_) {}
      }
      if (photo.thumbnailPath && fs.existsSync(photo.thumbnailPath)) {
        try { fs.unlinkSync(photo.thumbnailPath); } catch (_) {}
      }
      delete this.memoryStore.photos[photoId];
      this.saveMetadata();
      return true;
    }
    return false;
  }

  saveLayout(layoutData) {
    this.memoryStore.layouts[layoutData.layoutId] = layoutData;
    this.saveMetadata();
    return layoutData;
  }

  getLayout(layoutId) {
    return this.memoryStore.layouts[layoutId] || null;
  }

  async createZipArchive(sessionId, outputZipPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputZipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(archive.pointer()));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      const sessionDir = path.join(__dirname, '../../photos', sessionId);
      if (fs.existsSync(sessionDir)) {
        archive.directory(sessionDir, false);
      }

      archive.finalize();
    });
  }
}

module.exports = new LocalStorageService();
