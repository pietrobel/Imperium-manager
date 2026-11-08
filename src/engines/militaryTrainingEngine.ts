/**
 * MOTORE DI ADDESTRAMENTO MILITARE & STATO FISICO HARPASTUM
 * Ispirato alle dottrine militari delle Legioni Romane (Flavio Vegezio Renato, "De re militari")
 * e ai trattati medici di Claudio Galeno ("De sanitate tuenda", "De parvae pilae exercitio").
 */

import type { Player, MilitaryDrillId, TrainingIntensity, HarpastumTacticalDutyId, MedicalStaffTier } from '../types';
import { getHarpastumCategory } from './harpastumEngine';

export interface MilitaryDrillDefinition {
  id: MilitaryDrillId;
  latinName: string;
  italianName: string;
  motto: string;
  description: string;
  focusAttributes: string[];
  fatigueCost: number;       // Fatica generata (0-25)
  baseInjuryRisk: number;    // Rischio base infortunio in %
  badgeColor: string;
}

export const MILITARY_DRILLS: Record<MilitaryDrillId, MilitaryDrillDefinition> = {
  CURSUS_CUM_SARCINA: {
    id: 'CURSUS_CUM_SARCINA',
    latinName: 'Cursus cum Sarcina',
    italianName: 'Marcia Forzata con Fardello da 20 kg',
    motto: 'Labor omnia vincit improbus',
    description: 'Addestramento legionario di marcia a passo accelerato nella polvere con zaino di pietre e armatura. Tempra la fibra polmonare e rinforza i polpacci per i lunghi assalti.',
    focusAttributes: ['Resistenza', 'Velocità', 'Virtus'],
    fatigueCost: 18,
    baseInjuryRisk: 6,
    badgeColor: 'border-[#3b82f6] text-[#93c5fd] bg-[#1e3a8a]/40'
  },
  ARMATURA_LIGNEA: {
    id: 'ARMATURA_LIGNEA',
    latinName: 'Armatura ad Palum',
    italianName: 'Scherma al Palo con Scudo Pesante',
    motto: 'Si vis pacem, para bellum',
    description: 'Pratica contro il palo ligneo con bastone pesante e scudo di vimini a doppio peso. Sviluppa spalle da lottatore e potenza di spallata per demolire le guardie nemiche.',
    focusAttributes: ['Forza', 'Contrasto/Placcaggio', 'Marcatura'],
    fatigueCost: 16,
    baseInjuryRisk: 5,
    badgeColor: 'border-[#ca8a04] text-[#fef08a] bg-[#854d0e]/40'
  },
  PALAESTRA_LUCTA: {
    id: 'PALAESTRA_LUCTA',
    latinName: 'Palaestra & Lucta Graeca',
    italianName: 'Lotta Corpo a Corpo nella Sabbia',
    motto: 'Vincere aut mori in harena',
    description: 'Corpo a corpo serrato con terra e olio. Prese alle gambe, atterramenti alla gola e rotolamenti sulla sabbia per strappare l\'harpastum dalle mani avversarie.',
    focusAttributes: ['Forza', 'Virtus', 'Contrasto/Placcaggio'],
    fatigueCost: 22,
    baseInjuryRisk: 10,
    badgeColor: 'border-[#ef4444] text-[#fca5a5] bg-[#991b1b]/40'
  },
  TAXIS_DECURSIO: {
    id: 'TAXIS_DECURSIO',
    latinName: 'Taxis & Decursio Tattica',
    italianName: 'Manovre di Coorte & Testuggine',
    motto: 'Concordia parvae res crescunt',
    description: 'Esercizi di schieramento geometrico al suono della bucina. Gli atleti imparano a mantenere le distanze, chiudere i varchi e coordinarsi a comando come un sol uomo.',
    focusAttributes: ['Disciplina', 'Posizionamento', 'Visione'],
    fatigueCost: 8,
    baseInjuryRisk: 2,
    badgeColor: 'border-[#10b981] text-[#a7f3d0] bg-[#065f46]/40'
  },
  PHAININDA_SPHAIRA: {
    id: 'PHAININDA_SPHAIRA',
    latinName: 'Phaininda & Sphaira Tensa',
    italianName: 'Finte Visive & Ricezioni Acrobatiche',
    motto: 'Ars est celare artem',
    description: 'La leggendaria arte greca dell\'inganno: fingere il passaggio a destra mentre lo sguardo fissa sinistra. Esercizi di presa al volo, dribbling sulla sabbia e scatti elusivi.',
    focusAttributes: ['Agilità/Dribbling', 'Passaggio', 'Tecnica'],
    fatigueCost: 12,
    baseInjuryRisk: 4,
    badgeColor: 'border-[#a855f7] text-[#e9d5ff] bg-[#6b21a8]/40'
  },
  THERMAE_OTIUM: {
    id: 'THERMAE_OTIUM',
    latinName: 'Thermae & Strigilis',
    italianName: 'Riposo alle Terme & Massaggi con Strigile',
    motto: 'Mens sana in corpore sano',
    description: 'Seduta di calidarium, frigidarium e unzione con oli profumati. Il cerusico raschia il sudore e le tossine con lo strigile, sciogliendo le contratture e azzerando la fatica.',
    focusAttributes: ['Condizione +100%', 'Rigenerazione Muscolare'],
    fatigueCost: -30,
    baseInjuryRisk: 0,
    badgeColor: 'border-[#14b8a6] text-[#99f6e4] bg-[#115e59]/40'
  }
};

