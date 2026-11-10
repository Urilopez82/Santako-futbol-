import { Club, FinancialLedgerEntry } from '../types/club';
import { GameSave, ManagerMarketEvent, NewsItem } from '../types/game';
import { Player, Position } from '../types/player';
import { FullTransferOffer, Scout, ScoutReport, SquadCategory, YouthAcademyCandidate, StaffMember, StaffRequest } from '../types/sportingDirector';
import { generateCulturallyAccurateName } from './rosterGenerator';

// Default initial scouts pool
export const INITIAL_SCOUTS_POOL: Scout[] = [
  {
    id: 'scout_manel_puig',
    name: 'Manel Puig',
    nationality: 'España',
    salaryWeekly: 650,
    marketKnowledge: 16,
    judgingAbility: 14,
    judgingPotential: 16,
    assignedRegion: 'Cataluña / Levante',
    assignedPosition: 'TODAS',
    assignedAgeRange: 'SUB20',
    activeMissionDaysLeft: 0,
  },
  {
    id: 'scout_carlos_mora',
    name: 'Carlos Mora',
    nationality: 'España',
    salaryWeekly: 850,
    marketKnowledge: 15,
    judgingAbility: 16,
    judgingPotential: 15,
    assignedRegion: 'España / Segunda y 1ª RFEF',
    assignedPosition: 'TODAS',
    assignedAgeRange: '21_26',
    activeMissionDaysLeft: 0,
  },
  {
    id: 'scout_tiago_silva',
    name: 'Tiago Silva',
    nationality: 'Portugal',
    salaryWeekly: 950,
    marketKnowledge: 17,
    judgingAbility: 15,
    judgingPotential: 17,
    assignedRegion: 'Portugal y Sudamérica',
    assignedPosition: 'DC',
    assignedAgeRange: 'SUB20',
    activeMissionDaysLeft: 0,
  },
];

// Default initial club technical and medical staff
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff_asst_coach',
    role: '2º Entrenador',
    name: 'Jordi Roura i Prat',
    age: 48,
    nationality: 'España',
    salaryWeekly: 1200,
    morale: 85,
    ability: 16,
    specialty: 'Estrategia a balón parado y gestión del vestuario',
    activeRequest: {
      id: 'req_asst_1',
      type: 'CONTRATAR_AYUDANTE',
      title: 'Licencia de Software de Videoanálisis',
      description: 'Solicito suscripción a software avanzado de análisis táctico para desgranar al rival.',
      cost: 15000,
      status: 'PENDIENTE',
      consequenceText: 'Mejora en la precisión táctica del rival y +12 de moral del 2º entrenador.',
    },
  },
  {
    id: 'staff_physio_head',
    role: 'Fisioterapeuta Jefe',
    name: 'Dra. Elena Santamaría',
    age: 42,
    nationality: 'España',
    salaryWeekly: 950,
    morale: 80,
    ability: 17,
    specialty: 'Recuperación acelerada y prevención de lesiones musculares',
    activeRequest: {
      id: 'req_physio_1',
      type: 'EQUIPAMIENTO_MEDICO',
      title: 'Cámaras de Crioterapia y Presoterapia',
      description: 'Renovación de maquinaria médica para acelerar la recuperación física tras cada partido.',
      cost: 35000,
      status: 'PENDIENTE',
      consequenceText: 'Reduce los tiempos de baja en enfermería un 25% y +15 de moral del cuerpo médico.',
    },
  },
  {
    id: 'staff_fitness_coach',
    role: 'Preparador Físico',
    name: 'Marcos Benítez',
    age: 39,
    nationality: 'Argentina',
    salaryWeekly: 850,
    morale: 90,
    ability: 15,
    specialty: 'Potencia aeróbica, resistencia y prevención de sobrecargas',
  },
  {
    id: 'staff_head_scout',
    role: 'Ojeador Jefe',
    name: 'Andreu Font',
    age: 54,
    nationality: 'España',
    salaryWeekly: 1100,
    morale: 78,
    ability: 18,
    specialty: 'Red internacional y detección de joyas jóvenes',
    activeRequest: {
      id: 'req_scout_1',
      type: 'AUMENTO_SALARIAL',
      title: 'Actualización Salarial y Dietas de Desplazamiento',
      description: 'Tras tres temporadas de rastreo continuo, solicito un ajuste salarial semanal del 15%.',
      cost: 0,
      salaryIncreaseWeekly: 165,
      status: 'PENDIENTE',
      consequenceText: 'Fidelidad absoluta del Ojeador Jefe (+20 moral). Si se rechaza, caerá a 40.',
    },
  },
];

