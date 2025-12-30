# UnionHub: Local SQLite Database Setup Guide

## Overview

This guide explains how to set up and use **SQLite** (local SQL database) instead of MongoDB Atlas (cloud) for development and self-hosted deployments.

### Benefits of SQLite:
- ✅ **No cloud dependencies** - Run offline or behind firewalls
- ✅ **No configuration needed** - Single file database
- ✅ **Zero cost** - Open source, embedded
- ✅ **Perfect for teams** - Small to medium projects (< 100 concurrent users)
- ✅ **Easy backups** - Just copy the database file
- ✅ **Production ready** - Used by millions of apps (Airbnb, Slack, etc.)

### Cons vs MongoDB:
- Limited to single server (no built-in clustering)
- Smaller concurrent write limits
- Not ideal for real-time data (use MongoDB for that)

---

## Option 1: Using SQLite with Node.js + SQL.js (Browser-compatible)

### Installation

```bash
# Install SQLite driver for Node.js
npm install better-sqlite3

# Or for async/await support:
npm install sqlite3

# Already have bcryptjs in package.json? Great!
npm install bcryptjs  # If not already there
```

### Setup Environment Variables

Update your `.env` file:

```dotenv
# Database Configuration
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/unionhub.db
# Or for absolute path:
# DATABASE_PATH=/var/data/unionhub.db

# Keep JWT_SECRET and other configs
JWT_SECRET=your-super-secret-key-change-in-production
ADMIN_EMAIL=your-admin@example.com
```

### Create Database Schema

Create file: `server/scripts/init-sqlite.js`

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './data/unionhub.db';

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    department_code INTEGER,
    class_name TEXT,
    biography TEXT,
    avatar_url TEXT,
    coins INTEGER DEFAULT 0,
    credibility_score REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    coins INTEGER DEFAULT 0,
    department_code INTEGER,
    deadline DATETIME,
    progress_current INTEGER DEFAULT 0,
    progress_target INTEGER DEFAULT 100,
    progress_unit TEXT DEFAULT '%',
    evaluation_completed BOOLEAN DEFAULT 0,
    evaluation_score INTEGER,
    evaluation_feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(department_code) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS user_tasks (
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, task_id),
    FOREIGN KEY(user_id) REFERENCES profiles(id),
    FOREIGN KEY(task_id) REFERENCES tasks(id)
  );

  CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_code);
`);

console.log('✅ SQLite database initialized at:', dbPath);
db.close();
```

### Run Database Initialization

```bash
node server/scripts/init-sqlite.js
```

---

## Option 2: Updated Server Connection Module

Replace `server/lib/mongodb.js` with `server/lib/database.js`:

Create file: `server/lib/database.js`

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_TYPE = process.env.DATABASE_TYPE || 'sqlite';
const DB_PATH = process.env.DATABASE_PATH || './data/unionhub.db';
const MONGO_URI = process.env.MONGODB_URI;

let db = null;

function initializeSQLite() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  console.log('✅ Connected to SQLite:', DB_PATH);
  return db;
}

async function initializeMongoDB() {
  const mongoose = require('mongoose');
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

function connectToDatabase() {
  if (DB_TYPE === 'sqlite') {
    if (!db) {
      return { db: initializeSQLite(), type: 'sqlite' };
    }
    return { db, type: 'sqlite' };
  } else if (DB_TYPE === 'mongodb' && MONGO_URI) {
    return initializeMongoDB();
  } else {
    throw new Error('DATABASE_TYPE must be "sqlite" or "mongodb" with valid config');
  }
}

module.exports = {
  connectToDatabase,
  DB_TYPE
};
```

---

## Option 3: SQLite Adapter for Queries

Create file: `server/adapters/sqlite-adapter.js`

```javascript
const Database = require('better-sqlite3');

class SQLiteAdapter {
  constructor(db) {
    this.db = db;
  }

  // Profile queries
  async findProfileByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM profiles WHERE email = ? COLLATE NOCASE');
    return stmt.get(email.toLowerCase());
  }

  async findProfileById(id) {
    const stmt = this.db.prepare('SELECT * FROM profiles WHERE id = ?');
    return stmt.get(id);
  }

  async createProfile(profile) {
    const stmt = this.db.prepare(`
      INSERT INTO profiles 
      (id, email, password_hash, first_name, last_name, name, department_code, class_name, biography, avatar_url, coins, credibility_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      profile.id,
      profile.email.toLowerCase(),
      profile.password_hash,
      profile.first_name,
      profile.last_name,
      profile.name,
      profile.department_code,
      profile.class_name,
      profile.biography,
      profile.avatar_url,
      profile.coins,
      profile.credibility_score
    );
    return { ...profile, _id: profile.id };
  }

  async updateProfile(id, updates) {
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== '_id');
    const placeholders = fields.map(f => `${f} = ?`).join(', ');
    const stmt = this.db.prepare(`UPDATE profiles SET ${placeholders}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...fields.map(f => updates[f]), id);
    return this.findProfileById(id);
  }

  async getAllProfiles() {
    const stmt = this.db.prepare('SELECT * FROM profiles ORDER BY created_at DESC');
    return stmt.all();
  }

  // Task queries
  async findTaskById(id) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id);
  }

  async createTask(task) {
    const stmt = this.db.prepare(`
      INSERT INTO tasks 
      (id, title, description, status, coins, department_code, deadline, progress_current, progress_target, progress_unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      task.id,
      task.title,
      task.description,
      task.status || 'pending',
      task.coins || 0,
      task.department_code,
      task.deadline,
      task.progress?.current || 0,
      task.progress?.target || 100,
      task.progress?.unit || '%'
    );
    return this.findTaskById(task.id);
  }

  async updateTask(id, updates) {
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== '_id');
    const placeholders = fields.map(f => {
      if (f === 'progress') return 'progress_current = ?, progress_target = ?, progress_unit = ?';
      if (f === 'evaluation') return 'evaluation_completed = ?, evaluation_score = ?, evaluation_feedback = ?';
      return `${f} = ?`;
    }).join(', ');
    
    const values = fields.map(f => {
      if (f === 'progress') return [updates[f].current, updates[f].target, updates[f].unit];
      if (f === 'evaluation') return [updates[f].completed, updates[f].score, updates[f].feedback];
      return updates[f];
    }).flat();

    const stmt = this.db.prepare(`UPDATE tasks SET ${placeholders}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
    return this.findTaskById(id);
  }

  async deleteTask(id) {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }

  async getAllTasks() {
    const stmt = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    return stmt.all();
  }
}

