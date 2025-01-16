const express = require('express');
const mongoose = require('mongoose'); // Add mongoose import
const Student = require('../models/Student');
const Classroom = require('../models/Classroom');
const Grade = require('../models/Grade'); // Add Grade import

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        console.log('All students:', students);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route GET /api/students/dashboard/:id
// @desc Get student dashboard data
router.get('/dashboard/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log('Looking up student with ID:', studentId);

        // First try finding by string ID
        let student = await Student.findById(studentId);
        console.log('Direct ID lookup result:', student ? 'Found' : 'Not found');

        // If not found, try converting to ObjectId
        if (!student && mongoose.Types.ObjectId.isValid(studentId)) {
            const studentObjectId = new mongoose.Types.ObjectId(studentId);
            student = await Student.findOne({ _id: studentObjectId });
            console.log('ObjectId lookup result:', student ? 'Found' : 'Not found');
        }

        if (!student) {
            // List available students for debugging
            const allStudents = await Student.find({}, '_id email');
            console.log('Available students:', allStudents);
            
            return res.status(404).json({
                message: 'Student not found',
                providedId: studentId,
                debug: { availableStudents: allStudents }
            });
        }

        // Get classrooms with populated teacher data
        const classrooms = await Classroom.find({
            students: student._id
        }).populate('teachers', 'name email');

        const response = {
            student: {
                id: student._id.toString(),
                name: student.name,
                email: student.email
            },
            classrooms: classrooms.map(c => ({
                id: c._id.toString(),
                name: c.name,
                teacher: c.teachers[0] ? {
                    id: c.teachers[0]._id.toString(),
                    name: c.teachers[0].name,
                    email: c.teachers[0].email
                } : null
            }))
        };

        res.json(response);

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a single student
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new student
router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Update a student
router.put('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Delete a student
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add this new route for student grades
router.get('/:studentId/grades', async (req, res) => {
    try {
        const grades = await Grade.find({
            'student.id': req.params.studentId
        }).sort({ date: -1 });

        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching grades' });
    }
});

module.exports = router;