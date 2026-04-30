require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const jobRoutes = require('./routes/jobs');
const advocateRoutes = require('./routes/advocates');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const jobProfileRoutes = require('./routes/jobProfile');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Headers ──────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ─── Body Parser ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter for auth routes
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ─── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/advocates', advocateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/member/job-profile', jobProfileRoutes);

// ─── Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'TANNMP API' });
});

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TANNMP API Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`);
});
