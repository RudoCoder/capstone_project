import { useTheme } from '../context/ThemeContext';
import { Bug } from 'lucide-react';

const cvssColor = (score, C) => {
    if (score >= 9) return C.red;
    if (score >= 7) return '#f97316';
    if (score >= 4) return C.orange;
    return C.green;
};

const cvssLabel = (score) => {
    if (score >= 9) return 'Critical';
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
};

export default function CVEList({ cves }) {
    const { theme: C } = useTheme();

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Bug size={17} color={C.purple} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPri }}>CVE Matches</p>
                <span style={{ marginLeft: 'auto', background: `${C.purple}22`, border: `1px solid ${C.purple}44`, color: C.purple, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{cves.length}</span>
            </div>
            {cves.length === 0
                ? <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>No CVEs matched.</p>
                : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {cves.map((m) => {
                            const col = cvssColor(m.cve?.severity, C);
                            return (
                                <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: 'monospace' }}>{m.cve?.cve_id}</p>
                                        <span style={{ background: `${col}22`, border: `1px solid ${col}44`, color: col, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                                            {cvssLabel(m.cve?.severity)} {m.cve?.severity != null ? m.cve.severity.toFixed(1) : ''}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {m.cve?.description}
                                    </p>
                                    {m.matched_text && (
                                        <p style={{ margin: '6px 0 0', fontSize: 11, color: C.textMuted, fontFamily: 'monospace', background: C.border, padding: '4px 8px', borderRadius: 6, wordBreak: 'break-all' }}>
                                            Match: {m.matched_text}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            }
        </div>
    );
}
