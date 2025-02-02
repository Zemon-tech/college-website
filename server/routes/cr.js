const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const crController = require('../controllers/crController');
const Class = require('../models/Class');

// Get CR's class details including students
router.get('/class/:classId', protect, authorize('cr'), async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId)
      .populate('classIncharge', 'name email')
      .populate('teachers', 'name email')
      .populate({
        path: 'students',
        select: 'name email studentDetails',
        populate: {
          path: 'studentDetails.class',
          select: 'name section branch year'
        }
      })
      .select('name section branch year schedule classIncharge teachers');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Debug log
    console.log('Class data with incharge:', classData);

    res.json(classData);
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({ message: 'Error fetching class details' });
  }
});

router.get('/updates', protect, authorize('cr'), crController.getUpdates);
router.post('/updates', protect, authorize('cr'), crController.createUpdate);
router.get('/resources', protect, authorize('cr'), crController.getResources);
router.post('/resources', protect, authorize('cr'), crController.uploadResource);
router.delete('/updates/:id', protect, authorize('cr'), crController.deleteUpdate);

module.exports = router; 