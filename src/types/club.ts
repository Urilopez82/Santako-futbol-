export interface Stadium {
  name: string;
  city: string;
  capacity: number;
  condition: number;       // 0-100%
  ticketPrice: number;     // Precio medio de la entrada en € (10€ - 80€)
  seasonTicketHolders: number; // Número de abonados
  seasonTicketPrice: number;   // Precio del abono anual en €
  historicName?: string;       // Nombre histórico original para cuando expire el naming rights
  commercialName?: string;     // Nombre comercial activo (ej: Spotify Camp Nou, Emirates Stadium)
  namingRightsSponsor?: {
    sponsorName: string;
    annualFee: number;
    endSeason: string;
    yearsDuration: number;
    signedSeason: string;
  };
}

export interface Facilities {
  trainingGroundLevel: number; // Nivel 1 a 5 (mejora la progresión en entrenamientos)
  youthAcademyLevel: number;   // Nivel 1 a 5 (calidad de los juveniles generados)
  medicalCenterLevel: number;  // Nivel 1 a 5 (reduce duración de lesiones)
  stadiumLevel: number;        // Nivel 1 a 5 (comodidad e ingresos)
}

export interface FinancialLedgerEntry {
  id: string;
  date: string;
  category: 'taquilla' | 'abonos' | 'patrocinio' | 'traspaso_venta' | 'traspaso_compra' | 'salarios' | 'mantenimiento' | 'instalaciones' | 'premios';
  description: string;
  amount: number; // Positivo si es ingreso, negativo si es gasto
}

export interface ClubFinances {
  balance: number;             // Tesorería actual en euros (€)
  transferBudget: number;      // Presupuesto para fichajes en €
  weeklyWageBudget: number;    // Límite salarial semanal en €
  sponsorName: string;
  sponsorAnnualRevenue: number;
  tvRightsRevenue?: number;    // Ingresos anuales por retransmisión televisiva en €
  seasonTicketRevenue: number;
  recentLedger: FinancialLedgerEntry[];
}

export type BoardObjective = 
  | 'Campeón de Liga'
  | 'Luchar por el Título'
  | 'Puestos de Champions'
  | 'Puestos Europeos'
  | 'Puestos de Copa Libertadores'
  | 'Puestos de Copa Sudamericana'
  | 'Puestos de AFC Champions League'
  | 'Puestos de CAF Champions League'
  | 'Puestos de Ascenso Directo'
  | 'Ascenso a Primera'
  | 'Clasificación a Playoff'
  | 'Puestos de Play-off'
  | 'Puestos de Play-off de Ascenso'
  | 'Playoff de Ascenso'
  | 'Liguilla Final'
  | 'Cuadrangulares Semifinales'
  | 'Mitad Superior de la Tabla'
  | 'Zona Cómoda / Mitad de Tabla'
  | 'Permanencia Cómoda'
  | 'Evitar el Descenso';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  code: string;                // 3 letras (ej. GRA, AND, RMA, FCB)
  city: string;
  countryId?: string;
  foundedYear: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  divisionId: string;
  coachName?: string;
  reputation: number;          // 1 - 100
  stadium: Stadium;
  facilities: Facilities;
  finances: ClubFinances;
  boardObjective: BoardObjective;
  boardConfidence: number;     // 0 - 100
  playerIds: string[];         // IDs de los jugadores del club
  startingElevenIds: string[]; // 11 titulares
  benchPlayerIds: string[];    // Suplentes convocados
  tacticFormation: string;     // '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2'
  tacticMentality: 'Muy Defensiva' | 'Defensiva' | 'Equilibrada' | 'Ofensiva' | 'Al Ataque';
  tacticTempo: 'Lento' | 'Normal' | 'Rápido';
  tacticPassing: 'Corto' | 'Mixto' | 'Directo';
  tacticPressing: 'Baja' | 'Media' | 'Intensa';
  historyTitles: { title: string; season: string }[];
  loans?: import('./clubManagement').ClubLoan[];
  sponsors?: import('./clubManagement').SponsorContract[];
  kits?: import('./clubManagement').ClubKits;
  zonePricing?: import('./clubManagement').StadiumZonePricing;
  activeStadiumProjects?: import('./clubManagement').ActiveConstructionProject[];
  cateringConfig?: import('./clubManagement').StadiumCateringConfig;
  merchandisingStore?: import('./clubManagement').MerchandisingStore;
  boardGovernance?: import('./clubManagement').ClubBoardGovernance;
  scouts?: import('./sportingDirector').Scout[];
  staffMembers?: import('./sportingDirector').StaffMember[];
  youthCandidates?: import('./sportingDirector').YouthAcademyCandidate[];
  fullTransferOffers?: import('./sportingDirector').FullTransferOffer[];
  filialClubId?: string;
  // Fase 5: Dirección Deportiva y Táctica
  customFormationSlots?: import('./tactics').FormationSlot[];
  teamInstructions?: import('./tactics').TeamTacticalInstructions;
  playerInstructions?: Record<string, import('./tactics').PlayerTacticalRole>;
  setPieceTakers?: import('./tactics').SetPieceTakers;
  plannedSubs?: import('./tactics').PlannedSubstitution[];
  weeklyTraining?: import('./tactics').WeeklyTrainingPlan;
  lockerRoomDynamics?: Record<string, import('./tactics').PlayerLockerRoomProfile>;
  latestScoutingReport?: import('./tactics').OpponentScoutingReport;
  activePressConference?: import('./tactics').PressConference;
  officialAircraft?: import('./privateLife').AircraftItem;
  stadiumDamagedMatches?: number;
  isDefunctBankrupt?: boolean;
}

