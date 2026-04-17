import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import { getMLInsights } from '../api/analysisService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    Cpu, AlertTriangle, Globe, Shield, Bug,
    TrendingUp, ChevronRight, Info,
} from 'lucide-react';

// Feature weights are fixed — they reflect what the model was trained on
const FEATURE_IMPORTANCE = [
    { feature: 'YARA Matches',  weight: 38, color: '#f43f5e', icon: Shield,  desc: 'Signature-based malware rule matches' },
    { feature: 'IOC Count',     weight: 28, color: '#fb923c', icon: Globe,   desc: 'IP addresses, domains, URLs, hashes found' },
    { feature: 'CVE Matches',   weight: 20, color: '#a78bfa', icon: Bug,     desc: 'Known vulnerability identifiers referenced' },
    { feature: 'File Size',     weight: 14, color: '#00c2ff', icon: TrendingUp, desc: 'Unusually small/large files flag higher risk' },
];

const riskColor = (score, C) => {
    if (score >= 75) return C.red;
    if (score >= 50) return C.orange;
    if (score >= 25) return C.yellow;
    return C.green;
};

const riskLabel = (score) => {
    if (score >= 75) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 25) return 'Medium';
    return 'Low';
};

const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

// Custom tooltip for bar chart
const BarTooltip = (C) => ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
            <p style={{ margin: '0 0 6px', color: C.textSec, fontWeight: 600 }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ margin: '2px 0', color: p.color, fontWeight: 700 }}>
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

