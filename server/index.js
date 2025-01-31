const express = require('express');
const app = express();
const studentRoutes = require('./routes/student');

// Routes
app.use('/api/student', studentRoutes);

module.exports = app; 