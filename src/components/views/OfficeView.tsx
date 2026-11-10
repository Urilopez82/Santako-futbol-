import React, { useState, useMemo } from 'react';
import { Club } from '../../types/club';
import { Competition, Match } from '../../types/competition';
import { GameSave } from '../../types/game';
import { Player } from '../../types/player';
import { playClickSound } from '../../utils/audio';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertCircle, 
  Coins, 
  Shield, 
  ChevronRight, 
  Activity, 
  Newspaper,
  Briefcase,
  Mail,
  Compass,
  FileCheck,
  User,
  Plane
} from 'lucide-react';
import { FlightSimulatorModal } from '../aviation/FlightSimulatorModal';


interface OfficeViewProps {
  gameSave: GameSave;
  onNavigateTab: (tab: string, subTab?: string) => void;
  onOpenMatch: () => void;
  onOpenProfile?: () => void;
  onInspectPlayer?: (player: Player) => void;
}

export const OfficeView: React.FC<OfficeViewProps> = ({
  gameSave,
  onNavigateTab,
  onOpenMatch,
  onOpenProfile,
  onInspectPlayer,
}) => {
  const club = gameSave.clubs[gameSave.userClubId];
  const competition = Object.values(gameSave.competitions)[0];
  const [newsFilter, setNewsFilter] = useState<'TODAS' | 'CLUB' | 'LIGAS' | 'COPAS' | 'MUNDIAL'>('TODAS');
  const [isFlightModalOpen, setIsFlightModalOpen] = useState<boolean>(false);

  const availableAircraft = club?.officialAircraft || gameSave.privateLife?.ownedAircraft?.[0];


  // Deduplicate news by id to prevent duplicate keys in UI
  const deduplicatedNews = useMemo(() => {
    const seen = new Set<string>();
    return (gameSave.news || []).filter((item) => {
      const key = item.id || `${item.date}_${item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [gameSave.news]);

  // Find next match
  const nextMatch = competition?.matches.find((m) => !m.played && (m.homeTeamId === club.id || m.awayTeamId === club.id));
  const isHome = nextMatch ? nextMatch.homeTeamId === club.id : false;
  const opponentId = nextMatch ? (isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId) : null;
  const opponent = opponentId ? gameSave.clubs[opponentId] : null;

  // Find last played match
  const playedMatches = (competition?.matches || [])
    .filter((m) => m.played && (m.homeTeamId === club.id || m.awayTeamId === club.id))
    .sort((a, b) => b.matchday - a.matchday);
  const lastMatch = playedMatches.length > 0 ? playedMatches[0] : null;
  const lastMatchIsHome = lastMatch ? lastMatch.homeTeamId === club.id : false;
  const lastOpponentId = lastMatch ? (lastMatchIsHome ? lastMatch.awayTeamId : lastMatch.homeTeamId) : null;
  const lastOpponent = lastOpponentId ? gameSave.clubs[lastOpponentId] : null;

  let lastMatchOutcome: 'VICTORIA' | 'EMPATE' | 'DERROTA' | null = null;
  if (lastMatch && lastMatch.homeScore !== undefined && lastMatch.awayScore !== undefined) {
    const userGoals = lastMatchIsHome ? lastMatch.homeScore : lastMatch.awayScore;
    const oppGoals = lastMatchIsHome ? lastMatch.awayScore : lastMatch.homeScore;
    if (userGoals > oppGoals) lastMatchOutcome = 'VICTORIA';
    else if (userGoals === oppGoals) lastMatchOutcome = 'EMPATE';
    else lastMatchOutcome = 'DERROTA';
  }

  // Standings position
  const standingsIndex = competition?.standings.findIndex((s) => s.teamId === club.id) ?? -1;
  const standingRow = standingsIndex !== -1 ? competition.standings[standingsIndex] : null;

  // Squad health
  const squadPlayers = club.playerIds.map((id) => gameSave.players[id]).filter(Boolean);
  const injuredPlayers = squadPlayers.filter((p) => p.isInjured);
  const tiredPlayers = squadPlayers.filter((p) => p.fitness < 80);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome - PC Fútbol Manager Suite */}
      <div className="pcf-panel relative overflow-hidden p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl font-condensed shadow-xl"
              style={{
                backgroundColor: club.primaryColor,
                color: club.textColor,
                border: `3px solid ${club.secondaryColor}`,
              }}
            >
              {club.code}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-100 font-condensed uppercase tracking-wider drop-shadow">
                  Despacho de {gameSave.manager.firstName} {gameSave.manager.lastName}
                </h1>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded shadow">
                  Manager Total
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <span className="font-semibold text-slate-200">{club.name}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>{club.stadium.name} ({club.stadium.capacity.toLocaleString()} esp.)</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-amber-400 font-bold">Objetivo: {club.boardObjective}</span>
              </p>
            </div>
          </div>

          {/* Quick Board, Reputation meters & Manager Actions */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-700/80 shrink-0 font-mono-num shadow-inner">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Confianza Directiva</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-emerald-500 transition-all shadow-[0_0_8px_#10b981]"
                    style={{ width: `${club.boardConfidence}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-100">{club.boardConfidence}%</span>
              </div>
            </div>

            <div className="border-l border-slate-700/80 pl-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Reputación Míster</span>
              <span className="text-base font-black text-amber-400">{gameSave.manager.reputation} / 100</span>
            </div>

            <div className="border-l border-slate-700/80 pl-4 flex items-center gap-2 font-sans">
              {onOpenProfile && (
                <button
                  onClick={() => {
                    playClickSound();
                    onOpenProfile();
                  }}
                  className="pcf-btn pcf-btn-emerald px-3 py-1.5 text-xs rounded-lg shadow flex items-center gap-1.5 uppercase font-condensed tracking-wider"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Ficha & Contrato</span>
                  {gameSave.jobOffers?.some((o) => o.status === 'PENDIENTE') && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                      {gameSave.jobOffers.filter((o) => o.status === 'PENDIENTE').length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  playClickSound();
                  onNavigateTab('gestion_club');
                }}
                className="pcf-btn px-3 py-1.5 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 uppercase font-condensed tracking-wider"
                title="Economía, Patrocinios, Estadio, Equipaciones, Catering"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gestión Club</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onNavigateTab('mercado_managers');
                }}
                className="pcf-btn px-3 py-1.5 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 uppercase font-condensed tracking-wider"
              >
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Mercado</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Next Match + Last Result + League Snapshot + Squad State */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Próximo Compromiso */}
        <div className="pcf-panel-card p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
              <span className="text-xs font-bold text-slate-200 font-condensed tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Próximo Partido
              </span>
              <span className="text-[11px] text-slate-400 font-mono-num font-bold">
                {nextMatch ? `Jornada ${nextMatch.matchday}` : 'Sin partidos'}
              </span>
            </div>

            {nextMatch && opponent ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-center py-1">
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm font-condensed mb-1 shadow-md"
                      style={{
                        backgroundColor: isHome ? club.primaryColor : opponent.primaryColor,
                        color: isHome ? club.textColor : opponent.textColor,
                      }}
                    >
                      {isHome ? club.code : opponent.code}
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                      {isHome ? club.shortName : opponent.shortName}
                    </span>
                    <span className="text-[10px] text-slate-400">{isHome ? '(L)' : '(V)'}</span>
                  </div>

                  <div className="px-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                      VS
                    </span>
                    <span className="text-[10px] font-mono-num text-slate-300 block bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {nextMatch.date}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm font-condensed mb-1 shadow-md"
                      style={{
                        backgroundColor: !isHome ? club.primaryColor : opponent.primaryColor,
                        color: !isHome ? club.textColor : opponent.textColor,
                      }}
                    >
                      {!isHome ? club.code : opponent.code}
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                      {!isHome ? club.shortName : opponent.shortName}
                    </span>
                    <span className="text-[10px] text-slate-400">{!isHome ? '(L)' : '(V)'}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 font-sans">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Estadio:</span>
                    <strong className="text-slate-200 font-medium truncate max-w-[130px]">
                      {isHome ? club.stadium.name : opponent.stadium.name}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rival:</span>
                    <strong className="text-amber-400 font-mono-num">{opponent.reputation} Rep.</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hay partidos programados en el calendario próximo.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                playClickSound();
                onNavigateTab('plantilla');
              }}
              className="pcf-btn px-2.5 py-1 text-xs rounded transition-colors"
            >
              Convocatoria →
            </button>
            {nextMatch && (
              <div className="flex items-center gap-1.5">
                {!isHome && availableAircraft && (
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsFlightModalOpen(true);
                    }}
                    className="pcf-btn pcf-btn-blue px-2 py-1 text-xs font-bold rounded shadow-sm flex items-center gap-1"
                    title="Desplazamiento aéreo del equipo"
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>Vuelo</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    playClickSound();
                    onOpenMatch();
                  }}
                  className="pcf-btn pcf-btn-emerald px-3 py-1 text-xs font-bold rounded shadow-sm"
                >
                  Disputar
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Card 2: Último Resultado */}
        <div className="pcf-panel-card p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
              <span className="text-xs font-bold text-slate-200 font-condensed tracking-wider uppercase flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-sky-400" />
                Último Resultado
              </span>
              {lastMatch && (
                <span className="text-[11px] text-slate-400 font-mono-num font-bold">
                  Jornada {lastMatch.matchday}
                </span>
              )}
            </div>

            {lastMatch && lastOpponent ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-center py-1">
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm font-condensed mb-1 shadow-md"
                      style={{
                        backgroundColor: lastMatchIsHome ? club.primaryColor : lastOpponent.primaryColor,
                        color: lastMatchIsHome ? club.textColor : lastOpponent.textColor,
                      }}
                    >
                      {lastMatchIsHome ? club.code : lastOpponent.code}
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                      {lastMatchIsHome ? club.shortName : lastOpponent.shortName}
                    </span>
                  </div>

                  {/* Score box */}
                  <div className="px-2">
                    <div className="flex items-center justify-center gap-2 font-mono-num font-black text-2xl text-slate-100 bg-slate-950 px-3 py-1 rounded-lg border border-slate-700 shadow-inner">
                      <span>{lastMatch.homeScore ?? 0}</span>
                      <span className="text-slate-600">-</span>
                      <span>{lastMatch.awayScore ?? 0}</span>
                    </div>
                    {lastMatchOutcome && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block mt-1 px-1.5 py-0.5 rounded text-center shadow ${
                          lastMatchOutcome === 'VICTORIA'
                            ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                            : lastMatchOutcome === 'EMPATE'
                            ? 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {lastMatchOutcome}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm font-condensed mb-1 shadow-md"
                      style={{
                        backgroundColor: !lastMatchIsHome ? club.primaryColor : lastOpponent.primaryColor,
                        color: !lastMatchIsHome ? club.textColor : lastOpponent.textColor,
                      }}
                    >
                      {!lastMatchIsHome ? club.code : lastOpponent.code}
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                      {!lastMatchIsHome ? club.shortName : lastOpponent.shortName}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Fecha:</span>
                    <strong className="text-slate-200 font-mono-num">{lastMatch.date}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Condición:</span>
                    <strong className="text-slate-200">
                      {lastMatchIsHome ? 'Local' : 'Visitante'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Aún no se ha disputado ningún encuentro esta temporada.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                playClickSound();
                onNavigateTab('competicion');
              }}
              className="pcf-btn px-2.5 py-1 text-xs rounded transition-colors"
            >
              Jornadas Anteriores →
            </button>
          </div>
        </div>

        {/* Card 3: League Standing Snapshot */}
        <div className="pcf-panel-card p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
              <span className="text-xs font-bold text-slate-200 font-condensed tracking-wider uppercase flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                {competition?.shortName || 'Clasificación'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono-num font-bold">
                {competition?.totalMatchdays ? `J${competition.currentMatchday}/${competition.totalMatchdays}` : ''}
              </span>
            </div>

            {standingRow ? (
              <div className="space-y-2.5 font-mono-num">
                <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Posición</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-100">{standingsIndex + 1}º</span>
                      <span className="text-xs text-slate-500">/{competition.standings.length}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Puntos</span>
                    <span className="text-xl font-black text-emerald-400">{standingRow.points}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">PJ</span>
                    <span className="font-bold text-slate-200">{standingRow.played}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">V</span>
                    <span className="font-bold text-emerald-400">{standingRow.won}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">E</span>
                    <span className="font-bold text-amber-400">{standingRow.drawn}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">D</span>
                    <span className="font-bold text-rose-400">{standingRow.lost}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Racha:</span>
                  <div className="flex items-center gap-1">
                    {standingRow.recentForm.length === 0 ? (
                      <span className="text-slate-500 text-[11px]">-</span>
                    ) : (
                      standingRow.recentForm.slice(-5).map((f, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded ${
                            f === 'V'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : f === 'E'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {f}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                playClickSound();
                onNavigateTab('competicion');
              }}
              className="pcf-btn px-2.5 py-1 text-xs rounded transition-colors flex items-center justify-between w-full"
            >
              <span>Ver Tabla Completa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 4: Squad Health & Finances */}
        <div className="pcf-panel-card p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
              <span className="text-xs font-bold text-slate-200 font-condensed tracking-wider uppercase flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Estado del Club
              </span>
              <span className="text-[11px] text-slate-400 font-mono-num font-bold">
                {squadPlayers.length} jugadores
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Finances */}
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Tesorería</span>
                  <span className="text-sm font-bold text-slate-100 font-mono-num">
                    {club.finances.balance.toLocaleString()} €
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed">Fichajes</span>
                  <span className="text-xs font-semibold text-emerald-400 font-mono-num">
                    {club.finances.transferBudget.toLocaleString()} €
                  </span>
                </div>
              </div>

              {/* Health */}
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Enfermería:</span>
                  <span className={`font-semibold ${injuredPlayers.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {injuredPlayers.length > 0 ? `${injuredPlayers.length} lesionado(s)` : '100% disponible'}
                  </span>
                </div>
                {injuredPlayers.length > 0 && (
                  <div className="text-[11px] text-rose-300 bg-rose-950/30 p-1.5 rounded border border-rose-800/30 space-y-0.5">
                    {injuredPlayers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onInspectPlayer) {
                            playClickSound();
                            onInspectPlayer(p);
                          }
                        }}
                        className="text-left w-full hover:underline flex items-center justify-between"
                      >
                        <span>{p.lastName}</span>
                        <span className="text-rose-400 text-[10px] font-mono-num">{p.injuryWeeksLeft} sem.</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-slate-400">Fatiga:</span>
                  <span className="text-slate-300 font-mono-num">
                    {tiredPlayers.length} jugadores &lt; 80%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                playClickSound();
                onNavigateTab('finanzas');
              }}
              className="pcf-btn px-2.5 py-1 text-xs rounded transition-colors"
            >
              Economía →
            </button>
            <button
              onClick={() => {
                playClickSound();
                onNavigateTab('plantilla');
              }}
              className="pcf-btn px-2.5 py-1 text-xs rounded transition-colors"
            >
              Plantilla →
            </button>
          </div>
        </div>
      </div>

      {/* News Bulletin */}
      <div className="pcf-panel p-5 shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 font-condensed tracking-wider uppercase">
              Boletín Oficial de Noticias & Prensa Mundial
            </span>
          </div>

          {/* Competition / League News Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'TODAS', label: 'Todas las Noticias' },
              { id: 'CLUB', label: 'Tu Club' },
              { id: 'LIGAS', label: 'Ligas del Mundo' },
              { id: 'COPAS', label: 'Copas & Champions' },
              { id: 'MUNDIAL', label: 'Mundial & Selecciones' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playClickSound();
                  setNewsFilter(f.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg font-condensed font-bold uppercase tracking-wider text-[11px] transition-all ${
                  newsFilter === f.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {deduplicatedNews
            .filter((item) => {
              if (newsFilter === 'TODAS') return true;
              const text = (item.title + ' ' + item.content).toLowerCase();
              if (newsFilter === 'CLUB') {
                return (
                  text.includes(club.name.toLowerCase()) ||
                  text.includes(club.shortName?.toLowerCase() || '') ||
                  item.category === 'DIRECTIVA' ||
                  item.category === 'INSTALACIONES' ||
                  item.category === 'ENTRENADOR'
                );
              }
              if (newsFilter === 'LIGAS') {
                return (
                  text.includes('liga') ||
                  text.includes('jornada') ||
                  text.includes('campeonato') ||
                  text.includes('clasificación') ||
                  text.includes('puntos')
                );
              }
              if (newsFilter === 'COPAS') {
                return (
                  text.includes('copa') ||
                  text.includes('champions') ||
                  text.includes('libertadores') ||
                  text.includes('eliminatoria') ||
                  text.includes('título')
                );
              }
              if (newsFilter === 'MUNDIAL') {
                return (
                  text.includes('mundial') ||
                  text.includes('selección') ||
                  text.includes('fifa') ||
                  text.includes('convocatoria') ||
                  text.includes('internacional')
                );
              }
              return true;
            })
            .map((item, idx) => (
              <div
                key={`${item.id || 'news'}_${idx}`}
                className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">{item.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono-num">{item.date}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.content}</p>
              </div>
            ))}
        </div>
      </div>

      {isFlightModalOpen && availableAircraft && opponent && (
        <FlightSimulatorModal
          isOpen={isFlightModalOpen}
          aircraft={availableAircraft}
          destinationCity={opponent.city || 'Destino'}
          rivalClubName={opponent.name}
          isManagerPilot={Boolean(gameSave.privateLife?.pilotLicense?.isClubOfficialPilot)}
          onFlightComplete={() => {
            setIsFlightModalOpen(false);
            onOpenMatch();
          }}
          onClose={() => setIsFlightModalOpen(false)}
        />
      )}
    </div>
  );
};

