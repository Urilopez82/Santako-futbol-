export type MatchEventType = 
  | 'GOL' 
  | 'GOL_PENALTI'
  | 'PENALTI_FALLADO'
  | 'TARJETA_AMARILLA' 
  | 'TARJETA_ROJA' 
  | 'LESION' 
  | 'SUSTITUCION';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  teamId: string;
  playerId: string;
  assistPlayerId?: string;
  subOffPlayerId?: string;
  description: string;
}

export interface MatchStats {
  possessionHome: number;      // % (ej. 54)
  possessionAway: number;      // % (ej. 46)
  xgHome: number;              // Goles esperados (ej. 1.85)
  xgAway: number;              // Goles esperados (ej. 0.92)
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  bigChancesHome?: number;
  bigChancesAway?: number;
  passesHome?: number;
  passesAway?: number;
  passAccuracyHome?: number;   // % (ej. 85)
  passAccuracyAway?: number;   // % (ej. 78)
  foulsHome: number;
  foulsAway: number;
  cornersHome: number;
  cornersAway: number;
  offsidesHome?: number;
  offsidesAway?: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
}

export interface Match {
  id: string;
  competitionId: string;
  matchday: number;
  date: string;               // YYYY-MM-DD
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  attendance?: number;
  ticketRevenue?: number;
  weather?: 'Despejado' | 'Lluvioso' | 'Tormenta' | 'Calor Sofocante' | 'Frío Gélido';
  temperature?: number;       // Grados Celsius (°C)
  events?: MatchEvent[];
  stats?: MatchStats;
  homePenalties?: number;
  awayPenalties?: number;
}

export interface StandingsRow {
  teamId: string;
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

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  season: string;              // ej. "2026/27"
  tier: number;                // 1 = Primera División, 2 = Segunda División, 3 = Primera Federación
  clubIds: string[];
  totalMatchdays: number;
  currentMatchday: number;
  matches: Match[];
  standings: StandingsRow[];
  promotionSlots: number;      // Ascenso directo
  playoffSlots: number;        // Puestos de playoff
  relegationSlots: number;     // Descenso
}
