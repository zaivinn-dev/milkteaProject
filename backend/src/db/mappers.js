const mapMenuRow = (row) => ({
  _id: row.id,
  name: row.name,
  description: row.description || '',
  category: row.category,
  basePrice: Number(row.base_price),
  image: row.image,
  sizes: Array.isArray(row.sizes) ? row.sizes : [],
  available: row.available !== false
});

const mapCategoryRow = (row) => ({
  name: row.name,
  image: row.image
});

const mapOrderRow = (row) => ({
  _id: row.id,
  orderNumber: row.order_number,
  items: row.items || [],
  totalAmount: Number(row.total_amount),
  customerName: row.customer_name,
  customerPhone: row.customer_phone || '',
  notes: row.notes || '',
  status: row.status,
  createdAt: row.created_at,
  completedAt: row.completed_at
});

module.exports = { mapMenuRow, mapCategoryRow, mapOrderRow };
