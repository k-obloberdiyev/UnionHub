const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    default: null
  },
  last_name: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  department_code: {
    type: Number,
    default: null
  },
  class_name: {
    type: String,
    default: null
  },
  biography: {
    type: String,
    default: ''
  },
  avatar_url: {
    type: String,
    default: null
  },
  coins: {
    type: Number,
    default: 0
  },
  credibility_score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Profile', profileSchema);
