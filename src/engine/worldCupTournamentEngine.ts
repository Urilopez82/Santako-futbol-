import { NATIONAL_TEAMS_80, NationalTeam80, NATIONAL_TEAMS_MAP } from '../db/worldData/nationalTeams80';
import { Player } from '../types/player';
import { getOrBuildNationalSquad, getAllNationalTeams } from './nationalTeamsEngine';
import { samplePoissonGoals } from './worldSimulationEngine';

export interface WorldCupMatch {
  id: string;
  stage: 'GRUPO' | 'DIECISEISAVOS' | 'OCTAVOS' | 'CUARTOS' | 'SEMIFINAL' | 'TERCER_PUESTO' | 'FINAL';
  groupName?: string; // e.g. "Grupo A"
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  homePenalties?: number;
  awayPenalties?: number;
  played: boolean;
  date: string;
  city: string;
  stadium: string;
  events?: {
    minute: number;
    type: 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA';
    teamId: string;
    playerName: string;
  }[];
}

export interface WorldCupGroupStanding {
  teamId: string;
  teamName: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface WorldCupGroup {
  name: string; // "Grupo A", "Grupo B", etc.
  standings: WorldCupGroupStanding[];
  matches: WorldCupMatch[];
}

export interface WorldCupTournamentState {
  id: string;
  name: string; // "Copa Mundial de la FIFA 2026"
  hostName: string; // "Estados Unidos, México y Canadá"
  hostFlag: string; // "🇺🇸🇲🇽🇨🇦"
  year: number; // 2026
  userTeamId: string; // Selected nation by user
  currentStage: 'FASE_GRUPOS' | 'DIECISEISAVOS' | 'OCTAVOS' | 'CUARTOS' | 'SEMIFINAL' | 'FINAL' | 'FINALIZADO';
  groups: WorldCupGroup[];
  bracketRoundOf32: WorldCupMatch[];
  bracketRoundOf16: WorldCupMatch[];
  bracketQuarterFinals: WorldCupMatch[];
  bracketSemiFinals: WorldCupMatch[];
  thirdPlaceMatch: WorldCupMatch | null;
  finalMatch: WorldCupMatch | null;
  championTeamId: string | null;
  runnerUpTeamId: string | null;
  thirdPlaceTeamId: string | null;
  topScorer: { name: string; team: string; goals: number } | null;
  bestPlayer: { name: string; team: string } | null;
}

export interface WorldCupHostConfig {
  year: number;
  name: string;
  hostName: string;
  hostFlag: string;
  hostNationIds: string[];
  cities: { city: string; stadium: string }[];
}

export const WORLD_CUP_HOST_CONFIGS: Record<number, WorldCupHostConfig> = {
  2026: {
    year: 2026,
    name: 'Copa Mundial de la FIFA 2026',
    hostName: 'Estados Unidos, México y Canadá 2026',
    hostFlag: '🇺🇸🇲🇽🇨🇦',
    hostNationIds: ['USA', 'MEX', 'CAN'],
    cities: [
      { city: 'Nueva York / New Jersey', stadium: 'MetLife Stadium' },
      { city: 'Ciudad de México', stadium: 'Estadio Azteca' },
      { city: 'Los Ángeles', stadium: 'SoFi Stadium' },
      { city: 'Dallas', stadium: 'AT&T Stadium' },
      { city: 'Miami', stadium: 'Hard Rock Stadium' },
      { city: 'Toronto', stadium: 'BMO Field' },
      { city: 'Vancouver', stadium: 'BC Place' },
      { city: 'Guadalajara', stadium: 'Estadio Akron' },
      { city: 'Monterrey', stadium: 'Estadio BBVA' },
      { city: 'Houston', stadium: 'NRG Stadium' },
      { city: 'Atlanta', stadium: 'Mercedes-Benz Stadium' },
      { city: 'Filadelfia', stadium: 'Lincoln Financial Field' },
    ],
  },
  2030: {
    year: 2030,
    name: 'Copa Mundial de la FIFA Centenario 2030',
    hostName: 'España, Portugal y Marruecos 2030 (Centenario)',
    hostFlag: '🇪🇸🇵🇹🇲🇦🇺🇾🇦🇷',
    hostNationIds: ['ESP', 'POR', 'MAR', 'URU', 'ARG'],
    cities: [
      { city: 'Madrid', stadium: 'Estadio Santiago Bernabéu' },
      { city: 'Barcelona', stadium: 'Spotify Camp Nou' },
      { city: 'Casablanca', stadium: 'Grand Stade Hassan II' },
      { city: 'Lisboa', stadium: 'Estádio da Luz' },
      { city: 'Sevilla', stadium: 'Estadio La Cartuja' },
      { city: 'Tánger', stadium: 'Grand Stade de Tanger' },
      { city: 'Oporto', stadium: 'Estádio do Dragão' },
      { city: 'Marrakech', stadium: 'Grand Stade de Marrakech' },
      { city: 'Bilbao', stadium: 'Estadio de San Mamés' },
      { city: 'Valencia', stadium: 'Nou Mestalla' },
      { city: 'Montevideo', stadium: 'Estadio Centenario' },
      { city: 'Buenos Aires', stadium: 'Estadio Monumental' },
    ],
  },
  2034: {
    year: 2034,
    name: 'Copa Mundial de la FIFA 2034',
    hostName: 'Arabia Saudí 2034',
    hostFlag: '🇸🇦',
    hostNationIds: ['KSA'],
    cities: [
      { city: 'Riad', stadium: 'King Salman International Stadium' },
      { city: 'Yeda', stadium: 'King Abdullah Sports City' },
      { city: 'Riad', stadium: 'King Fahd Stadium' },
      { city: 'Qiddiya', stadium: 'Prince Mohammed bin Salman Stadium' },
      { city: 'Neom', stadium: 'NEOM Sky Stadium' },
      { city: 'Dammam', stadium: 'Aramco Stadium' },
      { city: 'Yeda', stadium: 'Prince Abdullah Al Faisal Stadium' },
      { city: 'Abha', stadium: 'Prince Sultan bin Abdulaziz Stadium' },
      { city: 'Riad', stadium: 'Roshn Stadium' },
      { city: 'Al Khobar', stadium: 'Al Khobar Arena' },
      { city: 'Riad', stadium: 'New Murabba Stadium' },
      { city: 'Tabuk', stadium: 'King Khalid City Stadium' },
    ],
  },
  2038: {
    year: 2038,
    name: 'Copa Mundial de la FIFA 2038',
    hostName: 'Reino Unido e Irlanda 2038',
    hostFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁷󠁬󠁳󠁿🇮🇪',
    hostNationIds: ['ENG', 'SCO', 'WAL', 'IRL'],
    cities: [
      { city: 'Londres', stadium: 'Wembley Stadium' },
      { city: 'Manchester', stadium: 'Old Trafford' },
      { city: 'Londres', stadium: 'Tottenham Hotspur Stadium' },
      { city: 'Glasgow', stadium: 'Hampden Park' },
      { city: 'Dublín', stadium: 'Aviva Stadium' },
      { city: 'Cardiff', stadium: 'Millennium Stadium' },
      { city: 'Liverpool', stadium: 'Anfield Road' },
      { city: 'Newcastle', stadium: 'St James\' Park' },
      { city: 'Birmingham', stadium: 'Villa Park' },
      { city: 'Manchester', stadium: 'Etihad Stadium' },
      { city: 'Belfast', stadium: 'Casement Park' },
      { city: 'Edimburgo', stadium: 'Murrayfield Stadium' },
    ],
  },
};

export function getHostConfigForYear(year: number): WorldCupHostConfig {
  if (WORLD_CUP_HOST_CONFIGS[year]) return WORLD_CUP_HOST_CONFIGS[year];

  // Intergalactic Era starting in 2226
  if (year >= 2226) {
    return {
      year,
      name: `Copa Intergaláctica de la FIFA ${year}`,
      hostName: `Vía Láctea & Mundos Habitados ${year}`,
      hostFlag: '🪐🌌🛸☄️',
      hostNationIds: ['KEP', 'CEN', 'TRP', 'AND'],
      cities: [
        { city: 'Kepler-452b Prime', stadium: 'Estadio Gravitacional de Kepler' },
        { city: 'Proxima Centauri Alpha', stadium: 'Arena Subluz Centauri' },
        { city: 'Trappist-1e Metropolis', stadium: 'Estadio Telepático Trappist' },
        { city: 'Andrómeda Prime City', stadium: 'Superestadio Cósmico Andrómeda' },
        { city: 'Sirio IV Estelar', stadium: 'Coliseo de Escudos Cuánticos' },
        { city: 'Aldebarán Nova', stadium: 'Estadio Gigante Rojo' },
        { city: 'Madrid (Tierra)', stadium: 'Estadio Santiago Bernabéu' },
        { city: 'Buenos Aires (Tierra)', stadium: 'Estadio Monumental' },
      ],
    };
  }

  // Dynamic host for subsequent cycles
  const cycleIndex = Math.floor(year / 4) % 4;
  if (cycleIndex === 0) {
    return {
      year,
      name: `Copa Mundial de la FIFA ${year}`,
      hostName: `Australia y Nueva Zelanda ${year}`,
      hostFlag: '🇦🇺🇳🇿',
      hostNationIds: ['AUS', 'NZL'],
      cities: [
        { city: 'Sídney', stadium: 'Stadium Australia' },
        { city: 'Melbourne', stadium: 'Melbourne Cricket Ground' },
        { city: 'Brisbane', stadium: 'Suncorp Stadium' },
        { city: 'Auckland', stadium: 'Eden Park' },
        { city: 'Perth', stadium: 'Optus Stadium' },
        { city: 'Wellington', stadium: 'Sky Stadium' },
      ],
    };
  }
  return {
    year,
    name: `Copa Mundial de la FIFA ${year}`,
    hostName: `Japón y Corea del Sur ${year}`,
    hostFlag: '🇯🇵🇰🇷',
    hostNationIds: ['JPN', 'KOR'],
    cities: [
      { city: 'Tokio', stadium: 'Japan National Stadium' },
      { city: 'Seúl', stadium: 'Seoul World Cup Stadium' },
      { city: 'Yokohama', stadium: 'Nissan Stadium' },
      { city: 'Busan', stadium: 'Busan Asiad Main Stadium' },
      { city: 'Osaka', stadium: 'Yanmar Stadium Nagai' },
      { city: 'Incheon', stadium: 'Incheon Munhak Stadium' },
    ],
  };
}

/**
 * Initializes an official FIFA World Cup / Copa Intergaláctica tournament:
 * - 48 teams in 12 groups (A to L) before year 2226
 * - 64 teams in 16 groups (A to P) starting in year 2226 (Copa Intergaláctica de la FIFA)
 * with dynamic host stadiums and realistic cycle-based qualification.
 */
export function createWorldCupTournament(
  userTeamId: string = 'ESP',
  customHost?: string,
  participatingCountParam: 64 | 48 | 32 = 48,
  yearParam: number = 2026
): WorldCupTournamentState {
  // Infer year if yearParam or customHost contains a 4-digit number
  let year = yearParam;
  if (customHost) {
    const matchYear = customHost.match(/\b(2[0-9]{3})\b/);
    if (matchYear) {
      year = parseInt(matchYear[1], 10);
    }
  }

  const isGalacticEra = year >= 2226;
  const participatingCount = isGalacticEra ? 64 : participatingCountParam;

  const hostConfig = getHostConfigForYear(year);
  const hostCities = hostConfig.cities;

  const allTeams = getAllNationalTeams(year);
  const userTeam = NATIONAL_TEAMS_MAP[userTeamId] || allTeams[0];

  // 1. Host nations automatically qualify
  const hostTeams = hostConfig.hostNationIds
    .map((id) => NATIONAL_TEAMS_MAP[id])
    .filter(Boolean) as NationalTeam80[];

  const qualifiedIds = new Set<string>([userTeam.id, ...hostTeams.map((t) => t.id)]);
  const qualifiedTeams: NationalTeam80[] = [userTeam];
  hostTeams.forEach((ht) => {
    if (ht.id !== userTeam.id && !qualifiedTeams.some((t) => t.id === ht.id)) {
      qualifiedTeams.push(ht);
    }
  });

  // 2. Dynamic qualification for remaining spots across all available FIFA & Cosmic nations:
  const remainingCandidates = allTeams.filter((t) => !qualifiedIds.has(t.id));
  
  const scoredCandidates = remainingCandidates.map((t) => {
    const seed = year * 19.37 + t.fifaRanking * 7.43 + (t.reputation || 70) * 3.19;
    const cycleFluctuation = Math.sin(seed) * 22 + Math.cos(seed * 1.7) * 11;
    const qualScore = (100 - t.fifaRanking) * 1.6 + (t.reputation || 70) * 1.1 + cycleFluctuation;
    return { team: t, score: qualScore };
  });

  scoredCandidates.sort((a, b) => b.score - a.score);

  const needed = participatingCount - qualifiedTeams.length;
  scoredCandidates.slice(0, needed).forEach((item) => {
    qualifiedTeams.push(item.team);
  });

  // 3. Draw into groups with Pots 1-4
  const sortedByRanking = [...qualifiedTeams].sort((a, b) => a.fifaRanking - b.fifaRanking);
  const numGroups = participatingCount === 64 ? 16 : 12;

  const seeds = sortedByRanking.slice(0, numGroups);
  const pot2 = sortedByRanking.slice(numGroups, numGroups * 2).sort(() => Math.random() - 0.5);
  const pot3 = sortedByRanking.slice(numGroups * 2, numGroups * 3).sort(() => Math.random() - 0.5);
  const pot4 = sortedByRanking.slice(numGroups * 3, numGroups * 4).sort(() => Math.random() - 0.5);

  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].slice(0, numGroups);
  const groups: WorldCupGroup[] = [];

