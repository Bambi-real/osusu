const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const authRoutes         = require('./routes/auth.routes');
const groupRoutes        = require('./routes/groups.routes');
const contributionRoutes = require('./routes/contributions.routes');
const cycleRoutes        = require('./routes/cycles.routes');

const app = express();

// Security headers — must be first
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS — only allow our Vercel frontend
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://www.osusu.tech',
  'https://osusu.tech',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
app.use(morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:      'ok',
    service:     'OsusuApp API',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
    uptime:      Math.floor(process.uptime()),
  });
});

// API routes
app.use('/api/auth',          authRoutes);
app.use('/api/groups',        groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/cycles',        cycleRoutes);

// 404 handler
app.use('/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Global error handler — must be last, must have 4 args
app.use((err, req, res, next) => {
  console.error('[ERROR]', {
    message:   err.message,
    stack:     process.env.NODE_ENV === 'development'
               ? err.stack : undefined,
    path:      req.path,
    method:    req.method,
    timestamp: new Date().toISOString(),
  });

  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      error: { message: 'Request blocked by CORS policy.' },
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again.'
        : err.message,
    },
  });
});

module.exports = app;
