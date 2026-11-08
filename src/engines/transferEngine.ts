import type { Player, Club, Transfer, IncomingTransferOffer, CareerSave } from '../types';

/**
 * Calculates fair market valuation in Sesterzi (HS).
 * Calibrated against club budgets (1.000.000 - 4.500.000 HS).
 * A 65 OVR is ~800k HS, 75 OVR is ~1.4M HS, 85 OVR is ~2.5M HS, 92 OVR superstar is ~3.5M HS.
 */
export function calculatePlayerMarketValue(player: Player): number {
  if (!player.clubId) return 0;
  const ovr = Math.max(50, player.valoreGenerale);
  // Re-calibrated scale: 65 OVR ~ 270k HS, 75 OVR ~ 420k HS, 85 OVR ~ 600k HS, 92 OVR superstar ~ 850k HS
  const base = Math.round(ovr * ovr * 75);
  const potBonus = 1 + Math.max(0, player.potenziale - ovr) * 0.03;
  const ageMult = player.eta <= 21 ? 1.25 : player.eta <= 26 ? 1.1 : player.eta <= 29 ? 1.0 : player.eta <= 32 ? 0.75 : 0.55;
  const computedVal = Math.max(25000, Math.round((base * potBonus * ageMult) / 2500) * 2500);

  if (player.prezzoRichiesto && player.prezzoRichiesto > 0) {
    // If asking price is excessively high from legacy 240x multiplier, cap it relative to fair value
    if (player.prezzoRichiesto > computedVal * 2.2) {
      return computedVal;
    }
    return player.prezzoRichiesto;
  }
  return computedVal;
}

export interface TransferOffer {
  playerId: string;
  buyingClubId: string;
  sellingClubId: string;
  offeredFee: number;
  offeredWage: number;
}

// =========================================================================
// REAL MULTI-STAGE NEGOTIATION DATA STRUCTURES
// =========================================================================

export interface NegotiationDialogueEntry {
  id: string;
  speaker: 'SELLER' | 'BUYER' | 'PLAYER' | 'AGENT' | 'SYSTEM';
  speakerName: string;
  text: string;
  timestamp: string;
  type?: 'OFFER' | 'COUNTER' | 'ACCEPT' | 'REJECT' | 'INFO';
}

export interface NegotiationSession {
  stage: 'CLUB_FEE' | 'PLAYER_TERMS' | 'COMPLETED' | 'COLLAPSED';
  player: Player;
  sellingClub: Club | null;
  buyingClub: Club;
  round: number;
  maxRounds: number;
  clubPatience: number;    // 0 - 100
  playerPatience: number;  // 0 - 100
  fairMarketValue: number;
  targetFee: number;
  minAcceptableFee: number;
  targetWage: number;
  minAcceptableWage: number;
  prestigeFactor: number;  // Ratio of buyer reputation vs seller / benchmark
  agreedFee?: number;
  agreedWage?: number;
  agreedYears?: number;
  agreedBonus?: number;
  agreedReleaseClause?: number;
  clubCounterFee?: number;
  playerCounterWage?: number;
  playerCounterBonus?: number;
  dialogueHistory: NegotiationDialogueEntry[];
}

/**
 * Initializes a new realistic negotiation session between Buying Club, Selling Club, and Player.
 */
