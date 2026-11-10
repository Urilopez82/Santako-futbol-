import { Club } from '../types/club';
import { GameSave, JobOffer, Manager, ManagerContract, ManagerLicense, ManagerMarketEvent, NewsItem } from '../types/game';
import { NATIONAL_TEAMS_80, NATIONAL_TEAMS_MAP } from '../db/worldData/nationalTeams80';

// License requirements per division tier
export const LICENSE_TIER_RULES: Record<ManagerLicense, { maxTierAllowed: number; description: string }> = {
  'Licencia Nacional C': {
    maxTierAllowed: 5, // Tercera Federación y Regional
    description: 'Habilita para entrenar en Categorías Regionales, Autonómicas y Tercera Federación.',
  },
  'Licencia UEFA B': {
    maxTierAllowed: 4, // Hasta Segunda Federación
    description: 'Habilita para entrenar hasta Segunda Federación RFEF y fútbol formativo de élite.',
  },
  'Licencia UEFA A': {
    maxTierAllowed: 3, // Hasta Primera Federación
    description: 'Habilita para entrenar hasta Primera Federación RFEF y filiales profesionales.',
  },
  'Licencia UEFA Pro': {
    maxTierAllowed: 1, // Primera y Segunda División (Fútbol Profesional de Élite)
    description: 'Máxima distinción internacional. Obligatoria para LaLiga EA Sports y LaLiga Hypermotion.',
  },
};

// Check if a club is eligible for a manager starting their career
export function evaluateClubEligibility(
  club: Club,
  license: ManagerLicense,
  reputation: number,
  gameMode: 'CARRERA' | 'ARCADE' = 'CARRERA'
): { eligible: boolean; reason: string; minReputation: number; requiredLicense: ManagerLicense } {
  // Arcade Mode: completely bypasses restrictions and unlocks all clubs worldwide!
  if (gameMode === 'ARCADE') {
    return {
      eligible: true,
      reason: 'Modo Arcade activo: Libertad total para elegir cualquier club de élite mundial.',
      minReputation: 0,
      requiredLicense: 'Licencia Nacional C',
    };
  }

  // All 2nd divisions and African leagues are explicitly eligible for managerial career start
  const isSecondDivisionOrLower = club.divisionId.includes('tier2') || club.divisionId.includes('tier3') || club.divisionId.includes('tier4') || club.divisionId.includes('tier5');
  const isAfricanLeague = ['MAR', 'EGY', 'RSA', 'NGA', 'SEN', 'DZA'].includes(club.countryId || '') || club.divisionId.startsWith('mar_') || club.divisionId.startsWith('egy_') || club.divisionId.startsWith('rsa_') || club.divisionId.startsWith('nga_') || club.divisionId.startsWith('sen_') || club.divisionId.startsWith('dza_');

  if (isSecondDivisionOrLower || isAfricanLeague) {
    return {
      eligible: true,
      reason: 'Club federativamente elegible para comenzar tu carrera profesional.',
      minReputation: 35,
      requiredLicense: license,
    };
  }

  // Elite Clubs (Real Madrid, FC Barcelona, Man City, Bayern, etc.)
  if (club.reputation >= 84) {
    return {
      eligible: false,
      reason: 'Club de Máxima Élite Mundial. Exige Licencia UEFA Pro y Reputación superior a 85.',
      minReputation: 85,
      requiredLicense: 'Licencia UEFA Pro',
    };
  }

  // Primera Federación / Segunda Federación / Tercera Federación
  const tierRule = LICENSE_TIER_RULES[license];
  let requiredLicense: ManagerLicense = 'Licencia Nacional C';

  if (club.reputation > 50) {
    requiredLicense = 'Licencia UEFA A';
  } else if (club.reputation > 45) {
    requiredLicense = 'Licencia UEFA B';
  }

  // Check if manager's license tier can manage this club
  const clubTier = club.divisionId.includes('tier1') ? 1 :
                   club.divisionId.includes('tier2') ? 2 :
                   club.divisionId.includes('tier4') ? 4 :
                   club.divisionId.includes('tier5') ? 5 : 3;

  if (clubTier < tierRule.maxTierAllowed) {
    return {
      eligible: false,
      reason: `Tu titulación actual (${license}) no autoriza dirigir en esta categoría. Requiere ${requiredLicense}.`,
      minReputation: club.reputation - 5,
      requiredLicense,
    };
  }

  // Check reputation minimum
  const minReputation = Math.max(30, club.reputation - 15);
  if (reputation < minReputation) {
    return {
      eligible: false,
      reason: `La directiva exige un entrenador con mayor reputación (mínimo ${minReputation}).`,
      minReputation,
      requiredLicense,
    };
  }

  return {
    eligible: true,
    reason: 'Cumple todos los requisitos federativos y expectativas del club.',
    minReputation,
    requiredLicense,
  };
}

