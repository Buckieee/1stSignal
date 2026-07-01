import React, { useMemo } from 'react';
import { Building2, Radar, Network, FileText, Zap } from 'lucide-react';
import { parseUSD, fmtUSD } from './Charts';
import { useIsMobile } from '../hooks';
import { BUILD_DATE_LABEL } from '../constants';

function KpiBand({ items, isMobile }) {
  if (isMobile) {
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        background: '#FBFCFD', border: '1px solid var(--border)', borderRadius: 11,
        overflow: 'hidden', flexShrink: 0
      }}>
        {items.map((it, i) => (
          <div key={it.label} style={{
            display: 'flex', flexDirection: 'column', gap: 3,
            padding: '10px 14px',
            borderLeft: i % 2 !== 0 ? '1px solid var(--hairline)' : 'none',
            borderTop: i >= 2 ? '1px solid var(--hairline)' : 'none',
          }}>
            <span className="field-label" style={{ fontSize: 8.5 }}>{it.label}</span>
            <span className="stat-num" style={{ fontSize: 18, color: it.accent || '#0B1F33' }}>{it.value}</span>
            <span style={{ fontSize: 9, color: '#7C8B9C' }}>{it.sub}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', flexShrink: 0,
      background: '#FBFCFD', border: '1px solid var(--border)', borderRadius: 11,
      overflow: 'hidden'
    }}>
      {items.map((it, i) => (
        <div key={it.label} style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          padding: '11px 18px',
          borderLeft: i ? '1px solid var(--hairline)' : 'none',
          minWidth: 96,
        }}>
          <span className="field-label">{it.label}</span>
          <span className="stat-num" style={{ fontSize: 22, color: it.accent || '#0B1F33' }}>{it.value}</span>
          <span style={{ fontSize: 10, color: '#7C8B9C' }}>{it.sub}</span>
        </div>
      ))}
    </div>
  );
}

export default function Header({ activeTab, setActiveTab, heldCount, sourcingCount, companies }) {
  const isMobile = useIsMobile();

  const stats = useMemo(() => {
    const held = companies.filter(c => c.type === 'held');
    let combinedM = 0;
    held.forEach(c => { const v = parseUSD(c.valuationExit?.postVal); if (v) combinedM += v; });
    const unicorns = held.filter(c => {
      const v = parseUSD(c.valuationExit?.postVal);
      return v && v >= 1000;
    }).length;
    const attention = held.filter(c => (c.alerts || []).some(a => a.type === 'warning')).length;
    return { combined: `${fmtUSD(combinedM)}+`, unicorns, attention };
  }, [companies]);

  const tabs = [
    { id: 'held', label: 'Portfolio', count: heldCount, Icon: Building2 },
    { id: 'sourcing', label: 'Sourcing', count: sourcingCount, Icon: Radar },
    { id: 'presignal', label: 'Pre-Signal', count: null, Icon: Zap, live: true },
    { id: 'doors', label: 'Network', count: null, Icon: Network },
    { id: 'notes', label: 'Notes', count: null, Icon: FileText },
  ];

  const kpiItems = [
    { label: 'Held Positions', value: heldCount, sub: 'active companies' },
    { label: 'Combined Value', value: stats.combined, sub: 'latest post-money', accent: '#2563EB' },
    { label: 'Unicorns', value: stats.unicorns, sub: '$1B+ valuation' },
    { label: 'Need Attention', value: stats.attention, sub: 'flagged for action', accent: stats.attention > 0 ? '#C2740C' : '#0B1F33' },
  ];

  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{
        padding: isMobile ? '14px 16px' : '18px 32px 18px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 14 : 40,
        maxWidth: 1360, margin: '0 auto'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 7 : 9, flex: isMobile ? 'none' : 1, minWidth: isMobile ? 0 : 280, maxWidth: isMobile ? 'none' : 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(37,99,235,0.28)'
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1, letterSpacing: '-0.03em' }}>1st</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 className="serif" style={{ fontSize: 22, fontWeight: 700, color: '#0B1F33', margin: 0, letterSpacing: '-0.015em', lineHeight: 1.05 }}>
                1st<span style={{ color: '#2563EB' }}>Signal</span>
              </h1>
              <a href="https://1stsignal.uk" target="_blank" rel="noreferrer"
                style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7C8B9C', textDecoration: 'none', marginTop: 2 }}>
                firstminute capital
              </a>
            </div>
          </div>
          {/* Intersection explainer — hide on mobile to save space */}
          {!isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 360 }}>
              <p style={{ color: '#0B1F33', fontSize: 12.5, margin: 0, fontWeight: 600, lineHeight: 1.35 }}>
                Portfolio · Sourcing · Network: where all three intersect.
              </p>
              <p style={{ color: '#6B7F93', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                Built for a quick call. Every position a live tear sheet, every target a warm path, every relationship mapped to a door.
              </p>
            </div>
          )}
        </div>

        {/* KPI band */}
        <KpiBand items={kpiItems} isMobile={isMobile} />
      </div>

      {/* Tab bar */}
      <div style={{ padding: isMobile ? '0 16px' : '0 32px', borderTop: '1px solid var(--hairline)', overflowX: isMobile ? 'auto' : 'visible' }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 1360, margin: '0 auto', minWidth: isMobile ? 'max-content' : 'auto' }}>
          {tabs.map(({ id, label, count, Icon, live }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: isMobile ? '11px 12px' : '11px 15px',
                background: 'transparent', border: 'none',
                borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                color: active ? '#0B1F33' : '#7C8B9C',
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
                fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', marginBottom: -1, transition: 'color 0.15s',
                whiteSpace: 'nowrap'
              }}>
                <Icon size={13} strokeWidth={active ? 2.4 : 1.9} />
                {label}
                {live && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
                )}
                {count != null && (
                  <span style={{
                    background: active ? '#EEF3FF' : '#F1F4F7',
                    color: active ? '#2563EB' : '#94A3B8',
                    borderRadius: 5, padding: '1px 6px', fontSize: 10, fontWeight: 700, letterSpacing: 0
                  }}>{count}</span>
                )}
              </button>
            );
          })}
          {!isMobile && (
            <div style={{ marginLeft: 'auto', textAlign: 'right', paddingBottom: 5, lineHeight: 1.35 }}>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#36475A', letterSpacing: '0.08em' }}>
                1stSignal · firstminute capital · prepared for B. Hoberman
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: '#A9B5C2', letterSpacing: '0.06em' }}>
                {BUILD_DATE_LABEL} · illustrative draft · ⌘K search
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
