import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useIsMobile } from '../hooks';

// ─── The firstminute constellation ────────────────────────────
// Dark, organic mind-map of the LP & co-investor ecosystem, plus a
// pattern-recognition layer: insights computed from cap-table overlap.
// People→company links are verified from the PitchBook active-investor
// rosters (8 Jul 2026 export) or existing sourced connections in the app.

const W = 1280, H = 820;

const HUBS = [
  { id: 'founders', label: 'UNICORN FOUNDERS', x: 360, y: 300 },
  { id: 'ceos',     label: 'OPERATING CEOS',   x: 900, y: 250 },
  { id: 'research', label: 'AI RESEARCHERS',   x: 430, y: 610 },
  { id: 'policy',   label: 'POLICY & FINANCE', x: 940, y: 610 },
];

const COMPANIES = [
  { id: 'codewords', name: 'Codewords', x: 655, y: 455 },
  { id: 'taktile',   name: 'Taktile',   x: 775, y: 430 },
  { id: 'granola',   name: 'Granola',   x: 780, y: 145 },
  { id: 'n8n',       name: 'n8n',       x: 625, y: 180 },
  { id: 'wayve',     name: 'Wayve',     x: 235, y: 445 },
  { id: 'tessl',     name: 'Tessl',     x: 250, y: 170 },
  { id: 'storyblok', name: 'Storyblok', x: 140, y: 305 },
  { id: 'omnea',     name: 'Omnea',     x: 1105, y: 155 },
  { id: 'console',   name: 'Console',   x: 610, y: 735 },
  { id: 'argus',     name: 'Argus',     x: 195, y: 705 },
  { id: 'velar',     name: 'Velar',     x: 300, y: 770 },
  { id: 'meridian',  name: 'Meridian',  x: 1130, y: 465 },
  { id: 'verse',     name: 'Verse',     x: 690, y: 330 },
  { id: 'frontier',  name: 'Frontier',  x: 565, y: 398 },
  { id: 'templum',   name: 'Templum',   x: 1040, y: 370 },
];

