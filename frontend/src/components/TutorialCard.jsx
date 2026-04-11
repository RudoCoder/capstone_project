import { useTheme } from '../context/ThemeContext';
import { BookOpen, ExternalLink } from 'lucide-react';

export default function TutorialCard({ tutorial }) {
    const { theme: C } = useTheme();

    return (
        <a
            href={tutorial.link_url || tutorial.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block', textDecoration: 'none',
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '20px 20px 16px',
                transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}88`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ background: `${C.accent}18`, borderRadius: 10, padding: 10 }}>
                    <BookOpen size={18} color={C.accent} />
                </div>
                <ExternalLink size={14} color={C.textSec} />
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: C.textPri, lineHeight: 1.4 }}>{tutorial.title}</p>
            {tutorial.description && (
                <p style={{ margin: '0 0 14px', fontSize: 12, color: C.textSec, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {tutorial.description}
                </p>
            )}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {tutorial.tutorial_type && (
                    <span style={{ background: `${C.purple}22`, border: `1px solid ${C.purple}44`, color: C.purple, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>
                        {tutorial.tutorial_type}
                    </span>
                )}
                <span style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginLeft: 'auto' }}>Open →</span>
            </div>
        </a>
    );
}