  for (let g = 0; g < numGroups; g++) {
    const letter = groupLetters[g];
    const groupTeams = [seeds[g], pot2[g], pot3[g], pot4[g]].filter(Boolean);

    const standings: WorldCupGroupStanding[] = groupTeams.map((t) => ({
      teamId: t.id,
      teamName: t.name,
      flag: t.flag,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }));

    // Round-robin 3 matches each (6 matches per group)
    const matches: WorldCupMatch[] = [];
    const pairs = [
      [0, 1], [2, 3],
      [0, 2], [1, 3],
      [0, 3], [1, 2],
    ];

    pairs.forEach(([t1, t2], mIdx) => {
      if (groupTeams[t1] && groupTeams[t2]) {
        const cityData = hostCities[(g * 3 + mIdx) % hostCities.length];
        const dayOffset = Math.floor(mIdx / 2) * 5 + (g % 3) + 11;
        const dateStr = `${year}-06-${String(Math.min(27, dayOffset)).padStart(2, '0')}`;

        matches.push({
          id: `wc_${year}_grp_${letter}_m${mIdx + 1}`,
          stage: 'GRUPO',
          groupName: `Grupo ${letter}`,
          homeTeamId: groupTeams[t1].id,
          awayTeamId: groupTeams[t2].id,
          played: false,
          date: dateStr,
          city: cityData.city,
          stadium: cityData.stadium,
        });
      }
    });

    groups.push({
      name: `Grupo ${letter}`,
      standings,
      matches,
    });
  }

