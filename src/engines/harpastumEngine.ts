/**
 * MOTORE DI GIOCO HARPASTUM
 * Definizione storico-atletica dei ruoli dell'Harpastum romano (I secolo a.C.),
 * divisione delle classi di atleti, attributi specifici e mapping con la retrocompatibilità.
 *
 * Fonti storiche: Galeno ("De parvae pilae exercitio"), Ateneo di Naucrati ("Deipnosophistai"), Marziale ("Epigrammi").
 */

import type { Player, Role } from '../types';

export interface HarpastumRoleDefinition {
  code: string;
  legacyCode: Role;
  latinName: string;
  italianName: string;
  category: 'CUSTOS' | 'LUCTATOR' | 'TRACTOR' | 'PRAEVENIENS';
  categoryLabel: string;
  shortDesc: string;
  longDesc: string;
  tacticalDuty: string;
  keyAttributes: string[];
}

export const HARPASTUM_ROLES: Record<string, HarpastumRoleDefinition> = {
  // 1. CUSTOS (Ultimo baluardo difensivo a difesa della linea di meta)
  CUS: {
    code: 'CUS',
    legacyCode: 'POR',
    latinName: 'Custos Castrorum',
    italianName: 'Custode della Linea',
    category: 'CUSTOS',
    categoryLabel: 'Custodi della Linea',
    shortDesc: 'Ultimo difensore della linea di meta',
    longDesc: 'Presidia la linea di fondo campo con riflessi pronti e intercetti a terra. È l\'ultimo ostacolo prima che l\'avversario posi la palla oltre la linea per fare meta.',
    tacticalDuty: 'Blocco dell\'atleta avversario prima del varco di fondo, intercetto delle parabole a mezz\'aria e rilancio immediato ai lottatori.',
    keyAttributes: ['Riflessi', 'Elevazione', 'Forza', 'Uscite a terra']
  },

  // 2. LUCTATORES (I giganti della linea difensiva: blocchi, placcaggi e mischia)
  LUC_C: {
    code: 'LUC_C',
    legacyCode: 'DFC',
    latinName: 'Luctator Centralis',
    italianName: 'Lottatore Centrale',
    category: 'LUCTATOR',
    categoryLabel: 'Propugnatori & Lottatori',
    shortDesc: 'Gigante da sfondamento e placcaggio centrale',
    longDesc: 'Atleta possente addestrato alla lotta greca e al corpo a corpo. Ferma le incursioni avversarie con placcaggi alla vita e respinte con gli avambracci.',
    tacticalDuty: 'Arresto delle cariche centrali avversarie, protezione del Custode e dominanza nelle mischie al suolo.',
    keyAttributes: ['Forza', 'Contrasto/Placcaggio', 'Marcatura', 'Virtus']
  },
  LUC_D: {
    code: 'LUC_D',
    legacyCode: 'TD',
    latinName: 'Luctator Dexter',
    italianName: 'Lottatore di Destra',
    category: 'LUCTATOR',
    categoryLabel: 'Propugnatori & Lottatori',
    shortDesc: 'Lottatore di fascia destra per sbarrare le ali',
    longDesc: 'Difensore mobile capace di inseguire i cursori veloci dell\'ala destra e trascinarli a terra nella sabbia prima che prendano velocità.',
    tacticalDuty: 'Sbarramento del corridoio destro e recupero aggressivo della piccola sfera di cuoio.',
    keyAttributes: ['Velocità', 'Contrasto/Placcaggio', 'Resistenza', 'Posizionamento']
  },
  LUC_S: {
    code: 'LUC_S',
    legacyCode: 'TS',
    latinName: 'Luctator Sinister',
    italianName: 'Lottatore di Sinistra',
    category: 'LUCTATOR',
    categoryLabel: 'Propugnatori & Lottatori',
    shortDesc: 'Lottatore di fascia sinistra per sbarrare le ali',
    longDesc: 'Colosso atletico a presidio del fronte sinistro. Specializzato in intercetti laterali e blocchi corporali contro i cursori veloci.',
    tacticalDuty: 'Chiusura dei varchi sinistri e ribaltamento dell\'azione con rilancio lungo a due mani.',
    keyAttributes: ['Velocità', 'Contrasto/Placcaggio', 'Resistenza', 'Posizionamento']
  },

  // 3. TRACTORES (I costruttori di gioco e registi di palla sulla linea mediana)
  TRAC_M: {
    code: 'TRAC_M',
    legacyCode: 'MED',
    latinName: 'Tractor Medius / Cataphractus',
    italianName: 'Mediano di Schermo',
    category: 'TRACTOR',
    categoryLabel: 'Trattori & Registi di Palla',
    shortDesc: 'Incontrista e collante di rottura sulla mediana',
    longDesc: 'Il perno di trincea a centrocampo: assorbe gli urti, recupera la sfera strappandola di mano agli avversari e pulisce il possesso per gli scattisti.',
    tacticalDuty: 'Schermatura davanti ai lottatori e scudo protettivo nei passaggi orizzontali.',
    keyAttributes: ['Resistenza', 'Forza', 'Passaggio', 'Disciplina']
  },
  TRAC_C: {
    code: 'TRAC_C',
    legacyCode: 'CC',
    latinName: 'Tractor Campestris',
    italianName: 'Trattore Centrale di Palla',
    category: 'TRACTOR',
    categoryLabel: 'Trattori & Registi di Palla',
    shortDesc: 'Regista di smistamento e lanciatore della pila',
    longDesc: 'Mente lucida nel caos dell\'arena sabbiosa. Scaglia la palla al compagno smarcato prima di essere placcato ed esegue finte rapide di corpo.',
    tacticalDuty: 'Distribuzione del gioco con parabole tese a due mani, visione periferica e cambi di fronte fulminei.',
    keyAttributes: ['Visione', 'Passaggio', 'Tecnica', 'Virtus']
  },
  TRAC_T: {
    code: 'TRAC_T',
    legacyCode: 'TRQ',
    latinName: 'Tractor Artifex',
    italianName: 'Regista d\'Incursione & Finte',
    category: 'TRACTOR',
    categoryLabel: 'Trattori & Registi di Palla',
    shortDesc: 'Mago delle finte e assistman per le mete',
    longDesc: 'Descritto da Ateneo come il maestro dell\'inganno: finge di lanciare a destra, attira tre avversari e recapita la palla al cursore solitaria a sinistra.',
    tacticalDuty: 'Infiltrazione tra le maglie avversarie e lancio conclusivo verso la linea di fondo.',
    keyAttributes: ['Dribbling/Finte', 'Visione', 'Passaggio', 'Velocità']
  },

  // 4. PRAEVENIENTES (I cursori d'assalto, gli scattisti che corrono verso la meta)
  PRAEV_D: {
    code: 'PRAEV_D',
    legacyCode: 'AD',
    latinName: 'Praeveniens Dexter',
    italianName: 'Cursore d\'Ala Destra',
    category: 'PRAEVENIENS',
    categoryLabel: 'Cursori & Scattisti di Meta',
    shortDesc: 'Freccia veloce sulla sabbia di destra',
    longDesc: 'Velocista scattante capace di eludere le cariche con salti acrobatici, raccogliere la palla al volo e schiacciarla oltre la linea di fondo.',
    tacticalDuty: 'Affondo sul lato destro, penetrazione fulminea e ricezione in corsa.',
    keyAttributes: ['Velocità', 'Agilità/Dribbling', 'Elevazione', 'Finalizzazione']
  },
  PRAEV_S: {
    code: 'PRAEV_S',
    legacyCode: 'AS',
    latinName: 'Praeveniens Sinister',
    italianName: 'Cursore d\'Ala Sinistra',
    category: 'PRAEVENIENS',
    categoryLabel: 'Cursori & Scattisti di Meta',
    shortDesc: 'Freccia veloce sulla sabbia di sinistra',
    longDesc: 'Agilissimo incursore del fronte sinistro. Famoso per i cambi di direzione improvvisi che fanno scivolare i lottatori avversari sulla sabbia.',
    tacticalDuty: 'Sfondamento dell\'ala sinistra e marcatura del punto di meta.',
    keyAttributes: ['Velocità', 'Agilità/Dribbling', 'Elevazione', 'Finalizzazione']
  },
  PRAEV_C: {
    code: 'PRAEV_C',
    legacyCode: 'ATT',
    latinName: 'Praeveniens Primus / Embolon',
    italianName: 'Ariete di Sfondamento & Meta',
    category: 'PRAEVENIENS',
    categoryLabel: 'Cursori & Scattisti di Meta',
    shortDesc: 'Finalizzatore primario e dominatore della meta',
    longDesc: 'L\'atleta più decorato dell\'Harpastum. Unisce potenza fisica da gladiatore a velocità di scatto: riceve la palla e si getta a peso morto oltre la linea di fondo abbattendo qualsiasi guardia.',
    tacticalDuty: 'Segnatura delle mete decisive (puncta), scontro aereo sulla linea di fondo e leadership atletica.',
    keyAttributes: ['Finalizzazione', 'Forza', 'Elevazione', 'Virtus']
  }
};

