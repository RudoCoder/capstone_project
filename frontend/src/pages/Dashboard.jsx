import React, { useEffect, useState } from 'react';
import { getAllAnalysis } from '../api/analysisService';
import { getTutorials } from '../api/tutorialService';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
    Shield, AlertTriangle, CheckCircle, FileSearch,
    UploadCloud, BookOpen, LayoutDashboard, LogOut,
    TrendingUp, Activity, ExternalLink, Clock, Cpu, Palette, MessageSquare, User,
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

// ── helpers ───────────────────────────────────────────────────────────────────
const riskColor = (score, C) => {
    if (score >= 75) return C.red;
    if (score >= 50) return C.orange;
    if (score >= 25) return C.yellow;
    return C.green;
};

const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent, C }) => (
    <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '20px 22px',
        display: 'flex', alignItems: 'flex-start', gap: 16,
        position: 'relative', overflow: 'hidden',
    }}>
        <div style={{ background: `${accent}22`, borderRadius: 10, padding: 10, flexShrink: 0 }}>
            <Icon size={22} color={accent} />
        </div>
        <div>
            <p style={{ margin: 0, fontSize: 12, color: C.textSec, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
            <p style={{ margin: '4px 0 2px', fontSize: 28, fontWeight: 700, color: C.textPri, lineHeight: 1 }}>{value}</p>
            <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>{sub}</p>
        </div>
        <div style={{
            position: 'absolute', right: -20, top: -20,
            width: 80, height: 80, borderRadius: '50%',
            background: `${accent}18`, filter: 'blur(20px)', pointerEvents: 'none',
        }} />
    </div>
);

// ── NavItem ───────────────────────────────────────────────────────────────────
const NavItem = ({ to, onClick, icon: Icon, label, active, C }) => {
    const inner = (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 10, marginBottom: 4,
            background: active ? C.accentDim : 'transparent',
            border: `1px solid ${active ? C.accent + '44' : 'transparent'}`,
            color: active ? C.accent : C.textSec,
            fontWeight: active ? 600 : 400, fontSize: 14, cursor: 'pointer',
            transition: 'all 0.15s',
        }}>
            <Icon size={17} /> {label}
        </div>
    );
    if (onClick) return <div onClick={onClick}>{inner}</div>;
    return <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link>;
};

// ── CustomTooltip ─────────────────────────────────────────────────────────────
const MakeTooltip = (C) => ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>{fmt(d.created_at)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: C.accent }}>
                {d.risk_score}<span style={{ fontSize: 12, color: C.textSec }}>/100</span>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>{d.file_name}</p>
        </div>
    );
};

