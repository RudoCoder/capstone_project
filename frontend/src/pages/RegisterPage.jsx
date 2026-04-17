import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, Lock, User, AlertCircle, CheckCircle,
    Eye, EyeOff, Mail, Building2, ChevronDown,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { registerUser } from '../api/authService';

// ── password strength ─────────────────────────────────────────────────────────
const calcStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pw.length >= 8)               score++;
    if (pw.length >= 12)              score++;
    if (/[A-Z]/.test(pw))            score++;
    if (/[0-9]/.test(pw))            score++;
    if (/[^A-Za-z0-9]/.test(pw))     score++;
    if (score <= 1) return { score, label: 'Weak',      color: '#f43f5e' };
    if (score <= 2) return { score, label: 'Fair',      color: '#fb923c' };
    if (score <= 3) return { score, label: 'Good',      color: '#facc15' };
    return           { score, label: 'Strong',     color: '#22d3a0' };
};

const ROLES = [
    { value: 'user',     label: 'Regular User',      desc: 'Access analysis results and reports' },
    { value: 'analyst',  label: 'Security Analyst',  desc: 'Full access to threat intelligence tools' },
    { value: 'admin',    label: 'Administrator',      desc: 'Manage users and platform settings' },
];

// ── Field wrapper — defined outside component so it is never recreated ────────
function Field({ label, optional, children, error, C }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 7 }}>
                {label}{optional && <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}> (optional)</span>}
            </label>
            {children}
            {error && (
                <p style={{ margin: '5px 0 0', fontSize: 12, color: C.red, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={11} /> {error}
                </p>
            )}
        </div>
    );
}