// Generate realistic initial contract
export function generateInitialContract(
  club: Club,
  managerReputation: number,
  currentSeason: string,
  durationYears = 2
): ManagerContract {
  const currentYear = parseInt(currentSeason.slice(0, 4), 10) || 2026;
  const endYear = currentYear + durationYears;

  // Modest clubs pay realistic weekly manager wages (from 350€ to 1,200€ / week)
  const baseWeekly = Math.max(350, Math.round(club.finances.weeklyWageBudget * 0.08 + managerReputation * 8));
  const wageWeekly = Math.round(baseWeekly / 25) * 25; // rounded
  const wageAnnual = wageWeekly * 52;

  let sportingObjective = club.boardObjective;
  let promotionBonus = 8000;
  let survivalBonus = 3000;

  if (club.boardObjective === 'Puestos de Ascenso Directo' || club.boardObjective === 'Campeón de Liga') {
    promotionBonus = 18000;
  } else if (club.boardObjective === 'Evitar el Descenso') {
    survivalBonus = 5000;
  }

  return {
    clubId: club.id,
    clubName: club.name,
    startDate: '2026-08-15',
    endSeason: `${endYear}/${(endYear + 1).toString().slice(2)}`,
    durationYears,
    wageWeekly,
    wageAnnual,
    sportingObjective,
    economicObjective: `No sobrepasar el límite salarial de ${club.finances.weeklyWageBudget.toLocaleString()} € semanales`,
    releaseClause: wageAnnual * 3,
    severancePay: Math.round(wageAnnual * 0.6),
    promotionBonus,
    survivalBonus,
    renewalCondition: 'Renovación automática por 1 temporada si se cumple el objetivo de la directiva',
  };
}

