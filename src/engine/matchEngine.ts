import { Club } from '../types/club';
import { Match, MatchEvent, MatchStats } from '../types/competition';
import { Player } from '../types/player';

export interface SimulatedMatchResult {
  match: Match;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  stats: MatchStats;
  attendance: number;
  ticketRevenue: number;
  updatedPlayers: Record<string, Partial<Player>>;
}

// Spanish commentary templates
const GOAL_PHRASES = [
  '¡GOOOOOOOL! Zarpazo al fondo de la red con un disparo imparable.',
  '¡GOOOOOL! Remate colocado tras una magnífica triangulación.',
  '¡GOOOL! Cabezazo imperial en el corazón del área que supera al guardameta.',
  '¡GOOOOOL! Aprovecha un rechace en el área pequeña para adelantar a su equipo.',
  '¡QUÉ GOLAZO! Disparo desde fuera del área que entra rozando la escuadra.',
];

const YELLOW_PHRASES = [
  'Tarjeta amarilla tras cortar un contragolpe peligroso.',
  'Amonestación por una entrada a destiempo en el centro del campo.',
  'El colegiado le muestra la cartulina amarilla por reiteración de faltas.',
  'Tarjeta amarilla por protestar con vehemencia una decisión arbitral.',
];

const RED_PHRASES = [
  '¡TARJETA ROJA DIRECTA! Entrada durísima que deja a su equipo con diez hombres.',
  'Segunda tarjeta amarilla y EXPULSIÓN. Se marcha al vestuario antes de tiempo.',
];

const INJURY_PHRASES = [
  'Problemas musculares. Se echa la mano a la pierna y pide la asistencia médica.',
  'Duro choque en la disputa del balón. El jugador queda tendido con claros gestos de dolor.',
];