export default function MLAnalysisPage() {
    const { theme: C } = useTheme();
    const [data, setData]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMLInsights()
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <AppLayout>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: C.textSec, fontSize: 14, margin: 0 }}>Loading ML insights…</p>
            </div>
        </AppLayout>
    );

    const { total_scans, avg_risk_score, avg_ioc_count, avg_yara_count, avg_cve_count, threat_distribution, per_scan } = data || {};

    // Last 10 scans for the chart, reversed to chronological order
    const chartScans = [...(per_scan || [])].reverse().slice(-10);

    const BarTip = BarTooltip(C);

    return (
        <AppLayout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .ml-row:hover { background: ${C.border}44 !important; }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ background: `${C.accent}1a`, borderRadius: 10, padding: 10 }}>
                        <Cpu size={20} color={C.accent} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>ML Analysis</h1>
                </div>
                <p style={{ margin: '0 0 0 44px', fontSize: 13, color: C.textSec }}>
                    Machine learning risk scoring insights — powered by scikit-learn
                </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <MLStat label="Total Analyses" value={total_scans}              accent={C.accent}  icon={Cpu}           C={C} />
                <MLStat label="Avg Risk Score"  value={`${avg_risk_score}/100`} accent={riskColor(avg_risk_score, C)} icon={AlertTriangle} C={C} />
                <MLStat label="Avg IOC Count"   value={avg_ioc_count}           accent={C.orange}  icon={Globe}         C={C} />
                <MLStat label="Avg YARA Hits"   value={avg_yara_count}          accent={C.red}     icon={Shield}        C={C} />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

                {/* Feature breakdown per scan */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
                    <div style={{ marginBottom: 18 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPri }}>Feature Breakdown — Last 10 Scans</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec }}>IOC, YARA, and CVE counts that feed the ML model</p>
                    </div>
                    {chartScans.length === 0 ? (
                        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSec, fontSize: 13 }}>No scan data yet</div>
                    ) : (
                        <div style={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartScans} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                                    <XAxis dataKey="created_at" tickFormatter={fmt} tick={{ fill: C.textSec, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<BarTip />} />
                                    <Bar dataKey="ioc_count"  name="IOCs"  fill={C.orange} radius={[3, 3, 0, 0]} maxBarSize={18} />
                                    <Bar dataKey="yara_count" name="YARA"  fill={C.red}    radius={[3, 3, 0, 0]} maxBarSize={18} />
                                    <Bar dataKey="cve_count"  name="CVEs"  fill={C.purple} radius={[3, 3, 0, 0]} maxBarSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                        {[['IOCs', C.orange], ['YARA', C.red], ['CVEs', C.purple]].map(([l, c]) => (
                            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
                                <span style={{ fontSize: 12, color: C.textSec }}>{l}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Threat distribution */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: C.textPri }}>Threat Distribution</p>
                    <p style={{ margin: '0 0 20px', fontSize: 12, color: C.textSec }}>Classification of all scans</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Critical', key: 'critical', color: C.red    },
                            { label: 'High',     key: 'high',     color: C.orange },
                            { label: 'Medium',   key: 'medium',   color: C.yellow },
                            { label: 'Low',      key: 'low',      color: C.green  },
                        ].map(({ label, key, color }) => {
                            const val = threat_distribution?.[key] || 0;
                            const pct = total_scans ? Math.round((val / total_scans) * 100) : 0;
                            return (
                                <div key={key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontSize: 13, color: C.textSec }}>{label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color }}>{val} <span style={{ color: C.textMuted, fontWeight: 400 }}>({pct}%)</span></span>
                                    </div>
                                    <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Avg stats */}
                    <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Averages</p>
                        {[
                            { label: 'IOCs / scan',   value: avg_ioc_count,  color: C.orange },
                            { label: 'YARA / scan',   value: avg_yara_count, color: C.red    },
                            { label: 'CVEs / scan',   value: avg_cve_count,  color: C.purple },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: C.textSec }}>{label}</span>
                                <span style={{ fontWeight: 700, color }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature importance */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPri }}>Model Feature Importance</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec }}>Relative contribution of each input feature to the risk score prediction</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: `${C.accent}12`, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: '5px 10px', flexShrink: 0 }}>
                        <Info size={12} color={C.accent} />
                        <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>scikit-learn RandomForest</span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {FEATURE_IMPORTANCE.map(({ feature, weight, color, icon: Icon, desc }) => (
                        <div key={feature} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{feature}</span>
                                    <span style={{ fontSize: 13, fontWeight: 800, color }}>{weight}%</span>
                                </div>
                                <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 5 }}>
                                    <div style={{ width: `${weight}%`, height: '100%', background: color, borderRadius: 4 }} />
                                </div>
                                <p style={{ margin: 0, fontSize: 11, color: C.textSec }}>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top risk scans table */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
                <p style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, color: C.textPri }}>Highest Risk Scans</p>
                {(!per_scan || per_scan.length === 0) ? (
                    <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>No scan data yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['File', 'Risk Score', 'IOCs', 'YARA', 'CVEs', 'Threat', ''].map(h => (
                                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...per_scan].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8).map((s) => {
                                const color = riskColor(s.risk_score, C);
                                return (
                                    <tr key={s.id} className="ml-row" style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.12s' }}>
                                        <td style={{ padding: '11px 12px', fontSize: 13, color: C.textPri, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.file_name}</td>
                                        <td style={{ padding: '11px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 48, height: 4, background: C.border, borderRadius: 2 }}>
                                                    <div style={{ width: `${s.risk_score}%`, height: '100%', background: color, borderRadius: 2 }} />
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 28 }}>{s.risk_score}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '11px 12px', fontSize: 13, color: C.orange, fontWeight: 600 }}>{s.ioc_count}</td>
                                        <td style={{ padding: '11px 12px', fontSize: 13, color: C.red,    fontWeight: 600 }}>{s.yara_count}</td>
                                        <td style={{ padding: '11px 12px', fontSize: 13, color: C.purple, fontWeight: 600 }}>{s.cve_count}</td>
                                        <td style={{ padding: '11px 12px' }}>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                background: `${color}18`, border: `1px solid ${color}33`, color,
                                            }}>{riskLabel(s.risk_score)}</span>
                                        </td>
                                        <td style={{ padding: '11px 12px' }}>
                                            <Link to={`/analysis/${s.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: C.accent, textDecoration: 'none', fontWeight: 600 }}>
                                                View <ChevronRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </AppLayout>
    );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function MLStat({ label, value, accent, icon: Icon, C }) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', overflow: 'hidden' }}>
            <div style={{ background: `${accent}22`, borderRadius: 10, padding: 10, flexShrink: 0 }}>
                <Icon size={20} color={accent} />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: 11, color: C.textSec, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: C.textPri, lineHeight: 1 }}>{value ?? '—'}</p>
            </div>
            <div style={{ position: 'absolute', right: -16, top: -16, width: 64, height: 64, borderRadius: '50%', background: `${accent}14`, filter: 'blur(16px)', pointerEvents: 'none' }} />
        </div>
    );
}