  return {
    id: `wc_tournament_${year}_${Date.now()}`,
    name: hostConfig.name,
    hostName: customHost || hostConfig.hostName,
    hostFlag: hostConfig.hostFlag,
    year,
    userTeamId: userTeam.id,
    currentStage: 'FASE_GRUPOS',
    groups,
    bracketRoundOf32: [],
    bracketRoundOf16: [],
    bracketQuarterFinals: [],
    bracketSemiFinals: [],
    thirdPlaceMatch: null,
    finalMatch: null,
    championTeamId: null,
    runnerUpTeamId: null,
    thirdPlaceTeamId: null,
    topScorer: null,
    bestPlayer: null,
  };
}

/**
 * Simulates a single World Cup match with realistic score, events, and extra time/penalties if knockout
 */
export function simulateWorldCupMatch(
  match: WorldCupMatch,
  playersMap: Record<string, Player>
): WorldCupMatch {
  if (match.played) return match;

  const homeSquad = getOrBuildNationalSquad(match.homeTeamId, playersMap);
  const awaySquad = getOrBuildNationalSquad(match.awayTeamId, playersMap);

  const homeOvr = homeSquad.averageRating;
  const awayOvr = awaySquad.averageRating;
  const diff = homeOvr - awayOvr;

  const baseHomeXg = Math.max(0.4, 1.45 + diff * 0.08);
  const baseAwayXg = Math.max(0.4, 1.30 - diff * 0.08);

  let homeScore = samplePoissonGoals(baseHomeXg);
  let awayScore = samplePoissonGoals(baseAwayXg);
  let homePen: number | undefined = undefined;
  let awayPen: number | undefined = undefined;

  // Knockout stage tie-breaker
  if (match.stage !== 'GRUPO' && homeScore === awayScore) {
    // 30 mins extra time simulation
    const extraHome = Math.random() < 0.28 ? 1 : 0;
    const extraAway = Math.random() < 0.24 ? 1 : 0;
    homeScore += extraHome;
    awayScore += extraAway;

    if (homeScore === awayScore) {
      // Penalty shootout
      homePen = 3 + Math.floor(Math.random() * 3);
      awayPen = homePen + (Math.random() < 0.5 ? 1 : -1);
      if (awayPen === homePen) awayPen = homePen + 1;
    }
  }

  // Generate Goal and Card Events
  const events: WorldCupMatch['events'] = [];
  for (let g = 0; g < homeScore; g++) {
    const scorer = homeSquad.starters[Math.floor(7 + Math.random() * 4)] || homeSquad.starters[9];
    events.push({
      minute: Math.floor(10 + Math.random() * 80),
      type: 'GOL',
      teamId: match.homeTeamId,
      playerName: `${scorer.firstName} ${scorer.lastName}`,
    });
  }
  for (let g = 0; g < awayScore; g++) {
    const scorer = awaySquad.starters[Math.floor(7 + Math.random() * 4)] || awaySquad.starters[9];
    events.push({
      minute: Math.floor(10 + Math.random() * 80),
      type: 'GOL',
      teamId: match.awayTeamId,
      playerName: `${scorer.firstName} ${scorer.lastName}`,
    });
  }

  // Yellow card event
  if (Math.random() < 0.7) {
    events.push({
      minute: Math.floor(20 + Math.random() * 65),
      type: 'TARJETA_AMARILLA',
      teamId: Math.random() < 0.5 ? match.homeTeamId : match.awayTeamId,
      playerName: 'Defensa central',
    });
  }

  return {
    ...match,
    played: true,
    homeScore,
    awayScore,
    homePenalties: homePen,
    awayPenalties: awayPen,
    events: events.sort((a, b) => a.minute - b.minute),
  };
}