// Generate realistic job offers from diverse clubs & 80 national teams
export function generateJobOffers(
  manager: Manager,
  currentSave: GameSave,
  desiredCount = 6
): JobOffer[] {
  const offers: JobOffer[] = [];
  const rep = manager.reputation;
  const currentClubId = manager.contract?.clubId;
  const now = Date.now();
  const currentDate = currentSave.currentDate;

  // 1. DYNAMIC CLUB OFFERS (Spain & International)
  const allClubs = Object.values(currentSave.clubs || {}).filter(
    (c) => c && c.id && c.id !== currentClubId
  );

  const difficulty = currentSave.difficultyLevel || 'NORMAL';
  const isEasy = difficulty === 'FACIL';
  const titlesWon = manager.careerStats?.titlesWon || 0;
  const matchesManaged = manager.careerStats?.matchesManaged || 0;

  // Realistic reputation brackets based on difficulty
  let minRep: number;
  let maxRep: number;

  if (isEasy) {
    minRep = Math.max(30, rep - 14);
    maxRep = Math.min(99, Math.max(rep + 12, 70));
  } else {
    // Normal / Difícil / Leyenda: un entrenador de bajo nivel no recibe ofertas de gigantes
    const allowedUpwardGap = difficulty === 'LEYENDA' ? 3 : difficulty === 'DIFICIL' ? 5 : 7;
    minRep = Math.max(25, rep - 12);
    maxRep = Math.min(99, rep + allowedUpwardGap);
  }

  const eligibleClubs = allClubs.filter((c) => {
    const cRep = c.reputation || 60;
    if (cRep < minRep || cRep > maxRep) return false;

    if (!isEasy) {
      // European elite (reputation >= 84) requires proven track record: >= 1 title or 50+ matches
      if (cRep >= 84 && titlesWon === 0 && matchesManaged < 50 && rep < 82) {
        return false;
      }
      // Top world giants (reputation >= 90) strictly require manager rep >= 85 and titles
      if (cRep >= 90 && (rep < 85 || titlesWon < 2)) {
        return false;
      }
    }
    return true;
  });

  // Shuffled candidate clubs
  const shuffledClubs = [...eligibleClubs].sort(() => 0.5 - Math.random());
  const selectedClubs = shuffledClubs.slice(0, 4);

  // Fallback defaults if clubs catalog is small
  if (selectedClubs.length === 0 && allClubs.length > 0) {
    const fallbackClubs = allClubs
      .filter((c) => isEasy || (c.reputation || 60) <= rep + 8)
      .slice(0, 3);
    selectedClubs.push(...(fallbackClubs.length > 0 ? fallbackClubs : allClubs.slice(0, 3)));
  }

  selectedClubs.forEach((club, idx) => {
    const clubRep = club.reputation || 60;
    let weeklyWage = 1200;
    let transferBudget = 250000;

    if (clubRep >= 85) {
      weeklyWage = 35000 + Math.round(Math.random() * 45000);
      transferBudget = 45000000 + Math.round(Math.random() * 65000000);
    } else if (clubRep >= 75) {
      weeklyWage = 14000 + Math.round(Math.random() * 18000);
      transferBudget = 12000000 + Math.round(Math.random() * 25000000);
    } else if (clubRep >= 65) {
      weeklyWage = 5000 + Math.round(Math.random() * 8000);
      transferBudget = 3000000 + Math.round(Math.random() * 8000000);
    } else {
      weeklyWage = Math.max(800, Math.round((club.finances?.weeklyWageBudget || 10000) * 0.08 + clubRep * 10));
      transferBudget = Math.max(100000, Math.round((club.finances?.transferBudget || 80000) * 0.8));
    }

    const roundedWage = Math.round(weeklyWage / 50) * 50;
    const isForeign = club.countryId && club.countryId !== 'ESP';
    const comp = currentSave.competitions?.[club.divisionId];
    const divisionDisplayName = comp?.shortName || comp?.name || (isForeign ? 'Liga Internacional' : 'LaLiga Hypermotion');

    offers.push({
      id: `offer_club_${club.id}_${now}_${idx}`,
      clubId: club.id,
      clubName: club.name,
      clubCode: club.code || club.name.slice(0, 3).toUpperCase(),
      divisionName: divisionDisplayName,
      countryId: club.countryId || 'ESP',
      wageWeekly: roundedWage,
      durationYears: clubRep >= 85 ? 3 : 2,
      sportingObjective: club.boardObjective || (clubRep >= 85 ? 'Conquistar la Liga y clasificar a semifinales de Champions League' : 'Luchar en la zona noble y consolidar el proyecto'),
      transferBudget,
      isNationalTeam: false,
      offeredDate: currentDate,
      reputationRequired: Math.max(35, clubRep - 8),
      status: 'PENDIENTE',
    });
  });

  // 2. DYNAMIC NATIONAL TEAM OFFERS (from 80 official national teams)
  if (!manager.nationalTeamRole && NATIONAL_TEAMS_80.length > 0) {
    if (isEasy) {
      // Accessible national team offers in Easy mode
      const candidateNations = NATIONAL_TEAMS_80.slice(0, 15);
      const picked = candidateNations[Math.floor(Math.random() * candidateNations.length)];
      offers.push({
        id: `offer_nat_easy_${picked.id}_${now}`,
        clubName: `Selección de ${picked.name}`,
        divisionName: `${picked.confederation} Internacional`,
        countryId: picked.id,
        wageWeekly: 4000,
        durationYears: 3,
        sportingObjective: 'Disputar la fase final de competiciones internacionales',
        transferBudget: 0,
        isNationalTeam: true,
        nationalTeamType: 'ABSOLUTA',
        offeredDate: currentDate,
        reputationRequired: 40,
        status: 'PENDIENTE',
      });
    } else if (rep < 58) {
      // Sub-21 selections or emerging modest nations
      const modestNations = NATIONAL_TEAMS_80.filter((n) => n.reputation <= 70);
      if (modestNations.length > 0) {
        const modest = modestNations[Math.floor(Math.random() * modestNations.length)];
        offers.push({
          id: `offer_nat_sen_${modest.id}_${now}`,
          clubName: `Selección Absoluta de ${modest.name}`,
          divisionName: `${modest.confederation} Clasificatorias`,
          countryId: modest.id,
          wageWeekly: 2500,
          durationYears: 2,
          sportingObjective: 'Competir con dignidad en la fase previa continental',
          transferBudget: 0,
          isNationalTeam: true,
          nationalTeamType: 'ABSOLUTA',
          offeredDate: currentDate,
          reputationRequired: 45,
          status: 'PENDIENTE',
        });
      }
    } else if (rep >= 58 && rep < 78) {
      // Sub-21 of major nations or mid-tier senior nations
      const u21Nations = ['ESP', 'POR', 'FRA', 'ITA', 'ENG', 'GER', 'ARG', 'BRA'];
      const pickedCode = u21Nations[Math.floor(Math.random() * u21Nations.length)];
      const u21Nat = NATIONAL_TEAMS_80.find((n) => n.id === pickedCode) || NATIONAL_TEAMS_80[0];

      offers.push({
        id: `offer_nat_u21_${u21Nat.id}_${now}`,
        clubName: `Selección de ${u21Nat.name} Sub-21`,
        divisionName: `${u21Nat.confederation} Sub-21 Internacional`,
        countryId: u21Nat.id,
        wageWeekly: 3200,
        durationYears: 2,
        sportingObjective: 'Clasificar al Campeonato Continental Sub-21 y promocionar talento joven',
        transferBudget: 0,
        isNationalTeam: true,
        nationalTeamType: 'SUB21',
        offeredDate: currentDate,
        reputationRequired: 58,
        status: 'PENDIENTE',
      });

      const competitiveNations = NATIONAL_TEAMS_80.filter(
        (n) => n.reputation >= 72 && n.reputation <= 82
      );
      if (competitiveNations.length > 0) {
        const nat = competitiveNations[Math.floor(Math.random() * competitiveNations.length)];
        offers.push({
          id: `offer_nat_comp_${nat.id}_${now}`,
          clubName: `Selección de Fútbol de ${nat.name}`,
          divisionName: `${nat.confederation} Clasificatorias Mundial`,
          countryId: nat.id,
          wageWeekly: 6000,
          durationYears: 3,
          sportingObjective: 'Luchar por el billete a la Copa del Mundo',
          transferBudget: 0,
          isNationalTeam: true,
          nationalTeamType: 'ABSOLUTA',
          offeredDate: currentDate,
          reputationRequired: nat.reputation - 10,
          status: 'PENDIENTE',
        });
      }
    } else {
      // Top world giants (Spain, France, England, Brazil, Argentina, Germany) - only for proven managers!
      const eliteNations = NATIONAL_TEAMS_80.filter((n) => n.reputation >= 86);
      if (titlesWon >= 1 || rep >= 84) {
        const pickedElite = eliteNations[Math.floor(Math.random() * eliteNations.length)];
        if (pickedElite) {
          offers.push({
            id: `offer_nat_elite_${pickedElite.id}_${now}`,
            clubName: `Selección Absoluta de ${pickedElite.name}`,
            divisionName: `${pickedElite.confederation} / Copa Mundial FIFA`,
            countryId: pickedElite.id,
            wageWeekly: 15000,
            durationYears: 4,
            sportingObjective: 'Conquistar la Copa del Mundo y alcanzar el Nº 1 del Ranking FIFA',
            transferBudget: 0,
            isNationalTeam: true,
            nationalTeamType: 'ABSOLUTA',
            offeredDate: currentDate,
            reputationRequired: 82,
            status: 'PENDIENTE',
          });
        }
      }
    }
  }

  return offers.slice(0, desiredCount);
}

