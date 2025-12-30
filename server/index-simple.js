// Simple working server
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, runQuery, getQuery, allQuery } = require('./lib/sqlite');

const app = express();
const PORT = process.env.PORT || 8787;
const DATABASE_TYPE = 'sqlite';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();

module.exports = app;

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

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
    return res.status(500).json({ error: 'Admin not configured' });
  }
  const email = (req.user?.email || '').toLowerCase();
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden (admin only)' });
  }
  next();
}

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    const user = await getQuery(
      'SELECT * FROM profiles WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = signToken({ id: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('[LOGIN] Error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all profiles (admin only)
app.get('/admin/profiles', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const profiles = await allQuery('SELECT * FROM profiles ORDER BY created_at DESC');
    return res.json(profiles);
  } catch (error) {
    console.error('[PROFILES] Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Create new profile
app.post('/profiles', authMiddleware, async (req, res) => {
  try {
    const { email, password, first_name, last_name, name, class_name, department_code, biography, coins, credibility_score } = req.body;
    
    // Check if email exists
    const existing = await getQuery('SELECT id FROM profiles WHERE LOWER(email) = LOWER(?)', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const password_hash = password ? await bcrypt.hash(password, 10) : 'NO_PASSWORD';
    
    const profileId = uuidv4();
    await runQuery(
      `INSERT INTO profiles (id, email, password_hash, first_name, last_name, name, class_name, department_code, biography, coins, credibility_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [profileId, email, password_hash, first_name, last_name, name, class_name, department_code, biography, coins || 0, credibility_score || 50]
    );
    
    const profile = await getQuery('SELECT * FROM profiles WHERE id = ?', [profileId]);
    return res.status(201).json(profile);
  } catch (error) {
    console.error('[CREATE_PROFILE] Error:', error.message);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Create new task (admin only)
app.post('/admin/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, coins, department_code, status } = req.body;
    
    const taskId = uuidv4();
    await runQuery(
      `INSERT INTO tasks (id, title, description, coins, department_code, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskId, title, description, coins || 10, department_code, status || 'pending', req.user.id]
    );
    
    const task = await getQuery('SELECT * FROM tasks WHERE id = ?', [taskId]);
    return res.status(201).json(task);
  } catch (error) {
    console.error('[CREATE_TASK] Error:', error.message);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks (admin only)
app.get('/admin/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tasks = await allQuery('SELECT * FROM tasks ORDER BY created_at DESC');
    return res.json(tasks);
  } catch (error) {
    console.error('[TASKS] Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Departments (static)
app.get('/departments', (req, res) => {
  return res.json([
    { id: 1, name: "Education", emoji: "📚" },
    { id: 2, name: "Social Events", emoji: "🎉" },
    { id: 3, name: "International Relations", emoji: "🌍" },
    { id: 4, name: "Media", emoji: "📸" },
    { id: 5, name: "Sports", emoji: "⚽" },
    { id: 6, name: "Social Engagement", emoji: "🤝" },
    { id: 7, name: "IT", emoji: "💻" }
  ]);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}
