import React, { useState } from 'react';
import { FaPalette, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px'
        }}>
            {isOpen && (
                <div className="glass-panel" style={{
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '10px',
                    minWidth: '150px'
                }}>
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id);
                                setIsOpen(false);
                            }}
                            style={{
                                background: theme === t.id ? 'var(--glass-border)' : 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                fontWeight: theme === t.id ? 'bold' : 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: t.color,
                                border: '1px solid var(--text-muted)'
                            }} />
                            {t.name}
                        </button>
                    ))}
                </div>
            )}

            <button
                onClick={toggleOpen}
                className="glass-btn"
                style={{
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    padding: 0,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    color: 'var(--text-main)'
                }}
            >
                {isOpen ? <FaTimes /> : <FaPalette />}
            </button>
        </div>
    );
};

export default ThemeSwitcher;
