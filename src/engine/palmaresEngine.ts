import { 
  ClubPalmaresSummary, 
  ManagerPalmaresRecord, 
  PlayerPalmaresRecord, 
  TrophyRecord 
} from '../types/regulations';
import { NewsItem } from '../types/game';
import { rewardManagerTitleBonus } from './privateLifeEngine';

/**
 * Historical Trophy Roll of Honor (Palmarés Oficial Previo al Inicio de la Partida)
 */
export const HISTORICAL_TROPHY_ARCHIVE: TrophyRecord[] = [
  // CHAMPIONS LEAGUE
  {
    id: 'ucl_2024',
    season: '2023/24',
    competitionId: 'uefa_champions_league',
    competitionName: 'UEFA Champions League',
    competitionType: 'CHAMPIONS',
    tier: 'CONTINENTAL',
    championId: 'rma',
    championName: 'Real Madrid CF',
    runnerUpId: 'dor',
    runnerUpName: 'Borussia Dortmund',
    scoreOrSummary: '2 - 0 en Wembley Stadium (Carvajal 74\', Vinícius Jr 83\')',
    winningManagerName: 'Carlo Ancelotti',
    topScorer: { playerName: 'Harry Kane / Kylian Mbappé', clubName: 'Bayern / PSG', goals: 8 },
    bestPlayer: { playerName: 'Vinícius Júnior', clubName: 'Real Madrid CF' },
    isPreGameHistory: true,
  },
  {
    id: 'ucl_2023',
    season: '2022/23',
    competitionId: 'uefa_champions_league',
    competitionName: 'UEFA Champions League',
    competitionType: 'CHAMPIONS',
    tier: 'CONTINENTAL',
    championId: 'mci',
    championName: 'Manchester City',
    runnerUpId: 'int',
    runnerUpName: 'Inter de Milán',
    scoreOrSummary: '1 - 0 en Atatürk Olympic Stadium (Rodrigo Hernández 68\')',
    winningManagerName: 'Pep Guardiola',
    topScorer: { playerName: 'Erling Haaland', clubName: 'Manchester City', goals: 12 },
    bestPlayer: { playerName: 'Rodrigo Hernández', clubName: 'Manchester City' },
    isPreGameHistory: true,
  },
  {
    id: 'ucl_2022',
    season: '2021/22',
    competitionId: 'uefa_champions_league',
    competitionName: 'UEFA Champions League',
    competitionType: 'CHAMPIONS',
    tier: 'CONTINENTAL',
    championId: 'rma',
    championName: 'Real Madrid CF',
    runnerUpId: 'liv',
    runnerUpName: 'Liverpool FC',
    scoreOrSummary: '1 - 0 en Stade de France (Vinícius Jr 59\')',
    winningManagerName: 'Carlo Ancelotti',
    topScorer: { playerName: 'Karim Benzema', clubName: 'Real Madrid CF', goals: 15 },
    bestPlayer: { playerName: 'Karim Benzema', clubName: 'Real Madrid CF' },
    isPreGameHistory: true,
  },

  // LALIGA EA SPORTS
  {
    id: 'laliga_2024',
    season: '2023/24',
    competitionId: 'esp_tier1',
    competitionName: 'Primera División de España (LaLiga)',
    competitionType: 'LIGA',
    tier: 'NACIONAL_PRIMERA',
    championId: 'rma',
    championName: 'Real Madrid CF',
    runnerUpId: 'fcb',
    runnerUpName: 'FC Barcelona',
    scoreOrSummary: '95 puntos (+10 sobre FC Barcelona, 29V 8E 1D)',
    winningManagerName: 'Carlo Ancelotti',
    topScorer: { playerName: 'Artem Dovbyk', clubName: 'Girona FC', goals: 24 },
    bestPlayer: { playerName: 'Jude Bellingham', clubName: 'Real Madrid CF' },
    isPreGameHistory: true,
  },
  {
    id: 'laliga_2023',
    season: '2022/23',
    competitionId: 'esp_tier1',
    competitionName: 'Primera División de España (LaLiga)',
    competitionType: 'LIGA',
    tier: 'NACIONAL_PRIMERA',
    championId: 'fcb',
    championName: 'FC Barcelona',
    runnerUpId: 'rma',
    runnerUpName: 'Real Madrid CF',
    scoreOrSummary: '88 puntos (+10 sobre Real Madrid, solo 20 goles encajados)',
    winningManagerName: 'Xavi Hernández',
    topScorer: { playerName: 'Robert Lewandowski', clubName: 'FC Barcelona', goals: 23 },
    bestPlayer: { playerName: 'Marc-André ter Stegen', clubName: 'FC Barcelona' },
    isPreGameHistory: true,
  },

  // PREMIER LEAGUE
  {
    id: 'pl_2024',
    season: '2023/24',
    competitionId: 'eng_tier1',
    competitionName: 'Premier League',
    competitionType: 'LIGA',
    tier: 'NACIONAL_PRIMERA',
    championId: 'mci',
    championName: 'Manchester City',
    runnerUpId: 'ars',
    runnerUpName: 'Arsenal FC',
    scoreOrSummary: '91 puntos (+2 sobre Arsenal, 4º título consecutivo)',
    winningManagerName: 'Pep Guardiola',
    topScorer: { playerName: 'Erling Haaland', clubName: 'Manchester City', goals: 27 },
    bestPlayer: { playerName: 'Phil Foden', clubName: 'Manchester City' },
    isPreGameHistory: true,
  },

  // SELECCIONES: COPA DEL MUNDO
  {
    id: 'wc_2022',
    season: '2022',
    competitionId: 'fifa_world_cup',
    competitionName: 'Copa Mundial de la FIFA',
    competitionType: 'SELECCIONES_MUNDIAL',
    tier: 'MUNDIAL',
    championId: 'ARG',
    championName: 'Selección de Argentina',
    runnerUpId: 'FRA',
    runnerUpName: 'Selección de Francia',
    scoreOrSummary: '3 - 3 (4 - 2 en penaltis en Lusail Stadium)',
    winningManagerName: 'Lionel Scaloni',
    topScorer: { playerName: 'Kylian Mbappé', clubName: 'Francia', goals: 8 },
    bestPlayer: { playerName: 'Lionel Messi', clubName: 'Argentina' },
    isPreGameHistory: true,
  },
  {
    id: 'wc_2010',
    season: '2010',
    competitionId: 'fifa_world_cup',
    competitionName: 'Copa Mundial de la FIFA',
    competitionType: 'SELECCIONES_MUNDIAL',
    tier: 'MUNDIAL',
    championId: 'ESP',
    championName: 'Selección de España',
    runnerUpId: 'NED',
    runnerUpName: 'Selección de los Países Bajos',
    scoreOrSummary: '1 - 0 tras prórroga en Soccer City (Andrés Iniesta 116\')',
    winningManagerName: 'Vicente del Bosque',
    topScorer: { playerName: 'David Villa / Thomas Müller', clubName: 'España / Alemania', goals: 5 },
    bestPlayer: { playerName: 'Diego Forlán', clubName: 'Uruguay' },
    isPreGameHistory: true,
  },

  // SELECCIONES: EUROCOPA
  {
    id: 'euro_2024',
    season: '2024',
    competitionId: 'uefa_euro',
    competitionName: 'UEFA Eurocopa Alemania 2024',
    competitionType: 'SELECCIONES_EUROPA',
    tier: 'CONTINENTAL',
    championId: 'ESP',
    championName: 'Selección de España',
    runnerUpId: 'ENG',
    runnerUpName: 'Selección de Inglaterra',
    scoreOrSummary: '2 - 1 en Olympiastadion Berlin (Nico Williams 47\', Oyarzabal 86\')',
    winningManagerName: 'Luis de la Fuente',
    topScorer: { playerName: 'Dani Olmo / Harry Kane', clubName: 'España / Inglaterra', goals: 3 },
    bestPlayer: { playerName: 'Rodrigo Hernández', clubName: 'España' },
    isPreGameHistory: true,
  },
];

