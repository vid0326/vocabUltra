const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id }).sort({ isPinned: -1, lastModified: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newNote = new Note({
            title,
            content,
            user: req.user.id
        });
        const note = await newNote.save();
        res.json(note);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateNote = async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ msg: 'Note not found' });

        // Ensure user owns note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { title, content, isPinned } = req.body;
        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        if (isPinned !== undefined) note.isPinned = isPinned;

        note.lastModified = Date.now();
        await note.save();
        res.json(note);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
        if (!note) return res.status(404).json({ msg: 'Note not found' });

        await note.deleteOne();
        res.json({ msg: 'Note removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.batchDeleteNotes = async (req, res) => {
    try {
        const { ids, all } = req.body;

        if (all) {
            await Note.deleteMany({ user: req.user.id });
            return res.json({ msg: 'All notes deleted' });
        }

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ msg: 'No IDs provided' });
        }

        await Note.deleteMany({ _id: { $in: ids }, user: req.user.id });
        res.json({ msg: `${ids.length} notes deleted` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};
