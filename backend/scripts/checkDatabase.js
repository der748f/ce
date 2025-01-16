const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Message = require('../models/Message');

const checkDatabase = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/schoolApp', {});
        console.log('Connected to MongoDB');

        // Check teacher
        const teacherId = '678107c23170ec538e23447e';
        console.log('\nChecking teacher with ID:', teacherId);
        
        const teacher = await Teacher.findById(teacherId);
        console.log('Teacher found:', teacher ? {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            classrooms: teacher.classrooms
        } : 'Not found');

        // Check all teachers
        console.log('\nAll teachers in database:');
        const allTeachers = await Teacher.find({});
        console.log(allTeachers.map(t => ({
            _id: t._id,
            name: t.name,
            email: t.email
        })));

        // Check classrooms
        console.log('\nClassrooms for this teacher:');
        const classrooms = await Classroom.find({
            teachers: teacherId
        });
        console.log('Found classrooms:', classrooms);

        // Check messages
        console.log('\nMessages for this teacher:');
        const messages = await Message.find({
            $or: [
                { 'sender.id': teacherId },
                { 'receiver.id': teacherId }
            ]
        });
        console.log('Found messages:', messages.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

checkDatabase();
