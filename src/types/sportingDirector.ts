import { Position } from './player';

export type SquadCategory = 'PRIMER_EQUIPO' | 'FILIAL_B' | 'JUVENIL_SUB19';

export interface Scout {
  id: string;
  name: string;
  nationality: string;
  salaryWeekly: number;
  marketKnowledge: number;    // 1 - 20 (escala Football Manager / PC Fútbol)
  judgingAbility: number;     // 1 - 20
  judgingPotential: number;   // 1 - 20
  assignedRegion?: string;    // e.g. "España / Cataluña", "Portugal", "Sudamérica"
  assignedPosition?: Position | 'TODAS';
  assignedAgeRange?: 'SUB20' | '21_26' | 'VETERANOS' | 'TODAS';
  activeMissionDaysLeft: number;
}

export interface ScoutReport {
  id: string;
  scoutId: string;
  scoutName: string;
  playerId: string;
  playerName: string;
  age: number;
  position: Position;
  currentClubName: string;
  overallRatingEst: number;
  potentialRatingEst: number;
  accuracyPct: number;        // 50% - 100% según calidad del ojeador
  estimatedCostMin: number;
  estimatedCostMax: number;
  estimatedWageWeekly: number;
  pros: string[];
  cons: string[];
  recommendation: 'FICHAJE_PRIORITARIO' | 'SEGUIR_DE_CERCA' | 'DESCARTAR' | 'PROMESA_FUTURA';
  generatedDate: string;
}

export interface YouthAcademyCandidate {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  birthDate: string;
  nationality: string;
  primaryPosition: Position;
  overallRating: number;
  potentialMin: number;
  potentialMax: number;
  personality: 'Resuelto' | 'Ambicioso' | 'Profesional' | 'Despreocupado' | 'Líder Nato';
  trainingFocus: 'Técnica' | 'Físico' | 'Táctica' | 'Equilibrado';
  intakeSeason: string;
  contractSigned: boolean;
}

export type TransferDealType = 
  | 'COMPRA_DEFINITIVA' 
  | 'VENTA_DEFINITIVA' 
  | 'CESION_CON_OPCION' 
  | 'AGENTE_LIBRE' 
  | 'TRUEQUE_INTERCAMBIO';

export interface FullTransferOffer {
  id: string;
  dealType: TransferDealType;
  playerId: string;
  playerName: string;
  buyerClubId: string;
  buyerClubName: string;
  sellerClubId: string;
  sellerClubName: string;
  offeredTransferFee: number;
  sellOnPercentage: number;     // 0% a 30% de futura venta
  swapPlayerId?: string;        // Jugador incluido en trueque
  swapPlayerName?: string;
  // Términos para el jugador y representante
  proposedWageWeekly: number;
  proposedContractYears: number;
  proposedSquadRole: 'Indispensable' | 'Titular' | 'Rotación' | 'Suplente' | 'Juvenil';
  proposedReleaseClause: number;
  signOnBonus: number;          // Prima de fichaje para el futbolista
  agentCommissionFee: number;   // Comisión para el representante
  // Estados de negociación
  sellerClubStatus: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CONTRAPROPUESTA';
  playerStatus: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  agentStatus: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  sellerCounterOfferFee?: number;
  rejectionReason?: string;
  offeredDate: string;
}

export type StaffRole = 
  | '2º Entrenador'
  | 'Preparador Físico'
  | 'Fisioterapeuta Jefe'
  | 'Médico Jefe'
  | 'Ojeador Jefe'
  | 'Analista Táctico';

export interface StaffRequest {
  id: string;
  type: 'AUMENTO_SALARIAL' | 'MEJORA_INSTALACIONES' | 'CONTRATAR_AYUDANTE' | 'EQUIPAMIENTO_MEDICO';
  title: string;
  description: string;
  cost: number;
  salaryIncreaseWeekly?: number;
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  consequenceText: string;
}

export interface StaffMember {
  id: string;
  role: StaffRole;
  name: string;
  age: number;
  nationality: string;
  salaryWeekly: number;
  morale: number; // 0 - 100
  ability: number; // 1 - 20
  specialty: string;
  activeRequest?: StaffRequest;
}
