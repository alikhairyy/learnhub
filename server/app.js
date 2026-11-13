const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Simple request logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ---------- API routes ----------
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api', require('./routes/enrollments'));

// Unknown API route
app.use('/api', (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// ---------- Serve React build in production ----------
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// ---------- Error handler ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Mongoose validation errors -> 400 with readable messages
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate value' });
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;
