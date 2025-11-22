const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'unionhub.json');

function loadDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { profiles: [], departments: [] };
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (!raw.trim()) return { profiles: [], departments: [] };
    return JSON.parse(raw);
  } catch {
    return { profiles: [], departments: [] };
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

module.exports = {
  getProfileByEmail,
  getProfileById,
  insertProfile,
};
