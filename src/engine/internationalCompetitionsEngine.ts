import { Club } from '../types/club';
import { Match, MatchEvent, StandingsRow } from '../types/competition';
import { Player } from '../types/player';
import { samplePoissonGoals } from './worldSimulationEngine';
import { AFRICAN_CLUBS } from '../db/worldClubs/africanClubs';

export interface CupMatch {
  id: string;
  tournamentId: string;
  roundName: string; // Ej. "Fase de Liga - Jornada 1", "Play-offs Eliminatorios", "Octavos de Final", "Gran Final"
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  homePenalties?: number;
  awayPenalties?: number;
  played: boolean;
  date: string;
  neutralVenue?: string;
  isLowerTierHome: boolean;
  matchday?: number;
}

export interface KnockoutTournamentState {
  id: string;
  name: string;
  shortName: string;
  season: string;
  trophyName: string;
  currentRound: string;
  matches: CupMatch[];
  championClubId: string | null;
  runnerUpClubId: string | null;
  standings?: StandingsRow[]; // Single League Phase table for UEFA Champions League (36 clubs)
}

export function getCupMatchWinner(m: CupMatch): string {
  if (m.homeScore !== undefined && m.awayScore !== undefined) {
    if (m.homeScore > m.awayScore) return m.homeTeamId;
    if (m.homeScore < m.awayScore) return m.awayTeamId;
    if (m.homePenalties !== undefined && m.awayPenalties !== undefined) {
      return m.homePenalties > m.awayPenalties ? m.homeTeamId : m.awayTeamId;
    }
  }
  return m.homeTeamId;
}

export function getCupMatchLoser(m: CupMatch): string {
  const winner = getCupMatchWinner(m);
  return winner === m.homeTeamId ? m.awayTeamId : m.homeTeamId;
}

/**
 * Initializes the official Copa del Rey with all Spanish clubs.
 * Single leg (partido único) at the stadium of the lower-tier club!
 */
