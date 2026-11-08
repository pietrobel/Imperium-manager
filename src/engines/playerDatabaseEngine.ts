import type { Club, Foot, Player, PlayerAttributes, Role } from '../types';
import { buildInitialPlayers } from '../initialData/players';

// PRNG for fast deterministic player generation
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Cultural Onomastics Pool covering all 30 Leagues & Ancient Civilizations
export const ANCIENT_ONOMASTICS: Record<string, { first: string[]; last: string[] }> = {
  romana: {
    first: ['Marcus', 'Lucius', 'Gaius', 'Publius', 'Quintus', 'Titus', 'Decimus', 'Aulus', 'Sextus', 'Servius', 'Tiberius', 'Cnaeus', 'Appius', 'Manlius', 'Spurius', 'Numerius', 'Vibius', 'Faustus', 'Caelus', 'Tullus'],
    last: ['Valerius', 'Julius', 'Claudius', 'Cornelius', 'Fabius', 'Aemilius', 'Sempronius', 'Pompeius', 'Tullius', 'Licinius', 'Antonius', 'Domitius', 'Octavius', 'Scipio', 'Crassus', 'Brutus', 'Metellus', 'Cassius', 'Lepidus', 'Catilina', 'Sulla', 'Marius', 'Cato', 'Cicero']
  },
  gallica: {
    first: ['Vercingetorix', 'Dumnorix', 'Diviciacus', 'Catuvolcus', 'Ambiorix', 'Segovax', 'Litaviccus', 'Eporedorix', 'Camulogenus', 'Brennus', 'Lugotorix', 'Belenos', 'Teutatix', 'Casticus', 'Commius', 'Luernius', 'Acco', 'Boduognatus', 'Cavarinus', 'Correus'],
    last: ['Arvernus', 'Aeduus', 'Senon', 'Parisios', 'Sequanus', 'Biturix', 'Carnute', 'Bellovacus', 'Allobrox', 'Trever', 'Remus', 'Lingon', 'Venetus', 'Morinus', 'Menapius', 'Santone', 'Picton', 'Helvetius', 'Vocontius', 'Ambarrus']
  },
  iberica: {
    first: ['Indibilis', 'Mandonio', 'Viriathus', 'Audax', 'Ditalco', 'Minuro', 'Tanginus', 'Corocotta', 'Carus', 'Retogenes', 'Olindicus', 'Alorcus', 'Culchas', 'Turrus', 'Megara', 'Tautalus', 'Olyndicus', 'Caro', 'Lauro', 'Caesaros'],
    last: ['Baeticus', 'Celtiber', 'Lusitanus', 'Cantaber', 'Astur', 'Vascon', 'Ilergetes', 'Turdetanus', 'Edetanus', 'Oretanus', 'Carpetanus', 'Vetton', 'Vaccaeus', 'Bastetanus', 'Suessetanus', 'Callaicus', 'Gallaecus', 'Balearicus', 'Coniscus', 'Celticus']
  },
  punica: {
    first: ['Hamilcar', 'Hasdrubal', 'Hannibal', 'Mago', 'Hanno', 'Himilco', 'Gisco', 'Bostar', 'Bomilcar', 'Maharbal', 'Adherbal', 'Malchus', 'Carthalo', 'Baalhanan', 'Xanthippus', 'Melqartpilles', 'Bodashtart', 'Tabnit', 'Eshmunazar', 'Muttunbaal'],
    last: ['Barca', 'Gisco', 'Sufetes', 'Melqart', 'Tanit', 'Carthaginiensis', 'Uticensis', 'Byrsa', 'Hesperus', 'Sidonius', 'Tyrius', 'Poenus', 'Hadrumetinus', 'Leptitanus', 'Zamaeus', 'Thapsitanus', 'Sabratha', 'Oea', 'Clupea', 'Sicca']
  },
  greca: {
    first: ['Alexander', 'Demetrios', 'Aristoteles', 'Philoktetes', 'Nikias', 'Leonidas', 'Xenophon', 'Theon', 'Kallikrates', 'Parmenides', 'Straton', 'Krates', 'Alkibiades', 'Perikles', 'Brasidas', 'Kleon', 'Pelopidas', 'Epaminondas', 'Philopoimen', 'Aratos'],
    last: ['Peloponnesios', 'Attikos', 'Korinthios', 'Spartiates', 'Rhodios', 'Makedon', 'Milesios', 'Thebanus', 'Delphikos', 'Sikyonios', 'Argivus', 'Kretikos', 'Thessalos', 'Boiotios', 'Epirota', 'Eleios', 'Megareus', 'Chios', 'Samios', 'Lesbios']
  },
  egizia: {
    first: ['Ptolemaios', 'Amenhotep', 'Imhotep', 'Senusret', 'Nekau', 'Psamtik', 'Harsiese', 'Ankhsheshonq', 'Horus', 'Osiris', 'Khamwaset', 'Seti', 'Rameses', 'Thutmose', 'Djedhor', 'Nectanebo', 'Amasis', 'Apries', 'Pedubast', 'Inaros'],
    last: ['Niliotes', 'Memphites', 'Thebanus', 'Alexandrinus', 'Canopicus', 'Oasites', 'Lagides', 'Pharaonicus', 'Faiyum', 'Rosettanus', 'Saites', 'Abydenus', 'Coptos', 'Pelusiotes', 'Hermopolites', 'Tentyrites', 'Philensis', 'Bubastites', 'Athribites', 'Sebennytes']
  },
  persiana: {
    first: ['Cyrus', 'Darius', 'Artaxerxes', 'Mithridates', 'Tiridates', 'Spitamenes', 'Arsaces', 'Phraates', 'Surena', 'Mardonius', 'Hydarnes', 'Megabyzus', 'Ariobarzanes', 'Artabazus', 'Bardiya', 'Kambyses', 'Orodes', 'Gotarzes', 'Vonones', 'Pacorus'],
    last: ['Achaemenes', 'Suren', 'Karan', 'Spahbod', 'Bactrianus', 'Ecbatanus', 'Persepolites', 'Margianus', 'Sogdianus', 'Hyrkanus', 'Parthicus', 'Medus', 'Susianus', 'Elamites', 'Sagartius', 'Arianus', 'Chorasmius', 'Gedrosius', 'Carmanius', 'Pasargada']
  },
  germanica: {
    first: ['Arminius', 'Ariovistus', 'Segestes', 'Flavus', 'Maroboduus', 'Inguiomerus', 'Chariomerus', 'Veleda', 'Boiorix', 'Teutobod', 'Mullo', 'Gannicus', 'Cariovalda', 'Ballomar', 'Deudo', 'Sunno', 'Marbod', 'Thumelicus', 'Catualda', 'Civilis'],
    last: ['Cheruscus', 'Suebus', 'Chattus', 'Cimber', 'Teuton', 'Bructerus', 'Batavus', 'Frisius', 'Hermundurus', 'Marcomannus', 'Quadus', 'Semno', 'Chaucus', 'Tencteros', 'Usipetes', 'Sugamber', 'Ampsivarius', 'Treverus', 'Nervius', 'Tungrus']
  },
  britannica: {
    first: ['Cassivellaunus', 'Cunobeline', 'Togodumnus', 'Caratacus', 'Prasutagus', 'Adminius', 'Mandubracius', 'Tasgovanus', 'Addedomarus', 'Boduognatus', 'Venutius', 'Calgacus', 'Cogidubnus', 'Epaticcus', 'Dubnovellaunus', 'Tincomarus', 'Verica', 'Vellocatus', 'Antedios', 'Comux'],
    last: ['Catuvellaunus', 'Trinovans', 'Iceni', 'Brigante', 'Silure', 'Ordovice', 'Atrebates', 'Cantii', 'Dumnonius', 'Votadino', 'Caledonius', 'Belga', 'Dobunni', 'Corieltauvi', 'Parisii', 'Novantae', 'Selgovae', 'Damnonii', 'Epidii', 'Cornovii']
  },
  tracica: {
    first: ['Burebista', 'Decebalus', 'Seuthes', 'Kotys', 'Sitalkes', 'Spartacus', 'Dromichaetes', 'Rhemaxos', 'Oroles', 'Dicomes', 'Coson', 'Thiamarkos', 'Teres', 'Hebryzelmis', 'Berisades', 'Amadokos', 'Kersebleptes', 'Mostis', 'Sadalas', 'Rhaskouporis'],
    last: ['Odrysa', 'Bessus', 'Dacus', 'Geta', 'Serdus', 'Moesus', 'Triballus', 'Costoboc', 'Carpus', 'Bithynus', 'Apolloniates', 'Mesembrianus', 'Philippopolites', 'Seuthopolites', 'Sarmizegetusa', 'Apulensis', 'Napocensis', 'Buridavensis', 'Singidunensis', 'Dardanus']
  },
  sarmatica: {
    first: ['Sauromates', 'Skiluros', 'Palakos', 'Eumelos', 'Aisapos', 'Inismeus', 'Farzoios', 'Spadines', 'Zorsines', 'Ablabius', 'Goar', 'Respendial', 'Sangiban', 'Beorgor', 'Babai', 'Sarmiz', 'Kandak', 'Ochos', 'Aspar', 'Ardaric'],
    last: ['Tanaïtes', 'Borysthenites', 'Bosporanus', 'Maeotis', 'Roxolan', 'Iazyx', 'Aorsi', 'Sirax', 'Scytha', 'Alanus', 'Tauricus', 'Massageta', 'Chersonita', 'Theodosianus', 'Phanagoreus', 'Hermonassensis', 'Gorgippianus', 'Sindi', 'Cimmerius', 'Scythicus']
  },
  nabatea: {
    first: ['Aretas', 'Obodas', 'Malichos', 'Rabbel', 'Syllaeus', 'Dushara', 'Shaudat', 'Wael', 'Qosnathan', 'Hani', 'Malik', 'Zayd', 'Harith', 'Jadhima', 'Amr', 'Al-Aswad', 'Muawiya', 'Saad', 'Qays', 'Numayr'],
    last: ['Petraeus', 'Hegrensis', 'Bostrenus', 'Decapolites', 'Avdatensis', 'Caravanus', 'Sinaiticus', 'Thamudenus', 'Nabataeus', 'Sabaeus', 'Himyarita', 'Qataban', 'Hadramawt', 'Gerrhaeus', 'Ailanus', 'Dedanita', 'Taymaeus', 'Shabwensis', 'Maribensis', 'Dumataeus']
  },
  nubiana: {
    first: ['Taharqa', 'Piankhi', 'Alara', 'Aspelta', 'Anlamani', 'Nastasen', 'Tanyidamani', 'Harsiotef', 'Amanislo', 'Teriteqas', 'Bazen', 'Zoskales', 'Sembruthes', 'Aphilas', 'Endibis', 'Wazeba', 'Ousanas', 'Nezool', 'Kaleb', 'EllaAmida'],
    last: ['Meroiticus', 'Kushita', 'Napataeus', 'Cataractes', 'Dongolan', 'Kermaeus', 'Aethiopus', 'Blemmye', 'Nubianus', 'Axumita', 'Adulitanus', 'Yehaeus', 'Koloeus', 'Matarensis', 'Qohaitensis', 'Avalitanus', 'Mosylonites', 'Sarapionensis', 'Puntinus', 'Solebensis']
  }
};