export function initiateNegotiationSession(
  player: Player,
  buyingClub: Club,
  sellingClub: Club | null,
  currentDateText: string
): NegotiationSession {
  const isFreeAgent = !player.clubId || !sellingClub;
  const fairMarketValue = isFreeAgent ? 0 : calculatePlayerMarketValue(player);
  
  // Reputation analysis
  const buyerRep = buyingClub.reputazione;
  const sellerRep = sellingClub ? sellingClub.reputazione : 550;
  const repDiff = buyerRep - sellerRep; // Positive means buyer has higher prestige
  const prestigeFactor = Math.max(0.7, Math.min(1.4, 1 + (repDiff / 1000)));

  // Target Fee for selling club
  let targetFee = fairMarketValue;
  if (!isFreeAgent) {
    if (player.inListaTrasferimenti) {
      // Listed players: seller is motivated to sell
      targetFee = Math.round(fairMarketValue * 0.95);
    } else {
      // Unlisted: seller demands premium, adjusted by buyer's reputation
      const unlistedPremium = repDiff > 100 ? 1.10 : 1.25;
      targetFee = Math.round(fairMarketValue * unlistedPremium);
    }
  }
  const minAcceptableFee = isFreeAgent ? 0 : Math.round(targetFee * 0.86);

  // Target Wage for player
  const currentWage = player.contratto?.stipendioSettimanale || Math.round(player.valoreGenerale * 250);
  let wageMultiplier = 1.10; // Standard 10% raise
  if (repDiff > 120) {
    // Stepping up to prestigious club: player is excited, accepts modest raise
    wageMultiplier = 1.05;
  } else if (repDiff < -100) {
    // Stepping down to lower-reputation club: player demands premium compensation
    wageMultiplier = 1.35;
  }

  const targetWage = Math.round(currentWage * wageMultiplier);
  const minAcceptableWage = Math.round(targetWage * 0.88);

  const initialDialogue: NegotiationDialogueEntry[] = [];

  if (isFreeAgent) {
    initialDialogue.push({
      id: `diag_${Date.now()}_0`,
      speaker: 'AGENT',
      speakerName: `Procuratore di ${player.nome}`,
      text: `Salute, delegati del ${buyingClub.nome}! L'atleta ${player.nome} ${player.cognome} è svincolato e pronto a negoziare direttamente l'ingaggio. Cerchiamo una proposta all'altezza del suo talento.`,
      timestamp: currentDateText,
      type: 'INFO'
    });
  } else {
    initialDialogue.push({
      id: `diag_${Date.now()}_0`,
      speaker: 'SELLER',
      speakerName: `Senato di ${sellingClub?.nome}`,
      text: player.inListaTrasferimenti
        ? `Accogliamo con favore l'interesse del ${buyingClub.nome} per ${player.nome} ${player.cognome}. L'atleta è sul mercato con una valutazione base di ${targetFee.toLocaleString()} HS. Ascoltiamo la vostra prima offerta.`
        : `L'atleta ${player.nome} ${player.cognome} è una colonna fondamentale della nostra coorte. Per privarcene, pretendiamo un indennizzo congruo di circa ${targetFee.toLocaleString()} HS.`,
      timestamp: currentDateText,
      type: 'INFO'
    });
  }

  return {
    stage: isFreeAgent ? 'PLAYER_TERMS' : 'CLUB_FEE',
    player,
    sellingClub,
    buyingClub,
    round: 1,
    maxRounds: 4,
    clubPatience: 100,
    playerPatience: 100,
    fairMarketValue,
    targetFee,
    minAcceptableFee,
    targetWage,
    minAcceptableWage,
    prestigeFactor,
    dialogueHistory: initialDialogue
  };
}

/**
 * Evaluates a proposed transfer fee sent by the buyer to the selling club.
 */
