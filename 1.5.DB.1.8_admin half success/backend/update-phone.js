const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'TAHTKART',
  password: 'sankeerth',
  port: 5432,
});

async function updatePhoneNumber() {
  try {
    console.log('Updating phone number...\n');
    
    const result = await pool.query(
      'UPDATE registrations SET phone_number = $1 WHERE hotel_id = $2 RETURNING *',
      ['9347250895', 'THK646932']
    );
    
    if (result.rows.length > 0) {
      console.log('Phone number updated successfully:');
      console.log('-------------------');
      console.log(`Hotel ID: ${result.rows[0].hotel_id}`);
      console.log(`Shop Name: ${result.rows[0].shop_name}`);
      console.log(`Owner Name: ${result.rows[0].owner_name}`);
      console.log(`New Phone: ${result.rows[0].phone_number}`);
      console.log(`Email: ${result.rows[0].email_address}\n`);
    } else {
      console.log('No user found with hotel_id THK646932');
    }
    
  } catch (error) {
    console.error('Error updating phone number:', error);
  } finally {
    await pool.end();
  }
}

updatePhoneNumber();