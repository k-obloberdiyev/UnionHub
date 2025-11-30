require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { connectToDatabase } = require('./lib/mongodb');
const { ProfileModel } = require('./models/models');
const fs = require('fs');
const path = require('path');

async function migrateUsers() {
  try {
    console.log('Starting user migration...');
    
    // Read local data file
    const dataPath = path.join(__dirname, '../server/data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Migrate each user
    for (const profile of data.profiles) {
      // Check if user already exists
      const existingUser = await ProfileModel.findByEmail(db, profile.email);
      
      if (!existingUser) {
        // Create user in MongoDB
        await ProfileModel.create(db, {
          email: profile.email,
          name: profile.name,
          first_name: profile.first_name,
          last_name: profile.last_name,
          department_code: profile.department_code,
          class_name: profile.class_name,
          biography: profile.biography,
          avatar_url: profile.avatar_url,
          coins: profile.coins,
          credibility_score: profile.credibility_score,
          password: profile.password
        });
        
        console.log(`✅ Migrated user: ${profile.email}`);
      } else {
        console.log(`⏭️  User already exists: ${profile.email}`);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify migration
    const allUsers = await ProfileModel.findAll(db);
    console.log(`📊 Total users in MongoDB: ${allUsers.length}`);
    
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateUsers();