// ── ThemePicker modal ─────────────────────────────────────────────────────────
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
                        <button
                            key={t.key}
                            onClick={() => { setTheme(t.key); onClose(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                                background: isActive ? `${t.swatch}18` : C.card,
                                border: `2px solid ${isActive ? t.swatch : C.border}`,
                                transition: 'all 0.15s', width: '100%', textAlign: 'left',
                            }}
                        >
                            {/* 2×2 colour preview */}
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
                            {isActive && (
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.swatch, flexShrink: 0, boxShadow: `0 0 6px ${t.swatch}` }} />
                            )}
                        </button>
                    );
                })}
            </div>

            <p style={{ margin: '16px 0 0', fontSize: 11, color: C.textMuted, textAlign: 'center' }}>
                Theme is saved automatically
            </p>
        </div>
    </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { theme: C, setTheme } = useTheme();
    const [results, setResults]     = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showTheme, setShowTheme] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [ar, tr] = await Promise.all([getAllAnalysis(), getTutorials()]);
                setResults(ar.data);
                setTutorials(tr.data);
            } catch (e) {
                console.error('Dashboard fetch error:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const total    = results.length;
    const critical = results.filter(r => r.risk_score >= 75).length;
    const high     = results.filter(r => r.risk_score >= 50 && r.risk_score < 75).length;
    const medium   = results.filter(r => r.risk_score >= 25 && r.risk_score < 50).length;
    const clean    = results.filter(r => r.risk_score < 25).length;
    const avgRisk  = total ? Math.round(results.reduce((a, b) => a + (b.risk_score || 0), 0) / total) : 0;

    const chartData  = [...results].slice(0, 10).reverse();
    const PIE_COLORS = [C.red, C.orange, C.yellow, C.green];
    const pieData    = [
        { name: 'Critical', value: critical },
        { name: 'High',     value: high     },
        { name: 'Medium',   value: medium   },
        { name: 'Low',      value: clean    },
    ].filter(d => d.value > 0);

    const isLight    = C.key === 'light';
    const CustomTip  = MakeTooltip(C);

    if (loading) return (
        <div style={{ position: 'fixed', inset: 0, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, zIndex: 9999 }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: C.textSec, fontSize: 14, margin: 0 }}>Loading threat intelligence…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: ${C.bg}; }
                ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
                .tbl-row:hover { background: ${C.tblRowHover} !important; }
                .scan-btn:hover { opacity: 0.85 !important; }
                .tut-card:hover { border-color: ${C.accent}88 !important; background: ${C.accentDim} !important; }
                .nav-hover:hover { background: ${C.accentDim} !important; color: ${C.accent} !important; }
            `}</style>

            {showTheme && <ThemePicker C={C} currentKey={C.key} setTheme={setTheme} onClose={() => setShowTheme(false)} />}

            {/* ── full-viewport wrapper ── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: C.bg, display: 'flex', overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

                {/* ── SIDEBAR ── */}
                <div style={{ width: 240, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '24px 14px' }}>

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

                    {/* Nav */}
                    <p style={{ margin: '0 0 8px 8px', fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Main</p>
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard"   active={true}  C={C} />
                    <NavItem to="/upload"    icon={UploadCloud}     label="Upload File"  active={false} C={C} />
                    <NavItem to="/tutorials" icon={BookOpen}        label="Tutorials"    active={false} C={C} />

                    <p style={{ margin: '20px 0 8px 8px', fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Insights</p>
                    <NavItem to="/activity-log" icon={Activity}       label="Activity Log" active={false} C={C} />
                    <NavItem to="/ml-analysis"  icon={Cpu}            label="ML Analysis"  active={false} C={C} />
                    <NavItem to="/feedback"     icon={MessageSquare}  label="Feedback"     active={false} C={C} />
                    <NavItem to="/profile"      icon={User}           label="My Profile"   active={false} C={C} />

                    <div style={{ flex: 1 }} />

                    {/* Theme button */}
                    <button
                        onClick={() => setShowTheme(true)}
                        className="nav-hover"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'transparent', border: `1px solid ${C.border}`,
                            color: C.textSec, borderRadius: 10, padding: '10px 14px',
                            cursor: 'pointer', width: '100%', fontSize: 14,
                            marginBottom: 8, transition: 'all 0.15s',
                        }}
                    >
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: C.accent, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 6px ${C.accent}88` }} />
                        Theme: {C.label}
                    </button>

                    {/* Avg risk pill */}
                    <div style={{ background: `${riskColor(avgRisk, C)}18`, border: `1px solid ${riskColor(avgRisk, C)}44`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                        <p style={{ margin: 0, fontSize: 11, color: C.textSec }}>Average Risk Score</p>
                        <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 700, color: riskColor(avgRisk, C) }}>
                            {avgRisk}<span style={{ fontSize: 12, color: C.textSec }}>/100</span>
                        </p>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); window.location.href = '/login'; }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'transparent', border: `1px solid ${C.border}`,
                            color: C.textSec, borderRadius: 10, padding: '10px 14px',
                            cursor: 'pointer', width: '100%', fontSize: 14,
                        }}
                    >
                        <LogOut size={15} /> Logout
                    </button>
                </div>

                {/* ── MAIN ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>Security Overview</h1>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSec, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Clock size={12} />
                                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <Link
                            to="/upload"
                            className="scan-btn"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: C.accent, color: isLight ? '#fff' : '#000',
                                fontWeight: 700, padding: '10px 20px', borderRadius: 10,
                                textDecoration: 'none', fontSize: 14, transition: 'opacity 0.15s',
                            }}
                        >
                            <UploadCloud size={16} /> New Scan
                        </Link>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
                        <StatCard icon={FileSearch}    label="Total Scans"  value={total}    sub="all time"    accent={C.accent}  C={C} />
                        <StatCard icon={AlertTriangle} label="Critical"     value={critical} sub="score ≥ 75"  accent={C.red}     C={C} />
                        <StatCard icon={TrendingUp}    label="High Risk"    value={high}     sub="score 50–74" accent={C.orange}  C={C} />
                        <StatCard icon={TrendingUp}    label="Medium Risk"  value={medium}   sub="score 25–49" accent={C.yellow}  C={C} />
                        <StatCard icon={CheckCircle}   label="Low / Clean"  value={clean}    sub="score < 25"  accent={C.green}   C={C} />
                    </div>

                    {/* Charts row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

                        {/* Area chart */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPri }}>Threat Level Trend</p>
                                    <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec }}>Risk score over last 10 scans</p>
                                </div>
                                <span style={{ background: `${C.red}22`, border: `1px solid ${C.red}44`, color: C.red, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>LIVE</span>
                            </div>
                            <div style={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%"   stopColor={C.accent} stopOpacity={0.35} />
                                                <stop offset="100%" stopColor={C.accent} stopOpacity={0}    />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                                        <XAxis dataKey="created_at" tickFormatter={v => fmt(v)} tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTip />} />
                                        <Area type="monotone" dataKey="risk_score" stroke={C.accent} strokeWidth={2.5} fill="url(#riskGrad)" dot={{ fill: C.accent, r: 4 }} activeDot={{ r: 6 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: C.textPri }}>Risk Distribution</p>
                            <p style={{ margin: '0 0 12px', fontSize: 12, color: C.textSec }}>Breakdown by severity</p>
                            {pieData.length > 0 ? (
                                <>
                                    <div style={{ height: 160 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} itemStyle={{ color: C.textPri }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {pieData.map((d, i) => (
                                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                                                    <span style={{ fontSize: 13, color: C.textSec }}>{d.name}</span>
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: C.textSec, fontSize: 13 }}>No data yet</div>
                            )}
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

                        {/* Scans table */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPri }}>Recent File Scans</p>
                                    <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec }}>{total} total records</p>
                                </div>
                                <Link to="/upload" style={{ fontSize: 12, color: C.accent, textDecoration: 'none', fontWeight: 600 }}>+ New scan</Link>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['File Name', 'Date', 'Status', 'Risk', 'Action'].map(h => (
                                                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.length === 0 && (
                                            <tr><td colSpan={5} style={{ padding: '20px 12px', color: C.textSec, fontSize: 13, textAlign: 'center' }}>No scans yet.</td></tr>
                                        )}
                                        {results.map((item) => (
                                            <tr key={item.id} className="tbl-row" style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.1s' }}>
                                                <td style={{ padding: '11px 12px', fontSize: 13, color: C.textPri, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file_name}</td>
                                                <td style={{ padding: '11px 12px', fontSize: 12, color: C.textSec, whiteSpace: 'nowrap' }}>{fmt(item.created_at)}</td>
                                                <td style={{ padding: '11px 12px' }}>
                                                    <span style={{
                                                        fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                                        background: item.status === 'completed' ? `${C.green}22` : `${C.orange}22`,
                                                        border: `1px solid ${item.status === 'completed' ? C.green : C.orange}44`,
                                                        color: item.status === 'completed' ? C.green : C.orange,
                                                    }}>
                                                        {item.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '11px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, minWidth: 50 }}>
                                                            <div style={{ width: `${item.risk_score || 0}%`, height: '100%', borderRadius: 2, background: riskColor(item.risk_score, C) }} />
                                                        </div>
                                                        <span style={{ fontSize: 12, color: riskColor(item.risk_score, C), fontWeight: 600, minWidth: 28 }}>{item.risk_score}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '11px 12px' }}>
                                                    <Link to={`/analysis/${item.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.accent, textDecoration: 'none', fontWeight: 600 }}>
                                                        Details <ExternalLink size={11} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Learning hub */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                <BookOpen size={16} color={C.accent} />
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPri }}>Learning Hub</p>
                            </div>
                            <p style={{ margin: '0 0 16px', fontSize: 12, color: C.textSec }}>Cybersecurity resources</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 320 }}>
                                {tutorials.length === 0
                                    ? <p style={{ fontSize: 13, color: C.textSec }}>No tutorials found.</p>
                                    : tutorials.map((tut) => (
                                        <a key={tut.id} href={tut.url} target="_blank" rel="noopener noreferrer" className="tut-card"
                                            style={{ display: 'block', textDecoration: 'none', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', transition: 'all 0.15s' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.textPri, lineHeight: 1.4 }}>{tut.title}</p>
                                                <ExternalLink size={13} color={C.accent} style={{ flexShrink: 0, marginLeft: 6, marginTop: 2 }} />
                                            </div>
                                            {tut.description && <p style={{ margin: '5px 0 0', fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{tut.description}</p>}
                                        </a>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
