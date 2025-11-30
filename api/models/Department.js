const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  members: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Department', departmentSchema);
