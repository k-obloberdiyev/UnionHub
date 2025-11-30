const Department = require('../models/Department');

const departmentService = {
  // Get all departments
  getAllDepartments: async () => {
    return await Department.find({}).sort({ id: 1 });
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    return await Department.findOne({ id });
  },

  // Create department
  createDepartment: async (departmentData) => {
    const department = new Department(departmentData);
    return await department.save();
  },

  // Update department
  updateDepartment: async (id, updates) => {
    return await Department.findOneAndUpdate(
      { id },
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );
  },

  // Delete department
  deleteDepartment: async (id) => {
    return await Department.findOneAndDelete({ id });
  }
};

module.exports = departmentService;
