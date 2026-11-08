/**
 * MOTORE DELLE SELEZIONI NAZIONALI & TORNEI PAN-MEDITERRANEI
 * Gestisce le 16 Grandi Nazionali del Mondo Antico (I secolo a.C.),
 * convocazioni automatiche basate sulla nazionalità e sul valore generale degli atleti,
 * e il prestigioso Torneo delle Civiltà dell'Harpastum ("Ludi Panathenaici & Certamen Nationum").
 */

import type { NationalTeam, NationalMatch, Player, CareerSave } from '../types';
import { convertBCToOlympicEra } from './calendarEngine';

export interface NationalCivilization {
  id: string;
  nome: string;
  regioneOrigine: string;
  cultura: string;
  sigla: string;
  stemmaColore: string;
  descrizione: string;
  reputazione: number;
}

export const OFFICIAL_NATIONAL_CIVILIZATIONS: NationalCivilization[] = [
  {
    id: 'nat_roma',
    nome: 'Selezione Italica (SPQR Roma)',
    regioneOrigine: 'Italia & Latium',
    cultura: 'Romana / Italica',
    sigla: 'ITA',
    stemmaColore: '#991b1b',
    descrizione: 'I campioni della Repubblica Romana e delle colonie italiche: disciplina ferrea, difesa impenetrabile e supremazia fisica.',
    reputazione: 980
  },
  {
    id: 'nat_grecia',
    nome: 'Lega Panellenica (Ellade)',
    regioneOrigine: 'Grecia & Peloponneso',
    cultura: 'Greca Classica',
    sigla: 'ELL',
    stemmaColore: '#1e3a8a',
    descrizione: 'La culla dei giochi atletici: agilità innata, finte magistrali e maestri indiscussi della piccola sfera di cuoio.',
    reputazione: 960
  },
  {
    id: 'nat_egitto',
    nome: 'Regno Tolemaico d’Egitto',
    regioneOrigine: 'Egitto & Nilo',
    cultura: 'Egizia / Ellenistica',
    sigla: 'EGY',
    stemmaColore: '#ca8a04',
    descrizione: 'I giganti del delta del Nilo e di Alessandria: tecnica sopraffina, velocità sulla sabbia e ricchezza tattica.',
    reputazione: 940
  },
  {
    id: 'nat_gallia',
    nome: 'Confederazione dei Popoli Celti (Gallia)',
    regioneOrigine: 'Gallia Transalpina & Celtica',
    cultura: 'Gallica / Celtica',
    sigla: 'GAL',
    stemmaColore: '#15803d',
    descrizione: 'Guerrieri imponenti e lottatori instancabili: sfondamenti devastanti e resistenza alle fatiche dell\'arena.',
    reputazione: 930
  },
  {
    id: 'nat_cartagine',
    nome: 'Nuova Cartagine & Africa Punica',
    regioneOrigine: 'Africa Punica & Cartagine',
    cultura: 'Punica / Fenicia',
    sigla: 'PUN',
    stemmaColore: '#701a75',
    descrizione: 'Eredi della gloria di Annibale: organizzazione tattica rigorosa, furbizia atletica e precisione nei lanci.',
    reputazione: 935
  },
  {
    id: 'nat_iberia',
    nome: 'Lega Celtiberica & Lusitana',
    regioneOrigine: 'Hispania & Baetica',
    cultura: 'Iberica / Celtibera',
    sigla: 'IBE',
    stemmaColore: '#c2410c',
    descrizione: 'Scattisti feroci abituati alle aspre montagne e al caldo torrido: scatto fulmineo e combattività.',
    reputazione: 910
  },
  {
    id: 'nat_persia',
    nome: 'Impero Partico & Persiano',
    regioneOrigine: 'Persia & Altopiano Iranico',
    cultura: 'Persiana / Partica',
    sigla: 'PAR',
    stemmaColore: '#047857',
    descrizione: 'I maestri della freccia e dell\'inganno: passaggi a parabola millimetrici e ritirate finte per colpire a sorpresa.',
    reputazione: 925
  },
  {
    id: 'nat_germania',
    nome: 'Tribù Unite della Germania',
    regioneOrigine: 'Germania & Selva Ercinia',
    cultura: 'Germanica / Sveva',
    sigla: 'GER',
    stemmaColore: '#334155',
    descrizione: 'Forza bruta e ferocia primordiale: lottatori titanici che travolgono le linee difensive avversarie.',
    reputazione: 900
  },
  {
    id: 'nat_britannia',
    nome: 'Regni Insulari di Britannia',
    regioneOrigine: 'Britannia & Isole del Nord',
    cultura: 'Britannica / Iceni',
    sigla: 'BRI',
    stemmaColore: '#0284c7',
    descrizione: 'Atleti temprati dalle nebbie e dal freddo: determinazione indomita e cariche irrefrenabili.',
    reputazione: 880
  },
  {
    id: 'nat_macedonia',
    nome: 'Falange Macedone',
    regioneOrigine: 'Macedonia & Tracia',
    cultura: 'Macedone',
    sigla: 'MAC',
    stemmaColore: '#b45309',
    descrizione: 'Eredi di Alessandro Magno: coordinazione di gruppo perfetta e sbarramenti impenetrabili.',
    reputazione: 915
  },
  {
    id: 'nat_siria',
    nome: 'Seleucide di Siria & Levante',
    regioneOrigine: 'Siria & Antiochia',
    cultura: 'Siriana / Aramea',
    sigla: 'SYR',
    stemmaColore: '#4338ca',
    descrizione: 'Fusione di sapienza greca e vigore orientale: inventiva nelle finte e passaggi imprevedibili.',
    reputazione: 895
  },
  {
    id: 'nat_armenia',
    nome: 'Regno della Grande Armenia',
    regioneOrigine: 'Armenia & Caucaso',
    cultura: 'Armena',
    sigla: 'ARM',
    stemmaColore: '#be123c',
    descrizione: 'Atleti d\'alta quota: resistenza polmonare fuori dal comune e contrasti decisi al limite del regolamento.',
    reputazione: 890
  },
  {
    id: 'nat_numidia',
    nome: 'Cavalieri dell’Arena di Numidia',
    regioneOrigine: 'Numidia & Atlante',
    cultura: 'Numidica / Berbera',
    sigla: 'NUM',
    stemmaColore: '#854d0e',
    descrizione: 'I cursori più veloci del continente: accelerazioni brucianti che lasciano sul posto qualsiasi guardia.',
    reputazione: 885
  },
  {
    id: 'nat_nubia',
    nome: 'Regno di Kush & Nubia',
    regioneOrigine: 'Nubia & Meroe',
    cultura: 'Nubiana / Kushita',
    sigla: 'NUB',
    stemmaColore: '#4d7c0f',
    descrizione: 'Atleti longilinei e potenti: elevazione formidabile e dominanza assoluta nei duelli aerei per la palla.',
    reputazione: 875
  },
  {
    id: 'nat_dacia',
    nome: 'Guerrieri del Dragone Dacico',
    regioneOrigine: 'Dacia & Danubio',
    cultura: 'Dacica',
    sigla: 'DAC',
    stemmaColore: '#155e75',
    descrizione: 'Coraggio senza paura della morte: placcaggi senza risparmio d\'energia e dedizione totale alla vittoria.',
    reputazione: 870
  },
  {
    id: 'nat_arabia',
    nome: 'Lega Nabatea delle Carovane',
    regioneOrigine: 'Arabia & Petra',
    cultura: 'Nabatea / Araba',
    sigla: 'NAB',
    stemmaColore: '#b91c1c',
    descrizione: 'Maestri del deserto roccioso: resistenza inesausta sotto il sole e passaggi rapidi di prima intenzione.',
    reputazione: 865
  }
];

