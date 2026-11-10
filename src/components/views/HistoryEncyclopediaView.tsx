import React, { useState, useMemo } from 'react';
import { ensureWorldHistory } from '../../engine/worldHistoryEngine';
import { GameSave } from '../../types/game';
import { CompetitionSeasonArchive } from '../../types/history';
import { 
  HISTORIC_CLUB_FATES, 
  MANAGER_LEGENDS, 
  REAL_HISTORIC_TRANSFERS 
} from '../../db/worldData/realHistoricalSeasons';
import { playClickSound } from '../../utils/audio';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Crown, 
  Flame, 
  Globe2, 
  History, 
  Medal, 
  Search, 
  Shield, 
  Sparkles, 
  Trophy, 
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  GraduationCap,
  AlertTriangle,
  Building2,
  FileText,
  UserCheck
} from 'lucide-react';

interface HistoryEncyclopediaViewProps {
  gameSave: GameSave;
  onAdvanceSeason?: () => void;
}

export const HistoryEncyclopediaView: React.FC<HistoryEncyclopediaViewProps> = ({
  gameSave,
  onAdvanceSeason,
}) => {
  const save = ensureWorldHistory(gameSave);
  const archives = save.historicalArchives || [];
  const records = save.worldRecords || [];

  const [mainTab, setMainTab] = useState<'temporadas' | 'competiciones' | 'clubes' | 'entrenadores' | 'fichajes_records' | 'refundados'>('temporadas');
  const [filterMode, setFilterMode] = useState<'TODOS' | 'REALES' | 'PARTIDA'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected state for Season view
  const [selectedSeasonArchive, setSelectedSeasonArchive] = useState<CompetitionSeasonArchive>(archives[0]);

  // Selected state for Competition view
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('esp_tier1');

  // Selected state for Club view
  const [selectedClubId, setSelectedClubId] = useState<string>(save.userClubId || 'fe_grama');

  // Filter archives by mode and search
  const filteredArchives = useMemo(() => {
    return archives.filter((a) => {
      if (filterMode === 'REALES' && !a.isRealPreGameHistory) return false;
      if (filterMode === 'PARTIDA' && a.isRealPreGameHistory) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = a.competitionName.toLowerCase().includes(query);
        const matchesSeason = a.seasonId.toLowerCase().includes(query);
        const matchesChamp = a.championTeam.toLowerCase().includes(query);
        const matchesCoach = a.championManager.toLowerCase().includes(query);
        const matchesPichichi = a.topScorer.playerName.toLowerCase().includes(query);
        return matchesName || matchesSeason || matchesChamp || matchesCoach || matchesPichichi;
      }
      return true;
    });
  }, [archives, filterMode, searchTerm]);

  // Group archives by competition for Competition view
  const competitionsCatalog = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    archives.forEach((a) => {
      if (!map.has(a.competitionId)) {
        map.set(a.competitionId, { id: a.competitionId, name: a.competitionName, count: 0 });
      }
      map.get(a.competitionId)!.count += 1;
    });
    return Array.from(map.values());
  }, [archives]);

  // Archives for selected competition
  const competitionArchives = useMemo(() => {
    return archives
      .filter((a) => a.competitionId === selectedCompetitionId)
      .sort((a, b) => {
        const yearA = parseInt(a.seasonId.slice(0, 4), 10) || 0;
        const yearB = parseInt(b.seasonId.slice(0, 4), 10) || 0;
        return yearB - yearA;
      });
  }, [archives, selectedCompetitionId]);

  // Palmarés table for selected competition
  const competitionPalmares = useMemo(() => {
    const tally: Record<string, { titles: number; runnersUp: number; lastYear: string }> = {};
    competitionArchives.forEach((a) => {
      if (!tally[a.championTeam]) {
        tally[a.championTeam] = { titles: 0, runnersUp: 0, lastYear: a.seasonId };
      }
      tally[a.championTeam].titles += 1;

      if (a.runnerUpTeam) {
        if (!tally[a.runnerUpTeam]) {
          tally[a.runnerUpTeam] = { titles: 0, runnersUp: 0, lastYear: '' };
        }
        tally[a.runnerUpTeam].runnersUp += 1;
      }
    });

    return Object.entries(tally)
      .map(([team, data]) => ({ team, ...data }))
      .sort((a, b) => b.titles - a.titles || b.runnersUp - a.runnersUp);
  }, [competitionArchives]);

  // Club Trajectory in Club view
  const clubsList = useMemo(() => Object.values(save.clubs), [save.clubs]);
  const activeClub = save.clubs[selectedClubId] || clubsList[0];

  const clubSeasonsHistory = useMemo(() => {
    if (!activeClub) return [];
    const clubName = activeClub.name;
    const shortName = activeClub.shortName;

    return archives
      .map((a) => {
        const standing = a.standingsTable?.find(
          (s) => s.teamName.includes(clubName) || s.teamName.includes(shortName)
        );
        const isChamp = a.championTeam.includes(clubName) || a.championTeam.includes(shortName);
        const isRelegated = a.relegatedTeams?.some((t) => t.includes(clubName) || t.includes(shortName));
        const isPromoted = a.promotedTeams?.some((t) => t.includes(clubName) || t.includes(shortName));

        if (standing || isChamp || isRelegated || isPromoted) {
          return {
            seasonId: a.seasonId,
            competitionName: a.competitionName,
            isReal: a.isRealPreGameHistory,
            position: standing?.position || (isChamp ? 1 : undefined),
            points: standing?.points,
            isChampion: isChamp,
            isRelegated,
            isPromoted,
            manager: isChamp ? a.championManager : undefined,
          };
        }
        return null;
      })
      .filter(Boolean) as {
        seasonId: string;
        competitionName: string;
        isReal: boolean;
        position?: number;
        points?: number;
        isChampion: boolean;
        isRelegated?: boolean;
        isPromoted?: boolean;
        manager?: string;
      }[];
  }, [archives, activeClub]);

  // Combined historic transfers (Real + In-Game)
  const allTransfers = useMemo(() => {
    const inGameTransfers: typeof REAL_HISTORIC_TRANSFERS = [];
    archives.forEach((a) => {
      if (!a.isRealPreGameHistory && a.historicTransfers) {
        inGameTransfers.push(...a.historicTransfers);
      }
    });
    return [...inGameTransfers, ...REAL_HISTORIC_TRANSFERS].sort((a, b) => b.fee - a.fee);
  }, [archives]);

  // User Manager profile for Coaches tab
  const allManagersList = useMemo(() => {
    const userMgr: (typeof MANAGER_LEGENDS)[0] = {
      id: save.manager.id,
      name: `${save.manager.firstName} ${save.manager.lastName} (Tú)`,
      nationality: save.manager.nationality,
      activeYears: '2026 - Actualidad',
      trophiesCount: save.manager.careerStats.titlesWon,
      trophiesBreakdown: [
        { title: 'Títulos de Liga / Copa', count: save.manager.careerStats.titlesWon },
        { title: 'Ascensos Conseguidos', count: save.manager.careerStats.promotions },
      ],
      clubsManaged: [save.clubs[save.userClubId]?.name || 'Tu Club'],
      tacticalStyle: save.manager.tacticalPhilosophy,
      careerMilestones: [
        `Partidos dirigidos: ${save.manager.careerStats.matchesManaged} (${save.manager.careerStats.won}V - ${save.manager.careerStats.drawn}E - ${save.manager.careerStats.lost}D).`,
        `Reputación actual: ${save.manager.reputation} / 100. Licencia: ${save.manager.license}.`,
      ],
      isRealLegend: false,
    };
    return [userMgr, ...MANAGER_LEGENDS];
  }, [save]);

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white font-condensed uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Enciclopedia e Historia Dinámica del Fútbol Mundial
            </h2>
            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold font-mono-num">
              MEMORIA PERSISTENTE DE +40 TEMPORADAS
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Registro acumulativo de títulos, clasificaciones íntegras, ascensos, descensos, Pichichis, Zamoras, récords mundiales y trayectorias de clubes y entrenadores desde 1994.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onAdvanceSeason && (
            <button
              onClick={() => {
                playClickSound();
                onAdvanceSeason();
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-xl font-bold font-condensed uppercase tracking-wider text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 fill-current" />
              <span>Clausurar y Avanzar Temporada</span>
            </button>
          )}

          {/* Real vs In-Game Pills */}
          <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 p-2 rounded-xl text-xs font-mono-num">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950 text-sky-400 border border-sky-500/30 font-bold text-[10px]">
              <Globe2 className="w-3.5 h-3.5" /> DATO REAL PREVIO
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
              <Sparkles className="w-3.5 h-3.5" /> HISTORIA VIVA DE PARTIDA
            </span>
          </div>
        </div>
      </div>

      {/* Main Dimension Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'temporadas', label: '1. Por Temporadas', icon: Calendar },
          { id: 'competiciones', label: '2. Por Competiciones', icon: Trophy },
          { id: 'clubes', label: '3. Por Clubes', icon: Shield },
          { id: 'entrenadores', label: '4. Por Entrenadores', icon: GraduationCap },
          { id: 'fichajes_records', label: '5. Récords & Fichajes', icon: Flame },
          { id: 'refundados', label: '6. Clubes Desaparecidos / Míticos', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setMainTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold font-condensed uppercase tracking-wider rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* DIMENSION 1: POR TEMPORADAS                                               */}
      {/* ========================================================================= */}
      {mainTab === 'temporadas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Season archives list with search & filters */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase font-condensed tracking-wider">
                Archivo Temporadas ({filteredArchives.length})
              </span>
              <div className="flex gap-1 text-[10px]">
                {(['TODOS', 'REALES', 'PARTIDA'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      playClickSound();
                      setFilterMode(mode);
                    }}
                    className={`px-2 py-0.5 rounded font-mono-num font-bold ${
                      filterMode === mode
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar temporada, campeón, míster..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Scrollable list */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredArchives.map((arch) => {
                const isSelected =
                  selectedSeasonArchive?.seasonId === arch.seasonId &&
                  selectedSeasonArchive?.competitionId === arch.competitionId;
                return (
                  <button
                    key={`${arch.competitionId}_${arch.seasonId}`}
                    onClick={() => {
                      playClickSound();
                      setSelectedSeasonArchive(arch);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all space-y-1 ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/60 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs font-mono-num">
                        Temp. {arch.seasonId}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          arch.isRealPreGameHistory
                            ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {arch.isRealPreGameHistory ? 'OFICIAL REAL' : 'EN PARTIDA'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium truncate">
                      {arch.competitionName}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      <span>{arch.championTeam}</span>
                      <span className="text-slate-400 font-normal text-[11px] ml-1">
                        ({arch.championManager})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Season Full Detail Card */}
          {selectedSeasonArchive && (
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white font-condensed uppercase tracking-wide">
                      {selectedSeasonArchive.competitionName} — Temporada {selectedSeasonArchive.seasonId}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono-num ${
                        selectedSeasonArchive.isRealPreGameHistory
                          ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {selectedSeasonArchive.isRealPreGameHistory ? 'HISTORIA REAL PREVIA' : 'HISTORIA VIVA DE LA PARTIDA'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Entrenador Campeón: <strong className="text-slate-200">{selectedSeasonArchive.championManager}</strong>
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl text-right">
                  <span className="text-[10px] text-amber-400/80 uppercase tracking-wider block font-bold font-condensed">Campeón de Liga</span>
                  <span className="text-base font-bold text-amber-400 flex items-center gap-1.5 justify-end">
                    <Crown className="w-4 h-4 fill-current" />
                    {selectedSeasonArchive.championTeam}
                  </span>
                </div>
              </div>

              {/* Notable Narrative summary */}
              {selectedSeasonArchive.notableEvent && (
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
                  <span className="text-amber-400 font-bold block mb-0.5 uppercase text-[10px] tracking-wider font-condensed">
                    Crónica & Hechos Históricos Destacados
                  </span>
                  {selectedSeasonArchive.notableEvent}
                </div>
              )}

              {/* Honours snapshot: Pichichi, Zamora, Revelación, Decepción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono-num text-xs">
                {/* Pichichi */}
                <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed font-bold">Trofeo Pichichi</span>
                  <span className="text-sm font-bold text-emerald-400 block truncate">
                    {selectedSeasonArchive.topScorer.playerName}
                  </span>
                  <span className="text-xs text-slate-300 block">
                    {selectedSeasonArchive.topScorer.goals} goles ({selectedSeasonArchive.topScorer.clubName})
                  </span>
                </div>

                {/* Zamora */}
                <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed font-bold">Trofeo Zamora</span>
                  <span className="text-sm font-bold text-sky-400 block truncate">
                    {selectedSeasonArchive.bestGoalkeeper?.goalkeeperName || 'Portero Menos Goleado'}
                  </span>
                  <span className="text-xs text-slate-300 block">
                    {selectedSeasonArchive.bestGoalkeeper?.coefficient || 0.85} coef. ({selectedSeasonArchive.bestGoalkeeper?.clubName || 'Club'})
                  </span>
                </div>

                {/* Revelation Club */}
                <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-condensed font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Club Revelación
                  </span>
                  <span className="text-xs font-bold text-slate-100 block truncate">
                    {selectedSeasonArchive.revelationClub?.clubName || 'Sin sorpresa'}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate leading-tight">
                    {selectedSeasonArchive.revelationClub?.reason || 'Rendimiento esperado'}
                  </span>
                </div>

                {/* Disappointment Club */}
                <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-condensed font-bold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Gran Decepción
                  </span>
                  <span className="text-xs font-bold text-slate-100 block truncate">
                    {selectedSeasonArchive.disappointmentClub?.clubName || 'Sin decepciones'}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate leading-tight">
                    {selectedSeasonArchive.disappointmentClub?.reason || 'Rendimiento normal'}
                  </span>
                </div>
              </div>

              {/* Grand Transfers & Legend Retirements of the Season */}
              {((selectedSeasonArchive.historicTransfers && selectedSeasonArchive.historicTransfers.length > 0) ||
                (selectedSeasonArchive.legendRetirements && selectedSeasonArchive.legendRetirements.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedSeasonArchive.historicTransfers && selectedSeasonArchive.historicTransfers.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-1.5">
                      <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold font-condensed flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" /> Fichajes Estrella de la Temporada
                      </span>
                      <div className="space-y-1">
                        {selectedSeasonArchive.historicTransfers.slice(0, 4).map((tr) => (
                          <div key={tr.id} className="flex items-center justify-between text-[11px] text-slate-300">
                            <span className="font-semibold text-white truncate max-w-[130px]">{tr.playerName}</span>
                            <span className="text-slate-400 text-[10px] truncate max-w-[140px]">{tr.fromClub} → {tr.toClub}</span>
                            <span className="font-bold text-emerald-400 font-mono-num">{(tr.fee / 1000000).toFixed(0)}M €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSeasonArchive.legendRetirements && selectedSeasonArchive.legendRetirements.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-1.5">
                      <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold font-condensed flex items-center gap-1">
                        <Award className="w-3 h-3" /> Retiradas de Leyendas
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSeasonArchive.legendRetirements.map((ret, idx) => (
                          <span key={idx} className="bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] px-2 py-0.5 rounded font-medium" title={ret.summary}>
                            {ret.playerName} ({ret.clubName}, {ret.age} a.)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Relegations & Promotions badge row */}
              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-rose-400 font-bold uppercase font-condensed tracking-wider block mb-0.5">
                    Descendieron de Categoría:
                  </span>
                  <span className="text-slate-300 font-medium">
                    {selectedSeasonArchive.relegatedTeams && selectedSeasonArchive.relegatedTeams.length > 0
                      ? selectedSeasonArchive.relegatedTeams.join(', ')
                      : 'Sin descensos registrados'}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase font-condensed tracking-wider block mb-0.5">
                    Ascendieron a la Categoría:
                  </span>
                  <span className="text-slate-300 font-medium">
                    {selectedSeasonArchive.promotedTeams && selectedSeasonArchive.promotedTeams.length > 0
                      ? selectedSeasonArchive.promotedTeams.join(', ')
                      : 'Sin ascensos registrados'}
                  </span>
                </div>
              </div>

              {/* Standings Table */}
              {selectedSeasonArchive.standingsTable && selectedSeasonArchive.standingsTable.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase font-condensed tracking-wider">
                      Clasificación Final Oficial de la Temporada ({selectedSeasonArchive.seasonId})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono-num">
                      {selectedSeasonArchive.standingsTable.length} Clubes
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono-num">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-2 px-2.5">Pos</th>
                          <th className="py-2 px-2.5">Club</th>
                          <th className="py-2 px-2.5 text-center">PJ</th>
                          <th className="py-2 px-2.5 text-center">PG</th>
                          <th className="py-2 px-2.5 text-center">PE</th>
                          <th className="py-2 px-2.5 text-center">PP</th>
                          <th className="py-2 px-2.5 text-center">GF</th>
                          <th className="py-2 px-2.5 text-center">GC</th>
                          <th className="py-2 px-2.5 text-center font-bold">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedSeasonArchive.standingsTable.map((row) => (
                          <tr
                            key={row.position}
                            className={`hover:bg-slate-800/40 ${
                              row.position === 1 ? 'bg-amber-500/10 font-bold' : ''
                            }`}
                          >
                            <td className="py-2 px-2.5 text-slate-400 font-bold">{row.position}º</td>
                            <td className="py-2 px-2.5 text-slate-100 font-sans font-medium">{row.teamName}</td>
                            <td className="py-2 px-2.5 text-center text-slate-400">{row.played}</td>
                            <td className="py-2 px-2.5 text-center text-emerald-400">{row.won}</td>
                            <td className="py-2 px-2.5 text-center text-amber-400">{row.drawn}</td>
                            <td className="py-2 px-2.5 text-center text-rose-400">{row.lost}</td>
                            <td className="py-2 px-2.5 text-center text-slate-300">{row.goalsFor}</td>
                            <td className="py-2 px-2.5 text-center text-slate-400">{row.goalsAgainst}</td>
                            <td className="py-2 px-2.5 text-center font-bold text-white text-sm">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIMENSION 2: POR COMPETICIONES                                            */}
      {/* ========================================================================= */}
      {mainTab === 'competiciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Competition Selector */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-condensed tracking-wider pb-2 border-b border-slate-800">
              Seleccionar Competición
            </h3>
            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {competitionsCatalog.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedCompetitionId(comp.id);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedCompetitionId === comp.id
                      ? 'bg-amber-500/10 border-amber-500 text-white font-bold ring-1 ring-amber-400/40'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs truncate">{comp.name}</span>
                  <span className="text-[10px] font-mono-num text-slate-400 ml-2">
                    {comp.count} edic.
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Competition Historical Records & Palmarés */}
          <div className="lg:col-span-8 space-y-6">
            {/* Palmarés Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-base font-bold text-white font-condensed uppercase flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Palmarés Acumulado Histórico
                </h4>
                <span className="text-xs text-slate-400 font-mono-num">
                  Total {competitionArchives.length} ediciones registradas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {competitionPalmares.slice(0, 6).map((club, idx) => (
                  <div
                    key={club.team}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between font-mono-num text-xs"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 block">#{idx + 1} de la historia</span>
                      <strong className="text-slate-100 font-sans block truncate">{club.team}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-amber-400">{club.titles} 🏆</span>
                      <span className="text-[10px] text-slate-400 block">{club.runnersUp} subc.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* List of all seasons champions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase font-condensed tracking-wider">
                Cuadro de Campeones por Temporada
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-num">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Temporada</th>
                      <th className="py-2 px-3">Campeón</th>
                      <th className="py-2 px-3">Entrenador Campeón</th>
                      <th className="py-2 px-3">Subcampeón</th>
                      <th className="py-2 px-3">Pichichi</th>
                      <th className="py-2 px-3 text-center">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {competitionArchives.map((arch) => (
                      <tr key={arch.seasonId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-amber-400">{arch.seasonId}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          {arch.championTeam}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans">{arch.championManager}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-sans">{arch.runnerUpTeam}</td>
                        <td className="py-2.5 px-3 text-emerald-400">
                          {arch.topScorer.playerName} ({arch.topScorer.goals})
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              arch.isRealPreGameHistory
                                ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {arch.isRealPreGameHistory ? 'REAL' : 'PARTIDA'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIMENSION 3: POR CLUBES                                                   */}
      {/* ========================================================================= */}
      {mainTab === 'clubes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Club Search & Selector */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-condensed tracking-wider pb-2 border-b border-slate-800">
              Buscar Trayectoria de Club
            </h3>
            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {clubsList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedClubId(c.id);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedClubId === c.id
                      ? 'bg-amber-500/10 border-amber-500 text-white font-bold ring-1 ring-amber-400/40'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px]"
                      style={{ backgroundColor: c.primaryColor, color: c.textColor }}
                    >
                      {c.code}
                    </span>
                    <span className="text-xs truncate">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono-num">{c.city}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Club Historical Dossier */}
          {activeClub && (
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Club Identity Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-condensed shadow"
                    style={{
                      backgroundColor: activeClub.primaryColor,
                      color: activeClub.textColor,
                      border: `2px solid ${activeClub.secondaryColor}`,
                    }}
                  >
                    {activeClub.code}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-condensed uppercase tracking-wide">
                      {activeClub.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Fundado en <strong className="text-slate-200">{activeClub.foundedYear}</strong> · Ciudad:{' '}
                      <strong className="text-slate-200">{activeClub.city}</strong> · Estadio:{' '}
                      <strong className="text-slate-200">{activeClub.stadium.name} ({activeClub.stadium.capacity.toLocaleString()} esp.)</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-amber-400 font-bold uppercase font-condensed tracking-wider block">
                    Reputación Mundial
                  </span>
                  <span className="text-2xl font-bold font-mono-num text-amber-400">
                    {activeClub.reputation} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </span>
                </div>
              </div>

              {/* Trophies & Milestones */}
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase font-condensed tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Palmarés & Sala de Trofeos del Club
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-mono-num pt-1">
                  {activeClub.historyTitles && activeClub.historyTitles.length > 0 ? (
                    activeClub.historyTitles.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg font-bold"
                      >
                        🏆 {t.title} ({t.season})
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">
                      Sin títulos oficiales mayores registrados hasta el momento. La gloria se forja en la partida.
                    </span>
                  )}
                </div>
              </div>

              {/* Season by season positions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-condensed tracking-wider">
                  Historial de Temporadas del Club en la Enciclopedia
                </h4>
                {clubSeasonsHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono-num">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-2 px-3">Temporada</th>
                          <th className="py-2 px-3">Competición</th>
                          <th className="py-2 px-3 text-center">Posición Final</th>
                          <th className="py-2 px-3 text-center">Puntos</th>
                          <th className="py-2 px-3">Hito / Entrenador</th>
                          <th className="py-2 px-3 text-center">Tipo Registro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {clubSeasonsHistory.map((s) => (
                          <tr key={s.seasonId} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-bold text-amber-400">{s.seasonId}</td>
                            <td className="py-2.5 px-3 font-sans text-slate-200">{s.competitionName}</td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              {s.position ? (
                                <span className={s.position === 1 ? 'text-amber-400 text-sm' : 'text-slate-300'}>
                                  {s.position}º
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-400">{s.points || '-'}</td>
                            <td className="py-2.5 px-3 font-sans text-xs">
                              {s.isChampion && (
                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                  <Crown className="w-3.5 h-3.5" /> Campeón {s.manager ? `con ${s.manager}` : ''}
                                </span>
                              )}
                              {s.isPromoted && !s.isChampion && (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5" /> Ascenso de categoría
                                </span>
                              )}
                              {s.isRelegated && (
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                  <TrendingDown className="w-3.5 h-3.5" /> Descenso
                                </span>
                              )}
                              {!s.isChampion && !s.isPromoted && !s.isRelegated && (
                                <span className="text-slate-400">Permanencia</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  s.isReal
                                    ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                                    : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {s.isReal ? 'REAL' : 'PARTIDA'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-950/60 rounded-xl">
                    No figuran temporadas archivadas previas de este club en la base histórica de élite. Su trayectoria se irá inscribiendo jornada a jornada en la partida viva.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIMENSION 4: POR ENTRENADORES                                             */}
      {/* ========================================================================= */}
      {mainTab === 'entrenadores' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <h3 className="text-base font-bold text-white font-condensed uppercase flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              Salón de la Fama de Grandes Entrenadores
            </h3>
            <p className="text-xs text-slate-400">
              Trayectoria de los estrategas legendarios del fútbol mundial junto al seguimiento de tu propia carrera como mánager.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allManagersList.map((mgr) => (
              <div
                key={mgr.id}
                className={`bg-slate-900 border rounded-xl p-5 space-y-4 flex flex-col justify-between transition-all ${
                  !mgr.isRealLegend
                    ? 'border-emerald-500/50 bg-emerald-950/10 ring-1 ring-emerald-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 font-mono-num">{mgr.nationality}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono-num ${
                        mgr.isRealLegend
                          ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {mgr.isRealLegend ? 'LEYENDA OFICIAL' : 'TU MÁNAGER EN PARTIDA'}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white font-condensed uppercase flex items-center gap-2">
                    {mgr.name}
                  </h4>
                  <span className="text-[11px] text-amber-400 font-mono-num block mb-2">{mgr.activeYears}</span>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-300">
                      <strong className="text-slate-400 block text-[10px] uppercase font-condensed">Clubes dirigidos:</strong>
                      {mgr.clubsManaged.join(' · ')}
                    </div>
                    <div className="text-slate-300">
                      <strong className="text-slate-400 block text-[10px] uppercase font-condensed">Filosofía Táctica:</strong>
                      {mgr.tacticalStyle}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400 font-sans">
                    {mgr.careerMilestones.map((m, idx) => (
                      <p key={idx} className="leading-snug">
                        • {m}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono-num">
                  <span className="text-xs text-slate-400">Títulos Oficiales:</span>
                  <span className="text-lg font-black text-amber-400">{mgr.trophiesCount} 🏆</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIMENSION 5: GRANDES FICHAJES & LIBRO DE RÉCORDS                          */}
      {/* ========================================================================= */}
      {mainTab === 'fichajes_records' && (
        <div className="space-y-6">
          {/* World Records Section */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
              <h3 className="text-base font-bold text-white font-condensed uppercase flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Libro de Récords Históricos del Fútbol
              </h3>
              <p className="text-xs text-slate-400">
                Marcas oficiales individuales y colectivas registradas en la historia. Los hitos de tu partida que superen estos guarismos se inscribirán de forma inmediata.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono-num">
                        {rec.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono-num">{rec.seasonOrDate}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm font-condensed uppercase">{rec.title}</h4>
                    <p className="text-xs text-slate-300 font-semibold mt-1">{rec.holder}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">{rec.details}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono-num ${
                        rec.isRealHistorical
                          ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {rec.isRealHistorical ? 'RÉCORD REAL' : 'BATIDO EN PARTIDA'}
                    </span>
                    <span className="text-base font-black text-amber-400 font-mono-num">
                      {rec.valueNumeric.toLocaleString()} {rec.unitLabel || ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historic Transfers Hall of Fame */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white font-condensed uppercase flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                Grandes Fichajes & Traspasos Históricos de la Enciclopedia
              </h4>
              <span className="text-xs text-slate-400 font-mono-num">
                {allTransfers.length} Operaciones Registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-num">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-3">Ranking</th>
                    <th className="py-2 px-3">Futbolista</th>
                    <th className="py-2 px-3">Club Vendedor</th>
                    <th className="py-2 px-3">Club Comprador</th>
                    <th className="py-2 px-3 text-right">Coste del Fichaje</th>
                    <th className="py-2 px-3 text-center">Temporada</th>
                    <th className="py-2 px-3 text-center">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allTransfers.map((tr, idx) => (
                    <tr key={tr.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-white">{tr.playerName}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{tr.fromClub}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{tr.toClub}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-400">
                        {tr.fee.toLocaleString()} €
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{tr.season}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            tr.isRealHistorical
                              ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {tr.isRealHistorical ? 'REAL' : 'PARTIDA'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIMENSION 6: CLUBES DESAPARECIDOS / REFUNDADOS                            */}
      {/* ========================================================================= */}
      {mainTab === 'refundados' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <h3 className="text-base font-bold text-white font-condensed uppercase flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Clubes Revelación, Grandes Caídas y Equipos Refundados
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memoria de aquellas entidades históricas que sufrieron crisis económicas, refundaciones o descensos trágicos, junto a los saltos meteóricos más impresionantes del fútbol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HISTORIC_CLUB_FATES.map((fate) => (
              <div
                key={fate.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono-num ${
                        fate.status === 'REFUNDADO'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : fate.status === 'ASCENSO_METEORICO'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {fate.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-num">{fate.fateSeasonOrYear}</span>
                  </div>

                  <h4 className="text-base font-bold text-white font-condensed uppercase">{fate.clubName}</h4>
                  <p className="text-xs text-slate-400">{fate.city} · Fundado en {fate.foundedYear}</p>

                  <div className="mt-2 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
                    <strong className="text-amber-400 block text-[10px] uppercase font-condensed">Cénit Histórico:</strong>
                    <span className="text-slate-300 font-sans leading-snug">{fate.peakAchievement}</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">{fate.historySummary}</p>
                </div>

                {fate.successorClub && (
                  <div className="pt-2 border-t border-slate-800 text-xs font-mono-num flex items-center justify-between">
                    <span className="text-slate-400">Herencia / Continuidad:</span>
                    <span className="font-bold text-emerald-400">{fate.successorClub}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
