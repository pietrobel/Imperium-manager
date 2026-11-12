import type { Club, Player } from '../types';

export interface WeeklyFinancialReport {
  entrateBiglietti: number;
  entratePatroni: number;
  usciteStipendi: number;
  usciteManutenzione: number;
  saldoNettoSettimana: number;
  nuovoSaldoCassa: number;
  spettatori: number;
}

export function processWeeklyFinances(
  club: Club,
  players: Player[],
  isHomeMatch: boolean,
  opponentReputation: number = 700
): { updatedClub: Club; report: WeeklyFinancialReport } {
  // Total wages of squad
  const totalWages = players.reduce((sum, p) => sum + p.contratto.stipendioSettimanale, 0);

  // Gate receipts if home match
  let gateRevenue = 0;
  let attendance = 0;
  if (isHomeMatch) {
    const interestFactor = (club.reputazione * 0.6 + opponentReputation * 0.4) / 1000;
    const maxCapacity = club.stadioCapienza;
    attendance = Math.min(maxCapacity, Math.round(maxCapacity * (0.6 + Math.random() * 0.35 * interestFactor)));
    const avgTicketPrice = 12; // 12 Sesterzi a biglietto
    gateRevenue = attendance * avgTicketPrice;
  }

  // Patronage / Senator sponsors
  const patronRevenue = Math.round(club.reputazione * 120);

  // Stadium & gladiator school upkeep
  const maintenanceCost = Math.round(club.stadioCapienza * 1.5);

  const netWeekly = gateRevenue + patronRevenue - totalWages - maintenanceCost;
  const newBalance = club.saldoCassa + netWeekly;

  const updatedClub: Club = {
    ...club,
    saldoCassa: newBalance,
    budgetStipendi: totalWages
  };

  const report: WeeklyFinancialReport = {
    entrateBiglietti: gateRevenue,
    entratePatroni: patronRevenue,
    usciteStipendi: totalWages,
    usciteManutenzione: maintenanceCost,
    saldoNettoSettimana: netWeekly,
    nuovoSaldoCassa: newBalance,
    spettatori: attendance
  };

  return { updatedClub, report };
}

export interface ArenaExpansionTier {
  id: 'LEGNO' | 'TRAVERTINO' | 'MARMOREA';
  nome: string;
  descrizione: string;
  postiAggiuntivi: number;
  costoHS: number;
}

export const ARENA_EXPANSION_TIERS: ArenaExpansionTier[] = [
  {
    id: 'LEGNO',
    nome: 'Gradinata in Legno di Quercia',
    descrizione: 'Aggiunge 2.500 posti popolari lungo il lato settentrionale dell’arena.',
    postiAggiuntivi: 2500,
    costoHS: 350000
  },
  {
    id: 'TRAVERTINO',
    nome: 'Anello in Travertino Tiburtino',
    descrizione: 'Amplia gli spalti principali con 5.000 seggi in pietra per cittadini e cavalieri.',
    postiAggiuntivi: 5000,
    costoHS: 750000
  },
  {
    id: 'MARMOREA',
    nome: 'Tribuna Senatoria Marmorea',
    descrizione: 'Opera monumentale da 10.000 posti con velario ombreggiante e loggia consolare.',
    postiAggiuntivi: 10000,
    costoHS: 1600000
  }
];

export function expandArenaCapacity(
  club: Club,
  tierId: ArenaExpansionTier['id']
): { success: boolean; updatedClub: Club; message: string } {
  const tier = ARENA_EXPANSION_TIERS.find(t => t.id === tierId);
  if (!tier) {
    return { success: false, updatedClub: club, message: 'Progetto architettonico non riconosciuto.' };
  }
  if (club.saldoCassa < tier.costoHS) {
    return {
      success: false,
      updatedClub: club,
      message: `Erario insufficiente: servono ${tier.costoHS.toLocaleString()} HS per ${tier.nome}.`
    };
  }
  const updatedClub: Club = {
    ...club,
    saldoCassa: club.saldoCassa - tier.costoHS,
    stadioCapienza: club.stadioCapienza + tier.postiAggiuntivi,
    reputazione: Math.min(1000, club.reputazione + (tierId === 'MARMOREA' ? 15 : tierId === 'TRAVERTINO' ? 8 : 4))
  };
  return {
    success: true,
    updatedClub,
    message: `${tier.nome} completata! Capienza di ${club.stadioNome} portata a ${updatedClub.stadioCapienza.toLocaleString()} spettatori.`
  };
}

