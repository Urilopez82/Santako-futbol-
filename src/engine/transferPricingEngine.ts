import { Club } from '../types/club';
import { GameSave, NewsItem } from '../types/game';
import { Player, Position } from '../types/player';
import { TransferOffer } from '../types/transfer';

/**
 * Modern non-linear player market valuation engine.
 * Reflects real world football market valuations with exponential divergence:
 * - 60-65 OVR (modest/lower tier): ~100k - 800k €
 * - 70-75 OVR (competent professional): ~2M - 7M €
 * - 80-84 OVR (top tier league regular): ~18M - 40M €
 * - 85-89 OVR (international star): ~55M - 95M €
 * - 90-93 OVR (global superstar): ~120M - 180M €
 * - 94-96 OVR (generational phenomenon): ~200M - 280M €
 */
export function calculateRealisticPlayerMarketValue(
  player: Player,
  club?: Club,
  difficulty: 'FACIL' | 'NORMAL' | 'DIFICIL' | 'LEYENDA' = 'NORMAL',
  currentYear: number = 2026
): number {
  const ovr = player.overallRating;

  // In EASY mode, retain affordable linear/quadratic curve so casual players aren't priced out
  if (difficulty === 'FACIL') {
    return Math.max(50000, Math.round(ovr * ovr * 280));
  }

  // 1. Base Exponential Foundation
  let baseValue = 0;
  if (ovr <= 55) {
    baseValue = 50000 + (ovr - 45) * 8000;
  } else if (ovr <= 65) {
    // 56-65: 130k to 750k
    const progress = (ovr - 55) / 10;
    baseValue = 130000 + Math.pow(progress, 1.6) * 620000;
  } else if (ovr <= 72) {
    // 66-72: 800k to 3.5M
    const progress = (ovr - 65) / 7;
    baseValue = 800000 + Math.pow(progress, 1.8) * 2700000;
  } else if (ovr <= 78) {
    // 73-78: 4M to 16M
    const progress = (ovr - 72) / 6;
    baseValue = 4000000 + Math.pow(progress, 2.0) * 12000000;
  } else if (ovr <= 84) {
    // 79-84: 18M to 48M
    const progress = (ovr - 78) / 6;
    baseValue = 18000000 + Math.pow(progress, 2.2) * 30000000;
  } else if (ovr <= 89) {
    // 85-89: 55M to 105M
    const progress = (ovr - 84) / 5;
    baseValue = 55000000 + Math.pow(progress, 2.3) * 50000000;
  } else if (ovr <= 93) {
    // 90-93: 115M to 185M
    const progress = (ovr - 89) / 4;
    baseValue = 115000000 + Math.pow(progress, 2.4) * 70000000;
  } else {
    // 94+: 195M to 270M+
    const progress = Math.min(2.5, (ovr - 93) / 3);
    baseValue = 195000000 + Math.pow(progress, 2.5) * 85000000;
  }

  // 2. Age & Potential Multipliers (Wonderkid Premium vs Veteran Discount)
  let ageMultiplier = 1.0;
  const potDiff = Math.max(0, player.potential - ovr);

  if (player.age <= 20) {
    if (player.potential >= 90) ageMultiplier = 1.65;
    else if (player.potential >= 84) ageMultiplier = 1.45;
    else ageMultiplier = 1.25;
  } else if (player.age <= 23) {
    if (player.potential >= 90) ageMultiplier = 1.40;
    else if (player.potential >= 84) ageMultiplier = 1.20;
    else ageMultiplier = 1.10;
  } else if (player.age <= 28) {
    // Prime football years
    ageMultiplier = 1.05;
  } else if (player.age >= 34) {
    ageMultiplier = 0.45;
  } else if (player.age >= 32) {
    ageMultiplier = 0.65;
  } else if (player.age >= 30) {
    ageMultiplier = 0.85;
  }

  // Potential difference booster
  const potMultiplier = 1 + (potDiff * 0.025);

  // 3. Contract Duration Multiplier (Release Clause & Time Remaining)
  let contractMultiplier = 1.0;
  if (player.contract?.contractEndYear) {
    const yearsLeft = player.contract.contractEndYear - currentYear;
    if (yearsLeft <= 1) {
      contractMultiplier = 0.72; // Last year discount (real transfer window pressure)
    } else if (yearsLeft >= 4) {
      contractMultiplier = 1.18; // Long-term secure contract
    } else if (yearsLeft >= 3) {
      contractMultiplier = 1.08;
    }
  }

  // 4. Performance & Form Multiplier
  let performanceMultiplier = 1.0;
  if (player.seasonStats) {
    const goals = player.seasonStats.goals || 0;
    const assists = player.seasonStats.assists || 0;
    const avgRating = player.seasonStats.averageRating || 7.0;

    if (['DC', 'ED', 'EI'].includes(player.primaryPosition) && goals >= 15) {
      performanceMultiplier += 0.20;
    } else if (['MC', 'MCO'].includes(player.primaryPosition) && (goals + assists >= 14)) {
      performanceMultiplier += 0.18;
    }
    if (avgRating >= 7.8) {
      performanceMultiplier += 0.12;
    }
  }

  // 5. Position Market Demand (Strikers & attacking playmakers command higher fees)
  let positionMultiplier = 1.0;
  if (['DC', 'ED', 'EI', 'MCO'].includes(player.primaryPosition)) {
    positionMultiplier = 1.08;
  } else if (player.primaryPosition === 'POR') {
    positionMultiplier = 0.88;
  }

  // 6. Club Prestige & Commercial Value
  let clubMultiplier = 1.0;
  if (club) {
    if (club.reputation >= 88) clubMultiplier = 1.15;
    else if (club.reputation >= 78) clubMultiplier = 1.08;
    else if (club.reputation <= 55) clubMultiplier = 0.90;
  }

  const finalRaw = baseValue * ageMultiplier * potMultiplier * contractMultiplier * performanceMultiplier * positionMultiplier * clubMultiplier;

  // Round neatly:
  // Under 2M -> round to 25k
  // Under 20M -> round to 100k
  // Over 20M -> round to 500k
  if (finalRaw < 2000000) {
    return Math.max(50000, Math.round(finalRaw / 25000) * 25000);
  } else if (finalRaw < 20000000) {
    return Math.round(finalRaw / 100000) * 100000;
  } else {
    return Math.round(finalRaw / 500000) * 500000;
  }
}

