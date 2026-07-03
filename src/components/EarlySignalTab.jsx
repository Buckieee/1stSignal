import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GitBranch, Users, Zap, TrendingUp, Globe, FileText, ArrowUpRight, ChevronDown, ChevronUp, Layers, Target, ArrowRight, Radar, X } from 'lucide-react';
import { useIsMobile } from '../hooks';
import { CountUp } from './Charts';
import companies from '../data/earlySignals.json';
import { BUILD_DATE, BUILD_DATE_LABEL, BUILD_TIME_LABEL } from '../constants';

// ─── Constants ───────────────────────────────────────────────
const REFRESH_DATE = `Mon ${BUILD_DATE_LABEL}`;
const REFRESH_TIME = BUILD_TIME_LABEL;

const SIGNAL_META = {
  departure:  { label: 'Founder Departure', Icon: ArrowUpRight, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  github:     { label: 'GitHub Signal',     Icon: GitBranch,   color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  team:       { label: 'Team Signal',       Icon: Users,       color: '#2563EB', bg: '#EEF3FF', border: '#D3E0FF' },
  product:    { label: 'Product Launch',    Icon: Zap,         color: '#0E9F6E', bg: '#F0FDF4', border: '#BBF7D0' },
  funding:    { label: 'Angel Round',       Icon: TrendingUp,  color: '#C2740C', bg: '#FFFBEB', border: '#FDE68A' },
  domain:     { label: 'Domain / Entity',   Icon: Globe,       color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  press:      { label: 'Press Signal',      Icon: FileText,    color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  community:  { label: 'Community Signal',  Icon: Layers,      color: '#0E9F6E', bg: '#F0FDF4', border: '#BBF7D0' },
};

const REC_META = {
  'Move Now':           { color: '#0E9F6E', bg: '#F0FDF4', border: '#6EE7B7', dot: '#10B981', glow: 'rgba(16,185,129,0.25)' },
  'Active Pursuit':     { color: '#C2740C', bg: '#FFFBEB', border: '#FCD34D', dot: '#F59E0B', glow: 'rgba(245,158,11,0.25)' },
  'Build Relationship': { color: '#2563EB', bg: '#EEF3FF', border: '#93C5FD', dot: '#3B82F6', glow: 'rgba(59,130,246,0.25)' },
  'Monitor':            { color: '#64748B', bg: '#F8FAFC', border: '#CBD5E1', dot: '#94A3B8', glow: 'rgba(148,163,184,0.2)' },
};

const STAGE_META = {
  'pre-seed': { label: 'Pre-Seed', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  'seed':     { label: 'Seed',     bg: '#EEF3FF', color: '#1E40AF', border: '#D3E0FF' },
};

// ─── Helpers ─────────────────────────────────────────────────
function relativeDate(dateStr) {
  const diff = Math.floor((new Date(BUILD_DATE) - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 14) return '1 week ago';
  return `${Math.floor(diff / 7)}w ago`;
}
function daysSince(dateStr) { return Math.floor((new Date(BUILD_DATE) - new Date(dateStr)) / 86400000); }
function latestSignalDate(c) { return c.signals.reduce((l, s) => s.date > l ? s.date : l, ''); }

// ─── Source URL map ───────────────────────────────────────────
// ─── Micro components ────────────────────────────────────────
function Src({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 600,
      letterSpacing: '0.05em', borderRadius: 4, padding: '1px 6px',
      whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '100%',
      color: '#7C8B9C', background: '#F1F4F7', border: '1px solid #E2E7ED',
    }}>{label}</span>
  );
}

function WebLink({ website, small = false }) {
  if (!website) return null;
  const href = website.startsWith('http') ? website : `https://${website}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: 'IBM Plex Mono, monospace', fontSize: small ? 9 : 10, fontWeight: 600,
      color: '#2563EB', background: '#EEF3FF', border: '1px solid #D3E0FF',
      borderRadius: 5, padding: small ? '1px 6px' : '2px 8px', textDecoration: 'none', whiteSpace: 'nowrap',
    }}>
      <Globe size={small ? 9 : 10} />{website}
    </a>
  );
}

// Pre-signal companies that exist as nodes in the Network map
const NETWORK_IDS = new Set(['argus', 'velar', 'meridian', 'delphi']);

function TraceInNetwork({ company, onJump }) {
  if (!onJump || !NETWORK_IDS.has(company.id)) return null;
  return (
    <button onClick={() => onJump('doors', { pinCompany: company.name })} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em',
      color: '#2563EB', background: '#fff', border: '1px solid #D3E0FF', borderRadius: 6,
      padding: '5px 10px', cursor: 'pointer',
    }}>
      <GitBranch size={11} /> Trace in Network <ArrowRight size={10} />
    </button>
  );
}

function RecBadge({ rec, small = false }) {
  const m = REC_META[rec] || REC_META['Monitor'];
  return (
    <span style={{
      fontFamily: 'IBM Plex Mono, monospace', fontSize: small ? 8 : 9, fontWeight: 700,
      letterSpacing: '0.07em', textTransform: 'uppercase', color: m.color,
      background: m.bg, border: `1px solid ${m.border}`, borderRadius: 5,
      padding: small ? '1px 5px' : '2px 7px',
    }}>{rec}</span>
  );
}

function ScorePill({ value, label }) {
  const color = value >= 90 ? '#6366F1' : value >= 80 ? '#2563EB' : value >= 70 ? '#0E9F6E' : '#64748B';
  const bg    = value >= 90 ? '#F5F3FF' : value >= 80 ? '#EEF3FF' : value >= 70 ? '#F0FDF4' : '#F8FAFC';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: bg, border: `1px solid ${color}22`, borderRadius: 8, padding: '8px 12px', minWidth: 64, flex: '1 1 64px' }}>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9B5C2' }}>{label}</span>
    </div>
  );
}

function StrengthDots({ level }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2.5, alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i <= level ? '#2563EB' : '#E2E7ED', flexShrink: 0 }} />
      ))}
    </span>
  );
}

function UrgencyBar({ value }) {
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#94A3B8';
  const bg    = value >= 75 ? '#F0FDF4' : value >= 50 ? '#FFFBEB' : '#F8FAFC';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: '#F1F4F7', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 800, color, background: bg, borderRadius: 5, padding: '1px 7px', border: `1px solid ${color}33` }}>{value}</span>
    </div>
  );
}

// ─── Chart constants ─────────────────────────────────────────
const W = 520, H = 320;
const PAD = { left: 44, top: 22, right: 22, bottom: 36 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const IDEAL_X = PAD.left + PLOT_W;
const IDEAL_Y = PAD.top;
const Y_MIN = 80, Y_MAX = 100;
function toSvgX(u) { return PAD.left + (u / 100) * PLOT_W; }
function toSvgY(f) { return PAD.top + ((Y_MAX - f) / (Y_MAX - Y_MIN)) * PLOT_H; }
const ZONE_X = toSvgX(50);
const ZONE_Y = toSvgY(88);

// Which side of the dot the name sits on; position is derived from the
// dot radius so every label hugs its dot at the same gap.
const LABEL_POS = {
  velar:    'top',
  argus:    'top',
  forge:    'right',
  patchwork:'left',
  nimbus:   'right',
  meridian: 'left',
  delphi:   'right',
  caelum:   'top',
};

// ─── Signal pulse: 30-day histogram of observed signals ──────
function SignalPulse() {
  const days = useMemo(() => {
    const counts = {};
    companies.forEach(c => c.signals.forEach(s => { counts[s.date] = (counts[s.date] || 0) + 1; }));
    const end = new Date(BUILD_DATE);
    const out = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(end); d.setDate(end.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ key, n: counts[key] || 0, recent: i <= 6 });
    }
    return out;
  }, []);
  const max = Math.max(...days.map(d => d.n), 1);
  const total = days.reduce((s, d) => s + d.n, 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px 11px', borderTop: '1px solid #F1F4F7' }}>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: '#A9B5C2', flexShrink: 0 }}>SIGNAL PULSE · 30D</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, height: 22 }}>
        {days.map(d => (
          <div key={d.key} title={`${d.key}: ${d.n} signal${d.n === 1 ? '' : 's'}`} style={{
            flex: 1, borderRadius: 1.5, cursor: 'help', minHeight: 2,
            height: d.n ? `${Math.max(18 * (d.n / max), 5)}px` : '2px',
            background: d.n ? (d.recent ? '#10B981' : '#93C5FD') : '#EDF0F4',
          }} />
        ))}
      </div>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, color: '#7C8B9C', flexShrink: 0 }}>
        {total} signals · <span style={{ color: '#0E9F6E', fontWeight: 700 }}>green = last 7d</span>
      </span>
    </div>
  );
}

// ─── Investment Radar (light, creative) ──────────────────────
function InvestmentRadar({ selected, onSelect, isMobile }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const dots = useMemo(() => companies.map(c => {
    const rec = REC_META[c.recommendation] || REC_META['Monitor'];
    const r = 8 + (c.chequeMaxK / 2000) * 8;
    const fresh = daysSince(latestSignalDate(c)) <= 1;
    return { ...c, svgX: toSvgX(c.urgency), svgY: toSvgY(c.thesisFit), r, color: rec.dot, glow: rec.glow, rec, fresh };
  }), []);

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(11,31,51,0.06), 0 8px 24px rgba(11,31,51,0.05)', maxWidth: isMobile ? 620 : 'none', margin: isMobile ? '0 auto' : 0 }}>
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.12); }
        }
        @keyframes ring-expand {
          0%   { r: 0px; opacity: 0.6; }
          100% { r: 36px; opacity: 0; }
        }
        @keyframes dot-in {
          0%   { opacity: 0; transform: scale(0); }
          60%  { transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes sweep-in {
          from { opacity: 0; transform: scaleX(0); transform-origin: left; }
          to   { opacity: 1; transform: scaleX(1); transform-origin: left; }
        }
        .dot-movenow { animation: dot-pulse 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .ring-1 { animation: ring-expand 2.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        .ring-2 { animation: ring-expand 2.4s ease-out 1.2s infinite; transform-box: fill-box; transform-origin: center; }
        .dot-enter { animation: dot-in 0.5s cubic-bezier(0.34,1.56,0.64,1) backwards; transform-box: fill-box; transform-origin: center; }
        .chart-fade { animation: fade-in 0.4s ease both; }
      `}</style>

      {/* Chart header — count chips per verdict, reference-minimal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 10px', borderBottom: '1px solid #F1F4F7', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(REC_META).map(([k, v], i) => {
            const n = companies.filter(c => c.recommendation === k).length;
            if (!n) return null;
            return (
              <span key={k} className="animate-fade" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: v.color, background: v.bg, borderRadius: 999, padding: '4px 11px',
                animationDelay: `${i * 0.06}s`,
              }}>
                <strong style={{ fontWeight: 800 }}>{n}</strong>{k}
              </span>
            );
          })}
        </div>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, color: '#A9B5C2', letterSpacing: '0.05em' }}>
          bigger dot = bigger cheque · green ring = signal in 24h
        </span>
      </div>

      {/* SVG */}
      <div style={{ position: 'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
          <defs>
            <clipPath id="plot-clip">
              <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} />
            </clipPath>
          </defs>

          {/* Bullseye rings radiating from the ideal corner (fit 100 · urgency 100) */}
          <g clipPath="url(#plot-clip)">
            {[60, 130, 210, 300].map(r => (
              <circle key={r} cx={IDEAL_X} cy={IDEAL_Y} r={r} fill="none"
                stroke="#D6DBE2" strokeWidth="1" strokeDasharray="4 5" />
            ))}
          </g>

          {/* Quadrant crosshair */}
          <line x1={ZONE_X} y1={PAD.top} x2={ZONE_X} y2={PAD.top + PLOT_H} stroke="#E7EAEE" strokeWidth="1" />
          <line x1={PAD.left} y1={ZONE_Y} x2={PAD.left + PLOT_W} y2={ZONE_Y} stroke="#E7EAEE" strokeWidth="1" />

          {/* Quiet quadrant names */}
          <text x={PAD.left + PLOT_W - 8} y={PAD.top + 14} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="7.5" fontWeight="700" fill="#9CB8A9" letterSpacing="1.4">MOVE NOW</text>
          <text x={PAD.left + PLOT_W - 8} y={PAD.top + PLOT_H - 8} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="7.5" fontWeight="600" fill="#C9BB9E" letterSpacing="1.4">WATCH</text>
          <text x={PAD.left + 8} y={PAD.top + 14} fontFamily="IBM Plex Mono, monospace" fontSize="7.5" fontWeight="600" fill="#A9B8D4" letterSpacing="1.4">BUILD RELATION</text>
          <text x={PAD.left + 8} y={PAD.top + PLOT_H - 8} fontFamily="IBM Plex Mono, monospace" fontSize="7.5" fontWeight="600" fill="#B6C0CB" letterSpacing="1.4">MONITOR</text>

          {/* Axis pills */}
          <g>
            <rect x={PAD.left + PLOT_W / 2 - 52} y={H - 20} width={104} height={17} rx="8.5" fill="#F4F6F8" stroke="#E7EAEE" strokeWidth="1" />
            <text x={PAD.left + PLOT_W / 2} y={H - 8.5} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="700" fill="#7C8B9C" letterSpacing="1.6">URGENCY →</text>
          </g>
          <g transform={`translate(13,${PAD.top + PLOT_H / 2}) rotate(-90)`}>
            <rect x={-56} y={-12} width={112} height={17} rx="8.5" fill="#F4F6F8" stroke="#E7EAEE" strokeWidth="1" />
            <text x={0} y={0} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="700" fill="#7C8B9C" letterSpacing="1.6">THESIS FIT →</text>
          </g>

          {/* Company dots */}
          {dots.map((d, idx) => {
            const isSel = selected === d.id;
            const isHov = tooltip?.id === d.id;
            const fade = selected && !isSel ? 0.18 : 1;
            const pos = LABEL_POS[d.id] || 'top';
            const GAP = 5;
            const labelX = pos === 'right' ? d.svgX + d.r + GAP : pos === 'left' ? d.svgX - d.r - GAP : d.svgX;
            const labelY = pos === 'top' ? d.svgY - d.r - GAP : d.svgY + 3;
            const anchor = pos === 'right' ? 'start' : pos === 'left' ? 'end' : 'middle';
            const isMoveNow = d.recommendation === 'Move Now';
            const delay = `${idx * 0.07}s`;
            return (
              <g key={d.id} style={{ cursor: 'pointer' }} opacity={fade}
                onMouseEnter={() => setTooltip(d)}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => onSelect(isSel ? null : d.id)}>

                {/* Expanding pulse rings for Move Now */}
                {isMoveNow && (
                  <>
                    <circle cx={d.svgX} cy={d.svgY} r={d.r} fill="none" stroke={d.color} strokeWidth="1.5" strokeOpacity="0.5" className="ring-1" />
                    <circle cx={d.svgX} cy={d.svgY} r={d.r} fill="none" stroke={d.color} strokeWidth="1" strokeOpacity="0.35" className="ring-2" />
                  </>
                )}

                {/* Selection / hover halo */}
                {(isSel || isHov) && (
                  <circle cx={d.svgX} cy={d.svgY} r={d.r + 12}
                    fill={d.color} fillOpacity="0.1" />
                )}

                {/* Halo: white gap + thin ring · green ring = signal in 24h */}
                <circle cx={d.svgX} cy={d.svgY} r={d.r + 4} fill="#fff"
                  stroke={d.fresh ? '#10B981' : '#C9D2DC'} strokeWidth={d.fresh ? 1.8 : 1.4}
                  className="dot-enter" style={{ animationDelay: delay }} />

                {/* Main dot — staggered entrance, grows under the cursor */}
                <circle cx={d.svgX} cy={d.svgY} r={d.r}
                  fill={d.color}
                  className={`dot-enter${isMoveNow ? ' dot-movenow' : ' dot-hover'}`}
                  style={{ animationDelay: delay }} />

                {/* Urgency number */}
                {d.r >= 10 && (
                  <text x={d.svgX} y={d.svgY + 3.5} textAnchor="middle"
                    fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fontWeight="800"
                    fill="#fff" pointerEvents="none"
                    style={{ animation: `fade-in 0.3s ${delay} both` }}>{d.urgency}</text>
                )}

                {/* Label — coloured to match its dot so ownership is unambiguous */}
                <text x={labelX} y={labelY} textAnchor={anchor}
                  fontFamily="IBM Plex Mono, monospace" fontSize="9" fontWeight={isSel || isHov ? '700' : '600'}
                  fill={isSel || isHov ? '#0B1F33' : d.rec.color}
                  pointerEvents="none"
                  style={{ animation: `fade-in 0.4s ${parseFloat(delay) + 0.1}s both` }}>{d.name}</text>
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {tooltip && (() => {
          const rec = tooltip.rec;
          const svgEl = svgRef.current;
          const rect = svgEl?.getBoundingClientRect();
          const scaleX = rect ? rect.width / W : 1;
          const scaleY = rect ? rect.height / H : 1;
          const px = tooltip.svgX * scaleX;
          const fromRight = px > (rect?.width ?? W) * 0.58;
          const topPx = tooltip.svgY * scaleY - 50;
          return (
            <div style={{
              position: 'absolute',
              top: Math.max(8, topPx),
              left: fromRight ? undefined : px + tooltip.r * scaleX + 16,
              right: fromRight ? (rect?.width ?? W) - px + tooltip.r * scaleX + 16 : undefined,
              background: '#fff', border: `1px solid ${rec.border}`,
              borderTop: `3px solid ${rec.dot}`,
              borderRadius: 10, padding: '12px 14px', width: 220,
              boxShadow: '0 8px 32px rgba(11,31,51,0.12)', pointerEvents: 'none', zIndex: 30,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: rec.dot, flexShrink: 0 }} />
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, fontWeight: 700, color: '#0B1F33' }}>{tooltip.name}</span>
                <RecBadge rec={tooltip.recommendation} small />
              </div>
              <p style={{ fontSize: 10.5, color: '#7C8B9C', margin: '0 0 9px', lineHeight: 1.4 }}>{tooltip.tagline}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                {[['Urgency', tooltip.urgency, rec.color], ['Fit', tooltip.thesisFit, '#2563EB'], ['Inception', tooltip.inceptionScore, '#8B5CF6']].map(([lbl, val, col]) => (
                  <div key={lbl} style={{ textAlign: 'center', background: '#F8FAFC', borderRadius: 6, padding: '5px 3px' }}>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 800, color: col, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 7, color: '#A9B5C2', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: rec.color, fontWeight: 600 }}>{tooltip.recommendedCheque}</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, color: '#A9B5C2', marginTop: 2 }}>Click to open full brief</div>
            </div>
          );
        })()}
      </div>

      <SignalPulse />
    </div>
  );
}

// ─── Full company brief panel ────────────────────────────────
function CompanyBriefPanel({ company, onClose, isMobile, compact = false, onJump }) {
  const [signalsOpen, setSignalsOpen] = useState(false);
  const rec = REC_META[company.recommendation] || REC_META['Monitor'];
  const stageMeta = STAGE_META[company.stage] || STAGE_META['pre-seed'];
  const lastDate = latestSignalDate(company);
  const oneCol = isMobile || compact;

  return (
    <div style={{
      background: '#fff',
      borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
      borderTop: `3px solid ${rec.dot}`,
      borderRadius: compact ? 14 : '0 0 14px 14px', marginTop: 0,
      boxShadow: '0 4px 24px rgba(11,31,51,0.08)',
    }}>
      {/* Header */}
      <div style={{ padding: oneCol ? '14px 16px 12px' : '18px 24px 14px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: rec.dot, flexShrink: 0 }} />
              <h3 className="serif" style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: '#0B1F33', margin: 0 }}>{company.name}</h3>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: stageMeta.color, background: stageMeta.bg, border: `1px solid ${stageMeta.border}`, borderRadius: 5, padding: '2px 7px' }}>{stageMeta.label}</span>
              <RecBadge rec={company.recommendation} />
              {company.raising && <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 600, color: '#0E9F6E', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 5, padding: '2px 7px' }}>Raising</span>}
            </div>
            <p style={{ fontSize: isMobile ? 12.5 : 13, color: '#4F6072', margin: '0 0 8px', lineHeight: 1.5 }}>{company.tagline}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <WebLink website={company.website} small />
              <Src label={company.hq} /><Src label={company.sector} /><Src label={`est. ${company.founded}`} />
              {company.raisedSoFar && <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: '#C2740C', fontWeight: 600 }}>{company.raisedSoFar} raised</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#7C8B9C', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>
        {/* Scores row — full width, wraps on mobile */}
        <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
          <ScorePill value={company.thesisFit} label="Fit" />
          <ScorePill value={company.inceptionScore} label="Inception" />
          <ScorePill value={company.urgency} label="Urgency" />
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: oneCol ? '1fr' : '1fr 1fr', gap: 0 }}>

        {/* Left */}
        <div style={{ padding: oneCol ? '14px 16px' : '18px 20px', borderRight: oneCol ? 'none' : '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {/* Urgency */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A9B5C2', fontWeight: 700 }}>Investment Urgency</span>
              <Src label="firstminute analysis" />
            </div>
            <UrgencyBar value={company.urgency} />
          </div>

          {/* Cheque */}
          <div style={{ background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 10, padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <Target size={11} style={{ color: rec.color }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: rec.color, fontWeight: 700 }}>Recommended Cheque</span>
              <span style={{ marginLeft: 'auto' }}><Src label="firstminute parameters" /></span>
            </div>
            <p style={{ color: '#0B1F33', fontFamily: 'IBM Plex Mono, monospace', fontSize: 15, fontWeight: 800, margin: '0 0 5px' }}>{company.recommendedCheque}</p>
            <p style={{ color: '#4F6072', fontSize: 11.5, margin: 0, lineHeight: 1.55 }}>{company.investmentRationale}</p>
          </div>

          {/* Founders */}
          <div>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A9B5C2', fontWeight: 700, display: 'block', marginBottom: 9 }}>Founding Team</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {company.founders.map(f => (
                <div key={f.name} style={{ display: 'flex', gap: 9, padding: '8px 11px', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--hairline)' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 7 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0B1F33' }}>{f.name}</span>
                      <Src label={f.source} />
                    </div>
                    <p style={{ fontSize: 11, color: '#4F6072', margin: 0, lineHeight: 1.5 }}>{f.background}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ padding: oneCol ? '14px 16px' : '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {/* Why firstminute */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A9B5C2', fontWeight: 700 }}>Why firstminute</span>
              <Src label={company.thesisSource} />
            </div>
            <p style={{ fontSize: 12, color: '#4F6072', lineHeight: 1.7, margin: 0 }}>{company.thesisNote}</p>
          </div>

          {/* Warm path */}
          <div style={{ background: '#EEF3FF', border: '1px solid #D3E0FF', borderRadius: 10, padding: '12px 14px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2563EB', fontWeight: 700 }}>Warm Path</span>
              <Src label={company.warmPathSource} />
            </div>
            <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.6, margin: 0 }}>{company.warmPath}</p>
            <TraceInNetwork company={company} onJump={onJump} />
          </div>

          {/* Next action */}
          <div style={{ background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: rec.color, fontWeight: 700, display: 'block', marginBottom: 6 }}>Next Action</span>
            <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.6, margin: 0 }}>{company.action}</p>
          </div>

          {/* Raising */}
          {company.raising && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 12px' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0E9F6E' }}>Fundraise</span>
              <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.55, margin: '4px 0 0' }}>{company.raising}{company.raisedSoFar ? ` · ${company.raisedSoFar} committed` : ''}</p>
            </div>
          )}

          {/* Signal log */}
          <div>
            <button onClick={() => setSignalsOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', marginBottom: signalsOpen ? 9 : 0 }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A9B5C2', fontWeight: 700 }}>Signal Log ({company.signals.length} · last {relativeDate(lastDate)})</span>
              {signalsOpen ? <ChevronUp size={11} style={{ color: '#A9B5C2' }} /> : <ChevronDown size={11} style={{ color: '#A9B5C2' }} />}
            </button>
            {signalsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {company.signals.map((s, i) => {
                  const meta = SIGNAL_META[s.type] || SIGNAL_META.community;
                  const { Icon } = meta;
                  const age = daysSince(s.date);
                  return (
                    <div key={i} style={{ borderLeft: `3px solid ${meta.color}`, paddingLeft: 10, background: meta.bg, borderRadius: '0 8px 8px 0', padding: '8px 10px 8px 11px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 3 }}>
                        <Icon size={11} style={{ color: meta.color, flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 11.5, color: '#0B1F33', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{s.headline}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                        <Src label={s.source} />
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: age <= 3 ? '#0E9F6E' : '#A9B5C2', fontWeight: age <= 3 ? 700 : 400 }}>{relativeDate(s.date)}</span>
                        <StrengthDots level={s.strength} />
                      </div>
                      <p style={{ fontSize: 11, color: '#4F6072', margin: 0, lineHeight: 1.5 }}>{s.detail}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini card ────────────────────────────────────────────────
function MiniCard({ company, selected, onSelect }) {
  const rec = REC_META[company.recommendation] || REC_META['Monitor'];
  const isHot = daysSince(latestSignalDate(company)) <= 7;
  return (
    <div onClick={() => onSelect(company.id)} className="hover-lift" style={{
      padding: '11px 14px', cursor: 'pointer', borderRadius: 10,
      background: selected ? rec.bg : '#fff',
      borderTop: `1px solid ${selected ? rec.border : 'var(--border)'}`,
      borderRight: `1px solid ${selected ? rec.border : 'var(--border)'}`,
      borderBottom: `1px solid ${selected ? rec.border : 'var(--border)'}`,
      borderLeft: `3px solid ${rec.dot}`,
      transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            {isHot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />}
            <span className="serif" style={{ fontSize: 13, fontWeight: 600, color: '#0B1F33' }}>{company.name}</span>
            <RecBadge rec={company.recommendation} small />
          </div>
          <p style={{ fontSize: 10, color: '#7C8B9C', margin: 0 }}>{company.hq} · {company.sector}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 800, color: rec.dot, lineHeight: 1 }}>{company.thesisFit}</div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 7.5, color: '#A9B5C2', letterSpacing: '0.08em' }}>FIT</div>
        </div>
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, color: '#A9B5C2' }}>
        Urgency {company.urgency} · Inception {company.inceptionScore} · {company.signals.length} signals
      </div>
    </div>
  );
}

// ─── Pre-Signal watchlist table (matches Sourcing structure) ──
const REC_ORDER = ['Move Now', 'Active Pursuit', 'Build Relationship', 'Monitor'];
const PS_COLS = [
  { w: 248, label: 'Company', align: 'left' },
  { w: 166, label: 'Sector / HQ', align: 'left' },
  { w: 92,  label: 'Raised', align: 'right' },
  { w: 92,  label: 'Cheque', align: 'right' },
  { w: 58,  label: 'Fit', align: 'center' },
  { w: 150, label: 'Urgency', align: 'left' },
  { w: 96,  label: 'Last signal', align: 'center' },
  { w: 112, label: '', align: 'right' },
];

function fmtCheque(k) {
  if (!k) return '--';
  return k >= 1000 ? `$${(k / 1000).toString().replace(/\.0$/, '')}M` : `$${k}K`;
}
function avgStrength(c) { return Math.round(c.signals.reduce((s, x) => s + x.strength, 0) / c.signals.length); }

function StageChip({ stage }) {
  const m = STAGE_META[stage] || STAGE_META['pre-seed'];
  return <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 4, padding: '2px 6px' }}>{m.label}</span>;
}

function FitChip({ score }) {
  const color = score >= 90 ? '#6366F1' : score >= 80 ? '#2563EB' : '#0E9F6E';
  const bg = score >= 90 ? '#F5F3FF' : score >= 80 ? '#EEF3FF' : '#F0FDF4';
  return <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 700, color, background: bg, border: `1px solid ${color}33`, borderRadius: 6, padding: '3px 8px' }}>{score}</span>;
}

