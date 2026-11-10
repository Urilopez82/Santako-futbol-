import React, { useState } from 'react';
import { GameSave, JobOffer } from '../../types/game';
import { playClickSound } from '../../utils/audio';
import { NATIONAL_TEAMS_MAP, NATIONAL_TEAMS_80 } from '../../db/worldData/nationalTeams80';
import { 
  Award, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  Coins, 
  FileCheck, 
  Globe2, 
  History, 
  LogOut, 
  Mail, 
  RefreshCw, 
  Shield, 
  Trophy, 
  User, 
  X,
  AlertTriangle,
  Building,
  Flag,
  Sparkles,
  TrendingUp,
  Landmark,
  Compass
} from 'lucide-react';

interface ManagerProfileModalProps {
  isOpen: boolean;
  gameSave: GameSave;
  onClose: () => void;
  onAcceptOffer: (offer: JobOffer) => void;
  onRejectOffer: (offerId: string) => void;
  onRenewContract: () => void;
  onResign: () => void;
  onSimulateSack?: () => void;
  onRequestOffers?: () => void;
}

export const ManagerProfileModal: React.FC<ManagerProfileModalProps> = ({
  isOpen,
  gameSave,
  onClose,
  onAcceptOffer,
  onRejectOffer,
  onRenewContract,
  onResign,
  onSimulateSack,
  onRequestOffers,
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'contrato' | 'ofertas' | 'historial'>('perfil');
  const [offerCategory, setOfferCategory] = useState<'TODAS' | 'CLUBES' | 'SELECCIONES'>('TODAS');
  const [confirmResign, setConfirmResign] = useState(false);
  const [showRenewConfirm, setShowRenewConfirm] = useState(false);
  const [requestSuccessNotice, setRequestSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const manager = gameSave.manager;
  const club = gameSave.clubs[gameSave.userClubId];
  const contract = manager.contract;
  const stats = manager.careerStats;
  const allPendingOffers = gameSave.jobOffers.filter((o) => o.status === 'PENDIENTE');

  // Filter pending offers by category
  const filteredOffers = allPendingOffers.filter((offer) => {
    if (offerCategory === 'CLUBES') return !offer.isNationalTeam;
    if (offerCategory === 'SELECCIONES') return offer.isNationalTeam;
    return true;
  });

  // Age calculation
  const birthYear = parseInt(manager.birthDate.slice(0, 4), 10) || 1982;
  const currentYear = parseInt(gameSave.currentDate.slice(0, 4), 10) || 2026;
  const age = currentYear - birthYear;

  // Win percentage
  const winRate = stats.matchesManaged > 0 
    ? Math.round((stats.won / stats.matchesManaged) * 100) 
    : 0;

  const handleRequestOffersClick = () => {
    playClickSound();
    if (onRequestOffers) {
      onRequestOffers();
      setRequestSuccessNotice('¡Tu representante ha añadido nuevas ofertas al buzón!');
      setTimeout(() => setRequestSuccessNotice(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-5">
      <div className="bg-gradient-to-b from-slate-900 via-[#0d1527] to-[#090e1a] border border-slate-700/60 w-full max-w-5xl max-h-[96vh] sm:max-h-[94vh] rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Bar */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-black text-white font-condensed uppercase tracking-wider truncate">
                  Ficha Oficial del Entrenador
                </h2>
                <span className="text-[9px] sm:text-[10px] bg-slate-800/90 border border-slate-700 text-slate-300 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded font-mono-num font-semibold shrink-0">
                  #{manager.id.toUpperCase().slice(0, 8)}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {manager.firstName} {manager.lastName} · {club?.name || 'Agente Libre'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all shrink-0"
            title="Cerrar Ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager Summary Hero Card (Optimized for Mobile) */}
        <div className="p-3 sm:p-6 bg-gradient-to-r from-slate-950/90 via-slate-900/95 to-slate-950/90 border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 text-left w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/40 shrink-0 shadow-lg flex items-center justify-center">
              {manager.avatarId && (manager.avatarId.startsWith('http') || manager.avatarId.startsWith('/')) ? (
                <img
                  src={manager.avatarId}
                  alt={manager.lastName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center text-lg sm:text-2xl font-black text-white font-condensed">
                  {manager.firstName[0]}{manager.lastName[0]}
                </div>
              )}
            </div>

            <div className="space-y-0.5 sm:space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-base sm:text-2xl font-black text-white font-condensed uppercase tracking-wide truncate">
                  {manager.firstName} {manager.lastName}
                </h3>
                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.2 sm:py-0.5 bg-gradient-to-r from-emerald-950 to-teal-950 text-emerald-400 border border-emerald-500/40 rounded">
                  {manager.license}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 text-[11px] sm:text-xs text-slate-300">
                <span className="font-mono-num">{age} años</span>
                <span className="text-slate-600">·</span>
                <span>{manager.birthCity}, {manager.nationality}</span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-sky-400 font-semibold hidden sm:inline">{manager.tacticalPhilosophy} ({manager.preferredFormation})</span>
              </div>

              {/* Roles Badge: Club + National Team */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/70 px-2 py-0.5 rounded text-[10px] sm:text-xs text-slate-200">
                  <Building className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">Club: <strong className="text-white font-bold">{club?.shortName || club?.name || 'Libre'}</strong></span>
                </div>

                {manager.nationalTeamRole && (
                  <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/70 px-2 py-0.5 rounded text-[10px] sm:text-xs text-slate-200">
                    <Flag className="w-3 h-3 text-sky-400" />
                    <span className="truncate">Selección: <strong className="text-sky-300 font-bold">{manager.nationalTeamRole.countryName}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="w-full sm:w-auto flex items-center justify-around sm:justify-end gap-2 sm:gap-3 shrink-0 font-mono-num pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
            <div className="bg-slate-900/90 border border-slate-700/70 p-1.5 sm:p-3.5 rounded-lg sm:rounded-xl text-center min-w-[70px] sm:min-w-[100px] shadow-sm flex-1 sm:flex-none">
              <span className="text-[9px] sm:text-[10px] text-sky-400 uppercase tracking-wider block font-condensed font-bold">ELO Técnico</span>
              <span className="text-sm sm:text-2xl font-black text-sky-300">{(manager as any).elo || Math.round(1200 + manager.reputation * 12)}</span>
              <span className="text-[8px] sm:text-[10px] text-amber-400 block font-semibold">Rep: {manager.reputation}</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/70 p-1.5 sm:p-3.5 rounded-lg sm:rounded-xl text-center min-w-[70px] sm:min-w-[90px] shadow-sm flex-1 sm:flex-none">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Partidos</span>
              <span className="text-sm sm:text-2xl font-black text-slate-100">{stats.matchesManaged}</span>
              <span className="text-[8px] sm:text-[10px] text-emerald-400 block font-bold">{winRate}% Vic</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/70 p-1.5 sm:p-3.5 rounded-lg sm:rounded-xl text-center min-w-[70px] sm:min-w-[90px] shadow-sm flex-1 sm:flex-none">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Títulos</span>
              <span className="text-sm sm:text-2xl font-black text-amber-400">{stats.titlesWon}</span>
              <span className="text-[8px] sm:text-[10px] text-slate-400 block font-semibold">{stats.promotions} Asc</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs (Scrollable & Responsive) */}
        <div className="px-2 sm:px-6 bg-slate-950/95 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'perfil', label: 'Datos', fullLabel: 'Datos & Biografía', icon: User },
              { id: 'contrato', label: 'Contrato', fullLabel: 'Contrato Vigente', icon: FileCheck },
              { 
                id: 'ofertas', 
                label: `Ofertas (${allPendingOffers.length})`, 
                fullLabel: `Bolsa de Ofertas (${allPendingOffers.length})`, 
                icon: Mail,
                highlight: allPendingOffers.length > 0 
              },
              { id: 'historial', label: 'Palmarés', fullLabel: 'Estadísticas & Palmarés', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold font-condensed uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                    isActive
                      ? 'border-emerald-500 text-emerald-400 bg-slate-900/60 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  } ${tab.highlight && !isActive ? 'text-amber-400 font-black animate-pulse' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                </button>
              );
            })}
          </div>

          {onRequestOffers && (
            <button
              onClick={handleRequestOffersClick}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-md transition-all active:scale-95 uppercase font-condensed tracking-wider shrink-0 flex items-center gap-1 ml-2"
              title="Solicitar a tu agente que busque vacantes en clubes y selecciones"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Pedir Ofertas al Agente</span>
              <span className="sm:hidden">Pedir Ofertas</span>
            </button>
          )}
        </div>

        {/* Tab Contents Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Notification toast if user requested offers */}
          {requestSuccessNotice && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{requestSuccessNotice}</span>
            </div>
          )}

          {/* TAB 1: DATOS & BIOGRAFIA */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-3.5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" /> Titulación Oficial Federativa
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-900">
                      <span className="text-slate-400">Licencia de Entrenador:</span>
                      <span className="font-bold text-emerald-400">{manager.license}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-900">
                      <span className="text-slate-400">Escuela de Formación:</span>
                      <span className="text-slate-200 font-medium">{manager.footballEducation}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-900">
                      <span className="text-slate-400">Nivel de Experiencia:</span>
                      <span className="text-slate-200 font-medium">{manager.experienceLevel}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Liderazgo y Vestuario:</span>
                      <span className="text-slate-200 font-medium">{manager.personality}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-3.5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-sky-400" /> Idiomas y Especialidades
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1.5">Idiomas de Trabajo:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {manager.languages.map((lang) => (
                          <span
                            key={lang}
                            className="text-xs bg-slate-900 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1.5">Especialidades Tácticas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {manager.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status / Dual Roles Card */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" /> Situación Laboral Actual
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Club */}
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-condensed">Club Asignado</span>
                      <span className="text-xs font-bold text-emerald-400">{club ? 'Bajo Contrato' : 'Libre'}</span>
                    </div>
                    <div className="text-lg font-bold text-white font-condensed uppercase">{club?.name || 'Sin Club'}</div>
                    <p className="text-xs text-slate-400">
                      {contract ? `Sueldo: ${contract.wageWeekly.toLocaleString()} €/sem · Fin: ${contract.endSeason}` : 'Disponible para negociar ofertas'}
                    </p>
                  </div>

                  {/* National Team */}
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-condensed">Selección Nacional</span>
                      <span className="text-xs font-bold text-sky-400">
                        {manager.nationalTeamRole ? 'Seleccionador Titular' : 'Sin Selección'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white font-condensed uppercase flex items-center gap-2">
                      <span>{manager.nationalTeamRole ? manager.nationalTeamRole.flag : '🌎'}</span>
                      <span>{manager.nationalTeamRole?.countryName || 'Disponible'}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {manager.nationalTeamRole 
                        ? `Categoría: ${manager.nationalTeamRole.teamType} · Compatible con dirigir tu club` 
                        : 'Puedes ser seleccionador y entrenador de club al mismo tiempo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRATO VIGENTE */}
          {activeTab === 'contrato' && (
            <div className="space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base font-condensed shadow-md"
                      style={{
                        backgroundColor: club?.primaryColor || '#1e293b',
                        color: club?.textColor || '#fff',
                        border: `2px solid ${club?.secondaryColor || '#334155'}`,
                      }}
                    >
                      {club?.code || 'LIBRE'}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-condensed uppercase">
                        Contrato Laboral Oficial — {contract.clubName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Vigencia: {contract.startDate} hasta {contract.endSeason} ({contract.durationYears} temporadas)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-lg w-fit">
                    Vigente y Registrado RFEF
                  </span>
                </div>

                {/* Salary & Clauses Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-num text-xs">
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Salario Semanal</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {contract.wageWeekly.toLocaleString()} € / sem
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({contract.wageAnnual.toLocaleString()} € brutos/año)
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Cláusula de Rescisión</span>
                    <span className="text-xl font-bold text-slate-200">
                      {contract.releaseClause.toLocaleString()} €
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Abono para fichar por otro club
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Indemnización por Despido</span>
                    <span className="text-xl font-bold text-amber-400">
                      {contract.severancePay.toLocaleString()} €
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Compensación en caso de cese anticipado
                    </span>
                  </div>
                </div>

                {/* Sporting Objectives */}
                <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Objetivo Deportivo Pactado:</span>
                    <span className="font-bold text-slate-200">{contract.sportingObjective}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Límite Económico de la Directiva:</span>
                    <span className="text-slate-200">{contract.economicObjective}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Prima Extraordinaria por Ascenso:</span>
                    <span className="font-bold text-emerald-400">+{contract.promotionBonus.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Prima por Permanencia en la Categoría:</span>
                    <span className="font-bold text-slate-300">+{contract.survivalBonus.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Cláusula de Renovación Automática:</span>
                    <span className="text-slate-300">{contract.renewalCondition}</span>
                  </div>
                </div>

                {/* Contract Actions Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowRenewConfirm(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 uppercase font-condensed tracking-wider"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Proponer Renovación (+1 Año)</span>
                    </button>

                    {onSimulateSack && (
                      <button
                        onClick={() => {
                          playClickSound();
                          onSimulateSack();
                        }}
                        title="Simular pérdida de confianza de la directiva y cese con indemnización"
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 font-medium text-xs rounded-xl transition-colors uppercase font-condensed tracking-wider"
                      >
                        Simular Cese Directiva
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      playClickSound();
                      setConfirmResign(true);
                    }}
                    className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 uppercase font-condensed tracking-wider"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Presentar Dimisión</span>
                  </button>
                </div>
              </div>

              {/* Renewal Prompt */}
              {showRenewConfirm && (
                <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>¿Confirmar solicitud de renovación contractual?</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Se propondrá ampliar el vínculo con el {club?.name} por 1 temporada adicional, con una mejora del 15% en los emolumentos semanales.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowRenewConfirm(false);
                        onRenewContract();
                      }}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow"
                    >
                      Confirmar y Firmar
                    </button>
                    <button
                      onClick={() => setShowRenewConfirm(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Resign Prompt */}
              {confirmResign && (
                <div className="p-4 bg-rose-950/70 border border-rose-500/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>¿Estás seguro de presentar tu dimisión irrevocable?</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Al dimitir, abandonarás inmediatamente el cargo de entrenador del {club?.name}. No percibirás indemnización y pasarás a ser técnico libre en el mercado.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmResign(false);
                        onResign();
                      }}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow"
                    >
                      Sí, Presentar Dimisión Irrevocable
                    </button>
                    <button
                      onClick={() => setConfirmResign(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOLSA DE OFERTAS & SELECCIONES (100% Mobile Responsive) */}
          {activeTab === 'ofertas' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Header with Categories and Agent Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-slate-950/60 border border-slate-800/80 p-3 sm:p-4 rounded-xl">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white font-condensed uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Buzón de Ofertas de Trabajo ({allPendingOffers.length})
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Propuestas contractuales recibidas de directivas y federaciones nacionales.
                  </p>
                </div>

                {onRequestOffers && (
                  <button
                    onClick={handleRequestOffersClick}
                    className="w-full sm:w-auto px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 uppercase font-condensed tracking-wider"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pedir Ofertas al Agente</span>
                  </button>
                )}
              </div>

              {/* Segmented Filter Control (Horizontal Scroll on Mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'TODAS', label: 'Todas', fullLabel: 'Todas las Ofertas', count: allPendingOffers.length },
                  { id: 'CLUBES', label: 'Clubes', fullLabel: 'Clubes de Liga', count: allPendingOffers.filter((o) => !o.isNationalTeam).length },
                  { id: 'SELECCIONES', label: 'Selecciones', fullLabel: 'Selecciones Nacionales', count: allPendingOffers.filter((o) => o.isNationalTeam).length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      playClickSound();
                      setOfferCategory(item.id as any);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold font-condensed uppercase tracking-wider rounded-lg transition-all shrink-0 ${
                      offerCategory === item.id
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span className="sm:hidden">{item.label} ({item.count})</span>
                    <span className="hidden sm:inline">{item.fullLabel} ({item.count})</span>
                  </button>
                ))}
              </div>

              {/* Offers List */}
              {filteredOffers.length === 0 ? (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 sm:p-8 text-center space-y-3">
                  <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mx-auto" />
                  <p className="text-xs sm:text-sm font-bold text-slate-300">No hay propuestas pendientes en esta categoría</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 max-w-md mx-auto">
                    Haz clic en el botón inferior para que tu representante contacte con directivas con banquillos disponibles o federaciones buscando seleccionador.
                  </p>
                  {onRequestOffers && (
                    <button
                      onClick={handleRequestOffersClick}
                      className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow uppercase font-condensed tracking-wider"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Buscar Ofertas Inmediatas</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {filteredOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/60 rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all space-y-3 sm:space-y-4 shadow-lg group"
                    >
                      {/* Header of Offer Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-black text-sm sm:text-lg text-emerald-400 shrink-0 shadow-inner">
                            {offer.isNationalTeam ? (
                              <span className="text-xl sm:text-2xl">
                                {NATIONAL_TEAMS_MAP[offer.countryId || '']?.flag ||
                                 NATIONAL_TEAMS_80.find(n => n.id === offer.countryId || offer.clubName.toLowerCase().includes(n.name.toLowerCase()))?.flag ||
                                 '🌐'}
                              </span>
                            ) : (
                              <span className="font-condensed font-black">{offer.clubCode || 'FC'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h5 className="font-black text-sm sm:text-base text-white font-condensed uppercase tracking-wide group-hover:text-emerald-400 transition-colors truncate">
                                {offer.clubName}
                              </h5>
                              <span className="text-[9px] sm:text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded font-medium">
                                {offer.divisionName}
                              </span>
                              {offer.isNationalTeam && (
                                <span className="text-[9px] sm:text-[10px] bg-sky-950 text-sky-400 border border-sky-500/40 px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
                                  {offer.nationalTeamType}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
                              Recibida: {offer.offeredDate} · Req: <strong className="text-slate-300">{offer.reputationRequired}+ Rep</strong> (Tuya: <strong className="text-amber-400">{manager.reputation}</strong>)
                            </p>
                          </div>
                        </div>

                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                          OFERTA OFICIAL
                        </span>
                      </div>

                      {/* 3 Metrics Cards Grid (Salario, Duración, Presupuesto) */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 font-mono-num">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                          <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block font-condensed tracking-wider">Salario</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-400 block truncate">{offer.wageWeekly.toLocaleString()} €</span>
                          <span className="text-[8px] text-slate-500 hidden sm:block">por semana</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                          <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block font-condensed tracking-wider">Duración</span>
                          <span className="text-xs sm:text-sm font-black text-slate-100 block">{offer.durationYears} Temp.</span>
                          <span className="text-[8px] text-slate-500 hidden sm:block">contrato</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                          <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block font-condensed tracking-wider">Fichajes</span>
                          <span className="text-xs sm:text-sm font-black text-amber-400 block truncate">
                            {offer.isNationalTeam ? 'SELECCIÓN' : `${offer.transferBudget.toLocaleString()} €`}
                          </span>
                          <span className="text-[8px] text-slate-500 hidden sm:block">presupuesto</span>
                        </div>
                      </div>

                      {/* Project Goal & Compatibility */}
                      <div className="bg-slate-900/70 border border-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-condensed">Objetivo deportivo:</span>
                          <span className="font-bold text-slate-200 truncate ml-2">{offer.sportingObjective}</span>
                        </div>
                        {offer.isNationalTeam && (
                          <div className="text-[10px] text-sky-400 font-medium">
                            ✓ Compatible con tu club actual de liga
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Responsive & Thumb-friendly on Mobile */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                        <button
                          onClick={() => {
                            playClickSound();
                            onRejectOffer(offer.id);
                          }}
                          className="px-3 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl transition-colors uppercase font-condensed tracking-wider"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => {
                            playClickSound();
                            onAcceptOffer(offer);
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 uppercase font-condensed tracking-wider active:scale-98"
                        >
                          <CheckCircle className="w-4 h-4 text-slate-950" />
                          <span>Aceptar y Firmar Contrato</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ESTADÍSTICAS & PALMARÉS (100% Mobile Responsive) */}
          {activeTab === 'historial' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Vitrina Oficial de Trofeos del Mánager / Club */}
              <div className="pcf-panel rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs sm:text-sm font-black text-amber-300 font-condensed uppercase tracking-wider">
                      Vitrina Oficial de Trofeos y Palmarés ({stats.titlesWon})
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono-num font-bold">
                    {stats.titlesWon > 0 ? `${stats.titlesWon} Título${stats.titlesWon > 1 ? 's' : ''}` : 'Sin títulos aún'}
                  </span>
                </div>

                {/* Trophies Grid */}
                {(() => {
                  const managerTrophies = (gameSave.trophyArchive || []).filter(
                    (t) => t.championId === gameSave.userClubId || 
                           t.winningManagerName === `${manager.firstName} ${manager.lastName}` ||
                           t.championName === club?.name
                  );

                  if (managerTrophies.length === 0) {
                    return (
                      <div className="text-center py-4 text-slate-400 text-xs space-y-1">
                        <Award className="w-8 h-8 text-amber-500/30 mx-auto" />
                        <p className="font-bold text-slate-300">Vitrina de títulos en construcción</p>
                        <p className="text-[11px] text-slate-500">
                          Disputa la Liga, la Copa del Rey o competiciones continentales para alzar tu primer trofeo oficial.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {managerTrophies.map((trophy) => (
                        <div
                          key={trophy.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow shrink-0">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-white uppercase tracking-wide truncate font-condensed">
                                {trophy.competitionName}
                              </span>
                              <span className="text-[10px] text-amber-400 font-mono-num font-bold ml-1 shrink-0">
                                {trophy.season}
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-400 font-condensed truncate">
                              Campeón con {trophy.championName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Career Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 font-mono-num">
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Partidos Dirigidos</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-100">{stats.matchesManaged}</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Victorias</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">{stats.won}</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Empates</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{stats.drawn}</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Derrotas</span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">{stats.lost}</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Goles Favor</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-200">{stats.goalsFor}</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Goles Contra</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-400">{stats.goalsAgainst}</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Títulos Oficiales</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{stats.titlesWon}</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Ascensos</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">{stats.promotions}</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-4 rounded-xl text-center col-span-2 sm:col-span-1">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Descensos</span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">{stats.relegations || 0}</span>
                </div>
              </div>

              {/* Incidents */}
              <div className="bg-slate-950/50 border border-slate-800 p-3 sm:p-4 rounded-xl flex items-center justify-around text-xs font-mono-num">
                <div className="text-center">
                  <span className="text-slate-400 block mb-0.5 font-condensed text-[11px] sm:text-xs">Ceses / Destituciones</span>
                  <span className="font-bold text-rose-400 text-sm sm:text-base">{stats.sacksCount}</span>
                </div>
                <div className="h-6 sm:h-8 border-l border-slate-800" />
                <div className="text-center">
                  <span className="text-slate-400 block mb-0.5 font-condensed text-[11px] sm:text-xs">Dimisiones Voluntarias</span>
                  <span className="font-bold text-slate-300 text-sm sm:text-base">{stats.resignationsCount}</span>
                </div>
              </div>

              {/* Seasons History */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider">
                  Historial de Temporadas Disputadas
                </h4>
                {gameSave.history && gameSave.history.length > 0 ? (
                  <div className="space-y-2">
                    {gameSave.history.map((hist, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white font-mono-num mr-2">{hist.season}</span>
                          <span className="text-slate-300 font-medium">{hist.clubName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
                          <span className="text-slate-400">Puesto {hist.finalPosition}º</span>
                          {hist.promoted && (
                            <span className="text-[9px] sm:text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded font-bold">
                              ASCENSO
                            </span>
                          )}
                          {hist.relegated && (
                            <span className="text-[9px] sm:text-[10px] bg-rose-950 text-rose-400 border border-rose-500/30 px-1.5 sm:px-2 py-0.5 rounded font-bold">
                              DESCENSO
                            </span>
                          )}
                          {hist.trophies && hist.trophies.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded font-bold">
                              🏆 {hist.trophies[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-800 p-4 sm:p-6 rounded-xl text-center text-xs text-slate-500">
                    Temporada inaugural en curso ({gameSave.currentSeason}). El resumen del ejercicio se registrará al finalizar la liga.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono-num">
          <span>SANTAKO FÚTBOL · Sistema Profesional de Carrera de Mánager</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
