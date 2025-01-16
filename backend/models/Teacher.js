const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Subjects the teacher teaches
    classrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }], // Classrooms the teacher teaches in
}, { 
    timestamps: true,
    toJSON: { 
        getters: true,
        transform: function(doc, ret) {
            console.log('Debug: Transform called on teacher document', ret._id);
            ret.id = ret._id.toString();
            return ret;
        }
    },
    toObject: { getters: true }
});

// Add virtual for string ID
teacherSchema.virtual('stringId').get(function() {
    return this._id.toString();
});

// Hash password before saving
teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Add static method for debug lookup
teacherSchema.statics.findByAnyId = async function(id) {
    console.log('Debug: Attempting findByAnyId with:', id);
    const docs = await this.collection.find({ 
        $or: [
            { _id: id },
            { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
        ]
    }).toArray();
    console.log('Debug: Found documents:', docs.length);
    return docs[0];
};

module.exports = mongoose.model('Teacher', teacherSchema);
