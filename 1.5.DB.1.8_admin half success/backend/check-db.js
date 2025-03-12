const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'TAHTKART',
  password: 'sankeerth',
  port: 5432,
});

async function checkRegistrations() {
  try {
    console.log('Checking registrations table...\n');
    
    const result = await pool.query('SELECT * FROM registrations');
    console.log(`Total registrations found: ${result.rows.length}\n`);
    console.log('Registrations:\n');
    
    result.rows.forEach(user => {
      console.log('-------------------');
      console.log(`Hotel ID: ${user.hotel_id}`);
      console.log(`Shop Name: ${user.shop_name}`);
      console.log(`Owner Name: ${user.owner_name}`);
      console.log(`Phone: ${user.phone_number}`);
      console.log(`Email: ${user.email_address}`);
      console.log(`Status: ${user.status}`);
      console.log(`Created At: ${user.created_at}\n`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkRegistrations();