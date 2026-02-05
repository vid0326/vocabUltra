const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    term: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    definition: {
        type: String,
        required: true
    },
    example: {
        type: String,
        default: ''
    },
    pronunciation: {
        type: String,
        default: ''
    },
    hindiMeaning: {
        type: String,
        default: ''
    },
    synonyms: [{
        type: String
    }],
    masteryLevel: {
        type: Number,
        default: 0 // 0: new, 1: learning, 2: mastered
    },
    correctCount: {
        type: Number,
        default: 0
    },
    incorrectCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can only add a specific word once, but multiple users can add the same word
WordSchema.index({ term: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Word', WordSchema);
