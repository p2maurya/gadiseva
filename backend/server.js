const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectMongo } = require('./data/store');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ─── API ROUTES ───────────────────────────────────────────────────────────────
const driversRouter = require('./routes/drivers');
const bookingsRouter = require('./routes/bookings');

app.use('/api/drivers', driversRouter);
app.use('/api/bookings', bookingsRouter);

// Health check
app.get('/api/health', (req, res) => {
  const { db } = require('./data/store');
  res.json({
    status: 'ok',
    message: 'Gaadi Express API running ✅',
    timestamp: new Date().toISOString(),
    storage: db.isUsingMongo() ? 'mongodb' : 'memory (data resets on restart!)',
    env: process.env.NODE_ENV || 'development'
  });
});

// API root info
app.get('/api', (req, res) => {
  res.json({
    name: 'Gaadi Express - Rural Transport API',
    version: '2.1.0',
    endpoints: [
      'GET  /api/health',
      'POST /api/drivers — Register driver',
      'GET  /api/drivers — List all drivers',
      'GET  /api/drivers/:id — Get driver',
      'PATCH /api/drivers/:id/availability — Toggle availability',
      'PATCH /api/drivers/:id/location — Update GPS',
      'GET  /api/drivers/nearby/search?lat=&lng=&radius=20 — Nearby vehicles',
      'POST /api/bookings — Create booking',
      'GET  /api/bookings — List bookings',
      'GET  /api/bookings/:id — Get booking',
      'PATCH /api/bookings/:id/status — Update status',
      'GET  /api/bookings/admin/stats — Admin stats'
    ]
  });
});

// ─── SERVE REACT FRONTEND ────────────────────────────────────────────────────
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
const fs = require('fs');

if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Gaadi Express API is running! Frontend build not found.',
      api: '/api',
      health: '/api/health'
    });
  });
}

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect to MongoDB first (falls back to memory if not configured)
  await connectMongo();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚛 Gaadi Express running on port ${PORT}`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
