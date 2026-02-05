import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaStickyNote, FaThumbtack, FaCheckSquare, FaSquare, FaTrashAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Notes = () => {
    const { user, loading: authLoading } = useAuth();
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showEditor, setShowEditor] = useState(false); 

    const isMobile = window.innerWidth <= 480;

    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        if (!authLoading && user) {
            fetchNotes();
        }
    }, [authLoading, user]);

    const fetchNotes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notes');
            setNotes(res.data);
            if (res.data.length > 0 && !activeNote) {
                
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const createNote = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/notes', {
                title: 'Untitled',
                content: ''
            });
            setNotes([res.data, ...notes]);
            setActiveNote(res.data);
            toast.success('New note created');

           
            if (selectionMode) {
                setSelectionMode(false);
                setSelectedIds([]);
            }
        } catch (err) {
            toast.error('Failed to create note');
        }
    };

    const deleteNote = (e, id) => {
        e.stopPropagation();
        toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Delete this note?</span>
                <button onClick={() => { toast.dismiss(t.id); performDelete(id); }} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                <button onClick={() => toast.dismiss(t.id)} style={{ padding: '0.25rem 0.5rem', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', borderRadius: '4px', cursor: 'pointer' }}>No</button>
            </div>
        ), { duration: 5000 });
    };

    const performDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/notes/${id}`);
            setNotes(notes.filter(n => n._id !== id));
            if (activeNote && activeNote._id === id) {
                setActiveNote(null);
            }
            toast.success('Note deleted');
        } catch (err) {
            toast.error('Failed to delete note');
        }
    };

    

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedIds([]);
    };

    const toggleSelectNote = (e, id) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === notes.length) {
            setSelectedIds([]); 
        } else {
            setSelectedIds(notes.map(n => n._id)); 
        }
    };

    const confirmBatchDelete = () => {
        if (selectedIds.length === 0) return;

        toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Delete {selectedIds.length} notes?</span>
                <button onClick={() => { toast.dismiss(t.id); performBatchDelete(); }} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes</button>
                <button onClick={() => toast.dismiss(t.id)} style={{ padding: '0.25rem 0.5rem', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', borderRadius: '4px', cursor: 'pointer' }}>No</button>
            </div>
        ));
    };

    const performBatchDelete = async () => {
        try {
            await axios.post('http://localhost:5000/api/notes/batch-delete', { ids: selectedIds });
            setNotes(notes.filter(n => !selectedIds.includes(n._id)));
            setSelectedIds([]);
            setSelectionMode(false);
            setActiveNote(null);
            toast.success('Selected notes deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete notes');
        }
    };

    const updateActiveNote = (key, value) => {
        if (!activeNote) return;
        const updatedNote = { ...activeNote, [key]: value };
        setActiveNote(updatedNote);
        setNotes(notes.map(n => n._id === activeNote._id ? updatedNote : n));

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaving(true);
        saveTimeoutRef.current = setTimeout(() => {
            saveNote(updatedNote);
        }, 1000);
    };

    const saveNote = async (noteToSave) => {
        try {
            await axios.put(`http://localhost:5000/api/notes/${noteToSave._id}`, noteToSave);
            setSaving(false);
        } catch (err) {
            console.error(err);
            setSaving(false);
        }
    };

    const togglePin = async (e, note) => {
        e.stopPropagation();
        const updatedNote = { ...note, isPinned: !note.isPinned };
        const newNotes = notes.map(n => n._id === note._id ? updatedNote : n)
            .sort((a, b) => {
                if (a.isPinned === b.isPinned) return new Date(b.lastModified) - new Date(a.lastModified);
                return a.isPinned ? -1 : 1;
            });
        setNotes(newNotes);
        try {
            await axios.put(`http://localhost:5000/api/notes/${note._id}`, updatedNote);
        } catch (err) {
            toast.error('Failed to update pin status');
            fetchNotes();
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Notes...</div>;

    const handleNoteClick = (note) => {
        setActiveNote(note);
        if (isMobile) setShowEditor(true);
    };

    const handleBackToList = () => {
        if (isMobile) setShowEditor(false);
    };

    return (
        <div className="notes-page" style={{
            display: 'flex',
            height: 'calc(100vh - 150px)',
            gap: isMobile ? '0' : '1.5rem',
            overflow: 'hidden',
            flexDirection: isMobile ? 'column' : 'row'
        }}>
            
            <div
                className="glass-panel"
                style={{
                    width: isMobile ? '100%' : '300px',
                    display: (isMobile && showEditor) ? 'none' : 'flex',
                    flexDirection: 'column',
                    padding: isMobile ? '0.75rem' : '1rem',
                    flexShrink: 0
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                }}>
                    <h2 style={{
                        fontSize: isMobile ? '1.5rem' : '1.5rem',
                        margin: 0
                    }}>Notes</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {selectionMode ? (
                            <>
                                <button
                                    onClick={confirmBatchDelete}
                                    disabled={selectedIds.length === 0}
                                    className="glass-btn"
                                    style={{
                                        padding: '8px',
                                        fontSize: isMobile ? '0.85rem' : '0.9rem',
                                        color: '#ff6b6b',
                                        opacity: selectedIds.length === 0 ? 0.5 : 1
                                    }}
                                    title="Delete Selected"
                                >
                                    <FaTrashAlt />
                                </button>
                                <button onClick={toggleSelectionMode} className="glass-btn" style={{ padding: '8px 12px', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={toggleSelectionMode} className="glass-btn" style={{ padding: '8px', fontSize: isMobile ? '0.85rem' : '0.9rem' }} title="Select Multiple">
                                    <FaCheckSquare />
                                </button>
                                <button onClick={createNote} className="glass-btn" style={{ padding: '8px 12px', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                                    <FaPlus /> New
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {selectionMode && (
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                        <button onClick={handleSelectAll} style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', fontWeight: 'bold' }}>
                            {selectedIds.length === notes.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <span style={{ color: 'var(--text-muted)' }}>{selectedIds.length} selected</span>
                    </div>
                )}

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    paddingRight: '5px'
                }}>
                    {notes.map(note => (
                        <div
                            key={note._id}
                            onClick={selectionMode ? (e) => toggleSelectNote(e, note._id) : () => handleNoteClick(note)}
                            style={{
                                padding: isMobile ? '0.75rem' : '10px',
                                borderRadius: '8px',
                                background: (activeNote && activeNote._id === note._id) || selectedIds.includes(note._id) ? 'var(--glass-border)' : 'rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid transparent',
                                borderColor: (activeNote && activeNote._id === note._id) || selectedIds.includes(note._id) ? 'var(--primary-accent)' : 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                minHeight: isMobile ? '60px' : '50px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                                {selectionMode && (
                                    <div style={{ color: selectedIds.includes(note._id) ? 'var(--primary-accent)' : 'var(--text-muted)', fontSize: isMobile ? '1rem' : '1.2rem' }}>
                                        {selectedIds.includes(note._id) ? <FaCheckSquare /> : <FaSquare />}
                                    </div>
                                )}
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: isMobile ? '0.9rem' : '0.95rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {note.isPinned && <FaThumbtack style={{ fontSize: '0.7rem', color: '#fbc2eb' }} />}
                                        {note.title || 'Untitled'}
                                    </div>
                                    <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {note.content?.substring(0, 30) || 'No content'}
                                    </div>
                                </div>
                            </div>

                            {!selectionMode && (
                                <div className="actions" style={{ display: 'flex', gap: '5px' }}>
                                    <button
                                        onClick={(e) => togglePin(e, note)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: note.isPinned ? '#fbc2eb' : 'var(--text-muted)',
                                            opacity: 0.7,
                                            fontSize: isMobile ? '1rem' : '1.2rem',
                                            minWidth: '40px',
                                            minHeight: '40px'
                                        }}
                                    >
                                        <FaThumbtack />
                                    </button>
                                    <button
                                        onClick={(e) => deleteNote(e, note._id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#ff6b6b',
                                            opacity: 0.7,
                                            fontSize: isMobile ? '1rem' : '1.2rem',
                                            minWidth: '40px',
                                            minHeight: '40px'
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {notes.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontStyle: 'italic', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                            No notes yet. Create one!
                        </div>
                    )}
                </div>
            </div>

            {/* Main Editor */}
            <div style={{
                flex: 1,
                padding: isMobile ? '1rem' : '2rem',
                display: (isMobile && !showEditor) ? 'none' : 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                {activeNote ? (
                    <>
                        {isMobile && (
                            <button
                                onClick={handleBackToList}
                                className="glass-btn"
                                style={{
                                    marginBottom: '1rem',
                                    alignSelf: 'flex-start',
                                    padding: '8px 16px'
                                }}
                            >
                                ← Back to List
                            </button>
                        )}

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            color: 'var(--text-muted)',
                            fontSize: isMobile ? '0.75rem' : '0.8rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            <span>Last edited: {new Date(activeNote.lastModified).toLocaleString()}</span>
                            <span>{saving ? 'Saving...' : 'Saved'}</span>
                        </div>
                        <input
                            type="text"
                            value={activeNote.title}
                            onChange={(e) => updateActiveNote('title', e.target.value)}
                            placeholder="Untitled"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: isMobile ? '1.8rem' : '2.5rem',
                                color: 'var(--text-main)',
                                fontWeight: 'bold',
                                width: '100%',
                                marginBottom: '1rem',
                                outline: 'none'
                            }}
                        />
                        <textarea
                            value={activeNote.content}
                            onChange={(e) => updateActiveNote('content', e.target.value)}
                            placeholder="Type something amazing..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                fontSize: isMobile ? '1rem' : '1.1rem',
                                color: 'var(--text-main)',
                                lineHeight: '1.6',
                                outline: 'none',
                                resize: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0.3,
                        color: 'var(--text-main)'
                    }}>
                        <FaStickyNote style={{ fontSize: isMobile ? '3rem' : '4rem', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                            {isMobile && notes.length > 0 ? 'Select a note to edit' : (selectionMode ? 'Batch Deletion Mode Active' : 'Select a note or create a new one')}
                        </h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
