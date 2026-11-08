import type { CareerSave, Manager, Match, MatchResult } from '../types';
import { INITIAL_LEAGUES } from '../initialData/leagues';
import { INITIAL_CLUBS } from '../initialData/clubs';
import { INITIAL_REGIONS } from '../initialData/regions';
import { buildWorldPlayersDatabase } from '../engines/playerDatabaseEngine';
import { generateLeagueFixtures } from '../engines/leagueEngine';
import { simulateMatch } from '../engines/matchSimulationEngine';
import { processWeeklyFinances } from '../engines/economyEngine';
import { createWeeklyWorldNews } from '../engines/worldEngine';
import { getRomanDateString, convertBCToOlympicEra } from '../engines/calendarEngine';
import { evolvePlayerAttributes } from '../engines/playerGrowthEngine';
import { generateAIOffersForUserPlayer } from '../engines/transferEngine';
import { processSeasonEndTransition } from '../engines/seasonEndEngine';
import { careerRepository } from '../repositories/DexieCareerRepository';
import { initializeNationalTeams, generateNationalMatches } from '../engines/nationalTeamsEngine';
import { advanceValetudinarium, MEDICAL_STAFF_TIERS } from '../engines/militaryTrainingEngine';

export interface CreateCareerParams {
  managerName: string;
  managerCognome: string;
  originFamily: string;
  userClubId: string;
  nationality?: string;
  culture?: 'ROMANA' | 'GRECA' | 'EGIZIA' | 'GALLICA' | 'PUNICA' | 'PERSICA' | 'GERMANICA';
}

export function createNewCareer(params: CreateCareerParams): CareerSave {
  const currentYear = -50;
  const clubs = JSON.parse(JSON.stringify(INITIAL_CLUBS));
  const leagues = JSON.parse(JSON.stringify(INITIAL_LEAGUES));
  const regions = JSON.parse(JSON.stringify(INITIAL_REGIONS));

  // Build complete world players database (12.750 players across 450 clubs + free agents)
  const { players: worldPlayers } = buildWorldPlayersDatabase(clubs);

  // Set user club
  if (clubs[params.userClubId]) {
    clubs[params.userClubId].isUserControlled = true;
    clubs[params.userClubId].allenatoreNome = `${params.managerName} ${params.managerCognome} (${params.originFamily})`;
    clubs[params.userClubId].impostazioniAllenamento = {
      intensitaGenerale: 'NORMALIS',
      dottrinaPrevalente: 'TAXIS_DECURSIO',
      medicoAssegnato: 'ERBISTA_CASTRORUM'
    };
  }

  // Generate fixtures for each league
  const allMatches: Match[] = [];
  for (const league of Object.values(leagues)) {
    const fixtures = generateLeagueFixtures(league as any, currentYear);
    allMatches.push(...fixtures);
  }

  const nationalTeams = initializeNationalTeams(worldPlayers);
  const nationalMatches = generateNationalMatches(50);

  const manager: Manager = {
    id: `mgr_${Date.now()}`,
    nome: params.managerName,
    cognome: params.managerCognome,
    nazionalita: params.nationality || 'Romana',
    culturaOrigine: params.culture || 'ROMANA',
    famigliaOrigine: params.originFamily,
    clubId: params.userClubId,
    puntiReputazione: 500,
    partiteGestite: 0,
    vittorie: 0,
    pareggi: 0,
    sconfitte: 0,
    trofeiVinti: [],
    dataIngaggio: getRomanDateString(1, 50)
  };

  const initialNews = createWeeklyWorldNews(
    1,
    50,
    clubs[params.userClubId]?.nome || 'SPQR Roma'
  );

  const initialEra = convertBCToOlympicEra(Math.abs(currentYear));

  const save: CareerSave = {
    id: `career_${Date.now()}`,
    saveName: `${clubs[params.userClubId]?.nome || 'Imperium'} (${initialEra.displayText})`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    currentYear,
    currentMatchday: 1,
    currentDateText: getRomanDateString(1, 50),
    manager,
    userClubId: params.userClubId,
    clubs,
    players: worldPlayers,
    leagues,
    regions,
    matches: allMatches,
    nationalTeams,
    nationalMatches,
    transfers: [],
    incomingOffers: [],
    news: initialNews,
    trofeiAlboDOro: {}
  };

  return save;
}

export interface MatchdaySimulationResult {
  updatedCareer: CareerSave;
  simulatedMatches: { match: Match; result: MatchResult }[];
  userMatch?: { match: Match; result: MatchResult };
}

