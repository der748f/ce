const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        id: { type: String, required: true }, // Changed to String
        name: { type: String, required: true },
        role: { type: String, enum: ['student', 'teacher'], required: true }
    },
    receiver: {
        id: { type: String, required: true }, // Changed to String
        name: { type: String, required: true },
        role: { type: String, enum: ['student', 'teacher'], required: true }
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

// Add pre-save middleware to ensure IDs are strings
messageSchema.pre('save', function(next) {
    if (this.sender.id && mongoose.Types.ObjectId.isValid(this.sender.id)) {
        this.sender.id = this.sender.id.toString();
    }
    if (this.receiver.id && mongoose.Types.ObjectId.isValid(this.receiver.id)) {
        this.receiver.id = this.receiver.id.toString();
    }
    next();
});

module.exports = mongoose.model('Message', messageSchema);
