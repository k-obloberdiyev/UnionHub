const Profile = require('../models/Profile');

const profileService = {
  // Get profile by email
  getProfileByEmail: async (email) => {
    return await Profile.findOne({ email: email.toLowerCase() });
  },

  // Get profile by ID
  getProfileById: async (id) => {
    return await Profile.findOne({ id });
  },

  // Get all profiles
  getAllProfiles: async () => {
    return await Profile.find({}).sort({ created_at: -1 });
  },

  // Create new profile
  createProfile: async (profileData) => {
    const profile = new Profile(profileData);
    return await profile.save();
  },

  // Update profile
  updateProfile: async (id, updates) => {
    return await Profile.findOneAndUpdate(
      { id },
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );
  },

  // Delete profile
  deleteProfile: async (id) => {
    return await Profile.findOneAndDelete({ id });
  }
};

module.exports = profileService;
