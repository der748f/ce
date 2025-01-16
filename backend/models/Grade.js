const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        name: { type: String, required: true }
    },
    subject: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
        name: { type: String, required: true }
    },
    examTitle: { type: String, required: true },
    score: { type: Number, required: true },
    feedback: String,
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick lookups
gradeSchema.index({ 'student.id': 1 });
gradeSchema.index({ 'subject.id': 1 });

module.exports = mongoose.model('Grade', gradeSchema);
