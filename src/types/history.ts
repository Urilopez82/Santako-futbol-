export interface HistoricalTopScorer {
  playerName: string;
  clubName: string;
  goals: number;
  matchesPlayed: number;
}

export interface HistoricalTopAssister {
  playerName: string;
  clubName: string;
  assists: number;
}

export interface HistoricalZamora {
  goalkeeperName: string;
  clubName: string;
  goalsConceded: number;
  matchesPlayed: number;
  coefficient: number;
}

export interface HistoricalTeamStanding {
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface HistoricTransferRecord {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: number;
  season: string;
  isRealHistorical: boolean;
}

export interface HistoricClubFate {
  id: string;
  clubName: string;
  city: string;
  foundedYear: number;
  status: 'DESAPARECIDO' | 'REFUNDADO' | 'DECLIVE_HISTORICO' | 'ASCENSO_METEORICO';
  fateSeasonOrYear: string;
  peakAchievement: string;
  historySummary: string;
  successorClub?: string;
}

export interface ManagerLegendProfile {
  id: string;
  name: string;
  nationality: string;
  activeYears: string;
  trophiesCount: number;
  trophiesBreakdown: { title: string; count: number }[];
  clubsManaged: string[];
  tacticalStyle: string;
  careerMilestones: string[];
  isRealLegend: boolean;
}

export interface CompetitionSeasonArchive {
  seasonId: string; // e.g. "2024/25", "2011/12", "1994/95"
  competitionId: string; // "esp_tier1", "esp_tier2", "eng_tier1", "ucl", "copa_del_rey", etc.
  competitionName: string;
  countryId?: string;
  isRealPreGameHistory: boolean; // true si es historia oficial previa; false si es simulada por la partida
  championTeam: string;
  runnerUpTeam: string;
  thirdTeam?: string;
  relegatedTeams?: string[];
  promotedTeams?: string[];
  playoffTeams?: string[];
  topScorer: HistoricalTopScorer;
  topAssister?: HistoricalTopAssister;
  bestGoalkeeper?: HistoricalZamora;
  championManager: string;
  standingsTable?: HistoricalTeamStanding[];
  revelationClub?: { clubName: string; reason: string };
  disappointmentClub?: { clubName: string; reason: string };
  historicTransfers?: HistoricTransferRecord[];
  legendRetirements?: { playerName: string; clubName: string; age: number; summary: string }[];
  notableEvent?: string;
}

export interface GlobalHistoricalRecord {
  id: string;
  title: string;
  category: 'GOLES' | 'PUNTOS' | 'RACHA' | 'TRASPASO' | 'ASISTENCIA' | 'IMBATIBILIDAD' | 'TITULOS';
  holder: string;
  details: string;
  seasonOrDate: string;
  isRealHistorical: boolean;
  valueNumeric: number;
  unitLabel?: string;
}

export interface LegendProfile {
  id: string;
  name: string;
  role: 'JUGADOR' | 'ENTRENADOR';
  clubsPlayedOrManaged: string[];
  trophiesCount: number;
  era: string;
  summary: string;
}

