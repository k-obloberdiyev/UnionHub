require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { connectToDatabase } = require('./lib/mongodb');
const { ProfileModel, TaskModel } = require('./models/models');

// Temporarily disable database connection for testing
// const connectDB = require('./config/database');

// Import services
// const profileService = require('./services/profileService');
// const taskService = require('./services/taskService');
// const departmentService = require('./services/departmentService');

// Connect to MongoDB
// connectDB();

const app = express();
const PORT = process.env.PORT || 8787;

// Export for Vercel
module.exports = app;
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
  const { db } = await connectToDatabase();
  
  // Check if admin user exists, if not create it
  const existingAdmin = await ProfileModel.findByEmail(db, 'kamolbekobloberdiyev1@gmail.com');
  if (!existingAdmin) {
    await ProfileModel.create(db, {
      id: 'admin-fallback',
      email: 'kamolbekobloberdiyev1@gmail.com',
      first_name: 'Kamolbek',
      last_name: 'Obloberdiyev',
      name: 'Kamolbek Obloberdiyev',
      department_code: null,
      class_name: 'Admin',
      biography: 'System Administrator',
      avatar_url: null,
      coins: 1000,
      credibility_score: 100,
      password: 'admin123'
    });
    console.log('Admin user created');
  }
  
  // Check if sample task exists, if not create it
  const existingTasks = await TaskModel.findAll(db);
  if (existingTasks.length === 0) {
    await TaskModel.create(db, {
      id: 'task-1',
      title: 'Sample Task 1',
      status: 'pending',
      coins: 100,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      department_code: 1,
      description: 'This is a sample task for testing',
      progress: { current: 25, target: 100, unit: '%' },
      evaluation: { completed: false, score: null, feedback: '' }
    });
    console.log('Sample task created');
  }
}

// Initialize database on startup
initializeDatabase().catch(console.error);

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  
  try {
    const { db } = await connectToDatabase();
    
    // Check if user exists in profiles
    const user = await ProfileModel.findByEmail(db, email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Get user with password for authentication
    const userWithPassword = await db.collection('profiles').findOne({ email: email.toLowerCase() });
    
    // Verify password
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

// --- Admin: profile management ---
// List all profiles (admin only)
app.get('/admin/profiles', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const profiles = await ProfileModel.findAll(db);
    return res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Edit a profile (admin only)
app.patch('/admin/profiles/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const updatedProfile = await ProfileModel.update(db, req.params.id, req.body);
    
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    return res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/profiles/:id', authMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const profile = await ProfileModel.findById(db, req.params.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    return res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/profiles', authMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Check if email already exists
    const existingProfile = await ProfileModel.findByEmail(db, req.body.email);
    if (existingProfile) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const newProfile = await ProfileModel.create(db, req.body);
    return res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
});

// --- Admin: task management ---
// List all tasks (admin only)
app.get('/admin/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const tasks = await TaskModel.findAll(db);
    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task (admin only)
app.post('/admin/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const newTask = await TaskModel.create(db, req.body);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task (admin only)
app.patch('/admin/tasks/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const updatedTask = await TaskModel.update(db, req.params.id, req.body);
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task (admin only)
app.delete('/admin/tasks/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get task before deletion for response
    const task = await TaskModel.findById(db, req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deleted = await TaskModel.delete(db, req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.json({ 
      message: 'Task deleted successfully',
      id: req.params.id,
      deleted: true,
      task: task
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Delete task evaluation (admin only)
app.delete('/admin/tasks/:id/evaluation', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const updatedTask = await TaskModel.update(db, req.params.id, {
      evaluation: { completed: false, score: null, feedback: '' },
      status: 'completed'
    });
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.json({ 
      message: 'Evaluation deleted successfully',
      id: req.params.id,
      evaluation: { completed: false, score: null, feedback: '' },
      status: 'completed'
    });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return res.status(500).json({ error: 'Failed to delete evaluation' });
  }
});

// Get departments for dropdown
app.get('/departments', (req, res) => {
  return res.json([
    { id: 1, name: "Education", emoji: "📚", description: "Academic workshops and tutoring programs", members: 28 },
    { id: 2, name: "Social Events", emoji: "🎉", description: "Student parties and social gatherings", members: 35 },
    { id: 3, name: "International Relations", emoji: "🌍", description: "Cultural exchange and international student support", members: 22 },
    { id: 4, name: "Media", emoji: "📸", description: "Content creation and social media management", members: 18 },
    { id: 5, name: "Sports", emoji: "⚽", description: "Athletic events and fitness activities", members: 42 },
    { id: 6, name: "Social Engagement", emoji: "🤝", description: "Community service and volunteer programs", members: 31 },
    { id: 7, name: "IT", emoji: "💻", description: "Tech support and digital infrastructure", members: 15 }
  ]);
});

app.get('/health', (req, res) => res.json({ ok: true }));
