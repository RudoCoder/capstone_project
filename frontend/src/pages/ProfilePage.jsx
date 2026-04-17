import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import { getProfile, updateProfile } from '../api/authService';
import { getAllAnalysis } from '../api/analysisService';
import {
    User, Mail, Building2, Shield, FileSearch,
    CheckCircle, AlertTriangle, TrendingUp, Edit3, Save, X, AlertCircle,
} from 'lucide-react';

const ROLES = [
    { value: 'user',    label: 'Regular User',     desc: 'Access analysis results and reports' },
    { value: 'analyst', label: 'Security Analyst',  desc: 'Full access to threat intelligence tools' },
    { value: 'admin',   label: 'Administrator',     desc: 'Manage users and platform settings' },
];

const roleColor = (role, C) => {
    if (role === 'admin')   return C.red;
    if (role === 'analyst') return C.orange;
    return C.accent;
};

const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function ProfilePage() {
    const { theme: C } = useTheme();

    const [profile, setProfile]     = useState(null);
    const [analyses, setAnalyses]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [editing, setEditing]     = useState(false);
    const [saving, setSaving]       = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saved, setSaved]         = useState(false);

    const [form, setForm] = useState({ username: '', email: '', organization: '', role: 'user' });

    useEffect(() => {
        Promise.all([getProfile(), getAllAnalysis()])
            .then(([p, a]) => {
                setProfile(p.data);
                setAnalyses(a.data);
                setForm({
                    username:     p.data.username     || '',
                    email:        p.data.email        || '',
                    organization: p.data.organization || '',
                    role:         p.data.role         || 'user',
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const startEdit = () => { setSaveError(''); setSaved(false); setEditing(true); };
    const cancelEdit = () => {
        setForm({
            username:     profile.username     || '',
            email:        profile.email        || '',
            organization: profile.organization || '',
            role:         profile.role         || 'user',
        });
        setEditing(false);
        setSaveError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            const res = await updateProfile(form);
            setProfile(res.data);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                const msgs = Object.values(data).flat().join(' ');
                setSaveError(msgs);
            } else {
                setSaveError('Failed to save. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    // Derived scan stats
    const total    = analyses.length;
    const critical = analyses.filter(a => a.risk_score >= 75).length;
    const high     = analyses.filter(a => a.risk_score >= 50 && a.risk_score < 75).length;
    const clean    = analyses.filter(a => a.risk_score < 25).length;
    const avgRisk  = total ? Math.round(analyses.reduce((s, a) => s + (a.risk_score || 0), 0) / total) : 0;

    const inputStyle = {
        width: '100%', background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, fontSize: 14, color: C.textPri,
        fontFamily: 'inherit', outline: 'none', padding: '12px 14px 12px 42px',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    };

    if (loading) return (
        <AppLayout>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: C.textSec, fontSize: 14, margin: 0 }}>Loading profile…</p>
            </div>
        </AppLayout>
    );

    const rc = roleColor(profile?.role, C);

    return (
        <AppLayout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .pf-input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accent}22 !important; }
                .role-btn:hover { border-color: ${C.accent}66 !important; }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ background: `${C.accent}1a`, borderRadius: 10, padding: 10 }}>
                        <User size={20} color={C.accent} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>My Profile</h1>
                </div>
                <p style={{ margin: '0 0 0 44px', fontSize: 13, color: C.textSec }}>
                    Manage your account details and view scan statistics
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24, alignItems: 'start' }}>

                {/* ── LEFT: Avatar + role + stats ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Avatar card */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
                            background: `linear-gradient(135deg, ${C.accent}33, ${C.accent}11)`,
                            border: `2px solid ${C.accent}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <User size={36} color={C.accent} />
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: C.textPri }}>{profile?.username}</p>
                        <p style={{ margin: '0 0 14px', fontSize: 13, color: C.textSec }}>{profile?.email || 'No email set'}</p>

                        {/* Role badge */}
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: `${rc}18`, border: `1px solid ${rc}44`,
                            color: rc, fontSize: 12, fontWeight: 700,
                            padding: '4px 14px', borderRadius: 20,
                        }}>
                            <Shield size={12} />
                            {ROLES.find(r => r.value === profile?.role)?.label || 'User'}
                        </span>

                        {profile?.organization && (
                            <p style={{ margin: '12px 0 0', fontSize: 12, color: C.textSec, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                <Building2 size={12} /> {profile.organization}
                            </p>
                        )}

                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textMuted }}>
                            Member since {fmt(profile?.date_joined)}
                        </div>
                    </div>

                    {/* Scan stats */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
                        <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: C.textPri, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, color: C.textMuted }}>
                            Scan Statistics
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <StatRow icon={<FileSearch size={14} color={C.accent} />}   label="Total Scans"    value={total}        accent={C.accent}  C={C} />
                            <StatRow icon={<AlertTriangle size={14} color={C.red} />}   label="Critical Files" value={critical}      accent={C.red}     C={C} />
                        <StatRow icon={<TrendingUp size={14} color={C.orange} />}   label="High Risk"      value={high}          accent={C.orange}  C={C} />
                            <StatRow icon={<CheckCircle size={14} color={C.green} />}   label="Clean Files"    value={clean}        accent={C.green}   C={C} />
                            <StatRow icon={<Shield size={14} color={C.orange} />}       label="Avg Risk Score" value={`${avgRisk}/100`} accent={C.orange} C={C} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Edit form ── */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPri }}>Account Details</p>
                        {!editing ? (
                            <button onClick={startEdit} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                background: `${C.accent}18`, border: `1px solid ${C.accent}44`,
                                color: C.accent, borderRadius: 8, padding: '7px 14px',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}>
                                <Edit3 size={14} /> Edit
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={cancelEdit} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'transparent', border: `1px solid ${C.border}`,
                                    color: C.textSec, borderRadius: 8, padding: '7px 14px',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                }}>
                                    <X size={14} /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: saving ? C.border : C.accent,
                                    color: '#000', border: 'none', borderRadius: 8,
                                    padding: '7px 16px', fontSize: 13, fontWeight: 700,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                }}>
                                    {saving
                                        ? <><div style={{ width: 14, height: 14, border: '2px solid #00000044', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                                        : <><Save size={14} /> Save Changes</>
                                    }
                                </button>
                            </div>
                        )}
                    </div>

                    {saved && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${C.green}18`, border: `1px solid ${C.green}44`, borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                            <CheckCircle size={15} color={C.green} />
                            <p style={{ margin: 0, fontSize: 13, color: C.green, fontWeight: 600 }}>Profile updated successfully.</p>
                        </div>
                    )}

                    {saveError && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: `${C.red}18`, border: `1px solid ${C.red}44`, borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                            <AlertCircle size={15} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                            <p style={{ margin: 0, fontSize: 13, color: C.red }}>{saveError}</p>
                        </div>
                    )}

                    {/* Username */}
                    <FieldBlock label="Username" C={C}>
                        <div style={{ position: 'relative' }}>
                            <User size={15} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                className="pf-input"
                                disabled={!editing}
                                value={form.username}
                                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                style={{ ...inputStyle, opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }}
                            />
                        </div>
                    </FieldBlock>

                    {/* Email */}
                    <FieldBlock label="Email" optional C={C}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={15} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                className="pf-input"
                                type="email"
                                disabled={!editing}
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                style={{ ...inputStyle, opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }}
                            />
                        </div>
                    </FieldBlock>

                    {/* Organization */}
                    <FieldBlock label="Organization" optional C={C}>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={15} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                className="pf-input"
                                disabled={!editing}
                                placeholder="Your company or institution"
                                value={form.organization}
                                onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                                style={{ ...inputStyle, opacity: editing ? 1 : 0.7, cursor: editing ? 'text' : 'default' }}
                            />
                        </div>
                    </FieldBlock>

                    {/* Role */}
                    <FieldBlock label="Role" C={C}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            {ROLES.map(r => {
                                const active = form.role === r.value;
                                const col = roleColor(r.value, C);
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        className="role-btn"
                                        disabled={!editing}
                                        onClick={() => editing && setForm(f => ({ ...f, role: r.value }))}
                                        style={{
                                            textAlign: 'left', padding: '10px 12px',
                                            background: active ? `${col}12` : C.surface,
                                            border: `1px solid ${active ? col : C.border}`,
                                            borderRadius: 10,
                                            cursor: editing ? 'pointer' : 'default',
                                            transition: 'border-color 0.15s',
                                            opacity: editing ? 1 : 0.75,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                            <span style={{
                                                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                                                border: `2px solid ${active ? col : C.border}`,
                                                background: active ? col : 'transparent',
                                            }} />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: active ? col : C.textPri }}>{r.label}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 10, color: C.textSec, lineHeight: 1.4 }}>{r.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </FieldBlock>

                    {!editing && (
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
                            Click <strong style={{ color: C.accent }}>Edit</strong> to modify your details
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function FieldBlock({ label, optional, C, children }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 7 }}>
                {label}
                {optional && <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}> (optional)</span>}
            </label>
            {children}
        </div>
    );
}

function StatRow({ icon, label, value, accent, C }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: `${accent}18`, borderRadius: 6, padding: 5, display: 'flex' }}>{icon}</div>
                <span style={{ fontSize: 13, color: C.textSec }}>{label}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>{value}</span>
        </div>
    );
}