// Check if a given date is inside the official transfer window
export function isDateInTransferWindow(dateStr: string): { isOpen: boolean; windowName: 'VERANO' | 'INVIERNO' | 'CERRADO' } {
  const monthDay = dateStr.slice(5); // "MM-DD"
  // Summer window: 07-01 to 09-01
  if (monthDay >= '07-01' && monthDay <= '09-01') {
    return { isOpen: true, windowName: 'VERANO' };
  }
  // Winter window: 01-02 to 01-31
  if (monthDay >= '01-02' && monthDay <= '01-31') {
    return { isOpen: true, windowName: 'INVIERNO' };
  }
  return { isOpen: false, windowName: 'CERRADO' };
}

// Evaluate trilateral transfer offer: Club, Player, and Agent
export function evaluateFullTransferOffer(
  buyerClub: Club,
  sellerClub: Club | null,
  player: Player,
  offer: FullTransferOffer
): FullTransferOffer {
  const evaluated = { ...offer };

  // 1. Seller Club Response (if not free agent)
  if (sellerClub) {
    const marketVal = player.marketValue;
    let perceivedOffer = offer.offeredTransferFee;

    // Sell-on clause value bonus
    if (offer.sellOnPercentage > 0) {
      perceivedOffer += (marketVal * (offer.sellOnPercentage / 100)) * 0.75;
    }

    // Transfer listed status
    const minAcceptable = player.isTransferListed ? marketVal * 0.8 : marketVal * 1.1;

    if (perceivedOffer >= minAcceptable) {
      evaluated.sellerClubStatus = 'ACEPTADA';
    } else if (perceivedOffer >= minAcceptable * 0.85) {
      evaluated.sellerClubStatus = 'CONTRAPROPUESTA';
      evaluated.sellerCounterOfferFee = Math.round(minAcceptable / 5000) * 5000;
    } else {
      evaluated.sellerClubStatus = 'RECHAZADA';
      evaluated.rejectionReason = `El ${sellerClub.name} considera insuficiente la propuesta de ${offer.offeredTransferFee.toLocaleString()} € y no está dispuesto a desprenderse del jugador por esa cifra.`;
    }
  } else {
    // Free agent: no selling club involved
    evaluated.sellerClubStatus = 'ACEPTADA';
  }

  // If club rejected, player and agent negotiations pause
  if (evaluated.sellerClubStatus === 'RECHAZADA') {
    evaluated.playerStatus = 'RECHAZADA';
    evaluated.agentStatus = 'RECHAZADA';
    return evaluated;
  }

  // 2. Player Willingness Response
  const currentWage = player.contract?.wagePerWeek || 500;
  const wageRatio = offer.proposedWageWeekly / Math.max(400, currentWage);
  const repDiff = buyerClub.reputation - (sellerClub?.reputation || 35);

  let playerScore = 50 + repDiff * 1.2 + (wageRatio - 1) * 35;

  if (offer.proposedSquadRole === 'Indispensable' || offer.proposedSquadRole === 'Titular') {
    playerScore += 15;
  } else if (offer.proposedSquadRole === 'Suplente' || offer.proposedSquadRole === 'Juvenil') {
    playerScore -= 20;
  }

  if (playerScore >= 60) {
    evaluated.playerStatus = 'ACEPTADA';
  } else {
    evaluated.playerStatus = 'RECHAZADA';
    evaluated.rejectionReason = `${player.firstName} ${player.lastName} prefiere continuar en su club o considera insuficiente el rol y los emolumentos ofrecidos por el ${buyerClub.name}.`;
  }

  // 3. Agent Response
  const expectedAgentFee = Math.max(1500, Math.round(offer.offeredTransferFee * 0.08 + offer.proposedWageWeekly * 8));
  if (offer.agentCommissionFee >= expectedAgentFee * 0.75) {
    evaluated.agentStatus = 'ACEPTADA';
  } else {
    evaluated.agentStatus = 'RECHAZADA';
    evaluated.rejectionReason = `El representante del jugador (${player.agent?.name || 'su agente'}) exige una comisión de al menos ${expectedAgentFee.toLocaleString()} € para formalizar la firma.`;
  }

  return evaluated;
}

