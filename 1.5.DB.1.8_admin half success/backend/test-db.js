const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'TAHTKART',
  password: 'sankeerth',
  port: 5432,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const client = await pool.connect();
    console.log('Connected to database successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Query result:', result.rows[0]);
    
    // Test registration_items table
    console.log('Testing registration_items table...');
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registration_items'
      )
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('registration_items table exists');
      
      // Check columns directly from the table
      const directColumnResult = await client.query(`
        SELECT * FROM registration_items LIMIT 0
      `);
      
      console.log('Table columns (direct):', directColumnResult.fields.map(f => f.name));
      
      // Check columns from information_schema
      const columnResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'registration_items'
        ORDER BY ordinal_position
      `);
      
      console.log('Table columns (schema):');
      columnResult.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('registration_items table does not exist!');
    }
    
    client.release();
  } catch (error) {
    console.error('Error testing connection:', error.message);
  } finally {
    pool.end();
  }
}

testConnection(); 