/**
 * Traduce qualsiasi ruolo legacy (calcio) o Harpastum nel ruolo ufficiale Harpastum.
 */
export function getHarpastumRole(role: Role | string): HarpastumRoleDefinition {
  if (role === 'POR' || role === 'CUS') return HARPASTUM_ROLES.CUS;
  if (role === 'DFC' || role === 'LUC_C') return HARPASTUM_ROLES.LUC_C;
  if (role === 'TD' || role === 'LUC_D') return HARPASTUM_ROLES.LUC_D;
  if (role === 'TS' || role === 'LUC_S') return HARPASTUM_ROLES.LUC_S;
  if (role === 'MED' || role === 'TRAC_M') return HARPASTUM_ROLES.TRAC_M;
  if (role === 'CC' || role === 'TRAC_C') return HARPASTUM_ROLES.TRAC_C;
  if (role === 'TRQ' || role === 'TRAC_T') return HARPASTUM_ROLES.TRAC_T;
  if (role === 'AD' || role === 'PRAEV_D') return HARPASTUM_ROLES.PRAEV_D;
  if (role === 'AS' || role === 'PRAEV_S') return HARPASTUM_ROLES.PRAEV_S;
  return HARPASTUM_ROLES.PRAEV_C; // Default ATT
}

/**
 * Ritorna la categoria Harpastum del giocatore (CUSTOS, LUCTATOR, TRACTOR, PRAEVENIENS).
 */
