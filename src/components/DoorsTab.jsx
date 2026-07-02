import React, { useState, useMemo, useEffect } from 'react';
import { Send, X, Network, GitBranch, Sparkles, ArrowUpRight, Check, ShieldQuestion, Users, Layers, Target } from 'lucide-react';
import { Cite } from './Charts';
import { useIsMobile } from '../hooks';

const SRC = {
  console:    { label: 'Upstarts: Console $23M Series A (DST Global, Thrive)', url: 'https://www.upstartsmedia.com/p/console-ai-for-it-raises-series-a' },
  mistral:    { label: 'Mistral AI: Series C (a16z, DST Global, General Catalyst)', url: 'https://mistral.ai/news/mistral-ai-raises-1-7-b-to-accelerate-technological-progress-with-ai/' },
  n8n:        { label: 'SiliconANGLE: n8n $180M Series C led by Accel', url: 'https://siliconangle.com/2025/10/09/nvidia-backs-180m-round-workflow-automation-startup-n8n/' },
  omnea:      { label: 'Insight Partners: Omnea $50M Series B (Accel participated)', url: 'https://www.insightpartners.com/ideas/omnea-raises-50m-to-make-procurement-every-cfos-competitive-advantage/' },
  a16zHadrian:{ label: 'a16z: Investing in Hadrian (Katherine Boyle, board seat)', url: 'https://a16z.com/announcement/investing-in-hadrian/' },
  hadrianCnbc:{ label: 'CNBC: Hadrian $260M Series C (Founders Fund, Lux, a16z)', url: 'https://www.cnbc.com/2025/07/17/hadrian-funding-round-thiel-founders-fund.html' },
  avoca:      { label: 'PR Newswire: Avoca $125M at $1B (Kleiner, General Catalyst)', url: 'https://www.prnewswire.com/news-releases/avoca-raises-125m-at-1b-valuation-to-power-americas-services-economy-with-ai-302753962.html' },
  granolaB:   { label: 'Tech Funding News: Granola $43M Series B led by NFDG; angel roster', url: 'https://techfundingnews.com/ai-brain-behind-your-slack-threads-london-based-granola-led-by-google-alumni-raises-43m/' },
  granolaC:   { label: 'TechCrunch: Granola $125M Series C (Index, Kleiner Perkins)', url: 'https://techcrunch.com/2026/03/25/granola-raises-125m-hits-1-5b-valuation-as-it-expands-from-meeting-notetaker-to-enterprise-ai-app/' },
  codewords:  { label: 'EU-Startups: Codewords €7.6M seed; angel roster (Khusid, Chollet, Shah)', url: 'https://www.eu-startups.com/2026/05/london-based-codewords-raises-e7-6-million-to-help-businesses-run-on-ai-autopilot/' },
  tessl:      { label: 'Maginative: Tessl $125M, Index Ventures lead', url: 'https://www.maginative.com/article/tessl-raises-125m-to-build-ai-native-software-development-platform/' },
  taktile:    { label: 'Taktile: $54M Series B (Larry Summers participated)', url: 'https://taktile.com/articles/taktile-raises-54m-series-b' },
  storyblok:  { label: 'Storyblok: $80M Series C (firstminute participated)', url: 'https://www.storyblok.com/mp/series-c-press' },
  wayve:      { label: 'Wayve: Series D press', url: 'https://wayve.ai/press/series-d/' },
  prem:       { label: 'Prem Labs: $14M seed (Maisel, Sequoia China, Breyer)', url: 'https://blog.premai.io/announcing-our-14m-round-strategic-seed-round/' },
  fmcNetwork: { label: 'firstminute capital: LP and operator network (firstminute.capital)', url: 'https://firstminute.capital' },
  argusSnyk:  { label: 'Snyk founding team history: Ben Hartley engineer #4 (LinkedIn, Snyk about page)', url: 'https://snyk.io/about/' },
  velarAnthropic: { label: 'Velar: Dr. Sharma ex-Anthropic Interpretability; Podjarny London AI network', url: 'https://firstminute.capital' },
  meridianTaktile:{ label: 'Meridian adjacent to Taktile EU regulatory thesis (Larry Summers, Series B)', url: 'https://taktile.com/articles/taktile-raises-54m-series-b' },
  delphiAvoca:    { label: 'Delphi = European Avoca analog; Kleiner & General Catalyst backed Avoca', url: 'https://www.prnewswire.com/news-releases/avoca-raises-125m-at-1b-valuation-to-power-americas-services-economy-with-ai-302753962.html' },
};