/**
 * Updates a World Cup group's standings given a played match
 */
export function updateWorldCupGroupWithMatch(
  group: WorldCupGroup,
  match: WorldCupMatch
): WorldCupGroup {
  if (!match.played || match.homeScore === undefined || match.awayScore === undefined) {
    return group;
  }

  const updatedStandings = group.standings.map((s) => ({ ...s }));
  const homeRow = updatedStandings.find((s) => s.teamId === match.homeTeamId);
  const awayRow = updatedStandings.find((s) => s.teamId === match.awayTeamId);

  if (!homeRow || !awayRow) return group;

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
    awayRow.lost += 1;
  } else if (match.homeScore < match.awayScore) {
    awayRow.won += 1;
    awayRow.points += 3;
    homeRow.lost += 1;
  } else {
    homeRow.drawn += 1;
    homeRow.points += 1;
    awayRow.drawn += 1;
    awayRow.points += 1;
  }

  updatedStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return {
    ...group,
    standings: updatedStandings,
    matches: group.matches.map((m) => (m.id === match.id ? match : m)),
  };
}

export function getWorldCupMatchWinner(m: WorldCupMatch): string {
  if (m.homeScore !== undefined && m.awayScore !== undefined) {
    if (m.homeScore > m.awayScore) return m.homeTeamId;
    if (m.homeScore < m.awayScore) return m.awayTeamId;
    if (m.homePenalties !== undefined && m.awayPenalties !== undefined) {
      return m.homePenalties > m.awayPenalties ? m.homeTeamId : m.awayTeamId;
    }
  }
  return m.homeTeamId;
}

