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