/**
 * Historical Titles Count by Club
 */
export const CLUB_HISTORICAL_PALMARES: Record<string, ClubPalmaresSummary> = {
  rma: {
    clubId: 'rma',
    clubName: 'Real Madrid Club de Fútbol',
    trophies: {
      championsLeague: 15,
      europaLeague: 2,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 8,
      supercopaEuropea: 6,
      nationalLeagueTitles: 36,
      nationalCups: 20,
      nationalSupercups: 13,
      lowerDivisionTitles: 0,
    },
    trophyHistory: [],
  },
  fcb: {
    clubId: 'fcb',
    clubName: 'Fútbol Club Barcelona',
    trophies: {
      championsLeague: 5,
      europaLeague: 0,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 3,
      supercopaEuropea: 5,
      nationalLeagueTitles: 27,
      nationalCups: 31,
      nationalSupercups: 14,
      lowerDivisionTitles: 0,
    },
    trophyHistory: [],
  },
  mci: {
    clubId: 'mci',
    clubName: 'Manchester City Football Club',
    trophies: {
      championsLeague: 1,
      europaLeague: 0,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 1,
      supercopaEuropea: 1,
      nationalLeagueTitles: 10,
      nationalCups: 7,
      nationalSupercups: 7,
      lowerDivisionTitles: 7,
    },
    trophyHistory: [],
  },
  liv: {
    clubId: 'liv',
    clubName: 'Liverpool Football Club',
    trophies: {
      championsLeague: 6,
      europaLeague: 3,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 1,
      supercopaEuropea: 4,
      nationalLeagueTitles: 19,
      nationalCups: 8,
      nationalSupercups: 16,
      lowerDivisionTitles: 4,
    },
    trophyHistory: [],
  },
  bay: {
    clubId: 'bay',
    clubName: 'FC Bayern München',
    trophies: {
      championsLeague: 6,
      europaLeague: 1,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 4,
      supercopaEuropea: 2,
      nationalLeagueTitles: 33,
      nationalCups: 20,
      nationalSupercups: 10,
      lowerDivisionTitles: 0,
    },
    trophyHistory: [],
  },
  acm: {
    clubId: 'acm',
    clubName: 'AC Milan',
    trophies: {
      championsLeague: 7,
      europaLeague: 0,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 4,
      supercopaEuropea: 5,
      nationalLeagueTitles: 19,
      nationalCups: 5,
      nationalSupercups: 7,
      lowerDivisionTitles: 2,
    },
    trophyHistory: [],
  },
  // Clubes Locales / Modestos
  club_fef_grama: {
    clubId: 'club_fef_grama',
    clubName: 'Fundació Esportiva Grama (Santa Coloma de Gramenet)',
    trophies: {
      championsLeague: 0,
      europaLeague: 0,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 0,
      supercopaEuropea: 0,
      nationalLeagueTitles: 0,
      nationalCups: 0,
      nationalSupercups: 0,
      lowerDivisionTitles: 3, // Campeón Primera Catalana, Torneig d'Històrics
    },
    trophyHistory: [],
  },
  club_sant_andreu: {
    clubId: 'club_sant_andreu',
    clubName: 'Unió Esportiva Sant Andreu',
    trophies: {
      championsLeague: 0,
      europaLeague: 0,
      conferenceLeague: 0,
      intercontinentalOrClubWorldCup: 0,
      supercopaEuropea: 0,
      nationalLeagueTitles: 0,
      nationalCups: 0,
      nationalSupercups: 0,
      lowerDivisionTitles: 7, // Títulos de Segunda B / Tercera División / Copa RFEF
    },
    trophyHistory: [],
  },
};

