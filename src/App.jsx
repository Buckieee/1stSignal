import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import CompanyTable from './components/CompanyTable';
import CompanyDetail from './components/CompanyDetail';
import DoorsTab from './components/DoorsTab';
import NotesTab from './components/NotesTab';
import EarlySignalTab from './components/EarlySignalTab';
import companiesData from './data/companies.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('held');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const counts = useMemo(() => ({
    held: companiesData.filter(c => c.type === 'held').length,
    sourcing: companiesData.filter(c => c.type === 'sourcing').length,
  }), []);

  const displayedCompanies = useMemo(() => {
    if (activeTab === 'held') return companiesData.filter(c => c.type === 'held');
    if (activeTab === 'sourcing') return companiesData.filter(c => c.type === 'sourcing');
    return [];
  }, [activeTab]);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7F9', color: '#36475A' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        heldCount={counts.held}
        sourcingCount={counts.sourcing}
        companies={companiesData}
      />
      <main style={{ maxWidth: 1360, margin: '0 auto' }}>
        {activeTab === 'notes' ? (
          <NotesTab />
        ) : activeTab === 'doors' ? (
          <DoorsTab companies={companiesData} />
        ) : activeTab === 'presignal' ? (
          <EarlySignalTab />
        ) : (
          <CompanyTable
            companies={displayedCompanies}
            onSelectCompany={setSelectedCompany}
            tab={activeTab}
          />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', background: '#FFFFFF', marginTop: 8 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 8, fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1, letterSpacing: '-0.03em' }}>1st</span>
            </div>
            <span style={{ fontSize: 11.5, color: '#7C8B9C', lineHeight: 1.5 }}>
              <a href="https://1stsignal.uk" target="_blank" rel="noreferrer" style={{ color: '#36475A', fontWeight: 600, textDecoration: 'none' }}>1stSignal</a>
              {' by '}
              <a href="https://firstminute.capital" target="_blank" rel="noreferrer" style={{ color: '#36475A', fontWeight: 600, textDecoration: 'none' }}>firstminute capital</a>
              {' · '}seed-stage, Europe-first. £1–3m first cheques, backed by 130+ unicorn-founder LPs.
            </span>
          </div>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#A9B5C2', letterSpacing: '0.04em' }}>
            1stSignal · 1stsignal.uk · illustrative draft · data: PitchBook + press, 2026
          </span>
        </div>
      </footer>

      {selectedCompany && (
        <CompanyDetail
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
