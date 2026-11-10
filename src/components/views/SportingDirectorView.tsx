import React, { useState } from 'react';
import { 
  changePlayerSquadLevel, 
  generateYouthIntake, 
  INITIAL_SCOUTS_POOL, 
  INITIAL_STAFF_MEMBERS,
  isDateInTransferWindow, 
  signYouthCandidate,
  assignScoutMission,
  resolveStaffRequest,
} from '../../engine/sportingDirectorEngine';
import { Club } from '../../types/club';
import { GameSave, NewsItem } from '../../types/game';
import { Player, Position } from '../../types/player';
import { FullTransferOffer, Scout, ScoutReport, SquadCategory, YouthAcademyCandidate, StaffMember } from '../../types/sportingDirector';
import { playClickSound } from '../../utils/audio';
import { TransferNegotiationModal } from '../transfers/TransferNegotiationModal';
import { 
  AlertCircle, 
  ArrowRightLeft, 
  Award, 
  Briefcase, 
  Building2, 
  CheckCircle, 
  Clock, 
  Compass, 
  Eye, 
  FileCheck, 
  GraduationCap, 
  HelpCircle, 
  Minus, 
  Plus, 
  RefreshCw, 
  Search, 
  Shield, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  UserCheck, 
  UserPlus, 
  Users, 
  X 
} from 'lucide-react';

interface SportingDirectorViewProps {
  gameSave: GameSave;
  onUpdateClub: (updatedClub: Club, playerDeltas?: Record<string, Player>, newsItem?: NewsItem) => void;
  onUpdateSave?: (newSave: GameSave) => void;
  onFinalizeTransfer: (offer: FullTransferOffer, player: Player) => void;
  onSelectPlayer?: (player: Player) => void;
  initialSubTab?: 'plantillas' | 'mercado' | 'ojeadores' | 'cuerpo_tecnico' | 'cantera' | 'evolucion';
  initialSquadFilter?: SquadCategory | 'CEDIDOS' | 'LESIONADOS' | 'SANCIONADOS';
}

