import { useState, useRef, useEffect } from 'react';
import { uploadFile } from '../api/uploadService';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Cpu, Hash, Search, Shield, BookOpen, Brain } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';

const ANALYSIS_STEPS = [
    { icon: Hash,     label: 'Hash & Store',    detail: 'Computing SHA-256 fingerprint…' },
    { icon: Search,   label: 'IOC Extraction',  detail: 'Scanning for IPs, domains, URLs…' },
    { icon: Shield,   label: 'YARA Scanning',   detail: 'Matching community rule sets…' },
    { icon: BookOpen, label: 'CVE Matching',     detail: 'Cross-referencing vulnerability DB…' },
    { icon: Brain,    label: 'ML Risk Scoring',  detail: 'Running predictive model…' },
];

export default function UploadPage() {
    const { theme: C } = useTheme();
    const navigate = useNavigate();
    const inputRef  = useRef(null);

    const [file, setFile]           = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus]       = useState(null); // 'success' | 'error'
    const [message, setMessage]     = useState('');
    const [dragging, setDragging]   = useState(false);
    const [activeStep, setActiveStep]     = useState(0);
    const [completedSteps, setCompletedSteps] = useState(new Set());

    const isLight = C.key === 'light';

    // Cycle through analysis steps while uploading
    useEffect(() => {
        if (!uploading) {
            setActiveStep(0);
            setCompletedSteps(new Set());
            return;
        }
        setActiveStep(0);
        setCompletedSteps(new Set());
        const timings = [0, 900, 1800, 2700, 3600];
        const timers = timings.map((delay, i) =>
            setTimeout(() => {
                setActiveStep(i);
                if (i > 0) setCompletedSteps(prev => new Set([...prev, i - 1]));
            }, delay)
        );
        // Mark the last step complete after it has had time to animate
        const finalTimer = setTimeout(() => {
            setCompletedSteps(new Set([0, 1, 2, 3, 4]));
        }, 3600 + 800);
        return () => { timers.forEach(clearTimeout); clearTimeout(finalTimer); };
    }, [uploading]);

    const pick = (f) => {
        if (!f) return;
        setFile(f);
        setStatus(null);
        setMessage('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) pick(f);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus(null);
        try {
            const res = await uploadFile(file);
            setActiveStep(4);
            setCompletedSteps(new Set([0, 1, 2, 3, 4]));
            setStatus('success');
            setMessage(`Analysis started! ID: ${res.data.analysis_id}`);
            setTimeout(() => navigate('/dashboard'), 2200);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'Upload failed. Make sure the server is running and you are logged in.');
        } finally {
            setUploading(false);
        }
    };

    const fmt = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <AppLayout>
            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                @keyframes scanline {
                    0%   { transform: translateY(-100%); opacity: 0; }
                    10%  { opacity: 0.6; }
                    90%  { opacity: 0.6; }
                    100% { transform: translateY(400%); opacity: 0; }
                }
                @keyframes radarPing {
                    0%   { transform: scale(0.6); opacity: 0.8; }
                    100% { transform: scale(1.9); opacity: 0; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes stepGlow {
                    0%,100% { box-shadow: 0 0 0 0 ${C.accent}44; }
                    50%     { box-shadow: 0 0 12px 4px ${C.accent}44; }
                }
                .drop-zone:hover { border-color: ${C.accent} !important; background: ${C.accentDim} !important; }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>Upload File</h1>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSec }}>Submit a file for malware analysis, IOC extraction, and ML risk scoring</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

                {/* ── UPLOAD CARD ── */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>

                    {uploading ? (
                        /* ── ANALYSIS ANIMATION PANEL ── */
                        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>

                            {/* Radar orb */}
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 140, marginBottom: 28 }}>
                                {/* Ping rings */}
                                {[0, 400, 800].map(delay => (
                                    <div key={delay} style={{
                                        position: 'absolute', width: 100, height: 100,
                                        borderRadius: '50%',
                                        border: `1.5px solid ${C.accent}`,
                                        animation: `radarPing 1.6s ${delay}ms ease-out infinite`,
                                    }} />
                                ))}
                                {/* Outer ring */}
                                <div style={{
                                    position: 'absolute', width: 100, height: 100, borderRadius: '50%',
                                    border: `2px solid ${C.accent}33`,
                                }} />
                                {/* Spinning arc */}
                                <div style={{
                                    position: 'absolute', width: 100, height: 100, borderRadius: '50%',
                                    border: `2px solid transparent`,
                                    borderTop: `2px solid ${C.accent}`,
                                    animation: 'spin 1.1s linear infinite',
                                }} />
                                {/* Inner glow circle */}
                                <div style={{
                                    width: 68, height: 68, borderRadius: '50%',
                                    background: `radial-gradient(circle, ${C.accent}22 0%, ${C.accent}06 70%)`,
                                    border: `1px solid ${C.accent}44`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    animation: 'pulse 1.8s ease-in-out infinite',
                                }}>
                                    {(() => { const Icon = ANALYSIS_STEPS[activeStep].icon; return <Icon size={24} color={C.accent} />; })()}
                                </div>
                            </div>

                            {/* Current step label */}
                            <p key={activeStep} style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.textPri, animation: 'fadeInUp 0.3s ease' }}>
                                {ANALYSIS_STEPS[activeStep].label}
                            </p>
                            <p key={`d-${activeStep}`} style={{ margin: '0 0 28px', fontSize: 12, color: C.textSec, animation: 'fadeInUp 0.3s ease 0.05s both' }}>
                                {ANALYSIS_STEPS[activeStep].detail}
                            </p>

                            {/* Scanline progress bar */}
                            <div style={{ position: 'relative', height: 6, background: C.border, borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 99,
                                    background: `linear-gradient(90deg, ${C.accent}88, ${C.accent})`,
                                    width: `${((activeStep + 1) / ANALYSIS_STEPS.length) * 100}%`,
                                    transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                                }} />
                                {/* Moving sheen */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, height: '100%', width: 40,
                                    background: `linear-gradient(90deg, transparent, ${C.accent}88, transparent)`,
                                    animation: 'scanline 1.4s ease-in-out infinite',
                                    pointerEvents: 'none',
                                }} />
                            </div>

                            {/* Step checklist */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                                {ANALYSIS_STEPS.map((s, i) => {
                                    const done   = completedSteps.has(i);
                                    const active = i === activeStep;
                                    const StepIcon = s.icon;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                            borderRadius: 10,
                                            background: active ? C.accentDim : done ? `${C.green}10` : 'transparent',
                                            border: `1px solid ${active ? C.accent + '55' : done ? C.green + '33' : C.border}`,
                                            transition: 'all 0.4s ease',
                                            animation: active ? 'stepGlow 1.5s ease-in-out infinite' : 'none',
                                        }}>
                                            <div style={{ flexShrink: 0 }}>
                                                {done
                                                    ? <CheckCircle size={16} color={C.green} />
                                                    : active
                                                        ? <div style={{ width: 16, height: 16, border: `2px solid ${C.accent}44`, borderTop: `2px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                                        : <StepIcon size={16} color={C.textMuted} />
                                                }
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: done ? C.green : active ? C.textPri : C.textSec, transition: 'color 0.3s' }}>
                                                {s.label}
                                            </span>
                                            {active && (
                                                <span style={{ marginLeft: 'auto', fontSize: 11, color: C.accent, animation: 'pulse 1s ease-in-out infinite' }}>
                                                    running…
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Drop zone */}
                            <div
                                className="drop-zone"
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${dragging ? C.accent : C.border}`,
                                    borderRadius: 14,
                                    padding: '48px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: dragging ? C.accentDim : 'transparent',
                                    transition: 'all 0.2s',
                                    marginBottom: 24,
                                }}
                            >
                                <input ref={inputRef} type="file" onChange={e => pick(e.target.files[0])} style={{ display: 'none' }} />
                                <div style={{ background: `${C.accent}18`, borderRadius: 14, padding: 16, display: 'inline-flex', marginBottom: 16 }}>
                                    <UploadCloud size={36} color={C.accent} />
                                </div>
                                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: C.textPri }}>
                                    {dragging ? 'Drop file here' : 'Drag & drop your file'}
                                </p>
                                <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>or <span style={{ color: C.accent, fontWeight: 600 }}>click to browse</span></p>
                                <p style={{ margin: '12px 0 0', fontSize: 11, color: C.textMuted }}>Any file type accepted · Max recommended 50 MB</p>
                            </div>

                            {/* Selected file */}
                            {file && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    background: C.surface, border: `1px solid ${C.border}`,
                                    borderRadius: 12, padding: '14px 16px', marginBottom: 24,
                                }}>
                                    <div style={{ background: `${C.accent}18`, borderRadius: 10, padding: 10, flexShrink: 0 }}>
                                        <FileText size={22} color={C.accent} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                                        <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec }}>{fmt(file.size)} · {file.type || 'Unknown type'}</p>
                                    </div>
                                    <button onClick={() => { setFile(null); setStatus(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, padding: 4 }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Status banner */}
                            {status && (
                                <div style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                    background: status === 'success' ? `${C.green}18` : `${C.red}18`,
                                    border: `1px solid ${status === 'success' ? C.green : C.red}44`,
                                    borderRadius: 12, padding: '14px 16px', marginBottom: 24,
                                }}>
                                    {status === 'success'
                                        ? <CheckCircle size={18} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} />
                                        : <AlertCircle size={18} color={C.red}   style={{ flexShrink: 0, marginTop: 1 }} />
                                    }
                                    <p style={{ margin: 0, fontSize: 13, color: status === 'success' ? C.green : C.red, lineHeight: 1.5 }}>{message}</p>
                                </div>
                            )}

                            {/* Upload button */}
                            <button
                                onClick={handleUpload}
                                disabled={!file}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: !file ? C.border : C.accent,
                                    color: isLight ? '#fff' : '#000',
                                    border: 'none', borderRadius: 12,
                                    fontSize: 15, fontWeight: 700,
                                    cursor: !file ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'opacity 0.15s',
                                }}
                            >
                                <Cpu size={17} /> Start Analysis
                            </button>
                        </>
                    )}
                </div>

                {/* ── INFO PANEL ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {ANALYSIS_STEPS.map(({ label, detail }, i) => {
                        const stepNum = String(i + 1).padStart(2, '0');
                        const done    = completedSteps.has(i);
                        const active  = uploading && i === activeStep;
                        return (
                            <div key={i} style={{
                                display: 'flex', gap: 14, padding: '16px',
                                background: C.card,
                                border: `1px solid ${active ? C.accent + '55' : done ? C.green + '33' : C.border}`,
                                borderRadius: 12,
                                transition: 'border-color 0.4s, box-shadow 0.4s',
                                boxShadow: active ? `0 0 10px ${C.accent}22` : 'none',
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: done ? C.green : active ? C.accent : C.accent, minWidth: 24, marginTop: 2 }}>{stepNum}</span>
                                <div>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: done ? C.green : C.textPri, transition: 'color 0.3s' }}>{label}</p>
                                    <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{detail}</p>
                                </div>
                                {done && <CheckCircle size={15} color={C.green} style={{ marginLeft: 'auto', flexShrink: 0, alignSelf: 'center' }} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
