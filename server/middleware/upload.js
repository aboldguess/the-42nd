// server/middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Absolute path to the uploads directory within the server folder
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure that the uploads directory exists before any files are written.
// Without this check, multer would throw an ENOENT error the first time an
// admin tries to upload a logo or favicon because the directory hasn't been
// created yet on fresh installs.
// Create the directory recursively to avoid EEXIST errors in tests
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Store uploads in the “uploads/” folder with a random UUID filename
const storage = multer.diskStorage({
  // Use the uploads directory defined above
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;
