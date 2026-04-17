import { createContext, useContext, useState } from 'react';

// ── theme definitions ─────────────────────────────────────────────────────────
export const THEMES = {
    midnight: {
        key:     'midnight',
        label:   'Midnight',
        swatch:  '#00c2ff',
        bg:        '#0a0f1e',
        surface:   '#111827',
        card:      '#1a2235',
        border:    '#1f2d45',
        accent:    '#00c2ff',
        accentDim: 'rgba(0,194,255,0.12)',
        red:       '#f43f5e',
        orange:    '#fb923c',
        yellow:    '#facc15',
        green:     '#22d3a0',
        purple:    '#a78bfa',
        textPri:   '#e2e8f0',
        textSec:   '#64748b',
        textMuted: '#334155',
        scanBtnHover: '#0099cc',
        tblRowHover:  'rgba(255,255,255,0.03)',
        tblRowHoverBg: 'rgba(255,255,255,0.03)',
    },
    jade: {
        key:     'jade',
        label:   'Neon Jade',
        swatch:  '#00ff88',
        bg:        '#030f0a',
        surface:   '#051a10',
        card:      '#071f14',
        border:    '#0d3a20',
        accent:    '#00ff88',
        accentDim: 'rgba(0,255,136,0.10)',
        red:       '#f43f5e',
        orange:    '#fb923c',
        yellow:    '#facc15',
        green:     '#22d3a0',
        purple:    '#a78bfa',
        textPri:   '#d1fae5',
        textSec:   '#4b7a60',
        textMuted: '#1a3d2a',
        scanBtnHover: '#00cc6a',
        tblRowHover:  'rgba(0,255,136,0.04)',
        tblRowHoverBg: 'rgba(0,255,136,0.04)',
    },
    purple: {
        key:     'purple',
        label:   'Deep Purple',
        swatch:  '#a855f7',
        bg:        '#0d0a1e',
        surface:   '#140f2e',
        card:      '#1c1540',
        border:    '#2a1f5a',
        accent:    '#a855f7',
        accentDim: 'rgba(168,85,247,0.12)',
        red:       '#f43f5e',
        orange:    '#fb923c',
        yellow:    '#facc15',
        green:     '#22d3a0',
        purple:    '#a78bfa',
        textPri:   '#ede9fe',
        textSec:   '#6b5f8a',
        textMuted: '#2e2450',
        scanBtnHover: '#8b3de0',
        tblRowHover:  'rgba(168,85,247,0.04)',
        tblRowHoverBg: 'rgba(168,85,247,0.04)',
    },
    crimson: {
        key:     'crimson',
        label:   'Crimson',
        swatch:  '#f43f5e',
        bg:        '#0f0a0a',
        surface:   '#1a0f0f',
        card:      '#221316',
        border:    '#3a1a1e',
        accent:    '#f43f5e',
        accentDim: 'rgba(244,63,94,0.12)',
        red:       '#f43f5e',
        orange:    '#fb923c',
        yellow:    '#facc15',
        green:     '#22d3a0',
        purple:    '#a78bfa',
        textPri:   '#ffe4e6',
        textSec:   '#7a4a50',
        textMuted: '#3a1a20',
        scanBtnHover: '#cc2040',
        tblRowHover:  'rgba(244,63,94,0.04)',
        tblRowHoverBg: 'rgba(244,63,94,0.04)',
    },
    light: {
        key:     'light',
        label:   'Arctic Light',
        swatch:  '#0ea5e9',
        bg:        '#f0f4f8',
        surface:   '#ffffff',
        card:      '#ffffff',
        border:    '#e2e8f0',
        accent:    '#0ea5e9',
        accentDim: 'rgba(14,165,233,0.10)',
        red:       '#e11d48',
        orange:    '#ea580c',
        yellow:    '#ca8a04',
        green:     '#059669',
        purple:    '#7c3aed',
        textPri:   '#0f172a',
        textSec:   '#64748b',
        textMuted: '#94a3b8',
        scanBtnHover: '#0284c7',
        tblRowHover:  'rgba(0,0,0,0.03)',
        tblRowHoverBg: 'rgba(0,0,0,0.03)',
    },
};

const STORAGE_KEY = 'shanduko_theme';

// ── context ───────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'midnight';
    const initial = THEMES[saved] || THEMES.midnight;
    const [theme, setThemeState] = useState(initial);

    const setTheme = (key) => {
        const t = THEMES[key] || THEMES.midnight;
        localStorage.setItem(STORAGE_KEY, key);
        setThemeState(t);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};