export function initializeCopaDelRey(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const spanishClubs = Object.values(clubsMap).filter(
    (c) => c.countryId === 'ESP' || c.divisionId.startsWith('esp_')
  );

  // Sort clubs by tier descending so lower-tier clubs get home advantage
  const sortedClubs = [...spanishClubs].sort((a, b) => {
    const tierA = parseInt(a.divisionId.replace(/[^0-9]/g, '') || '5', 10);
    const tierB = parseInt(b.divisionId.replace(/[^0-9]/g, '') || '5', 10);
    return tierB - tierA; // Higher tier number = lower category
  });

  const matches: CupMatch[] = [];
  const half = Math.min(32, Math.floor(sortedClubs.length / 2));

  // Match lower category clubs at home against higher category clubs
  for (let i = 0; i < half; i++) {
    const lowerClub = sortedClubs[i];
    const higherClub = sortedClubs[sortedClubs.length - 1 - i];

    matches.push({
      id: `cdr_r1_${lowerClub.id}_${higherClub.id}`,
      tournamentId: 'copa_del_rey',
      roundName: 'Primera Ronda Eliminatoria (Partido Único)',
      homeTeamId: lowerClub.id,
      awayTeamId: higherClub.id,
      played: false,
      date: `${seasonYear}-10-28`,
      isLowerTierHome: true,
      matchday: 1,
    });
  }

  return {
    id: 'copa_del_rey',
    name: 'Copa de Su Majestad El Rey',
    shortName: 'Copa del Rey',
    season,
    trophyName: 'Copa del Rey de España',
    currentRound: 'Primera Ronda',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Initializes the official modern UEFA Champions League with:
 * - 36 elite clubs in a single League Phase table
 * - 8 Matchdays (Jornadas 1 to 8: Sept - Jan)
 * - Play-offs (Dieciseisavos) in Feb for teams 9-24
 * - Octavos de Final in March (Top 8 + Play-off winners)
 * - Cuartos, Semis, and Gran Final in May
 */
export function initializeUEFAChampionsLeague(
  clubsMap: Record<string, Club>,
  season: string = '2026/27',
  userClubId?: string,
  guaranteedClubIds: string[] = []
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;

  // Select top 36 European elite clubs with guaranteed spots for Cup winners
  const euroClubs: Club[] = [];

  // 1. Seed guaranteed qualified clubs (National Cup champions & reallocated league spots)
  guaranteedClubIds.forEach((id) => {
    const c = clubsMap[id];
    if (c && !euroClubs.some((e) => e.id === c.id)) {
      euroClubs.push(c);
    }
  });

  // If user club is a European top division club and not in the list, guarantee their spot!
  if (userClubId && clubsMap[userClubId]) {
    const uClub = clubsMap[userClubId];
    const isTopDivision =
      uClub.divisionId.endsWith('_tier1') ||
      uClub.divisionId === 'esp_tier1' ||
      uClub.divisionId === 'uefa_champions';
    const isEuro =
      !uClub.countryId ||
      ['ESP', 'ENG', 'ITA', 'GER', 'FRA', 'POR', 'NED', 'TUR', 'SCO', 'BEL', 'AUT', 'GRE'].includes(uClub.countryId);
    if ((isTopDivision || isEuro) && !euroClubs.some((c) => c.id === userClubId)) {
      if (euroClubs.length >= 36) {
        euroClubs[35] = uClub;
      } else {
        euroClubs.push(uClub);
      }
    }
  }

  // 3. Complete up to 36 with elite European clubs by reputation
  const candidateClubs = Object.values(clubsMap)
    .filter((c) => {
      const isTopDivision =
        c.divisionId.endsWith('_tier1') ||
        c.divisionId === 'uefa_champions' ||
        c.divisionId === 'esp_tier1';
      const isEuro =
        !c.countryId ||
        ['ESP', 'ENG', 'ITA', 'GER', 'FRA', 'POR', 'NED', 'TUR', 'SCO', 'BEL', 'AUT', 'GRE'].includes(c.countryId);
      return isTopDivision && isEuro && !euroClubs.some((e) => e.id === c.id);
    })
    .sort((a, b) => (b.reputation || 70) - (a.reputation || 70));

  for (const c of candidateClubs) {
    if (euroClubs.length >= 36) break;
    euroClubs.push(c);
  }

  // Fallback pad if still under 36
  if (euroClubs.length < 36) {
    const rest = Object.values(clubsMap)
      .filter((c) => !euroClubs.some((e) => e.id === c.id))
      .sort((a, b) => (b.reputation || 70) - (a.reputation || 70));
    for (const c of rest) {
      if (euroClubs.length >= 36) break;
      euroClubs.push(c);
    }
  }

  // Initialize single 36-club League Phase standings
  const standings: StandingsRow[] = euroClubs.map((c) => ({
    teamId: c.id,
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

  // 8 League Phase Matchdays schedule (Septiembre a Enero)
  const matchdayDates = [
    `${seasonYear}-09-16`,
    `${seasonYear}-09-30`,
    `${seasonYear}-10-21`,
    `${seasonYear}-11-04`,
    `${seasonYear}-11-25`,
    `${seasonYear}-12-09`,
    `${seasonYear + 1}-01-20`,
    `${seasonYear + 1}-01-27`,
  ];

  const matches: CupMatch[] = [];
  const N = euroClubs.length; // 36

  // Standard Circle Method (1-factorization) guaranteeing EVERY club plays EXACTLY 1 match per round (8 matches total)
  for (let round = 0; round < 8; round++) {
    const date = matchdayDates[round];
    
    // Team 0 pairing
    const opp0 = (round % (N - 1)) + 1;
    const [h0, a0] = round % 2 === 0 ? [0, opp0] : [opp0, 0];
    
    matches.push({
      id: `ucl_lp_j${round + 1}_${euroClubs[h0].id}_${euroClubs[a0].id}`,
      tournamentId: 'uefa_champions',
      roundName: `Fase de Liga - Jornada ${round + 1}`,
      homeTeamId: euroClubs[h0].id,
      awayTeamId: euroClubs[a0].id,
      played: false,
      date,
      isLowerTierHome: false,
      matchday: round + 1,
    });

    // Remaining 17 pairings
    for (let k = 1; k < N / 2; k++) {
      const t1 = ((round + k) % (N - 1)) + 1;
      const t2 = ((round - k + (N - 1) * 10) % (N - 1)) + 1;
      const [h, a] = (round + k) % 2 === 0 ? [t1, t2] : [t2, t1];

      matches.push({
        id: `ucl_lp_j${round + 1}_${euroClubs[h].id}_${euroClubs[a].id}`,
        tournamentId: 'uefa_champions',
        roundName: `Fase de Liga - Jornada ${round + 1}`,
        homeTeamId: euroClubs[h].id,
        awayTeamId: euroClubs[a].id,
        played: false,
        date,
        isLowerTierHome: false,
        matchday: round + 1,
      });
    }
  }

  return {
    id: 'uefa_champions',
    name: 'UEFA Champions League',
    shortName: 'Champions League',
    season,
    trophyName: 'La Orejona (Copa de Europa)',
    currentRound: 'Fase de Liga',
    matches,
    championClubId: null,
    runnerUpClubId: null,
    standings,
  };
}

/**
 * Initializes Supercopa de España (Final Four en enero)
 */
export function initializeSupercopaEspana(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const spanishElite = Object.values(clubsMap)
    .filter((c) => c.divisionId === 'esp_tier1' || c.countryId === 'ESP')
    .sort((a, b) => (b.reputation || 70) - (a.reputation || 70))
    .slice(0, 4);

  const matches: CupMatch[] = [];
  if (spanishElite.length >= 4) {
    matches.push({
      id: `sce_sf1_${spanishElite[0].id}_${spanishElite[3].id}`,
      tournamentId: 'supercopa_espana',
      roundName: 'Semifinal 1 (Final Four)',
      homeTeamId: spanishElite[0].id,
      awayTeamId: spanishElite[3].id,
      played: false,
      date: `${seasonYear + 1}-01-13`,
      isLowerTierHome: false,
      neutralVenue: 'King Abdullah Stadium',
      matchday: 1,
    });
    matches.push({
      id: `sce_sf2_${spanishElite[1].id}_${spanishElite[2].id}`,
      tournamentId: 'supercopa_espana',
      roundName: 'Semifinal 2 (Final Four)',
      homeTeamId: spanishElite[1].id,
      awayTeamId: spanishElite[2].id,
      played: false,
      date: `${seasonYear + 1}-01-14`,
      isLowerTierHome: false,
      neutralVenue: 'King Abdullah Stadium',
      matchday: 2,
    });
  }

  return {
    id: 'supercopa_espana',
    name: 'Supercopa de España',
    shortName: 'Supercopa',
    season,
    trophyName: 'Trofeo de la Supercopa de España',
    currentRound: 'Semifinales',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Initializes Copa Libertadores with South American powerhouses
 */
export function initializeCopaLibertadores(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const saClubs = Object.values(clubsMap).filter(
    (c) => !!c.countryId && ['ARG', 'BRA', 'COL', 'CHI', 'URU'].includes(c.countryId)
  );

  const selected = saClubs.slice(0, 16);
  const matches: CupMatch[] = [];

  for (let i = 0; i < selected.length; i += 2) {
    if (selected[i + 1]) {
      matches.push({
        id: `lib_r16_${selected[i].id}_${selected[i + 1].id}`,
        tournamentId: 'copa_libertadores',
        roundName: 'Octavos de Final',
        homeTeamId: selected[i].id,
        awayTeamId: selected[i + 1].id,
        played: false,
        date: `${seasonYear + 1}-04-15`,
        isLowerTierHome: false,
        matchday: 1,
      });
    }
  }

  return {
    id: 'copa_libertadores',
    name: 'CONMEBOL Libertadores',
    shortName: 'Copa Libertadores',
    season,
    trophyName: 'Trofeo Copa Libertadores de América',
    currentRound: 'Octavos de Final',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Initializes CAF Champions League with African powerhouses
 */
export function initializeCAFChampionsLeague(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const africanClubs = Object.values(clubsMap).filter(
    (c) => c.divisionId === 'caf_champions' || (!!c.countryId && ['MAR', 'EGY', 'RSA', 'TUN', 'COD'].includes(c.countryId))
  );

  const pool = africanClubs.length >= 8 ? africanClubs : AFRICAN_CLUBS.map((c) => ({ id: c.id, name: c.name }));
  const matches: CupMatch[] = [];

  for (let i = 0; i < pool.length; i += 2) {
    if (pool[i + 1]) {
      matches.push({
        id: `caf_qf_${pool[i].id}_${pool[i + 1].id}`,
        tournamentId: 'caf_champions',
        roundName: 'Cuartos de Final',
        homeTeamId: pool[i].id,
        awayTeamId: pool[i + 1].id,
        played: false,
        date: `${seasonYear + 1}-03-20`,
        isLowerTierHome: false,
        matchday: 1,
      });
    }
  }

  return {
    id: 'caf_champions',
    name: 'TotalEnergies CAF Champions League',
    shortName: 'CAF Champions',
    season,
    trophyName: 'Trofeo de Campeones de África',
    currentRound: 'Cuartos de Final',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Initializes AFC Champions League with Asian powerhouses
 */
export function initializeAFCChampionsLeague(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const asianClubs = Object.values(clubsMap).filter(
    (c) => !!c.countryId && ['SAU', 'JPN', 'KOR', 'UAE', 'QAT', 'IRN'].includes(c.countryId)
  );

  const selected = asianClubs.slice(0, 8);
  const matches: CupMatch[] = [];

  for (let i = 0; i < selected.length; i += 2) {
    if (selected[i + 1]) {
      matches.push({
        id: `afc_qf_${selected[i].id}_${selected[i + 1].id}`,
        tournamentId: 'afc_champions',
        roundName: 'Cuartos de Final (Zona Este y Oeste)',
        homeTeamId: selected[i].id,
        awayTeamId: selected[i + 1].id,
        played: false,
        date: `${seasonYear + 1}-04-20`,
        isLowerTierHome: false,
        matchday: 1,
      });
    }
  }

  return {
    id: 'afc_champions',
    name: 'AFC Champions League Elite',
    shortName: 'AFC Champions',
    season,
    trophyName: 'Trofeo de Clubes de Asia',
    currentRound: 'Cuartos de Final',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Generic initializer for any national knockout cup tournament
 */
export function initializeNationalCup(
  id: string,
  name: string,
  shortName: string,
  trophyName: string,
  countryId: string,
  divisionPrefix: string,
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const allClubs = Object.values(clubsMap || {});

  // Robust match: countryId, divisionPrefix, or alternative country codes
  let eligible = allClubs.filter(
    (c) => c && (
      c.countryId?.toUpperCase() === countryId.toUpperCase() ||
      (c as any).country?.toUpperCase() === countryId.toUpperCase() ||
      (divisionPrefix && c.divisionId && c.divisionId.toLowerCase().startsWith(divisionPrefix.toLowerCase()))
    )
  );

  // Fallback for special country codes like KSA/SAU, NED/HOL, etc.
  if (eligible.length < 2) {
    eligible = allClubs.filter(
      (c) => c && (
        (countryId === 'KSA' && (c.countryId === 'SAU' || c.divisionId?.startsWith('sau_'))) ||
        (countryId === 'NED' && (c.countryId === 'NLD' || c.divisionId?.startsWith('ned_'))) ||
        (countryId === 'USA' && (c.countryId === 'USA' || c.divisionId?.startsWith('usa_'))) ||
        (countryId === 'MEX' && (c.countryId === 'MEX' || c.divisionId?.startsWith('mex_'))) ||
        (countryId === 'COL' && (c.countryId === 'COL' || c.divisionId?.startsWith('col_'))) ||
        (countryId === 'CHI' && (c.countryId === 'CHI' || c.divisionId?.startsWith('chi_'))) ||
        (countryId === 'URU' && (c.countryId === 'URU' || c.divisionId?.startsWith('uru_'))) ||
        (countryId === 'BEL' && (c.countryId === 'BEL' || c.divisionId?.startsWith('bel_'))) ||
        (countryId === 'SCO' && (c.countryId === 'SCO' || c.divisionId?.startsWith('sco_'))) ||
        (countryId === 'TUR' && (c.countryId === 'TUR' || c.divisionId?.startsWith('tur_'))) ||
        (countryId === 'GRE' && (c.countryId === 'GRE' || c.divisionId?.startsWith('gre_'))) ||
        (countryId === 'SUI' && (c.countryId === 'SUI' || c.divisionId?.startsWith('sui_'))) ||
        (countryId === 'JPN' && (c.countryId === 'JPN' || c.divisionId?.startsWith('jpn_'))) ||
        (countryId === 'RSA' && (c.countryId === 'ZAF' || c.divisionId?.startsWith('rsa_'))) ||
        (countryId === 'NGA' && (c.divisionId?.startsWith('nga_'))) ||
        (countryId === 'SEN' && (c.divisionId?.startsWith('sen_'))) ||
        (countryId === 'DZA' && (c.countryId === 'ALG' || c.divisionId?.startsWith('dza_')))
      )
    );
  }

  const sorted = [...eligible].sort((a, b) => (b.reputation || 50) - (a.reputation || 50));

  // Bracket power of 2: 16 (Octavos), 8 (Cuartos), 4 (Semifinales), 2 (Gran Final)
  let count = 0;
  if (sorted.length >= 16) count = 16;
  else if (sorted.length >= 8) count = 8;
  else if (sorted.length >= 4) count = 4;
  else if (sorted.length >= 2) count = 2;
  else count = Math.max(0, sorted.length - (sorted.length % 2));

  const participants = sorted.slice(0, count);
  const matches: CupMatch[] = [];

  const roundName = count >= 16 ? 'Octavos de Final' : count >= 8 ? 'Cuartos de Final' : count >= 4 ? 'Semifinales' : 'Gran Final';
  for (let i = 0; i < Math.floor(participants.length / 2); i++) {
    const higher = participants[i];
    const lower = participants[participants.length - 1 - i];
    if (!higher || !lower || higher.id === lower.id) continue;
    matches.push({
      id: `${id}_r1_${lower.id}_${higher.id}`,
      tournamentId: id,
      roundName,
      homeTeamId: lower.id,
      awayTeamId: higher.id,
      played: false,
      date: `${seasonYear}-11-18`,
      isLowerTierHome: true,
      matchday: 1,
    });
  }

  return {
    id,
    name,
    shortName,
    season,
    trophyName,
    currentRound: roundName,
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Initializes the UEFA Europa League (16 high-level European contenders)
 */
export function initializeUEFAEuropaLeague(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const euroClubs = Object.values(clubsMap).filter(
    (c) =>
      ['ESP', 'ENG', 'ITA', 'GER', 'FRA', 'POR', 'NED', 'TUR', 'BEL', 'SCO'].includes(c.countryId || '') &&
      (c.reputation >= 70 && c.reputation <= 84)
  ).sort((a, b) => b.reputation - a.reputation);

  const evenLen = euroClubs.length - (euroClubs.length % 2);
  const pool = euroClubs.slice(0, Math.min(16, evenLen));
  const matches: CupMatch[] = [];

  for (let i = 0; i < Math.floor(pool.length / 2); i++) {
    const higher = pool[i];
    const lower = pool[pool.length - 1 - i];
    if (!higher || !lower || higher.id === lower.id) continue;
    matches.push({
      id: `uel_r1_${lower.id}_${higher.id}`,
      tournamentId: 'uefa_europa_league',
      roundName: 'Octavos de Final',
      homeTeamId: lower.id,
      awayTeamId: higher.id,
      played: false,
      date: `${seasonYear + 1}-03-12`,
      isLowerTierHome: false,
      matchday: 1,
    });
  }

  return {
    id: 'uefa_europa_league',
    name: 'UEFA Europa League',
    shortName: 'Europa League',
    season,
    trophyName: 'Trofeo UEFA Europa League',
    currentRound: 'Octavos de Final',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Initializes the UEFA Conference League
 */
export function initializeUEFAConferenceLeague(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const euroClubs = Object.values(clubsMap || {}).filter(
    (c) =>
      c && ['ESP', 'ENG', 'ITA', 'GER', 'FRA', 'POR', 'NED', 'TUR', 'BEL', 'SCO', 'GRE', 'SUI'].includes(c.countryId || '') &&
      (c.reputation >= 65 && c.reputation < 76)
  ).sort((a, b) => b.reputation - a.reputation);

  const evenLen = euroClubs.length - (euroClubs.length % 2);
  const pool = euroClubs.slice(0, Math.min(16, evenLen));
  const matches: CupMatch[] = [];

  for (let i = 0; i < Math.floor(pool.length / 2); i++) {
    const higher = pool[i];
    const lower = pool[pool.length - 1 - i];
    if (!higher || !lower || higher.id === lower.id) continue;
    matches.push({
      id: `uecl_r1_${lower.id}_${higher.id}`,
      tournamentId: 'uefa_conference_league',
      roundName: 'Octavos de Final',
      homeTeamId: lower.id,
      awayTeamId: higher.id,
      played: false,
      date: `${seasonYear + 1}-03-19`,
      isLowerTierHome: false,
      matchday: 1,
    });
  }

  return {
    id: 'uefa_conference_league',
    name: 'UEFA Conference League',
    shortName: 'Conference League',
    season,
    trophyName: 'Trofeo UEFA Conference League',
    currentRound: 'Octavos de Final',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Initializes the FIFA Club World Cup (Mundial de Clubes cada 4 años)
 */
export function initializeFIFAClubWorldCup(
  clubsMap: Record<string, Club>,
  season: string = '2026/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const isGalacticEra = seasonYear >= 2226;

  let pool: Club[] = [];
  if (isGalacticEra) {
    const earthElite = Object.values(clubsMap || {})
      .filter((c) => c && !c.divisionId?.startsWith('gal_') && !c.id.startsWith('alien_'))
      .sort((a, b) => (b.reputation || 60) - (a.reputation || 60))
      .slice(0, 16);
    const galElite = Object.values(clubsMap || {})
      .filter((c) => c && (c.divisionId?.startsWith('gal_') || c.id.startsWith('alien_')))
      .sort((a, b) => (b.reputation || 60) - (a.reputation || 60))
      .slice(0, 16);
    pool = [...earthElite, ...galElite];
  } else {
    const worldElite = Object.values(clubsMap || {})
      .filter(Boolean)
      .sort((a, b) => (b.reputation || 60) - (a.reputation || 60));
    pool = worldElite.slice(0, Math.min(32, worldElite.length));
  }

  // Fallback pad to 32 clubs if needed
  const fallbackList = Object.values(clubsMap || {}).filter(Boolean);
  while (pool.length < 32 && fallbackList.length > 0) {
    pool.push(fallbackList[pool.length % fallbackList.length]);
  }

  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const matches: CupMatch[] = [];
  const standings: StandingsRow[] = [];

  // Distribute 32 clubs into 8 groups of 4
  for (let g = 0; g < 8; g++) {
    const groupClubs = [
      pool[g],              // Pot 1
      pool[15 - g] || pool[g + 8],   // Pot 2
      pool[16 + g] || pool[g + 16],  // Pot 3
      pool[31 - g] || pool[g + 24],  // Pot 4
    ].filter(Boolean);

    groupClubs.forEach((c) => {
      standings.push({
        teamId: c.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        recentForm: [],
      });
    });

    const gName = groupNames[g];
    if (groupClubs.length === 4) {
      // J1: 0 vs 1, 2 vs 3 (June 15)
      matches.push({
        id: `cwc_g${gName}_j1_1`,
        tournamentId: 'mundial_clubes_fifa',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[0].id,
        awayTeamId: groupClubs[1].id,
        played: false,
        date: `${seasonYear + 1}-06-15`,
        isLowerTierHome: false,
        matchday: 1,
      });
      matches.push({
        id: `cwc_g${gName}_j1_2`,
        tournamentId: 'mundial_clubes_fifa',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[2].id,
        awayTeamId: groupClubs[3].id,
        played: false,
        date: `${seasonYear + 1}-06-15`,
        isLowerTierHome: false,
        matchday: 1,
      });

      // J2: 0 vs 2, 1 vs 3 (June 19)
      matches.push({
        id: `cwc_g${gName}_j2_1`,
        tournamentId: 'mundial_clubes_fifa',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[0].id,
        awayTeamId: groupClubs[2].id,
        played: false,
        date: `${seasonYear + 1}-06-19`,
        isLowerTierHome: false,
        matchday: 2,
      });
      matches.push({
        id: `cwc_g${gName}_j2_2`,
        tournamentId: 'mundial_clubes_fifa',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[1].id,
        awayTeamId: groupClubs[3].id,
        played: false,
        date: `${seasonYear + 1}-06-19`,
        isLowerTierHome: false,
        matchday: 2,
      });

      // J3: 0 vs 3, 1 vs 2 (June 23)
      matches.push({
        id: `cwc_g${gName}_j3_1`,
        tournamentId: 'mundial_clubes_fifa',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[0].id,
        awayTeamId: groupClubs[3].id,
        played: false,
        date: `${seasonYear + 1}-06-23`,
        isLowerTierHome: false,
        matchday: 3,
      });
      matches.push({
        id: `cwc_g${gName}_j3_2`,
        tournamentId: 'mundial_clubes_fifa',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[1].id,
        awayTeamId: groupClubs[2].id,
        played: false,
        date: `${seasonYear + 1}-06-23`,
        isLowerTierHome: false,
        matchday: 3,
      });
    }
  }

  return {
    id: 'mundial_clubes_fifa',
    name: isGalacticEra ? 'Copa Universal de Clubes de la FIFA (32 Equipos)' : 'Copa Mundial de Clubes de la FIFA (32 Equipos)',
    shortName: isGalacticEra ? 'Copa Universal' : 'Mundial de Clubes FIFA',
    season,
    trophyName: isGalacticEra ? 'Trofeo Supremo Copa Universal de Clubes' : 'Trofeo Copa Mundial de Clubes FIFA',
    currentRound: 'Fase de Grupos',
    matches,
    championClubId: null,
    runnerUpClubId: null,
    standings,
  };
}

/**
 * Copa de las Galaxias: Annual knockout cup for all clubs of the 3 galactic divisions
 * (Galáctica 1, Galáctica 2 y Galáctica 3) starting in year 2226!
 */
export function initializeCopaDeLasGalaxias(
  clubsMap: Record<string, Club>,
  season: string = '2226/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2226;
  const galacticClubs = Object.values(clubsMap || {}).filter(
    (c) => c && (
      c.divisionId?.startsWith('gal_') ||
      c.id.startsWith('alien_') ||
      Boolean((c as any).isGalactic)
    )
  ).sort((a, b) => (b.reputation || 70) - (a.reputation || 70));

  const participants = galacticClubs.slice(0, Math.min(48, galacticClubs.length));
  const matches: CupMatch[] = [];

  if (participants.length >= 32) {
    // 32 teams play Ronda 1
    const roundClubs = participants.slice(participants.length - 32);
    for (let i = 0; i < 16; i++) {
      const home = roundClubs[i];
      const away = roundClubs[roundClubs.length - 1 - i];
      if (!home || !away) continue;
      matches.push({
        id: `cdg_r1_${home.id}_${away.id}`,
        tournamentId: 'copa_galaxias',
        roundName: 'Primera Ronda Cósmica',
        homeTeamId: home.id,
        awayTeamId: away.id,
        played: false,
        date: `${seasonYear}-10-14`,
        isLowerTierHome: false,
        matchday: 1,
      });
    }
  } else if (participants.length >= 2) {
    const count = participants.length >= 16 ? 16 : participants.length >= 8 ? 8 : participants.length >= 4 ? 4 : 2;
    const pool = participants.slice(0, count);
    const roundName = count >= 16 ? 'Octavos de Final' : count >= 8 ? 'Cuartos de Final' : count >= 4 ? 'Semifinales' : 'Gran Final';
    for (let i = 0; i < Math.floor(pool.length / 2); i++) {
      const home = pool[i];
      const away = pool[pool.length - 1 - i];
      if (!home || !away) continue;
      matches.push({
        id: `cdg_r1_${home.id}_${away.id}`,
        tournamentId: 'copa_galaxias',
        roundName,
        homeTeamId: home.id,
        awayTeamId: away.id,
        played: false,
        date: `${seasonYear}-10-14`,
        isLowerTierHome: false,
        matchday: 1,
      });
    }
  }

  return {
    id: 'copa_galaxias',
    name: 'Copa de las Galaxias',
    shortName: 'Copa Galaxias',
    season,
    trophyName: 'Trofeo Estrella Cósmica de las Galaxias',
    currentRound: matches[0]?.roundName || 'Primera Ronda',
    matches,
    championClubId: null,
    runnerUpClubId: null,
  };
}

/**
 * Resolves continental tournament qualifications for next season:
 * - Domestic Cup winners (e.g. Copa del Rey, FA Cup, DFB-Pokal, Coppa Italia, etc.) earn direct Champions League qualification.
 * - If the cup winner is already qualified via their domestic league (e.g. top 4 in Spain), the spot is reallocated to the next highest non-qualified league club (e.g. 5th place)!
 */
export function resolveContinentalQualification(
  save: any
): {
  championsLeagueIds: string[];
  europaLeagueIds: string[];
  conferenceLeagueIds: string[];
} {
  const championsLeagueIds = new Set<string>();
  const europaLeagueIds = new Set<string>();
  const conferenceLeagueIds = new Set<string>();

  const cups = save?.cupTournaments || {};
  const comps = save?.competitions || {};

  // League quotas (e.g. Spain: top 4 to UCL, England: top 4 to UCL, Italy: top 4, Germany: top 4, France: top 3, Portugal: top 2)
  const leagueConfigs: { compId: string; uclSlots: number; cupId: string }[] = [
    { compId: 'esp_tier1', uclSlots: 4, cupId: 'copa_del_rey' },
    { compId: 'eng_tier1', uclSlots: 4, cupId: 'fa_cup' },
    { compId: 'ger_tier1', uclSlots: 4, cupId: 'dfb_pokal' },
    { compId: 'ita_tier1', uclSlots: 4, cupId: 'coppa_italia' },
    { compId: 'fra_tier1', uclSlots: 3, cupId: 'coupe_france' },
    { compId: 'por_tier1', uclSlots: 2, cupId: 'taca_portugal' },
  ];

  leagueConfigs.forEach(({ compId, uclSlots, cupId }) => {
    const comp = comps[compId];
    const cup = cups[cupId];
    if (!comp?.standings || comp.standings.length === 0) return;

    const sortedTable = [...comp.standings].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    const leagueUclClubs = sortedTable.slice(0, uclSlots).map((s) => s.teamId);

    // Add league qualified clubs
    leagueUclClubs.forEach((id) => championsLeagueIds.add(id));

    // National Cup winner qualifies for Champions League!
    const cupWinnerId = cup?.championClubId;
    if (cupWinnerId) {
      if (championsLeagueIds.has(cupWinnerId)) {
        // Cup winner already qualified via league -> Reallocate cup spot to the next highest league club (e.g. 5th place)!
        const reallocatedClub = sortedTable.find((s) => !championsLeagueIds.has(s.teamId));
        if (reallocatedClub) {
          championsLeagueIds.add(reallocatedClub.teamId);
        }
      } else {
        // Cup winner qualifies directly for Champions League!
        championsLeagueIds.add(cupWinnerId);
      }
    }
  });

  return {
    championsLeagueIds: Array.from(championsLeagueIds),
    europaLeagueIds: Array.from(europaLeagueIds),
    conferenceLeagueIds: Array.from(conferenceLeagueIds),
  };
}

/**
 * Copa Intergaláctica de Clubes: Exactly 64 clubs (20 Earth elite + 44 Galactic clubs)
 * Structured with 16 groups of 4 (Groups A through P, 3 matches each),
 * where top 2 advance to Round of 32 (Dieciseisavos), then Octavos, Cuartos, Semis, and Gran Final!
 * Runs annually from year 2226 onward!
 */
export function initializeCopaIntergalactica(
  clubsMap: Record<string, Club>,
  season: string = '2226/27'
): KnockoutTournamentState {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2226;

  // 1. 20 Earth Elite Clubs (sorted by reputation & domestic performance)
  const earthClubs = Object.values(clubsMap || {})
    .filter((c) => c && !c.divisionId?.startsWith('gal_') && !c.id.startsWith('alien_') && !Boolean((c as any).isGalactic))
    .sort((a, b) => (b.reputation || 60) - (a.reputation || 60))
    .slice(0, 20);

  // 2. 44 Galactic Clubs (from Galáctica 1, 2, 3)
  const galClubs = Object.values(clubsMap || {})
    .filter((c) => c && (c.divisionId?.startsWith('gal_') || c.id.startsWith('alien_') || Boolean((c as any).isGalactic)))
    .sort((a, b) => (b.reputation || 60) - (a.reputation || 60))
    .slice(0, 44);

  // Pad to 64 if database is missing enough clubs in early tests
  const pool: Club[] = [...earthClubs, ...galClubs];
  const allClubs = Object.values(clubsMap || {}).filter(Boolean);
  while (pool.length < 64 && allClubs.length > 0) {
    pool.push(allClubs[pool.length % allClubs.length]);
  }

  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  const matches: CupMatch[] = [];
  const standings: StandingsRow[] = [];

  // Distribute 64 clubs into 16 groups of 4 (Groups A through P)
  for (let g = 0; g < 16; g++) {
    const groupClubs = [
      pool[g],               // Seed / Pot 1
      pool[31 - g] || pool[g + 16],   // Pot 2
      pool[32 + g] || pool[g + 32],   // Pot 3
      pool[63 - g] || pool[g + 48],   // Pot 4
    ].filter(Boolean);

    groupClubs.forEach((c) => {
      standings.push({
        teamId: c.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        recentForm: [],
      });
    });

    const gName = groupNames[g];
    if (groupClubs.length === 4) {
      // J1: 0 vs 1, 2 vs 3 (Septiembre)
      matches.push({
        id: `interg_g${gName}_j1_1`,
        tournamentId: 'copa_intergalactica',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[0].id,
        awayTeamId: groupClubs[1].id,
        played: false,
        date: `${seasonYear}-09-23`,
        isLowerTierHome: false,
        matchday: 1,
      });
      matches.push({
        id: `interg_g${gName}_j1_2`,
        tournamentId: 'copa_intergalactica',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[2].id,
        awayTeamId: groupClubs[3].id,
        played: false,
        date: `${seasonYear}-09-23`,
        isLowerTierHome: false,
        matchday: 1,
      });

      // J2: 0 vs 2, 1 vs 3 (Octubre)
      matches.push({
        id: `interg_g${gName}_j2_1`,
        tournamentId: 'copa_intergalactica',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[0].id,
        awayTeamId: groupClubs[2].id,
        played: false,
        date: `${seasonYear}-10-21`,
        isLowerTierHome: false,
        matchday: 2,
      });
      matches.push({
        id: `interg_g${gName}_j2_2`,
        tournamentId: 'copa_intergalactica',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[1].id,
        awayTeamId: groupClubs[3].id,
        played: false,
        date: `${seasonYear}-10-21`,
        isLowerTierHome: false,
        matchday: 2,
      });

      // J3: 0 vs 3, 1 vs 2 (Noviembre)
      matches.push({
        id: `interg_g${gName}_j3_1`,
        tournamentId: 'copa_intergalactica',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[0].id,
        awayTeamId: groupClubs[3].id,
        played: false,
        date: `${seasonYear}-11-25`,
        isLowerTierHome: false,
        matchday: 3,
      });
      matches.push({
        id: `interg_g${gName}_j3_2`,
        tournamentId: 'copa_intergalactica',
        roundName: `Fase de Grupos - Grupo ${gName}`,
        homeTeamId: groupClubs[1].id,
        awayTeamId: groupClubs[2].id,
        played: false,
        date: `${seasonYear}-11-25`,
        isLowerTierHome: false,
        matchday: 3,
      });
    }
  }

  return {
    id: 'copa_intergalactica',
    name: 'Copa Intergaláctica de Clubes (64 Clubes)',
    shortName: 'Copa Intergaláctica',
    season,
    trophyName: 'Trofeo Supremo del Cosmos',
    currentRound: 'Fase de Grupos',
    matches,
    championClubId: null,
    runnerUpClubId: null,
    standings,
  };
}

/**
 * Initializes all active cup tournaments for a season across all countries and continents
 */
export function initializeAllTournaments(
  clubsMap: Record<string, Club>,
  season: string = '2026/27',
  userClubId?: string,
  guaranteedChampionsLeagueClubIds: string[] = []
): Record<string, KnockoutTournamentState> {
  const seasonYear = parseInt(season.slice(0, 4), 10) || 2026;
  const isClubWorldCupYear = seasonYear % 4 === 1; // 2025, 2029, etc.

  const tournaments: Record<string, KnockoutTournamentState> = {
    // España
    copa_del_rey: initializeCopaDelRey(clubsMap, season),
    supercopa_espana: initializeSupercopaEspana(clubsMap, season),
    // Inglaterra
    fa_cup: initializeNationalCup('fa_cup', 'The Emirates FA Cup', 'FA Cup', 'FA Cup Trophy', 'ENG', 'eng_', clubsMap, season),
    carabao_cup: initializeNationalCup('carabao_cup', 'Carabao Cup (EFL Cup)', 'Carabao Cup', 'Carabao Cup Trophy', 'ENG', 'eng_', clubsMap, season),
    // Alemania
    dfb_pokal: initializeNationalCup('dfb_pokal', 'DFB-Pokal', 'DFB-Pokal', 'DFB-Pokal Trophäe', 'GER', 'ger_', clubsMap, season),
    // Italia
    coppa_italia: initializeNationalCup('coppa_italia', 'Coppa Italia Frecciarossa', 'Coppa Italia', 'Trofeo Coppa Italia', 'ITA', 'ita_', clubsMap, season),
    // Francia
    coupe_france: initializeNationalCup('coupe_france', 'Coupe de France', 'Coupe de France', 'Trophée Coupe de France', 'FRA', 'fra_', clubsMap, season),
    // Portugal
    taca_portugal: initializeNationalCup('taca_portugal', 'Taça de Portugal Placard', 'Taça de Portugal', 'Taça de Portugal', 'POR', 'por_', clubsMap, season),
    // Marruecos
    coupe_du_trone: initializeNationalCup('coupe_du_trone', 'Coupe du Trône', 'Coupe du Trône', 'Coupe du Trône du Maroc', 'MAR', 'mar_', clubsMap, season),
    // Egipto
    egypt_cup: initializeNationalCup('egypt_cup', 'Copa de Egipto (Egypt Cup)', 'Egypt Cup', 'Egypt FA Cup', 'EGY', 'egy_', clubsMap, season),
    // Sudáfrica
    nedbank_cup: initializeNationalCup('nedbank_cup', 'Nedbank Cup (Sudáfrica)', 'Nedbank Cup', 'Nedbank Cup Trophy', 'RSA', 'rsa_', clubsMap, season),
    // Nigeria
    nigeria_fa_cup: initializeNationalCup('nigeria_fa_cup', 'President Federation Cup (Nigeria)', 'Nigeria FA Cup', 'Nigeria Cup Trophy', 'NGA', 'nga_', clubsMap, season),
    // Senegal
    coupe_senegal: initializeNationalCup('coupe_senegal', 'Coupe du Sénégal', 'Coupe du Sénégal', 'Trophée Coupe du Sénégal', 'SEN', 'sen_', clubsMap, season),
    // Argelia
    coupe_algerie: initializeNationalCup('coupe_algerie', 'Coupe d\'Algérie de Football', 'Coupe d\'Algérie', 'Trophée Coupe d\'Algérie', 'DZA', 'dza_', clubsMap, season),
    // Argentina
    copa_argentina: initializeNationalCup('copa_argentina', 'Copa Argentina AXION energy', 'Copa Argentina', 'Copa Argentina', 'ARG', 'arg_', clubsMap, season),
    // Brasil
    copa_brasil: initializeNationalCup('copa_brasil', 'Copa do Brasil Betano', 'Copa do Brasil', 'Taça da Copa do Brasil', 'BRA', 'bra_', clubsMap, season),
    // Países Bajos (Holanda)
    knvb_beker: initializeNationalCup('knvb_beker', 'KNVB Beker (Copa de los Países Bajos)', 'KNVB Beker', 'Den Dennenappel (KNVB Beker)', 'NED', 'ned_', clubsMap, season),
    // Bélgica
    croky_cup: initializeNationalCup('croky_cup', 'Croky Cup (Copa de Bélgica)', 'Croky Cup', 'Beker van België Trophy', 'BEL', 'bel_', clubsMap, season),
    // Escocia
    scottish_cup: initializeNationalCup('scottish_cup', 'Scottish Cup (Copa de Escocia)', 'Scottish Cup', 'Scottish Cup Trophy', 'SCO', 'sco_', clubsMap, season),
    // Turquía
    turkey_cup: initializeNationalCup('turkey_cup', 'Ziraat Türkiye Kupası (Copa de Turquía)', 'Türkiye Kupası', 'Türkiye Kupası Kupası', 'TUR', 'tur_', clubsMap, season),
    // Grecia
    greek_cup: initializeNationalCup('greek_cup', 'Betsson Kypello Elladas (Copa de Grecia)', 'Kypello Elladas', 'Kypello Elladas Trophy', 'GRE', 'gre_', clubsMap, season),
    // Suiza
    swiss_cup: initializeNationalCup('swiss_cup', 'Schweizer Cup (Copa de Suiza)', 'Schweizer Cup', 'Schweizer Cup Pokal', 'SUI', 'sui_', clubsMap, season),
    // Arabia Saudí
    kings_cup_saudi: initializeNationalCup('kings_cup_saudi', 'King\'s Cup (Copa del Rey Saudí)', 'King\'s Cup', 'Trofeo Copa del Rey Saudí', 'KSA', 'sau_', clubsMap, season),
    // Japón
    emperors_cup: initializeNationalCup('emperors_cup', 'Emperor\'s Cup (Copa del Emperador de Japón)', 'Emperor\'s Cup', 'Emperor\'s Cup Trophy', 'JPN', 'jpn_', clubsMap, season),
    // Estados Unidos
    us_open_cup: initializeNationalCup('us_open_cup', 'Lamar Hunt U.S. Open Cup', 'U.S. Open Cup', 'Lamar Hunt Trophy', 'USA', 'usa_', clubsMap, season),
    // México
    copa_mx: initializeNationalCup('copa_mx', 'Copa MX', 'Copa MX', 'Trofeo Copa MX', 'MEX', 'mex_', clubsMap, season),
    // Colombia
    copa_colombia: initializeNationalCup('copa_colombia', 'Copa BetPlay Dimayor (Colombia)', 'Copa Colombia', 'Trofeo Copa BetPlay', 'COL', 'col_', clubsMap, season),
    // Chile
    copa_chile: initializeNationalCup('copa_chile', 'Copa Chile Coca-Cola Sin Azúcar', 'Copa Chile', 'Trofeo Copa Chile', 'CHI', 'chi_', clubsMap, season),
    // Uruguay
    copa_uruguay: initializeNationalCup('copa_uruguay', 'Copa AUF Uruguay', 'Copa Uruguay', 'Trofeo Copa AUF Uruguay', 'URU', 'uru_', clubsMap, season),
    // Torneos Continentales
    uefa_champions: initializeUEFAChampionsLeague(clubsMap, season, userClubId, guaranteedChampionsLeagueClubIds),
    uefa_europa_league: initializeUEFAEuropaLeague(clubsMap, season),
    uefa_conference_league: initializeUEFAConferenceLeague(clubsMap, season),
    copa_libertadores: initializeCopaLibertadores(clubsMap, season),
    caf_champions: initializeCAFChampionsLeague(clubsMap, season),
    afc_champions: initializeAFCChampionsLeague(clubsMap, season),
  };

  if (isClubWorldCupYear || seasonYear >= 2226) {
    tournaments.mundial_clubes_fifa = initializeFIFAClubWorldCup(clubsMap, season);
  }

  // Annual Intergalactic Tournaments starting in 2226
  if (seasonYear >= 2226) {
    tournaments.copa_galaxias = initializeCopaDeLasGalaxias(clubsMap, season);
    tournaments.copa_intergalactica = initializeCopaIntergalactica(clubsMap, season);
  }

  return tournaments;
}

/**
 * Ensures all domestic cups exist, are registered, and have participating teams from that country's leagues.
 * If any cup in an existing save is missing or has 0 matches, it rebuilds that tournament's bracket.
 */
export function ensureCompleteCupTournaments(
  clubsMap: Record<string, Club>,
  existingCups: Record<string, KnockoutTournamentState> | undefined,
  season: string = '2026/27',
  userClubId?: string
): Record<string, KnockoutTournamentState> {
  const fresh = initializeAllTournaments(clubsMap, season, userClubId);
  if (!existingCups || Object.keys(existingCups).length === 0) {
    return fresh;
  }

  const merged: Record<string, KnockoutTournamentState> = { ...fresh };
  for (const [key, cup] of Object.entries(existingCups)) {
    // If the existing cup has matches and participants, preserve it!
    if (cup && cup.matches && cup.matches.length > 0) {
      merged[key] = cup;
    }
  }

  // Guarantee that every single cup has participating clubs and matches
  for (const [key, cup] of Object.entries(merged)) {
    if (!cup.matches || cup.matches.length === 0) {
      if (fresh[key] && fresh[key].matches && fresh[key].matches.length > 0) {
        merged[key] = fresh[key];
      }
    }
  }

  return merged;
}

/**
 * Updates a cup tournament's standings given a played League Phase match
 */
export function updateCupStandingsWithMatch(
  standings: StandingsRow[],
  match: CupMatch
): StandingsRow[] {
  if (!match.played || match.homeScore === undefined || match.awayScore === undefined) {
    return standings;
  }
  const updated = standings.map((s) => ({ ...s }));
  const homeRow = updated.find((s) => s.teamId === match.homeTeamId);
  const awayRow = updated.find((s) => s.teamId === match.awayTeamId);

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
    awayRow.lost += 1;
    homeRow.recentForm = [...(homeRow.recentForm || []).slice(-4), 'V'];
    awayRow.recentForm = [...(awayRow.recentForm || []).slice(-4), 'D'];
  } else if (match.homeScore < match.awayScore) {
    awayRow.won += 1;
    awayRow.points += 3;
    homeRow.lost += 1;
    awayRow.recentForm = [...(awayRow.recentForm || []).slice(-4), 'V'];
    homeRow.recentForm = [...(homeRow.recentForm || []).slice(-4), 'D'];
  } else {
    homeRow.drawn += 1;
    homeRow.points += 1;
    awayRow.drawn += 1;
    awayRow.points += 1;
    homeRow.recentForm = [...(homeRow.recentForm || []).slice(-4), 'E'];
    awayRow.recentForm = [...(awayRow.recentForm || []).slice(-4), 'E'];
  }

  updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return updated;
}

/**
 * Progresses cup tournaments through subsequent rounds when all matches of the current round are completed.
 */
export function progressCupTournament(
  tourn: KnockoutTournamentState,
  clubsMap: Record<string, Club>
): KnockoutTournamentState {
  const updated = { ...tourn };
  const seasonYear = parseInt(updated.season.slice(0, 4), 10) || 2026;

  // 1. UEFA Champions League progression
  if (updated.id === 'uefa_champions') {
    const leaguePhaseMatches = updated.matches.filter((m) => m.roundName?.startsWith('Fase de Liga'));
    const allLeaguePhasePlayed = leaguePhaseMatches.length > 0 && leaguePhaseMatches.every((m) => m.played);

    // After 8 matchdays of League Phase -> Generate 16avos de Final (Top 32 clubs)
    const has16avos = updated.matches.some((m) => m.roundName.includes('16avos') || m.roundName.includes('Dieciseisavos'));
    if (allLeaguePhasePlayed && !has16avos && updated.standings) {
      const sorted = [...updated.standings].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return b.won - a.won;
      });

      // Top 32 clubs qualify to 16avos de Final (ranks 1 to 32)
      const qualifiedClubs = sorted.slice(0, 32).map((s) => s.teamId);
      const r32Matches: CupMatch[] = [];

      for (let i = 0; i < 16; i++) {
        const higherSeed = qualifiedClubs[i];
        const lowerSeed = qualifiedClubs[31 - i];
        r32Matches.push({
          id: `ucl_r32_${higherSeed}_${lowerSeed}`,
          tournamentId: 'uefa_champions',
          roundName: '16avos de Final',
          homeTeamId: higherSeed,
          awayTeamId: lowerSeed,
          played: false,
          date: `${seasonYear + 1}-02-18`,
          isLowerTierHome: false,
          matchday: 9,
        });
      }

      updated.matches = [...updated.matches, ...r32Matches];
      updated.currentRound = '16avos de Final';
      return updated;
    }

    // After 16avos -> Generate Octavos de Final (16 winners -> 8 matches)
    const r32Matches = updated.matches.filter((m) => m.roundName === '16avos de Final');
    const allR32Played = r32Matches.length > 0 && r32Matches.every((m) => m.played);
    const hasOctavos = updated.matches.some((m) => m.roundName === 'Octavos de Final');

    if (allR32Played && !hasOctavos) {
      const r32Winners = r32Matches.map(getCupMatchWinner);

      const r16Matches: CupMatch[] = [];
      for (let i = 0; i < 8; i++) {
        r16Matches.push({
          id: `ucl_r16_${r32Winners[i * 2]}_${r32Winners[i * 2 + 1]}`,
          tournamentId: 'uefa_champions',
          roundName: 'Octavos de Final',
          homeTeamId: r32Winners[i * 2],
          awayTeamId: r32Winners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-03-11`,
          isLowerTierHome: false,
          matchday: 10,
        });
      }

      updated.matches = [...updated.matches, ...r16Matches];
      updated.currentRound = 'Octavos de Final';
      return updated;
    }

    // After Octavos -> Generate Cuartos de Final (8 winners -> 4 matches)
    const r16Matches = updated.matches.filter((m) => m.roundName === 'Octavos de Final');
    const allR16Played = r16Matches.length > 0 && r16Matches.every((m) => m.played);
    const hasCuartos = updated.matches.some((m) => m.roundName === 'Cuartos de Final');

    if (allR16Played && !hasCuartos) {
      const r16Winners = r16Matches.map(getCupMatchWinner);
      const qfMatches: CupMatch[] = [];
      for (let i = 0; i < 4; i++) {
        qfMatches.push({
          id: `ucl_qf_${r16Winners[i * 2]}_${r16Winners[i * 2 + 1]}`,
          tournamentId: 'uefa_champions',
          roundName: 'Cuartos de Final',
          homeTeamId: r16Winners[i * 2],
          awayTeamId: r16Winners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-04-07`,
          isLowerTierHome: false,
          matchday: 11,
        });
      }
      updated.matches = [...updated.matches, ...qfMatches];
      updated.currentRound = 'Cuartos de Final';
      return updated;
    }

    // After Cuartos -> Generate Semifinales
    const qfMatches = updated.matches.filter((m) => m.roundName === 'Cuartos de Final');
    const allQfPlayed = qfMatches.length > 0 && qfMatches.every((m) => m.played);
    const hasSemis = updated.matches.some((m) => m.roundName === 'Semifinales');

    if (allQfPlayed && !hasSemis) {
      const qfWinners = qfMatches.map(getCupMatchWinner);
      const sfMatches: CupMatch[] = [];
      for (let i = 0; i < 2; i++) {
        sfMatches.push({
          id: `ucl_sf_${qfWinners[i * 2]}_${qfWinners[i * 2 + 1]}`,
          tournamentId: 'uefa_champions',
          roundName: 'Semifinales',
          homeTeamId: qfWinners[i * 2],
          awayTeamId: qfWinners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-04-28`,
          isLowerTierHome: false,
          matchday: 12,
        });
      }
      updated.matches = [...updated.matches, ...sfMatches];
      updated.currentRound = 'Semifinales';
      return updated;
    }

    // After Semifinales -> Generate Gran Final
    const sfMatches = updated.matches.filter((m) => m.roundName === 'Semifinales');
    const allSfPlayed = sfMatches.length > 0 && sfMatches.every((m) => m.played);
    const hasFinal = updated.matches.some((m) => m.roundName === 'Gran Final');

    if (allSfPlayed && !hasFinal) {
      const sfWinners = sfMatches.map(getCupMatchWinner);
      updated.matches = [
        ...updated.matches,
        {
          id: `ucl_final_${sfWinners[0]}_${sfWinners[1]}`,
          tournamentId: 'uefa_champions',
          roundName: 'Gran Final',
          homeTeamId: sfWinners[0],
          awayTeamId: sfWinners[1],
          played: false,
          date: `${seasonYear + 1}-05-30`,
          isLowerTierHome: false,
          neutralVenue: 'Allianz Arena (Múnich)',
          matchday: 13,
        },
      ];
      updated.currentRound = 'Gran Final';
      return updated;
    }

    // Complete tournament after Final
    const finalMatch = updated.matches.find((m) => m.roundName === 'Gran Final');
    if (finalMatch && finalMatch.played && !updated.championClubId) {
      updated.championClubId = getCupMatchWinner(finalMatch);
      updated.runnerUpClubId = getCupMatchLoser(finalMatch);
      updated.currentRound = 'Finalizado';
    }
  }

  // 2. Copa del Rey progression
  if (updated.id === 'copa_del_rey') {
    const r1Matches = updated.matches.filter((m) => m.roundName.includes('Primera Ronda'));
    const allR1Played = r1Matches.length > 0 && r1Matches.every((m) => m.played);
    const hasDieciseisavos = updated.matches.some((m) => m.roundName.includes('Dieciseisavos'));

    if (allR1Played && !hasDieciseisavos) {
      const r1Winners = r1Matches.map(getCupMatchWinner);
      const r32Matches: CupMatch[] = [];
      for (let i = 0; i < Math.floor(r1Winners.length / 2); i++) {
        r32Matches.push({
          id: `cdr_r32_${r1Winners[i]}_${r1Winners[r1Winners.length - 1 - i]}`,
          tournamentId: 'copa_del_rey',
          roundName: 'Dieciseisavos de Final (Partido Único)',
          homeTeamId: r1Winners[i],
          awayTeamId: r1Winners[r1Winners.length - 1 - i],
          played: false,
          date: `${seasonYear}-11-26`,
          isLowerTierHome: false,
          matchday: 2,
        });
      }
      updated.matches = [...updated.matches, ...r32Matches];
      updated.currentRound = 'Dieciseisavos de Final';
      return updated;
    }

    // Octavos
    const r32Matches = updated.matches.filter((m) => m.roundName.includes('Dieciseisavos'));
    const allR32Played = r32Matches.length > 0 && r32Matches.every((m) => m.played);
    const hasOctavos = updated.matches.some((m) => m.roundName.includes('Octavos'));

    if (allR32Played && !hasOctavos) {
      const r32Winners = r32Matches.map(getCupMatchWinner);
      const r16Matches: CupMatch[] = [];
      for (let i = 0; i < Math.floor(r32Winners.length / 2); i++) {
        r16Matches.push({
          id: `cdr_r16_${r32Winners[i * 2]}_${r32Winners[i * 2 + 1]}`,
          tournamentId: 'copa_del_rey',
          roundName: 'Octavos de Final',
          homeTeamId: r32Winners[i * 2],
          awayTeamId: r32Winners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-01-07`,
          isLowerTierHome: false,
          matchday: 3,
        });
      }
      updated.matches = [...updated.matches, ...r16Matches];
      updated.currentRound = 'Octavos de Final';
      return updated;
    }

    // Cuartos
    const r16Matches = updated.matches.filter((m) => m.roundName.includes('Octavos'));
    const allR16Played = r16Matches.length > 0 && r16Matches.every((m) => m.played);
    const hasCuartos = updated.matches.some((m) => m.roundName.includes('Cuartos'));

    if (allR16Played && !hasCuartos) {
      const r16Winners = r16Matches.map(getCupMatchWinner);
      const qfMatches: CupMatch[] = [];
      for (let i = 0; i < Math.floor(r16Winners.length / 2); i++) {
        qfMatches.push({
          id: `cdr_qf_${r16Winners[i * 2]}_${r16Winners[i * 2 + 1]}`,
          tournamentId: 'copa_del_rey',
          roundName: 'Cuartos de Final',
          homeTeamId: r16Winners[i * 2],
          awayTeamId: r16Winners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-02-04`,
          isLowerTierHome: false,
          matchday: 4,
        });
      }
      updated.matches = [...updated.matches, ...qfMatches];
      updated.currentRound = 'Cuartos de Final';
      return updated;
    }

    // Semifinales
    const qfMatches = updated.matches.filter((m) => m.roundName.includes('Cuartos'));
    const allQfPlayed = qfMatches.length > 0 && qfMatches.every((m) => m.played);
    const hasSemis = updated.matches.some((m) => m.roundName.includes('Semifinales'));

    if (allQfPlayed && !hasSemis) {
      const qfWinners = qfMatches.map(getCupMatchWinner);
      const sfMatches: CupMatch[] = [];
      for (let i = 0; i < 2; i++) {
        sfMatches.push({
          id: `cdr_sf_${qfWinners[i * 2]}_${qfWinners[i * 2 + 1]}`,
          tournamentId: 'copa_del_rey',
          roundName: 'Semifinales',
          homeTeamId: qfWinners[i * 2],
          awayTeamId: qfWinners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-03-04`,
          isLowerTierHome: false,
          matchday: 5,
        });
      }
      updated.matches = [...updated.matches, ...sfMatches];
      updated.currentRound = 'Semifinales';
      return updated;
    }

    // Gran Final
    const sfMatches = updated.matches.filter((m) => m.roundName.includes('Semifinales'));
    const allSfPlayed = sfMatches.length > 0 && sfMatches.every((m) => m.played);
    const hasFinal = updated.matches.some((m) => m.roundName.includes('Gran Final'));

    if (allSfPlayed && !hasFinal) {
      const sfWinners = sfMatches.map(getCupMatchWinner);
      updated.matches = [
        ...updated.matches,
        {
          id: `cdr_final_${sfWinners[0]}_${sfWinners[1]}`,
          tournamentId: 'copa_del_rey',
          roundName: 'Gran Final (Estadio de La Cartuja)',
          homeTeamId: sfWinners[0],
          awayTeamId: sfWinners[1],
          played: false,
          date: `${seasonYear + 1}-04-25`,
          isLowerTierHome: false,
          neutralVenue: 'Estadio de La Cartuja (Sevilla)',
          matchday: 6,
        },
      ];
      updated.currentRound = 'Gran Final';
      return updated;
    }

    // Final played
    const finalMatch = updated.matches.find((m) => m.roundName.includes('Gran Final'));
    if (finalMatch && finalMatch.played && !updated.championClubId) {
      updated.championClubId = getCupMatchWinner(finalMatch);
      updated.runnerUpClubId = getCupMatchLoser(finalMatch);
      updated.currentRound = 'Finalizado';
    }
  }

  // 3. Supercopa de España
  if (updated.id === 'supercopa_espana') {
    const sfMatches = updated.matches.filter((m) => m.roundName.includes('Semifinal'));
    const allSfPlayed = sfMatches.length === 2 && sfMatches.every((m) => m.played);
    const hasFinal = updated.matches.some((m) => m.roundName.includes('Gran Final'));

    if (allSfPlayed && !hasFinal) {
      const sfWinners = sfMatches.map(getCupMatchWinner);
      updated.matches = [
        ...updated.matches,
        {
          id: `sce_final_${sfWinners[0]}_${sfWinners[1]}`,
          tournamentId: 'supercopa_espana',
          roundName: 'Gran Final de la Supercopa',
          homeTeamId: sfWinners[0],
          awayTeamId: sfWinners[1],
          played: false,
          date: `${seasonYear + 1}-01-18`,
          isLowerTierHome: false,
          neutralVenue: 'King Abdullah Stadium',
          matchday: 3,
        },
      ];
      updated.currentRound = 'Gran Final';
      return updated;
    }

    const finalMatch = updated.matches.find((m) => m.roundName.includes('Gran Final'));
    if (finalMatch && finalMatch.played && !updated.championClubId) {
      updated.championClubId = getCupMatchWinner(finalMatch);
      updated.runnerUpClubId = getCupMatchLoser(finalMatch);
      updated.currentRound = 'Finalizado';
    }
  }

  // 3.1 FIFA Club World Cup (32 teams: 8 groups -> Octavos -> Cuartos -> Semis -> Gran Final)
  if (updated.id === 'mundial_clubes_fifa') {
    const groupMatches = updated.matches.filter((m) => m.roundName?.includes('Fase de Grupos'));
    const allGroupPlayed = groupMatches.length > 0 && groupMatches.every((m) => m.played);
    const hasOctavos = updated.matches.some((m) => m.roundName === 'Octavos de Final');

    if (allGroupPlayed && !hasOctavos) {
      const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const qualifiedFirst: string[] = [];
      const qualifiedSecond: string[] = [];

      groupNames.forEach((gName) => {
        const gMatches = groupMatches.filter((m) => m.roundName?.includes(`Grupo ${gName}`));
        const teamStats: Record<string, { pts: number; gd: number; gf: number }> = {};
        gMatches.forEach((m) => {
          if (!teamStats[m.homeTeamId]) teamStats[m.homeTeamId] = { pts: 0, gd: 0, gf: 0 };
          if (!teamStats[m.awayTeamId]) teamStats[m.awayTeamId] = { pts: 0, gd: 0, gf: 0 };
          const hs = m.homeScore ?? 0;
          const as = m.awayScore ?? 0;
          teamStats[m.homeTeamId].gf += hs;
          teamStats[m.awayTeamId].gf += as;
          teamStats[m.homeTeamId].gd += (hs - as);
          teamStats[m.awayTeamId].gd += (as - hs);
          if (hs > as) {
            teamStats[m.homeTeamId].pts += 3;
          } else if (hs < as) {
            teamStats[m.awayTeamId].pts += 3;
          } else {
            teamStats[m.homeTeamId].pts += 1;
            teamStats[m.awayTeamId].pts += 1;
          }
        });

        const sortedTeams = Object.keys(teamStats).sort((a, b) => {
          if (teamStats[b].pts !== teamStats[a].pts) return teamStats[b].pts - teamStats[a].pts;
          if (teamStats[b].gd !== teamStats[a].gd) return teamStats[b].gd - teamStats[a].gd;
          return teamStats[b].gf - teamStats[a].gf;
        });

        if (sortedTeams[0]) qualifiedFirst.push(sortedTeams[0]);
        if (sortedTeams[1]) qualifiedSecond.push(sortedTeams[1]);
      });

      const r16Matches: CupMatch[] = [];
      for (let i = 0; i < 8; i++) {
        const t1 = qualifiedFirst[i];
        const t2 = qualifiedSecond[(i + 1) % 8];
        if (t1 && t2) {
          r16Matches.push({
            id: `cwc_r16_${t1}_${t2}`,
            tournamentId: 'mundial_clubes_fifa',
            roundName: 'Octavos de Final',
            homeTeamId: t1,
            awayTeamId: t2,
            played: false,
            date: `${seasonYear + 1}-06-27`,
            isLowerTierHome: false,
            matchday: 4,
          });
        }
      }

      updated.matches = [...updated.matches, ...r16Matches];
      updated.currentRound = 'Octavos de Final';
      return updated;
    }
  }

  // 3.2 Copa Intergaláctica de Clubes (64 clubs: 16 groups of 4 -> Dieciseisavos -> Octavos -> Cuartos -> Semis -> Final)
  if (updated.id === 'copa_intergalactica') {
    const groupMatches = updated.matches.filter((m) => m.roundName?.includes('Fase de Grupos'));
    const allGroupPlayed = groupMatches.length > 0 && groupMatches.every((m) => m.played);
    const hasDieciseisavos = updated.matches.some((m) => m.roundName.includes('Dieciseisavos'));

    if (allGroupPlayed && !hasDieciseisavos) {
      const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
      const qualifiedFirst: string[] = [];
      const qualifiedSecond: string[] = [];

      groupNames.forEach((gName) => {
        const gMatches = groupMatches.filter((m) => m.roundName?.includes(`Grupo ${gName}`));
        const teamStats: Record<string, { pts: number; gd: number; gf: number }> = {};
        gMatches.forEach((m) => {
          if (!teamStats[m.homeTeamId]) teamStats[m.homeTeamId] = { pts: 0, gd: 0, gf: 0 };
          if (!teamStats[m.awayTeamId]) teamStats[m.awayTeamId] = { pts: 0, gd: 0, gf: 0 };
          const hs = m.homeScore ?? 0;
          const as = m.awayScore ?? 0;
          teamStats[m.homeTeamId].gf += hs;
          teamStats[m.awayTeamId].gf += as;
          teamStats[m.homeTeamId].gd += (hs - as);
          teamStats[m.awayTeamId].gd += (as - hs);
          if (hs > as) {
            teamStats[m.homeTeamId].pts += 3;
          } else if (hs < as) {
            teamStats[m.awayTeamId].pts += 3;
          } else {
            teamStats[m.homeTeamId].pts += 1;
            teamStats[m.awayTeamId].pts += 1;
          }
        });

        const sortedTeams = Object.keys(teamStats).sort((a, b) => {
          if (teamStats[b].pts !== teamStats[a].pts) return teamStats[b].pts - teamStats[a].pts;
          if (teamStats[b].gd !== teamStats[a].gd) return teamStats[b].gd - teamStats[a].gd;
          return teamStats[b].gf - teamStats[a].gf;
        });

        if (sortedTeams[0]) qualifiedFirst.push(sortedTeams[0]);
        if (sortedTeams[1]) qualifiedSecond.push(sortedTeams[1]);
      });

      const r32Matches: CupMatch[] = [];
      for (let i = 0; i < 16; i++) {
        const t1 = qualifiedFirst[i];
        const t2 = qualifiedSecond[(i + 1) % 16];
        if (t1 && t2) {
          r32Matches.push({
            id: `interg_r32_${t1}_${t2}`,
            tournamentId: 'copa_intergalactica',
            roundName: 'Dieciseisavos de Final',
            homeTeamId: t1,
            awayTeamId: t2,
            played: false,
            date: `${seasonYear + 1}-02-18`,
            isLowerTierHome: false,
            matchday: 4,
          });
        }
      }

      updated.matches = [...updated.matches, ...r32Matches];
      updated.currentRound = 'Dieciseisavos de Final';
      return updated;
    }

    // After Dieciseisavos -> Generate Octavos
    const r32Matches = updated.matches.filter((m) => m.roundName === 'Dieciseisavos de Final');
    const allR32Played = r32Matches.length === 16 && r32Matches.every((m) => m.played);
    const hasOctavos = updated.matches.some((m) => m.roundName === 'Octavos de Final');

    if (allR32Played && !hasOctavos) {
      const winners = r32Matches.map(getCupMatchWinner);
      const r16Matches: CupMatch[] = [];
      for (let i = 0; i < 8; i++) {
        r16Matches.push({
          id: `interg_r16_${winners[i * 2]}_${winners[i * 2 + 1]}`,
          tournamentId: 'copa_intergalactica',
          roundName: 'Octavos de Final',
          homeTeamId: winners[i * 2],
          awayTeamId: winners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-03-18`,
          isLowerTierHome: false,
          matchday: 5,
        });
      }
      updated.matches = [...updated.matches, ...r16Matches];
      updated.currentRound = 'Octavos de Final';
      return updated;
    }

    // After Octavos -> Generate Cuartos
    const r16Matches = updated.matches.filter((m) => m.roundName === 'Octavos de Final');
    const allR16Played = r16Matches.length === 8 && r16Matches.every((m) => m.played);
    const hasCuartos = updated.matches.some((m) => m.roundName === 'Cuartos de Final');

    if (allR16Played && !hasCuartos) {
      const winners = r16Matches.map(getCupMatchWinner);
      const qfMatches: CupMatch[] = [];
      for (let i = 0; i < 4; i++) {
        qfMatches.push({
          id: `interg_qf_${winners[i * 2]}_${winners[i * 2 + 1]}`,
          tournamentId: 'copa_intergalactica',
          roundName: 'Cuartos de Final',
          homeTeamId: winners[i * 2],
          awayTeamId: winners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-04-15`,
          isLowerTierHome: false,
          matchday: 6,
        });
      }
      updated.matches = [...updated.matches, ...qfMatches];
      updated.currentRound = 'Cuartos de Final';
      return updated;
    }

    // After Cuartos -> Generate Semifinales
    const qfMatches = updated.matches.filter((m) => m.roundName === 'Cuartos de Final');
    const allQfPlayed = qfMatches.length === 4 && qfMatches.every((m) => m.played);
    const hasSemis = updated.matches.some((m) => m.roundName === 'Semifinales');

    if (allQfPlayed && !hasSemis) {
      const winners = qfMatches.map(getCupMatchWinner);
      const sfMatches: CupMatch[] = [];
      for (let i = 0; i < 2; i++) {
        sfMatches.push({
          id: `interg_sf_${winners[i * 2]}_${winners[i * 2 + 1]}`,
          tournamentId: 'copa_intergalactica',
          roundName: 'Semifinales',
          homeTeamId: winners[i * 2],
          awayTeamId: winners[i * 2 + 1],
          played: false,
          date: `${seasonYear + 1}-05-06`,
          isLowerTierHome: false,
          matchday: 7,
        });
      }
      updated.matches = [...updated.matches, ...sfMatches];
      updated.currentRound = 'Semifinales';
      return updated;
    }

    // After Semifinales -> Generate Gran Final
    const sfMatches = updated.matches.filter((m) => m.roundName === 'Semifinales');
    const allSfPlayed = sfMatches.length === 2 && sfMatches.every((m) => m.played);
    const hasFinal = updated.matches.some((m) => m.roundName === 'Gran Final');

    if (allSfPlayed && !hasFinal) {
      const winners = sfMatches.map(getCupMatchWinner);
      updated.matches = [
        ...updated.matches,
        {
          id: `interg_final_${winners[0]}_${winners[1]}`,
          tournamentId: 'copa_intergalactica',
          roundName: 'Gran Final',
          homeTeamId: winners[0],
          awayTeamId: winners[1],
          played: false,
          date: `${seasonYear + 1}-05-27`,
          isLowerTierHome: false,
          neutralVenue: 'Superestadio Orbital Prime (Vía Láctea)',
          matchday: 8,
        },
      ];
      updated.currentRound = 'Gran Final';
      return updated;
    }

    const finalMatch = updated.matches.find((m) => m.roundName === 'Gran Final');
    if (finalMatch && finalMatch.played && !updated.championClubId) {
      updated.championClubId = getCupMatchWinner(finalMatch);
      updated.runnerUpClubId = getCupMatchLoser(finalMatch);
      updated.currentRound = 'Finalizado';
    }
  }

  // 4. Universal Knockout Cup Progression for all National and Continental Tournaments
  const handledCustomTournaments = ['uefa_champions', 'copa_del_rey', 'supercopa_espana', 'mundial_clubes_fifa', 'copa_intergalactica'];
  if (!handledCustomTournaments.includes(updated.id) && !updated.championClubId) {
    const currentMatches = updated.matches.filter((m) => m.roundName === updated.currentRound);
    const allPlayed = currentMatches.length > 0 && currentMatches.every((m) => m.played);

    if (allPlayed) {
      const winners = currentMatches.map(getCupMatchWinner);

      if (winners.length >= 8 && !updated.matches.some((m) => m.roundName === 'Cuartos de Final')) {
        const nextMatches: CupMatch[] = [];
        for (let i = 0; i < 4; i++) {
          nextMatches.push({
            id: `${updated.id}_qf_${winners[i]}_${winners[7 - i]}`,
            tournamentId: updated.id,
            roundName: 'Cuartos de Final',
            homeTeamId: winners[i],
            awayTeamId: winners[7 - i],
            played: false,
            date: `${seasonYear + 1}-03-15`,
            isLowerTierHome: false,
            matchday: 2,
          });
        }
        updated.matches = [...updated.matches, ...nextMatches];
        updated.currentRound = 'Cuartos de Final';
        return updated;
      } else if (winners.length >= 4 && !updated.matches.some((m) => m.roundName === 'Semifinales')) {
        const nextMatches: CupMatch[] = [];
        for (let i = 0; i < 2; i++) {
          nextMatches.push({
            id: `${updated.id}_sf_${winners[i * 2]}_${winners[i * 2 + 1]}`,
            tournamentId: updated.id,
            roundName: 'Semifinales',
            homeTeamId: winners[i * 2],
            awayTeamId: winners[i * 2 + 1],
            played: false,
            date: `${seasonYear + 1}-04-18`,
            isLowerTierHome: false,
            matchday: 3,
          });
        }
        updated.matches = [...updated.matches, ...nextMatches];
        updated.currentRound = 'Semifinales';
        return updated;
      } else if (winners.length === 2 && !updated.matches.some((m) => m.roundName === 'Gran Final')) {
        updated.matches = [
          ...updated.matches,
          {
            id: `${updated.id}_final_${winners[0]}_${winners[1]}`,
            tournamentId: updated.id,
            roundName: 'Gran Final',
            homeTeamId: winners[0],
            awayTeamId: winners[1],
            played: false,
            date: `${seasonYear + 1}-05-22`,
            isLowerTierHome: false,
            matchday: 4,
          },
        ];
        updated.currentRound = 'Gran Final';
        return updated;
      }
    }

    const finalMatch = updated.matches.find((m) => m.roundName === 'Gran Final');
    if (finalMatch && finalMatch.played && !updated.championClubId) {
      updated.championClubId = getCupMatchWinner(finalMatch);
      updated.runnerUpClubId = getCupMatchLoser(finalMatch);
      updated.currentRound = 'Finalizado';
    }
  }

  return updated;
}

/**
 * Simulates scheduled cup matches up to targetDate, holding today's match if the user's club is playing.
 */
export function simulateScheduledCupMatchesForDate(
  cupTournaments: Record<string, KnockoutTournamentState>,
  targetDate: string,
  clubsMap: Record<string, Club>,
  playersMap: Record<string, Player>,
  userClubId?: string
): Record<string, KnockoutTournamentState> {
  const updatedTournaments: Record<string, KnockoutTournamentState> = {};

  Object.entries(cupTournaments).forEach(([tournId, tourn]) => {
    if (!tourn || !tourn.matches) return;
    let tCopy = { ...tourn };
    let tournamentChanged = false;

    tCopy.matches = tCopy.matches.map((m) => {
      if (m.played) return m;
      const isUserMatch =
        userClubId &&
        (m.homeTeamId === userClubId || m.awayTeamId === userClubId);
      if (isUserMatch) return m; // Never simulate user match automatically in background

      if (m.date <= targetDate) {
        const sim = simulateCupMatch(m, clubsMap, playersMap);
        tournamentChanged = true;
        if (tCopy.standings && (m.roundName?.startsWith('Fase de Liga') || m.roundName?.startsWith('Fase de Grupos'))) {
          tCopy.standings = updateCupStandingsWithMatch(tCopy.standings, sim);
        }
        return sim;
      }
      return m;
    });

    if (tournamentChanged) {
      tCopy = progressCupTournament(tCopy, clubsMap);
    }
    updatedTournaments[tournId] = tCopy;
  });

  return updatedTournaments;
}

/**
 * Simulates a single-elimination cup match with extra-time and penalties if tie
 */
export function simulateCupMatch(
  match: CupMatch,
  clubsMap: Record<string, Club>,
  playersMap: Record<string, Player>
): CupMatch {
  if (match.played) return match;

  const homeClub = clubsMap[match.homeTeamId];
  const awayClub = clubsMap[match.awayTeamId];

  const homeRep = homeClub?.reputation || 70;
  const awayRep = awayClub?.reputation || 70;

  const homeAdvantage = match.neutralVenue ? 0 : 4;
  const diff = (homeRep + homeAdvantage) - awayRep;

  const baseHomeXg = Math.max(0.4, 1.4 + diff * 0.05);
  const baseAwayXg = Math.max(0.4, 1.3 - diff * 0.05);

  let homeScore = samplePoissonGoals(baseHomeXg);
  let awayScore = samplePoissonGoals(baseAwayXg);
  let homePenalties: number | undefined = undefined;
  let awayPenalties: number | undefined = undefined;

  // In knockout rounds (not League Phase), ties go to extra time and penalty shootouts
  const isKnockout = !match.roundName?.startsWith('Fase de Liga');
  if (isKnockout && homeScore === awayScore) {
    if (Math.random() < 0.3) homeScore += 1;
    else if (Math.random() < 0.25) awayScore += 1;

    if (homeScore === awayScore) {
      const basePen = 4;
      homePenalties = basePen + (Math.random() < 0.5 ? 1 : 0);
      awayPenalties = homePenalties === 5 ? 4 : 5;
    }
  }

  return {
    ...match,
    played: true,
    homeScore,
    awayScore,
    homePenalties,
    awayPenalties,
  };
}

/**
 * Converts a CupMatch to standard Match object so it can be previewed and simulated in LiveMatchModal
 */
export function convertCupMatchToMatch(cupMatch: CupMatch, competitionName?: string): Match {
  return {
    id: cupMatch.id,
    competitionId: cupMatch.tournamentId,
    matchday: cupMatch.matchday || 1,
    homeTeamId: cupMatch.homeTeamId,
    awayTeamId: cupMatch.awayTeamId,
    homeScore: cupMatch.homeScore,
    awayScore: cupMatch.awayScore,
    played: cupMatch.played,
    date: cupMatch.date,
  };
}

export interface UnifiedFixture {
  id: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  competitionId: string;
  competitionName: string;
  tournamentType: 'LIGA' | 'COPA' | 'CHAMPIONS' | 'SUPERCOPA' | 'MUNDIAL';
  roundOrMatchday: string;
  isHome: boolean;
  opponentId: string;
  isCup: boolean;
  cupMatch?: CupMatch;
  isWorldCup?: boolean;
  worldCupMatch?: import('./worldCupTournamentEngine').WorldCupMatch;
}

/**
 * Retrieves all fixtures across all competitions for a specific club (or national team during World Cup), sorted chronologically.
 */
export function getAllSeasonFixturesForClub(save: any, clubId: string): UnifiedFixture[] {
  const club = save.clubs?.[clubId];
  const fixtures: UnifiedFixture[] = [];

  // 1. League matches
  if (club) {
    const league = save.competitions?.[club.divisionId];
    if (league?.matches) {
      league.matches.forEach((m: Match) => {
        if (m.homeTeamId === clubId || m.awayTeamId === clubId) {
          const isHome = m.homeTeamId === clubId;
          fixtures.push({
            id: m.id,
            date: m.date,
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            played: m.played,
            competitionId: league.id,
            competitionName: league.name || league.shortName || 'Liga Regular',
            tournamentType: 'LIGA',
            roundOrMatchday: `Jornada ${m.matchday}`,
            isHome,
            opponentId: isHome ? m.awayTeamId : m.homeTeamId,
            isCup: false,
          });
        }
      });
    }

    // 2. Cup tournaments (Copa del Rey, UEFA Champions, Supercopa, CAF Champions, Libertadores)
    const cupTournaments = save.cupTournaments || {};
    Object.values(cupTournaments).forEach((tourn: any) => {
      if (tourn?.matches) {
        tourn.matches.forEach((cm: CupMatch) => {
          if (cm.homeTeamId === clubId || cm.awayTeamId === clubId) {
            const isHome = cm.homeTeamId === clubId;
            let tournamentType: 'LIGA' | 'COPA' | 'CHAMPIONS' | 'SUPERCOPA' | 'MUNDIAL' = 'COPA';
            if (
              cm.tournamentId === 'uefa_champions' ||
              cm.tournamentId === 'caf_champions' ||
              cm.tournamentId === 'copa_libertadores'
            ) {
              tournamentType = 'CHAMPIONS';
            } else if (cm.tournamentId === 'supercopa_espana') {
              tournamentType = 'SUPERCOPA';
            }

            fixtures.push({
              id: cm.id,
              date: cm.date,
              homeTeamId: cm.homeTeamId,
              awayTeamId: cm.awayTeamId,
              homeScore: cm.homeScore,
              awayScore: cm.awayScore,
              played: cm.played,
              competitionId: cm.tournamentId,
              competitionName: tourn.name || tourn.shortName || 'Torneo de Copa',
              tournamentType,
              roundOrMatchday: cm.roundName || 'Ronda de Copa',
              isHome,
              opponentId: isHome ? cm.awayTeamId : cm.homeTeamId,
              isCup: true,
              cupMatch: cm,
            });
          }
        });
      }
    });
  }

  // 3. FIFA World Cup Tournament (when active in June/July every 4 years)
  if (save.worldCupTournament) {
    const userNationId =
      save.worldCupTournament.userTeamId ||
      save.manager?.nationalTeamRole?.countryId ||
      'ESP';

    // Scan Groups safely
    if (Array.isArray(save.worldCupTournament.groups)) {
      save.worldCupTournament.groups.forEach((g: any) => {
        if (Array.isArray(g?.matches)) {
          g.matches.forEach((wm: any) => {
            if (wm && (wm.homeTeamId === userNationId || wm.awayTeamId === userNationId)) {
              const isHome = wm.homeTeamId === userNationId;
              fixtures.push({
                id: wm.id,
                date: wm.date,
                homeTeamId: wm.homeTeamId,
                awayTeamId: wm.awayTeamId,
                homeScore: wm.homeScore,
                awayScore: wm.awayScore,
                played: wm.played,
                competitionId: save.worldCupTournament.id || 'fifa_world_cup',
                competitionName: save.worldCupTournament.name || 'Copa Mundial de la FIFA',
                tournamentType: 'MUNDIAL',
                roundOrMatchday: wm.groupName || 'Fase de Grupos',
                isHome,
                opponentId: isHome ? wm.awayTeamId : wm.homeTeamId,
                isCup: true,
                isWorldCup: true,
                worldCupMatch: wm,
              });
            }
          });
        }
      });
    }

    // Scan Knockout Brackets safely
    const scanBracket = (list: any[], stageName: string) => {
      if (!Array.isArray(list)) return;
      list.forEach((wm) => {
        if (wm && (wm.homeTeamId === userNationId || wm.awayTeamId === userNationId)) {
          const isHome = wm.homeTeamId === userNationId;
          fixtures.push({
            id: wm.id,
            date: wm.date,
            homeTeamId: wm.homeTeamId,
            awayTeamId: wm.awayTeamId,
            homeScore: wm.homeScore,
            awayScore: wm.awayScore,
            played: wm.played,
            competitionId: save.worldCupTournament.id || 'fifa_world_cup',
            competitionName: save.worldCupTournament.name || 'Copa Mundial de la FIFA',
            tournamentType: 'MUNDIAL',
            roundOrMatchday: stageName,
            isHome,
            opponentId: isHome ? wm.awayTeamId : wm.homeTeamId,
            isCup: true,
            isWorldCup: true,
            worldCupMatch: wm,
          });
        }
      });
    };

    if (save.worldCupTournament.bracketRoundOf32) {
      scanBracket(save.worldCupTournament.bracketRoundOf32, 'Dieciseisavos de Final');
    }
    if (save.worldCupTournament.bracketRoundOf16) {
      scanBracket(save.worldCupTournament.bracketRoundOf16, 'Octavos de Final');
    }
    if (save.worldCupTournament.bracketQuarterFinals) {
      scanBracket(save.worldCupTournament.bracketQuarterFinals, 'Cuartos de Final');
    }
    if (save.worldCupTournament.bracketSemiFinals) {
      scanBracket(save.worldCupTournament.bracketSemiFinals, 'Semifinales');
    }
    if (save.worldCupTournament.thirdPlaceMatch) {
      scanBracket([save.worldCupTournament.thirdPlaceMatch], 'Tercer Puesto');
    }
    if (save.worldCupTournament.finalMatch) {
      scanBracket([save.worldCupTournament.finalMatch], 'Gran Final Mundial');
    }
  }

  // Sort chronologically by date
  return fixtures.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Finds the earliest unplayed fixture for the user's club across all active competitions.
 */
export function findUnifiedNextMatch(save: any, clubId: string): UnifiedFixture | null {
  const fixtures = getAllSeasonFixturesForClub(save, clubId);
  return fixtures.find((f) => !f.played) || null;
}
