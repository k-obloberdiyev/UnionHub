const Task = require('../models/Task');

const taskService = {
  // Get all tasks
  getAllTasks: async () => {
    return await Task.find({}).sort({ created_at: -1 });
  },

  // Get task by ID
  getTaskById: async (id) => {
    return await Task.findOne({ id });
  },

  // Create new task
  createTask: async (taskData) => {
    const task = new Task(taskData);
    return await task.save();
  },

  // Update task
  updateTask: async (id, updates) => {
    return await Task.findOneAndUpdate(
      { id },
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );
  },

  // Delete task
  deleteTask: async (id) => {
    return await Task.findOneAndDelete({ id });
  },

  // Get tasks by department
  getTasksByDepartment: async (departmentCode) => {
    return await Task.find({ department_code: departmentCode }).sort({ created_at: -1 });
  },

  // Get tasks by status
  getTasksByStatus: async (status) => {
    return await Task.find({ status }).sort({ created_at: -1 });
  }
};

module.exports = taskService;
