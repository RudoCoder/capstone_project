import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import { getAllAnalysis } from '../api/analysisService';
import {
    Activity, FileSearch, AlertTriangle, CheckCircle,
    Clock, ChevronRight, Search, XCircle, Filter, Download,
} from 'lucide-react';

const exportToCSV = (rows) => {
    const headers = ['ID', 'File Name', 'Timestamp', 'Status', 'Risk Score', 'Risk Level'];
    const riskLvl = (s) => s >= 70 ? 'Critical' : s >= 40 ? 'Medium' : 'Low';
    const escape  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const lines = [
        headers.join(','),
        ...rows.map(a => [
            a.id,
            escape(a.file_name || `Scan #${a.id}`),
            escape(a.created_at ? new Date(a.created_at).toLocaleString('en-GB') : ''),
            escape(a.status || ''),
            a.risk_score ?? '',
            escape(riskLvl(a.risk_score)),
        ].join(',')),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `shanduko-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

const fmt = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

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

const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low', 'Failed'];

export default function ActivityLogPage() {
    const { theme: C } = useTheme();
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [filter, setFilter]   = useState('All');

    useEffect(() => {
        getAllAnalysis()
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let list = [...data];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(a => (a.file_name || '').toLowerCase().includes(q));
        }
        if (filter === 'Failed') {
            list = list.filter(a => a.status === 'failed');
        } else if (filter === 'Critical') {
            list = list.filter(a => a.risk_score >= 75);
        } else if (filter === 'High') {
            list = list.filter(a => a.risk_score >= 50 && a.risk_score < 75);
        } else if (filter === 'Medium') {
            list = list.filter(a => a.risk_score >= 25 && a.risk_score < 50);
        } else if (filter === 'Low') {
            list = list.filter(a => a.risk_score < 25);
        }
        return list;
    }, [data, search, filter]);

    const total     = data.length;
    const completed = data.filter(a => a.status === 'completed').length;
    const failed    = data.filter(a => a.status === 'failed').length;
    const avgRisk   = total ? Math.round(data.reduce((s, a) => s + (a.risk_score || 0), 0) / total) : 0;

    return (
        <AppLayout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .log-row:hover { background: ${C.border}44 !important; }
                .filter-btn:hover { border-color: ${C.accent}88 !important; color: ${C.accent} !important; }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ background: `${C.accent}1a`, borderRadius: 10, padding: 10 }}>
                        <Activity size={20} color={C.accent} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPri }}>Activity Log</h1>
                </div>
                <p style={{ margin: '0 0 0 44px', fontSize: 13, color: C.textSec }}>
                    Complete history of all file scans and analysis results
                </p>
            </div>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                <StatPill icon={<FileSearch size={14} color={C.accent} />} label="Total Scans"  value={total}     accent={C.accent}  C={C} />
                <StatPill icon={<CheckCircle size={14} color={C.green} />} label="Completed"    value={completed} accent={C.green}   C={C} />
                <StatPill icon={<XCircle size={14} color={C.red} />}       label="Failed"       value={failed}    accent={C.red}     C={C} />
                <StatPill icon={<AlertTriangle size={14} color={C.orange} />} label="Avg Risk"  value={`${avgRisk}%`} accent={C.orange} C={C} />
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                    <Search size={14} color={C.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by file name…"
                        style={{
                            width: '100%', padding: '9px 12px 9px 34px',
                            background: C.card, border: `1px solid ${C.border}`,
                            borderRadius: 10, fontSize: 13, color: C.textPri,
                            outline: 'none', fontFamily: 'inherit',
                        }}
                    />
                </div>

                {/* Filter chips */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Filter size={13} color={C.textMuted} />
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            className="filter-btn"
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.15s',
                                background: filter === f ? `${C.accent}18` : 'transparent',
                                border: `1px solid ${filter === f ? C.accent : C.border}`,
                                color: filter === f ? C.accent : C.textSec,
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Export */}
                <button
                    onClick={() => exportToCSV(filtered)}
                    disabled={filtered.length === 0}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: filtered.length === 0 ? 'transparent' : `${C.green}18`,
                        border: `1px solid ${filtered.length === 0 ? C.border : C.green + '44'}`,
                        color: filtered.length === 0 ? C.textMuted : C.green,
                        borderRadius: 10, padding: '7px 14px',
                        fontSize: 12, fontWeight: 600,
                        cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s', flexShrink: 0,
                    }}
                >
                    <Download size={13} /> Export CSV
                    {filtered.length > 0 && (
                        <span style={{ background: `${C.green}33`, borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
                            {filtered.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>Loading activity…</p>
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
                    {/* Table header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 80px',
                        padding: '12px 20px',
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11, fontWeight: 600, color: C.textMuted,
                        letterSpacing: '0.07em', textTransform: 'uppercase',
                    }}>
                        <span>File</span>
                        <span>Timestamp</span>
                        <span>Status</span>
                        <span>Risk Score</span>
                        <span />
                    </div>

                    {/* Rows */}
                    {filtered.length === 0 ? (
                        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                            <Activity size={28} color={C.textMuted} style={{ marginBottom: 10 }} />
                            <p style={{ margin: 0, color: C.textSec, fontSize: 14 }}>No results match your filters.</p>
                        </div>
                    ) : (
                        filtered.map((a, idx) => {
                            const color = riskColor(a.risk_score, C);
                            const isLast = idx === filtered.length - 1;
                            return (
                                <div
                                    key={a.id}
                                    className="log-row"
                                    style={{
                                        display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 80px',
                                        padding: '14px 20px', alignItems: 'center',
                                        borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                                        transition: 'background 0.12s',
                                    }}
                                >
                                    {/* File name */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                            background: `${color}18`, border: `1px solid ${color}33`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <FileSearch size={14} color={color} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{
                                                margin: 0, fontSize: 13, fontWeight: 600, color: C.textPri,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {a.file_name || `Scan #${a.id}`}
                                            </p>
                                            <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>ID #{a.id}</p>
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Clock size={12} color={C.textMuted} />
                                        <span style={{ fontSize: 12, color: C.textSec }}>{fmt(a.created_at)}</span>
                                    </div>

                                    {/* Status */}
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                                        borderRadius: 20, width: 'fit-content',
                                        background: a.status === 'completed' ? `${C.green}18` : `${C.orange}18`,
                                        color: a.status === 'completed' ? C.green : C.orange,
                                        border: `1px solid ${a.status === 'completed' ? C.green : C.orange}33`,
                                        textTransform: 'capitalize',
                                    }}>
                                        <span style={{
                                            width: 5, height: 5, borderRadius: '50%',
                                            background: a.status === 'completed' ? C.green : C.orange,
                                        }} />
                                        {a.status}
                                    </span>

                                    {/* Risk score */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color }}>{a.risk_score ?? '—'}</span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                                                background: `${color}18`, color, border: `1px solid ${color}33`,
                                            }}>{riskLabel(a.risk_score)}</span>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 4, background: C.border, overflow: 'hidden', width: '80%' }}>
                                            <div style={{ height: '100%', width: `${a.risk_score ?? 0}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
                                        </div>
                                    </div>

                                    {/* Details link */}
                                    <Link
                                        to={`/analysis/${a.id}`}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            fontSize: 12, fontWeight: 600, color: C.accent,
                                            textDecoration: 'none', padding: '5px 10px',
                                            borderRadius: 8, border: `1px solid ${C.accent}33`,
                                            background: `${C.accent}0d`, transition: 'background 0.15s',
                                        }}
                                    >
                                        View <ChevronRight size={12} />
                                    </Link>
                                </div>
                            );
                        })
                    )}

                    {/* Footer count */}
                    {filtered.length > 0 && (
                        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted }}>
                            Showing {filtered.length} of {total} scans
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function StatPill({ icon, label, value, accent, C }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '10px 16px',
        }}>
            <div style={{ background: `${accent}18`, borderRadius: 8, padding: 6, display: 'flex' }}>{icon}</div>
            <div>
                <p style={{ margin: 0, fontSize: 11, color: C.textSec }}>{label}</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPri }}>{value}</p>
            </div>
        </div>
    );
}