// User-triggered: Representative / Agent searches for active market offers on demand
export function generateImmediateMarketOffers(save: GameSave): {
  updatedSave: GameSave;
  newOffersCount: number;
} {
  const freshOffers = generateJobOffers(save.manager, save, 6);
  
  // Clean out stale offers (older than 30 days or from previous seasons)
  const curYear = parseInt(save.currentDate.slice(0, 4), 10) || 2026;
  const recentOffers = (save.jobOffers || []).filter((o) => {
    if (o.status !== 'PENDIENTE') return false;
    if (o.offeredDate) {
      const offerYear = parseInt(o.offeredDate.slice(0, 4), 10) || 2026;
      if (curYear - offerYear >= 1) return false;
    }
    return true;
  });

  const existingKeys = new Set(recentOffers.map((o) => o.clubId || o.clubName));
  const uniqueNew = freshOffers.filter((o) => !existingKeys.has(o.clubId || o.clubName));

  // Merge unique new with recent offers, prioritizing new ones
  const finalOffers = uniqueNew.length > 0 
    ? [...uniqueNew, ...recentOffers].slice(0, 8) 
    : freshOffers;

  const agentNews: NewsItem = {
    id: `agent_dossier_${Date.now()}`,
    date: save.currentDate,
    title: 'Dossier de Oportunidades: Tu representante te presenta ofertas formales',
    content: `Tu agente deportivo ha gestionado ${finalOffers.length} nuevas propuestas procedentes de clubes de primer nivel y combinados nacionales interesados en tu perfil y trayectoria. Consulta el buzón de la Ficha del Entrenador.`,
    category: 'ENTRENADOR',
    read: false,
  };

  const updatedSave: GameSave = {
    ...save,
    jobOffers: finalOffers,
    news: [agentNews, ...save.news],
  };

  return {
    updatedSave,
    newOffersCount: finalOffers.length,
  };
}