/**
 * Actively scans the user's squad and generates dynamic, realistic CPU transfer offers
 * for transfer-listed players and key assets from AI clubs across Europe and Spain.
 */
export function evaluateAndGenerateCpuTransferOffers(save: GameSave): {
  updatedOffers: TransferOffer[];
  newOffersCount: number;
  newsAlerts: NewsItem[];
} {
  const userClub = save.clubs[save.userClubId];
  if (!userClub) return { updatedOffers: save.transferOffers || [], newOffersCount: 0, newsAlerts: [] };

  const currentOffers = [...(save.transferOffers || [])];
  const currentDate = save.currentDate;
  const currentYear = parseInt(currentDate.slice(0, 4), 10) || 2026;
  const existingPendingPlayerIds = new Set(
    currentOffers.filter((o) => o.status === 'PENDIENTE').map((o) => o.playerId)
  );

  // 1. Identify User Players on the Transfer List (High priority) or available candidates
  const userPlayers = (userClub.playerIds || [])
    .map((id) => save.players[id])
    .filter(Boolean);

  const transferListedPlayers = userPlayers.filter(
    (p) => p.isTransferListed && !existingPendingPlayerIds.has(p.id)
  );

  // If no one is transfer-listed, occasionally AI clubs may test the waters for an outstanding performer
  const candidatePlayers = [...transferListedPlayers];
  if (candidatePlayers.length === 0 && Math.random() < 0.25) {
    const starCandidate = userPlayers.find(
      (p) => p.overallRating >= 76 && !existingPendingPlayerIds.has(p.id)
    );
    if (starCandidate) candidatePlayers.push(starCandidate);
  }

  if (candidatePlayers.length === 0) {
    return { updatedOffers: currentOffers, newOffersCount: 0, newsAlerts: [] };
  }

  // 2. Eligible Buyer Clubs from the universe (excluding user's club)
  const allClubs = Object.values(save.clubs || {}).filter(
    (c) => c && c.id && c.id !== userClub.id
  );

  const newOffers: TransferOffer[] = [];
  const newsAlerts: NewsItem[] = [];

  // Pick up to 2 players to receive offers today
  const targets = candidatePlayers.slice(0, 2);

  targets.forEach((targetPlayer) => {
    // Calculate realistic valuation
    const marketVal = calculateRealisticPlayerMarketValue(
      targetPlayer,
      userClub,
      save.difficultyLevel || 'NORMAL',
      currentYear
    );

    // Filter buyer clubs that can afford this player and have suitable sporting stature
    const suitableBuyers = allClubs.filter((c) => {
      const budget = Math.max(c.finances?.transferBudget || 0, Math.round((c.finances?.balance || 0) * 0.7));
      const rep = c.reputation || 60;

      // Tier compatibility:
      // A 60 OVR player won't receive bids from Real Madrid/Man City
      // An 88 OVR player won't receive bids from 2ª RFEF clubs
      const expectedRepMin = Math.max(35, targetPlayer.overallRating - 14);
      const expectedRepMax = Math.min(99, targetPlayer.overallRating + 12);

      const hasBudget = budget >= marketVal * 0.80;
      const isRepCompatible = rep >= expectedRepMin && rep <= expectedRepMax;

      return hasBudget && isRepCompatible;
    });

    if (suitableBuyers.length === 0) return;

    // Pick 1 interested buyer club
    const buyer = suitableBuyers[Math.floor(Math.random() * suitableBuyers.length)];
    const buyerBudget = Math.max(buyer.finances?.transferBudget || 0, Math.round((buyer.finances?.balance || 0) * 0.7));

    // Dynamic offer fee based on player situation:
    // Transfer listed -> AI club offers slightly below or around fair value (88% - 108%)
    // Star not listed -> AI club bids slightly above market value (105% - 125%)
    let offerFactor = targetPlayer.isTransferListed
      ? 0.88 + Math.random() * 0.22
      : 1.05 + Math.random() * 0.20;

    let transferFee = Math.round(marketVal * offerFactor);
    transferFee = Math.min(buyerBudget, Math.max(50000, transferFee));

    // Round neatly
    transferFee = transferFee > 5000000
      ? Math.round(transferFee / 100000) * 100000
      : Math.round(transferFee / 25000) * 25000;

    const proposedWageWeekly = Math.max(
      1000,
      Math.round(((targetPlayer.contract?.wagePerWeek || 2000) * 1.15) / 100) * 100
    );

    const offerId = `offer_cpu_${buyer.id}_${targetPlayer.id}_${Date.now()}`;
    const offerObj: TransferOffer = {
      id: offerId,
      playerId: targetPlayer.id,
      buyingClubId: buyer.id,
      sellingClubId: userClub.id,
      transferFee,
      status: 'PENDIENTE',
      offeredDate: currentDate,
      proposedWageWeekly,
      proposedContractYears: 3,
      proposedSquadStatus: targetPlayer.overallRating >= 78 ? 'Titular' : 'Rotación',
      proposedReleaseClause: Math.round(transferFee * 1.8),
    };

    newOffers.push(offerObj);

    newsAlerts.push({
      id: `news_offer_${offerId}`,
      date: currentDate,
      title: `¡Oferta Formal por ${targetPlayer.firstName} ${targetPlayer.lastName}!`,
      content: `El ${buyer.name} ha remitido una propuesta oficial de traspaso de ${transferFee.toLocaleString()} € por el futbolista ${targetPlayer.lastName}${targetPlayer.isTransferListed ? ' (en lista de transferibles)' : ''}. La directiva espera tu decisión en el despacho.`,
      category: 'FICHAJE',
      read: false,
    });
  });

  return {
    updatedOffers: [...newOffers, ...currentOffers].slice(0, 25),
    newOffersCount: newOffers.length,
    newsAlerts,
  };
}