/**
 * Converte la nazionalità testuale del giocatore in ID Nazionale.
 */
export function getNationalTeamIdForPlayer(player: Player): string {
  const nat = (player.nazionalita || '').toLowerCase();
  const reg = (player.regione || '').toLowerCase();

  if (nat.includes('rom') || nat.includes('ita') || reg.includes('latium') || reg.includes('italia')) return 'nat_roma';
  if (nat.includes('grec') || nat.includes('ell') || reg.includes('grecia') || reg.includes('atene') || reg.includes('sparta')) return 'nat_grecia';
  if (nat.includes('egiz') || nat.includes('nil') || reg.includes('egitto') || reg.includes('alessandria')) return 'nat_egitto';
  if (nat.includes('gall') || nat.includes('celt') || reg.includes('gallia')) return 'nat_gallia';
  if (nat.includes('pun') || nat.includes('cart') || reg.includes('cartagine') || reg.includes('africa')) return 'nat_cartagine';
  if (nat.includes('ibe') || nat.includes('hisp') || nat.includes('lusit') || reg.includes('iberia')) return 'nat_iberia';
  if (nat.includes('pers') || nat.includes('part') || reg.includes('persia')) return 'nat_persia';
  if (nat.includes('germ') || nat.includes('svev') || reg.includes('germania')) return 'nat_germania';
  if (nat.includes('brit') || reg.includes('britannia')) return 'nat_britannia';
  if (nat.includes('mace') || reg.includes('macedonia')) return 'nat_macedonia';
  if (nat.includes('siri') || nat.includes('antioc') || reg.includes('siria')) return 'nat_siria';
  if (nat.includes('arme') || reg.includes('armenia')) return 'nat_armenia';
  if (nat.includes('numi') || reg.includes('numidia')) return 'nat_numidia';
  if (nat.includes('nubi') || nat.includes('kush') || reg.includes('nubia') || reg.includes('etio')) return 'nat_nubia';
  if (nat.includes('daci') || nat.includes('trac') || reg.includes('dacia')) return 'nat_dacia';
  if (nat.includes('arab') || nat.includes('naba') || reg.includes('arabia')) return 'nat_arabia';

  return 'nat_roma';
}

