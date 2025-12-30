// Initialize SQLite and create test accounts
const { initializeDatabase, getDatabase, runQuery } = require('./lib/sqlite');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const testAccounts = [
  {
    email: 'admin@unionhub.com',
    password: 'AdminPassword123!',
    first_name: 'Admin',
    last_name: 'User',
    name: 'Admin User',
    class_name: 'Admin',
    department_code: null,
    biography: 'Administrator account',
    coins: 1000,
    credibility_score: 100
  },
  {
    email: 'student@unionhub.com',
    password: 'StudentPassword123!',
    first_name: 'John',
    last_name: 'Student',
    name: 'John Student',
    class_name: 'Sophomore',
    department_code: 'EDU',
    biography: 'Regular student account',
    coins: 500,
    credibility_score: 75
  },
  {
    email: 'demo@unionhub.com',
    password: 'DemoPassword123!',
    first_name: 'Demo',
    last_name: 'User',
    name: 'Demo User',
    class_name: 'Junior',
    department_code: 'MEDIA',
    biography: 'Demo account for testing',
    coins: 300,
    credibility_score: 60
  }
];

async function setupDatabase() {
  try {
    console.log('\n📦 Initializing SQLite database...\n');
    
    // Initialize database and create tables
    await initializeDatabase();
    const db = await getDatabase();
    
    console.log('\n🔐 Creating test accounts...\n');
    
    for (const account of testAccounts) {
      try {
        // Hash password
        const password_hash = await bcrypt.hash(account.password, 10);
        
        const id = uuidv4();
        const sql = `
          INSERT INTO profiles (
            id, email, password_hash, first_name, last_name, name, 
            class_name, department_code, biography, coins, credibility_score
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await runQuery(sql, [
          id,
          account.email,
          password_hash,
          account.first_name,
          account.last_name,
          account.name,
          account.class_name,
          account.department_code,
          account.biography,
          account.coins,
          account.credibility_score
        ]);
        
        console.log(`✅ Created: ${account.email}`);
        console.log(`   Password: ${account.password}\n`);
      } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.log(`⚠️  Already exists: ${account.email}\n`);
        } else {
          console.error(`❌ Error creating ${account.email}:`, err.message);
        }
      }
    }
    
    console.log('📋 Test Accounts Summary:\n');
    console.log('┌──────────────────────────────────────────────┐');
    console.log('│           LOGIN CREDENTIALS                  │');
    console.log('├──────────────────────────────────────────────┤');
    
    testAccounts.forEach(account => {
      console.log(`│ Email:    ${account.email.padEnd(37)} │`);
      console.log(`│ Password: ${account.password.padEnd(37)} │`);
      console.log('├──────────────────────────────────────────────┤');
    });
    
    console.log('│ Database: ./data/unionhub.db                │');
    console.log('│ Server: http://localhost:8787               │');
    console.log('│ Frontend: http://localhost:8080             │');
    console.log('└──────────────────────────────────────────────┘\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
