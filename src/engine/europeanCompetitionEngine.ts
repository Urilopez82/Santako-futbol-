import { Club } from '../types/club';
import { Match, MatchEvent, MatchStats } from '../types/competition';
import { Player } from '../types/player';
import { 
  EuropeanLeaguePhaseState, 
  EuropeanLeagueTeamEntry 
} from '../types/regulations';
import { samplePoissonGoals } from './worldSimulationEngine';

/**
 * 36 Elite European clubs catalog for the Swiss Model League Phase
 */
export const UEFA_CHAMPIONS_LEAGUE_36_CLUBS = [
  // Bombo 1 (Cabezas de serie)
  { id: 'rma', name: 'Real Madrid CF', country: 'ESP', pot: 1 as const },
  { id: 'mci', name: 'Manchester City', country: 'ENG', pot: 1 as const },
  { id: 'fcb', name: 'FC Barcelona', country: 'ESP', pot: 1 as const },
  { id: 'bay', name: 'Bayern München', country: 'GER', pot: 1 as const },
  { id: 'psg', name: 'Paris Saint-Germain', country: 'FRA', pot: 1 as const },
  { id: 'liv', name: 'Liverpool FC', country: 'ENG', pot: 1 as const },
  { id: 'int', name: 'Inter de Milán', country: 'ITA', pot: 1 as const },
  { id: 'dor', name: 'Borussia Dortmund', country: 'GER', pot: 1 as const },
  { id: 'rbl', name: 'RB Leipzig', country: 'GER', pot: 1 as const },

  // Bombo 2
  { id: 'b04', name: 'Bayer 04 Leverkusen', country: 'GER', pot: 2 as const },
  { id: 'atm', name: 'Atlético de Madrid', country: 'ESP', pot: 2 as const },
  { id: 'ata', name: 'Atalanta BC', country: 'ITA', pot: 2 as const },
  { id: 'juv', name: 'Juventus FC', country: 'ITA', pot: 2 as const },
  { id: 'ben', name: 'SL Benfica', country: 'POR', pot: 2 as const },
  { id: 'ars', name: 'Arsenal FC', country: 'ENG', pot: 2 as const },
  { id: 'bru', name: 'Club Brugge', country: 'BEL', pot: 2 as const },
  { id: 'shk', name: 'Shakhtar Donetsk', country: 'UKR', pot: 2 as const },
  { id: 'acm', name: 'AC Milan', country: 'ITA', pot: 2 as const },

  // Bombo 3
  { id: 'fey', name: 'Feyenoord', country: 'NED', pot: 3 as const },
  { id: 'spo', name: 'Sporting CP', country: 'POR', pot: 3 as const },
  { id: 'psv', name: 'PSV Eindhoven', country: 'NED', pot: 3 as const },
  { id: 'dzg', name: 'Dinamo Zagreb', country: 'CRO', pot: 3 as const },
  { id: 'sal', name: 'Red Bull Salzburg', country: 'AUT', pot: 3 as const },
  { id: 'lil', name: 'LOSC Lille', country: 'FRA', pot: 3 as const },
  { id: 'zve', name: 'Crvena Zvezda', country: 'SRB', pot: 3 as const },
  { id: 'yb',  name: 'BSC Young Boys', country: 'SUI', pot: 3 as const },
  { id: 'cel', name: 'Celtic FC', country: 'SCO', pot: 3 as const },

  // Bombo 4
  { id: 'slo', name: 'Slovan Bratislava', country: 'SVK', pot: 4 as const },
  { id: 'mon', name: 'AS Monaco', country: 'FRA', pot: 4 as const },
  { id: 'spp', name: 'Sparta Praha', country: 'CZE', pot: 4 as const },
  { id: 'avf', name: 'Aston Villa', country: 'ENG', pot: 4 as const },
  { id: 'bol', name: 'Bologna FC', country: 'ITA', pot: 4 as const },
  { id: 'gir', name: 'Girona FC', country: 'ESP', pot: 4 as const },
  { id: 'stu', name: 'VfB Stuttgart', country: 'GER', pot: 4 as const },
  { id: 'stg', name: 'SK Sturm Graz', country: 'AUT', pot: 4 as const },
  { id: 'brb', name: 'Stade Brestois 29', country: 'FRA', pot: 4 as const },
];

/**
 * Initializes the official 36-team UEFA Champions League League Phase (Swiss model)
 */