// Accept a Job Offer (transferring manager to another club or taking national team)
export function acceptJobOffer(
  save: GameSave,
  offer: JobOffer
): { updatedSave: GameSave; marketEvent: ManagerMarketEvent } {
  const currentDate = save.currentDate;

  // National Team acceptance
  if (offer.isNationalTeam) {
    const cleanName = offer.clubName
      .replace(/^Selección\s+(de\s+|Absoluta\s+de\s+|de\s+Fútbol\s+de\s+)?/i, '')
      .replace(/\s+Sub-2[01]$/i, '')
      .trim()
      .toLowerCase();

    const natTeam = (offer.countryId ? NATIONAL_TEAMS_MAP[offer.countryId] : null) ||
      NATIONAL_TEAMS_80.find(
        (n) => n.id === offer.countryId || n.name.toLowerCase() === cleanName || cleanName.includes(n.name.toLowerCase())
      );
    const flag = natTeam?.flag || '🌐';
    const countryId = natTeam?.id || offer.countryId || 'ESP';
    const countryName = natTeam ? `Selección de ${natTeam.name}` : offer.clubName;

    const nationalRole = {
      countryId,
      countryName,
      flag,
      teamType: offer.nationalTeamType || 'ABSOLUTA',
      squadPlayerIds: [],
      reputation: offer.reputationRequired + 10,
    };

    const marketEvent: ManagerMarketEvent = {
      id: `mkt_ev_${Date.now()}`,
      date: currentDate,
      type: 'CONTRATACION',
      clubName: offer.clubName,
      managerName: `${save.manager.firstName} ${save.manager.lastName}`,
      headline: `¡${save.manager.firstName} ${save.manager.lastName} nombrado nuevo seleccionador de ${offer.clubName}!`,
      details: `La federación nacional ha confirmado la contratación de ${save.manager.lastName} para dirigir al combinado nacional tras sus notables méritos profesionales. Mantendrá además compatibilidad con su club.`,
    };

    const news: NewsItem = {
      id: `news_nat_${Date.now()}`,
      date: currentDate,
      title: `OFICIAL: ${save.manager.lastName} asume el banquillo de ${offer.clubName}`,
      content: marketEvent.details,
      category: 'ENTRENADOR',
      read: false,
    };

    const updatedManager: Manager = {
      ...save.manager,
      nationalTeamRole: nationalRole,
      reputation: Math.min(100, save.manager.reputation + 4),
    };

    const updatedJobOffers = save.jobOffers.map((o) =>
      o.id === offer.id ? { ...o, status: 'ACEPTADA' as const } : o
    );

    return {
      updatedSave: {
        ...save,
        manager: updatedManager,
        jobOffers: updatedJobOffers,
        marketEvents: [marketEvent, ...save.marketEvents],
        news: [news, ...save.news],
      },
      marketEvent,
    };
  }

  // Club Acceptance
  const newClub =
    save.clubs[offer.clubId || ''] ||
    Object.values(save.clubs).find((c) => c.name === offer.clubName) ||
    save.clubs[save.userClubId];

  const oldClubName = save.manager.contract?.clubName || 'su anterior club';

  const newContract: ManagerContract = {
    clubId: newClub.id,
    clubName: newClub.name,
    startDate: currentDate,
    endSeason: '2028/29',
    durationYears: offer.durationYears,
    wageWeekly: offer.wageWeekly,
    wageAnnual: offer.wageWeekly * 52,
    sportingObjective: offer.sportingObjective,
    economicObjective: `No sobrepasar el límite salarial de ${newClub.finances.weeklyWageBudget.toLocaleString()} €`,
    releaseClause: offer.wageWeekly * 52 * 3,
    severancePay: Math.round(offer.wageWeekly * 52 * 0.5),
    promotionBonus: 12000,
    survivalBonus: 4000,
    renewalCondition: 'Renovación automática si se logran los objetivos deportivos pactados',
  };

  const marketEvent: ManagerMarketEvent = {
    id: `mkt_ev_${Date.now()}`,
    date: currentDate,
    type: 'CONTRATACION',
    clubName: newClub.name,
    managerName: `${save.manager.firstName} ${save.manager.lastName}`,
    headline: `Firma oficial: ${save.manager.lastName} nuevo técnico de ${newClub.name}`,
    details: `${newClub.name} ha hecho oficial la llegada de ${save.manager.firstName} ${save.manager.lastName} como nuevo entrenador jefe tras su etapa en ${oldClubName}.`,
  };

  const news: NewsItem = {
    id: `news_hire_${Date.now()}`,
    date: currentDate,
    title: marketEvent.headline,
    content: marketEvent.details,
    category: 'ENTRENADOR',
    read: false,
  };

  const updatedManager: Manager = {
    ...save.manager,
    contract: newContract,
    reputation: Math.min(100, save.manager.reputation + 3),
  };

  const updatedJobOffers = save.jobOffers.map((o) =>
    o.id === offer.id ? { ...o, status: 'ACEPTADA' as const } : o
  );

  return {
    updatedSave: {
      ...save,
      userClubId: newClub.id,
      manager: updatedManager,
      jobOffers: updatedJobOffers,
      marketEvents: [marketEvent, ...save.marketEvents],
      news: [news, ...save.news],
    },
    marketEvent,
  };
}

