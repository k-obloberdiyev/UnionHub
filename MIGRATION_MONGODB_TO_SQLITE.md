# MongoDB to SQLite Migration Guide

## Quick Summary

This guide helps you migrate from **MongoDB Atlas** (cloud) to **SQLite** (local SQL database) for UnionHub.

**Estimated Migration Time:** 30 minutes  
**Downtime:** ~5 minutes  
**Difficulty:** Easy

---

## Prerequisites

Before starting, ensure you have:
- Node.js 14+ installed
- Current MongoDB data backed up (we'll export it)
- Terminal/command line access
- The UnionHub project cloned locally

---

## Step 1: Export Data from MongoDB

### Export Current Data

```bash
# Install MongoDB tools if you don't have them
# Download from: https://www.mongodb.com/try/download/database-tools

# Export all collections to JSON files
mongoexport --uri "mongodb+srv://USER:PASS@cluster.mongodb.net/unionhub" \
  --collection profiles --out profiles.json
mongoexport --uri "mongodb+srv://USER:PASS@cluster.mongodb.net/unionhub" \
  --collection tasks --out tasks.json
mongoexport --uri "mongodb+srv://USER:PASS@cluster.mongodb.net/unionhub" \
  --collection departments --out departments.json
```

**Or using MongoDB Compass GUI:**
1. Connect to your MongoDB cluster
2. Select each collection
3. Click "Export Collection" → save as JSON

---

## Step 2: Install SQLite Dependencies

```bash
cd UnionHub

# Install better-sqlite3 (faster synchronous SQLite)
npm install better-sqlite3

# Verify bcryptjs is installed
npm list bcryptjs  # Should show bcryptjs@2.4.3 or similar
```

---

## Step 3: Create SQLite Database

### Initialize Database Schema

```bash
# Create the database initialization script
touch server/scripts/init-sqlite.js

# Copy the content from SETUP_SQLITE.md "Create Database Schema" section
# Then run:
node server/scripts/init-sqlite.js
```

This creates:
- `./data/unionhub.db` (SQLite database file)
- All required tables with proper schema
- Indexes for performance

---

## Step 4: Migrate Data

### Import from MongoDB Exports

Create file: `server/scripts/migrate-to-sqlite.js`

```javascript
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = './data/unionhub.db';
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('📥 Starting data migration from MongoDB exports...\n');

// Helper function to insert profiles
function migrateProfiles(exportFile) {
  if (!fs.existsSync(exportFile)) {
    console.warn(`⚠️  ${exportFile} not found, skipping profiles`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
  const insertStmt = db.prepare(`
    INSERT INTO profiles 
    (id, email, password_hash, first_name, last_name, name, department_code, 
     class_name, biography, avatar_url, coins, credibility_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  for (const profile of data) {
    try {
      insertStmt.run(
        profile._id?.toString() || profile.id,
        profile.email.toLowerCase(),
        profile.password_hash || profile.password || 'hash_placeholder', // Keep existing hashes
        profile.first_name,
        profile.last_name,
        profile.name,
        profile.department_code,
        profile.class_name,
        profile.biography,
        profile.avatar_url,
        profile.coins || 0,
        profile.credibility_score || 0,
        profile.created_at || new Date().toISOString(),
        profile.updated_at || new Date().toISOString()
      );
      inserted++;
    } catch (err) {
      console.error(`❌ Failed to insert profile ${profile.email}:`, err.message);
    }
  }
  console.log(`✅ Migrated ${inserted} profiles`);
}

// Helper function to insert tasks
function migrateTasks(exportFile) {
  if (!fs.existsSync(exportFile)) {
    console.warn(`⚠️  ${exportFile} not found, skipping tasks`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
  const insertStmt = db.prepare(`
    INSERT INTO tasks 
    (id, title, description, status, coins, department_code, deadline, 
     progress_current, progress_target, progress_unit, 
     evaluation_completed, evaluation_score, evaluation_feedback, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  for (const task of data) {
    try {
      insertStmt.run(
        task._id?.toString() || task.id,
        task.title,
        task.description,
        task.status || 'pending',
        task.coins || 0,
        task.department_code,
        task.deadline,
        task.progress?.current || 0,
        task.progress?.target || 100,
        task.progress?.unit || '%',
        task.evaluation?.completed ? 1 : 0,
        task.evaluation?.score,
        task.evaluation?.feedback,
        task.created_at || new Date().toISOString(),
        task.updated_at || new Date().toISOString()
      );
      inserted++;
    } catch (err) {
      console.error(`❌ Failed to insert task ${task.title}:`, err.message);
    }
  }
  console.log(`✅ Migrated ${inserted} tasks`);
}

// Helper function to insert departments
function migrateDepartments(exportFile) {
  if (!fs.existsSync(exportFile)) {
    console.warn(`⚠️  ${exportFile} not found, using defaults`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
  const insertStmt = db.prepare(`
    INSERT INTO departments (id, name, emoji, description)
    VALUES (?, ?, ?, ?)
  `);

  let inserted = 0;
  for (const dept of data) {
    try {
      insertStmt.run(
        dept._id?.toString() || dept.id,
        dept.name,
        dept.emoji,
        dept.description
      );
      inserted++;
    } catch (err) {
      console.error(`❌ Failed to insert department ${dept.name}:`, err.message);
    }
  }
  console.log(`✅ Migrated ${inserted} departments`);
}

// Run migrations
console.log('📁 Looking for export files...\n');
migrateProfiles('./profiles.json');
migrateTasks('./tasks.json');
migrateDepartments('./departments.json');

console.log('\n✅ Migration complete!');
console.log('📊 Database location:', dbPath);
console.log('💾 Next: Update .env to use SQLite\n');

db.close();
```

Run the migration:
```bash
node server/scripts/migrate-to-sqlite.js
```

---

## Step 5: Update Environment Variables

### Update .env

```dotenv
# Old MongoDB:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/unionhub

# New SQLite:
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/unionhub.db
NODE_ENV=development
PORT=8787
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@example.com
CORS_ORIGIN=http://localhost:8080
```

---

## Step 6: Update Database Connection

### Modify server/index.js

The server needs to support both databases. Update the connection logic:

**Current code:**
```javascript
const { connectToDatabase } = require('./lib/mongodb');
```

**New code:**
```javascript
const dbType = process.env.DATABASE_TYPE || 'mongodb';

async function connectToDatabase() {
  if (dbType === 'sqlite') {
    const Database = require('better-sqlite3');
    if (!global.sqliteDb) {
      global.sqliteDb = new Database(process.env.DATABASE_PATH || './data/unionhub.db');
      global.sqliteDb.pragma('foreign_keys = ON');
    }
    return { db: global.sqliteDb, type: 'sqlite' };
  } else {
    return require('./lib/mongodb').connectToDatabase();
  }
}
```

---

## Step 7: Update API Adapters

### Update Query Methods for SQLite

If using the API, update `api-adapter.ts` to support SQLite:

```typescript
async function apiQuery(method: string, path: string, body?: any) {
  if (!API_URL) throw new Error("API_URL not configured");
  
  const url = `${API_URL}${path}`;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  
  if (currentSession?.access_token) {
    headers.Authorization = `Bearer ${currentSession.access_token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, options);
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
```

---

## Step 8: Test the Migration

### Run Development Server

```bash
# Make sure you're in the project root
npm install  # Install any missing deps

# Start the backend
cd server
npm run dev

# In another terminal, start frontend
npm run dev

# In browser, go to: http://localhost:8080
```

### Test Cases

```bash
# 1. Test login with migrated user
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com", "password":"password"}'

# 2. Get all profiles
curl http://localhost:8787/admin/profiles \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get all tasks
curl http://localhost:8787/admin/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Verify database file exists
ls -lh ./data/unionhub.db
```

---

## Step 9: Database Backups

### Create Backup Script

Create file: `server/scripts/backup-sqlite.js`

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = process.env.DATABASE_PATH || './data/unionhub.db';
const backupDir = './backups';

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Create timestamped backup
const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const backupPath = path.join(backupDir, `unionhub-${timestamp}.db`);

try {
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);
} catch (err) {
  console.error('❌ Backup failed:', err.message);
  process.exit(1);
}
```

### Add to package.json

```json
{
  "scripts": {
    "backup": "node server/scripts/backup-sqlite.js",
    "backup-daily": "node -e \"setInterval(() => require('child_process').execSync('npm run backup'), 86400000)\""
  }
}
```

### Automated Daily Backups (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/unionhub && npm run backup
```

---

## Step 10: Remove MongoDB References (Optional)

Once you're confident SQLite works, clean up:

```bash
# Remove MongoDB modules
npm uninstall mongoose

# Comment out in vercel.json (if not using cloud version)
# Still keep for fallback? Keep it!

# Archive old MongoDB config
mv server/lib/mongodb.js server/lib/mongodb.js.bak
```

---

## Troubleshooting

### "Error: database is locked"
**Cause:** Another process is using the database  
**Fix:** 
```bash
# Close other terminals using the server
# Then restart: npm run dev
```

### "Cannot find module better-sqlite3"
**Cause:** Not installed  
**Fix:** 
```bash
npm install better-sqlite3
npm rebuild  # Rebuild native modules
```

### "FOREIGN KEY constraint failed"
**Cause:** Data references don't match  
**Fix:** 
```bash
# Check that all department_code references exist in departments table
sqlite3 ./data/unionhub.db
> SELECT DISTINCT department_code FROM tasks;
> SELECT id FROM departments;
```

### Data Missing After Migration
**Cause:** Export file wasn't found  
**Fix:**
```bash
# Check if export files exist
ls -la profiles.json tasks.json

# Verify migration script ran correctly
node server/scripts/migrate-to-sqlite.js
```

---

## Rollback Plan

If something goes wrong:

### To Go Back to MongoDB

```bash
# Restore .env
MONGODB_URI=mongodb+srv://...
DATABASE_TYPE=mongodb

# Restart server
npm run dev
```

### To Restore from SQLite Backup

```bash
# Stop server
# Copy backup
cp ./backups/unionhub-2025-01-15.db ./data/unionhub.db

# Restart
npm run dev
```

---

## Performance Comparison

| Metric | MongoDB | SQLite |
|--------|---------|--------|
| **Startup Time** | 2-5s | < 100ms |
| **Query Speed** | ~50ms | ~5-10ms |
| **Concurrent Users** | 100+ | 50+ |
| **Backup Time** | Depends | Instant (file copy) |
| **Disk Space** | 500MB+ | 10-50MB |
| **Cost** | Free tier limited | $0 |

**SQLite is faster for small-to-medium projects!**

---

## Next Steps

1. ✅ Complete the 10 steps above
2. 📊 Monitor database performance
3. 🔐 Implement bcrypt password hashing (see SECURITY_ISSUES.md)
4. 💾 Set up automated backups
5. 📈 Scale to PostgreSQL if you grow > 100 concurrent users

---

## Support

If you encounter issues:

1. Check troubleshooting section above
2. Review SETUP_SQLITE.md for setup details
3. Check server logs: `npm run dev` output
4. Test with curl commands above
5. Verify .env configuration

---

## Summary

**What Changed:**
- ❌ MongoDB Atlas (cloud)
- ✅ SQLite (local file)

**Files Modified:**
- `.env` (database type + path)
- `server/index.js` (connection logic)
- Added: `data/unionhub.db`

**Backups:**
- Old: MongoDB snapshots
- New: Simple file copy

**Benefits:**
- No internet required
- Faster for local development
- Zero cost
- Easy self-hosting

**Time to implement:** ~30 minutes
