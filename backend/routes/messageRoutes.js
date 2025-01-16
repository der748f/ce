const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const MessageThread = require('../models/MessageThread');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const router = express.Router();

// Get all message threads for a user
router.get('/threads/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const threads = await MessageThread.find({
            'participants.id': userId
        }).sort({ lastMessageAt: -1 });
        
        res.json(threads);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching threads', error: error.message });
    }
});

// Get or create a thread between two users
router.post('/thread', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        // Find existing thread
        let thread = await MessageThread.findOne({
            'participants.id': { $all: [senderId, receiverId] }
        });

        if (!thread) {
            // Get sender and receiver details
            const sender = await Student.findById(senderId) || await Teacher.findById(senderId);
            const receiver = await Student.findById(receiverId) || await Teacher.findById(receiverId);

            if (!sender || !receiver) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Create new thread
            thread = new MessageThread({
                participants: [
                    {
                        id: sender._id,
                        name: sender.name,
                        role: sender.constructor.modelName.toLowerCase()
                    },
                    {
                        id: receiver._id,
                        name: receiver.name,
                        role: receiver.constructor.modelName.toLowerCase()
                    }
                ]
            });
            await thread.save();
        }

        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: 'Error creating thread', error: error.message });
    }
});

// Send a message in a thread
router.post('/thread/:threadId/messages', async (req, res) => {
    try {
        const { threadId } = req.params;
        const { senderId, content } = req.body;

        const thread = await MessageThread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        const sender = thread.participants.find(p => p.id.toString() === senderId);
        if (!sender) {
            return res.status(403).json({ message: 'Not a participant in this thread' });
        }

        const message = {
            sender,
            content,
            createdAt: new Date()
        };

        thread.messages.push(message);
        thread.lastMessageAt = message.createdAt;
        await thread.save();

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
});

// Mark messages as read
router.patch('/thread/:threadId/read', async (req, res) => {
    try {
        const { threadId } = req.params;
        const { userId } = req.body;

        const thread = await MessageThread.findOneAndUpdate(
            { _id: threadId, 'messages.read': false },
            { 
                $set: { 
                    'messages.$[msg].read': true 
                } 
            },
            { 
                arrayFilters: [{ 'msg.sender.id': { $ne: userId }, 'msg.read': false }],
                new: true 
            }
        );

        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read', error: error.message });
    }
});

// Get conversation between users
router.get('/conversation/:userId1/:userId2', async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        console.log('Fetching conversation between:', userId1, userId2);

        const messages = await mongoose.connection.db
            .collection('messages')
            .find({
                $or: [
                    { 
                        'sender.id': userId1,
                        'receiver.id': userId2
                    },
                    {
                        'sender.id': userId2,
                        'receiver.id': userId1
                    }
                ]
            })
            .sort({ createdAt: 1 })
            .toArray();

        console.log(`Found ${messages.length} messages`);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Error fetching conversation' });
    }
});

// Send message
router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, content, senderRole } = req.body;
        console.log('Processing message:', { senderId, receiverId, content, senderRole });

        // Find participants in the database
        const db = mongoose.connection.db;
        const [sender, receiver] = await Promise.all([
            db.collection(senderRole === 'student' ? 'students' : 'teachers')
                .findOne({ _id: senderId }),
            db.collection(senderRole === 'student' ? 'teachers' : 'students')
                .findOne({ _id: receiverId })
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({ 
                message: 'Sender or receiver not found',
                debug: { senderId, receiverId }
            });
        }

        // Create threadId by sorting IDs to ensure consistency
        const threadId = [senderId, receiverId].sort().join('-');

        // Create and save message
        const message = new Message({
            sender: {
                id: senderId,
                name: sender.name,
                role: senderRole
            },
            receiver: {
                id: receiverId,
                name: receiver.name,
                role: senderRole === 'student' ? 'teacher' : 'student'
            },
            content,
            threadId
        });
        await message.save();

        // Update or create message thread
        await MessageThread.findOneAndUpdate(
            { threadId },
            {
                $setOnInsert: {
                    participants: [
                        { id: senderId, name: sender.name, role: senderRole },
                        { id: receiverId, name: receiver.name, role: senderRole === 'student' ? 'teacher' : 'student' }
                    ]
                },
                $set: {
                    lastMessage: {
                        content,
                        sentAt: new Date(),
                        senderId
                    }
                }
            },
            { upsert: true, new: true }
        );

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
});

// Get recent messages
router.get('/recent/:userId', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { 'sender.id': req.params.userId },
                { 'receiver.id': req.params.userId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10);

        res.json(messages);
    } catch (error) {
        console.error('Error fetching recent messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

module.exports = router;
