import type { Club, Player, MatchResult, MatchEvent, MatchStats, PlayerMatchRating } from '../types';
import { getHarpastumRole, getHarpastumCategory } from './harpastumEngine';
import { HARPASTUM_TACTICAL_DUTIES, ROMAN_INJURIES } from './militaryTrainingEngine';

export interface MatchSimulationInput {
  homeClub: Club;
  awayClub: Club;
  allPlayers: Record<string, Player>;
  competitionName: string;
}

/**
 * MOTORE DI SIMULAZIONE HARPASTUM
 * Simula lo scontro atletico secondo le regole dell'Harpastum antico:
 * - Campo in sabbia, due linee di meta (lineae castrenses), linea mediana (mesê grammê)
 * - Calcolo di Mete (Puncta), Placcaggi alla vita, Intercetti al volo e Mischie
 * - 4 categorie di atleti: Custodes, Luctatores, Tractores, Praevenientes (12 titolari)
 * - Integrazione delle dottrine tattiche e dell'affaticamento / infortuni
 */
export function simulateMatch(input: MatchSimulationInput): MatchResult {
  const { homeClub, awayClub, allPlayers } = input;

  // Selezione dei 12 atleti titolari (Duodecim Primarii)
  const getLineup = (club: Club) => {
    const list = Object.values(allPlayers).filter(p => p.clubId === club.id && !p.infortunato && !p.squalificato);
    list.sort((a, b) => b.valoreGenerale - a.valoreGenerale);
    return list.slice(0, 12);
  };

  const homeLineup = getLineup(homeClub);
  const awayLineup = getLineup(awayClub);

  // Calcolo della potenza atletica e fisica delle due formazioni
  const computeHarpastumPower = (club: Club, lineup: Player[], isHome: boolean) => {
    const homeArenaBonus = isHome ? 1.08 : 1.0;
    if (lineup.length === 0) {
      const rep = Math.max(45, Math.min(95, Math.round(club.reputazione / 10.5)));
      return {
        praevenientes: rep * homeArenaBonus, // Scatto e affondo in meta
        tractores: rep * homeArenaBonus,     // Circolazione della piccola palla
        luctatores: rep * homeArenaBonus,    // Placcaggi, forza e mischia
        custos: rep * homeArenaBonus         // Difesa dell'ultima linea
      };
    }

    let praevSum = 0, praevCount = 0;
    let tracSum = 0, tracCount = 0;
    let luctSum = 0, luctCount = 0;
    let custosSum = 0;

    lineup.forEach(p => {
      const condition = p.condizione / 100;
      const morale = p.morale / 100;
      const effective = p.valoreGenerale * (0.8 + 0.1 * condition + 0.1 * morale);
      const cat = getHarpastumCategory(p);

      // Modificatori da dottrina tattica specifica Harpastum
      let dutyMetaBonus = 0;
      let dutyDefBonus = 0;
      let dutyPlaccaggiBonus = 0;
      let dutyIntercettoBonus = 0;
      if (p.ruoloTatticoSpecifico && HARPASTUM_TACTICAL_DUTIES[p.ruoloTatticoSpecifico]) {
        const dMods = HARPASTUM_TACTICAL_DUTIES[p.ruoloTatticoSpecifico].simulationModifiers;
        dutyMetaBonus = dMods.metaBonus;
        dutyDefBonus = dMods.defenseBonus;
        dutyPlaccaggiBonus = dMods.placcaggiBonus;
        dutyIntercettoBonus = dMods.intercettoBonus;
      }

      if (cat === 'CUSTOS') {
        custosSum += (p.attributi.riflessi * 2 + p.attributi.forza + p.attributi.elevazione) * 1.6 + dutyDefBonus;
      } else if (cat === 'PRAEVENIENS') {
        praevSum += (p.attributi.velocita * 1.5 + p.attributi.finalizzazione * 1.5 + p.attributi.dribbling) * 1.3 + dutyMetaBonus;
        praevCount++;
      } else if (cat === 'TRACTOR') {
        tracSum += (p.attributi.passaggio * 1.5 + p.attributi.visione * 1.5 + p.attributi.resistenza) * 1.3 + dutyIntercettoBonus;
        tracCount++;
      } else {
        // LUCTATOR
        luctSum += (p.attributi.contrasto * 1.5 + p.attributi.forza * 1.5 + p.attributi.marcatura) * 1.3 + dutyPlaccaggiBonus;
        luctCount++;
      }
    });

    return {
      praevenientes: (praevCount > 0 ? praevSum / praevCount : 50) * homeArenaBonus,
      tractores: (tracCount > 0 ? tracSum / tracCount : 50) * homeArenaBonus,
      luctatores: (luctCount > 0 ? luctSum / luctCount : 50) * homeArenaBonus,
      custos: (custosSum > 0 ? custosSum : 50) * homeArenaBonus
    };
  };

  const homeP = computeHarpastumPower(homeClub, homeLineup, true);
  const awayP = computeHarpastumPower(awayClub, awayLineup, false);

  // Calcolo possesso e supremazia sulla linea mediana (mesê grammê)
  const totalMediana = homeP.tractores + awayP.tractores || 100;
  const possHome = Math.min(75, Math.max(25, Math.round((homeP.tractores / totalMediana) * 100)));
  const possAway = 100 - possHome;

  // Tentativi di sfondamento verso la linea di fondo
  const incursioniCasa = Math.max(4, Math.round((homeP.praevenientes / 7.5) + (possHome / 12) + (Math.random() * 4)));
  const incursioniOspite = Math.max(3, Math.round((awayP.praevenientes / 7.5) + (possAway / 12) + (Math.random() * 4)));

  // Incursioni a ridosso della linea di fondo (dentro i 10 passi)
  const assaltiMetaCasa = Math.min(incursioniCasa, Math.max(1, Math.round(incursioniCasa * (0.35 + Math.random() * 0.35))));
  const assaltiMetaOspite = Math.min(incursioniOspite, Math.max(1, Math.round(incursioniOspite * (0.35 + Math.random() * 0.35))));

  // Placcaggi ed intercetti
  const placcaggiCasa = Math.round((homeP.luctatores / 4) + Math.random() * 8 + 8);
  const placcaggiOspite = Math.round((awayP.luctatores / 4) + Math.random() * 8 + 8);
  const intercettiCasa = Math.round((homeP.tractores / 8) + Math.random() * 6 + 4);
  const intercettiOspite = Math.round((awayP.tractores / 8) + Math.random() * 6 + 4);

  // Calcolo Mete realizzate (portare la palla oltre la linea di fondo senza farsi bloccare a terra)
  const calculateMete = (praev: number, oppLuct: number, oppCustos: number, assalti: number) => {
    let mete = 0;
    for (let i = 0; i < assalti; i++) {
      const chance = (praev * 1.15) / (oppLuct * 0.85 + oppCustos + 18);
      if (Math.random() < chance * 0.52) {
        mete++;
      }
    }
    return mete;
  };

  const meteCasa = calculateMete(homeP.praevenientes, awayP.luctatores, awayP.custos, assaltiMetaCasa);
  const meteOspite = calculateMete(awayP.praevenientes, homeP.luctatores, homeP.custos, assaltiMetaOspite);

  const events: MatchEvent[] = [];
  const marcatoriCasa: { minuto: number; nome: string }[] = [];
  const marcatoriOspite: { minuto: number; nome: string }[] = [];

  // Seleziona l'atleta che realizza la meta (privilegiando i Praevenientes/Cursori)
  const pickScorer = (club: Club, lineup: Player[]) => {
    if (lineup.length === 0) {
      return { nome: 'Atleta', cognome: club.sigla, id: `ghost_${club.id}` };
    }
    const praevs = lineup.filter(p => getHarpastumCategory(p) === 'PRAEVENIENS');
    const pool = praevs.length > 0 ? praevs : lineup;
    return pool[Math.floor(Math.random() * pool.length)] || { nome: 'Atleta', cognome: club.sigla, id: `ghost_${club.id}` };
  };

  const pickLuctator = (lineup: Player[]) => {
    const lucts = lineup.filter(p => getHarpastumCategory(p) === 'LUCTATOR');
    return (lucts.length > 0 ? lucts : lineup)[Math.floor(Math.random() * lineup.length)];
  };

  const pickTractor = (lineup: Player[]) => {
    const tracs = lineup.filter(p => getHarpastumCategory(p) === 'TRACTOR');
    return (tracs.length > 0 ? tracs : lineup)[Math.floor(Math.random() * lineup.length)];
  };

  const timelineMinutes = new Set<number>();
  const getUniqueMinute = () => {
    let m = Math.floor(Math.random() * 90) + 1;
    while (timelineMinutes.has(m)) m = Math.floor(Math.random() * 90) + 1;
    timelineMinutes.add(m);
    return m;
  };

  // Resoconto delle Mete della squadra di casa
  const cronacheMetaCasa = [
    'scatta lungo la sabbia, elude due placcaggi con una finta magistrale e si getta oltre la linea di fondo! META HARPASTICA!',
    'riceve una parabola perfetta a due mani, resiste alla carica a terra e inchioda la palla nella polvere oltre la linea! PUNCTUM!',
    'sfonda la linea difensiva con pura virtus corporale e schiaccia la sfera di cuoio oltre la linea castrense!'
  ];

  for (let g = 0; g < meteCasa; g++) {
    const min = getUniqueMinute();
    const scorer = pickScorer(homeClub, homeLineup);
    const desc = cronacheMetaCasa[g % cronacheMetaCasa.length];
    marcatoriCasa.push({ minuto: min, nome: `${scorer.nome} ${scorer.cognome}` });
    events.push({
      minuto: min,
      tipo: 'META',
      squadra: 'CASA',
      giocatoreId: scorer.id,
      giocatoreNome: `${scorer.nome} ${scorer.cognome}`,
      dettaglio: `[META] ${scorer.nome} ${scorer.cognome} ${desc}`
    });
  }

  // Resoconto delle Mete della squadra ospite
  const cronacheMetaOspite = [
    'intercetta una palla vagante, semina i difensori avversari e varca la linea di meta tra gli applausi dei tribuni!',
    'si infiltra nel varco scoperto, salta la spallata del custode e deposita la piccola palla oltre la linea di fondo! META!',
    'con uno scatto felino evita la morsa dei lottatori e consacra il punto per i suoi colori!'
  ];

  for (let g = 0; g < meteOspite; g++) {
    const min = getUniqueMinute();
    const scorer = pickScorer(awayClub, awayLineup);
    const desc = cronacheMetaOspite[g % cronacheMetaOspite.length];
    marcatoriOspite.push({ minuto: min, nome: `${scorer.nome} ${scorer.cognome}` });
    events.push({
      minuto: min,
      tipo: 'META',
      squadra: 'OSPITE',
      giocatoreId: scorer.id,
      giocatoreNome: `${scorer.nome} ${scorer.cognome}`,
      dettaglio: `[META] ${scorer.nome} ${scorer.cognome} ${desc}`
    });
  }

  // Eventi agonistici: Placcaggi spettacolari e intercetti di palla
  const highlightCount = 2 + Math.floor(Math.random() * 3);
  for (let h = 0; h < highlightCount; h++) {
    const min = getUniqueMinute();
    const isHome = Math.random() < 0.5;
    const lineup = isHome ? homeLineup : awayLineup;
    if (lineup.length > 0) {
      if (Math.random() > 0.4) {
        const l = pickLuctator(lineup);
        events.push({
          minuto: min,
          tipo: 'PLACCAGGIO',
          squadra: isHome ? 'CASA' : 'OSPITE',
          giocatoreId: l?.id,
          giocatoreNome: l ? `${l.nome} ${l.cognome}` : 'Lottatore',
          dettaglio: `[PLACCAGGIO] Intervento titanico nella sabbia: sbarra la corsa dell'incursore e arresta l'assalto!`
        });
      } else {
        const t = pickTractor(lineup);
        events.push({
          minuto: min,
          tipo: 'INTERCETTO',
          squadra: isHome ? 'CASA' : 'OSPITE',
          giocatoreId: t?.id,
          giocatoreNome: t ? `${t.nome} ${t.cognome}` : 'Trattore',
          dettaglio: `[INTERCETTO] Presa acrobatica a due mani a mezz'aria sulla mesê grammê! Possesso ribaltato!`
        });
      }
    }
  }

  // Infortuni da scontro e placcaggio duro nell'arena sabbiosa
  [...homeLineup, ...awayLineup].forEach(p => {
    const fatigue = p.caricoFatica || 0;
    const cond = p.condizione;
    let matchInjuryChance = 0.018;
    if (cond < 65) matchInjuryChance += 0.04;
    if (fatigue > 60) matchInjuryChance += 0.05;

    if (Math.random() < matchInjuryChance && !p.infortunato) {
      const min = getUniqueMinute();
      const injury = ROMAN_INJURIES[Math.floor(Math.random() * ROMAN_INJURIES.length)];
      p.infortunato = true;
      p.giorniInfortunio = injury.baseDays;
      p.tipoInfortunio = injury.name;
      p.gravitaInfortunio = injury.severity;
      const isHomePlayer = p.clubId === homeClub.id;

      events.push({
        minuto: min,
        tipo: 'INFORTUNIO',
        squadra: isHomePlayer ? 'CASA' : 'OSPITE',
        giocatoreId: p.id,
        giocatoreNome: `${p.nome} ${p.cognome}`,
        dettaglio: `[INFORTUNIO] ${p.nome} ${p.cognome} crolla nella sabbia dopo un placcaggio: ${injury.name}! Trasportato al Valetudinarium (${injury.baseDays} giorni).`
      });
    }
  });

  // Falli da scontro proibito / ammonizioni arbitrali
  const cardCount = Math.floor(Math.random() * 3) + 1;
  for (let c = 0; c < cardCount; c++) {
    const min = getUniqueMinute();
    const isHome = Math.random() < 0.5;
    const lineup = isHome ? homeLineup : awayLineup;
    if (lineup.length > 0) {
      const p = lineup[Math.floor(Math.random() * lineup.length)];
      events.push({
        minuto: min,
        tipo: 'GIALLO',
        squadra: isHome ? 'CASA' : 'OSPITE',
        giocatoreId: p.id,
        giocatoreNome: `${p.nome} ${p.cognome}`,
        dettaglio: 'Scontro eccessivo a terra e presa proibita alla gola: sanzione del decurione arbitrale.'
      });
    }
  }

  // Ordinamento cronologico degli eventi
  events.sort((a, b) => a.minuto - b.minuto);
  marcatoriCasa.sort((a, b) => a.minuto - b.minuto);
  marcatoriOspite.sort((a, b) => a.minuto - b.minuto);

  // Calcolo pagelle atletiche dell'agone (4.0 - 10.0)
  const pagelle: Record<string, PlayerMatchRating> = {};
  const assignRatings = (lineup: Player[], isWinner: boolean, isLoser: boolean) => {
    lineup.forEach(p => {
      let baseVote = 6.0;
      if (isWinner) baseVote += 0.8;
      if (isLoser) baseVote -= 0.6;
      baseVote += (Math.random() * 1.2 - 0.4);

      const meteFatte = events.filter(e => e.giocatoreId === p.id && (e.tipo === 'META' || e.tipo === 'GOL')).length;
      baseVote += meteFatte * 1.3;

      pagelle[p.id] = {
        playerId: p.id,
        voto: Number(Math.min(10, Math.max(4.0, baseVote)).toFixed(1)),
        gol: meteFatte,
        assist: 0,
        minuti: 90
      };
    });
  };

  assignRatings(homeLineup, meteCasa > meteOspite, meteCasa < meteOspite);
  assignRatings(awayLineup, meteOspite > meteCasa, meteOspite < meteCasa);

  const stats: MatchStats = {
    possessoCasa: possHome,
    possessoOspite: possAway,
    tiriCasa: incursioniCasa,
    tiriOspite: incursioniOspite,
    tiriInPortaCasa: assaltiMetaCasa,
    tiriInPortaOspite: assaltiMetaOspite,
    falliCasa: Math.floor(Math.random() * 7) + 5,
    falliOspite: Math.floor(Math.random() * 7) + 5,
    angoliCasa: Math.floor(Math.random() * 5) + 2,
    angoliOspite: Math.floor(Math.random() * 5) + 2,
    placcaggiVintiCasa: placcaggiCasa,
    placcaggiVintiOspite: placcaggiOspite,
    intercettiCasa: intercettiCasa,
    intercettiOspite: intercettiOspite
  };

  return {
    golCasa: meteCasa,
    golOspite: meteOspite,
    marcatoriCasa,
    marcatoriOspite,
    eventi: events,
    statistiche: stats,
    pagelle
  };
}
