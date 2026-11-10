export type VehicleCategory = 'UTILITARIO' | 'BERLINA_PREMIUM' | 'DEPORTIVO' | 'SUPERDEPORTIVO' | 'HIPERDEPORTIVO';

export interface VehicleItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  category: VehicleCategory;
  topSpeed: number; // km/h
  powerHP: number;  // CV
  imageBadge: string; // Emoji / Icon
  description: string;
  maintenanceAnnual: number;
}

export type RealEstateCategory = 'APARTAMENTO' | 'ATICO' | 'CHALET' | 'MANSION' | 'FINCA_LUJO';

export interface RealEstateItem {
  id: string;
  title: string;
  city: string;
  country: string;
  price: number;
  category: RealEstateCategory;
  squareMeters: number;
  bedrooms: number;
  bathrooms: number;
  hasPrivatePitch: boolean;
  hasPool: boolean;
  imageBadge: string;
  description: string;
  propertyTaxAnnual: number;
}

export interface PersonalTransaction {
  id: string;
  date: string;
  type: 
    | 'INGRESO_SALARIO' 
    | 'PRIMA_TITULO' 
    | 'PRIMA_OBJETIVO' 
    | 'DERECHOS_IMAGEN' 
    | 'COMPRA_VEHICULO' 
    | 'COMPRA_VIVIENDA' 
    | 'COMPRA_AERONAVE_PRIVADA' 
    | 'COMPRA_AERONAVE_CLUB' 
    | 'CURSO_PILOTO' 
    | 'OPERACION_CLANDESTINA' 
    | 'SOBORNO_ARBITRAL' 
    | 'FIANZA_JUDICIAL'
    | 'FUNDACION_CLUB' 
    | 'GASTO_MANTENIMIENTO';
  concept: string;
  amount: number;
  balanceAfter: number;
}

export type AircraftCategory = 'AVIONETA' | 'PRIVADO_LIGERO' | 'JET_EJECUTIVO' | 'TRANSPORTE_EQUIPO' | 'LUJO_VIP';

export interface AircraftItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: AircraftCategory;
  price: number;
  passengerCapacity: number;
  rangeKm: number;
  speedKmh: number;
  maintenanceAnnual: number;
  fuelBurnPerHour: number; // litros/hora
  mechanicalCondition: number; // 0 a 100%
  safetyRating: number; // 1 a 5 estrellas
  imageBadge: string;
  description: string;
  ownerType: 'MANAGER_PERSONAL' | 'CLUB_OFFICIAL';
}

export interface PilotLicense {
  hasLicense: boolean;
  licenseType: 'NINGUNA' | 'PILOTO_PRIVADO' | 'PILOTO_COMERCIAL_OFICIAL';
  examsPassed: number;
  totalFlightHours: number;
  isClubOfficialPilot: boolean;
  hasHiredProPilot: boolean;
  hiredPilotMonthlySalary: number;
}

export type CrimeType = 'HACKEO' | 'SICARIO' | 'SOBORNO_ARBITRO' | 'SABOTAJE_ESTADIO';

export interface CriminalRecordItem {
  id: string;
  date: string;
  crimeType: CrimeType;
  targetClubName: string;
  targetPersonName?: string;
  cost: number;
  starsGained: number;
  detected: boolean;
  outcomeDescription: string;
}

export interface CriminalWorldState {
  wantedStars: number; // 0 a 12 estrellas policiales
  isUnderInvestigation: boolean;
  totalCrimesCommitted: number;
  records: CriminalRecordItem[];
  inPrison: boolean;
  prisonSentenceYears: number;
  prisonReleaseSeason?: string;
  prisonReleaseNews?: string;
  activeRefereeBribe?: {
    matchId?: string;
    rivalClubId: string;
    bribedAmount: number;
    benefitedTeam: 'home' | 'away';
  } | null;
}

export interface ManagerPrivateLife {
  personalBankBalance: number;
  totalEarningsCareer: number;
  totalExpensesCareer: number;
  ownedVehicles: VehicleItem[];
  ownedProperties: RealEstateItem[];
  ownedAircraft: AircraftItem[];
  pilotLicense: PilotLicense;
  criminal: CriminalWorldState;
  transactionsHistory: PersonalTransaction[];
  hasFoundedClub: boolean;
  foundedClubId?: string;
}

export interface ClubFoundationData {
  clubName: string;
  shortName: string;
  city: string;
  countryId: string;
  stadiumName: string;
  stadiumCapacity: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  badgeSymbol: string;
  initialTransferBudget: number;
  costTotal: number;
}

