import { Position } from './player';

export type InjurySeverity = 'LEVE' | 'MODERADA' | 'GRAVE' | 'CRÍTICA';

export type TreatmentType = 
  | 'CONSERVADOR'
  | 'FISIOTERAPIA_INTENSIVA'
  | 'INFILTRACION_PRP'
  | 'CIRUGIA_ARTROSCOPICA'
  | 'CAMARA_HIPERBARICA';

export interface DetailedInjury {
  id: string;
  playerId: string;
  playerName: string;
  position: Position;
  injuryName: string;
  severity: InjurySeverity;
  dateOccurred: string;
  estimatedReturnDate: string;
  initialWeeks: number;
  weeksRemaining: number;
  treatment: TreatmentType;
  treatmentName: string;
  responsibleDoctor: string;
  doctorLevel: number; // 1 to 5
  status: 'EN_TRATAMIENTO' | 'EN_READAPTACION' | 'ALTA_MEDICA';
  relapseRiskPercent: number; // 5% - 40%
  evolutionLog: string[];
}

export interface MedicalStaffReport {
  overallFitnessClubAverage: number;
  totalInjuredCount: number;
  chiefDoctorName: string;
  chiefDoctorLevel: number;
  facilitiesLevel: number;
  preventativeMeasures: string[];
}