export function submitClubFeeNegotiation(
  session: NegotiationSession,
  offeredFee: number,
  currentDateText: string
): NegotiationSession {
  if (session.stage !== 'CLUB_FEE' || !session.sellingClub) return session;

  const { player, sellingClub, buyingClub, targetFee, minAcceptableFee, round, maxRounds } = session;
  const sellerName = `Senato di ${sellingClub.nome}`;
  const repDiff = buyingClub.reputazione - sellingClub.reputazione;

  const dialogue = [...session.dialogueHistory];
  dialogue.push({
    id: `diag_${Date.now()}_bid`,
    speaker: 'BUYER',
    speakerName: `Delegazione ${buyingClub.nome}`,
    text: `Presentiamo formale proposta di acquisto: offriamo ${offeredFee.toLocaleString()} Sesterzi (HS) per il cartellino a titolo definitivo.`,
    timestamp: currentDateText,
    type: 'OFFER'
  });

  // Check 1: Insulting bid (< 60% of minimum)
  if (offeredFee < minAcceptableFee * 0.65) {
    const newPatience = Math.max(0, session.clubPatience - 45);
    if (newPatience <= 0 || round >= maxRounds) {
      dialogue.push({
        id: `diag_${Date.now()}_walk`,
        speaker: 'SELLER',
        speakerName: sellerName,
        text: `Questa cifra (${offeredFee.toLocaleString()} HS) è un insulto alla dignità del nostro club! Rifiutiamo di continuare il dialogo. La trattativa è chiusa!`,
        timestamp: currentDateText,
        type: 'REJECT'
      });
      return {
        ...session,
        clubPatience: 0,
        stage: 'COLLAPSED',
        dialogueHistory: dialogue
      };
    }

    dialogue.push({
      id: `diag_${Date.now()}_warn`,
      speaker: 'SELLER',
      speakerName: sellerName,
      text: `Offerta irricevibile. Un atleta del calibro di ${player.nome} ${player.cognome} non verrà svenduto. Serve un'offerta seria o ci alzeremo dal tavolo.`,
      timestamp: currentDateText,
      type: 'REJECT'
    });

    return {
      ...session,
      round: round + 1,
      clubPatience: newPatience,
      dialogueHistory: dialogue
    };
  }

  // Check 2: Accepted Fee (meets or exceeds minimum acceptable fee)
  if (offeredFee >= minAcceptableFee) {
    dialogue.push({
      id: `diag_${Date.now()}_acc`,
      speaker: 'SELLER',
      speakerName: sellerName,
      text: `Accettiamo la vostra offerta di ${offeredFee.toLocaleString()} HS! Il Senato ratifica l'intesa sul cartellino. Ora avete l'autorizzazione a negoziare i termini personali con l'atleta e il suo procuratore.`,
      timestamp: currentDateText,
      type: 'ACCEPT'
    });

    dialogue.push({
      id: `diag_${Date.now()}_agent_intro`,
      speaker: 'AGENT',
      speakerName: `Procuratore di ${player.nome}`,
      text: `Bene, club accordati. Ora discutiamo l'ingaggio settimanale, la durata del contratto e gli incentivi alla firma per ${player.nome}.`,
      timestamp: currentDateText,
      type: 'INFO'
    });

    return {
      ...session,
      stage: 'PLAYER_TERMS',
      agreedFee: offeredFee,
      clubCounterFee: undefined,
      round: 1, // Reset round for player terms
      dialogueHistory: dialogue
    };
  }

  // Check 3: Counter-Offer (offer is between 65% and 100% of minimum acceptable)
  const newPatience = Math.max(10, session.clubPatience - 20);
  if (round >= maxRounds) {
    dialogue.push({
      id: `diag_${Date.now()}_timeout`,
      speaker: 'SELLER',
      speakerName: sellerName,
      text: `Abbiamo esaurito il tempo delle consultazioni senatorie senza trovare un'intesa. Ritiriamo il calciatore dalle negoziazioni.`,
      timestamp: currentDateText,
      type: 'REJECT'
    });
    return {
      ...session,
      clubPatience: 0,
      stage: 'COLLAPSED',
      dialogueHistory: dialogue
    };
  }

  // Calculate realistic counter-proposal (midpoint between offer and target)
  const counterGap = targetFee - offeredFee;
  const concession = repDiff > 80 ? 0.6 : 0.45; // Generous concessions to higher-reputation clubs
  const counterFee = Math.round((offeredFee + counterGap * concession) / 10000) * 10000;

  dialogue.push({
    id: `diag_${Date.now()}_counter`,
    speaker: 'SELLER',
    speakerName: sellerName,
    text: `La vostra proposta di ${offeredFee.toLocaleString()} HS non è sufficiente, ma apprezziamo lo sforzo. Siamo disposti a chiudere l'accordo per ${counterFee.toLocaleString()} HS.`,
    timestamp: currentDateText,
    type: 'COUNTER'
  });

  return {
    ...session,
    round: round + 1,
    clubPatience: newPatience,
    clubCounterFee: counterFee,
    dialogueHistory: dialogue
  };
}

/**
 * Buyer clicks to directly accept the selling club's counter-offer.
 */
