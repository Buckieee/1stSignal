import React from 'react';
import { ExternalLink, Mail, Globe, Link2 } from 'lucide-react';
import { useIsMobile } from '../hooks';

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '36px 0' }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A9B5C2', marginBottom: 14 }}>
      {children}
    </div>
  );
}

function Heading({ children }) {
  return (
    <h2 className="serif" style={{ fontSize: 18, fontWeight: 700, color: '#0B1F33', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  );
}

function Body({ children, style }) {
  return (
    <p style={{ fontSize: 13.5, color: '#36475A', lineHeight: 1.75, margin: '0 0 16px', ...style }}>
      {children}
    </p>
  );
}

function BulletItem({ title, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 8 }} />
      <p style={{ fontSize: 13, color: '#36475A', lineHeight: 1.7, margin: 0 }}>
        {title && <strong style={{ color: '#0B1F33' }}>{title}. </strong>}
        {children}
      </p>
    </div>
  );
}

export default function NotesTab() {
  const isMobile = useIsMobile();
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '40px 32px 80px' }}>

      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>Notes on this build</SectionLabel>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, color: '#0B1F33', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          A working idea, not a finished product.
        </h1>
        <p style={{ fontSize: 14, color: '#7C8B9C', margin: 0, lineHeight: 1.6 }}>
          Prepared for a quick call with Brent Hoberman · 1stSignal · June 2026
        </p>
      </div>

      <Divider />

      {/* What this is */}
      <SectionLabel>What this is</SectionLabel>
      <Heading>A working provocation.</Heading>
      <Body>
        1stSignal was put together ahead of a quick call as a working answer to a simple question: what would venture intelligence actually look like if you built it properly at firstminute capital?
      </Body>
      <Body>
        Most VC firms run their portfolio intelligence across a patchwork. Notion for thesis notes, Airtable for deal tracking, PitchBook open in another tab, a Slack channel for news, and a partner's memory for the relationship graph. Nothing talks to anything else. Signals get missed. Warm paths go cold.
      </Body>
      <Body>
        This is a sketch of the alternative. Every held company as a living tear sheet with thesis, edge, signal, risk, and the firstminute play. Every sourcing target with a warm path already traced. Every connector mapped to the door they can open.
      </Body>

      {/* Data note */}
      <div style={{ background: '#FBFCFD', border: '1px solid var(--border)', borderLeft: '3px solid #C2740C', borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C2740C', marginBottom: 5 }}>Data note</div>
        <p style={{ fontSize: 12, color: '#7C8B9C', margin: 0, lineHeight: 1.6 }}>
          All data in this draft is illustrative, sourced from open-source press and PitchBook public captures. It covers only the 14 companies shown in this build: 9 held positions and 5 sourcing targets. Funding rounds are press-sourced. Valuations are reported post-money. Nothing here reflects firstminute's internal marks, proprietary deal flow, or LP records. Treat every number as a frame, not a source of truth.
        </p>
      </div>

      <Divider />

      {/* firstminute ecosystem context */}
      <SectionLabel>The wider context</SectionLabel>
      <Heading>firstminute sits at the centre of an unusually dense ecosystem.</Heading>
      <Body>
        firstminute capital is not just a fund. It is part of a broader platform that Brent Hoberman has built over two decades: Founders Forum, Founder Factory, and a LP base drawn almost entirely from unicorn founders and operating CEOs.
      </Body>
      <Body>
        Founders Forum is one of the most concentrated gatherings of tech founders and operators in Europe, running annually since 2007. The relationships formed there do not stay in the room. They flow into deal flow, co-investments, references, and introductions. Many of the connectors mapped in the Network tab are Founders Forum alumni. The warm paths that exist between firstminute and its sourcing targets often run through that network before they run through a co-investor.
      </Body>
      <Body>
        Founder Factory is firstminute's venture studio arm. It brings in corporate partners and builds companies from the ground up. That means firstminute has access to a different kind of signal: not just which companies are raising, but which problems large corporates are willing to pay to solve. That is upstream intelligence.
      </Body>
      <Body>
        The point is that the data problem firstminute has is not just about PitchBook access or deal flow volume. It is about making a genuinely dense, high-quality network legible and actionable in real time. The tools most funds use were not built for a network this rich.
      </Body>

      <Divider />

      {/* Connector layer */}
      <SectionLabel>The part that matters most</SectionLabel>
      <Heading>The connector layer is the real edge.</Heading>
      <Body>
        The relationship map in the Network tab is the most interesting thing on this site, and also the most underbuilt version of what it could be.
      </Body>
      <Body>
        Right now it draws lines between 18 connectors and 13 companies using co-investor overlap: a fund that backed both a firstminute company and a sourcing target. That is already useful. But it is a static picture.
      </Body>
      <Body>
        The real version looks different. Imagine the same map, but each line has a weight. How many times has this connector actually made an intro that converted? Which LPs respond in under 24 hours? Which co-investor fund has a partner who personally knows the target founder? Which path has been warm for six months and is going cold?
      </Body>
      <Body>
        That is not a relationship map. That is a relationship operating system.
      </Body>
      <Body>
        firstminute already has the raw ingredients: 130+ unicorn-founder LPs, a partner network with decades of founder relationships, and a portfolio whose co-investors sit on the cap tables of the next generation of deals. Add Founders Forum's 15 years of relationship history and Founder Factory's corporate network, and the graph gets significantly denser. The missing piece is the layer that makes all of it searchable, rankable, and actionable in one place.
      </Body>
      <Body>
        With real LP data, CRM history, email metadata (with consent), and meeting logs, you could build a system that tells you before you pick up the phone: how warm a path actually is, who the right person to ask is, and what framing will land based on what that connector cares about right now.
      </Body>

      <Divider />

      {/* What could be built */}
      <SectionLabel>With real data, this becomes something else</SectionLabel>
      <Heading>What could be built on this foundation.</Heading>

      <BulletItem title="Live portfolio monitoring">
        Replace the static tear sheets with a live feed. PitchBook alerts, news triggers, hiring signals, founder activity on LinkedIn, all routed into the company's page and scored for relevance. A warning card appears when a co-investor lead partner leaves. A green card appears when a portfolio company's growth signals accelerate. The analyst sees the right signal at the right time, not six weeks later.
      </BulletItem>
      <BulletItem title="Proprietary deal scoring">
        PitchBook's Opportunity Score is a useful proxy. But firstminute's actual signal: which founders LPs have vouched for, which companies came through Founders Forum intros, which sectors the partners have real conviction in, is a far better input. A scoring model trained on firstminute's own deal history would outperform any third-party score for firstminute's specific strategy.
      </BulletItem>
      <BulletItem title="Warm-path ranking">
        Not just who can open a door, but how hard it is to open. Score each path by relationship recency, intro conversion history, and connector availability. Surface the one-email path versus the three-handshake path. Let the analyst act on the easiest route first. Include Founders Forum relationships as a distinct tier, since those tend to convert faster.
      </BulletItem>
      <BulletItem title="LP engagement intelligence">
        Which LPs are most active in the portfolio's sectors right now? Which ones have portfolio companies that overlap with firstminute's sourcing targets? Which ones haven't been activated in six months and have relationships going stale? Turn the LP base from a capital source into a living sourcing network with a proper engagement layer.
      </BulletItem>
      <BulletItem title="Founder Factory signal layer">
        Founder Factory works directly with large corporates to identify problems worth building on. That is a proprietary signal: validated demand before a startup exists. Surfacing that signal alongside the portfolio view, and showing where it overlaps with deal flow, creates a feedback loop most seed funds do not have access to.
      </BulletItem>
      <BulletItem title="Exit modelling with live comps">
        The exit model in this draft is illustrative. A real version pulls live comparable transactions, adjusts for sector multiples, and re-runs quarterly. It flags when the IPO window opens for a company in the book six months before the banker calls, and surfaces the M&A acquirers who are most active in each sector.
      </BulletItem>

      <Divider />

      {/* Closing */}
      <SectionLabel>The point</SectionLabel>
      <Heading>This is one idea. I am here to build whatever is useful.</Heading>
      <Body>
        The gaps in this build are obvious: some claims need verification, the relationship graph is inferred not observed, and the exit probabilities are directional at best. The data covers 14 companies and a handful of public funding rounds. It is a sketch.
      </Body>
      <Body>
        But the architecture is sound. The tearsheet model works. The connector graph is the right abstraction. The signal layer is the right framing. What it needs is real data, a backend, and someone who knows firstminute's actual portfolio from the inside.
      </Body>
      <Body>
        This is not a pitch for 1stSignal specifically. It is a pitch for a conversation. If there is a problem worth solving at firstminute: in portfolio intelligence, sourcing, LP engagement, network activation, or anything else, I would like to help build it. Whatever form that takes.
      </Body>

      <Divider />

      {/* Author card */}
      <div style={{ background: '#FBFCFD', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 26px', display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A9B5C2', marginBottom: 8 }}>Prepared by</div>
          <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: '#0B1F33', marginBottom: 2 }}>Hritik Jaiswal</div>
          <div style={{ fontSize: 12, color: '#7C8B9C', marginBottom: 16, lineHeight: 1.5 }}>London</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="mailto:hritik.jaiswal25@imperial.ac.uk" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#36475A', textDecoration: 'none' }}>
              <Mail size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
              hritik.jaiswal25@imperial.ac.uk
            </a>
            <a href="https://relayuk.com" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#36475A', textDecoration: 'none' }}>
              <Globe size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
              relayuk.com
              <ExternalLink size={10} style={{ color: '#A9B5C2' }} />
            </a>
            <a href="https://itskairos.uk" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#36475A', textDecoration: 'none' }}>
              <Globe size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
              itskairos.uk
              <ExternalLink size={10} style={{ color: '#A9B5C2' }} />
            </a>
            <a href="https://www.linkedin.com/in/hritikjaiswal16/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#36475A', textDecoration: 'none' }}>
              <Link2 size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
              linkedin.com/in/hritikjaiswal16
              <ExternalLink size={10} style={{ color: '#A9B5C2' }} />
            </a>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 9, padding: '16px 18px', minWidth: 200, maxWidth: 280 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#A9B5C2', marginBottom: 10 }}>This build</div>
          {[
            ['Stack', 'React 19, Vite, Tailwind CSS v4'],
            ['Data', 'PitchBook captures, public press'],
            ['Covers', '14 companies, illustrative only'],
            ['Domain', '1stsignal.uk'],
            ['Status', 'Proof of concept'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 7, alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: '#A9B5C2', letterSpacing: '0.06em', flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 11, color: '#36475A', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
