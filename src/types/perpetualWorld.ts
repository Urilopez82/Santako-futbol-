import { Position } from './player';

/**
 * Categorías y Niveles de Talento para Newgens (Regeneración)
 */
export type TalentTier = 
  | 'NORMAL'            // OVR 55-65, POT 65-74 (~70% de la cantera)
  | 'PROMETEDOR'        // OVR 64-70, POT 75-82 (~22%)
  | 'GRAN_TALENTO'      // OVR 68-74, POT 83-88 (~7%)
  | 'ESTRELLA_MUNDIAL'; // OVR 72-78, POT 89-94 (~1%, máximo 2-3 por temporada en el mundo)

export interface NewgenPlayer {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  nationality: string;
  birthDate: string;
  birthYear: number;
  age: number;
  position: Position;
  overallRating: number;
  potential: number;
  talentTier: TalentTier;
  clubId: string;
  clubName: string;
  seasonIntake: string;
  scoutingSummary: string;
}

export type RetirementReason = 
  | 'EDAD_AVANZADA'
  | 'LESIONES_RECURRENTES'
  | 'DECLIVE_FISICO'
  | 'FALTA_DE_MINUTOS_O_CLUB'
  | 'MOTIVACION_CUMPLIDA';

export interface RetiredLegendRecord {
  id: string;
  playerId: string;
  playerName: string;
  nationality: string;
  position: Position;
  retirementSeason: string;
  retirementAge: number;
  reason: RetirementReason;
  careerStats: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalCleanSheets?: number;
    clubsRepresented: string[];
    titlesWonCount: number;
    titlesList: string[];
  };
  isHallOfFame: boolean;
  legacyDescription: string;
}

export interface AnnualAwardWinners {
  season: string;
  ballonDOr: {
    playerId: string;
    playerName: string;
    clubName: string;
    nationality: string;
    position: Position;
    seasonGoals: number;
    seasonAssists: number;
    averageRating: number;
    trophiesCount: number;
  };
  theBestFIFA: {
    playerName: string;
    clubName: string;
  };
  yashinTrophy: {
    playerId: string;
    playerName: string;
    clubName: string;
    cleanSheets: number;
  };
  goldenBoy: {
    playerId: string;
    playerName: string;
    clubName: string;
    age: number;
    overall: number;
  };
  goldenBoot: {
    playerName: string;
    clubName: string;
    goals: number;
    leagueMultiplier: number;
    points: number;
  };
  managerOfYear: {
    managerName: string;
    clubName: string;
    achievement: string;
  };
}

export type ClubEraType = 
  | 'ERA_DORADA'
  | 'CRISIS_ECONOMICA'
  | 'CAMBIO_PROPIEDAD_MECENAS'
  | 'FONDO_INVERSION'
  | 'NUEVA_JUNTA_SOBRIA'
  | 'AMPLIACION_ESTADIO'
  | 'REESTRUCTURACION_CANTERA';

export interface ClubTimelineEvent {
  id: string;
  season: string;
  date: string;
  clubId: string;
  clubName: string;
  type: ClubEraType;
  headline: string;
  details: string;
  impactReputationDelta: number;
  impactBudgetDelta: number;
}

export interface DurabilityAssertionReport {
  timestamp: string;
  seasonsTestedCount: number;
  startSeason: string;
  endSeason: string;
  totalClubsTracked: number;
  clubsLostCount: number;
  totalActivePlayers: number;
  minPlayerAge: number;
  maxPlayerAge: number;
  impossibleAgesDetected: number;
  duplicateIdentitiesCount: number;
  brokenContractsCount: number;
  squadSizeAlertsCount: number;
  brokenLeagueStandingsCount: number;
  estimatedMemoryKb: number;
  isAllPassing: boolean;
  details: string[];
}
