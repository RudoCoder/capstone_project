import { jsPDF } from 'jspdf';

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
    navy:    [10,  15,  30],
    dark:    [20,  28,  46],
    card:    [28,  38,  60],
    stripe:  [35,  48,  75],
    accent:  [0,   194, 255],
    red:     [244, 63,  94],
    orange:  [251, 146, 60],
    green:   [34,  211, 160],
    purple:  [167, 139, 250],
    white:   [255, 255, 255],
    textPri: [226, 232, 240],
    textSec: [148, 163, 184],
    border:  [45,  60,  90],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const riskCol   = s => s >= 70 ? C.red    : s >= 40 ? C.orange : C.green;
const riskLabel = s => s >= 70 ? 'CRITICAL' : s >= 40 ? 'MEDIUM' : 'LOW';
const cvssCol   = s => s >= 9  ? C.red    : s >= 7  ? C.orange : s >= 4 ? [251, 191, 36] : C.green;
const cvssLabel = s => s >= 9  ? 'Critical' : s >= 7  ? 'High'   : s >= 4 ? 'Medium' : 'Low';
const iocCol    = t => ({ ip: C.red, domain: C.orange, url: C.purple, hash: C.accent, email: C.green }[t] || C.textSec);

const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';

// Extract human-readable text from Python dict string saved by backend
function parseMeta(raw) {
    if (!raw || raw === '{}') return '';
    const desc = raw.match(/['"]description['"]\s*:\s*['"]([^'"]{3,})['"]/);
    if (desc) return desc[1];
    const author = raw.match(/['"]author['"]\s*:\s*['"]([^'"]+)['"]/);
    if (author) return `Author: ${author[1]}`;
    return '';
}

const sf = (doc, rgb) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
const st = (doc, rgb) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

function pill(doc, x, y, w, h, bg, label) {
    sf(doc, bg);
    doc.roundedRect(x, y, w, h, h/2, h/2, 'F');
    st(doc, C.white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + w/2, y + h/2 + 2.6, { align: 'center' });
}

function checkPage(doc, y, need = 25) {
    if (y + need > 272) { doc.addPage(); drawPageBg(doc); return 22; }
    return y;
}

function drawPageBg(doc) {
    sf(doc, C.navy);
    doc.rect(0, 0, 210, 297, 'F');
}

// ── Section header ────────────────────────────────────────────────────────────
function section(doc, y, label, count, accentCol) {
    y = checkPage(doc, y, 30);

    // Full-width subtle divider line
    sf(doc, C.border);
    doc.rect(14, y, 182, 0.5, 'F');
    y += 6;

    // Left accent bar
    sf(doc, accentCol);
    doc.rect(14, y, 4, 10, 'F');

    // Label
    st(doc, C.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(label, 22, y + 7);

    // Count badge
    if (count !== undefined) {
        const s = String(count);
        const bw = Math.max(doc.getTextWidth(s) + 10, 16);
        sf(doc, accentCol);
        doc.roundedRect(192 - bw, y + 1.5, bw, 7, 3.5, 3.5, 'F');
        st(doc, C.white);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(s, 192 - bw/2, y + 6.5, { align: 'center' });
    }

    return y + 16;
}

// ── Card helper ───────────────────────────────────────────────────────────────
function card(doc, x, y, w, h, leftBar) {
    sf(doc, C.card);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    if (leftBar) {
        sf(doc, leftBar);
        doc.roundedRect(x, y, 3.5, h, 1.5, 1.5, 'F');
    }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function generateAnalysisPDF(analysis, iocs, yara, cves) {
    const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
    const PW   = 210;
    const score = analysis.risk_score || 0;
    const rc    = riskCol(score);
    const rl    = riskLabel(score);
    const name  = analysis.file_name || `File #${analysis.id}`;

    drawPageBg(doc);

    // ── HEADER ────────────────────────────────────────────────────────────────
    sf(doc, C.dark);
    doc.rect(0, 0, PW, 46, 'F');
    sf(doc, C.accent);
    doc.rect(0, 0, 5, 46, 'F');

    st(doc, C.accent);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SHANDUKO', 14, 18);

    st(doc, C.textPri);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('THREAT INTELLIGENCE PLATFORM', 14, 26);

    st(doc, C.textSec);
    doc.setFontSize(7.5);
    doc.text('File Analysis Report', 14, 33);
    doc.text('Generated: ' + fmt(new Date().toISOString()), 14, 39);

    // Risk score box (top-right)
    const bx = PW - 50, by = 4, bw = 42, bh = 38;
    sf(doc, C.navy);
    doc.roundedRect(bx, by, bw, bh, 4, 4, 'F');
    sf(doc, rc);
    doc.roundedRect(bx, by, bw, 2, 1, 1, 'F');

    st(doc, C.textSec);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('RISK SCORE', bx + bw/2, by + 8, { align: 'center' });

    st(doc, rc);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text(String(Math.round(score)), bx + bw/2, by + 24, { align: 'center' });

    st(doc, C.textSec);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('/ 100', bx + bw/2, by + 30, { align: 'center' });

    pill(doc, bx + 5, by + 32, bw - 10, 7, rc, rl);

    // ── FILE INFO CARD ────────────────────────────────────────────────────────
    let y = 54;
    card(doc, 14, y, PW - 28, 44, C.accent);

    st(doc, C.textSec);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FILE NAME', 22, y + 8);

    st(doc, C.white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const truncName = name.length > 55 ? name.slice(0, 52) + '...' : name;
    doc.text(truncName, 22, y + 17);

    const meta = [
        ['ANALYSIS ID',  '#' + analysis.id],
        ['SCAN DATE',    fmt(analysis.created_at)],
        ['STATUS',       (analysis.status || '').toUpperCase()],
        ['THREAT LEVEL', (analysis.threat_level || rl).toUpperCase()],
    ];
    meta.forEach(([label, value], i) => {
        const cx = 22 + i * 44;
        st(doc, C.textSec);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(label, cx, y + 28);
        st(doc, C.textPri);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(value, cx, y + 35);
    });

    // ── STAT ROW ──────────────────────────────────────────────────────────────
    y += 52;
    const sw = (PW - 28 - 8) / 3;
    [
        { label: 'IOCs Found',   value: iocs.length, col: C.orange },
        { label: 'YARA Matches', value: yara.length, col: C.red    },
        { label: 'CVE Matches',  value: cves.length, col: C.purple },
    ].forEach(({ label, value, col }, i) => {
        const sx = 14 + i * (sw + 4);
        card(doc, sx, y, sw, 24, col);
        st(doc, col);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), sx + sw/2 + 2, y + 14, { align: 'center' });
        st(doc, C.textSec);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(label, sx + sw/2 + 2, y + 20, { align: 'center' });
    });

    // Summary bar
    if (analysis.summary) {
        y += 30;
        card(doc, 14, y, PW - 28, 12, C.accent);
        st(doc, C.textPri);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(analysis.summary, 22, y + 7.5);
        y += 6;
    }

    // ── IOC TABLE ─────────────────────────────────────────────────────────────
    y += 16;
    y = section(doc, y, 'Indicators of Compromise', iocs.length, C.orange);

    if (iocs.length === 0) {
        st(doc, C.textSec); doc.setFontSize(9); doc.text('No IOCs extracted.', 14, y); y += 10;
    } else {
        // Header row
        sf(doc, C.stripe);
        doc.rect(14, y, PW - 28, 8, 'F');
        [['TYPE', 17], ['VALUE', 47], ['CONFIDENCE', 162]].forEach(([h, x]) => {
            st(doc, C.textSec);
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'bold');
            doc.text(h, x, y + 5.5);
        });
        y += 9;

        iocs.forEach((item, idx) => {
            y = checkPage(doc, y, 10);
            if (idx % 2 === 0) { sf(doc, C.dark); doc.rect(14, y - 1, PW - 28, 9, 'F'); }

            const type = item.ioc?.type || '';
            const col  = iocCol(type);
            pill(doc, 17, y + 0.5, 22, 6.5, col, type.toUpperCase());

            st(doc, C.textPri);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            const val = item.ioc?.value || '';
            doc.text(val.length > 58 ? val.slice(0, 55) + '...' : val, 47, y + 5.5);

            const conf = Math.round((item.confidence_score || 0) * 100);
            sf(doc, C.border);
            doc.roundedRect(162, y + 2.5, 24, 3, 1.5, 1.5, 'F');
            sf(doc, C.accent);
            doc.roundedRect(162, y + 2.5, 24 * conf / 100, 3, 1.5, 1.5, 'F');
            st(doc, C.textPri);
            doc.setFontSize(7);
            doc.text(conf + '%', 189, y + 5.2, { align: 'right' });

            y += 9;
        });
    }

    // ── YARA MATCHES ──────────────────────────────────────────────────────────
    y = checkPage(doc, y, 30);
    y = section(doc, y, 'YARA Rule Matches', yara.length, C.red);

    if (yara.length === 0) {
        st(doc, C.textSec); doc.setFontSize(9); doc.text('No YARA rules matched.', 14, y); y += 10;
    } else {
        yara.forEach((m) => {
            const desc = parseMeta(m.rule?.description || '');
            const h    = desc ? 20 : 14;
            y = checkPage(doc, y, h + 4);

            card(doc, 14, y, PW - 28, h, C.red);

            st(doc, C.white);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(m.rule?.name || '-', 22, y + 8);

            if (desc) {
                st(doc, C.textSec);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'normal');
                const line = doc.splitTextToSize(desc, 155)[0];
                doc.text(line, 22, y + 15);
            }
            y += h + 4;
        });
    }

    // ── CVE MATCHES ───────────────────────────────────────────────────────────
    y = checkPage(doc, y, 30);
    y = section(doc, y, 'CVE Matches', cves.length, C.purple);

    if (cves.length === 0) {
        st(doc, C.textSec); doc.setFontSize(9); doc.text('No CVEs matched.', 14, y); y += 10;
    } else {
        cves.forEach((m) => {
            const sev = m.cve?.severity || 0;
            const col = cvssCol(sev);
            y = checkPage(doc, y, 24);

            card(doc, 14, y, PW - 28, 20, col);

            st(doc, C.accent);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(m.cve?.cve_id || '-', 22, y + 8);

            pill(doc, 148, y + 3, 40, 8, col, cvssLabel(sev) + '  ' + sev.toFixed(1));

            if (m.cve?.description) {
                st(doc, C.textSec);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'normal');
                doc.text(doc.splitTextToSize(m.cve.description, 155)[0], 22, y + 15);
            }
            y += 24;
        });
    }

    // ── FOOTER on every page ──────────────────────────────────────────────────
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        sf(doc, C.dark);
        doc.rect(0, 283, PW, 14, 'F');
        sf(doc, C.accent);
        doc.rect(0, 283, PW, 1, 'F');
        st(doc, C.textSec);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Shanduko Threat Intelligence Platform  —  Confidential', 14, 291);
        doc.text('Page ' + p + ' of ' + total, PW - 14, 291, { align: 'right' });
    }

    const safe = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save('shanduko_analysis_' + safe + '_' + analysis.id + '.pdf');
}
