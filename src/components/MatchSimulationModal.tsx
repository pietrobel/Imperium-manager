import React, { useEffect, useState } from 'react';
import type { Match, MatchResult, Club, Player } from '../types';
import { RetroButton } from './RetroButton';
import { audio } from '../services/audioService';
import { Harpastum2DSimulator } from './Harpastum2DSimulator';
import { Swords, ScrollText } from 'lucide-react';

interface MatchSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMatch?: { match: Match; result: MatchResult };
  allSimulatedMatches: { match: Match; result: MatchResult }[];
  clubs: Record<string, Club>;
  userClubId: string;
  allPlayers?: Record<string, Player>;
}

export const MatchSimulationModal: React.FC<MatchSimulationModalProps> = ({
  isOpen,
  onClose,
  userMatch,
  allSimulatedMatches,
  clubs,
  userClubId,
  allPlayers = {}
}) => {
  const [activeTab, setActiveTab] = useState<'2D_ARENA' | 'TABELLINO'>(
    userMatch ? '2D_ARENA' : 'TABELLINO'
  );

  useEffect(() => {
    if (isOpen) {
      audio.playWhistle();
      if (userMatch && (userMatch.result.golCasa > 0 || userMatch.result.golOspite > 0)) {
        setTimeout(() => audio.playGoal(), 600);
      }
    }
  }, [isOpen, userMatch]);

  if (!isOpen) return null;

  const homeClub = userMatch ? clubs[userMatch.match.clubCasaId] : null;
  const awayClub = userMatch ? clubs[userMatch.match.clubOspiteId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs">
      <div className="retro-box w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header bar */}
        <div className="retro-panel-header px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#252e42]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <h2 className="font-roman text-sm font-bold tracking-wider text-[#d4af37]">
              AGONE D'HARPASTUM · GIORNATA DI CAMPIONATO
            </h2>
          </div>

          {/* Tab Selector if user match exists */}
          {userMatch && homeClub && awayClub && (
            <div className="flex items-center gap-1.5 bg-[#0a0d14] p-1 border border-[#2d3748] rounded-xs">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setActiveTab('2D_ARENA');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-roman font-bold transition-all rounded-xs cursor-pointer ${
                  activeTab === '2D_ARENA'
                    ? 'bg-[#800020] text-[#d4af37] border border-[#d4af37]/60 shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Simulazione 2D Arena</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setActiveTab('TABELLINO');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-roman font-bold transition-all rounded-xs cursor-pointer ${
                  activeTab === 'TABELLINO'
                    ? 'bg-[#800020] text-[#d4af37] border border-[#d4af37]/60 shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Tabellino & Lega</span>
              </button>
            </div>
          )}

          <RetroButton variant="crimson" size="sm" onClick={onClose}>
            Continua &rarr;
          </RetroButton>
        </div>

        {/* Content body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: 2D Simulation Arena */}
          {activeTab === '2D_ARENA' && userMatch && homeClub && awayClub ? (
            <div className="space-y-4">
              <Harpastum2DSimulator
                userMatch={userMatch}
                homeClub={homeClub}
                awayClub={awayClub}
                allPlayers={allPlayers}
                onSimulationFinished={() => {
                  // User can transition or review
                }}
              />
              <div className="flex items-center justify-between p-3 retro-inset border border-[#2d3748] bg-[#0c1017]">
                <div className="text-[11px] text-[#94a3b8]">
                  Vuoi esaminare tutti i dettagli della partita e la classifica del campionato?
                </div>
                <RetroButton
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    audio.playClick();
                    setActiveTab('TABELLINO');
                  }}
                >
                  <ScrollText className="w-3 h-3 mr-1 inline-block" />
                  Visualizza Tabellino Completo &rarr;
                </RetroButton>
              </div>
            </div>
          ) : (
            /* TAB 2: Classic Tabellino & League Results */
            <>
              {/* User match spotlight */}
              {userMatch && (
                <div className="retro-inset p-4 border border-[#d4af37]/40 relative overflow-hidden">
                  <div className="text-[10px] text-[#d4af37] font-roman uppercase tracking-widest text-center mb-2">
                    L'AGONE DEL TUO SODALIZIO
                  </div>

                  {/* Scoreboard */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#111622] border border-[#232d3f] rounded-xs">
                    {/* Home */}
                    <div className="flex-1 text-right">
                      <div className="font-roman text-base font-bold text-[#f8fafc]">
                        {homeClub?.nome || userMatch.match.clubCasaId}
                      </div>
                      <div className="text-[10px] text-[#94a3b8]">
                        {homeClub?.stadioNome}
                      </div>
                    </div>

                    {/* Score (Puncta / Mete) */}
                    <div className="px-6 flex flex-col items-center">
                      <div className="flex items-center gap-4">
                        <span className="font-data text-3xl font-black text-[#d4af37]">
                          {userMatch.result.golCasa}
                        </span>
                        <span className="text-[#64748b] text-xl font-bold">-</span>
                        <span className="font-data text-3xl font-black text-[#d4af37]">
                          {userMatch.result.golOspite}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#94a3b8] font-roman uppercase tracking-wider mt-0.5">
                        Puncta (Mete)
                      </span>
                    </div>

                    {/* Away */}
                    <div className="flex-1 text-left">
                      <div className="font-roman text-base font-bold text-[#f8fafc]">
                        {awayClub?.nome || userMatch.match.clubOspiteId}
                      </div>
                      <div className="text-[10px] text-[#94a3b8]">
                        {awayClub?.citta}
                      </div>
                    </div>
                  </div>

                  {/* Scorers / Mete */}
                  <div className="grid grid-cols-2 gap-4 mt-3 text-[11px] font-data">
                    <div className="space-y-0.5 text-right">
                      {userMatch.result.marcatoriCasa.map((m, idx) => (
                        <div key={idx} className="text-[#cbd5e1]">
                          {m.nome} <span className="text-[#10b981] font-semibold">({m.minuto}' Meta)</span>
                        </div>
                      ))}
                      {userMatch.result.marcatoriCasa.length === 0 && (
                        <span className="text-[#475569] italic">Nessuna meta realizzata</span>
                      )}
                    </div>
                    <div className="space-y-0.5 text-left">
                      {userMatch.result.marcatoriOspite.map((m, idx) => (
                        <div key={idx} className="text-[#cbd5e1]">
                          <span className="text-[#10b981] font-semibold">({m.minuto}' Meta)</span> {m.nome}
                        </div>
                      ))}
                      {userMatch.result.marcatoriOspite.length === 0 && (
                        <span className="text-[#475569] italic">Nessuna meta realizzata</span>
                      )}
                    </div>
                  </div>

                  {/* Match Stats Table */}
                  <div className="mt-4 pt-3 border-t border-[#1b2333] grid grid-cols-3 gap-2 text-center font-data text-[11px]">
                    <div className="text-right text-[#38bdf8] font-bold">
                      {userMatch.result.statistiche.possessoCasa}%
                    </div>
                    <div className="text-[#64748b]">Controllo Harpastum</div>
                    <div className="text-left text-[#38bdf8] font-bold">
                      {userMatch.result.statistiche.possessoOspite}%
                    </div>

                    <div className="text-right text-[#cbd5e1] font-bold">
                      {userMatch.result.statistiche.tiriCasa} ({userMatch.result.statistiche.tiriInPortaCasa})
                    </div>
                    <div className="text-[#64748b]">Affondi (Alle Castra)</div>
                    <div className="text-left text-[#cbd5e1] font-bold">
                      {userMatch.result.statistiche.tiriOspite} ({userMatch.result.statistiche.tiriInPortaOspite})
                    </div>

                    <div className="text-right text-[#cbd5e1]">
                      {userMatch.result.statistiche.falliCasa}
                    </div>
                    <div className="text-[#64748b]">Placcaggi Irregolari</div>
                    <div className="text-left text-[#cbd5e1]">
                      {userMatch.result.statistiche.falliOspite}
                    </div>
                  </div>
                </div>
              )}

              {/* Other matchday results */}
              <div>
                <h3 className="font-roman text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  TUTTI GLI AGONI DELLA GIORNATA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allSimulatedMatches.map(({ match, result }) => {
                    const home = clubs[match.clubCasaId];
                    const away = clubs[match.clubOspiteId];
                    const isUserInvolved = match.clubCasaId === userClubId || match.clubOspiteId === userClubId;

                    return (
                      <div
                        key={match.id}
                        className={`flex items-center justify-between p-2.5 retro-inset ${
                          isUserInvolved ? 'border-l-2 border-l-[#d4af37] bg-[#1a2233]' : ''
                        }`}
                      >
                        <span className="font-medium text-[#e2e8f0] truncate w-5/12 text-right pr-2">
                          {home?.nome || match.clubCasaId}
                        </span>
                        <span className="font-data font-bold px-2 py-0.5 bg-[#0a0d14] border border-[#20293d] text-[#d4af37] rounded-xs whitespace-nowrap">
                          {result.golCasa} - {result.golOspite}
                        </span>
                        <span className="font-medium text-[#e2e8f0] truncate w-5/12 text-left pl-2">
                          {away?.nome || match.clubOspiteId}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="retro-panel-header px-4 py-3 flex items-center justify-between border-t border-[#252e42]">
          <div className="text-[11px] text-[#94a3b8] hidden sm:block">
            {activeTab === '2D_ARENA' ? 'Modalità Sensible Harpastum (Vista Tattica)' : 'Archivio Bollettini Impero'}
          </div>
          <RetroButton variant="crimson" size="md" onClick={onClose} className="font-bold uppercase tracking-wider">
            Prosegui al Tabularium &rarr;
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