/**
 * Inizializza le 16 Nazionali convocando automaticamente i migliori 18 atleti del database per ciascuna.
 */
export function initializeNationalTeams(allPlayers: Record<string, Player>): Record<string, NationalTeam> {
  const teams: Record<string, NationalTeam> = {};
  const playersByNat: Record<string, Player[]> = {};

  for (const civ of OFFICIAL_NATIONAL_CIVILIZATIONS) {
    playersByNat[civ.id] = [];
  }

  for (const p of Object.values(allPlayers)) {
    const natId = getNationalTeamIdForPlayer(p);
    if (playersByNat[natId]) {
      playersByNat[natId].push(p);
    }
  }

  for (const civ of OFFICIAL_NATIONAL_CIVILIZATIONS) {
    const pool = playersByNat[civ.id] || [];
    // Ordina per OVR decrescente
    pool.sort((a, b) => b.valoreGenerale - a.valoreGenerale);
    const convocati = pool.slice(0, 18).map(p => p.id);

    teams[civ.id] = {
      id: civ.id,
      nome: civ.nome,
      regione: civ.regioneOrigine,
      cultura: civ.cultura,
      sigla: civ.sigla,
      stemmaColore: civ.stemmaColore,
      reputazione: civ.reputazione,
      giocatoriConvocatiIds: convocati,
      commissarioTecnico: `Praefectus ${civ.nome.split(' ')[0]}`,
      partiteGiocate: 0,
      vittorie: 0,
      pareggi: 0,
      sconfitte: 0,
      trofeiVinti: []
    };
  }

  return teams;
}