export const SportingDirectorView: React.FC<SportingDirectorViewProps> = ({
  gameSave,
  onUpdateClub,
  onUpdateSave,
  onFinalizeTransfer,
  onSelectPlayer,
  initialSubTab = 'plantillas',
  initialSquadFilter = 'PRIMER_EQUIPO',
}) => {
  const club = gameSave.clubs[gameSave.userClubId];
  const windowStatus = isDateInTransferWindow(gameSave.currentDate);

  const [activeSubTab, setActiveSubTab] = useState<
    'plantillas' | 'mercado' | 'ojeadores' | 'cuerpo_tecnico' | 'cantera' | 'evolucion'
  >(initialSubTab);

  const [squadFilter, setSquadFilter] = useState<SquadCategory | 'CEDIDOS' | 'LESIONADOS' | 'SANCIONADOS'>(initialSquadFilter);

  // Scouting Mission State
  const [selectedScoutForMission, setSelectedScoutForMission] = useState<Scout | null>(null);
  const [missionRegion, setMissionRegion] = useState<string>('España / Nacional');
  const [missionPosition, setMissionPosition] = useState<Position | 'TODAS'>('TODAS');
  const [missionAgeRange, setMissionAgeRange] = useState<'SUB20' | '21_26' | 'VETERANOS' | 'TODAS'>('TODAS');
  const [missionWeeks, setMissionWeeks] = useState<number>(3);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  React.useEffect(() => {
    if (initialSquadFilter) {
      setSquadFilter(initialSquadFilter);
    }
  }, [initialSquadFilter]);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'TODAS'>('TODAS');
  const [selectedPlayerToNegotiate, setSelectedPlayerToNegotiate] = useState<Player | null>(null);
  const [youthIntakeList, setYouthIntakeList] = useState<YouthAcademyCandidate[]>(
    club.youthCandidates || generateYouthIntake(club, gameSave.currentSeason)
  );

  const handleLaunchScoutMission = () => {
    playClickSound();
    if (!selectedScoutForMission) return;
    const updated = assignScoutMission(
      gameSave,
      selectedScoutForMission.id,
      missionRegion,
      missionPosition,
      missionAgeRange,
      missionWeeks
    );
    if (onUpdateSave) {
      onUpdateSave(updated);
    } else {
      const uClub = updated.clubs[gameSave.userClubId];
      if (uClub) onUpdateClub(uClub, undefined, updated.news[0]);
    }
    setSelectedScoutForMission(null);
  };

  const handleResolveStaff = (staffId: string, approve: boolean) => {
    playClickSound();
    const updated = resolveStaffRequest(gameSave, staffId, approve);
    if (onUpdateSave) {
      onUpdateSave(updated);
    } else {
      const uClub = updated.clubs[gameSave.userClubId];
      if (uClub) onUpdateClub(uClub, undefined, updated.news[0]);
    }
  };

  // Club squad players
  const allClubPlayers = club.playerIds.map((id) => gameSave.players[id]).filter(Boolean);

  // Filter squad players according to selected squad category
  const filteredSquadPlayers = allClubPlayers.filter((p) => {
    if (squadFilter === 'CEDIDOS') return p.isLoanedOut || p.isLoanedIn;
    if (squadFilter === 'LESIONADOS') return p.isInjured;
    if (squadFilter === 'SANCIONADOS') return p.isSuspended;
    const cat = p.squadCategory || 'PRIMER_EQUIPO';
    return cat === squadFilter;
  });

  // Database players for transfer market search
  const allWorldPlayers = Object.values(gameSave.players).filter((p) => !p.isRetired);
  const filteredMarketPlayers = allWorldPlayers.filter((p) => {
    if (p.clubId === club.id) return false;
    if (positionFilter !== 'TODAS' && p.primaryPosition !== positionFilter) return false;
    if (searchQuery) {
      const full = `${p.firstName} ${p.lastName}`.toLowerCase();
      if (!full.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  }).slice(0, 50);

  // Move player between squads
  const handleMoveSquad = (player: Player, targetCat: SquadCategory) => {
    playClickSound();
    const updated = changePlayerSquadLevel(player, targetCat);
    onUpdateClub(club, { [player.id]: updated });
  };

  // Toggle Transfer list
  const handleToggleTransferList = (player: Player) => {
    playClickSound();
    const updated: Player = {
      ...player,
      isTransferListed: !player.isTransferListed,
    };
    onUpdateClub(club, { [player.id]: updated });
  };

  // Sign youth candidate
  const handleSignYouth = (cand: YouthAcademyCandidate) => {
    playClickSound();
    const newPlayer = signYouthCandidate(cand, club.id);
    const updatedClub: Club = {
      ...club,
      playerIds: [...club.playerIds, newPlayer.id],
    };
    const updatedCandidates = youthIntakeList.filter((c) => c.id !== cand.id);
    setYouthIntakeList(updatedCandidates);
    onUpdateClub(updatedClub, { [newPlayer.id]: newPlayer });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white font-condensed uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Dirección Deportiva y Secretaría Técnica — {club.name}
            </h2>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono-num ${
              windowStatus.isOpen ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              VENTANA {windowStatus.windowName}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Gestión de plantillas (1er Equipo, Filial y Juveniles), red de ojeadores, negociaciones de fichajes y desarrollo de cantera.
          </p>
        </div>

        {/* Financial & Squad quotas badge */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl shrink-0 font-mono-num text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fichas 1er Equipo</span>
            <span className="font-bold text-slate-200">
              {allClubPlayers.filter((p) => (p.squadCategory || 'PRIMER_EQUIPO') === 'PRIMER_EQUIPO').length} / 25
            </span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Presupuesto Fichajes</span>
            <span className="font-bold text-emerald-400">
              {club.finances.transferBudget.toLocaleString()} €
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'plantillas', label: 'Estructura de Plantillas', icon: Users },
            { id: 'mercado', label: 'Mercado de Fichajes', icon: ArrowRightLeft },
            { id: 'ojeadores', label: 'Red de Ojeadores (Scouting)', icon: Eye },
            { id: 'cuerpo_tecnico', label: 'Cuerpo Técnico & Staff', icon: Shield },
            { id: 'cantera', label: 'Cantera & Promesas', icon: GraduationCap },
            { id: 'evolucion', label: 'Evolución & Retiradas', icon: TrendingUp },
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
      </div>

      {/* SUBTAB 1: ESTRUCTURA DE PLANTILLAS */}
      {activeSubTab === 'plantillas' && (
        <div className="space-y-4">
          {/* Squad Level Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'PRIMER_EQUIPO', label: 'Primer Equipo (A)' },
                { id: 'FILIAL_B', label: 'Filial Dependiente (B)' },
                { id: 'JUVENIL_SUB19', label: 'Juvenil (Sub-19)' },
                { id: 'CEDIDOS', label: 'Jugadores Cedidos' },
                { id: 'LESIONADOS', label: 'Enfermería' },
                { id: 'SANCIONADOS', label: 'Sancionados' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    playClickSound();
                    setSquadFilter(filter.id as any);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    squadFilter === filter.id
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950/60'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <span className="text-slate-400 font-mono-num">
              {filteredSquadPlayers.length} futbolistas
            </span>
          </div>

          {/* Squad Players Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-num">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
                    <th className="py-3 px-3">Dorsal</th>
                    <th className="py-3 px-3">Futbolista</th>
                    <th className="py-3 px-3 text-center">Pos</th>
                    <th className="py-3 px-3 text-center">Edad</th>
                    <th className="py-3 px-3 text-center">Media</th>
                    <th className="py-3 px-3 text-center">Potencial</th>
                    <th className="py-3 px-3">Sueldo Semanal</th>
                    <th className="py-3 px-3">Fin Contrato</th>
                    <th className="py-3 px-3">Estado / Moral</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredSquadPlayers.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono-num font-bold text-slate-400">
                        #{p.squadNumber || idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white text-xs">{p.firstName} {p.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-mono-num">
                          Valor: {p.marketValue.toLocaleString()} €
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono-num">
                          {p.primaryPosition}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono-num text-slate-300">{p.age}</td>
                      <td className="py-2.5 px-3 text-center font-mono-num font-bold text-emerald-400">{p.overallRating}</td>
                      <td className="py-2.5 px-3 text-center font-mono-num text-slate-400">{p.potential}</td>
                      <td className="py-2.5 px-3 font-mono-num text-slate-300">{(p.contract?.wagePerWeek || 500).toLocaleString()} €</td>
                      <td className="py-2.5 px-3 font-mono-num text-slate-400">{p.contract?.contractEndYear || 2027}</td>
                      <td className="py-2.5 px-3">
                        {p.isInjured ? (
                          <span className="text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                            Lesión ({p.injuryWeeksLeft || 2} sem.)
                          </span>
                        ) : p.isSuspended ? (
                          <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                            Sancionado
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            Disponible ({p.morale || 85}% Moral)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.squadCategory !== 'PRIMER_EQUIPO' && (
                            <button
                              onClick={() => handleMoveSquad(p, 'PRIMER_EQUIPO')}
                              title="Promocionar al Primer Equipo"
                              className="px-2 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30 rounded text-[11px] font-bold"
                            >
                              Subir al 1º
                            </button>
                          )}
                          {p.squadCategory !== 'FILIAL_B' && (
                            <button
                              onClick={() => handleMoveSquad(p, 'FILIAL_B')}
                              title="Asignar al Filial B"
                              className="px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-[11px]"
                            >
                              Filial B
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleTransferList(p)}
                            className={`px-2 py-1 rounded text-[11px] font-medium ${
                              p.isTransferListed
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {p.isTransferListed ? 'Transferible' : 'Hacer Transferible'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MERCADO DE FICHAJES Y NEGOCIACIONES */}
      {activeSubTab === 'mercado' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar futbolista por nombre o apellido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none flex-1"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Demarcación:</span>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200"
              >
                <option value="TODAS">Todas</option>
                <option value="POR">Portero (POR)</option>
                <option value="DFC">Central (DFC)</option>
                <option value="LD">Lateral Dcho (LD)</option>
                <option value="LI">Lateral Izdo (LI)</option>
                <option value="MCD">Pivote (MCD)</option>
                <option value="MC">Mediocentro (MC)</option>
                <option value="MCO">Mediapunta (MCO)</option>
                <option value="ED">Extremo Dcho (ED)</option>
                <option value="EI">Extremo Izdo (EI)</option>
                <option value="DC">Delantero (DC)</option>
              </select>
            </div>
          </div>

          {/* Market Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketPlayers.map((player) => {
              const currentClub = player.clubId ? gameSave.clubs[player.clubId] : null;
              return (
                <div
                  key={player.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono-num">
                        {player.primaryPosition} · {player.overallRating} OVR
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono-num">
                        {player.age} años
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm font-condensed uppercase truncate">
                      {player.firstName} {player.lastName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {currentClub?.name || 'Agente Libre (Sin Club)'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 font-mono-num text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor de Mercado:</span>
                      <span className="font-bold text-emerald-400">{player.marketValue.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Sueldo Actual:</span>
                      <span className="text-slate-200">{(player.contract?.wagePerWeek || 500).toLocaleString()} € / sem</span>
                    </div>

                    <button
                      onClick={() => {
                        playClickSound();
                        setSelectedPlayerToNegotiate(player);
                      }}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 font-sans"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Iniciar Negociación Trilateral</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: RED DE OJEADORES (SCOUTING) */}
      {activeSubTab === 'ojeadores' && (
        <div className="space-y-6">
          {/* Active Scouts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                Cuerpo de Ojeadores Oficiales del Club
              </h3>
              <span className="text-[11px] text-slate-400 font-mono-num">
                {(club.scouts || INITIAL_SCOUTS_POOL).length} ojeadores en plantilla
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              {(club.scouts || INITIAL_SCOUTS_POOL).map((scout) => {
                const isOnMission = (scout.activeMissionDaysLeft || 0) > 0;
                const weeksLeft = Math.ceil((scout.activeMissionDaysLeft || 0) / 7);

                return (
                  <div key={scout.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white text-sm font-condensed uppercase">{scout.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono-num">{scout.nationality}</span>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono-num">
                          {scout.salaryWeekly} € / sem
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-400 font-mono-num text-[11px]">
                        <div className="flex justify-between"><span>Conocimiento Mercado:</span><span className="text-emerald-400 font-bold">{scout.marketKnowledge} / 20</span></div>
                        <div className="flex justify-between"><span>Juzgar Habilidad:</span><span className="text-slate-200">{scout.judgingAbility} / 20</span></div>
                        <div className="flex justify-between"><span>Juzgar Potencial:</span><span className="text-amber-400 font-bold">{scout.judgingPotential} / 20</span></div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px]">
                        <div className="text-slate-300">
                          Misión: <span className="text-sky-400 font-medium">{scout.assignedRegion || 'España'}</span>
                        </div>
                        {isOnMission ? (
                          <div className="mt-1.5 bg-sky-950/60 border border-sky-500/40 rounded-lg p-2 text-[10px]">
                            <div className="flex items-center justify-between text-sky-300 font-bold mb-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-spin text-sky-400" /> En Misión Activa
                              </span>
                              <span>~{weeksLeft} sem. restantes</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-sky-400 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(15, 100 - weeksLeft * 25))}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1 font-mono-num">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Disponible para asignación
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playClickSound();
                        setSelectedScoutForMission(scout);
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isOnMission ? 'Reasignar Misión' : 'Asignar Misión de Ojeo'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scout Reports Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-sky-400" />
              Informes de Ojeo Recientes ({gameSave.scoutReports?.length || 0})
            </h3>

            <div className="space-y-3">
              {(gameSave.scoutReports || []).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl">
                  Tus ojeadores están rastreando competiciones y ligas. Asigna misiones específicas arriba para recibir informes técnicos detallados con precisión de atributos.
                </div>
              ) : (
                gameSave.scoutReports?.map((rep) => (
                  <div key={rep.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans hover:border-slate-700 transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rep.playerName}</span>
                        <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded font-mono-num">{rep.position}</span>
                        <span className="text-[10px] text-slate-400 font-mono-num">{rep.age} años</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          rep.recommendation === 'FICHAJE_PRIORITARIO' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {rep.recommendation.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Club: <strong className="text-slate-300">{rep.currentClubName}</strong> · Ojeado por {rep.scoutName} (<strong className="text-emerald-400">{rep.accuracyPct}% precisión</strong>) · {rep.generatedDate}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                        {rep.pros?.slice(0, 2).map((pro, i) => (
                          <span key={i} className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                            + {pro}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono-num shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Coste Estimado</span>
                        <span className="text-emerald-400 font-bold">{rep.estimatedCostMin.toLocaleString()} €</span>
                      </div>
                      <button
                        onClick={() => {
                          playClickSound();
                          const target = gameSave.players[rep.playerId];
                          if (target) setSelectedPlayerToNegotiate(target);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow font-sans"
                      >
                        Negociar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mission Assignment Modal */}
          {selectedScoutForMission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-sky-400" />
                    <h3 className="font-black text-white text-base font-condensed uppercase tracking-wider">
                      Asignar Misión de Ojeo: {selectedScoutForMission.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedScoutForMission(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {/* Region */}
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1 font-condensed">
                      Región Geográfica o Competición
                    </label>
                    <select
                      value={missionRegion}
                      onChange={(e) => setMissionRegion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-xs focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="España / Nacional">España / Nacional (LaLiga y Categorías RFEF)</option>
                      <option value="Cataluña y Levante">Cataluña y Levante (Canteras y Fútbol Catalán)</option>
                      <option value="Portugal y Sudamérica">Portugal y Sudamérica (Brasil, Argentina, Colombia)</option>
                      <option value="Europa Central y Occidental">Europa Central y Occidental (Alemania, Francia, Inglaterra, Países Bajos)</option>
                      <option value="África y Mercados Emergentes">África y Mercados Emergentes (Marruecos, Senegal, Nigeria)</option>
                      <option value="Universo Intergaláctico (200 Años)">Universo Intergaláctico (División Galáctica y Jóvenes Extraterrestres)</option>
                    </select>
                  </div>

                  {/* Position */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1 font-condensed">
                        Demarcación Prioritaria
                      </label>
                      <select
                        value={missionPosition}
                        onChange={(e) => setMissionPosition(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-sans text-xs"
                      >
                        <option value="TODAS">Todas las Posiciones</option>
                        <option value="POR">Portero (POR)</option>
                        <option value="DF">Defensa Central / Lateral (DF)</option>
                        <option value="MC">Centrocampista / Pivote (MC)</option>
                        <option value="DC">Delantero Centro / Extremo (DC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1 font-condensed">
                        Rango de Edad
                      </label>
                      <select
                        value={missionAgeRange}
                        onChange={(e) => setMissionAgeRange(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-sans text-xs"
                      >
                        <option value="TODAS">Cualquier Edad</option>
                        <option value="SUB20">Sub-20 (Jóvenes Promesas y Wonderkids)</option>
                        <option value="21_26">21 a 26 años (Pleno Rendimiento)</option>
                        <option value="VETERANOS">27+ años (Veteranos y Liderazgo)</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1 font-condensed">
                      Duración del Seguimiento Técnico
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[2, 3, 4].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setMissionWeeks(w)}
                          className={`py-2 px-3 rounded-lg border font-mono-num font-bold text-xs transition-all ${
                            missionWeeks === w
                              ? 'bg-sky-600 text-white border-sky-400 shadow'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {w} Semanas ({w * 7} días)
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      A mayor duración, mayor profundidad técnica del informe y mayor precisión de los atributos ocultos.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedScoutForMission(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLaunchScoutMission}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Lanzar Misión de Ojeo</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: CUERPO TÉCNICO Y GESTIÓN DE EMPLEADOS */}
      {activeSubTab === 'cuerpo_tecnico' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Cuerpo Técnico, Servicios Médicos y Staff Especializado
                </h3>
                <p className="text-xs text-slate-400">
                  La moral y cualificación del cuerpo técnico influye de manera decisiva en la preparación de partidos, recuperación de lesionados y desarrollo de canteranos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              {(club.staffMembers || INITIAL_STAFF_MEMBERS).map((member) => {
                const moraleColor =
                  member.morale >= 75 ? 'text-emerald-400' : member.morale >= 50 ? 'text-amber-400' : 'text-rose-400';
                const moraleBg =
                  member.morale >= 75 ? 'bg-emerald-500' : member.morale >= 50 ? 'bg-amber-500' : 'bg-rose-500';

                return (
                  <div key={member.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3.5 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-condensed tracking-wider">
                          {member.role}
                        </span>
                        <h4 className="font-bold text-white text-base font-condensed uppercase mt-1">
                          {member.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono-num">
                          {member.age} años · {member.nationality}
                        </span>
                      </div>
                      <div className="text-right font-mono-num">
                        <span className="text-xs text-white font-bold block">{member.salaryWeekly.toLocaleString()} €</span>
                        <span className="text-[10px] text-slate-500">por semana</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <div className="flex justify-between font-mono-num">
                        <span className="text-slate-400">Habilidad Profesional:</span>
                        <span className="text-white font-bold">{member.ability} / 20</span>
                      </div>
                      <div className="flex justify-between items-center font-mono-num">
                        <span className="text-slate-400">Moral del Empleado:</span>
                        <span className={`font-bold ${moraleColor}`}>{member.morale}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${moraleBg} transition-all`}
                          style={{ width: `${member.morale}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 italic pt-1">
                        Especialidad: {member.specialty}
                      </p>
                    </div>

                    {/* Active Staff Request */}
                    {member.activeRequest && (
                      <div className={`p-3 rounded-xl border space-y-2 ${
                        member.activeRequest.status === 'APROBADA'
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                          : member.activeRequest.status === 'RECHAZADA'
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                          : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      }`}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold uppercase font-condensed tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Petición: {member.activeRequest.title}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded font-mono-num uppercase ${
                            member.activeRequest.status === 'APROBADA'
                              ? 'bg-emerald-900 text-emerald-200'
                              : member.activeRequest.status === 'RECHAZADA'
                              ? 'bg-rose-900 text-rose-200'
                              : 'bg-amber-900 text-amber-200'
                          }`}>
                            {member.activeRequest.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300">
                          {member.activeRequest.description}
                        </p>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono-num pt-1 border-t border-slate-800">
                          <span>Coste: <strong className="text-white">{member.activeRequest.cost.toLocaleString()} €</strong></span>
                          <span>Consecuencia: {member.activeRequest.consequenceText}</span>
                        </div>

                        {member.activeRequest.status === 'PENDIENTE' && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleResolveStaff(member.id, true)}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow font-sans"
                            >
                              Aprobar Solicitud
                            </button>
                            <button
                              onClick={() => handleResolveStaff(member.id, false)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 font-bold text-xs rounded-lg border border-slate-700 font-sans"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CANTERA Y ACADEMIA */}
      {activeSubTab === 'cantera' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  Academia Formativa y Camada Anual de Juveniles (Intake)
                </h3>
                <p className="text-xs text-slate-400">
                  Nivel de Instalaciones de Cantera: {club.facilities?.youthAcademyLevel || 2} / 5
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youthIntakeList.map((cand) => (
                <div key={cand.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono-num">
                        {cand.primaryPosition} · {cand.overallRating} OVR
                      </span>
                      <span className="text-slate-400 font-mono-num text-[11px]">{cand.age} años</span>
                    </div>
                    <h4 className="font-bold text-white text-sm font-condensed uppercase">{cand.firstName} {cand.lastName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Personalidad: {cand.personality}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 font-mono-num text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rango de Potencial:</span>
                      <span className="font-bold text-amber-400">{cand.potentialMin} - {cand.potentialMax}</span>
                    </div>

                    <button
                      onClick={() => handleSignYouth(cand)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow font-sans flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Firmar Contrato Formativo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: EVOLUCIÓN Y ENVEJECIMIENTO */}
      {activeSubTab === 'evolucion' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-sans">
          <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Desarrollo Físico-Técnico y Gestión de Madurez / Retiradas
          </h3>
          <p className="text-xs text-slate-400">
            Los futbolistas jóvenes progresan semana a semana en base a minutos e instalaciones. A partir de los 31 años, los jugadores pierden velocidad y resistencia de forma biológicamente realista mientras consolidan atributos tácticos y de liderazgo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 uppercase text-[10px] block">Jóvenes en Máxima Proyección (Sub-22)</span>
              <div className="space-y-1.5">
                {allClubPlayers.filter((p) => p.age <= 22).slice(0, 5).map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-900 font-mono-num">
                    <span className="text-slate-200 font-sans">{p.firstName} {p.lastName} ({p.age} a)</span>
                    <span className="text-emerald-400 font-bold">{p.overallRating} ➔ Pot. {p.potential}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <span className="font-bold text-amber-400 uppercase text-[10px] block">Veteranos y Planificación de Retiradas (31+ años)</span>
              <div className="space-y-1.5">
                {allClubPlayers.filter((p) => p.age >= 31).slice(0, 5).map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-900 font-mono-num">
                    <span className="text-slate-200 font-sans">{p.firstName} {p.lastName} ({p.age} a)</span>
                    <span className="text-slate-400">Contrato hasta {p.contract?.contractEndYear || 2027}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Negotiation Modal */}
      {selectedPlayerToNegotiate && (
        <TransferNegotiationModal
          isOpen={Boolean(selectedPlayerToNegotiate)}
          player={selectedPlayerToNegotiate}
          buyerClub={club}
          sellerClub={selectedPlayerToNegotiate.clubId ? gameSave.clubs[selectedPlayerToNegotiate.clubId] : null}
          gameSave={gameSave}
          onClose={() => setSelectedPlayerToNegotiate(null)}
          onFinalizeTransfer={onFinalizeTransfer}
        />
      )}
    </div>
  );
};
