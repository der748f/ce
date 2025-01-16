const express = require('express');
const ExamTemplate = require('../models/ExamTemplate');
const router = express.Router();

// Get all templates for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const templates = await ExamTemplate.find({
            'teacher.id': req.params.teacherId
        }).sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error: error.message });
    }
});

// Create new template
router.post('/', async (req, res) => {
    try {
        const template = new ExamTemplate(req.body);
        await template.save();
        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ message: 'Error creating template', error: error.message });
    }
});

// Get template by ID
router.get('/:id', async (req, res) => {
    try {
        const template = await ExamTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error: error.message });
    }
});

// Get sample templates
router.get('/samples', async (req, res) => {
    try {
        // Sample exam templates
        const samples = [
            {
                title: "Mathematics Mid-Term",
                subject: { name: "Mathematics" },
                duration: 60,
                questions: [
                    {
                        type: "multiple-choice",
                        question: "Solve for x: 2x + 5 = 13",
                        points: 5,
                        options: ["x = 4", "x = 6", "x = 8", "x = 3"],
                        correctAnswer: "x = 4"
                    },
                    // Add more sample questions
                ]
            },
            // Add more sample templates
        ];
        res.json(samples);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching samples', error: error.message });
    }
});

module.exports = router;
