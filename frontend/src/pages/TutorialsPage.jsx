import { useEffect, useState } from 'react';
import { getTutorials } from '../api/tutorialService';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, ExternalLink, FileText, ChevronRight } from 'lucide-react';

export default function TutorialsPage() {
    const { theme: C } = useTheme();
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTutorials()
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const introduction = data.find(t => t.title === 'Introduction');
    const stages = data.filter(t => t.title !== 'Introduction');

    const stageColors = ['#00c2ff', '#a78bfa', '#22d3a0', '#fb923c', '#f43f5e', '#38bdf8'];

    return (
        <AppLayout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .stage-card:hover { border-color: rgba(0,194,255,0.5) !important; transform: translateY(-2px); }
                .open-btn:hover { background: rgba(0,194,255,0.2) !important; }
                .intro-btn:hover { background: #00a8e0 !important; }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ background: `${C.accent}1a`, borderRadius: 10, padding: 10 }}>
                        <BookOpen size={20} color={C.accent} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>Learning Hub</h1>
                </div>
                <p style={{ margin: '0 0 0 44px', fontSize: 13, color: C.textSec }}>
                    Threat Intelligence Programme — {data.length} resources
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>Loading resources…</p>
                </div>
            )}

            {!loading && (
                <>
                    {/* Introduction */}
                    {introduction && (
                        <div style={{
                            background: `linear-gradient(135deg, #0d1b2e 0%, #111827 100%)`,
                            border: `1px solid ${C.accent}33`,
                            borderRadius: 16,
                            padding: '28px 32px',
                            marginBottom: 32,
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* glow orb */}
                            <div style={{
                                position: 'absolute', top: -40, right: -40,
                                width: 160, height: 160,
                                background: `${C.accent}18`, borderRadius: '50%',
                                filter: 'blur(40px)', pointerEvents: 'none',
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 260 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <span style={{
                                            background: C.accent, color: '#0a0f1e',
                                            fontSize: 11, fontWeight: 800, letterSpacing: 1,
                                            padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
                                        }}>Introduction</span>
                                        <span style={{ fontSize: 12, color: C.textSec }}>Cyber Threat Intelligence</span>
                                    </div>

                                    <p style={{
                                        margin: '0 0 20px', fontSize: 14, color: C.textPri,
                                        lineHeight: 1.7, maxWidth: 680,
                                    }}>
                                        {introduction.description}
                                    </p>
                                </div>

                                <a
                                    href={introduction.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="intro-btn"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        background: C.accent, color: '#0a0f1e',
                                        fontWeight: 700, fontSize: 13,
                                        padding: '11px 22px', borderRadius: 10,
                                        textDecoration: 'none', whiteSpace: 'nowrap',
                                        transition: 'background 0.15s',
                                        flexShrink: 0, alignSelf: 'flex-end',
                                    }}
                                >
                                    <FileText size={15} />
                                    Open Programme Overview
                                    <ExternalLink size={13} />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Stages */}
                    {stages.length > 0 && (
                        <div>
                            <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
                                Programme Stages
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {stages.map((tut, idx) => {
                                    const color = stageColors[idx % stageColors.length];
                                    const stageNum = idx + 1;
                                    return (
                                        <div
                                            key={tut.id}
                                            className="stage-card"
                                            style={{
                                                background: C.card,
                                                border: `1px solid ${C.border}`,
                                                borderRadius: 14,
                                                padding: '20px 24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 20,
                                                transition: 'border-color 0.15s, transform 0.15s',
                                            }}
                                        >
                                            {/* Stage badge */}
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                                background: `${color}18`, border: `1px solid ${color}33`,
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1 }}>Stage</span>
                                                <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.2 }}>{stageNum}</span>
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: C.textPri }}>
                                                    {tut.title}
                                                </p>
                                                {tut.description && (
                                                    <p style={{
                                                        margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.6,
                                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {tut.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Open button */}
                                            <a
                                                href={tut.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="open-btn"
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    background: `${C.accent}12`,
                                                    border: `1px solid ${C.accent}33`,
                                                    color: C.accent,
                                                    fontSize: 12, fontWeight: 600,
                                                    padding: '8px 16px', borderRadius: 8,
                                                    textDecoration: 'none', whiteSpace: 'nowrap',
                                                    flexShrink: 0,
                                                    transition: 'background 0.15s',
                                                }}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                Open Document
                                                <ChevronRight size={13} />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {data.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ background: `${C.accent}18`, borderRadius: 16, padding: 20, display: 'inline-flex', marginBottom: 16 }}>
                                <BookOpen size={32} color={C.accent} />
                            </div>
                            <p style={{ color: C.textPri, fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>No tutorials yet</p>
                            <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>Run migrations to seed the programme content.</p>
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
}