export default function RegisterPage() {
    const { theme: C } = useTheme();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '', email: '', password: '', confirm: '',
        role: 'user', organization: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState(false);
    const [showPw, setShowPw]     = useState(false);
    const [showCf, setShowCf]     = useState(false);
    const [countdown, setCountdown] = useState(3);

    const strength = calcStrength(form.password);
    const isLight  = C.key === 'light';

    // auto-redirect countdown after success
    useEffect(() => {
        if (!success) return;
        if (countdown <= 0) { navigate('/login'); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [success, countdown, navigate]);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setFieldErrors(e => ({ ...e, [k]: '' }));
        setServerError('');
    };

    // inline validation
    const validate = () => {
        const errs = {};
        if (!form.username.trim())              errs.username = 'Username is required.';
        else if (form.username.length < 3)      errs.username = 'At least 3 characters.';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email))
                                                errs.email    = 'Enter a valid email address.';
        if (!form.password)                     errs.password = 'Password is required.';
        else if (form.password.length < 8)      errs.password = 'At least 8 characters.';
        if (form.password !== form.confirm)     errs.confirm  = 'Passwords do not match.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }
        setLoading(true);
        setServerError('');
        try {
            const payload = {
                username: form.username,
                email: form.email || undefined,
                password: form.password,
                role: form.role,
                organization: form.organization || undefined,
            };
            await registerUser(payload);
            setSuccess(true);
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                // map server field errors back to fields
                const mapped = {};
                const unknown = [];
                for (const [key, val] of Object.entries(data)) {
                    const msgs = Array.isArray(val) ? val.join(' ') : String(val);
                    if (['username','email','password','role','organization'].includes(key)) {
                        mapped[key] = msgs;
                    } else {
                        unknown.push(msgs);
                    }
                }
                if (Object.keys(mapped).length) setFieldErrors(mapped);
                if (unknown.length) setServerError(unknown.join(' '));
            } else {
                setServerError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputBase = {
        width: '100%', background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, fontSize: 14, color: C.textPri,
        fontFamily: 'inherit', outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes spin  { to{transform:rotate(360deg)} }
                @keyframes fadeIn{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .reg-input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accent}22 !important; }
                .reg-input-err   { border-color: ${C.red} !important; }
                .reg-btn:hover:not(:disabled){ opacity:0.88 !important; }
                .role-opt:hover  { border-color: ${C.accent}66 !important; }
            `}</style>

            <div style={{
                position: 'fixed', inset: 0, zIndex: 999, overflowY: 'auto',
                display: 'flex', fontFamily: "'Segoe UI', system-ui, sans-serif",
                background: C.bg,
            }}>
                {/* ── LEFT PANEL ── */}
                <div style={{
                    width: '42%', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
                    background: `linear-gradient(145deg, ${C.surface} 0%, ${C.bg} 100%)`,
                    borderRight: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 48, overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: `${C.accent}0c`, filter: 'blur(60px)', pointerEvents: 'none' }} />

                    <div style={{ animation: 'float 4s ease-in-out infinite', marginBottom: 32, zIndex: 1 }}>
                        <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent}88)`, borderRadius: 20, padding: 20, display: 'inline-flex', boxShadow: `0 20px 40px ${C.accent}44` }}>
                            <Shield size={44} color="#fff" />
                        </div>
                    </div>

                    <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, color: C.textPri, textAlign: 'center', zIndex: 1 }}>
                        Shanduko<br /><span style={{ color: C.accent }}>Threat Intel</span>
                    </h1>
                    <p style={{ margin: 0, fontSize: 15, color: C.textSec, textAlign: 'center', lineHeight: 1.6, maxWidth: 280, zIndex: 1 }}>
                        Create your account to start analysing files with ML-powered threat intelligence.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 36, justifyContent: 'center', zIndex: 1 }}>
                        {['YARA Engine', 'CVE Matching', 'IOC Extraction', 'ML Scoring'].map(f => (
                            <span key={f} style={{ background: `${C.accent}18`, border: `1px solid ${C.accent}44`, color: C.accent, fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20 }}>{f}</span>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 48px 64px' }}>
                    <div style={{ width: '100%', maxWidth: 440, animation: 'fadeIn 0.3s ease' }}>

                        {success ? (
                            /* ── Success ── */
                            <div style={{ textAlign: 'center', paddingTop: 40 }}>
                                <div style={{ background: `${C.green}18`, borderRadius: '50%', padding: 20, display: 'inline-flex', marginBottom: 20, boxShadow: `0 0 40px ${C.green}33` }}>
                                    <CheckCircle size={44} color={C.green} />
                                </div>
                                <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 700, color: C.textPri }}>Account created!</h2>
                                <p style={{ margin: '0 0 8px', fontSize: 14, color: C.textSec }}>
                                    Welcome, <strong style={{ color: C.textPri }}>{form.username}</strong>. Your account is ready.
                                </p>
                                <p style={{ margin: '0 0 32px', fontSize: 13, color: C.textMuted }}>
                                    Redirecting to sign in in {countdown}s…
                                </p>
                                <Link to="/login" style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '100%', padding: '14px',
                                    background: C.accent, color: isLight ? '#fff' : '#000',
                                    borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none',
                                }}>
                                    Go to Sign In now
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: C.textPri }}>Create account</h2>
                                <p style={{ margin: '0 0 28px', fontSize: 14, color: C.textSec }}>
                                    Already have an account?{' '}
                                    <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                                </p>

                                {serverError && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: `${C.red}18`, border: `1px solid ${C.red}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 22 }}>
                                        <AlertCircle size={16} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <p style={{ margin: 0, fontSize: 13, color: C.red }}>{serverError}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} noValidate>

                                    {/* Username */}
                                    <Field label="Username" error={fieldErrors.username} C={C}>
                                        <div style={{ position: 'relative' }}>
                                            <User size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input
                                                type="text" name="username" placeholder="Choose a username"
                                                value={form.username}
                                                onChange={e => set('username', e.target.value)}
                                                className={`reg-input${fieldErrors.username ? ' reg-input-err' : ''}`}
                                                style={{ ...inputBase, padding: '13px 14px 13px 42px' }}
                                            />
                                        </div>
                                    </Field>

                                    {/* Email */}
                                    <Field label="Email" optional error={fieldErrors.email} C={C}>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input
                                                type="email" name="email" placeholder="your@email.com"
                                                value={form.email}
                                                onChange={e => set('email', e.target.value)}
                                                className={`reg-input${fieldErrors.email ? ' reg-input-err' : ''}`}
                                                style={{ ...inputBase, padding: '13px 14px 13px 42px' }}
                                            />
                                        </div>
                                    </Field>

                                    {/* Organization */}
                                    <Field label="Organization" optional error={fieldErrors.organization} C={C}>
                                        <div style={{ position: 'relative' }}>
                                            <Building2 size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input
                                                type="text" name="organization" placeholder="Your company or institution"
                                                value={form.organization}
                                                onChange={e => set('organization', e.target.value)}
                                                className="reg-input"
                                                style={{ ...inputBase, padding: '13px 14px 13px 42px' }}
                                            />
                                        </div>
                                    </Field>

                                    {/* Role */}
                                    <Field label="Role" error={fieldErrors.role} C={C}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                            {ROLES.map(r => {
                                                const active = form.role === r.value;
                                                return (
                                                    <button
                                                        key={r.value} type="button"
                                                        className="role-opt"
                                                        onClick={() => set('role', r.value)}
                                                        style={{
                                                            textAlign: 'left', padding: '10px 12px',
                                                            background: active ? `${C.accent}12` : C.surface,
                                                            border: `1px solid ${active ? C.accent : C.border}`,
                                                            borderRadius: 10, cursor: 'pointer',
                                                            transition: 'border-color 0.15s',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                            <span style={{
                                                                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                                                border: `2px solid ${active ? C.accent : C.border}`,
                                                                background: active ? C.accent : 'transparent',
                                                            }} />
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: active ? C.accent : C.textPri }}>{r.label}</span>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: 10, color: C.textSec, lineHeight: 1.4 }}>{r.desc}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </Field>

                                    {/* Password */}
                                    <Field label="Password" error={fieldErrors.password} C={C}>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input
                                                type={showPw ? 'text' : 'password'} name="password"
                                                placeholder="Min. 8 characters"
                                                value={form.password}
                                                onChange={e => set('password', e.target.value)}
                                                className={`reg-input${fieldErrors.password ? ' reg-input-err' : ''}`}
                                                style={{ ...inputBase, padding: '13px 44px 13px 42px' }}
                                            />
                                            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, padding: 0 }}>
                                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {/* Strength meter */}
                                        {form.password && (
                                            <div style={{ marginTop: 8 }}>
                                                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                                    {[1,2,3,4,5].map(i => (
                                                        <div key={i} style={{
                                                            flex: 1, height: 3, borderRadius: 2,
                                                            background: i <= strength.score ? strength.color : C.border,
                                                            transition: 'background 0.2s',
                                                        }} />
                                                    ))}
                                                </div>
                                                <p style={{ margin: 0, fontSize: 11, color: strength.color, fontWeight: 600 }}>
                                                    {strength.label}
                                                    <span style={{ color: C.textMuted, fontWeight: 400 }}> — use uppercase, numbers & symbols to strengthen</span>
                                                </p>
                                            </div>
                                        )}
                                    </Field>

                                    {/* Confirm password */}
                                    <div style={{ marginBottom: 28 }}>
                                        <Field label="Confirm Password" error={fieldErrors.confirm} C={C}>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                                <input
                                                    type={showCf ? 'text' : 'password'} name="confirm"
                                                    placeholder="Repeat your password"
                                                    value={form.confirm}
                                                    onChange={e => set('confirm', e.target.value)}
                                                    className={`reg-input${fieldErrors.confirm ? ' reg-input-err' : ''}`}
                                                    style={{ ...inputBase, padding: '13px 44px 13px 42px' }}
                                                />
                                                <button type="button" onClick={() => setShowCf(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, padding: 0 }}>
                                                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </Field>
                                        {/* Match indicator */}
                                        {form.confirm && !fieldErrors.confirm && (
                                            <p style={{ margin: '-8px 0 0', fontSize: 11, color: form.password === form.confirm ? C.green : C.red, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {form.password === form.confirm
                                                    ? <><CheckCircle size={11} /> Passwords match</>
                                                    : <><AlertCircle size={11} /> Passwords do not match</>
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit" disabled={loading}
                                        className="reg-btn"
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: loading ? C.border : C.accent,
                                            color: isLight ? '#fff' : '#000',
                                            border: 'none', borderRadius: 10,
                                            fontSize: 15, fontWeight: 700,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'opacity 0.15s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        }}
                                    >
                                        {loading
                                            ? <><div style={{ width: 18, height: 18, border: `2px solid ${C.bg}44`, borderTop: `2px solid ${isLight ? '#fff' : '#000'}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating account…</>
                                            : 'Create Account'
                                        }
                                    </button>
                                </form>

                                <p style={{ margin: '24px 0 0', fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
                                    Shanduko Threat Intelligence Platform · Secure access only
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
