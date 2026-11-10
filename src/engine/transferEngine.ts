import { Club } from '../types/club';
import { Player } from '../types/player';
import { TransferOffer } from '../types/transfer';

export function isTransferWindowActive(dateStr: string): boolean {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Summer window: July 1 to August 31
  if (month === 7 || month === 8) return true;
  // Winter window: January 1 to January 31
  if (month === 1) return true;

  return false;
}

export function evaluateCpuTransferResponse(
  player: Player,
  sellingClub: Club,
  offeredFee: number
): { accepted: boolean; counterFee?: number; reason: string } {
  const fairValue = player.marketValue;
  const minimumAcceptable = player.isTransferListed ? fairValue * 0.85 : fairValue * 1.1;

  if (offeredFee >= minimumAcceptable) {
    return {
      accepted: true,
      reason: `${sellingClub.name} ha considerado satisfactoria la oferta económica de ${offeredFee.toLocaleString()} € por ${player.firstName} ${player.lastName}.`,
    };
  }

  const counterFee = Math.round(fairValue * 1.15);
  return {
    accepted: false,
    counterFee,
    reason: `${sellingClub.name} considera insuficiente la propuesta. No aceptarán menos de ${counterFee.toLocaleString()} € por el jugador.`,
  };
}

export function executeTransfer(
  player: Player,
  buyerClub: Club,
  sellerClub: Club | null,
  fee: number,
  wageWeekly: number,
  contractYears: number,
  releaseClause: number,
  currentDate: string
): {
  updatedPlayer: Player;
  updatedBuyer: Club;
  updatedSeller: Club | null;
} {
  const currentYear = new Date(currentDate).getFullYear();

  // 1. Update Player
  const updatedPlayer: Player = {
    ...player,
    clubId: buyerClub.id,
    isTransferListed: false,
    isLoanListed: false,
    contract: {
      wagePerWeek: wageWeekly,
      contractEndYear: currentYear + contractYears,
      releaseClause,
      squadStatus: wageWeekly > buyerClub.finances.weeklyWageBudget * 0.1 ? 'Titular' : 'Rotación',
    },
    morale: Math.min(100, player.morale + 10),
  };

  // 2. Update Buyer Club
  const buyerPlayerIds = [...buyerClub.playerIds, player.id];
  const buyerBalance = buyerClub.finances.balance - fee;
  const buyerTransferBudget = Math.max(0, buyerClub.finances.transferBudget - fee);
  const buyerLedger = [
    {
      id: `ledg_buy_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      date: currentDate,
      category: 'traspaso_compra' as const,
      description: `Fichaje de ${player.firstName} ${player.lastName}${sellerClub ? ` procedente de ${sellerClub.name}` : ' (Agente Libre)'}`,
      amount: -fee,
    },
    ...buyerClub.finances.recentLedger,
  ];

  const updatedBuyer: Club = {
    ...buyerClub,
    playerIds: buyerPlayerIds,
    finances: {
      ...buyerClub.finances,
      balance: buyerBalance,
      transferBudget: buyerTransferBudget,
      recentLedger: buyerLedger.slice(0, 30),
    },
  };

  // 3. Update Seller Club (if any)
  let updatedSeller: Club | null = null;
  if (sellerClub) {
    const sellerPlayerIds = sellerClub.playerIds.filter((id) => id !== player.id);
    const sellerStarters = sellerClub.startingElevenIds.filter((id) => id !== player.id);
    const sellerBench = sellerClub.benchPlayerIds.filter((id) => id !== player.id);

    // If starter was sold, promote a bench player
    if (sellerStarters.length < 11 && sellerBench.length > 0) {
      sellerStarters.push(sellerBench.shift()!);
    }

    const sellerBalance = sellerClub.finances.balance + fee;
    const sellerTransferBudget = sellerClub.finances.transferBudget + Math.round(fee * 0.8);
    const sellerLedger = [
      {
        id: `ledg_sell_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        date: currentDate,
        category: 'traspaso_venta' as const,
        description: `Venta de ${player.firstName} ${player.lastName} al ${buyerClub.name}`,
        amount: fee,
      },
      ...sellerClub.finances.recentLedger,
    ];

    updatedSeller = {
      ...sellerClub,
      playerIds: sellerPlayerIds,
      startingElevenIds: sellerStarters,
      benchPlayerIds: sellerBench,
      finances: {
        ...sellerClub.finances,
        balance: sellerBalance,
        transferBudget: sellerTransferBudget,
        recentLedger: sellerLedger.slice(0, 30),
      },
    };
  }

  return {
    updatedPlayer,
    updatedBuyer,
    updatedSeller,
  };
}
