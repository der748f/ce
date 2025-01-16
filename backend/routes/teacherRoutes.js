const express = require('express');
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Message = require('../models/Message');
const Classroom = require('../models/Classroom');
const ExamTemplate = require('../models/ExamTemplate');
const Grade = require('../models/Grade');

const router = express.Router();

// Debug middleware - add more logging
router.use((req, res, next) => {
    console.log('Teacher route accessed:', {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body
    });
    next();
});

// Dashboard route - MUST BE BEFORE /:id route
router.get('/dashboard/:id', async (req, res) => {
    try {
        const teacherId = req.params.id;
        console.log('Looking up teacher with ID:', teacherId);

        let teacher;
        if (mongoose.Types.ObjectId.isValid(teacherId)) {
            teacher = await Teacher.findById(teacherId);
        }

        if (!teacher) {
            teacher = await Teacher.findOne({ _id: teacherId });
        }

        if (!teacher) {
            // Debug: List all teachers in database
            const allTeachers = await Teacher.find({}, '_id email');
            console.log('Available teachers:', allTeachers);
            return res.status(404).json({
                message: 'Teacher not found',
                providedId: teacherId,
                debug: { availableTeachers: allTeachers }
            });
        }

        // Get associated data
        const [classrooms, messages] = await Promise.all([
            Classroom.find({ teachers: teacherId })
                .populate('students', 'name email'),
            Message.find({
                $or: [
                    { 'sender.id': teacherId },
                    { 'receiver.id': teacherId }
                ]
            }).sort('-createdAt').limit(50)
        ]);

        const response = {
            teacher: {
                id: teacher._id.toString(),
                name: teacher.name,
                email: teacher.email
            },
            classrooms: classrooms.map(c => ({
                id: c._id.toString(),
                name: c.name,
                students: (c.students || []).map(s => ({
                    id: s._id.toString(),
                    name: s.name,
                    email: s.email
                }))
            })),
            messages: messages || []
        };

        console.log('Sending teacher dashboard response');
        res.json(response);

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            message: 'Error fetching teacher dashboard',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all teachers
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a single teacher
router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new teacher
router.post('/', async (req, res) => {
    const { name, email, classrooms } = req.body;
    try {
        const teacher = new Teacher({ name, email, classrooms });
        await teacher.save();
        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Update a teacher
router.put('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Delete a teacher
router.delete('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        res.json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route POST /api/teacher/exams
// @desc Create a new exam template
router.post('/exams', async (req, res) => {
    try {
        const { title, questions } = req.body;
        const teacherId = req.user.id;

        // Store exam template in a local file or cloud storage
        const filePath = path.join(__dirname, `../documents/${teacherId}_${Date.now()}.json`);
        fs.writeFileSync(filePath, JSON.stringify({ title, questions }, null, 2));

        res.status(201).json({ message: 'Exam template created', filePath });
    } catch (error) {
        res.status(500).json({ message: 'Error creating exam template', error });
    }
});

// Add these new routes for grade management
router.post('/grades', async (req, res) => {
    try {
        const grade = new Grade(req.body);
        await grade.save();
        res.status(201).json(grade);
    } catch (error) {
        res.status(400).json({ error: 'Invalid grade data' });
    }
});

// Get grades for a classroom
router.get('/classroom/:classroomId/grades', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classroomId);
        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        const grades = await Grade.find({
            'student.id': { $in: classroom.students }
        }).sort({ date: -1 });

        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching grades' });
    }
});

module.exports = router;
