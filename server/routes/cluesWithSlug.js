// server/routes/cluesWithSlug.js
// This file exists purely for backward compatibility.
// Older versions of the code referenced `routes/cluesWithSlug` which was later
// renamed to `routes/clues`. Requiring this file simply exports the standard
// clues router so that existing deployments do not break.

module.exports = require('./clues');
