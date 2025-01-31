const Class = require('../models/Class');
const Update = require('../models/Update');
const Resource = require('../models/Resource');

exports.getClassDetails = async (req, res) => {
  try {
    const classDetails = await Class.findById(req.params.classId)
      .populate('teachers', 'name')
      .populate('students', 'name');
    res.json(classDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class details' });
  }
};

exports.getUpdates = async (req, res) => {
  try {
    const updates = await Update.find({
      author: req.user.id,
      targetClass: req.user.crDetails.assignedClass
    }).sort('-timestamp');
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
      authorRole: 'cr',
      targetClass: req.user.crDetails.assignedClass
    });
    await update.save();
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: 'Error creating update' });
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