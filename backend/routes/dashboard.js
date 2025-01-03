const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Part = require('../models/Part');

// Get dashboard statistics
router.get('/', async (req, res) => {
    try {
        // Get total sales for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaySales = await Sale.find({
            createdAt: { $gte: today },
            status: 'completed'
        });

        // Calculate today's revenue
        const todayRevenue = todaySales.reduce((total, sale) => total + sale.totalAmount, 0);

        // Get recent sales
        const recentSales = await Sale.find({ status: 'completed' })
            .populate({
                path: 'items.part',
                populate: {
                    path: 'model category',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get low stock parts
        const lowStockParts = await Part.find({
            active: true,
            $expr: { $lte: ['$quantity', '$threshold'] }
        })
        .populate('model', 'name')
        .populate('category', 'name')
        .sort({ quantity: 1 });

        // Get total inventory value
        const parts = await Part.find({ active: true });
        const totalInventoryValue = parts.reduce((total, part) => {
            return total + (part.price * part.quantity);
        }, 0);

        res.json({
            todaySales: todaySales.length,
            todayRevenue,
            recentSales,
            lowStockParts,
            totalInventoryValue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sales statistics by time period
router.get('/sales-stats', async (req, res) => {
    try {
        const { period } = req.query; // day, week, month, year
        const endDate = new Date();
        const startDate = new Date();

        switch(period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default: // day
                startDate.setHours(0, 0, 0, 0);
        }

        const sales = await Sale.find({
            createdAt: { 
                $gte: startDate,
                $lte: endDate
            },
            status: 'completed'
        });

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0);

        res.json({
            period,
            totalSales,
            totalRevenue,
            startDate,
            endDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
