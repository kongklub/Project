const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'product_center',
  password: '123456',
  port: 5432,
});

// test route
app.get('/', (req, res) => {
  res.send('NT Equipment API Running 🚀');
});

// get all equipments
app.get('/equipments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.asset_code,
        e.name,
        c.name AS category,
        s.name AS status,
        l.province,
        l.building,
        l.floor
      FROM equipments e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN equipment_status s ON e.status_id = s.id
      LEFT JOIN locations l ON e.location_id = l.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000 🚀');
});
