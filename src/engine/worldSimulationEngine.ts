import { Club } from '../types/club';
import { Competition, Match, MatchEvent, MatchStats, StandingsRow } from '../types/competition';
import { GameSave, NewsItem } from '../types/game';
import { Player, Position } from '../types/player';
import { calculateTeamPower } from './matchEngine';

export interface WorldMatchdaySummary {
  simulatedMatchesCount: number;
  competitionsAffected: string[];
  topEvents: {
    matchday: number;
    competitionName: string;
    headline: string;
    score: string;
  }[];
  newInjuriesCount: number;
  newSuspensionsCount: number;
}

export type MatchWeather = 'Despejado' | 'Lluvioso' | 'Tormenta' | 'Calor Sofocante' | 'Frío Gélido';

/**
 * Deterministic PRNG seeded random generator for repeatable simulations
 */
export function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates contextual climate based on calendar month and country code
 */
export function generateMatchWeather(dateStr: string, countryId: string = 'ESP'): { weather: MatchWeather; temperature: number } {
  const month = new Date(dateStr).getMonth() + 1; // 1 to 12
  const rand = Math.random();

  let weather: MatchWeather = 'Despejado';
  let temperature = 18;

  if (month >= 6 && month <= 8) {
    // Verano
    if (rand < 0.25) {
      weather = 'Calor Sofocante';
      temperature = Math.round(32 + Math.random() * 6);
    } else if (rand < 0.35) {
      weather = 'Tormenta';
      temperature = Math.round(24 + Math.random() * 4);
    } else {
      weather = 'Despejado';
      temperature = Math.round(25 + Math.random() * 6);
    }
  } else if (month >= 11 || month <= 2) {
    // Invierno
    if (['ENG', 'GER', 'SCO', 'BEL', 'NED'].includes(countryId)) {
      if (rand < 0.45) {
        weather = 'Lluvioso';
        temperature = Math.round(4 + Math.random() * 5);
      } else if (rand < 0.70) {
        weather = 'Frío Gélido';
        temperature = Math.round(-1 + Math.random() * 4);
      } else {
        weather = 'Despejado';
        temperature = Math.round(6 + Math.random() * 5);
      }
    } else {
      // Mediterráneo / España / etc.
      if (rand < 0.30) {
        weather = 'Lluvioso';
        temperature = Math.round(9 + Math.random() * 5);
      } else {
        weather = 'Despejado';
        temperature = Math.round(12 + Math.random() * 6);
      }
    }
  } else {
    // Primavera / Otoño
    if (rand < 0.28) {
      weather = 'Lluvioso';
      temperature = Math.round(14 + Math.random() * 4);
    } else {
      weather = 'Despejado';
      temperature = Math.round(18 + Math.random() * 5);
    }
  }

  return { weather, temperature };
}

/**
 * Fast mathematical Poisson-like distribution for realistic goal counts based on xG
 */
export function samplePoissonGoals(expectedGoals: number, randomFn: () => number = Math.random): number {
  const L = Math.exp(-expectedGoals);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= randomFn();
  } while (p > L && k < 12);
  return k - 1;
}

/**
 * High-performance, probabilistic simulation of a match in any world league
 */
