const { Pool } = require('pg');

const pool = new Pool({
  user: 'dj_admin',
  host: 'localhost',
  database: 'dj_booking',
  password: 'my_secure_password123',
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failure:', err.stack);
  } else {
    console.log('✅ PostgreSQL database connected successfully!');
  }
});

module.exports = pool;
