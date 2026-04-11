import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { registerUser } from '../api/authService';

export default function RegisterPage() {
    const { theme: C } = useTheme();
    const [form, setForm]     = useState({ username: '', email: '', password: '', confirm: '' });
    const [error, setError]   = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            await registerUser({ username: form.username, email: form.email, password: form.password });
            setSuccess(true);
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                const msg = Object.values(data).flat().join(' ');
                setError(msg || 'Registration failed. Please try again.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isLight = C.key === 'light';

    const inputStyle = {
        width: '100%', padding: '13px 14px 13px 42px',
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, fontSize: 14, color: C.textPri,
        transition: 'border-color 0.15s, box-shadow 0.15s',
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes spin  { to { transform: rotate(360deg); } }
                .reg-input:focus { outline: none !important; border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accent}22 !important; }
                .reg-btn:hover:not(:disabled) { opacity: 0.88 !important; }
            `}</style>

            <div style={{
                position: 'fixed', inset: 0, zIndex: 999,
                display: 'flex', fontFamily: "'Segoe UI', system-ui, sans-serif",
                background: C.bg,
            }}>
                {/* ── LEFT PANEL ── */}
                <div style={{
                    width: '45%', flexShrink: 0,
                    background: `linear-gradient(145deg, ${C.surface} 0%, ${C.bg} 100%)`,
                    borderRight: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 48, position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: `${C.accent}0c`, filter: 'blur(60px)', pointerEvents: 'none' }} />

                    <div style={{ animation: 'float 4s ease-in-out infinite', marginBottom: 32, zIndex: 1 }}>
                        <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent}88)`, borderRadius: 20, padding: 20, display: 'inline-flex', boxShadow: `0 20px 40px ${C.accent}44` }}>
                            <Shield size={44} color="#fff" />
                        </div>
                    </div>

                    <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, color: C.textPri, textAlign: 'center', zIndex: 1 }}>
                        Shanduko<br />
                        <span style={{ color: C.accent }}>Threat Intel</span>
                    </h1>
                    <p style={{ margin: 0, fontSize: 15, color: C.textSec, textAlign: 'center', lineHeight: 1.6, maxWidth: 280, zIndex: 1 }}>
                        Create an account to start analysing files with ML-powered threat intelligence.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 36, justifyContent: 'center', zIndex: 1 }}>
                        {['YARA Engine', 'CVE Matching', 'IOC Extraction', 'ML Scoring'].map(f => (
                            <span key={f} style={{ background: `${C.accent}18`, border: `1px solid ${C.accent}44`, color: C.accent, fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20 }}>{f}</span>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
                    <div style={{ width: '100%', maxWidth: 420 }}>

                        {success ? (
                            /* ── Success state ── */
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ background: `${C.green}18`, borderRadius: '50%', padding: 20, display: 'inline-flex', marginBottom: 20 }}>
                                    <CheckCircle size={40} color={C.green} />
                                </div>
                                <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, color: C.textPri }}>Account created!</h2>
                                <p style={{ margin: '0 0 28px', fontSize: 14, color: C.textSec }}>
                                    Your account is ready. Sign in to get started.
                                </p>
                                <Link
                                    to="/login"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: '100%', padding: '14px',
                                        background: C.accent, color: '#000',
                                        borderRadius: 10, fontSize: 15, fontWeight: 700,
                                        textDecoration: 'none',
                                    }}
                                >
                                    Go to Sign In
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: C.textPri }}>Create account</h2>
                                <p style={{ margin: '0 0 28px', fontSize: 14, color: C.textSec }}>
                                    Already have an account?{' '}
                                    <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                                </p>

                                {error && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: `${C.red}18`, border: `1px solid ${C.red}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 22 }}>
                                        <AlertCircle size={16} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <p style={{ margin: 0, fontSize: 13, color: C.red }}>{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Username */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 7 }}>Username</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input type="text" name="username" placeholder="Choose a username" onChange={set} required className="reg-input" style={inputStyle} />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 7 }}>Email <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}>(optional)</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input type="email" name="email" placeholder="your@email.com" onChange={set} className="reg-input" style={inputStyle} />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 7 }}>Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input
                                                type={showPw ? 'text' : 'password'} name="password"
                                                placeholder="Min. 8 characters" onChange={set} required
                                                className="reg-input" style={{ ...inputStyle, padding: '13px 44px 13px 42px' }}
                                            />
                                            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, padding: 0 }}>
                                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm password */}
                                    <div style={{ marginBottom: 26 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 7 }}>Confirm Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            <input type={showPw ? 'text' : 'password'} name="confirm" placeholder="Repeat your password" onChange={set} required className="reg-input" style={inputStyle} />
                                        </div>
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
                                            ? <><div style={{ width: 18, height: 18, border: `2px solid ${C.bg}`, borderTop: `2px solid ${isLight ? '#fff' : '#000'}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating account…</>
                                            : 'Create Account'
                                        }
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
