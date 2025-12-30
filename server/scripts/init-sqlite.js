#!/usr/bin/env node

/**
 * SQLite Database Initialization Script
 * Creates database schema with tables and indexes
 * Usage: node server/scripts/init-sqlite.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './data/unionhub.db';

console.log('🔄 Initializing SQLite database...\n');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  console.log(`📁 Creating directory: ${dir}`);
  fs.mkdirSync(dir, { recursive: true });
}

// Create/connect to database
let db;
try {
  db = new Database(dbPath);
  console.log(`✅ Database file created/opened: ${dbPath}`);
} catch (err) {
  console.error('❌ Failed to create database:', err.message);
  process.exit(1);
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
try {
  db.exec(`
    -- Profiles table (users)
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT,
      password TEXT,
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

    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_code);

    -- Departments table
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

    -- Tasks table
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

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_code);
    CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

    -- User-Task associations
    CREATE TABLE IF NOT EXISTS user_tasks (
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, task_id),
      FOREIGN KEY(user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_user_tasks_user ON user_tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_tasks_task ON user_tasks(task_id);
  `);

  console.log('✅ Database schema created successfully\n');
  
  // Display table info
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  console.log('📊 Tables created:');
  tables.forEach(t => console.log(`   ✓ ${t.name}`));
  
  console.log('\n📈 Indexes created:');
  const indexes = db.prepare(`
    SELECT name, tbl_name FROM sqlite_master 
    WHERE type='index' AND name LIKE 'idx_%'
    ORDER BY tbl_name
  `).all();
  
  if (indexes.length > 0) {
    indexes.forEach(idx => {
      console.log(`   ✓ ${idx.name} (on ${idx.tbl_name})`);
    });
  }

  console.log('\n✅ SQLite database initialized successfully!');
  console.log(`📁 Database path: ${path.resolve(dbPath)}`);
  console.log(`💾 Database size: ${fs.statSync(dbPath).size} bytes`);
  console.log('\n📝 Next steps:');
  console.log('   1. Update .env with: DATABASE_TYPE=sqlite');
  console.log('   2. Update .env with: DATABASE_PATH=./data/unionhub.db');
  console.log('   3. Run: npm run dev');
  console.log('   4. Create users via registration endpoint');

} catch (err) {
  console.error('❌ Failed to create schema:', err.message);
  process.exit(1);
} finally {
  db.close();
  console.log('\n✅ Done!\n');
}
