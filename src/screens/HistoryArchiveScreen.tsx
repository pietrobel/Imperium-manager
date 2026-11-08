import React, { useState } from 'react';
import { INITIAL_HALL_OF_FAME } from '../engines/historyEngine';
import { INITIAL_REGIONS } from '../initialData/regions';
import { INITIAL_CLUBS } from '../initialData/clubs';
import { Trophy, Award, Scroll, Globe, MapPin, Landmark } from 'lucide-react';
import type { CareerSave } from '../types';

interface HistoryArchiveScreenProps {
  career?: CareerSave | null;
}

export const HistoryArchiveScreen: React.FC<HistoryArchiveScreenProps> = ({ career }) => {
  const [activeTab, setActiveTab] = useState<'ALBO' | 'ATLANTE'>('ALBO');
  const [selectedMacroArea, setSelectedMacroArea] = useState<string>('TUTTE');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('reg_roma');

  const regions = Object.values(career?.regions || INITIAL_REGIONS);
  const macroAreas = ['TUTTE', 'Occidente Romano', 'Europa Continentale & Celtica', 'Mediterraneo Orientale & Grecia', 'Asia & Vicino Oriente', 'Nord Africa & Nilo'];

  const filteredRegions = regions.filter(r => selectedMacroArea === 'TUTTE' || r.macroArea === selectedMacroArea);
  const activeRegion = (career?.regions || INITIAL_REGIONS)[selectedRegionId] || regions[0];

  // Clubs in this region
  const clubs = career?.clubs || INITIAL_CLUBS;
  const regionLeagueIds = new Set(activeRegion?.leagueIds || []);
  const regionClubs = Object.values(clubs).filter(c => regionLeagueIds.has(c.leagueId));

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="retro-box p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scroll size={16} className="text-[#d4af37]" />
          <div>
            <h1 className="font-roman text-sm font-bold text-white tracking-wide">
              DOCUMENTI SENATORII DELL'IMPERO · ERA OLIMPICA & FASTI CONSOLARI
            </h1>
            <span className="text-[10px] text-[#94a3b8]">Fasti Consolari, Albo dei Trionfi e Geografia delle Province</span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#0a0d14] p-1 border border-[#232d3f] rounded-xs text-xs font-roman">
          <button
            onClick={() => setActiveTab('ALBO')}
            className={`px-3 py-1 font-bold rounded-xs cursor-pointer transition-colors ${
              activeTab === 'ALBO' ? 'bg-[#d4af37] text-[#0a0d14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Albo d'Oro & Record
          </button>
          <button
            onClick={() => setActiveTab('ATLANTE')}
            className={`px-3 py-1 font-bold rounded-xs cursor-pointer transition-colors flex items-center gap-1 ${
              activeTab === 'ATLANTE' ? 'bg-[#d4af37] text-[#0a0d14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Globe size={13} />
            <span>Atlante del Mondo (30 Regioni)</span>
          </button>
        </div>
      </div>

      {activeTab === 'ALBO' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hall of Fame Table */}
          <div className="retro-box overflow-hidden">
            <div className="retro-panel-header px-4 py-2.5 flex items-center gap-2 border-b border-[#252e42]">
              <Trophy size={14} className="text-[#d4af37]" />
              <h2 className="font-roman text-xs font-bold text-white tracking-wide">
                ALBO DEI TRIONFATORI PASSATI (181ª - 182ª OLIMPIADE)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-data">
                <thead>
                  <tr className="text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42] bg-[#0f131c]">
                    <th className="py-2 px-3">ERA OLIMPICA & CONSOLATO</th>
                    <th className="py-2 px-3">COMPETIZIONE</th>
                    <th className="py-2 px-3">CAMPIONE</th>
                    <th className="py-2 px-3">CAPOCANNONIERE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] text-xs">
                  {INITIAL_HALL_OF_FAME.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-[#1b2334] transition-colors">
                      <td className="py-2.5 px-3 text-[#d4af37] font-bold text-[11px]">
                        <div>{entry.eraOlimpica || `anno ${entry.anno}`}</div>
                        {entry.consolato && <div className="text-[9px] text-[#94a3b8] font-normal">{entry.consolato}</div>}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-white">{entry.competizione}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#facc15] font-roman">
                        {entry.vincitoreNome}
                      </td>
                      <td className="py-2.5 px-3 text-[#38bdf8]">
                        {entry.capocannoniereNome} ({entry.golCapocannoniere} gol)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Records */}
          <div className="retro-box p-4 space-y-4">
            <div className="retro-panel-header px-4 py-2.5 flex items-center gap-2 border-b border-[#252e42] -mx-4 -mt-4 mb-4">
              <Award size={14} className="text-[#d4af37]" />
              <h2 className="font-roman text-xs font-bold text-white tracking-wide">
                RECORD STORICI DELL'ARENA
              </h2>
            </div>

            <div className="space-y-2.5 text-xs font-data">
              <div className="retro-inset p-3">
                <span className="text-[10px] text-[#64748b] block font-roman">RECORD DI GOL IN UNA STAGIONE</span>
                <span className="font-bold text-sm text-[#10b981]">24 GOL · Hamilcar Barca Minor (Carthago Poeni)</span>
                <span className="text-[11px] text-[#94a3b8] block">Campioni indetti nell'anno 4 della 181ª Olimpiade</span>
              </div>

              <div className="retro-inset p-3">
                <span className="text-[10px] text-[#64748b] block font-roman">STADIO PIÙ CAPIENTE</span>
                <span className="font-bold text-sm text-white">120.000 POSTI · Circus Maximus (SPQR Roma)</span>
                <span className="text-[11px] text-[#94a3b8] block">Valle Murcia, Roma</span>
              </div>

              <div className="retro-inset p-3">
                <span className="text-[10px] text-[#64748b] block font-roman">RECORD DI TITOLI VINTI</span>
                <span className="font-bold text-sm text-[#facc15]">3 TITOLI · SPQR Roma Caput Mundi</span>
                <span className="text-[11px] text-[#94a3b8] block">Campione Italico (181ª - 182ª Olimpiade)</span>
              </div>

              <div className="retro-inset p-3">
                <span className="text-[10px] text-[#64748b] block font-roman">INVINCIBILITÀ CASALINGA</span>
                <span className="font-bold text-sm text-[#38bdf8]">18 PARTITE IMBATTUTI · Sparta Hoplitae</span>
                <span className="text-[11px] text-[#94a3b8] block">Stadion Eurotas (181ª Olimpiade)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* World Atlas Tab */
        <div className="space-y-4">
          {/* Macro Area Selection */}
          <div className="retro-box p-2.5 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="font-roman text-[#d4af37] font-bold shrink-0 mr-1">AREE GEOGRAFICHE:</span>
            {macroAreas.map(area => (
              <button
                key={area}
                onClick={() => setSelectedMacroArea(area)}
                className={`px-3 py-1 font-roman rounded-xs whitespace-nowrap cursor-pointer transition-colors ${
                  selectedMacroArea === area
                    ? 'bg-[#d4af37] text-[#0a0d14] font-bold'
                    : 'bg-[#111622] text-[#94a3b8] hover:text-white border border-[#232d3f]'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Regions List */}
            <div className="retro-box overflow-hidden max-h-[600px] flex flex-col">
              <div className="retro-panel-header px-4 py-2 border-b border-[#252e42] flex justify-between items-center">
                <span className="font-roman text-xs font-bold text-white">REGIONE STORICA</span>
                <span className="text-[10px] text-[#94a3b8]">{filteredRegions.length} Province</span>
              </div>
              <div className="divide-y divide-[#182030] overflow-y-auto text-xs">
                {filteredRegions.map(reg => (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegionId(reg.id)}
                    className={`w-full p-2.5 text-left transition-colors cursor-pointer flex items-center justify-between ${
                      selectedRegionId === reg.id ? 'bg-[#1e2738] border-l-2 border-l-[#d4af37]' : 'hover:bg-[#131a26]'
                    }`}
                  >
                    <div>
                      <div className="font-roman font-bold text-[#f8fafc] text-xs">{reg.nome}</div>
                      <div className="text-[10px] text-[#64748b] italic">{reg.nomeLatino}</div>
                      <div className="text-[10px] text-[#94a3b8]">{reg.culturaDominante}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-data text-[#facc15] font-bold block">Rep. {reg.reputazioneCalcio}</span>
                      <span className="text-[9px] text-[#64748b] block">{reg.macroArea.split('&')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Region Detail & Clubs */}
            <div className="lg:col-span-2 retro-box p-4 space-y-4">
              {activeRegion && (
                <>
                  <div className="border-b border-[#252e42] pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h2 className="font-roman text-base font-bold text-[#d4af37]">
                        {activeRegion.nome} ({activeRegion.nomeLatino})
                      </h2>
                      <span className="text-xs font-roman font-bold px-2 py-0.5 bg-[#1e2738] text-[#38bdf8] border border-[#2e3c54] rounded-xs self-start">
                        {activeRegion.macroArea}
                      </span>
                    </div>
                    <div className="text-xs text-[#94a3b8] mb-2 leading-relaxed">
                      {activeRegion.descrizioneStorica}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-data">
                      <div className="retro-inset p-2">
                        <span className="text-[10px] text-[#64748b] block font-roman">CULTURA DOMINANTE</span>
                        <span className="font-bold text-white">{activeRegion.culturaDominante}</span>
                      </div>
                      <div className="retro-inset p-2">
                        <span className="text-[10px] text-[#64748b] block font-roman">REPUTAZIONE CALCISTICA</span>
                        <span className="font-bold text-[#facc15]">{activeRegion.reputazioneCalcio} / 1000</span>
                      </div>
                      <div className="retro-inset p-2 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-[#64748b] block font-roman">CLUB REGISTRATI</span>
                        <span className="font-bold text-[#10b981]">{regionClubs.length} Squadre</span>
                      </div>
                    </div>
                  </div>

                  {/* Clubs in Region Table */}
                  <div>
                    <h3 className="font-roman text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <Landmark size={14} className="text-[#d4af37]" />
                      <span>SQUADRE E ARENE DELLA REGIONE · 182ª OLIMPIADE</span>
                    </h3>

                    <div className="overflow-x-auto max-h-[360px] border border-[#1b2333] rounded-xs">
                      <table className="w-full text-left text-xs border-collapse font-data">
                        <thead>
                          <tr className="text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42] bg-[#0c1017]">
                            <th className="py-2 px-3">SQUADRA</th>
                            <th className="py-2 px-3">CITTÀ</th>
                            <th className="py-2 px-3">STADIO / ARENA</th>
                            <th className="py-2 px-3 text-right">CAPIENZA</th>
                            <th className="py-2 px-3 text-right">REP.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#182030] text-xs">
                          {regionClubs.map(club => (
                            <tr key={club.id} className="hover:bg-[#161e2c] transition-colors">
                              <td className="py-2 px-3 font-roman font-bold text-white">
                                {club.nome}
                              </td>
                              <td className="py-2 px-3 text-[#94a3b8]">{club.citta}</td>
                              <td className="py-2 px-3 text-[#cbd5e1]">{club.stadioNome}</td>
                              <td className="py-2 px-3 text-right text-[#38bdf8]">
                                {club.stadioCapienza.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-[#facc15]">
                                {club.reputazione}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