export function acceptClubCounterOffer(
  session: NegotiationSession,
  currentDateText: string
): NegotiationSession {
  if (!session.clubCounterFee || session.stage !== 'CLUB_FEE') return session;

  const fee = session.clubCounterFee;
  const dialogue = [...session.dialogueHistory];
  dialogue.push({
    id: `diag_${Date.now()}_acc_counter`,
    speaker: 'BUYER',
    speakerName: `Delegazione ${session.buyingClub.nome}`,
    text: `Accettiamo la vostra controfferta di ${fee.toLocaleString()} HS! L'indennizzo è concordato.`,
    timestamp: currentDateText,
    type: 'ACCEPT'
  });

  dialogue.push({
    id: `diag_${Date.now()}_agent_intro`,
    speaker: 'AGENT',
    speakerName: `Procuratore di ${session.player.nome}`,
    text: `Accordo tra i club siglato! Ora tocca a noi: definiamo l'ingaggio settimanale, gli anni di vincolo e gli eventuali premi alla firma.`,
    timestamp: currentDateText,
    type: 'INFO'
  });

  return {
    ...session,
    stage: 'PLAYER_TERMS',
    agreedFee: fee,
    clubCounterFee: undefined,
    round: 1,
    dialogueHistory: dialogue
  };
}

/**
 * Evaluates contract terms submitted to the player and agent.
 */
export function submitPlayerTermsNegotiation(
  session: NegotiationSession,
  offeredWage: number,
  offeredYears: number,
  signingBonus: number,
  releaseClause: number | undefined,
  currentDateText: string
): NegotiationSession {
  if (session.stage !== 'PLAYER_TERMS') return session;

  const { player, buyingClub, targetWage, minAcceptableWage, round, maxRounds, prestigeFactor } = session;
  const agentName = `Procuratore di ${player.nome}`;
  const dialogue = [...session.dialogueHistory];

  dialogue.push({
    id: `diag_${Date.now()}_wage_bid`,
    speaker: 'BUYER',
    speakerName: `Delegazione ${buyingClub.nome}`,
    text: `Offriamo un ingaggio di ${offeredWage.toLocaleString()} HS a settimana per ${offeredYears} anni${signingBonus > 0 ? ` con un premio alla firma immediato di ${signingBonus.toLocaleString()} HS` : ''}.`,
    timestamp: currentDateText,
    type: 'OFFER'
  });

  // Effective compensation value includes a fraction of signing bonus amortized over weekly basis
  const bonusWeeklyEquivalent = Math.round(signingBonus / (offeredYears * 40));
  const effectiveOfferedWage = offeredWage + bonusWeeklyEquivalent;

  // Check 1: Insulting Wage proposal (< 65% of minimum)
  if (effectiveOfferedWage < minAcceptableWage * 0.70) {
    const newPatience = Math.max(0, session.playerPatience - 40);
    if (newPatience <= 0 || round >= maxRounds) {
      dialogue.push({
        id: `diag_${Date.now()}_player_walk`,
        speaker: 'PLAYER',
        speakerName: `${player.nome} ${player.cognome}`,
        text: `Non sono un gladiatore da quattro soldi! Questa offerta offende la mia professionalità e il mio valore. Rifiuto di trasferirmi al ${buyingClub.nome}.`,
        timestamp: currentDateText,
        type: 'REJECT'
      });
      return {
        ...session,
        playerPatience: 0,
        stage: 'COLLAPSED',
        dialogueHistory: dialogue
      };
    }

    dialogue.push({
      id: `diag_${Date.now()}_agent_warn`,
      speaker: 'AGENT',
      speakerName: agentName,
      text: `La proposta economica è ampiamente al di sotto delle nostre aspettative. Se non adeguate le cifre a livelli degni, non troveremo un accordo.`,
      timestamp: currentDateText,
      type: 'REJECT'
    });

    return {
      ...session,
      round: round + 1,
      playerPatience: newPatience,
      dialogueHistory: dialogue
    };
  }

  // Check 2: Accepted terms
  if (effectiveOfferedWage >= minAcceptableWage) {
    dialogue.push({
      id: `diag_${Date.now()}_player_acc`,
      speaker: 'PLAYER',
      speakerName: `${player.nome} ${player.cognome}`,
      text: `Accetto con entusiasmo! È un onore indossare la maglia del ${buyingClub.nome}. Darò tutto me stesso nell'arena per la vittoria e per la gloria dei nostri colori!`,
      timestamp: currentDateText,
      type: 'ACCEPT'
    });

    return {
      ...session,
      stage: 'COMPLETED',
      agreedWage: offeredWage,
      agreedYears: offeredYears,
      agreedBonus: signingBonus,
      agreedReleaseClause: releaseClause,
      playerCounterWage: undefined,
      playerCounterBonus: undefined,
      dialogueHistory: dialogue
    };
  }

  // Check 3: Counter-Offer from player & agent
  const newPatience = Math.max(10, session.playerPatience - 25);
  if (round >= maxRounds) {
    dialogue.push({
      id: `diag_${Date.now()}_player_timeout`,
      speaker: 'AGENT',
      speakerName: agentName,
      text: `Non abbiamo trovato una sintesi soddisfacente. Il mio assistito ha deciso di rimanere dov'è. Trattativa conclusa.`,
      timestamp: currentDateText,
      type: 'REJECT'
    });
    return {
      ...session,
      playerPatience: 0,
      stage: 'COLLAPSED',
      dialogueHistory: dialogue
    };
  }

  // Player counter-demand
  const counterWage = Math.round((offeredWage + (targetWage - offeredWage) * 0.5) / 250) * 250;
  const counterBonus = signingBonus > 0 ? signingBonus : (prestigeFactor < 0.95 ? 50000 : 0);

  dialogue.push({
    id: `diag_${Date.now()}_player_counter`,
    speaker: 'AGENT',
    speakerName: agentName,
    text: `Ci siamo quasi, ma ${player.nome} richiede un ingaggio di almeno ${counterWage.toLocaleString()} HS/settimana${counterBonus > 0 ? ` e un premio alla firma di ${counterBonus.toLocaleString()} HS` : ''} per firmare.`,
    timestamp: currentDateText,
    type: 'COUNTER'
  });

  return {
    ...session,
    round: round + 1,
    playerPatience: newPatience,
    playerCounterWage: counterWage,
    playerCounterBonus: counterBonus,
    dialogueHistory: dialogue
  };
}

