const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp not yet loaded; using fallback image handlers');
}

class ImageProcessor {
  async generateThumbnail(inputPath, outputPath, width = 300) {
    if (sharp && fs.existsSync(inputPath)) {
      await sharp(inputPath)
        .resize({ width, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      return outputPath;
    }
    // Fallback copy
    if (fs.existsSync(inputPath)) {
      fs.copyFileSync(inputPath, outputPath);
    }
    return outputPath;
  }

  async crop(inputPath, outputPath, cropOptions) {
    const { x = 0, y = 0, width, height } = cropOptions;
    if (sharp && width && height) {
      await sharp(inputPath)
        .extract({
          left: Math.max(0, Math.round(x)),
          top: Math.max(0, Math.round(y)),
          width: Math.round(width),
          height: Math.round(height)
        })
        .toFile(outputPath);
      return outputPath;
    }
    fs.copyFileSync(inputPath, outputPath);
    return outputPath;
  }

  async rotate(inputPath, outputPath, angle = 90) {
    if (sharp) {
      await sharp(inputPath).rotate(angle).toFile(outputPath);
      return outputPath;
    }
    fs.copyFileSync(inputPath, outputPath);
    return outputPath;
  }

  async adjust(inputPath, outputPath, { brightness = 0, contrast = 0, saturation = 0 }) {
    if (sharp) {
      // Map brightness (-100 to 100) -> linear multiplier ~ 0.5 to 1.5
      const bMultiplier = 1 + (brightness / 100) * 0.5;
      const sMultiplier = 1 + (saturation / 100) * 0.5;

      let pipeline = sharp(inputPath).modulate({
        brightness: Math.max(0.1, bMultiplier),
        saturation: Math.max(0, sMultiplier)
      });

      if (contrast !== 0) {
        // Linear stretch/contrast adjustment
        pipeline = pipeline.linear(1 + contrast / 100, -(128 * (contrast / 100)));
      }

      await pipeline.toFile(outputPath);
      return outputPath;
    }
    fs.copyFileSync(inputPath, outputPath);
    return outputPath;
  }

  async applyFilter(inputPath, outputPath, filterName) {
    if (sharp) {
      let pipeline = sharp(inputPath);
      switch (filterName) {
        case 'grayscale':
          pipeline = pipeline.grayscale();
          break;
        case 'sepia':
          pipeline = pipeline.recomb([
            [0.393, 0.769, 0.189],
            [0.349, 0.686, 0.168],
            [0.272, 0.534, 0.131]
          ]);
          break;
        case 'warm':
          pipeline = pipeline.modulate({ brightness: 1.05 }).tint({ r: 255, g: 240, b: 220 });
          break;
        case 'cool':
          pipeline = pipeline.modulate({ brightness: 1.02 }).tint({ r: 220, g: 240, b: 255 });
          break;
        case 'vintage':
          pipeline = pipeline
            .modulate({ brightness: 0.95, saturation: 0.8 })
            .recomb([
              [0.393, 0.769, 0.189],
              [0.349, 0.686, 0.168],
              [0.272, 0.534, 0.131]
            ]);
          break;
        case 'pop':
          pipeline = pipeline.modulate({ saturation: 1.4, brightness: 1.1 });
          break;
        default:
          break;
      }
      await pipeline.toFile(outputPath);
      return outputPath;
    }
    fs.copyFileSync(inputPath, outputPath);
    return outputPath;
  }

  async generate3x1Layout(photoPaths, outputPath, options = {}) {
    const {
      padding = 16,
      backgroundColor = '#FFFFFF',
      targetWidth = 1800,
      targetHeight = 600,
      headerText = 'PHOTOBOOTH MEMORIES'
    } = options;

    if (!sharp) {
      throw new Error('Sharp required for compositing layout');
    }

    const cellWidth = Math.floor((targetWidth - padding * 4) / 3);
    const cellHeight = targetHeight - padding * 2;

    const composites = [];

    for (let i = 0; i < Math.min(3, photoPaths.length); i++) {
      const p = photoPaths[i];
      if (fs.existsSync(p)) {
        const resizedBuffer = await sharp(p)
          .resize(cellWidth, cellHeight, { fit: 'cover', position: 'center' })
          .toBuffer();

        const left = padding + i * (cellWidth + padding);
        const top = padding;

        composites.push({
          input: resizedBuffer,
          left,
          top
        });
      }
    }

    // Convert hex color to rgb
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2) || 'FF', 16);
    const g = parseInt(hex.substring(2, 4) || 'FF', 16);
    const b = parseInt(hex.substring(4, 6) || 'FF', 16);

    await sharp({
      create: {
        width: targetWidth,
        height: targetHeight,
        channels: 4,
        background: { r, g, b, alpha: 1 }
      }
    })
      .composite(composites)
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    return outputPath;
  }
}

module.exports = new ImageProcessor();