export function getHarpastumCategory(player: Player): 'CUSTOS' | 'LUCTATOR' | 'TRACTOR' | 'PRAEVENIENS' {
  const def = getHarpastumRole(player.ruoloPrimario);
  return def.category;
}

/**
 * Restituisce i colori classici del badge da 90s managerial per il ruolo Harpastum.
 */
export function getHarpastumRoleBadgeStyle(role: Role | string): { bg: string; text: string; border: string; label: string } {
  const r = getHarpastumRole(role);
  switch (r.category) {
    case 'CUSTOS':
      return {
        bg: 'bg-[#78350f]',
        text: 'text-[#fef08a]',
        border: 'border-[#ca8a04]',
        label: 'CUS'
      };
    case 'LUCTATOR':
      return {
        bg: 'bg-[#1e3a8a]',
        text: 'text-[#bfdbfe]',
        border: 'border-[#3b82f6]',
        label: r.code.replace('LUC_', 'LUC-')
      };
    case 'TRACTOR':
      return {
        bg: 'bg-[#064e3b]',
        text: 'text-[#a7f3d0]',
        border: 'border-[#10b981]',
        label: r.code.replace('TRAC_', 'TRA-')
      };
    case 'PRAEVENIENS':
      return {
        bg: 'bg-[#7f1d1d]',
        text: 'text-[#fecaca]',
        border: 'border-[#ef4444]',
        label: r.code.replace('PRAEV_', 'CUR-')
      };
  }
}

/**
 * Divide una lista di giocatori per le 4 macro-categorie dell'Harpastum.
 */
export function groupPlayersByHarpastum(players: Player[]): {
  custodes: Player[];
  luctatores: Player[];
  tractores: Player[];
  praevenientes: Player[];
} {
  const custodes: Player[] = [];
  const luctatores: Player[] = [];
  const tractores: Player[] = [];
  const praevenientes: Player[] = [];

  for (const p of players) {
    const cat = getHarpastumCategory(p);
    if (cat === 'CUSTOS') custodes.push(p);
    else if (cat === 'LUCTATOR') luctatores.push(p);
    else if (cat === 'TRACTOR') tractores.push(p);
    else praevenientes.push(p);
  }

  return { custodes, luctatores, tractores, praevenientes };
}

/**
 * Regole Canoniche Ufficiali dell'Harpastum Romano (12 contro 12)
 * e sistema di Sostituzioni Libere con Rientro (Rotatio Libera cum Reitu).
 */
export const HARPASTUM_RULES_CANON = {
  teamSize: 12,
  description: '12 contro 12 nell\'Arena Sabbiosa (Duodecim Primarii in Harena)',
  composition: {
    custodes: 1,      // 1 Custode Castrorum (guardiano di meta)
    luctatores: 4,    // 4 Lottatori & Mura (sbarramento difensivo)
    tractores: 4,     // 4 Trattori & Registi di Palla (mediani, incursione e finte)
    praevenientes: 3  // 3 Cursori d'Assalto & Arieti di Meta
  },
  substitutions: {
    rule: 'ROTATIO_LIBERA_CUM_REITU',
    name: 'Sostituzioni Libere con Rientro (Rotatio Libera)',
    description:
      'A causa dell\'estrema durezza fisica e dei placcaggi a terra nell\'arena sabbiosa, sono permesse rotazioni libere: ' +
      'un atleta contuso o affaticato può essere rilevato da una riserva (succenturiatus) ' +
      'e, una volta medicato e ristabilito, può rientrare in campo successivamente nel corso dell\'agone.'
  }
};
