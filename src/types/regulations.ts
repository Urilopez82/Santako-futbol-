import { Confederation } from './worldDatabase';
import { Player, Position } from './player';

// ============================================================================
// 1. REGLAS OFICIALES IFAB (LEYES DEL JUEGO)
// ============================================================================
export interface IFABRules {
  version: string;                    // Ej. "IFAB 2024/25"
  matchDurationMinutes: number;       // 90 min (2 partes de 45 min)
  halftimeDurationMinutes: number;    // 15 min
  extraTimeDurationMinutes: number;   // 30 min (2 partes de 15 min)
  minPlayersToPlay: number;           // 7 futbolistas
  maxPlayersOnPitch: number;          // 11 futbolistas
  maxSubstitutions: number;           // 5 cambios
  maxSubstitutionWindows: number;     // 3 ventanas durante el juego (más el descanso)
  extraSubInExtraTime: boolean;       // +1 sustitución adicional en prórroga
  penaltyShootoutFormat: 'CLASICO_5' | 'MUERTE_SUBITA';
  varProtocol: {
    enabled: boolean;
    appliesTo: ('GOLES' | 'PENALTIS' | 'ROJAS_DIRECTAS' | 'CONFUSION_IDENTIDAD')[];
    semiAutomatedOffside: boolean;
    goalLineTechnology: boolean;
  };
  goalkeeperRules: {
    passBackHandViolation: boolean;   // Cesión con el pie no se puede coger con la mano
    sixSecondsRule: boolean;          // Límite de retención de 6 segundos
    footOnLineAtPenalty: boolean;      // Al menos un pie sobre la línea en penalti
  };
  disciplinaryRules: {
    yellowCardCycle: number;          // 5 amarillas = 1 partido de sanción
    doubleYellowSuspension: number;   // 1 partido de sanción
    directRedMinSuspension: number;   // 1 a 3 partidos según gravedad
  };
}

export const DEFAULT_IFAB_RULES: IFABRules = {
  version: 'IFAB 2024/25',
  matchDurationMinutes: 90,
  halftimeDurationMinutes: 15,
  extraTimeDurationMinutes: 30,
  minPlayersToPlay: 7,
  maxPlayersOnPitch: 11,
  maxSubstitutions: 5,
  maxSubstitutionWindows: 3,
  extraSubInExtraTime: true,
  penaltyShootoutFormat: 'CLASICO_5',
  varProtocol: {
    enabled: true,
    appliesTo: ['GOLES', 'PENALTIS', 'ROJAS_DIRECTAS', 'CONFUSION_IDENTIDAD'],
    semiAutomatedOffside: true,
    goalLineTechnology: true,
  },
  goalkeeperRules: {
    passBackHandViolation: true,
    sixSecondsRule: true,
    footOnLineAtPenalty: true,
  },
  disciplinaryRules: {
    yellowCardCycle: 5,
    doubleYellowSuspension: 1,
    directRedMinSuspension: 2,
  },
};

// ============================================================================
// 2. REGLAMENTOS Y BASES DE COMPETICIÓN NACIONALES
// ============================================================================
export type TiebreakerCriterion = 
  | 'ENFRENTAMIENTOS_DIRECTOS'    // España: Head-to-head particular entre empatados
  | 'DIFERENCIA_GOLES_GENERAL'    // Inglaterra, Alemania, Francia: General goal difference
  | 'MAYOR_NUMERO_VICTORIAS'      // Brasil, Sudamérica: Most wins first
  | 'SPAREGGIO_DESEMPATE'         // Italia: Partido extra si empatan 1º-2º o 17º-18º
  | 'GOLES_A_FAVOR'
  | 'GOLES_DE_VISITANTE';

export type PlayoffFormat =
  | 'IDA_VUELTA_MEJOR_CLASIFICADO' // España Segunda: sin penaltis, gana el mejor clasificado si hay empate tras prórroga
  | 'FINAL_UNICA_WEMBLEY'          // Inglaterra: Semis ida y vuelta, final única a partido seco
  | 'RELEGATION_PLAYOFF'           // Alemania/Francia: Antepenúltimo de 1ª vs 3º de 2ª
  | 'ELIMINATORIA_DOBLE_CON_PENALTIS'
  | 'SEDE_NEUTRAL_UNICO'
  | 'PLAY_IN_LIGUILLA';           // México / MLS

export interface SquadRegistrationRules {
  maxFirstTeamSquadSize: number;       // España: 25 fichas
  maxNonEUPlayers: number;             // Extracomunitarios permitidos (LaLiga: 3, Segunda: 2, 1ª Fed: 0)
  minHomegrownPlayers: number;         // Canteranos / Jugadores formados localmente (UEFA/Alemania/Inglaterra: 8)
  officialDorsalsFirstTeam: boolean;   // Dorsales 1 al 25 reservados a 1er equipo (porteros 1, 13, 25)
  allowYouthPlayersWithoutRegistration: boolean; // Juveniles o filial con dorsal 26+
  wageCapFinancialFairPlay: boolean;   // Control económico previo y límite salarial obligatorio
  nonEUWorkPermitPointsRequired?: number; // Sistema de puntos Governing Body Endorsement (GBE) de Inglaterra
}

