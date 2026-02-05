import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('vocab-theme') || 'default';
    });

    useEffect(() => {
        const root = document.documentElement;

        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('vocab-theme', theme);
    }, [theme]);

    const themes = [
        { id: 'default', name: 'Original', color: '#302b63' },
        { id: 'black', name: 'Midnight', color: '#000000' },
        { id: 'white', name: 'Clean', color: '#ffffff' },
        { id: 'blue', name: 'Ocean', color: '#0066cc' },
        { id: 'iron-man', name: 'Iron Man', color: '#7a0000' },
    ];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};