/**
 * Genera il calendario degli scontri tra Nazionali (Certamen Nationum).
 */
export function generateNationalMatches(yearBC: number = 50): NationalMatch[] {
  const matches: NationalMatch[] = [];
  const era = convertBCToOlympicEra(yearBC);

  const civs = OFFICIAL_NATIONAL_CIVILIZATIONS;
  // Scontri diretti prestigiosi tra le civiltà antiche
  const classicDuels: [string, string][] = [
    ['nat_roma', 'nat_cartagine'],   // Roma vs Cartagine (Guerra Punica dell'Arena)
    ['nat_grecia', 'nat_persia'],     // Grecia vs Persia (Termopili dell'Harpastum)
    ['nat_egitto', 'nat_roma'],       // Egitto vs Roma (Duello del Mediterraneo)
    ['nat_gallia', 'nat_germania'],   // Gallia vs Germania (Clash delle Foreste)
    ['nat_iberia', 'nat_roma'],       // Iberia vs Roma (Scontro di Numanzia)
    ['nat_macedonia', 'nat_grecia'],  // Macedonia vs Grecia (Supremazia Ellenica)
    ['nat_britannia', 'nat_gallia'],  // Britannia vs Gallia (Duello della Manica)
    ['nat_numidia', 'nat_egitto']     // Numidia vs Egitto (Dominio Africano)
  ];

  classicDuels.forEach((duel, idx) => {
    matches.push({
      id: `nat_match_${idx + 1}`,
      torneo: 'Certamen Nationum (Torneo delle Civiltà)',
      stagioneAnno: -yearBC,
      dataCalendario: `Giochi Panellenici · ${era.displayText}`,
      nazionaleCasaId: duel[0],
      nazionaleOspiteId: duel[1],
      disputata: false
    });
  });

  return matches;
}

/**
 * Simula un incontro ufficiale tra due Nazionali di Harpastum.
 */
export function simulateNationalMatch(
  match: NationalMatch,
  teams: Record<string, NationalTeam>,
  allPlayers: Record<string, Player>
): NationalMatch {
  const home = teams[match.nazionaleCasaId];
  const away = teams[match.nazionaleOspiteId];

  const getTeamPower = (t: NationalTeam) => {
    const roster = (t.giocatoriConvocatiIds || []).map(id => allPlayers[id]).filter(Boolean);
    if (roster.length === 0) return t.reputazione / 12;
    const avgOvr = roster.reduce((sum, p) => sum + p.valoreGenerale, 0) / roster.length;
    return avgOvr;
  };

  const pHome = getTeamPower(home);
  const pAway = getTeamPower(away);

  const meteHome = Math.max(0, Math.round((pHome / 18) - 1.5 + (Math.random() * 3.5)));
  const meteAway = Math.max(0, Math.round((pAway / 18) - 1.5 + (Math.random() * 3.5)));

  // Seleziona il miglior atleta della gara
  const homeRoster = (home.giocatoriConvocatiIds || []).map(id => allPlayers[id]).filter(Boolean);
  const awayRoster = (away.giocatoriConvocatiIds || []).map(id => allPlayers[id]).filter(Boolean);
  const starPool = meteHome >= meteAway ? homeRoster : awayRoster;
  const mvp = starPool[0] ? `${starPool[0].nome} ${starPool[0].cognome}` : 'Praeveniens Primus';

  home.partiteGiocate += 1;
  away.partiteGiocate += 1;

  if (meteHome > meteAway) {
    home.vittorie += 1;
    away.sconfitte += 1;
  } else if (meteAway > meteHome) {
    away.vittorie += 1;
    home.sconfitte += 1;
  } else {
    home.pareggi += 1;
    away.pareggi += 1;
  }

  return {
    ...match,
    disputata: true,
    meteCasa: meteHome,
    meteOspite: meteAway,
    migliorAtleta: mvp
  };
}