// Finalize Transfer Deal (Applies changes to clubs, player, and ledgers)
export function finalizeTransferDeal(
  save: GameSave,
  offer: FullTransferOffer,
  player: Player
): { updatedSave: GameSave; newsItem: NewsItem; marketEvent: ManagerMarketEvent } {
  const currentDate = save.currentDate;
  const buyer = save.clubs[offer.buyerClubId];
  const seller = offer.sellerClubId ? save.clubs[offer.sellerClubId] : null;

  const totalCost = offer.offeredTransferFee + offer.signOnBonus + offer.agentCommissionFee;

  // 1. Update Buyer Club
  const buyerLedgers: FinancialLedgerEntry[] = [
    {
      id: `ledg_buy_${player.id}_${Date.now()}`,
      date: currentDate,
      category: 'traspaso_compra',
      description: `Fichaje de ${player.firstName} ${player.lastName} (${seller?.name || 'Agente Libre'})`,
      amount: -offer.offeredTransferFee,
    },
  ];

  if (offer.agentCommissionFee > 0 || offer.signOnBonus > 0) {
    buyerLedgers.push({
      id: `ledg_agent_${player.id}_${Date.now()}`,
      date: currentDate,
      category: 'traspaso_compra',
      description: `Comisión de intermediación de agente y prima de fichaje de ${player.lastName}`,
      amount: -(offer.agentCommissionFee + offer.signOnBonus),
    });
  }

  const updatedBuyer: Club = {
    ...buyer,
    playerIds: [...buyer.playerIds.filter((id) => id !== player.id), player.id],
    finances: {
      ...buyer.finances,
      balance: buyer.finances.balance - totalCost,
      transferBudget: Math.max(0, buyer.finances.transferBudget - offer.offeredTransferFee),
      recentLedger: [...buyerLedgers, ...buyer.finances.recentLedger].slice(0, 40),
    },
  };

  // 2. Update Seller Club (if applicable)
  let updatedSeller: Club | null = null;
  if (seller) {
    const sellerLedger: FinancialLedgerEntry = {
      id: `ledg_sell_${player.id}_${Date.now()}`,
      date: currentDate,
      category: 'traspaso_venta',
      description: `Venta de ${player.firstName} ${player.lastName} al ${buyer.name}`,
      amount: offer.offeredTransferFee,
    };

    updatedSeller = {
      ...seller,
      playerIds: seller.playerIds.filter((id) => id !== player.id),
      startingElevenIds: seller.startingElevenIds.filter((id) => id !== player.id),
      benchPlayerIds: seller.benchPlayerIds.filter((id) => id !== player.id),
      finances: {
        ...seller.finances,
        balance: seller.finances.balance + offer.offeredTransferFee,
        transferBudget: seller.finances.transferBudget + Math.round(offer.offeredTransferFee * 0.7),
        recentLedger: [sellerLedger, ...seller.finances.recentLedger].slice(0, 40),
      },
    };
  }

  // 3. Update Player
  const updatedPlayer: Player = {
    ...player,
    clubId: buyer.id,
    squadCategory: 'PRIMER_EQUIPO',
    isTransferListed: false,
    isLoanListed: false,
    contract: {
      wagePerWeek: offer.proposedWageWeekly,
      contractEndYear: parseInt(currentDate.slice(0, 4), 10) + offer.proposedContractYears,
      releaseClause: offer.proposedReleaseClause,
      squadStatus: offer.proposedSquadRole,
    },
    happiness: {
      playingTime: 90,
      wageSatisfaction: 95,
      overallHappiness: 95,
      concerns: [],
    },
  };

  const headline = seller
    ? `OFICIAL: ${buyer.name} cierra el fichaje de ${player.firstName} ${player.lastName} por ${offer.offeredTransferFee.toLocaleString()} €`
    : `OFICIAL: ${buyer.name} incorpora a ${player.firstName} ${player.lastName} como agente libre`;

  const details = `El futbolista firma por ${offer.proposedContractYears} temporadas percibiendo ${offer.proposedWageWeekly.toLocaleString()} € semanales, con una cláusula de rescisión de ${offer.proposedReleaseClause.toLocaleString()} €.`;

  const newsItem: NewsItem = {
    id: `news_trf_${Date.now()}`,
    date: currentDate,
    title: headline,
    content: details,
    category: 'FICHAJE',
    read: false,
  };

  const marketEvent: ManagerMarketEvent = {
    id: `mkt_trf_${Date.now()}`,
    date: currentDate,
    type: 'CONTRATACION',
    clubName: buyer.name,
    managerName: `${save.manager.firstName} ${save.manager.lastName}`,
    headline,
    details,
  };

  const updatedClubs = {
    ...save.clubs,
    [buyer.id]: updatedBuyer,
  };
  if (updatedSeller) {
    updatedClubs[updatedSeller.id] = updatedSeller;
  }

  return {
    updatedSave: {
      ...save,
      clubs: updatedClubs,
      players: {
        ...save.players,
        [player.id]: updatedPlayer,
      },
      news: [newsItem, ...save.news],
      marketEvents: [marketEvent, ...save.marketEvents],
    },
    newsItem,
    marketEvent,
  };
}

