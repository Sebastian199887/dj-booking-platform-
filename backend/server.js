const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Setup tables and automatic column migrations
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`, () => {
    // Insert default admin/DJ account if it doesn't exist (Change 'Your Name' to your actual name!)
    const hashedPassword = bcrypt.hashSync('admin123', 8);
    db.run(`INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (1, 'Sebastian', 'admin@dj.com', ?, 'admin')`, [hashedPassword]);
  });

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dj_id INTEGER,
    event_date TEXT,
    notes TEXT,
    status TEXT DEFAULT 'PENDING',
    location TEXT,
    phone TEXT,
    organizer_name TEXT
  )`, () => {
    // Safety check: Add columns if they are missing from an older database version
    db.run(`ALTER TABLE bookings ADD COLUMN location TEXT`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN phone TEXT`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN organizer_name TEXT`, () => {});
  });
}

// Booking creation endpoint with location, phone, and organizer name
app.post('/api/bookings', (req, res) => {
  const { dj_id, event_date, notes, location, phone, organizer_name } = req.body;

  const query = `INSERT INTO bookings (dj_id, event_date, notes, location, phone, organizer_name, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`;

  db.run(query, [dj_id || 1, event_date, notes, location, phone, organizer_name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, bookingId: this.lastID });
  });
});

// Get all bookings (for Admin/DJ dashboard)
app.get('/api/bookings', (req, res) => {
  db.all(`SELECT * FROM bookings`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update booking status (Approve/Reject)
app.patch('/api/bookings/:id', (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, updated: this.changes });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server active on port ${PORT}`);
});
