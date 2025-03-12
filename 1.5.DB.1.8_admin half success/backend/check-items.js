const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'TAHTKART',
  password: 'sankeerth',
  port: 5432,
});

async function checkItems() {
  try {
    const result = await pool.query('SELECT * FROM registration_items');
    console.log('All registration items:', result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

checkItems(); 