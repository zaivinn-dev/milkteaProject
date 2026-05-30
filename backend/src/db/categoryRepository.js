const { query } = require('./pool');
const { mapCategoryRow } = require('./mappers');

const findAll = async () => {
  const { rows } = await query('SELECT * FROM categories ORDER BY name');
  return rows.map(mapCategoryRow);
};

const findByName = async (name) => {
  const { rows } = await query('SELECT * FROM categories WHERE name = $1', [name]);
  return rows[0] ? mapCategoryRow(rows[0]) : null;
};

const create = async (name, image = null) => {
  const { rows } = await query(
    `INSERT INTO categories (id, name, image) VALUES ($1, $2, $3)
     RETURNING *`,
    [name, name, image]
  );
  return mapCategoryRow(rows[0]);
};

const update = async (oldName, { newName, image }) => {
  const sets = [];
  const params = [oldName];
  let i = 2;

  if (newName && newName !== oldName) {
    sets.push(`name = $${i}`, `id = $${i}`);
    params.push(newName);
    i += 1;
  }
  if (image !== undefined) {
    sets.push(`image = $${i}`);
    params.push(image);
    i += 1;
  }

  if (sets.length === 0) {
    return findByName(oldName);
  }

  const { rows } = await query(
    `UPDATE categories SET ${sets.join(', ')} WHERE name = $1 RETURNING *`,
    params
  );
  return rows[0] ? mapCategoryRow(rows[0]) : null;
};

const remove = async (name) => {
  const existing = await findByName(name);
  if (!existing) return null;
  await query('DELETE FROM categories WHERE name = $1', [name]);
  return existing;
};

const rename = async (oldName, newName, image) => {
  const { pool } = require('./pool');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (newName !== oldName) {
      await client.query(
        'UPDATE categories SET name = $2, id = $2 WHERE name = $1',
        [oldName, newName]
      );
      await client.query(
        'UPDATE menu_items SET category = $2 WHERE category = $1',
        [oldName, newName]
      );
    }

    if (image !== undefined) {
      await client.query('UPDATE categories SET image = $2 WHERE name = $1', [
        newName,
        image
      ]);
    }

    await client.query('COMMIT');
    return findByName(newName);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const nameExists = async (name, excludeName = null) => {
  const { rows } = await query(
    excludeName
      ? 'SELECT 1 FROM categories WHERE name = $1 AND name <> $2 LIMIT 1'
      : 'SELECT 1 FROM categories WHERE name = $1 LIMIT 1',
    excludeName ? [name, excludeName] : [name]
  );
  return rows.length > 0;
};

module.exports = {
  findAll,
  findByName,
  create,
  update,
  remove,
  rename,
  nameExists
};
