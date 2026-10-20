'use strict';
require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const { getDb }   = require('./db/init');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000');

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"],
      fontSrc:    ["'self'", "fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
      imgSrc:     ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    }
  }
}));

app.use(cors({ origin: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// ── Rate limiting on API ──────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),  // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX || '10'),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/enquiry', require('./routes/enquiry'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// SPA fallback — serve index.html for all non-API, non-asset paths
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  await getDb();   // Initialise DB before accepting requests
  app.listen(PORT, () => {
    console.log(`\n🌏 Future Abroad running at http://localhost:${PORT}`);
    console.log(`   Press Ctrl+C to stop.\n`);
  });
}

boot().catch(err => {
  console.error('[Boot] Fatal error:', err);
  process.exit(1);
});
