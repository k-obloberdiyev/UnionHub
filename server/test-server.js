require('dotenv').config();
console.log('Environment variables loaded');

try {
  console.log('Loading express...');
  const express = require('express');
  console.log('Express loaded');

  console.log('Loading other modules...');
  const cors = require('cors');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  console.log('All modules loaded');

  console.log('Loading database config...');
  const connectDB = require('./config/database');
  console.log('Database config loaded');

  console.log('Loading services...');
  const profileService = require('./services/profileService');
  const taskService = require('./services/taskService');
  const departmentService = require('./services/departmentService');
  console.log('All services loaded');

  console.log('Creating app...');
  const app = express();
  console.log('App created');

  console.log('Setting up middleware...');
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json());
  console.log('Middleware set up');

  console.log('Starting server...');
  const PORT = process.env.PORT || 8787;
  app.listen(PORT, () => {
    console.log(`✅ Test server listening on :${PORT}`);
  });

} catch (error) {
  console.error('❌ Error during server setup:', error.message);
  console.error('Stack:', error.stack);
}