/**
 * Buyer directly accepts player's counter demands.
 */
export function acceptPlayerCounterOffer(
  session: NegotiationSession,
  currentDateText: string
): NegotiationSession {
  if (!session.playerCounterWage || session.stage !== 'PLAYER_TERMS') return session;

  const wage = session.playerCounterWage;
  const bonus = session.playerCounterBonus || 0;
  const years = session.agreedYears || 3;

  const dialogue = [...session.dialogueHistory];
  dialogue.push({
    id: `diag_${Date.now()}_acc_player_counter`,
    speaker: 'BUYER',
    speakerName: `Delegazione ${session.buyingClub.nome}`,
    text: `Accogliamo le vostre condizioni: ${wage.toLocaleString()} HS a settimana${bonus > 0 ? ` con premio alla firma di ${bonus.toLocaleString()} HS` : ''}.`,
    timestamp: currentDateText,
    type: 'ACCEPT'
  });

  dialogue.push({
    id: `diag_${Date.now()}_signed`,
    speaker: 'PLAYER',
    speakerName: `${session.player.nome} ${session.player.cognome}`,
    text: `Contratto firmato! Onorerò questa maglia con coraggio e lealtà.`,
    timestamp: currentDateText,
    type: 'ACCEPT'
  });

  return {
    ...session,
    stage: 'COMPLETED',
    agreedWage: wage,
    agreedBonus: bonus,
    agreedYears: years,
    playerCounterWage: undefined,
    playerCounterBonus: undefined,
    dialogueHistory: dialogue
  };
}

/**
 * Finalizes the negotiated transfer in the career save state.
 */
