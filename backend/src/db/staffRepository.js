const { query } = require('./pool');

const findAll = async () => {
  const { rows } = await query(
    'SELECT username, display_name FROM staff ORDER BY username'
  );
  return rows;
};

const findByUsername = async (username) => {
  const { rows } = await query(
    'SELECT username, password, display_name FROM staff WHERE username = $1',
    [username]
  );
  return rows[0] || null;
};

const count = async () => {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM staff');
  return rows[0].count;
};

const create = async (username, passwordHash, displayName = null) => {
  await query(
    'INSERT INTO staff (username, password, display_name) VALUES ($1, $2, $3)',
    [username, passwordHash, displayName || username]
  );
};

const updatePassword = async (username, passwordHash) => {
  const result = await query(
    'UPDATE staff SET password = $2 WHERE username = $1',
    [username, passwordHash]
  );
  return result.rowCount > 0;
};

const remove = async (username) => {
  const result = await query('DELETE FROM staff WHERE username = $1', [username]);
  return result.rowCount > 0;
};

module.exports = {
  findAll,
  findByUsername,
  count,
  create,
  updatePassword,
  remove
};