export function getWorldCupMatchLoser(m: WorldCupMatch): string {
  const winner = getWorldCupMatchWinner(m);
  return winner === m.homeTeamId ? m.awayTeamId : m.homeTeamId;
}

/**
 * Automatically advances the World Cup tournament state through brackets:
 * Groups (48 teams) -> Round of 32 -> Round of 16 -> Quarters -> Semis -> Final
 */
export function advanceWorldCupTournament(
  tournament: WorldCupTournamentState
): WorldCupTournamentState {
  let updated = { ...tournament };

  const year = tournament.year || 2026;
  const hostConfig = getHostConfigForYear(year);
  const hostCities = hostConfig.cities;

  // 1. Advance from Group Stage to Round of 32 (Dieciseisavos)
  const allGroupMatchesPlayed = updated.groups.every((g) => g.matches.every((m) => m.played));
  if (allGroupMatchesPlayed && updated.bracketRoundOf32.length === 0) {
    const r32Matches: WorldCupMatch[] = [];

    if (updated.groups.length === 16) {
      // 64-team tournament: 1st and 2nd from all 16 groups qualify directly (16 * 2 = 32 teams)
      const winners = updated.groups.map((g) => g.standings[0]?.teamId).filter(Boolean);
      const runnersUp = updated.groups.map((g) => g.standings[1]?.teamId).filter(Boolean);

      for (let i = 0; i < 16; i++) {
        const t1 = winners[i];
        const t2 = runnersUp[(i + 1) % 16];
        const cityData = hostCities[i % hostCities.length];
        const day = Math.min(30, 28 + Math.floor(i / 8));

        r32Matches.push({
          id: `wc_${year}_r32_m${i + 1}`,
          stage: 'DIECISEISAVOS',
          homeTeamId: t1,
          awayTeamId: t2,
          played: false,
          date: `${year}-06-${String(day).padStart(2, '0')}`,
          city: cityData.city,
          stadium: cityData.stadium,
        });
      }
    } else {
      // 48-team tournament: 1st and 2nd from all 12 groups (24) + best 8 third places (8)
      const firstAndSecond: string[] = [];
      const thirdPlaces: WorldCupGroupStanding[] = [];

      updated.groups.forEach((g) => {
        if (g.standings[0]) firstAndSecond.push(g.standings[0].teamId);
        if (g.standings[1]) firstAndSecond.push(g.standings[1].teamId);
        if (g.standings[2]) thirdPlaces.push(g.standings[2]);
      });

      // Best 8 third-place teams
      thirdPlaces.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
      const best8Thirds = thirdPlaces.slice(0, 8).map((t) => t.teamId);

      const qualified32 = [...firstAndSecond, ...best8Thirds];

      for (let i = 0; i < 16; i++) {
        const t1 = qualified32[i];
        const t2 = qualified32[31 - i] || qualified32[16 + i];
        const cityData = hostCities[i % hostCities.length];
        const day = Math.min(30, 28 + Math.floor(i / 8));

        r32Matches.push({
          id: `wc_${year}_r32_m${i + 1}`,
          stage: 'DIECISEISAVOS',
          homeTeamId: t1,
          awayTeamId: t2,
          played: false,
          date: `${year}-06-${String(day).padStart(2, '0')}`,
          city: cityData.city,
          stadium: cityData.stadium,
        });
      }
    }

    updated = {
      ...updated,
      currentStage: 'DIECISEISAVOS',
      bracketRoundOf32: r32Matches,
    };
  }

  // 2. Advance from Round of 32 to Round of 16 (Octavos)
  if (
    updated.bracketRoundOf32.length > 0 &&
    updated.bracketRoundOf32.every((m) => m.played) &&
    updated.bracketRoundOf16.length === 0
  ) {
    const winners = updated.bracketRoundOf32.map(getWorldCupMatchWinner);
    const r16Matches: WorldCupMatch[] = [];

    for (let i = 0; i < 8; i++) {
      const cityData = hostCities[i % hostCities.length];
      const day = 3 + Math.floor(i / 4);
      r16Matches.push({
        id: `wc_${year}_r16_m${i + 1}`,
        stage: 'OCTAVOS',
        homeTeamId: winners[i * 2],
        awayTeamId: winners[i * 2 + 1],
        played: false,
        date: `${year}-07-0${day}`,
        city: cityData.city,
        stadium: cityData.stadium,
      });
    }

    updated = {
      ...updated,
      currentStage: 'OCTAVOS',
      bracketRoundOf16: r16Matches,
    };
  }

  // 3. Advance from Round of 16 to Quarter-Finals (Cuartos)
  if (
    updated.bracketRoundOf16.length > 0 &&
    updated.bracketRoundOf16.every((m) => m.played) &&
    updated.bracketQuarterFinals.length === 0
  ) {
    const winners = updated.bracketRoundOf16.map(getWorldCupMatchWinner);
    const qfMatches: WorldCupMatch[] = [];

    for (let i = 0; i < 4; i++) {
      const cityData = hostCities[(i + 4) % hostCities.length];
      const day = 7 + Math.floor(i / 2);
      qfMatches.push({
        id: `wc_${year}_qf_m${i + 1}`,
        stage: 'CUARTOS',
        homeTeamId: winners[i * 2],
        awayTeamId: winners[i * 2 + 1],
        played: false,
        date: `${year}-07-0${day}`,
        city: cityData.city,
        stadium: cityData.stadium,
      });
    }

    updated = {
      ...updated,
      currentStage: 'CUARTOS',
      bracketQuarterFinals: qfMatches,
    };
  }

  // 4. Advance from Quarter-Finals to Semi-Finals
  if (
    updated.bracketQuarterFinals.length > 0 &&
    updated.bracketQuarterFinals.every((m) => m.played) &&
    updated.bracketSemiFinals.length === 0
  ) {
    const winners = updated.bracketQuarterFinals.map(getWorldCupMatchWinner);
    const sfMatches: WorldCupMatch[] = [];

    for (let i = 0; i < 2; i++) {
      const cityData = hostCities[i % hostCities.length];
      sfMatches.push({
        id: `wc_${year}_sf_m${i + 1}`,
        stage: 'SEMIFINAL',
        homeTeamId: winners[i * 2],
        awayTeamId: winners[i * 2 + 1],
        played: false,
        date: `${year}-07-${String(13 + i).padStart(2, '0')}`,
        city: cityData.city,
        stadium: cityData.stadium,
      });
    }

    updated = {
      ...updated,
      currentStage: 'SEMIFINAL',
      bracketSemiFinals: sfMatches,
    };
  }

  // 5. Advance from Semi-Finals to 3rd Place & Final
  if (
    updated.bracketSemiFinals.length > 0 &&
    updated.bracketSemiFinals.every((m) => m.played) &&
    !updated.finalMatch
  ) {
    const finalists = updated.bracketSemiFinals.map(getWorldCupMatchWinner);
    const bronzeContenders = updated.bracketSemiFinals.map(getWorldCupMatchLoser);
    const finalCity = hostCities[0];
    const thirdCity = hostCities[1] || hostCities[0];

    updated = {
      ...updated,
      currentStage: 'FINAL',
      thirdPlaceMatch: {
        id: `wc_${year}_third_place`,
        stage: 'TERCER_PUESTO',
        homeTeamId: bronzeContenders[0],
        awayTeamId: bronzeContenders[1],
        played: false,
        date: `${year}-07-18`,
        city: thirdCity.city,
        stadium: thirdCity.stadium,
      },
      finalMatch: {
        id: `wc_${year}_gran_final`,
        stage: 'FINAL',
        homeTeamId: finalists[0],
        awayTeamId: finalists[1],
        played: false,
        date: `${year}-07-19`,
        city: finalCity.city,
        stadium: finalCity.stadium,
      },
    };
  }

  // 6. Complete Tournament if Final is played
  if (updated.finalMatch && updated.finalMatch.played && !updated.championTeamId) {
    const champ = getWorldCupMatchWinner(updated.finalMatch);
    const runner = getWorldCupMatchLoser(updated.finalMatch);
    const bronze = updated.thirdPlaceMatch && updated.thirdPlaceMatch.played
      ? getWorldCupMatchWinner(updated.thirdPlaceMatch)
      : null;

    updated = {
      ...updated,
      currentStage: 'FINALIZADO',
      championTeamId: champ,
      runnerUpTeamId: runner,
      thirdPlaceTeamId: bronze,
    };
  }

  return updated;
}

