import React, { useState } from 'react';
import type { CareerSave, NationalTeam, Player, Club, Match, MatchResult } from '../types';
import { RetroButton } from '../components/RetroButton';
import { AthleteJerseyBadge } from '../components/AthleteJerseyBadge';
import { careerRepository } from '../repositories/DexieCareerRepository';
import { OFFICIAL_NATIONAL_CIVILIZATIONS, simulateNationalMatch, generateNationalMatches } from '../engines/nationalTeamsEngine';
import { simulateMatch } from '../engines/matchSimulationEngine';
import { resolveMatchKits } from '../engines/kitColorEngine';
import { getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import { audio } from '../services/audioService';
import { Flag, Trophy, Users, Swords, RefreshCw, Eye } from 'lucide-react';

interface NationalTeamsScreenProps {
  career: CareerSave;
  onUpdateCareer?: (updatedCareer: CareerSave) => void;
  onSelectPlayer: (player: Player) => void;
  onLaunchNationalMatchSimulation?: (payload: {
    simulatedMatches: { match: Match; result: MatchResult }[];
    userMatch?: { match: Match; result: MatchResult };
    clubsOverride?: Record<string, Club>;
    playersOverride?: Record<string, Player>;
  }) => void;
}

function buildVirtualNationalClub(team: NationalTeam): Club {
  const convocati = team.giocatoriConvocatiIds || [];
  return {
    id: team.id,
    nome: team.nome,
    sigla: team.sigla,
    citta: team.regione,
    regione: team.regione,
    stadioNome: `Arena di ${team.regione.split('&')[0].trim()}`,
    stadioCapienza: 45000,
    leagueId: 'certamen_nationum',
    reputazione: team.reputazione,
    saldoCassa: 0,
    budgetTrasferimenti: 0,
    budgetStipendi: 0,
    formazioneTattica: '4-4-2',
    allenatoreNome: team.commissarioTecnico || 'Praefectus Legionis',
    isUserControlled: false,
    colori: {
      primary: team.stemmaColore,
      secondary: '#d4af37',
      text: '#ffffff',
      reservePrimary: '#f8fafc',
      reserveSecondary: team.stemmaColore
    },
    titolariIds: convocati.slice(0, 12),
    panchinaIds: convocati.slice(12),
    storiaTrofei: team.trofeiVinti || [],
    storicoCampionati: []
  };
}

export const NationalTeamsScreen: React.FC<NationalTeamsScreenProps> = ({
  career,
  onUpdateCareer,
  onSelectPlayer,
  onLaunchNationalMatchSimulation
}) => {
  const nationalTeams = career.nationalTeams || {};
  const nationalMatches = career.nationalMatches || [];

  const [selectedNatId, setSelectedNatId] = useState<string>('nat_roma');
  const [activeTab, setActiveTab] = useState<'ROSA' | 'TORNEO' | 'ALBO'>('ROSA');

  const selectedTeam = nationalTeams[selectedNatId] || Object.values(nationalTeams)[0];
  const selectedCivInfo = OFFICIAL_NATIONAL_CIVILIZATIONS.find(c => c.id === selectedNatId) || OFFICIAL_NATIONAL_CIVILIZATIONS[0];

  const convocatiPlayers = (selectedTeam?.giocatoriConvocatiIds || [])
    .map(id => career.players[id])
    .filter(Boolean);

  const persistNationalUpdate = (updatedTeams: Record<string, NationalTeam>, updatedMatches: typeof nationalMatches) => {
    if (!onUpdateCareer) return;
    const nextCareer: CareerSave = {
      ...career,
      nationalTeams: updatedTeams,
      nationalMatches: updatedMatches,
      updatedAt: Date.now()
    };
    onUpdateCareer(nextCareer);
    careerRepository.saveCareer(nextCareer);
  };

  const handleSimulateMatch = (matchId: string) => {
    const matchIndex = nationalMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    const match = nationalMatches[matchIndex];
    if (match.disputata) return;

    const clonedTeams: Record<string, NationalTeam> = JSON.parse(JSON.stringify(nationalTeams));
    const res = simulateNationalMatch(match, clonedTeams, career.players);
    const updatedMatches = [...nationalMatches];
    updatedMatches[matchIndex] = res;
    persistNationalUpdate(clonedTeams, updatedMatches);
  };

  const handleSimulateAllPending = () => {
    const clonedTeams: Record<string, NationalTeam> = JSON.parse(JSON.stringify(nationalTeams));
    const updatedMatches = nationalMatches.map(m =>
      m.disputata ? m : simulateNationalMatch(m, clonedTeams, career.players)
    );
    persistNationalUpdate(clonedTeams, updatedMatches);
  };

  const handleNewNationalEdition = () => {
    const freshMatches = generateNationalMatches(Math.abs(career.currentYear));
    persistNationalUpdate(nationalTeams, freshMatches);
  };

  const handleLaunchMatch2D = (matchId: string) => {
    if (!onLaunchNationalMatchSimulation) return;
    const matchIndex = nationalMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    const match = nationalMatches[matchIndex];
    if (match.disputata) return;

    const clonedTeams: Record<string, NationalTeam> = JSON.parse(JSON.stringify(nationalTeams));
    const homeTeam = clonedTeams[match.nazionaleCasaId];
    const awayTeam = clonedTeams[match.nazionaleOspiteId];
    if (!homeTeam || !awayTeam) return;

    const homeClub = buildVirtualNationalClub(homeTeam);
    const awayClub = buildVirtualNationalClub(awayTeam);

    const playersOverride: Record<string, Player> = {};
    for (const pid of homeTeam.giocatoriConvocatiIds || []) {
      const p = career.players[pid];
      if (p) playersOverride[pid] = { ...p, clubId: homeClub.id };
    }
    for (const pid of awayTeam.giocatoriConvocatiIds || []) {
      const p = career.players[pid];
      if (p) playersOverride[pid] = { ...p, clubId: awayClub.id };
    }

    const simRes = simulateMatch({
      homeClub,
      awayClub,
      allPlayers: playersOverride,
      competitionName: match.torneo
    });

    const winnerTeamId = simRes.golCasa >= simRes.golOspite ? homeClub.id : awayClub.id;
    const ratingsList = Object.values(simRes.pagelle || {})
      .filter(r => playersOverride[r.playerId]?.clubId === winnerTeamId)
      .sort((a, b) => b.voto - a.voto);
    const topPlayer = ratingsList[0] ? playersOverride[ratingsList[0].playerId] : null;
    const mvpName = topPlayer
      ? `${topPlayer.nome} ${topPlayer.cognome}`
      : simRes.marcatoriCasa[0]?.nome || simRes.marcatoriOspite[0]?.nome || 'Praeveniens Primus';

    homeTeam.partiteGiocate += 1;
    awayTeam.partiteGiocate += 1;
    if (simRes.golCasa > simRes.golOspite) {
      homeTeam.vittorie += 1;
      awayTeam.sconfitte += 1;
    } else if (simRes.golOspite > simRes.golCasa) {
      awayTeam.vittorie += 1;
      homeTeam.sconfitte += 1;
    } else {
      homeTeam.pareggi += 1;
      awayTeam.pareggi += 1;
    }

    const updatedMatches = [...nationalMatches];
    updatedMatches[matchIndex] = {
      ...match,
      disputata: true,
      meteCasa: simRes.golCasa,
      meteOspite: simRes.golOspite,
      migliorAtleta: mvpName
    };
    persistNationalUpdate(clonedTeams, updatedMatches);
    audio.playClick();

    const syntheticMatch: Match = {
      id: match.id,
      competitionId: 'certamen_nationum',
      competitionType: 'CUP',
      stagioneAnno: match.stagioneAnno,
      giornata: 1,
      dataCalendario: match.dataCalendario,
      dataNumero: matchIndex + 1,
      clubCasaId: homeClub.id,
      clubOspiteId: awayClub.id,
      disputata: true,
      risultato: simRes
    };

    onLaunchNationalMatchSimulation({
      simulatedMatches: [{ match: syntheticMatch, result: simRes }],
      userMatch: { match: syntheticMatch, result: simRes },
      clubsOverride: {
        [homeClub.id]: homeClub,
        [awayClub.id]: awayClub
      },
      playersOverride
    });
  };

  const hasPendingMatches = nationalMatches.some(m => !m.disputata);

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0 overflow-hidden">
      {/* Header Panel */}
      <div className="retro-box p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#521118] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow">
            <Flag size={20} />
          </div>
          <div>
            <h1 className="font-roman text-sm font-bold text-white tracking-wide">
              CERTAMEN NATIONUM · LE 16 GRANDI NAZIONALI DELL'ANTICHITÀ
            </h1>
            <span className="text-[10px] text-[#cbd5e1] font-roman">
              Convocazioni dei migliori atleti delle civiltà del Mediterraneo & Torneo delle Nazioni
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#2b080b] p-0.5 border border-[#521016] rounded-xs text-xs font-roman">
          <button
            onClick={() => setActiveTab('ROSA')}
            className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ROSA' ? 'bg-[#6b161f] text-[#facc15] shadow-xs' : 'text-[#cbd5e1] hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Convocati ({convocatiPlayers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('TORNEO')}
            className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TORNEO' ? 'bg-[#6b161f] text-[#facc15] shadow-xs' : 'text-[#cbd5e1] hover:text-white'
            }`}
          >
            <Swords size={13} />
            <span>Torneo delle Nazioni</span>
          </button>
          <button
            onClick={() => setActiveTab('ALBO')}
            className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALBO' ? 'bg-[#6b161f] text-[#facc15] shadow-xs' : 'text-[#cbd5e1] hover:text-white'
            }`}
          >
            <Trophy size={13} />
            <span>Tavola & Reputazione</span>
          </button>
        </div>
      </div>

      {/* Nation Selector Carousel */}
      <div className="retro-box p-2 overflow-x-auto flex items-center gap-1.5 shrink-0">
        <span className="font-roman text-[10px] text-[#d4af37] font-bold shrink-0 uppercase mr-1">
          NAZIONALI:
        </span>
        {OFFICIAL_NATIONAL_CIVILIZATIONS.map(civ => {
          const isSelected = civ.id === selectedNatId;
          return (
            <button
              key={civ.id}
              onClick={() => setSelectedNatId(civ.id)}
              className={`px-3 py-1.5 rounded-xs text-xs font-roman font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#63141c] text-[#facc15] border-[#d4af37] shadow-md scale-102'
                  : 'bg-[#2b080b] text-[#cbd5e1] border-[#521016] hover:text-white hover:border-[#731922]'
              }`}
            >
              <AthleteJerseyBadge
                primary={civ.stemmaColore}
                secondary="#d4af37"
                outline="#fef08a"
                size="xs"
              />
              <span>{civ.sigla}</span>
              <span className="text-[10px] font-normal text-[#94a3b8]">({civ.nome.split(' ')[1] || civ.nome})</span>
            </button>
          );
        })}
      </div>

      {/* Main View Content */}
      {activeTab === 'ROSA' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch overflow-hidden">
          {/* Nation Dossier & Banner */}
          <div className="retro-box p-3 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="pb-3 border-b border-[#731922] mb-3">
                <div className="flex items-center gap-2.5">
                  <AthleteJerseyBadge
                    primary={selectedCivInfo.stemmaColore}
                    secondary="#d4af37"
                    outline="#fef08a"
                    size="md"
                    title={`Tunica Nazionale ${selectedTeam?.nome}`}
                  />
                  <h2 className="font-roman text-sm font-black text-[#d4af37]">
                    {selectedTeam?.nome.toUpperCase()}
                  </h2>
                </div>
                <div className="text-[11px] text-[#cbd5e1] font-roman mt-1">
                  Regione: <strong className="text-white">{selectedTeam?.regione}</strong> · Cultura: <strong className="text-[#facc15]">{selectedTeam?.cultura}</strong>
                </div>
              </div>

              <div className="retro-inset p-3 mb-3 text-xs leading-relaxed text-[#cbd5e1]">
                <span className="font-roman text-[#d4af37] font-bold block mb-1">TRADIZIONE ATLETICA</span>
                {selectedCivInfo.descrizione}
              </div>

              <div className="space-y-2 text-xs font-data">
                <div className="flex justify-between py-1 border-b border-[#521016]">
                  <span className="text-[#94a3b8]">Commissario Tecnico:</span>
                  <span className="text-white font-roman font-bold">{selectedTeam?.commissarioTecnico || 'Praefectus Legionis'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#521016]">
                  <span className="text-[#94a3b8]">Reputazione Mondiale:</span>
                  <span className="text-[#facc15] font-bold">{selectedTeam?.reputazione} pt</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#521016]">
                  <span className="text-[#94a3b8]">Palmarès Storico:</span>
                  <span className="text-[#10b981] font-bold">{selectedTeam?.trofeiVinti?.length || 0} Trionfi</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94a3b8]">Bilancio Agoni:</span>
                  <span className="text-white">
                    {selectedTeam?.vittorie}V - {selectedTeam?.pareggi}P - {selectedTeam?.sconfitte}S
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#731922] text-[10px] text-[#94a3b8] text-center font-roman">
              I migliori 18 atleti convocati in base al valore generale nell'Impero
            </div>
          </div>

          {/* Call-up Roster Table */}
          <div className="lg:col-span-2 retro-box flex flex-col min-h-0 overflow-hidden">
            <div className="retro-panel-header px-4 py-2 flex items-center justify-between border-b border-[#731922] shrink-0">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#d4af37]" />
                <h3 className="font-roman text-xs font-bold text-white tracking-wide">
                  I 18 CONVOCATI DELLA SELEZIONE NAZIONALE
                </h3>
              </div>
              <span className="text-xs font-data text-[#facc15] font-bold">
                OVR Medio: {convocatiPlayers.length > 0 ? Math.round(convocatiPlayers.reduce((s, p) => s + p.valoreGenerale, 0) / convocatiPlayers.length) : '-'}
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-left text-xs border-collapse font-data">
                <thead>
                  <tr className="text-[10px] text-[#cbd5e1] uppercase font-roman border-b border-[#521016] bg-[#2b080b]">
                    <th className="py-2 px-3 text-center">RUO</th>
                    <th className="py-2 px-3">ATLETA</th>
                    <th className="py-2 px-2 text-center">ETÀ</th>
                    <th className="py-2 px-3">CLUB DI PROVENIENZA</th>
                    <th className="py-2 px-2 text-center">OVR</th>
                    <th className="py-2 px-2 text-center">METE</th>
                    <th className="py-2 px-3 text-center">AZIONI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#420d11] text-xs">
                  {convocatiPlayers.map(p => {
                    const badge = getHarpastumRoleBadgeStyle(p.ruoloPrimario);
                    const club = p.clubId ? career.clubs[p.clubId] : null;
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[#3d0b10] transition-colors cursor-pointer group"
                        onClick={() => onSelectPlayer(p)}
                      >
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <div className="font-semibold text-white group-hover:text-[#facc15]">
                            {p.nome} {p.cognome}
                          </div>
                          <div className="text-[10px] text-[#94a3b8] font-roman">
                            {p.nazionalita}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center text-[#cbd5e1]">{p.eta}</td>
                        <td className="py-2 px-3 text-[#cbd5e1] font-roman text-[11px]">
                          {club ? club.nome : 'Atleta Libero'}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-[#facc15] text-sm">
                          {p.valoreGenerale}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-[#38bdf8]">
                          {p.statisticheStagione.gol}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[10px] text-[#d4af37] group-hover:underline">Dossier &rarr;</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Torneo delle Nazioni (Fixtures) */}
      {activeTab === 'TORNEO' && (
        <div className="flex-1 min-h-0 retro-box p-3 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#731922] mb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-[#d4af37]" />
                <h2 className="font-roman text-xs font-bold text-white tracking-wide">
                  CERTAMEN NATIONUM · PROGRAMMA UFFICIALE DEGLI SCONTRI
                </h2>
              </div>
              {onUpdateCareer && (
                hasPendingMatches ? (
                  <RetroButton
                    variant="gold"
                    size="sm"
                    onClick={handleSimulateAllPending}
                    className="text-[11px] font-bold"
                  >
                    Simula Tutti gli Agoni &rarr;
                  </RetroButton>
                ) : (
                  <RetroButton
                    variant="secondary"
                    size="sm"
                    onClick={handleNewNationalEdition}
                    className="text-[11px] font-bold flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Nuova Edizione Certamen</span>
                  </RetroButton>
                )
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2.5 font-data pr-0.5">
              {nationalMatches.map(m => {
                const home = nationalTeams[m.nazionaleCasaId];
                const away = nationalTeams[m.nazionaleOspiteId];
                const homeVClub = home ? buildVirtualNationalClub(home) : null;
                const awayVClub = away ? buildVirtualNationalClub(away) : null;
                const kits = homeVClub && awayVClub ? resolveMatchKits(homeVClub, awayVClub) : null;
                return (
                  <div key={m.id} className="retro-inset p-3 border border-[#521016] flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#cbd5e1] font-roman">
                      <span className="text-[#facc15] font-bold">{m.torneo}</span>
                      <span>{m.dataCalendario}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 py-1">
                      <div className="flex-1 flex items-center justify-end gap-2 text-right min-w-0">
                        <div className="min-w-0">
                          <div className="font-roman font-bold text-sm text-white truncate">{home?.nome || m.nazionaleCasaId}</div>
                          <span className="text-[10px] text-[#94a3b8]">{home?.sigla}</span>
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

                      <div className="px-3 py-1 bg-[#2b080b] border border-[#d4af37] rounded-xs text-center font-bold text-base min-w-[70px] shrink-0">
                        {m.disputata ? (
                          <span className="text-[#facc15]">{m.meteCasa} - {m.meteOspite}</span>
                        ) : (
                          <span className="text-[#cbd5e1] text-xs">VS</span>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-start gap-2 text-left min-w-0">
                        {kits && (
                          <AthleteJerseyBadge
                            primary={kits.awayKit.primary}
                            secondary={kits.awayKit.secondary}
                            outline={kits.awayKit.outline}
                            size="sm"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="font-roman font-bold text-sm text-white truncate">{away?.nome || m.nazionaleOspiteId}</div>
                          <span className="text-[10px] text-[#94a3b8]">
                            {away?.sigla}{kits?.awayKit.isReserveKit ? ' · Riserva' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[10px] pt-1 border-t border-[#420d11]">
                      <span className="text-[#94a3b8] truncate">
                        {m.disputata ? `Miglior Incursore: ${m.migliorAtleta}` : 'In attesa di disputa'}
                      </span>
                      {!m.disputata ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {onLaunchNationalMatchSimulation && (
                            <button
                              onClick={() => handleLaunchMatch2D(m.id)}
                              className="px-2 py-1 bg-[#0c4a6e] hover:bg-[#0369a1] text-[#fef08a] font-roman font-bold rounded-xs cursor-pointer border border-[#38bdf8]/60 flex items-center gap-1"
                            >
                              <Eye size={11} />
                              <span>Arena 2D</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleSimulateMatch(m.id)}
                            className="px-2 py-1 bg-[#63141c] hover:bg-[#85222b] text-[#facc15] font-roman font-bold rounded-xs cursor-pointer border border-[#d4af37]"
                          >
                            Simula Agone
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#10b981] font-bold shrink-0">OMOLOGATO</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      )}

      {/* Tavola & Reputazione */}
      {activeTab === 'ALBO' && (
        <div className="flex-1 min-h-0 retro-box flex flex-col overflow-hidden">
          <div className="retro-panel-header px-4 py-2 flex items-center gap-2 border-b border-[#731922] shrink-0">
            <Trophy size={14} className="text-[#d4af37]" />
            <h2 className="font-roman text-xs font-bold text-white tracking-wide">
              GERARCHIA DELLE CIVILTÀ · CLASSIFICA MONDIALE DELLE NAZIONALI
            </h2>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-left text-xs border-collapse font-data">
              <thead>
                <tr className="text-[10px] text-[#cbd5e1] uppercase font-roman border-b border-[#521016] bg-[#2b080b]">
                  <th className="py-2 px-3 text-center">RKG</th>
                  <th className="py-2 px-3">NAZIONALE</th>
                  <th className="py-2 px-3">CULTURA & ORIGINE</th>
                  <th className="py-2 px-2 text-center">PG</th>
                  <th className="py-2 px-2 text-center">V</th>
                  <th className="py-2 px-2 text-center">P</th>
                  <th className="py-2 px-2 text-center">S</th>
                  <th className="py-2 px-3 text-right">REPUTAZIONE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#420d11] text-xs">
                {OFFICIAL_NATIONAL_CIVILIZATIONS
                  .slice()
                  .sort((a, b) => {
                    const ta = nationalTeams[a.id];
                    const tb = nationalTeams[b.id];
                    const ptsA = (ta?.vittorie || 0) * 3 + (ta?.pareggi || 0);
                    const ptsB = (tb?.vittorie || 0) * 3 + (tb?.pareggi || 0);
                    if (ptsB !== ptsA) return ptsB - ptsA;
                    return b.reputazione - a.reputazione;
                  })
                  .map((civ, idx) => {
                    const team = nationalTeams[civ.id];
                    return (
                      <tr
                        key={civ.id}
                        onClick={() => {
                          setSelectedNatId(civ.id);
                          setActiveTab('ROSA');
                        }}
                        className="hover:bg-[#3d0b10] transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-[#facc15]">#{idx + 1}</td>
                        <td className="py-2.5 px-3 font-roman font-bold text-white flex items-center gap-2">
                          <AthleteJerseyBadge
                            primary={civ.stemmaColore}
                            secondary="#d4af37"
                            outline="#fef08a"
                            size="xs"
                          />
                          <span>{civ.nome}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#cbd5e1] font-sans">{civ.cultura}</td>
                        <td className="py-2.5 px-2 text-center text-white">{team?.partiteGiocate || 0}</td>
                        <td className="py-2.5 px-2 text-center text-[#10b981] font-bold">{team?.vittorie || 0}</td>
                        <td className="py-2.5 px-2 text-center text-[#cbd5e1]">{team?.pareggi || 0}</td>
                        <td className="py-2.5 px-2 text-center text-[#f87171]">{team?.sconfitte || 0}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#d4af37]">{civ.reputazione} pt</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