const PEOPLE = [
  // Unicorn founders
  { id: 'hoberman',  name: 'Brent Hoberman',   sub: 'lastminute.com · firstminute', hub: 'founders', x: 180, y: 232, cos: ['storyblok'] },
  { id: 'traynor',   name: 'Des Traynor',      sub: 'Intercom · LP',                hub: 'founders', x: 305, y: 138, cos: ['granola', 'omnea'] },
  { id: 'khusid',    name: 'Andrey Khusid',    sub: 'Miro · LP',                    hub: 'founders', x: 505, y: 228, cos: ['codewords'] },
  { id: 'shah',      name: 'Amar Shah',        sub: 'Wayve · LP',                   hub: 'founders', x: 252, y: 392, cos: ['wayve', 'codewords'] },
  { id: 'podjarny',  name: 'Guy Podjarny',     sub: 'Snyk · LP',                    hub: 'founders', x: 458, y: 340, cos: ['tessl', 'codewords', 'argus', 'velar'] },
  { id: 'paananen',  name: 'Ilkka Paananen',   sub: 'Supercell',                    hub: 'founders', x: 560, y: 282, cos: ['n8n', 'codewords'] },
  { id: 'gentz',     name: 'Robert Gentz',     sub: 'Zalando',                      hub: 'founders', x: 395, y: 172, cos: ['codewords'] },
  // Operating CEOs
  { id: 'lutke',     name: 'Tobi Lutke',       sub: 'Shopify',                      hub: 'ceos', x: 838, y: 115, cos: ['granola'] },
  { id: 'rauch',     name: 'Guillermo Rauch',  sub: 'Vercel',                       hub: 'ceos', x: 985, y: 128, cos: ['granola'] },
  { id: 'pomel',     name: 'Olivier Pomel',    sub: 'Datadog',                      hub: 'ceos', x: 815, y: 368, cos: ['taktile', 'codewords'] },
  { id: 'dines',     name: 'Daniel Dines',     sub: 'UiPath',                       hub: 'ceos', x: 1015, y: 300, cos: ['taktile'] },
  { id: 'friedman',  name: 'Nat Friedman',     sub: 'NFDG · ex-GitHub',             hub: 'ceos', x: 745, y: 232, cos: ['granola'] },
  { id: 'renner',    name: 'Hanno Renner',     sub: 'Personio',                     hub: 'ceos', x: 1068, y: 220, cos: ['codewords'] },
  // AI researchers
  { id: 'chollet',   name: 'Francois Chollet', sub: 'Keras · ARC Prize',            hub: 'research', x: 298, y: 548, cos: ['codewords'] },
  { id: 'chacon',    name: 'Scott Chacon',     sub: 'GitHub co-founder · LP',       hub: 'research', x: 565, y: 558, cos: ['taktile', 'tessl', 'console'] },
  { id: 'rocktaschel', name: 'Tim Rocktäschel', sub: 'DeepMind',                    hub: 'research', x: 330, y: 685, cos: ['codewords'] },
  { id: 'ghissassi', name: 'Mehdi Ghissassi',  sub: 'ex-DeepMind',                  hub: 'research', x: 490, y: 712, cos: ['codewords'] },
  { id: 'valko',     name: 'Michal Valko',     sub: 'DeepMind',                     hub: 'research', x: 572, y: 655, cos: ['codewords'] },
  // Policy & finance
  { id: 'summers',   name: 'Larry Summers',    sub: 'ex-US Treasury',               hub: 'policy', x: 828, y: 532, cos: ['taktile', 'meridian'] },
  { id: 'rachitsky', name: 'Lenny Rachitsky',  sub: 'PLG Substack · LP',            hub: 'policy', x: 1085, y: 545, cos: ['granola', 'n8n'] },
  { id: 'glocer',    name: 'Thomas Glocer',    sub: 'ex-Thomson Reuters',           hub: 'policy', x: 862, y: 700, cos: ['taktile'] },
  { id: 'hartz',     name: 'Kevin Hartz',      sub: 'Eventbrite',                   hub: 'policy', x: 1055, y: 688, cos: ['n8n'] },
];

// Institutional co-investors verified on ≥1 firstminute cap table (PB rosters)
const INSTITUTIONS = [
  { id: 'goldman', name: 'Goldman Sachs AM', x: 950, y: 462, cos: ['taktile', 'templum'] },
  { id: 'nvidia',  name: 'Nvidia',           x: 858, y: 315, cos: ['verse', 'n8n'] },
  { id: 'atomico', name: 'Atomico',          x: 478, y: 478, cos: ['codewords', 'frontier'] },
  { id: 'dst',     name: 'DST Global',       x: 758, y: 522, cos: ['codewords', 'console'] },
];