// Resign voluntarily from club
export function resignFromClub(save: GameSave): { updatedSave: GameSave; marketEvent: ManagerMarketEvent } {
  const currentDate = save.currentDate;
  const clubName = save.manager.contract.clubName;

  const marketEvent: ManagerMarketEvent = {
    id: `mkt_res_${Date.now()}`,
    date: currentDate,
    type: 'DIMISION',
    clubName,
    managerName: `${save.manager.firstName} ${save.manager.lastName}`,
    headline: `Dimisión: ${save.manager.lastName} renuncia a su cargo en ${clubName}`,
    details: `${save.manager.firstName} ${save.manager.lastName} ha presentado su dimisión irrevocable como entrenador de ${clubName}. El banquillo queda vacante en el mercado.`,
  };

  const news: NewsItem = {
    id: `news_res_${Date.now()}`,
    date: currentDate,
    title: marketEvent.headline,
    content: marketEvent.details,
    category: 'ENTRENADOR',
    read: false,
  };

  const updatedManager: Manager = {
    ...save.manager,
    reputation: Math.max(1, save.manager.reputation - 3),
    careerStats: {
      ...save.manager.careerStats,
      resignationsCount: save.manager.careerStats.resignationsCount + 1,
    },
  };

  return {
    updatedSave: {
      ...save,
      manager: updatedManager,
      marketEvents: [marketEvent, ...save.marketEvents],
      news: [news, ...save.news],
    },
    marketEvent,
  };
}

