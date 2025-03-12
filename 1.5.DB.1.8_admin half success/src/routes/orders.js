const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateToken = require('../middleware/auth');

router.post('/api/orders', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      hotel_id,
      owner_name,
      phone_number,
      location,
      items,
      note,
      total,
      date,
      status
    } = req.body;

    // Insert the main order
    const orderQuery = `
      INSERT INTO orders (
        hotel_id, 
        owner_name, 
        phone_number, 
        location, 
        note, 
        total, 
        date, 
        status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id`;

    const orderResult = await client.query(orderQuery, [
      hotel_id,
      owner_name,
      phone_number,
      location,
      note,
      total,
      date,
      status || 'pending'
    ]);

    const orderId = orderResult.rows[0].id;

    // Insert order items
    const itemValues = items.map(item => ({
      order_id: orderId,
      item_id: item.item_id,
      name: item.name,
      quantity: item.quantity || 0,
      grams: item.grams || null,
      price: item.price,
      unit: item.unit
    }));

    for (const item of itemValues) {
      await client.query(`
        INSERT INTO order_items (
          order_id, 
          item_id, 
          name, 
          quantity, 
          grams, 
          price, 
          unit
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        item.order_id,
        item.item_id,
        item.name,
        item.quantity,
        item.grams,
        item.price,
        item.unit
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: orderId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  } finally {
    client.release();
  }
}); 