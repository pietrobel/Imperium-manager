import React, { useState } from 'react';
import type { CareerSave, Match, MatchResult } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { RetroButton } from '../components/RetroButton';
import { AthleteJerseyBadge } from '../components/AthleteJerseyBadge';
import { resolveMatchKits } from '../engines/kitColorEngine';
import { INITIAL_COMPETITIONS } from '../engines/cupEngine';

interface FixturesScreenProps {
  career: CareerSave;
  onInspectMatch?: (match: Match, result: MatchResult) => void;
}

export const FixturesScreen: React.FC<FixturesScreenProps> = ({ career, onInspectMatch }) => {
  const userClub = career.clubs[career.userClubId];
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(
    userClub?.leagueId || 'league_romana'
  );
  const [selectedMatchday, setSelectedMatchday] = useState<number>(career.currentMatchday);

  const isCupCompetition = Boolean(INITIAL_COMPETITIONS[selectedCompetitionId]);
  const compMatches = career.matches.filter(m => m.competitionId === selectedCompetitionId);
  const availableMatchdays = Array.from(new Set(compMatches.map(m => m.giornata))).sort((a, b) => a - b);
  const totalMatchdays = Math.max(...compMatches.map(m => m.giornata), 10);
  const matchesInRound = isCupCompetition
    ? compMatches
    : compMatches.filter(m => m.giornata === selectedMatchday);

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0 overflow-hidden">
      {/* Round & Competition Selector */}
      <div className="retro-box p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#d4af37]" />
          <h1 className="font-roman text-sm font-bold text-white tracking-wide">
            CALENDARIO & RISULTATI UFFICIALI
          </h1>
        </div>

        {/* Competition Selector Dropdown (Leagues + 4 Cups) */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedCompetitionId}
            onChange={e => setSelectedCompetitionId(e.target.value)}
            className="bg-[#111622] border border-[#232d3f] text-[#f8fafc] text-xs font-roman font-bold px-3 py-1 rounded-xs focus:border-[#d4af37] outline-none cursor-pointer"
          >
            <optgroup label="Campionati dell'Impero">
              {Object.values(career.leagues).map(l => (
                <option key={l.id} value={l.id}>
                  {l.nome} ({l.regione})
                </option>
              ))}
            </optgroup>
            <optgroup label="Grandi Coppe a Eliminazione Diretta">
              {Object.values(INITIAL_COMPETITIONS).map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </optgroup>
          </select>

          {userClub && userClub.leagueId !== selectedCompetitionId && (
            <button
              onClick={() => setSelectedCompetitionId(userClub.leagueId)}
              className="px-2 py-1 text-[11px] font-roman text-[#d4af37] bg-[#1e2738] border border-[#d4af37]/40 rounded-xs hover:bg-[#253248] transition-colors cursor-pointer whitespace-nowrap"
            >
              Mio Campionato
            </button>
          )}
        </div>

        {/* Matchday pagination */}
        {!isCupCompetition ? (
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
        ) : (
          <span className="font-roman text-xs font-bold text-[#d4af37] px-2 font-data">
            {availableMatchdays.length} TURNI ATTIVI · ELIMINAZIONE DIRETTA
          </span>
        )}
      </div>

      {/* Fixtures List */}
      <div className="retro-box p-3 flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {matchesInRound.map(match => {
            const home = career.clubs[match.clubCasaId];
            const away = career.clubs[match.clubOspiteId];
            const kits = home && away ? resolveMatchKits(home, away) : null;
            const isUser = match.clubCasaId === career.userClubId || match.clubOspiteId === career.userClubId;

            return (
              <div
                key={match.id}
                className={`retro-inset p-3.5 flex flex-col justify-between ${
                  isUser ? 'border border-[#d4af37]/60 bg-[#161e2e]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-2 font-data border-b border-[#1b2333] pb-1 gap-2">
                  <span className="truncate">
                    {isCupCompetition ? match.dataCalendario : home?.stadioNome}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {match.disputata && match.risultato && onInspectMatch && (
                      <button
                        type="button"
                        onClick={() => onInspectMatch(match, match.risultato!)}
                        className="text-[#facc15] hover:text-white flex items-center gap-0.5 cursor-pointer"
                        title="Apri Tabellino e Arena 2D"
                      >
                        <Eye size={11} />
                        <span>Tabellino</span>
                      </button>
                    )}
                    <span className={match.disputata ? 'text-[#10b981] font-bold' : 'text-[#f59e0b]'}>
                      {match.disputata ? 'FINALE' : isCupCompetition ? `G.${match.giornata}` : 'DA DISPUTARE'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="w-5/12 flex items-center justify-end gap-2 text-right">
                    <div className="min-w-0">
                      <span className={`font-roman text-xs font-bold truncate block ${isUser && match.clubCasaId === career.userClubId ? 'text-[#d4af37]' : 'text-white'}`}>
                        {home?.nome || match.clubCasaId}
                      </span>
                      <span className="text-[10px] text-[#94a3b8]">{home?.citta}</span>
                    </div>
                    {kits && (
                      <AthleteJerseyBadge
                        primary={kits.homeKit.primary}
                        secondary={kits.homeKit.secondary}
                        outline={kits.homeKit.outline}
                        size="sm"
                      />
                    )}
                  </div>

                  <div className="px-2 sm:px-3 shrink-0">
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

                  <div className="w-5/12 flex items-center justify-start gap-2 text-left">
                    {kits && (
                      <AthleteJerseyBadge
                        primary={kits.awayKit.primary}
                        secondary={kits.awayKit.secondary}
                        outline={kits.awayKit.outline}
                        size="sm"
                      />
                    )}
                    <div className="min-w-0">
                      <span className={`font-roman text-xs font-bold truncate block ${isUser && match.clubOspiteId === career.userClubId ? 'text-[#d4af37]' : 'text-white'}`}>
                        {away?.nome || match.clubOspiteId}
                      </span>
                      <span className="text-[10px] text-[#94a3b8]">{away?.citta}</span>
                    </div>
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
