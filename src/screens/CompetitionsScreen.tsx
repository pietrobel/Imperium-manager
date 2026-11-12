import React, { useState } from 'react';
import type { CareerSave, Match, MatchResult } from '../types';
import {
  INITIAL_COMPETITIONS,
  getParticipatingClubsForCompetition,
  reconcileCupMatches,
  simulateCupMatch,
  advanceCupBrackets,
  getCupRoundLabel,
  getCupMatchWinnerId
} from '../engines/cupEngine';
import { convertBCToOlympicEra } from '../engines/calendarEngine';
import { resolveMatchKits } from '../engines/kitColorEngine';
import { AthleteJerseyBadge } from '../components/AthleteJerseyBadge';
import { careerRepository } from '../repositories/DexieCareerRepository';
import { audio } from '../services/audioService';
import { Trophy, Shield, Sparkles, ArrowLeft, Swords, CheckCircle2, Eye } from 'lucide-react';
import { RetroButton } from '../components/RetroButton';

interface CompetitionsScreenProps {
  career: CareerSave;
  onUpdateCareer?: (updatedCareer: CareerSave) => void;
  onLaunchCupMatchSimulation?: (payload: {
    simulatedMatches: { match: Match; result: MatchResult }[];
    userMatch?: { match: Match; result: MatchResult };
  }) => void;
  onBack?: () => void;
}