/**
 * Simulates an entire World Cup tournament from current state to conclusion.
 */
export function simulateEntireWorldCupTournament(
  tournament: WorldCupTournamentState,
  playersMap: Record<string, Player>
): WorldCupTournamentState {
  let current = { ...tournament };

  // 1. Groups
  current.groups = current.groups.map((group) => {
    let g = { ...group };
    g.matches = g.matches.map((m) => {
      if (!m.played) {
        const sim = simulateWorldCupMatch(m, playersMap);
        g = updateWorldCupGroupWithMatch(g, sim);
        return sim;
      }
      return m;
    });
    return g;
  });

  current = advanceWorldCupTournament(current);

  // 2. Dieciseisavos
  if (current.bracketRoundOf32.length > 0) {
    current.bracketRoundOf32 = current.bracketRoundOf32.map((m) =>
      m.played ? m : simulateWorldCupMatch(m, playersMap)
    );
    current = advanceWorldCupTournament(current);
  }

  // 3. Octavos
  if (current.bracketRoundOf16.length > 0) {
    current.bracketRoundOf16 = current.bracketRoundOf16.map((m) =>
      m.played ? m : simulateWorldCupMatch(m, playersMap)
    );
    current = advanceWorldCupTournament(current);
  }

  // 4. Cuartos
  if (current.bracketQuarterFinals.length > 0) {
    current.bracketQuarterFinals = current.bracketQuarterFinals.map((m) =>
      m.played ? m : simulateWorldCupMatch(m, playersMap)
    );
    current = advanceWorldCupTournament(current);
  }

  // 5. Semifinales
  if (current.bracketSemiFinals.length > 0) {
    current.bracketSemiFinals = current.bracketSemiFinals.map((m) =>
      m.played ? m : simulateWorldCupMatch(m, playersMap)
    );
    current = advanceWorldCupTournament(current);
  }

  // 6. 3rd Place & Final
  if (current.thirdPlaceMatch && !current.thirdPlaceMatch.played) {
    current.thirdPlaceMatch = simulateWorldCupMatch(current.thirdPlaceMatch, playersMap);
  }
  if (current.finalMatch && !current.finalMatch.played) {
    current.finalMatch = simulateWorldCupMatch(current.finalMatch, playersMap);
    current = advanceWorldCupTournament(current);
  }

  return current;
}

