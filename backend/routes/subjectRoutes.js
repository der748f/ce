const express = require('express');
const Subject = require('../models/Subject');

const router = express.Router();

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a single subject
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ error: 'Subject not found' });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new subject
router.post('/', async (req, res) => {
    const { name, lessons } = req.body;
    try {
        const subject = new Subject({ name, lessons });
        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Update a subject
router.put('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!subject) return res.status(404).json({ error: 'Subject not found' });
        res.json(subject);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Delete a subject
router.delete('/:id', async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) return res.status(404).json({ error: 'Subject not found' });
        res.json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
