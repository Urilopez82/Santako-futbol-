import { Club } from '../types/club';
import { Competition, Match, StandingsRow } from '../types/competition';
import { Player, Position } from '../types/player';
import { SPAIN_TIER1_CLUBS, ClubSeedData } from './worldClubs/spainTier1';
import { SPAIN_TIER2_CLUBS } from './worldClubs/spainTier2';
import { SPAIN_LOWER_TIERS_CLUBS } from './worldClubs/spainLowerTiers';
import { TOP_EUROPE_CLUBS } from './worldClubs/topEuropeClubs';
import { AMERICAS_CLUBS } from './worldClubs/americasClubs';
import { NEW_WORLD_LEAGUES_CLUBS } from './worldClubs/newWorldLeagues';
import { ALL_EXPANDED_WORLD_CLUBS } from './worldClubs/worldClubsExpansion';
import { MORE_WORLD_CLUBS } from './worldClubs/moreWorldClubs';
import { AMERICAS_EXPANSION_CLUBS } from './worldClubs/americasExpansion';
import { GLOBAL_EXPANSION_CLUBS } from './worldClubs/globalExpansion';
import { AFRICAN_CLUBS } from './worldClubs/africanClubs';
import { AFRICAN_AND_SECOND_DIVISIONS_CLUBS } from './worldClubs/africanAndSecondDivisions';
import { ensureFullRoster } from '../engine/rosterGenerator';

// Helper to generate realistic player ratings
function createPlayer(
  id: string,
  firstName: string,
  lastName: string,
  age: number,
  pos: Position,
  overall: number,
  potential: number,
  clubId: string,
  wageWeekly: number,
  contractYears: number,
  countryId: string = 'ESP'
): Player {
  const isGoalkeeper = pos === 'POR';
  const valMultiplier = overall >= 85 ? 12 : overall >= 75 ? 4 : overall >= 65 ? 1.5 : 0.8;
  const nationalityMap: Record<string, string> = {
    ESP: 'España',
    ENG: 'Inglaterra',
    ITA: 'Italia',
    GER: 'Alemania',
    FRA: 'Francia',
    ARG: 'Argentina',
    BRA: 'Brasil',
    USA: 'Estados Unidos',
    MEX: 'México',
    COL: 'Colombia',
    CHI: 'Chile',
    URU: 'Uruguay',
    POR: 'Portugal',
    NED: 'Países Bajos',
    BEL: 'Bélgica',
    SCO: 'Escocia',
    TUR: 'Turquía',
    GRE: 'Grecia',
    SUI: 'Suiza',
    KSA: 'Arabia Saudí',
    JPN: 'Japón',
    MAR: 'Marruecos',
    EGY: 'Egipto',
    RSA: 'Sudáfrica',
    NGA: 'Nigeria',
    SEN: 'Senegal',
    DZA: 'Argelia',
    TUN: 'Túnez',
    CIV: 'Costa de Marfil',
    CMR: 'Camerún',
    GHA: 'Ghana',
  };
  const nationality = nationalityMap[countryId] || 'España';

  return {
    id,
    firstName,
    lastName,
    nationality,
    birthDate: `${2026 - age}-03-15`,
    age,
    primaryPosition: pos,
    overallRating: overall,
    potential,
    clubId,
    isTransferListed: false,
    isLoanListed: false,
    marketValue: Math.round(overall * overall * 450 * valMultiplier),
    attributes: {
      disparo: isGoalkeeper ? 15 : Math.min(99, Math.round(overall * (pos === 'DC' ? 1.05 : 0.85))),
      pase: isGoalkeeper ? 45 : Math.min(99, Math.round(overall * (pos === 'MC' || pos === 'MCO' ? 1.05 : 0.9))),
      regate: isGoalkeeper ? 20 : Math.min(99, Math.round(overall * (pos === 'EI' || pos === 'ED' || pos === 'MCO' ? 1.08 : 0.85))),
      defensa: isGoalkeeper ? 25 : Math.min(99, Math.round(overall * (pos === 'DFC' || pos === 'MCD' || pos === 'LD' || pos === 'LI' ? 1.08 : 0.65))),
      velocidad: Math.min(99, Math.round(overall * (pos === 'ED' || pos === 'EI' || pos === 'LD' || pos === 'LI' ? 1.05 : 0.95))),
      resistencia: Math.min(99, Math.round(overall * 0.98)),
      fuerza: Math.min(99, Math.round(overall * (pos === 'DFC' || pos === 'DC' ? 1.05 : 0.9))),
      vision: Math.min(99, Math.round(overall * (pos === 'MC' || pos === 'MCO' ? 1.08 : 0.88))),
      liderazgo: Math.min(99, Math.round(50 + (age - 20) * 2)),
      reflejos: isGoalkeeper ? overall : undefined,
      paradas: isGoalkeeper ? overall : undefined,
    },
    contract: {
      wagePerWeek: wageWeekly,
      contractEndYear: 2026 + contractYears,
      releaseClause: Math.round(overall * overall * 1800 * valMultiplier),
      squadStatus: overall >= 72 ? 'Titular' : 'Rotación',
    },
    fitness: 100,
    morale: 85,
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
  };
}

