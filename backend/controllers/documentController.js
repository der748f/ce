const Document = require('../models/Document');

exports.getTeacherDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            'teacher.id': req.params.teacherId
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        const document = new Document({
            ...req.body,
            teacher: {
                id: req.params.teacherId,
                name: req.body.teacherName
            }
        });
        const savedDocument = await document.save();
        res.status(201).json(savedDocument);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        await Document.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