// Identify cultural onomastics family from club metadata
export function getCultureFamilyForClub(club: Club): string {
  const leagueId = club.leagueId.toLowerCase();
  const reg = (club.regione || '').toLowerCase();
  const id = club.id.toLowerCase();

  if (leagueId.includes('roma') || id.includes('rom_') || reg.includes('latium') || reg.includes('italia')) return 'romana';
  if (leagueId.includes('gall') || id.includes('gal_') || reg.includes('gallia')) return 'gallica';
  if (leagueId.includes('iber') || id.includes('ibe_') || reg.includes('hispania')) return 'iberica';
  if (leagueId.includes('cart') || leagueId.includes('afri') || id.includes('car_') || id.includes('afr_')) return 'punica';
  if (leagueId.includes('grec') || leagueId.includes('mace') || id.includes('gre_') || id.includes('mac_')) return 'greca';
  if (leagueId.includes('egiz') || id.includes('egi_') || reg.includes('aegyptus')) return 'egizia';
  if (leagueId.includes('pers') || leagueId.includes('part') || leagueId.includes('batt') || leagueId.includes('arme')) return 'persiana';
  if (leagueId.includes('germ') || id.includes('ger_') || reg.includes('germania')) return 'germanica';
  if (leagueId.includes('brit') || id.includes('bri_') || reg.includes('britannia')) return 'britannica';
  if (leagueId.includes('trac') || leagueId.includes('daci') || id.includes('tra_') || id.includes('dac_')) return 'tracica';
  if (leagueId.includes('sarm') || id.includes('sar_') || reg.includes('scythia')) return 'sarmatica';
  if (leagueId.includes('naba') || leagueId.includes('arab') || id.includes('nab_') || id.includes('ara_')) return 'nabatea';
  if (leagueId.includes('nubi') || leagueId.includes('etio') || leagueId.includes('numi') || leagueId.includes('maur') || leagueId.includes('cire')) return 'nubiana';
  if (leagueId.includes('cili') || leagueId.includes('capp') || leagueId.includes('pont') || leagueId.includes('illi') || leagueId.includes('anat') || leagueId.includes('siri')) return 'greca';

  return 'romana';
}