export function initializeUEFAChampionsLeague(season: string = '2024/25'): EuropeanLeaguePhaseState {
  const standings: EuropeanLeagueTeamEntry[] = UEFA_CHAMPIONS_LEAGUE_36_CLUBS.map((c) => ({
    clubId: c.id,
    clubName: c.name,
    countryCode: c.country,
    pot: c.pot,
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

  // Generate 8 matchdays of Swiss fixtures (each club plays 8 matches: 4 home, 4 away against 2 teams from each pot)
  const fixtures: EuropeanLeaguePhaseState['fixtures'] = [];
  const teams = [...UEFA_CHAMPIONS_LEAGUE_36_CLUBS];
  const N = teams.length; // 36

  // Generate 8 rounds using standard circle method
  for (let round = 1; round <= 8; round++) {
    const baseDate = new Date(`2024-09-17`);
    baseDate.setDate(baseDate.getDate() + (round - 1) * 14);
    const dateStr = baseDate.toISOString().slice(0, 10);
    const rIdx = round - 1;

    // Team 0 pairing
    const opp0 = (rIdx % (N - 1)) + 1;
    const [h0, a0] = rIdx % 2 === 0 ? [0, opp0] : [opp0, 0];
    fixtures.push({
      id: `ucl_s${season}_j${round}_${teams[h0].id}_${teams[a0].id}`,
      matchday: round,
      homeClubId: teams[h0].id,
      awayClubId: teams[a0].id,
      played: false,
      date: dateStr,
    });

    // Other 17 pairings
    for (let k = 1; k < N / 2; k++) {
      const t1 = ((rIdx + k) % (N - 1)) + 1;
      const t2 = ((rIdx - k + (N - 1) * 10) % (N - 1)) + 1;
      const [h, a] = (rIdx + k) % 2 === 0 ? [t1, t2] : [t2, t1];
      fixtures.push({
        id: `ucl_s${season}_j${round}_${teams[h].id}_${teams[a].id}`,
        matchday: round,
        homeClubId: teams[h].id,
        awayClubId: teams[a].id,
        played: false,
        date: dateStr,
      });
    }
  }

  return {
    competitionId: 'uefa_champions_league',
    name: 'UEFA Champions League (Fase de Liga 36 Equipos)',
    season,
    teamsCount: 36,
    matchesPerTeam: 8,
    currentMatchday: 1,
    totalMatchdays: 8,
    standings,
    fixtures,
    directRoundOf16Slots: 8,
    knockoutPlayoffSlots: 16,
    eliminatedSlots: 12,
  };
}

/**
 * Simulates a matchday round of the European League Phase (Champions League)
 */
export function simulateEuropeanMatchday(
  state: EuropeanLeaguePhaseState,
  matchday: number
): EuropeanLeaguePhaseState {
  const updatedFixtures = state.fixtures.map((f) => {
    if (f.matchday === matchday && !f.played) {
      // Fast xG goal sampling
      const xgHome = Number((1.2 + Math.random() * 1.5).toFixed(2));
      const xgAway = Number((0.9 + Math.random() * 1.3).toFixed(2));
      const homeScore = samplePoissonGoals(xgHome);
      const awayScore = samplePoissonGoals(xgAway);

      return {
        ...f,
        played: true,
        homeScore,
        awayScore,
      };
    }
    return f;
  });

  // Re-calculate the 36-team single league table
  const standingsMap: Record<string, EuropeanLeagueTeamEntry> = {};
  state.standings.forEach((s) => {
    standingsMap[s.clubId] = {
      ...s,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      recentForm: [],
    };
  });

  updatedFixtures.forEach((f) => {
    if (f.played && f.homeScore !== undefined && f.awayScore !== undefined) {
      const home = standingsMap[f.homeClubId];
      const away = standingsMap[f.awayClubId];

      if (home && away) {
        home.played++;
        away.played++;
        home.goalsFor += f.homeScore;
        home.goalsAgainst += f.awayScore;
        away.goalsFor += f.awayScore;
        away.goalsAgainst += f.homeScore;

        if (f.homeScore > f.awayScore) {
          home.won++;
          home.points += 3;
          home.recentForm.unshift('V');
          away.lost++;
          away.recentForm.unshift('D');
        } else if (f.homeScore < f.awayScore) {
          away.won++;
          away.points += 3;
          away.recentForm.unshift('V');
          home.lost++;
          home.recentForm.unshift('D');
        } else {
          home.drawn++;
          away.drawn++;
          home.points += 1;
          away.points += 1;
          home.recentForm.unshift('E');
          away.recentForm.unshift('E');
        }

        home.goalDifference = home.goalsFor - home.goalsAgainst;
        away.goalDifference = away.goalsFor - away.goalsAgainst;
        if (home.recentForm.length > 5) home.recentForm.pop();
        if (away.recentForm.length > 5) away.recentForm.pop();
      }
    }
  });

  // Official UEFA tiebreakers:
  // 1. Points
  // 2. Goal Difference
  // 3. Goals Scored
  // 4. Away Goals Scored
  // 5. Wins
  const sortedStandings = Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.won - a.won;
  });

  return {
    ...state,
    currentMatchday: Math.min(state.totalMatchdays, matchday + 1),
    fixtures: updatedFixtures,
    standings: sortedStandings,
  };
}

/**
 * Calculates UEFA 36-team stage resolutions:
 * - Direct Round of 16 (Puestos 1 al 8)
 * - Knockout Phase Play-offs (Puestos 9 al 24)
 * - Eliminated (Puestos 25 al 36)
 */
export function getUEFAStagesCutoff(state: EuropeanLeaguePhaseState): {
  directRoundOf16: EuropeanLeagueTeamEntry[];
  knockoutPlayoffs: EuropeanLeagueTeamEntry[];
  eliminated: EuropeanLeagueTeamEntry[];
} {
  return {
    directRoundOf16: state.standings.slice(0, 8),
    knockoutPlayoffs: state.standings.slice(8, 24),
    eliminated: state.standings.slice(24, 36),
  };
}
