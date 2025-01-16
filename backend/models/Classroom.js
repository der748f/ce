const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name or identifier for the classroom
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // List of student IDs
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }], // List of teacher IDs
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);