/**
 * Historical Manager Palmarés
 */
export const MANAGERS_HISTORICAL_PALMARES: ManagerPalmaresRecord[] = [
  {
    managerName: 'Pep Guardiola',
    totalTitles: 38,
    titlesByClub: { 'FC Barcelona': 14, 'Bayern München': 7, 'Manchester City': 17 },
    trophyList: [
      { trophyName: 'UEFA Champions League (3)', season: '2008/09, 2010/11, 2022/23', clubName: 'Barça / Man City' },
      { trophyName: 'Premier League (6)', season: '2017/18, 2018/19, 2020/21, 2021/22, 2022/23, 2023/24', clubName: 'Manchester City' },
      { trophyName: 'LaLiga EA Sports (3)', season: '2008/09, 2009/10, 2010/11', clubName: 'FC Barcelona' },
      { trophyName: 'Bundesliga (3)', season: '2013/14, 2014/15, 2015/16', clubName: 'Bayern München' },
      { trophyName: 'Mundial de Clubes FIFA (4)', season: '2009, 2011, 2013, 2023', clubName: 'Barça / Bayern / City' },
    ],
  },
  {
    managerName: 'Carlo Ancelotti',
    totalTitles: 29,
    titlesByClub: { 'Real Madrid': 14, 'AC Milan': 8, 'Chelsea': 3, 'PSG': 1, 'Bayern München': 3 },
    trophyList: [
      { trophyName: 'UEFA Champions League (5 - Récord)', season: '2002/03, 2006/07, 2013/14, 2021/22, 2023/24', clubName: 'Milan / Real Madrid' },
      { trophyName: 'Campeón de las 5 Grandes Ligas', season: 'Serie A, Premier, Ligue 1, Bundesliga, LaLiga', clubName: 'Histórico' },
    ],
  },
  {
    managerName: 'Sir Alex Ferguson',
    totalTitles: 49,
    titlesByClub: { 'Manchester United': 38, 'Aberdeen': 10, 'St Mirren': 1 },
    trophyList: [
      { trophyName: 'Premier League (13)', season: '1992/93 a 2012/13', clubName: 'Manchester United' },
      { trophyName: 'UEFA Champions League (2)', season: '1998/99, 2007/08', clubName: 'Manchester United' },
      { trophyName: 'Recopa de Europa (2)', season: '1982/83, 1990/91', clubName: 'Aberdeen / Man United' },
    ],
  },
];

