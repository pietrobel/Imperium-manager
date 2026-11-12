import type { CareerSave, Club, Player, Match, League } from '../types';
import { calculateLeagueTable, generateLeagueFixtures } from './leagueEngine';
import { createDeterministicPlayer, mulberry32, stringToSeed } from './playerDatabaseEngine';
import { getRomanDateString, convertBCToOlympicEra } from './calendarEngine';
import { executePromotionAndRelegation, type PromotionRelegationMovement } from './promotionRelegationEngine';
import { initializeAllCupMatches } from './cupEngine';
import { refreshNationalTeamsRosters, generateNationalMatches } from './nationalTeamsEngine';

export interface UserSeasonSummary {
  clubId: string;
  clubNome: string;
  leagueId: string;
  leagueName: string;
  posizione: number;
  totalTeams: number;
  punti: number;
  golFatti: number;
  golSubiti: number;
  outcome: 'CHAMPION' | 'PROMOTED' | 'RELEGATED' | 'STAYED';
  prizeHS: number;
  reputationDelta: number;
  trophyLabel?: string;
  topScorer?: { nome: string; cognome: string; gol: number };
}

export interface SeasonEndReport {
  seasonYear: number;
  eraDisplayText: string;
  nextEraDisplayText: string;
  nextConsuls: string;
  leagueChampions: { leagueId: string; leagueName: string; championClubId: string; championClubNome: string }[];
  retiredPlayers: { playerId: string; clubId: string; nome: string; cognome: string; clubNome: string; eta: number; presenzeTotali: number }[];
  youthPromoted: { playerId: string; clubId: string; nome: string; cognome: string; clubNome: string; eta: number; ovr: number; pot: number }[];
  movements: PromotionRelegationMovement[];
  userSummary?: UserSeasonSummary;
  capocannoniereImperiale?: { nome: string; cognome: string; clubNome: string; gol: number };
}

/**
 * Checks if the current season has finished all scheduled matchdays (e.g. 30 matchdays for 15-team leagues).
 */
export function isSeasonFinished(career: CareerSave): boolean {
  return career.currentMatchday > 30;
}

/**
 * Processes full season-end transition:
 * 1. Crowns champions and updates Albo d'Oro + Manager trophies.
 * 2. Executes Promotions and Relegations across all 15 regional pyramid circuits.
 * 3. Retires aging veteran gladiators (eta >= 33).
 * 4. Generates fresh youth prospects (17-19 yo) to replenish rosters.
 * 5. Advances calendar year (e.g. -50 to -49, which is 49 a.C.).
 * 6. Generates new round-robin league schedules for the new season.
 */
