import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ---- Count-up number: animates from 0 to the value on mount ----
// Pass a number (or numeric string); prefix/suffix render around it untouched.
export function CountUp({ value, duration = 700, prefix = '', suffix = '' }) {
  const target = typeof value === 'number' ? value : parseFloat(value);
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (isNaN(target)) return;
    const start = performance.now();
    const decimals = String(target).includes('.') ? String(target).split('.')[1].length : 0;
    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(parseFloat((target * eased).toFixed(decimals)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  if (isNaN(target)) return <>{value}</>;
  return <>{prefix}{display}{suffix}</>;
}

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
        background: open ? '#2563EB' : '#C3CCD7', cursor: 'pointer',
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

// ---- Momentum meter (qualitative trend from PitchBook web signals) ----
export function MomentumMeter({ trend }) {
  const t = (trend || '').toLowerCase();
  const level = /rapid|sharp|strong/.test(t) ? 3 : /growth|upward/.test(t) ? 2 : 1;
  const color = level === 3 ? C.green : level === 2 ? C.blue : C.muted;
  return (
    <div title={trend ? `PitchBook web-signal trend: ${trend}` : 'No trend data'}
      style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 14, cursor: 'pointer' }}>
      {[6, 10, 14].map((h, i) => (
        <span key={i} style={{ width: 4, height: h, borderRadius: 1, background: i < level ? color : C.grid }} />
      ))}
    </div>
  );
}

// ---- Shared minimal chip for chart footers ----
function ChartChip({ n, label, color, bg, delay = 0 }) {
  return (
    <span className="animate-fade" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 600,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      color, background: bg, borderRadius: 999, padding: '4px 11px',
      animationDelay: `${delay}s`,
    }}>
      <strong style={{ fontWeight: 800 }}>{n}</strong>{label}
    </span>
  );
}