export function finalizeNegotiation(
  session: NegotiationSession,
  career: CareerSave
): { updatedCareer: CareerSave; transfer: Transfer } {
  if (session.stage !== 'COMPLETED') {
    throw new Error('La trattativa non è ancora conclusa con successo.');
  }

  const { player, buyingClub, sellingClub, agreedFee = 0, agreedWage = 20000, agreedYears = 3, agreedBonus = 0, agreedReleaseClause } = session;

  const totalCashDeducted = agreedFee + agreedBonus;
  if (totalCashDeducted > buyingClub.saldoCassa) {
    throw new Error(`Fondi insufficienti in cassa: richiesti ${totalCashDeducted.toLocaleString()} HS tra cartellino e premio alla firma.`);
  }

  const transferRecord: Transfer = {
    id: `transf_${Date.now()}`,
    playerId: player.id,
    playerNome: `${player.nome} ${player.cognome}`,
    daClubId: sellingClub ? sellingClub.id : 'free_agent',
    daClubNome: sellingClub ? sellingClub.nome : 'Atleta Svincolato / Libero',
    aClubId: buyingClub.id,
    aClubNome: buyingClub.nome,
    cifraTrasferimento: agreedFee,
    data: career.currentDateText,
    stagioneAnno: career.currentYear
  };

  const { updatedPlayer, updatedBuyer, updatedSeller } = executeTransfer(
    transferRecord,
    player,
    {
      ...buyingClub,
      saldoCassa: buyingClub.saldoCassa - agreedBonus // Deduct signing bonus as well
    },
    sellingClub,
    agreedWage
  );

  // Update contract specifics
  updatedPlayer.contratto = {
    ...updatedPlayer.contratto,
    stipendioSettimanale: agreedWage,
    annoScadenza: career.currentYear + agreedYears,
    clausolaRescissoria: agreedReleaseClause
  };

  const updatedPlayers = { ...career.players, [updatedPlayer.id]: updatedPlayer };
  const updatedClubs = {
    ...career.clubs,
    [updatedBuyer.id]: updatedBuyer
  };
  if (updatedSeller) {
    updatedClubs[updatedSeller.id] = updatedSeller;
  }

  const updatedCareer: CareerSave = {
    ...career,
    clubs: updatedClubs,
    players: updatedPlayers,
    transfers: [transferRecord, ...(career.transfers || [])]
  };

  return { updatedCareer, transfer: transferRecord };
}

// =========================================================================
// STANDARD COMPATIBILITY API
// =========================================================================

/**
 * Evaluates a transfer offer submitted by the user or an AI club.
 */
export function evaluateTransferOffer(
  offer: TransferOffer,
  player: Player,
  sellingClub?: Club | null
): { accepted: boolean; reason: string; minFeeRequired: number; minWageRequired: number } {
  const isFreeAgent = !player.clubId || !sellingClub;
  const baseValue = isFreeAgent ? 0 : calculatePlayerMarketValue(player);
  
  const minFeeRequired = isFreeAgent 
    ? 0 
    : Math.round(player.inListaTrasferimenti ? baseValue * 0.88 : baseValue * 1.12);

  const baseWage = player.contratto?.stipendioSettimanale || Math.round(player.valoreGenerale * 250);
  const minWageRequired = Math.round(baseWage * 0.88);

  if (!isFreeAgent && offer.offeredFee < minFeeRequired) {
    return {
      accepted: false,
      reason: `Offerta respinta: ${sellingClub?.nome || 'Il Senato del club'} giudica insufficiente la somma di ${offer.offeredFee.toLocaleString()} HS per il cartellino di ${player.nome} ${player.cognome}. Richiesti almeno ${minFeeRequired.toLocaleString()} HS${player.inListaTrasferimenti ? ' (prezzo di lista)' : ' (maggiorazione per atleta incedibile)'}.`,
      minFeeRequired,
      minWageRequired
    };
  }

  if (offer.offeredWage < minWageRequired) {
    return {
      accepted: false,
      reason: `L'atleta ${player.nome} ${player.cognome} ha respinto la bozza d'ingaggio: la richiesta minima del suo procuratore è di ${minWageRequired.toLocaleString()} HS a settimana (attualmente percepisce ${baseWage.toLocaleString()} HS/sett.).`,
      minFeeRequired,
      minWageRequired
    };
  }

  return {
    accepted: true,
    reason: isFreeAgent
      ? `Accordo raggiunto! L'atleta libero ${player.nome} ${player.cognome} ha firmato il contratto per ${offer.offeredWage.toLocaleString()} HS/settimana e si unisce immediatamente alla legione!`
      : `Accordo ratificato dal Senato! ${sellingClub?.nome} accetta ${offer.offeredFee.toLocaleString()} HS e l'atleta ${player.nome} ${player.cognome} ha firmato per ${offer.offeredWage.toLocaleString()} HS/sett.!`,
    minFeeRequired,
    minWageRequired
  };
}

