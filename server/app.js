/**
 * Express Server Main Application File
 * Configured for Single-Repo Deployment (e.g., Render, Heroku)
 * Production-Ready Settings Included
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { authenticate, authorize } = require('./middleware/auth');

// --- Configuration Constants ---
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_BUILD_PATH = path.join(__dirname, '../build'); // Frontend build at repo root

// Import database connection and models
const connectDB = require('./db');
// Import models to register them with Mongoose (used by route handlers)
require('./models');

// Import admin security middleware
const { 
  adminLoginLimiter, 
  adminApiLimiter, 
  checkAdminOrigin, 
  logAdminAction 
} = require('./middleware/adminSecurity');

// Initialize Express app
const app = express();


// --- Core Server Configuration & Middleware ---


// Serve only robots.txt and sitemap.xml from public directory
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/robots.txt'));
});
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/sitemap.xml'));
});

// Configure trust proxy (crucial for reverse proxies like Render/Heroku for rate-limiting)
// Render uses 1 proxy layer, so we trust only the first proxy for security
// NEVER use `true` as it allows IP spoofing attacks
app.set('trust proxy', NODE_ENV === 'production' ? 1 : false);

// Connect to MongoDB (non-blocking)
connectDB().then((connected) => {
  if (connected) {
    console.log('✅ Database ready for operations');
  } else {
    console.log('⚠️  Running in database-free mode - some endpoints will return mock data');
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://checkout.stripe.com", "https://m.stripe.network"], 
      connectSrc: ["'self'", "https://api.stripe.com", "https://checkout.stripe.com", "https://m.stripe.network"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com", "https://m.stripe.network"]
    }
  },
  // HSTS recommended for production
  hsts: NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false
}));

// CORS configuration - Simplified for single-repo same-origin deployment
if (NODE_ENV === 'production' && fs.existsSync(FRONTEND_BUILD_PATH)) {
  // In production, restrict CORS to known origins only
  const productionWhitelist = [
    'https://haltshelter.onrender.com',
    'https://haltshelter.org',
    'https://www.haltshelter.org',
    'https://admin.haltshelter.org',    // Custom admin domain if set up
    process.env.FRONTEND_URL,
    process.env.ADMIN_PANEL_URL         // Admin panel URL from environment variable
  ].filter(Boolean);
  
  // Paths that are allowed without origin header (health checks, webhooks)
  const allowedPathsWithoutOrigin = [
    '/',                        // Root path (Render health checks)
    '/favicon.ico',             // Browser favicon requests
    '/api/health',              // Health check endpoint
    '/api/donations/webhook',   // Stripe webhook
    '/api/placeholder/'         // Placeholder images
  ];
  
  console.log('🌐 CORS set to production whitelist:', productionWhitelist);
  
  // Custom CORS middleware with path-based exceptions
  app.use((req, res, next) => {
    const origin = req.get('origin');
    const path = req.path;
    
    // Allow specific paths without origin (health checks, webhooks)
    if (!origin && allowedPathsWithoutOrigin.some(p => path.startsWith(p))) {
      console.log(`[CORS] Allowed no-origin request to: ${path}`);
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      return next();
    }
    
    // Require origin for all other paths
    if (!origin) {
      console.warn(`[CORS] BLOCKED no-origin request to: ${path}`);
      return res.status(403).json({ error: 'Origin header required' });
    }
    
    // Check if origin is whitelisted
    if (productionWhitelist.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      return next();
    }
    
    // Origin not whitelisted
    console.error(`[CORS] BLOCKED origin: ${origin} for path: ${path}`);
    return res.status(403).json({ error: 'Not allowed by CORS' });
  });
} else {
  // Development CORS: Allows a specific whitelist. The whitelist can be simplified 
  // or completely opened for development/testing if needed.
  const whitelist = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000', 
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5000',
  'http://192.168.56.1:3001',
  'https://haltshelter.onrender.com',
  'http://localhost:5000'

];
  
  if (process.env.FRONTEND_URL) {
    whitelist.push(process.env.FRONTEND_URL);
  }

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error(`CORS: Blocked access from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true
  }));
}


// Logging middleware
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Stripe webhook endpoint - MUST be before express.json() to preserve raw body
const donationsWebhookHandler = require('./routes/donations-webhook');
app.post('/api/donations/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  try {
    console.log('[WEBHOOK] Incoming request to /api/donations/webhook');
    console.log('[WEBHOOK] Headers:', JSON.stringify(req.headers));
  } catch (e) {}
  next();
}, donationsWebhookHandler);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads - ensures cross-origin policy for images
app.use('/uploads', (req, res, next) => {
  // Use a more specific origin if possible, but '*' is common for CDNs/uploads
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// System status endpoints for admin dashboard - Protected
app.get('/api/system/status', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const status = {
      server: {
        status: 'online',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        lastCheck: new Date().toISOString()
      },
      database: {
        status: 'unknown',
        connected: false,
        lastCheck: new Date().toISOString()
      },
      // Since it's a single repo, main website status check is redundant/circular
      // Removing the redundant self-check is safer and simpler.
    };

    // Check database connection
    try {
      const dbState = mongoose.connection.readyState;
      if (dbState === 1) {
        status.database.status = 'connected';
        status.database.connected = true;
      } else if (dbState === 2) {
        status.database.status = 'connecting';
      } else {
        status.database.status = 'disconnected';
      }
    } catch (error) {
      status.database.status = 'error';
      status.database.error = error.message;
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get system status',
      details: error.message 
    });
  }
});

// Quick health checks for individual services (Simplified using Mongoose directly)
app.get('/api/system/database', authenticate, authorize('admin', 'staff'), (req, res) => {
  try {
    const status = {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      timestamp: new Date().toISOString()
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/system/server', authenticate, authorize('admin', 'staff'), (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    version: process.version,
    platform: process.platform,
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Placeholder image endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#6b7280" text-anchor="middle" dy=".3em">Rescue Story</text>
  </svg>`;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});


// DIRECT admin auth routes (kept for simplicity, but consider moving to './routes/auth' with proper middleware)
console.log('📦 Adding direct admin auth routes...');

// Apply rate limiting and origin check to admin login
app.post('/api/admin-auth/admin-login', adminLoginLimiter, checkAdminOrigin, (req, res) => {
  console.log('🔑 DIRECT Admin login hit!', { ip: req.ip, origin: req.get('origin') });
  const { adminKey } = req.body;
  
  try {
    // Use environment variable for admin key (secure for production)
    let storedAdminKey = process.env.ADMIN_KEY;
    let backupAdminKey = process.env.BACKUP_ADMIN_KEY;
    
    // Fallback to file-based key only in development (for backwards compatibility)
    if (!storedAdminKey && NODE_ENV !== 'production') {
      const adminKeyPath = path.join(__dirname, 'admin-key.json');
      if (fs.existsSync(adminKeyPath)) {
        const adminKeyData = JSON.parse(fs.readFileSync(adminKeyPath, 'utf8'));
        storedAdminKey = adminKeyData.adminKey;
      }
    }
    
    // ADMIN_KEY environment variable is required
    if (!storedAdminKey) {
      console.error('❌ ADMIN_KEY environment variable not set');
      return res.status(500).json({ error: 'Server configuration error: ADMIN_KEY required' });
    }
    
    // Check against primary key OR backup key
    const isValidKey = (adminKey === storedAdminKey) || (backupAdminKey && adminKey === backupAdminKey);
    
    if (isValidKey) {
      // Generate real JWT token
      const token = jwt.sign(
        { 
          id: 'admin', 
          role: 'admin', 
          name: 'Admin User',
          type: 'admin-key-auth'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('✅ Admin login successful, JWT token generated');
      res.json({ 
        success: true, 
        token: token,
        user: { id: 'admin', name: 'Admin User', role: 'admin' }
      });
    } else {
      console.log('❌ Invalid admin key provided');
      res.status(401).json({ error: 'Invalid admin key' });
    }
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
});

// Import and use route modules
console.log('📦 Loading all main routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/adoption-inquiries', require('./routes/adoption-inquiries'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/org-settings', require('./routes/org-settings'));
app.use('/api/notification-settings', require('./routes/notification-settings'));
app.use('/api/admin-key', checkAdminOrigin, adminLoginLimiter, require('./routes/admin-key'));
app.use('/api/users', checkAdminOrigin, adminApiLimiter, require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/funding-needs', require('./routes/funding-needs'));

// Test email endpoint (for diagnosing SMTP issues in production)
// app.use('/api/test', require('./routes/test-email')); // Disabled for security

// Admin routes - Protected with additional security
app.use('/api/admin/animals', checkAdminOrigin, adminApiLimiter, logAdminAction('admin-animals'), require('./routes/admin-animals'));
app.use('/api/admin/adoption-inquiries', checkAdminOrigin, adminApiLimiter, logAdminAction('admin-adoption'), require('./routes/admin-adoption-inquiries'));
app.use('/api/admin/stats', checkAdminOrigin, adminApiLimiter, logAdminAction('admin-stats'), require('./routes/admin-stats'));
app.use('/api/admin', checkAdminOrigin, adminApiLimiter, logAdminAction('admin-funding'), require('./routes/admin-funding'));


// --- Single-Repo Frontend Serving Logic ---

// Serve static files in production from the frontend build directory
if (NODE_ENV === 'production' && fs.existsSync(FRONTEND_BUILD_PATH)) {
  console.log(`🌍 Serving static files from: ${FRONTEND_BUILD_PATH}`);
  
  // Middleware to serve static assets (JS, CSS, images)
  app.use(express.static(FRONTEND_BUILD_PATH));
  
  // Catch-all handler for any request that doesn't match an API route or static file
  // This is crucial for single-page applications (SPAs) like React/Vue/Angular
  // Express 5: use middleware approach instead of route pattern
  app.use((req, res, next) => {
    // Only serve index.html for GET requests that haven't been handled
    if (req.method === 'GET') {
      console.log(`SPA fallback: ${req.path}`);
      res.sendFile(path.join(FRONTEND_BUILD_PATH, 'index.html'));
    } else {
      next();
    }
  });
} else if (NODE_ENV === 'production') {
  console.warn(`⚠️ PRODUCTION WARNING: Frontend build path not found at ${FRONTEND_BUILD_PATH}. Only API routes will be available.`);
}


// --- Global Error Handler ---

app.use((err, req, res, next) => {
  console.error('--- Global Error Handler ---');
  console.error('Error Details:', err);
  
  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: errors 
    });
  }
  
  // Mongoose Cast Error (e.g., bad ID format)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: `Invalid format for field: ${err.path}`
    });
  }
  
  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ 
      error: `${field} already exists` 
    });
  }
  
  // Generic Error Response
  res.status(err.status || 500).json({ 
    error: NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    status: err.status || 500,
  });
});

// --- Server Startup ---

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 HALT Shelter API server running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    if (NODE_ENV === 'production' && fs.existsSync(FRONTEND_BUILD_PATH)) {
      console.log(`🌐 Frontend available at: http://localhost:${PORT}`);
    }
  });
}

module.exports = app;