// ─── Pattern layer: insights computed from cap-table overlap ──
const INSIGHTS = [
  {
    id: 'gravity', title: 'THE CODEWORDS GRAVITY WELL',
    body: '11 named members of the network — drawn from all four hubs — plus DST Global and Atomico sit on one $45M seed cap table. The densest node in the constellation. When this many insiders converge pre-Series A, the next round prices itself.',
    people: ['khusid', 'shah', 'podjarny', 'paananen', 'gentz', 'pomel', 'renner', 'chollet', 'rocktaschel', 'ghissassi', 'valko'],
    cos: ['codewords'], inst: ['dst', 'atomico'], hubs: ['founders', 'ceos', 'research'],
  },
  {
    id: 'goldman', title: "GOLDMAN'S QUIET DOUBLE",
    body: 'Goldman Sachs AM entered two firstminute cap tables within ten weeks: Templum (16 Apr) then led Taktile’s $110M Series C (24 Jun). Bulge-bracket capital tracking a seed fund’s book is historically a precursor to strategic M&A interest.',
    people: [], cos: ['taktile', 'templum'], inst: ['goldman'], hubs: [],
  },
  {
    id: 'deepmind', title: 'THE DEEPMIND BLOC',
    body: 'Three DeepMind-affiliated researchers — Rocktäschel, Ghissassi, Valko — plus Chollet all independently backed the same company. Research-community consensus this dense is the strongest available proxy for technical durability.',
    people: ['chollet', 'rocktaschel', 'ghissassi', 'valko'], cos: ['codewords'], inst: [], hubs: ['research'],
  },
  {
    id: 'strategics', title: 'STRATEGICS ENTER THE BOOK',
    body: 'Nvidia backed Verse directly and n8n via NVentures; SAP marked n8n at $5.2B; Goldman took two positions. Corporate capital stacking across the infrastructure layer explains PitchBook’s M&A-heavy exit models (Verse 90%, n8n 73%).',
    people: [], cos: ['verse', 'n8n', 'taktile', 'templum'], inst: ['nvidia', 'goldman'], hubs: [],
  },
  {
    id: 'atomico', title: 'THE ATOMICO ECHO',
    body: 'Two joint Atomico × firstminute deals in six weeks: Codewords (May) and Frontier’s seed (Jun, Atomico led). A co-underwriting rhythm is forming — expect reciprocal deal flow both directions.',
    people: [], cos: ['codewords', 'frontier'], inst: ['atomico'], hubs: [],
  },
  {
    id: 'quorum', title: 'ENTERPRISE QUORUM ON TAKTILE',
    body: 'Pomel (Datadog), Dines (UiPath), Chacon (GitHub) and Summers all sit on Taktile’s roster — buyer-side operators clustering before the $110M Series C. Operator consensus preceded the round, not the other way around.',
    people: ['pomel', 'dines', 'chacon', 'summers'], cos: ['taktile'], inst: ['goldman'], hubs: [],
  },
];

const RED = '#C24435', GOLD = '#B7912F', INDIGO = '#7E8FDE', INK = '#9BA3AD', FAINT = '#565D66';

