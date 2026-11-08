/**
 * MOTORE DI LOCALIZZAZIONE TEMPORALE & CRONACA STORICA
 * Rigoroso computo basato sull'Era Olimpica greca (776 a.C. = 1ª Olimpiade, anno 1)
 * e sulla datazione consolare della Repubblica Romana.
 *
 * ESCLUSIONE TOTALE di "a.C.", "d.C.", mesi gregoriani lineari e numerazioni moderne.
 */

export interface OlympicEraDate {
  olympiad: number;
  yearInOlympiad: number;
  displayText: string;
  formalText: string;
  shortText: string;
  consuls: string;
}

export interface SeasonPhaseInfo {
  phaseKey: 'AUTUNNO' | 'INVERNO' | 'PRIMAVERA' | 'FINALI';
  phaseName: string;
  subTitle: string;
  grecianMonth: string;
  romanFestival: string;
}

const HISTORICAL_CONSULS: Record<number, string> = {
  54: 'Lucio Domizio Enobarbo e Appio Claudio Pulcro',
  53: 'Cneo Domizio Calvino e Marco Valerio Messalla Rufo',
  52: 'Cneo Pompeo Magno e Quinto Cecilio Metello Scipione',
  51: 'Servio Sulpicio Rufo e Marco Claudio Marcello',
  50: 'Lucio Emilio Paolo e Gaio Claudio Marcello',
  49: 'Gaio Claudio Marcello e Lucio Cornelio Lentulo Crure',
  48: 'Gaio Giulio Cesare (II) e Publio Servilio Isaurico',
  47: 'Quinto Fufio Caleno e Publio Vatinio',
  46: 'Gaio Giulio Cesare (III) e Marco Emilio Lepido',
  45: 'Gaio Giulio Cesare (IV, console unico)',
  44: 'Gaio Giulio Cesare (V) e Marco Antonio'
};

/**
 * Converte qualsiasi anno storico nell'era olimpica ufficiale.
 * Formula: 776 a.C. = 1ª Olimpiade, anno 1.
 * Un'Olimpiade dura esattamente 4 anni.
 */
export function convertBCToOlympicEra(yearBC: number): OlympicEraDate {
  const absYear = Math.abs(yearBC);
  const elapsed = 776 - absYear;
  const olympiad = Math.floor(elapsed / 4) + 1;
  const yearInOlympiad = (elapsed % 4) + 1;

  const consuls = HISTORICAL_CONSULS[absYear] || 'dei Consoli della Repubblica nei Fasti Capitolini';

  return {
    olympiad,
    yearInOlympiad,
    displayText: `anno ${yearInOlympiad} della ${olympiad}ª Olimpiade`,
    formalText: `${olympiad}ª Olimpiade, anno ${yearInOlympiad}`,
    shortText: `${olympiad}ª Ol., a. ${yearInOlympiad}`,
    consuls
  };
}

/**
 * Scansione naturale della stagione calcistica (inizio al solstizio d'estate):
 * - Giornate 1 - 10: "Fase Autunnale" (Semina e Grandi Ludi)
 * - Giornate 11 - 18: "Pausa Invernale" (Mesi del maltempo e Saturnali)
 * - Giornate 19 - 26: "Fase Primaverile" (Ritorno delle Legioni e Grandi Giochi)
 * - Giornate 27 - 30: "Finali" (Inizio Estate, Solstizio e Nuovi Giochi)
 */
