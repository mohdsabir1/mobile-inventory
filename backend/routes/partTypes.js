const express = require('express');
const router = express.Router();
const PartType = require('../models/PartType');

// Get all part types
router.get('/', async (req, res) => {
  try {
    const partTypes = await PartType.find();
    const formattedTypes = partTypes.reduce((acc, item) => {
      acc[item.category] = item.types;
      return acc;
    }, {});
    res.json(formattedTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new category
router.post('/category', async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new PartType({
      category: name,
      types: []
    });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add new type to category
router.post('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { type } = req.body;
    
    const partType = await PartType.findOne({ category });
    if (!partType) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (partType.types.includes(type)) {
      return res.status(400).json({ message: 'Type already exists in this category' });
    }

    partType.types.push(type);
    await partType.save();
    res.json(partType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category
router.delete('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    await PartType.findOneAndDelete({ category });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete type from category
router.delete('/:category/:type', async (req, res) => {
  try {
    const { category, type } = req.params;
    const partType = await PartType.findOne({ category });
    if (!partType) {
      return res.status(404).json({ message: 'Category not found' });
    }

    partType.types = partType.types.filter(t => t !== type);
    await partType.save();
    res.json(partType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category name
router.put('/category/:oldCategory', async (req, res) => {
  try {
    const { oldCategory } = req.params;
    const { name } = req.body;
    const partType = await PartType.findOne({ category: oldCategory });
    if (!partType) {
      return res.status(404).json({ message: 'Category not found' });
    }

    partType.category = name;
    await partType.save();
    res.json(partType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update type in category
router.put('/:category/:oldType', async (req, res) => {
  try {
    const { category, oldType } = req.params;
    const { type } = req.body;
    
    const partType = await PartType.findOne({ 
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });
    if (!partType) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const typeIndex = partType.types.findIndex(t => t.toLowerCase() === oldType.toLowerCase());
    if (typeIndex === -1) {
      return res.status(404).json({ message: 'Type not found' });
    }

    // Check if new type already exists
    if (partType.types.some(t => t.toLowerCase() === type.toLowerCase() && t.toLowerCase() !== oldType.toLowerCase())) {
      return res.status(400).json({ message: 'Type already exists in this category' });
    }

    partType.types[typeIndex] = type;
    await partType.save();
    res.json(partType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
