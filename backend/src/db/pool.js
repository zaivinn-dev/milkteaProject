const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Add it to backend/.env (Supabase → Settings → Database).');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false
});

const query = (text, params) => pool.query(text, params);

async function testConnection() {
  const result = await query('SELECT NOW() AS now');
  console.log('Connected to PostgreSQL (Supabase) at', result.rows[0].now);
}

module.exports = { pool, query, testConnection };