module.exports = SQLiteAdapter;
```

---

## Option 4: Environment Setup for Deployment

### Local Development

```bash
# .env (local)
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/unionhub.db
PORT=8787
NODE_ENV=development
```

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  unionhub:
    build: .
    ports:
      - "8787:8787"
    volumes:
      - ./data:/app/data  # Persist SQLite database
    environment:
      DATABASE_TYPE: sqlite
      DATABASE_PATH: /app/data/unionhub.db
      NODE_ENV: production
      PORT: 8787
```

### VPS/Server Deployment

```bash
# SSH into your server
ssh user@your-server.com

# Clone and setup
git clone <your-repo>
cd unionhub
npm install

# Create data directory
mkdir -p /var/lib/unionhub/data
chmod 755 /var/lib/unionhub/data

# Set environment variables
cat > .env << EOF
DATABASE_TYPE=sqlite
DATABASE_PATH=/var/lib/unionhub/data/unionhub.db
NODE_ENV=production
PORT=8787
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_EMAIL=admin@yourdomain.com
EOF

# Initialize database
node server/scripts/init-sqlite.js

# Start with PM2 or systemd
pm2 start server/index.js --name unionhub
```

### Systemd Service (Alternative to PM2)

Create `/etc/systemd/system/unionhub.service`:

```ini
[Unit]
Description=UnionHub API Server
After=network.target

[Service]
Type=simple
User=unionhub
WorkingDirectory=/home/unionhub/unionhub
EnvironmentFile=/home/unionhub/unionhub/.env
ExecStart=/usr/bin/node /home/unionhub/unionhub/server/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable unionhub
sudo systemctl start unionhub
sudo systemctl status unionhub
```

---

## Backup & Recovery

### Backup SQLite Database

```bash
# Simple copy (when server is not running)
cp ./data/unionhub.db ./backups/unionhub-$(date +%Y%m%d).db

# Or with compression
tar -czf unionhub-backup-$(date +%Y%m%d).tar.gz ./data/unionhub.db

# Automated backup (cron job)
# Add to crontab: crontab -e
0 2 * * * cp /var/lib/unionhub/data/unionhub.db /backups/unionhub-$(date +\%Y\%m\%d).db
```

### Restore from Backup

```bash
cp ./backups/unionhub-20250101.db ./data/unionhub.db
npm run dev  # or restart service
```

---

## Performance Tips

### For SQLite:

1. **Connection Pooling** - SQLite works best with persistent connections
2. **Indexes** - Already created on email, status, department
3. **VACUUM** - Optimize database file periodically:
   ```javascript
   db.exec('VACUUM;');
   ```
4. **WAL Mode** - Enable Write-Ahead Logging for better concurrency:
   ```javascript
   db.pragma('journal_mode = WAL');
   ```

### For Switching Back to MongoDB (if needed):

Simply change `.env`:
```dotenv
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/unionhub
```

And your application code will automatically route to MongoDB!

---

## Troubleshooting

### "database is locked" error
- Close other processes using the database
- Use WAL mode: `db.pragma('journal_mode = WAL');`
- Increase timeout: `new Database(path, { timeout: 30000 })`

### Disk space issues
- Run VACUUM: `node -e "require('better-sqlite3')('./data/unionhub.db').exec('VACUUM;');"`
- Implement archival for old tasks

### Migration from MongoDB

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed instructions.

---

## Security Checklist

- ✅ Passwords stored as bcrypt hashes (not plaintext)
- ✅ JWT tokens for authentication
- ✅ Database file permissions: `chmod 600 unionhub.db`
- ✅ Regular backups stored securely
- ✅ HTTPS enforced in production
- ✅ SQLi protection via prepared statements (already using)

---

## Summary

| Aspect | SQLite | MongoDB |
|--------|--------|---------|
| **Setup** | 1 line | Complex config |
| **Cost** | Free | Free tier limited |
| **Users** | Up to 100 | Unlimited |
| **Offline** | ✅ Yes | ❌ No |
| **Backups** | Easy (copy file) | Snapshots |
| **Scaling** | Single server | Clusters |

Choose **SQLite** for simplicity and self-hosting. Choose **MongoDB** if you need cloud clustering.