// Helper to calculate team sector ratings
export function calculateTeamPower(
  club?: Club | null,
  playersMap?: Record<string, Player>
): { attack: number; midfield: number; defense: number; gk: number; overall: number } {
  if (!club) {
    return { attack: 50, midfield: 50, defense: 50, gk: 50, overall: 50 };
  }

  const pMap = playersMap || {};
  const ids = (club.startingElevenIds && club.startingElevenIds.length > 0)
    ? club.startingElevenIds
    : (club.playerIds || []);

  const rawStarters = ids.map((id) => pMap[id]).filter(Boolean);

  if (rawStarters.length === 0) {
    const base = club.reputation || 65;
    return { attack: base, midfield: base, defense: base, gk: base, overall: base };
  }

  // Realistic Squad Depth: Filter injured or suspended players and replace with available bench players
  const benchIds = (club.playerIds || []).filter((id) => !ids.includes(id));
  const availableBench = benchIds.map((id) => pMap[id]).filter((p) => p && !p.isInjured && !p.isSuspended);

  const starters: Player[] = rawStarters.map((p) => {
    if (p.isInjured || p.isSuspended) {
      // Find suitable replacement from bench
      const replacementIdx = availableBench.findIndex((bp) => 
        bp.primaryPosition === p.primaryPosition ||
        (['DFC', 'LD', 'LI'].includes(p.primaryPosition) && ['DFC', 'LD', 'LI'].includes(bp.primaryPosition)) ||
        (['MC', 'MCD', 'MCO'].includes(p.primaryPosition) && ['MC', 'MCD', 'MCO'].includes(bp.primaryPosition)) ||
        (['DC', 'ED', 'EI'].includes(p.primaryPosition) && ['DC', 'ED', 'EI'].includes(bp.primaryPosition))
      );
      if (replacementIdx !== -1) {
        const replacement = availableBench.splice(replacementIdx, 1)[0];
        return replacement;
      }
      // Shallow squad penalty: player forced to play through injury or out of position
      return {
        ...p,
        overallRating: Math.max(35, Math.round(p.overallRating * 0.55)),
        fitness: Math.min(40, p.fitness),
      };
    }
    return p;
  });

  let gkSum = 0, gkCount = 0;
  let defSum = 0, defCount = 0;
  let midSum = 0, midCount = 0;
  let attSum = 0, attCount = 0;

  starters.forEach((p) => {
    // Modify rating by fitness and morale
    const fitnessMod = 0.65 + (p.fitness / 100) * 0.35;
    const moraleMod = 0.88 + (p.morale / 100) * 0.22;
    const effectiveOvr = p.overallRating * fitnessMod * moraleMod;

    if (p.primaryPosition === 'POR') {
      gkSum += effectiveOvr;
      gkCount++;
    } else if (['DFC', 'LD', 'LI'].includes(p.primaryPosition)) {
      defSum += effectiveOvr;
      defCount++;
    } else if (['MC', 'MCD', 'MCO'].includes(p.primaryPosition)) {
      midSum += effectiveOvr;
      midCount++;
    } else {
      attSum += effectiveOvr;
      attCount++;
    }
  });

  let gk = gkCount > 0 ? gkSum / gkCount : 50;
  const defense = defCount > 0 ? defSum / defCount : 50;
  const midfield = midCount > 0 ? midSum / midCount : 50;
  const attack = attCount > 0 ? attSum / attCount : 50;

  // Coach quality and tactical preparation modifier
  const coachRep = (club as any).coachReputation || (club as any).reputation || 65;
  const coachMod = 1.0 + ((coachRep - 70) / 250); // ±4% boost from elite managers

  // Apply tactical mentality modifiers
  let attMod = 1.0 * coachMod;
  let defMod = 1.0 * coachMod;
  let midMod = 1.0 * coachMod;

  if (club.tacticMentality === 'Muy Defensiva') {
    attMod = 0.75;
    defMod = 1.25;
  } else if (club.tacticMentality === 'Defensiva') {
    attMod = 0.88;
    defMod = 1.12;
  } else if (club.tacticMentality === 'Ofensiva') {
    attMod = 1.15;
    defMod = 0.90;
  } else if (club.tacticMentality === 'Al Ataque') {
    attMod = 1.28;
    defMod = 0.78;
  }

  // Phase 5: Team Tactical Instructions Modifiers
  if (club.teamInstructions) {
    const ti = club.teamInstructions;
    if (ti.estiloJuego === 'Tiki-Taka') {
      midMod *= 1.10;
      attMod *= 0.95;
    } else if (ti.estiloJuego === 'Contraataque') {
      attMod *= 1.12;
      defMod *= 1.06;
      midMod *= 0.92;
    } else if (ti.estiloJuego === 'Gegenpressing') {
      midMod *= 1.05;
      defMod *= 1.05;
      attMod *= 1.06;
    } else if (ti.estiloJuego === 'Bloque Bajo') {
      defMod *= 1.18;
      attMod *= 0.85;
    } else if (ti.estiloJuego === 'Juego Directo') {
      attMod *= 1.08;
      midMod *= 0.94;
    }

    if (ti.presion === 'Asfixiante') {
      midMod *= 1.04;
      defMod *= 1.04;
    } else if (ti.presion === 'Baja') {
      defMod *= 1.06;
      midMod *= 0.96;
    }

    if (ti.alturaDefensiva === 'Repliegue Intensivo') {
      defMod *= 1.08;
    } else if (ti.alturaDefensiva === 'Muy Adelantada') {
      attMod *= 1.06;
      defMod *= 0.94;
    }
  }

  // Phase 5: Player Tactical Roles Bonus
  if (club.playerInstructions) {
    const piList = Object.values(club.playerInstructions);
    piList.forEach((pi) => {
      if (pi.role === 'Falso Nueve') midMod += 0.015;
      if (pi.role === 'Portero Líbero') gk += 1.5;
      if (pi.role === 'Pivote Destructor' || pi.role === 'Ancla Defensiva') defMod += 0.01;
      if (pi.role === 'Carrilero Ofensivo' || pi.role === 'Puñal al Espacio') attMod += 0.01;
    });
  }

  const finalAtt = attack * attMod;
  const finalDef = defense * defMod;
  const finalMid = midfield * midMod;
  const overall = (gk * 0.15 + finalDef * 0.3 + finalMid * 0.3 + finalAtt * 0.25);

  return {
    attack: Math.round(finalAtt),
    midfield: Math.round(finalMid),
    defense: Math.round(finalDef),
    gk: Math.round(gk),
    overall: Math.round(overall),
  };
}

