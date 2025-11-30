require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

// File-based persistence
const DATA_FILE = path.join(__dirname, 'data.json');

// Load data from file or create initial data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No existing data file, creating initial data');
  }
  
  // Return initial data if file doesn't exist
  return {
    profiles: [
      {
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
        password: 'admin123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Sample Task 1',
        status: 'pending',
        coins: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        department_code: 1,
        description: 'This is a sample task for testing',
        progress: { current: 25, target: 100, unit: '%' },
        evaluation: { completed: false, score: null, feedback: '' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  };
}

// Save data to file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize data
let appData = loadData();
let mockProfiles = appData.profiles;
let mockTasks = appData.tasks;

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  
  // Check if user exists in profiles
  const user = mockProfiles.find(profile => profile.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // Verify password (in production, use bcrypt for hashed passwords)
  if (user.password !== password) {
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
});

// --- Admin: profile management ---
// List all profiles (admin only)
app.get('/admin/profiles', authMiddleware, adminMiddleware, (req, res) => {
  return res.json(mockProfiles);
});

// Edit a profile (admin only)
app.patch('/admin/profiles/:id', authMiddleware, adminMiddleware, (req, res) => {
  const profileIndex = mockProfiles.findIndex(profile => profile.id === req.params.id);
  
  if (profileIndex === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  // Update the profile in the in-memory store
  mockProfiles[profileIndex] = {
    ...mockProfiles[profileIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  return res.json(mockProfiles[profileIndex]);
});

app.get('/profiles/:id', authMiddleware, (req, res) => {
  const profile = mockProfiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  return res.json(profile);
});

app.post('/profiles', authMiddleware, (req, res) => {
  const newProfile = {
    id: require('crypto').randomUUID(),
    email: req.body.email,
    name: req.body.name,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    department_code: req.body.department_code,
    class_name: req.body.class_name,
    biography: req.body.biography || '',
    avatar_url: null,
    coins: 0,
    credibility_score: 100,
    password: req.body.password || 'password123', // Default password for demo
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add to in-memory store
  mockProfiles.push(newProfile);
  
  // Save to file
  saveData({ profiles: mockProfiles, tasks: mockTasks });
  
  // Return profile without password for security
  const { password, ...profileWithoutPassword } = newProfile;
  
  return res.status(201).json(profileWithoutPassword);
});

// --- Admin: task management ---
// List all tasks (admin only)
app.get('/admin/tasks', authMiddleware, adminMiddleware, (req, res) => {
  return res.json(mockTasks);
});

// Create a new task (admin only)
app.post('/admin/tasks', authMiddleware, adminMiddleware, (req, res) => {
  const task = {
    id: require('crypto').randomUUID(),
    title: req.body.title || 'New Task',
    status: req.body.status || 'pending',
    coins: Number(req.body.coins || 0),
    deadline: req.body.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    department_code: Number(req.body.department_code || 1),
    description: req.body.description || '',
    progress: req.body.progress || { current: 0, target: 100, unit: '%' },
    evaluation: req.body.evaluation || { completed: false, score: null, feedback: '' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add to in-memory store
  mockTasks.push(task);
  
  // Save to file
  saveData({ profiles: mockProfiles, tasks: mockTasks });
  
  return res.status(201).json(task);
});

// Update a task (admin only)
app.patch('/admin/tasks/:id', authMiddleware, adminMiddleware, (req, res) => {
  const taskIndex = mockTasks.findIndex(task => task.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Update the task in the in-memory store
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  // Save to file
  saveData({ profiles: mockProfiles, tasks: mockTasks });
  
  return res.json(mockTasks[taskIndex]);
});

// Delete a task (admin only)
app.delete('/admin/tasks/:id', authMiddleware, adminMiddleware, (req, res) => {
  const taskIndex = mockTasks.findIndex(task => task.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Remove the task from the in-memory store
  const deletedTask = mockTasks.splice(taskIndex, 1)[0];
  
  // Save to file
  saveData({ profiles: mockProfiles, tasks: mockTasks });
  
  return res.json({ 
    message: 'Task deleted successfully',
    id: req.params.id,
    deleted: true,
    task: deletedTask
  });
});

// Delete task evaluation (admin only)
app.delete('/admin/tasks/:id/evaluation', authMiddleware, adminMiddleware, (req, res) => {
  const taskIndex = mockTasks.findIndex(task => task.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Remove evaluation from the task in the in-memory store
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    evaluation: { completed: false, score: null, feedback: '' },
    status: 'completed', // Reset status to completed
    updated_at: new Date().toISOString()
  };
  
  // Save to file
  saveData({ profiles: mockProfiles, tasks: mockTasks });
  
  return res.json({ 
    message: 'Evaluation deleted successfully',
    id: req.params.id,
    evaluation: { completed: false, score: null, feedback: '' },
    status: 'completed'
  });
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
