const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

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
  const {
    hotelId,
    shopName,
    ownerName,
    businessType,
    emailAddress,
    phoneNumber,
    alternatePhoneNumber,
    googleMapsLocation,
  } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO registrations (hotel_id, shop_name, owner_name, business_type, email_address, phone_number, alternate_phone_number, google_maps_location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        hotelId,
        shopName,
        ownerName,
        businessType,
        emailAddress,
        phoneNumber,
        alternatePhoneNumber,
        googleMapsLocation,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving registration data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});