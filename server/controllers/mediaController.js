// server/controllers/mediaController.js
// Controller handling media file operations for admins

// Attempt to load the archiver library used to create zip files. If it is
// missing we log a clear error and rethrow so the server startup fails with
// an informative message instead of a generic module not found error.
let archiver;
try {
  archiver = require('archiver');
} catch (err) {
  console.error(
    'Missing dependency "archiver". Run "npm install" in the server directory.'
  );
  throw err;
}
const fs = require('fs');
const path = require('path');

// Stream a zip containing all files in the uploads directory
exports.downloadAllMedia = (req, res) => {
  const uploadsDir = path.join(__dirname, '../uploads');

  // If the uploads directory doesn't exist, respond with 404
  if (!fs.existsSync(uploadsDir)) {
    return res.status(404).json({ message: 'No uploaded media found' });
  }

  // Set headers so the browser treats the response as a file download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="media.zip"');

  const archive = archiver('zip', { zlib: { level: 9 } });

  // Handle any errors while zipping
  archive.on('error', (err) => {
    console.error('Error creating media archive:', err);
    res.status(500).send({ message: 'Error creating archive' });
  });

  // Pipe the archive stream to the response
  archive.pipe(res);

  // Add the entire uploads directory contents at the root of the zip
  archive.directory(uploadsDir, false);
  archive.finalize();
};
