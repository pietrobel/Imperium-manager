import type { Competition, Match, Club, Player, MatchResult } from '../types';
import { simulateMatch } from './matchSimulationEngine';
import { convertBCToOlympicEra } from './calendarEngine';

export interface CupBracketNode {
  roundName: 'OTTAVI' | 'QUARTI' | 'SEMIFINALI' | 'FINALE';
  matchId: string;
  clubCasaId: string;
  clubOspiteId: string;
  golCasa?: number;
  golOspite?: number;
  rigoriCasa?: number;
  rigoriOspite?: number;
  vincitoreId?: string;
  disputata: boolean;
}

export const INITIAL_COMPETITIONS: Record<string, Competition> = {
  // 1. Coppa Internazionale Primaria (Champions Cup)
  cup_munus_caesarum: {
    id: 'cup_munus_caesarum',
    nome: 'Munus Caesarum (Coppa dei Campioni dell’Antichità)',
    tipo: 'CUP',
    formato: 'KNOCKOUT',
    regione: 'Mondo Antico (Imperiale)',
    trofeo: 'Alloro Imperiale d’Oro e Vittoria Alata',
    stagioneAttuale: -50
  },
  // 2. Coppa Internazionale Marittima (Mediterranean Cup)
  cup_mare_nostrum: {
    id: 'cup_mare_nostrum',
    nome: 'Corona Mare Nostrum (Coppa del Mediterraneo)',
    tipo: 'CUP',
    formato: 'KNOCKOUT',
    regione: 'Bacino del Mediterraneo',
    trofeo: 'Tridente di Nettuno & Corona Rostrata',
    stagioneAttuale: -50
  },
  // 3. Coppa Internazionale Continentale (Frontier Shields)
  cup_scudo_province: {
    id: 'cup_scudo_province',
    nome: 'Scudo delle Province e dei Confini (Coppa delle Frontiere)',
    tipo: 'CUP',
    formato: 'KNOCKOUT',
    regione: 'Province Esterne & Frontiere',
    trofeo: 'Scudo d’Argento delle Legioni',
    stagioneAttuale: -50
  },
  // 4. Coppa Nazionale (Coppa Consolare)
  cup_consolare: {
    id: 'cup_consolare',
    nome: 'Coppa Consolare di Roma (Torneo d’Italia)',
    tipo: 'CUP',
    formato: 'KNOCKOUT',
    regione: 'Italia & Latium',
    trofeo: 'Fascio Consolare d’Argento',
    stagioneAttuale: -50
  }
};

/**
 * Returns participating club IDs for each of the 3 international cups + national cup.
 */
export function getParticipatingClubsForCompetition(
  compId: string,
  allClubs: Record<string, Club>
): string[] {
  const clubList = Object.values(allClubs);

  if (compId === 'cup_munus_caesarum') {
    // Top champions from major civilisations of the ancient world
    const majorLeagues = [
      'league_romana', 'league_greca', 'league_cartaginese', 'league_egizia',
      'league_persiana', 'league_partica', 'league_gallica', 'league_iberica',
      'league_siriana', 'league_anatolica', 'league_macedone', 'league_britannica'
    ];
    return clubList
      .filter(c => majorLeagues.includes(c.leagueId))
      .sort((a, b) => b.reputazione - a.reputazione)
      .slice(0, 16)
      .map(c => c.id);
  }

  if (compId === 'cup_mare_nostrum') {
    // Coastal and Mediterranean maritime powers
    const medLeagues = ['league_cartaginese', 'league_greca', 'league_egizia', 'league_siriana', 'league_cirenaica', 'league_cilicia', 'league_romana', 'league_iberica'];
    return clubList
      .filter(c => medLeagues.includes(c.leagueId))
      .sort((a, b) => b.reputazione - a.reputazione)
      .slice(0, 16)
      .map(c => c.id);
  }

  if (compId === 'cup_scudo_province') {
    // Frontier, continental and barbarian limes clubs
    const frontierLeagues = ['league_gallica', 'league_germanica', 'league_britannica', 'league_dacica', 'league_tracica', 'league_sarmatica', 'league_partica', 'league_battriana'];
    return clubList
      .filter(c => frontierLeagues.includes(c.leagueId))
      .sort((a, b) => b.reputazione - a.reputazione)
      .slice(0, 16)
      .map(c => c.id);
  }

  if (compId === 'cup_consolare') {
    // Top clubs of Italian/Roman league
    return clubList
      .filter(c => c.leagueId === 'league_romana')
      .slice(0, 8)
      .map(c => c.id);
  }

  return clubList.slice(0, 8).map(c => c.id);
}

/**
 * Generates initial knockout matches for the tournament.
 */
export function generateCupKnockoutMatches(
  competitionId: string,
  competingClubIds: string[],
  seasonYear: number,
  startMatchday: number = 4
): Match[] {
  const matches: Match[] = [];
  const comp = INITIAL_COMPETITIONS[competitionId];
  const numClubs = competingClubIds.length;
  const isRoundOf16 = numClubs >= 16;
  const roundLabel = isRoundOf16 ? 'Ottavi di Finale' : 'Quarti di Finale';

  for (let i = 0; i < competingClubIds.length - 1; i += 2) {
    const matchIndex = Math.floor(i / 2) + 1;
    const era = convertBCToOlympicEra(Math.abs(seasonYear));
    matches.push({
      id: `cup_${competitionId}_r1_${matchIndex}`,
      competitionId,
      competitionType: 'CUP',
      stagioneAnno: seasonYear,
      giornata: startMatchday,
      dataCalendario: `${comp?.nome || 'Coppa'} - ${roundLabel} (${era.displayText})`,
      dataNumero: startMatchday,
      clubCasaId: competingClubIds[i],
      clubOspiteId: competingClubIds[i + 1],
      disputata: false
    });
  }

  return matches;
}

/**
 * Simulates a single-leg knockout cup match.
 * Resolves ties via overtime and penalties (no draws in cup competitions).
 */
export function simulateCupMatch(
  match: Match,
  allClubs: Record<string, Club>,
  allPlayers: Record<string, Player>
): { match: Match; result: MatchResult; winnerClubId: string } {
  const home = allClubs[match.clubCasaId];
  const away = allClubs[match.clubOspiteId];

  const result = simulateMatch({
    homeClub: home,
    awayClub: away,
    allPlayers,
    competitionName: INITIAL_COMPETITIONS[match.competitionId]?.nome || 'Coppa dell’Antichità'
  });

  let winnerId = match.clubCasaId;

  // Resolve draw via penalty shootout
  if (result.golCasa === result.golOspite) {
    const penCasa = 4 + Math.floor(Math.random() * 2);
    let penOspite = 4 + Math.floor(Math.random() * 2);
    if (penCasa === penOspite) {
      if (Math.random() < 0.5) penCasa + 1;
      else penOspite + 1;
    }

    if (penCasa > penOspite) {
      winnerId = match.clubCasaId;
      result.golCasa++; // Award extra time / penalty decisor
    } else {
      winnerId = match.clubOspiteId;
      result.golOspite++;
    }
  } else if (result.golCasa > result.golOspite) {
    winnerId = match.clubCasaId;
  } else {
    winnerId = match.clubOspiteId;
  }

  match.disputata = true;
  match.risultato = result;

  return { match, result, winnerClubId: winnerId };
}
