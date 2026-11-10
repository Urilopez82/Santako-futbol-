import React, { useState } from 'react';
import { GameSave, NewsItem } from '../../types/game';
import { 
  VehicleItem, 
  RealEstateItem, 
  AircraftItem, 
  ClubFoundationData,
  CrimeType
} from '../../types/privateLife';
import { 
  ensurePrivateLifeState, 
  buyVehicle, 
  buyRealEstate, 
  foundOwnClub, 
  VEHICLES_CATALOG, 
  REAL_ESTATE_CATALOG,
  AIRCRAFT_CATALOG,
  buyPrivateAircraft,
  buyClubOfficialAircraft,
  serviceAircraft,
  obtainPilotLicense,
  toggleClubOfficialPilot,
  hireProPilot,
  executeHackingOperation,
  hireSicarioContract,
  bribeRefereeForMatch,
  executeSabotageAttack,
  serveTwentyYearsPrisonSentence
} from '../../engine/privateLifeEngine';
import { FlightSimulatorModal } from '../aviation/FlightSimulatorModal';
import { HackingTerminalModal } from '../criminal/HackingTerminalModal';
import { playClickSound, playGoalSound } from '../../utils/audio';
import { 
  Wallet, 
  Car, 
  Home, 
  Plane,
  Skull,
  Building2, 
  Sparkles, 
  Trophy, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  ShieldAlert,
  Terminal,
  Crosshair,
  UserX,
  Wrench,
  Award,
  Zap,
  Gauge,
  Wind
} from 'lucide-react';

interface PrivateLifeViewProps {
  gameSave: GameSave;
  onUpdateSave: (newSave: GameSave) => void;
}

