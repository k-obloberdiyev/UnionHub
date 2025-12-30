// SQLite database module
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/unionhub.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db = null;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err.message);
        reject(err);
        return;
      }
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err.message);
          reject(err);
          return;
        }
        
        createTables()
          .then(() => {
            console.log('✅ SQLite database initialized');
            resolve(db);
          })
          .catch(reject);
      });
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const statements = [
      // Profiles table
      `CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        name TEXT,
        class_name TEXT,
        department_code TEXT,
        biography TEXT,
        avatar_url TEXT,
        coins INTEGER DEFAULT 0,
        credibility_score INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tasks table
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        coins INTEGER DEFAULT 10,
        department_code TEXT,
        evaluation_status TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Departments table
      `CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        emoji TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // User tasks table (many-to-many)
      `CREATE TABLE IF NOT EXISTS user_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        status TEXT DEFAULT 'assigned',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES profiles(id),
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        UNIQUE(user_id, task_id)
      )`,
      
      // Evaluations table
      `CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        evaluated_user_id TEXT NOT NULL,
        evaluator_id TEXT NOT NULL,
        score INTEGER,
        feedback TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (evaluated_user_id) REFERENCES profiles(id),
        FOREIGN KEY (evaluator_id) REFERENCES profiles(id)
      )`
    ];
    
    let completed = 0;
    let hasError = false;
    
    statements.forEach((sql) => {
      db.run(sql, (err) => {
        if (err && !hasError) {
          hasError = true;
          reject(err);
          return;
        }
        
        completed++;
        if (completed === statements.length && !hasError) {
          createIndexes()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  });
}

function createIndexes() {
  return new Promise((resolve, reject) => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_code)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_user_tasks_user ON user_tasks(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_tasks_task ON user_tasks(task_id)',
      'CREATE INDEX IF NOT EXISTS idx_evaluations_task ON evaluations(task_id)',
      'CREATE INDEX IF NOT EXISTS idx_evaluations_user ON evaluations(evaluated_user_id)'
    ];
    
    let completed = 0;
    let hasError = false;
    
    indexes.forEach((sql) => {
      db.run(sql, (err) => {
        if (err && !hasError) {
          hasError = true;
          reject(err);
          return;
        }
        
        completed++;
        if (completed === indexes.length && !hasError) {
          resolve();
        }
      });
    });
  });
}

function getDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
    } else {
      initializeDatabase()
        .then(resolve)
        .catch(reject);
    }
  });
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase()
      .then((database) => {
        database.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ lastID: this.lastID, changes: this.changes });
          }
        });
      })
      .catch(reject);
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase()
      .then((database) => {
        database.get(sql, params, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      })
      .catch(reject);
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase()
      .then((database) => {
        database.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        });
      })
      .catch(reject);
  });
}

module.exports = {
  initializeDatabase,
  getDatabase,
  runQuery,
  getQuery,
  allQuery
};
