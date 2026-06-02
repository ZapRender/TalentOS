const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.AUTH_DB_HOST     || 'auth-db',
  port:     parseInt(process.env.AUTH_DB_PORT) || 5432,
  database: process.env.AUTH_DB_NAME     || 'talentos_auth',
  user:     process.env.AUTH_DB_USER     || 'postgres',
  password: process.env.AUTH_DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('DB pool error:', err);
});

module.exports = pool;