/**
 * Executes transfer: exchanges money, updates contracts and club rosters.
 */
export function executeTransfer(
  transfer: Transfer,
  player: Player,
  buyingClub: Club,
  sellingClub?: Club | null,
  agreedWage?: number
): { updatedPlayer: Player; updatedBuyer: Club; updatedSeller?: Club } {
  const updatedBuyer: Club = {
    ...buyingClub,
    saldoCassa: buyingClub.saldoCassa - transfer.cifraTrasferimento,
    budgetTrasferimenti: Math.max(0, buyingClub.budgetTrasferimenti - transfer.cifraTrasferimento)
  };

  let updatedSeller: Club | undefined;
  if (sellingClub) {
    updatedSeller = {
      ...sellingClub,
      saldoCassa: sellingClub.saldoCassa + transfer.cifraTrasferimento,
      budgetTrasferimenti: sellingClub.budgetTrasferimenti + Math.round(transfer.cifraTrasferimento * 0.8),
      titolariIds: sellingClub.titolariIds.filter(id => id !== player.id),
      panchinaIds: sellingClub.panchinaIds.filter(id => id !== player.id)
    };
  }

  const finalWage = agreedWage || player.contratto?.stipendioSettimanale || Math.round(player.valoreGenerale * 250);

  const updatedPlayer: Player = {
    ...player,
    clubId: buyingClub.id,
    inListaTrasferimenti: false,
    prezzoRichiesto: Math.round(player.valoreGenerale * player.valoreGenerale * 240),
    contratto: {
      ...player.contratto,
      clubId: buyingClub.id,
      stipendioSettimanale: finalWage,
      annoScadenza: transfer.stagioneAnno + 3
    }
  };

  return { updatedPlayer, updatedBuyer, updatedSeller };
}

/**
 * Generates realistic AI cash bids for a player belonging to the user's club.
 */
export function generateAIOffersForUserPlayer(
  player: Player,
  allClubs: Record<string, Club>,
  userClubId: string,
  currentMatchday: number,
  currentDateText: string
): IncomingTransferOffer[] {
  const otherClubs = Object.values(allClubs).filter(c => c.id !== userClubId);
  if (otherClubs.length === 0) return [];

  const fairVal = calculatePlayerMarketValue(player);
  const baseAsking = player.prezzoRichiesto > 0 ? player.prezzoRichiesto : fairVal;

  const viableClubs = otherClubs.filter(c => c.saldoCassa >= baseAsking * 0.7);
  const pool = viableClubs.length >= 3 ? viableClubs : otherClubs;

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const numOffers = 1 + Math.floor(Math.random() * 3);
  const selectedClubs = shuffled.slice(0, numOffers);

  return selectedClubs.map((club, idx) => {
    const mult = 0.88 + Math.random() * 0.27;
    const fee = Math.max(50000, Math.round((baseAsking * mult) / 10000) * 10000);

    return {
      id: `offer_${Date.now()}_${player.id}_${idx}`,
      playerId: player.id,
      playerNome: `${player.nome} ${player.cognome}`,
      playerRuolo: player.ruoloPrimario,
      playerOvr: player.valoreGenerale,
      playerEta: player.eta,
      offeringClubId: club.id,
      offeringClubNome: club.nome,
      offeredFee: fee,
      data: currentDateText,
      status: 'PENDING' as const,
      expiresMatchday: currentMatchday + 3
    };
  });
}

/**
 * Accepts an incoming transfer bid for a user player.
 */