/**
 * Historical Players Palmarés & Honors
 */
export const PLAYERS_HISTORICAL_PALMARES: PlayerPalmaresRecord[] = [
  {
    playerName: 'Lionel Messi',
    totalTitles: 45,
    ballonDOrs: 8,
    goldenBoots: 6,
    trophyList: [
      { trophyName: 'Copa Mundial de la FIFA', season: 'Qatar 2022', clubOrCountry: 'Argentina' },
      { trophyName: 'UEFA Champions League (4)', season: '2005/06, 2008/09, 2010/11, 2014/15', clubOrCountry: 'FC Barcelona' },
      { trophyName: 'LaLiga (10)', season: '2004 a 2019', clubOrCountry: 'FC Barcelona' },
      { trophyName: 'Copa América (2)', season: '2021, 2024', clubOrCountry: 'Argentina' },
    ],
  },
  {
    playerName: 'Cristiano Ronaldo',
    totalTitles: 35,
    ballonDOrs: 5,
    goldenBoots: 4,
    trophyList: [
      { trophyName: 'UEFA Champions League (5)', season: '2007/08, 2013/14, 2015/16, 2016/17, 2017/18', clubOrCountry: 'Man United / Real Madrid' },
      { trophyName: 'UEFA Eurocopa', season: 'Francia 2016', clubOrCountry: 'Portugal' },
      { trophyName: 'Premier League (3), LaLiga (2), Serie A (2)', season: '2006 a 2020', clubOrCountry: 'United / Madrid / Juventus' },
    ],
  },
];

/**
 * Registers a newly crowned champion at season conclusion into the permanent palmarés
 */
export function recordTrophyInPalmares(
  archive: TrophyRecord[],
  record: Omit<TrophyRecord, 'id'>
): TrophyRecord[] {
  const newRecord: TrophyRecord = {
    ...record,
    id: `trophy_${record.competitionId}_${record.season}_${Date.now()}`,
    isPreGameHistory: false,
  };
  return [newRecord, ...(archive || HISTORICAL_TROPHY_ARCHIVE)];
}

/**
 * Awards a trophy cleanly across the game save: updates trophyArchive, club historyTitles,
 * manager career stats (if user is champion), and creates celebration data.
 */
