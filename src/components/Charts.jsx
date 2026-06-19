import React, { useState } from 'react';

// ---- Source citation dot ----
// sources: array of { label, url? }. Renders a small dot; hover reveals sources + links.
export function Cite({ sources, align = 'right' }) {
  const [open, setOpen] = useState(false);
  if (!sources || !sources.length) return null;
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle', marginLeft: 5 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: open ? '#2563EB' : '#C3CCD7', cursor: 'help',
        display: 'inline-block', transition: 'background 0.12s'
      }} />
      {open && (
        <span style={{
          position: 'absolute', top: 'calc(100% + 7px)', zIndex: 90,
          [align === 'right' ? 'right' : 'left']: -4,
          background: '#0B1F33', borderRadius: 9, padding: '9px 11px',
          width: 248, boxShadow: '0 10px 30px rgba(11,31,51,0.3)', cursor: 'default'
        }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8FB4FF', display: 'block', marginBottom: 6 }}>
            Source
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sources.map((s, i) => s.url ? (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{
                fontSize: 11, color: '#cfe0ff', textDecoration: 'none', lineHeight: 1.4,
                display: 'flex', alignItems: 'flex-start', gap: 5
              }}>
                <span style={{ color: '#60A5FA', flexShrink: 0 }}>↗</span>{s.label}
              </a>
            ) : (
              <span key={i} style={{ fontSize: 11, color: '#AEBCCB', lineHeight: 1.4 }}>{s.label}</span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}

// ---- helpers ----
export function parseUSD(s) {
  if (s == null) return null;
  const str = String(s);
  const m = str.match(/-?[0-9][0-9,.]*/);
  if (!m) return null;
  let n = parseFloat(m[0].replace(/,/g, ''));
  if (isNaN(n)) return null;
  if (/b/i.test(str)) return n * 1000;       // → millions
  if (/m/i.test(str)) return n;
  if (/k/i.test(str)) return n / 1000;
  return n;
}

export function fmtUSD(millions) {
  if (millions == null) return '--';
  if (millions >= 1000) return `$${(millions / 1000).toFixed(millions >= 10000 ? 1 : 2)}B`;
  if (millions >= 1) return `$${millions.toFixed(millions >= 100 ? 0 : 1)}M`;
  return `$${(millions * 1000).toFixed(0)}K`;
}

const C = {
  blue: '#2563EB', indigo: '#6366F1', green: '#0E9F6E',
  amber: '#C2740C', red: '#DC2626', muted: '#94A3B8',
  grid: '#EFF1F4', ink: '#0B1F33', faint: '#CBD3DC',
};

// ---- Valuation trajectory (log-scale area + line) ----
export function ValuationTrajectory({ funding, height = 150 }) {
  const rounds = [...(funding || [])]
    .map(r => ({ ...r, val: parseUSD(r.postVal) }))
    .filter(r => r.val && r.val > 0)
    .reverse(); // oldest → newest

  if (rounds.length < 2) {
    return <div style={{ fontSize: 11, color: C.muted, fontFamily: 'IBM Plex Mono, monospace', padding: '12px 0' }}>Insufficient disclosed valuations to chart.</div>;
  }

  const W = 560, H = height, padL = 8, padR = 8, padT = 22, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const logs = rounds.map(r => Math.log10(r.val));
  const min = Math.min(...logs), max = Math.max(...logs);
  const span = max - min || 1;

  const pts = rounds.map((r, i) => {
    const x = padL + (rounds.length === 1 ? innerW / 2 : (i / (rounds.length - 1)) * innerW);
    const y = padT + innerH - ((Math.log10(r.val) - min) / span) * innerH;
    return { ...r, x, y };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${padT + innerH} L${pts[0].x.toFixed(1)},${padT + innerH} Z`;
  const lineLen = pts.reduce((acc, p, i) => i === 0 ? 0 : acc + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y), 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="valFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.blue} stopOpacity="0.16" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={C.grid} strokeWidth="1" />
      <path d={areaPath} fill="url(#valFill)" />
      <path
        d={linePath} fill="none" stroke={C.blue} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round"
        className="animate-line"
        style={{ '--dash': lineLen, strokeDasharray: lineLen, strokeDashoffset: 0 }}
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.fmc ? 5 : 3.5} fill="#fff" stroke={p.fmc ? C.blue : C.muted} strokeWidth={p.fmc ? 2.5 : 1.5} />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontFamily="IBM Plex Mono, monospace" fontWeight="600" fill={C.ink}>
            {fmtUSD(p.val)}
          </text>
          <text x={p.x} y={padT + innerH + 14} textAnchor="middle" fontSize="8.5" fontFamily="IBM Plex Mono, monospace" fill={C.muted}>
            {(p.type || '').replace(/\(.*\)/, '').replace('Series ', '').replace('Early Stage VC', 'EVC').replace('Strategic VC', 'Strat').trim().slice(0, 8)}
          </text>
          <text x={p.x} y={padT + innerH + 24} textAnchor="middle" fontSize="7.5" fontFamily="IBM Plex Mono, monospace" fill={C.faint}>
            {(p.date || '').replace(/\(.*\)/, '').trim()}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---- Exit probability donut ----
export function ExitDonut({ ipo = 0, ma = 0, noExit = 0, exitType, successProb, size = 132 }) {
  const total = ipo + ma + noExit || 1;
  const segs = [
    { v: ipo, color: C.blue, label: 'IPO' },
    { v: ma, color: C.indigo, label: 'M&A' },
    { v: noExit, color: C.faint, label: 'No exit' },
  ];
  const r = size / 2 - 12, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.grid} strokeWidth="11" />
        {segs.map((s, i) => {
          const frac = s.v / total;
          const len = frac * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="11"
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {exitType && (
          <div style={{ marginBottom: 2 }}>
            <span className="field-label">Predicted</span>
            <span className="serif" style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{exitType}</span>
            {successProb != null && <span style={{ fontSize: 11, color: C.green, marginLeft: 6, fontFamily: 'IBM Plex Mono, monospace' }}>{successProb}% success</span>}
          </div>
        )}
        {segs.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: 11.5, color: '#36475A', minWidth: 52 }}>{s.label}</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, fontWeight: 600, color: C.ink }}>{Math.round(s.v)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Score gauge (radial 0-100) ----
export function ScoreGauge({ score, size = 64, label = 'PB Score' }) {
  if (!score) return null;
  const r = size / 2 - 6, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const frac = score / 100;
  const color = score >= 90 ? C.indigo : score >= 80 ? C.blue : C.muted;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.grid} strokeWidth="5" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${frac * circ} ${circ}`} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: size > 56 ? 16 : 13, fontWeight: 700, color: C.ink }}>{score}</span>
        </div>
      </div>
      {label && <span className="field-label" style={{ fontSize: 8 }}>{label}</span>}
    </div>
  );
}

// ---- Horizontal stacked exit bar (compact, for table rows) ----
export function ExitBarMini({ ipo = 0, ma = 0, noExit = 0 }) {
  if (!ipo && !ma && !noExit) return <span style={{ color: C.faint, fontSize: 10 }}>--</span>;
  return (
    <div style={{ minWidth: 124 }}>
      <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', background: C.grid, marginBottom: 4 }}>
        <div style={{ width: `${ipo}%`, background: C.blue }} />
        <div style={{ width: `${ma}%`, background: C.indigo }} />
        <div style={{ width: `${noExit}%`, background: C.faint }} />
      </div>
      <div style={{ display: 'flex', gap: 7, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9 }}>
        <span style={{ color: C.blue }}>IPO {ipo}</span>
        <span style={{ color: C.indigo }}>M&A {ma}</span>
        <span style={{ color: C.muted }}>X {noExit}</span>
      </div>
    </div>
  );
}

// ---- Cap table horizontal bars ----
export function CapBars({ rows }) {
  if (!rows?.length) return null;
  const max = Math.max(...rows.map(r => parseFloat(r.pct) || 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {rows.map(r => {
        const pct = parseFloat(r.pct) || 0;
        const isFmc = /firstminute/i.test(r.name);
        return (
          <div key={r.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11.5, color: isFmc ? C.blue : '#36475A', fontWeight: isFmc ? 600 : 500 }}>{r.name}</span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, fontWeight: 700, color: isFmc ? C.blue : C.ink }}>{r.pct}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: C.grid, overflow: 'hidden' }}>
              <div className="animate-bar" style={{ height: '100%', width: `${(pct / max) * 100}%`, background: isFmc ? C.blue : '#C3CCD7', borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Momentum meter (qualitative trend) ----
export function MomentumMeter({ trend }) {
  const t = (trend || '').toLowerCase();
  const level = /rapid|sharp|strong/.test(t) ? 3 : /growth|upward/.test(t) ? 2 : 1;
  const color = level === 3 ? C.green : level === 2 ? C.blue : C.muted;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
      {[6, 10, 14].map((h, i) => (
        <span key={i} style={{ width: 4, height: h, borderRadius: 1, background: i < level ? color : C.grid }} />
      ))}
    </div>
  );
}

// ---- Generic comparison bar chart (company vs competitors) ----
export function CompareBars({ items, valueKey = 'val', labelKey = 'name', highlightIdx = 0, fmt = fmtUSD }) {
  const vals = items.map(i => i[valueKey] || 0);
  const max = Math.max(...vals, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((it, i) => {
        const v = it[valueKey] || 0;
        const isMe = i === highlightIdx;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 110, fontSize: 11, color: isMe ? C.ink : '#36475A', fontWeight: isMe ? 600 : 400, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it[labelKey]}</span>
            <div style={{ flex: 1, height: 16, background: C.grid, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <div className="animate-bar" style={{ height: '100%', width: `${(v / max) * 100}%`, background: isMe ? C.blue : '#C3CCD7', borderRadius: 4 }} />
            </div>
            <span style={{ width: 56, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, fontWeight: 600, color: isMe ? C.blue : C.muted, textAlign: 'right' }}>{v ? fmt(v) : '--'}</span>
          </div>
        );
      })}
    </div>
  );
}