export function simulateWorldMatch(
  match: Match,
  homeClub: Club,
  awayClub: Club,
  playersMap: Record<string, Player>,
  seed?: number
): {
  match: Match;
  updatedPlayers: Record<string, Partial<Player>>;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  stats: MatchStats;
} {
  const rng = seed !== undefined ? createSeededRandom(seed) : Math.random;

  const homePower = calculateTeamPower(homeClub, playersMap);
  const awayPower = calculateTeamPower(awayClub, playersMap);

  const pickAvailableStarters = (c: Club) => {
    const desired = (c.startingElevenIds || []).map((id) => playersMap[id]).filter(Boolean);
    const available = desired.filter((p) => !p.isSuspended && !p.isInjured);
    if (available.length < 11) {
      const reserves = (c.playerIds || [])
        .map((id) => playersMap[id])
        .filter((p) => p && !p.isSuspended && !p.isInjured && !available.some((a) => a.id === p.id));
      for (const r of reserves) {
        if (available.length >= 11) break;
        available.push(r);
      }
    }
    return available.length > 0 ? available : desired;
  };

  const homeStarters = pickAvailableStarters(homeClub);
  const awayStarters = pickAvailableStarters(awayClub);

  const { weather, temperature } = generateMatchWeather(match.date, homeClub.countryId);

  // 1. Home advantage & Manager quality
  const homeAdvantage = 1.08; // +8% local factor
  const homeManagerRep = homeClub.reputation || 50;
  const awayManagerRep = awayClub.reputation || 50;
  const managerDiff = (homeManagerRep - awayManagerRep) * 0.001;

  // 2. Weather modifiers
  let weatherPassMod = 1.0;
  let weatherFoulMod = 1.0;
  let weatherShotMod = 1.0;
  let injuryRiskMultiplier = 1.0;

  if (weather === 'Lluvioso') {
    weatherPassMod = 0.92;
    weatherFoulMod = 1.15;
    weatherShotMod = 1.08;
    injuryRiskMultiplier = 1.25;
  } else if (weather === 'Tormenta') {
    weatherPassMod = 0.85;
    weatherFoulMod = 1.30;
    injuryRiskMultiplier = 1.45;
  } else if (weather === 'Calor Sofocante') {
    weatherPassMod = 0.94;
    injuryRiskMultiplier = 1.35;
  } else if (weather === 'Frío Gélido') {
    injuryRiskMultiplier = 1.40;
  }

  // 3. Possession based on Midfield dominance & team tactical styles
  const midDiff = homePower.midfield - awayPower.midfield;
  const rawHomePoss = 50 + midDiff * 0.40 + (managerDiff * 80);
  const possessionHome = Math.min(72, Math.max(28, Math.round(rawHomePoss)));
  const possessionAway = 100 - possessionHome;

  // 3b. Squad Depth, Fatigue & Calendar Congestion Modifiers
  const homeAvgFitness = homeStarters.reduce((acc, p) => acc + (p.fitness || 100), 0) / Math.max(1, homeStarters.length);
  const awayAvgFitness = awayStarters.reduce((acc, p) => acc + (p.fitness || 100), 0) / Math.max(1, awayStarters.length);
  const homeFitnessMod = 0.85 + (homeAvgFitness / 100) * 0.15;
  const awayFitnessMod = 0.85 + (awayAvgFitness / 100) * 0.15;

  // Tactical Matchup bonuses (Piedra, Papel o Tijera táctico)
  let homeTacticalBonus = 0;
  let awayTacticalBonus = 0;
  const homeStyle = homeClub.teamInstructions?.estiloJuego;
  const awayStyle = awayClub.teamInstructions?.estiloJuego;

  if (homeStyle === 'Contraataque' && (awayStyle === 'Tiki-Taka' || awayClub.tacticMentality === 'Al Ataque')) {
    homeTacticalBonus += 0.22;
  }
  if (awayStyle === 'Contraataque' && (homeStyle === 'Tiki-Taka' || homeClub.tacticMentality === 'Al Ataque')) {
    awayTacticalBonus += 0.22;
  }
  if (homeStyle === 'Bloque Bajo') {
    awayTacticalBonus -= 0.18;
  }
  if (awayStyle === 'Bloque Bajo') {
    homeTacticalBonus -= 0.18;
  }

  // 4. Mathematical Expected Goals (xG) with realistic exponent (1.18 vs old 1.70)
  // Allows underdogs to produce authentic upsets without complete randomness
  const baseAttackRate = 1.28;
  const effectiveHomeAtt = Math.max(30, homePower.attack * homeFitnessMod);
  const effectiveHomeDef = Math.max(30, homePower.defense * homeFitnessMod);
  const effectiveAwayAtt = Math.max(30, awayPower.attack * awayFitnessMod);
  const effectiveAwayDef = Math.max(30, awayPower.defense * awayFitnessMod);

  const homeAttRatio = Math.pow(effectiveHomeAtt / effectiveAwayDef, 1.18);
  const awayAttRatio = Math.pow(effectiveAwayAtt / effectiveHomeDef, 1.18);

  // Underdog motivation & surprise factor:
  // Underdogs at home receive special inspiration; top clubs can suffer complacency
  let underdogInspiration = 0;
  if (homePower.overall < awayPower.overall - 6) {
    // Underdog at home
    underdogInspiration = 0.18 + rng() * 0.25;
  } else if (awayPower.overall < homePower.overall - 6 && rng() < 0.25) {
    // Underdog away shock counter
    underdogInspiration = -(0.15 + rng() * 0.20);
  }

  const surpriseRoll = (rng() - 0.5) * 0.35; // +/- 0.175 natural variance

  const rawXgHome = Math.max(
    0.20,
    baseAttackRate * homeAttRatio * homeAdvantage + (possessionHome - 50) * 0.012 + homeTacticalBonus + underdogInspiration + surpriseRoll
  );
  const rawXgAway = Math.max(
    0.15,
    baseAttackRate * awayAttRatio / homeAdvantage + (possessionAway - 50) * 0.012 + awayTacticalBonus - underdogInspiration - surpriseRoll
  );

  const xgHome = Number(Math.max(0.12, rawXgHome).toFixed(2));
  const xgAway = Number(Math.max(0.10, rawXgAway).toFixed(2));

  // 5. Poisson Goles Generation
  let homeScore = samplePoissonGoals(xgHome, rng);
  let awayScore = samplePoissonGoals(xgAway, rng);

  // Goalkeeper quality barrier
  if (homeScore > 0 && awayPower.gk > 75 && rng() < 0.20) {
    homeScore--;
  }
  if (awayScore > 0 && homePower.gk > 75 && rng() < 0.22) {
    awayScore--;
  }

  // 6. Detailed Coherent Match Stats
  const shotsHome = Math.max(homeScore + 2, Math.round(xgHome * 6.5 + rng() * 4 * weatherShotMod));
  const shotsAway = Math.max(awayScore + 2, Math.round(xgAway * 6.2 + rng() * 4 * weatherShotMod));

  const shotsOnTargetHome = Math.max(
    homeScore,
    Math.min(shotsHome, Math.round(shotsHome * (0.32 + (homePower.attack / 250) + rng() * 0.15)))
  );
  const shotsOnTargetAway = Math.max(
    awayScore,
    Math.min(shotsAway, Math.round(shotsAway * (0.30 + (awayPower.attack / 250) + rng() * 0.15)))
  );

  const bigChancesHome = Math.max(homeScore, Math.round(xgHome * 1.3));
  const bigChancesAway = Math.max(awayScore, Math.round(xgAway * 1.3));

  const basePasses = 860;
  const passesHome = Math.round((basePasses * (possessionHome / 100)) * weatherPassMod);
  const passesAway = Math.round((basePasses * (possessionAway / 100)) * weatherPassMod);

  const passAccuracyHome = Math.round(
    Math.min(94, Math.max(68, 76 + (homePower.midfield - 60) * 0.35 * weatherPassMod))
  );
  const passAccuracyAway = Math.round(
    Math.min(94, Math.max(68, 75 + (awayPower.midfield - 60) * 0.35 * weatherPassMod))
  );

  const foulsHome = Math.max(4, Math.round((9 + rng() * 7) * weatherFoulMod));
  const foulsAway = Math.max(4, Math.round((10 + rng() * 7) * weatherFoulMod));

  const cornersHome = Math.max(1, Math.round(shotsHome * 0.45 + rng() * 3));
  const cornersAway = Math.max(1, Math.round(shotsAway * 0.42 + rng() * 2));

  const offsidesHome = Math.round(rng() * 4);
  const offsidesAway = Math.round(rng() * 4);

  // Cards
  const yellowCardsHome = Math.max(0, Math.floor(foulsHome * 0.18 + rng() * 1.2));
  const yellowCardsAway = Math.max(0, Math.floor(foulsAway * 0.19 + rng() * 1.2));
  const redCardsHome = rng() < 0.03 ? 1 : 0;
  const redCardsAway = rng() < 0.03 ? 1 : 0;

  // 7. Event & Timeline generation
  const events: MatchEvent[] = [];
  const updatedPlayers: Record<string, Partial<Player>> = {};

  // Scorers for Home
  for (let g = 0; g < homeScore; g++) {
    const minute = Math.floor(rng() * 90) + 1;
    const isPenalty = rng() < 0.12;
    const specialistId = homeClub.setPieceTakers?.penaltyTakerId;
    const penaltyTaker = specialistId ? playersMap[specialistId] : null;

    const attackers = homeStarters.filter((p) => ['DC', 'ED', 'EI', 'MCO', 'MC'].includes(p.primaryPosition));
    const scorer = isPenalty && penaltyTaker ? penaltyTaker : (attackers.length > 0 ? attackers[Math.floor(rng() * attackers.length)] : homeStarters[0]);

    if (scorer) {
      events.push({
        minute,
        type: isPenalty ? 'GOL_PENALTI' : 'GOL',
        teamId: homeClub.id,
        playerId: scorer.id,
        description: isPenalty
          ? `¡GOL DE PENALTI! Definición impecable desde los 11 metros de ${scorer.lastName}.`
          : `¡GOOOL! Gran jugada colectiva culminada por ${scorer.firstName} ${scorer.lastName}.`,
      });

      if (!updatedPlayers[scorer.id]) {
        updatedPlayers[scorer.id] = { seasonStats: { ...(scorer.seasonStats || { goals: 0, matchesPlayed: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 7 }) } };
      }
      const st = updatedPlayers[scorer.id].seasonStats!;
      st.goals = (st.goals || 0) + 1;
    }
  }

  // Scorers for Away
  for (let g = 0; g < awayScore; g++) {
    const minute = Math.floor(rng() * 90) + 1;
    const isPenalty = rng() < 0.12;
    const specialistId = awayClub.setPieceTakers?.penaltyTakerId;
    const penaltyTaker = specialistId ? playersMap[specialistId] : null;

    const attackers = awayStarters.filter((p) => ['DC', 'ED', 'EI', 'MCO', 'MC'].includes(p.primaryPosition));
    const scorer = isPenalty && penaltyTaker ? penaltyTaker : (attackers.length > 0 ? attackers[Math.floor(rng() * attackers.length)] : awayStarters[0]);

    if (scorer) {
      events.push({
        minute,
        type: isPenalty ? 'GOL_PENALTI' : 'GOL',
        teamId: awayClub.id,
        playerId: scorer.id,
        description: isPenalty
          ? `¡GOL DE PENALTI! ${scorer.lastName} no perdona desde el punto fatídico.`
          : `¡GOOOL! Disparo inapelable de ${scorer.firstName} ${scorer.lastName} para perforar la red.`,
      });

      if (!updatedPlayers[scorer.id]) {
        updatedPlayers[scorer.id] = { seasonStats: { ...(scorer.seasonStats || { goals: 0, matchesPlayed: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 7 }) } };
      }
      const st = updatedPlayers[scorer.id].seasonStats!;
      st.goals = (st.goals || 0) + 1;
    }
  }

  // Yellow Cards distribution & tracking
  const assignCards = (count: number, starters: Player[], teamId: string) => {
    for (let c = 0; c < count; c++) {
      const p = starters[Math.floor(rng() * starters.length)];
      if (p) {
        events.push({
          minute: Math.floor(rng() * 88) + 2,
          type: 'TARJETA_AMARILLA',
          teamId,
          playerId: p.id,
          description: `Tarjeta amarilla para ${p.lastName} por reiteración de faltas.`,
        });

        if (!updatedPlayers[p.id]) {
          updatedPlayers[p.id] = { seasonStats: { ...(p.seasonStats || { goals: 0, matchesPlayed: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 7 }) } };
        }
        const st = updatedPlayers[p.id].seasonStats!;
        st.yellowCards = (st.yellowCards || 0) + 1;

        // Card cycle check: every 5 yellow cards -> 1 match suspension
        const currentAcc = (p.yellowCardAccumulation || 0) + 1;
        updatedPlayers[p.id].yellowCardAccumulation = currentAcc;
        if (currentAcc % 5 === 0) {
          updatedPlayers[p.id].isSuspended = true;
          updatedPlayers[p.id].suspensionMatchesLeft = 1;
        }
      }
    }
  };

  assignCards(yellowCardsHome, homeStarters, homeClub.id);
  assignCards(yellowCardsAway, awayStarters, awayClub.id);

  // Red cards distribution & immediate ban
  if (redCardsHome > 0 && homeStarters.length > 0) {
    const p = homeStarters[Math.floor(rng() * homeStarters.length)];
    if (p) {
      events.push({
        minute: Math.floor(rng() * 70) + 20,
        type: 'TARJETA_ROJA',
        teamId: homeClub.id,
        playerId: p.id,
        description: `¡EXPULSIÓN! Tarjeta roja directa para ${p.firstName} ${p.lastName}.`,
      });
      if (!updatedPlayers[p.id]) {
        updatedPlayers[p.id] = { seasonStats: { ...(p.seasonStats || { goals: 0, matchesPlayed: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 7 }) } };
      }
      updatedPlayers[p.id].seasonStats!.redCards = (updatedPlayers[p.id].seasonStats!.redCards || 0) + 1;
      updatedPlayers[p.id].isSuspended = true;
      updatedPlayers[p.id].suspensionMatchesLeft = 2; // 2 match suspension
    }
  }

  if (redCardsAway > 0 && awayStarters.length > 0) {
    const p = awayStarters[Math.floor(rng() * awayStarters.length)];
    if (p) {
      events.push({
        minute: Math.floor(rng() * 70) + 20,
        type: 'TARJETA_ROJA',
        teamId: awayClub.id,
        playerId: p.id,
        description: `¡EXPULSIÓN! Tarjeta roja directa para ${p.firstName} ${p.lastName}.`,
      });
      if (!updatedPlayers[p.id]) {
        updatedPlayers[p.id] = { seasonStats: { ...(p.seasonStats || { goals: 0, matchesPlayed: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 7 }) } };
      }
      updatedPlayers[p.id].seasonStats!.redCards = (updatedPlayers[p.id].seasonStats!.redCards || 0) + 1;
      updatedPlayers[p.id].isSuspended = true;
      updatedPlayers[p.id].suspensionMatchesLeft = 2;
    }
  }

  // 8. Injuries generation (influenced by fatigue, age & weather)
  const allMatchStarters = [...homeStarters, ...awayStarters];
  allMatchStarters.forEach((p) => {
    // Base 1.5% chance per player per match, multiplied by conditions
    const fatigueFactor = p.fitness < 70 ? 2.8 : p.fitness < 82 ? 1.6 : 1.0;
    const ageFactor = p.age >= 32 ? 1.8 : p.age <= 21 ? 0.8 : 1.1;
    const injuryChance = 0.012 * fatigueFactor * ageFactor * injuryRiskMultiplier;

    if (rng() < injuryChance) {
      const injuryTypes = [
        { name: 'Sobrecarga en los isquiotibiales', weeks: 1 },
        { name: 'Rotura fibrilar en el gemelo', weeks: 3 },
        { name: 'Esguince de tobillo de grado II', weeks: 4 },
        { name: 'Distensión de ligamentos', weeks: 6 },
      ];
      const selectedInjury = injuryTypes[Math.floor(rng() * injuryTypes.length)];

      events.push({
        minute: Math.floor(rng() * 80) + 10,
        type: 'LESION',
        teamId: p.clubId || homeClub.id,
        playerId: p.id,
        description: `Lesión de ${p.firstName} ${p.lastName}: ${selectedInjury.name} (${selectedInjury.weeks} semanas de baja).`,
      });

      if (!updatedPlayers[p.id]) {
        updatedPlayers[p.id] = {};
      }
      updatedPlayers[p.id].isInjured = true;
      updatedPlayers[p.id].injuryName = selectedInjury.name;
      updatedPlayers[p.id].injuryWeeksLeft = selectedInjury.weeks;
      updatedPlayers[p.id].fitness = Math.max(30, (p.fitness || 85) - 35);
    }
  });

  // 9. Process disciplinary suspension service:
  // Players of both clubs who entered this match suspended sit out and serve 1 match of suspension.
  const allClubPlayerIds = [...(homeClub.playerIds || []), ...(awayClub.playerIds || [])];
  allClubPlayerIds.forEach((pid) => {
    const pl = playersMap[pid];
    // Check if player entered match suspended (and didn't just receive a red card in this match)
    if (pl && pl.isSuspended && !events.some((e) => e.playerId === pid && e.type === 'TARJETA_ROJA')) {
      const left = Math.max(0, (pl.suspensionMatchesLeft || 1) - 1);
      if (!updatedPlayers[pid]) {
        updatedPlayers[pid] = {};
      }
      updatedPlayers[pid].suspensionMatchesLeft = left;
      updatedPlayers[pid].isSuspended = left > 0;
    }
  });

  // Sort events chronologically
  events.sort((a, b) => a.minute - b.minute);

  const stats: MatchStats = {
    possessionHome,
    possessionAway,
    xgHome,
    xgAway,
    shotsHome,
    shotsAway,
    shotsOnTargetHome,
    shotsOnTargetAway,
    bigChancesHome,
    bigChancesAway,
    passesHome,
    passesAway,
    passAccuracyHome,
    passAccuracyAway,
    foulsHome,
    foulsAway,
    cornersHome,
    cornersAway,
    offsidesHome,
    offsidesAway,
    yellowCardsHome,
    yellowCardsAway,
    redCardsHome,
    redCardsAway,
  };

  const updatedMatch: Match = {
    ...match,
    played: true,
    homeScore,
    awayScore,
    weather,
    temperature,
    attendance: homeClub.stadium?.capacity ? Math.round(homeClub.stadium.capacity * (0.65 + rng() * 0.32)) : 12000,
    ticketRevenue: homeClub.stadium?.ticketPrice ? Math.round((homeClub.stadium.capacity || 10000) * 0.7 * homeClub.stadium.ticketPrice) : 80000,
    events,
    stats,
  };

  return {
    match: updatedMatch,
    updatedPlayers,
    homeScore,
    awayScore,
    events,
    stats,
  };
}

