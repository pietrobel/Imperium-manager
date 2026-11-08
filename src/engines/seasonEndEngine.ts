import type { CareerSave, Club, Player, Match, League } from '../types';
import { calculateLeagueTable, generateLeagueFixtures } from './leagueEngine';
import { createDeterministicPlayer, mulberry32, stringToSeed } from './playerDatabaseEngine';
import { getRomanDateString, convertBCToOlympicEra } from './calendarEngine';
import { executePromotionAndRelegation, type PromotionRelegationMovement } from './promotionRelegationEngine';

export interface SeasonEndReport {
  seasonYear: number;
  leagueChampions: { leagueId: string; leagueName: string; championClubId: string; championClubNome: string }[];
  retiredPlayers: { playerId: string; nome: string; cognome: string; clubNome: string; eta: number; presenzeTotali: number }[];
  youthPromoted: { playerId: string; nome: string; cognome: string; clubNome: string; eta: number; ovr: number; pot: number }[];
  movements: PromotionRelegationMovement[];
}

/**
 * Checks if the current season has finished all scheduled matchdays (e.g. 30 matchdays for 15-team leagues).
 */
export function isSeasonFinished(career: CareerSave): boolean {
  return career.currentMatchday > 30;
}

/**
 * Processes full season-end transition:
 * 1. Crowns champions and updates Albo d'Oro.
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
  let updatedClubs = JSON.parse(JSON.stringify(career.clubs)) as Record<string, Club>;
  const updatedPlayers = JSON.parse(JSON.stringify(career.players)) as Record<string, Player>;
  let updatedLeagues = JSON.parse(JSON.stringify(career.leagues)) as Record<string, League>;
  const updatedAlbo = { ...(career.trofeiAlboDOro || {}) };

  const leagueChampions: SeasonEndReport['leagueChampions'] = [];
  const retiredPlayers: SeasonEndReport['retiredPlayers'] = [];
  const youthPromoted: SeasonEndReport['youthPromoted'] = [];

  // 1. Determine Champions for each league
  for (const league of Object.values(updatedLeagues)) {
    const table = calculateLeagueTable(league.id, updatedClubs, career.matches);
    if (table.length > 0) {
      const winner = table[0];
      const champClub = updatedClubs[winner.clubId];
      if (champClub) {
        const era = convertBCToOlympicEra(currentYear);
        champClub.storiaTrofei = champClub.storiaTrofei || [];
        champClub.storiaTrofei.push(`${league.nome} (${era.displayText})`);
        champClub.saldoCassa += 2000000; // Prize money: 2M HS
        champClub.budgetTrasferimenti += 1500000;

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

  // 3. Process Aging, Retirements & Growth
  const playerIds = Object.keys(updatedPlayers);
  const rng = mulberry32(stringToSeed(`season_end_${Math.abs(currentYear)}`));

  for (const pid of playerIds) {
    const p = updatedPlayers[pid];
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
        nome: p.nome,
        cognome: p.cognome,
        clubNome: club ? club.nome : 'Atleta Libero',
        eta: p.eta,
        presenzeTotali: p.statisticheStagione.presenze || 18
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
      youth.prezzoRichiesto = Math.round(youth.valoreGenerale * youth.valoreGenerale * 240);
      youth.inListaTrasferimenti = false;

      updatedPlayers[youth.id] = youth;
      club.panchinaIds.push(youth.id);

      youthPromoted.push({
        playerId: youth.id,
        nome: youth.nome,
        cognome: youth.cognome,
        clubNome: club.nome,
        eta: youth.eta,
        ovr: youth.valoreGenerale,
        pot: youth.potenziale
      });
    }
  }

  // 5. Generate New Round-Robin Fixtures for all leagues in the new season
  const newMatches: Match[] = [];
  for (const league of Object.values(updatedLeagues)) {
    const fixtures = generateLeagueFixtures(league, nextYear);
    newMatches.push(...fixtures);
  }

  const newDateText = getRomanDateString(1, Math.abs(nextYear));

  const updatedCareer: CareerSave = {
    ...career,
    currentYear: nextYear,
    currentMatchday: 1,
    currentDateText: newDateText,
    clubs: updatedClubs,
    players: updatedPlayers,
    leagues: updatedLeagues,
    matches: newMatches,
    trofeiAlboDOro: updatedAlbo,
    updatedAt: Date.now()
  };

  return {
    updatedCareer,
    report: {
      seasonYear: Math.abs(currentYear),
      leagueChampions,
      retiredPlayers,
      youthPromoted,
      movements
    }
  };
}
