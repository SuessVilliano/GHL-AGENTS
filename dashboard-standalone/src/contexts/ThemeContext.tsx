
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WhitelabelConfig {
    platformName: string;
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
}

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    config: WhitelabelConfig;
    updateConfig: (newConfig: Partial<WhitelabelConfig>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('os_theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    const [config, setConfig] = useState<WhitelabelConfig>({
        platformName: 'LIV8 OS'
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('os_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('os_theme', 'light');
        }

        // Sync to Chrome Extension Storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ os_theme: isDark ? 'dark' : 'light' });
        }
    }, [isDark]);

    // Listen for External Updates (e.g. Side Panel Toggle)
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
            const listener = (changes: any, areaName: string) => {
                if (areaName === 'local' && changes.os_theme) {
                    setIsDark(changes.os_theme.newValue === 'dark');
                }
            };
            chrome.storage.onChanged.addListener(listener);
            return () => chrome.storage.onChanged.removeListener(listener);
        }
    }, []);

    // Whitelabel Injection Logic
    useEffect(() => {
        const root = document.documentElement;
        if (config.primaryColor) {
            root.style.setProperty('--os-primary', config.primaryColor);
        }
    }, [config]);

    const toggleTheme = () => setIsDark(!isDark);

    const updateConfig = (newConfig: Partial<WhitelabelConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, config, updateConfig }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