const ROSTER_SLOTS: { role: Role; isStarter: boolean }[] = [
  // 11 Titolari (Balanced 4-3-3 / 4-4-2 standard)
  { role: 'POR', isStarter: true },
  { role: 'TD', isStarter: true },
  { role: 'DFC', isStarter: true },
  { role: 'DFC', isStarter: true },
  { role: 'TS', isStarter: true },
  { role: 'MED', isStarter: true },
  { role: 'CC', isStarter: true },
  { role: 'TRQ', isStarter: true },
  { role: 'AD', isStarter: true },
  { role: 'AS', isStarter: true },
  { role: 'ATT', isStarter: true },
  // 7 Panchina
  { role: 'POR', isStarter: false },
  { role: 'DFC', isStarter: false },
  { role: 'TD', isStarter: false },
  { role: 'CC', isStarter: false },
  { role: 'MED', isStarter: false },
  { role: 'ATT', isStarter: false },
  { role: 'AD', isStarter: false },
  // 7 Riserve / Giovani dell'Accademia (Total 25 players)
  { role: 'POR', isStarter: false },
  { role: 'TS', isStarter: false },
  { role: 'DFC', isStarter: false },
  { role: 'CC', isStarter: false },
  { role: 'TRQ', isStarter: false },
  { role: 'ATT', isStarter: false },
  { role: 'AS', isStarter: false }
];

