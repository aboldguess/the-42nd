// server/middleware/upload.js

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Store uploads in the “uploads/” folder with a random UUID filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;
