const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const noteController = require('../controllers/noteController');

// @route   GET /api/notes
// @desc    Get all notes for logged in user
router.get('/', auth, noteController.getNotes);

// @route   POST /api/notes
// @desc    Create a new note
router.post('/', auth, noteController.createNote);

// @route   PUT /api/notes/:id
// @desc    Update a note
router.put('/:id', auth, noteController.updateNote);

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', auth, noteController.deleteNote);

// @route   POST /api/notes/batch-delete
// @desc    Batch delete notes
router.post('/batch-delete', auth, noteController.batchDeleteNotes);

module.exports = router;
