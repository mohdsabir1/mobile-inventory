const express = require('express');
const router = express.Router();
const MobileCategory = require('../models/MobileCategory');
const MobileModel = require('../models/MobileModel');
const Part = require('../models/Part');
const mongoose = require('mongoose');

// Format name to uppercase
const formatName = (name) => {
  return name.trim().toUpperCase();
};

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await MobileCategory.find({ active: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new category
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formattedName = formatName(req.body.name);

    // Check for existing category with same name (case insensitive)
    const existingCategory = await MobileCategory.findOne({
      name: { $regex: new RegExp('^' + formattedName + '$', 'i') },
      active: true
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Check for inactive (deleted) category
    const inactiveCategory = await MobileCategory.findOne({
      name: { $regex: new RegExp('^' + formattedName + '$', 'i') },
      active: false
    });

    let category;
    if (inactiveCategory) {
      // Reactivate category
      inactiveCategory.active = true;
      inactiveCategory.name = formattedName; // Update with properly formatted name
      category = await inactiveCategory.save({ session });
    } else {
      // Create new category
      category = new MobileCategory({
        name: formattedName,
        active: true
      });
      category = await category.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json(category);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Delete category and associated models/parts
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await MobileCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Soft delete category
    category.active = false;
    await category.save({ session });

    // Soft delete all models in this category
    const models = await MobileModel.find({ category: req.params.id, active: true });
    const modelIds = models.map(model => model._id);

    await MobileModel.updateMany(
      { _id: { $in: modelIds } },
      { active: false },
      { session }
    );

    // Soft delete all parts associated with these models
    await Part.updateMany(
      { model: { $in: modelIds }, active: true },
      { active: false },
      { session }
    );

    await session.commitTransaction();

    res.json({
      message: 'Category and associated items deleted',
      deletedModels: models.length,
      affectedParts: await Part.countDocuments({ model: { $in: modelIds } })
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Update category
router.patch('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await MobileCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (req.body.name) {
      const formattedName = formatName(req.body.name);

      // Check for existing category with same name
      const existingCategory = await MobileCategory.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp('^' + formattedName + '$', 'i') },
        active: true
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }

      category.name = formattedName;
    }

    await category.save({ session });
    await session.commitTransaction();
    res.json(category);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await MobileCategory.findById(req.params.id);
    if (!category || !category.active) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
