import React, { useState, useMemo, useEffect } from 'react';
import { evaluateCpuTransferResponse, executeTransfer, isTransferWindowActive } from '../../engine/transferEngine';
import { calculateRealisticPlayerMarketValue } from '../../engine/transferPricingEngine';
import { Club } from '../../types/club';
import { GameSave, NewsItem } from '../../types/game';
import { Player, Position } from '../../types/player';
import { TransferOffer } from '../../types/transfer';
import { playClickSound, playGoalSound } from '../../utils/audio';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Coins, 
  UserCheck, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Award,
  ArrowRight,
  Handshake,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

interface TransfersViewProps {
  gameSave: GameSave;
  onExecuteDeal: (
    updatedBuyer: Club,
    updatedSeller: Club | null,
    updatedPlayer: Player,
    newsItem: NewsItem
  ) => void;
  onAcceptCpuOffer?: (offer: TransferOffer) => void;
  onRejectCpuOffer?: (offerId: string) => void;
  onNegotiateCpuOffer?: (offerId: string, counterFee: number) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  gameSave,
  onExecuteDeal,
  onAcceptCpuOffer,
  onRejectCpuOffer,
  onNegotiateCpuOffer,
}) => {
  const userClub = (gameSave.clubs && gameSave.clubs[gameSave.userClubId]) || (gameSave.clubs && Object.values(gameSave.clubs)[0]);

  // Core Search Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('TODOS');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('TODOS');
  const [onlyFreeAgents, setOnlyFreeAgents] = useState(false);
  const [onlyTransferListed, setOnlyTransferListed] = useState(false);
  const [nationalityFilter, setNationalityFilter] = useState<string>('TODAS');
  const [minAge, setMinAge] = useState<number>(15);
  const [maxAge, setMaxAge] = useState<number>(43);
  
  // Dedicated Price and Level Search
  const [minOvr, setMinOvr] = useState<number>(40);
  const [maxOvr, setMaxOvr] = useState<number>(99);
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = sin límite
  const [onlyWithinBudget, setOnlyWithinBudget] = useState<boolean>(false);
  const [onlyYoungPromises, setOnlyYoungPromises] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'ovr' | 'value' | 'age' | 'name'>('ovr');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Pagination State for Lightning-Fast Performance
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 30;

  // Negotiation Modal State
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [offeredFee, setOfferedFee] = useState<number>(0);
  const [offeredWage, setOfferedWage] = useState<number>(0);
  const [contractYears, setContractYears] = useState<number>(2);
  const [negotiationResult, setNegotiationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'mercado' | 'ofertas_recibidas'>('mercado');
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterOfferFee, setCounterOfferFee] = useState<number>(0);

  const pendingReceivedOffers = useMemo(() => {
    return (gameSave.transferOffers || []).filter(
      (o) => o.sellingClubId === userClub.id && o.status === 'PENDIENTE'
    );
  }, [gameSave.transferOffers, userClub.id]);

  const isWindowOpen = isTransferWindowActive(gameSave.currentDate);

  const maxTransferCapacity = useMemo(() => {
    if (!userClub?.finances) return 0;
    return Math.max(
      userClub.finances.transferBudget || 0,
      Math.floor((userClub.finances.balance || 0) * 0.80)
    );
  }, [userClub?.finances?.transferBudget, userClub?.finances?.balance]);

  // Available unique nationalities for dropdown
  const uniqueNationalities = useMemo(() => {
    return Array.from(
      new Set(Object.values(gameSave.players).map((p) => p.nationality).filter(Boolean))
    ).sort();
  }, [gameSave.players]);

  // Available clubs for direct squad exploration
  const clubsList = useMemo(() => {
    return Object.values(gameSave.clubs || {}).sort((a, b) => a.name.localeCompare(b.name));
  }, [gameSave.clubs]);

  // Reset page to 1 whenever any filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    positionFilter,
    selectedClubFilter,
    onlyFreeAgents,
    onlyTransferListed,
    nationalityFilter,
    minAge,
    maxAge,
    minOvr,
    maxOvr,
    maxPrice,
    onlyWithinBudget,
    onlyYoungPromises,
    sortBy,
  ]);

  // Highly-optimized memoized filtering across world database
  const availablePlayers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const effectiveMaxPrice = onlyWithinBudget ? maxTransferCapacity : maxPrice;

    return Object.values(gameSave.players)
      .filter((p) => {
        if (p.clubId === userClub.id) return false;
        if (selectedClubFilter !== 'TODOS' && p.clubId !== selectedClubFilter) return false;
        if (onlyFreeAgents && p.clubId !== null && p.clubId !== '') return false;
        if (onlyTransferListed && !p.isTransferListed) return false;
        if (positionFilter !== 'TODOS' && p.primaryPosition !== positionFilter) return false;
        if (nationalityFilter !== 'TODAS' && p.nationality !== nationalityFilter) return false;
        if (p.age < minAge || p.age > maxAge) return false;
        if (p.overallRating < minOvr || p.overallRating > maxOvr) return false;
        if (effectiveMaxPrice > 0 && p.marketValue > effectiveMaxPrice) return false;

        // Young promise filter
        if (onlyYoungPromises) {
          if (p.age > 23 || p.potential < 78) return false;
        }

        if (term) {
          const full = `${p.firstName} ${p.lastName}`.toLowerCase();
          if (!full.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'ovr') return b.overallRating - a.overallRating;
        if (sortBy === 'value') return b.marketValue - a.marketValue;
        if (sortBy === 'age') return a.age - b.age;
        return a.lastName.localeCompare(b.lastName);
      });
  }, [
    gameSave.players,
    userClub.id,
    selectedClubFilter,
    onlyFreeAgents,
    onlyTransferListed,
    positionFilter,
    nationalityFilter,
    minAge,
    maxAge,
    minOvr,
    maxOvr,
    maxPrice,
    onlyWithinBudget,
    maxTransferCapacity,
    onlyYoungPromises,
    searchTerm,
    sortBy,
  ]);

  // Paginated slice: only render 30 DOM rows at a time
  const totalPages = Math.max(1, Math.ceil(availablePlayers.length / pageSize));
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return availablePlayers.slice(start, start + pageSize);
  }, [availablePlayers, currentPage, pageSize]);

  const handleOpenNegotiation = (player: Player) => {
    playClickSound();
    setTargetPlayer(player);
    setOfferedFee(player.clubId ? player.marketValue : 0);
    setOfferedWage(Math.max(250, player.contract.wagePerWeek || Math.round(player.overallRating * 15)));
    setContractYears(2);
    setNegotiationResult(null);
  };

  const handleConfirmOffer = () => {
    if (!targetPlayer) return;
    playClickSound();

    if (offeredFee > maxTransferCapacity) {
      setNegotiationResult({
        success: false,
        message: `Presupuesto de traspasos insuficiente. Dispones de ${userClub.finances.transferBudget.toLocaleString()} € (ampliable hasta el 80% de tesorería: ${maxTransferCapacity.toLocaleString()} €) y ofreces ${offeredFee.toLocaleString()} €.`,
      });
      return;
    }

    const effectiveBuyerClub: Club = offeredFee > userClub.finances.transferBudget
      ? {
          ...userClub,
          finances: {
            ...userClub.finances,
            transferBudget: offeredFee,
          },
        }
      : userClub;

    const sellerClub = targetPlayer.clubId ? gameSave.clubs[targetPlayer.clubId] : null;

    // Free Agent signing
    if (!sellerClub) {
      const minAcceptableWage = Math.round(targetPlayer.overallRating * 12);
      if (offeredWage < minAcceptableWage) {
        setNegotiationResult({
          success: false,
          message: `${targetPlayer.firstName} ${targetPlayer.lastName} rechaza la oferta salarial. Pide al menos ${minAcceptableWage.toLocaleString()} € / semana.`,
        });
        return;
      }

      playGoalSound();
      const releaseClause = Math.round(offeredFee * 2 + targetPlayer.marketValue * 1.5);
      const { updatedPlayer, updatedBuyer, updatedSeller } = executeTransfer(
        targetPlayer,
        effectiveBuyerClub,
        null,
        0,
        offeredWage,
        contractYears,
        releaseClause,
        gameSave.currentDate
      );

      const news: NewsItem = {
        id: `news_sign_${Date.now()}`,
        date: gameSave.currentDate,
        title: `OFICIAL: ${updatedPlayer.firstName} ${updatedPlayer.lastName} ficha por el ${userClub.name}`,
        content: `El ${userClub.name} ha cerrado la incorporación del agente libre ${updatedPlayer.firstName} ${updatedPlayer.lastName} (${updatedPlayer.primaryPosition}, ${updatedPlayer.age} años) para las próximas ${contractYears} temporadas.`,
        category: 'FICHAJE',
        read: false,
      };

      setNegotiationResult({
        success: true,
        message: `¡Contratación completada con éxito! ${updatedPlayer.firstName} ${updatedPlayer.lastName} se une inmediatamente a la plantilla de ${userClub.name}.`,
      });

      setTimeout(() => {
        onExecuteDeal(updatedBuyer, updatedSeller, updatedPlayer, news);
        setTargetPlayer(null);
      }, 1200);
      return;
    }

    // Transfer with Club
    const evalRes = evaluateCpuTransferResponse(targetPlayer, sellerClub, offeredFee);
    if (!evalRes.accepted) {
      setNegotiationResult({
        success: false,
        message: evalRes.reason,
      });
      return;
    }

    const minAcceptableWage = Math.round(targetPlayer.contract.wagePerWeek * 1.05);
    if (offeredWage < minAcceptableWage) {
      setNegotiationResult({
        success: false,
        message: `El club aceptó la oferta, pero el jugador ${targetPlayer.lastName} exige al menos ${minAcceptableWage.toLocaleString()} € semanales para mudarse.`,
      });
      return;
    }

    playGoalSound();
    const releaseClause = Math.round(offeredFee * 1.8 + 20000);
    const { updatedPlayer, updatedBuyer, updatedSeller } = executeTransfer(
      targetPlayer,
      userClub,
      sellerClub,
      offeredFee,
      offeredWage,
      contractYears,
      releaseClause,
      gameSave.currentDate
    );

    const news: NewsItem = {
      id: `news_trans_${Date.now()}`,
      date: gameSave.currentDate,
      title: `TRASPASO: ${updatedPlayer.firstName} ${updatedPlayer.lastName} nuevo jugador de ${userClub.name}`,
      content: `${userClub.name} y ${sellerClub.name} han alcanzado un acuerdo definitivo para el traspaso de ${updatedPlayer.firstName} ${updatedPlayer.lastName} por una cifra de ${offeredFee.toLocaleString()} €.`,
      category: 'FICHAJE',
      read: false,
    };

    setNegotiationResult({
      success: true,
      message: `¡Traspaso cerrado! Acuerdo total con el ${sellerClub.name} y el jugador por ${offeredFee.toLocaleString()} €.`,
    });

    setTimeout(() => {
      onExecuteDeal(updatedBuyer, updatedSeller, updatedPlayer, news);
      setTargetPlayer(null);
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Market Status & Budgets with Gold Accents */}
      <div className="bg-gradient-to-r from-[#0d1a12] via-[#08170e] to-[#0d1a12] border border-emerald-500/35 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-condensed uppercase tracking-wide">
                Mercado de Fichajes & Ojeo Mundial
              </h2>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isWindowOpen
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isWindowOpen ? 'PERIODO HABILITADO' : 'PERIODO CERRADO'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Contrata futbolistas internacionales o libres. Negociación directa según caché y presupuesto.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono-num">
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Presupuesto Traspasos
            </span>
            <span className="text-base font-bold text-emerald-400">
              {userClub.finances.transferBudget.toLocaleString()} €
            </span>
          </div>
          <div className="bg-amber-950/30 px-3.5 py-2 rounded-lg border border-amber-500/40 shadow-sm">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold font-sans">
              Capacidad 80% Tesorería
            </span>
            <span className="text-base font-bold text-amber-300">
              {maxTransferCapacity.toLocaleString()} €
            </span>
          </div>
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Masa Salarial Semanal
            </span>
            <span className="text-base font-bold text-slate-200">
              {userClub.finances.weeklyWageBudget.toLocaleString()} €
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('mercado');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'mercado'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buscador & Mercado</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('ofertas_recibidas');
          }}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'ofertas_recibidas'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Ofertas por tus Jugadores</span>
          {pendingReceivedOffers.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse">
              {pendingReceivedOffers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'ofertas_recibidas' ? (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Handshake className="w-4 h-4 text-amber-400" />
                Propuestas de Fichaje Recibidas de otros Clubes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Los clubes de la IA evalúan periódicamente a tus futbolistas transferibles y presentan ofertas económicas formales.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-700 text-xs font-mono-num text-amber-300 font-bold">
              {pendingReceivedOffers.length} pendientes
            </span>
          </div>

          {pendingReceivedOffers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-slate-200 font-bold text-sm">No tienes ofertas pendientes en este momento</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Para recibir ofertas de clubes rivales, ve a la pantalla de <strong className="text-amber-400">Plantilla</strong> y marca como <strong className="text-emerald-400">Transferible</strong> a los futbolistas que desees vender. La IA examina las necesidades de sus plantillas y enviará propuestas formales.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReceivedOffers.map((offer) => {
                const player = gameSave.players[offer.playerId];
                const buyerClub = gameSave.clubs[offer.buyingClubId];
                if (!player || !buyerClub) return null;

                const mVal = player.marketValue || calculateRealisticPlayerMarketValue(player, userClub, gameSave.difficultyLevel);
                const diffPercent = Math.round(((offer.transferFee - mVal) / Math.max(1, mVal)) * 100);
                const isAboveValue = offer.transferFee >= mVal;

                return (
                  <div
                    key={offer.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg transition-all"
                  >
                    {/* Header: Player + Buyer Club */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                            {player.primaryPosition}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100">
                            {player.firstName} {player.lastName}
                          </h4>
                          <span className="text-xs text-slate-400">({player.age} años)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>Media: <strong className="text-slate-200">{player.overallRating}</strong></span>
                          <span>·</span>
                          <span>Valor: <strong className="text-slate-200">{mVal.toLocaleString()} €</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Club Comprador</span>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: buyerClub.primaryColor || '#64748b' }}
                          />
                          <span className="text-xs font-bold text-slate-200">{buyerClub.shortName || buyerClub.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Proposal Details */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg text-xs font-mono-num border border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Oferta de Traspaso</span>
                        <span className="text-base font-black text-amber-400">
                          {offer.transferFee.toLocaleString()} €
                        </span>
                        <span className={`text-[10px] block font-sans font-bold ${isAboveValue ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isAboveValue ? `+${diffPercent}% sobre valor` : `${diffPercent}% sobre valor`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">Sueldo Propuesto</span>
                        <span className="text-sm font-bold text-slate-200">
                          {offer.proposedWageWeekly.toLocaleString()} € / sem
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {offer.proposedContractYears} años de contrato ({offer.proposedSquadStatus})
                        </span>
                      </div>
                    </div>

                    {/* Counter-offer drawer if active */}
                    {counteringOfferId === offer.id && (
                      <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-lg space-y-2">
                        <label className="text-[11px] text-amber-300 font-bold block">
                          Introduce el precio que exiges al {buyerClub.name} (€):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="50000"
                            min={offer.transferFee}
                            value={counterOfferFee}
                            onChange={(e) => setCounterOfferFee(Number(e.target.value))}
                            className="flex-1 bg-slate-950 border border-amber-500/50 rounded px-2.5 py-1 text-xs text-amber-200 font-mono-num focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (onNegotiateCpuOffer && counterOfferFee > 0) {
                                onNegotiateCpuOffer(offer.id, counterOfferFee);
                                setCounteringOfferId(null);
                              }
                            }}
                            className="pcf-btn pcf-btn-gold px-3 py-1 text-xs font-black uppercase"
                          >
                            Enviar
                          </button>
                          <button
                            type="button"
                            onClick={() => setCounteringOfferId(null)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          if (onRejectCpuOffer) onRejectCpuOffer(offer.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-800/40 transition-colors"
                      >
                        Rechazar
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setCounteringOfferId(offer.id);
                            setCounterOfferFee(Math.round(offer.transferFee * 1.25));
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-950/40 border border-amber-600/40 transition-colors"
                        >
                          Contraofertar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playGoalSound();
                            if (onAcceptCpuOffer) onAcceptCpuOffer(offer);
                          }}
                          className="pcf-btn pcf-btn-emerald px-4 py-1.5 text-xs font-black uppercase tracking-wider"
                        >
                          Aceptar Traspaso
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Prominent Search and Dual Sliders Engine (Precio y Nivel OVR) */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-925 to-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-md">
        
        {/* Main Search Input & Positions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, apellido (ej. Ramos, Messi, Bellingham, Salah...)"
              className="w-full bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
            />
          </div>

          {/* Position Selector */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['TODOS', 'POR', 'DFC', 'LD', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC'].map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  playClickSound();
                  setPositionFilter(pos);
                }}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all ${
                  positionFilter === pos
                    ? 'pcf-btn-gold text-slate-950 font-black shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Club Selector / Explorar Plantilla de un Club */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-condensed">Club:</span>
            <select
              value={selectedClubFilter}
              onChange={(e) => {
                playClickSound();
                setSelectedClubFilter(e.target.value);
              }}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="TODOS" className="bg-slate-900 text-slate-200">Todos los Clubes</option>
              {clubsList.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={onlyFreeAgents}
                onChange={(e) => setOnlyFreeAgents(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="font-semibold text-emerald-400">Agentes Libres</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={onlyTransferListed}
                onChange={(e) => setOnlyTransferListed(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span className="font-semibold text-amber-400">En Venta</span>
            </label>

            <button
              onClick={() => {
                playClickSound();
                setShowAdvancedFilters(!showAdvancedFilters);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 border transition-all ${
                showAdvancedFilters
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showAdvancedFilters ? 'Menos Filtros' : 'Filtros Avanzados'}</span>
            </button>
          </div>
        </div>

        {/* DEDICATED BUSCADOR DE NIVEL / MEDIA (OVR) */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase font-condensed tracking-wide">
              Buscador por Nivel / Media (OVR)
            </span>
            <span className="text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded font-mono-num">
              {minOvr} - {maxOvr} OVR
            </span>
          </div>

          {/* Quick Level Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { label: 'Todos', min: 40, max: 99, young: false },
              { label: '🌟 Élite (82-99)', min: 82, max: 99, young: false },
              { label: '⭐ Titulares (74-81)', min: 74, max: 81, young: false },
              { label: '🛡️ Rendimiento (65-73)', min: 65, max: 73, young: false },
              { label: '💎 Sub-23 Promesas', min: 65, max: 90, young: true },
            ].map((preset) => {
              const isActive = minOvr === preset.min && maxOvr === preset.max && onlyYoungPromises === preset.young;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMinOvr(preset.min);
                    setMaxOvr(preset.max);
                    setOnlyYoungPromises(preset.young);
                  }}
                  className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Range Slider for Level */}
          <div className="flex items-center gap-2 text-xs font-mono-num min-w-[160px]">
            <span className="text-[10px] text-slate-400">Mín:</span>
            <input
              type="range"
              min={40}
              max={95}
              value={minOvr}
              onChange={(e) => setMinOvr(Number(e.target.value))}
              className="w-24 accent-amber-400 cursor-pointer"
            />
            <span className="text-amber-300 font-bold">{minOvr}</span>
          </div>
        </div>

        {/* DEDICATED BUSCADOR DE PRECIO / VALOR DE MERCADO */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase font-condensed tracking-wide">
              Buscador por Precio (€)
            </span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono-num">
              {onlyWithinBudget ? `≤ ${maxTransferCapacity.toLocaleString()} € (Presupuesto)` : maxPrice > 0 ? `≤ ${maxPrice.toLocaleString()} €` : 'Sin Límite'}
            </span>
          </div>

          {/* Quick Price Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { label: 'Cualquier Precio', price: 0, budgetOnly: false },
              { label: '💰 Dentro de mi Presupuesto', price: maxTransferCapacity, budgetOnly: true },
              { label: '≤ 1.000.000 €', price: 1000000, budgetOnly: false },
              { label: '≤ 5.000.000 €', price: 5000000, budgetOnly: false },
              { label: '≤ 20.000.000 €', price: 20000000, budgetOnly: false },
            ].map((chip) => {
              const isActive = chip.budgetOnly ? onlyWithinBudget : !onlyWithinBudget && maxPrice === chip.price;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    if (chip.budgetOnly) {
                      setOnlyWithinBudget(true);
                      setMaxPrice(0);
                    } else {
                      setOnlyWithinBudget(false);
                      setMaxPrice(chip.price);
                    }
                  }}
                  className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors ${
                    isActive
                      ? 'bg-emerald-400 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Orden:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-amber-300 font-bold"
            >
              <option value="ovr">Mayor Media (OVR)</option>
              <option value="value">Mayor Valor (€)</option>
              <option value="age">Menor Edad (Jóvenes)</option>
              <option value="name">Apellido (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filters (Nationality & Exact Ages) */}
        {showAdvancedFilters && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Nacionalidad</label>
              <select
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="TODAS">Todas las nacionalidades ({uniqueNationalities.length})</option>
                {uniqueNationalities.map((nat) => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Rango de Edad ({minAge} - {maxAge} años)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={15}
                  max={45}
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-center text-slate-200"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  min={15}
                  max={45}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-center text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Tope de Precio Personalizado (€)
              </label>
              <input
                type="number"
                step="50000"
                min={0}
                value={maxPrice}
                onChange={(e) => {
                  setOnlyWithinBudget(false);
                  setMaxPrice(Number(e.target.value));
                }}
                placeholder="0 = Sin límite"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono-num"
              />
            </div>
          </div>
        )}
      </div>

      {/* Pagination Bar (Top) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono-num">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-sans">
            Encontrados: <strong className="text-amber-400 font-mono-num">{availablePlayers.length}</strong> futbolistas
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-sans">
            Página <strong className="text-emerald-400">{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>
        </div>

        {/* Page Nav Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => {
              playClickSound();
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
            className="pcf-btn px-2.5 py-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="font-bold">Anterior</span>
          </button>

          {/* Quick Page Jump Buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCurrentPage(pageNum);
                  }}
                  className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'pcf-btn-gold text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => {
              playClickSound();
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
            className="pcf-btn px-2.5 py-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span className="font-bold">Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Players Market Table (Renders only paginatedPlayers for peak performance) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-950/80">
                <th className="py-2.5 px-3">Pos</th>
                <th className="py-2.5 px-3 font-sans">Jugador</th>
                <th className="py-2.5 px-3 font-sans">Club Actual</th>
                <th className="py-2.5 px-2 text-center">Edad</th>
                <th className="py-2.5 px-2 text-center">Media (OVR)</th>
                <th className="py-2.5 px-3 text-right">Valor Mercado</th>
                <th className="py-2.5 px-3 text-right">Sueldo Estimado</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No se encontraron jugadores que coincidan con los filtros de precio o nivel seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedPlayers.map((p) => {
                  const club = p.clubId ? gameSave.clubs[p.clubId] : null;
                  const isFree = !p.clubId;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-200">
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                          {p.primaryPosition}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">
                        {p.firstName} {p.lastName}
                        {p.isTransferListed && (
                          <span className="ml-2 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            EN VENTA
                          </span>
                        )}
                        {p.age <= 22 && p.potential >= 80 && (
                          <span className="ml-2 text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-1.5 py-0.5 rounded">
                            PROMESA
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {isFree ? (
                          <span className="text-emerald-400 font-bold">Agente Libre</span>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: club?.primaryColor || '#64748b' }}
                            />
                            <span className="truncate max-w-[150px]">{club?.shortName || club?.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{p.age}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`pcf-rating-badge text-xs font-black ${
                          p.overallRating >= 85
                            ? 'pcf-rating-super'
                            : p.overallRating >= 75
                            ? 'pcf-rating-high'
                            : p.overallRating >= 65
                            ? 'pcf-rating-mid'
                            : 'pcf-rating-low'
                        }`}>
                          {p.overallRating}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200 font-bold">
                        {isFree ? (
                          <span className="text-emerald-400">0 € (Gratis)</span>
                        ) : (
                          `${p.marketValue.toLocaleString()} €`
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        ~{p.contract.wagePerWeek.toLocaleString()} € / sem
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenNegotiation(p)}
                          className={`pcf-btn px-3 py-1 text-xs uppercase font-condensed tracking-wider ${
                            isFree ? 'pcf-btn-emerald' : 'pcf-btn-gold'
                          }`}
                        >
                          {isFree ? 'Fichar Libre' : 'Hacer Oferta'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar (Bottom) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono-num">
        <span className="text-slate-400 font-sans">
          Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => {
              playClickSound();
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
            className="pcf-btn px-3 py-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => {
              playClickSound();
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
            className="pcf-btn px-3 py-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      </>
      )}

      {/* Negotiation Modal */}
      {targetPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-[#0d1626] to-[#070b14] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
                  {targetPlayer.primaryPosition}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                    Negociar Fichaje: {targetPlayer.firstName} {targetPlayer.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {targetPlayer.primaryPosition} · {targetPlayer.age} años · {targetPlayer.overallRating} OVR · {targetPlayer.nationality}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTargetPlayer(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {negotiationResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  negotiationResult.success
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                {negotiationResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{negotiationResult.message}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Fee */}
              {targetPlayer.clubId ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-300 font-medium">Oferta de Traspaso al Club (€)</label>
                    <span className="text-slate-400">Valor estimado: {targetPlayer.marketValue.toLocaleString()} €</span>
                  </div>
                  <input
                    type="number"
                    step="10000"
                    value={offeredFee}
                    onChange={(e) => setOfferedFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono-num focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Presupuesto disponible: {userClub.finances.transferBudget.toLocaleString()} €</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 font-medium">
                  Agente libre. No requiere pago de traspaso a ningún club vendedor.
                </div>
              )}

              {/* Wage */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-medium">Ficha Salarial Semanal (€ / semana)</label>
                  <span className="text-slate-400">Pretensión aproximada: ~{targetPlayer.contract.wagePerWeek.toLocaleString()} €</span>
                </div>
                <input
                  type="number"
                  step="100"
                  value={offeredWage}
                  onChange={(e) => setOfferedWage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono-num focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Contract Length */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">Duración del Contrato</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((years) => (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setContractYears(years)}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                        contractYears === years
                          ? 'pcf-btn-gold text-slate-950 font-black shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {years} {years === 1 ? 'Año' : 'Años'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTargetPlayer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmOffer}
                className="pcf-btn pcf-btn-gold px-5 py-2 text-xs font-black uppercase tracking-wider"
              >
                Presentar Oferta Formal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
