const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const User = require('../models/User');
const Class = require('../models/Class');
const optionsController = require('../controllers/optionsController');

// User management routes
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.post('/users', protect, authorize('admin'), adminController.createUser);
router.put('/users/:id', protect, authorize('admin'), adminController.updateUser);
router.delete('/users/:id', protect, authorize('admin'), adminController.deleteUser);

// Class management routes
router.get('/classes', protect, authorize('admin'), adminController.getAllClasses);
router.post('/classes', protect, authorize('admin'), adminController.createClass);
router.put('/classes/:id', protect, authorize('admin'), adminController.updateClass);
router.delete('/classes/:id', protect, authorize('admin'), adminController.deleteClass);

// Update management routes
router.get('/updates', protect, authorize('admin'), adminController.getAllUpdates);
router.post('/updates', protect, authorize('admin'), adminController.createUpdate);
router.put('/updates/:id', protect, authorize('admin'), adminController.updateUpdate);
router.delete('/updates/:id', protect, authorize('admin'), adminController.deleteUpdate);

// Create a specific route for adding students
router.post('/users/student', async (req, res) => {
  try {
    const { name, email, password, enrollmentNumber, classId } = req.body;
    
    // Create the student user
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      enrollmentNumber,
      studentDetails: {
        enrollmentNumber,
        class: classId
      }
    });

    // Add student to the class
    await Class.findByIdAndUpdate(
      classId,
      { $push: { students: student._id } },
      { new: true }
    );

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get students of a class
router.get('/classes/:classId/students', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId)
      .populate({
        path: 'students',
        select: 'name email enrollmentNumber studentDetails',
        populate: {
          path: 'studentDetails.class',
          select: 'name section branch year'
        }
      });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Transform the data to include all necessary fields
    const students = classData.students.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      enrollmentNumber: student.studentDetails?.enrollmentNumber || student.enrollmentNumber,
      class: student.studentDetails?.class
    }));

    res.json(students);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add student to class
router.post('/classes/:classId/students', async (req, res) => {
  try {
    const { studentId } = req.body;
    const classId = req.params.classId;

    // Update class
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: studentId } }, // Use addToSet to prevent duplicates
      { new: true }
    );

    // Update student
    await User.findByIdAndUpdate(
      studentId,
      { 
        'studentDetails.class': classId 
      },
      { new: true }
    );

    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add this route
router.get('/classes/:classId/students', protect, authorize('admin'), adminController.getClassStudents);

// Add these routes to your admin routes
router.get('/options', protect, authorize('admin'), optionsController.getOptions);
router.post('/options', protect, authorize('admin'), optionsController.addOption);

// Get unassigned teachers
router.get('/users/unassigned-teachers', async (req, res) => {
  try {
    const unassignedTeachers = await User.find({
      role: 'teacher',
      'teacherDetails.assignedAsIncharge': { $exists: false }
    });
    res.json(unassignedTeachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unassigned CRs
router.get('/users/unassigned-crs', async (req, res) => {
  try {
    const unassignedCRs = await User.find({
      role: 'student',
      'crDetails.assignedClass': { $exists: false }
    });
    res.json(unassignedCRs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 