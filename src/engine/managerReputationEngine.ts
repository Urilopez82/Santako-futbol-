import { GameSave, NewsItem } from '../types/game';
import { Club } from '../types/club';
import { Manager, JobOffer } from '../types/game';
import { generateJobOffers } from './managerCareerEngine';
import { getAllSeasonFixturesForClub } from './internationalCompetitionsEngine';

export interface ReputationEvaluationResult {
  updatedSave: GameSave;
  reputationGained: number;
  newOffersGenerated: boolean;
  alertNews?: NewsItem;
}

/**
 * Calculates real dynamic manager and club reputation & ELO based on:
 * - Current consecutive win streak (e.g. 5, 10, 15, 20 consecutive wins)
 * - League standing (1st place leader bonus)
 * - Cup tournament progress (Semifinalist / Finalist bonus)
 * - Trophies won & historical win percentage
 */
export function evaluateDynamicReputationAndSuccess(
  save: GameSave,
  userWonLastMatch: boolean = false,
  isDrawLastMatch: boolean = false,
  isCupMatch: boolean = false,
  matchWasPlayed: boolean = false
): ReputationEvaluationResult {
  const manager = { ...save.manager };
  let userClub = save.clubs?.[save.userClubId];
  if (!userClub && save.clubs) {
    userClub = Object.values(save.clubs).find(c => c.name?.toLowerCase().includes(save.metadata?.clubName?.toLowerCase() || '')) || Object.values(save.clubs)[0];
  }
  if (!userClub) {
    return { updatedSave: save, reputationGained: 0, newOffersGenerated: false };
  }

  const updatedClub = { ...userClub };
  const prevManagerRep = manager.reputation || 50;
  const prevClubRep = updatedClub.reputation || 60;

  // 1. Update Career Stats ONLY when a match was actually played
  const currentCareer = {
    matchesManaged: (manager.careerStats?.matchesManaged || 0) + (matchWasPlayed ? 1 : 0),
    won: (manager.careerStats?.won || 0) + (matchWasPlayed && userWonLastMatch ? 1 : 0),
    drawn: (manager.careerStats?.drawn || 0) + (matchWasPlayed && isDrawLastMatch ? 1 : 0),
    lost: (manager.careerStats?.lost || 0) + (matchWasPlayed && !userWonLastMatch && !isDrawLastMatch ? 1 : 0),
    goalsFor: manager.careerStats?.goalsFor || 0,
    goalsAgainst: manager.careerStats?.goalsAgainst || 0,
    titlesWon: manager.careerStats?.titlesWon || 0,
    promotions: manager.careerStats?.promotions || 0,
    sacksCount: manager.careerStats?.sacksCount || 0,
    resignationsCount: manager.careerStats?.resignationsCount || 0,
  };

  // 2. Track Real Streak from ALL user club matches across all competitions (League + Cup + Champions)
  let calculatedWinStreak = 0;
  let calculatedUnbeatenStreak = 0;

  try {
    const allPlayedFixtures = getAllSeasonFixturesForClub(save, userClub.id)
      .filter((f) => f.played)
      .sort((a, b) => b.date.localeCompare(a.date));

    for (const f of allPlayedFixtures) {
      const isHome = f.homeTeamId === userClub.id;
      const userScore = isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
      const rivalScore = isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);

      if (userScore > rivalScore) {
        calculatedWinStreak++;
        calculatedUnbeatenStreak++;
      } else if (userScore === rivalScore) {
        calculatedUnbeatenStreak++;
        break;
      } else {
        break;
      }
    }
  } catch (err) {
    console.warn('Error calculating win streak from fixtures:', err);
  }

  // Also check League Standings for user's club
  const primaryComp = save.competitions[userClub.divisionId] || Object.values(save.competitions)[0];
  let isLeagueLeader = false;
  let leagueWins = 0;

  if (primaryComp && primaryComp.standings) {
    const sortedStandings = [...primaryComp.standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    const userStanding = sortedStandings.find((s) => s.teamId === userClub.id);
    if (userStanding) {
      leagueWins = userStanding.won || 0;
      if (sortedStandings[0]?.teamId === userClub.id) {
        isLeagueLeader = true;
      }
    }
  }

  // If user has 20 wins in league or streak, ensure streak reflects this!
  calculatedWinStreak = Math.max(calculatedWinStreak, leagueWins >= 20 ? 20 : leagueWins >= 15 ? 15 : leagueWins >= 10 ? 10 : calculatedWinStreak);

  // If user just won, streak is at least what was calculated or minimum 1
  if (userWonLastMatch) {
    calculatedWinStreak = Math.max(calculatedWinStreak, 1);
  }

  // 3. Check Copa / International Cup standing (Finalist / Semifinalist)
  let isCopaFinalist = false;
  let isCopaSemiFinalist = false;

  if (save.cupTournaments) {
    Object.values(save.cupTournaments).forEach((tourn) => {
      if (!tourn?.matches) return;
      const finalMatch = tourn.matches.find((m) => m.roundName?.includes('Gran Final') || m.roundName?.includes('Final'));
      if (finalMatch && (finalMatch.homeTeamId === userClub.id || finalMatch.awayTeamId === userClub.id)) {
        isCopaFinalist = true;
      }
      const semiMatch = tourn.matches.find((m) => m.roundName?.includes('Semifinal') || m.roundName?.includes('Semifinales'));
      if (semiMatch && (semiMatch.homeTeamId === userClub.id || semiMatch.awayTeamId === userClub.id)) {
        isCopaSemiFinalist = true;
      }
    });
  }

  // 4. Calculate Target Manager Reputation & ELO
  // Base reputation from division
  let baseTargetRep = 72; // Default for Tier 2 (LaLiga Hypermotion / Segunda)
  const divId = userClub.divisionId || '';
  if (divId.includes('tier1') || divId.includes('laliga_ea') || divId === 'esp_tier1') {
    baseTargetRep = 82;
  } else if (divId.includes('tier2') || divId.includes('hypermotion') || divId === 'esp_tier2') {
    baseTargetRep = 72;
  } else if (divId.includes('tier3') || divId.includes('rfef') || divId.includes('primera_rfef')) {
    baseTargetRep = 58;
  } else if (divId.includes('tier4') || divId.includes('segunda_rfef')) {
    baseTargetRep = 48;
  } else if (divId.includes('tier5') || divId.includes('tercera_rfef')) {
    baseTargetRep = 40;
  }

  // Streak bonuses: Massive prestige for 5, 10, 15, 20 consecutive wins!
  let streakRepBonus = 0;
  if (calculatedWinStreak >= 20) {
    streakRepBonus = 20;
  } else if (calculatedWinStreak >= 15) {
    streakRepBonus = 15;
  } else if (calculatedWinStreak >= 10) {
    streakRepBonus = 10;
  } else if (calculatedWinStreak >= 5) {
    streakRepBonus = 6;
  } else if (calculatedWinStreak >= 3) {
    streakRepBonus = 3;
  }

  // Leader bonus: commanding lead in the league
  const leaderBonus = isLeagueLeader ? 8 : 0;

  // Cup bonus: Reaching the Final or Semifinals
  const cupBonus = isCopaFinalist ? 14 : isCopaSemiFinalist ? 7 : 0;

  // Calculate target reputation
  let targetManagerRep = Math.min(99, Math.max(prevManagerRep, baseTargetRep + streakRepBonus + leaderBonus + cupBonus));

  // If user has 20 wins or is Copa Finalist, ensure manager rep is at least 92-96!
  if (calculatedWinStreak >= 20 || (isLeagueLeader && isCopaFinalist)) {
    targetManagerRep = Math.max(targetManagerRep, 94);
  } else if (calculatedWinStreak >= 15 || isCopaFinalist) {
    targetManagerRep = Math.max(targetManagerRep, 89);
  } else if (calculatedWinStreak >= 10 || isLeagueLeader) {
    targetManagerRep = Math.max(targetManagerRep, 84);
  }

  // Calculate dynamic ELO (Chess/FIFA manager scale: 1200 base to 2400+ Grandmaster)
  const dynamicElo = Math.round(1200 + targetManagerRep * 12 + calculatedWinStreak * 5);

  // Club reputation also rises dynamically with sporting triumphs!
  let targetClubRep = prevClubRep;
  if (isLeagueLeader) targetClubRep = Math.max(targetClubRep, 75);
  if (isCopaFinalist) targetClubRep = Math.max(targetClubRep, 80);
  if (calculatedWinStreak >= 15) targetClubRep = Math.max(targetClubRep, 78);
  if (calculatedWinStreak >= 20) targetClubRep = Math.max(targetClubRep, 84);

  // Board confidence climbs to 100% maximum
  const newBoardConfidence = Math.min(100, Math.max(userClub.boardConfidence || 75, 85 + calculatedWinStreak));

  updatedClub.reputation = targetClubRep;
  updatedClub.boardConfidence = newBoardConfidence;

  manager.reputation = targetManagerRep;
  // Store dynamic ELO directly in manager object
  (manager as any).elo = dynamicElo;
  manager.careerStats = currentCareer;

  // 5. Generate Celebration News on milestone streaks or cup finals
  let alertNews: NewsItem | undefined;
  if (calculatedWinStreak >= 10 && !save.news.some((n) => n.title.includes(`${calculatedWinStreak} VICTORIAS CONSECUTIVAS`))) {
    alertNews = {
      id: `rep_streak_${Date.now()}`,
      date: save.currentDate,
      title: `¡PORTADA NACIONAL: ${calculatedWinStreak} VICTORIAS CONSECUTIVAS DE ${userClub.name.toUpperCase()}!`,
      content: `El fútbol mundial se rinde ante la obra de ${manager.firstName} ${manager.lastName}. El ${userClub.name} encadena una racha histórica de ${calculatedWinStreak} triunfos seguidos. El ELO del míster sube a ${dynamicElo} puntos (Reputación: ${targetManagerRep}/100) y los gigantes de Primera División y Europa preparan ofertas irrechazables.`,
      category: 'ENTRENADOR',
      read: false,
    };
  } else if (isCopaFinalist && !save.news.some((n) => n.title.includes('FINALISTA DE COPA'))) {
    alertNews = {
      id: `rep_copa_final_${Date.now()}`,
      date: save.currentDate,
      title: `¡HISTÓRICO: ${userClub.name.toUpperCase()} CLASIFICADO PARA LA GRAN FINAL DE COPA!`,
      content: `¡Hazaña colosal! ${userClub.name} disputará el título copero. La directiva y la afición ovacionan a ${manager.firstName} ${manager.lastName}, catalogado ya entre los técnicos más cotizados de Europa (ELO: ${dynamicElo} · Reputación: ${targetManagerRep}/100).`,
      category: 'ENTRENADOR',
      read: false,
    };
  }

  // 6. Dynamic Job Offers Refresh: ALWAYS PURGE STALE OFFERS and inject prestigious proposals!
  let freshOffers: JobOffer[] = [...(save.jobOffers || [])];
  let newOffersGenerated = false;

  // Clean out stale offers: purge offers with no offeredDate (legacy saves from 10 seasons ago) or older than 30 days
  const curDateMs = new Date(save.currentDate).getTime() || Date.now();
  freshOffers = freshOffers.filter((o) => {
    if (o.status !== 'PENDIENTE') return false;
    if (!o.offeredDate) return false; // Purge legacy 10-season-old undated offers
    const offerMs = new Date(o.offeredDate).getTime();
    const diffDays = (curDateMs - offerMs) / (1000 * 60 * 60 * 24);
    if (diffDays > 30 || diffDays < -1) return false;
    return true;
  });

  // If manager reputation is high, streak is strong, cup finalist, or offers are low, generate fresh elite offers
  if (targetManagerRep >= 75 || calculatedWinStreak >= 5 || isCopaFinalist || freshOffers.length < 3) {
    const updatedSaveTemp: GameSave = {
      ...save,
      manager,
      clubs: { ...save.clubs, [userClub.id]: updatedClub },
    };
    const incomingOffers = generateJobOffers(manager, updatedSaveTemp, 6);

    // Filter incoming so they match current elite standing
    const existingClubKeys = new Set(freshOffers.map((o) => o.clubId || o.clubName));
    const newUnique = incomingOffers.filter((o) => !existingClubKeys.has(o.clubId || o.clubName));

    if (newUnique.length > 0) {
      // Put prestigious offers at the front
      freshOffers = [...newUnique, ...freshOffers].slice(0, 8);
      newOffersGenerated = true;
    }
  }

  const updatedSave: GameSave = {
    ...save,
    manager,
    clubs: {
      ...save.clubs,
      [userClub.id]: updatedClub,
    },
    jobOffers: freshOffers,
    news: alertNews ? [alertNews, ...save.news] : save.news,
  };

  return {
    updatedSave,
    reputationGained: targetManagerRep - prevManagerRep,
    newOffersGenerated,
    alertNews,
  };
}
