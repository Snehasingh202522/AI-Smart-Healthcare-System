require('dotenv').config();

const requiredEnv = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY'
];

// Security: Validate required environment variables
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Critical env var missing: ${key}`);
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
});

// Security: Warn about weak JWT secret in development
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET should be at least 32 characters for better security');
}

// Security: Ensure NODE_ENV is set
if (!process.env.NODE_ENV) {
  console.warn('⚠️  NODE_ENV not set, defaulting to development');
  process.env.NODE_ENV = 'development';
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/healthcare_db',

  jwtSecret:
    process.env.JWT_SECRET ||
    'dev_secret_change_me',

  jwtExpire:
    process.env.JWT_EXPIRE || '7d',

  jwtResetExpire:
    process.env.JWT_RESET_EXPIRE || '15m',

  clientUrl:
    process.env.CLIENT_URL ||
    'http://localhost:5173',

  // Gemini AI
  geminiApiKey:
    process.env.GEMINI_API_KEY,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};
