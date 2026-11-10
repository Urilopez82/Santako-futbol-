import React, { useState, useMemo, useEffect } from 'react';
import { 
  NATIONAL_TEAMS_80, 
  NationalTeam80, 
  NATIONAL_TEAMS_MAP 
} from '../../db/worldData/nationalTeams80';
import { 
  createWorldCupTournament, 
  simulateWorldCupMatch, 
  updateWorldCupGroupWithMatch, 
  advanceWorldCupTournament,
  simulateEntireWorldCupTournament,
  WORLD_CUP_HOST_CONFIGS,
  getHostConfigForYear,
  WorldCupMatch, 
  WorldCupTournamentState 
} from '../../engine/worldCupTournamentEngine';
import { getOrBuildNationalSquad } from '../../engine/nationalTeamsEngine';
import { Player } from '../../types/player';
import { playClickSound, playGoalSound, playWhistleSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Globe2, 
  Users, 
  Calendar, 
  Play, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Star, 
  Sparkles, 
  Flag, 
  Shield,
  RotateCcw,
  Zap,
  Medal,
  Crown
} from 'lucide-react';

interface WorldCupModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  playersMap: Record<string, Player>;
  initialTournament?: WorldCupTournamentState | null;
  onSaveTournament?: (t: WorldCupTournamentState) => void;
}

