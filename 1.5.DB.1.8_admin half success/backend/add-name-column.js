const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'TAHTKART',
  password: 'sankeerth',
  port: 5432,
});

async function addNameColumn() {
  try {
    console.log('Adding name column to registration_items table...');
    
    const result = await pool.query(`
      ALTER TABLE registration_items 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    `);
    
    console.log('Name column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error.message);
  } finally {
    pool.end();
  }
}

addNameColumn(); 