export function getSeasonPhase(matchday: number): SeasonPhaseInfo {
  if (matchday <= 10) {
    const festivals = [
      'Ludi Panatenaici & Solstizio',
      'Ludi Consualia del Raccolto',
      'Ludi Romani Magni',
      'Feste Misteriche di Eleusi',
      'Mese di Pyanepsion & Semina',
      'Ludi Plebei al Circo Flaminio',
      'Mese di Boedromion',
      'Feste Thesmophorie',
      'None di Novembre',
      'Ludi Epulum Jovis'
    ];
    return {
      phaseKey: 'AUTUNNO',
      phaseName: 'Fase Autunnale',
      subTitle: 'Semina & Grandi Ludi d’Autunno',
      grecianMonth: 'Mese di Boedromion',
      romanFestival: festivals[(matchday - 1) % festivals.length]
    };
  }

  if (matchday <= 18) {
    const winterFestivals = [
      'Grandi Saturnali d’Inverno',
      'Feste dei Brumalia',
      'Sol Invictus al Circo Massimo',
      'Calende di Giano Quadrifronte',
      'Mese delle Piogge e del Maltempo',
      'Ludi Compitalia dei Trivi',
      'Feste delle Lenee Dionisiache',
      'Mese di Posideon & Venti Boreali'
    ];
    const idx = matchday - 11;
    return {
      phaseKey: 'INVERNO',
      phaseName: 'Pausa Invernale',
      subTitle: 'Mesi del Maltempo & Saturnali',
      grecianMonth: 'Mese di Posideon',
      romanFestival: winterFestivals[idx % winterFestivals.length]
    };
  }

  if (matchday <= 26) {
    const springFestivals = [
      'Calende di Marte & Ritorno delle Legioni',
      'Feste delle Antesterie dei Fiori',
      'Grandi Dionisie dell’Attica',
      'Ludi Megalensi della Gran Madre',
      'Feste dei Cerealia della Primavera',
      'Parilia & Fondazione dell’Urbe',
      'Ludi Floralia della Rinascita',
      'None di Maggio & Fioritura'
    ];
    const idx = matchday - 19;
    return {
      phaseKey: 'PRIMAVERA',
      phaseName: 'Fase Primaverile',
      subTitle: 'Ritorno dei Grandi Giochi',
      grecianMonth: 'Mese di Elaphebolion',
      romanFestival: springFestivals[idx % springFestivals.length]
    };
  }

  const finalFestivals = [
    'Ludi Apollinari dell’Arena',
    'Mese di Thargelion delle Messi',
    'Solstizio d’Estate & Vigilia dei Giochi',
    'Finali dei Campioni prima dell’Olimpia'
  ];
  const idx = matchday - 27;
  return {
    phaseKey: 'FINALI',
    phaseName: 'Finali',
    subTitle: 'Inizio Estate & Nuovi Giochi',
    grecianMonth: 'Mese di Skirophorion',
    romanFestival: finalFestivals[idx % finalFestivals.length]
  };
}

/**
 * Genera la datazione ufficiale completa visualizzata per ogni matchday o evento.
 * Esempio: "Ludi Romani Magni · Fase Autunnale (anno 3 della 182ª Olimpiade)"
 */
export function getRomanDateString(matchday: number, yearBC: number = 50): string {
  const era = convertBCToOlympicEra(yearBC);
  const phase = getSeasonPhase(matchday);

  return `${phase.romanFestival} · ${phase.phaseName} (${era.displayText})`;
}

/**
 * Formula ufficiale per le intestazioni stagionali:
 * "Campionato indetto nell'anno 3 della 182ª Olimpiade (Consolato di Lucio Emilio Paolo e Gaio Claudio Marcello)"
 */
export function getSeasonDescription(yearBC: number = 50): string {
  const era = convertBCToOlympicEra(yearBC);
  return `Campionato indetto nell'${era.displayText} (Sotto il consolato di ${era.consuls})`;
}

/**
 * Formattazione consolare e olimpica per notizie di mercato o cronaca.
 */
export function getTransferChronicleDate(yearBC: number = 50): string {
  const era = convertBCToOlympicEra(yearBC);
  return `sotto il consolato di ${era.consuls} (${era.displayText})`;
}

/**
 * Data di nascita per le schede giocatore.
 */
export function formatPlayerBirthYear(birthYearBC: number): string {
  const era = convertBCToOlympicEra(birthYearBC);
  return `Nato nell'${era.displayText}`;
}

/**
 * Data di scadenza contrattuale.
 */
export function formatContractExpiry(expiryYearBC: number): string {
  const era = convertBCToOlympicEra(expiryYearBC);
  return `Vincolo valido fino all'${era.displayText}`;
}

/**
 * Formattazione retrospettiva per albi d'oro e record.
 */
export function formatOlympicEraYear(yearBC: number): string {
  const era = convertBCToOlympicEra(yearBC);
  return `${era.formalText}`;
}
