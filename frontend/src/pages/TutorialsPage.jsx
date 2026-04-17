import { useEffect, useState } from 'react';
import { getTutorials } from '../api/tutorialService';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, ExternalLink, FileText, ChevronRight, Play, Globe } from 'lucide-react';

const stageColors = ['#00c2ff', '#a78bfa', '#22d3a0', '#fb923c', '#f43f5e', '#38bdf8'];

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
    const stages       = data.filter(t => t.title !== 'Introduction' && t.tutorial_type === 'document');
    const videos       = data.filter(t => t.tutorial_type === 'video');
    const websites     = data.filter(t => t.tutorial_type === 'website');

    return (
        <AppLayout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .stage-card:hover  { border-color: rgba(0,194,255,0.45) !important; transform: translateY(-2px); }
                .video-card:hover  { border-color: rgba(244,63,94,0.45) !important; transform: translateY(-2px); }
                .site-card:hover   { border-color: rgba(34,211,160,0.45) !important; transform: translateY(-2px); }
                .open-btn:hover    { background: rgba(0,194,255,0.2) !important; }
                .play-btn:hover    { background: rgba(244,63,94,0.2) !important; }
                .visit-btn:hover   { background: rgba(34,211,160,0.2) !important; }
                .intro-btn:hover   { background: #00a8e0 !important; }
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
                                    <p style={{ margin: '0 0 20px', fontSize: 14, color: C.textPri, lineHeight: 1.7, maxWidth: 680 }}>
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

                    {/* ── Programme Stages (documents) ── */}
                    {stages.length > 0 && (
                        <Section label="Programme Stages" count={stages.length} C={C}>
                            {stages.map((tut, idx) => {
                                const color = stageColors[idx % stageColors.length];
                                return (
                                    <div key={tut.id} className="stage-card" style={cardStyle(C)}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                            background: `${color}18`, border: `1px solid ${color}33`,
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1 }}>Stage</span>
                                            <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.2 }}>{idx + 1}</span>
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: C.textPri }}>{tut.title}</p>
                                            {tut.description && <p style={descStyle(C)}>{tut.description}</p>}
                                        </div>

                                        <ResourceLink href={tut.url} className="open-btn" accentColor={C.accent} label="Open Document" />
                                    </div>
                                );
                            })}
                        </Section>
                    )}

                    {/* ── Videos ── */}
                    {videos.length > 0 && (
                        <Section label="Video Resources" count={videos.length} C={C} icon={<Play size={14} color="#f43f5e" />}>
                            {videos.map(tut => (
                                <div key={tut.id} className="video-card" style={cardStyle(C)}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                        background: '#f43f5e18', border: '1px solid #f43f5e33',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Play size={20} color="#f43f5e" />
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPri }}>{tut.title}</p>
                                            <span style={typePill('#f43f5e')}>YouTube</span>
                                        </div>
                                        {tut.description && <p style={descStyle(C)}>{tut.description}</p>}
                                    </div>

                                    <ResourceLink href={tut.url} className="play-btn" accentColor="#f43f5e" label="Watch" />
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* ── External Websites ── */}
                    {websites.length > 0 && (
                        <Section label="External Resources" count={websites.length} C={C} icon={<Globe size={14} color="#22d3a0" />}>
                            {websites.map(tut => (
                                <div key={tut.id} className="site-card" style={cardStyle(C)}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                        background: '#22d3a018', border: '1px solid #22d3a033',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Globe size={20} color="#22d3a0" />
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPri }}>{tut.title}</p>
                                            <span style={typePill('#22d3a0')}>Website</span>
                                        </div>
                                        {tut.description && <p style={descStyle(C)}>{tut.description}</p>}
                                    </div>

                                    <ResourceLink href={tut.url} className="visit-btn" accentColor="#22d3a0" label="Visit Site" />
                                </div>
                            ))}
                        </Section>
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

// ── helpers ───────────────────────────────────────────────────────────────────

function Section({ label, count, icon, C, children }) {
    return (
        <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
                {icon}
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {label}
                </p>
                <span style={{ fontSize: 11, color: C.textMuted }}>· {count}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        </div>
    );
}

function ResourceLink({ href, className, accentColor, label }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}33`,
                color: accentColor,
                fontSize: 12, fontWeight: 600,
                padding: '8px 16px', borderRadius: 8,
                textDecoration: 'none', whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'background 0.15s',
            }}
            onClick={e => e.stopPropagation()}
        >
            {label}
            <ChevronRight size={13} />
        </a>
    );
}

const cardStyle = C => ({
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    transition: 'border-color 0.15s, transform 0.15s',
});

const descStyle = C => ({
    margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.6,
    overflow: 'hidden', textOverflow: 'ellipsis',
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
});

const typePill = color => ({
    fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
    padding: '2px 8px', borderRadius: 20,
    background: `${color}18`, color, border: `1px solid ${color}33`,
    textTransform: 'uppercase', whiteSpace: 'nowrap',
});
