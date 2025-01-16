const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['exam', 'course_material', 'assignment', 'other'], 
        required: true 
    },
    content: { type: String },
    fileUrl: { type: String },
    teacher: {
        id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Teacher', 
            required: true 
        },
        name: { type: String, required: true }
    },
    subject: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        name: { type: String }
    }
}, { 
    timestamps: true 
});

documentSchema.index({ 'teacher.id': 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
