const mongoose = require('mongoose');

const examTemplateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        name: { type: String }
    },
    description: { type: String },
    duration: { type: Number, required: true },
    isTemplate: { type: Boolean, default: false }, // To distinguish between templates and actual exams
    questions: [{
        type: { type: String, enum: ['multiple-choice', 'essay', 'true-false'], required: true },
        question: { type: String, required: true },
        points: { type: Number, required: true },
        options: [String], // For multiple choice questions
        correctAnswer: String, // For multiple choice and true-false questions
        rubric: String // For essay questions
    }],
    teacher: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
        name: { type: String, required: true }
    },
    baseTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTemplate' }, // Reference to original template
    createdAt: { type: Date, default: Date.now }
});

examTemplateSchema.index({ 'teacher.id': 1 });
examTemplateSchema.index({ isTemplate: 1 });

module.exports = mongoose.model('ExamTemplate', examTemplateSchema);