// Move Player between Squads (Primer Equipo, Filial B, Juvenil)
export function changePlayerSquadLevel(
  player: Player,
  targetCategory: SquadCategory
): Player {
  return {
    ...player,
    squadCategory: targetCategory,
  };
}

// Generate Annual Youth Academy Candidates (Intake)
export function generateYouthIntake(club: Club, currentSeason: string): YouthAcademyCandidate[] {
  const positions: Position[] = ['POR', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC'];
  const personalities: YouthAcademyCandidate['personality'][] = ['Resuelto', 'Ambicioso', 'Profesional', 'Despreocupado', 'Líder Nato'];

  const academyLvl = club.facilities?.youthAcademyLevel || 2;
  const baseRating = 45 + academyLvl * 4; // 53 to 65

  const isIntergalactic = Boolean(
    club.divisionId?.startsWith('gal_') ||
    club.divisionId?.includes('galactic') || 
    club.divisionId?.includes('galaxy') || 
    club.id.startsWith('alien_') ||
    club.countryId === 'ANDROMEDA' ||
    (club as any).isIntergalactic ||
    (club as any).isGalactic
  );


  const clubCountry = club.countryId || (club as any).country || 'ESP';

  const candidates: YouthAcademyCandidate[] = [];
  const count = 4 + Math.floor(Math.random() * 3); // 4 to 6 candidates

  for (let i = 0; i < count; i++) {
    const { firstName, lastName, nationality } = generateCulturallyAccurateName(clubCountry, isIntergalactic);
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const pers = personalities[Math.floor(Math.random() * personalities.length)];
    const age = 16 + Math.floor(Math.random() * 2); // 16 or 17

    const overall = baseRating + Math.floor(Math.random() * 8) - 4;
    const potentialMin = overall + 10;
    const potentialMax = Math.min(94, overall + 18 + academyLvl * 3);

    candidates.push({
      id: `youth_${Date.now()}_${i}`,
      firstName,
      lastName,
      age,
      birthDate: `${2026 - age}-04-10`,
      nationality,
      primaryPosition: pos,
      overallRating: overall,
      potentialMin,
      potentialMax,
      personality: pers,
      trainingFocus: 'Equilibrado',
      intakeSeason: currentSeason,
      contractSigned: false,
    });
  }

  return candidates;
}

// Convert a youth candidate into a full player contract
export function signYouthCandidate(
  candidate: YouthAcademyCandidate,
  clubId: string
): Player {
  const isGoalkeeper = candidate.primaryPosition === 'POR';
  const ovr = candidate.overallRating;

  return {
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    nationality: candidate.nationality,
    birthDate: candidate.birthDate,
    age: candidate.age,
    primaryPosition: candidate.primaryPosition,
    overallRating: ovr,
    potential: candidate.potentialMax,
    clubId,
    isTransferListed: false,
    isLoanListed: false,
    marketValue: Math.round(ovr * ovr * 280),
    attributes: {
      disparo: isGoalkeeper ? 15 : Math.round(ovr * 0.9),
      pase: isGoalkeeper ? 40 : Math.round(ovr * 0.95),
      regate: isGoalkeeper ? 25 : Math.round(ovr * 0.95),
      defensa: isGoalkeeper ? 20 : Math.round(ovr * 0.85),
      velocidad: Math.round(ovr * 1.05),
      resistencia: Math.round(ovr * 0.9),
      fuerza: Math.round(ovr * 0.85),
      vision: Math.round(ovr * 0.9),
      liderazgo: 45,
      reflejos: isGoalkeeper ? ovr : undefined,
      paradas: isGoalkeeper ? ovr : undefined,
    },
    contract: {
      wagePerWeek: 350,
      contractEndYear: 2029,
      releaseClause: 1200000,
      squadStatus: 'Juvenil',
    },
    fitness: 100,
    morale: 95,
    matchReadiness: 90,
    isInjured: false,
    seasonStats: {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      averageRating: 0,
      cleanSheets: isGoalkeeper ? 0 : undefined,
    },
    squadCategory: 'JUVENIL_SUB19',
    happiness: {
      playingTime: 95,
      wageSatisfaction: 100,
      overallHappiness: 100,
      concerns: [],
    },
  };
}

// Progress scouting missions and generate reports based on mission completion and scout ratings
export function progressScoutingMissions(save: GameSave): { updatedSave: GameSave; newReports: ScoutReport[] } {
  const userClub = save.clubs[save.userClubId];
  if (!userClub) {
    return { updatedSave: save, newReports: [] };
  }

  const scouts = userClub.scouts && userClub.scouts.length > 0 ? [...userClub.scouts] : [...INITIAL_SCOUTS_POOL];
  const otherPlayers = Object.values(save.players).filter((p) => p.clubId !== userClub.id && !p.isRetired);
  if (otherPlayers.length === 0) return { updatedSave: save, newReports: [] };

  const newReports: ScoutReport[] = [];
  const newsGenerated: NewsItem[] = [];

  const updatedScouts = scouts.map((scout) => {
    let daysLeft = scout.activeMissionDaysLeft || 0;
    
    // Decrement mission timer if scout is actively on a mission
    if (daysLeft > 0) {
      daysLeft = Math.max(0, daysLeft - 7);
      
      // If mission just completed this week, generate a high-precision targeted report!
      if (daysLeft === 0) {
        // Filter players matching assigned parameters
        let candidates = otherPlayers;
        if (scout.assignedPosition && scout.assignedPosition !== 'TODAS') {
          candidates = candidates.filter((p) => p.primaryPosition === scout.assignedPosition);
        }
        if (scout.assignedAgeRange === 'SUB20') {
          candidates = candidates.filter((p) => p.age <= 20);
        } else if (scout.assignedAgeRange === '21_26') {
          candidates = candidates.filter((p) => p.age >= 21 && p.age <= 26);
        } else if (scout.assignedAgeRange === 'VETERANOS') {
          candidates = candidates.filter((p) => p.age >= 27);
        }

        if (candidates.length === 0) candidates = otherPlayers;

        // Pick top talent evaluated by scout ability
        const sorted = [...candidates].sort((a, b) => (b.overallRating + b.potential) - (a.overallRating + a.potential));
        const picked = sorted[Math.floor(Math.random() * Math.min(6, sorted.length))] || candidates[0];
        const targetClub = picked.clubId ? save.clubs[picked.clubId] : null;

        const accuracy = Math.min(98, 70 + scout.judgingAbility * 1.4);
        const estMin = Math.round(picked.marketValue * 0.90 / 5000) * 5000;
        const estMax = Math.round(picked.marketValue * 1.15 / 5000) * 5000;

        let rec: ScoutReport['recommendation'] = 'SEGUIR_DE_CERCA';
        if (picked.potential >= 84) rec = 'PROMESA_FUTURA';
        if (picked.overallRating >= userClub.reputation + 2) rec = 'FICHAJE_PRIORITARIO';
        if (picked.overallRating < 55) rec = 'DESCARTAR';

        newReports.push({
          id: `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          scoutId: scout.id,
          scoutName: scout.name,
          playerId: picked.id,
          playerName: `${picked.firstName} ${picked.lastName}`,
          age: picked.age,
          position: picked.primaryPosition,
          currentClubName: targetClub?.name || 'Agente Libre',
          overallRatingEst: picked.overallRating,
          potentialRatingEst: picked.potential,
          accuracyPct: accuracy,
          estimatedCostMin: estMin,
          estimatedCostMax: estMax,
          estimatedWageWeekly: picked.contract?.wagePerWeek || 650,
          pros: ['Excelente informe de seguimiento técnico', 'Adaptación contrastada a la categoría', 'Perfil idóneo para el modelo de juego'],
          cons: ['Exige cláusula de rescisión accesible', 'Interés de varios clubes competidores'],
          recommendation: rec,
          generatedDate: save.currentDate,
        });

        newsGenerated.push({
          id: `news_scout_finish_${scout.id}_${Date.now()}`,
          date: save.currentDate,
          title: `Informe Técnico Finalizado: ${scout.name}`,
          content: `El ojeador ${scout.name} ha concluido su misión en "${scout.assignedRegion || 'España'}". Se ha emitido un informe prioritario sobre ${picked.firstName} ${picked.lastName} (${targetClub?.name || 'Agente Libre'}) con una precisión estimada del ${accuracy}%.`,
          category: 'FICHAJE',
          read: false,
        });
      }
    } else {
      // Background occasional talent discovery (15% chance per week)
      if (Math.random() < 0.15) {
        const targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        const targetClub = targetPlayer.clubId ? save.clubs[targetPlayer.clubId] : null;

        const accuracy = Math.min(92, 55 + scout.judgingAbility * 1.8);
        const estMin = Math.round(targetPlayer.marketValue * 0.85 / 5000) * 5000;
        const estMax = Math.round(targetPlayer.marketValue * 1.25 / 5000) * 5000;

        let rec: ScoutReport['recommendation'] = 'SEGUIR_DE_CERCA';
        if (targetPlayer.potential >= 82) rec = 'PROMESA_FUTURA';
        if (targetPlayer.overallRating >= userClub.reputation + 4) rec = 'FICHAJE_PRIORITARIO';
        if (targetPlayer.overallRating < 55) rec = 'DESCARTAR';

        newReports.push({
          id: `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          scoutId: scout.id,
          scoutName: scout.name,
          playerId: targetPlayer.id,
          playerName: `${targetPlayer.firstName} ${targetPlayer.lastName}`,
          age: targetPlayer.age,
          position: targetPlayer.primaryPosition,
          currentClubName: targetClub?.name || 'Agente Libre',
          overallRatingEst: targetPlayer.overallRating,
          potentialRatingEst: targetPlayer.potential,
          accuracyPct: accuracy,
          estimatedCostMin: estMin,
          estimatedCostMax: estMax,
          estimatedWageWeekly: targetPlayer.contract?.wagePerWeek || 600,
          pros: ['Gran polivalencia táctica', 'Buena capacidad asociativa', 'Margen de mejora formativo'],
          cons: ['Exige un rol protagonista', 'Sueldo ligeramente elevado para la categoría'],
          recommendation: rec,
          generatedDate: save.currentDate,
        });
      }
    }

    return {
      ...scout,
      activeMissionDaysLeft: daysLeft,
    };
  });

  const updatedReports = [...newReports, ...(save.scoutReports || [])].slice(0, 35);

  const updatedClub = {
    ...userClub,
    scouts: updatedScouts,
  };

  return {
    updatedSave: {
      ...save,
      clubs: {
        ...save.clubs,
        [userClub.id]: updatedClub,
      },
      scoutReports: updatedReports,
      news: [...newsGenerated, ...(save.news || [])].slice(0, 40),
    },
    newReports,
  };
}

// Assigns a targeted scouting mission to an official club scout
export function assignScoutMission(
  save: GameSave,
  scoutId: string,
  region: string,
  position: Position | 'TODAS',
  ageRange: 'SUB20' | '21_26' | 'VETERANOS' | 'TODAS',
  durationWeeks: number
): GameSave {
  const userClub = save.clubs[save.userClubId];
  if (!userClub) return save;

  const scouts = userClub.scouts && userClub.scouts.length > 0 ? [...userClub.scouts] : [...INITIAL_SCOUTS_POOL];
  const updatedScouts = scouts.map((scout) => {
    if (scout.id === scoutId) {
      return {
        ...scout,
        assignedRegion: region,
        assignedPosition: position,
        assignedAgeRange: ageRange,
        activeMissionDaysLeft: durationWeeks * 7,
      };
    }
    return scout;
  });

  const newsItem: NewsItem = {
    id: `news_mission_start_${scoutId}_${Date.now()}`,
    date: save.currentDate,
    title: `Misión de Ojeo Iniciada: ${region}`,
    content: `Se ha encomendado al ojeador el seguimiento exhaustivo de jugadores (${position}, ${ageRange}) en ${region} durante un periodo estimado de ${durationWeeks} semanas.`,
    category: 'FICHAJE',
    read: false,
  };

  return {
    ...save,
    clubs: {
      ...save.clubs,
      [userClub.id]: {
        ...userClub,
        scouts: updatedScouts,
      },
    },
    news: [newsItem, ...(save.news || [])].slice(0, 40),
  };
}

// Resolves a staff request (e.g. facility investment, salary raise, medical gear)
export function resolveStaffRequest(
  save: GameSave,
  staffId: string,
  approve: boolean
): GameSave {
  const userClub = save.clubs[save.userClubId];
  if (!userClub) return save;

  const staffList = userClub.staffMembers && userClub.staffMembers.length > 0 
    ? [...userClub.staffMembers] 
    : [...INITIAL_STAFF_MEMBERS];

  let costDeducted = 0;
  let ledgerEntry: FinancialLedgerEntry | null = null;
  let staffName = '';
  let requestTitle = '';

  const updatedStaff = staffList.map((member) => {
    if (member.id === staffId && member.activeRequest) {
      staffName = member.name;
      requestTitle = member.activeRequest.title;
      const req = member.activeRequest;

      if (approve) {
        costDeducted = req.cost || 0;
        const newWage = member.salaryWeekly + (req.salaryIncreaseWeekly || 0);
        const newMorale = Math.min(100, member.morale + 18);

        if (costDeducted > 0) {
          ledgerEntry = {
            id: `led_staff_${Date.now()}`,
            date: save.currentDate,
            amount: -costDeducted,
            category: 'instalaciones',
            description: `Inversión Cuerpo Técnico: ${req.title} (${member.role})`,
          };
        }

        return {
          ...member,
          salaryWeekly: newWage,
          morale: newMorale,
          activeRequest: {
            ...req,
            status: 'APROBADA' as const,
          },
        };
      } else {
        const newMorale = Math.max(30, member.morale - 25);
        return {
          ...member,
          morale: newMorale,
          activeRequest: {
            ...req,
            status: 'RECHAZADA' as const,
          },
        };
      }
    }
    return member;
  });

  const newsItem: NewsItem = {
    id: `news_staff_req_${staffId}_${Date.now()}`,
    date: save.currentDate,
    title: approve ? `Petición Aprobada: ${staffName}` : `Petición Denegada: ${staffName}`,
    content: approve
      ? `La directiva ha dado luz verde a la solicitud "${requestTitle}" presentada por ${staffName}. La moral del cuerpo técnico se eleva notablemente.`
      : `Se ha desestimado la solicitud "${requestTitle}" de ${staffName}. El profesional ha expresado su descontento, afectando a su moral.`,
    category: 'DIRECTIVA',
    read: false,
  };

  const updatedClub: Club = {
    ...userClub,
    finances: {
      ...userClub.finances,
      balance: Math.max(0, userClub.finances.balance - costDeducted),
      recentLedger: ledgerEntry
        ? [ledgerEntry, ...(userClub.finances.recentLedger || [])].slice(0, 50)
        : userClub.finances.recentLedger,
    },
    staffMembers: updatedStaff,
  };

  return {
    ...save,
    clubs: {
      ...save.clubs,
      [userClub.id]: updatedClub,
    },
    news: [newsItem, ...(save.news || [])].slice(0, 40),
  };
}

// Player evolution (Youth growth, prime peak, and veteran physical decline)
export function simulatePlayerEvolution(players: Record<string, Player>): Record<string, Player> {
  const updated = { ...players };

  Object.keys(updated).forEach((id) => {
    const p = updated[id];
    if (p.isRetired) return;

    // 1. Youths (16-22): Growth towards potential
    if (p.age <= 22 && p.overallRating < p.potential) {
      if (Math.random() < 0.15) {
        const growth = 1;
        updated[id] = {
          ...p,
          overallRating: Math.min(p.potential, p.overallRating + growth),
          attributes: {
            ...p.attributes,
            pase: Math.min(99, p.attributes.pase + 1),
            disparo: Math.min(99, p.attributes.disparo + 1),
            velocidad: Math.min(99, p.attributes.velocidad + 1),
          },
        };
      }
    }

    // 2. Veterans (31+): Physical degradation, mental endurance
    if (p.age >= 31) {
      if (Math.random() < 0.12) {
        updated[id] = {
          ...p,
          attributes: {
            ...p.attributes,
            velocidad: Math.max(30, p.attributes.velocidad - 1),
            resistencia: Math.max(35, p.attributes.resistencia - 1),
            vision: Math.min(99, p.attributes.vision + 1), // Gana veteranía
            liderazgo: Math.min(99, p.attributes.liderazgo + 1),
          },
        };
      }
    }
  });

  return updated;
}