/**
 * Simulates all World Cup matches scheduled for a given date or earlier,
 * leaving any unplayed match involving the user's national team on `targetDate` for user control.
 */
export function simulateScheduledWorldCupMatchesForDate(
  tournament: WorldCupTournamentState,
  targetDate: string,
  playersMap: Record<string, Player>,
  userNationId?: string
): WorldCupTournamentState {
  let updated = { ...tournament };

  // 1. Group stage simulation
  let groupChanged = false;
  const newGroups = updated.groups.map((g) => {
    let groupCopy = { ...g };
    groupCopy.matches = groupCopy.matches.map((m) => {
      if (m.played) return m;
      const isUserMatchToday = userNationId && (m.homeTeamId === userNationId || m.awayTeamId === userNationId) && m.date === targetDate;
      if (isUserMatchToday) return m; // Hold for interactive play

      if (m.date <= targetDate) {
        const sim = simulateWorldCupMatch(m, playersMap);
        groupCopy = updateWorldCupGroupWithMatch(groupCopy, sim);
        groupChanged = true;
        return sim;
      }
      return m;
    });
    return groupCopy;
  });

  if (groupChanged) {
    updated = { ...updated, groups: newGroups };
  }

  // Check bracket generation if groups just concluded
  updated = advanceWorldCupTournament(updated);

  // 2. Knockout brackets simulation
  const simulateBracketList = (matches: WorldCupMatch[]): WorldCupMatch[] => {
    return matches.map((m) => {
      if (m.played) return m;
      const isUserMatchToday = userNationId && (m.homeTeamId === userNationId || m.awayTeamId === userNationId) && m.date === targetDate;
      if (isUserMatchToday) return m;

      if (m.date <= targetDate) {
        return simulateWorldCupMatch(m, playersMap);
      }
      return m;
    });
  };

  if (updated.bracketRoundOf32.length > 0) {
    updated.bracketRoundOf32 = simulateBracketList(updated.bracketRoundOf32);
    updated = advanceWorldCupTournament(updated);
  }
  if (updated.bracketRoundOf16.length > 0) {
    updated.bracketRoundOf16 = simulateBracketList(updated.bracketRoundOf16);
    updated = advanceWorldCupTournament(updated);
  }
  if (updated.bracketQuarterFinals.length > 0) {
    updated.bracketQuarterFinals = simulateBracketList(updated.bracketQuarterFinals);
    updated = advanceWorldCupTournament(updated);
  }
  if (updated.bracketSemiFinals.length > 0) {
    updated.bracketSemiFinals = simulateBracketList(updated.bracketSemiFinals);
    updated = advanceWorldCupTournament(updated);
  }
  if (updated.thirdPlaceMatch && !updated.thirdPlaceMatch.played && updated.thirdPlaceMatch.date <= targetDate) {
    const isUserMatchToday = userNationId && (updated.thirdPlaceMatch.homeTeamId === userNationId || updated.thirdPlaceMatch.awayTeamId === userNationId) && updated.thirdPlaceMatch.date === targetDate;
    if (!isUserMatchToday) {
      updated.thirdPlaceMatch = simulateWorldCupMatch(updated.thirdPlaceMatch, playersMap);
    }
  }
  if (updated.finalMatch && !updated.finalMatch.played && updated.finalMatch.date <= targetDate) {
    const isUserMatchToday = userNationId && (updated.finalMatch.homeTeamId === userNationId || updated.finalMatch.awayTeamId === userNationId) && updated.finalMatch.date === targetDate;
    if (!isUserMatchToday) {
      updated.finalMatch = simulateWorldCupMatch(updated.finalMatch, playersMap);
      updated = advanceWorldCupTournament(updated);
    }
  }

  return updated;
}
