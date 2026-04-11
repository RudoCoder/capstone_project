import { Link, useLocation } from 'react-router-dom';
import {
    Shield, LayoutDashboard, UploadCloud, BookOpen,
    Activity, Cpu, LogOut, Palette,
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useState } from 'react';

// ── ThemePicker (shared) ──────────────────────────────────────────────────────
const ThemePicker = ({ C, currentKey, setTheme, onClose }) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
        <div style={{
            position: 'relative', background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: 16,
            padding: 28, width: 340, zIndex: 1,
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Palette size={18} color={C.accent} />
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPri }}>Choose Theme</p>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textSec, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.values(THEMES).map((t) => {
                    const isActive = t.key === currentKey;
                    return (
                        <button key={t.key} onClick={() => { setTheme(t.key); onClose(); }} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                            background: isActive ? `${t.swatch}18` : C.card,
                            border: `2px solid ${isActive ? t.swatch : C.border}`,
                            transition: 'all 0.15s', width: '100%', textAlign: 'left',
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                overflow: 'hidden', display: 'grid',
                                gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
                            }}>
                                <div style={{ background: t.bg }} />
                                <div style={{ background: t.surface }} />
                                <div style={{ background: t.accent }} />
                                <div style={{ background: t.card }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isActive ? t.swatch : C.textPri }}>{t.label}</p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: C.textSec }}>{t.swatch}</p>
                            </div>
                            {isActive && <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.swatch, flexShrink: 0, boxShadow: `0 0 6px ${t.swatch}` }} />}
                        </button>
                    );
                })}
            </div>
            <p style={{ margin: '16px 0 0', fontSize: 11, color: C.textMuted, textAlign: 'center' }}>Theme is saved automatically</p>
        </div>
    </div>
);

// ── AppLayout ─────────────────────────────────────────────────────────────────
export default function AppLayout({ children }) {
    const { theme: C, setTheme } = useTheme();
    const [showTheme, setShowTheme] = useState(false);
    const location = useLocation();

    const nav = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/upload',    icon: UploadCloud,     label: 'Upload File' },
        { to: '/tutorials', icon: BookOpen,        label: 'Tutorials' },
    ];
    const insights = [
        { to: '/dashboard', icon: Activity, label: 'Activity Log' },
        { to: '/dashboard', icon: Cpu,      label: 'ML Analysis' },
    ];

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link to={to} style={{ textDecoration: 'none' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10, marginBottom: 4,
                background: isActive(to) ? C.accentDim : 'transparent',
                border: `1px solid ${isActive(to) ? C.accent + '44' : 'transparent'}`,
                color: isActive(to) ? C.accent : C.textSec,
                fontWeight: isActive(to) ? 600 : 400,
                fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
            }}
                onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent; } }}
                onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSec; } }}
            >
                <Icon size={17} /> {label}
            </div>
        </Link>
    );

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: ${C.bg}; }
                ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
            `}</style>

            {showTheme && <ThemePicker C={C} currentKey={C.key} setTheme={setTheme} onClose={() => setShowTheme(false)} />}

            <div style={{
                position: 'fixed', inset: 0, zIndex: 999,
                background: C.bg, display: 'flex', overflow: 'hidden',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}>
                {/* ── SIDEBAR ── */}
                <div style={{
                    width: 240, flexShrink: 0, background: C.surface,
                    borderRight: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column', padding: '24px 14px',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, paddingLeft: 6 }}>
                        <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent}99)`, borderRadius: 10, padding: 8 }}>
                            <Shield size={18} color="#fff" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.textPri }}>Shanduko</p>
                            <p style={{ margin: 0, fontSize: 11, color: C.textSec }}>Threat Intel</p>
                        </div>
                    </div>

                    <p style={{ margin: '0 0 8px 8px', fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Main</p>
                    {nav.map(n => <NavItem key={n.to} {...n} />)}

                    <p style={{ margin: '20px 0 8px 8px', fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Insights</p>
                    {insights.map(n => <NavItem key={n.label} {...n} />)}

                    <div style={{ flex: 1 }} />

                    {/* Theme button */}
                    <button onClick={() => setShowTheme(true)} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'transparent', border: `1px solid ${C.border}`,
                        color: C.textSec, borderRadius: 10, padding: '10px 14px',
                        cursor: 'pointer', width: '100%', fontSize: 14,
                        marginBottom: 8, transition: 'all 0.15s',
                    }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: C.accent, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 6px ${C.accent}88` }} />
                        Theme: {C.label}
                    </button>

                    {/* Logout */}
                    <button onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); window.location.href = '/login'; }} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'transparent', border: `1px solid ${C.border}`,
                        color: C.textSec, borderRadius: 10, padding: '10px 14px',
                        cursor: 'pointer', width: '100%', fontSize: 14,
                    }}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
                    {children}
                </div>
            </div>
        </>
    );
}