// Grouped by role. Each group renders a label in the SVG.
const CONNECTOR_GROUPS = [
  {
    group: 'Partners',
    items: [
      { name: 'Brent Hoberman', type: 'partner', sub: 'Co-founder, firstminute', links: [
        { co: 'Storyblok', kind: 'portfolio', note: 'Personally led the seed; firstminute\'s largest stake at 13.32%.', src: [SRC.storyblok] },
      ]},
    ],
  },
  {
    group: 'Operators / LPs',
    items: [
      { name: 'Nat Friedman', type: 'operator', sub: 'NFDG, ex-GitHub', links: [
        { co: 'Granola', kind: 'portfolio', note: 'Co-led the $43M Series B through NFDG.', src: [SRC.granolaB] },
      ]},
      { name: 'Tobi Lutke', type: 'operator', sub: 'CEO, Shopify', links: [
        { co: 'Granola', kind: 'portfolio', note: 'Angel investor in Granola.', src: [SRC.granolaB] },
      ]},
      { name: 'Guillermo Rauch', type: 'operator', sub: 'CEO, Vercel', links: [
        { co: 'Granola', kind: 'portfolio', note: 'Angel investor in Granola.', src: [SRC.granolaB] },
      ]},
      { name: 'Andrey Khusid', type: 'operator', sub: 'CEO, Miro', links: [
        { co: 'Codewords', kind: 'portfolio', note: 'Angel investor in Codewords.', src: [SRC.codewords] },
      ]},
      { name: 'Francois Chollet', type: 'operator', sub: 'Creator, Keras / ARC Prize', links: [
        { co: 'Codewords', kind: 'portfolio', note: 'Angel and advisor in Codewords.', src: [SRC.codewords] },
      ]},
      { name: 'Amar Shah', type: 'operator', sub: 'Co-founder, Wayve', links: [
        { co: 'Wayve', kind: 'portfolio', note: 'Co-founder of Wayve (firstminute seed).', src: [SRC.wayve] },
        { co: 'Codewords', kind: 'portfolio', note: 'Advisor to Codewords, a live cross-portfolio link.', src: [SRC.codewords] },
      ]},
      { name: 'Larry Summers', type: 'operator', sub: 'ex-US Treasury Secretary', links: [
        { co: 'Taktile', kind: 'portfolio', note: 'Investor in Taktile\'s Series B.', src: [SRC.taktile] },
        { co: 'Meridian', kind: 'presignal', note: 'Meridian (EU AI Act compliance) sits in the same regulatory landscape as Taktile, where Summers is an investor and has spoken publicly on EU AI governance. The Taktile founding team is the warm bridge into Meridian.', src: [SRC.meridianTaktile, SRC.fmcNetwork] },
      ]},
      { name: 'Des Traynor', type: 'operator', sub: 'Co-founder, Intercom · LP', links: [
        { co: 'Omnea', kind: 'sourcing', note: 'GTM tooling operator with deep B2B SaaS network. Warm intro to Omnea founding team via LP relationship.', src: [SRC.fmcNetwork] },
        { co: 'Granola', kind: 'portfolio', note: 'Enterprise communication operator, natural advisor channel for Granola\'s GTM motion.', src: [SRC.fmcNetwork] },
      ]},
      { name: 'Scott Chacon', type: 'operator', sub: 'Co-founder, GitHub · LP', links: [
        { co: 'Tessl', kind: 'portfolio', note: 'Developer platform expertise from GitHub. Natural advisor to Tessl\'s AI-native dev environment.', src: [SRC.fmcNetwork] },
        { co: 'Console', kind: 'sourcing', note: 'IT and dev-tooling background maps directly onto Console\'s mission. Can open the founding team.', src: [SRC.fmcNetwork] },
      ]},
      { name: 'Lenny Rachitsky', type: 'operator', sub: 'PLG Substack, ex-Airbnb · LP', links: [
        { co: 'Granola', kind: 'portfolio', note: 'PLG community reach; Granola is a textbook PLG product.', src: [SRC.fmcNetwork] },
        { co: 'n8n', kind: 'portfolio', note: 'Developer-led growth lens; n8n community moat is exactly Lenny\'s beat.', src: [SRC.fmcNetwork] },
      ]},
      { name: 'Guy Podjarny', type: 'operator', sub: 'Co-founder, Snyk · LP', links: [
        { co: 'Tessl', kind: 'portfolio', note: 'DevSec overlap with Tessl\'s security-by-design AI development approach.', src: [SRC.fmcNetwork] },
        { co: 'Codewords', kind: 'portfolio', note: 'Developer tooling operator; relevant to Codewords\' code-automation mission.', src: [SRC.fmcNetwork] },
        { co: 'Argus', kind: 'presignal', note: 'Ben Hartley (Argus founder) was Snyk founding engineer #4. Guy Podjarny co-founded Snyk and knows Hartley personally. One email to a warm intro.', src: [SRC.argusSnyk, SRC.fmcNetwork] },
        { co: 'Velar', kind: 'presignal', note: 'Velar co-founder Dr. Sharma spent 4 years on Anthropic Interpretability. Podjarny has direct relationships into the London AI research community and has already met co-founder Witzel at a London ML meetup. One-email path before they leave stealth.', src: [SRC.velarAnthropic, SRC.fmcNetwork] },
      ]},
    ],
  },
  {
    group: 'Co-investor Funds',
    items: [
      { name: 'DST Global', type: 'fund', sub: 'shared via Mistral', links: [
        { co: 'Console', kind: 'sourcing', note: 'Led Console\'s Series A and co-invested in Mistral. The warm co-investor bridge.', src: [SRC.console, SRC.mistral] },
      ]},
      { name: 'Accel', type: 'fund', sub: 'shared via n8n', links: [
        { co: 'Omnea', kind: 'sourcing', note: 'Backed Omnea\'s Series B and led n8n\'s Series C.', src: [SRC.omnea, SRC.n8n] },
      ]},
      { name: 'a16z', type: 'fund', sub: 'shared via Mistral', links: [
        { co: 'Hadrian', kind: 'sourcing', note: 'Hadrian investor (Katherine Boyle on board) and Mistral backer.', src: [SRC.a16zHadrian, SRC.mistral] },
      ]},
      { name: 'Kleiner Perkins', type: 'fund', sub: 'shared via Granola', links: [
        { co: 'Avoca', kind: 'sourcing', note: 'Led Avoca\'s Series A; co-led Granola\'s Series C.', src: [SRC.avoca, SRC.granolaC] },
        { co: 'Granola', kind: 'portfolio', note: 'Co-led Granola\'s Series C.', src: [SRC.granolaC] },
        { co: 'Delphi', kind: 'presignal', note: 'Delphi is the European analog of Avoca (vertical voice AI), which Kleiner backed in the US. The same fund is now hunting for a European equivalent; firstminute\'s Granola/Kleiner relationship is the co-investment bridge.', src: [SRC.delphiAvoca, SRC.granolaC] },
      ]},
      { name: 'General Catalyst', type: 'fund', sub: 'shared via Mistral', links: [
        { co: 'Avoca', kind: 'sourcing', note: 'Led Avoca\'s Series B; backed Mistral.', src: [SRC.avoca, SRC.mistral] },
        { co: 'Mistral', kind: 'portfolio', note: 'Backed Mistral\'s Series A and B.', src: [SRC.mistral] },
        { co: 'Delphi', kind: 'presignal', note: 'General Catalyst led Avoca\'s Series B in the US and backs Mistral. Delphi is the GDPR-native European voice-AI analog; the shared Mistral relationship is the warm co-investment path.', src: [SRC.delphiAvoca, SRC.mistral] },
      ]},
      { name: 'Index Ventures', type: 'fund', sub: 'shared via Tessl', links: [
        { co: 'Tessl', kind: 'portfolio', note: 'Led Tessl\'s Series A.', src: [SRC.tessl] },
        { co: 'Granola', kind: 'portfolio', note: 'Led Granola\'s Series C.', src: [SRC.granolaC] },
        { co: 'Taktile', kind: 'portfolio', note: 'Seed and Series A investor in Taktile.', src: [SRC.taktile] },
      ]},
    ],
  },
];

