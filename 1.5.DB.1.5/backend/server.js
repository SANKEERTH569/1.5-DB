const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Registration } = require('./models'); // Assuming you have a Sequelize model

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
    await Registration.create({
      emailAddress,
      password: hashedPassword,
      ...otherFields
    });

    res.status(201).send('Registration successful');
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 