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
 * Converte la nazionalità e la regione testuale dell'atleta in ID Nazionale.
 * Evita collisioni di sottostringhe (es. "brITAnna" vs "ita", "daNUBIus" vs "nubi")
 * e NON riversa più automaticamente gli stranieri o gli svincolati in nat_roma.
 */
export function getNationalTeamIdForPlayer(player: Player): string | null {
  const nat = (player.nazionalita || '').toLowerCase().trim();
  const reg = (player.regione || '').toLowerCase().trim();
  const combined = `${nat} ${reg}`;

  // Svincolati generici senza nazionalità dichiarata non entrano nelle selezioni
  if (nat.includes('libero dell') || reg.includes('mercati dell')) {
    return null;
  }

  // 1. Britannia (controllata PRIMA di qualsiasi controllo "ita" per evitare brITAnna)
  if (
    nat.includes('brit') ||
    reg.includes('britannia') ||
    reg.includes('cambria') ||
    reg.includes('cantium') ||
    reg.includes('dumnonia') ||
    reg.includes('mona insula')
  ) {
    return 'nat_britannia';
  }

  // 2. Egitto & Nilo (include Aegyptus, Thebais, Heptanomia, Fayum, Delta Nili, Mare Rubrum)
  if (
    nat.includes('egiz') ||
    nat.includes('aegypt') ||
    nat.includes('nil') ||
    nat.includes('theba') ||
    nat.includes('fayum') ||
    nat.includes('heptanom') ||
    reg.includes('egitto') ||
    reg.includes('aegyptus') ||
    reg.includes('alessandria') ||
    reg.includes('alexandria') ||
    reg.includes('thebais') ||
    reg.includes('heptanomia') ||
    reg.includes('delta nili') ||
    reg.includes('fayum') ||
    reg.includes('mare rubrum')
  ) {
    return 'nat_egitto';
  }

  // 3. Siria & Levante (include Syria / Phoenice / Coele Syria / Palmyrena)
  if (
    nat.includes('siri') ||
    nat.includes('syri') ||
    nat.includes('phoen') ||
    nat.includes('fenic') ||
    reg.includes('syria') ||
    reg.includes('siria') ||
    reg.includes('phoenice') ||
    reg.includes('antiochia') ||
    reg.includes('palmyr') ||
    reg.includes('palaest')
  ) {
    return 'nat_siria';
  }

  // 4. Dacia & Tracia (controllata PRIMA di Nubia perché "daNUBIus" contiene "nubi")
  if (
    nat.includes('daci') ||
    nat.includes('trac') ||
    nat.includes('thrac') ||
    nat.includes('danub') ||
    nat.includes('moesia') ||
    nat.includes('oltenia') ||
    nat.includes('transilvania') ||
    nat.includes('banatus') ||
    nat.includes('moldavia') ||
    reg.includes('dacia') ||
    reg.includes('danubius') ||
    reg.includes('oltenia') ||
    reg.includes('transilvania') ||
    reg.includes('maramures') ||
    reg.includes('scythia minor') ||
    reg.includes('banatus') ||
    reg.includes('moldavia') ||
    reg.includes('thracia') ||
    reg.includes('thracica') ||
    reg.includes('moesia') ||
    reg.includes('pontus sinister') ||
    reg.includes('rhodope') ||
    reg.includes('propontis') ||
    reg.includes('bosphorus')
  ) {
    return 'nat_dacia';
  }

  // 5. Nubia, Kush & Axum (senza matchare Danubius)
  if (
    nat.includes('nubi') ||
    nat.includes('kush') ||
    nat.includes('etio') ||
    nat.includes('axum') ||
    nat.includes('abissin') ||
    reg.includes('nubia') ||
    reg.includes('kush') ||
    reg.includes('abissin') ||
    reg.includes('corno d') ||
    reg.includes('costa del mar rosso')
  ) {
    return 'nat_nubia';
  }

  // 6. Numidia & Mauretania (controllata PRIMA di "ita" per via di maurITAna)
  if (
    nat.includes('numid') ||
    nat.includes('mauret') ||
    reg.includes('numidia') ||
    reg.includes('aures') ||
    reg.includes('mauretania')
  ) {
    return 'nat_numidia';
  }

  // 7. Iberia & Lusitania (controllata PRIMA di "ita" per via di lusITAna)
  if (
    nat.includes('iber') ||
    nat.includes('hisp') ||
    nat.includes('lusit') ||
    nat.includes('celtib') ||
    nat.includes('gallaec') ||
    nat.includes('astur') ||
    reg.includes('hispania') ||
    reg.includes('iberia') ||
    reg.includes('celtiberia') ||
    reg.includes('lusitania') ||
    reg.includes('gallaecia') ||
    reg.includes('asturia')
  ) {
    return 'nat_iberia';
  }

  // 8. Germania & Selva Ercinia
  if (
    nat.includes('germ') ||
    nat.includes('svev') ||
    nat.includes('sueb') ||
    nat.includes('hassia') ||
    nat.includes('jutland') ||
    nat.includes('frisia') ||
    nat.includes('rhenus') ||
    nat.includes('batav') ||
    reg.includes('germania') ||
    reg.includes('hassia') ||
    reg.includes('jutlandia') ||
    reg.includes('boiohaemum') ||
    reg.includes('frisia') ||
    reg.includes('rhenus') ||
    reg.includes('batavorum') ||
    reg.includes('thuringia') ||
    reg.includes('suebia') ||
    reg.includes('quadiae') ||
    reg.includes('westfalia')
  ) {
    return 'nat_germania';
  }

  // 9. Roma & Italia (inclusa Gallia Cisalpina, controllata PRIMA di Gallia Transalpina)
  if (
    /\brom(an|ana|ano|ani)?\b/.test(nat) ||
    /\bital(ic|ica|ico|ia)?\b/.test(nat) ||
    nat === 'latium' ||
    nat === 'campania' ||
    nat === 'aemilia' ||
    nat === 'sicilia' ||
    nat === 'venetia' ||
    nat === 'etruria' ||
    nat === 'samnium' ||
    nat === 'bruttium' ||
    nat === 'calabria antiqua' ||
    nat === 'gallia cisalpina' ||
    reg.includes('latium') ||
    reg.includes('italia') ||
    reg.includes('campania') ||
    reg.includes('gallia cisalpina') ||
    reg.includes('aemilia') ||
    reg.includes('sicilia') ||
    reg.includes('venetia') ||
    reg.includes('calabria') ||
    reg.includes('etruria') ||
    reg.includes('samnium') ||
    reg.includes('bruttium')
  ) {
    return 'nat_roma';
  }

  // 10. Gallia Transalpina & Celtica
  if (
    nat.includes('gall') ||
    nat.includes('celt') ||
    nat.includes('aquit') ||
    reg.includes('gallia') ||
    reg.includes('aquitania')
  ) {
    return 'nat_gallia';
  }

  // 11. Cartagine & Africa Punica (incl. Zeugitana, Byzacena, Tripolitania, Cirenaica)
  if (
    nat.includes('punic') ||
    nat.includes('cartag') ||
    nat.includes('carthag') ||
    nat.includes('poen') ||
    nat.includes('zeugit') ||
    nat.includes('byzac') ||
    nat.includes('tripolit') ||
    nat.includes('syrtic') ||
    nat.includes('cirena') ||
    nat.includes('marmar') ||
    reg.includes('cartagine') ||
    reg.includes('carthago') ||
    reg.includes('zeugitana') ||
    reg.includes('byzacena') ||
    reg.includes('cap bon') ||
    reg.includes('tripolitania') ||
    reg.includes('syrtica') ||
    reg.includes('cirenaica') ||
    reg.includes('marmarica')
  ) {
    return 'nat_cartagine';
  }

  // 12. Macedonia, Epiro & Illiria/Dalmazia
  if (
    nat.includes('maced') ||
    nat.includes('epir') ||
    nat.includes('illyr') ||
    nat.includes('illir') ||
    nat.includes('dalma') ||
    nat.includes('istria') ||
    nat.includes('liburn') ||
    reg.includes('macedonia') ||
    reg.includes('epirus') ||
    reg.includes('pieria') ||
    reg.includes('chalcidice') ||
    reg.includes('paeonia') ||
    reg.includes('illyria') ||
    reg.includes('illiria') ||
    reg.includes('dalmazia') ||
    reg.includes('dalmata') ||
    reg.includes('liburnia') ||
    reg.includes('adriatiche') ||
    reg.includes('istria')
  ) {
    return 'nat_macedonia';
  }

  // 13. Grecia, Peloponneso & Ionia/Anatolia Egea
  if (
    nat.includes('grec') ||
    nat.includes('ell') ||
    nat.includes('hell') ||
    nat.includes('attic') ||
    nat.includes('lacon') ||
    nat.includes('achae') ||
    nat.includes('boeot') ||
    nat.includes('ionia') ||
    nat.includes('aeolis') ||
    nat.includes('caria') ||
    nat.includes('lydia') ||
    nat.includes('mysia') ||
    reg.includes('grecia') ||
    reg.includes('atene') ||
    reg.includes('sparta') ||
    reg.includes('attica') ||
    reg.includes('laconia') ||
    reg.includes('achaea') ||
    reg.includes('boeotia') ||
    reg.includes('aegaeae') ||
    reg.includes('phocis') ||
    reg.includes('elis') ||
    reg.includes('argolis') ||
    reg.includes('euboea') ||
    reg.includes('thessalia') ||
    reg.includes('megaris') ||
    reg.includes('ionia') ||
    reg.includes('aeolis') ||
    reg.includes('caria') ||
    reg.includes('lydia') ||
    reg.includes('mysia')
  ) {
    return 'nat_grecia';
  }

  // 14. Armenia, Caucaso, Cappadocia, Cilicia & Ponto
  if (
    nat.includes('armen') ||
    nat.includes('cappad') ||
    nat.includes('cilic') ||
    nat.includes('pont') ||
    nat.includes('ararat') ||
    nat.includes('colchid') ||
    reg.includes('armenia') ||
    reg.includes('ararat') ||
    reg.includes('tospitis') ||
    reg.includes('kotayk') ||
    reg.includes('sophene') ||
    reg.includes('vanand') ||
    reg.includes('daranaghi') ||
    reg.includes('arzanene') ||
    reg.includes('moxoene') ||
    reg.includes('siwnik') ||
    reg.includes('vaspurakan') ||
    reg.includes('cappadocia') ||
    reg.includes('taurus') ||
    reg.includes('cilicia') ||
    reg.includes('pontica') ||
    reg.includes('pontus') ||
    reg.includes('colchide') ||
    reg.includes('lykos') ||
    reg.includes('iris')
  ) {
    return 'nat_armenia';
  }

  // 15. Arabia & Nabatea
  if (
    nat.includes('arab') ||
    nat.includes('nabat') ||
    nat.includes('sabe') ||
    nat.includes('saba') ||
    reg.includes('arabia') ||
    reg.includes('nabate') ||
    reg.includes('saba') ||
    reg.includes('hadramawt') ||
    reg.includes('qataban') ||
    reg.includes('ma’in') ||
    reg.includes('himyar') ||
    reg.includes('dhofar') ||
    reg.includes('troglodyt') ||
    reg.includes('hijaz') ||
    reg.includes('hawran') ||
    reg.includes('decapolis') ||
    reg.includes('ammonitis') ||
    reg.includes('moabitis') ||
    reg.includes('negev') ||
    reg.includes('aqaba') ||
    reg.includes('sirhan') ||
    reg.includes('deserto di rum')
  ) {
    return 'nat_arabia';
  }

  // 16. Impero Persiano, Partico, Battriana & Sarmatia
  if (
    nat.includes('pers') ||
    nat.includes('part') ||
    nat.includes('bactr') ||
    nat.includes('sogd') ||
    nat.includes('sarmat') ||
    nat.includes('scit') ||
    nat.includes('mesopot') ||
    nat.includes('babyl') ||
    reg.includes('persis') ||
    reg.includes('persia') ||
    reg.includes('susiana') ||
    reg.includes('media') ||
    reg.includes('aria') ||
    reg.includes('carmania') ||
    reg.includes('drangiana') ||
    reg.includes('arachosia') ||
    reg.includes('margiana') ||
    reg.includes('mesopotamia') ||
    reg.includes('parthia') ||
    reg.includes('babylonia') ||
    reg.includes('characene') ||
    reg.includes('astabene') ||
    reg.includes('adiabene') ||
    reg.includes('bactria') ||
    reg.includes('sogdiana') ||
    reg.includes('paropamisadae') ||
    reg.includes('pamir') ||
    reg.includes('scit') ||
    reg.includes('bosforo') ||
    reg.includes('tauride') ||
    reg.includes('meotide') ||
    reg.includes('sarmat')
  ) {
    return 'nat_persia';
  }

  // Nessun fallback cieco su Roma: evita contaminazione con atleti di altre province
  if (combined.includes('roma')) return 'nat_roma';
  return null;
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
    if (natId && playersByNat[natId]) {
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
 * Aggiorna le convocazioni di una carriera esistente preservando statistiche e trofei già conseguiti.
 */
export function refreshNationalTeamsRosters(
  existingTeams: Record<string, NationalTeam> | undefined,
  allPlayers: Record<string, Player>
): Record<string, NationalTeam> {
  const freshTeams = initializeNationalTeams(allPlayers);
  if (!existingTeams) return freshTeams;

  const merged: Record<string, NationalTeam> = {};
  for (const [id, fresh] of Object.entries(freshTeams)) {
    const prev = existingTeams[id];
    merged[id] = prev
      ? {
          ...prev,
          giocatoriConvocatiIds: fresh.giocatoriConvocatiIds
        }
      : fresh;
  }
  return merged;
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
