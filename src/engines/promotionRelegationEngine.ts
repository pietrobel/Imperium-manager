/**
 * MOTORE DI PROMOZIONE & RETROCESSIONE TRA DIVISIONI
 * Gestisce l'interscambio piramidale tra le Leghe Maggiori (Prima Divisio - Livello 1)
 * e le Leghe Cadette Regionali (Secunda Divisio - Livello 2).
 *
 * Le 30 Leghe sono raggruppate in 15 Sistemi Piramidali Territoriali a due livelli (1 e 2):
 * Al termine della stagione:
 * - Le ultime 2 classificate della Lega di Livello 1 retrocedono in Livello 2.
 * - Le prime 2 classificate della Lega di Livello 2 vengono promosse con trionfo in Livello 1.
 */

import type { Club, League, LeagueTableRow, CareerSave } from '../types';
import { calculateLeagueTable } from './leagueEngine';

export interface PromotionRelegationPair {
  topLeagueId: string;
  subLeagueId: string;
  name: string;
  numTeamsToSwap: number; // solitamente 2 squadre
}

export interface PromotionRelegationMovement {
  clubId: string;
  clubNome: string;
  fromLeagueId: string;
  fromLeagueName: string;
  toLeagueId: string;
  toLeagueName: string;
  type: 'PROMOTION' | 'RELEGATION';
  pos: number;
}

/**
 * Mappa dei 15 Sistemi Territoriali di Promozione/Retrocessione.
 * Collega ogni Lega Principale con la rispettiva Lega Cadetta Territoriale.
 */
export const PYRAMID_LEAGUE_PAIRS: PromotionRelegationPair[] = [
  // 1. Italia & Latium (Lega Romana L1 <-> Lega Illirica L2)
  { topLeagueId: 'league_romana', subLeagueId: 'league_illirica', name: 'Circuito Italico-Illirico', numTeamsToSwap: 2 },
  // 2. Gallia (Lega Gallica L1 <-> Lega Britannica L2)
  { topLeagueId: 'league_gallica', subLeagueId: 'league_britannica', name: 'Circuito Celtico Nord-Occidentale', numTeamsToSwap: 2 },
  // 3. Hispania (Lega Iberica L1 <-> Lega Mauritana L2)
  { topLeagueId: 'league_iberica', subLeagueId: 'league_mauritana', name: 'Circuito delle Colonne d’Ercole', numTeamsToSwap: 2 },
  // 4. Africa Punica (Lega Cartaginese L1 <-> Lega Africana L2)
  { topLeagueId: 'league_cartaginese', subLeagueId: 'league_africana', name: 'Circuito Africano-Punico', numTeamsToSwap: 2 },
  // 5. Grecia (Lega Greca L1 <-> Lega Macedone L2)
  { topLeagueId: 'league_greca', subLeagueId: 'league_macedone', name: 'Circuito Panellenico & Egeo', numTeamsToSwap: 2 },
  // 6. Egitto & Nilo (Lega Egizia L1 <-> Lega Nubiana L2)
  { topLeagueId: 'league_egizia', subLeagueId: 'league_nubiana', name: 'Circuito Nilotico & Alto Egitto', numTeamsToSwap: 2 },
  // 7. Vicino Oriente (Lega Siriana L1 <-> Lega Arabica L2)
  { topLeagueId: 'league_siriana', subLeagueId: 'league_arabica', name: 'Circuito Levantino & Nabateo', numTeamsToSwap: 2 },
  // 8. Asia Minore (Lega Anatolica L1 <-> Lega Pontica L2)
  { topLeagueId: 'league_anatolica', subLeagueId: 'league_pontica', name: 'Circuito Anatolico & Ponto Eussino', numTeamsToSwap: 2 },
  // 9. Persia & Oriente (Lega Persiana L1 <-> Lega Partica L2)
  { topLeagueId: 'league_persiana', subLeagueId: 'league_partica', name: 'Circuito Imperiale Partico-Persiano', numTeamsToSwap: 2 },
  // 10. Caucaso & Steppe (Lega Armena L1 <-> Lega Sarmatica L2)
  { topLeagueId: 'league_armena', subLeagueId: 'league_sarmatica', name: 'Circuito Caucasico & Scitico', numTeamsToSwap: 2 },
  // 11. Danubio & Balcani (Lega Dacica L1 <-> Lega Tracica L2)
  { topLeagueId: 'league_dacica', subLeagueId: 'league_tracica', name: 'Circuito Danubiano & Balcanico', numTeamsToSwap: 2 },
  // 12. Terre Germaniche (Lega Germanica L1 <-> Lega Battriana L2)
  { topLeagueId: 'league_germanica', subLeagueId: 'league_battriana', name: 'Circuito delle Terre Esterne & Confini', numTeamsToSwap: 2 },
  // 13. Maghreb Occidentale (Lega Numidica L1 <-> Lega Cirenaica L2)
  { topLeagueId: 'league_numidica', subLeagueId: 'league_cirenaica', name: 'Circuito del Deserto & Marmarica', numTeamsToSwap: 2 },
  // 14. Corno d'Africa & Mare Rosso (Lega Etiopica L1 <-> Lega Nabatea L2)
  { topLeagueId: 'league_etiopica', subLeagueId: 'league_nabatea', name: 'Circuito del Mare Eritreo & Incenso', numTeamsToSwap: 2 },
  // 15. Porte d'Asia (Lega Cilicia L1 <-> Lega Cappadoce L2)
  { topLeagueId: 'league_cilicia', subLeagueId: 'league_cappadoce', name: 'Circuito del Tauro & Porte Cilicie', numTeamsToSwap: 2 }
];

