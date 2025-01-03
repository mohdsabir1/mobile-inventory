const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Part = require('../models/Part');
const MobileModel = require('../models/MobileModel');
const mongoose = require('mongoose');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find({ active: true })
      .populate('model', 'name')
      .populate({
        path: 'items.part',
        select: 'name type price'
      })
      .sort({ createdAt: -1 });

    res.json({
      sales,
      summary: {
        totalSales: sales.length,
        totalAmount: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: sales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        )
      }
    });
  } catch (error) {
    console.error('Error in GET /sales:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get recent sales
router.get('/recent', async (req, res) => {
  try {
    const sales = await Sale.find({ active: true })
      .populate('model', 'name')
      .populate({
        path: 'items.part',
        select: 'name type price'
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      sales,
      summary: {
        totalSales: sales.length,
        totalAmount: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: sales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        )
      }
    });
  } catch (error) {
    console.error('Error in GET /sales/recent:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new sale
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { model, items } = req.body;

    console.log('Creating sale:', { model, items });

    // Validate model exists
    const modelExists = await MobileModel.findById(model);
    if (!modelExists) {
      throw new Error('Model not found');
    }

    // Validate and calculate total amount
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const part = await Part.findById(item.part);
      if (!part) {
        throw new Error(`Part ${item.part} not found`);
      }

      if (part.quantity < item.quantity) {
        throw new Error(`Insufficient quantity for part ${part.type}. Available: ${part.quantity}, Requested: ${item.quantity}`);
      }

      // Convert prices to numbers and compare with a small tolerance for floating-point errors
      const partPrice = Number(part.price);
      const itemPrice = Number(item.pricePerUnit);
      if (Math.abs(partPrice - itemPrice) > 0.01) {
        throw new Error(`Price mismatch for part ${part.type}. Expected: ${partPrice}, Got: ${itemPrice}`);
      }

      // Update part quantity
      part.quantity -= item.quantity;
      part.soldCount = (part.soldCount || 0) + item.quantity;
      await part.save({ session });

      totalAmount += item.quantity * itemPrice;
      validatedItems.push({
        part: item.part,
        quantity: item.quantity,
        pricePerUnit: itemPrice
      });
    }

    const sale = new Sale({
      model,
      items: validatedItems,
      totalAmount,
      active: true
    });

    await sale.save({ session });
    await session.commitTransaction();

    // Populate the sale data before sending response
    const populatedSale = await Sale.findById(sale._id)
      .populate('model', 'name')
      .populate({
        path: 'items.part',
        select: 'name type price'
      });

    console.log('Sale created:', populatedSale);

    res.status(201).json({
      sale: populatedSale,
      message: 'Sale created successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in POST /sales:', error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get sale by ID (must be after /recent route)
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('model', 'name')
      .populate({
        path: 'items.part',
        select: 'name type price'
      });

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales by date range
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const sales = await Sale.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('model')
      .populate({
        path: 'items.part',
        select: 'name type price'
      })
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update sale status
router.patch('/:id/status', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    if (req.body.status) {
      sale.status = req.body.status;
    }

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