export function acceptIncomingOffer(
  offer: IncomingTransferOffer,
  career: CareerSave
): { updatedCareer: CareerSave; transfer: Transfer } {
  const userClub = career.clubs[career.userClubId];
  const buyerClub = career.clubs[offer.offeringClubId];
  const player = career.players[offer.playerId];

  if (!userClub || !player) {
    throw new Error('Impossibile completare la cessione: dati atleta o club non trovati.');
  }

  const transferRecord: Transfer = {
    id: `transf_sale_${Date.now()}`,
    playerId: player.id,
    playerNome: `${player.nome} ${player.cognome}`,
    daClubId: userClub.id,
    daClubNome: userClub.nome,
    aClubId: buyerClub ? buyerClub.id : offer.offeringClubId,
    aClubNome: buyerClub ? buyerClub.nome : offer.offeringClubNome,
    cifraTrasferimento: offer.offeredFee,
    data: career.currentDateText,
    stagioneAnno: career.currentYear
  };

  const updatedUserClub: Club = {
    ...userClub,
    saldoCassa: userClub.saldoCassa + offer.offeredFee,
    budgetTrasferimenti: userClub.budgetTrasferimenti + Math.round(offer.offeredFee * 0.85),
    titolariIds: userClub.titolariIds.filter(id => id !== player.id),
    panchinaIds: userClub.panchinaIds.filter(id => id !== player.id)
  };

  let updatedBuyerClub: Club | undefined;
  if (buyerClub) {
    updatedBuyerClub = {
      ...buyerClub,
      saldoCassa: Math.max(0, buyerClub.saldoCassa - offer.offeredFee),
      panchinaIds: [...buyerClub.panchinaIds, player.id]
    };
  }

  const updatedPlayer: Player = {
    ...player,
    clubId: buyerClub ? buyerClub.id : offer.offeringClubId,
    inListaTrasferimenti: false,
    contratto: {
      ...player.contratto,
      clubId: buyerClub ? buyerClub.id : offer.offeringClubId,
      stipendioSettimanale: Math.round(player.valoreGenerale * 260),
      annoScadenza: career.currentYear + 3
    }
  };

  const updatedOffers = (career.incomingOffers || []).map(o => {
    if (o.id === offer.id) return { ...o, status: 'ACCEPTED' as const };
    if (o.playerId === player.id && o.status === 'PENDING') return { ...o, status: 'REJECTED' as const };
    return o;
  });

  const updatedClubs = {
    ...career.clubs,
    [updatedUserClub.id]: updatedUserClub
  };
  if (updatedBuyerClub) {
    updatedClubs[updatedBuyerClub.id] = updatedBuyerClub;
  }

  const updatedPlayers = {
    ...career.players,
    [player.id]: updatedPlayer
  };

  const updatedCareer: CareerSave = {
    ...career,
    clubs: updatedClubs,
    players: updatedPlayers,
    transfers: [transferRecord, ...career.transfers],
    incomingOffers: updatedOffers
  };

  return { updatedCareer, transfer: transferRecord };
}

/**
 * Releases an athlete into free agency (svincolo).
 */
export function releasePlayerContract(
  player: Player,
  userClub: Club
): { updatedPlayer: Player; updatedClub: Club; severanceFee: number } {
  const weeklyWage = player.contratto?.stipendioSettimanale || Math.round(player.valoreGenerale * 200);
  const severanceFee = weeklyWage * 2;

  const updatedClub: Club = {
    ...userClub,
    saldoCassa: Math.max(0, userClub.saldoCassa - severanceFee),
    titolariIds: userClub.titolariIds.filter(id => id !== player.id),
    panchinaIds: userClub.panchinaIds.filter(id => id !== player.id)
  };

  const updatedPlayer: Player = {
    ...player,
    clubId: '',
    inListaTrasferimenti: true,
    prezzoRichiesto: 0,
    contratto: {
      clubId: '',
      stipendioSettimanale: Math.round(player.valoreGenerale * 180),
      annoScadenza: -50
    }
  };

  return { updatedPlayer, updatedClub, severanceFee };
}