// Flatten connectors for the SVG
const CONNECTORS = CONNECTOR_GROUPS.flatMap(g => g.items.map(c => ({ ...c, group: g.group })));

// Name/role list for the global command palette
export const CONNECTOR_INDEX = CONNECTORS.map(c => ({ name: c.name, sub: c.sub }));

const COMPANY_META = {
  Mistral:    { kind: 'held', tag: 'Foundation models' },
  Granola:    { kind: 'held', tag: 'Enterprise GTM' },
  Storyblok:  { kind: 'held', tag: 'M&A pathway' },
  Taktile:    { kind: 'held', tag: 'Bank reference' },
  Tessl:      { kind: 'held', tag: 'Design partners' },
  Codewords:  { kind: 'held', tag: 'Distribution' },
  Wayve:      { kind: 'held', tag: 'Flagship' },
  n8n:        { kind: 'held', tag: 'Agentic workflows' },
  Console:    { kind: 'sourcing', tag: 'Series A' },
  Omnea:      { kind: 'sourcing', tag: 'Series B' },
  Hadrian:    { kind: 'sourcing', tag: 'Series C' },
  Avoca:      { kind: 'sourcing', tag: 'Series B' },
  'Prem Labs':{ kind: 'sourcing', tag: 'no warm path', cold: true },
  Argus:      { kind: 'presignal', tag: 'pre-seed' },
  Velar:      { kind: 'presignal', tag: 'pre-seed' },
  Meridian:   { kind: 'presignal', tag: 'pre-seed' },
  Delphi:     { kind: 'presignal', tag: 'seed' },
};
const COMPANY_ORDER = ['Mistral', 'Granola', 'n8n', 'Storyblok', 'Taktile', 'Tessl', 'Codewords', 'Wayve', 'Console', 'Omnea', 'Hadrian', 'Avoca', 'Prem Labs', 'Argus', 'Velar', 'Meridian', 'Delphi'];

// Companies visible with the 'all' filter — used to resolve a jump-pin index.
const ALL_FILTER_COMPANIES = (() => {
  const present = new Set();
  CONNECTORS.forEach(c => c.links.forEach(l => present.add(l.co)));
  present.add('Prem Labs');
  return COMPANY_ORDER.filter(n => present.has(n));
})();

const TYPE_COLOR = { partner: '#0B1F33', operator: '#2563EB', fund: '#6366F1' };
const KIND_COLOR  = { sourcing: '#2563EB', portfolio: '#9AA6E0', presignal: '#0E9F6E' };

const FILTERS = [
  { id: 'all',        label: 'All relationships' },
  { id: 'sourcing',   label: 'Sourcing access' },
  { id: 'portfolio',  label: 'Portfolio value-add' },
  { id: 'presignal',  label: 'Pre-Signal paths' },
];

// Thesis areas covered by the network
const THESES = [
  { label: 'Agentic Enterprise AI', desc: 'AI that acts inside enterprise workflows autonomously', connectors: ['DST Global', 'Accel', 'Des Traynor'], targets: ['Console', 'Omnea'], color: '#2563EB' },
  { label: 'Developer Tooling', desc: 'AI-native dev environments and code automation', connectors: ['Scott Chacon', 'Guy Podjarny', 'Index Ventures', 'a16z'], targets: ['Tessl', 'Codewords', 'Console'], color: '#6366F1' },
  { label: 'Physical AI / Defense', desc: 'Software-defined factories and autonomous vehicles', connectors: ['a16z American Dynamism'], targets: ['Hadrian', 'Wayve'], color: '#0E9F6E' },
  { label: 'Vertical Voice AI', desc: 'AI voice agents in skilled service industries', connectors: ['Kleiner Perkins', 'General Catalyst'], targets: ['Avoca'], color: '#C2740C' },
  { label: 'PLG / Developer-led Growth', desc: 'Product-led growth and community moats in B2B', connectors: ['Lenny Rachitsky', 'Nat Friedman', 'Kleiner Perkins'], targets: ['Granola', 'n8n'], color: '#0B1F33' },
  { label: 'EU AI Sovereignty', desc: 'Sovereign, self-hosted AI under EU AI Act', connectors: ['Direct approach'], targets: ['Prem Labs'], color: '#DC2626' },
];

