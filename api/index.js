require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./lib/mongodb');
const { ProfileModel, TaskModel } = require('./models/models');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

function nowISO() {
  return new Date().toISOString();
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function adminMiddleware(req, res, next) {
  if (!ADMIN_EMAIL) {
    return res.status(500).json({ error: 'Admin not configured (ADMIN_EMAIL missing)' });
  }
  const email = (req.user?.email || '').toLowerCase();
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden (admin only)' });
  }
  next();
}

// Initialize MongoDB data
async function initializeDatabase() {
  // Database initialization disabled - use proper user registration flow
  // This function previously created hardcoded test accounts which is a security risk
}

// Initialize database on startup
initializeDatabase().catch(console.error);

// API Routes
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  
  try {
    const { db } = await connectToDatabase();
    
    const user = await ProfileModel.findByEmail(db, email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const userWithPassword = await db.collection('profiles').findOne({ email: email.toLowerCase() });
    
    if (userWithPassword.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = signToken({ 
      id: user.id, 
      email: user.email 
    });
    
    return res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Export for Vercel
module.exports = app;