const FEET: Foot[] = ['Destro', 'Destro', 'Destro', 'Sinistro', 'Sinistro', 'Ambidestro'];

function clamp20(val: number): number {
  return Math.max(1, Math.min(20, Math.round(val)));
}

/**
 * Generate a single player deterministically using mulberry32 PRNG.
 */
export function createDeterministicPlayer(
  club: Club | null,
  role: Role,
  slotIndex: number,
  isStarter: boolean,
  isFreeAgent: boolean,
  seedRng: () => number
): Player {
  const currentYearBC = -50;
  const isGK = role === 'POR';
  const isDef = ['DFC', 'TD', 'TS'].includes(role);
  const isMid = ['MED', 'CC', 'TRQ'].includes(role);
  const isAtt = ['ATT', 'AD', 'AS'].includes(role);

  // Determine age & tier
  let age: number;
  if (slotIndex < 11) {
    // Starters are in prime (22 - 31)
    age = 22 + Math.floor(seedRng() * 10);
  } else if (slotIndex < 18) {
    // Bench (20 - 32)
    age = 20 + Math.floor(seedRng() * 13);
  } else {
    // Reserves / Youth prospects (17 - 22)
    age = 17 + Math.floor(seedRng() * 6);
  }

  // Base overall rating calibrated to club reputation (680 to 980) or free agent pool
  const clubRep = club ? club.reputazione : 720;
  const repBase = Math.round(clubRep / 11.2); // ~61 to ~87

  // Starter bonus vs reserve variance
  let targetOverall = isStarter ? repBase + Math.floor(seedRng() * 5) - 1 : repBase - 3 + Math.floor(seedRng() * 6);
  if (isFreeAgent) {
    // Free agents have varied ratings
    targetOverall = 64 + Math.floor(seedRng() * 16);
  }
  const overall = Math.max(58, Math.min(93, targetOverall));

  // Potential (younger players have much higher potential)
  const growthRoom = Math.max(1, 30 - age);
  const potentialBonus = Math.floor(seedRng() * growthRoom * 0.9);
  const potential = Math.max(overall, Math.min(96, overall + potentialBonus));

  const baseAttr = (overall / 100) * 20;

  // Attributes calculation (1-20)
  const attributi: PlayerAttributes = {
    // Fisici
    velocita: clamp20(baseAttr + (isAtt || role === 'TD' || role === 'TS' ? 2.5 : -1) + (seedRng() * 3 - 1.5)),
    resistenza: clamp20(baseAttr + (isMid ? 2 : 0) + (seedRng() * 3 - 1.5)),
    forza: clamp20(baseAttr + (isDef || role === 'ATT' ? 2 : -1.5) + (seedRng() * 3 - 1.5)),
    elevazione: clamp20(baseAttr + (role === 'DFC' || isGK ? 2.5 : -1.5) + (seedRng() * 3 - 1.5)),

    // Difensivi
    contrasto: clamp20(isDef ? baseAttr + 3 : isMid ? baseAttr : 5 + seedRng() * 3),
    marcatura: clamp20(isDef ? baseAttr + 3 : isMid ? baseAttr - 1 : 4 + seedRng() * 3),
    posizionamento: clamp20(baseAttr + (isDef || isGK ? 2 : 0) + (seedRng() * 2 - 1)),

    // Tecnici / Offensivi
    passaggio: clamp20(isMid ? baseAttr + 3 : isAtt ? baseAttr : baseAttr - 2.5),
    visione: clamp20(isMid ? baseAttr + 3 : isAtt ? baseAttr - 0.5 : baseAttr - 2.5),
    tiro: clamp20(isAtt ? baseAttr + 3.5 : isMid ? baseAttr : 5 + seedRng() * 3),
    finalizzazione: clamp20(isAtt ? baseAttr + 4 : isMid ? baseAttr - 1 : 4 + seedRng() * 3),
    dribbling: clamp20(isAtt || role === 'TRQ' ? baseAttr + 3 : isMid ? baseAttr : 5 + seedRng() * 3),
    tecnica: clamp20(baseAttr + (isMid || isAtt ? 2 : -2) + (seedRng() * 2 - 1)),

    // Portiere
    parata: clamp20(isGK ? baseAttr + 4 : 2 + seedRng() * 2),
    riflessi: clamp20(isGK ? baseAttr + 4 : 3 + seedRng() * 2),
    uscite: clamp20(isGK ? baseAttr + 3 : 2 + seedRng() * 2),

    // Mentali
    virtus: clamp20(baseAttr + (age > 26 ? 2.5 : 0) + (seedRng() * 3 - 1.5)),
    disciplina: clamp20(baseAttr + (age > 27 ? 2 : -1) + (seedRng() * 3 - 1.5))
  };

  // Cultural onomastics
  const culture = club ? getCultureFamilyForClub(club) : 'romana';
  const namePool = ANCIENT_ONOMASTICS[culture] || ANCIENT_ONOMASTICS.romana;
  const firstName = namePool.first[Math.floor(seedRng() * namePool.first.length)];
  const lastName = namePool.last[Math.floor(seedRng() * namePool.last.length)];

  const foot = FEET[Math.floor(seedRng() * FEET.length)];
  const height = isGK ? 186 + Math.floor(seedRng() * 8) : isDef ? 182 + Math.floor(seedRng() * 9) : 173 + Math.floor(seedRng() * 12);
  const weight = isGK ? 82 + Math.floor(seedRng() * 8) : isDef ? 79 + Math.floor(seedRng() * 9) : 70 + Math.floor(seedRng() * 10);

  const clubId = club ? club.id : '';
  const id = isFreeAgent
    ? `player_fa_${slotIndex}`
    : `player_${clubId}_${slotIndex + 1}`;

  // Sesterzi valuation
  const marketVal = isFreeAgent
    ? 0
    : Math.round(overall * overall * 240 * (1 + (potential - overall) * 0.05));
  const weeklyWage = isFreeAgent
    ? Math.round(overall * 180)
    : Math.round(overall * 290);

  const contractYears = 1 + Math.floor(seedRng() * 3);
  const contractExpiry = isFreeAgent ? currentYearBC : currentYearBC + contractYears;

  // Transfer list status: ~20% of squad bench/reserves are listed; all free agents are available
  const isTransferListed = isFreeAgent ? true : slotIndex >= 14 && seedRng() < 0.45;

  return {
    id,
    nome: firstName,
    cognome: lastName,
    annoNascita: currentYearBC - age,
    eta: age,
    nazionalita: club ? (club.regione || 'Romana') : 'Libero dell’Arena',
    regione: club ? club.regione : 'Mercati dell’Impero',
    ruoloPrimario: role,
    ruoliSecondari: [],
    piede: foot,
    altezzaCm: height,
    pesoKg: weight,
    valoreGenerale: overall,
    potenziale: potential,
    attributi,
    condizione: 94 + Math.floor(seedRng() * 7),
    morale: 84 + Math.floor(seedRng() * 15),
    infortunato: false,
    giorniInfortunio: 0,
    squalificato: false,
    clubId,
    contratto: {
      clubId,
      stipendioSettimanale: weeklyWage,
      annoScadenza: contractExpiry
    },
    statisticheStagione: {
      seasonYear: currentYearBC,
      presenze: 0,
      gol: 0,
      assist: 0,
      cartelliniGialli: 0,
      cartelliniRossi: 0,
      mediaVoto: 0,
      minutiGiocati: 0
    },
    carrieraPassata: [],
    inListaTrasferimenti: isTransferListed,
    prezzoRichiesto: marketVal
  };
}

