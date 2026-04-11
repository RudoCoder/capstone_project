import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysisById } from '../api/analysisService';
import { getIOCsByAnalysis } from '../api/iocService';
import { getYaraMatches } from '../api/yaraService';
import { getCVEMatches } from '../api/cveService';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, FileText, Shield, AlertTriangle, Bug, Globe, Download } from 'lucide-react';
import { generateAnalysisPDF } from '../utils/generatePDF';

const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const cvssColor = (score, C) => {
    if (score >= 9)   return C.red;
    if (score >= 7)   return '#f97316';
    if (score >= 4)   return C.orange;
    return C.green;
};

const cvssLabel = (score) => {
    if (score >= 9)   return 'Critical';
    if (score >= 7)   return 'High';
    if (score >= 4)   return 'Medium';
    return 'Low';
};

const iocTypeColor = (type, C) => {
    const map = { ip: C.red, domain: C.orange, url: C.purple, hash: C.accent, email: C.green };
    return map[type] || C.textSec;
};

export default function AnalysisPage() {
    const { id } = useParams();
    const { theme: C } = useTheme();

    const [analysis, setAnalysis] = useState(null);
    const [iocs, setIocs]   = useState([]);
    const [yara, setYara]   = useState([]);
    const [cves, setCves]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getAnalysisById(id),
            getIOCsByAnalysis(id),
            getYaraMatches(id),
            getCVEMatches(id),
        ]).then(([a, i, y, c]) => {
            setAnalysis(a.data);
            setIocs(i.data);
            setYara(y.data);
            setCves(c.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [id]);

    const handleDownloadPDF = () => generateAnalysisPDF(analysis, iocs, yara, cves);

    if (loading) return (
        <AppLayout>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: C.textSec, fontSize: 14, margin: 0 }}>Loading analysis…</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </AppLayout>
    );

    if (!analysis) return (
        <AppLayout>
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <p style={{ color: C.textSec }}>Analysis not found.</p>
                <Link to="/dashboard" style={{ color: C.accent, fontSize: 14 }}>← Back to Dashboard</Link>
            </div>
        </AppLayout>
    );

    const riskScore  = analysis.risk_score || 0;
    const riskColor  = riskScore >= 70 ? C.red : riskScore >= 40 ? C.orange : C.green;
    const riskLabel  = riskScore >= 70 ? 'Critical' : riskScore >= 40 ? 'Medium' : 'Low';
    const statusOk   = analysis.status === 'completed';
    const circumference = 2 * Math.PI * 54;
    const dash = circumference - (riskScore / 100) * circumference;

    return (
        <AppLayout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .pdf-btn:hover { opacity: 0.85 !important; }
            `}</style>

            {/* Back + header */}
            <div style={{ marginBottom: 28 }}>
                <Link to="/dashboard" className="no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.textSec, textDecoration: 'none', fontSize: 13, marginBottom: 16 }}>
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>Analysis #{id}</h1>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSec }}>{fmt(analysis.created_at)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{
                            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: statusOk ? `${C.green}22` : `${C.orange}22`,
                            border: `1px solid ${statusOk ? C.green : C.orange}44`,
                            color: statusOk ? C.green : C.orange,
                        }}>{analysis.status}</span>
                        <span style={{
                            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: `${riskColor}22`, border: `1px solid ${riskColor}44`, color: riskColor,
                        }}>{analysis.threat_level || riskLabel}</span>
                        <button
                            onClick={handleDownloadPDF}
                            className="pdf-btn no-print"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                background: C.accent, color: '#000',
                                border: 'none', borderRadius: 10,
                                padding: '7px 16px', fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', transition: 'opacity 0.15s',
                            }}
                        >
                            <Download size={14} /> Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TOP ROW ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 24 }}>

                {/* Risk gauge */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Score</p>
                    <div style={{ position: 'relative', width: 124, height: 124 }}>
                        <svg width="124" height="124" viewBox="0 0 124 124">
                            <circle cx="62" cy="62" r="54" fill="none" stroke={C.border} strokeWidth="10" />
                            <circle
                                cx="62" cy="62" r="54" fill="none"
                                stroke={riskColor} strokeWidth="10"
                                strokeDasharray={circumference}
                                strokeDashoffset={dash}
                                strokeLinecap="round"
                                transform="rotate(-90 62 62)"
                                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 28, fontWeight: 800, color: riskColor, lineHeight: 1 }}>{riskScore}</span>
                            <span style={{ fontSize: 11, color: C.textSec }}>/ 100</span>
                        </div>
                    </div>
                    <span style={{
                        marginTop: 12, padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: `${riskColor}22`, border: `1px solid ${riskColor}44`, color: riskColor,
                    }}>{riskLabel}</span>
                </div>

                {/* File info */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ background: `${C.accent}18`, borderRadius: 10, padding: 10 }}>
                            <FileText size={20} color={C.accent} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPri }}>{analysis.file_name || `File #${id}`}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textSec }}>Upload ID: {analysis.upload}</p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        {[
                            { label: 'IOCs Found',     value: iocs.length,  color: C.orange },
                            { label: 'YARA Matches',   value: yara.length,  color: C.red    },
                            { label: 'CVE Matches',    value: cves.length,  color: C.purple },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ background: C.surface, borderRadius: 10, padding: '14px 16px' }}>
                                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color }}>{value}</p>
                                <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textSec }}>{label}</p>
                            </div>
                        ))}
                    </div>
                    {analysis.summary && (
                        <div style={{ marginTop: 16, padding: '12px 14px', background: C.surface, borderRadius: 10, borderLeft: `3px solid ${C.accent}` }}>
                            <p style={{ margin: 0, fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>{analysis.summary}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── IOC TABLE ── */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <Globe size={17} color={C.orange} />
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPri }}>Indicators of Compromise</p>
                    <span style={{ marginLeft: 'auto', background: `${C.orange}22`, border: `1px solid ${C.orange}44`, color: C.orange, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{iocs.length}</span>
                </div>
                {iocs.length === 0
                    ? <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>No IOCs extracted for this file.</p>
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
                                    const col = iocTypeColor(item.ioc?.type, C);
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

            {/* ── YARA + CVE ROW ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* YARA Matches */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                        <Shield size={17} color={C.red} />
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPri }}>YARA Matches</p>
                        <span style={{ marginLeft: 'auto', background: `${C.red}22`, border: `1px solid ${C.red}44`, color: C.red, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{yara.length}</span>
                    </div>
                    {yara.length === 0
                        ? <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>No YARA rules matched.</p>
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {yara.map((m) => (
                                    <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: m.rule?.description ? 6 : 0 }}>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.textPri, fontFamily: 'monospace' }}>{m.rule?.name}</p>
                                            {m.matched_string && <span style={{ fontSize: 11, color: C.textSec, fontFamily: 'monospace', background: C.border, padding: '2px 8px', borderRadius: 6 }}>{m.matched_string}</span>}
                                        </div>
                                        {m.rule?.description && <p style={{ margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{m.rule.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>

                {/* CVE Matches */}
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
                                                <span style={{ background: `${col}22`, border: `1px solid ${col}44`, color: col, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                                                    {cvssLabel(m.cve?.severity)} {m.cve?.severity?.toFixed(1)}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 12, color: C.textSec, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {m.cve?.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    }
                </div>
            </div>
        </AppLayout>
    );
}
