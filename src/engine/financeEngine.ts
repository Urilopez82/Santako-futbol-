import { Club, FinancialLedgerEntry } from '../types/club';
import { Player } from '../types/player';

export function processWeeklyFinances(
  club: Club,
  players: Record<string, Player>,
  currentDate: string
): { updatedClub: Club; ledgerEntries: FinancialLedgerEntry[] } {
  const ledgerEntries: FinancialLedgerEntry[] = [];

  // Calculate total weekly salaries of players
  let totalPlayerWages = 0;
  club.playerIds.forEach((pid) => {
    const p = players[pid];
    if (p && p.contract) {
      totalPlayerWages += p.contract.wagePerWeek;
    }
  });

  // Base maintenance based on stadium capacity & facilities
  const stadiumMaintenance = Math.round(club.stadium.capacity * 0.15);
  const facilitiesMaintenance =
    (club.facilities.trainingGroundLevel +
      club.facilities.youthAcademyLevel +
      club.facilities.medicalCenterLevel) *
    450;
  const staffWeekly = 1200;

  // Add wage entry
  if (totalPlayerWages > 0) {
    ledgerEntries.push({
      id: `ledg_wage_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      date: currentDate,
      category: 'salarios',
      description: `Pago semanal de nóminas de plantilla (${club.playerIds.length} jugadores)`,
      amount: -totalPlayerWages,
    });
  }

  // Add operational maintenance entry
  const totalOperatingCost = stadiumMaintenance + facilitiesMaintenance + staffWeekly;
  ledgerEntries.push({
    id: `ledg_maint_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    date: currentDate,
    category: 'mantenimiento',
    description: 'Mantenimiento del estadio e instalaciones y cuerpo técnico',
    amount: -totalOperatingCost,
  });

  // Calculate weekly sponsor share
  const weeklySponsorIncome = Math.round(club.finances.sponsorAnnualRevenue / 38);
  ledgerEntries.push({
    id: `ledg_spon_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    date: currentDate,
    category: 'patrocinio',
    description: `Ingreso semanal por patrocinio (${club.finances.sponsorName})`,
    amount: weeklySponsorIncome,
  });

  const netWeeklyChange = weeklySponsorIncome - totalPlayerWages - totalOperatingCost;
  const newBalance = club.finances.balance + netWeeklyChange;

  const updatedLedger = [...ledgerEntries, ...club.finances.recentLedger].slice(0, 30);

  const updatedClub: Club = {
    ...club,
    finances: {
      ...club.finances,
      balance: newBalance,
      recentLedger: updatedLedger,
    },
  };

  return { updatedClub, ledgerEntries };
}