export function awardTrophyToWinner(
  save: any,
  params: {
    competitionId: string;
    competitionName: string;
    trophyName: string;
    competitionType: 'LIGA' | 'COPA' | 'SUPERCOPA' | 'CHAMPIONS' | 'MUNDIAL_CLUBES' | 'SELECCIONES_MUNDIAL' | 'SELECCIONES_EUROPA';
    season: string;
    championId: string;
    runnerUpId?: string;
    scoreOrSummary: string;
    topScorer?: { playerName: string; clubName: string; goals: number };
  }
): { updatedSave: any; celebrationData?: any } {
  const champClub = save.clubs?.[params.championId];
  const runnerClub = params.runnerUpId ? save.clubs?.[params.runnerUpId] : undefined;
  const isUserWinner = params.championId === save.userClubId || params.championId === save.worldCupTournament?.userTeamId;

  const currentArchive: TrophyRecord[] = save.trophyArchive && save.trophyArchive.length > 0
    ? save.trophyArchive
    : [...HISTORICAL_TROPHY_ARCHIVE];

  const season = params.season || save.currentSeason || '2026-27';

  // Prevent duplicate awards for the same competition and season
  const existing = currentArchive.find(
    (t) => t.competitionId === params.competitionId && t.season === season
  );
  if (existing) {
    return { updatedSave: save };
  }

  const managerName = isUserWinner
    ? `${save.manager?.firstName || 'Míster'} ${save.manager?.lastName || 'Principal'}`
    : champClub?.coachName || 'Entrenador Campeón';

  const newTrophyRecord: TrophyRecord = {
    id: `trophy_${params.competitionId}_${season.replace('/', '_')}_${Date.now()}`,
    season: season,
    competitionId: params.competitionId,
    competitionName: params.competitionName,
    competitionType: params.competitionType,
    tier: params.competitionType === 'CHAMPIONS' || params.competitionType === 'MUNDIAL_CLUBES'
      ? 'CONTINENTAL'
      : params.competitionType === 'SELECCIONES_MUNDIAL'
      ? 'MUNDIAL'
      : 'NACIONAL_PRIMERA',
    championId: params.championId,
    championName: champClub?.name || 'Club Campeón',
    runnerUpId: params.runnerUpId,
    runnerUpName: runnerClub?.name,
    scoreOrSummary: params.scoreOrSummary,
    winningManagerName: managerName,
    topScorer: params.topScorer,
    isPreGameHistory: false,
  };

  const updatedArchive = [newTrophyRecord, ...currentArchive];

  let updatedClubs = { ...save.clubs };
  if (champClub) {
    const existingTitles = champClub.historyTitles || [];
    updatedClubs[params.championId] = {
      ...champClub,
      historyTitles: [
        { title: `${params.trophyName} (${params.competitionName})`, season: params.season },
        ...existingTitles,
      ],
      reputation: Math.min(99, (champClub.reputation || 70) + (isUserWinner ? 6 : 3)),
    };
  }

  let updatedManager = { ...save.manager };
  let celebrationData: any = undefined;

  if (isUserWinner) {
    const prevStats = updatedManager.careerStats || {
      matchesManaged: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      titlesWon: 0,
      promotions: 0,
      sacksCount: 0,
      resignationsCount: 0,
    };

    updatedManager = {
      ...updatedManager,
      reputation: Math.min(99, Math.max(92, (updatedManager.reputation || 60) + 10)),
      careerStats: {
        ...prevStats,
        titlesWon: (prevStats.titlesWon || 0) + 1,
      },
      historyTitles: [
        { title: `${params.trophyName} (${params.competitionName})`, season: params.season, clubName: champClub?.name },
        ...(updatedManager.historyTitles || []),
      ],
      careerLog: [
        {
          season: params.season,
          clubOrNationName: champClub?.name || 'Club Campeón',
          competitionName: params.competitionName,
          achieved: `🏆 CAMPEÓN de ${params.trophyName}`,
          isTitle: true,
        },
        ...(updatedManager.careerLog || []),
      ],
    };

    celebrationData = {
      competitionId: params.competitionId,
      competitionName: params.competitionName,
      trophyName: params.trophyName,
      season: params.season,
      club: updatedClubs[params.championId] || champClub,
      managerName: `${updatedManager.firstName} ${updatedManager.lastName}`,
      summaryText: params.scoreOrSummary,
      topScorerName: params.topScorer?.playerName,
      topScorerGoals: params.topScorer?.goals,
    };
  }

  const cleanSeason = (params.season || '').replace(/[\/\\-]/g, '_');
  const newsId = `trophy_news_${params.competitionId}_${cleanSeason}_${params.championId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const celebrationNews = {
    id: newsId,
    date: save.currentDate,
    title: `¡¡¡${champClub?.name.toUpperCase() || 'CAMPEÓN'} ALZA EL TÍTULO DE ${params.competitionName.toUpperCase()}!!!`,
    content: `Júbilo absoluto. ${champClub?.name} se proclama campeón oficial tras una gesta memorable (${params.scoreOrSummary}). El trofeo pasa a engrosar el palmarés histórico oficial.`,
    category: 'PARTIDO',
    read: false,
  };

  const safeExistingNews: NewsItem[] = save.news || [];
  const alreadyAnnounced = safeExistingNews.some(
    (n: NewsItem) =>
      n.id.startsWith(`trophy_news_${params.competitionId}_${cleanSeason}_${params.championId}`) ||
      (n.title && n.title.includes(params.competitionName.toUpperCase()) && n.content.includes(params.scoreOrSummary))
  );

  let updatedSave = {
    ...save,
    clubs: updatedClubs,
    manager: updatedManager,
    trophyArchive: updatedArchive,
    news: alreadyAnnounced ? safeExistingNews : [celebrationNews, ...safeExistingNews],
  };

  if (isUserWinner && (updatedSave.privateLife || save.privateLife)) {
    const bonusAmount = params.competitionType === 'CHAMPIONS' ? 500000
      : params.competitionType === 'MUNDIAL_CLUBES' ? 400000
      : params.competitionType === 'SELECCIONES_MUNDIAL' ? 750000
      : params.competitionType === 'LIGA' ? 300000
      : 150000;
    updatedSave = rewardManagerTitleBonus(updatedSave, params.trophyName, bonusAmount);
  }

  return { updatedSave, celebrationData };
}
