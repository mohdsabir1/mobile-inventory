const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Get all settings
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.find();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get settings by category
router.get('/category/:category', async (req, res) => {
    try {
        const settings = await Setting.find({ category: req.params.category });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create or update setting
router.post('/', async (req, res) => {
    try {
        const setting = await Setting.findOneAndUpdate(
            { key: req.body.key },
            {
                key: req.body.key,
                value: req.body.value,
                description: req.body.description,
                category: req.body.category
            },
            { new: true, upsert: true }
        );
        res.status(201).json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update setting
router.patch('/:id', async (req, res) => {
    try {
        const setting = await Setting.findById(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        if (req.body.value !== undefined) setting.value = req.body.value;
        if (req.body.description) setting.description = req.body.description;
        if (req.body.category) setting.category = req.body.category;

        const updatedSetting = await setting.save();
        res.json(updatedSetting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete setting
router.delete('/:id', async (req, res) => {
    try {
        const setting = await Setting.findById(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        await setting.deleteOne();
        res.json({ message: 'Setting deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
