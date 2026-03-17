const dotenv = require('dotenv');

dotenv.config();

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  if (val == null || val === '') {
    throw new Error(`Missing env var: ${name}`);
  }
  return val;
}

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/blogapp'),
  jwtSecret: required('JWT_SECRET', 'change_me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin@123',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@blogapp.local'
};

module.exports = { env };
