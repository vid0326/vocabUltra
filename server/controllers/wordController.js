const Word = require('../models/Word');
const axios = require('axios');

exports.getWords = async (req, res) => {
    try {
        const words = await Word.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(words);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addWord = async (req, res) => {
    const { term } = req.body;
    const normalizedTerm = term.toLowerCase().trim();

    try {
        let existingWord = await Word.findOne({ term: normalizedTerm, user: req.user.id });
        if (existingWord) {
            return res.status(400).json({ msg: 'Word already in your collection' });
        }

        // Fetch from APIs in PARALLEL
        const dictPromise = axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedTerm}`);
        const transPromise = axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${normalizedTerm}`).catch(() => null);

        const [dictRes, translateRes] = await Promise.all([dictPromise, transPromise]);

        const data = dictRes.data[0];

        const definition = data.meanings[0]?.definitions[0]?.definition || 'No definition found';
        const example = data.meanings[0]?.definitions[0]?.example || '';
        const pronunciation = data.phonetic || (data.phonetics.length > 0 ? data.phonetics[0].text : '');

        // Handle translation result
        let hindiMeaning = '';
        if (translateRes && translateRes.data && translateRes.data[0] && translateRes.data[0][0]) {
            hindiMeaning = translateRes.data[0][0][0];
        }

        const newWord = new Word({
            user: req.user.id,
            term: data.word,
            definition,
            example,
            pronunciation,
            hindiMeaning
        });

        await newWord.save();
        res.json(newWord);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteWord = async (req, res) => {
    try {
        const word = await Word.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!word) {
            return res.status(404).json({ msg: 'Word not found' });
        }
        res.json({ msg: 'Word removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.batchDeleteWords = async (req, res) => {
    try {
        const { ids, all } = req.body;

        if (all) {
            await Word.deleteMany({ user: req.user.id });
            return res.json({ msg: 'All words deleted' });
        }

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ msg: 'No IDs provided' });
        }

        await Word.deleteMany({ _id: { $in: ids }, user: req.user.id });
        res.json({ msg: `${ids.length} words deleted` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateMastery = async (req, res) => {
    const { wordId, isCorrect } = req.body;
    try {
        const word = await Word.findOne({ _id: wordId, user: req.user.id });
        if (!word) return res.status(404).json({ msg: 'Word not found' });

        if (isCorrect) {
            word.correctCount += 1;
            if (word.correctCount > 3) word.masteryLevel = 2;
            else word.masteryLevel = 1;
        } else {
            word.incorrectCount += 1;
        }

        await word.save();
        res.json(word);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
