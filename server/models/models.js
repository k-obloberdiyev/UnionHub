const { isValidObjectId, createObjectId } = require('../lib/mongodb');

class ProfileModel {
  static async collection(db) {
    return db.collection('profiles');
  }

  static async findAll(db) {
    const collection = await this.collection(db);
    const profiles = await collection.find({}).toArray();
    
    // Convert ObjectId to string and remove password
    return profiles.map(profile => ({
      ...profile,
      id: profile._id.toString(),
      _id: undefined,
      password: undefined // Never return password
    }));
  }

  static async findById(db, id) {
    if (!isValidObjectId(id)) return null;
    
    const collection = await this.collection(db);
    const profile = await collection.findOne({ _id: createObjectId(id) });
    
    if (!profile) return null;
    
    // Convert ObjectId to string and remove password
    const { _id, password, ...profileData } = profile;
    return {
      ...profileData,
      id: _id.toString()
    };
  }

  static async findByEmail(db, email) {
    const collection = await this.collection(db);
    const profile = await collection.findOne({ email: email.toLowerCase() });
    return profile;
  }

  static async create(db, profileData) {
    const collection = await this.collection(db);
    const newProfile = {
      ...profileData,
      email: profileData.email.toLowerCase(),
      coins: profileData.coins || 0,
      credibility_score: profileData.credibility_score || 100,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(newProfile);
    
    // Return created profile without password
    const { password, _id, ...createdProfile } = newProfile;
    return {
      ...createdProfile,
      id: result.insertedId.toString()
    };
  }

  static async update(db, id, updateData) {
    if (!isValidObjectId(id)) return null;
    
    const collection = await this.collection(db);
    const updateDoc = {
      ...updateData,
      updated_at: new Date()
    };

    const result = await collection.updateOne(
      { _id: createObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) return null;

    // Return updated profile
    return await this.findById(db, id);
  }

  static async delete(db, id) {
    if (!isValidObjectId(id)) return false;
    
    const collection = await this.collection(db);
    const result = await collection.deleteOne({ _id: createObjectId(id) });
    return result.deletedCount > 0;
  }
}

class TaskModel {
  static async collection(db) {
    return db.collection('tasks');
  }

  static async findAll(db) {
    const collection = await this.collection(db);
    const tasks = await collection.find({}).sort({ created_at: -1 }).toArray();
    
    // Convert ObjectId to string
    return tasks.map(task => ({
      ...task,
      id: task._id.toString(),
      _id: undefined
    }));
  }

  static async findById(db, id) {
    if (!isValidObjectId(id)) return null;
    
    const collection = await this.collection(db);
    const task = await collection.findOne({ _id: createObjectId(id) });
    
    if (!task) return null;
    
    // Convert ObjectId to string
    const { _id, ...taskData } = task;
    return {
      ...taskData,
      id: _id.toString()
    };
  }

  static async create(db, taskData) {
    const collection = await this.collection(db);
    const newTask = {
      ...taskData,
      status: taskData.status || 'pending',
      coins: taskData.coins || 0,
      progress: taskData.progress || { current: 0, target: 100, unit: '%' },
      evaluation: taskData.evaluation || { completed: false, score: null, feedback: '' },
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(newTask);
    
    // Return created task
    const { _id, ...createdTask } = newTask;
    return {
      ...createdTask,
      id: result.insertedId.toString()
    };
  }

  static async update(db, id, updateData) {
    if (!isValidObjectId(id)) return null;
    
    const collection = await this.collection(db);
    const updateDoc = {
      ...updateData,
      updated_at: new Date()
    };

    const result = await collection.updateOne(
      { _id: createObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) return null;

    // Return updated task
    return await this.findById(db, id);
  }

  static async delete(db, id) {
    if (!isValidObjectId(id)) return false;
    
    const collection = await this.collection(db);
    const result = await collection.deleteOne({ _id: createObjectId(id) });
    return result.deletedCount > 0;
  }
}

module.exports = {
  ProfileModel,
  TaskModel
};
