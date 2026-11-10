import React, { useState } from 'react';
import { Club } from '../../types/club';
import { GameSave, NewsItem } from '../../types/game';
import { Player, Position } from '../../types/player';
import { ensureClubTacticsState } from '../../engine/tacticsEngine';
import { playClickSound } from '../../utils/audio';
import { PitchFormationEditor } from '../tactics/PitchFormationEditor';
import { TeamInstructionsView } from '../tactics/TeamInstructionsView';
import { IndividualInstructionsView } from '../tactics/IndividualInstructionsView';
import { SetPiecesAndEligibilityView } from '../tactics/SetPiecesAndEligibilityView';
import { WeeklyTrainingView } from '../tactics/WeeklyTrainingView';
import { OpponentAndPressView } from '../tactics/OpponentAndPressView';
import { 
  Users, 
  Shield, 
  Zap, 
  Heart, 
  Coins, 
  Sliders, 
  UserCheck, 
  Calendar, 
  Eye, 
  Mic, 
  Activity, 
  Award,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';

interface SquadViewProps {
  gameSave: GameSave;
  onUpdateClub: (updatedClub: Club, updatedPlayers?: Record<string, Player>, newsItem?: NewsItem) => void;
  onSelectPlayer?: (player: Player) => void;
  initialSubTab?: SquadSubTab;
}

export type SquadSubTab = 
  | 'pizarra'
  | 'instrucciones'
  | 'individuales'
  | 'especialistas'
  | 'entrenamiento'
  | 'analisis_prensa'
  | 'plantilla';

export const SquadView: React.FC<SquadViewProps> = ({
  gameSave,
  onUpdateClub,
  onSelectPlayer,
  initialSubTab = 'pizarra',
}) => {
  const club = ensureClubTacticsState(gameSave.clubs[gameSave.userClubId], gameSave.players);
  const [activeSubTab, setActiveSubTab] = useState<SquadSubTab>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [inspectPlayerId, setInspectPlayerId] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allPlayers = (club.playerIds || []).map((id) => gameSave.players[id]).filter(Boolean);
  const starters = (club.startingElevenIds || []).map((id) => gameSave.players[id]).filter(Boolean);
  const bench = (club.benchPlayerIds || []).map((id) => gameSave.players[id]).filter(Boolean);

  const starterOvrAvg = starters.length > 0
    ? Math.round(starters.reduce((acc, p) => acc + p.overallRating, 0) / starters.length)
    : 0;

  const inspectedPlayer = inspectPlayerId ? gameSave.players[inspectPlayerId] : null;

  // Filtered players for the Plantilla table
  const filteredPlayers = allPlayers.filter((p) => {
    if (positionFilter !== 'TODOS' && p.primaryPosition !== positionFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      return fullName.includes(q) || p.primaryPosition.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Professional Manager Suite Navigation (PC Fútbol style) */}
      <div className="pcf-panel rounded-2xl p-3 shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b-2 border-slate-700/80 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-300 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Sliders className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white font-condensed uppercase tracking-wider drop-shadow">
                Dirección Deportiva y Táctica Profesional
              </h2>
              <span className="text-[11px] text-slate-300 font-condensed tracking-wide">
                Gestión táctica de alineación, pizarra de juego, roles individuales y calendario semanal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-num">
            <div className="bg-[#101b33] px-3 py-1.5 rounded-xl border border-slate-700 shadow-inner">
              <span className="text-[9px] text-slate-400 uppercase font-condensed tracking-wider font-bold block">Esquema Actual</span>
              <span className="font-black text-emerald-400">{club.tacticFormation || '4-3-3'}</span>
            </div>
            <div className="bg-[#101b33] px-3 py-1.5 rounded-xl border border-slate-700 shadow-inner flex items-center gap-2">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-condensed tracking-wider font-bold block">Media Titular</span>
                <span className="font-black text-amber-300">{starterOvrAvg} OVR</span>
              </div>
              <span className="pcf-rating-badge pcf-rating-super text-xs px-2 py-0.5">
                {starterOvrAvg}
              </span>
            </div>
            <div className="bg-[#101b33] px-3 py-1.5 rounded-xl border border-slate-700 shadow-inner">
              <span className="text-[9px] text-slate-400 uppercase font-condensed tracking-wider font-bold block">Convocados</span>
              <span className="font-black text-slate-200">{starters.length + bench.length}/{allPlayers.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1">
          {[
            { id: 'pizarra', label: '1. Pizarra & Esquema', icon: Activity, badge: club.tacticFormation },
            { id: 'instrucciones', label: '2. Táctica Colectiva', icon: Sliders, badge: club.teamInstructions?.estiloJuego || 'Equilibrado' },
            { id: 'individuales', label: '3. Roles Individuales', icon: Users, badge: `${starters.length} Titulares` },
            { id: 'especialistas', label: '4. Especialistas & Balón Parado', icon: Award, badge: 'Capitán & Faltas' },
            { id: 'entrenamiento', label: '5. Calendario Entrenamiento', icon: Calendar, badge: `Carga ${club.weeklyTraining?.collectiveIntensity || 'Media'}` },
            { id: 'analisis_prensa', label: '6. Rival, Prensa & Vestuario', icon: Eye, badge: 'Scouting' },
            { id: 'plantilla', label: '7. Ficha Plantilla Completa', icon: UserCheck, badge: `${allPlayers.length} Jug.` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveSubTab(tab.id as SquadSubTab);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold font-condensed uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-mono-num px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab Content Area */}
      <div>
        {/* 1. Pizarra & Formación Interactiva con 8 Presets + Personalizada y Drag/Nudge */}
        {activeSubTab === 'pizarra' && (
          <PitchFormationEditor
            club={club}
            playersMap={gameSave.players}
            onUpdateClub={(updated) => onUpdateClub(updated)}
          />
        )}

        {/* 2. Instrucciones Colectivas (16 Parámetros Tácticos) */}
        {activeSubTab === 'instrucciones' && (
          <TeamInstructionsView
            club={club}
            onUpdateClub={(updated) => onUpdateClub(updated)}
          />
        )}

        {/* 3. Instrucciones Individuales (Roles, Mentalidad, Instrucciones con/sin balón) */}
        {activeSubTab === 'individuales' && (
          <IndividualInstructionsView
            club={club}
            playersMap={gameSave.players}
            onUpdateClub={(updated) => onUpdateClub(updated)}
          />
        )}

        {/* 4. Especialistas & Balón Parado, Sustituciones Planificadas y Elegibilidad */}
        {activeSubTab === 'especialistas' && (
          <SetPiecesAndEligibilityView
            club={club}
            playersMap={gameSave.players}
            onUpdateClub={(updated) => onUpdateClub(updated)}
          />
        )}

        {/* 5. Calendario de Entrenamiento Semanal (L-D Mañana/Tarde y Cargas) */}
        {activeSubTab === 'entrenamiento' && (
          <WeeklyTrainingView
            club={club}
            playersMap={gameSave.players}
            onUpdateClub={(updated) => onUpdateClub(updated)}
          />
        )}

        {/* 6. Análisis del Próximo Rival, Rueda de Prensa y Vestuario */}
        {activeSubTab === 'analisis_prensa' && (
          <OpponentAndPressView
            gameSave={gameSave}
            club={club}
            onUpdateClub={(updated, playerDeltas, news) => onUpdateClub(updated, playerDeltas, news)}
          />
        )}

        {/* 7. Tabla Detallada de Plantilla con Dossier */}
        {activeSubTab === 'plantilla' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wider">
                  Plantilla Oficial Registrada ({allPlayers.length} futbolistas)
                </h3>
                <p className="text-xs text-slate-400">
                  Consulta de rendimiento físico, salarios semanales, contratos y acceso al expediente deportivo
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar jugador..."
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 w-44"
                  />
                </div>

                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="TODOS">Todas las posiciones</option>
                  <option value="POR">Porteros (POR)</option>
                  <option value="DFC">Defensas Centrales (DFC)</option>
                  <option value="LD">Laterales Derechos (LD)</option>
                  <option value="LI">Laterales Izquierdos (LI)</option>
                  <option value="MCD">Pivotes Defensivos (MCD)</option>
                  <option value="MC">Mediocentros (MC)</option>
                  <option value="MCO">Mediapuntas (MCO)</option>
                  <option value="ED">Extremos Derechos (ED)</option>
                  <option value="EI">Extremos Izquierdos (EI)</option>
                  <option value="DC">Delanteros Centro (DC)</option>
                </select>
              </div>
            </div>

            {/* PC Fútbol 2001 Style Simulation Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl bg-slate-950/90">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b-2 border-slate-700 text-slate-300 text-[10px] uppercase font-condensed tracking-wider">
                    <th className="py-2.5 px-2.5 text-center w-10">Nº</th>
                    <th className="py-2.5 px-3">Jugador</th>
                    <th className="py-2.5 px-2 text-center">Valoración</th>
                    <th className="py-2.5 px-2 text-center">Dem</th>
                    <th className="py-2.5 px-2 text-center">Pos</th>
                    <th className="py-2.5 px-2 text-center">Media</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-2 text-center">Física</th>
                    <th className="py-2.5 px-2 text-center">Moral</th>
                    <th className="py-2.5 px-2 text-center">PJ</th>
                    <th className="py-2.5 px-2 text-center">Goles</th>
                    <th className="py-2.5 px-3 text-right">Sueldo/Sem</th>
                    <th className="py-2.5 px-3 text-center">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono-num">
                  {filteredPlayers.map((p, idx) => {
                    const isStarter = club.startingElevenIds.includes(p.id);
                    const isBench = club.benchPlayerIds.includes(p.id);
                    const isFirstBench = isBench && club.benchPlayerIds[0] === p.id;
                    const isFirstReserve = !isStarter && !isBench && idx === 0;

                    // Calculate stars based on overall rating
                    const starCount = Math.max(1, Math.min(5, Math.round((p.overallRating - 50) / 10)));

                    // Overall rating badge color (PC Fútbol red/crimson for top players)
                    const getRatingBadgeClass = (ovr: number) => {
                      if (ovr >= 85) return 'pcf-rating-super';
                      if (ovr >= 75) return 'pcf-rating-high';
                      if (ovr >= 65) return 'pcf-rating-mid';
                      return 'pcf-rating-low';
                    };

                    // Mini pitch marker position
                    let dotLeft = '50%';
                    let dotTop = '50%';
                    if (p.primaryPosition === 'POR') { dotLeft = '18%'; dotTop = '50%'; }
                    else if (p.primaryPosition === 'DFC') { dotLeft = '32%'; dotTop = '50%'; }
                    else if (p.primaryPosition === 'LD') { dotLeft = '32%'; dotTop = '80%'; }
                    else if (p.primaryPosition === 'LI') { dotLeft = '32%'; dotTop = '20%'; }
                    else if (p.primaryPosition === 'MCD') { dotLeft = '48%'; dotTop = '50%'; }
                    else if (p.primaryPosition === 'MC') { dotLeft = '55%'; dotTop = '50%'; }
                    else if (p.primaryPosition === 'MCO') { dotLeft = '65%'; dotTop = '50%'; }
                    else if (p.primaryPosition === 'ED') { dotLeft = '75%'; dotTop = '80%'; }
                    else if (p.primaryPosition === 'EI') { dotLeft = '75%'; dotTop = '20%'; }
                    else if (p.primaryPosition === 'DC') { dotLeft = '85%'; dotTop = '50%'; }

                    return (
                      <React.Fragment key={p.id}>
                        <tr className="hover:bg-slate-850/80 transition-colors border-b border-slate-800/50">
                          {/* Dorsal */}
                          <td className="py-2 px-2 text-center">
                            <span className="w-6 h-6 inline-flex items-center justify-center rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold text-[11px]">
                              {p.squadNumber || idx + 1}
                            </span>
                          </td>

                          {/* Name + Nationality */}
                          <td className="py-2 px-3 font-sans">
                            <button
                              onClick={() => {
                                playClickSound();
                                if (onSelectPlayer) {
                                  onSelectPlayer(p);
                                } else {
                                  setInspectPlayerId(p.id);
                                }
                              }}
                              className="hover:text-emerald-300 text-left transition-colors flex items-center gap-2 group"
                            >
                              <span className="font-bold text-slate-100 group-hover:underline">
                                {p.firstName} {p.lastName}
                              </span>
                              <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                                {p.nationality}
                              </span>
                            </button>
                          </td>

                          {/* Stars */}
                          <td className="py-2 px-2 text-center text-amber-400 text-xs tracking-tighter">
                            {'★'.repeat(starCount)}
                          </td>

                          {/* Mini Tactical Pitch Indicator (DEM) */}
                          <td className="py-2 px-2 text-center">
                            <div className="w-6 h-4 bg-emerald-900/90 rounded-xs border border-emerald-500/40 relative overflow-hidden inline-block shadow-inner" title={`Demarcación: ${p.primaryPosition}`}>
                              <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-white/30" />
                              <div 
                                className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 border border-slate-950 shadow" 
                                style={{ left: dotLeft, top: dotTop, transform: 'translate(-50%, -50%)' }} 
                              />
                            </div>
                          </td>

                          {/* Position Badge */}
                          <td className="py-2 px-2 text-center">
                            <span className="text-[11px] font-bold text-slate-200 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                              {p.primaryPosition}
                            </span>
                          </td>

                          {/* PC Fútbol Overall Rating Badge */}
                          <td className="py-2 px-2 text-center">
                            <span className={`pcf-rating-badge text-xs ${getRatingBadgeClass(p.overallRating)}`}>
                              {p.overallRating}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-2 px-3 whitespace-nowrap">
                            {p.isInjured ? (
                              <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 border border-rose-700/60 px-2 py-0.5 rounded">
                                LES ({p.injuryWeeksLeft || 1}s)
                              </span>
                            ) : p.isSuspended ? (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded">
                                SANC ({p.suspensionMatchesLeft || 1}p)
                              </span>
                            ) : isStarter ? (
                              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded">
                                TITULAR
                              </span>
                            ) : isBench ? (
                              <span className="text-[10px] font-bold text-sky-300 bg-sky-950/80 border border-sky-600/50 px-2 py-0.5 rounded">
                                BANCA
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                RESERVA
                              </span>
                            )}
                          </td>

                          {/* Fitness */}
                          <td className="py-2 px-2 text-center">
                            <span className={`font-semibold ${
                              p.fitness >= 90 ? 'text-emerald-400' : p.fitness >= 75 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {p.fitness}%
                            </span>
                          </td>

                          {/* Morale */}
                          <td className="py-2 px-2 text-center">
                            <span className={`font-semibold ${
                              p.morale >= 80 ? 'text-emerald-400' : p.morale >= 60 ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              {p.morale}%
                            </span>
                          </td>

                          {/* Matches */}
                          <td className="py-2 px-2 text-center text-slate-300">
                            {p.seasonStats?.matchesPlayed || 0}
                          </td>

                          {/* Goals */}
                          <td className="py-2 px-2 text-center text-emerald-400 font-bold">
                            {p.seasonStats?.goals || 0}
                          </td>

                          {/* Wages */}
                          <td className="py-2 px-3 text-right text-slate-300 font-mono-num">
                            {p.contract.wagePerWeek.toLocaleString()} €
                          </td>

                          {/* Action Button */}
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => {
                                playClickSound();
                                if (onSelectPlayer) {
                                  onSelectPlayer(p);
                                } else {
                                  setInspectPlayerId(p.id);
                                }
                              }}
                              className="pcf-btn px-2.5 py-1 text-[11px] rounded transition-all"
                            >
                              Ver Ficha
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Player Detail Dossier Modal */}
      {inspectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg font-condensed">
                  {inspectedPlayer.primaryPosition}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {inspectedPlayer.firstName} {inspectedPlayer.lastName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {inspectedPlayer.age} años · {inspectedPlayer.nationality} · Valor: {inspectedPlayer.marketValue.toLocaleString()} €
                  </span>
                </div>
              </div>
              <div className="text-right font-mono-num">
                <span className="text-[10px] text-slate-400 uppercase block">Media General</span>
                <span className="text-2xl font-black text-emerald-400">{inspectedPlayer.overallRating}</span>
              </div>
            </div>

            {/* Attributes Grid */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 font-condensed">
                Atributos Técnicos & Físicos
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono-num">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Tiro:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.disparo}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Pase:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.pase}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Regate:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.regate}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Defensa:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.defensa}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Velocidad:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.velocidad}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Resistencia:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.resistencia}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Fuerza:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.fuerza}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Visión:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.vision}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Liderazgo:</span>
                  <strong className="text-slate-100">{inspectedPlayer.attributes.liderazgo}</strong>
                </div>
              </div>
            </div>

            {/* Contract info */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Sueldo semanal:</span>
                <strong className="text-slate-200 font-mono-num">{inspectedPlayer.contract.wagePerWeek.toLocaleString()} € / sem</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vencimiento de contrato:</span>
                <strong className="text-slate-200 font-mono-num">Junio de {inspectedPlayer.contract.contractEndYear}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cláusula de rescisión:</span>
                <strong className="text-emerald-400 font-mono-num">{inspectedPlayer.contract.releaseClause.toLocaleString()} €</strong>
              </div>
            </div>

            {/* Actions: Transfer list toggle */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  playClickSound();
                  const updatedPlayer: Player = {
                    ...inspectedPlayer,
                    isTransferListed: !inspectedPlayer.isTransferListed,
                  };
                  onUpdateClub(club, { [inspectedPlayer.id]: updatedPlayer });
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  inspectedPlayer.isTransferListed
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {inspectedPlayer.isTransferListed ? 'Declarado Transferible (Retirar)' : 'Poner en Venta (Transferible)'}
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setInspectPlayerId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
