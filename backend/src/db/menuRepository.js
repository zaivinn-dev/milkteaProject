const { query } = require('./pool');
const { mapMenuRow } = require('./mappers');

const findAll = async (includeUnavailable = false) => {
  const sql = includeUnavailable
    ? 'SELECT * FROM menu_items ORDER BY name'
    : 'SELECT * FROM menu_items WHERE available = TRUE ORDER BY name';
  const { rows } = await query(sql);
  return rows.map(mapMenuRow);
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
  return rows[0] ? mapMenuRow(rows[0]) : null;
};

const findByCategory = async (category, availableOnly = true) => {
  const sql = availableOnly
    ? 'SELECT * FROM menu_items WHERE category = $1 AND available = TRUE ORDER BY name'
    : 'SELECT * FROM menu_items WHERE category = $1 ORDER BY name';
  const { rows } = await query(sql, [category]);
  return rows.map(mapMenuRow);
};

const create = async (item) => {
  const { rows } = await query(
    `INSERT INTO menu_items (id, name, description, category, base_price, image, sizes, available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      item._id,
      item.name,
      item.description,
      item.category,
      item.basePrice,
      item.image,
      JSON.stringify(item.sizes || []),
      item.available
    ]
  );
  return mapMenuRow(rows[0]);
};

const update = async (id, fields) => {
  const existing = await findById(id);
  if (!existing) return null;

  const merged = { ...existing, ...fields };
  const { rows } = await query(
    `UPDATE menu_items SET
       name = $2, description = $3, category = $4, base_price = $5,
       image = $6, sizes = $7, available = $8
     WHERE id = $1
     RETURNING *`,
    [
      id,
      merged.name,
      merged.description,
      merged.category,
      merged.basePrice,
      merged.image,
      JSON.stringify(merged.sizes || []),
      merged.available
    ]
  );
  return mapMenuRow(rows[0]);
};

const remove = async (id) => {
  const existing = await findById(id);
  if (!existing) return null;
  await query('DELETE FROM menu_items WHERE id = $1', [id]);
  return existing;
};

const updateCategoryName = async (oldName, newName) => {
  const result = await query(
    'UPDATE menu_items SET category = $2 WHERE category = $1',
    [oldName, newName]
  );
  return result.rowCount;
};

module.exports = {
  findAll,
  findById,
  findByCategory,
  create,
  update,
  remove,
  updateCategoryName
};
