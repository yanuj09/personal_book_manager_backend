const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { clientOrigins } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Builds the Express app but never listens — server.js owns starting up, which
// keeps the app importable for tests or a serverless handler.
const app = express();

// Trust the platform proxy so `secure` cookies survive Render/Railway/Vercel.
app.set('trust proxy', 1);

// `credentials` is what lets the browser store and return the auth cookie; with
// it enabled the origin must be an explicit allow-list, never '*'.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Health check for uptime monitors and deploy platforms.
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Personal Book Manager API is running', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Order matters: unmatched routes fall to notFound, and everything ends in the
// single error handler.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
