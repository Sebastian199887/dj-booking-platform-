const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'client'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_email TEXT NOT NULL,
      client_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    INSERT INTO users (id, email, password, role)
    VALUES (1, 'admin@dj.com', 'admin123', 'dj')
    ON CONFLICT(id) DO UPDATE SET email='admin@dj.com', password='admin123'
  `);
});

// API Endpoints
app.post('/api/bookings/register-and-book', (req, res) => {
  const email = (req.body.client_email || '').toLowerCase().trim();
  const password = (req.body.password || '').trim();
  const client_name = (req.body.client_name || '').trim();
  const event_type = (req.body.event_type || 'General').trim();
  const event_date = (req.body.event_date || '').trim();
  const notes = (req.body.notes || '').trim();

  if (!email || !password || !client_name || !event_date) {
    return res.status(400).json({ error: 'Missing required details (Name, Email, Password, Date).' });
  }

  db.get('SELECT * FROM users WHERE LOWER(email) = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    const createBooking = () => {
      db.run(
        `INSERT INTO bookings (client_email, client_name, event_type, event_date, notes, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [email, client_name, event_type, event_date, notes],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          db.get('SELECT * FROM bookings WHERE id = ?', [this.lastID], (err3, savedBooking) => {
            if (err3) return res.status(500).json({ error: err3.message });
            res.status(201).json({ success: true, email, booking: savedBooking });
          });
        }
      );
    };

    if (!user) {
      db.run('INSERT INTO users (email, password, role) VALUES (?, ?, "client")', [email, password], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        createBooking();
      });
    } else {
      createBooking();
    }
  });
});

app.post('/api/client/login', (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const password = (req.body.password || '').trim();

  db.get('SELECT * FROM users WHERE LOWER(email) = ? AND role = "client"', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json({ success: true, email: user.email });
  });
});

app.get('/api/bookings/my-requests', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email parameter required' });

  db.all('SELECT * FROM bookings WHERE LOWER(client_email) = LOWER(?) ORDER BY id DESC', [email.trim()], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/dj/login', (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const password = (req.body.password || '').trim();

  db.get('SELECT * FROM users WHERE LOWER(email) = ? AND role = "dj"', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    res.json({ success: true, message: 'Logged in as DJ' });
  });
});

app.get('/api/dj/bookings', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.patch('/api/dj/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err2, updated) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(updated);
    });
  });
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM bookings WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Force event loop active so Node v22 never exits
setInterval(() => {}, 1000 << 30);

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server active on http://0.0.0.0:${PORT}`);
});