export interface TrainingIntensityDefinition {
  id: TrainingIntensity;
  latinName: string;
  italianName: string;
  growthMultiplier: number;
  fatigueDelta: number;
  injuryChanceBonus: number;
  description: string;
}

export const TRAINING_INTENSITIES: Record<TrainingIntensity, TrainingIntensityDefinition> = {
  CLEMENTIA: {
    id: 'CLEMENTIA',
    latinName: 'Clementia (Moderato)',
    italianName: 'Addestramento Leggero / Riposo',
    growthMultiplier: 0.5,
    fatigueDelta: -10,
    injuryChanceBonus: -4,
    description: 'Ritmo blando: favorisce il recupero delle forze e riduce a zero il rischio di lesioni.'
  },
  NORMALIS: {
    id: 'NORMALIS',
    latinName: 'Normalis (Legionario)',
    italianName: 'Disciplina Ordinaria di Coorte',
    growthMultiplier: 1.0,
    fatigueDelta: 8,
    injuryChanceBonus: 0,
    description: 'L\'equilibrio canonico della legione: crescita costante con regolare spesa calorica.'
  },
  SPARTANA: {
    id: 'SPARTANA',
    latinName: 'Spartana / Decimatio (Estremo)',
    italianName: 'Addestramento Spartano Estremo',
    growthMultiplier: 2.1,
    fatigueDelta: 25,
    injuryChanceBonus: 10,
    description: 'Sessioni massacranti senza sosta: raddoppia i progressi tecnici e fisici, ma rischia di logorare o infortunare gli atleti.'
  }
};

export interface HarpastumTacticalDutyDefinition {
  id: HarpastumTacticalDutyId;
  category: 'CUSTOS' | 'LUCTATOR' | 'TRACTOR' | 'PRAEVENIENS';
  latinTitle: string;
  italianTitle: string;
  tacticalDescription: string;
  simulationModifiers: {
    metaBonus: number;
    defenseBonus: number;
    placcaggiBonus: number;
    intercettoBonus: number;
    injuryResistance: number;
  };
}

