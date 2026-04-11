import { useTheme } from '../context/ThemeContext';

export default function RiskIndicator({ score }) {
    const { theme: C } = useTheme();
    const s = score || 0;
    const color = s >= 70 ? C.red : s >= 40 ? C.orange : C.green;
    const label = s >= 70 ? 'Critical' : s >= 40 ? 'Medium' : 'Low';
    const circumference = 2 * Math.PI * 54;
    const dash = circumference - (s / 100) * circumference;

    return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 124, height: 124 }}>
                <svg width="124" height="124" viewBox="0 0 124 124">
                    <circle cx="62" cy="62" r="54" fill="none" stroke={C.border} strokeWidth="10" />
                    <circle
                        cx="62" cy="62" r="54" fill="none"
                        stroke={color} strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={dash}
                        strokeLinecap="round"
                        transform="rotate(-90 62 62)"
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{s}</span>
                    <span style={{ fontSize: 11, color: C.textSec }}>/ 100</span>
                </div>
            </div>
            <span style={{ padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${color}22`, border: `1px solid ${color}44`, color }}>{label}</span>
        </div>
    );
}
