import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
    const { theme: C } = useTheme();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw]   = useState(false);

    const handleChange = (e) =>
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/token/', credentials);
            localStorage.setItem('access_token',  res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            window.location.href = '/dashboard';
        } catch {
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isLight = C.key === 'light';

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .login-input:focus {
                    outline: none !important;
                    border-color: ${C.accent} !important;
                    box-shadow: 0 0 0 3px ${C.accent}22 !important;
                }
                .login-btn:hover:not(:disabled) { opacity: 0.88 !important; }
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
                    {/* background glow */}
                    <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: `${C.accent}0c`, filter: 'blur(60px)', pointerEvents: 'none' }} />

                    {/* logo */}
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
                        Advanced malware analysis platform with ML-powered risk scoring and IOC intelligence.
                    </p>

                    {/* feature pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 36, justifyContent: 'center', zIndex: 1 }}>
                        {['YARA Engine', 'CVE Matching', 'IOC Extraction', 'ML Scoring'].map(f => (
                            <span key={f} style={{
                                background: `${C.accent}18`, border: `1px solid ${C.accent}44`,
                                color: C.accent, fontSize: 12, fontWeight: 600,
                                padding: '5px 14px', borderRadius: 20,
                            }}>{f}</span>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT PANEL (form) ── */}
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: 48,
                }}>
                    <div style={{ width: '100%', maxWidth: 400 }}>
                        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: C.textPri }}>Welcome back</h2>
                        <p style={{ margin: '0 0 36px', fontSize: 14, color: C.textSec }}>
                            Sign in to your account to continue · {' '}
                            <Link to="/register" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
                        </p>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: `${C.red}18`, border: `1px solid ${C.red}44`,
                                borderRadius: 10, padding: '12px 16px', marginBottom: 24,
                            }}>
                                <AlertCircle size={16} color={C.red} />
                                <p style={{ margin: 0, fontSize: 13, color: C.red }}>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Username */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Enter your username"
                                        onChange={handleChange}
                                        required
                                        className="login-input"
                                        style={{
                                            width: '100%', padding: '13px 14px 13px 42px',
                                            background: C.card, border: `1px solid ${C.border}`,
                                            borderRadius: 10, fontSize: 14, color: C.textPri,
                                            transition: 'border-color 0.15s, box-shadow 0.15s',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} color={C.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Enter your password"
                                        onChange={handleChange}
                                        required
                                        className="login-input"
                                        style={{
                                            width: '100%', padding: '13px 44px 13px 42px',
                                            background: C.card, border: `1px solid ${C.border}`,
                                            borderRadius: 10, fontSize: 14, color: C.textPri,
                                            transition: 'border-color 0.15s, box-shadow 0.15s',
                                        }}
                                    />
                                    <button type="button" onClick={() => setShowPw(p => !p)} style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: C.textSec,
                                    }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="login-btn"
                                style={{
                                    width: '100%', padding: '14px',
                                    background: loading ? C.border : C.accent,
                                    color: isLight ? '#fff' : '#000',
                                    border: 'none', borderRadius: 10,
                                    fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'opacity 0.15s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                {loading
                                    ? <><div style={{ width: 18, height: 18, border: `2px solid ${C.bg}`, borderTop: `2px solid ${isLight ? '#fff' : '#000'}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in…</>
                                    : 'Sign In'
                                }
                            </button>
                        </form>

                        <p style={{ margin: '28px 0 0', fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
                            Shanduko Threat Intelligence Platform · Secure access only
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
