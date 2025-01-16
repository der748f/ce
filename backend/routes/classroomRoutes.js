const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @route GET /api/classrooms
// @desc Get all classrooms
router.get('/', async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate('students', 'name email')
            .populate('teachers', 'name email')
            .populate({
                path: 'students',
                populate: { path: 'enrolledSubjects', select: 'name' },
            })
            .populate({
                path: 'teachers',
                populate: { path: 'subjects', select: 'name' },
            });
        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classrooms', error });
    }
});

// @route GET /api/classrooms/:id
// @desc Get a single classroom by ID
router.get('/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('students', 'name email')
            .populate('teachers', 'name email')
            .populate({
                path: 'students',
                populate: { path: 'enrolledSubjects', select: 'name' },
            })
            .populate({
                path: 'teachers',
                populate: { path: 'subjects', select: 'name' },
            });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.status(200).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classroom', error });
    }
});

// @route POST /api/classrooms
// @desc Create a new classroom
router.post('/', async (req, res) => {
    try {
        const { name, students, teachers } = req.body;
        const newClassroom = new Classroom({ name, students, teachers });
        const savedClassroom = await newClassroom.save();
        res.status(201).json(savedClassroom);
    } catch (error) {
        res.status(500).json({ message: 'Error creating classroom', error });
    }
});

// @route PUT /api/classrooms/:id
// @desc Update a classroom
router.put('/:id', async (req, res) => {
    try {
        const updatedClassroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
            .populate('students', 'name email')
            .populate('teachers', 'name email');
        if (!updatedClassroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.status(200).json(updatedClassroom);
    } catch (error) {
        res.status(500).json({ message: 'Error updating classroom', error });
    }
});

// @route DELETE /api/classrooms/:id
// @desc Delete a classroom
router.delete('/:id', async (req, res) => {
    try {
        const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);
        if (!deletedClassroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.status(200).json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting classroom', error });
    }
});

module.exports = router;
