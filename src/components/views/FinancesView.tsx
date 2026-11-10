import React, { useState, useMemo } from 'react';
import { Club } from '../../types/club';
import { GameSave, NewsItem } from '../../types/game';
import { playClickSound, playGoalSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Ticket, 
  Building2, 
  CheckCircle2,
  Tv,
  Award,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Shield,
  Zap,
  Globe2,
  Star,
  FileCheck,
  Trophy
} from 'lucide-react';

interface FinancesViewProps {
  gameSave: GameSave;
  onUpdateTicketPrice: (newPrice: number) => void;
  onUpdateClub?: (updatedClub: Club) => Promise<void> | void;
}

export type FinanceSubTab = 'resumen' | 'television' | 'patrocinios' | 'tienda_restaurante';

export const FinancesView: React.FC<FinancesViewProps> = ({
  gameSave,
  onUpdateTicketPrice,
  onUpdateClub,
}) => {
  const club = gameSave.clubs[gameSave.userClubId];
  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('resumen');
  const [ticketPrice, setTicketPrice] = useState<number>(club.stadium.ticketPrice);
  const [savedNotice, setSavedNotice] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Commercial & restaurant prices
  const [menuPrice, setMenuPrice] = useState<number>(club.cateringConfig?.restaurantMenuPrice || 16);
  const initialJerseyItem = club.merchandisingStore?.items?.find((i) => i.category === 'camisetas');
  const initialScarfItem = club.merchandisingStore?.items?.find((i) => i.category === 'bufandas');
  const [jerseyPrice, setJerseyPrice] = useState<number>(initialJerseyItem?.salePrice || 75);
  const [scarfPrice, setScarfPrice] = useState<number>(initialScarfItem?.salePrice || 18);

  // Calculate dynamic league prestige & sporting multipliers
  const divisionId = club.divisionId || 'esp_tier2';
  const isTier1 = divisionId.includes('tier1') || divisionId.includes('primera_division');
  const isTier2 = divisionId.includes('tier2') || divisionId.includes('hypermotion') || divisionId.includes('segunda');
  const leaguePrestigeName = isTier1 ? 'LaLiga EA Sports (Máxima Categoría)' : isTier2 ? 'LaLiga Hypermotion (División de Plata)' : 'Primera Federación RFEF (Bronce)';
  const leagueMultiplier = isTier1 ? 4.5 : isTier2 ? 2.2 : 1.0;

  // Sporting success multipliers:
  // Check if club is Copa del Rey Finalist or leader
  const primaryComp = gameSave.competitions[club.divisionId] || Object.values(gameSave.competitions)[0];
  let isLeader = false;
  if (primaryComp && primaryComp.standings) {
    const sorted = [...primaryComp.standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    if (sorted[0]?.teamId === club.id) isLeader = true;
  }

  let isCopaFinalist = false;
  if (gameSave.cupTournaments) {
    Object.values(gameSave.cupTournaments).forEach((tourn) => {
      const finalMatch = tourn.matches?.find((m) => m.roundName?.includes('Gran Final'));
      if (finalMatch && (finalMatch.homeTeamId === club.id || finalMatch.awayTeamId === club.id)) {
        isCopaFinalist = true;
      }
    });
  }

  // Manager/Club ELO & reputation
  const clubRep = club.reputation || 60;
  const sportingScore = (isLeader ? 30 : 15) + (isCopaFinalist ? 35 : 10) + Math.round(clubRep * 0.4);

  // Projected attendance based on ticket price
  const baseFill = 0.55 + (clubRep / 100) * 0.3;
  const priceRatio = Math.max(0.4, Math.min(2.0, 18 / Math.max(10, ticketPrice)));
  const projectedAttendance = Math.min(
    club.stadium.capacity,
    Math.round(club.stadium.capacity * baseFill * priceRatio)
  );
  const payingFans = Math.max(0, projectedAttendance - club.stadium.seasonTicketHolders);
  const projectedRevenuePerMatch = payingFans * ticketPrice;

  // Calculate weekly total wage
  const totalWeeklyWages = club.playerIds.reduce((sum, pid) => {
    const p = gameSave.players[pid];
    return sum + (p?.contract?.wagePerWeek || 0);
  }, 0);

  // Calculate available transfer budget ceiling (80% of total treasury / balance)
  const eightyPercentCeiling = Math.max(0, Math.round(club.finances.balance * 0.8));

  // TV Broadcaster Contract Proposals
  const tvPackages = useMemo(() => {
    const baseAnnual = isTier1 ? 48000000 : isTier2 ? 14000000 : 2500000;
    const bonusMultiplier = 1 + (isLeader ? 0.35 : 0) + (isCopaFinalist ? 0.40 : 0) + (clubRep >= 80 ? 0.25 : 0);

    return [
      {
        id: 'tv_centralizado_rfef',
        name: 'Paquete Oficial Centralizado RFEF / LaLiga',
        broadcaster: 'LaLiga TV Bar & Operador Público',
        type: 'Contrato Oficial Federativo',
        badge: 'Garantía Máxima',
        annualRevenue: Math.round(baseAnnual * 0.85 * bonusMultiplier),
        signingBonus: Math.round(baseAnnual * 0.15 * bonusMultiplier),
        weeklyPayout: Math.round((baseAnnual * 0.85 * bonusMultiplier) / 42),
        durationYears: 3,
        description: 'Reparto oficial centralizado de derechos audiovisuales con primas por mérito deportivo y posición en tabla.',
        targetRequirements: 'Mínimo categoría profesional',
      },
      {
        id: 'tv_streaming_ott',
        name: 'Plataforma Global OTT & Streaming Internacional',
        broadcaster: 'DAZN & Movistar Plus+',
        type: 'Explotación Digital Exclusiva',
        badge: 'Audiencia Digital',
        annualRevenue: Math.round(baseAnnual * 1.05 * bonusMultiplier),
        signingBonus: Math.round(baseAnnual * 0.25 * bonusMultiplier),
        weeklyPayout: Math.round((baseAnnual * 1.05 * bonusMultiplier) / 42),
        durationYears: 2,
        description: 'Emisión en directo de todos los encuentros en resolución 4K con cámaras en el vestuario y microfonía en los banquillos.',
        targetRequirements: 'Interés mediático elevado',
      },
      {
        id: 'tv_primetime_elite',
        name: 'Paquete Prime-Time & Difusión Continental',
        broadcaster: 'Sky Sports & ESPN International',
        type: 'Derechos Globales en el Extranjero',
        badge: 'Expansión Mundial',
        annualRevenue: Math.round(baseAnnual * 1.25 * bonusMultiplier),
        signingBonus: Math.round(baseAnnual * 0.40 * bonusMultiplier),
        weeklyPayout: Math.round((baseAnnual * 1.25 * bonusMultiplier) / 42),
        durationYears: 4,
        description: 'Explotación de derechos para el mercado anglosajón, asiático y latinoamericano, con bonus extraordinarios por rachas ganadoras.',
        targetRequirements: 'Club aspirante o finalista de torneo',
      },
    ];
  }, [isTier1, isTier2, isLeader, isCopaFinalist, clubRep]);

  // Commercial Sponsor Offers
  const sponsorOffers = useMemo(() => {
    const baseSponsorVal = isTier1 ? 16000000 : isTier2 ? 4500000 : 800000;
    const mult = 1 + (isLeader ? 0.4 : 0) + (isCopaFinalist ? 0.5 : 0) + (clubRep >= 80 ? 0.3 : 0);

    return [
      {
        id: 'sp_shirt_main',
        category: 'Patrocinador Principal de Camiseta (Frontal)',
        currentPartner: club.finances.sponsorName || 'Patrocinador Local',
        offers: [
          {
            brand: 'Mahou Cinco Estrellas',
            sector: 'Cervecería & Ocio',
            annualAmount: Math.round(baseSponsorVal * mult),
            signingBonus: Math.round(baseSponsorVal * 0.25 * mult),
            objectiveBonus: '500.000 € por ascenso o título copero',
            duration: '3 temporadas',
          },
          {
            brand: 'Banco Santander',
            sector: 'Banca Internacional',
            annualAmount: Math.round(baseSponsorVal * 1.15 * mult),
            signingBonus: Math.round(baseSponsorVal * 0.35 * mult),
            objectiveBonus: '1.000.000 € por clasificación europea',
            duration: '4 temporadas',
          },
        ],
      },
      {
        id: 'sp_kit_supplier',
        category: 'Proveedor Técnico y Equipaciones Oficiales',
        currentPartner: 'Adidas Fútbol',
        offers: [
          {
            brand: 'Nike Football',
            sector: 'Equipamiento Deportivo Técnico',
            annualAmount: Math.round(baseSponsorVal * 0.7 * mult),
            signingBonus: Math.round(baseSponsorVal * 0.2 * mult),
            objectiveBonus: '15% de comisión en venta de camisetas',
            duration: '4 temporadas',
          },
          {
            brand: 'Puma Football',
            sector: 'Indumentaria Deportiva',
            annualAmount: Math.round(baseSponsorVal * 0.65 * mult),
            signingBonus: Math.round(baseSponsorVal * 0.28 * mult),
            objectiveBonus: '20% de comisión en merchandising',
            duration: '3 temporadas',
          },
        ],
      },
      {
        id: 'sp_stadium_naming',
        category: 'Derechos de Nombre del Estadio (Naming Rights)',
        currentPartner: 'Sin sponsorizar',
        offers: [
          {
            brand: 'Cervezas San Miguel Arena',
            sector: 'Naming de Infraestructuras',
            annualAmount: Math.round(baseSponsorVal * 0.85 * mult),
            signingBonus: Math.round(baseSponsorVal * 0.45 * mult),
            objectiveBonus: 'Financiación de ampliación de aforo',
            duration: '5 temporadas',
          },
        ],
      },
    ];
  }, [isTier1, isTier2, isLeader, isCopaFinalist, clubRep, club.finances.sponsorName]);

  const handleSavePrice = () => {
    playClickSound();
    onUpdateTicketPrice(ticketPrice);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSignTvContract = async (tvPkg: typeof tvPackages[0]) => {
    playGoalSound();
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });

    const newBalance = club.finances.balance + tvPkg.signingBonus;
    const updatedClub: Club = {
      ...club,
      finances: {
        ...club.finances,
        balance: newBalance,
        tvRightsRevenue: tvPkg.annualRevenue,
        recentLedger: [
          {
            id: `tv_sign_${Date.now()}`,
            date: gameSave.currentDate,
            description: `Prima de Firma: Contrato de TV con ${tvPkg.broadcaster}`,
            amount: tvPkg.signingBonus,
            category: 'patrocinio',
          },
          ...club.finances.recentLedger,
        ],
      },
    };

    if (onUpdateClub) {
      await onUpdateClub(updatedClub);
    }
    setActionSuccessNotice(`¡Acuerdo audiovisual firmado con ${tvPkg.broadcaster}! Ingresados +${tvPkg.signingBonus.toLocaleString()} € de prima de firma.`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const handleSignSponsor = async (brand: string, annualAmount: number, signingBonus: number) => {
    playGoalSound();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

    const newBalance = club.finances.balance + signingBonus;
    const updatedClub: Club = {
      ...club,
      finances: {
        ...club.finances,
        balance: newBalance,
        sponsorName: brand,
        sponsorAnnualRevenue: annualAmount,
        recentLedger: [
          {
            id: `sp_sign_${Date.now()}`,
            date: gameSave.currentDate,
            description: `Prima de Firma de Patrocinio Comercial con ${brand}`,
            amount: signingBonus,
            category: 'patrocinio',
          },
          ...club.finances.recentLedger,
        ],
      },
    };

    if (onUpdateClub) {
      await onUpdateClub(updatedClub);
    }
    setActionSuccessNotice(`¡Contrato de patrocinio suscrito con ${brand}! Ingresados +${signingBonus.toLocaleString()} €.`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const handleSaveStorePricing = async () => {
    playClickSound();
    const currentItems = club.merchandisingStore?.items || [
      {
        id: 'm_jersey',
        name: 'Camiseta Oficial 1ª Equipación',
        category: 'camisetas' as const,
        costPrice: 22,
        salePrice: jerseyPrice,
        stock: 500,
        unitsSoldWeekly: 45,
        description: 'Equipación de juego oficial',
      },
      {
        id: 'm_scarf',
        name: 'Bufanda Oficial del Club',
        category: 'bufandas' as const,
        costPrice: 5,
        salePrice: scarfPrice,
        stock: 300,
        unitsSoldWeekly: 35,
        description: 'Bufanda bordada de alta calidad',
      },
    ];

    const updatedItems = currentItems.map((item) => {
      if (item.category === 'camisetas') return { ...item, salePrice: jerseyPrice };
      if (item.category === 'bufandas') return { ...item, salePrice: scarfPrice };
      return item;
    });

    const updatedClub: Club = {
      ...club,
      cateringConfig: club.cateringConfig
        ? { ...club.cateringConfig, restaurantMenuPrice: menuPrice }
        : {
            restaurantOpen: true,
            restaurantMenuPrice: menuPrice,
            restaurantQualityStars: 3,
            concessionsOpen: true,
            items: [],
          },
      merchandisingStore: club.merchandisingStore
        ? { ...club.merchandisingStore, items: updatedItems }
        : {
            marketingLevel: 2,
            weeklyMarketingExpense: 800,
            items: updatedItems,
          },
    };

    if (onUpdateClub) {
      await onUpdateClub(updatedClub);
    }
    setActionSuccessNotice('¡Precios de tienda oficial y restauración actualizados!');
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('resumen');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'resumen'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg border border-emerald-400'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>Resumen y Taquillas</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('television');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'television'
              ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg border border-sky-400'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Tv className="w-4 h-4 text-sky-400" />
          <span>Derechos de Televisión</span>
          <span className="text-[10px] bg-sky-950 px-1.5 py-0.2 rounded border border-sky-400/50 text-sky-300 font-mono-num">
            {leagueMultiplier}x
          </span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('patrocinios');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'patrocinios'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-700 text-white shadow-lg border border-yellow-400'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Patrocinios Comerciales</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubTab('tienda_restaurante');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'tienda_restaurante'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg border border-purple-400'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-purple-400" />
          <span>Tienda y Restauración</span>
        </button>
      </div>

      {/* Global Success Banner */}
      {actionSuccessNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500/70 p-3.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccessNotice}</span>
        </div>
      )}

      {/* Overview Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-num">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Tesorería Actual
          </span>
          <span
            className={`text-2xl font-black ${
              club.finances.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {club.finances.balance.toLocaleString()} €
          </span>
          <span className="text-[11px] text-slate-500 font-sans block mt-1">
            Fondo líquido disponible
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Presupuesto Traspasos
            </span>
            <span className="text-[9px] bg-emerald-950 px-1 py-0.2 rounded text-emerald-300 font-bold border border-emerald-500/30">
              80% Máx
            </span>
          </div>
          <span className="text-2xl font-black text-slate-100">
            {club.finances.transferBudget.toLocaleString()} €
          </span>
          <span className="text-[11px] text-emerald-400 font-sans block mt-1">
            Techo tesorería (80%): {eightyPercentCeiling.toLocaleString()} €
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Masa Salarial Semanal
          </span>
          <span className="text-2xl font-black text-amber-400">
            {totalWeeklyWages.toLocaleString()} €
          </span>
          <span className="text-[11px] text-slate-500 font-sans block mt-1">
            Límite semanal: {club.finances.weeklyWageBudget.toLocaleString()} €
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Ingresos Audiovisuales & Sponsor
          </span>
          <span className="text-xl font-bold text-sky-400 truncate block">
            {((club.finances.tvRightsRevenue || 12000000) + club.finances.sponsorAnnualRevenue).toLocaleString()} €
          </span>
          <span className="text-[11px] text-slate-400 font-sans block mt-1">
            Por temporada regular
          </span>
        </div>
      </div>

      {/* TAB 1: RESUMEN Y TAQUILLAS */}
      {activeSubTab === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket Strategy Simulator */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <Ticket className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wide">
                  Explotación Comercial del Estadio
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">Precio entrada día de partido:</span>
                    <span className="text-base font-bold text-emerald-400 font-mono-num">{ticketPrice} €</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="60"
                    step="1"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono-num">
                    <span>8 € (Popular)</span>
                    <span>30 € (Equilibrado)</span>
                    <span>60 € (Premium)</span>
                  </div>
                </div>

                {/* Simulation projection box */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5 font-mono-num">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">
                    Proyección para partidos como local:
                  </span>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Capacidad Estadio:</span>
                    <span className="text-slate-200">{club.stadium.capacity.toLocaleString()} esp.</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Abonados fijos:</span>
                    <span className="text-slate-200">{club.stadium.seasonTicketHolders.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Asistencia estimada:</span>
                    <span className="text-slate-100 font-bold">{projectedAttendance.toLocaleString()} aficionados</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold font-sans">Ingreso taquilla previsto:</span>
                    <span className="text-emerald-400 font-bold text-sm">+{projectedRevenuePerMatch.toLocaleString()} €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              {savedNotice ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> ¡Tarifa actualizada!
                </span>
              ) : <div />}
              <button
                onClick={handleSavePrice}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
              >
                Aplicar Nuevo Precio
              </button>
            </div>
          </div>

          {/* Financial Ledger (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wide">
                  Libro Mayor de Contabilidad
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono-num">
                Últimas {club.finances.recentLedger.length} operaciones
              </span>
            </div>

            <div className="overflow-y-auto max-h-[360px] space-y-2 pr-1 font-mono-num text-xs">
              {club.finances.recentLedger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-slate-500">{entry.date}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-900 px-1.5 py-0.2 rounded">
                        {entry.category}
                      </span>
                    </div>
                    <p className="text-slate-200 font-sans truncate text-xs">{entry.description}</p>
                  </div>

                  <div
                    className={`text-sm font-bold shrink-0 text-right ${
                      entry.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {entry.amount > 0 ? `+${entry.amount.toLocaleString()} €` : `${entry.amount.toLocaleString()} €`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DERECHOS DE TELEVISIÓN */}
      {activeSubTab === 'television' && (
        <div className="space-y-6">
          {/* Prestige & Success Dashboard */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block font-condensed">
                  AUDITORÍA DE PRESTIGIO & VALOR MEDIÁTICO
                </span>
                <h3 className="text-lg font-black text-white font-condensed uppercase tracking-wide flex items-center gap-2 mt-0.5">
                  <Tv className="w-5 h-5 text-sky-400" />
                  Reparto Audiovisual: {leaguePrestigeName}
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-slate-950/80 border border-slate-700/70 rounded-xl px-3 py-1.5 text-center font-mono-num">
                  <span className="text-[9px] text-slate-400 uppercase block">Multiplicador Liga</span>
                  <span className="text-sm font-black text-sky-400">{leagueMultiplier}x</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-700/70 rounded-xl px-3 py-1.5 text-center font-mono-num">
                  <span className="text-[9px] text-slate-400 uppercase block">Rendimiento Deportivo</span>
                  <span className="text-sm font-black text-emerald-400">+{sportingScore}%</span>
                </div>
              </div>
            </div>

            {/* Contextual sporting indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-condensed">
              <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                isLeader ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}>
                <Star className={`w-5 h-5 ${isLeader ? 'text-amber-400' : 'text-slate-600'}`} />
                <div>
                  <span className="font-bold block uppercase tracking-wide">
                    {isLeader ? 'Líder Destacado de la Categoría' : 'Posición en Tabla Regular'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {isLeader ? '+35% Prima por Audiencia y Mérito' : 'Reparto base proporcional'}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                isCopaFinalist ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}>
                <Trophy className={`w-5 h-5 ${isCopaFinalist ? 'text-amber-400' : 'text-slate-600'}`} />
                <div>
                  <span className="font-bold block uppercase tracking-wide">
                    {isCopaFinalist ? 'Finalista de Copa del Rey' : 'Participación en Copas'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {isCopaFinalist ? '+40% Cuota de Prime-Time Nacional' : 'Retransmisión estándar'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center gap-3 text-slate-300">
                <Zap className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="font-bold block uppercase tracking-wide font-mono-num">
                    Reputación del Club: {clubRep}/100
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Interés comercial de operadores globales
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Negotiable TV Packages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tvPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-400/30 uppercase tracking-wider font-condensed">
                      {pkg.badge}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-num">
                      {pkg.durationYears} temporadas
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white font-condensed uppercase tracking-wide">
                    {pkg.name}
                  </h4>
                  <span className="text-xs font-semibold text-slate-300 block mb-3">
                    Operador: {pkg.broadcaster}
                  </span>

                  <p className="text-[11px] text-slate-400 font-sans mb-4 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl font-mono-num text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ingreso Anual:</span>
                      <span className="text-sky-400 font-black">+{pkg.annualRevenue.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pago Semanal:</span>
                      <span className="text-slate-200">+{pkg.weeklyPayout.toLocaleString()} € /sem.</span>
                    </div>
                    <div className="border-t border-slate-800 pt-1.5 flex justify-between">
                      <span className="text-emerald-400 font-bold">Prima Inmediata:</span>
                      <span className="text-emerald-400 font-black">+{pkg.signingBonus.toLocaleString()} €</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSignTvContract(pkg)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-lg text-xs font-black uppercase font-condensed tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Firmar Contrato Televisivo</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PATROCINIOS COMERCIALES */}
      {activeSubTab === 'patrocinios' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wide">
                  Gestión de Alianzas y Patrocinios Oficiales
                </h3>
              </div>
              <span className="text-xs text-amber-400 font-bold font-mono-num">
                Patrocinador Actual: {club.finances.sponsorName || 'Sin sponsor'}
              </span>
            </div>

            <div className="space-y-6">
              {sponsorOffers.map((slot) => (
                <div key={slot.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
                    <span className="text-xs font-black text-amber-300 font-condensed uppercase tracking-wider">
                      {slot.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Vigente: <strong className="text-slate-200">{slot.currentPartner}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {slot.offers.map((offer, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/90 border border-slate-700/60 hover:border-amber-400/60 rounded-xl p-4 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-black text-white font-condensed uppercase">
                              {offer.brand}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono-num">
                              {offer.duration}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mb-2.5">
                            Sector: {offer.sector}
                          </span>

                          <div className="space-y-1.5 font-mono-num text-xs mb-3">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Aportación Anual:</span>
                              <span className="text-amber-400 font-black">+{offer.annualAmount.toLocaleString()} €</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-400 font-medium">Prima de Firma:</span>
                              <span className="text-emerald-400 font-bold">+{offer.signingBonus.toLocaleString()} €</span>
                            </div>
                            <div className="text-[10px] text-slate-400 italic mt-1 font-sans">
                              Cláusula: {offer.objectiveBonus}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSignSponsor(offer.brand, offer.annualAmount, offer.signingBonus)}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-lg text-xs font-condensed uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          Scribir Acuerdo con {offer.brand}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIENDA Y RESTAURACIÓN */}
      {activeSubTab === 'tienda_restaurante' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <UtensilsCrossed className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wide">
                Restauración del Estadio y Hospitality
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <div className="flex justify-between mb-1.5 font-mono-num">
                  <span className="text-slate-300 font-medium">Precio Menú Restaurante / Bocadillo:</span>
                  <span className="text-purple-400 font-bold text-sm">{menuPrice} €</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="40"
                  step="1"
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono-num mt-1">
                  <span>6 € (Económico)</span>
                  <span>18 € (Estándar)</span>
                  <span>40 € (Gourmet VIP)</span>
                </div>
              </div>

              {/* Elasticity box */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs font-mono-num">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block font-sans">
                  Elasticidad oferta y demanda (Restauración):
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Demanda estimada:</span>
                  <span className="text-slate-200">
                    {Math.round(projectedAttendance * Math.max(0.2, 0.6 - (menuPrice / 40) * 0.35)).toLocaleString()} raciones / partido
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-purple-300 font-semibold font-sans">Margen neto previsto:</span>
                  <span className="text-emerald-400 font-bold">
                    +{Math.round(projectedAttendance * Math.max(0.2, 0.6 - (menuPrice / 40) * 0.35) * (menuPrice * 0.55)).toLocaleString()} € / partido
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wide">
                Tienda Oficial y Merchandising
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <div className="flex justify-between mb-1.5 font-mono-num">
                  <span className="text-slate-300 font-medium">Camiseta Oficial 1ª Equipación:</span>
                  <span className="text-indigo-400 font-bold text-sm">{jerseyPrice} €</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="140"
                  step="5"
                  value={jerseyPrice}
                  onChange={(e) => setJerseyPrice(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-mono-num">
                  <span className="text-slate-300 font-medium">Bufanda y Souvenirs del Club:</span>
                  <span className="text-indigo-400 font-bold text-sm">{scarfPrice} €</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="35"
                  step="1"
                  value={scarfPrice}
                  onChange={(e) => setScarfPrice(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs font-mono-num">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block font-sans">
                  Rendimiento Comercial Anual Estimado:
                </span>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-indigo-300 font-semibold font-sans">Facturación Anual Tienda:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    +{Math.round(clubRep * 28000 * Math.max(0.5, 1.3 - (jerseyPrice / 140) * 0.6)).toLocaleString()} €
                  </span>
                </div>
              </div>

              <button
                onClick={handleSaveStorePricing}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black rounded-lg text-xs font-condensed uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Guardar Precios de Tienda y Restauración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