export const HARPASTUM_TACTICAL_DUTIES: Record<HarpastumTacticalDutyId, HarpastumTacticalDutyDefinition> = {
  // Custos Duties
  BALUARDO_FISSO: {
    id: 'BALUARDO_FISSO',
    category: 'CUSTOS',
    latinTitle: 'Baluardo Stazionario di Meta',
    italianTitle: 'Guardiano Fisso sulla Linea',
    tacticalDescription: 'Resta ancorato alla linea di fondo per respingere qualsiasi tuffo avversario. Massima sicurezza contro i pallonetti e le mete ravvicinate.',
    simulationModifiers: { metaBonus: 0, defenseBonus: 15, placcaggiBonus: 5, intercettoBonus: 5, injuryResistance: 5 }
  },
  LIBERO_INTERCETTORE: {
    id: 'LIBERO_INTERCETTORE',
    category: 'CUSTOS',
    latinTitle: 'Custos Libero & Interceptor',
    italianTitle: 'Guardiano Mobile & Lanciatore',
    tacticalDescription: 'Esce coraggiosamente fuori dai confini per intercettare le parabole lunghe a mezz\'aria e rilanciare fulmineamente verso i cursori.',
    simulationModifiers: { metaBonus: 5, defenseBonus: 8, placcaggiBonus: 2, intercettoBonus: 16, injuryResistance: -2 }
  },

  // Luctator Duties
  MURO_DA_MISCHIA: {
    id: 'MURO_DA_MISCHIA',
    category: 'LUCTATOR',
    latinTitle: 'Luctator Cataphractus',
    italianTitle: 'Muro Centrale da Mischia',
    tacticalDescription: 'Sbarramento fisico devastante al centro della mesê grammê. Placca con ferocia gli invasori logorandone la resistenza.',
    simulationModifiers: { metaBonus: 0, defenseBonus: 18, placcaggiBonus: 20, intercettoBonus: 4, injuryResistance: 8 }
  },
  CACCIATORE_DI_FASCIA: {
    id: 'CACCIATORE_DI_FASCIA',
    category: 'LUCTATOR',
    latinTitle: 'Luctator Velox Cursor',
    italianTitle: 'Cacciatore di Fascia & Ali',
    tacticalDescription: 'Lottatore rapido che rincorre le ali veloci sulle linee di fallo laterale, trascinandole nella polvere prima dell\'affondo.',
    simulationModifiers: { metaBonus: 2, defenseBonus: 12, placcaggiBonus: 14, intercettoBonus: 8, injuryResistance: 2 }
  },

  // Tractor Duties
  ARIETE_APRIPISTA: {
    id: 'ARIETE_APRIPISTA',
    category: 'TRACTOR',
    latinTitle: 'Tractor Embolon Clavator',
    italianTitle: 'Ariete Apripista d\'Urto',
    tacticalDescription: 'Corre davanti al portatore di palla travolgendo i difensori avversari con blocchi corporali continui.',
    simulationModifiers: { metaBonus: 10, defenseBonus: 10, placcaggiBonus: 12, intercettoBonus: 5, injuryResistance: 4 }
  },
  REGISTA_PHAININDA: {
    id: 'REGISTA_PHAININDA',
    category: 'TRACTOR',
    latinTitle: 'Tractor Magister Phainindae',
    italianTitle: 'Regista di Lancio con Finte',
    tacticalDescription: 'Mente lucida che comanda il centrocampo: usa le finte con gli occhi e i lanci tesi a due mani per innescare i cursori smarcati.',
    simulationModifiers: { metaBonus: 8, defenseBonus: 6, placcaggiBonus: 2, intercettoBonus: 18, injuryResistance: 0 }
  },

  // Praeveniens Duties
  FRECCIA_ELUSIVA: {
    id: 'FRECCIA_ELUSIVA',
    category: 'PRAEVENIENS',
    latinTitle: 'Praeveniens Celerrimus',
    italianTitle: 'Freccia Elusiva d\'Assalto',
    tacticalDescription: 'Sfrutta agilità pura e cambi di passo per evitare ogni contatto corporale, scattando nello spazio per raccogliere l\'harpastum volante.',
    simulationModifiers: { metaBonus: 18, defenseBonus: 0, placcaggiBonus: -4, intercettoBonus: 10, injuryResistance: -4 }
  },
  EMBOLON_SFONDATORE: {
    id: 'EMBOLON_SFONDATORE',
    category: 'PRAEVENIENS',
    latinTitle: 'Praeveniens Embolon Fortis',
    italianTitle: 'Ariete Umano da Sfondamento',
    tacticalDescription: 'Riceve la palla e si getta a testa bassa nella mischia di meta, trascinando guardiani e difensori oltre la linea di fondo.',
    simulationModifiers: { metaBonus: 22, defenseBonus: 5, placcaggiBonus: 8, intercettoBonus: 2, injuryResistance: 6 }
  }
};

