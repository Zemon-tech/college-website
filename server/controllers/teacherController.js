const Class = require('../models/Class');
const Update = require('../models/Update');
const Resource = require('../models/Resource');

exports.getAssignedClasses = async (req, res) => {
  try {
    const classes = await Class.find({
      teachers: req.user.id
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

exports.getUpdates = async (req, res) => {
  try {
    const updates = await Update.find({
      author: req.user.id,
      targetClass: req.params.classId
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
      authorRole: 'teacher'
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
      targetClass: req.params.classId
    }).sort('-timestamp');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

exports.uploadResource = async (req, res) => {
  try {
    // Handle file upload logic here (using multer or other file upload middleware)
    const resource = new Resource({
      ...req.body,
      uploadedBy: req.user.id,
      fileUrl: req.file?.path // If using file upload
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading resource' });
  }
}; 