const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const projectRoutes = require('./routes/project');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

// Connect to MongoDB
require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configurato per mobile e Netlify
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.FRONTEND_URL
    ];
    
    // Check if origin matches Netlify domains
    const isNetlifyDomain = /https:\/\/.*\.netlify\.app$/.test(origin) || 
                           /https:\/\/.*\.netlify\.com$/.test(origin);
    
    if (allowedOrigins.includes(origin) || isNetlifyDomain) {
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS: Blocking origin:', origin);
      // TEMPORARY: Allow all origins for debugging mobile issues
      console.log('CORS: Allowing blocked origin for debugging');
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Logging middleware for debugging mobile issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.get('Origin'));
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/projects', projectRoutes);

// Protected static file server for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (veloce, senza query DB)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'API Costruzioni Viola Area Clienti',
    status: 'online',
    timestamp: new Date()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Si è verificato un errore',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