export interface MedicalStaffTierDefinition {
  id: MedicalStaffTier;
  latinName: string;
  italianName: string;
  weeklyCostHS: number;
  recoverySpeedMultiplier: number;
  description: string;
}

export const MEDICAL_STAFF_TIERS: Record<MedicalStaffTier, MedicalStaffTierDefinition> = {
  ERBISTA_CASTRORUM: {
    id: 'ERBISTA_CASTRORUM',
    latinName: 'Herbarius Castrorum',
    italianName: 'Erbista dell\'Accampamento',
    weeklyCostHS: 0,
    recoverySpeedMultiplier: 1.0,
    description: 'Trattamento campale di base con impacchi di argilla, bende di lino e decotti di salice.'
  },
  MEDICUS_GRAECUS: {
    id: 'MEDICUS_GRAECUS',
    latinName: 'Medicus Graecus Hippocraticus',
    italianName: 'Medico Greco di Scuola Alessandrina',
    weeklyCostHS: 1500,
    recoverySpeedMultiplier: 1.45,
    description: 'Conosce l\'anatomia dei muscoli, ricompone le lussazioni con manovre di trazione e applica unguenti di mirra (+45% velocità guarigione).'
  },
  ARCHIATRA_IMPERIALE: {
    id: 'ARCHIATRA_IMPERIALE',
    latinName: 'Archiater Imperialis',
    italianName: 'Archiatra di Corte & Glariatore',
    weeklyCostHS: 4000,
    recoverySpeedMultiplier: 1.9,
    description: 'Il massimo luminare medico dell\'Impero: trattamenti termali avanzati, sutura delle ferite e balsami rari orientali (+90% velocità guarigione).'
  }
};

export interface RomanInjuryDefinition {
  name: string;
  severity: 'LIEVE' | 'MODERATO' | 'GRAVE';
  baseDays: number;
  description: string;
}

export const ROMAN_INJURIES: RomanInjuryDefinition[] = [
  {
    name: 'Lussazione della Spalla da Placcaggio',
    severity: 'MODERATO',
    baseDays: 14,
    description: 'Spalla uscita dall\'articolazione a causa di un violento blocco corporale a terra nella sabbia.'
  },
  {
    name: 'Distorsione alla Caviglia nella Sabbia',
    severity: 'LIEVE',
    baseDays: 7,
    description: 'Torsione dell\'articolazione tibio-tarsica provocata da un dislivello imprevisto nella fossa d\'arena.'
  },
  {
    name: 'Trauma Costale da Scontro Aereo',
    severity: 'MODERATO',
    baseDays: 18,
    description: 'Impatto devastante a mezz\'aria contro le ginocchia di un lottatore durante la contesa di un lancio alto.'
  },
  {
    name: 'Stiramento al Tendine d\'Achille',
    severity: 'GRAVE',
    baseDays: 24,
    description: 'Lesione muscolare scaturita da uno scatto bruciante con fardello o sabbia pesante.'
  },
  {
    name: 'Contusione Cranica con Stordimento',
    severity: 'LIEVE',
    baseDays: 5,
    description: 'Colpo alla nuca subito durante una mischia al suolo lungo la mesê grammê.'
  },
  {
    name: 'Esaurimento Fisico & Colpo di Calura',
    severity: 'LIEVE',
    baseDays: 4,
    description: 'Svenimento e disidratazione da solleone estivo sotto lo sforzo della marcia forzata.'
  }
];

/**
 * Calcola la probabilità dinamica di infortunio per un atleta
 * in base al carico di fatica, condizione fisica, intensità e tipo di esercizio.
 */
