const express = require('express');
const { query, validationResult, matchedData } = require('express-validator');
const connectDB = require('./config/db');
const path = require('path');
const userRouter = require('./routes/user.Routes.js');
const cookieParser = require('cookie-parser');
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(userRouter);
app.use("/api/audio", audioRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/hello',
  query('person').notEmpty().withMessage('Name is required').escape(),
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const data = matchedData(req);
    console.log(`Hello, ${data.person}`);
    res.send(`Hello, ${data.person}`);
  }
);

module.exports = app;