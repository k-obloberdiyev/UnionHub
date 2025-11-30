const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'evaluated'],
    default: 'pending'
  },
  coins: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  department_code: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  progress: {
    current: {
      type: Number,
      default: null
    },
    target: {
      type: Number,
      default: null
    },
    unit: {
      type: String,
      default: ''
    }
  },
  evaluation: {
    completed: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    },
    evaluated_at: {
      type: Date,
      default: null
    },
    evaluated_by: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Task', taskSchema);
