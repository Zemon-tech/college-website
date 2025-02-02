const Class = require('../models/Class');
const Update = require('../models/Update');
const Resource = require('../models/Resource');
const User = require('../models/User');

exports.getSchedule = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate('studentDetails.class');

    if (!student.studentDetails?.class) {
      return res.status(404).json({ message: 'No class assigned' });
    }

    const classData = await Class.findById(student.studentDetails.class._id)
      .populate('schedule.periods.teacher', 'name');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData.schedule || []);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Error fetching schedule' });
  }
};

exports.getUpdates = async (req, res) => {
  try {
    const updates = await Update.find({
      $or: [
        { isGlobal: true },
        { targetClass: req.user.studentDetails?.class }
      ]
    })
    .sort('-timestamp')
    .populate('author', 'name');
    
    res.json(updates);
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ message: 'Error fetching updates' });
  }
};

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      targetClass: req.user.studentDetails.class
    })
    .populate('uploadedBy', 'name')
    .sort('-timestamp');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

exports.getClassDetails = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId)
      .populate('classIncharge', 'name email')
      .populate('teachers', 'name email')
      .select('name section branch year classIncharge teachers');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({ message: 'Error fetching class details' });
  }
}; 