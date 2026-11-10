export type TransferOfferStatus = 
  | 'PENDIENTE' 
  | 'ACEPTADA_CLUB' 
  | 'RECHAZADA_CLUB' 
  | 'NEGOCIANDO_CONTRATO' 
  | 'COMPLETADA' 
  | 'CANCELADA';

export interface TransferOffer {
  id: string;
  playerId: string;
  buyingClubId: string;
  sellingClubId: string;
  transferFee: number;         // En euros (€)
  status: TransferOfferStatus;
  offeredDate: string;
  // Términos de contrato propuestos
  proposedWageWeekly: number;
  proposedContractYears: number;
  proposedSquadStatus: 'Indispensable' | 'Titular' | 'Rotación' | 'Suplente' | 'Juvenil';
  proposedReleaseClause: number;
}
