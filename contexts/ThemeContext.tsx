
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ExtensionThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // We'll use sync storage for extension persists or local
        return localStorage.getItem('os_extension_theme') === 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('os_extension_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('os_extension_theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useExtensionTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useExtensionTheme must be used within ExtensionThemeProvider');
    return context;
};
