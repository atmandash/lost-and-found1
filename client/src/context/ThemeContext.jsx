import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Dark mode is effectively removed as per user request
    const isDarkMode = false;

    useEffect(() => {
        // Ensure dark class is removed
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('darkMode'); // Clear preference
    }, []);

    const toggleTheme = () => {
        // No-op
        console.log("Dark mode is disabled.");
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
