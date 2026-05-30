/**
 * Reset an admin or kitchen staff password in Supabase.
 *
 * Usage:
 *   node scripts/reset-admin-password.js <username> <new-password> [admin|staff]
 *
 * Examples:
 *   node scripts/reset-admin-password.js BigbrewAdmin MyNewPassword123 admin
 *   node scripts/reset-admin-password.js kitchen kitchen123 staff
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { query, pool } = require('../src/db/pool');

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const accountType = (process.argv[4] || 'admin').toLowerCase();
  const table = accountType === 'staff' ? 'staff' : 'admins';

  if (!username || !password) {
    console.error('Usage: node scripts/reset-admin-password.js <username> <new-password> [admin|staff]');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in backend/.env');
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = await query(
    `UPDATE ${table} SET password = $2 WHERE username = $1`,
    [username, hash]
  );

  if (result.rowCount === 0) {
    console.error(`No ${accountType} found with username: ${username}`);
    const { rows } = await query(`SELECT username FROM ${table} ORDER BY username`);
    rows.forEach((r) => console.error(`  - ${r.username}`));
    process.exit(1);
  }

  const loginUrl = accountType === 'staff' ? '/kitchen' : '/admin';
  console.log(`Password updated for ${accountType} "${username}".`);
  console.log(`Log in at http://localhost:3000${loginUrl}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
