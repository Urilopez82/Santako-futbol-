import React, { useState } from 'react';
import { 
  applyForLoan, 
  BANK_LOAN_OFFERS, 
  calculateCateringItemEconomics,
  calculateMerchandisingItemEconomics,
  calculateWeeklyTvRightsIncome,
  ensureClubManagementState, 
  getSponsorProposalsForClub,
  reallocateClubTransferBudget,
  signSponsorProposal, 
  SPONSOR_PROPOSALS_CATALOG, 
  STADIUM_UPGRADES_CATALOG, 
  startStadiumUpgrade 
} from '../../engine/clubManagementEngine';
import { Stadium3DViewer } from '../stadium/Stadium3DViewer';
import { Club } from '../../types/club';
import { KitCollar, KitDesign, KitPattern, LoanOffer, SponsorProposal, StadiumUpgradeOption, StadiumZonePricing } from '../../types/clubManagement';
import { GameSave, NewsItem } from '../../types/game';
import { playClickSound } from '../../utils/audio';
import { 
  AlertCircle, 
  Banknote, 
  Building, 
  Building2, 
  CheckCircle, 
  Coins, 
  Compass, 
  DollarSign, 
  Hammer, 
  HelpCircle, 
  Layers, 
  MessageSquare, 
  Newspaper, 
  Palette, 
  Percent, 
  PiggyBank, 
  Plus, 
  RefreshCw, 
  Shield, 
  ShoppingBag, 
  Sparkles, 
  Ticket, 
  TrendingDown, 
  TrendingUp, 
  Tv, 
  UtensilsCrossed 
} from 'lucide-react';

interface ClubManagementViewProps {
  gameSave: GameSave;
  onUpdateClub: (updatedClub: Club, playerDeltas?: any, newsItem?: NewsItem) => void;
  initialSubTab?: 'economia' | 'patrocinios' | 'equipaciones' | 'estadio' | 'catering' | 'taquillas' | 'tienda' | 'prensa';
}