/**
 * Builds the complete world player database (12.000 to 14.000 players).
 * - Preserves handcrafted Phase 1 seeds for key clubs.
 * - Generates full 25-man rosters for all 450 clubs (11.250 club players).
 * - Updates clubs' titolariIds (11) and panchinaIds (7).
 * - Generates a rich pool of ~1.500 free agents / gladiatori dell'arena.
 */
export function buildWorldPlayersDatabase(
  clubs: Record<string, Club>
): { players: Record<string, Player>; totalCount: number } {
  const masterPlayers: Record<string, Player> = {};

  // 1. Load handcrafted initial players (Phase 1 legacy clubs: ~340 detailed athletes)
  const initialHandcrafted = buildInitialPlayers();
  Object.values(initialHandcrafted).forEach(p => {
    masterPlayers[p.id] = p;
  });

  // 2. Complete each of the 450 clubs to have exactly 25 players (11 starters, 7 bench, 7 reserves)
  for (const club of Object.values(clubs)) {
    const existingClubPlayers = Object.values(masterPlayers).filter(p => p.clubId === club.id);
    const needed = Math.max(0, 25 - existingClubPlayers.length);

    const clubSeed = stringToSeed(club.id + '_squad_50bc');
    const rng = mulberry32(clubSeed);

    // If club has no players at all, generate all 25 slots
    if (existingClubPlayers.length === 0) {
      const clubSquad: Player[] = [];
      ROSTER_SLOTS.forEach((slot, index) => {
        const p = createDeterministicPlayer(club, slot.role, index, slot.isStarter, false, rng);
        masterPlayers[p.id] = p;
        clubSquad.push(p);
      });

      // Update club's titolariIds and panchinaIds
      club.titolariIds = clubSquad.slice(0, 11).map(p => p.id);
      club.panchinaIds = clubSquad.slice(11, 18).map(p => p.id);
    } else if (needed > 0) {
      // Club has some handcrafted players, top up the remaining slots to reach 25
      const extraSquad: Player[] = [];
      for (let i = 0; i < needed; i++) {
        const slotRole = ROSTER_SLOTS[(existingClubPlayers.length + i) % ROSTER_SLOTS.length].role;
        const p = createDeterministicPlayer(club, slotRole, existingClubPlayers.length + i, false, false, rng);
        masterPlayers[p.id] = p;
        extraSquad.push(p);
      }

      // Ensure titolariIds and panchinaIds are populated
      const allClubPlayers = [...existingClubPlayers, ...extraSquad];
      allClubPlayers.sort((a, b) => b.valoreGenerale - a.valoreGenerale);
      club.titolariIds = allClubPlayers.slice(0, 11).map(p => p.id);
      club.panchinaIds = allClubPlayers.slice(11, 18).map(p => p.id);
    } else {
      // Already has 25 or more, set starters & bench
      existingClubPlayers.sort((a, b) => b.valoreGenerale - a.valoreGenerale);
      club.titolariIds = existingClubPlayers.slice(0, 11).map(p => p.id);
      club.panchinaIds = existingClubPlayers.slice(11, 18).map(p => p.id);
    }
  }

  // 3. Generate Free Agents Pool (~1.500 Mercenari, Gladiatori Liberi e Atleti Svincolati)
  const freeAgentsTarget = 1500;
  const faRng = mulberry32(stringToSeed('free_agents_imperium_50bc'));
  const rolesCycle: Role[] = ['POR', 'TD', 'TS', 'DFC', 'DFC', 'MED', 'CC', 'CC', 'TRQ', 'AD', 'AS', 'ATT', 'ATT'];

  for (let fa = 0; fa < freeAgentsTarget; fa++) {
    const role = rolesCycle[fa % rolesCycle.length];
    const freeAgent = createDeterministicPlayer(null, role, fa, false, true, faRng);
    masterPlayers[freeAgent.id] = freeAgent;
  }

  const totalCount = Object.keys(masterPlayers).length;
  return { players: masterPlayers, totalCount };
}