// ---- Book at a glance: held positions on a log valuation scale ----
export function BookGlance({ companies, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const rows = companies
    .map(c => ({ c, val: parseUSD(c.valuationExit?.postVal) }))
    .filter(r => r.val)
    .sort((a, b) => b.val - a.val);
  if (rows.length < 2) return null;

  const momLevel = trend => {
    const t = (trend || '').toLowerCase();
    return /rapid|sharp|strong/.test(t) ? 'rapid' : /growth|upward/.test(t) ? 'growing' : 'stable';
  };
  const MOM = {
    rapid:   { color: C.green, bg: 'var(--green-bg)' },
    growing: { color: C.blue,  bg: 'var(--blue-bg)' },
    stable:  { color: C.muted, bg: '#F1F4F7' },
  };
  const counts = { rapid: 0, growing: 0, stable: 0 };
  rows.forEach(r => counts[momLevel(r.c.signals?.trend)]++);

  const W = 800, H = 180;
  const PADL = 40, PADR = 50, MID = 90;
  const LOG_MIN = Math.log10(30), LOG_MAX = Math.log10(16000); // $30M → $16B
  const x = v => PADL + ((Math.log10(v) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (W - PADL - PADR);

  // Lane-dodge dots that land nearly on top of each other on the log scale:
  // each dot takes the innermost vertical lane not used by a neighbour within 55px.
  const items = [];
  rows.forEach(({ c, val }) => {
    const cx = x(val);
    const taken = items.filter(it => Math.abs(it.cx - cx) < 55).map(it => it.lane);
    const lane = [0, 1, -1, 2, -2].find(l => !taken.includes(l)) ?? 0;
    items.push({ c, val, cx, lane });
  });

  return (
    <div className="card" style={{ padding: '14px 18px', marginBottom: 20, transition: 'all 0.2s ease-in-out' }}>
      {/* Clickable Header/Dropdown Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.ink }}>The book at a glance</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2' }}>
            latest post-money, log scale · colour = momentum · click a dot for the full sheet
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2', marginRight: 4 }}>
            {rows.length} of {companies.length} disclosed
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            fontFamily: 'IBM Plex Mono, monospace',
            color: C.blue,
            fontWeight: 600,
            background: 'var(--blue-bg)',
            padding: '4px 10px',
            borderRadius: 6,
            transition: 'background 0.15s, transform 0.1s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--blue-bg)'; }}
          >
            {isOpen ? 'Hide Chart' : 'Show Chart'}
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="tab-fade" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
              {/* log gridlines */}
              {[100, 1000, 10000].map(v => (
                <g key={v}>
                  <line x1={x(v)} y1={16} x2={x(v)} y2={H - 30} stroke="#D6DBE2" strokeWidth="1" strokeDasharray="4 5" />
                  <text x={x(v)} y={H - 14} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="#A9B5C2">{v >= 1000 ? `$${v / 1000}B` : `$${v}M`}</text>
                </g>
              ))}
              {/* baseline */}
              <line x1={PADL - 10} y1={MID} x2={W - PADR + 20} y2={MID} stroke="#E7EAEE" strokeWidth="1" />
              {items.map(({ c, val, cx, lane }, i) => {
                const cy = MID + lane * 24;
                const above = lane === 0 ? (i % 2 === 0) : lane < 0;
                const m = MOM[momLevel(c.signals?.trend)];
                return (
                  <g key={c.id} style={{ cursor: onSelect ? 'pointer' : 'default' }} onClick={(e) => { e.stopPropagation(); onSelect?.(c); }}>
                    <title>{`${c.name} · ${fmtUSD(val)} · ${c.signals?.trend || 'no trend data'}`}</title>
                    <circle cx={cx} cy={cy} r={16} fill="transparent" />
                    <circle cx={cx} cy={cy} r={12.5} fill="#fff" stroke="#C9D2DC" strokeWidth="1.4"
                      className="dot-pop" style={{ animationDelay: `${i * 0.06}s` }} />
                    <circle cx={cx} cy={cy} r={8.5} fill={m.color}
                      className="dot-pop dot-hover" style={{ animationDelay: `${i * 0.06}s` }} />
                    <text x={cx} y={above ? cy - 22 : cy + 25} textAnchor="middle"
                      fontFamily="Source Serif 4, Georgia, serif" fontSize="11.5" fontWeight="600" fill={C.ink}>{c.name}</text>
                    <text x={cx} y={above ? cy - 34 : cy + 37} textAnchor="middle"
                      fontFamily="IBM Plex Mono, monospace" fontSize="9" fontWeight="700" fill={m.color}>{fmtUSD(val)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--hairline)', marginTop: 10 }}>
            {['rapid', 'growing', 'stable'].map((k, i) => counts[k] ? (
              <ChartChip key={k} n={counts[k]} label={k} color={MOM[k].color} bg={MOM[k].bg} delay={i * 0.06} />
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );

}

// ---- Sourcing map: PB Opportunity Score vs funding stage ----
const STAGE_TICKS = [['Seed', 0], ['A', 1], ['B', 2], ['C', 3]];
function stageOrdinal(stage) {
  const s = stage || '';
  if (/series d/i.test(s)) return 4;
  if (/series c/i.test(s)) return 3;
  if (/series b/i.test(s)) return 2;
  if (/series a in talks/i.test(s)) return 0.5;
  if (/series a/i.test(s)) return 1;
  return 0;
}
const SM_LABEL = { Console: 'right', Omnea: 'left', Avoca: 'right', Hadrian: 'top', 'Prem Labs': 'right' };

export function SourcingMap({ companies, onSelect, warmSet }) {
  const [isOpen, setIsOpen] = useState(false);
  const W = 560, H = 250;
  const PAD = { left: 46, top: 20, right: 24, bottom: 40 };
  const IW = W - PAD.left - PAD.right, IH = H - PAD.top - PAD.bottom;
  const Y_MIN = 75, Y_MAX = 100;
  const sx = v => PAD.left + (v / 4) * IW;
  const sy = v => PAD.top + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * IH;

  let dots = companies
    .filter(c => c.valuationExit?.opportunityScore)
    .map(c => ({ c, x: stageOrdinal(c.stage), y: c.valuationExit.opportunityScore, warm: warmSet?.has(c.name) }));
  // dodge exact-overlap dots sideways
  dots.forEach((d, i) => {
    const twin = dots.findIndex((o, j) => j < i && o.x === d.x && o.y === d.y);
    if (twin >= 0) { d.x += 0.16; dots[twin].x -= 0.16; }
  });
  const warmCount = dots.filter(d => d.warm).length;

  return (
    <div className="card" style={{ padding: '14px 18px', marginBottom: 20, transition: 'all 0.2s ease-in-out' }}>
      {/* Clickable Header/Dropdown Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.ink }}>Sourcing map</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2' }}>
            opportunity score vs stage · rings = sweet spot distance · click a dot for the full sheet
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            fontFamily: 'IBM Plex Mono, monospace',
            color: C.blue,
            fontWeight: 600,
            background: 'var(--blue-bg)',
            padding: '4px 10px',
            borderRadius: 6,
            transition: 'background 0.15s, transform 0.1s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--blue-bg)'; }}
          >
            {isOpen ? 'Hide Chart' : 'Show Chart'}
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="tab-fade" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
              <defs>
                <clipPath id="sm-clip"><rect x={PAD.left} y={PAD.top} width={IW} height={IH} /></clipPath>
              </defs>

              {/* Bullseye rings from the ideal corner: high score, early stage */}
              <g clipPath="url(#sm-clip)">
                {[65, 140, 225, 320].map(r => (
                  <circle key={r} cx={sx(0)} cy={sy(100)} r={r} fill="none"
                    stroke="#D6DBE2" strokeWidth="1" strokeDasharray="4 5" />
                ))}
              </g>

              {/* Quiet corner label */}
              <text x={PAD.left + 8} y={PAD.top + 14} fontFamily="IBM Plex Mono, monospace" fontSize="7.5" fontWeight="700" fill="#A9B8D4" letterSpacing="1.4">LEAD ZONE</text>

              {/* Stage ticks */}
              {STAGE_TICKS.map(([lbl, v]) => (
                <text key={lbl} x={sx(v)} y={H - 26} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#A9B5C2">{lbl}</text>
              ))}

              {/* Axis pills */}
              <g>
                <rect x={PAD.left + IW / 2 - 46} y={H - 19} width={92} height={16} rx="8" fill="#F4F6F8" stroke="#E7EAEE" strokeWidth="1" />
                <text x={PAD.left + IW / 2} y={H - 8} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="7.5" fontWeight="700" fill="#7C8B9C" letterSpacing="1.5">STAGE →</text>
              </g>
              <g transform={`translate(14,${PAD.top + IH / 2}) rotate(-90)`}>
                <rect x={-48} y={-11} width={96} height={16} rx="8" fill="#F4F6F8" stroke="#E7EAEE" strokeWidth="1" />
                <text x={0} y={1} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="7.5" fontWeight="700" fill="#7C8B9C" letterSpacing="1.5">PB SCORE →</text>
              </g>

              {/* dots */}
              {dots.map(({ c, x, y, warm }, i) => {
                const cx = sx(x), cy = sy(y);
                const pos = SM_LABEL[c.name] || 'top';
                const lx = pos === 'right' ? cx + 19 : pos === 'left' ? cx - 19 : cx;
                const ly = pos === 'top' ? cy - 19 : cy + 3.5;
                const anchor = pos === 'right' ? 'start' : pos === 'left' ? 'end' : 'middle';
                const col = warm ? C.green : C.amber;
                return (
                  <g key={c.id} style={{ cursor: onSelect ? 'pointer' : 'default' }} onClick={(e) => { e.stopPropagation(); onSelect?.(c); }}>
                    <title>{`${c.name} · score ${y} · ${c.stage}${warm ? ' · warm path available' : ' · no warm path'}`}</title>
                    <circle cx={cx} cy={cy} r={17} fill="transparent" />
                    <circle cx={cx} cy={cy} r={13.5} fill="#fff" stroke={col} strokeWidth="1.5"
                      strokeDasharray={warm ? 'none' : '3 2.6'}
                      className="dot-pop" style={{ animationDelay: `${i * 0.07}s` }} />
                    <circle cx={cx} cy={cy} r={9.5} fill={col}
                      className="dot-pop dot-hover" style={{ animationDelay: `${i * 0.07}s` }} />
                    <text x={cx} y={cy + 3} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="800" fill="#fff" pointerEvents="none">{y}</text>
                    <text x={lx} y={ly} textAnchor={anchor} fontFamily="IBM Plex Mono, monospace" fontSize="9" fontWeight="600" fill="#36475A" pointerEvents="none">{c.name}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--hairline)', marginTop: 10 }}>
            <ChartChip n={warmCount} label="warm path" color={C.green} bg="var(--green-bg)" />
            <ChartChip n={dots.length - warmCount} label="direct approach" color={C.amber} bg="var(--amber-bg)" delay={0.06} />
            <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, color: '#A9B5C2' }}>dashed ring = no warm path yet</span>
          </div>
        </div>
      )}
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