export function calculateInjuryRisk(
  player: Player,
  intensity: TrainingIntensity = 'NORMALIS',
  drillId: MilitaryDrillId = 'TAXIS_DECURSIO'
): { percentage: number; riskLevel: 'BASSO' | 'MEDIO' | 'ALTO' | 'CRITICO'; factors: string[] } {
  const drill = MILITARY_DRILLS[drillId] || MILITARY_DRILLS.TAXIS_DECURSIO;
  const intDef = TRAINING_INTENSITIES[intensity] || TRAINING_INTENSITIES.NORMALIS;

  let score = drill.baseInjuryRisk + intDef.injuryChanceBonus;
  const factors: string[] = [];

  // 1. Condizione fisica (meno del 70% fa schizzare il rischio)
  if (player.condizione < 65) {
    score += 10;
    factors.push('Condizione atletica logora (< 65%)');
  } else if (player.condizione < 80) {
    score += 4;
    factors.push('Affaticamento muscolare latente');
  }

  // 2. Carico di fatica accumulata
  const fatica = player.caricoFatica || 0;
  if (fatica > 75) {
    score += 12;
    factors.push('Carico di fatica estremo accumulato (> 75)');
  } else if (fatica > 50) {
    score += 5;
    factors.push('Accumulo di acido lattico nelle gambe');
  }

  // 3. Età (i veterani sopra i 30 anni hanno articolazioni più fragili)
  if (player.eta >= 32) {
    score += 6;
    factors.push(`Anzianità legionario (${player.eta} anni)`);
  } else if (player.eta <= 19) {
    score += 3;
    factors.push('Giovane recluta con fisico ancora in formazione');
  }

  // 4. Intensità spartana
  if (intensity === 'SPARTANA') {
    factors.push('Dottrina spartana senza clementia (+10%)');
  }

  // Rischio finale limitato tra 0% e 45%
  const finalPercentage = Math.max(0, Math.min(45, Math.round(score)));

  let riskLevel: 'BASSO' | 'MEDIO' | 'ALTO' | 'CRITICO' = 'BASSO';
  if (finalPercentage >= 25) riskLevel = 'CRITICO';
  else if (finalPercentage >= 15) riskLevel = 'ALTO';
  else if (finalPercentage >= 8) riskLevel = 'MEDIO';

  return { percentage: finalPercentage, riskLevel, factors };
}

/**
 * Esegue una sessione d'addestramento militare mirata per la coorte
 */
