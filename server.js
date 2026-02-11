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

// create equipment
app.post('/equipments', async (req, res) => {
  try {
    const { asset_code, name, category_id, status_id, location_id } = req.body;

    const result = await pool.query(
      `INSERT INTO equipments 
       (asset_code, name, category_id, status_id, location_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [asset_code, name, category_id, status_id, location_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// get equipment by id
app.get('/equipments/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
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
      WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/equipments/:id', async (req, res) => {
  try {
    const { asset_code, name, category_id, status_id, location_id } = req.body;

    const result = await pool.query(
      `UPDATE equipments 
       SET asset_code=$1, 
           name=$2, 
           category_id=$3, 
           status_id=$4, 
           location_id=$5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id=$6
       RETURNING *`,
      [asset_code, name, category_id, status_id, location_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.get('/equipments', async (req, res) => {
  try {
    const { asset_code, status_id } = req.query;

    let query = `
      SELECT e.*, c.name AS category, s.name AS status
      FROM equipments e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN equipment_status s ON e.status_id = s.id
      WHERE 1=1
    `;

    const values = [];
    let count = 1;

    if (asset_code) {
      query += ` AND e.asset_code ILIKE $${count}`;
      values.push(`%${asset_code}%`);
      count++;
    }

    if (status_id) {
      query += ` AND e.status_id = $${count}`;
      values.push(status_id);
      count++;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});


app.listen(5000, () => {
  console.log('Server running on port 5000 🚀');
});
