import { useState, useRef } from 'react';
import { uploadFile } from '../api/uploadService';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Cpu } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';

export default function UploadPage() {
    const { theme: C } = useTheme();
    const navigate = useNavigate();
    const inputRef  = useRef(null);

    const [file, setFile]         = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus]     = useState(null); // 'success' | 'error'
    const [message, setMessage]   = useState('');
    const [dragging, setDragging] = useState(false);

    const isLight = C.key === 'light';

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
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
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
                        disabled={!file || uploading}
                        style={{
                            width: '100%', padding: '14px',
                            background: (!file || uploading) ? C.border : C.accent,
                            color: isLight ? '#fff' : '#000',
                            border: 'none', borderRadius: 12,
                            fontSize: 15, fontWeight: 700,
                            cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'opacity 0.15s',
                        }}
                    >
                        {uploading
                            ? <><div style={{ width: 18, height: 18, border: `2px solid ${C.bg}44`, borderTop: `2px solid ${isLight ? '#fff' : '#000'}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Analysing…</>
                            : <><Cpu size={17} /> Start Analysis</>
                        }
                    </button>
                </div>

                {/* ── INFO PANEL ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { step: '01', title: 'Hash & Store',     desc: 'File is SHA-256 hashed and stored securely.' },
                        { step: '02', title: 'IOC Extraction',   desc: 'IPs, domains, URLs, hashes and emails are extracted.' },
                        { step: '03', title: 'YARA Scanning',    desc: 'File is matched against community YARA rule sets.' },
                        { step: '04', title: 'CVE Matching',     desc: 'Known CVEs referenced in the file are identified.' },
                        { step: '05', title: 'ML Risk Scoring',  desc: 'A trained model assigns a 0–100 risk score.' },
                    ].map(({ step, title, desc }) => (
                        <div key={step} style={{ display: 'flex', gap: 14, padding: '16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, minWidth: 24, marginTop: 2 }}>{step}</span>
                            <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.textPri }}>{title}</p>
                                <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
