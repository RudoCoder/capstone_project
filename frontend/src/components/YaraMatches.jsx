import { useTheme } from '../context/ThemeContext';
import { Shield } from 'lucide-react';

export default function YaraMatches({ matches }) {
    const { theme: C } = useTheme();

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Shield size={17} color={C.red} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPri }}>YARA Matches</p>
                <span style={{ marginLeft: 'auto', background: `${C.red}22`, border: `1px solid ${C.red}44`, color: C.red, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{matches.length}</span>
            </div>
            {matches.length === 0
                ? <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>No YARA rules matched.</p>
                : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {matches.map((m) => (
                            <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: m.rule?.description ? 6 : 0 }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.textPri, fontFamily: 'monospace' }}>{m.rule?.name}</p>
                                    {m.matched_string && (
                                        <span style={{ fontSize: 11, color: C.textSec, fontFamily: 'monospace', background: C.border, padding: '2px 8px', borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>
                                            {m.matched_string}
                                        </span>
                                    )}
                                </div>
                                {m.rule?.description && (
                                    <p style={{ margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{m.rule.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    );
}
