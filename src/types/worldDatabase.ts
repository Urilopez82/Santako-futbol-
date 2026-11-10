export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC' | 'CÓSMICA';

export interface CountryFederation {
  id: string;
  name: string;
  code: string;               // ISO 3 letras (ESP, ENG, ITA, etc.)
  flag: string;               // Emoji de bandera
  confederation: Confederation;
  fifaRanking: number;
  capital: string;
  federationName: string;     // Ej. "Real Federación Española de Fútbol (RFEF)"
  foundedYear: number;
  fifaAffiliationYear: number;
  officialCompetitionsCount: number;
}

export type CompetitionType = 'LIGA' | 'COPA' | 'SUPERCOPA' | 'CONTINENTAL';

export interface WorldCompetition {
  id: string;
  name: string;
  officialName: string;
  shortName: string;
  countryId?: string;         // Opcional si es continental
  confederation: Confederation;
  tier: number;               // 1 = Primera división, 2 = Segunda, 3 = Tercera/1ª Fed, etc.
  type: CompetitionType;
  participantsCount: number;
  promotionSlots?: number;
  playoffSlots?: number;
  relegationSlots?: number;
  relegationTargetTier?: number;
  formatDescription: string;
  source: string;
  lastUpdated: string;
  isOfficialVerified: boolean;
}

export interface DetailedStadium {
  id: string;
  name: string;
  city: string;
  countryId: string;
  capacity: number;
  seatedCapacity: number;
  buildYear: number;
  surfaceType: 'Césped Natural' | 'Césped Artificial' | 'Híbrido';
  pitchDimensions: string;    // Ej. "105 x 68 m"
  condition: number;          // 0-100%
  isExpandable: boolean;
  maxExpansionCapacity: number;
  lightingQuality: 'Estándar' | 'Profesional' | 'FIFA Élite';
  source: string;
}

export type KitPattern = 
  | 'LISO' 
  | 'RAYAS_VERTICALES' 
  | 'RAYAS_HORIZONTALES' 
  | 'FRANJA_DIAGONAL' 
  | 'ESCAPULARIO' 
  | 'MITAD_Y_MITAD';

export interface KitDesign {
  primaryColor: string;
  secondaryColor: string;
  pattern: KitPattern;
  shortsColor: string;
  socksColor: string;
  collarColor?: string;
}

export interface ClubKits {
  home: KitDesign;
  away: KitDesign;
  third?: KitDesign;
}

export interface ClubRivalry {
  rivalClubId: string;
  rivalClubName: string;
  derbyName: string;          // Ej. "Derbi Colomenc", "El Clásico", "Derbi del Pla"
  intensity: 'Media' | 'Alta' | 'Máxima';
}

export interface ClubHistoryMilestone {
  year: number;
  title: string;
  competition: string;
}

export interface WorldClub {
  id: string;
  name: string;
  officialName: string;
  shortName: string;
  code: string;
  countryId: string;
  city: string;
  foundedYear: number;
  divisionId: string;
  stadiumId: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  kits: ClubKits;
  finances: {
    budgetLevel: 'Modesto' | 'Medio' | 'Alto' | 'Élite' | 'Gigante';
    estimatedBudgetAnnual: number;
    transferBudget: number;
    weeklyWageBudget: number;
    debtAmount: number;
  };
  reputation: number;         // 1 - 100
  estimatedSupporters: number;// Masa social aproximada
  sportingValueRating: number;// Valor deportivo de plantilla
  rivalries: ClubRivalry[];
  facilities: {
    stadiumLevel: number;     // 1 a 5
    trainingGroundLevel: number;
    youthAcademyLevel: number;
    medicalCenterLevel: number;
  };
  palmares: ClubHistoryMilestone[];
  source: string;
  lastUpdated: string;
  isCompleteRoster: boolean;
  notes?: string;
}

export interface ComprehensiveAttributes {
  // Físicos (1-99)
  velocidad: number;
  aceleracion: number;
  resistencia: number;
  fuerza: number;
  salto: number;
  agilidad: number;

  // Técnicos (1-99)
  tecnica: number;
  controlBalon: number;
  paseCorto: number;
  paseLargo: number;
  centros: number;
  regate: number;
  remate: number;
  potenciaDisparo: number;
  juegoAereo: number;
  tiroFaltas: number;
  penaltis: number;

  // Mentales y Tácticos (1-99)
  vision: number;
  creatividad: number;
  decisiones: number;
  colocacion: number;
  marcaje: number;
  entradas: number;
  anticipacion: number;
  liderazgo: number;
  concentracion: number;
  trabajoEquipo: number;
  agresividad: number;
  compostura: number;

