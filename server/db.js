const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'unionhub.json');

function loadDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { profiles: [], departments: [], tasks: [] };
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (!raw.trim()) return { profiles: [], departments: [], tasks: [] };
    const parsed = JSON.parse(raw);
    return {
      profiles: parsed.profiles || [],
      departments: parsed.departments || [],
      tasks: parsed.tasks || [],
    };
  } catch {
    return { profiles: [], departments: [], tasks: [] };
  }
}

function saveDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

function getProfileByEmail(email) {
  const db = loadDb();
  return db.profiles.find((p) => p.email === email) || null;
}

function getProfileById(id) {
  const db = loadDb();
  return db.profiles.find((p) => p.id === id) || null;
}

function getAllProfiles() {
  const db = loadDb();
  return db.profiles;
}

function insertProfile(profile) {
  const db = loadDb();
  if (db.profiles.some((p) => p.email && profile.email && p.email === profile.email)) {
    const err = new Error('Email already exists');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }
  db.profiles.push(profile);
  saveDb(db);
  return profile;
}

function updateProfile(id, updates) {
  const db = loadDb();
  const idx = db.profiles.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.profiles[idx] = { ...db.profiles[idx], ...updates };
  saveDb(db);
  return db.profiles[idx];
}

function getTasks() {
  const db = loadDb();
  return db.tasks;
}

function insertTask(task) {
  const db = loadDb();
  if (db.tasks.some((t) => t.id === task.id)) {
    const err = new Error('Task ID already exists');
    err.code = 'TASK_EXISTS';
    throw err;
  }
  db.tasks.push(task);
  saveDb(db);
  return task;
}

function updateTask(id, updates) {
  const db = loadDb();
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.tasks[idx] = { ...db.tasks[idx], ...updates };
  saveDb(db);
  return db.tasks[idx];
}

module.exports = {
  getProfileByEmail,
  getProfileById,
  getAllProfiles,
  insertProfile,
  updateProfile,
  getTasks,
  insertTask,
  updateTask,
};
