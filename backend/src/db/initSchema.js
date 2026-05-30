const { query } = require('./pool');

async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS staff (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      display_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

module.exports = { initSchema };
