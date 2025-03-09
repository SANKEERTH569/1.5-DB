const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'TAHTKART',
  password: 'prathap',
  port: 5432,
});

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.status(200).json({ status: 'Backend is running', db: 'Database connected successfully' });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(500).json({ status: 'Backend is running', db: 'Database connection failed', error: err.message });
  }
});

// LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
  const { phone, email, password } = req.body;
  
  try {
    // Check if this is an admin login attempt
    if (email) {
      // Try admin login first
      const adminResult = await pool.query(
        'SELECT * FROM admin_users WHERE email = $1',
        [email]
      );
      
      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        
        if (isPasswordValid) {
          return res.status(200).json({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: 'admin'
          });
        }
      }
    }
    
    // If not admin or admin login failed, try regular user login
    let result;
    if (email) {
      result = await pool.query(
        'SELECT * FROM registrations WHERE email_address = $1',
        [email]
      );
    } else if (phone) {
      result = await pool.query(
        'SELECT * FROM registrations WHERE phone_number = $1',
        [phone]
      );
    } else {
      return res.status(400).json({ message: 'Phone or email is required' });
    }
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Return user data
    res.status(200).json({
      id: user.hotel_id,
      name: user.shop_name || user.owner_name,
      phone: user.phone_number,
      email: user.email_address,
      role: 'user'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// REGISTER ENDPOINT
app.post('/api/register', async (req, res) => {
  const { name, phone, password, role } = req.body;
  
  try {
    // Validate input
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }
    
    // Check if phone number already exists
    const checkResult = await pool.query(
      'SELECT * FROM registrations WHERE phone_number = $1',
      [phone]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }
    
    // Generate a hotel ID
    const hotelId = 'THK' + Math.floor(100000 + Math.random() * 900000);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the new user
    const result = await pool.query(
      'INSERT INTO registrations(hotel_id, shop_name, owner_name, phone_number, password) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [hotelId, name, name, phone, hashedPassword]
    );
    
    // Return the new user data
    res.status(201).json({
      id: result.rows[0].hotel_id,
      name: result.rows[0].shop_name || result.rows[0].owner_name,
      phone: result.rows[0].phone_number,
      role: role || 'user'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET USER DATA ENDPOINT
app.get('/api/users/:phone', async (req, res) => {
  const { phone } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE phone_number = $1',
      [phone]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Determine role (you might have a different role logic)
    let role = 'user';
    if (user.phone_number === '9898989898') { // Example admin phone
      role = 'admin';
    } else if (user.phone_number === '9797979797') { // Example delivery phone
      role = 'delivery';
    }
    
    res.status(200).json({
      id: user.hotel_id,
      name: user.shop_name || user.owner_name,
      phone: user.phone_number,
      role: role
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all registrations
app.get('/registrations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching registrations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { emailAddress, password, ...otherFields } = req.body;

    // Check if password is received
    if (!password) {
      return res.status(400).send('Password is required');
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Received password:', password);
    console.log('Hashed password:', hashedPassword);

    // Create a new registration entry
    const result = await pool.query(
      'INSERT INTO registrations(hotel_id, shop_name, owner_name, business_type, email_address, phone_number, alternate_phone_number, google_maps_location, password) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [otherFields.hotelId, otherFields.shopName, otherFields.ownerName, otherFields.businessType, emailAddress, otherFields.phoneNumber, otherFields.alternatePhoneNumber, otherFields.googleMapsLocation, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('An error occurred');
  }
});

// Get items for a registration
app.get('/registrations/:hotelId/items', async (req, res) => {
  const { hotelId } = req.params;

  try {
    console.log('Fetching items for registration:', hotelId);
    
    const result = await pool.query(
      'SELECT * FROM registration_items WHERE registration_id = $1',
      [hotelId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add item to registration
app.post('/registrations/:hotelId/items', async (req, res) => {
  const { hotelId } = req.params;
  const { item_id, name, price, unit, quantity, is_manual } = req.body;

  try {
    console.log('Adding item to registration:', req.body);
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'Item price is required' });
    }
    
    if (!unit) {
      return res.status(400).json({ error: 'Item unit is required' });
    }
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'Item quantity is required' });
    }
    
    // Check if the registration exists
    const registrationCheck = await pool.query(
      'SELECT * FROM registrations WHERE hotel_id = $1',
      [hotelId]
    );

    if (registrationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // For manual items, we set item_id to null
    const finalItemId = is_manual ? null : item_id;
    
    // Insert the item
    const result = await pool.query(
      'INSERT INTO registration_items (registration_id, item_id, name, price, unit, quantity, is_manual) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [hotelId, finalItemId, name, price, unit, quantity, is_manual || false]
    );

    console.log('Item added successfully:', result.rows[0]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error adding item to registration:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update an item
app.put('/registrations/items/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const { quantity, price, unit } = req.body;

  try {
    console.log('Updating item:', itemId, req.body);
    
    // Validate required fields
    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'Item price is required' });
    }
    
    if (!unit) {
      return res.status(400).json({ error: 'Item unit is required' });
    }
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'Item quantity is required' });
    }
    
    // Check if the item exists
    const itemCheck = await pool.query(
      'SELECT * FROM registration_items WHERE id = $1',
      [itemId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const result = await pool.query(
      'UPDATE registration_items SET quantity = $1, price = $2, unit = $3 WHERE id = $4 RETURNING *',
      [quantity, price, unit, itemId]
    );

    console.log('Item updated successfully:', result.rows[0]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating item:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete an item
app.delete('/registrations/items/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    console.log('Deleting item:', itemId);
    
    // Check if the item exists
    const itemCheck = await pool.query(
      'SELECT * FROM registration_items WHERE id = $1',
      [itemId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const result = await pool.query(
      'DELETE FROM registration_items WHERE id = $1 RETURNING *',
      [itemId]
    );

    console.log('Item deleted successfully:', result.rows[0]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error deleting item:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create admin user endpoint
app.post('/api/create-admin', async (req, res) => {
  const { email, password, name } = req.body;
  
  try {
    // Check if admin already exists
    const checkResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert admin user
    const result = await pool.query(
      'INSERT INTO admin_users(email, name, password) VALUES($1, $2, $3) RETURNING *',
      [email, name, hashedPassword]
    );
    
    res.status(201).json({
      message: 'Admin user created successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all admin users
app.get('/api/admins', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM admin_users'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 