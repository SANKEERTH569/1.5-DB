const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'TAHTKART',
  password: 'sankeerth',
  port: 5432,
});

async function addIsManualColumn() {
  try {
    console.log('Adding is_manual column to registration_items table...');
    
    const result = await pool.query(`
      ALTER TABLE registration_items 
      ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT FALSE;
    `);
    
    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error.message);
  } finally {
    pool.end();
  }
}

addIsManualColumn(); 