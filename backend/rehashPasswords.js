const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');

// Database connection
mongoose.connect('mongodb://localhost:27017/schoolApp', {
    useNewUrlParser: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('Database connection error:', err));

const rehashPasswords = async () => {
    try {
        // Define the new password
        const plainPassword = 'p';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        console.log('New hashed password:', hashedPassword);

        // Update all students
        const updatedStudents = await Student.updateMany(
            {}, // Empty query to update all documents
            { $set: { password: hashedPassword } }
        );
        console.log('Updated students:', updatedStudents);

        // Update all teachers
        const updatedTeachers = await Teacher.updateMany(
            {}, // Empty query to update all documents
            { $set: { password: hashedPassword } }
        );
        console.log('Updated teachers:', updatedTeachers);

        console.log('Password rehashing completed successfully.');
    } catch (err) {
        console.error('Error during rehashing passwords:', err);
    } finally {
        mongoose.connection.close();
    }
};

rehashPasswords();
