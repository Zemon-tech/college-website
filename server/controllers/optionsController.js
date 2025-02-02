const Options = require('../models/Options');

exports.getOptions = async (req, res) => {
  try {
    const options = await Options.find();
    const branches = options.filter(opt => opt.type === 'branch');
    const courses = options.filter(opt => opt.type === 'course');
    res.json({ branches, courses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching options' });
  }
};

exports.addOption = async (req, res) => {
  try {
    const { type, value } = req.body;
    const label = value.toUpperCase();
    
    const option = await Options.create({
      type,
      value: value.toLowerCase(),
      label
    });
    
    res.status(201).json(option);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This option already exists' });
    }
    res.status(500).json({ message: 'Error adding option' });
  }
}; 