// Helper to generate round-robin schedule and standings for any competition
function generateScheduleAndStandings(
  competitionId: string,
  name: string,
  shortName: string,
  tier: number,
  clubIds: string[],
  promotionSlots: number = 0,
  playoffSlots: number = 0,
  relegationSlots: number = 0,
  season: string = '2026/27'
): Competition {
  const matches: Match[] = [];
  const n = clubIds.length;
  if (n < 2) {
    return {
      id: competitionId,
      name,
      shortName,
      season,
      tier,
      clubIds,
      totalMatchdays: 1,
      currentMatchday: 1,
      matches: [],
      standings: clubIds.map(tid => ({
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
      })),
      promotionSlots,
      playoffSlots,
      relegationSlots,
    };
  }

  // Ensure even number for round-robin pairing
  const teamList = [...clubIds];
  const hasDummy = n % 2 !== 0;
  if (hasDummy) teamList.push('BYE');
  const numTeams = teamList.length;
  const halfRounds = numTeams - 1;

  for (let round = 0; round < halfRounds; round++) {
    const matchday = round + 1;
    const baseDate = new Date('2026-08-22');
    baseDate.setDate(baseDate.getDate() + round * 7);
    const dateStr = baseDate.toISOString().slice(0, 10);

    for (let i = 0; i < numTeams / 2; i++) {
      const homeIdx = (round + i) % (numTeams - 1);
      let awayIdx = (numTeams - 1 - i + round) % (numTeams - 1);
      if (i === 0) awayIdx = numTeams - 1;

      const homeId = teamList[homeIdx];
      const awayId = teamList[awayIdx];

      if (homeId !== 'BYE' && awayId !== 'BYE') {
        matches.push({
          id: `match_${competitionId}_j${matchday}_${i + 1}`,
          competitionId,
          matchday,
          date: dateStr,
          homeTeamId: homeId,
          awayTeamId: awayId,
          played: false,
        });
      }
    }
  }

  // Second half (Vuelta)
  for (let round = 0; round < halfRounds; round++) {
    const matchday = halfRounds + round + 1;
    const baseDate = new Date('2026-08-22');
    baseDate.setDate(baseDate.getDate() + (halfRounds + round) * 7);
    const dateStr = baseDate.toISOString().slice(0, 10);

    const firstHalfMatches = matches.filter((m) => m.matchday === round + 1);
    firstHalfMatches.forEach((fhm, idx) => {
      matches.push({
        id: `match_${competitionId}_j${matchday}_${idx + 1}`,
        competitionId,
        matchday,
        date: dateStr,
        homeTeamId: fhm.awayTeamId, // inverted
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

  return {
    id: competitionId,
    name,
    shortName,
    season,
    tier,
    clubIds,
    totalMatchdays: halfRounds * 2,
    currentMatchday: 1,
    matches,
    standings,
    promotionSlots,
    playoffSlots,
    relegationSlots,
  };
}

export function generateInitialDatabase(): {
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  competitions: Record<string, Competition>;
} {
  const clubs: Record<string, Club> = {};
  const players: Record<string, Player> = {};

  // Aggregate all seed clubs and deduplicate by club ID
  const rawSeedClubs: ClubSeedData[] = [
    ...SPAIN_TIER1_CLUBS,
    ...SPAIN_TIER2_CLUBS,
    ...SPAIN_LOWER_TIERS_CLUBS,
    ...TOP_EUROPE_CLUBS,
    ...AMERICAS_CLUBS,
    ...NEW_WORLD_LEAGUES_CLUBS,
    ...ALL_EXPANDED_WORLD_CLUBS,
    ...MORE_WORLD_CLUBS,
    ...AMERICAS_EXPANSION_CLUBS,
    ...GLOBAL_EXPANSION_CLUBS,
    ...AFRICAN_CLUBS,
    ...AFRICAN_AND_SECOND_DIVISIONS_CLUBS,
  ];

  const seenClubIds = new Set<string>();
  const allSeedClubs = rawSeedClubs.filter((c) => {
    if (seenClubIds.has(c.id)) return false;
    seenClubIds.add(c.id);
    return true;
  });

  const usedPlayerIds = new Set<string>();

  // Process all clubs and rosters
  allSeedClubs.forEach((cd) => {
    const playerIds: string[] = [];
    const starters: string[] = [];
    const bench: string[] = [];
    const fullRoster = ensureFullRoster(cd);

    fullRoster.forEach((rp, idx) => {
      let pid = `p_${cd.id}_${idx + 1}`;
      if (usedPlayerIds.has(pid)) {
        pid = `p_${cd.id}_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`;
      }
      usedPlayerIds.add(pid);

      const baseOvr = cd.playerBaseOverall || 70;
      const wageWeekly = Math.max(300, Math.round((cd.wageWeekly / fullRoster.length) * (rp.ovr / baseOvr)));
      const player = createPlayer(
        pid,
        rp.name,
        rp.surname,
        rp.age,
        rp.pos,
        rp.ovr,
        Math.min(99, rp.ovr + (rp.age < 23 ? 9 : rp.age < 27 ? 4 : 1)),
        cd.id,
        wageWeekly,
        cd.id === 'real_madrid' || cd.id === 'fc_barcelona' ? 4 : 2,
        cd.countryId
      );
      players[pid] = player;
      playerIds.push(pid);
      if (idx < 11) {
        starters.push(pid);
      } else {
        bench.push(pid);
      }
    });

    clubs[cd.id] = {
      id: cd.id,
      name: cd.name,
      shortName: cd.shortName,
      code: cd.code,
      countryId: cd.countryId,
      city: cd.city,
      foundedYear: cd.foundedYear,
      primaryColor: cd.primaryColor,
      secondaryColor: cd.secondaryColor,
      textColor: cd.textColor,
      divisionId: cd.divisionId,
      reputation: cd.reputation,
      stadium: {
        name: cd.stadiumName,
        city: cd.city,
        capacity: cd.capacity,
        condition: 90,
        ticketPrice: cd.ticketPrice,
        seasonTicketHolders: cd.seasonTickets,
        seasonTicketPrice: cd.ticketPrice * 14,
      },
      facilities: {
        trainingGroundLevel: cd.reputation >= 85 ? 5 : cd.reputation >= 70 ? 4 : cd.reputation >= 50 ? 3 : 2,
        youthAcademyLevel: cd.reputation >= 85 ? 5 : cd.reputation >= 70 ? 4 : cd.reputation >= 50 ? 3 : 2,
        medicalCenterLevel: cd.reputation >= 80 ? 5 : 3,
        stadiumLevel: cd.reputation >= 85 ? 5 : cd.reputation >= 70 ? 4 : cd.reputation >= 50 ? 3 : 2,
      },
      finances: {
        balance: cd.balance,
        transferBudget: cd.transferBudget,
        weeklyWageBudget: cd.wageWeekly,
        sponsorName: cd.sponsor,
        sponsorAnnualRevenue: cd.sponsorRev,
        seasonTicketRevenue: cd.seasonTickets * cd.ticketPrice * 12,
        recentLedger: [
          {
            id: `ledg_${cd.id}_1`,
            date: '2026-08-01',
            category: 'abonos',
            description: 'Recaudación inicial de campaña de abonos de temporada',
            amount: cd.seasonTickets * cd.ticketPrice * 12,
          },
          {
            id: `ledg_${cd.id}_2`,
            date: '2026-08-05',
            category: 'patrocinio',
            description: `Primer plazo patrocinio comercial (${cd.sponsor})`,
            amount: Math.round(cd.sponsorRev / 2),
          },
        ],
      },
      boardObjective: cd.boardObjective,
      boardConfidence: 82,
      playerIds,
      startingElevenIds: starters,
      benchPlayerIds: bench,
      tacticFormation: cd.tacticFormation,
      tacticMentality: 'Equilibrada',
      tacticTempo: 'Normal',
      tacticPassing: 'Mixto',
      tacticPressing: 'Media',
      historyTitles: [
        { title: `Títulos Oficiales de ${cd.shortName}`, season: 'Histórico' },
      ],
    };
  });

  // Free Agents Pool
  const freeAgents = [
    { name: 'Xavier', surname: 'Quintillà', pos: 'LI' as Position, age: 28, ovr: 68 },
    { name: 'Víctor', surname: 'Álvarez', pos: 'MC' as Position, age: 29, ovr: 67 },
    { name: 'Álvaro', surname: 'Vázquez', pos: 'DC' as Position, age: 33, ovr: 66 },
    { name: 'Pol', surname: 'Freixanet', pos: 'POR' as Position, age: 31, ovr: 66 },
    { name: 'Lluís', surname: 'López', pos: 'DFC' as Position, age: 27, ovr: 69 },
    { name: 'Sergio', surname: 'Ramos', pos: 'DFC' as Position, age: 40, ovr: 81 },
    { name: 'Keylor', surname: 'Navas', pos: 'POR' as Position, age: 39, ovr: 79 },
    { name: 'Wissam', surname: 'Ben Yedder', pos: 'DC' as Position, age: 36, ovr: 78 },
    { name: 'Munir', surname: 'El Haddadi', pos: 'ED' as Position, age: 31, ovr: 76 },
  ];

  freeAgents.forEach((fa, idx) => {
    const pid = `free_agent_${idx + 1}`;
    players[pid] = {
      ...createPlayer(
        pid,
        fa.name,
        fa.surname,
        fa.age,
        fa.pos,
        fa.ovr,
        fa.ovr + (fa.age < 25 ? 5 : 1),
        '',
        Math.round(fa.ovr * 22),
        0
      ),
      clubId: null,
      isTransferListed: true,
      contract: {
        wagePerWeek: Math.round(fa.ovr * 25),
        contractEndYear: 2026,
        releaseClause: 0,
        squadStatus: 'Rotación',
      },
    };
  });

  // Competitions catalog
  const competitions: Record<string, Competition> = {};

  // Group clubs by divisionId
  const divisionClubsMap: Record<string, string[]> = {};
  Object.values(clubs).forEach((c) => {
    if (!divisionClubsMap[c.divisionId]) divisionClubsMap[c.divisionId] = [];
    divisionClubsMap[c.divisionId].push(c.id);
  });

  const competitionDefs: {
    id: string;
    name: string;
    shortName: string;
    tier: number;
    promotion: number;
    playoff: number;
    relegation: number;
  }[] = [
    { id: 'esp_tier1', name: 'Primera División de España (LaLiga EA Sports)', shortName: 'LaLiga EA Sports', tier: 1, promotion: 0, playoff: 0, relegation: 3 },
    { id: 'esp_tier2', name: 'Segunda División de España (LaLiga Hypermotion)', shortName: 'LaLiga Hypermotion', tier: 2, promotion: 2, playoff: 4, relegation: 4 },
    { id: 'esp_tier3_g2', name: 'Primera Federación Versus e-Learning (Grupo 2)', shortName: '1ª Fed G2', tier: 3, promotion: 1, playoff: 4, relegation: 5 },
    { id: 'esp_tier4_g3', name: 'Segunda Federación RFEF (Grupo 3 Cataluña-Levante)', shortName: '2ª Fed G3', tier: 4, promotion: 1, playoff: 4, relegation: 5 },
    { id: 'esp_tier5_g5', name: 'Tercera Federación RFEF (Grupo 5 Cataluña)', shortName: '3ª Fed G5 (Cat)', tier: 5, promotion: 1, playoff: 4, relegation: 3 },
    { id: 'eng_tier1', name: 'Premier League', shortName: 'Premier League', tier: 1, promotion: 0, playoff: 0, relegation: 3 },
    { id: 'ita_tier1', name: 'Serie A Enilive', shortName: 'Serie A', tier: 1, promotion: 0, playoff: 0, relegation: 3 },
    { id: 'ger_tier1', name: 'Bundesliga', shortName: 'Bundesliga', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'fra_tier1', name: 'Ligue 1 McDonald\'s', shortName: 'Ligue 1', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'arg_tier1', name: 'Liga Profesional de Fútbol Argentina', shortName: 'Liga Argentina', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'bra_tier1', name: 'Brasileirão Série A Betano', shortName: 'Brasileirão', tier: 1, promotion: 0, playoff: 0, relegation: 4 },
    { id: 'usa_tier1', name: 'Major League Soccer', shortName: 'MLS', tier: 1, promotion: 0, playoff: 9, relegation: 0 },
    { id: 'mex_tier1', name: 'Liga BBVA MX', shortName: 'Liga MX', tier: 1, promotion: 0, playoff: 10, relegation: 0 },
    { id: 'col_tier1', name: 'Liga BetPlay Dimayor', shortName: 'Liga Colombia', tier: 1, promotion: 0, playoff: 8, relegation: 2 },
    { id: 'chi_tier1', name: 'Primera División de Chile (Campeonato Itaú)', shortName: 'Liga Chile', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'uru_tier1', name: 'Primera División de Uruguay', shortName: 'Liga Uruguay', tier: 1, promotion: 0, playoff: 0, relegation: 3 },
    { id: 'por_tier1', name: 'Liga Portugal Betclic', shortName: 'Liga Portugal', tier: 1, promotion: 0, playoff: 1, relegation: 2 },
    { id: 'ned_tier1', name: 'Eredivisie', shortName: 'Eredivisie', tier: 1, promotion: 0, playoff: 1, relegation: 2 },
    { id: 'bel_tier1', name: 'Jupiler Pro League', shortName: 'Pro League', tier: 1, promotion: 0, playoff: 6, relegation: 2 },
    { id: 'sco_tier1', name: 'Scottish Premiership', shortName: 'Premiership', tier: 1, promotion: 0, playoff: 1, relegation: 1 },
    { id: 'tur_tier1', name: 'Trendyol Süper Lig', shortName: 'Süper Lig', tier: 1, promotion: 0, playoff: 0, relegation: 4 },
    { id: 'gre_tier1', name: 'Stoiximan Super League', shortName: 'Super League Grecia', tier: 1, promotion: 0, playoff: 6, relegation: 2 },
    { id: 'sui_tier1', name: 'Credit Suisse Super League', shortName: 'Super League Suiza', tier: 1, promotion: 0, playoff: 1, relegation: 1 },
    { id: 'sau_tier1', name: 'Saudi Pro League (Roshn Saudi League)', shortName: 'Saudi League', tier: 1, promotion: 0, playoff: 0, relegation: 3 },
    { id: 'jpn_tier1', name: 'Meiji Yasuda J1 League', shortName: 'J1 League', tier: 1, promotion: 0, playoff: 0, relegation: 3 },
    { id: 'mar_tier1', name: 'Botola Pro Inwi 1 (Marruecos)', shortName: 'Botola Marruecos', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'mar_tier2', name: 'Botola Pro 2 (Segunda Marruecos)', shortName: 'Botola 2 Marruecos', tier: 2, promotion: 2, playoff: 0, relegation: 2 },
    { id: 'egy_tier1', name: 'Egyptian Premier League', shortName: 'Premier Egipto', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'egy_tier2', name: 'Egyptian Second Division A', shortName: 'Segunda Egipto', tier: 2, promotion: 2, playoff: 0, relegation: 2 },
    { id: 'rsa_tier1', name: 'Betway Premiership (Sudáfrica)', shortName: 'Premiership RSA', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'rsa_tier2', name: 'Motsepe Foundation Championship (2ª Sudáfrica)', shortName: 'Segunda RSA', tier: 2, promotion: 2, playoff: 0, relegation: 2 },
    { id: 'nga_tier1', name: 'Nigeria Premier Football League (NPFL)', shortName: 'NPFL Nigeria', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'nga_tier2', name: 'Nigeria National League (NNL)', shortName: 'Segunda Nigeria', tier: 2, promotion: 2, playoff: 0, relegation: 2 },
    { id: 'sen_tier1', name: 'Ligue 1 Sénégal', shortName: 'Ligue 1 Senegal', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'sen_tier2', name: 'Ligue 2 Sénégal', shortName: 'Ligue 2 Senegal', tier: 2, promotion: 2, playoff: 0, relegation: 2 },
    { id: 'dza_tier1', name: 'Ligue 1 Mobilis Algérie', shortName: 'Ligue 1 Argelia', tier: 1, promotion: 0, playoff: 0, relegation: 2 },
    { id: 'dza_tier2', name: 'Ligue 2 Algérie', shortName: 'Ligue 2 Argelia', tier: 2, promotion: 2, playoff: 0, relegation: 2 },
    { id: 'eng_tier2', name: 'EFL Championship', shortName: 'Championship', tier: 2, promotion: 2, playoff: 4, relegation: 3 },
    { id: 'ita_tier2', name: 'Serie BKT', shortName: 'Serie B', tier: 2, promotion: 2, playoff: 4, relegation: 3 },
    { id: 'ger_tier2', name: '2. Bundesliga', shortName: '2. Bundesliga', tier: 2, promotion: 2, playoff: 1, relegation: 2 },
    { id: 'fra_tier2', name: 'Ligue 2 BKT', shortName: 'Ligue 2', tier: 2, promotion: 2, playoff: 2, relegation: 2 },
    { id: 'por_tier2', name: 'Liga Portugal 2 SABSEG', shortName: 'Liga Portugal 2', tier: 2, promotion: 2, playoff: 1, relegation: 2 },
    { id: 'caf_champions', name: 'TotalEnergies CAF Champions League', shortName: 'CAF Champions', tier: 1, promotion: 0, playoff: 0, relegation: 0 },
  ];

  competitionDefs.forEach((def) => {
    const cids = divisionClubsMap[def.id] || [];
    if (cids.length > 0) {
      competitions[def.id] = generateScheduleAndStandings(
        def.id,
        def.name,
        def.shortName,
        def.tier,
        cids,
        def.promotion,
        def.playoff,
        def.relegation
      );
    }
  });

  return { clubs, players, competitions };
}