/**
 * Calcola ed esegue tutte le promozioni e retrocessioni per la nuova stagione.
 */
export function executePromotionAndRelegation(
  leagues: Record<string, League>,
  clubs: Record<string, Club>,
  matches: CareerSave['matches']
): {
  updatedLeagues: Record<string, League>;
  updatedClubs: Record<string, Club>;
  movements: PromotionRelegationMovement[];
} {
  const updatedLeagues = JSON.parse(JSON.stringify(leagues)) as Record<string, League>;
  const updatedClubs = JSON.parse(JSON.stringify(clubs)) as Record<string, Club>;
  const movements: PromotionRelegationMovement[] = [];

  for (const pair of PYRAMID_LEAGUE_PAIRS) {
    const topLeague = updatedLeagues[pair.topLeagueId];
    const subLeague = updatedLeagues[pair.subLeagueId];

    if (!topLeague || !subLeague) continue;

    // Assicura l'indicazione dei livelli (Livello 1 e Livello 2)
    topLeague.livello = 1;
    subLeague.livello = 2;
    topLeague.retrocessioni = pair.numTeamsToSwap;
    subLeague.promozioni = pair.numTeamsToSwap;

    // Calcola le classifiche finali
    const topTable = calculateLeagueTable(topLeague.id, updatedClubs, matches);
    const subTable = calculateLeagueTable(subLeague.id, updatedClubs, matches);

    if (topTable.length < pair.numTeamsToSwap || subTable.length < pair.numTeamsToSwap) {
      continue;
    }

    // Identifica le squadre retrocesse (ultimi posti in Livello 1)
    const relegatedRows = topTable.slice(topTable.length - pair.numTeamsToSwap);
    // Identifica le squadre promosse (primi posti in Livello 2)
    const promotedRows = subTable.slice(0, pair.numTeamsToSwap);

    const relegatedClubIds = relegatedRows.map(r => r.clubId);
    const promotedClubIds = promotedRows.map(r => r.clubId);

    // Esegui lo scambio dei club tra le due leghe
    topLeague.clubIds = topLeague.clubIds.filter(id => !relegatedClubIds.includes(id)).concat(promotedClubIds);
    subLeague.clubIds = subLeague.clubIds.filter(id => !promotedClubIds.includes(id)).concat(relegatedClubIds);

    // Aggiorna l'appartenenza nel modello Club
    for (let i = 0; i < relegatedRows.length; i++) {
      const row = relegatedRows[i];
      const club = updatedClubs[row.clubId];
      if (club) {
        club.leagueId = subLeague.id;
        movements.push({
          clubId: club.id,
          clubNome: club.nome,
          fromLeagueId: topLeague.id,
          fromLeagueName: topLeague.nome,
          toLeagueId: subLeague.id,
          toLeagueName: subLeague.nome,
          type: 'RELEGATION',
          pos: topTable.length - pair.numTeamsToSwap + 1 + i
        });
      }
    }

    for (let i = 0; i < promotedRows.length; i++) {
      const row = promotedRows[i];
      const club = updatedClubs[row.clubId];
      if (club) {
        club.leagueId = topLeague.id;
        // Premio promozione per il club promosso
        club.saldoCassa += 1000000;
        club.budgetTrasferimenti += 800000;
        movements.push({
          clubId: club.id,
          clubNome: club.nome,
          fromLeagueId: subLeague.id,
          fromLeagueName: subLeague.nome,
          toLeagueId: topLeague.id,
          toLeagueName: topLeague.nome,
          type: 'PROMOTION',
          pos: i + 1
        });
      }
    }
  }

  return {
    updatedLeagues,
    updatedClubs,
    movements
  };
}
