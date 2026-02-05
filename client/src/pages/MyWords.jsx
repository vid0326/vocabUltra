import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaCheckSquare, FaSquare, FaTrashAlt, FaCheckDouble } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyWords = () => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/words');
            setWords(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteWord = (id) => {
        toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Delete this word?</span>
                <button onClick={() => { toast.dismiss(t.id); performDelete(id); }} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                <button onClick={() => toast.dismiss(t.id)} style={{ padding: '0.25rem 0.5rem', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', borderRadius: '4px', cursor: 'pointer' }}>No</button>
            </div>
        ), { duration: 5000 });
    };

    const performDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/words/${id}`);
            setWords(words.filter(w => w._id !== id));
            toast.success('Word removed from collection');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete word');
        }
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedIds([]);
    };

    const toggleSelectWord = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === words.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(words.map(w => w._id)); 
        }
    };

    const confirmBatchDelete = () => {
        if (selectedIds.length === 0) return;

        toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Delete {selectedIds.length} words?</span>
                <button onClick={() => { toast.dismiss(t.id); performBatchDelete(); }} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                <button onClick={() => toast.dismiss(t.id)} style={{ padding: '0.25rem 0.5rem', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', borderRadius: '4px', cursor: 'pointer' }}>No</button>
            </div>
        ));
    };

    const performBatchDelete = async () => {
        try {
            await axios.post('http://localhost:5000/api/words/batch-delete', { ids: selectedIds });
            setWords(words.filter(w => !selectedIds.includes(w._id)));
            setSelectedIds([]);
            setSelectionMode(false);
            toast.success('Selected words deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete words');
        }
    };

    if (loading) return <div style={{ textAlign: 'center' }}>Loading your collection...</div>;

    return (
        <div className="my-words-page" style={{ padding: isMobile ? '0 1rem' : '0' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: isMobile ? '1.5rem' : '2rem',
                gap: isMobile ? '1rem' : '0'
            }}>
                <h2 style={{
                    fontSize: isMobile ? '2rem' : '2.5rem',
                    margin: 0
                }}>My Collection</h2>

                <div style={{
                    display: 'flex',
                    gap: isMobile ? '0.5rem' : '1rem',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'space-between' : 'flex-start',
                    flexWrap: 'wrap'
                }}>
                    {selectionMode ? (
                        <>
                            <span style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>{selectedIds.length} selected</span>
                            <button
                                onClick={handleSelectAll}
                                className="glass-btn"
                                style={{ padding: '8px 12px', fontSize: isMobile ? '0.85rem' : '0.9rem', color: 'var(--primary-accent)' }}
                            >
                                <FaCheckDouble /> All
                            </button>
                            <button
                                onClick={confirmBatchDelete}
                                disabled={selectedIds.length === 0}
                                className="glass-btn"
                                style={{ padding: '8px 12px', fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#ff6b6b', opacity: selectedIds.length === 0 ? 0.5 : 1 }}
                            >
                                <FaTrashAlt /> Delete ({selectedIds.length})
                            </button>
                            <button onClick={toggleSelectionMode} className="glass-btn" style={{ padding: '8px 12px', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        words.length > 0 && (
                            <button onClick={toggleSelectionMode} className="glass-btn" style={{ padding: '8px 12px', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                                <FaCheckSquare /> Select Words
                            </button>
                        )
                    )}
                </div>
            </div>

            {words.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.7 }}>
                    <h3>No words yet!</h3>
                    <p>Go to Search and add some words to build your dictionary.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(300px, 1fr))'),
                    gap: isMobile ? '1rem' : '1.5rem'
                }}>
                    {words.map(word => (
                        <div
                            key={word._id}
                            className="glass-panel"
                            style={{
                                padding: isMobile ? '1.25rem' : '1.5rem',
                                position: 'relative',
                                cursor: selectionMode ? 'pointer' : 'default',
                                border: selectionMode && selectedIds.includes(word._id) ? '1px solid var(--primary-accent)' : '1px solid var(--glass-border)',
                                background: selectionMode && selectedIds.includes(word._id) ? 'rgba(74, 144, 226, 0.1)' : 'var(--glass-bg)'
                            }}
                            onClick={selectionMode ? () => toggleSelectWord(word._id) : null}
                        >
                            {selectionMode && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: isMobile ? '1rem' : '1.2rem', color: 'var(--primary-accent)' }}>
                                    {selectedIds.includes(word._id) ? <FaCheckSquare /> : <FaSquare style={{ opacity: 0.5 }} />}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h3 style={{
                                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                                    color: 'var(--text-main)',
                                    margin: 0,
                                    wordBreak: 'break-word',
                                    flex: 1
                                }}>{word.term}</h3>
                                {!selectionMode && (
                                    <button
                                        onClick={() => deleteWord(word._id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ff6b6b',
                                            cursor: 'pointer',
                                            fontSize: isMobile ? '1rem' : '1.2rem',
                                            minWidth: '44px',
                                            minHeight: '44px'
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>

                            <p style={{
                                color: '#a18cd1',
                                fontSize: isMobile ? '0.85rem' : '0.9rem',
                                marginBottom: '0.5rem'
                            }}>{word.pronunciation}</p>

                            {word.hindiMeaning && (
                                <p style={{
                                    color: '#fbc2eb',
                                    fontSize: isMobile ? '1rem' : '1.1rem',
                                    marginBottom: '1rem',
                                    fontWeight: 'bold'
                                }}>
                                    {word.hindiMeaning}
                                </p>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <strong style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>Definition:</strong>
                                <p style={{
                                    color: 'var(--text-muted)',
                                    fontSize: isMobile ? '0.9rem' : '1rem',
                                    marginTop: '0.25rem'
                                }}>{word.definition}</p>
                            </div>

                            {word.example && (
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: isMobile ? '0.75rem' : '0.5rem',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                                    fontStyle: 'italic'
                                }}>
                                    "{word.example}"
                                </div>
                            )}

                            <div style={{
                                marginTop: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: isMobile ? '0.75rem' : '0.8rem',
                                opacity: 0.6
                            }}>
                                <span>Mastery: {word.masteryLevel === 2 ? 'Mastered' : word.masteryLevel === 1 ? 'Learning' : 'New'}</span>
                                <span>Correct: {word.correctCount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyWords;
