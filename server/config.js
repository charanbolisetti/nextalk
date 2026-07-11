const dotenv = require('dotenv');

dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const clientUrls = process.env.CLIENT_URL
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URLS: clientUrls,
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  REDIS_URL: process.env.REDIS_URL || null,
  isProduction: process.env.NODE_ENV === 'production',
};
