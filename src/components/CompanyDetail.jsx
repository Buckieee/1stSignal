import React, { useState } from 'react';
import { X, ExternalLink, AlertTriangle, Info, Target, TrendingUp, Crosshair, Users } from 'lucide-react';
import { ValuationTrajectory, ExitDonut, ScoreGauge, CapBars, CompareBars, parseUSD, fmtUSD, Cite } from './Charts';
import { useIsMobile } from '../hooks';

const PB_SOURCE = { label: 'PitchBook company capture (scores, exit model, ownership, financials)' };

const BADGE = {
  overweight: { cls: 'badge badge-ow', label: 'Overweight' },
  add: { cls: 'badge badge-add', label: 'Add' },
  hold: { cls: 'badge badge-hold', label: 'Hold' },
  initiate: { cls: 'badge badge-init', label: 'Initiate' },
  watch: { cls: 'badge badge-watch', label: 'Watch' },
  new: { cls: 'badge badge-new', label: 'New' },
};

const TEAR = [
  { key: 'thesis', label: 'Thesis', cls: 'tear-thesis' },
  { key: 'edge', label: 'Edge', cls: 'tear-edge' },
  { key: 'signal', label: 'Signal', cls: 'tear-signal' },
  { key: 'risk', label: 'Risk', cls: 'tear-risk' },
];

const NEWS_COLORS = { major: '#2563EB', funding: '#0E9F6E', product: '#7C8B9C', alert: '#C2740C' };

function Pips({ level }) {
  return <span style={{ display: 'inline-flex', gap: 3 }}>{[1, 2, 3, 4, 5].map(i => <span key={i} className={`pip ${i <= level ? 'pip-on' : ''}`} />)}</span>;
}

// Build a plain-language read of why the exit model leans the way it does
function exitDrivers(company) {
  const ve = company.valuationExit || {};
  const drivers = [];
  if (ve.maProb >= 50) {
    drivers.push({
      axis: 'M&A', color: '#6366F1',
      text: ve.acquisitionTargetFlag
        ? `PitchBook flags this as an acquisition target. A ${ve.maProb}% M&A reading means a strategic buyer is the base case, not an IPO.`
        : `A ${ve.maProb}% M&A reading: the category consolidates into larger platforms, so a strategic sale is the most likely exit.`
    });
  }
  if (ve.ipoProb >= 50) {
    drivers.push({ axis: 'IPO', color: '#2563EB', text: `A ${ve.ipoProb}% IPO reading is rare and reflects a heavy asset base and category-leadership profile that supports a public path.` });
  } else if (ve.ipoProb >= 25) {
    drivers.push({ axis: 'IPO', color: '#2563EB', text: `A ${ve.ipoProb}% IPO probability keeps a public listing in play if the company stays independent and compounds.` });
  }
  if (ve.noExitProb != null) {
    drivers.push({
      axis: 'No exit', color: '#94A3B8',
      text: ve.noExitProb >= 25
        ? `A ${ve.noExitProb}% no-exit reading is the honest risk: still pre-PMF or in a crowded lane where not every entrant clears the bar.`
        : `Only ${ve.noExitProb}% no-exit: PitchBook sees a clear path to liquidity from here.`
    });
  }
  return drivers;
}

