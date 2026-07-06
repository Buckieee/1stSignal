import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Building2, Radar, Zap, Network, CornerDownLeft } from 'lucide-react';
import companiesData from '../data/companies.json';
import earlySignals from '../data/earlySignals.json';
import { CONNECTOR_INDEX } from './DoorsTab';

const KIND_META = {
  held:      { label: 'Portfolio',  Icon: Building2, color: '#6366F1' },
  sourcing:  { label: 'Sourcing',   Icon: Radar,     color: '#2563EB' },
  presignal: { label: 'Pre-Signal', Icon: Zap,       color: '#0E9F6E' },
  connector: { label: 'Network',    Icon: Network,   color: '#0B1F33' },
};

const ITEMS = [
  ...companiesData.map(c => ({
    kind: c.type === 'held' ? 'held' : 'sourcing',
    name: c.name, sub: c.primaryIndustry,
    jump: [c.type === 'held' ? 'held' : 'sourcing', { openCompany: c.name }],
  })),
  ...earlySignals.map(c => ({
    kind: 'presignal', name: c.name, sub: c.sector,
    jump: ['presignal', { companyId: c.id }],
  })),
  ...CONNECTOR_INDEX.map(c => ({
    kind: 'connector', name: c.name, sub: c.sub,
    jump: ['doors', { pinConnector: c.name }],
  })),
];

export default function CommandPalette({ onJump }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v); setQ(''); setIdx(0);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ITEMS.slice(0, 8);
    return ITEMS
      .filter(it => it.name.toLowerCase().includes(s) || (it.sub || '').toLowerCase().includes(s))
      .slice(0, 8);
  }, [q]);

  const go = it => {
    setOpen(false);
    onJump(...it.jump);
  };

  if (!open) return null;

  return (
    <div onClick={() => setOpen(false)} style={{
      position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(11,31,51,0.35)',
      backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '14vh',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: '92%', maxWidth: 520, overflow: 'hidden', boxShadow: '0 24px 64px rgba(11,31,51,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid var(--hairline)' }}>
          <Search size={15} style={{ color: '#A9B5C2', flexShrink: 0 }} />
          <input
            ref={inputRef} value={q}
            onChange={e => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
              if (e.key === 'Enter' && results[idx]) go(results[idx]);
            }}
            placeholder="Search companies, sourcing targets, connectors..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: '#0B1F33', fontFamily: 'Inter, system-ui, sans-serif', background: 'transparent' }}
          />
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>esc</span>
        </div>
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '22px 16px', textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#A9B5C2' }}>No matches.</div>
          ) : results.map((it, i) => {
            const m = KIND_META[it.kind];
            const active = i === idx;
            return (
              <div key={`${it.kind}-${it.name}`} onClick={() => go(it)} onMouseEnter={() => setIdx(i)} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 16px', cursor: 'pointer',
                background: active ? '#F4F7FB' : '#fff', borderLeft: `3px solid ${active ? m.color : 'transparent'}`,
              }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: `${m.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <m.Icon size={13} style={{ color: m.color }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="serif" style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#0B1F33' }}>{it.name}</span>
                  <span style={{ display: 'block', fontSize: 10.5, color: '#7C8B9C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.sub}</span>
                </span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: m.color, flexShrink: 0 }}>{m.label}</span>
                {active && <CornerDownLeft size={12} style={{ color: '#A9B5C2', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--hairline)', display: 'flex', gap: 14, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#A9B5C2' }}>
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
        </div>
      </div>
    </div>
  );
}
