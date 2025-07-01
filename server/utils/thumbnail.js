const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Generate a resized thumbnail for an uploaded image file.
 * Video files are ignored and returned unchanged.
 *
 * @param {string} url - Public URL of the uploaded file (e.g. "/uploads/foo.jpg").
 * @returns {Promise<string>} Resolves to the thumbnail URL or the original URL on failure.
 */
async function createThumbnail(url) {
  try {
    // Only attempt to thumbnail common image formats
    const ext = path.extname(url).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      return url; // Skip non-images like videos
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const thumbsDir = path.join(uploadsDir, 'thumbs');
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true });
    }

    const filename = path.basename(url);
    const srcPath = path.join(uploadsDir, filename);
    const destPath = path.join(thumbsDir, filename);

    await sharp(srcPath)
      .resize(300) // Limit width to around 300px keeping aspect ratio
      .toFile(destPath);

    return '/uploads/thumbs/' + filename;
  } catch (err) {
    console.error('Error generating thumbnail:', err);
    return url; // Fall back to full image if processing fails
  }
}

module.exports = { createThumbnail };
