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

export function getCupRoundLabel(numClubsInRound: number): string {
  if (numClubsInRound >= 16) return 'Ottavi di Finale';
  if (numClubsInRound >= 8) return 'Quarti di Finale';
  if (numClubsInRound >= 4) return 'Semifinali';
  return 'Finale';
}

export function getCupMatchdayForRoundSize(numClubsInRound: number): number {
  if (numClubsInRound >= 16) return 6;
  if (numClubsInRound >= 8) return 13;
  if (numClubsInRound >= 4) return 20;
  return 27;
}

/**
 * Generates knockout matches for a given round of clubs.
 */
export function generateCupKnockoutMatches(
  competitionId: string,
  competingClubIds: string[],
  seasonYear: number,
  startMatchday?: number
): Match[] {
  const matches: Match[] = [];
  const comp = INITIAL_COMPETITIONS[competitionId];
  const numClubs = competingClubIds.length;
  const roundLabel = getCupRoundLabel(numClubs);
  const scheduledDay = startMatchday ?? getCupMatchdayForRoundSize(numClubs);
  const era = convertBCToOlympicEra(Math.abs(seasonYear));

  for (let i = 0; i < competingClubIds.length - 1; i += 2) {
    const matchIndex = Math.floor(i / 2) + 1;
    matches.push({
      id: `cup_${competitionId}_y${Math.abs(seasonYear)}_r${numClubs}_${matchIndex}`,
      competitionId,
      competitionType: 'CUP',
      stagioneAnno: seasonYear,
      giornata: scheduledDay,
      dataCalendario: `${comp?.nome.split('(')[0].trim() || 'Coppa'} · ${roundLabel} (${era.displayText})`,
      dataNumero: scheduledDay,
      clubCasaId: competingClubIds[i],
      clubOspiteId: competingClubIds[i + 1],
      disputata: false
    });
  }

  return matches;
}

/**
 * Initializes Round 1 matches for all 4 official Cups in the career.
 */
export function initializeAllCupMatches(
  allClubs: Record<string, Club>,
  seasonYear: number
): Match[] {
  const allCupMatches: Match[] = [];
  for (const compId of Object.keys(INITIAL_COMPETITIONS)) {
    const participants = getParticipatingClubsForCompetition(compId, allClubs);
    if (participants.length >= 2) {
      allCupMatches.push(...generateCupKnockoutMatches(compId, participants, seasonYear));
    }
  }
  return allCupMatches;
}

/**
 * Ensures older saves without CUP matches receive Round 1 cup fixtures seamlessly.
 */
export function reconcileCupMatches(
  matches: Match[],
  allClubs: Record<string, Club>,
  seasonYear: number
): Match[] {
  const existingCups = matches.filter(m => m.competitionType === 'CUP' && m.stagioneAnno === seasonYear);
  if (existingCups.length > 0) return matches;
  return [...matches, ...initializeAllCupMatches(allClubs, seasonYear)];
}

/**
 * Simulates a single-leg knockout cup match.
 * Resolves ties via Corsa di Spareggio (no draws in cup competitions).
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

  // Resolve draw via Corsa di Spareggio ad Oltranza
  if (result.golCasa === result.golOspite) {
    let spareggioCasa = 4 + Math.floor(Math.random() * 2);
    let spareggioOspite = 4 + Math.floor(Math.random() * 2);
    if (spareggioCasa === spareggioOspite) {
      if (Math.random() < 0.5) spareggioCasa += 1;
      else spareggioOspite += 1;
    }

    if (spareggioCasa > spareggioOspite) {
      winnerId = match.clubCasaId;
      result.golCasa += 1;
    } else {
      winnerId = match.clubOspiteId;
      result.golOspite += 1;
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

export function getCupMatchWinnerId(match: Match): string | null {
  if (!match.disputata || !match.risultato) return null;
  if (match.risultato.golCasa > match.risultato.golOspite) return match.clubCasaId;
  if (match.risultato.golOspite > match.risultato.golCasa) return match.clubOspiteId;
  return match.clubCasaId;
}

/**
 * Checks every Cup bracket and generates the next knockout round or crowns the champion when Finale completes.
 */
export function advanceCupBrackets(
  matches: Match[],
  clubs: Record<string, Club>,
  seasonYear: number,
  trofeiAlboDOro: Record<string, { anno: number; vincitoreNome: string }[]>
): {
  updatedMatches: Match[];
  updatedClubs: Record<string, Club>;
  updatedAlbo: Record<string, { anno: number; vincitoreNome: string }[]>;
  crownedChampions: { compId: string; compNome: string; clubId: string; clubNome: string }[];
} {
  const updatedMatches = [...matches];
  const updatedClubs = { ...clubs };
  const updatedAlbo = { ...trofeiAlboDOro };
  const crownedChampions: { compId: string; compNome: string; clubId: string; clubNome: string }[] = [];
  const absYear = Math.abs(seasonYear);
  const era = convertBCToOlympicEra(seasonYear);

  for (const comp of Object.values(INITIAL_COMPETITIONS)) {
    const compMatches = updatedMatches.filter(
      m => m.competitionType === 'CUP' && m.competitionId === comp.id && m.stagioneAnno === seasonYear
    );
    if (compMatches.length === 0) continue;

    // Group by latest round (smallest team count = largest round progression)
    const maxGiornata = Math.max(...compMatches.map(m => m.giornata));
    const latestRoundMatches = compMatches.filter(m => m.giornata === maxGiornata);
    const allFinished = latestRoundMatches.every(m => m.disputata && m.risultato);
    if (!allFinished) continue;

    if (latestRoundMatches.length === 1) {
      // Finale finished -> crown champion if not already recorded for this year
      const finalMatch = latestRoundMatches[0];
      const winnerId = getCupMatchWinnerId(finalMatch);
      if (winnerId && updatedClubs[winnerId]) {
        const existingYearEntry = (updatedAlbo[comp.id] || []).some(e => e.anno === absYear);
        if (!existingYearEntry) {
          const champClub = { ...updatedClubs[winnerId] };
          champClub.storiaTrofei = [...(champClub.storiaTrofei || []), `${comp.nome.split('(')[0].trim()} (${era.displayText})`];
          champClub.saldoCassa += 1500000;
          champClub.reputazione = Math.min(1000, champClub.reputazione + 50);
          updatedClubs[winnerId] = champClub;

          updatedAlbo[comp.id] = [
            ...(updatedAlbo[comp.id] || []),
            { anno: absYear, vincitoreNome: champClub.nome }
          ];
          crownedChampions.push({
            compId: comp.id,
            compNome: comp.nome.split('(')[0].trim(),
            clubId: champClub.id,
            clubNome: champClub.nome
          });
        }
      }
    } else if (latestRoundMatches.length >= 2) {
      // Generate next knockout round from winners
      const winners = latestRoundMatches
        .map(m => getCupMatchWinnerId(m))
        .filter((id): id is string => Boolean(id));
      if (winners.length >= 2) {
        const nextRoundMatches = generateCupKnockoutMatches(
          comp.id,
          winners,
          seasonYear,
          getCupMatchdayForRoundSize(winners.length)
        );
        updatedMatches.push(...nextRoundMatches);
      }
    }
  }

  return { updatedMatches, updatedClubs, updatedAlbo, crownedChampions };
}
