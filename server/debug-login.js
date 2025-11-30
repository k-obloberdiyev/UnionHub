require('dotenv').config();
const connectDB = require('./config/database');
const profileService = require('./services/profileService');
const bcrypt = require('bcryptjs');

const debugLogin = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if your profile exists
    const email = 'kamolbekobloberdiyev1@gmail.com';
    console.log(`🔍 Looking for profile: ${email}`);
    
    const profile = await profileService.getProfileByEmail(email);
    
    if (profile) {
      console.log('✅ Profile found:', {
        id: profile.id,
        email: profile.email,
        hasPassword: !!profile.password_hash
      });
    } else {
      console.log('❌ Profile not found!');
      
      // Create the profile if it doesn't exist
      console.log('🔧 Creating admin profile...');
      const hash = bcrypt.hashSync('admin123', 10);
      const newProfile = await profileService.createProfile({
        id: require('crypto').randomUUID(),
        email: email,
        password_hash: hash,
        first_name: 'Kamolbek',
        last_name: 'Obloberdiyev',
        name: 'Kamolbek Obloberdiyev',
        department_code: null,
        class_name: null,
        biography: 'System Administrator',
        avatar_url: null,
        coins: 1000,
        credibility_score: 100
      });
      
      console.log('✅ Admin profile created:', newProfile.email);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    process.exit(0);
  }
};

debugLogin();
