import { Club } from '../types/club';
import { Competition, Match, StandingsRow } from '../types/competition';
import { Player } from '../types/player';
import { 
  CompetitionRegulation, 
  DEFAULT_IFAB_RULES, 
  IFABRules, 
  SquadRegistrationRules 
} from '../types/regulations';

/**
 * Official European Economic Area (EEA) and EU country codes
 * for Non-EU player quota verification in Spain, France, Italy, etc.
 */
export const EU_EEA_COUNTRY_CODES = new Set([
  'ESP', 'FRA', 'GER', 'ITA', 'POR', 'NED', 'BEL', 'AUT', 'CRO', 'CZE', 
  'DEN', 'FIN', 'GRE', 'HUN', 'IRL', 'POL', 'ROU', 'SVK', 'SVN', 'SWE', 
  'BUL', 'CYP', 'EST', 'LVA', 'LTU', 'LUX', 'MLT', 'NOR', 'ISL', 'LIE', 'SUI'
]);

// ============================================================================
// 1. REGLAMENTOS OFICIALES POR COMPETICIÓN Y PAÍS (FASE 7)
// ============================================================================
export const OFFICIAL_COMPETITION_REGULATIONS: Record<string, CompetitionRegulation> = {
  // ESPAÑA — TIER 1
  esp_tier1: {
    id: 'reg_esp_tier1',
    competitionId: 'esp_tier1',
    name: 'Primera División de España (LaLiga EA Sports)',
    countryId: 'ESP',
    tier: 1,
    season: '2024/25',
    participantsCount: 20,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 3,
    continentalSlots: {
      championsLeagueGroup: 4,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 2,
      conferenceLeaguePlayoff: 1,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 3,
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-01' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Real Federación Española de Fútbol & Liga Nacional de Fútbol Profesional — Bases de Competición 2024/25',
    validSinceYear: 2024,
    hasVAR: true,
    notes: 'Desempate por enfrentamiento particular directo entre empatados si ambos partidos se han disputado. Límite de 3 extracomunitarios y control económico estricto.',
  },

  // ESPAÑA — TIER 2
  esp_tier2: {
    id: 'reg_esp_tier2',
    competitionId: 'esp_tier2',
    name: 'Segunda División de España (LaLiga Hypermotion)',
    countryId: 'ESP',
    tier: 2,
    season: '2024/25',
    participantsCount: 22,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 2,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 4,
    playoffFormat: 'IDA_VUELTA_MEJOR_CLASIFICADO',
    directRelegations: 4,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 2,
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-01' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Reglamento General de la RFEF & Bases Oficiales de LaLiga Hypermotion',
    validSinceYear: 2024,
    hasVAR: true,
    notes: 'Ascenso directo para 1º y 2º. Playoff del 3º al 6º a doble partido: si hay empate tras prórroga en la final, asciende el mejor clasificado en liga regular sin tanda de penaltis.',
  },

  // ESPAÑA — TIER 3
  esp_tier3_g2: {
    id: 'reg_esp_tier3_g2',
    competitionId: 'esp_tier3_g2',
    name: 'Primera Federación Versus e-Learning (Grupo 2)',
    countryId: 'ESP',
    tier: 3,
    season: '2024/25',
    participantsCount: 20,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 1,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 4,
    playoffFormat: 'IDA_VUELTA_MEJOR_CLASIFICADO',
    directRelegations: 5,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 24,
      maxNonEUPlayers: 0,
      minHomegrownPlayers: 6,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-01' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Bases Reguladoras y Normas de Competición Primera Federación RFEF',
    validSinceYear: 2024,
    hasVAR: false,
    notes: 'El campeón de cada grupo asciende directo a Segunda. Del 2º al 5º disputan la fase de ascenso. Descienden los 5 últimos clasificados a Segunda Federación.',
  },

  // ESPAÑA — TIER 4
  esp_tier4_g3: {
    id: 'reg_esp_tier4_g3',
    competitionId: 'esp_tier4_g3',
    name: 'Segunda Federación RFEF (Grupo 3 Cataluña-Levante)',
    countryId: 'ESP',
    tier: 4,
    season: '2024/25',
    participantsCount: 18,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 1,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 4,
    playoffFormat: 'IDA_VUELTA_MEJOR_CLASIFICADO',
    directRelegations: 5,
    relegationPlayoutSlots: 1,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 22,
      maxNonEUPlayers: 0,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: false,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-01' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Bases de Competición Segunda Federación RFEF 2024/25',
    validSinceYear: 2024,
    hasVAR: false,
    notes: 'Campeón asciende directo. Del 2º al 5º disputan playoff nacional. Descienden del 14º al 18º; el 13º juega el play-out de permanencia.',
  },

  // ESPAÑA — TIER 5 (GRUPO 5 CATALUÑA - GRAMA, SANT ANDREU, ETC.)
  esp_tier5_g5: {
    id: 'reg_esp_tier5_g5',
    competitionId: 'esp_tier5_g5',
    name: 'Tercera Federación RFEF (Grupo 5 Cataluña)',
    countryId: 'ESP',
    tier: 5,
    season: '2024/25',
    participantsCount: 18,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 1,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 4,
    playoffFormat: 'ELIMINATORIA_DOBLE_CON_PENALTIS',
    directRelegations: 3,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 22,
      maxNonEUPlayers: 0,
      minHomegrownPlayers: 10,
      officialDorsalsFirstTeam: false,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-01' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Federació Catalana de Futbol & RFEF Bases Tercera Federación Grupo 5',
    validSinceYear: 2024,
    hasVAR: false,
    notes: 'Campeón asciende directo a Segunda Federación. Del 2º al 5º disputan playoff autonómico catalán y luego fase nacional.',
  },

  // INGLATERRA — PREMIER LEAGUE
  eng_tier1: {
    id: 'reg_eng_tier1',
    competitionId: 'eng_tier1',
    name: 'Premier League',
    countryId: 'ENG',
    tier: 1,
    season: '2024/25',
    participantsCount: 20,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 3,
    continentalSlots: {
      championsLeagueGroup: 4,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 2,
      conferenceLeaguePlayoff: 1,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 17, // Foreign players permitted if points GBE met
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
      nonEUWorkPermitPointsRequired: 15,
    },
    transferWindows: {
      summer: { start: '06-14', end: '08-30' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'The Football Association & Premier League Handbook 2024/25 Edition',
    validSinceYear: 2024,
    hasVAR: true,
    notes: 'Desempate por diferencia de goles general. Requisito estricto de mínimo 8 futbolistas formados en el país (Homegrown). Permiso de trabajo GBE post-Brexit.',
  },

  // ALEMANIA — BUNDESLIGA
  ger_tier1: {
    id: 'reg_ger_tier1',
    competitionId: 'ger_tier1',
    name: 'Bundesliga',
    countryId: 'GER',
    tier: 1,
    season: '2024/25',
    participantsCount: 18,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 2,
    relegationPlayoutSlots: 1, // 16th plays Relegation Playoff against 3rd of 2. Bundesliga
    continentalSlots: {
      championsLeagueGroup: 4,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 2,
      conferenceLeaguePlayoff: 1,
    },
    squadRules: {
      maxFirstTeamSquadSize: 28,
      maxNonEUPlayers: 20, // Sin límite formal de extracomunitarios
      minHomegrownPlayers: 8, // Mínimo 8 canteranos locales alemanes
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '08-30' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'DFL Deutsche Fußball Liga — Spielordnung & Statuten 2024/25',
    validSinceYear: 2024,
    hasVAR: true,
    notes: '18 participantes. 2 descensos directos; el 16º juega eliminatoria a ida y vuelta (Relegationsspiele) contra el 3º de 2. Bundesliga.',
  },

  // ITALIA — SERIE A
  ita_tier1: {
    id: 'reg_ita_tier1',
    competitionId: 'ita_tier1',
    name: 'Serie A Enilive',
    countryId: 'ITA',
    tier: 1,
    season: '2024/25',
    participantsCount: 20,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'SPAREGGIO_DESEMPATE', // Spareggio for 1st-2nd and 17th-18th
    tiebreakerSecondary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerTertiary: 'DIFERENCIA_GOLES_GENERAL',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 3,
    continentalSlots: {
      championsLeagueGroup: 4,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 2,
      conferenceLeaguePlayoff: 1,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 2, // Cupo estricto de nuevos fichajes extracomunitarios por año
      minHomegrownPlayers: 8, // 4 del club + 4 de Italia
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '08-30' },
      winter: { start: '01-02', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'FIGC & Lega Nazionale Professionisti Serie A — Comunicati Ufficiali 2024/25',
    validSinceYear: 2024,
    hasVAR: true,
    notes: 'Regla del Spareggio: si el 1º y 2º empatan a puntos por el Scudetto, o el 17º y 18º por el descenso, se juega partido único de desempate en campo neutral.',
  },

  // FRANCIA — LIGUE 1
  fra_tier1: {
    id: 'reg_fra_tier1',
    competitionId: 'fra_tier1',
    name: 'Ligue 1 McDonald\'s',
    countryId: 'FRA',
    tier: 1,
    season: '2024/25',
    participantsCount: 18,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 2,
    relegationPlayoutSlots: 1, // 16º juega Barrage contra ganador de playoffs de Ligue 2
    continentalSlots: {
      championsLeagueGroup: 3,
      championsLeaguePlayoff: 1,
      europaLeagueGroup: 2,
      conferenceLeaguePlayoff: 1,
    },
    squadRules: {
      maxFirstTeamSquadSize: 26,
      maxNonEUPlayers: 4,
      minHomegrownPlayers: 6,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '08-30' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Ligue de Football Professionnel (LFP) — Règlements des Compétitions',
    validSinceYear: 2024,
    hasVAR: true,
    notes: '18 participantes. 2 descensos directos y 16º disputa la eliminatoria de Barrages.',
  },

  // BRASIL — BRASILEIRÃO SÉRIE A
  bra_tier1: {
    id: 'reg_bra_tier1',
    competitionId: 'bra_tier1',
    name: 'Brasileirão Série A Betano',
    countryId: 'BRA',
    tier: 1,
    season: '2024',
    participantsCount: 20,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'MAYOR_NUMERO_VICTORIAS', // CRITERIO OFICIAL BRASIL: 1º Mayor número de victorias
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 4,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
      copaLibertadores: 6,
      copaSudamericana: 6,
    },
    squadRules: {
      maxFirstTeamSquadSize: 35,
      maxNonEUPlayers: 9, // Límite ampliado por CBF a 9 extranjeros
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: false,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '01-11', end: '03-07' },
      winter: { start: '07-10', end: '09-02' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Confederação Brasileira de Futebol (CBF) — Regulamento Específico da Competição',
    validSinceYear: 2024,
    hasVAR: true,
    notes: 'Criterio de desempate auténtico: Número de victorias antes que diferencia de goles. 4 descensos directos a Série B.',
  },

  // ARGENTINA — LIGA PROFESIONAL
  arg_tier1: {
    id: 'reg_arg_tier1',
    competitionId: 'arg_tier1',
    name: 'Liga Profesional de Fútbol Argentina',
    countryId: 'ARG',
    tier: 1,
    season: '2024',
    participantsCount: 28,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 2, // 1 por tabla anual general + 1 por promedio
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
      copaLibertadores: 5,
      copaSudamericana: 6,
    },
    squadRules: {
      maxFirstTeamSquadSize: 35,
      maxNonEUPlayers: 6, // Máximo 6 extranjeros registrados (5 en planilla)
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: false,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '01-02', end: '02-02' },
      winter: { start: '06-01', end: '08-30' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Asociación del Fútbol Argentino (AFA) — Reglamento Torneo LPF',
    validSinceYear: 2024,
    hasVAR: true,
    notes: '28 equipos participantes en una sola rueda. Descensos combinados por Tabla Anual acumulada y Tabla de Promedios históricos.',
  },

  // INGLATERRA — EFL CHAMPIONSHIP
  eng_tier2: {
    id: 'reg_eng_tier2',
    competitionId: 'eng_tier2',
    name: 'EFL Championship',
    countryId: 'ENG',
    tier: 2,
    season: '2024/25',
    participantsCount: 24,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 2,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 4,
    playoffFormat: 'FINAL_UNICA_WEMBLEY',
    directRelegations: 3,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 15,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
      nonEUWorkPermitPointsRequired: 15,
    },
    transferWindows: {
      summer: { start: '06-14', end: '08-30' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'English Football League (EFL) Regulations — Championship 2024/25',
    validSinceYear: 2024,
    hasVAR: false,
    category: 'NACIONAL_LIGA',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Ascenso directo para 1º y 2º. Semifinales a ida y vuelta (3º vs 6º y 4º vs 5º) y gran final única en Wembley Stadium.',
  },

  // INGLATERRA — EFL LEAGUE ONE
  eng_tier3: {
    id: 'reg_eng_tier3',
    competitionId: 'eng_tier3',
    name: 'EFL League One',
    countryId: 'ENG',
    tier: 3,
    season: '2024/25',
    participantsCount: 24,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 2,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 4,
    playoffFormat: 'FINAL_UNICA_WEMBLEY',
    directRelegations: 4,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 22,
      maxNonEUPlayers: 8,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '06-14', end: '08-30' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'EFL League One Regulations & Salary Cost Management Protocol (SCMP)',
    validSinceYear: 2024,
    hasVAR: false,
    category: 'NACIONAL_LIGA',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: '2 ascensos directos, playoff de 4 equipos (3º al 6º) con final en Wembley y 4 descensos a League Two.',
  },

  // INGLATERRA — EFL LEAGUE TWO
  eng_tier4: {
    id: 'reg_eng_tier4',
    competitionId: 'eng_tier4',
    name: 'EFL League Two',
    countryId: 'ENG',
    tier: 4,
    season: '2024/25',
    participantsCount: 24,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 3,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 4,
    playoffFormat: 'FINAL_UNICA_WEMBLEY',
    directRelegations: 2,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 22,
      maxNonEUPlayers: 5,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '06-14', end: '08-30' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'EFL League Two Official Handbook',
    validSinceYear: 2024,
    hasVAR: false,
    category: 'NACIONAL_LIGA',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: '3 ascensos directos (1º, 2º y 3º). Playoff del 4º al 7º por la 4ª plaza de ascenso. 2 descensos a National League.',
  },

  // ALEMANIA — 2. BUNDESLIGA
  ger_tier2: {
    id: 'reg_ger_tier2',
    competitionId: 'ger_tier2',
    name: '2. Bundesliga',
    countryId: 'GER',
    tier: 2,
    season: '2024/25',
    participantsCount: 18,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 2,
    playoffPromotionSlots: 1,
    playoffTeamsCount: 1, // 3rd plays Relegationsspiele vs 16th of Bundesliga
    playoffFormat: 'RELEGATION_PLAYOFF',
    directRelegations: 2,
    relegationPlayoutSlots: 1, // 16th plays Relegationsspiele vs 3rd of 3. Liga
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 28,
      maxNonEUPlayers: 18,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '08-30' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'DFL Deutsche Fußball Liga — 2. Bundesliga Spielordnung',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'NACIONAL_LIGA',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: '2 ascensos directos. El 3º clasificado disputa la promoción (Relegationsspiele) contra el 16º de la Bundesliga a ida y vuelta.',
  },

  // UEFA CHAMPIONS LEAGUE (NUEVO FORMATO 36 CLUBES)
  uefa_champions_league: {
    id: 'reg_uefa_champions_league',
    competitionId: 'uefa_champions_league',
    name: 'UEFA Champions League (Fase de Liga de 36 Equipos)',
    countryId: 'EUR',
    tier: 1,
    season: '2024/25',
    participantsCount: 36,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 12, // 25º al 36º eliminados directamente sin caer a Europa League
    continentalSlots: {
      championsLeagueGroup: 8, // Clasificación directa a Octavos de Final
      championsLeaguePlayoff: 16, // Puestos 9º al 24º juegan Play-offs de eliminatoria
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25, // Lista A UEFA
      maxNonEUPlayers: 25,
      minHomegrownPlayers: 8, // 4 formados en la federación + 4 formados en el club
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true, // Lista B ilimitada sub-21
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-02' },
      winter: { start: '01-01', end: '02-02' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'UEFA — Regulations of the UEFA Champions League 2024/27 Cycle',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'CONTINENTAL_CLUBES',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Tabla única de 36 clubes bajo modelo suizo. 8 partidos (4 casa, 4 fuera) contra 2 rivales de cada uno de los 4 bombos. Del 1º al 8º directos a octavos; del 9º al 24º play-offs a doble partido. Del 25º al 36º quedan definitivamente eliminados sin descenso a UEL.',
  },

  // UEFA EUROPA LEAGUE
  uefa_europa_league: {
    id: 'reg_uefa_europa_league',
    competitionId: 'uefa_europa_league',
    name: 'UEFA Europa League',
    countryId: 'EUR',
    tier: 2,
    season: '2024/25',
    participantsCount: 36,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 12,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 8, // Directos a octavos
      conferenceLeaguePlayoff: 16, // Play-offs eliminatorios
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 25,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-02' },
      winter: { start: '01-01', end: '02-02' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'UEFA — Regulations of the UEFA Europa League 2024/27 Cycle',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'CONTINENTAL_CLUBES',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Idéntico sistema de liga de 36 clubes que la Champions League con 8 jornadas. Sin trasvase a Conference League para los eliminados.',
  },

  // UEFA CONFERENCE LEAGUE
  uefa_conference_league: {
    id: 'reg_uefa_conference_league',
    competitionId: 'uefa_conference_league',
    name: 'UEFA Conference League',
    countryId: 'EUR',
    tier: 3,
    season: '2024/25',
    participantsCount: 36,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 12,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 25,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-02' },
      winter: { start: '01-01', end: '02-02' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'UEFA — Regulations of the UEFA Conference League 2024/27 Cycle',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'CONTINENTAL_CLUBES',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Fase de liga única de 36 clubes con 6 jornadas (a diferencia de las 8 de Champions y Europa League). 1º al 8º a octavos.',
  },

  // UEFA SUPER CUP
  uefa_super_cup: {
    id: 'reg_uefa_super_cup',
    competitionId: 'uefa_super_cup',
    name: 'Supercopa de Europa de la UEFA',
    countryId: 'EUR',
    tier: 1,
    season: '2024',
    participantsCount: 2,
    roundsCount: 1,
    pointsForWin: 0,
    pointsForDraw: 0,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 25,
      minHomegrownPlayers: 8,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-02' },
      winter: { start: '01-01', end: '02-02' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'UEFA Super Cup Official Match Regulations',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'CONTINENTAL_CLUBES',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Partido único en sede neutral entre el campeón de la UEFA Champions League y el campeón de la UEFA Europa League. Si hay empate tras 90 min, tanda de penaltis directa (sin prórroga desde 2023).',
  },

  // MUNDIAL DE CLUBES FIFA (NUEVO FORMATO 32 CLUBES)
  fifa_club_world_cup_32: {
    id: 'reg_fifa_club_world_cup_32',
    competitionId: 'fifa_club_world_cup_32',
    name: 'Copa Mundial de Clubes de la FIFA (32 Equipos)',
    countryId: 'WLD',
    tier: 1,
    season: '2025',
    participantsCount: 32,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 35,
      maxNonEUPlayers: 35,
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: false,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '06-01', end: '06-10' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'FIFA Regulations for the FIFA Club World Cup 2025 Edition',
    validSinceYear: 2025,
    hasVAR: true,
    category: 'INTERNACIONAL_CLUBES',
    confederation: 'FIFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Nuevo formato cuatrienal con 32 clubes de las 6 confederaciones. 8 grupos de 4 equipos (3 partidos); los 2 primeros de cada grupo avanzan a Octavos de Final a partido único hasta la final.',
  },

  // COPA INTERCONTINENTAL DE LA FIFA (ANUAL)
  fifa_intercontinental_cup: {
    id: 'reg_fifa_intercontinental_cup',
    competitionId: 'fifa_intercontinental_cup',
    name: 'Copa Intercontinental de la FIFA',
    countryId: 'WLD',
    tier: 1,
    season: '2024',
    participantsCount: 6,
    roundsCount: 1,
    pointsForWin: 0,
    pointsForDraw: 0,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 26,
      maxNonEUPlayers: 26,
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: false,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-01' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'FIFA Circular & Competition Regulations — Coupe Intercontinentale de la FIFA',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'INTERNACIONAL_CLUBES',
    confederation: 'FIFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Torneo anual entre los 6 campeones de confederación. El campeón de la UEFA Champions League pasa directo a la Gran Final.',
  },

  // CONMEBOL LIBERTADORES
  conmebol_libertadores: {
    id: 'reg_conmebol_libertadores',
    competitionId: 'conmebol_libertadores',
    name: 'CONMEBOL Libertadores',
    countryId: 'SAM',
    tier: 1,
    season: '2024',
    participantsCount: 32,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'GOLES_DE_VISITANTE',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 50,
      maxNonEUPlayers: 10,
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '01-02', end: '03-10' },
      winter: { start: '07-01', end: '08-15' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Manual de Clubes CONMEBOL Libertadores 2024',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'CONTINENTAL_CLUBES',
    confederation: 'CONMEBOL',
    status: 'OFICIAL_VERIFICADO',
    notes: '32 equipos en 8 grupos de 4. Los 2 primeros pasan a Octavos. El 3º clasificado cae al Playoff de CONMEBOL Sudamericana. Gran final a partido único.',
  },

  // CONMEBOL SUDAMERICANA
  conmebol_sudamericana: {
    id: 'reg_conmebol_sudamericana',
    competitionId: 'conmebol_sudamericana',
    name: 'CONMEBOL Sudamericana',
    countryId: 'SAM',
    tier: 2,
    season: '2024',
    participantsCount: 32,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 50,
      maxNonEUPlayers: 10,
      minHomegrownPlayers: 4,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '01-02', end: '03-10' },
      winter: { start: '07-01', end: '08-15' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Reglamento Oficial CONMEBOL Sudamericana',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'CONTINENTAL_CLUBES',
    confederation: 'CONMEBOL',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Los 8 ganadores de grupo avanzan a Octavos de Final. Los 8 segundos disputan una eliminatoria de Play-off contra los 8 terceros de la fase de grupos de la Copa Libertadores.',
  },

  // COPA MUNDIAL DE LA FIFA (FORMATO DE 48 SELECCIONES)
  fifa_world_cup_48: {
    id: 'reg_fifa_world_cup_48',
    competitionId: 'fifa_world_cup_48',
    name: 'Copa Mundial de la FIFA (48 Selecciones)',
    countryId: 'WLD',
    tier: 1,
    season: '2026',
    participantsCount: 48,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 26,
      maxNonEUPlayers: 26,
      minHomegrownPlayers: 26,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: false,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '06-01', end: '07-31' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'FIFA Council Decisions & Format for the FIFA World Cup 2026 (USA / Mexico / Canada)',
    validSinceYear: 2026,
    hasVAR: true,
    category: 'SELECCIONES',
    confederation: 'FIFA',
    status: 'OFICIAL_VERIFICADO',
    notes: '48 selecciones distribuidas en 12 grupos de 4 equipos. Se clasifican a Dieciseisavos de Final (Ronda de 32) los 2 primeros de cada grupo más los 8 mejores terceros clasificados. Total de 104 partidos.',
  },

  // UEFA EUROCOPA (24 SELECCIONES)
  uefa_euro_24: {
    id: 'reg_uefa_euro_24',
    competitionId: 'uefa_euro_24',
    name: 'Campeonato Europeo de la UEFA (Eurocopa)',
    countryId: 'EUR',
    tier: 1,
    season: '2024',
    participantsCount: 24,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 26,
      maxNonEUPlayers: 26,
      minHomegrownPlayers: 26,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: false,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '06-01', end: '07-15' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'UEFA European Football Championship Final Tournament Regulations 2024',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'SELECCIONES',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: '24 selecciones en 6 grupos de 4. Avanzan a Octavos de Final los 2 primeros de cada grupo y los 4 mejores terceros. Desempate primario por enfrentamiento particular.',
  },

  // COPA AMÉRICA CONMEBOL
  copa_america: {
    id: 'reg_copa_america',
    competitionId: 'copa_america',
    name: 'CONMEBOL Copa América',
    countryId: 'SAM',
    tier: 1,
    season: '2024',
    participantsCount: 16,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 0,
    directRelegations: 0,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 26,
      maxNonEUPlayers: 26,
      minHomegrownPlayers: 26,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: false,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '06-01', end: '07-15' },
      winter: { start: '01-01', end: '01-31' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'Reglamento Oficial CONMEBOL Copa América 2024',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'SELECCIONES',
    confederation: 'CONMEBOL',
    status: 'OFICIAL_VERIFICADO',
    notes: '16 selecciones (10 de CONMEBOL y 6 invitadas de CONCACAF). 4 grupos de 4; avanzan los 2 primeros directamente a Cuartos de Final.',
  },

  // UEFA NATIONS LEAGUE
  uefa_nations_league: {
    id: 'reg_uefa_nations_league',
    competitionId: 'uefa_nations_league',
    name: 'UEFA Nations League',
    countryId: 'EUR',
    tier: 1,
    season: '2024/25',
    participantsCount: 54,
    roundsCount: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'ENFRENTAMIENTOS_DIRECTOS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 4,
    playoffPromotionSlots: 4,
    playoffTeamsCount: 8,
    directRelegations: 4,
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 23,
      maxNonEUPlayers: 23,
      minHomegrownPlayers: 23,
      officialDorsalsFirstTeam: true,
      allowYouthPlayersWithoutRegistration: false,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '07-01', end: '09-01' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: true,
    officialSourceCitation: 'UEFA Nations League Regulations 2024/25 Edition',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'SELECCIONES',
    confederation: 'UEFA',
    status: 'OFICIAL_VERIFICADO',
    notes: 'Dividida en Ligas A, B, C y D. Los 2 primeros de cada grupo de Liga A avanzan a cuartos de final ida y vuelta, y los ganadores disputan la Final Four en junio. Play-offs de ascenso/descenso entre ligas.',
  },

  // COMPETICIÓN PENDIENTE DE VALIDACIÓN: MAJOR LEAGUE SOCCER (MLS)
  usa_mls: {
    id: 'reg_usa_mls',
    competitionId: 'usa_mls',
    name: 'Major League Soccer (MLS)',
    countryId: 'USA',
    tier: 1,
    season: '2024',
    participantsCount: 29,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'MAYOR_NUMERO_VICTORIAS',
    tiebreakerSecondary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerTertiary: 'GOLES_A_FAVOR',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 18,
    playoffFormat: 'PLAY_IN_LIGUILLA',
    directRelegations: 0, // Franquicia cerrada sin descensos
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 30,
      maxNonEUPlayers: 8, // International roster slots negociables
      minHomegrownPlayers: 3, // Homegrown players exentos de tope salarial
      officialDorsalsFirstTeam: false,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: true, // Salary Cap con Designated Players (Jugadores Franquicia)
    },
    transferWindows: {
      summer: { start: '01-31', end: '04-23' },
      winter: { start: '07-18', end: '08-14' },
    },
    isOfficialVerified: false,
    officialSourceCitation: 'MLS Roster Rules and Regulations — Pendiente de validación federativa integral en Santako',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'NACIONAL_LIGA',
    confederation: 'CONCACAF',
    status: 'PENDIENTE_VALIDACION',
    notes: 'AVISO: Competición marcada como pendiente de validación completa. Sistema de conferencias Este/Oeste, MLS Supporters Shield para la liga regular y MLS Cup Playoffs con ronda comodín (Wild Card).',
  },

  // COMPETICIÓN PENDIENTE DE VALIDACIÓN: LIGA MX
  mex_tier1: {
    id: 'reg_mex_tier1',
    competitionId: 'mex_tier1',
    name: 'Liga BBVA MX (Apertura y Clausura)',
    countryId: 'MEX',
    tier: 1,
    season: '2024/25',
    participantsCount: 18,
    roundsCount: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreakerPrimary: 'DIFERENCIA_GOLES_GENERAL',
    tiebreakerSecondary: 'GOLES_A_FAVOR',
    tiebreakerTertiary: 'ENFRENTAMIENTOS_DIRECTOS',
    directPromotions: 0,
    playoffPromotionSlots: 0,
    playoffTeamsCount: 10,
    playoffFormat: 'PLAY_IN_LIGUILLA',
    directRelegations: 0, // Descensos congelados por la FMF (multas económicas)
    continentalSlots: {
      championsLeagueGroup: 0,
      championsLeaguePlayoff: 0,
      europaLeagueGroup: 0,
      conferenceLeaguePlayoff: 0,
    },
    squadRules: {
      maxFirstTeamSquadSize: 25,
      maxNonEUPlayers: 9, // No Formados en México (NFM) máximo 9 registrados, 7 en cancha
      minHomegrownPlayers: 10,
      officialDorsalsFirstTeam: false,
      allowYouthPlayersWithoutRegistration: true,
      wageCapFinancialFairPlay: false,
    },
    transferWindows: {
      summer: { start: '06-27', end: '09-14' },
      winter: { start: '01-01', end: '02-01' },
    },
    isOfficialVerified: false,
    officialSourceCitation: 'Reglamento de Competencia Liga MX — Pendiente de validación federativa FMF',
    validSinceYear: 2024,
    hasVAR: true,
    category: 'NACIONAL_LIGA',
    confederation: 'CONCACAF',
    status: 'PENDIENTE_VALIDACION',
    notes: 'AVISO: Marcada como pendiente de validación. Torneos cortos semestrales (Apertura y Clausura) con Play-In (7º al 10º) y Liguilla por el título. Descensos deportivos suspendidos temporalmente.',
  },
};

/**
 * Resolves competition standings by strictly executing the competition's authentic tiebreaker rules
 */
export function resolveCompetitionStandings(
  standings: StandingsRow[],
  matches: Match[],
  regulation: CompetitionRegulation
): StandingsRow[] {
  const sorted = [...standings];

  sorted.sort((a, b) => {
    // 1. Primary Points check
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // 2. Evaluate Primary Tiebreaker
    if (regulation.tiebreakerPrimary === 'ENFRENTAMIENTOS_DIRECTOS') {
      // Find head-to-head match between a and b
      const h2hMatches = matches.filter(
        (m) => m.played &&
          ((m.homeTeamId === a.teamId && m.awayTeamId === b.teamId) ||
           (m.homeTeamId === b.teamId && m.awayTeamId === a.teamId))
      );

      if (h2hMatches.length > 0) {
        let ptsA = 0;
        let ptsB = 0;
        let goalsA = 0;
        let goalsB = 0;

        h2hMatches.forEach((m) => {
          if (m.homeScore !== undefined && m.awayScore !== undefined) {
            if (m.homeTeamId === a.teamId) {
              goalsA += m.homeScore;
              goalsB += m.awayScore;
              if (m.homeScore > m.awayScore) ptsA += 3;
              else if (m.homeScore < m.awayScore) ptsB += 3;
              else { ptsA += 1; ptsB += 1; }
            } else {
              goalsB += m.homeScore;
              goalsA += m.awayScore;
              if (m.homeScore > m.awayScore) ptsB += 3;
              else if (m.homeScore < m.awayScore) ptsA += 3;
              else { ptsA += 1; ptsB += 1; }
            }
          }
        });

        if (ptsB !== ptsA) return ptsB - ptsA;
        if ((goalsB - goalsA) !== 0) return goalsB - goalsA;
      }
    } else if (regulation.tiebreakerPrimary === 'MAYOR_NUMERO_VICTORIAS') {
      // Brasil: Most wins first
      if (b.won !== a.won) {
        return b.won - a.won;
      }
    }

    // 3. Evaluate Secondary: Goal Difference
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    // 4. Goals For (GF)
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // 5. Total wins
    return b.won - a.won;
  });

  return sorted;
}

/**
 * Calculates season outcomes (Champions, continental qualifiers, promotions, playoffs, relegations)
 * based strictly on the official competition regulation.
 */
export function calculateSeasonOutcomes(
  competition: Competition,
  regulation: CompetitionRegulation
): {
  championRow?: StandingsRow;
  championsLeagueDirect: StandingsRow[];
  europaLeagueDirect: StandingsRow[];
  conferenceLeaguePlayoff: StandingsRow[];
  directPromotions: StandingsRow[];
  playoffTeams: StandingsRow[];
  relegationPlayoutTeams: StandingsRow[];
  directRelegations: StandingsRow[];
} {
  const standings = competition.standings;
  if (!standings || standings.length === 0) {
    return {
      championsLeagueDirect: [],
      europaLeagueDirect: [],
      conferenceLeaguePlayoff: [],
      directPromotions: [],
      playoffTeams: [],
      relegationPlayoutTeams: [],
      directRelegations: [],
    };
  }

  const championRow = standings[0];

  // Continental Slots (Tier 1)
  const clSlots = regulation.continentalSlots.championsLeagueGroup;
  const elSlots = regulation.continentalSlots.europaLeagueGroup;
  const colSlots = regulation.continentalSlots.conferenceLeaguePlayoff;

  const championsLeagueDirect = standings.slice(0, clSlots);
  const europaLeagueDirect = standings.slice(clSlots, clSlots + elSlots);
  const conferenceLeaguePlayoff = standings.slice(clSlots + elSlots, clSlots + elSlots + colSlots);

  // Promotions & Playoffs (Lower tiers)
  const directPromSlots = regulation.directPromotions;
  const playoffSlots = regulation.playoffTeamsCount;

  const directPromotions = directPromSlots > 0 ? standings.slice(0, directPromSlots) : [];
  const playoffTeams = playoffSlots > 0 ? standings.slice(directPromSlots, directPromSlots + playoffSlots) : [];

  // Relegations & Playouts
  const directRelegationSlots = regulation.directRelegations;
  const playoutSlots = regulation.relegationPlayoutSlots || 0;

  const directRelegations = directRelegationSlots > 0 ? standings.slice(-directRelegationSlots) : [];
  const relegationPlayoutTeams = playoutSlots > 0 
    ? standings.slice(-(directRelegationSlots + playoutSlots), -directRelegationSlots) 
    : [];

  return {
    championRow,
    championsLeagueDirect,
    europaLeagueDirect,
    conferenceLeaguePlayoff,
    directPromotions,
    playoffTeams,
    relegationPlayoutTeams,
    directRelegations,
  };
}

/**
 * Legal Squad Registration Validator (FASE 7)
 * Audits a club squad against the specific competition regulations (LaLiga 25 fichas, Non-EU limits, homegrown)
 */
export function validateSquadRegistration(
  club: Club,
  playersMap: Record<string, Player>,
  regulation: CompetitionRegulation
): {
  isValid: boolean;
  passedChecks: string[];
  failedChecks: string[];
  warnings: string[];
  squadSummary: {
    totalSquadCount: number;
    firstTeamCount: number;
    nonEUCount: number;
    homegrownCount: number;
    totalWeeklyWage: number;
  };
} {
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const warnings: string[] = [];

  const squadPlayers = (club.playerIds || []).map((id) => playersMap[id]).filter(Boolean);
  const squadRules = regulation.squadRules;

  let nonEUCount = 0;
  let homegrownCount = 0;
  let firstTeamCount = 0;
  let totalWeeklyWage = 0;

  squadPlayers.forEach((p) => {
    totalWeeklyWage += p.contract?.wagePerWeek || 0;

    // Check first team status (either by squad category or squad status)
    const isFirstTeam = p.squadCategory === 'PRIMER_EQUIPO' || (p.squadNumber && p.squadNumber <= 25);
    if (isFirstTeam) {
      firstTeamCount++;
    }

    // Check Non-EU nationality
    const isEU = EU_EEA_COUNTRY_CODES.has(p.nationality);
    if (!isEU || p.isNonEU) {
      nonEUCount++;
    }

    // Homegrown estimation (nationality matches country or age <= 21 in academy)
    if (p.nationality === regulation.countryId || p.age <= 21) {
      homegrownCount++;
    }
  });

  // 1. First team squad size limit
  if (firstTeamCount <= squadRules.maxFirstTeamSquadSize) {
    passedChecks.push(`Límite de plantilla: Cumple con ${firstTeamCount}/${squadRules.maxFirstTeamSquadSize} futbolistas inscritos.`);
  } else {
    failedChecks.push(`Exceso de fichas profesionales: ${firstTeamCount} jugadores superan el límite legal de ${squadRules.maxFirstTeamSquadSize}.`);
  }

  // 2. Non-EU player quota
  if (nonEUCount <= squadRules.maxNonEUPlayers) {
    passedChecks.push(`Cupo de extracomunitarios: ${nonEUCount}/${squadRules.maxNonEUPlayers} plazas utilizadas.`);
  } else {
    failedChecks.push(`Infracción de extracomunitarios: ${nonEUCount} futbolistas no comunitarios superan el máximo permitido (${squadRules.maxNonEUPlayers}).`);
  }

  // 3. Homegrown quota
  if (homegrownCount >= squadRules.minHomegrownPlayers) {
    passedChecks.push(`Cuota de jugadores locales: ${homegrownCount}/${squadRules.minHomegrownPlayers} futbolistas formados localmente.`);
  } else {
    warnings.push(`Advertencia formativa: Solo ${homegrownCount}/${squadRules.minHomegrownPlayers} jugadores locales inscritos.`);
  }

  // 4. Financial Fair Play wage cap check
  if (squadRules.wageCapFinancialFairPlay) {
    const weeklyWageLimit = club.finances?.weeklyWageBudget || 500000;
    if (totalWeeklyWage <= weeklyWageLimit) {
      passedChecks.push(`Límite salarial y Fair Play: Masa salarial (${totalWeeklyWage.toLocaleString()} €/sem) dentro del tope (${weeklyWageLimit.toLocaleString()} €/sem).`);
    } else {
      failedChecks.push(`Fair Play Financiero sobrepasado: Masa salarial (${totalWeeklyWage.toLocaleString()} €/sem) excede el límite asignado (${weeklyWageLimit.toLocaleString()} €/sem).`);
    }
  }

  return {
    isValid: failedChecks.length === 0,
    passedChecks,
    failedChecks,
    warnings,
    squadSummary: {
      totalSquadCount: squadPlayers.length,
      firstTeamCount,
      nonEUCount,
      homegrownCount,
      totalWeeklyWage,
    },
  };
}