export interface CompetitionRegulation {
  id: string;
  competitionId: string;
  name: string;
  countryId: string;
  tier: number;
  season: string;
  participantsCount: number;
  roundsCount: number;                 // 2 vueltas (ida y vuelta)
  pointsForWin: number;                // 3
  pointsForDraw: number;               // 1
  pointsForLoss: number;               // 0
  tiebreakerPrimary: TiebreakerCriterion;
  tiebreakerSecondary: TiebreakerCriterion;
  tiebreakerTertiary: TiebreakerCriterion;
  
  // Plazas de clasificación y movilidad deportiva
  directPromotions: number;
  playoffPromotionSlots: number;
  playoffTeamsCount: number;
  playoffFormat?: PlayoffFormat;
  directRelegations: number;
  relegationPlayoutSlots?: number;

  // Plazas continentales
  continentalSlots: {
    championsLeagueGroup: number;
    championsLeaguePlayoff: number;
    europaLeagueGroup: number;
    conferenceLeaguePlayoff: number;
    copaLibertadores?: number;
    copaSudamericana?: number;
  };

  // Restricciones de plantilla e inscripción
  squadRules: SquadRegistrationRules;

  // Calendario y mercado
  transferWindows: {
    summer: { start: string; end: string };
    winter: { start: string; end: string };
  };

  // Oficialidad y fuentes
  isOfficialVerified: boolean;
  officialSourceCitation: string;
  validSinceYear: number;
  notes?: string;
  hasVAR: boolean;
  category?: 'NACIONAL_LIGA' | 'NACIONAL_COPA' | 'CONTINENTAL_CLUBES' | 'INTERNACIONAL_CLUBES' | 'SELECCIONES';
  confederation?: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC' | 'FIFA';
  status?: 'OFICIAL_VERIFICADO' | 'PENDIENTE_VALIDACION';
}

// ============================================================================
// 3. NUEVO FORMATO DE COMPETICIONES EUROPEAS (UEFA 2024/25+)
// ============================================================================
export interface EuropeanLeagueTeamEntry {
  clubId: string;
  clubName: string;
  countryCode: string;
  pot: 1 | 2 | 3 | 4;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentForm: ('V' | 'E' | 'D')[];
}

export interface EuropeanLeaguePhaseState {
  competitionId: 'uefa_champions_league' | 'uefa_europa_league' | 'uefa_conference_league';
  name: string;
  season: string;
  teamsCount: 36;
  matchesPerTeam: number;              // 8 en Champions y Europa League, 6 en Conference
  currentMatchday: number;
  totalMatchdays: number;
  standings: EuropeanLeagueTeamEntry[];
  fixtures: {
    id: string;
    matchday: number;
    homeClubId: string;
    awayClubId: string;
    homeScore?: number;
    awayScore?: number;
    played: boolean;
    date: string;
  }[];
  // Zonas de corte
  directRoundOf16Slots: 8;             // Puestos 1 al 8
  knockoutPlayoffSlots: 16;            // Puestos 9 al 24
  eliminatedSlots: 12;                 // Puestos 25 al 36
}

// ============================================================================
// 4. PALMARÉS Y HISTORIAL COMPLETO DE TROFEOS
// ============================================================================
export type TrophyTier = 'MUNDIAL' | 'CONTINENTAL' | 'NACIONAL_PRIMERA' | 'NACIONAL_COPA' | 'SUPERCOPA' | 'CATEGORIA_INFERIOR';

export interface TrophyRecord {
  id: string;
  season: string;
  competitionId: string;
  competitionName: string;
  competitionType: 'LIGA' | 'COPA' | 'SUPERCOPA' | 'CHAMPIONS' | 'MUNDIAL_CLUBES' | 'SELECCIONES_MUNDIAL' | 'SELECCIONES_EUROPA';
  tier: TrophyTier;
  championId: string;
  championName: string;
  runnerUpId?: string;
  runnerUpName?: string;
  scoreOrSummary: string;              // Ej. "2 - 1 en Wembley", "92 pts (+4 sobre el 2º)"
  winningManagerName: string;
  topScorer?: {
    playerName: string;
    clubName: string;
    goals: number;
  };
  bestPlayer?: {
    playerName: string;
    clubName: string;
  };
  isPreGameHistory: boolean;           // true si es palmarés histórico real previo al juego
}

export interface ClubPalmaresSummary {
  clubId: string;
  clubName: string;
  trophies: {
    championsLeague: number;
    europaLeague: number;
    conferenceLeague: number;
    intercontinentalOrClubWorldCup: number;
    supercopaEuropea: number;
    nationalLeagueTitles: number;
    nationalCups: number;
    nationalSupercups: number;
    lowerDivisionTitles: number;
  };
  trophyHistory: TrophyRecord[];
}

export interface ManagerPalmaresRecord {
  managerName: string;
  totalTitles: number;
  titlesByClub: Record<string, number>;
  trophyList: { trophyName: string; season: string; clubName: string }[];
}

export interface PlayerPalmaresRecord {
  playerName: string;
  totalTitles: number;
  ballonDOrs: number;
  goldenBoots: number;
  trophyList: { trophyName: string; season: string; clubOrCountry: string }[];
}
