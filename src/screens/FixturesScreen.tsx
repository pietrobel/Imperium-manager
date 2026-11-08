import React, { useState } from 'react';
import type { CareerSave } from '../types';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { RetroButton } from '../components/RetroButton';

interface FixturesScreenProps {
  career: CareerSave;
}

export const FixturesScreen: React.FC<FixturesScreenProps> = ({ career }) => {
  const userClub = career.clubs[career.userClubId];
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(
    userClub?.leagueId || 'league_romana'
  );
  const [selectedMatchday, setSelectedMatchday] = useState<number>(career.currentMatchday);

  const leagueMatches = career.matches.filter(m => m.competitionId === selectedLeagueId);
  const totalMatchdays = Math.max(...leagueMatches.map(m => m.giornata), 10);
  const matchesInRound = leagueMatches.filter(m => m.giornata === selectedMatchday);

  return (
    <div className="space-y-4">
      {/* Round & League Selector */}
      <div className="retro-box p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#d4af37]" />
          <h1 className="font-roman text-sm font-bold text-white tracking-wide">
            CALENDARIO & RISULTATI UFFICIALI
          </h1>
        </div>

        {/* League Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedLeagueId}
            onChange={e => setSelectedLeagueId(e.target.value)}
            className="bg-[#111622] border border-[#232d3f] text-[#f8fafc] text-xs font-roman font-bold px-3 py-1 rounded-xs focus:border-[#d4af37] outline-none cursor-pointer"
          >
            {Object.values(career.leagues).map(l => (
              <option key={l.id} value={l.id}>
                {l.nome} ({l.regione})
              </option>
            ))}
          </select>

          {userClub && userClub.leagueId !== selectedLeagueId && (
            <button
              onClick={() => setSelectedLeagueId(userClub.leagueId)}
              className="px-2 py-1 text-[11px] font-roman text-[#d4af37] bg-[#1e2738] border border-[#d4af37]/40 rounded-xs hover:bg-[#253248] transition-colors cursor-pointer whitespace-nowrap"
            >
              Mio Campionato
            </button>
          )}
        </div>

        {/* Matchday pagination */}
        <div className="flex items-center gap-2">
          <RetroButton
            variant="secondary"
            size="sm"
            disabled={selectedMatchday <= 1}
            onClick={() => setSelectedMatchday(m => Math.max(1, m - 1))}
          >
            <ChevronLeft size={14} />
          </RetroButton>

          <span className="font-roman text-xs font-bold text-[#d4af37] px-2 font-data">
            GIORNATA {selectedMatchday} / {totalMatchdays}
          </span>

          <RetroButton
            variant="secondary"
            size="sm"
            disabled={selectedMatchday >= totalMatchdays}
            onClick={() => setSelectedMatchday(m => Math.min(totalMatchdays, m + 1))}
          >
            <ChevronRight size={14} />
          </RetroButton>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="retro-box p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {matchesInRound.map(match => {
            const home = career.clubs[match.clubCasaId];
            const away = career.clubs[match.clubOspiteId];
            const isUser = match.clubCasaId === career.userClubId || match.clubOspiteId === career.userClubId;

            return (
              <div
                key={match.id}
                className={`retro-inset p-3.5 flex flex-col justify-between ${
                  isUser ? 'border border-[#d4af37]/60 bg-[#161e2e]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-2 font-data border-b border-[#1b2333] pb-1">
                  <span>{home?.stadioNome}</span>
                  <span className={match.disputata ? 'text-[#10b981] font-bold' : 'text-[#f59e0b]'}>
                    {match.disputata ? 'FINALE' : 'DA DISPUTARE'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="w-5/12 text-right">
                    <span className={`font-roman text-xs font-bold truncate block ${isUser && match.clubCasaId === career.userClubId ? 'text-[#d4af37]' : 'text-white'}`}>
                      {home?.nome || match.clubCasaId}
                    </span>
                    <span className="text-[10px] text-[#94a3b8]">{home?.citta}</span>
                  </div>

                  <div className="px-3">
                    {match.disputata && match.risultato ? (
                      <span className="font-data font-black text-lg text-[#d4af37] bg-[#0a0d14] px-3 py-1 border border-[#20293d] rounded-xs">
                        {match.risultato.golCasa} - {match.risultato.golOspite}
                      </span>
                    ) : (
                      <span className="font-data text-xs text-[#64748b] bg-[#0a0d14] px-2.5 py-1 border border-[#1b2333] rounded-xs">
                        vs
                      </span>
                    )}
                  </div>

                  <div className="w-5/12 text-left">
                    <span className={`font-roman text-xs font-bold truncate block ${isUser && match.clubOspiteId === career.userClubId ? 'text-[#d4af37]' : 'text-white'}`}>
                      {away?.nome || match.clubOspiteId}
                    </span>
                    <span className="text-[10px] text-[#94a3b8]">{away?.citta}</span>
                  </div>
                </div>

                {/* Scorers if played */}
                {match.disputata && match.risultato && (
                  <div className="mt-2 pt-2 border-t border-[#1b2333] grid grid-cols-2 gap-2 text-[10px] font-data text-[#94a3b8]">
                    <div className="text-right">
                      {match.risultato.marcatoriCasa.map((m, i) => (
                        <div key={i}>
                          {m.nome} <span className="text-[#10b981]">({m.minuto}')</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-left">
                      {match.risultato.marcatoriOspite.map((m, i) => (
                        <div key={i}>
                          <span className="text-[#10b981]">({m.minuto}')</span> {m.nome}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {matchesInRound.length === 0 && (
          <div className="py-12 text-center text-[#94a3b8] italic">
            Nessun incontro programmato per la giornata selezionata.
          </div>
        )}
      </div>
    </div>
  );
};
