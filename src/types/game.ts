import { Club } from './club';
import { Competition } from './competition';
import { Player } from './player';
import { TransferOffer } from './transfer';

export type ManagerLicense = 
  | 'Licencia Nacional C'
  | 'Licencia UEFA B'
  | 'Licencia UEFA A'
  | 'Licencia UEFA Pro';

export interface ManagerContract {
  clubId: string;
  clubName: string;
  startDate: string;
  endSeason: string;
  durationYears: number;
  wageWeekly: number;
  wageAnnual: number;
  sportingObjective: string;
  economicObjective: string;
  releaseClause: number;        // Cláusula de rescisión que debe pagar otro club
  severancePay: number;         // Indemnización por despido anticipado
  promotionBonus: number;       // Prima económica por ascenso
  survivalBonus: number;        // Prima por asegurar la permanencia
  renewalCondition: string;     // Condición de renovación automática
}

export interface JobOffer {
  id: string;
  clubId?: string;
  clubName: string;
  clubCode?: string;
  divisionName: string;
  countryId: string;
  wageWeekly: number;
  durationYears: number;
  sportingObjective: string;
  transferBudget: number;
  isNationalTeam: boolean;
  nationalTeamType?: 'ABSOLUTA' | 'SUB21' | 'SUB20';
  offeredDate: string;
  reputationRequired: number;
  status: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
}

export interface NationalTeamRole {
  countryId: string;
  countryName: string;
  flag: string;
  teamType: 'ABSOLUTA' | 'SUB21' | 'SUB20';
  squadPlayerIds: string[];
  reputation: number;
}

export interface ManagerMarketEvent {
  id: string;
  date: string;
  type: 'DESTITUCION' | 'CONTRATACION' | 'RENOVACION' | 'DIMISION';
  clubName: string;
  managerName: string;
  headline: string;
  details: string;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthCity: string;
  nationality: string;
  secondNationality?: string;
  avatarId: string;
  languages: string[];
  footballEducation: string;
  license: ManagerLicense;
  experienceLevel: string;
  tacticalPhilosophy: string;
  preferredFormation: string;
  specialties: string[];
  personality: string;
  reputation: number;         // 1 - 100
  biography: string;
  contract: ManagerContract;
  nationalTeamRole: NationalTeamRole | null;
  careerStats: {
    matchesManaged: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    titlesWon: number;
    promotions: number;
    relegations?: number;
    sacksCount: number;
    resignationsCount: number;
  };
  historyTitles?: Array<{ title: string; season: string; clubName?: string }>;
  careerLog?: Array<{
    season: string;
    clubOrNationName: string;
    competitionName?: string;
    achieved: string;
    date?: string;
    isPromotion?: boolean;
    isRelegation?: boolean;
    isTitle?: boolean;
    matches?: number;
    won?: number;
    drawn?: number;
    lost?: number;
  }>;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'PARTIDO' | 'FICHAJE' | 'DIRECTIVA' | 'ECONOMIA' | 'LESIÓN' | 'INSTALACIONES' | 'ENTRENADOR';
  read: boolean;
}

export interface SeasonHistory {
  season: string;
  clubId: string;
  clubName: string;
  divisionId: string;
  finalPosition: number;
  promoted?: boolean;
  relegated?: boolean;
  trophies: string[];
  matchesCount: number;
  wonCount: number;
  drawnCount: number;
  lostCount: number;
}

export interface SaveMetadata {
  id: string;
  saveName: string;
  createdAt: string;
  updatedAt: string;
  currentDate: string;
  currentSeason: string;
  managerName: string;
  clubId: string;
  clubName: string;
  clubCode: string;
  divisionName: string;
}

import { CompetitionSeasonArchive, GlobalHistoricalRecord } from './history';

export interface GameSave {
  version: number;
  metadata: SaveMetadata;
  manager: Manager;
  userClubId: string;
  currentDate: string;
  currentSeason: string;
  isTransferWindowOpen: boolean;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  competitions: Record<string, Competition>;
  transferOffers: TransferOffer[];
  jobOffers: JobOffer[];
  marketEvents: ManagerMarketEvent[];
  news: NewsItem[];
  history: SeasonHistory[];
  historicalArchives?: CompetitionSeasonArchive[];
  worldRecords?: GlobalHistoricalRecord[];
  gameMode?: 'CARRERA' | 'ARCADE';
  scoutReports?: import('./sportingDirector').ScoutReport[];
  currentTransferWindow?: 'VERANO' | 'INVIERNO' | 'CERRADO';
  trophyArchive?: import('./regulations').TrophyRecord[];
  annualAwardsHistory?: import('./perpetualWorld').AnnualAwardWinners[];
  retiredLegends?: import('./perpetualWorld').RetiredLegendRecord[];
  clubTimelineEvents?: import('./perpetualWorld').ClubTimelineEvent[];
  durabilityReports?: import('./perpetualWorld').DurabilityAssertionReport[];
  newgenRegistry?: import('./perpetualWorld').NewgenPlayer[];
  difficultyLevel?: 'FACIL' | 'NORMAL' | 'DIFICIL' | 'LEYENDA';
  cupTournaments?: Record<string, import('../engine/internationalCompetitionsEngine').KnockoutTournamentState>;
  worldCupTournament?: import('../engine/worldCupTournamentEngine').WorldCupTournamentState | null;
  privateLife?: import('./privateLife').ManagerPrivateLife;
  infirmaryInjuries?: Record<string, import('./infirmary').DetailedInjury>;
}


