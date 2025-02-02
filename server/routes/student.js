const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Use the controller functions
router.get('/schedule', protect, authorize('student'), studentController.getSchedule);
router.get('/schedule/:classId', protect, authorize('student'), studentController.getSchedule);
router.get('/updates', protect, authorize('student'), studentController.getUpdates);
router.get('/class/:classId', protect, authorize('student'), studentController.getClassDetails);

module.exports = router; 