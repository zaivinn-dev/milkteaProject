/**
 * One-time import: backend/data/*.json → Supabase PostgreSQL tables
 *
 * Prerequisites:
 * 1. Tables created in Supabase SQL Editor (see README or guide)
 * 2. DATABASE_URL in backend/.env
 *
 * Run: npm run db:import
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dataDir = path.join(__dirname, '../data');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false
});

function loadJson(filename) {
  const file = path.join(dataDir, filename);
  if (!fs.existsSync(file)) {
    console.warn(`Skip ${filename} (file not found)`);
    return [];
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function importCategories(client, categories) {
  for (const cat of categories) {
    const name = typeof cat === 'string' ? cat : cat.name;
    const image = typeof cat === 'object' ? cat.image || null : null;
    await client.query(
      `INSERT INTO categories (id, name, image)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET image = EXCLUDED.image`,
      [name, name, image]
    );
  }
  console.log(`  categories: ${categories.length}`);
}

async function importMenu(client, items) {
  for (const item of items) {
    await client.query(
      `INSERT INTO menu_items (id, name, description, category, base_price, image, sizes, available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         base_price = EXCLUDED.base_price,
         image = EXCLUDED.image,
         sizes = EXCLUDED.sizes,
         available = EXCLUDED.available`,
      [
        item._id,
        item.name,
        item.description || '',
        item.category,
        item.basePrice ?? 0,
        item.image || null,
        JSON.stringify(item.sizes || []),
        item.available !== false
      ]
    );
  }
  console.log(`  menu_items: ${items.length}`);
}

async function importAdmins(client, admins) {
  for (const admin of admins) {
    await client.query(
      `INSERT INTO admins (username, password)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password`,
      [admin.username, admin.password]
    );
  }
  console.log(`  admins: ${admins.length}`);
}

async function importOrders(client, orders) {
  for (const order of orders) {
    await client.query(
      `INSERT INTO orders (id, order_number, items, total_amount, customer_name, customer_phone, notes, status, created_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [
        order._id,
        order.orderNumber,
        JSON.stringify(order.items || []),
        order.totalAmount,
        order.customerName || null,
        order.customerPhone || null,
        order.notes || '',
        order.status || 'pending',
        order.createdAt || new Date().toISOString(),
        order.completedAt || null
      ]
    );
  }
  console.log(`  orders: ${orders.length}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in backend/.env');
    process.exit(1);
  }

  const categories = loadJson('categories.json');
  const menu = loadJson('menu.json');
  const admins = loadJson('admins.json');
  const orders = loadJson('orders.json');

  console.log('Connecting to Supabase...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('Importing (order matters: categories → menu → admins → orders)...');
    await importCategories(client, categories);
    await importMenu(client, menu);
    await importAdmins(client, admins);
    await importOrders(client, orders);
    await client.query('COMMIT');
    console.log('Done. Check Supabase Table Editor to verify.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
