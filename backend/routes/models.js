const express = require('express');
const router = express.Router();
const MobileModel = require('../models/MobileModel');
const Part = require('../models/Part');
const mongoose = require('mongoose');

// Format name to uppercase
const formatName = (name) => {
  return name.trim().toUpperCase();
};

// Get all models
router.get('/', async (req, res) => {
  try {
    const models = await MobileModel.find({ active: true })
      .populate('category', 'name');
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get model by ID
router.get('/:id', async (req, res) => {
  try {
    const model = await MobileModel.findOne({ 
      _id: req.params.id,
      active: true 
    }).populate('category', 'name');
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get models by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const models = await MobileModel.find({ 
      category: req.params.categoryId,
      active: true 
    }).populate('category', 'name');
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new model
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formattedName = formatName(req.body.name);

    // Check for existing model with same name in the same category
    const existingModel = await MobileModel.findOne({
      name: { $regex: new RegExp('^' + formattedName + '$', 'i') },
      category: req.body.category,
      active: true
    });

    if (existingModel) {
      return res.status(400).json({ message: 'Model already exists in this category' });
    }

    // Check for inactive (deleted) model
    const inactiveModel = await MobileModel.findOne({
      name: { $regex: new RegExp('^' + formattedName + '$', 'i') },
      category: req.body.category,
      active: false
    });

    let model;
    if (inactiveModel) {
      // Reactivate model
      inactiveModel.active = true;
      inactiveModel.name = formattedName; // Update with properly formatted name
      model = await inactiveModel.save({ session });
    } else {
      // Create new model
      model = new MobileModel({
        name: formattedName,
        category: req.body.category,
        description: req.body.description,
        active: true
      });
      model = await model.save({ session });
    }

    await session.commitTransaction();
    
    // Fetch populated model
    const populatedModel = await MobileModel.findById(model._id)
      .populate('category', 'name');
    
    res.status(201).json(populatedModel);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Update model
router.patch('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const model = await MobileModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (req.body.name) {
      const formattedName = formatName(req.body.name);

      // Check for existing model with same name in the same category
      const existingModel = await MobileModel.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp('^' + formattedName + '$', 'i') },
        category: model.category,
        active: true
      });

      if (existingModel) {
        return res.status(400).json({ message: 'Model name already exists in this category' });
      }

      model.name = formattedName;
    }

    if (req.body.description) model.description = req.body.description;
    if (req.body.category) model.category = req.body.category;
    if (req.body.active !== undefined) model.active = req.body.active;

    await model.save({ session });
    await session.commitTransaction();

    // Fetch populated model
    const populatedModel = await MobileModel.findById(model._id)
      .populate('category', 'name');

    res.json(populatedModel);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Delete model and its parts
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const model = await MobileModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    // Soft delete all parts associated with this model
    await Part.updateMany(
      { model: req.params.id },
      { active: false },
      { session }
    );

    // Soft delete the model
    model.active = false;
    await model.save({ session });

    await session.commitTransaction();
    res.json({ 
      message: 'Model and all associated parts have been deleted',
      model: model.name
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
