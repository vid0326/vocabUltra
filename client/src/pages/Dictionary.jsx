import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dictionary = () => {
    const [term, setTerm] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hindiMeaning, setHindiMeaning] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const isMobile = window.innerWidth <= 480;

    const searchWord = async (e) => {
        if (e) e.preventDefault();
        if (!term) return;

        setLoading(true);
        setResult(null);
        setSuggestions([]);
        setHindiMeaning('');

        try {
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`);
            setResult(res.data[0]);
        } catch (err) {
            toast.error('Word not found. Checking for similar words...');
            fetchSuggestions(term);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async (word) => {
        try {
            const res = await axios.get(`https://api.datamuse.com/words?sp=${word}`);
            const similar = res.data
                .map(item => item.word)
                .filter(w => w.toLowerCase() !== word.toLowerCase())
                .slice(0, 4);

            setSuggestions(similar);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleSuggestionClick = (word) => {
        setTerm(word);
        searchWithTerm(word);
    };

    const searchWithTerm = async (word) => {
        setTerm(word);
        setLoading(true);
        setResult(null);
        setSuggestions([]);
        setHindiMeaning('');

        try {
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            setResult(res.data[0]);
        } catch (err) {
            toast.error('Word not found.');
        } finally {
            setLoading(false);
        }
    };

    const saveWord = async () => {
        if (!result) return;
        setSaving(true);

        const wordData = {
            term: result.word,
            definition: result.meanings[0]?.definitions[0]?.definition || 'No definition found',
            example: result.meanings[0]?.definitions[0]?.example || '',
            pronunciation: result.phonetic || '',
            synonyms: result.meanings[0]?.synonyms || [],
            hindiMeaning: hindiMeaning
        };

        try {
            await axios.post('http://localhost:5000/api/words', wordData);
            toast.success('Word saved to your collection!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Error saving word');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dictionary-page" style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '0 1rem' : '0'
        }}>
            <form onSubmit={searchWord} style={{
                marginBottom: isMobile ? '2rem' : '3rem',
                position: 'relative',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.5rem' : '0'
            }}>
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Search for a word..."
                    className="glass-panel"
                    style={{
                        width: '100%',
                        padding: isMobile ? '1rem' : '1.5rem',
                        paddingRight: isMobile ? '1rem' : '120px',
                        fontSize: isMobile ? '1rem' : '1.2rem',
                        color: 'var(--text-main)',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--glass-border)'
                    }}
                />
                <button type="submit" className="glass-btn" style={{
                    position: isMobile ? 'relative' : 'absolute',
                    right: isMobile ? 'auto' : '10px',
                    top: isMobile ? 'auto' : '50%',
                    transform: isMobile ? 'none' : 'translateY(-50%)',
                    padding: isMobile ? '12px 24px' : '10px 30px',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    Search
                </button>
            </form>

            {loading && <div style={{ textAlign: 'center' }}>Searching...</div>}

            {!result && suggestions.length > 0 && (
                <div className="glass-panel" style={{
                    padding: isMobile ? '1.5rem' : '2rem',
                    textAlign: 'center',
                    animation: 'fadeIn 0.5s'
                }}>
                    <h3 style={{
                        marginBottom: '1rem',
                        color: '#fbc2eb',
                        fontSize: isMobile ? '1.2rem' : '1.5rem'
                    }}>Did you mean?</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '0.5rem' : '1rem', flexWrap: 'wrap' }}>
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(s)}
                                className="glass-btn"
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid var(--primary-accent)',
                                    fontSize: isMobile ? '1rem' : '1.1rem',
                                    padding: isMobile ? '10px 16px' : '10px 20px'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {result && (
                <div className="glass-panel" style={{
                    padding: isMobile ? '1.5rem' : '2rem',
                    animation: 'fadeIn 0.5s'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'stretch' : 'flex-start',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{ flex: isMobile ? 'none' : '1' }}>
                            <h2 style={{
                                fontSize: isMobile ? '2rem' : '3rem',
                                marginBottom: '0.5rem',
                                wordBreak: 'break-word'
                            }}>{result.word}</h2>
                            <span style={{
                                color: '#a18cd1',
                                fontSize: isMobile ? '1rem' : '1.2rem',
                                fontStyle: 'italic'
                            }}>
                                {result.phonetic}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            alignItems: isMobile ? 'stretch' : 'flex-end',
                            width: isMobile ? '100%' : 'auto'
                        }}>
                            <input
                                type="text"
                                placeholder="Hindi Meaning (Optional)"
                                value={hindiMeaning}
                                onChange={(e) => setHindiMeaning(e.target.value)}
                                style={{
                                    padding: isMobile ? '0.75rem' : '0.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'var(--text-main)',
                                    width: isMobile ? '100%' : 'auto',
                                    minWidth: isMobile ? 'auto' : '200px'
                                }}
                            />
                            <button
                                onClick={saveWord}
                                disabled={saving}
                                className="glass-btn"
                                style={{
                                    background: saving ? '#ccc' : undefined,
                                    width: isMobile ? '100%' : 'auto',
                                    padding: isMobile ? '12px 24px' : '10px 20px'
                                }}
                            >
                                {saving ? 'Saving...' : '+ Add to Mine'}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        {result.meanings.map((meaning, idx) => (
                            <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ color: '#fbc2eb', marginBottom: '0.5rem' }}>{meaning.partOfSpeech}</h4>
                                <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>
                                    {meaning.definitions.slice(0, 2).map((def, dIdx) => (
                                        <li key={dIdx} style={{ marginBottom: '0.5rem' }}>
                                            {def.definition}
                                            {def.example && (
                                                <div style={{ marginTop: '0.2rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.8 }}>
                                                    "{def.example}"
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                {meaning.synonyms && meaning.synonyms.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Synonyms:</span>
                                        {meaning.synonyms.slice(0, 5).map((syn, sIdx) => (
                                            <span key={sIdx} style={{
                                                background: 'rgba(161, 140, 209, 0.2)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                color: '#e0c3fc'
                                            }}>
                                                {syn}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dictionary;
