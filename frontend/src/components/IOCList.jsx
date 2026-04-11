import { useTheme } from '../context/ThemeContext';
import { Globe } from 'lucide-react';

const typeColor = (type, C) => {
    const map = { ip: C.red, domain: C.orange, url: C.purple, hash: C.accent, email: C.green };
    return map[type] || C.textSec;
};

export default function IOCList({ iocs }) {
    const { theme: C } = useTheme();

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Globe size={17} color={C.orange} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPri }}>Indicators of Compromise</p>
                <span style={{ marginLeft: 'auto', background: `${C.orange}22`, border: `1px solid ${C.orange}44`, color: C.orange, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{iocs.length}</span>
            </div>
            {iocs.length === 0
                ? <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>No IOCs extracted.</p>
                : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Type', 'Value', 'Source', 'Confidence'].map(h => (
                                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {iocs.map((item) => {
                                const col = typeColor(item.ioc?.type, C);
                                return (
                                    <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ background: `${col}22`, border: `1px solid ${col}44`, color: col, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                                                {item.ioc?.type?.toUpperCase() || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 12px', fontSize: 13, color: C.textPri, fontFamily: 'monospace', wordBreak: 'break-all' }}>{item.ioc?.value}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 12, color: C.textSec }}>{item.ioc?.source || '—'}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, minWidth: 60 }}>
                                                    <div style={{ width: `${(item.confidence_score || 0) * 100}%`, height: '100%', borderRadius: 2, background: C.accent }} />
                                                </div>
                                                <span style={{ fontSize: 12, color: C.textSec, minWidth: 32 }}>{Math.round((item.confidence_score || 0) * 100)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )
            }
        </div>
    );
}