function Section({ title, icon, children, dark, cite }) {
  return (
    <div className="card" style={{ padding: '15px 17px', marginBottom: 14, boxShadow: 'none', background: dark ? '#0B1F33' : '#fff', border: dark ? 'none' : '1px solid var(--border)' }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13, paddingBottom: 11, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'var(--hairline)'}` }}>
          {icon}
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.13em', textTransform: 'uppercase', color: dark ? '#8FB4FF' : '#7C8B9C' }}>{title}</span>
          {cite && <span style={{ marginLeft: 'auto' }}><Cite sources={cite} /></span>}
        </div>
      )}
      {children}
    </div>
  );
}

function KV({ label, value, accent, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <span className="field-label" style={{ marginBottom: 2 }}>{label}</span>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: accent || '#0B1F33' }}>{value}</span>
    </div>
  );
}

export default function CompanyDetail({ company, onClose }) {
  const [tab, setTab] = useState('tearsheet');
  const isMobile = useIsMobile();
  if (!company) return null;

  const b = BADGE[company.rating] || BADGE.hold;
  const ve = company.valuationExit || {};
  const ts = company.tearSheet || {};
  const fm = company.firstminute || {};
  const val = parseUSD(ve.postVal);

  const compareItems = (() => {
    const items = (company.competitors || [])
      .map(c => ({ name: c.name, val: parseUSD(c.postVal) }))
      .filter(c => c.val);
    if (val) items.unshift({ name: company.name, val });
    return items.sort((a, b) => b.val - a.val).slice(0, 6);
  })();
  const myIdx = compareItems.findIndex(i => i.name === company.name);

  // Source sets, built from the real press links already attached to each company's news.
  const news = company.news || [];
  const toSrc = n => ({ label: `${n.source}: ${n.headline}`, url: n.url });
  const fundingSrc = news.filter(n => n.url && (n.type === 'funding' || n.type === 'major')).map(toSrc);
  const pressSrc = news.filter(n => n.url).map(toSrc);
  const pbSrc = [PB_SOURCE];

  const TABS = [
    { id: 'tearsheet', label: 'Tear Sheet' },
    { id: 'funding', label: 'Funding & Exit' },
    { id: 'position', label: 'FMC Position' },
    { id: 'financials', label: 'Financials' },
    { id: 'signals', label: 'Signals & News' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(11,31,51,0.45)', backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)' }}>
        {!isMobile && <div style={{ flex: 1 }} onClick={onClose} />}
        <div className="slide-in" style={{ width: '100%', maxWidth: isMobile ? '100%' : 720, background: '#F6F7F9', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-24px 0 64px rgba(11,31,51,0.18)' }}>

        {/* Header */}
        <div style={{ padding: isMobile ? '14px 16px 0' : '18px 22px 0', background: '#fff', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="serif" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#0B1F33', margin: 0, letterSpacing: '-0.01em' }}>{company.name}</h2>
                <span className={b.cls}>{b.label}</span>
                {company.stage && (
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5A7A9A', background: '#F1F4F7', border: '1px solid #E2E7ED', borderRadius: 4, padding: '2px 7px' }}>{company.stage}</span>
                )}
                <Pips level={company.conviction} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, color: '#36475A' }}>{company.primaryIndustry}</span>
                <span style={{ color: '#D6DBE2' }}>·</span>
                <span style={{ fontSize: 11, color: '#7C8B9C', fontFamily: 'IBM Plex Mono, monospace' }}>{company.hq?.split('(')[0].trim()}</span>
                {company.website && !isMobile && (<>
                  <span style={{ color: '#D6DBE2' }}>·</span>
                  <a href={`https://${company.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563EB', fontFamily: 'IBM Plex Mono, monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {company.website} <ExternalLink size={10} />
                  </a>
                </>)}
              </div>
            </div>
            <button onClick={onClose} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 8px', color: '#7C8B9C', cursor: 'pointer', flexShrink: 0 }}><X size={16} /></button>
          </div>

          {company.alerts?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {company.alerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: a.type === 'warning' ? 'var(--amber-bg)' : 'var(--blue-bg)', border: `1px solid ${a.type === 'warning' ? 'var(--amber-border)' : 'var(--blue-border)'}`, borderRadius: 8, padding: '8px 12px' }}>
                  {a.type === 'warning' ? <AlertTriangle size={13} style={{ color: '#C2740C', flexShrink: 0, marginTop: 1 }} /> : <Info size={13} style={{ color: '#2563EB', flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ fontSize: 11.5, color: '#36475A', lineHeight: 1.5 }}>{a.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sub tabs */}
          <div style={{ display: 'flex', marginTop: 12, overflowX: isMobile ? 'auto' : 'visible' }}>
            {TABS.map(({ id, label }) => {
              const active = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)} style={{
                  padding: isMobile ? '10px 11px' : '10px 13px',
                  background: 'transparent', border: 'none',
                  borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                  color: active ? '#0B1F33' : '#7C8B9C', fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: isMobile ? 9.5 : 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', marginBottom: -1, whiteSpace: 'nowrap'
                }}>{label}</button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '14px 16px 40px' : '18px 22px 40px' }}>

          {tab === 'tearsheet' && (
            <div>
              {/* Stat strip */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Total Raised', value: company.totalRaised || '--', color: '#0B1F33' },
                  { label: 'Valuation', value: val ? fmtUSD(val) : '--', color: '#2563EB' },
                  { label: 'PB Score', value: ve.opportunityScore ? `${ve.opportunityScore}` : '--', color: '#6366F1' },
                  { label: 'Exit Success', value: ve.successProb != null ? `${ve.successProb}%` : '--', color: '#0E9F6E' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: '11px 13px', boxShadow: 'none' }}>
                    <span className="field-label">{s.label}</span>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 700, color: s.color, display: 'block', marginTop: 4 }}>{s.value}</span>
                  </div>
                ))}
              </div>

              <Section title="Investment Tear Sheet">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {TEAR.map(({ key, label, cls }) => ts[key] ? (
                    <div key={key} className={`tear-section ${cls}`}>
                      <span className="field-label" style={{ marginBottom: 3 }}>{label}</span>
                      <p style={{ color: '#36475A', fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>{ts[key]}</p>
                    </div>
                  ) : null)}
                </div>
              </Section>

              {ts.action && (
                <Section title="The firstminute Play" icon={<Target size={13} style={{ color: '#60A5FA' }} />} dark>
                  <p style={{ color: '#E5EDF7', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{ts.action}</p>
                </Section>
              )}

              {company.founders?.length > 0 && (
                <Section title="Founding Team">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {company.founders.map((f, i) => (
                      <div key={f.name} style={{ paddingBottom: i < company.founders.length - 1 ? 12 : 0, borderBottom: i < company.founders.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <div>
                            <span className="serif" style={{ fontWeight: 600, fontSize: 13.5, color: '#0B1F33' }}>{f.name}</span>
                            <span style={{ marginLeft: 9, fontSize: 11, color: '#2563EB', fontFamily: 'IBM Plex Mono, monospace' }}>{f.title}</span>
                          </div>
                          {f.ownership && <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#2563EB', flexShrink: 0 }}>{f.ownership}</span>}
                        </div>
                        {f.background && <p style={{ fontSize: 12, color: '#7C8B9C', lineHeight: 1.55, margin: 0 }}>{f.background}</p>}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {company.angels?.length > 0 && (
                <Section title="Angel Syndicate">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {company.angels.map(a => (
                      <div key={a.name} style={{ background: '#F6F7F9', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 11px' }}>
                        <div style={{ fontWeight: 600, fontSize: 11.5, color: '#0B1F33' }}>{a.name}</div>
                        <div style={{ fontSize: 10.5, color: '#7C8B9C', marginTop: 1 }}>{a.knownFor}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {company.advisors?.length > 0 && (
                <Section title="Advisor Board">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {company.advisors.map(a => (
                      <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div><span style={{ fontWeight: 600, fontSize: 12.5, color: '#0B1F33' }}>{a.name}</span><span style={{ marginLeft: 8, fontSize: 11, color: '#7C8B9C' }}>{a.role}</span></div>
                        <span style={{ fontSize: 11, color: '#36475A', textAlign: 'right', maxWidth: 300 }}>{a.knownFor}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {(company.customers?.length > 0 || company.growth) && (
                <Section title="Customers & Traction" icon={<Users size={13} style={{ color: '#7C8B9C' }} />} cite={pressSrc.length ? pressSrc : pbSrc}>
                  {company.growth && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 8, padding: '9px 12px', marginBottom: company.customers?.length ? 12 : 0 }}>
                      <TrendingUp size={13} style={{ color: '#0E9F6E', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: '#36475A', lineHeight: 1.55 }}>{company.growth}</span>
                    </div>
                  )}
                  {company.customers?.length > 0 && (
                    <>
                      <span className="field-label" style={{ marginBottom: 6 }}>Notable customers</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {company.customers.map(c => <span key={c} style={{ background: '#F6F7F9', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 10px', fontSize: 11, color: '#36475A' }}>{c}</span>)}
                      </div>
                    </>
                  )}
                </Section>
              )}

              {company.verticals?.length > 0 && (
                <Section title="Sector Tags">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {company.verticals.map(v => <span key={v} style={{ background: '#F6F7F9', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 10px', fontSize: 11, color: '#36475A' }}>{v}</span>)}
                  </div>
                </Section>
              )}
            </div>
          )}

          {tab === 'funding' && (
            <div>
              <Section title="Valuation Trajectory" icon={<TrendingUp size={13} style={{ color: '#2563EB' }} />} cite={[...fundingSrc, PB_SOURCE]}>
                <ValuationTrajectory funding={company.funding} height={170} />
              </Section>

              {(ve.ipoProb != null || ve.maProb != null) && (
                <Section title="Exit Probability Model" cite={pbSrc}>
                  <p style={{ fontSize: 11.5, color: '#7C8B9C', lineHeight: 1.55, margin: 0, marginBottom: 13 }}>
                    PitchBook's machine-learning model scores the likelihood of each liquidity outcome, benchmarked against thousands of comparable venture paths. The three readings always sum to 100%.
                  </p>
                  {/* Plain-English definitions of each outcome */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 15 }}>
                    {[
                      { c: '#2563EB', t: 'IPO exit', d: 'The company lists on a public market. The best venture outcome: full liquidity at the largest scale, but the rarest path.' },
                      { c: '#6366F1', t: 'M&A exit', d: 'A strategic or financial buyer acquires the company. The most common venture exit; price depends on how many buyers compete.' },
                      { c: '#94A3B8', t: 'No exit', d: 'No liquidity event inside the modelled window: the company stays private or winds down. The downside scenario for the position.' },
                    ].map(x => (
                      <div key={x.t} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: x.c, flexShrink: 0, marginTop: 3 }} />
                        <p style={{ fontSize: 11.5, color: '#36475A', lineHeight: 1.5, margin: 0 }}>
                          <strong style={{ color: '#0B1F33' }}>{x.t}.</strong> {x.d}
                        </p>
                      </div>
                    ))}
                  </div>
                  <ExitDonut ipo={ve.ipoProb || 0} ma={ve.maProb || 0} noExit={ve.noExitProb || 0} exitType={ve.exitType} successProb={ve.successProb} />

                  {/* Why the model leans this way */}
                  <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span className="field-label">Why the model reads this way</span>
                    {exitDrivers(company).map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: 9 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0, marginTop: 4 }} />
                        <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.55, margin: 0 }}>
                          <strong style={{ color: '#0B1F33' }}>{d.axis}.</strong> {d.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hairline)', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '10px 16px' }}>
                    {ve.successProb != null && <KV label="Exit Success" value={`${ve.successProb}%`} accent="#0E9F6E" />}
                    {ve.pbEstimate && !ve.pbEstimate.includes('Not') && <KV label="PitchBook Est. Value" value={ve.pbEstimate} accent="#2563EB" />}
                    {ve.pbConfidence && ve.pbConfidence !== 'N/A' && <KV label="PB Confidence" value={ve.pbConfidence} />}
                  </div>
                  {ve.acquisitionTargetFlag && (
                    <div style={{ marginTop: 12, background: 'var(--indigo-bg)', border: '1px solid var(--indigo-border)', borderRadius: 8, padding: '9px 12px' }}>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#6366F1', letterSpacing: '0.06em' }}>● PITCHBOOK ACQUISITION TARGET FLAG ACTIVE</span>
                    </div>
                  )}
                </Section>
              )}

              {company.funding?.length > 0 && (
                <Section title="Funding History" cite={fundingSrc.length ? [...fundingSrc, PB_SOURCE] : pbSrc}>
                  <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: isMobile ? 480 : 'auto' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Date', 'Round', 'Amount', 'Post-Val', 'Lead Investors'].map((h, i) => (
                          <th key={h} style={{ padding: '0 8px 8px', textAlign: i >= 2 && i <= 3 ? 'right' : 'left', fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9B5C2' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {company.funding.map((r, i) => (
                        <tr key={i} className={r.fmc ? 'funding-row-fmc' : ''} style={{ borderBottom: '1px solid var(--hairline)' }}>
                          <td style={{ padding: '9px 8px', color: '#7C8B9C', fontFamily: 'IBM Plex Mono, monospace' }}>{r.date}</td>
                          <td style={{ padding: '9px 8px', fontWeight: 600, color: '#0B1F33' }}>
                            {r.type}{r.fmc && <span style={{ marginLeft: 6, fontSize: 8.5, color: '#2563EB', fontFamily: 'IBM Plex Mono, monospace', background: '#fff', border: '1px solid var(--blue-border)', borderRadius: 3, padding: '1px 5px', letterSpacing: '0.08em' }}>FMC</span>}
                          </td>
                          <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace', color: '#36475A' }}>{r.amount}</td>
                          <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace', color: '#2563EB', fontWeight: 600 }}>{r.postVal || '--'}</td>
                          <td style={{ padding: '9px 8px', color: '#7C8B9C', fontSize: 10.5, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.leads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="field-label">Total Raised</span>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 15, fontWeight: 700, color: '#0B1F33' }}>{company.totalRaised}</span>
                  </div>
                </Section>
              )}

              {company.capTable?.length > 0 && (
                <Section title="Cap Table: Select Holders" cite={pbSrc}>
                  <CapBars rows={company.capTable} />
                  {company.totalInvestors && <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--hairline)' }}><KV label="Total Investors" value={`${company.totalInvestors}`} /></div>}
                </Section>
              )}
            </div>
          )}

          {tab === 'position' && (
            <div>
              {/* Why firstminute is in this — radar pointers */}
              <Section title={company.type === 'held' ? 'Why firstminute holds this' : 'Why this is on the radar'} icon={<Crosshair size={13} style={{ color: '#2563EB' }} />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[
                    { label: 'Thesis fit', text: ts.signal },
                    { label: 'Edge', text: ts.edge },
                    company.growth ? { label: 'Traction', text: company.growth } : null,
                    { label: 'Conviction', text: `${b.label} rating at ${company.conviction}/5 conviction${ve.opportunityScore ? `, PitchBook Opportunity Score ${ve.opportunityScore}/100` : ''}.` },
                  ].filter(Boolean).map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 5, boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' }} />
                      <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.55, margin: 0 }}>
                        <strong style={{ color: '#0B1F33', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.label}</strong>
                        <span style={{ margin: '0 5px', color: '#CBD3DC' }}>·</span>{p.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Capital trail */}
              {(() => {
                const fmRounds = (company.funding || []).filter(r => r.fmc);
                if (company.type !== 'held' || fmRounds.length === 0) {
                  return (
                    <Section title="Capital Position">
                      <p style={{ fontSize: 12.5, color: '#36475A', lineHeight: 1.6, margin: 0 }}>
                        firstminute has not yet deployed capital here. This is a sourcing candidate; see the recommended action below for the entry play.
                      </p>
                    </Section>
                  );
                }
                return (
                  <Section title="firstminute Capital Trail">
                    <span className="field-label" style={{ marginBottom: 10 }}>Where firstminute has backed the company</span>
                    <div style={{ position: 'relative', paddingLeft: 16 }}>
                      <div style={{ position: 'absolute', left: 3, top: 4, bottom: 4, width: 2, background: 'var(--blue-border)' }} />
                      {fmRounds.map((r, i) => (
                        <div key={i} style={{ position: 'relative', paddingBottom: i < fmRounds.length - 1 ? 13 : 0 }}>
                          <span style={{ position: 'absolute', left: -16, top: 3, width: 8, height: 8, borderRadius: '50%', background: '#2563EB', border: '2px solid #fff', boxShadow: '0 0 0 1px var(--blue-border)' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0B1F33' }}>{r.type}</span>
                            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#7C8B9C' }}>{r.date}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#7C8B9C', marginTop: 1 }}>Round size {r.amount}{r.postVal ? ` · post-money ${r.postVal}` : ''}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 11 }}>
                      {company.growth && (
                        <div>
                          <span className="field-label" style={{ marginBottom: 3 }}>How the capital is working</span>
                          <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.55, margin: 0 }}>{company.growth}</p>
                        </div>
                      )}
                      {ts.action && (
                        <div>
                          <span className="field-label" style={{ marginBottom: 3 }}>How firstminute will deploy from here</span>
                          <p style={{ fontSize: 12, color: '#36475A', lineHeight: 1.55, margin: 0 }}>{ts.action}</p>
                        </div>
                      )}
                    </div>
                  </Section>
                );
              })()}

              <Section title="firstminute capital Exposure" cite={pbSrc}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '13px 18px' }}>
                  <KV label="Entry Round" value={fm.entryRound || '--'} />
                  {fm.ownership && <KV label="Ownership" value={fm.ownership} accent="#2563EB" />}
                  {fm.leadPartner && <KV label="Lead Partner" value={fm.leadPartner} full />}
                  {fm.role && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span className="field-label" style={{ marginBottom: 2 }}>Role</span>
                      <span style={{ fontSize: 12, color: '#36475A', lineHeight: 1.5 }}>{fm.role}</span>
                    </div>
                  )}
                  {fm.followOns?.length > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span className="field-label" style={{ marginBottom: 4 }}>Follow-On Rounds</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {fm.followOns.map(f => <span key={f} style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 5, padding: '3px 9px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#2563EB' }}>{f}</span>)}
                      </div>
                    </div>
                  )}
                  {fm.ownershipNote && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span className="field-label" style={{ marginBottom: 2 }}>Ownership Note</span>
                      <span style={{ fontSize: 11.5, color: '#7C8B9C', lineHeight: 1.5 }}>{fm.ownershipNote}</span>
                    </div>
                  )}
                </div>
              </Section>

              {ts.action && (
                <Section title="Recommended Action" icon={<Target size={13} style={{ color: '#60A5FA' }} />} dark>
                  <p style={{ color: '#E5EDF7', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{ts.action}</p>
                </Section>
              )}

              {compareItems.length > 1 && (
                <Section title="Valuation vs Competitors">
                  <CompareBars items={compareItems} highlightIdx={myIdx} />
                </Section>
              )}

              {company.competitors?.length > 0 && (
                <Section title="Competitive Landscape">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    {company.competitors.map((c, i) => (
                      <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: i < company.competitors.length - 1 ? 11 : 0, borderBottom: i < company.competitors.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 12.5, color: '#0B1F33' }}>{c.name}</div>
                          <div style={{ fontSize: 10.5, color: '#7C8B9C', marginTop: 2 }}>{c.hq}</div>
                          {c.notes && <div style={{ fontSize: 11, color: '#36475A', marginTop: 3, lineHeight: 1.5 }}>{c.notes}</div>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {c.raised && <div style={{ marginBottom: 4 }}><span className="field-label">Raised</span><span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#0B1F33' }}>{c.raised}</span></div>}
                          {c.postVal && <div><span className="field-label">Valuation</span><span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#2563EB' }}>{c.postVal}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {tab === 'financials' && (
            <div>
              {company.financials ? (<>
                <Section title="Operating Metrics & Balance Sheet" cite={pbSrc}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '13px 18px' }}>
                    {company.financials.revenue && <KV label="Revenue / Scale" value={company.financials.revenue} accent="#0E9F6E" />}
                    {company.financials.revenue2024 && <KV label="Revenue 2024" value={company.financials.revenue2024} accent="#0E9F6E" />}
                    {company.financials.revenue2023 && <KV label="Revenue 2023" value={company.financials.revenue2023} />}
                    {company.financials.ebitda2024 && <KV label="EBITDA 2024 ($000s)" value={company.financials.ebitda2024} accent="#DC2626" />}
                    {company.financials.netIncome2024 && <KV label="Net Income 2024" value={company.financials.netIncome2024} accent="#DC2626" />}
                    {(company.financials.totalAssets2024 || company.financials.totalAssets2025) && <KV label="Total Assets ($000s)" value={company.financials.totalAssets2024 || company.financials.totalAssets2025} />}
                    {(company.financials.totalEquity2024 || company.financials.totalEquity2025) && <KV label="Total Equity ($000s)" value={company.financials.totalEquity2024 || company.financials.totalEquity2025} />}
                    {(company.financials.totalDebt2024 != null || company.financials.totalDebt2025 != null) && <KV label="Total Debt ($000s)" value={company.financials.totalDebt2024 ?? company.financials.totalDebt2025} />}
                  </div>
                  {company.financials.notes && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
                      <span className="field-label" style={{ marginBottom: 4 }}>Analyst Notes</span>
                      <p style={{ fontSize: 12.5, color: '#36475A', lineHeight: 1.65, margin: 0 }}>{company.financials.notes}</p>
                    </div>
                  )}
                </Section>
                {company.acquisitions?.length > 0 && (
                  <Section title="Acquisitions">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {company.acquisitions.map(a => <span key={a} style={{ background: '#F6F7F9', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 10px', fontSize: 11, color: '#36475A' }}>{a}</span>)}
                    </div>
                  </Section>
                )}
              </>) : (
                <div style={{ textAlign: 'center', padding: 48, color: '#7C8B9C', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>No financial data available</div>
              )}
            </div>
          )}

          {tab === 'signals' && (
            <div>
              {company.signals && (
                <Section title="Web & Market Signals" cite={pbSrc}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '13px 16px', marginBottom: 12 }}>
                    {company.signals.weeklyVisitors && <KV label="Weekly Visitors" value={company.signals.weeklyVisitors} accent="#2563EB" />}
                    {company.signals.referringDomains && <KV label="Referring Domains" value={company.signals.referringDomains} />}
                    {company.signals.trend && (
                      <div>
                        <span className="field-label" style={{ marginBottom: 2 }}>Trend</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: /Strong|Rapid|Sharp/.test(company.signals.trend) ? '#0E9F6E' : '#36475A' }}>{company.signals.trend}</span>
                      </div>
                    )}
                  </div>
                  {company.signals.detail && <p style={{ fontSize: 12, color: '#7C8B9C', lineHeight: 1.6, margin: 0, paddingTop: 10, borderTop: '1px solid var(--hairline)' }}>{company.signals.detail}</p>}
                </Section>
              )}

              {company.news?.length > 0 && (
                <Section title="News Flow">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    {company.news.map((n, i) => {
                      const color = NEWS_COLORS[n.type] || '#7C8B9C';
                      const Tag = n.url ? 'a' : 'div';
                      return (
                        <Tag key={i} {...(n.url ? { href: n.url, target: '_blank', rel: 'noreferrer' } : {})}
                          style={{ borderLeft: `3px solid ${color}`, paddingLeft: 13, textDecoration: 'none', display: 'block' }}>
                          <p style={{ fontSize: 12.5, color: '#0B1F33', lineHeight: 1.55, margin: 0, marginBottom: 5, fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                            {n.headline}{n.url && <ExternalLink size={11} style={{ color: '#A9B5C2', flexShrink: 0, marginTop: 2 }} />}
                          </p>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{n.type}</span>
                            <span style={{ color: '#D6DBE2' }}>·</span>
                            <span style={{ fontSize: 10.5, color: '#7C8B9C' }}>{n.source}</span>
                            <span style={{ color: '#D6DBE2' }}>·</span>
                            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#A9B5C2' }}>{n.date}</span>
                          </div>
                        </Tag>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* Provenance footer */}
          <div style={{ marginTop: 8, padding: '12px 14px', background: '#F1F4F7', border: '1px solid var(--border)', borderRadius: 9 }}>
            <span className="field-label" style={{ marginBottom: 5 }}>Data provenance</span>
            <p style={{ fontSize: 11, color: '#7C8B9C', lineHeight: 1.55, margin: 0 }}>
              Hover any <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#C3CCD7', verticalAlign: 'middle' }} /> for sources. Quantitative fields (Opportunity Score, exit model, ownership, cap table, financials) are from a PitchBook company capture. Funding, customers and news are press-sourced with links shown. Figures are dated 2026 as reported and unverified; this is an illustrative draft.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
