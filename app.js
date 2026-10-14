require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

// Initialize database schema and auto-seed if needed
require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cspc_campus_maintenance_secure_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// Global view variables (User info, Flash messages, Active route)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || {};
  delete req.session.flash;
  res.locals.currentPath = req.path;
  next();
});

// Import route modules
const authRoutes = require('./routes/authRoutes');
const requesterRoutes = require('./routes/requesterRoutes');
const staffRoutes = require('./routes/staffRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes
app.use('/', authRoutes);
app.use('/', requesterRoutes);
app.use('/staff', staffRoutes);
app.use('/admin', adminRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    path: req.originalUrl
  });
});

// 500 Internal Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).render('500', {
    title: '500 - Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
  });
});

// Only listen if run directly (allows easy importing in testing scripts)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  CSPC Campus Maintenance System is live!`);
    console.log(`  Access URL: http://localhost:${PORT}`);
    console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
