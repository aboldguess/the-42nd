// server/utils/qr.js
// Shared utilities related to QR code generation
const Settings = require('../models/Settings');

/**
 * Retrieve the current base URL for QR code links.
 * Falls back to the environment variable QR_BASE_URL or localhost.
 */
async function getQrBase() {
  const settings = await Settings.findOne();
  return settings?.qrBaseUrl || process.env.QR_BASE_URL || 'http://localhost:3000';
}

module.exports = { getQrBase };