export function executeMilitaryTraining(
  players: Player[],
  drillId: MilitaryDrillId,
  intensity: TrainingIntensity
): {
  updatedPlayers: Player[];
  events: { playerId: string; athleteName: string; type: 'GROWTH' | 'INJURY' | 'RECOVERY'; text: string }[];
} {
  const drill = MILITARY_DRILLS[drillId];
  const intDef = TRAINING_INTENSITIES[intensity];
  const events: { playerId: string; athleteName: string; type: 'GROWTH' | 'INJURY' | 'RECOVERY'; text: string }[] = [];

  const updatedPlayers = players.map(player => {
    // Se il giocatore è già infortunato, non partecipa alle manovre pesanti
    if (player.infortunato) {
      return player;
    }

    const copy: Player = JSON.parse(JSON.stringify(player));
    copy.caricoFatica = Math.max(0, Math.min(100, (copy.caricoFatica || 0) + drill.fatigueCost + intDef.fatigueDelta));

    // Se è riposo alle terme
    if (drillId === 'THERMAE_OTIUM') {
      copy.condizione = 100;
      copy.morale = Math.min(100, copy.morale + 10);
      copy.caricoFatica = 0;
      events.push({
        playerId: copy.id,
        athleteName: `${copy.nome} ${copy.cognome}`,
        type: 'RECOVERY',
        text: `Ha completato i bagni termali: condizione rigenerata al 100% e morale rinsaldato!`
      });
      return copy;
    }

    // Calcolo probabilità d'infortunio durante l'addestramento
    const { percentage } = calculateInjuryRisk(copy, intensity, drillId);
    const rolled = Math.random() * 100;

    if (rolled < percentage) {
      // Infortunio durante l'esercizio!
      const injury = ROMAN_INJURIES[Math.floor(Math.random() * ROMAN_INJURIES.length)];
      copy.infortunato = true;
      copy.giorniInfortunio = injury.baseDays;
      copy.tipoInfortunio = injury.name;
      copy.gravitaInfortunio = injury.severity;
      copy.condizione = Math.max(30, copy.condizione - 25);

      events.push({
        playerId: copy.id,
        athleteName: `${copy.nome} ${copy.cognome}`,
        type: 'INJURY',
        text: `Durante ${drill.latinName} ha subito: ${injury.name}! Prognosi: ${injury.baseDays} giorni nel Valetudinarium.`
      });
      return copy;
    }

    // Progresso negli attributi specifici dell'esercizio
    const growthRoll = Math.random();
    if (growthRoll < 0.75 * intDef.growthMultiplier) {
      const attrs = copy.attributi;
      const gained: string[] = [];

      drill.focusAttributes.forEach(attrName => {
        if (attrName.includes('Forza') && attrs.forza < 20 && Math.random() < 0.4) {
          attrs.forza++;
          gained.push('Forza');
        } else if (attrName.includes('Velocità') && attrs.velocita < 20 && Math.random() < 0.4) {
          attrs.velocita++;
          gained.push('Velocità');
        } else if (attrName.includes('Resistenza') && attrs.resistenza < 20 && Math.random() < 0.4) {
          attrs.resistenza++;
          gained.push('Resistenza');
        } else if (attrName.includes('Placcaggio') && attrs.contrasto < 20 && Math.random() < 0.4) {
          attrs.contrasto++;
          gained.push('Placcaggio/Contrasto');
        } else if (attrName.includes('Disciplina') && attrs.disciplina < 20 && Math.random() < 0.4) {
          attrs.disciplina++;
          gained.push('Disciplina');
        } else if (attrName.includes('Virtus') && attrs.virtus < 20 && Math.random() < 0.4) {
          attrs.virtus++;
          gained.push('Virtus');
        } else if (attrName.includes('Dribbling') && attrs.dribbling < 20 && Math.random() < 0.4) {
          attrs.dribbling++;
          gained.push('Finte/Dribbling');
        } else if (attrName.includes('Passaggio') && attrs.passaggio < 20 && Math.random() < 0.4) {
          attrs.passaggio++;
          gained.push('Lancio/Passaggio');
        }
      });

      if (gained.length > 0) {
        copy.valoreGenerale = Math.min(99, copy.valoreGenerale + 1);
        events.push({
          playerId: copy.id,
          athleteName: `${copy.nome} ${copy.cognome}`,
          type: 'GROWTH',
          text: `Progresso legionario in ${gained.join(', ')} (+1 Valore Generale)!`
        });
      }
    }

    // Condizione fisica influenzata dallo sforzo
    copy.condizione = Math.max(50, Math.min(100, copy.condizione - (drill.fatigueCost / 2)));
    return copy;
  });

  return { updatedPlayers, events };
}

/**
 * Trattamento giornaliero del Valetudinarium:
 * Riduce i giorni d'infortunio in base al livello dello staff medico.
 */
export function advanceValetudinarium(
  player: Player,
  staffTier: MedicalStaffTier = 'ERBISTA_CASTRORUM'
): { updatedPlayer: Player; healed: boolean; message?: string } {
  if (!player.infortunato || player.giorniInfortunio <= 0) {
    return { updatedPlayer: player, healed: false };
  }

  const staff = MEDICAL_STAFF_TIERS[staffTier] || MEDICAL_STAFF_TIERS.ERBISTA_CASTRORUM;
  const daysHealed = Math.max(1, Math.round(1 * staff.recoverySpeedMultiplier));

  const copy: Player = { ...player };
  copy.giorniInfortunio = Math.max(0, copy.giorniInfortunio - daysHealed);

  if (copy.giorniInfortunio === 0) {
    copy.infortunato = false;
    copy.condizione = Math.min(85, copy.condizione + 20);
    const prevInjury = copy.tipoInfortunio || 'la contusione';
    copy.tipoInfortunio = undefined;
    copy.gravitaInfortunio = undefined;
    return {
      updatedPlayer: copy,
      healed: true,
      message: `${copy.nome} ${copy.cognome} è guarito da ${prevInjury} ed è stato dimesso dal Valetudinarium!`
    };
  }

  return { updatedPlayer: copy, healed: false };
}
