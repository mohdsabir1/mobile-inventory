const express = require('express');
const router = express.Router();
const Part = require('../models/Part');
const MobileModel = require('../models/MobileModel');
const mongoose = require('mongoose');

// Get all parts with model details
router.get('/', async (req, res) => {
  try {
    const parts = await Part.find({ active: true })
      .populate({
        path: 'model',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .populate('category', 'name')
      .sort({ quantity: 1 }); // Sort by quantity ascending to prioritize low stock
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock parts
router.get('/low-stock/:threshold', async (req, res) => {
  try {
    const threshold = parseInt(req.params.threshold) || 5;
    const parts = await Part.find({ 
      active: true,
      quantity: { $lte: threshold }
    })
      .populate({
        path: 'model',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .populate('category', 'name')
      .sort({ quantity: 1 });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get parts by model
router.get('/model/:modelId', async (req, res) => {
  try {
    const model = await MobileModel.findById(req.params.modelId)
      .populate('category', 'name');
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    const parts = await Part.find({ 
      model: req.params.modelId,
      active: true 
    })
      .populate({
        path: 'model',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .populate('category', 'name');

    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new part
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const model = await MobileModel.findById(req.body.model)
      .populate('category', 'name');
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    // Check for existing part
    const existingPart = await Part.findOne({
      name: req.body.name,
      type: req.body.type,
      model: req.body.model,
      active: true
    });

    if (existingPart) {
      return res.status(400).json({ message: 'Part already exists for this model' });
    }

    // Check for inactive (deleted) part
    const inactivePart = await Part.findOne({
      name: req.body.name,
      type: req.body.type,
      model: req.body.model,
      active: false
    });

    let part;
    if (inactivePart) {
      // Reactivate the part with new details
      inactivePart.active = true;
      inactivePart.price = req.body.price;
      inactivePart.quantity = req.body.quantity || 0;
      inactivePart.threshold = req.body.threshold || 5;
      part = await inactivePart.save({ session });
    } else {
      // Create new part
      part = new Part({
        name: req.body.name,
        type: req.body.type,
        model: req.body.model,
        category: model.category._id, // Get category from model
        price: req.body.price,
        quantity: req.body.quantity || 0,
        threshold: req.body.threshold || 5
      });
      part = await part.save({ session });
    }

    await session.commitTransaction();

    // Fetch populated part
    const populatedPart = await Part.findById(part._id)
      .populate({
        path: 'model',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .populate('category', 'name');

    res.status(201).json(populatedPart);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Update part
router.patch('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    if (req.body.name) part.name = req.body.name;
    if (req.body.type) part.type = req.body.type;
    if (req.body.model) {
      const model = await MobileModel.findById(req.body.model)
        .populate('category', 'name');
      if (!model) {
        return res.status(404).json({ message: 'Model not found' });
      }
      part.model = req.body.model;
      part.category = model.category._id;
    }
    if (req.body.price !== undefined) part.price = req.body.price;
    if (req.body.quantity !== undefined) part.quantity = req.body.quantity;
    if (req.body.threshold !== undefined) part.threshold = req.body.threshold;

    await part.save({ session });
    await session.commitTransaction();

    // Fetch populated part
    const populatedPart = await Part.findById(part._id)
      .populate({
        path: 'model',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .populate('category', 'name');

    res.json(populatedPart);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Delete part (soft delete)
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    part.active = false;
    await part.save({ session });
    await session.commitTransaction();

    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
