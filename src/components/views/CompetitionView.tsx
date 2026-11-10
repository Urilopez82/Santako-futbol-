import React, { useState, useMemo } from 'react';
import { Club } from '../../types/club';
import { Competition, Match } from '../../types/competition';
import { GameSave } from '../../types/game';
import { Player } from '../../types/player';
import { playClickSound } from '../../utils/audio';
import { 
  Trophy, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  CheckCircle2, 
  Clock,
  Globe2,
  Swords,
  Shield,
  Play,
  Sparkles,
  Flame,
  Crown
} from 'lucide-react';
import { 
  CupMatch, 
  KnockoutTournamentState, 
  initializeAllTournaments, 
  ensureCompleteCupTournaments,
  simulateCupMatch,
  getAllSeasonFixturesForClub,
  UnifiedFixture
} from '../../engine/internationalCompetitionsEngine';
import { MapPin, Filter, AlertCircle, ArrowUpRight } from 'lucide-react';

interface CompetitionViewProps {
  gameSave: GameSave;
  onUpdateSave?: (newSave: GameSave) => void;
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export interface CompetitionThemeConfig {
  id: string;
  gradient: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  motto: string;
  glow: string;
  iconType: 'ucl' | 'uel' | 'uecl' | 'copa' | 'mundial' | 'galaxy' | 'laliga' | 'hypermotion' | 'general';
}

export function getCompetitionTheme(id: string, name: string): CompetitionThemeConfig {
  const lower = (id + ' ' + name).toLowerCase();
  if (lower.includes('champions')) {
    return {
      id: 'ucl',
      gradient: 'from-[#020b22] via-[#091b46] to-[#010614]',
      border: 'border-cyan-400/60',
      badgeBg: 'bg-cyan-950/80 border border-cyan-400/70',
      badgeText: 'text-cyan-300',
      accentText: 'text-cyan-400',
      motto: '★ UEFA CHAMPIONS LEAGUE · 36 Gigantes Europeos en Fase de Liga Única y Cuadro Final',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
      iconType: 'ucl',
    };
  }
  if (lower.includes('europa') && !lower.includes('conference')) {
    return {
      id: 'uel',
      gradient: 'from-[#1c0a00] via-[#331302] to-[#0c0400]',
      border: 'border-orange-500/60',
      badgeBg: 'bg-orange-950/80 border border-orange-500/70',
      badgeText: 'text-orange-300',
      accentText: 'text-orange-400',
      motto: '🔥 UEFA EUROPA LEAGUE · La batalla continental por la gloria de plata y fuego',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.25)]',
      iconType: 'uel',
    };
  }
  if (lower.includes('conference')) {
    return {
      id: 'uecl',
      gradient: 'from-[#011409] via-[#062914] to-[#000a04]',
      border: 'border-emerald-500/60',
      badgeBg: 'bg-emerald-950/80 border border-emerald-400/70',
      badgeText: 'text-lime-300',
      accentText: 'text-lime-400',
      motto: '⚡ UEFA CONFERENCE LEAGUE · El escenario donde nacen las nuevas potencias europeas',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
      iconType: 'uecl',
    };
  }
  if (lower.includes('copa_del_rey') || lower.includes('copa')) {
    return {
      id: 'copa',
      gradient: 'from-[#29030a] via-[#400612] to-[#120104]',
      border: 'border-amber-500/60',
      badgeBg: 'bg-rose-950/80 border border-amber-400/70',
      badgeText: 'text-amber-300',
      accentText: 'text-amber-400',
      motto: '👑 COPA DEL REY · Torneo del K.O. a partido único · El Campeón clasifica a la Champions',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
      iconType: 'copa',
    };
  }
  if (lower.includes('fifa') || lower.includes('mundial') || lower.includes('club_world_cup')) {
    return {
      id: 'mundial',
      gradient: 'from-[#1c1401] via-[#332402] to-[#0a0700]',
      border: 'border-yellow-400/70',
      badgeBg: 'bg-amber-950/80 border border-yellow-400/70',
      badgeText: 'text-amber-300',
      accentText: 'text-yellow-400',
      motto: '🌍 COPA MUNDIAL DE CLUBES FIFA · 32 Clubes de los 5 Continentes (8 Grupos de 4)',
      glow: 'shadow-[0_0_35px_rgba(234,179,8,0.3)]',
      iconType: 'mundial',
    };
  }
  if (lower.includes('intergalactica')) {
    return {
      id: 'galaxy',
      gradient: 'from-[#1d0330] via-[#330754] to-[#090012]',
      border: 'border-fuchsia-500/70',
      badgeBg: 'bg-purple-950/80 border border-fuchsia-400/70',
      badgeText: 'text-fuchsia-300',
      accentText: 'text-fuchsia-400',
      motto: '🌌 COPA INTERGALÁCTICA DE CLUBES · 200 Clubes (20 de la Tierra y 180 Alienígenas)',
      glow: 'shadow-[0_0_35px_rgba(217,70,239,0.35)]',
      iconType: 'galaxy',
    };
  }
  if (lower.includes('tier1') || lower.includes('primera')) {
    return {
      id: 'laliga',
      gradient: 'from-[#21040a] via-[#380914] to-[#0f172a]',
      border: 'border-rose-500/60',
      badgeBg: 'bg-rose-950/80 border border-rose-500/60',
      badgeText: 'text-rose-300',
      accentText: 'text-rose-400',
      motto: '⚽ LALIGA EA SPORTS · La máxima categoría del fútbol profesional · 38 Jornadas',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]',
      iconType: 'laliga',
    };
  }
  if (lower.includes('tier2') || lower.includes('segunda')) {
    return {
      id: 'hypermotion',
      gradient: 'from-[#031529] via-[#082649] to-[#020b14]',
      border: 'border-sky-500/60',
      badgeBg: 'bg-sky-950/80 border border-sky-400/70',
      badgeText: 'text-sky-300',
      accentText: 'text-sky-400',
      motto: '⚡ LALIGA HYPERMOTION · La competición más vibrante e igualada del fútbol',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.25)]',
      iconType: 'hypermotion',
    };
  }
  return {
    id: 'general',
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#090d16]',
    border: 'border-amber-500/40',
    badgeBg: 'bg-slate-900 border border-amber-500/40',
    badgeText: 'text-amber-300',
    accentText: 'text-amber-400',
    motto: '🏆 Competición Oficial de Fútbol Profesional',
    glow: 'shadow-md',
    iconType: 'general',
  };
}