export function simulateMatch(
  match: Match,
  homeClub: Club,
  awayClub: Club,
  playersMap: Record<string, Player>
): SimulatedMatchResult {
  // Absolute safety guard if clubs are missing
  if (!homeClub || !awayClub) {
    const dummyStats: MatchStats = {
      possessionHome: 50,
      possessionAway: 50,
      xgHome: 1.0,
      xgAway: 1.0,
      shotsHome: 5,
      shotsAway: 5,
      shotsOnTargetHome: 2,
      shotsOnTargetAway: 2,
      bigChancesHome: 1,
      bigChancesAway: 1,
      passesHome: 400,
      passesAway: 400,
      passAccuracyHome: 80,
      passAccuracyAway: 80,
      foulsHome: 8,
      foulsAway: 8,
      cornersHome: 3,
      cornersAway: 3,
      yellowCardsHome: 0,
      yellowCardsAway: 0,
      redCardsHome: 0,
      redCardsAway: 0,
    };
    return {
      match: match || { id: 'dummy_match', competitionId: '', matchday: 1, date: '', homeTeamId: '', awayTeamId: '', played: true },
      homeScore: 0,
      awayScore: 0,
      events: [],
      updatedPlayers: {},
      attendance: 5000,
      ticketRevenue: 50000,
      stats: dummyStats,
    };
  }

  const pMap = playersMap || {};
  const homePower = calculateTeamPower(homeClub, pMap);
  const awayPower = calculateTeamPower(awayClub, pMap);

  // Home advantage (+4 overall)
  const effectiveHomeOvr = homePower.overall + 4;
  const effectiveAwayOvr = awayPower.overall;

  // Attendance calculation with safe stadium fallbacks
  const ticketPrice = homeClub.stadium?.ticketPrice || 15;
  const capacity = homeClub.stadium?.capacity || 6000;
  const seasonTickets = homeClub.stadium?.seasonTicketHolders || 1000;
  const baseFill = 0.55 + ((homeClub.reputation || 60) / 100) * 0.3;
  const priceRatio = Math.max(0.5, Math.min(2.0, 18 / Math.max(10, ticketPrice)));
  const calculatedAttendance = Math.min(
    capacity,
    Math.round(capacity * baseFill * priceRatio)
  );
  const attendance = Math.max(seasonTickets, calculatedAttendance);
  const payingAttendees = Math.max(0, attendance - seasonTickets);
  const ticketRevenue = payingAttendees * ticketPrice;

  // Possession calculation based on midfield battle and style
  let midDiff = homePower.midfield - awayPower.midfield + 4; // slight home edge
  if (homeClub.teamInstructions?.estiloJuego === 'Tiki-Taka') midDiff += 6;
  if (awayClub.teamInstructions?.estiloJuego === 'Tiki-Taka') midDiff -= 6;
  if (homeClub.teamInstructions?.posesion === 'Control Absoluto') midDiff += 5;
  if (awayClub.teamInstructions?.posesion === 'Control Absoluto') midDiff -= 5;

  const possessionHome = Math.max(28, Math.min(72, Math.round(50 + midDiff * 0.8)));
  const possessionAway = 100 - possessionHome;

  // Chances & Shots calculation
  const homeShotsBase = Math.round(8 + (effectiveHomeOvr - awayPower.defense) * 0.3 + (possessionHome - 50) * 0.15);
  const awayShotsBase = Math.round(7 + (effectiveAwayOvr - homePower.defense) * 0.3 + (possessionAway - 50) * 0.15);

  const shotsHome = Math.max(3, homeShotsBase + Math.floor(Math.random() * 5));
  const shotsAway = Math.max(2, awayShotsBase + Math.floor(Math.random() * 4));

  const shotsOnTargetHome = Math.max(1, Math.round(shotsHome * (0.35 + Math.random() * 0.25)));
  const shotsOnTargetAway = Math.max(1, Math.round(shotsAway * (0.35 + Math.random() * 0.25)));

  // Events generation
  const events: MatchEvent[] = [];
  const updatedPlayers: Record<string, Partial<Player>> = {};

  // Helper for guaranteed fallback players
  const makeFallbackPlayer = (c: Club, n: number): Player => ({
    id: `fb_${c.id}_${n}`,
    firstName: c.shortName || 'Jugador',
    lastName: `${n}`,
    nationality: 'España',
    birthDate: '2000-01-01',
    age: 24,
    primaryPosition: n === 1 ? 'POR' : n <= 5 ? 'DFC' : n <= 9 ? 'MC' : 'DC',
    overallRating: c.reputation || 70,
    potential: (c.reputation || 70) + 5,
    marketValue: 100000,
    attributes: {
      velocidad: 70,
      disparo: 70,
      pase: 70,
      regate: 70,
      defensa: 70,
      resistencia: 70,
      fuerza: 70,
      vision: 70,
      liderazgo: 70,
      reflejos: 70,
      paradas: 70,
    },
    contract: { wagePerWeek: 1000, contractEndYear: 2028, releaseClause: 500000, squadStatus: 'Titular' },
    clubId: c.id,
    isTransferListed: false,
    isLoanListed: false,
    fitness: 100, morale: 85, matchReadiness: 90, isInjured: false,
    seasonStats: { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0, averageRating: 7.0 },
  });

  let homeStarters = (homeClub.startingElevenIds || []).map((id) => pMap[id]).filter(Boolean) as Player[];
  if (homeStarters.length === 0) {
    homeStarters = (homeClub.playerIds || []).map((id) => pMap[id]).filter(Boolean) as Player[];
  }
  if (homeStarters.length === 0) {
    homeStarters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => makeFallbackPlayer(homeClub, n));
  }

  let awayStarters = (awayClub.startingElevenIds || []).map((id) => pMap[id]).filter(Boolean) as Player[];
  if (awayStarters.length === 0) {
    awayStarters = (awayClub.playerIds || []).map((id) => pMap[id]).filter(Boolean) as Player[];
  }
  if (awayStarters.length === 0) {
    awayStarters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => makeFallbackPlayer(awayClub, n));
  }

  let homeScore = 0;
  let awayScore = 0;

  // Daily Inspiration & Upset Factor (Section 1: Realism in results, occasional surprises)
  const homeDailyForm = (Math.random() - 0.5) * 0.08;
  const awayDailyForm = (Math.random() - 0.5) * 0.08;

  // Goals for Home
  const homeGoalRatio = Math.max(0.10, Math.min(0.50, 0.25 + (homePower.attack - awayPower.gk) * 0.009 + homeDailyForm));
  for (let s = 0; s < shotsOnTargetHome; s++) {
    if (Math.random() < homeGoalRatio) {
      homeScore++;
      const minute = Math.floor(Math.random() * 90) + 1;
      const isPenalty = Math.random() < 0.14;
      const penaltySpecialist = homeClub.setPieceTakers?.penaltyTakerId ? pMap[homeClub.setPieceTakers.penaltyTakerId] : null;
      const attackers = homeStarters.filter((p) => ['DC', 'ED', 'EI', 'MCO', 'MC'].includes(p.primaryPosition));
      const defaultScorer = homeStarters[0] || makeFallbackPlayer(homeClub, 9);
      const scorer = (isPenalty && penaltySpecialist) ? penaltySpecialist : (attackers.length > 0 ? attackers[Math.floor(Math.random() * attackers.length)] : defaultScorer);

      if (!scorer || !scorer.id) continue;
      const otherAttackers = homeStarters.filter((p) => p && p.id && p.id !== scorer.id);
      const assister = isPenalty ? undefined : (Math.random() > 0.3 && otherAttackers.length > 0
        ? otherAttackers[Math.floor(Math.random() * otherAttackers.length)]
        : undefined);

      const desc = isPenalty 
        ? '¡GOOOOOL DE PENALTI! Ejecución magistral desde los once metros engañando al arquero.'
        : GOAL_PHRASES[Math.floor(Math.random() * GOAL_PHRASES.length)];
      events.push({
        minute,
        type: isPenalty ? 'GOL_PENALTI' : 'GOL',
        teamId: homeClub.id,
        playerId: scorer.id,
        assistPlayerId: assister?.id,
        description: `${desc} [${homeClub.shortName || homeClub.name}]`,
      });

      // Update season stats in player delta
      if (!updatedPlayers[scorer.id]) {
        updatedPlayers[scorer.id] = { seasonStats: { ...(scorer.seasonStats || { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0, averageRating: 7.0 }) } };
      }
      (updatedPlayers[scorer.id].seasonStats as any).goals = ((scorer.seasonStats?.goals) || 0) + 1;

      if (assister && assister.id) {
        if (!updatedPlayers[assister.id]) {
          updatedPlayers[assister.id] = { seasonStats: { ...(assister.seasonStats || { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0, averageRating: 7.0 }) } };
        }
        (updatedPlayers[assister.id].seasonStats as any).assists = ((assister.seasonStats?.assists) || 0) + 1;
      }
    }
  }

  // Goals for Away
  const awayGoalRatio = Math.max(0.08, Math.min(0.48, 0.22 + (awayPower.attack - homePower.gk) * 0.009 + awayDailyForm));
  for (let s = 0; s < shotsOnTargetAway; s++) {
    if (Math.random() < awayGoalRatio) {
      awayScore++;
      const minute = Math.floor(Math.random() * 90) + 1;
      const isPenalty = Math.random() < 0.14;
      const penaltySpecialist = awayClub.setPieceTakers?.penaltyTakerId ? pMap[awayClub.setPieceTakers.penaltyTakerId] : null;
      const attackers = awayStarters.filter((p) => ['DC', 'ED', 'EI', 'MCO', 'MC'].includes(p.primaryPosition));
      const defaultAwayScorer = awayStarters[0] || makeFallbackPlayer(awayClub, 9);
      const scorer = (isPenalty && penaltySpecialist) ? penaltySpecialist : (attackers.length > 0 ? attackers[Math.floor(Math.random() * attackers.length)] : defaultAwayScorer);

      if (!scorer || !scorer.id) continue;
      const otherAttackers = awayStarters.filter((p) => p && p.id && p.id !== scorer.id);
      const assister = isPenalty ? undefined : (Math.random() > 0.3 && otherAttackers.length > 0
        ? otherAttackers[Math.floor(Math.random() * otherAttackers.length)]
        : undefined);

      const desc = isPenalty 
        ? '¡GOOOOOL DE PENALTI! Ejecución certera desde el punto fatídico.'
        : GOAL_PHRASES[Math.floor(Math.random() * GOAL_PHRASES.length)];
      events.push({
        minute,
        type: isPenalty ? 'GOL_PENALTI' : 'GOL',
        teamId: awayClub.id,
        playerId: scorer.id,
        assistPlayerId: assister?.id,
        description: `${desc} [${awayClub.shortName || awayClub.name}]`,
      });

      if (!updatedPlayers[scorer.id]) {
        updatedPlayers[scorer.id] = { seasonStats: { ...(scorer.seasonStats || { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0, averageRating: 7.0 }) } };
      }
      (updatedPlayers[scorer.id].seasonStats as any).goals = ((scorer.seasonStats?.goals) || 0) + 1;

      if (assister && assister.id) {
        if (!updatedPlayers[assister.id]) {
          updatedPlayers[assister.id] = { seasonStats: { ...(assister.seasonStats || { matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0, averageRating: 7.0 }) } };
        }
        (updatedPlayers[assister.id].seasonStats as any).assists = ((assister.seasonStats?.assists) || 0) + 1;
      }
    }
  }

  // Cards & Fouls
  const foulsHome = Math.floor(7 + Math.random() * 8);
  const foulsAway = Math.floor(8 + Math.random() * 8);
  const cornersHome = Math.floor(3 + Math.random() * 6);
  const cornersAway = Math.floor(2 + Math.random() * 5);

  // Yellow cards (1 to 3 per team)
  const homeYellowCount = Math.floor(Math.random() * 3);
  for (let y = 0; y < homeYellowCount; y++) {
    const minute = Math.floor(Math.random() * 85) + 5;
    const player = homeStarters[Math.floor(Math.random() * homeStarters.length)];
    if (player) {
      events.push({
        minute,
        type: 'TARJETA_AMARILLA',
        teamId: homeClub.id,
        playerId: player.id,
        description: `${YELLOW_PHRASES[Math.floor(Math.random() * YELLOW_PHRASES.length)]} (${player.lastName})`,
      });
    }
  }

  const awayYellowCount = Math.floor(Math.random() * 3);
  for (let y = 0; y < awayYellowCount; y++) {
    const minute = Math.floor(Math.random() * 85) + 5;
    const player = awayStarters[Math.floor(Math.random() * awayStarters.length)];
    if (player) {
      events.push({
        minute,
        type: 'TARJETA_AMARILLA',
        teamId: awayClub.id,
        playerId: player.id,
        description: `${YELLOW_PHRASES[Math.floor(Math.random() * YELLOW_PHRASES.length)]} (${player.lastName})`,
      });
    }
  }

  // Low probability of red card (4%)
  let redHome = 0;
  let redAway = 0;
  if (Math.random() < 0.04) {
    redHome = 1;
    const player = homeStarters[Math.floor(Math.random() * homeStarters.length)];
    if (player) {
      events.push({
        minute: Math.floor(Math.random() * 60) + 30,
        type: 'TARJETA_ROJA',
        teamId: homeClub.id,
        playerId: player.id,
        description: `${RED_PHRASES[0]} (${player.lastName})`,
      });
    }
  }
  if (Math.random() < 0.04) {
    redAway = 1;
    const player = awayStarters[Math.floor(Math.random() * awayStarters.length)];
    if (player) {
      events.push({
        minute: Math.floor(Math.random() * 60) + 30,
        type: 'TARJETA_ROJA',
        teamId: awayClub.id,
        playerId: player.id,
        description: `${RED_PHRASES[0]} (${player.lastName})`,
      });
    }
  }

  // Low probability of injury (3%)
  if (Math.random() < 0.03) {
    const isHomeInjured = Math.random() > 0.5;
    const club = isHomeInjured ? homeClub : awayClub;
    const starters = isHomeInjured ? homeStarters : awayStarters;
    const player = starters[Math.floor(Math.random() * starters.length)];
    if (player) {
      events.push({
        minute: Math.floor(Math.random() * 70) + 15,
        type: 'LESION',
        teamId: club.id,
        playerId: player.id,
        description: `${INJURY_PHRASES[0]} (${player.lastName})`,
      });
      updatedPlayers[player.id] = {
        isInjured: true,
        injuryWeeksLeft: Math.floor(Math.random() * 3) + 1,
        injuryName: 'Esguince de tobillo',
      };
    }
  }

  // Sort events chronologically by minute
  events.sort((a, b) => a.minute - b.minute);

  // Wear and tear on starters fitness & match stats increment
  [...homeStarters, ...awayStarters].forEach((p) => {
    const currentStats = updatedPlayers[p.id]?.seasonStats || p.seasonStats;
    const newFitness = Math.max(65, p.fitness - (Math.floor(Math.random() * 6) + 7));
    const newMatches = (currentStats.matchesPlayed || 0) + 1;
    const newMinutes = (currentStats.minutesPlayed || 0) + 90;

    updatedPlayers[p.id] = {
      ...updatedPlayers[p.id],
      fitness: newFitness,
      seasonStats: {
        ...currentStats,
        matchesPlayed: newMatches,
        minutesPlayed: newMinutes,
      },
    };
  });

  const xgHome = Number((shotsOnTargetHome * 0.28 + (homePower.attack / 320)).toFixed(2));
  const xgAway = Number((shotsOnTargetAway * 0.26 + (awayPower.attack / 320)).toFixed(2));

  const stats: MatchStats = {
    possessionHome,
    possessionAway,
    xgHome,
    xgAway,
    shotsHome,
    shotsAway,
    shotsOnTargetHome,
    shotsOnTargetAway,
    bigChancesHome: Math.max(homeScore, Math.round(xgHome * 1.2)),
    bigChancesAway: Math.max(awayScore, Math.round(xgAway * 1.2)),
    passesHome: Math.round(840 * (possessionHome / 100)),
    passesAway: Math.round(840 * (possessionAway / 100)),
    passAccuracyHome: Math.round(Math.min(93, 76 + (homePower.midfield - 55) * 0.3)),
    passAccuracyAway: Math.round(Math.min(93, 75 + (awayPower.midfield - 55) * 0.3)),
    foulsHome,
    foulsAway,
    cornersHome,
    cornersAway,
    yellowCardsHome: homeYellowCount,
    yellowCardsAway: awayYellowCount,
    redCardsHome: redHome,
    redCardsAway: redAway,
  };

  const simulatedMatch: Match = {
    ...match,
    played: true,
    homeScore,
    awayScore,
    weather: 'Despejado',
    temperature: 19,
    attendance,
    ticketRevenue,
    events,
    stats,
  };

  return {
    match: simulatedMatch,
    homeScore,
    awayScore,
    events,
    stats,
    attendance,
    ticketRevenue,
    updatedPlayers,
  };
}