export const WorldCupModeModal: React.FC<WorldCupModeModalProps> = ({
  isOpen,
  onClose,
  playersMap,
  initialTournament,
  onSaveTournament,
}) => {
  // Configuration for new tournament
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('ESP');
  const [tournament, setTournament] = useState<WorldCupTournamentState | null>(initialTournament || null);
  const [activeTab, setActiveTab] = useState<'tactica' | 'convocatoria' | 'grupos' | 'eliminatorias' | 'estadisticas'>('tactica');
  const [formation, setFormation] = useState<string>('4-3-3');
  const [tacticalStyle, setTacticalStyle] = useState<string>('Ofensiva');
  const [selectedStarterIdx, setSelectedStarterIdx] = useState<number | null>(null);
  const [swappedStarters, setSwappedStarters] = useState<Player[]>([]);
  const [swappedBench, setSwappedBench] = useState<Player[]>([]);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);
  const [selectedStageTab, setSelectedStageTab] = useState<'r32' | 'r16' | 'qf' | 'sf' | 'final'>('r32');

  const userTeam = tournament ? NATIONAL_TEAMS_MAP[tournament.userTeamId] : NATIONAL_TEAMS_MAP[selectedCountryId];
  const userSquad = useMemo(() => {
    return userTeam ? getOrBuildNationalSquad(userTeam.id, playersMap) : null;
  }, [userTeam, playersMap]);

  // Synchronize starters and bench from userSquad
  useEffect(() => {
    if (userSquad) {
      setSwappedStarters(userSquad.starters);
      setSwappedBench(userSquad.bench);
    }
  }, [userSquad]);

  const handleSelectStarterForSwap = (idx: number) => {
    playClickSound();
    if (selectedStarterIdx === idx) {
      setSelectedStarterIdx(null);
    } else {
      setSelectedStarterIdx(idx);
    }
  };

  const handleSwapWithBench = (benchIdx: number) => {
    if (selectedStarterIdx === null) return;
    playClickSound();
    const newStarters = [...swappedStarters];
    const newBench = [...swappedBench];
    const temp = newStarters[selectedStarterIdx];
    newStarters[selectedStarterIdx] = newBench[benchIdx];
    newBench[benchIdx] = temp;
    setSwappedStarters(newStarters);
    setSwappedBench(newBench);
    setSelectedStarterIdx(null);
  };

  const handleResetLineup = () => {
    playClickSound();
    if (userSquad) {
      setSwappedStarters(userSquad.starters);
      setSwappedBench(userSquad.bench);
      setSelectedStarterIdx(null);
    }
  };

  if (!isOpen) return null;

  const currentHostConfig = getHostConfigForYear(selectedYear);

  const handleStartTournament = () => {
    playGoalSound();
    const newTournament = createWorldCupTournament(selectedCountryId, undefined, 48, selectedYear);
    setTournament(newTournament);
    if (onSaveTournament) onSaveTournament(newTournament);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleResetTournament = () => {
    playClickSound();
    setTournament(null);
  };

  const updateAndSaveTournament = (updated: WorldCupTournamentState) => {
    const progressed = advanceWorldCupTournament(updated);
    setTournament(progressed);
    if (onSaveTournament) onSaveTournament(progressed);
    if (progressed.currentStage === 'FINALIZADO') {
      playGoalSound();
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
    }
  };

  const handleSimulateMatch = (m: WorldCupMatch) => {
    if (!tournament) return;
    playWhistleSound();
    const simulated = simulateWorldCupMatch(m, playersMap);

    let updated = { ...tournament };

    // Group stage
    if (m.stage === 'GRUPO' && m.groupName) {
      updated.groups = updated.groups.map((g) => {
        if (g.name === m.groupName) {
          return updateWorldCupGroupWithMatch(g, simulated);
        }
        return g;
      });
    } else {
      // Knockout stages
      const replaceInList = (list: WorldCupMatch[]) =>
        list.map((match) => (match.id === m.id ? simulated : match));

      if (updated.bracketRoundOf32) updated.bracketRoundOf32 = replaceInList(updated.bracketRoundOf32);
      if (updated.bracketRoundOf16) updated.bracketRoundOf16 = replaceInList(updated.bracketRoundOf16);
      if (updated.bracketQuarterFinals) updated.bracketQuarterFinals = replaceInList(updated.bracketQuarterFinals);
      if (updated.bracketSemiFinals) updated.bracketSemiFinals = replaceInList(updated.bracketSemiFinals);
      if (updated.thirdPlaceMatch && updated.thirdPlaceMatch.id === m.id) updated.thirdPlaceMatch = simulated;
      if (updated.finalMatch && updated.finalMatch.id === m.id) updated.finalMatch = simulated;
    }

    updateAndSaveTournament(updated);

    // If user team won
    if (
      (simulated.homeTeamId === tournament.userTeamId && (simulated.homeScore || 0) > (simulated.awayScore || 0)) ||
      (simulated.awayTeamId === tournament.userTeamId && (simulated.awayScore || 0) > (simulated.homeScore || 0))
    ) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleSimulateGroupStage = () => {
    if (!tournament) return;
    playClickSound();

    let updatedGroups = tournament.groups.map((group) => {
      let g = { ...group };
      g.matches = g.matches.map((m) => {
        if (!m.played) {
          const sim = simulateWorldCupMatch(m, playersMap);
          g = updateWorldCupGroupWithMatch(g, sim);
          return sim;
        }
        return m;
      });
      return g;
    });

    let updated: WorldCupTournamentState = {
      ...tournament,
      groups: updatedGroups,
    };

    updateAndSaveTournament(updated);
    setActiveTab('eliminatorias');
    setSelectedStageTab('r32');
  };

  const handleSimulateCurrentKnockoutRound = () => {
    if (!tournament) return;
    playClickSound();

    let updated = { ...tournament };
    const simList = (list: WorldCupMatch[]) =>
      list.map((m) => (m.played ? m : simulateWorldCupMatch(m, playersMap)));

    if (selectedStageTab === 'r32' && updated.bracketRoundOf32.length > 0) {
      updated.bracketRoundOf32 = simList(updated.bracketRoundOf32);
      setSelectedStageTab('r16');
    } else if (selectedStageTab === 'r16' && updated.bracketRoundOf16.length > 0) {
      updated.bracketRoundOf16 = simList(updated.bracketRoundOf16);
      setSelectedStageTab('qf');
    } else if (selectedStageTab === 'qf' && updated.bracketQuarterFinals.length > 0) {
      updated.bracketQuarterFinals = simList(updated.bracketQuarterFinals);
      setSelectedStageTab('sf');
    } else if (selectedStageTab === 'sf' && updated.bracketSemiFinals.length > 0) {
      updated.bracketSemiFinals = simList(updated.bracketSemiFinals);
      setSelectedStageTab('final');
    } else if (selectedStageTab === 'final') {
      if (updated.thirdPlaceMatch && !updated.thirdPlaceMatch.played) {
        updated.thirdPlaceMatch = simulateWorldCupMatch(updated.thirdPlaceMatch, playersMap);
      }
      if (updated.finalMatch && !updated.finalMatch.played) {
        updated.finalMatch = simulateWorldCupMatch(updated.finalMatch, playersMap);
      }
    }

    updateAndSaveTournament(updated);
  };

  const handleSimulateEntireWorldCup = () => {
    if (!tournament) return;
    playClickSound();
    const completed = simulateEntireWorldCupTournament(tournament, playersMap);
    setTournament(completed);
    if (onSaveTournament) onSaveTournament(completed);
    setActiveTab('eliminatorias');
    setSelectedStageTab('final');
    playGoalSound();
    confetti({ particleCount: 150, spread: 120, origin: { y: 0.5 } });
  };

  // Champion nation data
  const champNation = tournament?.championTeamId ? NATIONAL_TEAMS_MAP[tournament.championTeamId] : null;
  const runnerNation = tournament?.runnerUpTeamId ? NATIONAL_TEAMS_MAP[tournament.runnerUpTeamId] : null;
  const bronzeNation = tournament?.thirdPlaceTeamId ? NATIONAL_TEAMS_MAP[tournament.thirdPlaceTeamId] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="pcf-panel w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border-2 border-slate-600/80">
        {/* Top Metallic Simulation Header */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-[#182848] via-[#1e3a8a] to-[#182848] border-b-2 border-slate-700/80 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-condensed uppercase tracking-wider text-white drop-shadow">
                  {tournament ? tournament.name : `Copa Mundial de la FIFA ${selectedYear}`}
                </h2>
                <span className="text-[10px] font-black text-amber-300 bg-black/60 border border-amber-500/60 px-2.5 py-0.5 rounded-full font-mono-num uppercase tracking-wider">
                  {tournament ? `${tournament.hostFlag} ${tournament.hostName}` : currentHostConfig.hostFlag}
                </span>
                <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/60 px-2 py-0.5 rounded-full font-mono-num">
                  48 SELECCIONES · 12 GRUPOS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-condensed tracking-wide">
                Modo Torneo Oficial FIFA con 80 selecciones reales, convocatorias de 23 futbolistas y sedes oficiales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tournament && (
              <button
                onClick={handleResetTournament}
                title="Configurar un nuevo Mundial"
                className="pcf-btn p-2 text-slate-300 hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-condensed uppercase"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Torneo</span>
              </button>
            )}
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="pcf-btn p-2 text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Setup if no tournament active */}
        {!tournament ? (
          <div className="p-8 space-y-6 overflow-y-auto bg-gradient-to-b from-slate-950/90 to-slate-900/95">
            <div className="pcf-embossed-header py-2.5 px-4 rounded-xl text-center text-sm font-black font-condensed uppercase tracking-widest text-white shadow-inner flex items-center justify-center gap-2">
              <Globe2 className="w-5 h-5 text-amber-400" />
              <span>CONFIGURACIÓN DEL TORNEO MUNDIALISTA OFICIAL (48 SELECCIONES)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select National Team (from 80 real nations) */}
              <div className="pcf-panel-card p-5 space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-slate-700/60 pb-2">
                  <Flag className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white font-condensed">
                    1. Elige tu Selección Nacional (80 Países Oficiales)
                  </h3>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1 font-condensed">
                    Selección a dirigir en el Mundial:
                  </label>
                  <select
                    value={selectedCountryId}
                    onChange={(e) => {
                      playClickSound();
                      setSelectedCountryId(e.target.value);
                    }}
                    className="w-full bg-[#101b33] border-2 border-slate-600 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    {NATIONAL_TEAMS_80.map((nt) => (
                      <option key={nt.id} value={nt.id}>
                        {nt.flag} {nt.name} (FIFA #{nt.fifaRanking} · {nt.confederation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nation Preview Card */}
                {userTeam && (
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{userTeam.flag}</span>
                      <div>
                        <div className="text-sm font-black text-white font-condensed uppercase">{userTeam.name}</div>
                        <div className="text-[11px] text-slate-300 font-condensed">
                          Confederación {userTeam.confederation} · Ranking FIFA #{userTeam.fifaRanking}
                        </div>
                      </div>
                    </div>
                    <span className="pcf-rating-badge pcf-rating-super px-3 py-1 font-black text-sm">
                      {userTeam.reputation} REP
                    </span>
                  </div>
                )}
              </div>

              {/* Tournament Edition & Host */}
              <div className="pcf-panel-card p-5 space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-slate-700/60 pb-2">
                  <Globe2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white font-condensed">
                    2. Edición y Sedes Oficiales FIFA (Ciclo Cuatrienal)
                  </h3>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1 font-condensed">
                    Edición del Campeonato Mundial:
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      playClickSound();
                      setSelectedYear(parseInt(e.target.value, 10));
                    }}
                    className="w-full bg-[#101b33] border-2 border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-400"
                  >
                    <option value={2026}>🇺🇸🇲🇽🇨🇦 2026 — Estados Unidos, México y Canadá</option>
                    <option value={2030}>🇪🇸🇵🇹🇲🇦 2030 — España, Portugal y Marruecos (Centenario)</option>
                    <option value={2034}>🇸🇦 2034 — Arabia Saudí</option>
                    <option value={2038}>🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁷󠁬󠁳󠁿🇮🇪 2038 — Reino Unido e Irlanda</option>
                    <option value={2042}>🇦🇺🇳🇿 2042 — Australia y Nueva Zelanda</option>
                  </select>
                </div>

                {/* Host Cities Preview */}
                <div className="bg-black/40 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-condensed">
                  <div className="text-emerald-400 font-black uppercase flex items-center justify-between">
                    <span>Sede Oficial: {currentHostConfig.hostFlag} {currentHostConfig.hostName}</span>
                    <span className="text-[10px] text-slate-400">{currentHostConfig.cities.length} Estadios</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                    {currentHostConfig.cities.slice(0, 6).map((c) => (
                      <div key={c.stadium} className="truncate">
                        · {c.stadium} ({c.city})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 font-condensed bg-black/30 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-amber-300 font-black uppercase text-[11px]">Reglamento Oficial FIFA:</div>
                  <div>· 48 Selecciones clasificadas por ranking y méritos en 12 Grupos (A-L).</div>
                  <div>· Clasifican a Dieciseisavos los dos primeros y los 8 mejores terceros.</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleStartTournament}
                className="pcf-btn pcf-btn-gold px-8 py-3 rounded-xl text-sm font-black font-condensed uppercase tracking-wider shadow-2xl flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>INICIAR COPA MUNDIAL {selectedYear}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Tournament View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Champion Banner if finished */}
            {tournament.currentStage === 'FINALIZADO' && champNation && (
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-6 py-3 flex items-center justify-between shadow-xl border-b-2 border-yellow-300 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-amber-300 font-black shadow-lg">
                    <Crown className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-950 block">
                      ¡CAMPEÓN DE LA COPA MUNDIAL DE LA FIFA {tournament.year}!
                    </span>
                    <h3 className="text-lg font-black text-slate-950 font-condensed uppercase flex items-center gap-2">
                      <span className="text-2xl">{champNation.flag}</span>
                      <span>{champNation.name}</span>
                      <span className="text-sm font-normal text-slate-900">
                        {tournament.finalMatch?.homeScore} - {tournament.finalMatch?.awayScore}
                        {tournament.finalMatch?.homePenalties !== undefined
                          ? ` (${tournament.finalMatch.homePenalties}-${tournament.finalMatch.awayPenalties} pen.)`
                          : ''}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-condensed text-slate-950 font-bold">
                  {runnerNation && (
                    <div>Subcampeón: {runnerNation.flag} {runnerNation.name}</div>
                  )}
                  {bronzeNation && (
                    <div>3º Puesto: {bronzeNation.flag} {bronzeNation.name}</div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-nav Tabs */}
            <div className="px-6 py-2.5 bg-[#142036] border-b-2 border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {[
                  { id: 'tactica', label: '1. Táctica & Once Inicial', icon: Shield },
                  { id: 'convocatoria', label: `2. Convocatoria (${userTeam?.flag} ${userTeam?.name})`, icon: Users },
                  { id: 'grupos', label: '3. Fase de Grupos (A-L)', icon: Globe2 },
                  { id: 'eliminatorias', label: '4. Cuadro Eliminatorio', icon: Trophy },
                  { id: 'estadisticas', label: '5. Sede & Calendario', icon: Award },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        playClickSound();
                        setActiveTab(t.id as any);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black font-condensed uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick simulation controls */}
              <div className="flex items-center gap-2">
                {tournament.currentStage === 'FASE_GRUPOS' && (
                  <button
                    onClick={handleSimulateGroupStage}
                    className="pcf-btn pcf-btn-emerald px-3.5 py-1.5 rounded-xl text-xs font-black font-condensed uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simular Toda la Fase de Grupos</span>
                  </button>
                )}
                {tournament.currentStage !== 'FINALIZADO' && (
                  <button
                    onClick={handleSimulateEntireWorldCup}
                    className="pcf-btn pcf-btn-gold px-3.5 py-1.5 rounded-xl text-xs font-black font-condensed uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Simular Todo el Mundial</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-slate-950/90 to-slate-900/95">
              {/* TAB 1: TÁCTICA & ALINEACIÓN */}
              {activeTab === 'tactica' && (
                <div className="space-y-6">
                  {/* Tactical Configuration Header */}
                  <div className="pcf-panel-card p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white font-condensed uppercase tracking-wider">
                          Pizarra Táctica y Once Titular: {userTeam?.name}
                        </h3>
                        <p className="text-xs text-slate-300 font-sans">
                          Haz clic en un jugador titular y luego en un suplente para intercambiarlos en la alineación mundialista.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-[#101b33] p-1.5 rounded-xl border border-slate-700">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-condensed px-1">
                          Dibujo:
                        </label>
                        <select
                          value={formation}
                          onChange={(e) => {
                            playClickSound();
                            setFormation(e.target.value);
                          }}
                          className="bg-slate-900 text-xs font-bold text-amber-300 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                        >
                          <option value="4-3-3">4-3-3 Ofensivo</option>
                          <option value="4-4-2">4-4-2 Clásico</option>
                          <option value="4-2-3-1">4-2-3-1 Equilibrio</option>
                          <option value="3-5-2">3-5-2 Carrileros</option>
                          <option value="5-3-2">5-3-2 Muralla Defensiva</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 bg-[#101b33] p-1.5 rounded-xl border border-slate-700">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-condensed px-1">
                          Estilo:
                        </label>
                        <select
                          value={tacticalStyle}
                          onChange={(e) => {
                            playClickSound();
                            setTacticalStyle(e.target.value);
                          }}
                          className="bg-slate-900 text-xs font-bold text-emerald-400 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                        >
                          <option value="Ofensiva">Ataque Total</option>
                          <option value="Tiki-Taka">Tiki-Taka Asociativo</option>
                          <option value="Contraataque">Contraataque Veloz</option>
                          <option value="Presión Alta">Presión Asfixiante</option>
                          <option value="Equilibrada">Bloque Equilibrado</option>
                          <option value="Cerrojo">Cerrojo Ultraconservador</option>
                        </select>
                      </div>

                      <button
                        onClick={handleResetLineup}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700"
                      >
                        Alineación Óptima
                      </button>
                    </div>
                  </div>

                  {/* Pitch & Bench Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Tactical Grass Pitch (7 cols) */}
                    <div className="lg:col-span-7 bg-gradient-to-b from-[#1b5e20] to-[#0d3b13] border-4 border-[#2e7d32] rounded-2xl p-4 shadow-2xl relative min-h-[460px] flex flex-col justify-between overflow-hidden select-none">
                      {/* Pitch Field Markings */}
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-0 left-0 right-0 bottom-0 border-2 border-white m-3 rounded-lg" />
                        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white rounded-full" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-l-2 border-r-2 border-white" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-l-2 border-r-2 border-white" />
                      </div>

                      {/* Pitch Starters Render */}
                      <div className="relative z-10 flex-1 flex flex-col justify-between py-2">
                        {/* Delanteros */}
                        <div className="flex justify-around items-center">
                          {swappedStarters.slice(8, 11).map((p, idx) => {
                            const actualIdx = 8 + idx;
                            const isSelected = selectedStarterIdx === actualIdx;
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleSelectStarterForSwap(actualIdx)}
                                className={`flex flex-col items-center cursor-pointer transition-all ${
                                  isSelected ? 'scale-110 drop-shadow-[0_0_12px_#fbbf24]' : 'hover:scale-105'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-lg ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/50'
                                    : 'bg-slate-900 text-amber-300 border-amber-400'
                                }`}>
                                  {actualIdx + 1}
                                </div>
                                <span className="text-[11px] font-black text-white bg-black/70 px-2 py-0.5 rounded mt-1 shadow truncate max-w-[90px]">
                                  {p.lastName || p.firstName}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-400 font-mono-num">
                                  {p.overallRating} OVR · {p.primaryPosition}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Centrocampistas */}
                        <div className="flex justify-around items-center">
                          {swappedStarters.slice(4, 8).map((p, idx) => {
                            const actualIdx = 4 + idx;
                            const isSelected = selectedStarterIdx === actualIdx;
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleSelectStarterForSwap(actualIdx)}
                                className={`flex flex-col items-center cursor-pointer transition-all ${
                                  isSelected ? 'scale-110 drop-shadow-[0_0_12px_#fbbf24]' : 'hover:scale-105'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-lg ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/50'
                                    : 'bg-slate-900 text-sky-300 border-sky-400'
                                }`}>
                                  {actualIdx + 1}
                                </div>
                                <span className="text-[11px] font-black text-white bg-black/70 px-2 py-0.5 rounded mt-1 shadow truncate max-w-[90px]">
                                  {p.lastName || p.firstName}
                                </span>
                                <span className="text-[10px] font-bold text-sky-400 font-mono-num">
                                  {p.overallRating} OVR · {p.primaryPosition}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Defensas */}
                        <div className="flex justify-around items-center">
                          {swappedStarters.slice(1, 4).map((p, idx) => {
                            const actualIdx = 1 + idx;
                            const isSelected = selectedStarterIdx === actualIdx;
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleSelectStarterForSwap(actualIdx)}
                                className={`flex flex-col items-center cursor-pointer transition-all ${
                                  isSelected ? 'scale-110 drop-shadow-[0_0_12px_#fbbf24]' : 'hover:scale-105'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-lg ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/50'
                                    : 'bg-slate-900 text-emerald-300 border-emerald-400'
                                }`}>
                                  {actualIdx + 1}
                                </div>
                                <span className="text-[11px] font-black text-white bg-black/70 px-2 py-0.5 rounded mt-1 shadow truncate max-w-[90px]">
                                  {p.lastName || p.firstName}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-400 font-mono-num">
                                  {p.overallRating} OVR · {p.primaryPosition}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Portero */}
                        <div className="flex justify-center items-center">
                          {swappedStarters[0] && (() => {
                            const isSelected = selectedStarterIdx === 0;
                            const p = swappedStarters[0];
                            return (
                              <div
                                onClick={() => handleSelectStarterForSwap(0)}
                                className={`flex flex-col items-center cursor-pointer transition-all ${
                                  isSelected ? 'scale-110 drop-shadow-[0_0_12px_#fbbf24]' : 'hover:scale-105'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-lg ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/50'
                                    : 'bg-yellow-600 text-slate-950 border-yellow-300'
                                }`}>
                                  1
                                </div>
                                <span className="text-[11px] font-black text-white bg-black/70 px-2 py-0.5 rounded mt-1 shadow truncate max-w-[90px]">
                                  {p.lastName || p.firstName}
                                </span>
                                <span className="text-[10px] font-bold text-yellow-400 font-mono-num">
                                  {p.overallRating} OVR · POR
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Bench & Substitutes Panel (5 cols) */}
                    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                          <span className="text-xs font-black text-amber-300 uppercase font-condensed tracking-wider">
                            Banquillo de Suplentes ({swappedBench.length} convocados)
                          </span>
                          {selectedStarterIdx !== null && (
                            <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40 animate-pulse font-bold">
                              Toca un suplente para cambiar
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                          {swappedBench.map((p, bIdx) => (
                            <div
                              key={p.id}
                              onClick={() => handleSwapWithBench(bIdx)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                selectedStarterIdx !== null
                                  ? 'bg-slate-950/90 border-amber-500/60 hover:bg-amber-950/40 hover:scale-[1.01]'
                                  : 'bg-slate-950/50 border-slate-850 hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-300">
                                  {12 + bIdx}
                                </span>
                                <div className="truncate">
                                  <div className="text-xs font-bold text-white truncate font-sans">
                                    {p.firstName} {p.lastName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono-num">
                                    Pos: <strong className="text-slate-200">{p.primaryPosition}</strong> · Edad: {p.age}
                                  </div>
                                </div>
                              </div>

                              <span className={`pcf-rating-badge text-xs px-2 py-0.5 shrink-0 ${
                                p.overallRating >= 85 ? 'pcf-rating-super' : p.overallRating >= 78 ? 'pcf-rating-high' : 'pcf-rating-mid'
                              }`}>
                                {p.overallRating} OVR
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center font-sans">
                        La alineación seleccionada se aplicará de forma automática en los partidos mundialistas.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONVOCATORIA (23 JUGADORES) */}
              {activeTab === 'convocatoria' && userSquad && (
                <div className="space-y-4">
                  <div className="pcf-panel-card p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{userSquad.team.flag}</span>
                      <div>
                        <h3 className="text-base font-black text-white font-condensed uppercase">
                          Convocatoria Oficial de {userSquad.team.name} para el Mundial {tournament.year}
                        </h3>
                        <p className="text-xs text-slate-300 font-condensed">
                          23 futbolistas seleccionados · Media del combinado nacional: {userSquad.averageRating} OVR · Sede: {tournament.hostName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="pcf-rating-badge pcf-rating-super px-3 py-1 font-black text-sm">
                        {userSquad.averageRating} MEDIA
                      </span>
                    </div>
                  </div>

                  {/* 23 Players Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/80">
                    <table className="w-full text-left text-xs font-mono-num">
                      <thead>
                        <tr className="bg-[#142036] border-b-2 border-slate-700 text-slate-300 text-[10px] uppercase font-condensed font-black tracking-wider">
                          <th className="py-2.5 px-3">Dorsal</th>
                          <th className="py-2.5 px-4 font-sans">Futbolista Internacional</th>
                          <th className="py-2.5 px-3 text-center">Nivel</th>
                          <th className="py-2.5 px-3 text-center">Pos</th>
                          <th className="py-2.5 px-3 text-center">OVR</th>
                          <th className="py-2.5 px-3 text-center font-sans">Rol Mundialista</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {userSquad.all23.map((p, idx) => {
                          const isStarter = idx < 11;
                          return (
                            <tr key={p.id} className={`hover:bg-slate-800/50 ${isStarter ? 'bg-amber-950/20' : ''}`}>
                              <td className="py-2 px-3 font-black text-slate-300">{idx + 1}</td>
                              <td className="py-2 px-4 font-sans font-bold text-white flex items-center gap-2">
                                <span>{p.firstName} {p.lastName}</span>
                                {p.overallRating >= 85 && (
                                  <span className="text-amber-400 text-xs">★</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center text-amber-400 font-bold">
                                {'★'.repeat(Math.max(1, Math.min(5, Math.round((p.overallRating - 50) / 10))))}
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-emerald-400">{p.primaryPosition}</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`pcf-rating-badge text-xs px-2 py-0.5 ${p.overallRating >= 85 ? 'pcf-rating-super' : p.overallRating >= 78 ? 'pcf-rating-high' : 'pcf-rating-mid'}`}>
                                  {p.overallRating}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-condensed uppercase ${isStarter ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' : 'bg-slate-800 text-slate-300'}`}>
                                  {isStarter ? 'TITULAR' : 'SUPLENTE'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: GRUPOS A-L */}
              {activeTab === 'grupos' && (
                <div className="space-y-4">
                  {/* Group Selector Pill Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                    {tournament.groups.map((g, idx) => (
                      <button
                        key={g.name}
                        onClick={() => {
                          playClickSound();
                          setSelectedGroupIdx(idx);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black font-condensed uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          selectedGroupIdx === idx
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-[#101b33] text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>

                  {/* Selected Group Table & Matches */}
                  {tournament.groups[selectedGroupIdx] && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-7 pcf-panel-card p-4 space-y-3">
                        <div className="pcf-embossed-header py-1.5 px-3 rounded-lg text-center font-black text-xs uppercase tracking-wider text-white">
                          TABLA DEL {tournament.groups[selectedGroupIdx].name.toUpperCase()} · MUNDIAL {tournament.year}
                        </div>

                        <table className="w-full text-left text-xs font-mono-num">
                          <thead>
                            <tr className="bg-[#142036] border-b border-slate-700 text-slate-300 text-[10px] uppercase font-condensed font-black">
                              <th className="py-2 px-2 text-center">Pos</th>
                              <th className="py-2 px-3 font-sans">Selección</th>
                              <th className="py-2 px-2 text-center">PJ</th>
                              <th className="py-2 px-2 text-center">V</th>
                              <th className="py-2 px-2 text-center">E</th>
                              <th className="py-2 px-2 text-center">D</th>
                              <th className="py-2 px-2 text-center">DG</th>
                              <th className="py-2 px-3 text-center font-black">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {tournament.groups[selectedGroupIdx].standings.map((s, idx) => {
                              const isUser = s.teamId === tournament.userTeamId;
                              const isQualified = idx < 2;
                              return (
                                <tr key={s.teamId} className={`hover:bg-slate-800/50 ${isUser ? 'bg-amber-950/30 font-bold' : ''}`}>
                                  <td className="py-2 px-2 text-center font-black text-slate-300">
                                    <span className={`inline-block w-5 h-5 rounded-full text-center leading-5 text-[10px] ${isQualified ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}>
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 font-sans font-bold text-white flex items-center gap-2">
                                    <span>{s.flag}</span>
                                    <span>{s.teamName}</span>
                                  </td>
                                  <td className="py-2 px-2 text-center text-slate-300">{s.played}</td>
                                  <td className="py-2 px-2 text-center text-emerald-400">{s.won}</td>
                                  <td className="py-2 px-2 text-center text-amber-400">{s.drawn}</td>
                                  <td className="py-2 px-2 text-center text-rose-400">{s.lost}</td>
                                  <td className="py-2 px-2 text-center text-slate-300">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                                  <td className="py-2 px-3 text-center text-amber-300 font-black">{s.points}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Group Matches */}
                      <div className="lg:col-span-5 pcf-panel-card p-4 space-y-3">
                        <div className="text-xs font-black uppercase tracking-wider text-amber-400 font-condensed border-b border-slate-700 pb-1.5 flex items-center justify-between">
                          <span>Encuentros de la Jornada</span>
                          <span className="text-[10px] text-slate-400 font-mono-num">6 Partidos</span>
                        </div>
                        <div className="space-y-2">
                          {tournament.groups[selectedGroupIdx].matches.map((m) => {
                            const hTeam = NATIONAL_TEAMS_MAP[m.homeTeamId];
                            const aTeam = NATIONAL_TEAMS_MAP[m.awayTeamId];
                            return (
                              <div key={m.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-condensed">
                                <div className="flex items-center gap-2 flex-1">
                                  <span>{hTeam?.flag}</span>
                                  <span className="font-bold text-white truncate">{hTeam?.name}</span>
                                </div>

                                <div className="px-3 py-1 bg-black/60 rounded border border-slate-700 font-mono-num font-black text-center min-w-[65px]">
                                  {m.played ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                                </div>

                                <div className="flex items-center gap-2 flex-1 justify-end">
                                  <span className="font-bold text-white truncate">{aTeam?.name}</span>
                                  <span>{aTeam?.flag}</span>
                                </div>

                                {!m.played && (
                                  <button
                                    onClick={() => handleSimulateMatch(m)}
                                    className="ml-2 pcf-btn px-2.5 py-1 text-[11px] font-black text-emerald-300 rounded-lg cursor-pointer"
                                  >
                                    Jugar
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CUADRO ELIMINATORIO COMPLETO */}
              {activeTab === 'eliminatorias' && (
                <div className="space-y-4">
                  {/* Knockout Round Subtabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'r32', label: `Dieciseisavos (R32)`, count: tournament.bracketRoundOf32.length },
                        { id: 'r16', label: `Octavos (R16)`, count: tournament.bracketRoundOf16.length },
                        { id: 'qf', label: `Cuartos`, count: tournament.bracketQuarterFinals.length },
                        { id: 'sf', label: `Semifinales`, count: tournament.bracketSemiFinals.length },
                        { id: 'final', label: `Tercer Puesto & Final`, count: tournament.finalMatch ? 2 : 0 },
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            playClickSound();
                            setSelectedStageTab(st.id as any);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black font-condensed uppercase tracking-wider transition-all cursor-pointer ${
                            selectedStageTab === st.id
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                              : 'bg-[#101b33] text-slate-300 hover:text-white border border-slate-700'
                          }`}
                        >
                          <span>{st.label}</span>
                          {st.count > 0 && <span className="ml-1.5 opacity-70">({st.count})</span>}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleSimulateCurrentKnockoutRound}
                      className="pcf-btn pcf-btn-emerald px-4 py-1.5 rounded-xl text-xs font-black font-condensed uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Simular Ronda Actual</span>
                    </button>
                  </div>

                  {/* Render Matches for Selected Knockout Stage */}
                  {selectedStageTab === 'r32' && (
                    tournament.bracketRoundOf32.length === 0 ? (
                      <div className="pcf-panel-card p-8 text-center text-slate-300 text-xs font-condensed">
                        Los Dieciseisavos de Final se sortearán cuando concluyan todos los partidos de la Fase de Grupos.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {tournament.bracketRoundOf32.map((m) => renderKnockoutMatchCard(m, handleSimulateMatch))}
                      </div>
                    )
                  )}

                  {selectedStageTab === 'r16' && (
                    tournament.bracketRoundOf16.length === 0 ? (
                      <div className="pcf-panel-card p-8 text-center text-slate-300 text-xs font-condensed">
                        Los Octavos de Final se habilitarán cuando concluyan los 16 partidos de Dieciseisavos.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {tournament.bracketRoundOf16.map((m) => renderKnockoutMatchCard(m, handleSimulateMatch))}
                      </div>
                    )
                  )}

                  {selectedStageTab === 'qf' && (
                    tournament.bracketQuarterFinals.length === 0 ? (
                      <div className="pcf-panel-card p-8 text-center text-slate-300 text-xs font-condensed">
                        Los Cuartos de Final se habilitarán tras disputar los Octavos.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tournament.bracketQuarterFinals.map((m) => renderKnockoutMatchCard(m, handleSimulateMatch))}
                      </div>
                    )
                  )}

                  {selectedStageTab === 'sf' && (
                    tournament.bracketSemiFinals.length === 0 ? (
                      <div className="pcf-panel-card p-8 text-center text-slate-300 text-xs font-condensed">
                        Las Semifinales se habilitarán tras los Cuartos de Final.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tournament.bracketSemiFinals.map((m) => renderKnockoutMatchCard(m, handleSimulateMatch))}
                      </div>
                    )
                  )}

                  {selectedStageTab === 'final' && (
                    !tournament.finalMatch ? (
                      <div className="pcf-panel-card p-8 text-center text-slate-300 text-xs font-condensed">
                        La Gran Final y el Tercer Puesto se definirán al completarse las Semifinales.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Final */}
                        <div className="pcf-panel p-6 border-2 border-amber-500/80 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 shadow-2xl">
                          <div className="flex items-center justify-between border-b border-amber-500/40 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-amber-400" />
                              <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest font-condensed">
                                GRAN FINAL DE LA COPA MUNDIAL DE LA FIFA {tournament.year}
                              </h3>
                            </div>
                            <span className="text-xs font-mono-num text-slate-400">
                              {tournament.finalMatch.date} · {tournament.finalMatch.stadium} ({tournament.finalMatch.city})
                            </span>
                          </div>
                          {renderKnockoutMatchCard(tournament.finalMatch, handleSimulateMatch, true)}
                        </div>

                        {/* Third Place */}
                        {tournament.thirdPlaceMatch && (
                          <div className="pcf-panel-card p-4 space-y-2">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-condensed border-b border-slate-800 pb-1">
                              Partido por el Tercer Puesto (Medalla de Bronce)
                            </div>
                            {renderKnockoutMatchCard(tournament.thirdPlaceMatch, handleSimulateMatch)}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* TAB 4: SEDE & DATOS */}
              {activeTab === 'estadisticas' && (
                <div className="pcf-panel-card p-6 space-y-4 text-xs font-condensed">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                    Información Oficial de la Copa Mundial de la FIFA {tournament.year}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Sede Oficial:</span>
                      <strong className="text-white text-sm">{tournament.hostFlag} {tournament.hostName}</strong>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tu Selección:</span>
                      <strong className="text-emerald-400 text-sm">{userTeam?.flag} {userTeam?.name}</strong>
                    </div>
                  </div>

                  <div className="bg-black/30 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Estadios y Sedes del Campeonato:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                      {getHostConfigForYear(tournament.year).cities.map((c) => (
                        <div key={c.stadium} className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                          <div className="font-bold text-white">{c.stadium}</div>
                          <div className="text-[10px] text-slate-400">{c.city}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function renderKnockoutMatchCard(
  m: WorldCupMatch,
  onSimulate: (m: WorldCupMatch) => void,
  isBigFinal: boolean = false
) {
  const hTeam = NATIONAL_TEAMS_MAP[m.homeTeamId];
  const aTeam = NATIONAL_TEAMS_MAP[m.awayTeamId];
  const isPenaltyShootout = m.played && m.homePenalties !== undefined && m.awayPenalties !== undefined;

  return (
    <div
      key={m.id}
      className={`pcf-panel-card ${isBigFinal ? 'p-5' : 'p-3'} space-y-2 relative overflow-hidden`}
    >
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-num uppercase">
        <span className="truncate">{m.stadium}</span>
        <span>{m.date}</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-condensed">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="text-base">{hTeam?.flag}</span>
            <span className="truncate">{hTeam?.name || m.homeTeamId}</span>
          </span>
          <span className="font-mono-num font-black text-amber-300 text-sm">
            {m.played ? m.homeScore : '-'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-condensed">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="text-base">{aTeam?.flag}</span>
            <span className="truncate">{aTeam?.name || m.awayTeamId}</span>
          </span>
          <span className="font-mono-num font-black text-amber-300 text-sm">
            {m.played ? m.awayScore : '-'}
          </span>
        </div>
      </div>

      {isPenaltyShootout && (
        <div className="text-[10px] text-amber-400 font-mono-num text-center font-bold bg-black/40 py-0.5 rounded border border-amber-500/30">
          Penaltis: {m.homePenalties} - {m.awayPenalties}
        </div>
      )}

      {!m.played && (
        <button
          onClick={() => onSimulate(m)}
          className={`w-full pcf-btn pcf-btn-emerald ${
            isBigFinal ? 'py-2 text-sm font-black' : 'py-1 text-xs font-bold'
          } rounded-lg cursor-pointer text-center mt-2 flex items-center justify-center gap-1`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isBigFinal ? 'DISPUTAR GRAN FINAL' : 'Jugar Partido'}</span>
        </button>
      )}
    </div>
  );
}
