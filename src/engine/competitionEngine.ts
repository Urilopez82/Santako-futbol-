import { Competition, Match, StandingsRow } from '../types/competition';

export function updateStandingsWithMatch(
  currentStandings: StandingsRow[],
  match: Match
): StandingsRow[] {
  if (!match.played || match.homeScore === undefined || match.awayScore === undefined) {
    return currentStandings;
  }

  const updated = currentStandings.map((row) => ({ ...row, recentForm: [...row.recentForm] }));

  const homeRow = updated.find((r) => r.teamId === match.homeTeamId);
  const awayRow = updated.find((r) => r.teamId === match.awayTeamId);

  if (!homeRow || !awayRow) return currentStandings;

  homeRow.played += 1;
  awayRow.played += 1;

  homeRow.goalsFor += match.homeScore;
  homeRow.goalsAgainst += match.awayScore;
  homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;

  awayRow.goalsFor += match.awayScore;
  awayRow.goalsAgainst += match.homeScore;
  awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;

  if (match.homeScore > match.awayScore) {
    // Home Win
    homeRow.won += 1;
    homeRow.points += 3;
    homeRow.recentForm.unshift('V');

    awayRow.lost += 1;
    awayRow.recentForm.unshift('D');
  } else if (match.homeScore < match.awayScore) {
    // Away Win
    awayRow.won += 1;
    awayRow.points += 3;
    awayRow.recentForm.unshift('V');

    homeRow.lost += 1;
    homeRow.recentForm.unshift('D');
  } else {
    // Draw
    homeRow.drawn += 1;
    homeRow.points += 1;
    homeRow.recentForm.unshift('E');

    awayRow.drawn += 1;
    awayRow.points += 1;
    awayRow.recentForm.unshift('E');
  }

  // Keep last 5 matches in recent form
  if (homeRow.recentForm.length > 5) homeRow.recentForm.pop();
  if (awayRow.recentForm.length > 5) awayRow.recentForm.pop();

  // Sort standings: Points desc -> Goal Difference desc -> Goals For desc
  return updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

// Generate next season's schedule keeping the evolved clubs
export function generateNextSeasonSchedule(
  competition: Competition,
  nextSeasonLabel: string,
  startYear: number
): { matches: Match[]; standings: StandingsRow[] } {
  const matches: Match[] = [];
  const clubIds = competition.clubIds;
  const n = clubIds.length;
  const halfRounds = n - 1;

  for (let round = 0; round < halfRounds; round++) {
    const matchday = round + 1;
    const baseDate = new Date(`${startYear}-08-22`);
    baseDate.setDate(baseDate.getDate() + round * 7);
    const dateStr = baseDate.toISOString().slice(0, 10);

    for (let i = 0; i < n / 2; i++) {
      const homeIdx = (round + i) % (n - 1);
      let awayIdx = (n - 1 - i + round) % (n - 1);
      if (i === 0) awayIdx = n - 1;

      matches.push({
        id: `match_${competition.id}_s${startYear}_j${matchday}_${i + 1}`,
        competitionId: competition.id,
        matchday,
        date: dateStr,
        homeTeamId: clubIds[homeIdx],
        awayTeamId: clubIds[awayIdx],
        played: false,
      });
    }
  }

  // Second half (Vuelta)
  for (let round = 0; round < halfRounds; round++) {
    const matchday = halfRounds + round + 1;
    const baseDate = new Date(`${startYear}-08-22`);
    baseDate.setDate(baseDate.getDate() + (halfRounds + round) * 7);
    const dateStr = baseDate.toISOString().slice(0, 10);

    const firstHalfMatches = matches.filter((m) => m.matchday === round + 1);
    firstHalfMatches.forEach((fhm, idx) => {
      matches.push({
        id: `match_${competition.id}_s${startYear}_j${matchday}_${idx + 1}`,
        competitionId: competition.id,
        matchday,
        date: dateStr,
        homeTeamId: fhm.awayTeamId,
        awayTeamId: fhm.homeTeamId,
        played: false,
      });
    });
  }

  const standings: StandingsRow[] = clubIds.map((tid) => ({
    teamId: tid,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    recentForm: [],
  }));

  return { matches, standings };
}
