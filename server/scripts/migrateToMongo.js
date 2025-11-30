const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('../config/database');
const Profile = require('../models/Profile');
const Task = require('../models/Task');
const Department = require('../models/Department');

const migrateToMongo = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Read JSON data
    const dbPath = path.join(__dirname, '../data/unionhub.json');
    let jsonData = { profiles: [], tasks: [], departments: [] };
    
    try {
      const raw = fs.readFileSync(dbPath, 'utf8');
      if (raw.trim()) {
        jsonData = JSON.parse(raw);
      }
    } catch (error) {
      console.log('No existing JSON data found, starting fresh');
    }

    // Migrate Departments
    console.log('Migrating departments...');
    const departmentsData = [
      { id: 1, name: "Education", emoji: "📚", description: "Academic workshops and tutoring programs", members: 28 },
      { id: 2, name: "Social Events", emoji: "🎉", description: "Student parties and social gatherings", members: 35 },
      { id: 3, name: "International Relations", emoji: "🌍", description: "Cultural exchange and international student support", members: 22 },
      { id: 4, name: "Media", emoji: "📸", description: "Content creation and social media management", members: 18 },
      { id: 5, name: "Sports", emoji: "⚽", description: "Athletic events and fitness activities", members: 42 },
      { id: 6, name: "Social Engagement", emoji: "🤝", description: "Community service and volunteer programs", members: 31 },
      { id: 7, name: "IT", emoji: "💻", description: "Tech support and digital infrastructure", members: 15 }
    ];

    for (const dept of departmentsData) {
      try {
        await Department.findOneAndUpdate(
          { id: dept.id },
          dept,
          { upsert: true, new: true }
        );
        console.log(`✅ Migrated department: ${dept.name}`);
      } catch (error) {
        console.log(`⚠️  Error migrating department ${dept.name}:`, error.message);
      }
    }
    console.log('Departments migration completed');

    // Migrate Profiles
    console.log('Migrating profiles...');
    if (jsonData.profiles && jsonData.profiles.length > 0) {
      for (const profile of jsonData.profiles) {
        try {
          await Profile.findOneAndUpdate(
            { id: profile.id },
            profile,
            { upsert: true, new: true }
          );
          console.log(`✅ Migrated profile: ${profile.email}`);
        } catch (error) {
          console.log(`⚠️  Error migrating profile ${profile.email}:`, error.message);
        }
      }
      console.log('Profiles migration completed');
    }

    // Migrate Tasks
    console.log('Migrating tasks...');
    if (jsonData.tasks && jsonData.tasks.length > 0) {
      for (const task of jsonData.tasks) {
        try {
          // Convert deadline string to Date if needed
          if (typeof task.deadline === 'string') {
            task.deadline = new Date(task.deadline);
          }
          
          await Task.findOneAndUpdate(
            { id: task.id },
            task,
            { upsert: true, new: true }
          );
          console.log(`✅ Migrated task: ${task.title}`);
        } catch (error) {
          console.log(`⚠️  Error migrating task ${task.title}:`, error.message);
        }
      }
      console.log('Tasks migration completed');
    }

    console.log('✅ Migration completed successfully!');
    
    // Show statistics
    const profileCount = await Profile.countDocuments();
    const taskCount = await Task.countDocuments();
    const deptCount = await Department.countDocuments();
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`- Profiles: ${profileCount}`);
    console.log(`- Tasks: ${taskCount}`);
    console.log(`- Departments: ${deptCount}`);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run migration
migrateToMongo();
