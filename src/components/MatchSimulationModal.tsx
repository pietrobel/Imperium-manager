import React, { useEffect, useMemo, useState } from 'react';
import type { Match, MatchResult, Club, Player } from '../types';
import { RetroButton } from './RetroButton';
import { audio } from '../services/audioService';
import { Harpastum2DSimulator } from './Harpastum2DSimulator';
import { AthleteJerseyBadge } from './AthleteJerseyBadge';
import { resolveMatchKits } from '../engines/kitColorEngine';
import { getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import { Swords, ScrollText, Users } from 'lucide-react';

interface MatchSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToMain?: () => void;
  userMatch?: { match: Match; result: MatchResult };
  allSimulatedMatches: { match: Match; result: MatchResult }[];
  clubs: Record<string, Club>;
  userClubId: string;
  allPlayers?: Record<string, Player>;
}

export const MatchSimulationModal: React.FC<MatchSimulationModalProps> = ({
  isOpen,
  onClose,
  onReturnToMain,
  userMatch,
  allSimulatedMatches,
  clubs,
  userClubId,
  allPlayers = {}
}) => {
  const [activeTab, setActiveTab] = useState<'2D_ARENA' | 'TABELLINO'>(
    userMatch ? '2D_ARENA' : 'TABELLINO'
  );
  const [autoTransitioned, setAutoTransitioned] = useState<boolean>(false);

  const handleCloseModal = () => {
    audio.stopSpeech();
    onClose();
  };

  const handleReturnMain = () => {
    audio.stopSpeech();
    if (onReturnToMain) {
      onReturnToMain();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && !userMatch) {
      audio.playWhistle();
    }
    return () => {
      audio.stopSpeech();
    };
  }, [isOpen, userMatch]);

  const homeClub = userMatch ? clubs[userMatch.match.clubCasaId] : null;
  const awayClub = userMatch ? clubs[userMatch.match.clubOspiteId] : null;

  const resolvedKits = useMemo(() => {
    if (!homeClub || !awayClub) return null;
    return resolveMatchKits(homeClub, awayClub);
  }, [homeClub, awayClub]);

  const { homeRatings, awayRatings } = useMemo(() => {
    if (!userMatch || !homeClub || !awayClub) {
      return { homeRatings: [], awayRatings: [] };
    }
    const ratingsList = Object.values(userMatch.result.pagelle || {}).map(r => ({
      rating: r,
      player: allPlayers[r.playerId]
    }));

    const hList = ratingsList
      .filter(x => x.player?.clubId === homeClub.id)
      .sort((a, b) => b.rating.voto - a.rating.voto)
      .slice(0, 12);

    const aList = ratingsList
      .filter(x => x.player?.clubId === awayClub.id)
      .sort((a, b) => b.rating.voto - a.rating.voto)
      .slice(0, 12);

    return { homeRatings: hList, awayRatings: aList };
  }, [userMatch, homeClub, awayClub, allPlayers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-3 backdrop-blur-xs">
      <div className="retro-box w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95dvh]">
        {/* Header bar */}
        <div className="retro-panel-header px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#252e42] shrink-0">
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

          <RetroButton variant="crimson" size="sm" onClick={handleReturnMain}>
            Torna al Tabularium &rarr;
          </RetroButton>
        </div>

        {/* Content body */}
        <div className="p-2.5 sm:p-3 flex-1 min-h-0 overflow-y-auto space-y-3 text-xs">
          {/* TAB 1: 2D Simulation Arena */}
          {activeTab === '2D_ARENA' && userMatch && homeClub && awayClub ? (
            <div className="space-y-2.5">
              <Harpastum2DSimulator
                userMatch={userMatch}
                homeClub={homeClub}
                awayClub={awayClub}
                allPlayers={allPlayers}
                onSimulationFinished={() => {
                  setAutoTransitioned(true);
                  setActiveTab('TABELLINO');
                }}
              />
              <div className="flex items-center justify-between p-2 retro-inset border border-[#2d3748] bg-[#0c1017]">
                <div className="text-[11px] text-[#94a3b8]">
                  Vuoi esaminare subito il tabellino finale e la classifica del campionato?
                </div>
                <RetroButton
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    audio.playClick();
                    audio.stopSpeech();
                    setActiveTab('TABELLINO');
                  }}
                >
                  <ScrollText className="w-3 h-3 mr-1 inline-block" />
                  Vai al Risultato Finale &rarr;
                </RetroButton>
              </div>
            </div>
          ) : (
            /* TAB 2: Official Result Screen & League Results */
            <>
              {/* User match spotlight */}
              {userMatch && (
                <div className="retro-inset p-4 border border-[#d4af37]/50 relative overflow-hidden">
                  <div className="text-[10px] text-[#d4af37] font-roman uppercase tracking-widest text-center mb-2">
                    {autoTransitioned
                      ? 'RISULTATO FINALE UFFICIALE · ATLETI RIENTRATI NEGLI SPOGLIATOI'
                      : "L'AGONE DEL TUO SODALIZIO · RISULTATO UFFICIALE"}
                  </div>

                  {/* Scoreboard with Club Primary/Secondary/Reserve Jerseys */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#111622] border border-[#232d3f] rounded-xs gap-2">
                    {/* Home */}
                    <div className="flex-1 flex items-center justify-end gap-2.5 text-right">
                      <div>
                        <div className="font-roman text-base font-bold text-[#f8fafc]">
                          {homeClub?.nome || userMatch.match.clubCasaId}
                        </div>
                        <div className="text-[10px] text-[#94a3b8]">
                          {homeClub?.stadioNome} · {resolvedKits?.homeKit.kitLabel}
                        </div>
                      </div>
                      {resolvedKits && (
                        <AthleteJerseyBadge
                          primary={resolvedKits.homeKit.primary}
                          secondary={resolvedKits.homeKit.secondary}
                          outline={resolvedKits.homeKit.outline}
                          textColor={resolvedKits.homeKit.textColor}
                          size="lg"
                          title={`Divisa ${homeClub?.nome}`}
                        />
                      )}
                    </div>

                    {/* Score (Puncta / Mete) */}
                    <div className="px-4 sm:px-6 flex flex-col items-center shrink-0">
                      <div className="flex items-center gap-3 sm:gap-4">
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
                    <div className="flex-1 flex items-center justify-start gap-2.5 text-left">
                      {resolvedKits && (
                        <AthleteJerseyBadge
                          primary={resolvedKits.awayKit.primary}
                          secondary={resolvedKits.awayKit.secondary}
                          outline={resolvedKits.awayKit.outline}
                          textColor={resolvedKits.awayKit.textColor}
                          size="lg"
                          title={`Divisa ${awayClub?.nome}`}
                        />
                      )}
                      <div>
                        <div className="font-roman text-base font-bold text-[#f8fafc]">
                          {awayClub?.nome || userMatch.match.clubOspiteId}
                        </div>
                        <div className={`text-[10px] ${resolvedKits?.awayKit.isReserveKit ? 'text-[#facc15] font-semibold' : 'text-[#94a3b8]'}`}>
                          {awayClub?.citta} · {resolvedKits?.awayKit.kitLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scorers / Mete with team jersey icon */}
                  <div className="grid grid-cols-2 gap-4 mt-3 text-[11px] font-data">
                    <div className="space-y-1 text-right">
                      {userMatch.result.marcatoriCasa.map((m, idx) => (
                        <div key={idx} className="text-[#cbd5e1] flex items-center justify-end gap-1.5">
                          <span>
                            {m.nome} <span className="text-[#10b981] font-semibold">({m.minuto}' Meta)</span>
                          </span>
                          {resolvedKits && (
                            <AthleteJerseyBadge
                              primary={resolvedKits.homeKit.primary}
                              secondary={resolvedKits.homeKit.secondary}
                              outline={resolvedKits.homeKit.outline}
                              size="xs"
                            />
                          )}
                        </div>
                      ))}
                      {userMatch.result.marcatoriCasa.length === 0 && (
                        <span className="text-[#475569] italic">Nessuna meta realizzata</span>
                      )}
                    </div>
                    <div className="space-y-1 text-left">
                      {userMatch.result.marcatoriOspite.map((m, idx) => (
                        <div key={idx} className="text-[#cbd5e1] flex items-center justify-start gap-1.5">
                          {resolvedKits && (
                            <AthleteJerseyBadge
                              primary={resolvedKits.awayKit.primary}
                              secondary={resolvedKits.awayKit.secondary}
                              outline={resolvedKits.awayKit.outline}
                              size="xs"
                            />
                          )}
                          <span>
                            <span className="text-[#10b981] font-semibold">({m.minuto}' Meta)</span> {m.nome}
                          </span>
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

                  {/* Athletes in Resolved Jerseys & Pagelle */}
                  {(homeRatings.length > 0 || awayRatings.length > 0) && resolvedKits && (
                    <div className="mt-4 pt-3 border-t border-[#1b2333] space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-roman text-[#d4af37] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Users size={12} /> ATLETI IN DIVISA &amp; PAGELLE DELL'AGONE
                        </span>
                        <span className="text-[#94a3b8]">Colori ufficiali e di riserva applicati alle coorti</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Home Lineup */}
                        <div className="bg-[#0e131d] border border-[#232d3f] rounded-xs p-2 space-y-1">
                          <div className="text-[10px] font-roman font-bold text-[#facc15] pb-1 border-b border-[#1d2638] flex items-center gap-1.5">
                            <AthleteJerseyBadge
                              primary={resolvedKits.homeKit.primary}
                              secondary={resolvedKits.homeKit.secondary}
                              outline={resolvedKits.homeKit.outline}
                              size="xs"
                            />
                            <span>{homeClub?.nome}</span>
                          </div>
                          {homeRatings.map(({ rating, player }, idx) => {
                            if (!player) return null;
                            const roleBadge = getHarpastumRoleBadgeStyle(player.ruoloPrimario);
                            return (
                              <div key={player.id} className="flex items-center justify-between text-[11px] py-0.5 border-b border-[#161e2e] last:border-b-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <AthleteJerseyBadge
                                    primary={resolvedKits.homeKit.primary}
                                    secondary={resolvedKits.homeKit.secondary}
                                    outline={resolvedKits.homeKit.outline}
                                    textColor={resolvedKits.homeKit.textColor}
                                    number={idx + 1}
                                    size="xs"
                                  />
                                  <span className={`px-1 py-0.2 rounded-xs text-[8px] font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                                    {roleBadge.label}
                                  </span>
                                  <span className="text-white truncate">{player.nome} {player.cognome}</span>
                                </div>
                                <div className="flex items-center gap-2 font-data shrink-0">
                                  {rating.gol > 0 && (
                                    <span className="text-[10px] text-[#10b981] font-bold">+{rating.gol}M</span>
                                  )}
                                  <span className={`font-bold ${rating.voto >= 7 ? 'text-[#facc15]' : 'text-[#cbd5e1]'}`}>
                                    {rating.voto.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Away Lineup */}
                        <div className="bg-[#0e131d] border border-[#232d3f] rounded-xs p-2 space-y-1">
                          <div className="text-[10px] font-roman font-bold text-[#cbd5e1] pb-1 border-b border-[#1d2638] flex items-center gap-1.5">
                            <AthleteJerseyBadge
                              primary={resolvedKits.awayKit.primary}
                              secondary={resolvedKits.awayKit.secondary}
                              outline={resolvedKits.awayKit.outline}
                              size="xs"
                            />
                            <span>{awayClub?.nome}</span>
                            {resolvedKits.awayKit.isReserveKit && (
                              <span className="text-[9px] text-[#facc15] font-normal ml-auto">({resolvedKits.awayKit.kitLabel})</span>
                            )}
                          </div>
                          {awayRatings.map(({ rating, player }, idx) => {
                            if (!player) return null;
                            const roleBadge = getHarpastumRoleBadgeStyle(player.ruoloPrimario);
                            return (
                              <div key={player.id} className="flex items-center justify-between text-[11px] py-0.5 border-b border-[#161e2e] last:border-b-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <AthleteJerseyBadge
                                    primary={resolvedKits.awayKit.primary}
                                    secondary={resolvedKits.awayKit.secondary}
                                    outline={resolvedKits.awayKit.outline}
                                    textColor={resolvedKits.awayKit.textColor}
                                    number={idx + 1}
                                    size="xs"
                                  />
                                  <span className={`px-1 py-0.2 rounded-xs text-[8px] font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                                    {roleBadge.label}
                                  </span>
                                  <span className="text-white truncate">{player.nome} {player.cognome}</span>
                                </div>
                                <div className="flex items-center gap-2 font-data shrink-0">
                                  {rating.gol > 0 && (
                                    <span className="text-[10px] text-[#10b981] font-bold">+{rating.gol}M</span>
                                  )}
                                  <span className={`font-bold ${rating.voto >= 7 ? 'text-[#facc15]' : 'text-[#cbd5e1]'}`}>
                                    {rating.voto.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other matchday results with club jersey badges */}
              <div>
                <h3 className="font-roman text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  TUTTI GLI AGONI DELLA GIORNATA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allSimulatedMatches.map(({ match, result }) => {
                    const home = clubs[match.clubCasaId];
                    const away = clubs[match.clubOspiteId];
                    const kits = home && away ? resolveMatchKits(home, away) : null;
                    const isUserInvolved = match.clubCasaId === userClubId || match.clubOspiteId === userClubId;

                    return (
                      <div
                        key={match.id}
                        className={`flex items-center justify-between p-2.5 retro-inset gap-1.5 ${
                          isUserInvolved ? 'border-l-2 border-l-[#d4af37] bg-[#1a2233]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1.5 w-5/12 min-w-0">
                          <span className="font-medium text-[#e2e8f0] truncate text-right">
                            {home?.nome || match.clubCasaId}
                          </span>
                          {kits && (
                            <AthleteJerseyBadge
                              primary={kits.homeKit.primary}
                              secondary={kits.homeKit.secondary}
                              outline={kits.homeKit.outline}
                              size="xs"
                            />
                          )}
                        </div>
                        <span className="font-data font-bold px-2 py-0.5 bg-[#0a0d14] border border-[#20293d] text-[#d4af37] rounded-xs whitespace-nowrap">
                          {result.golCasa} - {result.golOspite}
                        </span>
                        <div className="flex items-center justify-start gap-1.5 w-5/12 min-w-0">
                          {kits && (
                            <AthleteJerseyBadge
                              primary={kits.awayKit.primary}
                              secondary={kits.awayKit.secondary}
                              outline={kits.awayKit.outline}
                              size="xs"
                            />
                          )}
                          <span className="font-medium text-[#e2e8f0] truncate text-left">
                            {away?.nome || match.clubOspiteId}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="retro-panel-header px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#252e42] shrink-0">
          <div className="text-[11px] text-[#94a3b8] hidden sm:block">
            {activeTab === '2D_ARENA'
              ? 'Arena d’Harpastum 2D (Vista Tattica)'
              : 'Schermata Risultato Ufficiale & Bollettini Impero'}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {activeTab === 'TABELLINO' && userMatch && homeClub && awayClub && (
              <RetroButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAutoTransitioned(false);
                  setActiveTab('2D_ARENA');
                }}
              >
                Rivedi Arena 2D
              </RetroButton>
            )}
            <RetroButton variant="secondary" size="sm" onClick={handleCloseModal}>
              Chiudi
            </RetroButton>
            <RetroButton
              variant="gold"
              size="md"
              onClick={handleReturnMain}
              className="font-bold uppercase tracking-wider"
            >
              Torna alla Schermata Principale &rarr;
            </RetroButton>
          </div>
        </div>
      </div>
    </div>
  );
};