// Resign voluntarily from National Team (keeping club role intact!)
export function resignFromNationalTeam(save: GameSave): { updatedSave: GameSave; marketEvent: ManagerMarketEvent } {
  const currentDate = save.currentDate;
  const nationalRole = save.manager.nationalTeamRole;
  const nationName = nationalRole?.countryName || 'la Selección Nacional';

  const marketEvent: ManagerMarketEvent = {
    id: `mkt_res_nat_${Date.now()}`,
    date: currentDate,
    type: 'DIMISION',
    clubName: nationName,
    managerName: `${save.manager.firstName} ${save.manager.lastName}`,
    headline: `Dimisión: ${save.manager.lastName} renuncia al banquillo de ${nationName}`,
    details: `${save.manager.firstName} ${save.manager.lastName} ha presentado formalmente su dimisión como seleccionador nacional de ${nationName}. El técnico continúa al frente de su club y queda disponible para nuevos proyectos internacionales.`,
  };

  const news: NewsItem = {
    id: `news_res_nat_${Date.now()}`,
    date: currentDate,
    title: `Dimisión de la Selección: ${save.manager.lastName} deja ${nationName}`,
    content: marketEvent.details,
    category: 'ENTRENADOR',
    read: false,
  };

  const careerLogEntry = {
    season: save.currentSeason,
    clubOrNationName: nationName,
    achieved: `Dimisión como Seleccionador de ${nationName}`,
    date: currentDate,
  };

  const updatedManager: Manager = {
    ...save.manager,
    nationalTeamRole: null,
    careerLog: [careerLogEntry, ...(save.manager.careerLog || [])],
    careerStats: {
      ...save.manager.careerStats,
      resignationsCount: save.manager.careerStats.resignationsCount + 1,
    },
  };

  return {
    updatedSave: {
      ...save,
      manager: updatedManager,
      marketEvents: [marketEvent, ...save.marketEvents],
      news: [news, ...save.news],
    },
    marketEvent,
  };
}

// Renew contract with current club
export function renewContract(
  save: GameSave,
  additionalYears = 1,
  wageIncreasePct = 15
): { updatedSave: GameSave; marketEvent: ManagerMarketEvent } {
  const currentDate = save.currentDate;
  const club = save.clubs[save.userClubId];
  const oldContract = save.manager.contract;

  const currentEndYear = parseInt(oldContract.endSeason.slice(0, 4), 10) || 2028;
  const newEndYear = currentEndYear + additionalYears;
  const newEndSeason = `${newEndYear}/${(newEndYear + 1).toString().slice(2)}`;

  const newWageWeekly = Math.round((oldContract.wageWeekly * (1 + wageIncreasePct / 100)) / 25) * 25;
  const newWageAnnual = newWageWeekly * 52;

  const renewedContract: ManagerContract = {
    ...oldContract,
    endSeason: newEndSeason,
    durationYears: oldContract.durationYears + additionalYears,
    wageWeekly: newWageWeekly,
    wageAnnual: newWageAnnual,
    releaseClause: newWageAnnual * 3,
    severancePay: Math.round(newWageAnnual * 0.55),
    promotionBonus: Math.round(oldContract.promotionBonus * 1.15),
  };

  const marketEvent: ManagerMarketEvent = {
    id: `mkt_ren_${Date.now()}`,
    date: currentDate,
    type: 'RENOVACION',
    clubName: club.name,
    managerName: `${save.manager.firstName} ${save.manager.lastName}`,
    headline: `Acuerdo total: ${save.manager.lastName} renueva con el ${club.name}`,
    details: `La junta directiva de ${club.name} ha hecho oficial la ampliación de contrato de su preparador ${save.manager.firstName} ${save.manager.lastName} hasta ${newEndSeason}, premiando su labor al frente del banquillo.`,
  };

  const news: NewsItem = {
    id: `news_ren_${Date.now()}`,
    date: currentDate,
    title: marketEvent.headline,
    content: marketEvent.details,
    category: 'ENTRENADOR',
    read: false,
  };

  const updatedClub = {
    ...club,
    boardConfidence: Math.min(100, club.boardConfidence + 6),
  };

  const updatedManager: Manager = {
    ...save.manager,
    contract: renewedContract,
    reputation: Math.min(100, save.manager.reputation + 2),
  };

  return {
    updatedSave: {
      ...save,
      clubs: {
        ...save.clubs,
        [club.id]: updatedClub,
      },
      manager: updatedManager,
      marketEvents: [marketEvent, ...save.marketEvents],
      news: [news, ...save.news],
    },
    marketEvent,
  };
}