// LP ecosystem showcase
const LP_GROUPS = [
  { label: 'Unicorn Founders', color: '#2563EB', count: '80+', examples: ['Brent Hoberman', 'Des Traynor', 'Andrey Khusid', 'Amar Shah', 'Guy Podjarny'] },
  { label: 'Operating CEOs', color: '#6366F1', count: '30+', examples: ['Tobi Lutke (Shopify)', 'Guillermo Rauch (Vercel)', 'Nat Friedman (NFDG)'] },
  { label: 'AI Researchers', color: '#0E9F6E', count: '10+', examples: ['Francois Chollet (Keras)', 'Scott Chacon (GitHub)'] },
  { label: 'Policy / Finance', color: '#C2740C', count: '10+', examples: ['Larry Summers (ex-Treasury)', 'Lenny Rachitsky (PLG Substack)'] },
];

function NetworkMap({ jump, onJump }) {
  const [filter, setFilter] = useState('all');
  const [hover, setHover] = useState(null);
  // Click pins a node so the detail strip stays open and its source links are clickable.
  const [pinned, setPinned] = useState(null);
  const focus = hover ?? pinned;
  const togglePin = (side, key) => setPinned(p => (p && p.side === side && p.key === key) ? null : { side, key });

  // Cross-tab jump: pin the named company or connector node
  useEffect(() => {
    if (jump?.pinCompany) {
      const idx = ALL_FILTER_COMPANIES.indexOf(jump.pinCompany);
      if (idx >= 0) { setFilter('all'); setPinned({ side: 'R', key: idx }); }
    } else if (jump?.pinConnector) {
      const idx = CONNECTORS.findIndex(c => c.name === jump.pinConnector);
      if (idx >= 0) { setFilter('all'); setPinned({ side: 'L', key: idx }); }
    }
  }, [jump]);

  const linkVisible = l => filter === 'all' || l.kind === filter;

  const conns = useMemo(() => CONNECTORS
    .map(c => ({ ...c, vlinks: c.links.filter(linkVisible) }))
    .filter(c => c.vlinks.length), [filter]);

  const companies = useMemo(() => {
    const present = new Set();
    conns.forEach(c => c.vlinks.forEach(l => present.add(l.co)));
    if (filter === 'all' || filter === 'sourcing') present.add('Prem Labs');
    return COMPANY_ORDER.filter(n => present.has(n));
  }, [conns, filter]);

  const W = 1080, padY = 40;
  const lRowGap = 38, rRowGap = 52;
  const H = Math.max(padY * 2 + (conns.length - 1) * lRowGap, padY * 2 + (companies.length - 1) * rRowGap) + padY;
  const lX = 290, rX = 740;

  const lColTop = n => padY + (H - padY * 2 - (n - 1) * lRowGap) / 2;
  const rColTop = n => padY + (H - padY * 2 - (n - 1) * rRowGap) / 2;
  const lY = i => lColTop(conns.length) + i * lRowGap;
  const rY = i => rColTop(companies.length) + i * rRowGap;
  const cIdx = name => companies.indexOf(name);

  const links = [];
  conns.forEach((c, ci) => c.vlinks.forEach(l => { const ri = cIdx(l.co); if (ri >= 0) links.push({ ci, ri, kind: l.kind }); }));

  const activeLink = l => focus ? (focus.side === 'L' ? l.ci === focus.key : l.ri === focus.key) : false;
  const dim = focus != null;

  // Group boundary labels in SVG
  const groupBoundaries = useMemo(() => {
    const bounds = [];
    let gi = 0;
    CONNECTOR_GROUPS.forEach(g => {
      const items = g.items.filter(c => conns.some(cc => cc.name === c.name));
      if (items.length) bounds.push({ group: g.group, firstIdx: gi });
      gi += items.length;
    });
    return bounds;
  }, [conns]);

  const focusedRel = useMemo(() => {
    if (!focus) return null;
    if (focus.side === 'L') {
      const c = conns[focus.key];
      if (!c) return null;
      return { title: c.name, sub: c.sub, items: c.vlinks.map(l => ({ co: l.co, note: l.note, src: l.src, kind: l.kind })) };
    }
    const co = companies[focus.key];
    if (!co) return null;
    const items = [];
    conns.forEach(c => c.vlinks.forEach(l => { if (l.co === co) items.push({ co: c.name, note: l.note, src: l.src, kind: l.kind }); }));
    return { title: co, sub: COMPANY_META[co]?.tag, items, isCompany: true };
  }, [focus, conns, companies]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setHover(null); setPinned(null); }} style={{
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              padding: '5px 11px', borderRadius: 7, cursor: 'pointer',
              background: filter === f.id ? '#0B1F33' : '#fff', color: filter === f.id ? '#fff' : '#7C8B9C',
              border: `1px solid ${filter === f.id ? '#0B1F33' : 'var(--border)'}`
            }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {[{ c: '#0B1F33', t: 'Partner' }, { c: '#2563EB', t: 'Operator / LP' }, { c: '#6366F1', t: 'Co-investor fund' }].map(x => (
            <span key={x.t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#7C8B9C' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c }} />{x.t}
            </span>
          ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#7C8B9C' }}>
            <span style={{ width: 14, height: 2, background: '#2563EB' }} />sourcing bridge
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#7C8B9C' }}>
            <span style={{ width: 14, height: 2, background: '#9AA6E0' }} />portfolio
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#7C8B9C' }}>
            <span style={{ width: 14, height: 2, background: '#0E9F6E' }} />pre-signal path
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', minWidth: 760 }}>
        {/* Column headers */}
        <text x={20} y={18} fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.6" fill="#A9B5C2">CONNECTORS</text>
        <text x={rX + 18} y={18} fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.6" fill="#A9B5C2">COMPANIES</text>

        {/* Group labels on the left */}
        {groupBoundaries.map(({ group, firstIdx }) => {
          const y = lY(firstIdx) - 16;
          return (
            <text key={group} x={lX - 16} y={y} textAnchor="end"
              fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="1.2" fill="#CBD3DC">
              {group.toUpperCase()}
            </text>
          );
        })}

        {/* Links */}
        {links.map((l, i) => {
          const x1 = lX, y1 = lY(l.ci), x2 = rX, y2 = rY(l.ri), cx = (x1 + x2) / 2, active = activeLink(l);
          return (
            <path key={i} d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`} fill="none"
              stroke={active ? KIND_COLOR[l.kind] : (l.kind === 'presignal' ? '#B6E9D0' : l.kind === 'sourcing' ? '#C9D4EA' : '#E0E4EE')}
              strokeWidth={active ? 2.4 : 1.25}
              opacity={dim && !active ? 0.1 : active ? 1 : 0.72} />
          );
        })}

        {/* Left nodes: connectors */}
        {conns.map((c, i) => {
          const y = lY(i), active = focus?.side === 'L' && focus.key === i;
          const linkedFromCo = focus?.side === 'R' && c.vlinks.some(l => l.co === companies[focus.key]);
          const faded = dim && !active && !linkedFromCo;
          return (
            <g key={c.name} style={{ cursor: 'pointer' }} opacity={faded ? 0.22 : 1}
              onMouseEnter={() => setHover({ side: 'L', key: i })}
              onMouseLeave={() => setHover(null)}
              onClick={() => togglePin('L', i)}>
              <text x={lX - 13} y={y - 2} textAnchor="end" fontFamily="Source Serif 4, Georgia, serif" fontSize="12.5" fontWeight="600" fill="#0B1F33">{c.name}</text>
              <text x={lX - 13} y={y + 10} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#7C8B9C">{c.sub}</text>
              <circle cx={lX} cy={y} r={active ? 6 : 4.5} fill={active ? TYPE_COLOR[c.type] : '#fff'} stroke={TYPE_COLOR[c.type]} strokeWidth="2" />
            </g>
          );
        })}

        {/* Right nodes: companies */}
        {companies.map((name, i) => {
          const meta = COMPANY_META[name], y = rY(i);
          const active = focus?.side === 'R' && focus.key === i;
          const linkedFromConn = focus?.side === 'L' && conns[focus.key]?.vlinks.some(l => l.co === name);
          const faded = dim && !active && !linkedFromConn;
          const color = meta?.cold ? '#C2740C' : meta?.kind === 'presignal' ? '#0E9F6E' : meta?.kind === 'sourcing' ? '#2563EB' : '#6366F1';
          const prefix = meta?.kind === 'presignal' ? 'pre-signal · ' : meta?.kind === 'sourcing' ? 'target · ' : 'held · ';
          return (
            <g key={name} style={{ cursor: 'pointer' }} opacity={faded ? 0.22 : 1}
              onMouseEnter={() => setHover({ side: 'R', key: i })}
              onMouseLeave={() => setHover(null)}
              onClick={() => togglePin('R', i)}>
              <circle cx={rX} cy={y} r={active ? 6 : 4.5} fill={active ? color : '#fff'} stroke={color} strokeWidth="2" strokeDasharray={meta?.cold ? '2 2' : meta?.kind === 'presignal' ? '3 2' : 'none'} />
              <text x={rX + 15} y={y - 1} fontFamily="Source Serif 4, Georgia, serif" fontSize="12.5" fontWeight="600" fill="#0B1F33">{name}</text>
              <text x={rX + 15} y={y + 11} fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill={meta?.cold ? '#C2740C' : meta?.kind === 'presignal' ? '#0E9F6E' : '#7C8B9C'}>
                {prefix}{meta?.tag}
              </text>
            </g>
          );
        })}
      </svg>

      </div>
      {/* Detail strip — hover to preview, click a node to pin it open.
          Sticky so it floats into view even when the map extends below the fold. */}
      <div style={{
        position: 'sticky', bottom: 12, zIndex: 6,
        marginTop: 8, minHeight: 68, background: '#fff',
        border: `1px solid ${pinned && !hover ? '#D3E0FF' : 'var(--border)'}`,
        borderRadius: 9, padding: '12px 16px',
        boxShadow: focusedRel ? '0 10px 32px rgba(11,31,51,0.14)' : '0 2px 8px rgba(11,31,51,0.05)',
        transition: 'box-shadow 0.2s',
      }}>
        {focusedRel ? (
          <>
            <div style={{ marginBottom: 9, display: 'flex', alignItems: 'center' }}>
              <span className="serif" style={{ fontSize: 14, fontWeight: 600, color: '#0B1F33' }}>{focusedRel.title}</span>
              <span style={{ fontSize: 11, color: '#7C8B9C', marginLeft: 8 }}>{focusedRel.sub}</span>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {focusedRel.isCompany && COMPANY_META[focusedRel.title]?.kind === 'presignal' && onJump && (
                  <button onClick={() => onJump('presignal', { companyId: focusedRel.title.toLowerCase() })} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                    color: '#0E9F6E', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 5,
                    padding: '3px 8px', cursor: 'pointer',
                  }}>Open Pre-Signal brief <ArrowUpRight size={10} /></button>
                )}
                {pinned && !hover && (
                  <>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563EB', background: '#EEF3FF', border: '1px solid #D3E0FF', borderRadius: 4, padding: '2px 7px' }}>Pinned</span>
                    <button onClick={() => setPinned(null)} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 5px', color: '#7C8B9C', cursor: 'pointer', display: 'inline-flex' }}><X size={11} /></button>
                  </>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {focusedRel.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: KIND_COLOR[it.kind], flexShrink: 0, marginTop: 4 }} />
                  <span style={{ fontSize: 11.5, color: '#36475A', lineHeight: 1.5, flex: 1 }}>
                    <strong style={{ color: '#0B1F33' }}>{it.co}</strong>
                    <span style={{ margin: '0 6px', color: '#CBD3DC' }}>·</span>
                    {it.note}
                  </span>
                  <span style={{ marginLeft: 'auto' }}><Cite sources={it.src} /></span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <span style={{ fontSize: 11.5, color: '#7C8B9C', display: 'flex', alignItems: 'center', height: 44 }}>
            Hover any node to trace its relationships; click a node to pin them here and open the sources. Blue links = sourcing bridges; indigo = portfolio value-add; green = Pre-Signal paths (companies before PitchBook).
          </span>
        )}
      </div>
    </div>
  );
}

// Thesis coverage grid
function ThesisCoverage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
      {THESES.map(t => (
        <div key={t.label} style={{ background: '#FBFCFD', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px', borderLeft: `3px solid ${t.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0B1F33' }}>{t.label}</span>
          </div>
          <p style={{ fontSize: 10.5, color: '#7C8B9C', margin: '0 0 8px', lineHeight: 1.45 }}>{t.desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {t.connectors.map(c => (
              <span key={c} style={{ fontSize: 9.5, color: '#36475A', background: '#F1F4F7', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px' }}>{c}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {t.targets.map(tg => (
              <span key={tg} style={{ fontSize: 9.5, color: t.color, background: '#fff', border: `1px solid ${t.color}30`, borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>{tg}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// LP ecosystem section
function LPEcosystem() {
  return (
    <div style={{ background: '#FBFCFD', border: '1px solid var(--border)', borderRadius: 11, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Users size={14} style={{ color: '#2563EB' }} />
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0B1F33' }}>LP Ecosystem Depth</span>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#7C8B9C', marginLeft: 4 }}>130+ unicorn-founder LPs</span>
      </div>
      <p style={{ fontSize: 11.5, color: '#4F6072', margin: '0 0 14px', lineHeight: 1.55, maxWidth: 720 }}>
        Beyond the mapped connectors, firstminute's LP base gives it a second-degree network that few seed funds can match. Every LP is a potential warm path to a sector, a geography, or a founder community.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {LP_GROUPS.map(g => (
          <div key={g.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <span style={{ width: 28, fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 700, color: g.color }}>{g.count}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0B1F33' }}>{g.label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {g.examples.map(e => (
                <span key={e} style={{ fontSize: 10.5, color: '#7C8B9C' }}>{e}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Sourcing access plays ----
const PLAYS = [
  { id: 'console', company: 'Console', stage: 'Series A', score: 99, warm: true,
    thesis: 'Agentic IT service management; named in firstminute\'s 2026 predictions and the highest Opportunity Score in the set (99/100). A 4.7x step-up in three months.',
    bridge: { fund: 'DST Global', detail: 'DST led Console\'s $23M Series A and co-invested in Mistral, a firstminute seed company. Second path via Scott Chacon (LP, GitHub co-founder).', sources: [SRC.console, SRC.mistral] },
    backers: ['Thrive Capital', 'DST Global', 'Aaron Levie (Box)', 'Nikesh Arora (Palo Alto)', "Adam D'Angelo (Quora)", 'Ramp founders'], backersCite: [SRC.console],
    ask: 'Warm intro via DST or Scott Chacon before the next round prices.' },
  { id: 'omnea', company: 'Omnea', stage: 'Series B', score: 94, warm: true,
    thesis: 'Procurement and compliance AI from the Tessian founding team. On the compliance-AI thesis and UK-founded, core geography.',
    bridge: { fund: 'Accel', detail: 'Accel backed Omnea\'s Series B and led n8n\'s Series C, a firstminute company. Des Traynor (LP) is a natural operator bridge via GTM tooling overlap.', sources: [SRC.omnea, SRC.n8n] },
    backers: ['Insight Partners', 'Khosla Ventures', 'Accel', 'Point Nine', 'First Round', 'Prosus'], backersCite: [SRC.omnea],
    ask: 'Accel intro or Des Traynor direct, then a London founder meeting.' },
  { id: 'hadrian', company: 'Hadrian', stage: 'Series C', score: 84, warm: true,
    thesis: 'Software-defined factories for defense and space. Reindustrialisation and physical-AI thesis, rare IPO-skew (56%).',
    bridge: { fund: 'a16z (American Dynamism)', detail: 'a16z is a Hadrian investor with Katherine Boyle on the board, and backed Mistral. The American Dynamism team is the right vector.', sources: [SRC.a16zHadrian, SRC.mistral] },
    backers: ['Founders Fund', 'Lux Capital', 'a16z', 'Altimeter', 'RTX Ventures', 'Construct'], backersCite: [SRC.hadrianCnbc],
    ask: 'a16z intro via American Dynamism. US-centric and capital-heavy, would need a co-lead.' },
  { id: 'avoca', company: 'Avoca', stage: 'Series B', score: 94, warm: true,
    thesis: 'Vertical voice-AI for the trades. On the 2026 predictions and a unicorn at Series B. US-centric, so best as a follow rather than a lead.',
    bridge: { fund: 'Kleiner Perkins and General Catalyst', detail: 'Kleiner led Avoca\'s Series A and co-led Granola. General Catalyst led Avoca\'s Series B and backed Mistral. Two independent warm paths.', sources: [SRC.avoca, SRC.granolaC, SRC.mistral] },
    backers: ['Kleiner Perkins', 'General Catalyst', 'Meritech', 'Amplify', 'Y Combinator'], backersCite: [SRC.avoca],
    ask: 'Two warm routes available. Confirm European mandate before committing capital.' },
  { id: 'prem', company: 'Prem Labs', stage: 'Seed / Series A in talks', score: 79, warm: false,
    thesis: 'Sovereign, self-hosted LLMs with confidential compute. On the sovereignty thesis, riding the EU AI Act. Reportedly raising $100M.',
    bridge: { fund: 'No verified co-investor overlap', detail: 'Backers are David Maisel, Sequoia Capital China, Breyer and Scientifica. None verified on the firstminute book. Treat as a direct, thesis-led approach.', sources: [SRC.prem] },
    backers: ['David Maisel (Marvel)', 'Sequoia Capital China', 'Breyer Capital', 'Scientifica'], backersCite: [SRC.prem],
    ask: 'Direct founder outreach on sovereignty angle, ahead of the $100M Series A.' },
];

// Sourcing companies with a verified warm path (consumed by the Sourcing map chart)
export const WARM_PATH_COMPANIES = new Set(PLAYS.filter(p => p.warm).map(p => p.company));

// Held companies that anchor each play's warm bridge (names as they appear in companies.json)
const PLAY_PORTFOLIO_BRIDGE = {
  console: ['Mistral AI'],
  omnea: ['n8n'],
  hadrian: ['Mistral AI'],
  avoca: ['Granola', 'Mistral AI'],
};

export default function DoorsTab({ jump, onJump }) {
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState({});
  const isMobile = useIsMobile();

  const open = (play) => {
    setModal(play);
    setMessage(play.warm
      ? `Subject: ${play.company}\n\n${play.bridge.fund} sits on both ${play.company}'s cap table and a firstminute company. Could we ask for a warm intro to the ${play.company} team?\n\nObjective: ${play.ask}`
      : `Subject: ${play.company}\n\nNo shared co-investor. Direct, thesis-led approach.\n\nObjective: ${play.ask}`);
  };
  const submit = () => { setSent(p => ({ ...p, [modal.id]: true })); setModal(null); };

  const warmCount = PLAYS.filter(p => p.warm).length;
  const totalConnectors = CONNECTORS.length;
  const presignalCount = Object.values(COMPANY_META).filter(m => m.kind === 'presignal').length;

  return (
    <div style={{ padding: isMobile ? '16px 16px 48px' : '22px 32px 56px' }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
          <Network size={17} style={{ color: '#2563EB' }} />
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 700, color: '#0B1F33', margin: 0 }}>The Network</h2>
        </div>
        <p style={{ fontSize: 12.5, color: '#4F6072', margin: 0, maxWidth: 820, lineHeight: 1.6 }}>
          firstminute's edge is relationship capital: {totalConnectors} mapped connectors across partners, unicorn-founder LPs, and co-investor funds. The network does three jobs: winning warm access to sourcing targets via shared co-investors, deploying operators to open doors for held companies, and opening warm paths to {presignalCount} pre-seed and seed Pre-Signal companies before they reach PitchBook. Every co-investor link is backed by a real funding round. Hover a node to trace the path; click it to pin the detail and open the source.
        </p>
      </div>

      {/* Stats band */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 10, marginBottom: 22 }}>
        {[
          { label: 'Connectors mapped', value: totalConnectors, sub: 'partners, operators, funds', accent: '#0B1F33' },
          { label: 'Warm sourcing paths', value: warmCount, sub: 'via co-investor overlap', accent: '#2563EB' },
          { label: 'Companies in map', value: COMPANY_ORDER.length, sub: 'held, target, pre-signal', accent: '#6366F1' },
          { label: 'Pre-Signal paths', value: presignalCount, sub: 'pre-seed & seed, pre-PitchBook', accent: '#0E9F6E' },
          { label: 'LP depth', value: '130+', sub: 'unicorn-founder LPs', accent: '#C2740C' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 16px' }}>
            <span className="field-label">{s.label}</span>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, fontWeight: 700, color: s.accent, lineHeight: 1.2, margin: '4px 0 2px' }}>{s.value}</div>
            <span style={{ fontSize: 10, color: '#7C8B9C' }}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Relationship map */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <GitBranch size={13} style={{ color: '#2563EB' }} />
          <span className="field-label">Relationship Map: who can open which door</span>
        </div>
        <NetworkMap jump={jump} onJump={onJump} />
      </div>

      {/* Thesis coverage grid */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Layers size={14} style={{ color: '#6366F1' }} />
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0B1F33' }}>Thesis Coverage</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#7C8B9C' }}>which investment theses the network activates</span>
        </div>
        <ThesisCoverage />
      </div>

      {/* LP Ecosystem */}
      <div style={{ marginBottom: 28 }}>
        <LPEcosystem />
      </div>

      {/* Sourcing plays */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={14} style={{ color: '#2563EB' }} />
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0B1F33' }}>Sourcing Access Plays</span>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#7C8B9C' }}>{warmCount} of {PLAYS.length} with verified warm path</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(520px, 1fr))', gap: 16 }}>
        {PLAYS.map(play => {
          const isSent = sent[play.id];
          return (
            <div key={play.id} className="card card-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: play.warm ? '#0E9F6E' : '#C2740C', background: play.warm ? 'var(--green-bg)' : 'var(--amber-bg)', border: `1px solid ${play.warm ? 'var(--green-border)' : 'var(--amber-border)'}`, borderRadius: 5, padding: '2px 8px' }}>{play.warm ? 'Warm path' : 'Direct approach'}</span>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#7C8B9C' }}>{play.stage}</span>
                  </div>
                  <h3 className="serif" style={{ fontSize: 17, fontWeight: 600, color: '#0B1F33', margin: 0 }}>{play.company}</h3>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <span className="field-label">PB Score</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 19, fontWeight: 700, color: play.score >= 90 ? '#6366F1' : '#2563EB', display: 'block', lineHeight: 1.2 }}>{play.score}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#4F6072', lineHeight: 1.55, margin: '0 0 13px' }}>{play.thesis}</p>
              <div style={{ background: play.warm ? 'var(--blue-bg)' : 'var(--amber-bg)', border: `1px solid ${play.warm ? 'var(--blue-border)' : 'var(--amber-border)'}`, borderRadius: 9, padding: '11px 13px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  {play.warm ? <GitBranch size={12} style={{ color: '#2563EB' }} /> : <ShieldQuestion size={12} style={{ color: '#C2740C' }} />}
                  <span className="field-label" style={{ color: play.warm ? '#2563EB' : '#C2740C' }}>{play.warm ? `Warm bridge via ${play.bridge.fund}` : 'No co-investor overlap'}</span>
                  <span style={{ marginLeft: 'auto' }}><Cite sources={play.bridge.sources} /></span>
                </div>
                <p style={{ fontSize: 11.5, color: '#36475A', lineHeight: 1.55, margin: 0 }}>{play.bridge.detail}</p>
                {onJump && PLAY_PORTFOLIO_BRIDGE[play.id] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7C8B9C' }}>Portfolio anchor:</span>
                    {PLAY_PORTFOLIO_BRIDGE[play.id].map(name => (
                      <button key={name} onClick={() => onJump('held', { openCompany: name })} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 700,
                        color: '#2563EB', background: '#fff', border: '1px solid #D3E0FF', borderRadius: 5,
                        padding: '3px 8px', cursor: 'pointer',
                      }}>{name} <ArrowUpRight size={9} /></button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span className="field-label">Who is already in</span><Cite sources={play.backersCite} align="left" />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {play.backers.map(bk => <span key={bk} style={{ fontSize: 10.5, color: '#36475A', background: '#F6F7F9', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px' }}>{bk}</span>)}
                </div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 13, borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <p style={{ fontSize: 11.5, color: '#36475A', lineHeight: 1.5, margin: 0, flex: 1 }}><strong style={{ color: '#0B1F33' }}>Ask:</strong> {play.ask}</p>
                <button onClick={() => open(play)} disabled={isSent} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600, padding: '7px 12px', borderRadius: 7, cursor: isSent ? 'default' : 'pointer', background: isSent ? 'var(--green-bg)' : '#2563EB', color: isSent ? '#0E9F6E' : '#fff', border: isSent ? '1px solid var(--green-border)' : 'none' }}>
                  {isSent ? <><Check size={11} /> Drafted</> : <><ArrowUpRight size={11} /> Draft outreach</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,31,51,0.4)', backdropFilter: 'blur(2px)', padding: isMobile ? 0 : 20 }}>
          <div className="card slide-in" style={{ width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(11,31,51,0.25)', margin: isMobile ? 0 : 'auto', height: isMobile ? '100%' : 'auto', display: 'flex', flexDirection: 'column', borderRadius: isMobile ? 0 : undefined }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="field-label">{modal.warm ? `Outreach via ${modal.bridge.fund}` : 'Direct outreach'}</span>
                <div className="serif" style={{ fontSize: 15, fontWeight: 600, color: '#0B1F33', marginTop: 2 }}>{modal.company}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 7px', color: '#7C8B9C', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="field-label" style={{ marginBottom: 4 }}>Draft</span>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8} style={{ width: '100%', flex: 1, marginTop: 4, padding: '11px 13px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, color: '#36475A', fontSize: 12, lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ padding: '8px 16px', background: '#fff', border: '1px solid var(--border)', borderRadius: 7, color: '#7C8B9C', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submit} style={{ padding: '8px 16px', background: '#2563EB', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Send size={12} /> Save draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