/**
 * Updates competition standings applying official tiebreaker criteria:
 * 1. Points
 * 2. Goal difference (Diferencia de goles)
 * 3. Goals scored (Goles a favor)
 * 4. Alphabetical / Head-to-head fallback
 */
export function updateCompetitionStandings(
  standings: StandingsRow[],
  match: Match
): StandingsRow[] {
  if (!match.played || match.homeScore === undefined || match.awayScore === undefined) {
    return standings;
  }

  const updated = standings.map((r) => ({ ...r, recentForm: [...r.recentForm] }));
  const homeRow = updated.find((r) => r.teamId === match.homeTeamId);
  const awayRow = updated.find((r) => r.teamId === match.awayTeamId);

  if (!homeRow || !awayRow) return standings;

  homeRow.played += 1;
  awayRow.played += 1;

  homeRow.goalsFor += match.homeScore;
  homeRow.goalsAgainst += match.awayScore;
  homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;

  awayRow.goalsFor += match.awayScore;
  awayRow.goalsAgainst += match.homeScore;
  awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;

  if (match.homeScore > match.awayScore) {
    homeRow.won += 1;
    homeRow.points += 3;
    homeRow.recentForm.unshift('V');

    awayRow.lost += 1;
    awayRow.recentForm.unshift('D');
  } else if (match.homeScore < match.awayScore) {
    awayRow.won += 1;
    awayRow.points += 3;
    awayRow.recentForm.unshift('V');

    homeRow.lost += 1;
    homeRow.recentForm.unshift('D');
  } else {
    homeRow.drawn += 1;
    homeRow.points += 1;
    homeRow.recentForm.unshift('E');

    awayRow.drawn += 1;
    awayRow.points += 1;
    awayRow.recentForm.unshift('E');
  }

  if (homeRow.recentForm.length > 5) homeRow.recentForm.pop();
  if (awayRow.recentForm.length > 5) awayRow.recentForm.pop();

  return updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

/**
 * Simulates ALL active competitions across the world up to targetDate.
 * Non-user matches are simulated automatically, updating league tables,
 * top scorers, fitness, injuries and disciplinary records worldwide.
 */
export function simulateWorldMatchday(
  gameSave: GameSave,
  targetDate: string,
  userMatchResult?: { matchId: string; match: Match; updatedPlayers: Record<string, Partial<Player>> }
): {
  updatedSave: GameSave;
  summary: WorldMatchdaySummary;
} {
  const updatedCompetitions = { ...gameSave.competitions };
  const updatedClubs = { ...gameSave.clubs };
  const updatedPlayers = { ...gameSave.players };
  const affectedCompetitionsSet = new Set<string>();
  const topEvents: WorldMatchdaySummary['topEvents'] = [];

  let simulatedCount = 0;
  let newInjuriesCount = 0;
  let newSuspensionsCount = 0;

  // If user played a match, incorporate it first
  if (userMatchResult) {
    Object.keys(userMatchResult.updatedPlayers).forEach((pid) => {
      if (updatedPlayers[pid]) {
        updatedPlayers[pid] = {
          ...updatedPlayers[pid],
          ...userMatchResult.updatedPlayers[pid],
        };
      }
    });
  }

  // Iterate over every competition in the universe
  Object.keys(updatedCompetitions).forEach((compId) => {
    const comp = updatedCompetitions[compId];
    let compMatches = [...comp.matches];
    let compStandings = [...comp.standings];
    let compChanged = false;

    compMatches = compMatches.map((m) => {
      // If match was already simulated as the user's match
      if (userMatchResult && m.id === userMatchResult.matchId) {
        compStandings = updateCompetitionStandings(compStandings, userMatchResult.match);
        compChanged = true;
        affectedCompetitionsSet.add(comp.shortName || comp.name);
        return userMatchResult.match;
      }

      // Check if match is scheduled on or before targetDate and has NOT been played yet
      // Also do not simulate if it's the user's club match and no user result was provided
      const isUserMatch = m.homeTeamId === gameSave.userClubId || m.awayTeamId === gameSave.userClubId;
      if (!m.played && m.date <= targetDate && !isUserMatch) {
        const homeClub = updatedClubs[m.homeTeamId];
        const awayClub = updatedClubs[m.awayTeamId];

        if (homeClub && awayClub) {
          const sim = simulateWorldMatch(m, homeClub, awayClub, updatedPlayers);

          // Update player delta records
          Object.keys(sim.updatedPlayers).forEach((pid) => {
            if (updatedPlayers[pid]) {
              if (sim.updatedPlayers[pid].isInjured) newInjuriesCount++;
              if (sim.updatedPlayers[pid].isSuspended) newSuspensionsCount++;

              updatedPlayers[pid] = {
                ...updatedPlayers[pid],
                ...sim.updatedPlayers[pid],
                seasonStats: {
                  ...(updatedPlayers[pid].seasonStats || { goals: 0, matchesPlayed: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, averageRating: 7 }),
                  ...(sim.updatedPlayers[pid].seasonStats || {}),
                },
              };
            }
          });

          compStandings = updateCompetitionStandings(compStandings, sim.match);
          compChanged = true;
          simulatedCount++;
          affectedCompetitionsSet.add(comp.shortName || comp.name);

          // Track sensational high-scoring or derby match highlights
          if (sim.homeScore + sim.awayScore >= 4 || sim.match.events?.some((e) => e.type === 'TARJETA_ROJA')) {
            topEvents.push({
              matchday: sim.match.matchday,
              competitionName: comp.shortName || comp.name,
              headline: `${homeClub.shortName} ${sim.homeScore}-${sim.awayScore} ${awayClub.shortName}`,
              score: `${sim.homeScore} - ${sim.awayScore}`,
            });
          }

          return sim.match;
        }
      }

      return m;
    });

    if (compChanged) {
      // Recalculate current matchday based on progress
      const playedCount = compMatches.filter((m) => m.played).length;
      const clubsCount = comp.clubIds.length || 20;
      const matchesPerRound = Math.floor(clubsCount / 2);
      const computedMatchday = Math.min(
        comp.totalMatchdays || 38,
        Math.floor(playedCount / Math.max(1, matchesPerRound)) + 1
      );

      updatedCompetitions[compId] = {
        ...comp,
        currentMatchday: computedMatchday,
        matches: compMatches,
        standings: compStandings,
      };
    }
  });

  const updatedSave: GameSave = {
    ...gameSave,
    competitions: updatedCompetitions,
    clubs: updatedClubs,
    players: updatedPlayers,
  };

  return {
    updatedSave,
    summary: {
      simulatedMatchesCount: simulatedCount,
      competitionsAffected: Array.from(affectedCompetitionsSet),
      topEvents: topEvents.slice(0, 6),
      newInjuriesCount,
      newSuspensionsCount,
    },
  };
}

/**
 * Club long-term dynamic evolution (FASE 6):
 * Simulates financial, reputation, and squad tier changes at the end of seasons.
 * Modest clubs that overperform climb up, and historic clubs that collapse fall.
 */
export function simulateClubsDynamicEvolution(clubs: Record<string, Club>, competitions: Record<string, Competition>): Record<string, Club> {
  const updatedClubs = { ...clubs };

  Object.values(competitions).forEach((comp) => {
    if (comp.standings && comp.standings.length > 0) {
      const championId = comp.standings[0]?.teamId;
      const runnerUpId = comp.standings[1]?.teamId;
      const relegatedIds = comp.standings.slice(-comp.relegationSlots).map((r) => r.teamId);

      // Champion gains massive prestige & budget
      if (championId && updatedClubs[championId]) {
        const c = updatedClubs[championId];
        updatedClubs[championId] = {
          ...c,
          reputation: Math.min(99, c.reputation + 4),
          boardConfidence: Math.min(100, c.boardConfidence + 15),
          finances: {
            ...c.finances,
            balance: c.finances.balance + (comp.tier === 1 ? 15000000 : 3000000),
            transferBudget: c.finances.transferBudget + (comp.tier === 1 ? 8000000 : 1500000),
          },
        };
      }

      // Relegated teams take a financial & reputation hit
      relegatedIds.forEach((rid) => {
        if (updatedClubs[rid]) {
          const c = updatedClubs[rid];
          updatedClubs[rid] = {
            ...c,
            reputation: Math.max(25, c.reputation - 6),
            boardConfidence: Math.max(30, c.boardConfidence - 20),
            finances: {
              ...c.finances,
              balance: Math.max(50000, c.finances.balance - 2000000),
              transferBudget: Math.max(0, Math.round(c.finances.transferBudget * 0.6)),
            },
          };
        }
      });
    }
  });

  return updatedClubs;
}