  // Específicos de Portero (1-99)
  porteroReflejos?: number;
  porteroBlocaje?: number;
  porteroEstirada?: number;
  porteroUnoContraUno?: number;
  porteroSalidas?: number;
  porteroJuegoAereo?: number;
  porteroJuegoPies?: number;
  porteroColocacion?: number;
}

export interface WorldPlayer {
  id: string;
  fullName: string;
  knownName?: string;
  birthDate: string;          // YYYY-MM-DD
  age: number;
  nationalityId: string;
  secondNationalityId?: string;
  heightCm: number;
  weightKg?: number;
  preferredFoot: 'Derecho' | 'Izquierdo' | 'Ambidiestro';
  primaryPosition: string;
  secondaryPositions: string[];
  currentClubId: string | null;
  squadNumber: number;
  currentAbility: number;     // CA: Habilidad actual (1-99)
  potentialAbility: number;   // PA: Potencial de desarrollo (1-99)
  contract: {
    wagePerWeek: number;
    contractEndYear: number;
    releaseClause: number;
    status: 'Titular Indiscutible' | 'Primer Equipo' | 'Rotación' | 'Suplente' | 'Canterano Promesa';
  };
  marketValue: number;
  fitness: number;            // 0-100%
  isInjured: boolean;
  injuryName?: string;
  internationalCaps: number;  // Internacionalidades absolutas
  internationalGoals: number;
  previousClubs: { clubName: string; years: string; appearances: number; goals: number }[];
  attributes: ComprehensiveAttributes;
  isOfficialSource: boolean;
  sourceName: string;
  isMotorEstimate: boolean;
  lastUpdated: string;
}

export type StaffRole = 
  | 'ENTRENADOR'
  | 'SEGUNDO_ENTRENADOR'
  | 'DIRECTOR_DEPORTIVO'
  | 'OJEADOR_JEFE'
  | 'PREPARADOR_FISICO'
  | 'ENTRENADOR_PORTEROS'
  | 'JEFE_MEDICO'
  | 'FISIOTERAPEUTA'
  | 'ANALISTA_TACTICO'
  | 'DIRECTOR_CANTERA';

export interface WorldStaff {
  id: string;
  name: string;
  role: StaffRole;
  clubId: string;
  nationalityId: string;
  age: number;
  reputation: number;         // 1-100
  tacticalPhilosophy?: string;
  preferredFormation?: string;
  experienceYears: number;
  coachingStyle: string;
  specialtyRating: number;    // 1-99 en su área de trabajo
  palmares: string[];
  source: string;
}

export interface DataSourceConnector {
  id: string;
  name: string;
  url: string;
  description: string;
  providedFields: string[];
  missingFields: string[];
  status: 'ACTIVO' | 'DOCUMENTADO' | 'SINCRONIZADO' | 'REQUIERE_CLAVE';
  lastChecked: string;
  licenseNotes: string;
}

// =========================================================================
// HIERARCHICAL FOOTBALL ARCHITECTURE (FEDERATIONS -> COUNTRIES -> LEAGUES -> CLUBS)
// =========================================================================

export interface DivisionRegulationRules {
  maxSquadSize: number;                   // e.g. 25 players
  maxNonEuPlayers?: number;               // e.g. 3 non-EU in Spain
  homegrownMinPlayers?: number;           // e.g. 4 trained at club
  salaryCapEur?: number;                  // Wage limit if applicable
  varImplemented: boolean;
  substitutionsAllowed: number;           // 5 subs in 3 windows
  summerWindow: { start: string; end: string }; // MM-DD
  winterWindow: { start: string; end: string }; // MM-DD
  pointsWin: number;                      // 3
  pointsDraw: number;                     // 1
  pointsLoss: number;                     // 0
  tiebreakerMethod: 'PARTICULAR' | 'GENERAL' | 'GOAL_DIFFERENCE';
}

export interface LeagueHierarchyPath {
  confederationId: Confederation;
  confederationName: string;
  countryId: string;
  countryName: string;
  countryFlag: string;
  competitionId: string;
  competitionName: string;
  competitionShortName: string;
  divisionTier: number;
  divisionFormat: string;
  relegationSlots?: number;
  promotionSlots?: number;
  playoffSlots?: number;
  rules: DivisionRegulationRules;
}

export interface GlobalDatabaseFilter {
  confederation?: Confederation | 'TODAS';
  countryId?: string;
  tier?: number;
  playableOnly?: boolean;
  searchQuery?: string;
}

export interface WorldHierarchyNode {
  confederation: Confederation;
  country: CountryFederation;
  competition: WorldCompetition;
  clubs: WorldClub[];
  rules: DivisionRegulationRules;
}