// Reject a job offer
export function rejectJobOffer(save: GameSave, offerId: string): GameSave {
  return {
    ...save,
    jobOffers: save.jobOffers.map((o) =>
      o.id === offerId ? { ...o, status: 'RECHAZADA' as const } : o
    ),
  };
}

// Terminate contract by Board (Dismissal / Sacking)
export function terminateContractByBoard(
  save: GameSave,
  reason = 'La directiva ha perdido la confianza deportiva en el proyecto.'
): { updatedSave: GameSave; marketEvent: ManagerMarketEvent } {
  const currentDate = save.currentDate;
  const club = save.clubs[save.userClubId];
  const severance = save.manager.contract.severancePay;

  const marketEvent: ManagerMarketEvent = {
    id: `mkt_sack_${Date.now()}`,
    date: currentDate,
    type: 'DESTITUCION',
    clubName: club.name,
    managerName: `${save.manager.firstName} ${save.manager.lastName}`,
    headline: `Destitución fulminante: ${club.name} cesa a ${save.manager.lastName}`,
    details: `${reason} El club abonará la indemnización por rescisión estipulada (${severance.toLocaleString()} €) y comenzará la búsqueda inmediata de sustituto.`,
  };

  const news: NewsItem = {
    id: `news_sack_${Date.now()}`,
    date: currentDate,
    title: marketEvent.headline,
    content: marketEvent.details,
    category: 'DIRECTIVA',
    read: false,
  };

  // Club pays severance
  const updatedClub = {
    ...club,
    boardConfidence: 50,
    finances: {
      ...club.finances,
      balance: club.finances.balance - severance,
    },
  };

  const updatedManager: Manager = {
    ...save.manager,
    reputation: Math.max(15, save.manager.reputation - 6),
    careerStats: {
      ...save.manager.careerStats,
      sacksCount: save.manager.careerStats.sacksCount + 1,
    },
  };

  return {
    updatedSave: {
      ...save,
      clubs: {
        ...save.clubs,
        [club.id]: updatedClub,
      },
      manager: updatedManager,
      marketEvents: [marketEvent, ...save.marketEvents],
      news: [news, ...save.news],
    },
    marketEvent,
  };
}

// Simulate AI movements in the managerial market
export function simulateMarketMovements(save: GameSave): GameSave {
  const currentDate = save.currentDate;
  const otherClubs = Object.values(save.clubs).filter((c) => c.id !== save.userClubId);
  if (otherClubs.length === 0) return save;

  // Chance to generate a market event
  const randomClub = otherClubs[Math.floor(Math.random() * otherClubs.length)];
  const coaches = [
    'Manolo González', 'Ferran Costa', 'Toni Seligrat', 'Lluís Carreras',
    'Raúl Garrido', 'Natxo González', 'Kiko Ramírez', 'Albert Celades'
  ];
  const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];

  const isHiring = Math.random() > 0.4;
  const eventType = isHiring ? 'CONTRATACION' : 'DESTITUCION';

  const headline = isHiring
    ? `${randomClub.name} contrata a ${randomCoach} como nuevo técnico`
    : `Crisis deportiva: ${randomClub.name} destituye a su cuerpo técnico`;

  const details = isHiring
    ? `El conjunto de ${randomClub.city} ha presentado a ${randomCoach} con el objetivo prioritario de enderezar el rumbo en su categoría.`
    : `La directiva de ${randomClub.name} ha tomado la decisión de rescindir el contrato de su entrenador tras los últimos resultados insatisfactorios.`;

  const newEvent: ManagerMarketEvent = {
    id: `mkt_ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    date: currentDate,
    type: eventType,
    clubName: randomClub.name,
    managerName: randomCoach,
    headline,
    details,
  };

  return {
    ...save,
    marketEvents: [newEvent, ...save.marketEvents].slice(0, 50),
  };
}