export const CompetitionsScreen: React.FC<CompetitionsScreenProps> = ({
  career,
  onUpdateCareer,
  onLaunchCupMatchSimulation,
  onBack
}) => {
  const competitions = Object.values(INITIAL_COMPETITIONS);
  const [selectedCompId, setSelectedCompId] = useState<string>(competitions[0].id);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentComp = INITIAL_COMPETITIONS[selectedCompId] || competitions[0];
  const participantIds = getParticipatingClubsForCompetition(currentComp.id, career.clubs);
  const participatingClubs = participantIds.map(id => career.clubs[id]).filter(Boolean);
  const era = convertBCToOlympicEra(Math.abs(career.currentYear));

  // Ensure cup matches exist even on older saves
  const allMatchesReconciled = reconcileCupMatches(career.matches, career.clubs, career.currentYear);
  const cupMatches = allMatchesReconciled
    .filter(m => m.competitionId === currentComp.id && m.stagioneAnno === career.currentYear)
    .sort((a, b) => a.giornata - b.giornata);

  // Group cup matches by round (by giornata)
  const roundMatchdays = Array.from(new Set(cupMatches.map(m => m.giornata))).sort((a, b) => a - b);
  const rounds = roundMatchdays.map(gd => {
    const matchesInRound = cupMatches.filter(m => m.giornata === gd);
    const label = getCupRoundLabel(matchesInRound.length * 2);
    return { giornata: gd, label, matches: matchesInRound };
  });

  const activeRound = rounds.find(r => r.matches.some(m => !m.disputata));
  const finaleRound = rounds.find(r => r.matches.length === 1 && r.matches[0].disputata);
  const championClubId = finaleRound ? getCupMatchWinnerId(finaleRound.matches[0]) : null;
  const championClub = championClubId ? career.clubs[championClubId] : null;

  const handleSimulateCurrentRound = () => {
    if (!activeRound || !onUpdateCareer) return;

    const updatedPlayers = { ...career.players };
    let updatedClubs = { ...career.clubs };
    let updatedMatches = allMatchesReconciled.map(m => ({ ...m }));
    const roundSimulated: { match: Match; result: MatchResult }[] = [];
    let userCupMatch: { match: Match; result: MatchResult } | undefined;

    updatedMatches.forEach(m => {
      if (m.competitionId === currentComp.id && m.giornata === activeRound.giornata && !m.disputata) {
        const res = simulateCupMatch(m, updatedClubs, updatedPlayers);
        m.disputata = true;
        m.risultato = res.result;
        const entry = { match: { ...m }, result: res.result };
        roundSimulated.push(entry);
        if (m.clubCasaId === career.userClubId || m.clubOspiteId === career.userClubId) {
          userCupMatch = entry;
        }
      }
    });

    const advancement = advanceCupBrackets(
      updatedMatches,
      updatedClubs,
      career.currentYear,
      career.trofeiAlboDOro || {}
    );
    updatedMatches = advancement.updatedMatches;
    updatedClubs = advancement.updatedClubs;

    const updatedManager = {
      ...career.manager,
      trofeiVinti: [...(career.manager.trofeiVinti || [])]
    };
    for (const champ of advancement.crownedChampions) {
      if (champ.clubId === career.userClubId) {
        const trophyLabel = `${champ.compNome} (${era.displayText})`;
        if (!updatedManager.trofeiVinti.includes(trophyLabel)) {
          updatedManager.trofeiVinti.push(trophyLabel);
        }
        updatedManager.puntiReputazione += 80;
      }
    }

    const nextCareer: CareerSave = {
      ...career,
      clubs: updatedClubs,
      players: updatedPlayers,
      matches: updatedMatches,
      manager: updatedManager,
      trofeiAlboDOro: advancement.updatedAlbo,
      updatedAt: Date.now()
    };

    onUpdateCareer(nextCareer);
    careerRepository.saveCareer(nextCareer);
    audio.playGoal();

    if (onLaunchCupMatchSimulation && roundSimulated.length > 0) {
      onLaunchCupMatchSimulation({
        simulatedMatches: roundSimulated,
        userMatch: userCupMatch
      });
    }

    if (advancement.crownedChampions.length > 0) {
      const c = advancement.crownedChampions[0];
      setFeedback(`${c.clubNome} vince ${c.compNome} e conquista 1.500.000 HS!`);
    } else {
      setFeedback(`${activeRound.label} di ${currentComp.nome.split('(')[0].trim()} disputati!`);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="h-full flex flex-col gap-3 min-h-0 overflow-hidden select-none">
      {/* Competitions Selector Bar */}
      <div className="retro-box p-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-3 shrink-0">
          {onBack && (
            <RetroButton
              variant="secondary"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-1 font-roman text-xs font-bold shrink-0 cursor-pointer border border-[#d4af37]/40 whitespace-nowrap"
            >
              <ArrowLeft size={14} />
              <span>Torna al Tabularium</span>
            </RetroButton>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <Trophy size={18} className="text-[#d4af37]" />
            <div>
              <h1 className="font-roman text-sm font-bold text-white tracking-wide">
                LE GRANDI COPPE DELL'IMPERO · {era.displayText.toUpperCase()}
              </h1>
              <span className="text-[10px] text-[#94a3b8]">
                3 Coppe Internazionali e Coppa Consolare a Eliminazione Diretta
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {competitions.map(c => {
            const isSelected = selectedCompId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompId(c.id)}
                className={`px-3 py-1.5 text-xs font-roman font-bold rounded-xs whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1e2738] text-[#d4af37] border-[#d4af37] shadow-sm'
                    : 'bg-[#111622] text-[#94a3b8] border-[#222b3d] hover:text-white'
                }`}
              >
                {c.nome.split('(')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="bg-[#6b161f] border-2 border-[#d4af37] p-2 text-center text-[#fef08a] font-roman font-bold text-xs tracking-wider shadow-xl rounded-xs shrink-0">
          ⭐ {feedback} ⭐
        </div>
      )}

      {/* Main Competition Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Knockout Bracket & Matches */}
        <div className="lg:col-span-2 retro-box flex flex-col min-h-0 overflow-hidden">
          <div className="retro-panel-header px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#252e42] shrink-0">
            <div>
              <h2 className="font-roman text-xs font-bold tracking-wide text-white flex items-center gap-2">
                <Sparkles size={14} className="text-[#d4af37]" />
                {currentComp.nome.toUpperCase()}
              </h2>
              <span className="text-[10px] text-[#94a3b8] font-roman">
                Regione: {currentComp.regione} · Trofeo: {currentComp.trofeo}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-data text-[#d4af37] font-bold">{era.displayText}</span>
              {activeRound && onUpdateCareer && (
                <RetroButton
                  variant="gold"
                  size="sm"
                  onClick={handleSimulateCurrentRound}
                  className="text-[11px] font-bold flex items-center gap-1"
                >
                  <Swords size={12} />
                  <span>Disputa {activeRound.label}</span>
                </RetroButton>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
          <div className="text-xs text-[#94a3b8] leading-relaxed bg-[#111622] p-2.5 rounded-xs border border-[#232d3f]">
            {currentComp.id === 'cup_munus_caesarum' && (
              <p>
                Il <strong>Munus Caesarum</strong> è la massima competizione continentale dell'antichità: riunisce i 16 campioni e le legioni più gloriose di Roma, Grecia, Cartagine, Egitto, Gallia, Persia, Iberia e Britannia. Chi trionfa riceve l'Alloro d'Oro e l'immortalità sportiva.
              </p>
            )}
            {currentComp.id === 'cup_mare_nostrum' && (
              <p>
                La <strong>Corona Mare Nostrum</strong> vede affrontarsi le grandi potenze marittime del Mediterraneo: le triremi di Tiro, le flotte di Cartagine, Atene, Alessandria, Siracusa e Neapolis per il dominio delle acque sacre.
              </p>
            )}
            {currentComp.id === 'cup_scudo_province' && (
              <p>
                Lo <strong>Scudo delle Province e dei Confini</strong> celebra la forza indomita delle legioni di frontiera e dei popoli guerrieri di Gallia, Britannia, Germania, Dacia, Tracia, Partia e Sarmatia lungo il Vallo e il Danubio.
              </p>
            )}
            {currentComp.id === 'cup_consolare' && (
              <p>
                La <strong>Coppa Consolare di Roma</strong> è la storica contesa nazionale d'Italia e del Lazio istituita dai Consoli della Repubblica per incoronare la legione sferica regina della penisola.
              </p>
            )}
          </div>

          {/* Champion Banner if Finale Completed */}
          {championClub && (
            <div className="p-3 bg-gradient-to-r from-[#422006] via-[#713f12] to-[#422006] border-2 border-[#facc15] rounded-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <Trophy size={22} className="text-[#facc15]" />
                <div>
                  <div className="text-[10px] font-roman uppercase tracking-widest text-[#fef08a]">
                    CAMPIONE INCORONATO ({era.displayText})
                  </div>
                  <div className="font-roman text-sm font-black text-white">
                    {championClub.nome}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-roman text-[#fef08a] font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Albo Ratificato
              </span>
            </div>
          )}

          {/* Knockout Bracket Rounds */}
          <div className="space-y-4 font-data text-xs">
            {rounds.map(round => (
              <div key={round.giornata} className="space-y-2">
                <h3 className="font-roman text-xs font-bold text-[#d4af37] border-b border-[#1b2333] pb-1 flex items-center justify-between">
                  <span>{round.label.toUpperCase()}</span>
                  <span className="text-[10px] text-[#94a3b8] font-sans">
                    Giornata {round.giornata} · {round.matches.filter(m => m.disputata).length}/{round.matches.length} Disputati
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {round.matches.map((matchRecord: Match, idx: number) => {
                    const home = career.clubs[matchRecord.clubCasaId];
                    const away = career.clubs[matchRecord.clubOspiteId];
                    if (!home || !away) return null;

                    const hasResult = matchRecord.disputata && matchRecord.risultato;
                    const winnerId = getCupMatchWinnerId(matchRecord);
                    const isUserMatch = home.id === career.userClubId || away.id === career.userClubId;
                    const kits = resolveMatchKits(home, away);

                    return (
                      <div
                        key={matchRecord.id}
                        className={`retro-inset p-3 border-l-2 transition-colors ${
                          isUserMatch
                            ? 'border-l-[#facc15] bg-[#2b080b] border border-[#d4af37]/50'
                            : 'border-l-[#d4af37] hover:border-l-[#38bdf8]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1.5 font-roman">
                          <span>{round.label.toUpperCase()} {round.matches.length > 1 ? idx + 1 : ''}</span>
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[130px]">Arena {home.stadioNome}</span>
                            {hasResult && onLaunchCupMatchSimulation && (
                              <button
                                type="button"
                                onClick={() =>
                                  onLaunchCupMatchSimulation({
                                    simulatedMatches: [{ match: matchRecord, result: matchRecord.risultato! }],
                                    userMatch: { match: matchRecord, result: matchRecord.risultato! }
                                  })
                                }
                                title="Apri Simulazione 2D e Tabellino"
                                className="text-[#facc15] hover:text-white flex items-center gap-0.5 cursor-pointer"
                              >
                                <Eye size={11} />
                                <span>Agone</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className={`flex justify-between items-center font-semibold ${winnerId === home.id ? 'text-[#facc15]' : 'text-white'}`}>
                          <div className="flex items-center gap-1.5 truncate">
                            <AthleteJerseyBadge
                              primary={kits.homeKit.primary}
                              secondary={kits.homeKit.secondary}
                              outline={kits.homeKit.outline}
                              size="xs"
                            />
                            <span className="truncate">{home.nome}</span>
                          </div>
                          <span className="text-[#d4af37] font-bold text-sm ml-2">
                            {hasResult ? matchRecord.risultato!.golCasa : '-'}
                          </span>
                        </div>

                        <div className={`flex justify-between items-center mt-1 ${winnerId === away.id ? 'text-[#facc15] font-semibold' : 'text-[#cbd5e1]'}`}>
                          <div className="flex items-center gap-1.5 truncate">
                            <AthleteJerseyBadge
                              primary={kits.awayKit.primary}
                              secondary={kits.awayKit.secondary}
                              outline={kits.awayKit.outline}
                              size="xs"
                            />
                            <span className="truncate">{away.nome}</span>
                          </div>
                          <span className="text-[#d4af37] font-bold text-sm ml-2">
                            {hasResult ? matchRecord.risultato!.golOspite : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Right Column: Trophy Details & Participating Clubs List */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Trophy Spotlight Card */}
          <div className="retro-box p-3 shrink-0">
            <div className="flex flex-col items-center justify-center p-3 bg-[#111622] rounded-xs border border-[#232d3f] text-center">
              <div className="w-12 h-12 rounded-full bg-[#1e2738] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] mb-1.5 shadow-inner">
                <Trophy size={22} />
              </div>
              <h3 className="font-roman text-xs font-bold text-white tracking-wide">
                {currentComp.trofeo}
              </h3>
              <span className="text-[11px] text-[#d4af37] font-roman">
                Premio per la Fazione Trionfatrice
              </span>
              <p className="text-[10px] text-[#94a3b8] mt-1.5">
                1.500.000 Sesterzi (HS) in premio cassa, reputazione continentale +50 e iscrizione perenne negli Annali Senatorii.
              </p>
            </div>
          </div>

          {/* Qualified Clubs List */}
          <div className="retro-box p-3 flex flex-col flex-1 min-h-0 overflow-hidden gap-2">
            <div className="flex items-center justify-between border-b border-[#252e42] pb-2 shrink-0">
              <span className="font-roman text-xs font-bold text-white flex items-center gap-1.5">
                <Shield size={14} className="text-[#38bdf8]" />
                FAZIONI PARTECIPANTI ({participatingClubs.length})
              </span>
              <span className="text-[10px] text-[#94a3b8] font-data">Livello 1</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 font-data text-xs">
              {participatingClubs.map(c => (
                <div
                  key={c.id}
                  className={`p-2 rounded-xs border flex items-center justify-between transition-colors ${
                    c.id === career.userClubId
                      ? 'bg-[#3d0b10] border-[#d4af37] text-[#facc15]'
                      : 'bg-[#111622] border-[#1e2738] hover:bg-[#1a2333]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <AthleteJerseyBadge
                      primary={c.colori.primary}
                      secondary={c.colori.secondary}
                      outline="#fef08a"
                      size="xs"
                    />
                    <span className="font-semibold text-white truncate font-sans text-xs">{c.nome}</span>
                  </div>
                  <span className="text-[10px] text-[#facc15] font-bold shrink-0 ml-2">
                    Rep. {c.reputazione}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
