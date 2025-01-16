const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Teacher = require('../models/Teacher');

const createTestTeacher = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/schoolApp', {});
        console.log('Connected to MongoDB');

        // Check if teacher exists
        const existingTeacher = await Teacher.findOne({ email: 'bobo@example.com' });
        if (existingTeacher) {
            console.log('Test teacher already exists:', existingTeacher._id);
            return;
        }

        // Create test teacher
        const hashedPassword = await bcrypt.hash('password123', 10);
        const teacher = new Teacher({
            name: 'Bobo Teacher',
            email: 'bobo@example.com',
            password: hashedPassword,
            subjects: [],
            classrooms: []
        });

        await teacher.save();
        console.log('Test teacher created with ID:', teacher._id);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createTestTeacher();
