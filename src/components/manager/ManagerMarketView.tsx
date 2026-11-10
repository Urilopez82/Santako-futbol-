import React, { useState } from 'react';
import { evaluateClubEligibility } from '../../engine/managerCareerEngine';
import { Club } from '../../types/club';
import { GameSave, ManagerMarketEvent } from '../../types/game';
import { playClickSound } from '../../utils/audio';
import { NATIONAL_TEAMS_80 } from '../../db/worldData/nationalTeams80';
import { 
  AlertCircle, 
  ArrowRight, 
  Building, 
  CheckCircle, 
  Clock, 
  Compass, 
  Filter, 
  Globe2, 
  Lock, 
  Newspaper, 
  Search, 
  Shield, 
  TrendingUp, 
  UserCheck, 
  Users,
  Flag,
  Sparkles
} from 'lucide-react';

interface ManagerMarketViewProps {
  gameSave: GameSave;
  onApplyForClub: (club: Club) => void;
  onApplyForNationalTeam: (countryName: string, teamType: 'ABSOLUTA' | 'SUB21' | 'SUB20', countryId?: string) => void;
}

export const ManagerMarketView: React.FC<ManagerMarketViewProps> = ({
  gameSave,
  onApplyForClub,
  onApplyForNationalTeam,
}) => {
  const [subTab, setSubTab] = useState<'movimientos' | 'banquillos' | 'selecciones'>('movimientos');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('TODOS');
  const [searchClub, setSearchClub] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);
  const [natTeamType, setNatTeamType] = useState<'ABSOLUTA' | 'SUB21' | 'SUB20'>('ABSOLUTA');
  const [natConfed, setNatConfed] = useState<string>('TODAS');
  const [searchNat, setSearchNat] = useState<string>('');

  const manager = gameSave.manager;
  const currentClubId = gameSave.userClubId;
  const clubsList = Object.values(gameSave.clubs);

  // Filter events
  const filteredEvents = gameSave.marketEvents.filter((ev) => {
    if (eventTypeFilter === 'TODOS') return true;
    return ev.type === eventTypeFilter;
  });

  // Filter clubs for vacant/available benches
  const filteredClubs = clubsList.filter((c) => {
    if (c.id === currentClubId) return false;
    if (searchClub && !c.name.toLowerCase().includes(searchClub.toLowerCase()) && !c.city.toLowerCase().includes(searchClub.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleApply = (c: Club) => {
    playClickSound();
    onApplyForClub(c);
    setApplicationSuccess(`Has enviado tu candidatura formal a la directiva de ${c.name}.`);
    setTimeout(() => setApplicationSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white font-condensed uppercase tracking-wide flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Mercado Mundial de Entrenadores y Banquillos
            </h2>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              FASE 2 ACTIVA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Seguimiento en tiempo real de ceses, contrataciones, renovaciones de contratos y oportunidades laborales.
          </p>
        </div>

        {/* Manager Credentials pill */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-xl shrink-0 font-mono-num text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tu Titulación</span>
            <span className="font-bold text-emerald-400">{manager.license}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-bold">Tu ELO</span>
            <span className="font-black text-sky-300">{(manager as any).elo || Math.round(1200 + manager.reputation * 12)}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Reputación</span>
            <span className="font-bold text-amber-400">{manager.reputation} / 100</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'movimientos', label: 'Noticias & Movimientos', icon: Newspaper, count: filteredEvents.length },
            { id: 'banquillos', label: 'Banquillos & Clubes', icon: Building, count: filteredClubs.length },
            { id: 'selecciones', label: 'Selecciones Nacionales', icon: Globe2 },
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
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono-num">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {applicationSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{applicationSuccess}</span>
          </div>
        )}
      </div>

      {/* SUBTAB 1: MOVIMIENTOS & NOTICIAS DEL MERCADO */}
      {subTab === 'movimientos' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium mr-2">
              <Filter className="w-3.5 h-3.5" /> Filtrar por suceso:
            </span>
            {['TODOS', 'CONTRATACION', 'DESTITUCION', 'RENOVACION', 'DIMISION'].map((fType) => (
              <button
                key={fType}
                onClick={() => {
                  playClickSound();
                  setEventTypeFilter(fType);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  eventTypeFilter === fType
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fType === 'TODOS' ? 'Todos los sucesos' : fType}
              </button>
            ))}
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
              <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No hay movimientos registrados en este filtro</p>
              <p className="text-xs text-slate-500">
                A medida que avancen las semanas del calendario futbolístico, los clubes destituirán y contratarán técnicos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((ev) => {
                const isDestitution = ev.type === 'DESTITUCION';
                const isHiring = ev.type === 'CONTRATACION';
                const isRenewal = ev.type === 'RENOVACION';
                const isResignation = ev.type === 'DIMISION';

                return (
                  <div
                    key={ev.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isDestitution
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            : isHiring
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : isRenewal
                            ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ev.type}
                      </span>
                      <span className="text-slate-500 font-mono-num text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm font-condensed">
                        {ev.headline}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                        {ev.details}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono-num">
                      <span>Club: {ev.clubName}</span>
                      <span className="text-slate-300 font-medium">Técnico: {ev.managerName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: BANQUILLOS & CLUBES (VACANCIES & APPLICATIONS) */}
      {subTab === 'banquillos' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Buscar club o ciudad..."
              value={searchClub}
              onChange={(e) => setSearchClub(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-100 focus:outline-none flex-1"
            />
            {searchClub && (
              <button
                onClick={() => setSearchClub('')}
                className="text-xs text-slate-400 hover:text-slate-200 mr-2"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Grid of Clubs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClubs.map((c) => {
              const eligibility = evaluateClubEligibility(c, manager.license, manager.reputation);

              return (
                <div
                  key={c.id}
                  className={`bg-slate-900/80 border rounded-xl p-4 flex flex-col justify-between transition-all space-y-4 shadow-sm ${
                    eligibility.eligible
                      ? 'border-slate-800 hover:border-emerald-500/50'
                      : 'border-slate-800/60 opacity-80'
                  }`}
                >
                  <div>
                    {/* Club Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-condensed shadow"
                          style={{
                            backgroundColor: c.primaryColor,
                            color: c.textColor,
                            border: `2px solid ${c.secondaryColor}`,
                          }}
                        >
                          {c.code}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm font-condensed uppercase truncate max-w-[170px]">
                            {c.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 block">
                            {c.city} · {c.stadium.capacity.toLocaleString()} esp.
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono-num">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Reputación</span>
                        <span className="text-sm font-bold text-amber-400">{c.reputation}</span>
                      </div>
                    </div>

                    {/* Financial & Sporting Snapshot */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1 font-mono-num">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Objetivo Directiva:</span>
                        <span className="text-slate-200 font-medium truncate max-w-[140px]">{c.boardObjective}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Límite Salarial:</span>
                        <span className="text-slate-300">{c.finances.weeklyWageBudget.toLocaleString()} € / sem</span>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Banner & Action */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    {eligibility.eligible ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Candidatura elegible</span>
                        </div>
                        <button
                          onClick={() => handleApply(c)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Presentar Candidatura</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-start gap-1.5 text-[11px] text-rose-400/90 leading-tight">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{eligibility.reason}</span>
                        </div>
                        <button
                          disabled
                          className="w-full py-1.5 bg-slate-800/60 text-slate-500 font-medium text-xs rounded-lg cursor-not-allowed border border-slate-800"
                        >
                          Requisitos No Alcanzados
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SELECCIONES NACIONALES (80 SELECCIONES OFICIALES) */}
      {subTab === 'selecciones' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-condensed uppercase flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-sky-400" />
                  Dirección de Selecciones Nacionales (Catálogo FIFA - 80 Selecciones Reales)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                  Presenta tu candidatura oficial a cualquier federación internacional. Puedes compaginar la dirección de tu club con el mando de un combinado nacional.
                </p>
              </div>

              {/* Category picker */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                {(['ABSOLUTA', 'SUB21', 'SUB20'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      playClickSound();
                      setNatTeamType(type);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold font-condensed uppercase tracking-wider rounded-lg transition-all ${
                      natTeamType === type
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters bar: Confederation & Search */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['TODAS', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC'] as const).map((conf) => (
                  <button
                    key={conf}
                    onClick={() => {
                      playClickSound();
                      setNatConfed(conf);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold font-condensed uppercase rounded-lg transition-all ${
                      natConfed === conf
                        ? 'bg-slate-800 text-sky-400 border border-sky-500/40'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {conf}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar país o estrella..."
                  value={searchNat}
                  onChange={(e) => setSearchNat(e.target.value)}
                  className="bg-transparent border-none text-slate-200 focus:outline-none w-full"
                />
                {searchNat && (
                  <button onClick={() => setSearchNat('')} className="text-slate-500 hover:text-white">
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* National Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {NATIONAL_TEAMS_80.filter((nat) => {
              if (natConfed !== 'TODAS' && nat.confederation !== natConfed) return false;
              if (searchNat) {
                const q = searchNat.toLowerCase();
                const matchName = nat.name.toLowerCase().includes(q) || nat.code.toLowerCase().includes(q);
                const matchStar = nat.starPlayersSample?.some((s) => s.toLowerCase().includes(q));
                if (!matchName && !matchStar) return false;
              }
              return true;
            }).map((nat) => {
              // Calculate required reputation based on team reputation and category
              const baseReq = natTeamType === 'ABSOLUTA' 
                ? Math.max(50, nat.reputation - 15)
                : natTeamType === 'SUB21'
                ? Math.max(45, nat.reputation - 22)
                : Math.max(40, nat.reputation - 28);

              const isEligible = manager.reputation >= baseReq;
              const isCurrentRole = manager.nationalTeamRole?.countryId === nat.id && manager.nationalTeamRole?.teamType === natTeamType;

              return (
                <div
                  key={nat.id}
                  className={`bg-slate-900/85 border rounded-xl p-4 flex flex-col justify-between transition-all space-y-3.5 shadow-sm ${
                    isCurrentRole
                      ? 'border-sky-500 bg-sky-950/20'
                      : isEligible
                      ? 'border-slate-800 hover:border-sky-500/50'
                      : 'border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl shadow-sm">{nat.flag}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm font-condensed uppercase">
                            {nat.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block font-mono-num">
                            Ranking FIFA: #{nat.fifaRanking} · {nat.confederation}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono-num">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-condensed">Poder</span>
                        <span className="text-xs font-black text-amber-400">{nat.reputation} / 100</span>
                      </div>
                    </div>

                    {/* Star players */}
                    {nat.starPlayersSample && (
                      <p className="text-[11px] text-slate-400 truncate">
                        <strong className="text-slate-300">Estrellas:</strong> {nat.starPlayersSample.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Action / Eligibility */}
                  <div className="pt-2 border-t border-slate-800/80">
                    {isCurrentRole ? (
                      <div className="py-1.5 bg-sky-950 text-sky-300 border border-sky-500/40 font-bold text-xs rounded-lg text-center flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                        <span>Tu Selección Actual ({natTeamType})</span>
                      </div>
                    ) : isEligible ? (
                      <button
                        onClick={() => {
                          playClickSound();
                          onApplyForNationalTeam(`Selección de ${nat.name}`, natTeamType, nat.id);
                          setApplicationSuccess(`Has enviado tu candidatura formal a la federación de ${nat.name} (${natTeamType}).`);
                          setTimeout(() => setApplicationSuccess(null), 3500);
                        }}
                        className="w-full py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 uppercase font-condensed tracking-wider"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Postular a Seleccionador ({natTeamType})</span>
                      </button>
                    ) : (
                      <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>Exige Reputación {baseReq}+ (Tienes {manager.reputation})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