export function calculateRenewalTerms(player: Player, extraYears: number): {
  newWageHS: number;
  signingBonusHS: number;
} {
  const baseWage = Math.max(800, player.contratto.stipendioSettimanale);
  const ageFactor = player.eta <= 24 ? 1.15 : player.eta >= 31 ? 0.92 : 1.05;
  const ovrBoost = Math.max(0.95, player.valoreGenerale / 72);
  const durationDiscount = extraYears >= 4 ? 0.94 : extraYears === 3 ? 0.97 : 1.0;
  const newWageHS = Math.round((baseWage * ageFactor * ovrBoost * durationDiscount) / 50) * 50;
  const signingBonusHS = Math.round((newWageHS * (3 + extraYears * 1.5)) / 100) * 100;
  return { newWageHS, signingBonusHS };
}

export function renewPlayerContract(
  club: Club,
  player: Player,
  extraYears: number,
  currentYear: number
): { success: boolean; updatedClub: Club; updatedPlayer: Player; message: string } {
  const { newWageHS, signingBonusHS } = calculateRenewalTerms(player, extraYears);
  if (club.saldoCassa < signingBonusHS) {
    return {
      success: false,
      updatedClub: club,
      updatedPlayer: player,
      message: `Fondi insufficienti per il premio alla firma (${signingBonusHS.toLocaleString()} HS).`
    };
  }

  const baseYear = Math.max(currentYear, player.contratto.annoScadenza);
  const newExpiryYear = baseYear + extraYears;

  const updatedClub: Club = {
    ...club,
    saldoCassa: club.saldoCassa - signingBonusHS
  };

  const updatedPlayer: Player = {
    ...player,
    morale: Math.min(100, player.morale + 10),
    contratto: {
      ...player.contratto,
      clubId: club.id,
      stipendioSettimanale: newWageHS,
      annoScadenza: newExpiryYear
    }
  };

  return {
    success: true,
    updatedClub,
    updatedPlayer,
    message: `Contratto di ${player.nome} ${player.cognome} rinnovato fino al ${Math.abs(newExpiryYear)} a.C. (${newWageHS.toLocaleString()} HS/sett., premio ${signingBonusHS.toLocaleString()} HS).`
  };
}

export function computeTribuneFavor(career: {
  manager: { vittorie: number; pareggi: number; sconfitte: number; partiteGestite: number; puntiReputazione: number };
  clubs: Record<string, Club>;
  userClubId: string;
}): { percentage: number; label: 'TRIONFALE' | 'ALTO' | 'STABILE' | 'IN CALO' } {
  const club = career.clubs[career.userClubId];
  const { vittorie, pareggi, partiteGestite, puntiReputazione } = career.manager;
  const winRatio = partiteGestite > 0 ? (vittorie + pareggi * 0.4) / partiteGestite : 0.6;
  const repScore = Math.min(100, (puntiReputazione || 500) / 10);
  const treasuryBonus = club ? (club.saldoCassa >= 0 ? 8 : -14) : 0;
  const raw = Math.round(45 + winRatio * 34 + repScore * 0.16 + treasuryBonus);
  const percentage = Math.max(15, Math.min(99, raw));
  const label =
    percentage >= 85 ? 'TRIONFALE' : percentage >= 68 ? 'ALTO' : percentage >= 45 ? 'STABILE' : 'IN CALO';
  return { percentage, label };
}

