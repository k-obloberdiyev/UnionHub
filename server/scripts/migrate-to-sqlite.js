#!/usr/bin/env node

/**
 * MongoDB to SQLite Migration Script
 * Migrates data from MongoDB exports (JSON) to SQLite database
 * 
 * Prerequisites:
 * 1. Export MongoDB collections: mongoexport --collection profiles --out profiles.json
 * 2. Have profiles.json, tasks.json, departments.json in current directory
 * 3. Run: node server/scripts/migrate-to-sqlite.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './data/unionhub.db';

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found. Run: node server/scripts/init-sqlite.js first');
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('📥 Starting MongoDB to SQLite migration...\n');

let totalMigrated = 0;

// Helper function to migrate profiles
function migrateProfiles(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${filePath} not found, skipping profiles`);
    return;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = fileContent.trim() ? JSON.parse(`[${fileContent.replace(/\n/g, ',').slice(0, -1)}]`) : [];

    if (!Array.isArray(data)) {
      console.warn('⚠️  profiles.json is not valid JSON array format');
      return;
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO profiles 
      (id, email, password_hash, password, first_name, last_name, name, 
       department_code, class_name, biography, avatar_url, coins, credibility_score, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    const transaction = db.transaction((profiles) => {
      for (const profile of profiles) {
        try {
          insertStmt.run(
            profile._id?.toString?.() || profile.id || `user-${Date.now()}-${Math.random()}`,
            profile.email?.toLowerCase?.() || '',
            profile.password_hash,
            profile.password, // Keep legacy plaintext if it exists
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
    });

    transaction(data);
    console.log(`✅ Migrated ${inserted} profiles`);
    totalMigrated += inserted;

  } catch (err) {
    console.error(`❌ Failed to migrate profiles:`, err.message);
  }
}

// Helper function to migrate tasks
function migrateTasks(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${filePath} not found, skipping tasks`);
    return;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = fileContent.trim() ? JSON.parse(`[${fileContent.replace(/\n/g, ',').slice(0, -1)}]`) : [];

    if (!Array.isArray(data)) {
      console.warn('⚠️  tasks.json is not valid JSON array format');
      return;
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO tasks 
      (id, title, description, status, coins, department_code, deadline, 
       progress_current, progress_target, progress_unit, 
       evaluation_completed, evaluation_score, evaluation_feedback, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    const transaction = db.transaction((tasks) => {
      for (const task of tasks) {
        try {
          insertStmt.run(
            task._id?.toString?.() || task.id,
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
    });

    transaction(data);
    console.log(`✅ Migrated ${inserted} tasks`);
    totalMigrated += inserted;

  } catch (err) {
    console.error(`❌ Failed to migrate tasks:`, err.message);
  }
}

// Helper function to migrate departments
function migrateDepartments(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('ℹ️  departments.json not found, using defaults');
    return;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = fileContent.trim() ? JSON.parse(`[${fileContent.replace(/\n/g, ',').slice(0, -1)}]`) : [];

    if (!Array.isArray(data)) {
      console.warn('⚠️  departments.json is not valid JSON array format');
      return;
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO departments (id, name, emoji, description)
      VALUES (?, ?, ?, ?)
    `);

    let inserted = 0;
    const transaction = db.transaction((depts) => {
      for (const dept of depts) {
        try {
          insertStmt.run(
            dept._id?.toString?.() || dept.id || null,
            dept.name,
            dept.emoji,
            dept.description
          );
          inserted++;
        } catch (err) {
          console.error(`❌ Failed to insert department ${dept.name}:`, err.message);
        }
      }
    });

    transaction(data);
    console.log(`✅ Migrated ${inserted} departments`);
    totalMigrated += inserted;

  } catch (err) {
    console.error(`❌ Failed to migrate departments:`, err.message);
  }
}

// Run migrations
console.log('📁 Looking for export files...\n');

migrateProfiles('./profiles.json');
migrateTasks('./tasks.json');
migrateDepartments('./departments.json');

// Verify migration
console.log('\n📊 Verification:');
const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get();
const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get();

console.log(`   Profiles: ${profileCount.count}`);
console.log(`   Tasks: ${taskCount.count}`);
console.log(`   Departments: ${deptCount.count}`);
console.log(`   Total records migrated: ${totalMigrated}`);

db.close();

console.log('\n✅ Migration complete!');
console.log(`📊 Database: ${path.resolve(dbPath)}`);
console.log('🚀 Next: npm run dev\n');
