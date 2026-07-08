import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, ArrowRight, AlertTriangle, Info, TrendingUp, Target, Zap, Users } from 'lucide-react';
import { ValuationTrajectory, ExitBarMini, MomentumMeter, Cite, BookGlance, SourcingMap, parseUSD, fmtUSD } from './Charts';
import { WARM_PATH_COMPANIES } from './DoorsTab';
import { useIsMobile } from '../hooks';

const BADGE = {
  overweight: { cls: 'badge badge-ow', label: 'Overweight' },
  add: { cls: 'badge badge-add', label: 'Add' },
  hold: { cls: 'badge badge-hold', label: 'Hold' },
  initiate: { cls: 'badge badge-init', label: 'Initiate' },
  watch: { cls: 'badge badge-watch', label: 'Watch' },
  new: { cls: 'badge badge-new', label: 'New' },
};

const SECTION_ORDER = ['flagship', 'accelerating', 'steady', 'new2026', 'initiate', 'watchlist'];
const SECTION_LABELS = {
  flagship: 'Flagship Holdings',
  accelerating: 'Accelerating',
  steady: 'Steady State',
  new2026: 'New in 2026',
  initiate: 'Initiate Coverage',
  watchlist: 'Watch List',
};

function Pips({ level }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => <span key={i} className={`pip ${i <= level ? 'pip-on' : ''}`} />)}
    </span>
  );
}

function ScoreChip({ score }) {
  if (!score) return <span style={{ color: '#A9B5C2' }}>--</span>;
  const color = score >= 90 ? '#6366F1' : score >= 80 ? '#2563EB' : '#7C8B9C';
  const bg = score >= 90 ? '#EEEFFE' : score >= 80 ? '#EEF3FF' : '#F1F4F7';
  const border = score >= 90 ? '#D8DAFB' : score >= 80 ? '#D3E0FF' : '#E2E7ED';
  return (
    <span style={{
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 700,
      color, background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '3px 8px'
    }}>{score}</span>
  );
}

function AlertIcon({ alerts }) {
  if (!alerts?.length) return null;
  const warn = alerts.some(a => a.type === 'warning');
  return warn
    ? <AlertTriangle size={12} style={{ color: '#C2740C' }} title={alerts[0].message} />
    : <Info size={12} style={{ color: '#2563EB' }} title={alerts[0].message} />;
}

const TEAR_FIELDS = [
  { key: 'thesis', label: 'Thesis', cls: 'tear-thesis' },
  { key: 'edge', label: 'Edge', cls: 'tear-edge' },
  { key: 'signal', label: 'Signal', cls: 'tear-signal' },
  { key: 'risk', label: 'Risk', cls: 'tear-risk' },
];

function Metric({ label, value, accent }) {
  return (
    <div>
      <span className="field-label" style={{ marginBottom: 2 }}>{label}</span>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, fontWeight: 600, color: accent || '#0B1F33' }}>{value}</span>
    </div>
  );
}

