const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const wordController = require('../controllers/wordController');

// @route   POST /api/words
// @desc    Add a word to My Dictionary
router.post('/words', auth, wordController.addWord);

// @route   GET /api/words
// @desc    Get all words for logged in user
router.get('/words', auth, wordController.getWords);

// @route   DELETE /api/words/:id
// @desc    Remove a word
router.delete('/words/:id', auth, wordController.deleteWord);

// @route   POST /api/words/batch-delete
// @desc    Batch delete words
router.post('/words/batch-delete', auth, wordController.batchDeleteWords);

// Keep quiz-result inline or move to controller? Let's keep it here or move to controller for consistency.
// Ideally move to wordController.
// Let's check if I added it to wordController.
// I did NOT add quiz logic to wordController in previous step.
// I should add it to wordController now.

module.exports = router;
