const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

router.get('/classes', protect, authorize('teacher'), teacherController.getAssignedClasses);
router.get('/updates/:classId', protect, authorize('teacher'), teacherController.getUpdates);
router.post('/updates', protect, authorize('teacher'), teacherController.createUpdate);
router.get('/resources/:classId', protect, authorize('teacher'), teacherController.getResources);
router.post('/resources', protect, authorize('teacher'), teacherController.uploadResource);

module.exports = router; 