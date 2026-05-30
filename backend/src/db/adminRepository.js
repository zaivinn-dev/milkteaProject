const { query } = require('./pool');

const findAll = async () => {
  const { rows } = await query('SELECT username, password FROM admins ORDER BY username');
  return rows;
};

const findByUsername = async (username) => {
  const { rows } = await query(
    'SELECT username, password FROM admins WHERE username = $1',
    [username]
  );
  return rows[0] || null;
};

const count = async () => {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM admins');
  return rows[0].count;
};

const create = async (username, passwordHash) => {
  await query(
    'INSERT INTO admins (username, password) VALUES ($1, $2)',
    [username, passwordHash]
  );
};

const updatePassword = async (username, passwordHash) => {
  const result = await query(
    'UPDATE admins SET password = $2 WHERE username = $1',
    [username, passwordHash]
  );
  return result.rowCount > 0;
};

const remove = async (username) => {
  const result = await query('DELETE FROM admins WHERE username = $1', [username]);
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
