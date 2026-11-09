require('dotenv').config();

const required = ['DB_DATABASE', 'DB_USER', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable ${key} (see .env.example)`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, ''),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE,
  },
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  shippingFee: Number(process.env.SHIPPING_FEE ?? 8),
};
