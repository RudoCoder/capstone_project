import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import { getAllAnalysis } from '../api/analysisService';
import { submitFeedback } from '../api/feedbackService';
import { MessageSquare, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

const FEEDBACK_TYPES = [
    { value: 'correct',        label: 'Correct Detection',       desc: 'The analysis correctly identified the threat.' },
    { value: 'false_positive', label: 'False Positive',          desc: 'The file was flagged but is actually safe.' },
    { value: 'false_negative', label: 'False Negative',          desc: 'A real threat was missed by the analysis.' },
    { value: 'improvement',    label: 'Improvement Suggestion',  desc: 'General suggestion to improve the platform.' },
];

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export default function FeedbackPage() {
    const { theme: C } = useTheme();

    const [analyses, setAnalyses] = useState([]);
    const [form, setForm] = useState({ analysis: '', feedback_type: '', comment: '' });
    const [status, setStatus]   = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getAllAnalysis()
            .then(r => setAnalyses(r.data))
            .catch(console.error);
    }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.analysis || !form.feedback_type) return;
        setSubmitting(true);
        setStatus(null);
        try {
            await submitFeedback({
                analysis: form.analysis,
                feedback_type: form.feedback_type,
                comment: form.comment,
            });
            setStatus('success');
            setMessage('Feedback submitted — thank you!');
            setForm({ analysis: '', feedback_type: '', comment: '' });
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.detail || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const selectStyle = {
        width: '100%', padding: '11px 14px',
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, fontSize: 14, color: C.textPri,
        appearance: 'none', outline: 'none', cursor: 'pointer',
    };

    return (
        <AppLayout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .fb-type:hover { border-color: ${C.accent}88 !important; }
                select option { background: #111827; color: #e2e8f0; }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ background: `${C.accent}1a`, borderRadius: 10, padding: 10 }}>
                        <MessageSquare size={20} color={C.accent} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>Submit Feedback</h1>
                </div>
                <p style={{ margin: '0 0 0 44px', fontSize: 13, color: C.textSec }}>
                    Help improve Shanduko by rating analysis results
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

                {/* ── FORM ── */}
                <form onSubmit={handleSubmit}>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>

                        {/* Analysis selector */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>
                                Select Analysis <span style={{ color: C.red }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={form.analysis}
                                    onChange={e => set('analysis', e.target.value)}
                                    required
                                    style={selectStyle}
                                >
                                    <option value="">— Choose a scan result —</option>
                                    {analyses.map(a => (
                                        <option key={a.id} value={a.id}>
                                            #{a.id} · {a.file_name} · {fmt(a.created_at)} · Risk: {a.risk_score ?? '—'}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={15} color={C.textMuted} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        {/* Feedback type */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 10 }}>
                                Feedback Type <span style={{ color: C.red }}>*</span>
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {FEEDBACK_TYPES.map(({ value, label, desc }) => {
                                    const active = form.feedback_type === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            className="fb-type"
                                            onClick={() => set('feedback_type', value)}
                                            style={{
                                                textAlign: 'left', padding: '14px 16px',
                                                background: active ? `${C.accent}12` : C.surface,
                                                border: `1px solid ${active ? C.accent : C.border}`,
                                                borderRadius: 12, cursor: 'pointer',
                                                transition: 'border-color 0.15s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{
                                                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                                                    border: `2px solid ${active ? C.accent : C.border}`,
                                                    background: active ? C.accent : 'transparent',
                                                    display: 'inline-block',
                                                }} />
                                                <span style={{ fontSize: 13, fontWeight: 600, color: active ? C.accent : C.textPri }}>{label}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 11, color: C.textSec, lineHeight: 1.5, paddingLeft: 20 }}>{desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Comment */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>
                                Additional Comments <span style={{ fontSize: 11, fontWeight: 400 }}>(optional)</span>
                            </label>
                            <textarea
                                value={form.comment}
                                onChange={e => set('comment', e.target.value)}
                                placeholder="Describe what was correct, incorrect, or what could be improved…"
                                rows={5}
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: C.surface, border: `1px solid ${C.border}`,
                                    borderRadius: 10, fontSize: 13, color: C.textPri,
                                    resize: 'vertical', outline: 'none', lineHeight: 1.6,
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Status banner */}
                        {status && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: status === 'success' ? `${C.green}18` : `${C.red}18`,
                                border: `1px solid ${status === 'success' ? C.green : C.red}44`,
                                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                            }}>
                                {status === 'success'
                                    ? <CheckCircle size={16} color={C.green} />
                                    : <AlertCircle size={16} color={C.red} />
                                }
                                <p style={{ margin: 0, fontSize: 13, color: status === 'success' ? C.green : C.red }}>{message}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !form.analysis || !form.feedback_type}
                            style={{
                                width: '100%', padding: '13px',
                                background: (submitting || !form.analysis || !form.feedback_type) ? C.border : C.accent,
                                color: '#000', border: 'none', borderRadius: 10,
                                fontSize: 14, fontWeight: 700,
                                cursor: (submitting || !form.analysis || !form.feedback_type) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'opacity 0.15s',
                            }}
                        >
                            {submitting
                                ? <><div style={{ width: 16, height: 16, border: '2px solid #00000033', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Submitting…</>
                                : <><MessageSquare size={15} /> Submit Feedback</>
                            }
                        </button>
                    </div>
                </form>

                {/* ── INFO PANEL ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px' }}>
                        <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: C.textPri }}>Why submit feedback?</p>
                        {[
                            'Improves the ML model accuracy over time',
                            'Helps identify gaps in YARA rule coverage',
                            'Reduces false positive / negative rates',
                            'Strengthens CVE detection precision',
                        ].map(txt => (
                            <div key={txt} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, flexShrink: 0, marginTop: 5 }} />
                                <p style={{ margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{txt}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total scans available</p>
                        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.accent }}>{analyses.length}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