export const CompetitionView: React.FC<CompetitionViewProps> = ({ gameSave, onUpdateSave }) => {
  const userClub = gameSave.clubs[gameSave.userClubId];
  const initialCompId = userClub?.divisionId || Object.keys(gameSave.competitions)[0];
  const [selectedCompId, setSelectedCompId] = useState<string>(initialCompId);
  const competition = gameSave.competitions[selectedCompId] || gameSave.competitions[initialCompId] || Object.values(gameSave.competitions)[0];
  const [selectedMatchday, setSelectedMatchday] = useState<number>(competition?.currentMatchday || 1);
  const [inspectedMatch, setInspectedMatch] = useState<Match | null>(null);

  // Tab mode: Ligas, Copas continentales, o Calendario Mes a Mes
  const [viewMode, setViewMode] = useState<'ligas' | 'copas' | 'calendario_club'>('ligas');
  const [selectedCupId, setSelectedCupId] = useState<string>('copa_del_rey');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [localCups, setLocalCups] = useState<Record<string, KnockoutTournamentState>>(() => {
    return ensureCompleteCupTournaments(
      gameSave.clubs, 
      gameSave.cupTournaments, 
      gameSave.currentSeason || '2026/27',
      gameSave.userClubId
    );
  });

  // Calculate full season fixtures across all competitions for the user's club
  const clubFixtures = useMemo(() => {
    return getAllSeasonFixturesForClub(gameSave, userClub?.id || '');
  }, [gameSave, userClub?.id]);

  const fixturesByMonth = useMemo(() => {
    const groups: Record<string, { key: string; label: string; monthIndex: number; year: number; fixtures: UnifiedFixture[] }> = {};
    clubFixtures.forEach((f) => {
      const parts = f.date.split('-');
      const yearStr = parts[0] || '2026';
      const monthStr = parts[1] || '08';
      const month = parseInt(monthStr, 10);
      const key = `${yearStr}-${monthStr}`;
      const label = `${MONTH_NAMES_ES[month - 1] || 'Mes'} ${yearStr}`;
      if (!groups[key]) {
        groups[key] = { key, label, monthIndex: month, year: parseInt(yearStr, 10), fixtures: [] };
      }
      groups[key].fixtures.push(f);
    });
    return groups;
  }, [clubFixtures]);

  const playedFixtures = useMemo(() => clubFixtures.filter((f) => f.played), [clubFixtures]);
  const wins = useMemo(() => playedFixtures.filter((f) => {
    const myScore = f.isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
    const oppScore = f.isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);
    return myScore > oppScore;
  }).length, [playedFixtures]);
  const draws = useMemo(() => playedFixtures.filter((f) => (f.homeScore ?? 0) === (f.awayScore ?? 0)).length, [playedFixtures]);
  const losses = useMemo(() => playedFixtures.filter((f) => {
    const myScore = f.isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0);
    const oppScore = f.isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0);
    return myScore < oppScore;
  }).length, [playedFixtures]);
  const gf = useMemo(() => playedFixtures.reduce((acc, f) => acc + (f.isHome ? (f.homeScore ?? 0) : (f.awayScore ?? 0)), 0), [playedFixtures]);
  const gc = useMemo(() => playedFixtures.reduce((acc, f) => acc + (f.isHome ? (f.awayScore ?? 0) : (f.homeScore ?? 0)), 0), [playedFixtures]);
  const nextFixture = useMemo(() => clubFixtures.find((f) => !f.played), [clubFixtures]);

  if (!competition) return null;

  const currentMatchdayMatches = competition.matches.filter((m) => m.matchday === selectedMatchday);

  // Top scorers calculation across all players in this competition
  const competitionPlayers = Object.values(gameSave.players).filter((p) => {
    const club = p.clubId ? gameSave.clubs[p.clubId] : null;
    return club && club.divisionId === competition.id;
  });

  const topScorers = [...competitionPlayers]
    .filter((p) => p.seasonStats.goals > 0)
    .sort((a, b) => b.seasonStats.goals - a.seasonStats.goals)
    .slice(0, 8);

  const activeCup = localCups[selectedCupId] || Object.values(localCups)[0];

  const handleSimulateCupRound = () => {
    playClickSound();
    if (!activeCup) return;
    const updatedMatches = activeCup.matches.map((m) => {
      if (m.played) return m;
      return simulateCupMatch(m, gameSave.clubs, gameSave.players);
    });
    const updatedCup: KnockoutTournamentState = {
      ...activeCup,
      matches: updatedMatches,
    };
    const newCups = { ...localCups, [activeCup.id]: updatedCup };
    setLocalCups(newCups);
    if (onUpdateSave) {
      onUpdateSave({ ...gameSave, cupTournaments: newCups });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toggle: Ligas vs Copas Continentales vs Calendario Mes a Mes */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 shadow-md">
        <button
          onClick={() => {
            playClickSound();
            setViewMode('ligas');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-condensed font-black text-xs uppercase tracking-wider transition-all ${
            viewMode === 'ligas'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span className="truncate">Ligas Regulares</span>
        </button>
        <button
          onClick={() => {
            playClickSound();
            setViewMode('copas');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-condensed font-black text-xs uppercase tracking-wider transition-all ${
            viewMode === 'copas'
              ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Swords className="w-4 h-4 shrink-0" />
          <span className="truncate">Copas y Continentes</span>
        </button>
        <button
          onClick={() => {
            playClickSound();
            setViewMode('calendario_club');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-condensed font-black text-xs uppercase tracking-wider transition-all ${
            viewMode === 'calendario_club'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">Calendario Temporada (Mes a Mes)</span>
        </button>
      </div>

      {viewMode === 'copas' ? (
        /* Copas & Torneos Continentales View */
        <div className="space-y-6">
          {/* Tournament Themed Header Banner */}
          {(() => {
            const cupTheme = getCompetitionTheme(activeCup?.id || '', activeCup?.name || '');
            const isFinalRound = 
              (activeCup?.currentRound === 'Gran Final' || activeCup?.currentRound === 'Final') &&
              Boolean(activeCup?.matches?.some(m => (m.roundName === 'Gran Final' || m.roundName === 'Final') && m.homeTeamId && m.awayTeamId));
            return (
              <div className={`bg-gradient-to-r ${cupTheme.gradient} border-2 ${cupTheme.border} ${cupTheme.glow} rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-white/20 flex items-center justify-center text-2xl shadow-xl shrink-0">
                      {cupTheme.iconType === 'ucl' ? '⭐' :
                       cupTheme.iconType === 'uel' ? '🔥' :
                       cupTheme.iconType === 'uecl' ? '⚡' :
                       cupTheme.iconType === 'copa' ? '👑' :
                       cupTheme.iconType === 'mundial' ? '🌍' :
                       cupTheme.iconType === 'galaxy' ? '🌌' : '🏆'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black text-white font-condensed uppercase tracking-wider drop-shadow-md">
                          {activeCup?.name || 'Torneo Eliminatorio'}
                        </h2>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${cupTheme.badgeBg} ${cupTheme.badgeText} font-condensed tracking-wider uppercase`}>
                          {activeCup?.currentRound || 'Fase de Eliminación'}
                        </span>
                      </div>
                      <p className={`text-xs font-bold font-condensed tracking-wide ${cupTheme.accentText} mt-0.5`}>
                        {cupTheme.motto}
                      </p>
                      <p className="text-[11px] text-slate-300 font-condensed">
                        {activeCup?.trophyName} · Temporada {activeCup?.season} · {activeCup?.matches.length} Enfrentamientos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs text-slate-300 font-black uppercase font-condensed tracking-wider">Elegir Torneo:</label>
                    <select
                      value={selectedCupId}
                      onChange={(e) => {
                        playClickSound();
                        setSelectedCupId(e.target.value);
                      }}
                      className="bg-slate-950 border-2 border-slate-600 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 shadow-inner"
                    >
                      {Object.values(localCups).map((cup) => (
                        <option key={cup.id} value={cup.id}>
                          {cup.name} ({cup.matches.length} partidos · {cup.currentRound})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleSimulateCupRound}
                      className="pcf-btn pcf-btn-emerald px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow font-black font-condensed tracking-wider uppercase"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Simular Ronda de Copa</span>
                    </button>
                  </div>
                </div>

                {/* Opening Decisive Round Alert */}
                {isFinalRound && (
                  <div className="bg-amber-400/15 border border-amber-400/50 rounded-xl p-2.5 flex items-center gap-2.5 text-amber-300 animate-pulse text-xs">
                    <Trophy className="w-5 h-5 shrink-0 text-amber-400" />
                    <div>
                      <strong className="font-condensed uppercase tracking-wider block text-amber-200 font-black">
                        ⚡ ¡RONDA DECISIVA: GRAN FINAL POR EL TÍTULO!
                      </strong>
                      <span>El trofeo de campeón se decide en este enfrentamiento histórico. ¡A por la gloria!</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Special notice for Copa del Rey single leg rule */}
          {activeCup?.id === 'copa_del_rey' && (
            <div className="pcf-panel bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 flex items-center gap-3 text-xs text-amber-200">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="font-condensed uppercase tracking-wider block text-amber-300 font-black">
                  Normativa Oficial RFEF: Eliminatoria a Partido Único
                </strong>
                <span>
                  Los emparejamientos se disputan obligatoriamente en el estadio del club de menor categoría divisional. En caso de empate al minuto 90, prórroga reglamentaria y tanda de penaltis.
                </span>
              </div>
            </div>
          )}

          {/* Special notice & 36-Club League Phase Table for UEFA Champions League */}
          {activeCup?.id === 'uefa_champions' && (
            <div className="space-y-4">
              <div className="pcf-panel bg-sky-950/30 border border-sky-600/40 rounded-xl p-3 flex items-center gap-3 text-xs text-sky-200">
                <Globe2 className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <strong className="font-condensed uppercase tracking-wider block text-sky-300 font-black">
                    Formato Oficial UEFA Champions League: Fase de Liga Única (36 Clubes) y Fase Final (16avos a Gran Final)
                  </strong>
                  <span>
                    Fase de Liga de 36 clubes donde todos juegan exactamente 8 partidos. Los 32 primeros clasificados acceden a la Fase Final eliminatoria (desde 16avos de Final hasta la Gran Final). Los 4 últimos (33º al 36º) quedan eliminados.
                  </span>
                </div>
              </div>

              {activeCup.standings && activeCup.standings.length > 0 && (
                <div className="pcf-panel rounded-2xl overflow-hidden shadow-xl border border-slate-700/80">
                  <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-700/80 flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 font-condensed uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Clasificación General — Fase de Liga UEFA Champions League (36 Equipos · 8 Jornadas)
                    </span>
                    <div className="flex items-center gap-3 text-[10px] font-condensed">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> 1º-32º: Fase Final (16avos)
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <span className="w-2 h-2 rounded-full bg-rose-400" /> 33º-36º: Eliminados
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono-num">
                      <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase font-condensed sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3 text-center w-12">Pos</th>
                          <th className="py-2 px-3">Club</th>
                          <th className="py-2 px-2 text-center">PJ</th>
                          <th className="py-2 px-2 text-center">PG</th>
                          <th className="py-2 px-2 text-center">PE</th>
                          <th className="py-2 px-2 text-center">PP</th>
                          <th className="py-2 px-2 text-center">GF</th>
                          <th className="py-2 px-2 text-center">GC</th>
                          <th className="py-2 px-2 text-center font-bold">DG</th>
                          <th className="py-2 px-3 text-center font-black text-amber-400">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {activeCup.standings.map((row, idx) => {
                          const cl = gameSave.clubs[row.teamId];
                          const isUser = row.teamId === gameSave.userClubId;
                          const pos = idx + 1;
                          let slotBadge = 'border-l-4 border-transparent';
                          if (pos <= 32) slotBadge = 'border-l-4 border-emerald-500 bg-emerald-950/10';
                          else slotBadge = 'border-l-4 border-rose-500/40 bg-rose-950/5';

                          return (
                            <tr key={row.teamId} className={`hover:bg-slate-800/40 ${slotBadge} ${isUser ? 'bg-amber-950/30' : ''}`}>
                              <td className="py-1.5 px-3 text-center font-bold text-slate-300">{pos}</td>
                              <td className="py-1.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-5 h-5 rounded flex items-center justify-center font-black text-[9px] font-condensed shrink-0 shadow-sm"
                                    style={{
                                      backgroundColor: cl?.primaryColor || '#1e293b',
                                      color: cl?.textColor || '#ffffff',
                                    }}
                                  >
                                    {cl?.code || 'CLB'}
                                  </div>
                                  <span className={`font-condensed font-bold truncate ${isUser ? 'text-amber-300' : 'text-slate-100'}`}>
                                    {cl?.shortName || cl?.name || row.teamId}
                                  </span>
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-center text-slate-300">{row.played}</td>
                              <td className="py-1.5 px-2 text-center text-slate-300">{row.won}</td>
                              <td className="py-1.5 px-2 text-center text-slate-400">{row.drawn}</td>
                              <td className="py-1.5 px-2 text-center text-slate-400">{row.lost}</td>
                              <td className="py-1.5 px-2 text-center text-slate-300">{row.goalsFor}</td>
                              <td className="py-1.5 px-2 text-center text-slate-300">{row.goalsAgainst}</td>
                              <td className={`py-1.5 px-2 text-center font-bold ${row.goalDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}
                              </td>
                              <td className="py-1.5 px-3 text-center font-black text-amber-400 bg-slate-900/40">{row.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Group Stage Information & Standings for FIFA Club World Cup, Copa Universal, and Group-based cups */}
          {Boolean(
            (activeCup?.id === 'mundial_clubes_fifa' || activeCup?.id === 'copa_universal' || activeCup?.matches.some((m) => m.roundName?.includes('Grupo'))) &&
            activeCup?.standings &&
            activeCup.standings.length > 0
          ) && (
            <div className="space-y-4">
              <div className="pcf-panel bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border border-yellow-500/50 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-black text-white font-condensed uppercase tracking-wider">
                        Fase de Grupos Oficial — Clasificaciones y Grupos A al H
                      </h3>
                      <p className="text-xs text-slate-300">
                        Los 2 mejores de cada grupo clasifican a los Octavos de Final. Se aplican puntos, diferencia de goles y goles a favor.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-condensed font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> 1º y 2º: Pasan a Octavos
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-500/40">
                      <span className="w-2 h-2 rounded-full bg-rose-400" /> 3º y 4º: Eliminados
                    </span>
                  </div>
                </div>
              </div>

              {/* Responsive 2-Column Grid for the 8 Groups */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((gLetter) => {
                  const groupMatches = (activeCup?.matches || []).filter(
                    (m) => m.roundName.includes(`Grupo ${gLetter}`)
                  );
                  // Find team IDs that play in this group
                  const groupTeamIds = new Set<string>();
                  groupMatches.forEach((m) => {
                    if (m.homeTeamId) groupTeamIds.add(m.homeTeamId);
                    if (m.awayTeamId) groupTeamIds.add(m.awayTeamId);
                  });

                  if (groupTeamIds.size === 0) return null;

                  // Standings for this group sorted by Points, GD, GF
                  const groupStandings = (activeCup?.standings || [])
                    .filter((s) => groupTeamIds.has(s.teamId))
                    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);

                  return (
                    <div
                      key={`group_${gLetter}`}
                      className="pcf-panel rounded-2xl overflow-hidden shadow-lg border border-slate-700/80 bg-slate-900/80"
                    >
                      <div className="bg-slate-950/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300 font-condensed uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-mono-num text-[11px] font-black">
                            {gLetter}
                          </span>
                          Grupo {gLetter}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-num">
                          {groupMatches.filter((m) => m.played).length} de {groupMatches.length} partidos jugados
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono-num">
                          <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-condensed border-b border-slate-800">
                            <tr>
                              <th className="py-1.5 px-2.5 text-center w-8">Pos</th>
                              <th className="py-1.5 px-2">Club</th>
                              <th className="py-1.5 px-1.5 text-center">PJ</th>
                              <th className="py-1.5 px-1.5 text-center text-emerald-400">G</th>
                              <th className="py-1.5 px-1.5 text-center text-amber-400">E</th>
                              <th className="py-1.5 px-1.5 text-center text-rose-400">P</th>
                              <th className="py-1.5 px-1.5 text-center">GF</th>
                              <th className="py-1.5 px-1.5 text-center">GC</th>
                              <th className="py-1.5 px-1.5 text-center">DG</th>
                              <th className="py-1.5 px-2.5 text-center font-black text-amber-300 bg-slate-950/80">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-[11px]">
                            {groupStandings.map((row, idx) => {
                              const club = gameSave.clubs[row.teamId];
                              const isQualified = idx < 2;
                              const isUser = row.teamId === gameSave.userClubId;

                              return (
                                <tr
                                  key={row.teamId}
                                  className={`transition-colors ${
                                    isUser
                                      ? 'bg-amber-950/30 font-bold'
                                      : isQualified
                                      ? 'bg-emerald-950/15 hover:bg-emerald-950/25'
                                      : 'hover:bg-slate-800/40'
                                  }`}
                                >
                                  <td className="py-1.5 px-2.5 text-center">
                                    <span
                                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                                        isQualified
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 font-sans">
                                    <div className="flex items-center gap-2 truncate max-w-[140px] sm:max-w-[180px]">
                                      <div
                                        className="w-4 h-4 rounded text-[9px] font-bold font-condensed flex items-center justify-center shrink-0"
                                        style={{
                                          backgroundColor: club?.primaryColor || '#1e293b',
                                          color: club?.textColor || '#ffffff',
                                        }}
                                      >
                                        {club?.code?.slice(0, 2) || 'CL'}
                                      </div>
                                      <span className={`truncate text-xs ${isUser ? 'text-amber-300 font-black' : 'text-slate-200'}`}>
                                        {club?.shortName || club?.name || row.teamId}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-1.5 px-1.5 text-center text-slate-300">{row.played}</td>
                                  <td className="py-1.5 px-1.5 text-center font-bold text-emerald-400">{row.won}</td>
                                  <td className="py-1.5 px-1.5 text-center text-amber-400">{row.drawn}</td>
                                  <td className="py-1.5 px-1.5 text-center text-rose-400">{row.lost}</td>
                                  <td className="py-1.5 px-1.5 text-center text-slate-300">{row.goalsFor}</td>
                                  <td className="py-1.5 px-1.5 text-center text-slate-300">{row.goalsAgainst}</td>
                                  <td className={`py-1.5 px-1.5 text-center font-bold ${row.goalDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-center font-black text-amber-300 bg-slate-950/80">
                                    {row.points}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mini fixtures of this group */}
                      <div className="bg-slate-950/40 p-2.5 border-t border-slate-800 space-y-1">
                        {groupMatches.slice(0, 3).map((gm) => {
                          const hClub = gameSave.clubs[gm.homeTeamId];
                          const aClub = gameSave.clubs[gm.awayTeamId];
                          return (
                            <div key={gm.id} className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="truncate flex-1 text-slate-300 text-right pr-2">
                                {hClub?.shortName || hClub?.name || gm.homeTeamId}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-amber-400 shrink-0">
                                {gm.played ? `${gm.homeScore} - ${gm.awayScore}` : 'vs'}
                              </span>
                              <span className="truncate flex-1 text-slate-300 text-left pl-2">
                                {aClub?.shortName || aClub?.name || gm.awayTeamId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Finalists Banner: STRICTLY ONLY when tournament is genuinely in the Gran Final and match is ready but not yet played */}
          {(() => {
            const isStrictFinal =
              activeCup?.currentRound === 'Gran Final' || activeCup?.currentRound === 'Final';

            if (!isStrictFinal) return null;

            const finalMatch = activeCup?.matches.find(
              (m) => m.roundName === 'Gran Final' || m.roundName === 'Final'
            );
            if (!finalMatch || !finalMatch.homeTeamId || !finalMatch.awayTeamId) return null;

            const homeFin = gameSave.clubs[finalMatch.homeTeamId];
            const awayFin = gameSave.clubs[finalMatch.awayTeamId];

            if (!activeCup.championClubId && finalMatch.homeTeamId && finalMatch.awayTeamId && !finalMatch.played) {
              return (
                <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.25)] space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-center gap-2 text-center">
                    <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-condensed">
                      ★ ¡¡EQUIPOS CLASIFICADOS PARA LA GRAN FINAL!! ★
                    </span>
                    <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                    {/* Finalist 1 */}
                    <div className="flex items-center gap-3.5 flex-1 justify-start">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm font-condensed shadow-lg shrink-0"
                        style={{
                          backgroundColor: homeFin?.primaryColor || '#1e293b',
                          color: homeFin?.textColor || '#ffffff',
                          border: `2px solid ${homeFin?.secondaryColor || '#fbbf24'}`,
                        }}
                      >
                        {homeFin?.code || 'FIN1'}
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase block font-condensed">Primer Finalista Clasificado</span>
                        <h4 className="text-lg font-black text-white font-condensed uppercase">{homeFin?.name || finalMatch.homeTeamId}</h4>
                        <span className="text-xs text-slate-400 font-mono-num">Rep: {homeFin?.reputation || 75} · Técnico: {homeFin?.coachName || 'Entrenador'}</span>
                      </div>
                    </div>

                    {/* Trophy Center Piece */}
                    <div className="flex flex-col items-center justify-center px-4 shrink-0 text-center">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400/80 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                        <Trophy className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-black text-amber-300 font-condensed uppercase mt-2 tracking-wider">
                        {finalMatch.date}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-condensed">Gran Final a Partido Único</span>
                    </div>

                    {/* Finalist 2 */}
                    <div className="flex items-center gap-3.5 flex-1 justify-end text-right">
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase block font-condensed">Segundo Finalista Clasificado</span>
                        <h4 className="text-lg font-black text-white font-condensed uppercase">{awayFin?.name || finalMatch.awayTeamId}</h4>
                        <span className="text-xs text-slate-400 font-mono-num">Rep: {awayFin?.reputation || 75} · Técnico: {awayFin?.coachName || 'Entrenador'}</span>
                      </div>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm font-condensed shadow-lg shrink-0"
                        style={{
                          backgroundColor: awayFin?.primaryColor || '#1e293b',
                          color: awayFin?.textColor || '#ffffff',
                          border: `2px solid ${awayFin?.secondaryColor || '#fbbf24'}`,
                        }}
                      >
                        {awayFin?.code || 'FIN2'}
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-300 font-sans border-t border-slate-800/80 pt-3">
                    Ambos clubes han superado todas las rondas eliminatorias del torneo y lucharán frente a frente por alzar el título oficial de <strong className="text-amber-300">{activeCup.name}</strong>.
                  </p>
                </div>
              );
            }

            if (activeCup.championClubId) {
              const champClub = gameSave.clubs[activeCup.championClubId];
              const runnerClub = activeCup.runnerUpClubId ? gameSave.clubs[activeCup.runnerUpClubId] : undefined;
              const isUserChamp = champClub?.id === gameSave.userClubId;

              return (
                <div className="bg-gradient-to-r from-amber-950 via-yellow-950/90 to-amber-950 border-2 border-amber-400 rounded-2xl p-6 shadow-[0_0_40px_rgba(251,191,36,0.35)] space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-center gap-2 text-center">
                    <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
                    <span className="text-sm font-black uppercase tracking-widest text-amber-300 font-condensed">
                      ★ ¡¡CAMPEÓN OFICIAL DE {activeCup.name.toUpperCase()}!! ★
                    </span>
                    <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl font-condensed shadow-2xl shrink-0"
                      style={{
                        backgroundColor: champClub?.primaryColor || '#1e293b',
                        color: champClub?.textColor || '#ffffff',
                        border: `3px solid ${champClub?.secondaryColor || '#fbbf24'}`,
                      }}
                    >
                      {champClub?.code || 'CAM'}
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block font-condensed">
                        {isUserChamp ? '🏆 ¡ENHORABUENA! TU CLUB ES EL NUEVO REY DEL TORNEO 🏆' : 'Glory & Honor'}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black text-white font-condensed uppercase tracking-wider">
                        {champClub?.name || activeCup.championClubId}
                      </h3>
                      <p className="text-xs text-slate-300 font-condensed">
                        Entrenador Campeón: <strong className="text-amber-400">{isUserChamp ? `${gameSave.manager.firstName} ${gameSave.manager.lastName}` : (champClub?.coachName || 'Entrenador Titulado')}</strong>
                        {runnerClub && (
                          <span className="ml-3 text-slate-400">· Subcampeón de Honor: <strong className="text-slate-300">{runnerClub.name}</strong></span>
                        )}
                      </p>
                    </div>
                  </div>

                  {finalMatch && finalMatch.played && (
                    <div className="text-center font-mono-num text-xs bg-slate-950/60 py-2 px-4 rounded-xl border border-amber-500/30 max-w-md mx-auto">
                      <span className="text-slate-400 block text-[10px] uppercase font-condensed">Resultado de la Gran Final</span>
                      <span className="text-base font-black text-white">
                        {finalMatch.homeScore} - {finalMatch.awayScore}
                        {finalMatch.homePenalties !== undefined && (
                          <span className="text-amber-400 ml-2">({finalMatch.homePenalties}-{finalMatch.awayPenalties} pen.)</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })()}

          {/* Cup Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCup?.matches.map((m) => {
              const homeClub = gameSave.clubs[m.homeTeamId];
              const awayClub = gameSave.clubs[m.awayTeamId];
              const isUserMatch = m.homeTeamId === gameSave.userClubId || m.awayTeamId === gameSave.userClubId;

              return (
                <div
                  key={m.id}
                  className={`pcf-panel rounded-xl p-4 transition-all border ${
                    isUserMatch
                      ? 'border-amber-400/80 bg-amber-950/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-num mb-2 pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-slate-300 uppercase font-condensed">{m.roundName}</span>
                    <div className="flex items-center gap-2">
                      {m.isLowerTierHome && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
                          Sede: Campo Inferior
                        </span>
                      )}
                      <span>{m.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    {/* Home Club */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs font-condensed shrink-0 shadow"
                        style={{
                          backgroundColor: homeClub?.primaryColor || '#1e293b',
                          color: homeClub?.textColor || '#ffffff',
                          border: `1.5px solid ${homeClub?.secondaryColor || '#64748b'}`,
                        }}
                      >
                        {homeClub?.code || 'HOM'}
                      </div>
                      <div className="truncate">
                        <span className={`text-xs font-bold block truncate ${m.homeTeamId === gameSave.userClubId ? 'text-amber-300 font-black' : 'text-slate-100'}`}>
                          {homeClub?.shortName || homeClub?.name || m.homeTeamId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-num">
                          Rep: {homeClub?.reputation || 70} · Div: {homeClub?.divisionId}
                        </span>
                      </div>
                    </div>

                    {/* Result or VS */}
                    <div className="px-4 text-center shrink-0">
                      {m.played ? (
                        <div className="font-mono-num">
                          <span className="text-base font-black text-white px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700">
                            {m.homeScore} - {m.awayScore}
                          </span>
                          {m.homePenalties !== undefined && m.awayPenalties !== undefined && (
                            <span className="block text-[10px] font-bold text-amber-400 mt-1">
                              (Penaltis: {m.homePenalties}-{m.awayPenalties})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 font-mono-num uppercase px-2 py-1 bg-slate-900/60 rounded">
                          vs
                        </span>
                      )}
                    </div>

                    {/* Away Club */}
                    <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0 text-right">
                      <div className="truncate">
                        <span className={`text-xs font-bold block truncate ${m.awayTeamId === gameSave.userClubId ? 'text-amber-300 font-black' : 'text-slate-100'}`}>
                          {awayClub?.shortName || awayClub?.name || m.awayTeamId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-num">
                          Rep: {awayClub?.reputation || 70} · Div: {awayClub?.divisionId}
                        </span>
                      </div>
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs font-condensed shrink-0 shadow"
                        style={{
                          backgroundColor: awayClub?.primaryColor || '#1e293b',
                          color: awayClub?.textColor || '#ffffff',
                          border: `1.5px solid ${awayClub?.secondaryColor || '#64748b'}`,
                        }}
                      >
                        {awayClub?.code || 'AWA'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'calendario_club' ? (
        /* Calendario Oficial del Club (Mes a Mes) */
        <div className="space-y-6">
          {/* Club Header & Season Stats Overview */}
          <div className="pcf-panel rounded-2xl p-5 shadow-xl border border-slate-700/80">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm font-condensed shadow-lg"
                  style={{
                    backgroundColor: userClub?.primaryColor || '#047857',
                    color: userClub?.textColor || '#ffffff',
                    border: `2px solid ${userClub?.secondaryColor || '#fbbf24'}`,
                  }}
                >
                  {userClub?.code || 'CLB'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white font-condensed uppercase tracking-wider">
                      {userClub?.name || 'Tu Club'}
                    </h2>
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 font-condensed tracking-wider">
                      ★ CALENDARIO OFICIAL MULTICOMPETICIÓN
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-condensed tracking-wide flex items-center gap-2 mt-0.5">
                    <span>Estadio: <strong className="text-white">{userClub?.stadium?.name || 'Estadio Municipal'}</strong> ({userClub?.stadium?.capacity?.toLocaleString() || '15,000'} loc.)</span>
                    <span>·</span>
                    <span>Manager: <strong className="text-amber-400">{gameSave.manager.firstName} {gameSave.manager.lastName}</strong></span>
                  </p>
                </div>
              </div>

              {/* Next upcoming fixture quick highlight */}
              {nextFixture && (
                <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block font-condensed">
                      Próximo Encuentro Programado
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {nextFixture.date} · {nextFixture.isHome ? 'vs ' : '@ '}
                      {gameSave.clubs[nextFixture.opponentId]?.name || nextFixture.opponentId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-condensed">
                      {nextFixture.competitionName} ({nextFixture.roundOrMatchday})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Season Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider block">
                  Partidos Temporada
                </span>
                <span className="text-xl font-black text-white font-mono-num block mt-0.5">
                  {clubFixtures.length}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-num">
                  {playedFixtures.length} jugados · {clubFixtures.length - playedFixtures.length} pendientes
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider block">
                  Balance Oficial
                </span>
                <span className="text-xl font-black text-amber-400 font-mono-num block mt-0.5">
                  {wins}V · {draws}E · {losses}D
                </span>
                <span className="text-[10px] text-slate-500 font-mono-num">
                  {playedFixtures.length > 0 ? Math.round((wins / playedFixtures.length) * 100) : 0}% de victorias
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider block">
                  Goles (GF / GC)
                </span>
                <span className="text-xl font-black text-white font-mono-num block mt-0.5">
                  {gf} / {gc}
                </span>
                <span className={`text-[10px] font-mono-num font-bold ${gf - gc >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Diferencia: {gf - gc >= 0 ? `+${gf - gc}` : gf - gc}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider block">
                  Competiciones Activas
                </span>
                <span className="text-xl font-black text-sky-400 font-mono-num block mt-0.5">
                  {new Set(clubFixtures.map((f) => f.competitionId)).size}
                </span>
                <span className="text-[10px] text-slate-500 font-condensed uppercase tracking-wider">
                  Liga, Copas y Torneos
                </span>
              </div>
            </div>
          </div>

          {/* Month Selector Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => {
                playClickSound();
                setSelectedMonthFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-condensed font-black tracking-wider uppercase whitespace-nowrap transition-all border ${
                selectedMonthFilter === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Todos los Meses ({clubFixtures.length})
            </button>
            {Object.values(fixturesByMonth).map((mGroup) => (
              <button
                key={mGroup.key}
                onClick={() => {
                  playClickSound();
                  setSelectedMonthFilter(mGroup.key);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold tracking-wider uppercase whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  selectedMonthFilter === mGroup.key
                    ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white border-sky-400 shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{mGroup.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 text-slate-300 font-mono-num">
                  {mGroup.fixtures.length}
                </span>
              </button>
            ))}
          </div>

          {/* Month by Month Fixture Cards */}
          <div className="space-y-6">
            {(selectedMonthFilter === 'all'
              ? Object.values(fixturesByMonth)
              : Object.values(fixturesByMonth).filter((g) => g.key === selectedMonthFilter)
            ).map((monthGroup) => (
              <div key={monthGroup.key} className="space-y-3">
                {/* Month Banner */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-black text-white font-condensed uppercase tracking-wider">
                      {monthGroup.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-condensed font-bold">
                    {monthGroup.fixtures.length} {monthGroup.fixtures.length === 1 ? 'partido' : 'partidos'}
                  </span>
                </div>

                {/* Fixtures in this month */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {monthGroup.fixtures.map((fixture) => {
                    const homeClub = gameSave.clubs[fixture.homeTeamId];
                    const awayClub = gameSave.clubs[fixture.awayTeamId];
                    const isUserHome = fixture.isHome;
                    const opponentClub = gameSave.clubs[fixture.opponentId];
                    const isNext = nextFixture?.id === fixture.id;

                    // Compute result outcome for user
                    let outcomeBadge = null;
                    if (fixture.played) {
                      const userScore = isUserHome ? (fixture.homeScore ?? 0) : (fixture.awayScore ?? 0);
                      const oppScore = isUserHome ? (fixture.awayScore ?? 0) : (fixture.homeScore ?? 0);
                      if (userScore > oppScore) {
                        outcomeBadge = (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider font-condensed">
                            Victoria
                          </span>
                        );
                      } else if (userScore === oppScore) {
                        outcomeBadge = (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40 uppercase tracking-wider font-condensed">
                            Empate
                          </span>
                        );
                      } else {
                        outcomeBadge = (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40 uppercase tracking-wider font-condensed">
                            Derrota
                          </span>
                        );
                      }
                    }

                    // Badge color by tournament type
                    let compBadgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
                    if (fixture.tournamentType === 'COPA') {
                      compBadgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
                    } else if (fixture.tournamentType === 'CHAMPIONS') {
                      compBadgeStyle = 'bg-sky-950/80 text-sky-300 border-sky-500/40';
                    } else if (fixture.tournamentType === 'SUPERCOPA') {
                      compBadgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-500/40';
                    }

                    return (
                      <div
                        key={fixture.id}
                        className={`pcf-panel rounded-xl p-4 transition-all border ${
                          isNext
                            ? 'border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : fixture.played
                            ? 'border-slate-800 bg-slate-900/60'
                            : 'border-slate-700/80 hover:border-slate-500'
                        }`}
                      >
                        {/* Header: Competition badge, round, date */}
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider font-condensed ${compBadgeStyle}`}>
                              {fixture.tournamentType === 'CHAMPIONS' ? '🏆 ' : fixture.tournamentType === 'COPA' ? '🛡️ ' : ''}
                              {fixture.competitionName}
                            </span>
                            <span className="text-[11px] font-bold text-slate-300 font-condensed">
                              {fixture.roundOrMatchday}
                            </span>
                          </div>
                          <span className="font-mono-num text-[11px] text-slate-400 font-bold">
                            {fixture.date}
                          </span>
                        </div>

                        {/* Match Body */}
                        <div className="flex items-center justify-between py-1.5">
                          {/* Home team */}
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs font-condensed shrink-0 shadow"
                              style={{
                                backgroundColor: homeClub?.primaryColor || '#1e293b',
                                color: homeClub?.textColor || '#ffffff',
                                border: `1.5px solid ${homeClub?.secondaryColor || '#64748b'}`,
                              }}
                            >
                              {homeClub?.code || 'HOM'}
                            </div>
                            <div className="truncate">
                              <span className={`text-xs block truncate ${fixture.homeTeamId === gameSave.userClubId ? 'font-black text-amber-300' : 'font-semibold text-slate-100'}`}>
                                {homeClub?.shortName || homeClub?.name || fixture.homeTeamId}
                              </span>
                              <span className="text-[10px] text-slate-400 font-condensed">
                                {fixture.homeTeamId === gameSave.userClubId ? 'Tu Club (Local)' : homeClub?.stadium?.name || 'Estadio rival'}
                              </span>
                            </div>
                          </div>

                          {/* Score or VS */}
                          <div className="px-3 text-center shrink-0">
                            {fixture.played ? (
                              <div className="font-mono-num">
                                <span className="text-base font-black text-white px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-700 shadow-inner">
                                  {fixture.homeScore} - {fixture.awayScore}
                                </span>
                              </div>
                            ) : (
                              <div className="text-center">
                                <span className="text-xs font-bold text-slate-500 font-mono-num uppercase px-2 py-0.5 bg-slate-950/70 rounded border border-slate-800">
                                  VS
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Away team */}
                          <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end text-right">
                            <div className="truncate">
                              <span className={`text-xs block truncate ${fixture.awayTeamId === gameSave.userClubId ? 'font-black text-amber-300' : 'font-semibold text-slate-100'}`}>
                                {awayClub?.shortName || awayClub?.name || fixture.awayTeamId}
                              </span>
                              <span className="text-[10px] text-slate-400 font-condensed">
                                {fixture.awayTeamId === gameSave.userClubId ? 'Tu Club (Visitante)' : awayClub?.stadium?.name || 'Estadio rival'}
                              </span>
                            </div>
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs font-condensed shrink-0 shadow"
                              style={{
                                backgroundColor: awayClub?.primaryColor || '#1e293b',
                                color: awayClub?.textColor || '#ffffff',
                                border: `1.5px solid ${awayClub?.secondaryColor || '#64748b'}`,
                              }}
                            >
                              {awayClub?.code || 'AWA'}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Status, Venue, and Outcome */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 font-condensed">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">
                              {fixture.isHome
                                ? `Estadio: ${userClub?.stadium?.name || 'Local'}`
                                : `Visitante en: ${opponentClub?.stadium?.name || opponentClub?.name || 'Estadio rival'}`}
                            </span>
                          </div>

                          <div>
                            {fixture.played ? (
                              outcomeBadge
                            ) : isNext ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400 uppercase tracking-wider font-condensed animate-pulse">
                                ★ Próximo Partido
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Leagues View */
        <>
          {/* Header with League Selector (PC Fútbol style) */}
          {/* Header with League Selector and Visual Identity */}
          {(() => {
            const leagueTheme = getCompetitionTheme(competition.id, competition.name);
            const isDecisiveMatchday = competition.currentMatchday >= competition.totalMatchdays - 2;
            return (
              <div className={`bg-gradient-to-r ${leagueTheme.gradient} border-2 ${leagueTheme.border} ${leagueTheme.glow} rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-white/20 flex items-center justify-center text-2xl shadow-xl shrink-0">
                      {leagueTheme.iconType === 'laliga' ? '⚽' :
                       leagueTheme.iconType === 'hypermotion' ? '⚡' : '🏆'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black text-white font-condensed uppercase tracking-wider drop-shadow-md">
                          {competition.name}
                        </h2>
                        {competition.id === userClub?.divisionId ? (
                          <span className="text-[10px] font-black text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-400 font-condensed tracking-wider">
                            ★ TU LIGA OFICIAL
                          </span>
                        ) : (
                          <span className={`text-[10px] font-black ${leagueTheme.badgeBg} ${leagueTheme.badgeText} px-2.5 py-0.5 rounded-full font-condensed tracking-wider uppercase`}>
                            Oficial RFEF
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-bold font-condensed tracking-wide ${leagueTheme.accentText} mt-0.5`}>
                        {leagueTheme.motto}
                      </p>
                      <p className="text-[11px] text-slate-300 font-condensed">
                        Temporada {competition.season} · Jornada {competition.currentMatchday} de {competition.totalMatchdays} · {competition.clubIds.length} Clubes
                      </p>
                    </div>
                  </div>

                  {/* Global League Switcher */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-300 font-black uppercase font-condensed tracking-wider">Competición:</label>
                    <select
                      value={selectedCompId}
                      onChange={(e) => {
                        playClickSound();
                        const nextId = e.target.value;
                        setSelectedCompId(nextId);
                        const nextComp = gameSave.competitions[nextId];
                        if (nextComp) setSelectedMatchday(nextComp.currentMatchday || 1);
                      }}
                      className="bg-slate-950 border-2 border-slate-600 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 shadow-inner"
                    >
                      {Object.values(gameSave.competitions).map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name} {comp.id === userClub?.divisionId ? '★ (Tu Liga)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isDecisiveMatchday && (
                  <div className="bg-amber-400/15 border border-amber-400/50 rounded-xl p-2.5 flex items-center gap-2.5 text-amber-300 animate-pulse text-xs">
                    <Flame className="w-5 h-5 shrink-0 text-amber-400" />
                    <div>
                      <strong className="font-condensed uppercase tracking-wider block text-amber-200 font-black">
                        🔥 ¡TRAMO FINAL DECISIVO POR EL TÍTULO Y LOS ASCENSOS / DESCENSOS!
                      </strong>
                      <span>Apenas quedan {competition.totalMatchdays - competition.currentMatchday + 1} jornadas para el veredicto final de la temporada.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

      {/* Grid: Standings on Left, Matchday Calendar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Standings Table (7 cols) */}
        <div className="lg:col-span-7 pcf-panel rounded-2xl p-4 shadow-xl">
          <div className="pcf-embossed-header py-1.5 px-4 mb-3 rounded-lg text-center font-black text-xs uppercase tracking-widest text-slate-100 font-condensed shadow-inner">
            TABLA CLASIFICATORIA OFICIAL
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/70">
            <table className="w-full text-left text-xs font-mono-num">
              <thead>
                <tr className="bg-[#142036] border-b-2 border-slate-700 text-slate-300 text-[10px] uppercase font-condensed font-black tracking-wider">
                  <th className="py-2.5 px-2 text-center">Pos</th>
                  <th className="py-2.5 px-3">Equipo</th>
                  <th className="py-2.5 px-2 text-center">PJ</th>
                  <th className="py-2.5 px-2 text-center">V</th>
                  <th className="py-2.5 px-2 text-center">E</th>
                  <th className="py-2.5 px-2 text-center">D</th>
                  <th className="py-2.5 px-2 text-center">GF</th>
                  <th className="py-2.5 px-2 text-center">GC</th>
                  <th className="py-2.5 px-2 text-center">DG</th>
                  <th className="py-2.5 px-3 text-center font-bold">PTS</th>
                  <th className="py-2.5 px-3 text-center font-sans">Forma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {competition.standings.map((row, idx) => {
                  const club = gameSave.clubs[row.teamId];
                  const isUser = row.teamId === gameSave.userClubId;
                  const pos = idx + 1;

                  // Zone color styling
                  let zoneClass = 'border-l-2 border-transparent';
                  if (pos === 1) zoneClass = 'border-l-2 border-emerald-500 bg-emerald-950/20';
                  else if (pos >= 2 && pos <= 5) zoneClass = 'border-l-2 border-sky-500 bg-sky-950/15';
                  else if (pos >= 9) zoneClass = 'border-l-2 border-rose-500 bg-rose-950/20';

                  return (
                    <tr
                      key={row.teamId}
                      className={`hover:bg-slate-800/50 transition-colors ${zoneClass} ${
                        isUser ? 'bg-amber-950/20 font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2 text-center font-bold text-slate-300">
                        {pos}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                            style={{
                              backgroundColor: club?.primaryColor || '#334155',
                              color: club?.textColor || '#fff',
                            }}
                          >
                            {club?.code}
                          </div>
                          <span className={`truncate ${isUser ? 'text-amber-300' : 'text-slate-100'}`}>
                            {club?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{row.played}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-400">{row.won}</td>
                      <td className="py-2.5 px-2 text-center text-amber-400">{row.drawn}</td>
                      <td className="py-2.5 px-2 text-center text-rose-400">{row.lost}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{row.goalsFor}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{row.goalsAgainst}</td>
                      <td className="py-2.5 px-2 text-center font-semibold text-slate-200">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="py-2.5 px-3 text-center text-sm font-black text-slate-100 bg-slate-950/40">
                        {row.points}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {row.recentForm.length === 0 ? (
                            <span className="text-slate-500 text-[10px]">-</span>
                          ) : (
                            row.recentForm.map((f, i) => (
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixtures by Matchday (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="pcf-panel rounded-2xl p-4 shadow-xl">
            {/* Matchday navigator */}
            <div className="flex items-center justify-between mb-4 border-b-2 border-slate-700/80 pb-3">
              <span className="text-xs font-black text-amber-400 font-condensed uppercase tracking-wider drop-shadow">
                Calendario Oficial de Partidos
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={selectedMatchday <= 1}
                  onClick={() => {
                    playClickSound();
                    setSelectedMatchday((prev) => Math.max(1, prev - 1));
                  }}
                  className="pcf-btn px-2 py-1 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-white font-mono-num px-2.5 py-0.5 bg-black/60 rounded border border-slate-700">
                  Jornada {selectedMatchday} / {competition.totalMatchdays}
                </span>
                <button
                  disabled={selectedMatchday >= competition.totalMatchdays}
                  onClick={() => {
                    playClickSound();
                    setSelectedMatchday((prev) => Math.min(competition.totalMatchdays, prev + 1));
                  }}
                  className="pcf-btn px-2 py-1 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Match cards */}
            <div className="space-y-2">
              {currentMatchdayMatches.map((m) => {
                const home = gameSave.clubs[m.homeTeamId];
                const away = gameSave.clubs[m.awayTeamId];
                const isUserMatch = m.homeTeamId === gameSave.userClubId || m.awayTeamId === gameSave.userClubId;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (m.played) {
                        playClickSound();
                        setInspectedMatch(m);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      m.played ? 'cursor-pointer hover:border-slate-600' : ''
                    } ${
                      isUserMatch
                        ? 'bg-slate-800/80 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Home */}
                      <div className="flex-1 flex items-center gap-2 justify-end text-right">
                        <span className={`text-xs font-semibold truncate ${m.homeTeamId === gameSave.userClubId ? 'text-amber-300' : 'text-slate-200'}`}>
                          {home?.shortName}
                        </span>
                        <div
                          className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: home?.primaryColor, color: home?.textColor }}
                        >
                          {home?.code}
                        </div>
                      </div>

                      {/* Score or Date */}
                      <div className="px-3 shrink-0 text-center font-mono-num">
                        {m.played ? (
                          <div className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-sm font-bold text-slate-100">
                            {m.homeScore} - {m.awayScore}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                            {m.date}
                          </span>
                        )}
                      </div>

                      {/* Away */}
                      <div className="flex-1 flex items-center gap-2 text-left">
                        <div
                          className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: away?.primaryColor, color: away?.textColor }}
                        >
                          {away?.code}
                        </div>
                        <span className={`text-xs font-semibold truncate ${m.awayTeamId === gameSave.userClubId ? 'text-amber-300' : 'text-slate-200'}`}>
                          {away?.shortName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Scorers Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Tabla de Goleadores (Pichichi)
            </h3>

            {topScorers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Aún no se han registrado goles en esta temporada.
              </p>
            ) : (
              <div className="space-y-2 font-mono-num text-xs">
                {topScorers.map((p, idx) => {
                  const club = p.clubId ? gameSave.clubs[p.clubId] : null;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-500 font-bold w-4 text-center">{idx + 1}º</span>
                        <div className="truncate">
                          <span className="font-semibold text-slate-200 font-sans block truncate">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {club?.name} ({p.primaryPosition})
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-400">{p.seasonStats.goals}</span>
                        <span className="text-[10px] text-slate-500 block">goles</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Match Details Modal (if clicked on a played match) */}
      {inspectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="text-center border-b border-slate-800 pb-3">
              <span className="text-[11px] text-slate-400 font-mono-num uppercase tracking-wider block mb-1">
                Jornada {inspectedMatch.matchday} · {inspectedMatch.date} · {inspectedMatch.weather || 'Despejado'} ({inspectedMatch.temperature || 19}°C)
              </span>
              <div className="text-2xl font-black text-slate-100 font-mono-num">
                {gameSave.clubs[inspectedMatch.homeTeamId]?.shortName} {inspectedMatch.homeScore} - {inspectedMatch.awayScore} {gameSave.clubs[inspectedMatch.awayTeamId]?.shortName}
              </div>
              {inspectedMatch.stats && (
                <div className="mt-1 flex items-center justify-center gap-4 text-xs font-mono-num text-slate-400">
                  <span>xG: {inspectedMatch.stats.xgHome}</span>
                  <span>Posesión: {inspectedMatch.stats.possessionHome}% - {inspectedMatch.stats.possessionAway}%</span>
                  <span>xG: {inspectedMatch.stats.xgAway}</span>
                </div>
              )}
            </div>

            {/* Quick Stats Comparison */}
            {inspectedMatch.stats && (
              <div className="grid grid-cols-3 gap-2 text-xs font-mono-num text-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Remates (Puerta)</span>
                  <span className="font-bold text-slate-200">
                    {inspectedMatch.stats.shotsHome} ({inspectedMatch.stats.shotsOnTargetHome}) - {inspectedMatch.stats.shotsAway} ({inspectedMatch.stats.shotsOnTargetAway})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Córners</span>
                  <span className="font-bold text-slate-200">
                    {inspectedMatch.stats.cornersHome} - {inspectedMatch.stats.cornersAway}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Faltas / Tarjetas</span>
                  <span className="font-bold text-slate-200">
                    {inspectedMatch.stats.foulsHome} ({inspectedMatch.stats.yellowCardsHome}🟨) - {inspectedMatch.stats.foulsAway} ({inspectedMatch.stats.yellowCardsAway}🟨)
                  </span>
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 font-condensed">
                Acontecimientos del Partido
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {inspectedMatch.events && inspectedMatch.events.length > 0 ? (
                  inspectedMatch.events.map((ev, i) => (
                    <div key={i} className="text-xs p-2 bg-slate-950 rounded border border-slate-800 flex items-start gap-2">
                      <span className="font-mono-num font-bold text-emerald-400 shrink-0">{ev.minute}'</span>
                      <span className="text-slate-300">{ev.description}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">Sin incidencias reseñables.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              {inspectedMatch.attendance && (
                <span className="text-xs font-mono-num text-slate-400">
                  Asistencia: {inspectedMatch.attendance.toLocaleString()} espectadores
                </span>
              )}
              <button
                onClick={() => {
                  playClickSound();
                  setInspectedMatch(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors ml-auto"
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
