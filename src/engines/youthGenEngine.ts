import type { Player, Role, Foot, PlayerAttributes } from '../types';

const ANCIENT_NAMES: Record<string, { first: string[]; last: string[] }> = {
  Romana: {
    first: ['Marcus', 'Titus', 'Lucius', 'Publius', 'Quintus', 'Gaius', 'Aulus', 'Decimus', 'Servius', 'Tiberius', 'Cnaeus'],
    last: ['Valerius', 'Julius', 'Claudius', 'Cornelius', 'Fabius', 'Aemilius', 'Sempronius', 'Postumius', 'Metellus', 'Scipio']
  },
  Gallica: {
    first: ['Vercingetorix', 'Dumnorix', 'Diviciacus', 'Camulogenos', 'Ambiorix', 'Casticus', 'Teutatix', 'Belenos', 'Lugus', 'Eponos'],
    last: ['Aeduus', 'Arvernus', 'Sequanus', 'Allobrox', 'Parisios', 'Senon', 'Carnutus', 'Biturix', 'Eburon', 'Morinus']
  },
  Greca: {
    first: ['Leonidas', 'Brasidas', 'Lysandros', 'Themistokles', 'Alkibiades', 'Perikles', 'Miltiades', 'Dionysios', 'Thrasybulos', 'Kallimachos'],
    last: ['Lakon', 'Spartiates', 'Athenaios', 'Thebanus', 'Korinthios', 'Rhodios', 'Delphikos', 'Sikyonios', 'Makedon', 'Megareus']
  },
  Punica: {
    first: ['Hamilcar', 'Hannibal', 'Hasdrubal', 'Mago', 'Hanno', 'Maharbal', 'Gisgo', 'Bostar', 'Adherbal', 'Malchus'],
    last: ['Barca', 'Poenus', 'Carthalo', 'Byrsa', 'Sidon', 'Tyrius', 'Melqart', 'Tanit', 'Hamon', 'Uticensis']
  },
  Iberica: {
    first: ['Viriatus', 'Audax', 'Ditalcus', 'Minurus', 'Tanginus', 'Indibilis', 'Mandonius', 'Culchas', 'Corocotta', 'Olindicus'],
    last: ['Lusitanus', 'Celtiber', 'Turdetanus', 'Ilergete', 'Vaccaeus', 'Cantaber', 'Astur', 'Bastetanus', 'Oretanus', 'Edetanus']
  }
};

const ROLES: Role[] = ['POR', 'TD', 'TS', 'DFC', 'MED', 'CC', 'TRQ', 'AD', 'AS', 'ATT'];

export function generateYouthPlayer(clubId: string, nationality: string = 'Romana', currentYearBC: number = 50): Player {
  const pool = ANCIENT_NAMES[nationality] || ANCIENT_NAMES['Romana'];
  const first = pool.first[Math.floor(Math.random() * pool.first.length)];
  const last = pool.last[Math.floor(Math.random() * pool.last.length)];
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  const age = Math.floor(Math.random() * 4) + 16; // 16-19
  
  const overall = Math.floor(Math.random() * 15) + 65; // 65-80
  const potential = Math.min(96, overall + Math.floor(Math.random() * 18) + 6); // 75-96
  const baseAttr = Math.round((overall / 100) * 20);

  const isGK = role === 'POR';
  const feet: Foot[] = ['Destro', 'Destro', 'Destro', 'Sinistro', 'Ambidestro'];

  const clamp20 = (n: number) => Math.max(1, Math.min(20, Math.round(n)));

  const attributi: PlayerAttributes = {
    velocita: clamp20(baseAttr + Math.floor(Math.random() * 4) - 1),
    resistenza: clamp20(baseAttr + Math.floor(Math.random() * 4) - 2),
    forza: clamp20(baseAttr + Math.floor(Math.random() * 4) - 2),
    elevazione: clamp20(baseAttr + Math.floor(Math.random() * 4) - 2),
    contrasto: clamp20(isGK ? 4 : baseAttr + (['DFC', 'MED'].includes(role) ? 2 : -2)),
    marcatura: clamp20(isGK ? 4 : baseAttr + (['DFC', 'TD', 'TS'].includes(role) ? 2 : -3)),
    posizionamento: clamp20(baseAttr + Math.floor(Math.random() * 3) - 1),
    passaggio: clamp20(baseAttr + (['CC', 'TRQ', 'MED'].includes(role) ? 2 : -1)),
    visione: clamp20(baseAttr + (['CC', 'TRQ'].includes(role) ? 3 : -2)),
    tiro: clamp20(baseAttr + (['ATT', 'TRQ'].includes(role) ? 3 : -3)),
    finalizzazione: clamp20(baseAttr + (role === 'ATT' ? 4 : -3)),
    dribbling: clamp20(baseAttr + (['AD', 'AS', 'TRQ'].includes(role) ? 3 : -2)),
    tecnica: clamp20(baseAttr + (isGK ? -4 : 1)),
    parata: clamp20(isGK ? baseAttr + 3 : 2),
    riflessi: clamp20(isGK ? baseAttr + 3 : 3),
    uscite: clamp20(isGK ? baseAttr + 2 : 2),
    virtus: clamp20(baseAttr + Math.floor(Math.random() * 4) - 1),
    disciplina: clamp20(baseAttr + Math.floor(Math.random() * 4) - 2)
  };

  const id = `player_youth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const stipendio = Math.round(overall * overall * 2.2);

  return {
    id,
    nome: first,
    cognome: last,
    annoNascita: currentYearBC - age,
    eta: age,
    nazionalita: nationality,
    regione: nationality,
    ruoloPrimario: role,
    ruoliSecondari: [],
    piede: feet[Math.floor(Math.random() * feet.length)],
    altezzaCm: isGK ? 186 : 177,
    pesoKg: isGK ? 80 : 73,
    valoreGenerale: overall,
    potenziale: potential,
    attributi,
    condizione: 100,
    morale: 92,
    infortunato: false,
    giorniInfortunio: 0,
    squalificato: false,
    clubId,
    contratto: {
      clubId,
      stipendioSettimanale: stipendio,
      annoScadenza: currentYearBC + 4
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
    inListaTrasferimenti: false,
    prezzoRichiesto: Math.round(overall * overall * 220)
  };
}