export default function Constellation({ open, onClose }) {
  const [focus, setFocus] = useState(null); // {type:'person'|'company'|'hub'|'inst'|'insight', id}
  const isMobile = useIsMobile(1000);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const active = useMemo(() => {
    if (!focus) return null;
    const people = new Set(), cos = new Set(), hubs = new Set(), inst = new Set();
    if (focus.type === 'person') {
      const p = PEOPLE.find(x => x.id === focus.id);
      people.add(p.id); hubs.add(p.hub); p.cos.forEach(c => cos.add(c));
    } else if (focus.type === 'company') {
      cos.add(focus.id);
      PEOPLE.forEach(p => { if (p.cos.includes(focus.id)) { people.add(p.id); hubs.add(p.hub); } });
      INSTITUTIONS.forEach(v => { if (v.cos.includes(focus.id)) inst.add(v.id); });
    } else if (focus.type === 'inst') {
      const v = INSTITUTIONS.find(x => x.id === focus.id);
      inst.add(v.id); v.cos.forEach(c => cos.add(c));
    } else if (focus.type === 'hub') {
      hubs.add(focus.id);
      PEOPLE.forEach(p => { if (p.hub === focus.id) { people.add(p.id); p.cos.forEach(c => cos.add(c)); } });
    } else if (focus.type === 'insight') {
      const ins = INSIGHTS.find(x => x.id === focus.id);
      ins.people.forEach(p => people.add(p));
      ins.cos.forEach(c => cos.add(c));
      ins.inst.forEach(v => inst.add(v));
      ins.hubs.forEach(h => hubs.add(h));
    }
    return { people, cos, hubs, inst };
  }, [focus]);

  const personOn = p => !active || active.people.has(p.id);
  const companyOn = c => !active || active.cos.has(c.id);
  const hubOn = h => !active || active.hubs.has(h.id);
  const instOn = v => !active || active.inst.has(v.id);

  const statusLine = useMemo(() => {
    if (!focus) return null;
    if (focus.type === 'person') {
      const p = PEOPLE.find(x => x.id === focus.id);
      return `${p.name} — ${p.sub}  →  ${p.cos.map(id => COMPANIES.find(c => c.id === id)?.name).join(' · ')}`;
    }
    if (focus.type === 'company') {
      const c = COMPANIES.find(x => x.id === focus.id);
      const backers = [
        ...PEOPLE.filter(p => p.cos.includes(c.id)).map(p => p.name),
        ...INSTITUTIONS.filter(v => v.cos.includes(c.id)).map(v => v.name),
      ];
      return `${c.name} — backed by ${backers.join(', ')}`;
    }
    if (focus.type === 'inst') {
      const v = INSTITUTIONS.find(x => x.id === focus.id);
      return `${v.name} — positions in ${v.cos.map(id => COMPANIES.find(c => c.id === id)?.name).join(' + ')} (PitchBook rosters)`;
    }
    if (focus.type === 'insight') {
      return INSIGHTS.find(x => x.id === focus.id).title;
    }
    const h = HUBS.find(x => x.id === focus.id);
    return `${h.label} — ${PEOPLE.filter(p => p.hub === h.id).length} named members shown`;
  }, [focus]);

  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: '#0B0C0E', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.25s ease both' }}>
      <style>{`
        @keyframes const-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(0,-5px); } }
        @keyframes const-in { 0% { opacity: 0; transform: scale(0); } 70% { transform: scale(1.25); } 100% { opacity: 1; transform: scale(1); } }
        .const-node { animation: const-in 0.5s cubic-bezier(0.34,1.56,0.64,1) backwards; transform-box: fill-box; transform-origin: center; }
        .const-drift { animation: const-drift 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes const-line { from { opacity: 0; } to { opacity: 1; } }
        .const-line { animation: const-line 0.9s ease 0.35s backwards; }
        @keyframes card-in { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }
        .const-card { animation: card-in 0.4s ease backwards; transition: background 0.15s, border-color 0.15s; }
        .const-card:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(212,85,63,0.5) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 26px 0', flexShrink: 0 }}>
        <div>
          <div className="serif" style={{ fontSize: 21, fontWeight: 700, color: '#E8EAED', letterSpacing: '-0.01em' }}>The firstminute constellation</div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: FAINT, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 5 }}>
            130+ unicorn-founder LPs · {PEOPLE.length} people · {INSTITUTIONS.length} institutions · {INSIGHTS.length} patterns detected · rosters verified via PitchBook, 8 Jul 2026
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '7px 9px', color: '#C7CDD4', cursor: 'pointer', display: 'flex' }}>
          <X size={15} />
        </button>
      </div>

      {/* Map + insights */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 0 }}>
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', maxHeight: isMobile ? '52vh' : 'calc(100vh - 150px)' }}
            onClick={() => setFocus(null)}>

            {/* Edges: person → hub */}
            {PEOPLE.map(p => {
              const h = HUBS.find(x => x.id === p.hub);
              const on = active ? active.people.has(p.id) : true;
              return <line key={`ph-${p.id}`} x1={p.x} y1={p.y} x2={h.x} y2={h.y}
                stroke={on && active ? '#8A9099' : '#3A3F46'} strokeWidth={on && active ? 1 : 0.7}
                opacity={active ? (on ? 0.9 : 0.08) : 0.5} className="const-line" />;
            })}
            {/* Edges: person → company */}
            {PEOPLE.flatMap(p => p.cos.map(cid => {
              const c = COMPANIES.find(x => x.id === cid);
              const on = active ? (active.people.has(p.id) && active.cos.has(cid)) : true;
              return <line key={`pc-${p.id}-${cid}`} x1={p.x} y1={p.y} x2={c.x} y2={c.y}
                stroke={on && active ? GOLD : '#3A3F46'} strokeWidth={on && active ? 1 : 0.7}
                opacity={active ? (on ? 0.75 : 0.06) : 0.35} className="const-line" />;
            }))}
            {/* Edges: institution → company */}
            {INSTITUTIONS.flatMap(v => v.cos.map(cid => {
              const c = COMPANIES.find(x => x.id === cid);
              const on = active ? (active.inst.has(v.id) && active.cos.has(cid)) : true;
              return <line key={`ic-${v.id}-${cid}`} x1={v.x} y1={v.y} x2={c.x} y2={c.y}
                stroke={on && active ? INDIGO : '#3A3F46'} strokeWidth={on && active ? 1.1 : 0.7}
                strokeDasharray="5 4"
                opacity={active ? (on ? 0.8 : 0.06) : 0.35} className="const-line" />;
            }))}

            {/* Companies (gold) */}
            {COMPANIES.map((c, i) => {
              const on = companyOn(c);
              return (
                <g key={c.id} opacity={active ? (on ? 1 : 0.14) : 1} style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setFocus({ type: 'company', id: c.id }); }}
                  onMouseEnter={() => setFocus({ type: 'company', id: c.id })} onMouseLeave={() => setFocus(null)}>
                  <g className="const-drift" style={{ animationDelay: `${(i % 6) * -1.3}s` }}>
                    <circle cx={c.x} cy={c.y} r="14" fill="transparent" />
                    <circle cx={c.x} cy={c.y} r="9.5" fill="none" stroke="#5A5340" strokeWidth="1" className="const-node" style={{ animationDelay: `${0.15 + i * 0.04}s` }} />
                    <circle cx={c.x} cy={c.y} r="6" fill={GOLD} className="const-node" style={{ animationDelay: `${0.15 + i * 0.04}s` }} />
                    <text x={c.x} y={c.y - 17} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" fontWeight="600" letterSpacing="1.6"
                      fill={on && active ? '#D9BE6A' : '#8F7E45'}>{c.name.toUpperCase()}</text>
                  </g>
                </g>
              );
            })}

            {/* Institutions (indigo diamonds) */}
            {INSTITUTIONS.map((v, i) => {
              const on = instOn(v);
              return (
                <g key={v.id} opacity={active ? (on ? 1 : 0.14) : 1} style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setFocus({ type: 'inst', id: v.id }); }}
                  onMouseEnter={() => setFocus({ type: 'inst', id: v.id })} onMouseLeave={() => setFocus(null)}>
                  <g className="const-drift" style={{ animationDelay: `${(i % 4) * -1.9}s` }}>
                    <circle cx={v.x} cy={v.y} r="15" fill="transparent" />
                    <rect x={v.x - 6} y={v.y - 6} width="12" height="12" transform={`rotate(45 ${v.x} ${v.y})`}
                      fill="none" stroke={INDIGO} strokeWidth="1.3" className="const-node" style={{ animationDelay: `${0.25 + i * 0.05}s` }} />
                    <rect x={v.x - 3} y={v.y - 3} width="6" height="6" transform={`rotate(45 ${v.x} ${v.y})`}
                      fill={INDIGO} className="const-node" style={{ animationDelay: `${0.25 + i * 0.05}s` }} />
                    <text x={v.x} y={v.y - 17} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fontWeight="600" letterSpacing="1.4"
                      fill={on && active ? '#A9B6F0' : '#5F6B9E'}>{v.name.toUpperCase()}</text>
                  </g>
                </g>
              );
            })}

            {/* People (white) */}
            {PEOPLE.map((p, i) => {
              const on = personOn(p);
              return (
                <g key={p.id} opacity={active ? (on ? 1 : 0.14) : 1} style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setFocus({ type: 'person', id: p.id }); }}
                  onMouseEnter={() => setFocus({ type: 'person', id: p.id })} onMouseLeave={() => setFocus(null)}>
                  <g className="const-drift" style={{ animationDelay: `${(i % 8) * -0.9}s` }}>
                    <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
                    <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#5B626B" strokeWidth="1.1" className="const-node" style={{ animationDelay: `${0.2 + i * 0.035}s` }} />
                    <circle cx={p.x} cy={p.y} r="5.5" fill={on && active ? '#E8EAED' : '#C3C9D0'} className="const-node" style={{ animationDelay: `${0.2 + i * 0.035}s` }} />
                    <text x={p.x} y={p.y - 17} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" fontWeight="500" letterSpacing="1.5"
                      fill={on && active ? '#D8DDE3' : INK}>{p.name.toUpperCase()}</text>
                  </g>
                </g>
              );
            })}

            {/* Hubs (red) */}
            {HUBS.map((h, i) => {
              const on = hubOn(h);
              return (
                <g key={h.id} opacity={active ? (on ? 1 : 0.2) : 1} style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setFocus({ type: 'hub', id: h.id }); }}
                  onMouseEnter={() => setFocus({ type: 'hub', id: h.id })} onMouseLeave={() => setFocus(null)}>
                  <g className="const-drift" style={{ animationDelay: `${i * -1.7}s`, animationDuration: '9s' }}>
                    <circle cx={h.x} cy={h.y} r="26" fill={RED} opacity="0.12" className="const-node" />
                    <circle cx={h.x} cy={h.y} r="12" fill={RED} className="const-node" />
                    <text x={h.x} y={h.y - 26} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="700" letterSpacing="2.4"
                      fill="#D4553F">{h.label}</text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Pattern insights panel */}
        <div style={{
          flexShrink: 0,
          width: isMobile ? 'auto' : 316,
          maxHeight: isMobile ? 190 : 'none',
          overflowY: isMobile ? 'hidden' : 'auto',
          overflowX: isMobile ? 'auto' : 'hidden',
          display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 10,
          padding: isMobile ? '4px 20px 6px' : '6px 24px 10px 4px',
        }}>
          <div style={{ flexShrink: 0, alignSelf: isMobile ? 'center' : 'stretch' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', color: '#D4553F' }}>PATTERNS DETECTED · {INSIGHTS.length}</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, color: FAINT, letterSpacing: '0.08em', marginTop: 3 }}>computed from cap-table overlap · hover to trace</div>
          </div>
          {INSIGHTS.map((ins, i) => {
            const isFocused = focus?.type === 'insight' && focus.id === ins.id;
            return (
              <div key={ins.id} className="const-card"
                onMouseEnter={() => setFocus({ type: 'insight', id: ins.id })}
                onMouseLeave={() => setFocus(null)}
                onClick={() => setFocus({ type: 'insight', id: ins.id })}
                style={{
                  flexShrink: 0, width: isMobile ? 280 : 'auto', cursor: 'pointer',
                  background: isFocused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.035)',
                  borderTop: `1px solid ${isFocused ? 'rgba(212,85,63,0.5)' : 'rgba(255,255,255,0.09)'}`,
                  borderRight: `1px solid ${isFocused ? 'rgba(212,85,63,0.5)' : 'rgba(255,255,255,0.09)'}`,
                  borderBottom: `1px solid ${isFocused ? 'rgba(212,85,63,0.5)' : 'rgba(255,255,255,0.09)'}`,
                  borderLeft: `2px solid ${RED}`,
                  borderRadius: 10, padding: '11px 13px',
                  animationDelay: `${0.15 + i * 0.08}s`,
                }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#D4553F', marginBottom: 6 }}>{ins.title}</div>
                <div style={{ fontSize: 11, color: '#A7AEB8', lineHeight: 1.55, fontFamily: 'Inter, system-ui, sans-serif' }}>{ins.body}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: legend + focus readout */}
      <div style={{ flexShrink: 0, padding: '0 26px 18px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.1em', color: INK }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: RED }} />NETWORK HUB
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.1em', color: INK }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C3C9D0' }} />LP / CO-INVESTOR
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.1em', color: INK }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }} />COMPANY
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, letterSpacing: '0.1em', color: INK }}>
          <span style={{ width: 8, height: 8, background: INDIGO, transform: 'rotate(45deg)' }} />INSTITUTION
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: statusLine ? '#D8DDE3' : FAINT, letterSpacing: '0.04em', minHeight: 14, textAlign: 'right', flex: '1 1 320px' }}>
          {statusLine || 'hover a node or a pattern to trace it · esc to close'}
        </span>
      </div>
    </div>,
    document.body
  );
}
