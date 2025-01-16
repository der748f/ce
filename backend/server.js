const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');

// Load environment variables
dotenv.config();

// Import routes and models
const classroomRoutes = require('./routes/classroomRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const messageRoutes = require('./routes/messageRoutes');
const examRoutes = require('./routes/examRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');

// App setup
const app = express();
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const userId = new URL(req.url, 'ws://localhost:5000').searchParams.get('userId');
    console.log('New WebSocket connection, userId:', userId);
    
    ws.userId = userId;
    ws.isAlive = true;

    ws.on('message', (message) => {
        console.log('Received:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected:', userId);
    });
});

// Keep connections alive
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

// Middleware with updated CORS configuration
app.use(express.json());
app.use(cors(Object.assign({}, {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
})));

// Debug middleware
app.use((req, res, next) => {
    console.log('Request:', req.method, req.url);
    next();
});

// Database connection with updated options
mongoose.connect('mongodb://localhost:27017/schoolApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('Database connection error:', err));

// API routes without authentication middleware
app.use('/api/classrooms', classroomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await Student.findOne({ email });
        let role = 'student';

        if (!user) {
            user = await Teacher.findOne({ email });
            role = 'teacher';
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            role,
            userId: user._id,
            name: user.name
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
