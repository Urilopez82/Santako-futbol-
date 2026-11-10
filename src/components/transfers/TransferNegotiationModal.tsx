import React, { useState } from 'react';
import { evaluateFullTransferOffer, isDateInTransferWindow } from '../../engine/sportingDirectorEngine';
import { Club } from '../../types/club';
import { GameSave } from '../../types/game';
import { Player } from '../../types/player';
import { FullTransferOffer, TransferDealType } from '../../types/sportingDirector';
import { playClickSound } from '../../utils/audio';
import { 
  AlertCircle, 
  ArrowRightLeft, 
  Briefcase, 
  CheckCircle, 
  Coins, 
  DollarSign, 
  FileCheck, 
  Percent, 
  Shield, 
  User, 
  UserCheck, 
  Users, 
  X,
  AlertTriangle
} from 'lucide-react';

interface TransferNegotiationModalProps {
  isOpen: boolean;
  player: Player;
  buyerClub: Club;
  sellerClub: Club | null;
  gameSave: GameSave;
  onClose: () => void;
  onFinalizeTransfer: (offer: FullTransferOffer, player: Player) => void;
}

export const TransferNegotiationModal: React.FC<TransferNegotiationModalProps> = ({
  isOpen,
  player,
  buyerClub,
  sellerClub,
  gameSave,
  onClose,
  onFinalizeTransfer,
}) => {
  const windowStatus = isDateInTransferWindow(gameSave.currentDate);
  const isFreeAgent = !player.clubId || !sellerClub;

  const [dealType, setDealType] = useState<TransferDealType>(isFreeAgent ? 'AGENTE_LIBRE' : 'COMPRA_DEFINITIVA');
  const [transferFee, setTransferFee] = useState<number>(isFreeAgent ? 0 : Math.round(player.marketValue * 1.05));
  const [sellOnPct, setSellOnPct] = useState<number>(10);
  const [wageWeekly, setWageWeekly] = useState<number>(Math.round((player.contract?.wagePerWeek || 600) * 1.25));
  const [contractYears, setContractYears] = useState<number>(3);
  const [squadRole, setSquadRole] = useState<'Indispensable' | 'Titular' | 'Rotación' | 'Suplente' | 'Juvenil'>('Titular');
  const [releaseClause, setReleaseClause] = useState<number>(Math.max(250000, Math.round(player.marketValue * 3)));
  const [signOnBonus, setSignOnBonus] = useState<number>(isFreeAgent ? 5000 : 2500);
  const [agentFee, setAgentFee] = useState<number>(Math.max(1500, Math.round(player.marketValue * 0.06)));
  const [swapPlayerId, setSwapPlayerId] = useState<string>('');

  const [evaluatedOffer, setEvaluatedOffer] = useState<FullTransferOffer | null>(null);

  if (!isOpen) return null;

  // Check if ordinary transfers allowed outside transfer window
  const isOrdinaryTransferBlocked = !windowStatus.isOpen && !isFreeAgent;

  const handleEvaluate = () => {
    playClickSound();
    const rawOffer: FullTransferOffer = {
      id: `trf_offer_${Date.now()}`,
      dealType,
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      buyerClubId: buyerClub.id,
      buyerClubName: buyerClub.name,
      sellerClubId: sellerClub?.id || '',
      sellerClubName: sellerClub?.name || 'Agente Libre',
      offeredTransferFee: isFreeAgent ? 0 : transferFee,
      sellOnPercentage: isFreeAgent ? 0 : sellOnPct,
      swapPlayerId: swapPlayerId || undefined,
      proposedWageWeekly: wageWeekly,
      proposedContractYears: contractYears,
      proposedSquadRole: squadRole,
      proposedReleaseClause: releaseClause,
      signOnBonus,
      agentCommissionFee: agentFee,
      sellerClubStatus: 'PENDIENTE',
      playerStatus: 'PENDIENTE',
      agentStatus: 'PENDIENTE',
      offeredDate: gameSave.currentDate,
    };

    const result = evaluateFullTransferOffer(buyerClub, sellerClub, player, rawOffer);
    setEvaluatedOffer(result);
  };

  const isAllPartiesAgreed = 
    evaluatedOffer &&
    evaluatedOffer.sellerClubStatus === 'ACEPTADA' &&
    evaluatedOffer.playerStatus === 'ACEPTADA' &&
    evaluatedOffer.agentStatus === 'ACEPTADA';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 font-condensed uppercase tracking-wider">
                  Mesa de Negociación Trilateral
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono-num ${
                  windowStatus.isOpen ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                }`}>
                  MERCADO {windowStatus.windowName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Negociación entre {buyerClub.name}, {sellerClub?.name || 'Agente Libre'} y la representación de {player.firstName} {player.lastName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Snapshot Hero */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono-num">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-xl font-bold text-white font-condensed">
              {player.primaryPosition}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xl font-bold text-white font-condensed uppercase">
                  {player.firstName} {player.lastName}
                </h3>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-bold">
                  {player.overallRating} OVR
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {player.age} años · {player.nationality} · {sellerClub?.name || 'Agente Libre'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Valor de Mercado</span>
              <span className="font-bold text-emerald-400 text-sm">{player.marketValue.toLocaleString()} €</span>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Sueldo Actual</span>
              <span className="font-bold text-slate-200 text-sm">{(player.contract?.wagePerWeek || 500).toLocaleString()} € / sem</span>
            </div>
          </div>
        </div>

        {/* Warning if market is closed for club-to-club transfers */}
        {isOrdinaryTransferBlocked && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              La ventana de transferencias está actualmente CERRADA. Solo se permite inscribir futbolistas que sean agentes libres sin contrato.
            </span>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs font-sans">
          
          {/* Section 1: Acuerdos con el Club Vendedor (si no es libre) */}
          {!isFreeAgent && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                1. Términos Económicos con el Club Vendedor ({sellerClub?.name})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-num">
                <div>
                  <label className="text-slate-400 block mb-1 font-sans">Precio de Traspaso (€):</label>
                  <input
                    type="number"
                    step="5000"
                    value={transferFee}
                    onChange={(e) => setTransferFee(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                    Valor tasado: {player.marketValue.toLocaleString()} €
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-sans">% de Futura Venta (Plusvalía):</label>
                  <select
                    value={sellOnPct}
                    onChange={(e) => setSellOnPct(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={0}>0% (Sin porcentaje)</option>
                    <option value={10}>10% de futura venta</option>
                    <option value={15}>15% de futura venta</option>
                    <option value={20}>20% de futura venta</option>
                    <option value={25}>25% de futura venta</option>
                  </select>
                  <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                    Abarata el traspaso inicial
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-sans">Modalidad de Operación:</label>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="COMPRA_DEFINITIVA">Traspaso Definitivo</option>
                    <option value="CESION_CON_OPCION">Cesión por 1 Temporada</option>
                    <option value="TRUEQUE_INTERCAMBIO">Trueque + Dinero</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Contrato y Condiciones del Futbolista */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              2. Propuesta Contractual para {player.firstName} {player.lastName}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono-num">
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Sueldo Semanal (€):</label>
                <input
                  type="number"
                  step="50"
                  value={wageWeekly}
                  onChange={(e) => setWageWeekly(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                  {(wageWeekly * 52).toLocaleString()} € / año
                </span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Duración (Temporadas):</label>
                <select
                  value={contractYears}
                  onChange={(e) => setContractYears(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 Temporada</option>
                  <option value={2}>2 Temporadas</option>
                  <option value={3}>3 Temporadas</option>
                  <option value={4}>4 Temporadas</option>
                  <option value={5}>5 Temporadas</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Rol en Plantilla:</label>
                <select
                  value={squadRole}
                  onChange={(e) => setSquadRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Indispensable">Jugador Indispensable</option>
                  <option value="Titular">Titular Habitual</option>
                  <option value="Rotación">Jugador de Rotación</option>
                  <option value="Suplente">Suplente de Apoyo</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Cláusula de Rescisión (€):</label>
                <input
                  type="number"
                  step="25000"
                  value={releaseClause}
                  onChange={(e) => setReleaseClause(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Comisiones de Representación y Primas */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              3. Primas y Honorarios del Representante / Agente
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono-num">
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Prima de Fichaje para el Jugador (€):</label>
                <input
                  type="number"
                  step="500"
                  value={signOnBonus}
                  onChange={(e) => setSignOnBonus(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Comisión de Intermediación del Agente (€):</label>
                <input
                  type="number"
                  step="500"
                  value={agentFee}
                  onChange={(e) => setAgentFee(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Evaluation Panel */}
          {evaluatedOffer && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Dictamen de la Negociación
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Seller club dictamen */}
                {!isFreeAgent && (
                  <div className={`p-3 rounded-lg border text-xs ${
                    evaluatedOffer.sellerClubStatus === 'ACEPTADA'
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                      : evaluatedOffer.sellerClubStatus === 'CONTRAPROPUESTA'
                      ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                  }`}>
                    <span className="font-bold block mb-1">Club Vendedor: {evaluatedOffer.sellerClubStatus}</span>
                    {evaluatedOffer.sellerClubStatus === 'CONTRAPROPUESTA' && evaluatedOffer.sellerCounterOfferFee && (
                      <button
                        onClick={() => setTransferFee(evaluatedOffer.sellerCounterOfferFee!)}
                        className="mt-1 px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[11px]"
                      >
                        Igualar Contraoferta ({evaluatedOffer.sellerCounterOfferFee.toLocaleString()} €)
                      </button>
                    )}
                  </div>
                )}

                {/* Player dictamen */}
                <div className={`p-3 rounded-lg border text-xs ${
                  evaluatedOffer.playerStatus === 'ACEPTADA'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}>
                  <span className="font-bold block mb-1">Futbolista: {evaluatedOffer.playerStatus}</span>
                  <span className="text-[11px] block">{evaluatedOffer.playerStatus === 'ACEPTADA' ? 'Acepta rol y sueldo' : 'Rechaza la propuesta'}</span>
                </div>

                {/* Agent dictamen */}
                <div className={`p-3 rounded-lg border text-xs ${
                  evaluatedOffer.agentStatus === 'ACEPTADA'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}>
                  <span className="font-bold block mb-1">Representante: {evaluatedOffer.agentStatus}</span>
                  <span className="text-[11px] block">{evaluatedOffer.agentStatus === 'ACEPTADA' ? 'Comisión aprobada' : 'Comisión insuficiente'}</span>
                </div>
              </div>

              {evaluatedOffer.rejectionReason && (
                <p className="text-xs text-rose-400 mt-1">
                  {evaluatedOffer.rejectionReason}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors font-medium"
          >
            Cancelar Negociación
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleEvaluate}
              disabled={isOrdinaryTransferBlocked}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Consultar Disposición y Enviar Oferta
            </button>

            {isAllPartiesAgreed && (
              <button
                onClick={() => {
                  playClickSound();
                  onFinalizeTransfer(evaluatedOffer, player);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all animate-pulse flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4 fill-current" />
                <span>Firmar Traspaso Oficial RFEF</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