function MiniUrgency({ value }) {
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#94A3B8';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ flex: 1, height: 5, background: '#F1F4F7', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function LastSignal({ company }) {
  const d = latestSignalDate(company);
  const age = daysSince(d);
  const hot = age <= 7;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, fontWeight: hot ? 700 : 500, color: age <= 3 ? '#0E9F6E' : hot ? '#2563EB' : '#7C8B9C' }}>
      {hot && <TrendingUp size={11} />}{relativeDate(d)}
    </span>
  );
}

function Metric3({ label, value }) {
  const color = value >= 90 ? '#6366F1' : value >= 80 ? '#2563EB' : value >= 70 ? '#0E9F6E' : '#7C8B9C';
  return (
    <div style={{ background: '#fff', border: '1px solid var(--hairline)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 17, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9B5C2', marginTop: 3 }}>{label}</div>
    </div>
  );
}

// Shared expanded detail (tear-sheet left, deal facts right)
function PreSignalExpand({ company, isMobile, onJump }) {
  const rec = REC_META[company.recommendation] || REC_META['Monitor'];
  return (
    <div className="expand-in" style={{ padding: isMobile ? '0 16px 18px' : '4px 22px 22px', borderTop: isMobile ? '1px solid var(--hairline)' : 'none', background: '#FBFCFD' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr', gap: isMobile ? 14 : 24, alignItems: 'start', paddingTop: 16 }}>
        {/* Left: narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12.5, color: '#4F6072', margin: 0, lineHeight: 1.5, fontStyle: 'italic', flex: '1 1 240px' }}>{company.tagline}</p>
            <WebLink website={company.website} small />
          </div>
          <div className="tear-section tear-thesis">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <span className="field-label">Why firstminute</span><Src label={company.thesisSource} />
            </div>
            <p style={{ color: '#36475A', fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{company.thesisNote}</p>
          </div>
          <div className="tear-section tear-edge">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <span className="field-label">Warm path</span><Src label={company.warmPathSource} />
            </div>
            <p style={{ color: '#36475A', fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{company.warmPath}</p>
            <TraceInNetwork company={company} onJump={onJump} />
          </div>
          <div className="tear-section tear-signal">
            <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>Signal log · {company.signals.length} · last {relativeDate(latestSignalDate(company))}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {company.signals.map((s, i) => {
                const meta = SIGNAL_META[s.type] || SIGNAL_META.community;
                const { Icon } = meta;
                return (
                  <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                    <Icon size={12} style={{ color: meta.color, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: '#0B1F33', fontWeight: 500, margin: '0 0 3px', lineHeight: 1.4 }}>{s.headline}</p>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Src label={s.source} />
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: daysSince(s.date) <= 3 ? '#0E9F6E' : '#A9B5C2', fontWeight: daysSince(s.date) <= 3 ? 700 : 400 }}>{relativeDate(s.date)}</span>
                        <StrengthDots level={s.strength} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Next action — dark play box */}
          <div style={{ background: '#0B1F33', borderRadius: 10, padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Target size={13} style={{ color: '#60A5FA' }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8FB4FF' }}>The firstminute Play</span>
            </div>
            <p style={{ color: '#E5EDF7', fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{company.action}</p>
          </div>
        </div>

        {/* Right: deal facts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 10, padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <Target size={11} style={{ color: rec.color }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: rec.color, fontWeight: 700 }}>Recommended Cheque</span>
              <span style={{ marginLeft: 'auto' }}><Src label="firstminute parameters" /></span>
            </div>
            <p style={{ color: '#0B1F33', fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 800, margin: '0 0 5px' }}>{company.recommendedCheque}</p>
            <p style={{ color: '#4F6072', fontSize: 11.5, margin: 0, lineHeight: 1.55 }}>{company.investmentRationale}</p>
          </div>
          <div>
            <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>Founding team</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {company.founders.map(f => (
                <div key={f.name} style={{ display: 'flex', gap: 9, padding: '8px 11px', background: '#fff', borderRadius: 8, border: '1px solid var(--hairline)' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 7 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0B1F33' }}>{f.name}</span><Src label={f.source} />
                    </div>
                    <p style={{ fontSize: 11, color: '#4F6072', margin: 0, lineHeight: 1.5 }}>{f.background}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Metric3 label="Thesis Fit" value={company.thesisFit} />
            <Metric3 label="Inception" value={company.inceptionScore} />
            <Metric3 label="Urgency" value={company.urgency} />
          </div>
          {company.raising && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 12px' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0E9F6E' }}>Fundraise</span>
              <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.55, margin: '4px 0 0' }}>{company.raising}{company.raisedSoFar ? ` · ${company.raisedSoFar} committed` : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop table row
function PreSignalRow({ company, onJump }) {
  const [open, setOpen] = useState(false);
  const rec = REC_META[company.recommendation] || REC_META['Monitor'];
  return (
    <>
      <tr onClick={() => setOpen(v => !v)} style={{ cursor: 'pointer', background: open ? '#FBFCFD' : 'transparent', transition: 'background 0.12s' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#FBFCFD'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
        <td style={{ padding: '13px 12px 13px 22px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: rec.dot, flexShrink: 0 }} />
              <span className="serif" style={{ fontWeight: 600, fontSize: 15, color: '#0B1F33', letterSpacing: '-0.01em' }}>{company.name}</span>
              {open ? <ChevronUp size={13} style={{ color: '#A9B5C2' }} /> : <ChevronDown size={13} style={{ color: '#A9B5C2' }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <StageChip stage={company.stage} />
              <RecBadge rec={company.recommendation} small />
              <StrengthDots level={avgStrength(company)} />
            </div>
          </div>
        </td>
        <td style={{ padding: '13px 12px' }}>
          <div style={{ color: '#36475A', fontSize: 11.5, lineHeight: 1.4 }}>{company.sector}</div>
          <div style={{ color: '#7C8B9C', fontSize: 10.5, marginTop: 2, fontFamily: 'IBM Plex Mono, monospace' }}>{company.hq}</div>
        </td>
        <td style={{ padding: '13px 12px', textAlign: 'right' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: company.raisedSoFar ? '#0B1F33' : '#A9B5C2' }}>{company.raisedSoFar || 'stealth'}</span>
        </td>
        <td style={{ padding: '13px 12px', textAlign: 'right' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12.5, fontWeight: 700, color: rec.color }}>{fmtCheque(company.chequeMaxK)}</span>
        </td>
        <td style={{ padding: '13px 12px', textAlign: 'center' }}><FitChip score={company.thesisFit} /></td>
        <td style={{ padding: '13px 12px' }}><MiniUrgency value={company.urgency} /></td>
        <td style={{ padding: '13px 12px', textAlign: 'center' }}><LastSignal company={company} /></td>
        <td style={{ padding: '13px 16px', textAlign: 'right' }}>
          <button onClick={e => { e.stopPropagation(); setOpen(v => !v); }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600,
            color: '#2563EB', background: '#fff', border: '1px solid #D3E0FF', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', letterSpacing: '0.05em',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEF3FF'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            {open ? 'Close' : 'Full brief'} {open ? <ChevronUp size={11} /> : <ArrowRight size={11} />}
          </button>
        </td>
      </tr>
      {open && (
        <tr><td colSpan={8} style={{ padding: 0 }}><PreSignalExpand company={company} isMobile={false} onJump={onJump} /></td></tr>
      )}
    </>
  );
}

// Mobile card row
function PreSignalRowMobile({ company, onJump }) {
  const [open, setOpen] = useState(false);
  const rec = REC_META[company.recommendation] || REC_META['Monitor'];
  return (
    <div style={{ borderBottom: '1px solid var(--hairline)' }}>
      <div onClick={() => setOpen(v => !v)} style={{ padding: '14px 16px', cursor: 'pointer', background: open ? '#FBFCFD' : '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: rec.dot, flexShrink: 0 }} />
              <span className="serif" style={{ fontWeight: 600, fontSize: 15, color: '#0B1F33' }}>{company.name}</span>
              {open ? <ChevronUp size={13} style={{ color: '#A9B5C2' }} /> : <ChevronDown size={13} style={{ color: '#A9B5C2' }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 5 }}>
              <StageChip stage={company.stage} />
              <RecBadge rec={company.recommendation} small />
              <StrengthDots level={avgStrength(company)} />
            </div>
            <div style={{ fontSize: 11, color: '#7C8B9C' }}>{company.sector} · {company.hq}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 700, color: rec.color }}>{fmtCheque(company.chequeMaxK)}</div>
            <div style={{ fontSize: 8, color: '#A9B5C2', marginTop: 1, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em' }}>CHEQUE</div>
            <div style={{ marginTop: 6, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#7C8B9C' }}>urgency {company.urgency}</div>
          </div>
        </div>
      </div>
      {open && <PreSignalExpand company={company} isMobile onJump={onJump} />}
    </div>
  );
}

function PreSignalTable({ companies, isMobile, onJump }) {
  const groups = REC_ORDER
    .map(r => ({ rec: r, items: companies.filter(c => c.recommendation === r) }))
    .filter(g => g.items.length);

  return (
    <div>
      {!isMobile && (
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: 4 }}>
          <colgroup>{PS_COLS.map((c, i) => <col key={i} style={{ width: c.w }} />)}</colgroup>
          <thead>
            <tr>
              {PS_COLS.map((c, i) => (
                <th key={i} style={{ padding: '0 12px 9px', paddingLeft: i === 0 ? 22 : 12, textAlign: c.align, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A9B5C2' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
        </table>
      )}

      {groups.map(({ rec, items }) => {
        const m = REC_META[rec];
        return (
          <div key={rec} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `4px ${isMobile ? 0 : 22}px 8px` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: m.color }}>{rec}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2' }}>{items.length}</span>
            </div>
            {isMobile ? (
              <div className="card" style={{ overflow: 'hidden' }}>
                {items.map(c => <PreSignalRowMobile key={c.id} company={c} onJump={onJump} />)}
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>{PS_COLS.map((c, i) => <col key={i} style={{ width: c.w }} />)}</colgroup>
                  <tbody>
                    {items.map((c, i) => (
                      <React.Fragment key={c.id}>
                        {i > 0 && <tr><td colSpan={8} style={{ padding: 0 }}><div style={{ height: 1, background: 'var(--hairline)' }} /></td></tr>}
                        <PreSignalRow company={c} onJump={onJump} />
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Signal feed ──────────────────────────────────────────────
function SignalFeed({ items, typeFilter }) {
  const allSignals = useMemo(() => {
    const flat = [];
    items.forEach(c => c.signals.forEach(s => {
      if (typeFilter === 'all' || s.type === typeFilter)
        flat.push({ ...s, companyName: c.name, companyStage: c.stage });
    }));
    return flat.sort((a, b) => b.date.localeCompare(a.date));
  }, [items, typeFilter]);

  return (
    <div className="card" style={{ padding: '0 20px' }}>
      {allSignals.map((s, i) => {
        const meta = SIGNAL_META[s.type] || SIGNAL_META.community;
        const { Icon } = meta;
        const age = daysSince(s.date);
        const stageMeta = STAGE_META[s.companyStage] || STAGE_META['pre-seed'];
        return (
          <div key={i} style={{ display: 'flex', gap: 13, padding: '13px 0', borderBottom: '1px solid var(--hairline)', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={13} style={{ color: meta.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                <span className="serif" style={{ fontSize: 12.5, fontWeight: 600, color: '#0B1F33' }}>{s.companyName}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, color: stageMeta.color, background: stageMeta.bg, border: `1px solid ${stageMeta.border}`, borderRadius: 4, padding: '1px 5px' }}>{stageMeta.label}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: age <= 3 ? '#0E9F6E' : '#A9B5C2', fontWeight: age <= 3 ? 700 : 400 }}>{relativeDate(s.date)}</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#36475A', margin: '0 0 4px', lineHeight: 1.4 }}>{s.headline}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Src label={s.source} />
                <StrengthDots level={s.strength} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────
const SIGNAL_FILTERS = [
  { id: 'all', label: 'All' }, { id: 'departure', label: 'Departures' },
  { id: 'github', label: 'GitHub' }, { id: 'funding', label: 'Funding' },
  { id: 'team', label: 'Team' }, { id: 'product', label: 'Product' }, { id: 'press', label: 'Press' },
];

export default function EarlySignalTab({ jump, onJump }) {
  const isMobile = useIsMobile();
  const [view, setView] = useState('radar');
  const [selectedId, setSelectedId] = useState(() =>
    jump?.companyId && companies.some(c => c.id === jump.companyId) ? jump.companyId : null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  // Subsequent jumps while this tab is already mounted
  useEffect(() => {
    if (jump?.companyId && companies.some(c => c.id === jump.companyId)) {
      setView('radar');
      setSelectedId(jump.companyId);
    }
  }, [jump]);

  // ESC closes the brief drawer
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setSelectedId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sorted = useMemo(() =>
    [...companies]
      .filter(c => stageFilter === 'all' || c.stage === stageFilter)
      .sort((a, b) => (b.urgency + b.thesisFit) - (a.urgency + a.thesisFit)),
    [stageFilter]);

  const selectedCompany = selectedId ? companies.find(c => c.id === selectedId) : null;
  const totalSignals = companies.reduce((n, c) => n + c.signals.length, 0);
  const hotCount = companies.filter(c => daysSince(latestSignalDate(c)) <= 7).length;
  const raising = companies.filter(c => c.raising).length;
  const moveNow = companies.filter(c => c.recommendation === 'Move Now').length;

  return (
    <div style={{ padding: isMobile ? '16px 16px 60px' : '24px 32px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
          <Radar size={18} style={{ color: '#2563EB' }} />
          <h2 className="serif" style={{ fontSize: 22, fontWeight: 700, color: '#0B1F33', margin: 0 }}>Pre-Signal Radar</h2>
          <span className="live-shimmer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 5, padding: '3px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', animation: 'ping 1.5s ease-in-out infinite' }} />Live
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: '#4F6072', margin: '0 0 4px', maxWidth: 820, lineHeight: 1.6 }}>
          Pre-seed and seed companies surfaced before they appear on PitchBook. Hover any dot for a snapshot, click it to open the full brief. Every signal is tagged with the source it was observed on.
        </p>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2', letterSpacing: '0.06em' }}>
          Monitoring GitHub · LinkedIn · HN · Product Hunt · AngelList · WHOIS · {REFRESH_DATE}, {REFRESH_TIME}
        </span>
      </div>

      {/* Stats band */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 9, marginBottom: 22 }}>
        {[
          { label: 'Companies tracked', value: companies.length, accent: '#0B1F33' },
          { label: 'Signals logged',    value: totalSignals,     accent: '#2563EB', sub: 'all sources' },
          { label: 'Hot this week',     value: hotCount,         accent: '#0E9F6E', sub: 'signal in 7 days' },
          { label: 'Move Now',          value: moveNow,          accent: '#DC2626', sub: 'open window' },
          { label: 'Raising now',       value: raising,          accent: '#C2740C', sub: 'live rounds' },
        ].map((s, i) => (
          <div key={s.label} className="stat-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', animationDelay: `${i * 0.06}s` }}>
            <span className="field-label" style={{ fontSize: 8.5 }}>{s.label}</span>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 22, fontWeight: 800, color: s.accent, lineHeight: 1.15, margin: '3px 0 2px' }}>
              <CountUp value={s.value} />
            </div>
            {s.sub && <span style={{ fontSize: 9.5, color: '#A9B5C2' }}>{s.sub}</span>}
          </div>
        ))}
      </div>

      {/* View + filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: '#F1F4F7', borderRadius: 8, padding: 3, gap: 2 }}>
          {[{ id: 'radar', label: 'Investment Radar' }, { id: 'table', label: 'Watchlist' }, { id: 'feed', label: 'Signal Feed' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', padding: '5px 11px', borderRadius: 6, cursor: 'pointer', border: 'none', background: view === v.id ? '#fff' : 'transparent', color: view === v.id ? '#0B1F33' : '#7C8B9C', boxShadow: view === v.id ? '0 1px 3px rgba(11,31,51,0.08)' : 'none' }}>{v.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[{ id: 'all', label: 'All stages' }, { id: 'pre-seed', label: 'Pre-seed' }, { id: 'seed', label: 'Seed' }].map(f => (
            <button key={f.id} onClick={() => setStageFilter(f.id)} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 600, padding: '4px 9px', borderRadius: 6, cursor: 'pointer', background: stageFilter === f.id ? '#0B1F33' : '#fff', color: stageFilter === f.id ? '#fff' : '#7C8B9C', border: `1px solid ${stageFilter === f.id ? '#0B1F33' : 'var(--border)'}` }}>{f.label}</button>
          ))}
        </div>
        {view === 'feed' && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {SIGNAL_FILTERS.map(f => (
              <button key={f.id} onClick={() => setTypeFilter(f.id)} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 600, padding: '4px 9px', borderRadius: 6, cursor: 'pointer', background: typeFilter === f.id ? '#2563EB' : '#fff', color: typeFilter === f.id ? '#fff' : '#7C8B9C', border: `1px solid ${typeFilter === f.id ? '#2563EB' : 'var(--border)'}` }}>{f.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Radar view — chart left, action queue right; the full brief opens as a side drawer */}
      {view === 'radar' && (isMobile ? (
        <div>
          <InvestmentRadar selected={selectedId} onSelect={setSelectedId} isMobile />
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {sorted.map(c => (
              <MiniCard key={c.id} company={c} selected={selectedId === c.id} onSelect={id => setSelectedId(selectedId === id ? null : id)} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
          <InvestmentRadar selected={selectedId} onSelect={setSelectedId} isMobile={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '2px 2px 9px' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#36475A' }}>Action queue</span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, color: '#A9B5C2' }}>ranked by fit + urgency · click a dot or a card for the full brief</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sorted.map(c => (
                <MiniCard key={c.id} company={c} selected={selectedId === c.id} onSelect={id => setSelectedId(selectedId === id ? null : id)} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Watchlist table view */}
      {view === 'table' && <PreSignalTable companies={sorted} isMobile={isMobile} onJump={onJump} />}

      {/* Feed view */}
      {view === 'feed' && <SignalFeed items={sorted} typeFilter={typeFilter} />}

      {/* Full brief — side drawer, same pattern as the Portfolio/Sourcing full sheet */}
      {selectedCompany && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end', background: 'rgba(11,31,51,0.32)', backdropFilter: 'blur(2px)' }}>
          {!isMobile && <div style={{ flex: 1 }} onClick={() => setSelectedId(null)} />}
          <div className="slide-in" style={{ width: '100%', maxWidth: isMobile ? '100%' : 640, background: '#F6F7F9', height: '100%', overflowY: 'auto', boxShadow: '-24px 0 64px rgba(11,31,51,0.18)', padding: isMobile ? 10 : 14, boxSizing: 'border-box' }}>
            <CompanyBriefPanel company={selectedCompany} onClose={() => setSelectedId(null)} isMobile={isMobile} compact onJump={onJump} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 36, padding: '13px 16px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10 }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A9B5C2', display: 'block', marginBottom: 5 }}>About this feed</span>
        <p style={{ fontSize: 11.5, color: '#7C8B9C', lineHeight: 1.6, margin: 0 }}>
          In production, this feed updates daily from live API integrations: GitHub trending, LinkedIn activity, HN Show HN, Product Hunt launches, WHOIS registrations, AngelList syndicates, and EU startup press monitoring. Inception Score reflects how early and proprietary the signal is — 90+ means invisible to PitchBook. Urgency Score reflects how close the investment window is. All data in this draft is illustrative.
        </p>
      </div>
    </div>
  );
}