// Mobile card layout for a company row
function RowMobile({ company, onSelect }) {
  const [open, setOpen] = useState(false);
  const b = BADGE[company.rating] || BADGE.hold;
  const ve = company.valuationExit || {};
  const ts = company.tearSheet || {};
  const fm = company.firstminute || {};
  const val = parseUSD(ve.postVal);

  return (
    <div style={{ borderBottom: '1px solid var(--hairline)' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ padding: '14px 16px', cursor: 'pointer', background: open ? '#FBFCFD' : '#fff' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <span className="serif" style={{ fontWeight: 600, fontSize: 15, color: '#0B1F33' }}>{company.name}</span>
              <AlertIcon alerts={company.alerts} />
              {open ? <ChevronUp size={13} style={{ color: '#A9B5C2' }} /> : <ChevronDown size={13} style={{ color: '#A9B5C2' }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <span className={b.cls}>{b.label}</span>
              {company.stage && (
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5A7A9A', background: '#F1F4F7', border: '1px solid #E2E7ED', borderRadius: 4, padding: '2px 7px' }}>{company.stage}</span>
              )}
              <Pips level={company.conviction} />
            </div>
            <div style={{ fontSize: 11, color: '#7C8B9C' }}>{company.primaryIndustry}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 700, color: '#2563EB' }}>{val ? fmtUSD(val) : '--'}</div>
            <div style={{ fontSize: 9, color: '#A9B5C2', marginTop: 1, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.04em' }}>VALUATION</div>
            <button
              onClick={e => { e.stopPropagation(); onSelect(company); }}
              style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 600, color: '#2563EB', background: '#fff', border: '1px solid #D3E0FF', borderRadius: 5, padding: '4px 8px', cursor: 'pointer' }}
            >
              Sheet <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 16px 18px', background: '#FBFCFD', borderTop: '1px solid var(--hairline)' }}>
          <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {TEAR_FIELDS.map(({ key, label, cls }) => ts[key] ? (
              <div key={key} className={`tear-section ${cls}`}>
                <span className="field-label" style={{ marginBottom: 3 }}>{label}</span>
                <p style={{ color: '#36475A', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{ts[key]}</p>
              </div>
            ) : null)}

            {ts.action && (
              <div style={{ background: '#0B1F33', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <Target size={12} style={{ color: '#60A5FA' }} />
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8FB4FF' }}>The firstminute Play</span>
                </div>
                <p style={{ color: '#E5EDF7', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{ts.action}</p>
              </div>
            )}

            <div className="card" style={{ padding: '10px 12px', boxShadow: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <TrendingUp size={11} style={{ color: '#2563EB' }} />
                <span className="field-label">Valuation Trajectory</span>
              </div>
              <ValuationTrajectory funding={company.funding} height={120} />
            </div>

            {company.alerts?.length > 0 && company.alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: a.type === 'warning' ? 'var(--amber-bg)' : 'var(--blue-bg)', border: `1px solid ${a.type === 'warning' ? 'var(--amber-border)' : 'var(--blue-border)'}`, borderRadius: 7, padding: '8px 11px' }}>
                {a.type === 'warning' ? <AlertTriangle size={12} style={{ color: '#C2740C', flexShrink: 0, marginTop: 1 }} /> : <Info size={12} style={{ color: '#2563EB', flexShrink: 0, marginTop: 1 }} />}
                <span style={{ fontSize: 11, color: '#36475A', lineHeight: 1.5 }}>{a.message}</span>
              </div>
            ))}

            {company.growth && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 7, padding: '8px 11px' }}>
                <Zap size={12} style={{ color: '#0E9F6E', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: '#36475A', lineHeight: 1.5 }}>{company.growth}</span>
              </div>
            )}

            {company.customers?.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <Users size={11} style={{ color: '#7C8B9C' }} />
                  <span className="field-label">Notable customers</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {company.customers.map(c => <span key={c} style={{ fontSize: 10.5, color: '#36475A', background: '#fff', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>{c}</span>)}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 14px' }}>
              {fm.entryRound && <Metric label="FMC Entry" value={fm.entryRound} />}
              {fm.ownership && fm.ownership !== 'None (sourcing candidate)' && <Metric label="FMC Ownership" value={fm.ownership} accent="#2563EB" />}
              {ve.successProb != null && <Metric label="Exit Success" value={`${ve.successProb}%`} accent="#0E9F6E" />}
              {ve.opportunityScore && <Metric label="PB Score" value={`${ve.opportunityScore}`} accent="#6366F1" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Provenance for the valuation figure: the round it comes from + the PitchBook estimate.
function valuationSources(company) {
  const ve = company.valuationExit || {};
  const last = (company.funding || [])[0];
  const out = [];
  if (last?.postVal) out.push({ label: `Last round: ${last.type || 'round'} ${last.date || ''} · ${last.postVal} post-money` });
  if (ve.pbEstimate && !/not/i.test(ve.pbEstimate)) out.push({ label: `PitchBook estimate: ${ve.pbEstimate}${ve.pbConfidence ? ` · confidence ${ve.pbConfidence}` : ''}` });
  return out;
}

// Desktop table row
function Row({ company, onSelect, autoOpen }) {
  const [open, setOpen] = useState(!!autoOpen);
  const rowRef = useRef(null);
  useEffect(() => {
    if (autoOpen) setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }, [autoOpen]);
  const b = BADGE[company.rating] || BADGE.hold;
  const ve = company.valuationExit || {};
  const ts = company.tearSheet || {};
  const fm = company.firstminute || {};
  const val = parseUSD(ve.postVal);

  return (
    <>
      <tr
        ref={rowRef}
        onClick={() => setOpen(v => !v)}
        style={{ cursor: 'pointer', transition: 'background 0.12s', background: open ? '#FBFCFD' : 'transparent' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#FBFCFD'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <td style={{ padding: '14px 16px 14px 22px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="serif" style={{ fontWeight: 600, fontSize: 15, color: '#0B1F33', letterSpacing: '-0.01em' }}>{company.name}</span>
              <AlertIcon alerts={company.alerts} />
              {open ? <ChevronUp size={13} style={{ color: '#A9B5C2' }} /> : <ChevronDown size={13} style={{ color: '#A9B5C2' }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className={b.cls}>{b.label}</span>
              {company.stage && (
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5A7A9A', background: '#F1F4F7', border: '1px solid #E2E7ED', borderRadius: 4, padding: '2px 7px' }}>{company.stage}</span>
              )}
              <Pips level={company.conviction} />
            </div>
          </div>
        </td>
        <td style={{ padding: '14px 12px' }}>
          <div style={{ color: '#36475A', fontSize: 11.5, lineHeight: 1.4 }}>{company.primaryIndustry}</div>
          <div style={{ color: '#7C8B9C', fontSize: 10.5, marginTop: 2, fontFamily: 'IBM Plex Mono, monospace' }}>
            {company.hq?.split(',').slice(-1)[0]?.replace(/\(.*/, '').trim() || company.hq}
          </div>
        </td>
        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12.5, fontWeight: 600, color: '#0B1F33' }}>{company.totalRaised || '--'}</span>
        </td>
        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12.5, fontWeight: 600, color: '#2563EB' }}>
            {val ? fmtUSD(val) : '--'}
          </span>
          {val ? <Cite sources={valuationSources(company)} /> : null}
        </td>
        <td style={{ padding: '14px 12px', textAlign: 'center' }}><ScoreChip score={ve.opportunityScore} /></td>
        <td style={{ padding: '14px 12px' }}><ExitBarMini ipo={ve.ipoProb || 0} ma={ve.maProb || 0} noExit={ve.noExitProb || 0} /></td>
        <td style={{ padding: '14px 12px', textAlign: 'center' }}><MomentumMeter trend={company.signals?.trend} /></td>
        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
          <button onClick={e => { e.stopPropagation(); onSelect(company); }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600,
            color: '#2563EB', background: '#fff', border: '1px solid #D3E0FF',
            borderRadius: 6, padding: '5px 10px', cursor: 'pointer', letterSpacing: '0.05em',
            transition: 'background 0.12s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEF3FF'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >Full sheet <ArrowRight size={11} /></button>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={8} style={{ padding: 0, background: '#FBFCFD' }}>
            <div className="expand-in" style={{ padding: '4px 22px 22px', borderTop: '1px solid var(--hairline)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* Left: tear sheet */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13, paddingTop: 16 }}>
                  {TEAR_FIELDS.map(({ key, label, cls }) => ts[key] ? (
                    <div key={key} className={`tear-section ${cls}`}>
                      <span className="field-label" style={{ marginBottom: 3 }}>{label}</span>
                      <p style={{ color: '#36475A', fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{ts[key]}</p>
                    </div>
                  ) : null)}
                  {ts.action && (
                    <div style={{ background: '#0B1F33', borderRadius: 10, padding: '13px 16px', marginTop: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                        <Target size={13} style={{ color: '#60A5FA' }} />
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8FB4FF' }}>The firstminute Play</span>
                      </div>
                      <p style={{ color: '#E5EDF7', fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{ts.action}</p>
                    </div>
                  )}
                </div>

                {/* Right: chart + metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
                  <div className="card" style={{ padding: '12px 14px 6px', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <TrendingUp size={12} style={{ color: '#2563EB' }} />
                      <span className="field-label">Valuation Trajectory (log scale)</span>
                    </div>
                    <ValuationTrajectory funding={company.funding} height={140} />
                  </div>
                  {company.alerts?.length > 0 && company.alerts.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: a.type === 'warning' ? 'var(--amber-bg)' : 'var(--blue-bg)', border: `1px solid ${a.type === 'warning' ? 'var(--amber-border)' : 'var(--blue-border)'}`, borderRadius: 8, padding: '9px 12px' }}>
                      {a.type === 'warning' ? <AlertTriangle size={13} style={{ color: '#C2740C', flexShrink: 0, marginTop: 1 }} /> : <Info size={13} style={{ color: '#2563EB', flexShrink: 0, marginTop: 1 }} />}
                      <span style={{ fontSize: 11.5, color: '#36475A', lineHeight: 1.5 }}>{a.message}</span>
                    </div>
                  ))}
                  {company.growth && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 8, padding: '9px 12px' }}>
                      <Zap size={13} style={{ color: '#0E9F6E', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11.5, color: '#36475A', lineHeight: 1.5 }}>{company.growth}</span>
                    </div>
                  )}
                  {company.customers?.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Users size={12} style={{ color: '#7C8B9C' }} />
                        <span className="field-label">Notable customers</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {company.customers.map(c => (
                          <span key={c} style={{ fontSize: 11, color: '#36475A', background: '#fff', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 9px' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 16px' }}>
                    {fm.entryRound && <Metric label="FMC Entry" value={fm.entryRound} />}
                    {fm.ownership && fm.ownership !== 'None (sourcing candidate)' && <Metric label="FMC Ownership" value={fm.ownership} accent="#2563EB" />}
                    {company.employees && <Metric label="Headcount" value={`${company.employees}`} />}
                    {company.founded && <Metric label="Founded" value={`${company.founded}`} />}
                    {ve.successProb != null && <Metric label="Exit Success" value={`${ve.successProb}%`} accent="#0E9F6E" />}
                    {ve.pbEstimate && !ve.pbEstimate.includes('Not') && <Metric label="PB Est. Value" value={ve.pbEstimate} accent="#2563EB" />}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const TONE = {
  amber: { dot: '#C2740C', bg: 'var(--amber-bg)', border: 'var(--amber-border)' },
  blue: { dot: '#2563EB', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  green: { dot: '#0E9F6E', bg: 'var(--green-bg)', border: 'var(--green-border)' },
  indigo: { dot: '#6366F1', bg: 'var(--indigo-bg)', border: 'var(--indigo-border)' },
};

// Provenance chip on each radar callout: where the claim comes from and whether it still needs a human check.
const STATUS_CHIP = {
  unverified: { label: 'unverified · check internally', color: '#C2740C', tip: 'Sourced from press or network intelligence; not yet confirmed by the fund.' },
  pitchbook:  { label: 'pitchbook data', color: '#2563EB', tip: 'Computed directly from PitchBook fields in this dataset.' },
  fund:       { label: 'fund records', color: '#0E9F6E', tip: 'From firstminute\'s own records or published materials.' },
};

function buildRadar(companies, tab) {
  const set = companies.filter(c => c.type === (tab === 'held' ? 'held' : 'sourcing'));
  const out = [];
  if (tab === 'held') {
    set.forEach(c => (c.alerts || []).forEach(a => {
      if (a.type === 'warning') out.push({ tone: 'amber', label: 'Act', name: c.name, text: a.message, status: 'unverified' });
    }));
    const scored = set.filter(c => c.valuationExit?.opportunityScore).sort((a, b) => b.valuationExit.opportunityScore - a.valuationExit.opportunityScore)[0];
    if (scored) out.push({ tone: 'blue', label: 'Top conviction', name: scored.name, text: `PitchBook Opportunity Score ${scored.valuationExit.opportunityScore}/100, the highest in the held book.`, status: 'pitchbook' });
    const byOwn = set.map(c => ({ c, pct: parseFloat(c.firstminute?.ownership) })).filter(x => !isNaN(x.pct)).sort((a, b) => b.pct - a.pct)[0];
    if (byOwn) out.push({ tone: 'green', label: 'Biggest stake', name: byOwn.c.name, text: `firstminute holds ${byOwn.c.firstminute.ownership}, the largest position in the portfolio.`, status: 'fund' });
  } else {
    const scored = set.filter(c => c.valuationExit?.opportunityScore).sort((a, b) => b.valuationExit.opportunityScore - a.valuationExit.opportunityScore)[0];
    if (scored) out.push({ tone: 'blue', label: 'Highest score', name: scored.name, text: `Opportunity Score ${scored.valuationExit.opportunityScore}/100, top of the sourcing radar.`, status: 'pitchbook' });
    set.forEach(c => {
      if (/talks|raising/i.test(c.stage || '') || (c.alerts || []).some(a => /window|closing|in discussions|moving fast/i.test(a.message))) {
        out.push({ tone: 'amber', label: 'Window open', name: c.name, text: (c.alerts?.[0]?.message) || `${c.stage}: approach window is live.`, status: 'unverified' });
      }
    });
    set.forEach(c => {
      if ((c.alerts || []).some(a => /2026 predictions/i.test(a.message))) out.push({ tone: 'green', label: 'On thesis', name: c.name, text: 'Named in firstminute’s published 2026 predictions.', status: 'fund' });
    });
  }
  return out.slice(0, 4);
}

function RadarBanner({ items, tab, isMobile }) {
  if (!items.length) return null;
  const cols = isMobile ? Math.min(items.length, 2) : Math.min(items.length, 4);
  return (
    <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ display: 'inline-flex', width: 7, height: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.14)' }} />
        </span>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0B1F33' }}>
          Analyst Radar
        </span>
        {!isMobile && (
          <span style={{ fontSize: 11, color: '#7C8B9C' }}>
            {tab === 'held' ? 'what to look at first across the held book' : 'where to lean in across sourcing'}
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isMobile ? 8 : 12 }}>
        {items.map((it, i) => {
          const t = TONE[it.tone] || TONE.blue;
          const st = STATUS_CHIP[it.status];
          return (
            <div key={i} className="stat-card" style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 9, padding: isMobile ? '9px 11px' : '11px 13px', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 7, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.dot }}>{it.label}</span>
                <span className="serif" style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#0B1F33', marginLeft: isMobile ? 0 : 'auto' }}>{it.name}</span>
              </div>
              <p style={{ fontSize: isMobile ? 11 : 11.5, color: '#36475A', lineHeight: 1.5, margin: 0 }}>{it.text}</p>
              {st && (
                <span title={st.tip} style={{
                  alignSelf: 'flex-start', marginTop: 8, cursor: 'pointer',
                  fontFamily: 'IBM Plex Mono, monospace', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: st.color, background: '#FFFFFFAA', border: `1px solid ${st.color}33`, borderRadius: 4, padding: '2px 6px',
                }}>{st.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COLS = [
  { w: 270, label: 'Company', align: 'left' },
  { w: 180, label: 'Sector / HQ', align: 'left' },
  { w: 100, label: 'Raised', align: 'right', tip: 'Total disclosed funding to date (PitchBook)' },
  { w: 110, label: 'Valuation', align: 'right', tip: 'Latest post-money. Hover the dot next to each figure for the round it comes from.' },
  { w: 70, label: 'Score', align: 'center', tip: 'PitchBook Opportunity Score, 0-100' },
  { w: 150, label: 'Exit Model', align: 'left', tip: 'PitchBook exit-path probabilities. IPO / M&A / X = no exit.' },
  { w: 80, label: 'Momentum', align: 'center', tip: 'Qualitative trend from PitchBook web signals (traffic, hiring). Hover a meter for the underlying label.' },
  { w: 110, label: '', align: 'right' },
];

export default function CompanyTable({ companies, onSelectCompany, tab, jump }) {
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.primaryIndustry || '').toLowerCase().includes(q) ||
      (c.hq || '').toLowerCase().includes(q) ||
      (c.tearSheet?.thesis || '').toLowerCase().includes(q)
    ) : companies;
  }, [companies, search]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(c => { (map[c.section || 'other'] ||= []).push(c); });
    return SECTION_ORDER.filter(s => map[s]?.length).map(s => ({ section: s, items: map[s] }));
  }, [filtered]);

  const radar = useMemo(() => buildRadar(companies, tab), [companies, tab]);

  return (
    <div style={{ padding: isMobile ? '16px 16px 48px' : '22px 32px 48px' }}>
      <RadarBanner items={radar} tab={tab} isMobile={isMobile} />

      {tab === 'held'
        ? <BookGlance companies={companies} onSelect={onSelectCompany} />
        : <SourcingMap companies={companies} onSelect={onSelectCompany} warmSet={WARM_PATH_COMPANIES} />}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A9B5C2' }} />
          <input
            type="text" placeholder="Search companies, sectors, thesis..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 35, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              background: '#fff', border: '1px solid var(--border)', borderRadius: 9,
              color: '#0B1F33', fontSize: 12.5, fontFamily: 'Inter, system-ui, sans-serif',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        {!isMobile && (
          <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#7C8B9C', letterSpacing: '0.08em' }}>
            {filtered.length} {tab === 'held' ? 'HELD POSITIONS' : 'SOURCING TARGETS'}
          </span>
        )}
      </div>

      {/* Desktop column header */}
      {!isMobile && (
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: 4 }}>
          <colgroup>{COLS.map((c, i) => <col key={i} style={{ width: c.w }} />)}</colgroup>
          <thead>
            <tr>
              {COLS.map((c, i) => (
                <th key={i} title={c.tip} style={{
                  padding: '0 12px 9px', paddingLeft: i === 0 ? 22 : 12,
                  textAlign: c.align, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5,
                  fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A9B5C2',
                  cursor: c.tip ? 'help' : 'default',
                  textDecoration: c.tip ? 'underline dotted #D6DBE2' : 'none', textUnderlineOffset: 3,
                }}>{c.label}</th>
              ))}
            </tr>
          </thead>
        </table>
      )}

      {grouped.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 0', color: '#7C8B9C', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>
          No companies match that search.
        </div>
      ) : grouped.map(({ section, items }) => (
        <div key={section} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `4px ${isMobile ? 0 : 22}px 8px` }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7C8B9C' }}>
              {SECTION_LABELS[section] || section}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2' }}>{items.length}</span>
          </div>

          {isMobile ? (
            <div className="card" style={{ overflow: 'hidden' }}>
              {items.map((c, i) => (
                <React.Fragment key={c.id}>
                  <RowMobile company={c} onSelect={onSelectCompany} />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>{COLS.map((c, i) => <col key={i} style={{ width: c.w }} />)}</colgroup>
                <tbody>
                  {items.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && <tr><td colSpan={8} style={{ padding: 0 }}><div style={{ height: 1, background: 'var(--hairline)' }} /></td></tr>}
                      <Row company={c} onSelect={onSelectCompany} autoOpen={jump?.openCompany === c.name} />
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
