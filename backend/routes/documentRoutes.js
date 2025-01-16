const express = require('express');
const Document = require('../models/Document');
const router = express.Router();

// Get all documents for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const documents = await Document.find({
            'teacher.id': req.params.teacherId
        }).sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
});

// Create new document
router.post('/', async (req, res) => {
    try {
        const document = new Document(req.body);
        await document.save();
        res.status(201).json(document);
    } catch (error) {
        res.status(400).json({ message: 'Error creating document', error: error.message });
    }
});

module.exports = router;