export const PrivateLifeView: React.FC<PrivateLifeViewProps> = ({
  gameSave,
  onUpdateSave,
}) => {
  const currentSave = ensurePrivateLifeState(gameSave);
  const pl = currentSave.privateLife!;
  const userClub = currentSave.clubs[currentSave.userClubId];

  const [activeSubTab, setActiveSubTab] = useState<'banco' | 'vehiculos' | 'inmuebles' | 'aviacion' | 'mundo_criminal' | 'fundar_club'>('banco');
  const [feedbackNotice, setFeedbackNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  // Aviation catalog purchase mode: Personal wealth vs Club Treasury
  const [aircraftPurchaseMode, setAircraftPurchaseMode] = useState<'PERSONAL' | 'CLUB'>('PERSONAL');
  const [activeFlightModal, setActiveFlightModal] = useState<AircraftItem | null>(null);

  // Criminal operations state
  const [isHackingModalOpen, setIsHackingModalOpen] = useState<boolean>(false);
  const [selectedTargetClubId, setSelectedTargetClubId] = useState<string>('');
  const [selectedSabotageType, setSelectedSabotageType] = useState<'CESPED' | 'TORRETAS' | 'ESTRUCTURAL'>('CESPED');
  const [extinctionModalNews, setExtinctionModalNews] = useState<NewsItem | null>(null);

  // Club foundation form state
  const [clubName, setClubName] = useState<string>('Atlético Santako F.C.');
  const [shortName, setShortName] = useState<string>('Santako');
  const [city, setCity] = useState<string>('Santa Coloma');
  const [stadiumName, setStadiumName] = useState<string>('Estadio Can Peixauet');
  const [stadiumCapacity, setStadiumCapacity] = useState<number>(4500);
  const [primaryColor, setPrimaryColor] = useState<string>('#0284c7');
  const [secondaryColor, setSecondaryColor] = useState<string>('#ffffff');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [badgeSymbol, setBadgeSymbol] = useState<string>('⚡');

  const foundationCost = 4500000;

  // Other clubs for rival targets
  const otherClubs = Object.values(currentSave.clubs || {}).filter(
    (c) => c && c.id !== currentSave.userClubId && !c.isDefunctBankrupt
  );

  const notify = (text: string, isError = false) => {
    setFeedbackNotice({ text, isError });
    setTimeout(() => setFeedbackNotice(null), 4500);
  };

  // -------------------------------------------------------------------------
  // VEHICLES & PROPERTIES HANDLERS
  // -------------------------------------------------------------------------
  const handleBuyVehicle = (veh: VehicleItem) => {
    playClickSound();
    const result = buyVehicle(currentSave, veh);
    if (result.success) {
      playGoalSound();
      onUpdateSave(result.updatedSave);
      notify(result.message);
    } else {
      notify(result.message, true);
    }
  };

  const handleBuyProperty = (prop: RealEstateItem) => {
    playClickSound();
    const result = buyRealEstate(currentSave, prop);
    if (result.success) {
      playGoalSound();
      onUpdateSave(result.updatedSave);
      notify(result.message);
    } else {
      notify(result.message, true);
    }
  };

  // -------------------------------------------------------------------------
  // AVIATION HANDLERS
  // -------------------------------------------------------------------------
  const handleBuyAircraft = (aircraft: AircraftItem) => {
    playClickSound();
    if (aircraftPurchaseMode === 'PERSONAL') {
      const res = buyPrivateAircraft(currentSave, aircraft);
      if (res.success) {
        playGoalSound();
        onUpdateSave(res.updatedSave);
        notify(res.message);
      } else {
        notify(res.message, true);
      }
    } else {
      const res = buyClubOfficialAircraft(currentSave, aircraft);
      if (res.success) {
        playGoalSound();
        onUpdateSave(res.updatedSave);
        notify(res.message);
      } else {
        notify(res.message, true);
      }
    }
  };

  const handleServiceAircraft = (aircraftId: string, isClub: boolean) => {
    playClickSound();
    const res = serviceAircraft(currentSave, aircraftId, isClub);
    if (res.success) {
      onUpdateSave(res.updatedSave);
      notify(res.message);
    } else {
      notify(res.message, true);
    }
  };

  const handleObtainLicense = () => {
    playClickSound();
    const res = obtainPilotLicense(currentSave);
    if (res.success) {
      playGoalSound();
      onUpdateSave(res.updatedSave);
      notify(res.message);
    } else {
      notify(res.message, true);
    }
  };

  const handleTogglePilot = (active: boolean) => {
    playClickSound();
    const res = toggleClubOfficialPilot(currentSave, active);
    if (res.success) {
      onUpdateSave(res.updatedSave);
      notify(res.message);
    } else {
      notify(res.message, true);
    }
  };

  const handleHireProPilot = () => {
    playClickSound();
    const res = hireProPilot(currentSave);
    if (res.success) {
      onUpdateSave(res.updatedSave);
      notify(res.message);
    }
  };

  // -------------------------------------------------------------------------
  // CRIMINAL OPERATIONS HANDLERS
  // -------------------------------------------------------------------------
  const handleCompleteHacking = (success: boolean) => {
    setIsHackingModalOpen(false);
    const targetId = selectedTargetClubId || otherClubs[0]?.id;
    if (!targetId) return;

    const res = executeHackingOperation(currentSave, targetId, success);
    onUpdateSave(res.updatedSave);
    notify(res.message, !res.success);
  };

  const handleExecuteSicario = () => {
    playClickSound();
    const targetId = selectedTargetClubId || otherClubs[0]?.id;
    if (!targetId) {
      notify('Selecciona primero un club rival objetivo.', true);
      return;
    }

    const res = hireSicarioContract(currentSave, targetId);
    if (res.success) {
      onUpdateSave(res.updatedSave);
      notify(res.message);
    } else {
      notify(res.message, true);
    }
  };

  const handleExecuteBribe = () => {
    playClickSound();
    const targetId = selectedTargetClubId || otherClubs[0]?.id;
    if (!targetId) {
      notify('Selecciona primero el club rival de la próxima jornada.', true);
      return;
    }

    const res = bribeRefereeForMatch(currentSave, targetId, 85000);
    if (res.success) {
      onUpdateSave(res.updatedSave);
      notify(res.message);
    } else {
      notify(res.message, true);
    }
  };

  const handleExecuteSabotage = () => {
    playClickSound();
    const targetId = selectedTargetClubId || otherClubs[0]?.id;
    if (!targetId) {
      notify('Selecciona un club rival objetivo para el sabotaje.', true);
      return;
    }

    const res = executeSabotageAttack(currentSave, targetId, selectedSabotageType);
    if (res.success) {
      onUpdateSave(res.updatedSave);
      notify(res.message);
      if (res.clubExtinct) {
        const latestNews = res.updatedSave.news[0];
        if (latestNews) setExtinctionModalNews(latestNews);
      }
    } else {
      notify(res.message, true);
    }
  };

  const handleTriggerPrisonDirect = () => {
    playClickSound();
    const res = serveTwentyYearsPrisonSentence(currentSave);
    onUpdateSave(res.updatedSave);
    notify(res.message);
  };

  // -------------------------------------------------------------------------
  // CLUB FOUNDATION HANDLER
  // -------------------------------------------------------------------------
  const handleFoundClub = () => {
    playClickSound();
    const foundationData: ClubFoundationData = {
      clubName,
      shortName,
      city,
      countryId: 'ESP',
      stadiumName,
      stadiumCapacity,
      primaryColor,
      secondaryColor,
      textColor,
      badgeSymbol,
      initialTransferBudget: 1500000,
      costTotal: foundationCost,
    };

    const result = foundOwnClub(currentSave, foundationData);
    if (result.success) {
      playGoalSound();
      onUpdateSave(result.updatedSave);
      notify(result.message);
    } else {
      notify(result.message, true);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* PERSONAL WEALTH & AVIATION HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 opacity-10 pointer-events-none">
          <Wallet className="w-64 h-64 text-amber-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PATRIMONIO PRIVADO DEL ENTRENADOR
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentSave.manager.firstName} {currentSave.manager.lastName}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-condensed tracking-wider uppercase text-white mt-0.5">
                Vida Privada, Aviación & Poder
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Gestión de fortuna personal, compra de aeronaves privadas y oficiales, licencia de piloto y operaciones en el submundo
              </p>
            </div>
          </div>

          <div className="bg-slate-950/90 px-5 py-3 rounded-xl border border-amber-500/40 shrink-0 text-right shadow-xl">
            <span className="text-[10px] text-slate-400 block uppercase font-condensed">Saldo Bancario Personal</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {pl.personalBankBalance.toLocaleString()} €
            </span>
            {userClub && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Tesorería Club ({userClub.shortName}): <b className="text-emerald-400">{(userClub.finances?.balance || 0).toLocaleString()} €</b>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* POLICE WANTED STARS HUD (0 TO 12 STARS) */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
        (pl.criminal?.wantedStars || 0) >= 8
          ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
          : (pl.criminal?.wantedStars || 0) >= 4
          ? 'bg-amber-950/70 border-amber-500 text-amber-200'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          <ShieldAlert className={`w-6 h-6 ${(pl.criminal?.wantedStars || 0) >= 8 ? 'text-red-400' : 'text-amber-400'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase font-condensed tracking-wider text-white">
                NIVEL DE BÚSQUEDA POLICIAL INTERPOL / UDEF
              </span>
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-amber-300">
                {pl.criminal?.wantedStars || 0} / 12 ESTRELLAS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {(pl.criminal?.wantedStars || 0) >= 12
                ? '¡DETENCIÓN POLICIAL INMINENTE! Juicio sumarísimo y condena a 20 años de prisión.'
                : (pl.criminal?.wantedStars || 0) >= 8
                ? 'Búsqueda prioritaria internacional. Escuchas telefónicas y riesgo extremo de arresto.'
                : (pl.criminal?.wantedStars || 0) >= 4
                ? 'Investigación abierta por fiscalía anticorrupción. Movimientos bajo vigilancia.'
                : 'Sin antecedentes activos. Conducta ciudadana impecable.'}
            </p>
          </div>
        </div>

        {/* 12 Stars Badge Display */}
        <div className="flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-center">
          {Array.from({ length: 12 }).map((_, idx) => {
            const isLit = idx < (pl.criminal?.wantedStars || 0);
            return (
              <span
                key={idx}
                className={`text-sm sm:text-base ${
                  isLit ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]' : 'text-slate-700 opacity-40'
                }`}
              >
                ★
              </span>
            );
          })}
        </div>
      </div>

      {/* PRISON RELEASE BANNER IF RECENTLY FREED */}
      {pl.criminal?.prisonReleaseNews && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500 p-4 rounded-xl text-emerald-200 text-xs sm:text-sm space-y-1 shadow-2xl">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-emerald-300">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Regreso a la Libertad tras 20 años de condena penal</span>
          </div>
          <p className="text-slate-300">{pl.criminal.prisonReleaseNews}</p>
        </div>
      )}

      {feedbackNotice && (
        <div className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold font-condensed uppercase tracking-wider flex items-center gap-2 shadow-xl animate-in slide-in-from-top ${
          feedbackNotice.isError 
            ? 'bg-rose-950/90 border border-rose-500 text-rose-200' 
            : 'bg-emerald-950/90 border border-emerald-500 text-emerald-200'
        }`}>
          {feedbackNotice.isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{feedbackNotice.text}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'banco', label: 'Cuenta & Finanzas', icon: Wallet },
          { id: 'vehiculos', label: 'Garaje & Coches', icon: Car },
          { id: 'inmuebles', label: 'Inmobiliaria & Mansiones', icon: Home },
          { id: 'aviacion', label: 'Aviación & Flota Aérea', icon: Plane },
          { id: 'mundo_criminal', label: 'Mundo Criminal & Poder', icon: Skull },
          { id: 'fundar_club', label: 'Fundar Propio Club', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveSubTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase font-condensed tracking-wider transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-[1.02]'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB: BANCO Y FINANZAS */}
      {activeSubTab === 'banco' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-black font-condensed uppercase tracking-wider text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Resumen Económico de Carrera</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Ingresos Históricos:</span>
                  <span className="text-emerald-400 font-bold">{pl.totalEarningsCareer.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Gastos & Compras:</span>
                  <span className="text-rose-400 font-bold">{pl.totalExpensesCareer.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Vehículos en Propiedad:</span>
                  <span className="text-white font-bold">{pl.ownedVehicles.length}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Inmuebles Adquiridos:</span>
                  <span className="text-white font-bold">{pl.ownedProperties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aeronaves Personales:</span>
                  <span className="text-cyan-400 font-bold">{(pl.ownedAircraft || []).length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-black font-condensed uppercase tracking-wider text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Libro Mayor de Transacciones Personales</span>
              </h3>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {pl.transactionsHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white font-condensed">{tx.concept}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{tx.date} · {tx.type}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: VEHICULOS */}
      {activeSubTab === 'vehiculos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VEHICLES_CATALOG.map((veh) => {
              const isOwned = pl.ownedVehicles.some((v) => v.id === veh.id);
              const canAfford = pl.personalBankBalance >= veh.price;
              return (
                <div
                  key={veh.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{veh.imageBadge}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {veh.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-black font-condensed uppercase tracking-wider text-white">
                        {veh.brand} {veh.model}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">{veh.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                      <div><span className="text-slate-500">Potencia:</span> <b className="text-white">{veh.powerHP} CV</b></div>
                      <div><span className="text-slate-500">Vel. Máx:</span> <b className="text-white">{veh.topSpeed} km/h</b></div>
                      <div className="col-span-2"><span className="text-slate-500">Mantenimiento:</span> <b className="text-slate-300">{veh.maintenanceAnnual.toLocaleString()} €/año</b></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-condensed">Precio</span>
                      <span className="text-base font-black text-amber-400 font-mono">{veh.price.toLocaleString()} €</span>
                    </div>
                    {isOwned ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold font-condensed uppercase">
                        En Garaje ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyVehicle(veh)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase font-condensed tracking-wider transition-all ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:scale-105'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Comprar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB: INMUEBLES */}
      {activeSubTab === 'inmuebles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REAL_ESTATE_CATALOG.map((prop) => {
            const isOwned = pl.ownedProperties.some((p) => p.id === prop.id);
            const canAfford = pl.personalBankBalance >= prop.price;
            return (
              <div
                key={prop.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{prop.imageBadge}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {prop.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-black font-condensed uppercase tracking-wider text-white">
                      {prop.title}
                    </h4>
                    <p className="text-xs text-amber-400/90 font-mono">{prop.city}, {prop.country}</p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{prop.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                    <div><span className="text-slate-500">Superficie:</span> <b className="text-white">{prop.squareMeters} m²</b></div>
                    <div><span className="text-slate-500">Dormitorios:</span> <b className="text-white">{prop.bedrooms} hab.</b></div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Campo Privado:</span> <b className={prop.hasPrivatePitch ? 'text-emerald-400' : 'text-slate-400'}>{prop.hasPrivatePitch ? 'Hierba Natural Reglamentaria ✓' : 'No'}</b>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-condensed">Precio</span>
                    <span className="text-base font-black text-amber-400 font-mono">{prop.price.toLocaleString()} €</span>
                  </div>
                  {isOwned ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold font-condensed uppercase">
                      Adquirido ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyProperty(prop)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase font-condensed tracking-wider transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:scale-105'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB: AVIACIÓN Y AERONAVES */}
      {activeSubTab === 'aviacion' && (
        <div className="space-y-6">
          {/* Pilot License & Flight School Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase font-condensed text-blue-300">
                    LICENCIA DE PILOTO DEL ENTRENADOR
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    pl.pilotLicense?.hasLicense 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {pl.pilotLicense?.hasLicense ? 'PILOTO OFICIAL HABILITADO' : 'SIN LICENCIA'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {pl.pilotLicense?.hasLicense
                    ? `Horas de vuelo registradas: ${pl.pilotLicense.totalFlightHours || 50} h. ${pl.pilotLicense.isClubOfficialPilot ? '✈️ Eres el Piloto Oficial del equipo en los desplazamientos.' : 'Piloto en reserva.'}`
                    : 'Realiza el curso de aviación para pilotar personalmente el avión de la plantilla en los partidos fuera de casa.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!pl.pilotLicense?.hasLicense ? (
                <button
                  onClick={handleObtainLicense}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase font-condensed tracking-wider shadow-lg hover:scale-105 transition-transform"
                >
                  Obtener Licencia de Piloto (35.000 €)
                </button>
              ) : (
                <button
                  onClick={() => handleTogglePilot(!pl.pilotLicense.isClubOfficialPilot)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase font-condensed tracking-wider shadow-md transition-all ${
                    pl.pilotLicense.isClubOfficialPilot
                      ? 'bg-emerald-600 text-slate-950 hover:bg-emerald-500'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {pl.pilotLicense.isClubOfficialPilot ? 'Piloto Oficial del Equipo: ACTIVO ✓' : 'Designarme Piloto Oficial'}
                </button>
              )}

              <button
                onClick={handleHireProPilot}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold font-condensed uppercase tracking-wider"
              >
                {pl.pilotLicense?.hasHiredProPilot ? 'Piloto Pro Contratado ✓' : 'Contratar Comandante Pro (8.500 €/m)'}
              </button>
            </div>
          </div>

          {/* Hangar & Current Fleet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-black font-condensed uppercase tracking-wider text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-amber-400" />
              <span>Hangar y Flota Aérea Activa</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Club Official Plane Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase font-condensed">
                    Avión Oficial del Club ({userClub?.shortName || 'Club'})
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    CLUB
                  </span>
                </div>
                {userClub?.officialAircraft ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{userClub.officialAircraft.imageBadge}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{userClub.officialAircraft.model}</h4>
                        <p className="text-xs text-slate-400">Capacidad: {userClub.officialAircraft.passengerCapacity} plazas · {userClub.officialAircraft.speedKmh} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Estado Mecánico: <b className="text-emerald-400">{userClub.officialAircraft.mechanicalCondition}%</b></span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleServiceAircraft(userClub.officialAircraft!.id, true)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-white rounded font-mono"
                        >
                          Revisión (25.000 €)
                        </button>
                        <button
                          onClick={() => setActiveFlightModal(userClub.officialAircraft!)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[10px] text-slate-950 font-bold uppercase rounded font-condensed"
                        >
                          Simular Vuelo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-3">
                    El club no dispone de avión oficial en propiedad. Compra uno a continuación utilizando la tesorería del club.
                  </p>
                )}
              </div>

              {/* Personal Jet Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase font-condensed">
                    Aeronave Privada del Entrenador
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    PERSONAL
                  </span>
                </div>
                {(pl.ownedAircraft || []).length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{pl.ownedAircraft[0].imageBadge}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{pl.ownedAircraft[0].model}</h4>
                        <p className="text-xs text-slate-400">Capacidad: {pl.ownedAircraft[0].passengerCapacity} pax · Alcance: {pl.ownedAircraft[0].rangeKm} km</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Estado Mecánico: <b className="text-emerald-400">{pl.ownedAircraft[0].mechanicalCondition}%</b></span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleServiceAircraft(pl.ownedAircraft[0].id, false)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-white rounded font-mono"
                        >
                          Revisión (25.000 €)
                        </button>
                        <button
                          onClick={() => setActiveFlightModal(pl.ownedAircraft[0])}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-[10px] text-slate-950 font-bold uppercase rounded font-condensed"
                        >
                          Simular Vuelo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-3">
                    No posees ningún avión privado personal. Cómpralo con tu patrimonio en el catálogo.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Aircraft Purchase Mode Selector */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white uppercase font-condensed block">
                Modo de Compra de Aeronave:
              </span>
              <p className="text-[11px] text-slate-400">
                {aircraftPurchaseMode === 'PERSONAL' 
                  ? 'Se abona con tu saldo bancario personal y pasa a tu hangar privado.' 
                  : 'Se abona con la tesorería del club y se convierte en el Avión Oficial del equipo.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAircraftPurchaseMode('PERSONAL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-condensed uppercase tracking-wider transition-all ${
                  aircraftPurchaseMode === 'PERSONAL'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Para Mí (Dinero Personal)
              </button>
              <button
                onClick={() => setAircraftPurchaseMode('CLUB')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-condensed uppercase tracking-wider transition-all ${
                  aircraftPurchaseMode === 'CLUB'
                    ? 'bg-emerald-600 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Para el Club (Tesorería)
              </button>
            </div>
          </div>

          {/* Aircraft Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AIRCRAFT_CATALOG.map((aircraft) => {
              const currentAvailableFunds = aircraftPurchaseMode === 'PERSONAL' 
                ? pl.personalBankBalance 
                : (userClub?.finances?.balance || 0);
              const canAfford = currentAvailableFunds >= aircraft.price;

              return (
                <div
                  key={aircraft.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{aircraft.imageBadge}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {aircraft.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-black font-condensed uppercase tracking-wider text-white">
                        {aircraft.brand} {aircraft.model}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">{aircraft.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                      <div><span className="text-slate-500">Capacidad:</span> <b className="text-white">{aircraft.passengerCapacity} pax</b></div>
                      <div><span className="text-slate-500">Velocidad:</span> <b className="text-white">{aircraft.speedKmh} km/h</b></div>
                      <div><span className="text-slate-500">Autonomía:</span> <b className="text-white">{aircraft.rangeKm.toLocaleString()} km</b></div>
                      <div><span className="text-slate-500">Consumo:</span> <b className="text-cyan-400">{aircraft.fuelBurnPerHour} l/h</b></div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Seguridad:</span> <b className="text-amber-400">{'⭐'.repeat(aircraft.safetyRating)}</b>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-condensed">
                        {aircraftPurchaseMode === 'PERSONAL' ? 'Precio Personal' : 'Presupuesto Club'}
                      </span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {aircraft.price.toLocaleString()} €
                      </span>
                    </div>
                    <button
                      onClick={() => handleBuyAircraft(aircraft)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase font-condensed tracking-wider transition-all ${
                        canAfford
                          ? aircraftPurchaseMode === 'PERSONAL'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:scale-105'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md hover:scale-105'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {aircraftPurchaseMode === 'PERSONAL' ? 'Comprar Personal' : 'Comprar Oficial'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB: MUNDO CRIMINAL & PODER */}
      {activeSubTab === 'mundo_criminal' && (
        <div className="space-y-6">
          {/* Target Rival Club Selector */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div>
              <span className="text-xs font-bold text-white uppercase font-condensed block">
                Selecciona Club Rival Objetivo para Operaciones
              </span>
              <p className="text-[11px] text-slate-400">
                Todas las acciones clandestinas inciden directamente sobre la entidad seleccionada.
              </p>
            </div>
            <select
              value={selectedTargetClubId || (otherClubs[0]?.id || '')}
              onChange={(e) => setSelectedTargetClubId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-bold font-condensed uppercase px-3 py-2 rounded-xl"
            >
              {otherClubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city}) · Rep: {c.reputation}
                </option>
              ))}
            </select>
          </div>

          {/* 4 Criminal Operations Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Hacking */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-base font-black font-condensed uppercase tracking-wider text-white">
                      1. Hackeo Cibernético a Servidores
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    +2 ESTRELLAS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Infiltra los servidores del club rival mediante un minijuego de consola terminal. Filtra informes secretos de ojeo y desestabiliza la confianza de la directiva rival.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  Coste: 0 € · Minijuego interactivo de terminal TOR con temporizador.
                </div>
              </div>
              <button
                onClick={() => setIsHackingModalOpen(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs uppercase font-condensed tracking-wider shadow-md hover:scale-[1.01] transition-transform"
              >
                Abrir Consola Terminal TOR & Hackear
              </button>
            </div>

            {/* 2. Sicarios / Neutralización */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="w-5 h-5 text-red-400" />
                    <h4 className="text-base font-black font-condensed uppercase tracking-wider text-white">
                      2. Contrato Clandestino de Sicario
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    +5 ESTRELLAS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contrata a intermediarios encubiertos para neutralizar a la estrella o al entrenador del rival durante 6 meses mediante un incidente extradeportivo.
                </p>
                <div className="text-[11px] font-mono text-red-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  Coste: 220.000 € (patrimonio personal) · Alto riesgo policial.
                </div>
              </div>
              <button
                onClick={handleExecuteSicario}
                disabled={pl.personalBankBalance < 220000}
                className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black rounded-xl text-xs uppercase font-condensed tracking-wider shadow-md hover:scale-[1.01] transition-transform"
              >
                Ejecutar Contrato de Neutralización (220.000 €)
              </button>
            </div>

            {/* 3. Soborno a Árbitros */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-black font-condensed uppercase tracking-wider text-white">
                      3. Soborno Arbitral para el Partido
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    +3 ESTRELLAS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paga a emisarios del estamento arbitral antes del próximo partido clave. Asegura penaltis favorables y expulsión garantizada al rival.
                </p>
                <div className="text-[11px] font-mono text-amber-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  Coste: 85.000 € · Beneficio arbitral inmediato en tu próximo partido.
                </div>
              </div>
              <button
                onClick={handleExecuteBribe}
                disabled={pl.personalBankBalance < 85000}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black rounded-xl text-xs uppercase font-condensed tracking-wider shadow-md hover:scale-[1.01] transition-transform"
              >
                Pagar Emisarios Arbitrales (85.000 €)
              </button>
            </div>

            {/* 4. Sabotaje a Instalaciones */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-black font-condensed uppercase tracking-wider text-white">
                      4. Sabotaje a Instalaciones Rivales
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    +4 ESTRELLAS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inutiliza el estadio rival (inundación de césped o corte de torretas). Fuerza 4 partidos a puerta cerrada. Si el club está en quiebra, ¡provoca su extinción y el nacimiento de un nuevo club emergente!
                </p>
                <div className="text-[11px] font-mono text-purple-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  Coste: 75.000 € · Clausura forzada y crisis económica severa.
                </div>
              </div>
              <button
                onClick={handleExecuteSabotage}
                disabled={pl.personalBankBalance < 75000}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black rounded-xl text-xs uppercase font-condensed tracking-wider shadow-md hover:scale-[1.01] transition-transform"
              >
                Sabotear Instalaciones Rivales (75.000 €)
              </button>
            </div>
          </div>

          {/* Trigger 20 Years Prison Sentence Button (For Testing & Climax) */}
          <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-red-300 uppercase font-condensed block">
                Mecánica Sumarísima: Detención y Condena de 20 Años en Prisión
              </span>
              <p className="text-[11px] text-red-200/80">
                Alcanzar 12 estrellas te envía 20 años a prisión. Se simulan 20 temporadas completas en el motor de historia y luego eres puesto en libertad.
              </p>
            </div>
            <button
              onClick={handleTriggerPrisonDirect}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-black uppercase font-condensed tracking-wider shadow-md"
            >
              Simular Condena 20 Años Ahora
            </button>
          </div>

          {/* Criminal Records Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black font-condensed uppercase tracking-wider text-white flex items-center gap-2">
              <Skull className="w-4 h-4 text-red-400" />
              <span>Historial de Operaciones Clandestinas y Antecedentes</span>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {(pl.criminal?.records || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3">Ningún delito registrado en el expediente.</p>
              ) : (
                pl.criminal.records.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-condensed">{rec.crimeType}: {rec.targetClubName}</span>
                        <span className="text-[10px] text-amber-400 font-mono">+{rec.starsGained} ★</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rec.outcomeDescription}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{rec.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: FUNDAR CLUB */}
      {activeSubTab === 'fundar_club' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Building2 className="w-7 h-7 text-blue-400" />
            <div>
              <h3 className="text-lg font-black font-condensed uppercase tracking-wider text-white">
                Constitución y Fundación de tu Propio Club
              </h3>
              <p className="text-xs text-slate-400">
                Invierte tu patrimonio personal para crear un club desde cero y convertirte en su propietario y entrenador.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-condensed uppercase block mb-1">Nombre Oficial del Club</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-condensed text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-condensed uppercase block mb-1">Nombre Corto</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-condensed text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-condensed uppercase block mb-1">Ciudad Sede</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-condensed text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-condensed uppercase block mb-1">Nombre del Estadio</label>
              <input
                type="text"
                value={stadiumName}
                onChange={(e) => setStadiumName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-condensed text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFoundClub}
              disabled={pl.personalBankBalance < foundationCost}
              className={`w-full py-3.5 rounded-xl text-sm font-black font-condensed uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
                pl.personalBankBalance >= foundationCost
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>
                {pl.personalBankBalance >= foundationCost
                  ? `Abonar ${foundationCost.toLocaleString()} € y Fundar el Club Oficialmente`
                  : `Requiere ${foundationCost.toLocaleString()} € (Saldo Personal: ${pl.personalBankBalance.toLocaleString()} €)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* FLIGHT SIMULATOR MODAL */}
      {activeFlightModal && (
        <FlightSimulatorModal
          isOpen={Boolean(activeFlightModal)}
          aircraft={activeFlightModal}
          destinationCity={otherClubs[0]?.city || 'Sevilla'}
          rivalClubName={otherClubs[0]?.name || 'Rival'}
          isManagerPilot={Boolean(pl.pilotLicense?.isClubOfficialPilot)}
          onFlightComplete={(res) => {
            setActiveFlightModal(null);
            notify(res.report);
          }}
          onClose={() => setActiveFlightModal(null)}
        />
      )}

      {/* HACKING TERMINAL MODAL */}
      {isHackingModalOpen && (
        <HackingTerminalModal
          isOpen={isHackingModalOpen}
          targetClub={currentSave.clubs[selectedTargetClubId || otherClubs[0]?.id] || otherClubs[0]}
          onComplete={handleCompleteHacking}
          onClose={() => setIsHackingModalOpen(false)}
        />
      )}

      {/* CLUB EXTINCTION & EMERGING CLUB POPUP */}
      {extinctionModalNews && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 border-2 border-amber-500 p-6 rounded-2xl max-w-lg w-full text-center space-y-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-black font-condensed uppercase tracking-wider text-white">
              {extinctionModalNews.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
              {extinctionModalNews.content}
            </p>
            <button
              onClick={() => setExtinctionModalNews(null)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase font-condensed tracking-wider"
            >
              Entendido · Seguir Partida
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
