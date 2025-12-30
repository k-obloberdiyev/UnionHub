// Create test accounts directly in the database
const { connectToDatabase } = require('./lib/mongodb');
const { ProfileModel } = require('./models/models');
const bcrypt = require('bcryptjs');

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

async function createTestAccounts() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('\n🔐 Creating test accounts...\n');
    
    for (const account of testAccounts) {
      try {
        // Hash password
        const password_hash = await bcrypt.hash(account.password, 10);
        
        const accountData = {
          ...account,
          password_hash,
          created_at: new Date()
        };
        
        // Remove plain password
        delete accountData.password;
        
        const result = await ProfileModel.create(db, accountData);
        
        console.log(`✅ Created: ${account.email}`);
        console.log(`   Password: ${account.password}\n`);
      } catch (err) {
        if (err.message.includes('duplicate key')) {
          console.log(`⚠️  Already exists: ${account.email}\n`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n📋 Test Accounts Summary:\n');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│         LOGIN CREDENTIALS               │');
    console.log('├─────────────────────────────────────────┤');
    
    testAccounts.forEach(account => {
      console.log(`│ Email:    ${account.email.padEnd(31)} │`);
      console.log(`│ Password: ${account.password.padEnd(31)} │`);
      console.log('├─────────────────────────────────────────┤');
    });
    
    console.log('│ Server: http://localhost:8787           │');
    console.log('│ Frontend: http://localhost:8080         │');
    console.log('└─────────────────────────────────────────┘\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test accounts:', error.message);
    process.exit(1);
  }
}

createTestAccounts();
