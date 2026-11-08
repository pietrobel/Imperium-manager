import type { Match, LeagueTableRow, Club, League } from '../types';
import { getRomanDateString } from './calendarEngine';

export function generateLeagueFixtures(league: League, seasonYear: number): Match[] {
  const clubs = [...league.clubIds];
  const n = clubs.length;
  const isOdd = n % 2 !== 0;
  if (isOdd) clubs.push('BYE');
  
  const totalRounds = (clubs.length - 1) * 2; // Andata e Ritorno
  const matchesPerRound = clubs.length / 2;
  const fixtures: Match[] = [];

  const clubList = [...clubs];
  let matchIdCounter = 1;

  // Berger Round-Robin algorithm
  for (let round = 0; round < clubs.length - 1; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = clubList[match];
      const away = clubList[clubs.length - 1 - match];

      if (home !== 'BYE' && away !== 'BYE') {
        const isAlternate = (round + match) % 2 === 0;
        const actualHome = isAlternate ? home : away;
        const actualAway = isAlternate ? away : home;

        fixtures.push({
          id: `match_${league.id}_s${seasonYear}_g${round + 1}_m${matchIdCounter++}`,
          competitionId: league.id,
          competitionType: 'LEAGUE',
          stagioneAnno: seasonYear,
          giornata: round + 1,
          dataCalendario: getRomanDateString(round + 1, Math.abs(seasonYear)),
          dataNumero: round + 1,
          clubCasaId: actualHome,
          clubOspiteId: actualAway,
          disputata: false
        });
      }
    }
    // Rotate list except first element
    const last = clubList.pop()!;
    clubList.splice(1, 0, last);
  }

  // Generate return round (Ritorno)
  const firstHalfCount = fixtures.length;
  for (let i = 0; i < firstHalfCount; i++) {
    const orig = fixtures[i];
    const returnRound = orig.giornata + (clubs.length - 1);
    fixtures.push({
      id: `match_${league.id}_s${seasonYear}_g${returnRound}_m${matchIdCounter++}`,
      competitionId: league.id,
      competitionType: 'LEAGUE',
      stagioneAnno: seasonYear,
      giornata: returnRound,
      dataCalendario: getRomanDateString(returnRound, Math.abs(seasonYear)),
      dataNumero: returnRound,
      clubCasaId: orig.clubOspiteId,
      clubOspiteId: orig.clubCasaId,
      disputata: false
    });
  }

  return fixtures;
}

export function calculateLeagueTable(
  leagueId: string,
  clubs: Record<string, Club>,
  matches: Match[]
): LeagueTableRow[] {
  const leagueClubIds = Object.values(clubs)
    .filter(c => c.leagueId === leagueId)
    .map(c => c.id);

  const tableMap: Record<string, LeagueTableRow> = {};

  leagueClubIds.forEach(id => {
    const club = clubs[id];
    tableMap[id] = {
      clubId: id,
      clubNome: club ? club.nome : id,
      clubSigla: club ? club.sigla : 'ROM',
      partiteGiocate: 0,
      vittorie: 0,
      pareggi: 0,
      sconfitte: 0,
      golFatti: 0,
      golSubiti: 0,
      differenzaReti: 0,
      punti: 0,
      forma: []
    };
  });

  // Filter played matches for this league
  const leagueMatches = matches.filter(
    m => m.competitionId === leagueId && m.disputata && m.risultato
  );

  leagueMatches.forEach(m => {
    const res = m.risultato!;
    const home = tableMap[m.clubCasaId];
    const away = tableMap[m.clubOspiteId];

    if (!home || !away) return;

    home.partiteGiocate++;
    away.partiteGiocate++;

    home.golFatti += res.golCasa;
    home.golSubiti += res.golOspite;
    away.golFatti += res.golOspite;
    away.golSubiti += res.golCasa;

    if (res.golCasa > res.golOspite) {
      home.vittorie++;
      home.punti += 3;
      away.sconfitte++;
      home.forma.push('V');
      away.forma.push('S');
    } else if (res.golCasa < res.golOspite) {
      away.vittorie++;
      away.punti += 3;
      home.sconfitte++;
      away.forma.push('V');
      home.forma.push('S');
    } else {
      home.pareggi++;
      away.pareggi++;
      home.punti += 1;
      away.punti += 1;
      home.forma.push('P');
      away.forma.push('P');
    }

    home.differenzaReti = home.golFatti - home.golSubiti;
    away.differenzaReti = away.golFatti - away.golSubiti;
  });

  // Limit form to last 5
  Object.values(tableMap).forEach(row => {
    row.forma = row.forma.slice(-5);
  });

  // Sort: Punti > Differenza Reti > Gol Fatti > Alfabetico
  const rows = Object.values(tableMap);
  rows.sort((a, b) => {
    if (b.punti !== a.punti) return b.punti - a.punti;
    if (b.differenzaReti !== a.differenzaReti) return b.differenzaReti - a.differenzaReti;
    if (b.golFatti !== a.golFatti) return b.golFatti - a.golFatti;
    return a.clubNome.localeCompare(b.clubNome);
  });

  return rows;
}
