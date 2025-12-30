// Test if server can start
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('✅ .env loaded');

const express = require('express');
console.log('✅ express loaded');

const cors = require('cors');
console.log('✅ cors loaded');

const jwt = require('jsonwebtoken');
console.log('✅ jwt loaded');

const bcrypt = require('bcryptjs');
console.log('✅ bcryptjs loaded');

const { v4: uuidv4 } = require('uuid');
console.log('✅ uuid loaded');

try {
  const { getDatabase } = require('./lib/sqlite');
  console.log('✅ sqlite module loaded');
} catch (err) {
  console.error('❌ Error loading sqlite:', err.message);
  process.exit(1);
}

console.log('✅ All modules loaded successfully!');
process.exit(0);