export function advanceMatchday(career: CareerSave): MatchdaySimulationResult {
  const matchday = career.currentMatchday;
  const currentMatches = career.matches.filter(m => m.giornata === matchday && !m.disputata);
  
  const simulatedMatches: { match: Match; result: MatchResult }[] = [];
  let userMatch: { match: Match; result: MatchResult } | undefined;

  const updatedPlayers = { ...career.players };
  const updatedClubs = { ...career.clubs };
  const updatedMatches = [...career.matches];

  // 1. Simulate all matches in this matchday
  currentMatches.forEach(match => {
    const homeClub = updatedClubs[match.clubCasaId];
    const awayClub = updatedClubs[match.clubOspiteId];
    if (!homeClub || !awayClub) return;

    const result = simulateMatch({
      homeClub,
      awayClub,
      allPlayers: updatedPlayers,
      competitionName: 'Prima Divisio'
    });

    match.disputata = true;
    match.risultato = result;

    simulatedMatches.push({ match, result });

    if (match.clubCasaId === career.userClubId || match.clubOspiteId === career.userClubId) {
      userMatch = { match, result };
    }

    // Update player stats
    result.eventi.forEach(evt => {
      if (evt.giocatoreId && updatedPlayers[evt.giocatoreId]) {
        const p = updatedPlayers[evt.giocatoreId];
        if (evt.tipo === 'GOL') p.statisticheStagione.gol++;
        if (evt.tipo === 'GIALLO') p.statisticheStagione.cartelliniGialli++;
        if (evt.tipo === 'ROSSO') p.statisticheStagione.cartelliniRossi++;
      }
    });

    // Update player ratings & condition
    Object.entries(result.pagelle).forEach(([playerId, rating]) => {
      if (updatedPlayers[playerId]) {
        const p = updatedPlayers[playerId];
        p.statisticheStagione.presenze++;
        p.statisticheStagione.minutiGiocati += rating.minuti;
        const currentAvg = p.statisticheStagione.mediaVoto || 6.0;
        p.statisticheStagione.mediaVoto = Number(((currentAvg * (p.statisticheStagione.presenze - 1) + rating.voto) / p.statisticheStagione.presenze).toFixed(2));
        p.condizione = Math.max(60, p.condizione - 12); // Match fatigue
      }
    });
  });

  // 2. Process Manager stats for user
  const updatedManager = { ...career.manager };
  if (userMatch) {
    const isHome = userMatch.match.clubCasaId === career.userClubId;
    const userGoals = isHome ? userMatch.result.golCasa : userMatch.result.golOspite;
    const oppGoals = isHome ? userMatch.result.golOspite : userMatch.result.golCasa;

    updatedManager.partiteGestite++;
    if (userGoals > oppGoals) {
      updatedManager.vittorie++;
      updatedManager.puntiReputazione += 15;
    } else if (userGoals < oppGoals) {
      updatedManager.sconfitte++;
      updatedManager.puntiReputazione = Math.max(100, updatedManager.puntiReputazione - 8);
    } else {
      updatedManager.pareggi++;
      updatedManager.puntiReputazione += 5;
    }
  }

  // 3. Process Weekly Finances for User Club
  const userClub = updatedClubs[career.userClubId];
  if (userClub) {
    const isHome = userMatch ? userMatch.match.clubCasaId === career.userClubId : false;
    const squad = Object.values(updatedPlayers).filter(p => p.clubId === userClub.id);
    const { updatedClub } = processWeeklyFinances(userClub, squad, isHome);

    // Salario dello Staff Medico del Valetudinarium
    const medTier = updatedClub.impostazioniAllenamento?.medicoAssegnato || 'ERBISTA_CASTRORUM';
    const medCost = MEDICAL_STAFF_TIERS[medTier]?.weeklyCostHS || 0;
    if (medCost > 0) {
      updatedClub.saldoCassa = Math.max(-500000, updatedClub.saldoCassa - medCost);
    }

    updatedClubs[career.userClubId] = updatedClub;
  }

  // 4. Valetudinarium: guarigione infortuni e defaticamento coorte
  const userMedTier = userClub?.impostazioniAllenamento?.medicoAssegnato || 'ERBISTA_CASTRORUM';
  const medicalNews: any[] = [];

  Object.keys(updatedPlayers).forEach(id => {
    const p = updatedPlayers[id];
    const isUserPlayer = p.clubId === career.userClubId;

    if (p.infortunato) {
      const tier = isUserPlayer ? userMedTier : 'ERBISTA_CASTRORUM';
      const { updatedPlayer, healed, message } = advanceValetudinarium(p, tier);
      updatedPlayers[id] = updatedPlayer;

      if (healed && isUserPlayer && message) {
        medicalNews.push({
          id: `news_valetudinarium_${Date.now()}_${p.id}`,
          titolo: `Dimissione dal Valetudinarium: ${p.nome} ${p.cognome} è guarito!`,
          corpo: message,
          data: getRomanDateString(matchday, 50),
          categoria: 'SODALIZIO' as const
        });
      }
    } else {
      // Defaticamento naturale
      p.caricoFatica = Math.max(0, (p.caricoFatica || 0) - 15);
      p.condizione = Math.min(100, p.condizione + 8);
    }
  });

  // 5. Natural attribute evolution & condition recovery for all players
  Object.keys(updatedPlayers).forEach(id => {
    updatedPlayers[id] = evolvePlayerAttributes(updatedPlayers[id]);
  });


  // 6. Transfer Market AI Activity for User Players
  const nextMatchday = matchday + 1;
  const nextDateStr = getRomanDateString(nextMatchday, 50);
  
  // Filter active pending offers (keep only non-expired ones)
  const activePendingOffers = (career.incomingOffers || []).filter(
    o => o.status === 'PENDING' && o.expiresMatchday >= nextMatchday
  );

  const userSquad = Object.values(updatedPlayers).filter(p => p.clubId === career.userClubId);
  const listedUserPlayers = userSquad.filter(p => p.inListaTrasferimenti);
  const newBids: any[] = [];

  // If user has players listed on the market, 65% chance of an incoming bid
  if (listedUserPlayers.length > 0 && Math.random() < 0.65) {
    const targetPlayer = listedUserPlayers[Math.floor(Math.random() * listedUserPlayers.length)];
    // Ensure no duplicate pending offer for this player
    const alreadyOffered = activePendingOffers.some(o => o.playerId === targetPlayer.id);
    if (!alreadyOffered) {
      const bids = generateAIOffersForUserPlayer(targetPlayer, updatedClubs, career.userClubId, nextMatchday, nextDateStr);
      if (bids.length > 0) {
        newBids.push(bids[0]);
      }
    }
  }

  // 7. Check Season Completion (All 30 Matchdays Completed)
  if (nextMatchday > 30) {
    const { updatedCareer: nextSeasonCareer, report } = processSeasonEndTransition({
      ...career,
      players: updatedPlayers,
      clubs: updatedClubs,
      matches: updatedMatches,
      manager: updatedManager
    });

    const oldEra = convertBCToOlympicEra(Math.abs(career.currentYear));
    const newEra = convertBCToOlympicEra(Math.abs(nextSeasonCareer.currentYear));

    const promoCount = report.movements?.filter(m => m.type === 'PROMOTION').length || 0;
    const retroCount = report.movements?.filter(m => m.type === 'RELEGATION').length || 0;

    const endOfSeasonNews = {
      id: `news_season_end_${Date.now()}`,
      titolo: `Concluso il Campionato indetto nell'${oldEra.displayText}! Proclamati i Campioni`,
      corpo: `Il Senato e i magistrati celebrano la chiusura dei giochi sotto il consolato di ${oldEra.consuls}. I vincitori hanno sollevato gli Allori Trionfali e l'Albo d'Oro è stato ratificato. Ratificate inoltre ${promoCount} promozioni gloriose e ${retroCount} retrocessioni nei 15 circuiti piramidali. I club accolgono ${report.youthPromoted.length} giovani promesse dalle accademie, mentre ${report.retiredPlayers.length} veterani depongono i calzari. Si aprono le iscrizioni per l'${newEra.displayText}!`,
      data: `Fasti Consolari · ${oldEra.displayText}`,
      categoria: 'IMPERO' as const
    };

    nextSeasonCareer.news = [endOfSeasonNews, ...(nextSeasonCareer.news || []).slice(0, 15)];

    careerRepository.saveCareer(nextSeasonCareer).catch(err => {
      console.warn('Auto-save error:', err);
    });

    return {
      updatedCareer: nextSeasonCareer,
      simulatedMatches,
      userMatch
    };
  }

  // 8. Generate World News
  const topResultStr = userMatch 
    ? `${updatedClubs[userMatch.match.clubCasaId]?.nome} ${userMatch.result.golCasa} - ${userMatch.result.golOspite} ${updatedClubs[userMatch.match.clubOspiteId]?.nome}`
    : undefined;

  const newWeeklyNews = createWeeklyWorldNews(
    nextMatchday,
    Math.abs(career.currentYear),
    userClub?.nome || 'SPQR Roma',
    topResultStr
  );

  const updatedCareer: CareerSave = {
    ...career,
    currentMatchday: nextMatchday,
    currentDateText: nextDateStr,
    players: updatedPlayers,
    clubs: updatedClubs,
    matches: updatedMatches,
    manager: updatedManager,
    incomingOffers: [...newBids, ...activePendingOffers],
    news: [...newWeeklyNews, ...career.news.slice(0, 15)],
    updatedAt: Date.now()
  };

  // Auto-save in background
  careerRepository.saveCareer(updatedCareer).catch(err => {
    console.warn('Auto-save error:', err);
  });

  return {
    updatedCareer,
    simulatedMatches,
    userMatch
  };
}
