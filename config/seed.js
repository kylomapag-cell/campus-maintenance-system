const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'campus_maintenance.db');

console.log('[Seed] Removing existing database if present...');
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('[Seed] Old database removed.');
  } catch (err) {
    console.error('[Seed] Could not remove old db file:', err.message);
  }
}

// Re-require db.js which will initialize schema and seed automatically
delete require.cache[require.resolve('./db')];
require('./db');

console.log('[Seed] Database freshly re-initialized and seeded with demo data.');