export const ClubManagementView: React.FC<ClubManagementViewProps> = ({
  gameSave,
  onUpdateClub,
  initialSubTab = 'economia',
}) => {
  const [subTab, setSubTab] = useState<
    'economia' | 'patrocinios' | 'equipaciones' | 'estadio' | 'catering' | 'taquillas' | 'tienda' | 'prensa'
  >(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const club = ensureClubManagementState(gameSave.clubs[gameSave.userClubId]);
  const [activeKitType, setActiveKitType] = useState<'home' | 'away' | 'third'>('home');
  const [tempKit, setTempKit] = useState<KitDesign>(club.kits![activeKitType]);
  const [tempZonePricing, setTempZonePricing] = useState<StadiumZonePricing>(club.zonePricing!);
  const [tempTransferBudget, setTempTransferBudget] = useState<number>(club.finances.transferBudget);
  const [tempCateringItems, setTempCateringItems] = useState(club.cateringConfig?.items || []);
  const [tempMerchItems, setTempMerchItems] = useState(club.merchandisingStore?.items || []);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Switch kit in editor
  const handleSelectKitType = (type: 'home' | 'away' | 'third') => {
    playClickSound();
    setActiveKitType(type);
    if (club.kits) {
      setTempKit(club.kits[type]);
    }
  };

  // Save modified kit
  const handleSaveKit = () => {
    playClickSound();
    const updatedKits = {
      ...club.kits!,
      [activeKitType]: tempKit,
    };
    const updatedClub: Club = {
      ...club,
      kits: updatedKits,
    };
    onUpdateClub(updatedClub);
    showNotification(`Equipación ${activeKitType.toUpperCase()} guardada con éxito.`);
  };

  // Request loan
  const handleRequestLoan = (offer: LoanOffer) => {
    playClickSound();
    const res = applyForLoan(club, offer, gameSave.currentDate);
    onUpdateClub(res.updatedClub, undefined, res.newsItem);
    showNotification(`Préstamo de ${offer.principal.toLocaleString()} € concedido.`);
  };

  // Start stadium construction
  const handleStartUpgrade = (option: StadiumUpgradeOption) => {
    playClickSound();
    if (club.finances.balance < option.cost) {
      alert(`Fondos insuficientes en tesorería. Se requieren ${option.cost.toLocaleString()} € íntegros para acometer esta reforma del estadio.`);
      return;
    }
    const isAlreadyActive = (club.activeStadiumProjects || []).some(
      (p) => p.title === option.title || p.type === option.category
    );
    if (isAlreadyActive) {
      alert(`Ya existen obras activas en el estadio para este sector (${option.title}).`);
      return;
    }
    const res = startStadiumUpgrade(club, option, gameSave.currentDate);
    onUpdateClub(res.updatedClub, undefined, res.newsItem);
    showNotification(`Presupuesto asignado (-${option.cost.toLocaleString()} €) y obras iniciadas: ${option.title}`);
  };

  // Sign sponsor
  const handleSignSponsor = (proposal: SponsorProposal) => {
    playClickSound();
    const res = signSponsorProposal(club, proposal, gameSave.currentDate);
    onUpdateClub(res.updatedClub, undefined, res.newsItem);
    showNotification(`Patrocinio firmado con ${proposal.sponsorName}.`);
  };

  // Save Zone Pricing
  const handleSaveZonePricing = () => {
    playClickSound();
    const updatedClub: Club = {
      ...club,
      zonePricing: tempZonePricing,
      stadium: {
        ...club.stadium,
        ticketPrice: Math.round(
          tempZonePricing.tribunaPrice * 0.25 +
          tempZonePricing.lateralPrice * 0.35 +
          tempZonePricing.fondosPrice * 0.35 +
          tempZonePricing.vipPrice * 0.05
        ),
      },
    };
    onUpdateClub(updatedClub);
    showNotification('Estructura de precios por zonas actualizada.');
  };

  // Reallocate Transfer Budget (up to 80% of cash balance)
  const handleSaveTransferBudget = () => {
    playClickSound();
    const res = reallocateClubTransferBudget(club, tempTransferBudget);
    if (res.success) {
      onUpdateClub(res.updatedClub);
      showNotification(res.message);
    } else {
      alert(res.message);
    }
  };

  // Save Catering Prices
  const handleSaveCatering = () => {
    playClickSound();
    const updatedClub: Club = {
      ...club,
      cateringConfig: {
        ...club.cateringConfig!,
        items: tempCateringItems,
      },
    };
    onUpdateClub(updatedClub);
    showNotification('Carta y precios de hostelería del estadio actualizados.');
  };

  // Save Merchandising Prices
  const handleSaveMerchandising = () => {
    playClickSound();
    const updatedClub: Club = {
      ...club,
      merchandisingStore: {
        ...club.merchandisingStore!,
        items: tempMerchItems,
      },
    };
    onUpdateClub(updatedClub);
    showNotification('Precios oficiales de la tienda y merchandising actualizados.');
  };

  // Total weekly wages
  const totalWeeklyWages = club.playerIds.reduce((sum, pid) => {
    const p = gameSave.players[pid];
    return sum + (p?.contract?.wagePerWeek || 0);
  }, 0);

  // Total active debt
  const totalDebt = (club.loans || []).reduce((sum, l) => sum + l.remainingAmount, 0);

  // TV Rights & Treasury Reallocation Limit
  const weeklyTvIncome = calculateWeeklyTvRightsIncome(club);
  const maxTransferBudgetAllowed = Math.max(
    club.finances.transferBudget,
    Math.floor(club.finances.balance * 0.80)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white font-condensed uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Gestión Integral del Club — {club.name}
            </h2>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              FASE 3 ACTIVA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Control ejecutivo total: economía bancaria, contratos de patrocinio, reformas del estadio, equipaciones oficiales, catering y tienda.
          </p>
        </div>

        {/* Quick financial indicator */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl shrink-0 font-mono-num text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tesorería</span>
            <span className={`font-bold ${club.finances.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {club.finances.balance.toLocaleString()} €
            </span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Endeudamiento</span>
            <span className={`font-bold ${totalDebt > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {totalDebt.toLocaleString()} €
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'economia', label: 'Economía & Banco', icon: Coins },
            { id: 'patrocinios', label: 'Patrocinadores', icon: PiggyBank },
            { id: 'equipaciones', label: 'Equipaciones & Camisetas', icon: Palette },
            { id: 'estadio', label: 'Estadio & Obras', icon: Hammer },
            { id: 'catering', label: 'Catering & Restaurante', icon: UtensilsCrossed },
            { id: 'taquillas', label: 'Taquillas & Zonas', icon: Ticket },
            { id: 'tienda', label: 'Tienda Oficial', icon: ShoppingBag },
            { id: 'prensa', label: 'Prensa & Directiva', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setSubTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold font-condensed uppercase tracking-wider rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {successNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{successNotice}</span>
          </div>
        )}
      </div>

      {/* SUBTAB 1: ECONOMIA & BANCO */}
      {subTab === 'economia' && (
        <div className="space-y-6 font-mono-num">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Tesorería Líquida</span>
              <span className={`text-2xl font-black ${club.finances.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {club.finances.balance.toLocaleString()} €
              </span>
              <span className="text-[11px] text-slate-500 font-sans block mt-1">Saldo bancario a la vista</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Presupuesto Fichajes</span>
              <span className="text-2xl font-black text-slate-100">
                {club.finances.transferBudget.toLocaleString()} €
              </span>
              <span className="text-[11px] text-emerald-400 font-sans block mt-1">
                Límite 80%: {maxTransferBudgetAllowed.toLocaleString()} €
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Derechos TV Semanales</span>
              <span className="text-2xl font-black text-sky-400">
                +{weeklyTvIncome.toLocaleString()} €
              </span>
              <span className="text-[11px] text-slate-500 font-sans block mt-1">
                Contrato audiovisual de liga
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Deuda Financiera</span>
              <span className={`text-2xl font-black ${totalDebt > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {totalDebt.toLocaleString()} €
              </span>
              <span className="text-[11px] text-slate-500 font-sans block mt-1">
                {club.loans?.length || 0} préstamos activos
              </span>
            </div>
          </div>

          {/* Transfer Budget Reallocation (Up to 80% of cash balance) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                  Reasignación de Presupuesto para Fichajes (Hasta el 80% de Tesorería)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono-num">
                Tesorería: {club.finances.balance.toLocaleString()} €
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              La junta directiva autoriza destinar hasta un <strong>80% del fondo líquido de tesorería</strong> a incorporaciones deportivas. Ajusta el deslizador o introduce la cifra exacta deseada para traspasos.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono-num">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-300 font-medium font-sans">Presupuesto Seleccionado:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={maxTransferBudgetAllowed}
                    step="10000"
                    value={tempTransferBudget}
                    onChange={(e) => setTempTransferBudget(Math.min(maxTransferBudgetAllowed, Math.max(0, Number(e.target.value))))}
                    className="w-44 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-right font-bold text-emerald-400 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-400 text-sm">€</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={maxTransferBudgetAllowed}
                step="5000"
                value={tempTransferBudget}
                onChange={(e) => setTempTransferBudget(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono-num">
                <span>0 € (Austeridad máxima)</span>
                <span>Actual: {club.finances.transferBudget.toLocaleString()} €</span>
                <span className="text-amber-400 font-bold">Límite 80%: {maxTransferBudgetAllowed.toLocaleString()} €</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveTransferBudget}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow transition-colors font-sans flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aplicar Nuevo Presupuesto de Fichajes</span>
              </button>
            </div>
          </div>

          {/* Bank Loans Center */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                  Mercado Financiero y Créditos Bancarios
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono-num">
                {club.loans?.length || 0} préstamos vigentes
              </span>
            </div>

            {/* Active loans list */}
            {club.loans && club.loans.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider">
                  Créditos en Vigor
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {club.loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono-num text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200 font-sans">{loan.name}</span>
                        <span className="text-amber-400 font-bold">{loan.interestRate * 100}% TIN</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Capital Vivo Pendiente:</span>
                        <span className="text-rose-400 font-bold">{loan.remainingAmount.toLocaleString()} €</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Cuota Semanal:</span>
                        <span className="text-slate-200">{loan.weeklyPayment.toLocaleString()} € / sem</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Plazo Restante:</span>
                        <span className="text-slate-300">{loan.remainingWeeks} semanas ({Math.round(loan.remainingWeeks / 52 * 10) / 10} años)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available loan offers */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider">
                Solicitar Nueva Línea de Crédito Bancario
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BANK_LOAN_OFFERS.map((offer) => {
                  const meetsRep = club.reputation >= offer.minReputation;
                  return (
                    <div
                      key={offer.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-emerald-400 font-mono-num">
                            +{offer.principal.toLocaleString()} €
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono-num">
                            {offer.interestRate * 100}% Interés
                          </span>
                        </div>
                        <h5 className="font-bold text-white text-xs font-condensed uppercase">
                          {offer.name}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono-num">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Amortización:</span>
                          <span className="text-slate-200">{offer.weeklyPayment.toLocaleString()} € / sem</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Plazo:</span>
                          <span className="text-slate-300">{offer.termWeeks} semanas</span>
                        </div>

                        {meetsRep ? (
                          <button
                            onClick={() => handleRequestLoan(offer)}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors font-sans"
                          >
                            Firmar Crédito
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-1.5 bg-slate-800/60 text-slate-500 text-xs rounded-lg font-sans cursor-not-allowed"
                          >
                            Reputación mínima {offer.minReputation}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PATROCINADORES */}
      {subTab === 'patrocinios' && (
        <div className="space-y-6">
          {/* Active Sponsors */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
              Contratos de Patrocinio Activos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-xs">
              {(club.sponsors || []).map((sp) => (
                <div
                  key={sp.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded uppercase font-mono-num">
                        {sp.category.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono-num">{sp.yearsLeft} años rest.</span>
                    </div>
                    <h4 className="font-bold text-white text-sm font-condensed uppercase">
                      {sp.sponsorName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sp.clauses}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 font-mono-num space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ingreso Anual:</span>
                      <span className="font-bold text-emerald-400">+{sp.annualAmount.toLocaleString()} € / año</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cobro Semanal:</span>
                      <span className="text-slate-200">+{sp.weeklyPayment.toLocaleString()} € / sem</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Proposals Catalog */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Mercado de Patrocinios — Ofertas de Empresas
              </h3>
              <span className="text-xs text-slate-400">Basado en el prestigio del club</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
              {getSponsorProposalsForClub(club).map((prop) => {
                const canSign = club.reputation >= prop.reputationRequired;
                return (
                  <div
                    key={prop.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                          {prop.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-amber-400 font-mono-num">
                          {prop.reputationScore} PTS
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm font-condensed uppercase">
                        {prop.sponsorName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">{prop.clauses}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-2 font-mono-num">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aportación Anual:</span>
                        <span className="font-bold text-emerald-400">+{prop.annualAmount.toLocaleString()} €</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Duración:</span>
                        <span className="text-slate-300">{prop.durationYears} temporadas</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Prima Ascenso:</span>
                        <span className="text-amber-400">+{prop.bonusPromotion.toLocaleString()} €</span>
                      </div>

                      {canSign ? (
                        <button
                          onClick={() => handleSignSponsor(prop)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors font-sans"
                        >
                          Firmar Acuerdo de Patrocinio
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-1.5 bg-slate-800/60 text-slate-500 text-xs rounded-lg font-sans cursor-not-allowed"
                        >
                          Requiere Reputación {prop.reputationRequired}+
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: EQUIPACIONES Y CAMISETAS (VISUAL KIT EDITOR) */}
      {subTab === 'equipaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Editor */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                  Editor Oficial de Equipaciones RFEF
                </h3>
              </div>
              <div className="flex gap-1.5">
                {(['home', 'away', 'third'] as const).map((kType) => (
                  <button
                    key={kType}
                    onClick={() => handleSelectKitType(kType)}
                    className={`px-3 py-1 text-xs font-bold font-condensed uppercase rounded-lg transition-colors ${
                      activeKitType === kType
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {kType === 'home' ? '1ª Local' : kType === 'away' ? '2ª Visitante' : '3ª Alternativa'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern & Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="text-slate-400 block mb-1">Patrón de la Camiseta:</label>
                <select
                  value={tempKit.pattern}
                  onChange={(e) => setTempKit({ ...tempKit, pattern: e.target.value as KitPattern })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="solid">Liso Clásico</option>
                  <option value="stripes_vertical">Franjas Verticales</option>
                  <option value="stripes_horizontal">Franjas Horizontales</option>
                  <option value="sash">Banda Diagonal Cruzada</option>
                  <option value="halves">Bicolor a Mitades</option>
                  <option value="gradient">Degradado Moderno</option>
                  <option value="checkered">Cuadros Ajedrezados</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tipo de Cuello:</label>
                <select
                  value={tempKit.collar}
                  onChange={(e) => setTempKit({ ...tempKit, collar: e.target.value as KitCollar })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="round">Cuello Redondo Clásico</option>
                  <option value="v_neck">Cuello en V Deportivo</option>
                  <option value="polo">Cuello Polo con Botón</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Color Principal:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempKit.primaryColor}
                    onChange={(e) => setTempKit({ ...tempKit, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tempKit.primaryColor}
                    onChange={(e) => setTempKit({ ...tempKit, primaryColor: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono-num flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Color Secundario:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempKit.secondaryColor}
                    onChange={(e) => setTempKit({ ...tempKit, secondaryColor: e.target.value })}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tempKit.secondaryColor}
                    onChange={(e) => setTempKit({ ...tempKit, secondaryColor: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono-num flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Color Pantalón:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempKit.shortsColor}
                    onChange={(e) => setTempKit({ ...tempKit, shortsColor: e.target.value })}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={tempKit.shortsColor}
                    onChange={(e) => setTempKit({ ...tempKit, shortsColor: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono-num flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Patrocinador Frontal:</label>
                <input
                  type="text"
                  value={tempKit.sponsorText || ''}
                  onChange={(e) => setTempKit({ ...tempKit, sponsorText: e.target.value })}
                  placeholder="Texto publicitario frontal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveKit}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar Diseño Oficial y Homologar</span>
            </button>
          </div>

          {/* Visual Kit Mockup Canvas */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center space-y-4">
            <span className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider">
              Vista Previa de la Equipación Oficial
            </span>

            {/* Simulated 2D Kit SVG Graphic */}
            <div className="w-56 h-72 relative flex flex-col items-center justify-center drop-shadow-2xl">
              <svg viewBox="0 0 200 240" className="w-full h-full">
                {/* Shirt Base */}
                <defs>
                  <linearGradient id="kitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={tempKit.primaryColor} />
                    <stop offset="100%" stopColor={tempKit.secondaryColor} />
                  </linearGradient>
                </defs>

                {/* Torso */}
                <path
                  d="M50 40 L70 30 L130 30 L150 40 L180 80 L155 100 L140 75 L140 180 L60 180 L60 75 L45 100 L20 80 Z"
                  fill={tempKit.pattern === 'gradient' ? 'url(#kitGrad)' : tempKit.primaryColor}
                  stroke="#1e293b"
                  strokeWidth="2"
                />

                {/* Patterns */}
                {tempKit.pattern === 'stripes_vertical' && (
                  <g fill={tempKit.secondaryColor}>
                    <rect x="75" y="30" width="12" height="150" />
                    <rect x="95" y="30" width="12" height="150" />
                    <rect x="115" y="30" width="12" height="150" />
                  </g>
                )}

                {tempKit.pattern === 'stripes_horizontal' && (
                  <g fill={tempKit.secondaryColor}>
                    <rect x="60" y="60" width="80" height="12" />
                    <rect x="60" y="90" width="80" height="12" />
                    <rect x="60" y="120" width="80" height="12" />
                    <rect x="60" y="150" width="80" height="12" />
                  </g>
                )}

                {tempKit.pattern === 'sash' && (
                  <polygon
                    points="50,40 80,30 140,180 110,180"
                    fill={tempKit.secondaryColor}
                  />
                )}

                {tempKit.pattern === 'halves' && (
                  <rect x="100" y="30" width="40" height="150" fill={tempKit.secondaryColor} />
                )}

                {/* Collar */}
                <path
                  d="M80 30 Q100 50 120 30 Z"
                  fill={tempKit.collar === 'polo' ? tempKit.secondaryColor : '#0f172a'}
                  stroke="#334155"
                />

                {/* Crest */}
                <circle cx="80" cy="70" r="10" fill={club.primaryColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="80" y="74" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#ffffff">
                  {club.code}
                </text>

                {/* Sponsor text */}
                {tempKit.sponsorText && (
                  <text
                    x="100"
                    y="115"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#ffffff"
                    letterSpacing="1"
                  >
                    {tempKit.sponsorText.toUpperCase()}
                  </text>
                )}

                {/* Shorts */}
                <rect x="65" y="185" width="70" height="45" rx="4" fill={tempKit.shortsColor} stroke="#1e293b" />
                <line x1="100" y1="205" x2="100" y2="230" stroke="#0f172a" strokeWidth="2" />
              </svg>
            </div>

            <div className="text-center font-mono-num text-xs">
              <span className="text-slate-400 block text-[11px]">Índice de Atractivo Comercial</span>
              <span className="text-lg font-bold text-emerald-400">{club.kits?.appealRating || 75} / 100</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                Impacta directamente en la venta de camisetas oficiales
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: ESTADIO Y OBRAS */}
      {subTab === 'estadio' && (
        <div className="space-y-6">
          {/* Interactive 3D Stadium Visualization with Extensions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-400" />
                Visualización Arquitectónica 3D del Estadio
              </span>
              <span className="text-[11px] text-slate-400 font-mono-num">
                {club.stadium.name} · {club.stadium.capacity.toLocaleString()} esp.
              </span>
            </div>
            <Stadium3DViewer club={club} previewUpgrade={(club.activeStadiumProjects || []).length > 0} />
          </div>

          {/* Active stadium works progress */}
          {club.activeStadiumProjects && club.activeStadiumProjects.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Hammer className="w-5 h-5 animate-bounce" />
                <h3 className="text-sm font-bold font-condensed uppercase tracking-wider">
                  Obras de Modernización en Progreso
                </h3>
              </div>

              <div className="space-y-3">
                {club.activeStadiumProjects.map((p) => {
                  const progressPct = Math.round(((p.totalWeeks - p.weeksRemaining) / p.totalWeeks) * 100);
                  return (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{p.title}</span>
                        <span className="text-amber-400 font-mono-num font-bold">{p.weeksRemaining} semanas restantes</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono-num pt-1">
                        <span>Aforo permanente: <strong className="text-emerald-400">+{p.capacityChange.toLocaleString()} asientos</strong></span>
                        {p.targetCompletionDate && (
                          <span>Inauguración prevista: <strong className="text-slate-200">{p.targetCompletionDate}</strong></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{p.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stadium Naming Rights Commercial Sponsorship Section (BLOQUE 14) */}
          <div className="bg-gradient-to-r from-[#0d1726] via-[#09111c] to-[#0d1726] border border-amber-500/40 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-condensed uppercase tracking-wider flex items-center gap-2">
                    <span>Derechos de Nombre del Estadio (Naming Rights)</span>
                    {club.stadium.namingRightsSponsor ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                        CONTRATO ACTIVO
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                        DISPONIBLE PARA PATROCINIO
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Comercializa el nombre de tu feudo con marcas globales de primer nivel y asegura ingresos millonarios anuales garantizados.
                  </p>
                </div>
              </div>

              {club.stadium.namingRightsSponsor && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const origName = club.stadium.historicName || club.stadium.name.replace(/^(Spotify|Emirates|Allianz|Civitas|Etihad|Santander|Rakuten|Oracle|Red Bull)\s+/i, '');
                    const updatedClub: Club = {
                      ...club,
                      stadium: {
                        ...club.stadium,
                        name: origName,
                        commercialName: undefined,
                        namingRightsSponsor: undefined,
                      },
                    };
                    const news: NewsItem = {
                      id: `news_naming_rev_${Date.now()}`,
                      date: gameSave.currentDate,
                      title: `El estadio recupera su nombre histórico oficial: ${origName}`,
                      content: `El club y su patrocinador han resuelto su acuerdo comercial de naming rights. El estadio volverá a denominarse oficialmente '${origName}'.`,
                      category: 'DIRECTIVA',
                      read: false,
                    };
                    onUpdateClub(updatedClub, undefined, news);
                    showNotification(`Se ha rescindido el acuerdo comercial. El estadio vuelve a llamarse ${origName}.`);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-800/40 transition-colors"
                >
                  Rescindir Acuerdo
                </button>
              )}
            </div>

            {club.stadium.namingRightsSponsor ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono-num">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Nombre Comercial Oficial</span>
                  <span className="text-base font-black text-amber-300">{club.stadium.name}</span>
                  <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                    Nombre histórico: {club.stadium.historicName || club.stadium.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Sponsor Oficial</span>
                  <span className="text-sm font-bold text-slate-100">{club.stadium.namingRightsSponsor.sponsorName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Ingreso Anual Fijo</span>
                  <span className="text-sm font-bold text-emerald-400">
                    +{club.stadium.namingRightsSponsor.annualFee.toLocaleString()} € / año
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Vigencia</span>
                  <span className="text-xs font-bold text-slate-200">
                    Hasta temp. {club.stadium.namingRightsSponsor.endSeason} ({club.stadium.namingRightsSponsor.yearsDuration} años)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-sans">
                  <span>
                    Nombre histórico actual: <strong className="text-white">{club.stadium.historicName || club.stadium.name}</strong>
                  </span>
                  <span className="text-amber-400 font-bold">Ofertas comerciales recibidas:</span>
                </div>

                {(() => {
                  const baseRep = club.reputation || 70;
                  const mult = baseRep >= 85 ? 18000000 : baseRep >= 75 ? 8500000 : baseRep >= 65 ? 3200000 : 900000;
                  const currentYear = parseInt(gameSave.currentSeason.slice(0, 4), 10) || 2026;
                  const historic = club.stadium.historicName || club.stadium.name;

                  const offers = [
                    {
                      sponsor: 'Spotify',
                      prefix: 'Spotify',
                      category: 'Streaming & Música Global',
                      years: 4,
                      fee: Math.round(mult * 1.15),
                      bonus: Math.round(mult * 0.25),
                    },
                    {
                      sponsor: 'Fly Emirates',
                      prefix: 'Emirates',
                      category: 'Aerolínea Internacional de Lujo',
                      years: 5,
                      fee: Math.round(mult * 1.35),
                      bonus: Math.round(mult * 0.40),
                    },
                    {
                      sponsor: 'Allianz Seguros',
                      prefix: 'Allianz',
                      category: 'Consorcio Financiero & Seguros',
                      years: 3,
                      fee: Math.round(mult * 1.05),
                      bonus: Math.round(mult * 0.20),
                    },
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {offers.map((off) => {
                        const commercialProposed = `${off.prefix} ${historic}`;
                        const endSeasonStr = `${currentYear + off.years}/${String(currentYear + off.years + 1).slice(2)}`;

                        return (
                          <div
                            key={off.sponsor}
                            className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-amber-300 text-sm font-condensed tracking-wider">
                                  {off.sponsor}
                                </span>
                                <span className="text-[10px] font-mono-num font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                                  {off.years} años
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block font-sans">{off.category}</span>
                              <div className="pt-2">
                                <span className="text-[10px] text-slate-500 block uppercase font-mono-num">Nombre del Estadio propuesto:</span>
                                <span className="text-xs font-black text-slate-100 font-condensed block group-hover:text-amber-200 transition-colors">
                                  "{commercialProposed}"
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-slate-800/80 pt-2 space-y-2">
                              <div className="flex justify-between items-baseline font-mono-num text-xs">
                                <span className="text-slate-400 text-[10px] font-sans">Pago anual:</span>
                                <strong className="text-emerald-400 text-sm">+{off.fee.toLocaleString()} € / año</strong>
                              </div>
                              <div className="flex justify-between items-baseline font-mono-num text-[11px]">
                                <span className="text-slate-500 text-[10px] font-sans">Prima de firma:</span>
                                <strong className="text-amber-400">+{off.bonus.toLocaleString()} € hoy</strong>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  playClickSound();
                                  const updatedClub: Club = {
                                    ...club,
                                    stadium: {
                                      ...club.stadium,
                                      historicName: historic,
                                      commercialName: commercialProposed,
                                      name: commercialProposed,
                                      namingRightsSponsor: {
                                        sponsorName: off.sponsor,
                                        annualFee: off.fee,
                                        signedSeason: gameSave.currentSeason,
                                        endSeason: endSeasonStr,
                                        yearsDuration: off.years,
                                      },
                                    },
                                    finances: {
                                      ...club.finances,
                                      balance: club.finances.balance + off.fee + off.bonus,
                                      recentLedger: [
                                        {
                                          id: `ledger_naming_${Date.now()}`,
                                          date: gameSave.currentDate,
                                          category: 'patrocinio',
                                          description: `Prima de firma + primer año de naming rights: ${commercialProposed}`,
                                          amount: off.fee + off.bonus,
                                        },
                                        ...(club.finances.recentLedger || []).slice(0, 25),
                                      ],
                                    },
                                  };

                                  const news: NewsItem = {
                                    id: `news_naming_sign_${Date.now()}`,
                                    date: gameSave.currentDate,
                                    title: `🏛️ ACUERDO HISTÓRICO: El estadio pasa a llamarse '${commercialProposed}'`,
                                    content: `El club ha firmado un contrato multimillonario de naming rights con ${off.sponsor} por ${off.years} temporadas, ingresando ${off.fee.toLocaleString()} € anuales garantizados más una prima de firma de ${off.bonus.toLocaleString()} €.`,
                                    category: 'DIRECTIVA',
                                    read: false,
                                  };

                                  onUpdateClub(updatedClub, undefined, news);
                                  showNotification(`¡Enhorabuena! Contrato de Naming Rights firmado con ${off.sponsor}. Ingresados ${(off.fee + off.bonus).toLocaleString()} €.`);
                                }}
                                className="w-full pcf-btn pcf-btn-gold py-1.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 mt-2 shadow"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Firmar Naming Rights</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Stadium Upgrades Catalog */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-400" />
                  Catálogo de Reformas y Obras de Infraestructura
                </h3>
                <p className="text-xs text-slate-400">
                  Mejora el confort, el aforo y la rentabilidad del estadio {club.stadium.name} ({club.stadium.capacity.toLocaleString()} esp.)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
              {STADIUM_UPGRADES_CATALOG.map((upg) => {
                const isOngoing = (club.activeStadiumProjects || []).some(
                  (p) => p.title === upg.title || p.type === upg.category
                );
                const canAfford = club.finances.balance >= upg.cost;

                return (
                  <div
                    key={upg.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1 font-mono-num">
                        <span className="text-xs font-bold text-slate-100">
                          {upg.cost.toLocaleString()} €
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {upg.durationWeeks} sem.
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs font-condensed uppercase">
                        {upg.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {upg.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 font-mono-num space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Aforo permanente:</span>
                        <span className="text-emerald-400 font-bold">+{upg.capacityBonus.toLocaleString()} asientos</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Ingreso extra/partido:</span>
                        <span className="text-slate-200">+{upg.revenueBonusPerMatch} €</span>
                      </div>

                      {isOngoing ? (
                        <button
                          disabled
                          className="w-full py-1.5 bg-amber-950/60 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-lg cursor-not-allowed font-sans"
                        >
                          En Construcción ({club.activeStadiumProjects?.find((p) => p.title === upg.title || p.type === upg.category)?.weeksRemaining} sem. rest.)
                        </button>
                      ) : canAfford ? (
                        <button
                          onClick={() => handleStartUpgrade(upg)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors font-sans"
                        >
                          Aprobar e Iniciar Obras (-{upg.cost.toLocaleString()} €)
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-1.5 bg-slate-800/60 text-slate-500 text-xs rounded-lg font-sans cursor-not-allowed"
                        >
                          Presupuesto insuficiente ({upg.cost.toLocaleString()} €)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: CATERING & RESTAURANTE (PC FÚTBOL) */}
      {subTab === 'catering' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                    Hostelería y Restauración del Estadio (Clásico PC Fútbol)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajusta los precios de venta de cada producto. La afluencia y la elasticidad de oferta/demanda determinan las unidades vendidas y el beneficio neto.
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold font-mono-num bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                {club.cateringConfig?.restaurantOpen ? 'Restaurante Abierto' : 'Cerrado'}
              </span>
            </div>

            {/* Menu Items Table with Interactive Price Controls */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-num">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Producto / Carta</th>
                    <th className="py-2.5 px-3">Coste Proveedor</th>
                    <th className="py-2.5 px-3">PVP Venta (Modificable)</th>
                    <th className="py-2.5 px-3">Margen Unitario</th>
                    <th className="py-2.5 px-3">Ventas Estimadas</th>
                    <th className="py-2.5 px-3">Beneficio Neto</th>
                    <th className="py-2.5 px-3">Aceptación Afición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tempCateringItems.map((item, idx) => {
                    const avgAttendance = Math.round(club.stadium.capacity * 0.75);
                    const econ = calculateCateringItemEconomics(item, avgAttendance, club.reputation);
                    const margin = item.salePrice > item.costPrice 
                      ? Math.round(((item.salePrice - item.costPrice) / item.salePrice) * 100) 
                      : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-100 font-sans">
                          {item.name}
                          <span className="text-[10px] text-slate-500 block font-normal">{item.supplier}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{item.costPrice.toFixed(2)} €</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={Math.ceil(item.costPrice)}
                              max="120"
                              step="0.5"
                              value={item.salePrice}
                              onChange={(e) => {
                                const newPrice = Math.max(1, Number(e.target.value));
                                const updated = [...tempCateringItems];
                                updated[idx] = { ...item, salePrice: newPrice };
                                setTempCateringItems(updated);
                              }}
                              className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-center font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-slate-400">€</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          +{margin}% ({(item.salePrice - item.costPrice).toFixed(2)} €)
                        </td>
                        <td className="py-3 px-3 text-amber-400 font-bold">
                          {econ.estimatedUnits.toLocaleString()} uds / partido
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          +{econ.netProfit.toLocaleString()} €
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              econ.customerSatisfaction === 'Óptima'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                : econ.customerSatisfaction === 'Aceptable'
                                ? 'bg-sky-950/80 text-sky-300 border border-sky-500/30'
                                : econ.customerSatisfaction === 'Precios Elevados'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {econ.customerSatisfaction}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total projection banner & Save Button */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono-num">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans tracking-wide block">
                  Proyección Económica Hostelería por Jornada de Local
                </span>
                <span className="text-base font-bold text-emerald-400">
                  Beneficio Neto Estimado: +
                  {tempCateringItems.reduce((sum, it) => {
                    const avgAtt = Math.round(club.stadium.capacity * 0.75);
                    return sum + calculateCateringItemEconomics(it, avgAtt, club.reputation).netProfit;
                  }, 0).toLocaleString()} €
                </span>
              </div>

              <button
                onClick={handleSaveCatering}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow transition-colors font-sans flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Guardar Carta y Precios de Hostelería</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: TAQUILLAS Y ZONAS */}
      {subTab === 'taquillas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                Tarificación y Precios de Entrada por Zonas
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-num">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase text-[10px] block">Entrada Tribuna Central</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-400">{tempZonePricing.tribunaPrice} €</span>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={tempZonePricing.tribunaPrice}
                  onChange={(e) => setTempZonePricing({ ...tempZonePricing, tribunaPrice: Number(e.target.value) })}
                  className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center text-white"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase text-[10px] block">Entrada Grada Lateral</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-400">{tempZonePricing.lateralPrice} €</span>
                <input
                  type="number"
                  min="8"
                  max="90"
                  value={tempZonePricing.lateralPrice}
                  onChange={(e) => setTempZonePricing({ ...tempZonePricing, lateralPrice: Number(e.target.value) })}
                  className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center text-white"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase text-[10px] block">Entrada Fondos Norte / Sur</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-400">{tempZonePricing.fondosPrice} €</span>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={tempZonePricing.fondosPrice}
                  onChange={(e) => setTempZonePricing({ ...tempZonePricing, fondosPrice: Number(e.target.value) })}
                  className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center text-white"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase text-[10px] block">Localidad Palco VIP</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-amber-400">{tempZonePricing.vipPrice} €</span>
                <input
                  type="number"
                  min="25"
                  max="250"
                  value={tempZonePricing.vipPrice}
                  onChange={(e) => setTempZonePricing({ ...tempZonePricing, vipPrice: Number(e.target.value) })}
                  className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center text-white"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveZonePricing}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors font-sans"
          >
            Guardar y Aplicar Tarifas Oficiales
          </button>
        </div>
      )}

      {/* SUBTAB 7: TIENDA Y MERCHANDISING */}
      {subTab === 'tienda' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                  Tienda Oficial y Catálogo de Merchandising
                </h3>
                <p className="text-xs text-slate-400">
                  Modifica los precios del merchandising oficial del club. La demanda de los aficionados responde dinámicamente a la política de precios fijada.
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono-num bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              Nivel de Marketing: {club.merchandisingStore?.marketingLevel || 2} / 5
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
            {tempMerchItems.map((it, idx) => {
              const econ = calculateMerchandisingItemEconomics(it, club.reputation);
              const margin = it.salePrice > it.costPrice 
                ? Math.round(((it.salePrice - it.costPrice) / it.salePrice) * 100) 
                : 0;

              return (
                <div key={it.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center font-mono-num mb-1">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-sans uppercase font-bold">
                        {it.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Stock: {it.stock} uds
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs font-condensed uppercase">{it.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{it.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 font-mono-num space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs font-sans">PVP de Venta:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={Math.ceil(it.costPrice)}
                          max="250"
                          step="1"
                          value={it.salePrice}
                          onChange={(e) => {
                            const newPrice = Math.max(1, Number(e.target.value));
                            const updated = [...tempMerchItems];
                            updated[idx] = { ...it, salePrice: newPrice };
                            setTempMerchItems(updated);
                          }}
                          className="w-18 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center font-bold text-emerald-400 text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-slate-400">€</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Coste de producción:</span>
                      <span>{it.costPrice.toFixed(2)} € (Margen: +{margin}%)</span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Demanda Semanal:</span>
                      <span className="text-amber-400 font-bold">{econ.weeklyUnitsSold} unidades</span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Beneficio Neto / sem:</span>
                      <span className="text-emerald-400 font-bold">+{econ.weeklyProfit.toLocaleString()} €</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 font-sans">Aceptación:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          econ.customerSatisfaction === 'Excelente'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : econ.customerSatisfaction === 'Normal'
                            ? 'bg-sky-950 text-sky-300 border border-sky-500/30'
                            : econ.customerSatisfaction === 'Precio Caro'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {econ.customerSatisfaction}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tienda Summary Banner & Save Button */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono-num">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-sans tracking-wide block">
                Proyección Tienda Oficial y Merchandising
              </span>
              <span className="text-base font-bold text-emerald-400">
                Beneficio Neto Semanal Previsto: +
                {tempMerchItems.reduce((sum, it) => {
                  return sum + calculateMerchandisingItemEconomics(it, club.reputation).weeklyProfit;
                }, 0).toLocaleString()} €
              </span>
            </div>

            <button
              onClick={handleSaveMerchandising}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow transition-colors font-sans flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar Precios de Tienda Oficial</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 8: PRENSA Y DIRECTIVA */}
      {subTab === 'prensa' && (
        <div className="space-y-6 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                  Gabinete de Comunicación y Ruedas de Prensa
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Presidente: {club.boardGovernance?.presidentName || 'Josep Maria Vidal'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-sky-400">Pregunta de los Medios (Diari de Santa Coloma)</span>
                <p className="font-medium text-slate-200">
                  «Míster, la afición está pendiente del balance económico y de si las inversiones en plantilla comprometen el futuro del club. ¿Cuál es su mensaje institucional?»
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      showNotification('Respuesta prudente emitida: La directiva valora tu mesura.');
                    }}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-left text-slate-300 text-xs transition-colors"
                  >
                    «El rigor presupuestario es innegociable. No gastaremos lo que el club no genere.»
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      showNotification('Respuesta ambiciosa emitida: Sube la ilusión de la afición.');
                    }}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-left text-slate-300 text-xs transition-colors"
                  >
                    «Para crecer hay que invertir con valentía. Este proyecto aspira a lo más alto.»
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      showNotification('Respuesta centrada en lo deportivo emitida.');
                    }}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-left text-slate-300 text-xs transition-colors"
                  >
                    «Mi labor está en el césped y en el vestuario; la junta directiva gestiona los números.»
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
