
import React from 'react';
import ReactDOM from 'react-dom/client';
import SidePanelChat from './pages/SidePanelChat';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <SidePanelChat />
        </ThemeProvider>
    </React.StrictMode>,
);
