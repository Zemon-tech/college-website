const Class = require('../models/Class');
const Update = require('../models/Update');
const Resource = require('../models/Resource');

exports.getClassDetails = async (req, res) => {
  try {
    console.log('Fetching class details for:', req.params.classId);

    const classData = await Class.findById(req.params.classId)
      .populate('classIncharge', 'name email')
      .populate('teachers', 'name email')
      .populate('students', 'name email enrollmentNumber')
      .select('name section branch year classIncharge teachers students')
      .lean();

    if (!classData) {
      console.log('Class not found');
      return res.status(404).json({ message: 'Class not found' });
    }

    // Debug log
    console.log('Class data before sending:', JSON.stringify(classData, null, 2));

    res.json(classData);
  } catch (error) {
    console.error('Error in getClassDetails:', error);
    res.status(500).json({ message: 'Error fetching class details' });
  }
};

exports.getUpdates = async (req, res) => {
  try {
    const updates = await Update.find({
      targetClass: req.user.crDetails.assignedClass
    })
    .populate('author', 'name email')
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
      author: req.user._id,
      authorRole: 'cr',
      targetClass: req.user.crDetails.assignedClass
    });
    await update.save();
    
    // Populate the author before sending response
    await update.populate('author', 'name email');
    
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: 'Error creating update' });
  }
};

exports.deleteUpdate = async (req, res) => {
  try {
    const update = await Update.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!update) {
      return res.status(404).json({ message: 'Update not found or unauthorized' });
    }

    await update.remove();
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting update' });
  }
};

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      uploadedBy: req.user.id,
      targetClass: req.user.crDetails.assignedClass
    }).sort('-timestamp');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

exports.uploadResource = async (req, res) => {
  try {
    // Handle file upload logic here
    const resource = new Resource({
      ...req.body,
      uploadedBy: req.user.id,
      targetClass: req.user.crDetails.assignedClass,
      fileUrl: req.file?.path // If using file upload
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading resource' });
  }
}; 