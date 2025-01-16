const mongoose = require('mongoose');

const messageThreadSchema = new mongoose.Schema({
    threadId: { type: String, required: true, unique: true },
    participants: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, enum: ['student', 'teacher'], required: true }
    }],
    lastMessage: {
        content: String,
        sentAt: Date,
        senderId: String
    }
}, { 
    timestamps: true 
});

messageThreadSchema.index({ threadId: 1 });
messageThreadSchema.index({ 'participants.id': 1 });

module.exports = mongoose.model('MessageThread', messageThreadSchema);
