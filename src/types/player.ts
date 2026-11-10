export type Position = 
  | 'POR'  // Portero
  | 'DFC'  // Defensa Central
  | 'LD'   // Lateral Derecho
  | 'LI'   // Lateral Izquierdo
  | 'MCD'  // Mediocentro Defensivo
  | 'MC'   // Mediocentro
  | 'MCO'  // Mediapunta
  | 'ED'   // Extremo Derecho
  | 'EI'   // Extremo Izquierdo
  | 'DC';  // Delantero Centro

export interface PlayerAttributes {
  // Atributos Técnicos
  disparo: number;      // 1-99
  pase: number;         // 1-99
  regate: number;       // 1-99
  defensa: number;      // 1-99
  // Atributos Físicos
  velocidad: number;    // 1-99
  resistencia: number;  // 1-99
  fuerza: number;       // 1-99
  // Atributos Mentales
  vision: number;       // 1-99
  liderazgo: number;    // 1-99
  // Portero (específico)
  reflejos?: number;    // 1-99
  paradas?: number;     // 1-99
}

export interface PlayerContract {
  wagePerWeek: number;       // Sueldo semanal en euros (€)
  contractEndYear: number;   // Año de fin de contrato
  releaseClause: number;     // Cláusula de rescisión en euros (€)
  squadStatus: 'Indispensable' | 'Titular' | 'Rotación' | 'Suplente' | 'Juvenil';
}

export interface PlayerSeasonStats {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  averageRating: number;     // Ej. 7.25
  cleanSheets?: number;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  nationality: string;
  birthDate: string;         // YYYY-MM-DD
  age: number;
  primaryPosition: Position;
  secondaryPosition?: Position;
  overallRating: number;     // Media calculada (40-99)
  potential: number;         // Potencial máximo (40-99)
  clubId: string | null;     // null si es agente libre
  isTransferListed: boolean;
  isLoanListed: boolean;
  marketValue: number;       // Valor estimado en euros (€)
  attributes: PlayerAttributes;
  contract: PlayerContract;
  fitness: number;           // 0-100% Condición física
  morale: number;            // 0-100% Moral
  matchReadiness: number;    // 0-100% Ritmo de partido
  isInjured: boolean;
  injuryWeeksLeft?: number;
  injuryName?: string;
  seasonStats: PlayerSeasonStats;
  // Fase 4: Dirección Deportiva
  squadCategory?: 'PRIMER_EQUIPO' | 'FILIAL_B' | 'JUVENIL_SUB19';
  squadNumber?: number;
  isLoanedOut?: boolean;
  loanedToClubId?: string;
  loanedToClubName?: string;
  isLoanedIn?: boolean;
  parentClubId?: string;
  isSuspended?: boolean;
  suspensionMatchesLeft?: number;
  yellowCardAccumulation?: number;
  isNonEU?: boolean;
  happiness?: {
    playingTime: number;      // 0-100%
    wageSatisfaction: number; // 0-100%
    overallHappiness: number; // 0-100%
    concerns?: string[];
  };
  agent?: {
    name: string;
    demandingness: 'Baja' | 'Media' | 'Alta';
    feePercentage: number;
  };
  isRetired?: boolean;
}
