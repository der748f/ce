const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lessons: [{ type: String }], // Array of lesson titles
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }], // List of teachers teaching this subject
}, { timestamps: false });

module.exports = mongoose.model('Subject', subjectSchema);
