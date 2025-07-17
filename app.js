const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser');

// Routes
const adminRoutes = require('./routes/admin.Routes.js');
const userRoutes = require('./routes/user.Routes.js');
const audioRoutes = require('./routes/audio.Routes.js');
const adminAudioRoutes = require('./routes/admin.audio.Routes.js');

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve *all static files* from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Example: /uploads → static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ✅ Routes
app.use(userRoutes);
app.use(adminRoutes);
app.use(audioRoutes);
app.use(adminAudioRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Something went wrong!',
  });
});

module.exports = app;