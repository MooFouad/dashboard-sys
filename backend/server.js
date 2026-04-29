const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
require('dotenv').config();

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setDefaultResultOrder('ipv4first');

// Validate environment variables
const validateEnv = require('./config/validateEnv');
validateEnv();

// Error handlers
const { errorHandler, handleUnhandledRejection, handleUncaughtException } = require('./middleware/errorHandler');

// Authentication middleware
const { authenticate, authorize } = require('./middleware/auth');

// Notification scheduler
const notificationScheduler = require('./services/notificationScheduler');

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

const app = express();

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  family: 4, // Force IPv4
  directConnection: false, // Let MongoDB handle cluster discovery
  tls: true, // Explicitly enable TLS
  tlsAllowInvalidCertificates: false
};

// Load mock data and flip the USE_MOCK_DATA flag so all route handlers see it
const enableMockMode = async () => {
  process.env.USE_MOCK_DATA = 'true';
  console.log('📦 DEMO MODE: Using mock JSON data (no database connection)');
  console.log('   Data loaded from: backend/data/mock/*.json');
  console.log('   Push subscriptions stored in-memory (lost on server restart)');

  const mockDataService = require('./services/mockDataService');
  await mockDataService.loadData();

  const stats = await mockDataService.getStats();
  console.log('✅ Mock data loaded:');
  Object.entries(stats).forEach(([collection, count]) => {
    if (count > 0) console.log(`   - ${collection}: ${count} items`);
  });
};

// MongoDB connection with automatic fallback to mock data
const connectDB = async () => {
  // Already in mock/demo mode — skip DB entirely
  if (process.env.USE_MOCK_DATA === 'true' || process.env.DEMO_MODE === 'true') {
    return enableMockMode();
  }

  // No URI provided — auto-enable mock mode instead of crashing
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set — falling back to mock data mode.');
    return enableMockMode();
  }

  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`🔄 Attempting to connect to MongoDB (Attempt ${retries + 1}/${maxRetries})...`);
      await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
      console.log('✅ MongoDB Connected Successfully');
      return;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB Connection Error (Attempt ${retries}/${maxRetries}):`, err.message);

      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  // All retries exhausted — fall back to mock data instead of crashing
  console.warn('⚠️  Could not connect to MongoDB after all retries — falling back to mock data mode.');
  return enableMockMode();
};

connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Rate limiting for auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 in production, 50 in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.DISABLE_RATE_LIMIT === 'true' // Allow disabling for testing
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.DISABLE_RATE_LIMIT === 'true' // Allow disabling for testing
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// Public routes (no authentication required)
app.use('/api/auth', require('./routes/authRoutes'));

// Health Check (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
    routes: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      homeRents: '/api/home-rents',
      electricity: '/api/electricity',
      notifications: '/api/notifications',
      import: '/api/import',
      absher: '/api/absher',
      socialInsurance: '/api/social-insurance',
      insurance: '/api/insurance',
      mvpi: '/api/mvpi',
      gosi: '/api/gosi'
    }
  });
});

// Notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// GOSI API integration removed - using simple database system now

// Protected routes (authentication required)
app.use('/api/vehicles', authenticate, require('./routes/vehicleRoutes'));
app.use('/api/home-rents', authenticate, require('./routes/homeRentRoutes'));
app.use('/api/electricity', authenticate, require('./routes/electricityRoutes'));
// Note: Notification routes are defined individually above (public and cron routes)
app.use('/api/import', authenticate, authorize('admin', 'user'), require('./routes/importRoutes'));
app.use('/api/absher', authenticate, require('./routes/absherRoutes'));
app.use('/api/social-insurance', authenticate, require('./routes/socialInsuranceRoutes'));
app.use('/api/insurance', authenticate, require('./routes/insuranceRoutes'));
app.use('/api/mvpi', authenticate, require('./routes/mvpiRoutes'));
app.use('/api/gosi', authenticate, require('./routes/gosiRoutes'));

// Use centralized error handler
app.use(errorHandler);

// Handle 404s
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.path);
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/vehicles',
      '/api/home-rents',
      '/api/electricity',
      '/api/notifications',
      '/api/import',
      '/api/absher',
      '/api/social-insurance'
    ]
  });
});

// Start server (only in local development, not on Vercel)
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🚗 Vehicles: http://localhost:${PORT}/api/vehicles`);
      console.log(`🏠 Home Rents: http://localhost:${PORT}/api/home-rents`);
      console.log(`⚡ Electricity: http://localhost:${PORT}/api/electricity`);

      // Start notification scheduler
      notificationScheduler.start();
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start server only if not running on Vercel
if (process.env.VERCEL !== '1') {
  startServer();
} else {
  // On Vercel, start the notification scheduler immediately
  notificationScheduler.start();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);

// Export the Express app for Vercel serverless
module.exports = app;