export function processSeasonEndTransition(
  career: CareerSave
): { updatedCareer: CareerSave; report: SeasonEndReport } {
  const currentYear = career.currentYear;
  const nextYear = currentYear + 1; // e.g. -50 + 1 = -49
  const oldEra = convertBCToOlympicEra(currentYear);
  const nextEra = convertBCToOlympicEra(nextYear);

  let updatedClubs = JSON.parse(JSON.stringify(career.clubs)) as Record<string, Club>;
  const updatedPlayers = JSON.parse(JSON.stringify(career.players)) as Record<string, Player>;
  let updatedLeagues = JSON.parse(JSON.stringify(career.leagues)) as Record<string, League>;
  const updatedAlbo = { ...(career.trofeiAlboDOro || {}) };
  const updatedManager = career.manager
    ? {
        ...career.manager,
        trofeiVinti: [...(career.manager.trofeiVinti || [])]
      }
    : undefined;

  const leagueChampions: SeasonEndReport['leagueChampions'] = [];
  const retiredPlayers: SeasonEndReport['retiredPlayers'] = [];
  const youthPromoted: SeasonEndReport['youthPromoted'] = [];

  const championsByClubId = new Map<string, string[]>();

  let userLeagueStats:
    | {
        clubId: string;
        clubNome: string;
        leagueId: string;
        leagueName: string;
        posizione: number;
        totalTeams: number;
        punti: number;
        golFatti: number;
        golSubiti: number;
        trophyLabel?: string;
      }
    | undefined;

  // 1. Determine Champions for each league & archive ClubHistoryEntry
  for (const league of Object.values(updatedLeagues)) {
    const table = calculateLeagueTable(league.id, updatedClubs, career.matches);

    table.forEach((row, idx) => {
      const clubRef = updatedClubs[row.clubId];
      if (!clubRef) return;
      const seasonTrophies: string[] = [];
      const trophyLabel = `${league.nome} (${oldEra.displayText})`;
      if (idx === 0) {
        seasonTrophies.push(trophyLabel);
      }
      clubRef.storicoCampionati = clubRef.storicoCampionati || [];
      clubRef.storicoCampionati.push({
        seasonYear: currentYear,
        leagueId: league.id,
        posizione: idx + 1,
        punti: row.punti,
        golFatti: row.golFatti,
        golSubiti: row.golSubiti,
        trofei: seasonTrophies
      });

      if (career.userClubId && row.clubId === career.userClubId) {
        userLeagueStats = {
          clubId: clubRef.id,
          clubNome: clubRef.nome,
          leagueId: league.id,
          leagueName: league.nome,
          posizione: idx + 1,
          totalTeams: table.length,
          punti: row.punti,
          golFatti: row.golFatti,
          golSubiti: row.golSubiti,
          trophyLabel: idx === 0 ? trophyLabel : undefined
        };
      }
    });

    if (table.length > 0) {
      const winner = table[0];
      const champClub = updatedClubs[winner.clubId];
      if (champClub) {
        const trophyLabel = `${league.nome} (${oldEra.displayText})`;
        champClub.storiaTrofei = champClub.storiaTrofei || [];
        champClub.storiaTrofei.push(trophyLabel);
        champClub.saldoCassa += 2000000; // Prize money: 2M HS
        champClub.budgetTrasferimenti += 1500000;
        champClub.reputazione = Math.min(1000, champClub.reputazione + 40);

        championsByClubId.set(champClub.id, [
          ...(championsByClubId.get(champClub.id) || []),
          trophyLabel
        ]);

        if (updatedManager && career.userClubId && champClub.id === career.userClubId) {
          if (!updatedManager.trofeiVinti.includes(trophyLabel)) {
            updatedManager.trofeiVinti.push(trophyLabel);
          }
          updatedManager.puntiReputazione += 120;
        }

        leagueChampions.push({
          leagueId: league.id,
          leagueName: league.nome,
          championClubId: champClub.id,
          championClubNome: champClub.nome
        });

        // Record in Albo d'Oro
        updatedAlbo[league.id] = updatedAlbo[league.id] || [];
        updatedAlbo[league.id].push({
          anno: Math.abs(currentYear),
          vincitoreNome: champClub.nome
        });
      }
    }
  }

  // 2. Execute Promotions and Relegations across all 15 regional pyramid circuits
  const { updatedLeagues: postMoveLeagues, updatedClubs: postMoveClubs, movements } =
    executePromotionAndRelegation(updatedLeagues, updatedClubs, career.matches);

  updatedLeagues = postMoveLeagues;
  updatedClubs = postMoveClubs;

  // Apply user club promotion/relegation reputation impact & track user outcome
  let userSummary: UserSeasonSummary | undefined;
  if (userLeagueStats) {
    const userMovement = movements.find(m => m.clubId === userLeagueStats!.clubId);
    const isChamp = Boolean(userLeagueStats.trophyLabel);
    let outcome: UserSeasonSummary['outcome'] = 'STAYED';
    let prizeHS = isChamp ? 2000000 : 0;
    let reputationDelta = isChamp ? 120 : 0;

    if (userMovement?.type === 'PROMOTION') {
      outcome = isChamp ? 'CHAMPION' : 'PROMOTED';
      prizeHS += 1000000;
      const promoRepBoost = 60;
      reputationDelta += promoRepBoost;
      if (updatedManager) {
        updatedManager.puntiReputazione += promoRepBoost;
      }
      if (updatedClubs[userLeagueStats.clubId]) {
        updatedClubs[userLeagueStats.clubId].reputazione = Math.min(
          1000,
          updatedClubs[userLeagueStats.clubId].reputazione + 25
        );
      }
    } else if (userMovement?.type === 'RELEGATION') {
      outcome = 'RELEGATED';
      reputationDelta -= 35;
      if (updatedManager) {
        updatedManager.puntiReputazione = Math.max(100, updatedManager.puntiReputazione - 35);
      }
      if (updatedClubs[userLeagueStats.clubId]) {
        updatedClubs[userLeagueStats.clubId].reputazione = Math.max(
          150,
          updatedClubs[userLeagueStats.clubId].reputazione - 20
        );
      }
    } else if (isChamp) {
      outcome = 'CHAMPION';
    }

    userSummary = {
      ...userLeagueStats,
      outcome,
      prizeHS,
      reputationDelta
    };
  }

  // Capture top scorers before resetting season stats
  let capocannoniereImperiale: SeasonEndReport['capocannoniereImperiale'];
  let userClubTopScorer: { nome: string; cognome: string; gol: number } | undefined;

  for (const p of Object.values(updatedPlayers)) {
    const goals = p.statisticheStagione?.gol || 0;
    if (goals > 0) {
      if (!capocannoniereImperiale || goals > capocannoniereImperiale.gol) {
        capocannoniereImperiale = {
          nome: p.nome,
          cognome: p.cognome,
          clubNome: p.clubId && updatedClubs[p.clubId] ? updatedClubs[p.clubId].nome : 'Atleta Libero',
          gol: goals
        };
      }
      if (career.userClubId && p.clubId === career.userClubId) {
        if (!userClubTopScorer || goals > userClubTopScorer.gol) {
          userClubTopScorer = { nome: p.nome, cognome: p.cognome, gol: goals };
        }
      }
    }
  }

  if (userSummary && userClubTopScorer) {
    userSummary.topScorer = userClubTopScorer;
  }

  // 3. Process Aging, Career Archives, Contract Expiries, Retirements & Growth
  const playerIds = Object.keys(updatedPlayers);
  const rng = mulberry32(stringToSeed(`season_end_${Math.abs(currentYear)}`));

  for (const pid of playerIds) {
    const p = updatedPlayers[pid];
    const currentClub = p.clubId ? updatedClubs[p.clubId] : null;
    const prevPresenze = p.statisticheStagione.presenze;
    const prevGol = p.statisticheStagione.gol;
    const prevMedia = p.statisticheStagione.mediaVoto;

    // Archive completed season into player career history if athlete stepped onto the arena
    if (prevPresenze > 0) {
      p.carrieraPassata = p.carrieraPassata || [];
      p.carrieraPassata.push({
        seasonYear: currentYear,
        clubId: p.clubId || 'FREE_AGENT',
        clubName: currentClub ? currentClub.nome : 'Atleta Libero',
        presenze: prevPresenze,
        gol: prevGol,
        mediaVoto: prevMedia,
        trofeiVinti: currentClub ? (championsByClubId.get(currentClub.id) || []) : []
      });
    }

    // Handle contract expirations at season end
    if (p.clubId && p.contratto.annoScadenza <= currentYear) {
      if (p.clubId !== career.userClubId) {
        // AI clubs renew core players automatically or release older reserves
        if (rng() < 0.78 || p.eta < 30) {
          p.contratto.annoScadenza = nextYear + 2 + Math.floor(rng() * 2);
        } else {
          if (currentClub) {
            currentClub.titolariIds = currentClub.titolariIds.filter(id => id !== p.id);
            currentClub.panchinaIds = currentClub.panchinaIds.filter(id => id !== p.id);
          }
          p.clubId = '';
          p.contratto.clubId = '';
          p.inListaTrasferimenti = true;
        }
      } else {
        // User club expired contract -> released as free agent if not renewed
        if (currentClub) {
          currentClub.titolariIds = currentClub.titolariIds.filter(id => id !== p.id);
          currentClub.panchinaIds = currentClub.panchinaIds.filter(id => id !== p.id);
        }
        p.clubId = '';
        p.contratto.clubId = '';
        p.inListaTrasferimenti = true;
      }
    }

    // Advance age by 1 year
    p.eta += 1;

    // Reset season stats for new campaign
    p.statisticheStagione = {
      seasonYear: nextYear,
      presenze: 0,
      gol: 0,
      assist: 0,
      cartelliniGialli: 0,
      cartelliniRossi: 0,
      mediaVoto: 0,
      minutiGiocati: 0
    };
    p.squalificato = false;

    // Retirement probability:
    // 33-34 yo: 40% chance
    // 35+ yo: 80% chance
    let willRetire = false;
    if (p.eta >= 35 && rng() < 0.80) {
      willRetire = true;
    } else if (p.eta >= 33 && rng() < 0.40) {
      willRetire = true;
    }

    if (willRetire) {
      const club = p.clubId ? updatedClubs[p.clubId] : null;
      retiredPlayers.push({
        playerId: p.id,
        clubId: club ? club.id : '',
        nome: p.nome,
        cognome: p.cognome,
        clubNome: club ? club.nome : 'Atleta Libero',
        eta: p.eta,
        presenzeTotali: prevPresenze || 18
      });

      // Remove from club lineup
      if (club) {
        club.titolariIds = club.titolariIds.filter(id => id !== p.id);
        club.panchinaIds = club.panchinaIds.filter(id => id !== p.id);
      }
      delete updatedPlayers[pid];
    }
  }

  // 4. Promote Youth Prospects (Nuove Leve dell'Accademia) for each club
  let youthCounter = 1;
  const rolesCycle: Array<'POR' | 'DFC' | 'MED' | 'CC' | 'TRQ' | 'ATT'> = ['POR', 'DFC', 'MED', 'CC', 'TRQ', 'ATT'];

  for (const club of Object.values(updatedClubs)) {
    // Generate 1-2 new youth prodigies per club
    const numYouth = 1 + (rng() > 0.6 ? 1 : 0);
    for (let y = 0; y < numYouth; y++) {
      const role = rolesCycle[Math.floor(rng() * rolesCycle.length)];
      const youth = createDeterministicPlayer(
        club,
        role,
        25 + youthCounter++,
        false,
        false,
        rng
      );

      // Tune youth attributes: 17-19 years old, high potential
      youth.eta = 17 + Math.floor(rng() * 3);
      youth.annoNascita = nextYear - youth.eta;
      youth.valoreGenerale = 60 + Math.floor(rng() * 9); // 60-68 OVR
      youth.potenziale = 76 + Math.floor(rng() * 12);     // 76-88 POT
      youth.prezzoRichiesto = Math.round(youth.valoreGenerale * youth.valoreGenerale * 75);
      youth.inListaTrasferimenti = false;

      updatedPlayers[youth.id] = youth;
      club.panchinaIds.push(youth.id);

      youthPromoted.push({
        playerId: youth.id,
        clubId: club.id,
        nome: youth.nome,
        cognome: youth.cognome,
        clubNome: club.nome,
        eta: youth.eta,
        ovr: youth.valoreGenerale,
        pot: youth.potenziale
      });
    }

    // Replenish starters to 12 after retirements & contract releases
    const clubPool = Object.values(updatedPlayers)
      .filter(p => p.clubId === club.id)
      .sort((a, b) => b.valoreGenerale - a.valoreGenerale);
    const validStarters = (club.titolariIds || []).filter(id => updatedPlayers[id]?.clubId === club.id);
    const starterSet = new Set(validStarters);
    for (const candidate of clubPool) {
      if (validStarters.length >= 12) break;
      if (!starterSet.has(candidate.id)) {
        validStarters.push(candidate.id);
        starterSet.add(candidate.id);
      }
    }
    club.titolariIds = validStarters;
    club.panchinaIds = clubPool.filter(p => !starterSet.has(p.id)).map(p => p.id);
  }

  // 5. Generate New Round-Robin Fixtures + 4 Official Cups + National Teams Refresh for the new season
  const newMatches: Match[] = [];
  for (const league of Object.values(updatedLeagues)) {
    const fixtures = generateLeagueFixtures(league, nextYear);
    newMatches.push(...fixtures);
  }
  newMatches.push(...initializeAllCupMatches(updatedClubs, nextYear));

  const newDateText = getRomanDateString(1, Math.abs(nextYear));
  const updatedNationalTeams = refreshNationalTeamsRosters(career.nationalTeams, updatedPlayers);
  const newNationalMatches = generateNationalMatches(Math.abs(nextYear));

  const updatedCareer: CareerSave = {
    ...career,
    currentYear: nextYear,
    currentMatchday: 1,
    currentDateText: newDateText,
    manager: updatedManager || career.manager,
    clubs: updatedClubs,
    players: updatedPlayers,
    leagues: updatedLeagues,
    matches: newMatches,
    nationalTeams: updatedNationalTeams,
    nationalMatches: newNationalMatches,
    trofeiAlboDOro: updatedAlbo,
    updatedAt: Date.now()
  };

  return {
    updatedCareer,
    report: {
      seasonYear: Math.abs(currentYear),
      eraDisplayText: oldEra.displayText,
      nextEraDisplayText: nextEra.displayText,
      nextConsuls: nextEra.consuls,
      leagueChampions,
      retiredPlayers,
      youthPromoted,
      movements,
      userSummary,
      capocannoniereImperiale
    }
  };
}
