const User = require('../models/User');
const Class = require('../models/Class');
const Update = require('../models/Update');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate({
        path: 'studentDetails.class',
        select: 'name section branch year'
      })
      .populate({
        path: 'crDetails.assignedClass',
        select: 'name section branch year'
      });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, classId, ...userData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with additional details for students
    const user = new User({
      email,
      password,
      role,
      ...userData,
      ...(role === 'student' && {
        studentDetails: {
          class: classId,
          enrollmentNumber: userData.enrollmentNumber
        }
      })
    });

    const savedUser = await user.save();

    // If it's a student, also add them to the class
    if (role === 'student' && classId) {
      await Class.findByIdAndUpdate(
        classId,
        { $addToSet: { students: savedUser._id } },
        { new: true }
      );
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message || 'Error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('cr', 'name email')
      .populate('teachers', 'name')
      .populate('students', 'name email enrollmentNumber');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

exports.createClass = async (req, res) => {
  try {
    const classData = req.body;
    
    // Generate name if not provided
    if (!classData.name) {
      classData.name = `${classData.branch.toUpperCase()} ${classData.course.toUpperCase()} ${classData.year}-${classData.section}`;
    }
    
    // Create the class
    const newClass = await Class.create(classData);
    
    // Populate the new class
    const populatedClass = await Class.findById(newClass._id)
      .populate('cr', 'name email')
      .populate('teachers', 'name')
      .populate('students', 'name email enrollmentNumber');

    res.status(201).json(populatedClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get the original class with populated CR
    const originalClass = await Class.findById(id)
      .populate('cr', 'name email')
      .populate('teachers', 'name')
      .populate('students', 'name email enrollmentNumber');

    if (!originalClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Store original CR for middleware
    originalClass._original = {
      cr: originalClass.cr?._id
    };

    // Update the class
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true,
        runValidators: true
      }
    ).populate('cr', 'name email')
      .populate('teachers', 'name')
      .populate('students', 'name email enrollmentNumber');

    // Handle CR changes
    if (originalClass.cr?._id?.toString() !== updates.cr) {
      // Remove class from old CR
      if (originalClass.cr) {
        await User.findByIdAndUpdate(originalClass.cr._id, {
          $unset: { 'crDetails.assignedClass': 1 }
        });
      }

      // Assign class to new CR
      if (updates.cr) {
        await User.findByIdAndUpdate(updates.cr, {
          'crDetails.assignedClass': id
        });
      }
    }

    res.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class' });
  }
};

exports.getAllUpdates = async (req, res) => {
  try {
    const updates = await Update.find()
      .populate('author', 'name')
      .sort('-timestamp');
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching updates' });
  }
};

exports.createUpdate = async (req, res) => {
  try {
    const update = new Update({
      ...req.body,
      author: req.user.id,
      authorRole: 'admin'
    });
    await update.save();
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: 'Error creating update' });
  }
};

exports.updateUpdate = async (req, res) => {
  try {
    const update = await Update.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }
    res.json(update);
  } catch (error) {
    res.status(500).json({ message: 'Error updating update' });
  }
};

exports.deleteUpdate = async (req, res) => {
  try {
    const update = await Update.findByIdAndDelete(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting update' });
  }
};

exports.getClassStudents = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId)
      .populate({
        path: 'students',
        select: 'name email enrollmentNumber studentDetails'
      });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData.students);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ message: error.message });
  }
}; 