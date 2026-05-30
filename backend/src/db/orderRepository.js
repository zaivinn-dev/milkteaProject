const { query } = require('./pool');
const { mapOrderRow } = require('./mappers');

const findAll = async () => {
  const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
  return rows.map(mapOrderRow);
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [id]);
  return rows[0] ? mapOrderRow(rows[0]) : null;
};

const findByStatus = async (status) => {
  const { rows } = await query(
    'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
    [status]
  );
  return rows.map(mapOrderRow);
};

const create = async (order) => {
  const { rows } = await query(
    `INSERT INTO orders (
       id, order_number, items, total_amount, customer_name, customer_phone,
       notes, status, created_at, completed_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      order._id,
      order.orderNumber,
      JSON.stringify(order.items),
      order.totalAmount,
      order.customerName,
      order.customerPhone,
      order.notes,
      order.status,
      order.createdAt,
      order.completedAt
    ]
  );
  return mapOrderRow(rows[0]);
};

const updateStatus = async (id, status) => {
  const completedAt = status === 'completed' ? new Date() : null;
  const { rows } = await query(
    `UPDATE orders SET status = $2, completed_at = $3 WHERE id = $1 RETURNING *`,
    [id, status, completedAt]
  );
  return rows[0] ? mapOrderRow(rows[0]) : null;
};

const remove = async (id) => {
  const existing = await findById(id);
  if (!existing) return null;
  await query('DELETE FROM orders WHERE id = $1', [id]);
  return existing;
};

module.exports = {
  findAll,
  findById,
  findByStatus,
  create,
  updateStatus,
  remove
};
