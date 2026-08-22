const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/dj_booking'
});

// Initialize Database Tables & Default DJ Account
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client'
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        client_email VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_date DATE NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create default DJ user automatically if it doesn't exist
    await pool.query(`
      INSERT INTO users (email, password, role)
      VALUES ('admin@dj.com', 'admin123', 'dj')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log("Database initialized and DJ account seeded.");
  } catch (err) {
    console.error("Database init error:", err);
  }
};
initDb();

// 1. Submit a new booking request
app.post('/api/bookings', async (req, res) => {
  const { client_email, client_name, event_type, event_date, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (client_email, client_name, event_type, event_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [client_email, client_name, event_type, event_date, notes]
    );
    res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Client tracks ONLY their own requests
app.get('/api/bookings/my-requests', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });
  
  try {
    const result = await pool.query(
      `SELECT * FROM bookings WHERE client_email = $1 ORDER BY created_at DESC`,
      [email]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DJ Login
app.post('/api/dj/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1 AND role = 'dj'`, [email]);
    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return res.status(401).json({ error: "Invalid DJ credentials" });
    }
    res.json({ success: true, message: "Logged in as DJ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DJ Dashboard: View ALL client requests
app.get('/api/dj/bookings', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM bookings ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DJ Actions: Accept/Decline bookings
app.patch('/api/dj/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
