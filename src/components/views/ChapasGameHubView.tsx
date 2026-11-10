import React, { useState, useMemo } from 'react';
import { GameSave } from '../../types/game';
import { Club } from '../../types/club';
import { Player } from '../../types/player';
import { 
  ChapasMatchModal, 
  ChapasMatchTeamConfig, 
  ChapasMatchFinishedPayload 
} from '../chapas/ChapasMatchModal';
import { 
  AiDifficulty, 
  ChapaPlayer 
} from '../../engine/chapasPhysicsEngine';
import { 
  Trophy, 
  Play, 
  Users, 
  Cpu, 
  Gamepad2, 
  Sparkles, 
  Palette, 
  Target, 
  Shield, 
  ChevronRight, 
  RotateCcw, 
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';
import { playClickSound, playWhistleSound } from '../../utils/audio';

interface ChapasGameHubViewProps {
  gameSave: GameSave;
  onBackToOffice?: () => void;
}

type HubTab = 'rapido' | 'vs_cpu' | 'dos_jugadores' | 'torneo' | 'entrenamiento' | 'personalizador';

interface TournamentMatch {
  id: string;
  round: 'CUARTOS' | 'SEMIS' | 'FINAL';
  homeTeam: ChapasMatchTeamConfig;
  awayTeam: ChapasMatchTeamConfig;
  homeScore?: number;
  awayScore?: number;
  winnerTeamId?: string;
  isPlayed: boolean;
}

export const ChapasGameHubView: React.FC<ChapasGameHubViewProps> = ({
  gameSave,
  onBackToOffice,
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('rapido');

  // Match Modal Launch State
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [matchHomeTeam, setMatchHomeTeam] = useState<ChapasMatchTeamConfig | null>(null);
  const [matchAwayTeam, setMatchAwayTeam] = useState<ChapasMatchTeamConfig | null>(null);
  const [matchUserSide, setMatchUserSide] = useState<'home' | 'away' | 'both'>('home');
  const [matchAiDifficulty, setMatchAiDifficulty] = useState<AiDifficulty>('normal');
  const [matchDurationMin, setMatchDurationMin] = useState<number>(2.5); // 2:30 reales por tiempo
  const [matchCompTitle, setMatchCompTitle] = useState<string>('Partido Amistoso');

  // Available clubs list
  const allClubs = useMemo(() => {
    return Object.values(gameSave.clubs || {}).sort((a, b) => a.name.localeCompare(b.name));
  }, [gameSave.clubs]);

  // Quick Match Selection
  const [selectedHomeClubId, setSelectedHomeClubId] = useState<string>(
    gameSave.userClubId || allClubs[0]?.id || ''
  );
  const [selectedAwayClubId, setSelectedAwayClubId] = useState<string>(
    allClubs.find((c) => c.id !== gameSave.userClubId)?.id || allClubs[1]?.id || ''
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<AiDifficulty>('normal');

  // Custom Team State (Personalizador)
  const [customTeamName, setCustomTeamName] = useState<string>('Santako Chapas FC');
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('#0284c7');
  const [customSecondaryColor, setCustomSecondaryColor] = useState<string>('#facc15');
  const [customTextColor, setCustomTextColor] = useState<string>('#ffffff');
  const [customFormation, setCustomFormation] = useState<'4-4-2' | '4-3-3' | '4-2-3-1' | '3-5-2' | '5-3-2'>('4-3-3');

  // Tournament State
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([]);
  const [currentTournamentIndex, setCurrentTournamentIndex] = useState<number>(0);
  const [tournamentChampion, setTournamentChampion] = useState<ChapasMatchTeamConfig | null>(null);

  // Helper to convert Club to ChapasMatchTeamConfig
  const buildTeamConfigFromClub = (club: Club): ChapasMatchTeamConfig => {
    const starterIds = club.startingElevenIds || [];
    const starters = starterIds
      .map((pid) => gameSave.players[pid])
      .filter(Boolean) as Player[];

    const players: ChapaPlayer[] = starters.slice(0, 11).map((pl, idx) => {
      const isGk = pl.primaryPosition === 'POR' || idx === 0;
      let posGroup: 'POR' | 'DEF' | 'MED' | 'DEL' = 'MED';
      if (isGk) posGroup = 'POR';
      else if (['DFC', 'LD', 'LI'].includes(pl.primaryPosition)) posGroup = 'DEF';
      else if (['ED', 'EI', 'DC'].includes(pl.primaryPosition)) posGroup = 'DEL';

      return {
        id: pl.id,
        name: pl.nickname || `${pl.firstName} ${pl.lastName}`,
        number: pl.squadNumber || idx + 1,
        position: posGroup,
        isGoalkeeper: isGk,
        disparo: pl.attributes?.disparo || 75,
        fuerza: pl.attributes?.fuerza || 75,
        precision: pl.attributes?.pase || 75,
        tecnica: pl.attributes?.regate || 75,
      };
    });

    // Populate bench substitutes
    const benchIds = (club.benchPlayerIds && club.benchPlayerIds.length > 0)
      ? club.benchPlayerIds
      : (club.playerIds || []).filter((id) => !starterIds.includes(id));
    const benchPlayers = benchIds
      .map((pid) => gameSave.players[pid])
      .filter(Boolean) as Player[];

    const substitutes: ChapaPlayer[] = benchPlayers.slice(0, 7).map((pl, idx) => {
      const isGk = pl.primaryPosition === 'POR';
      let posGroup: 'POR' | 'DEF' | 'MED' | 'DEL' = 'MED';
      if (isGk) posGroup = 'POR';
      else if (['DFC', 'LD', 'LI'].includes(pl.primaryPosition)) posGroup = 'DEF';
      else if (['ED', 'EI', 'DC'].includes(pl.primaryPosition)) posGroup = 'DEL';

      return {
        id: pl.id,
        name: pl.nickname || `${pl.firstName} ${pl.lastName}`,
        number: pl.squadNumber || 12 + idx,
        position: posGroup,
        isGoalkeeper: isGk,
        disparo: pl.attributes?.disparo || 73,
        fuerza: pl.attributes?.fuerza || 73,
        precision: pl.attributes?.pase || 74,
        tecnica: pl.attributes?.regate || 73,
      };
    });

    return {
      id: club.id,
      name: club.name,
      shortName: club.shortName || club.name.substring(0, 12),
      primaryColor: club.primaryColor || '#2563eb',
      secondaryColor: club.secondaryColor || '#ffffff',
      textColor: club.textColor || '#ffffff',
      formation: (club.tacticFormation as '4-4-2' | '4-3-3') || '4-3-3',
      players,
      substitutes,
    };
  };

  // Build a custom team
  const buildCustomTeamConfig = (): ChapasMatchTeamConfig => {
    const players: ChapaPlayer[] = Array.from({ length: 11 }).map((_, i) => ({
      id: `custom_${i + 1}`,
      name: i === 0 ? 'Portero Custom' : `Estrella ${i}`,
      number: i + 1,
      position: i === 0 ? 'POR' : i <= 4 ? 'DEF' : i <= 8 ? 'MED' : 'DEL',
      isGoalkeeper: i === 0,
      disparo: 80,
      fuerza: 78,
      precision: 79,
      tecnica: 82,
    }));

    const substitutes: ChapaPlayer[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `custom_sub_${i + 12}`,
      name: `Suplente Custom ${i + 1}`,
      number: i + 12,
      position: i === 0 ? 'POR' : i <= 2 ? 'MED' : 'DEL',
      isGoalkeeper: i === 0,
      disparo: 76,
      fuerza: 75,
      precision: 75,
      tecnica: 78,
    }));

    return {
      id: 'custom_user_team',
      name: customTeamName,
      shortName: customTeamName.substring(0, 12),
      primaryColor: customPrimaryColor,
      secondaryColor: customSecondaryColor,
      textColor: customTextColor,
      formation: customFormation,
      players,
      substitutes,
    };
  };

  // Launch Match Handlers
  const handleStartQuickMatch = (userSide: 'home' | 'away' | 'both', diff: AiDifficulty = 'normal') => {
    playClickSound();
    const homeClub = gameSave.clubs[selectedHomeClubId] || allClubs[0];
    const awayClub = gameSave.clubs[selectedAwayClubId] || allClubs[1];
    if (!homeClub || !awayClub) return;

    setMatchHomeTeam(buildTeamConfigFromClub(homeClub));
    setMatchAwayTeam(buildTeamConfigFromClub(awayClub));
    setMatchUserSide(userSide);
    setMatchAiDifficulty(diff);
    setMatchCompTitle('Partido Rápido de Chapas');
    setIsMatchModalOpen(true);
  };

  const handleStartPracticeTraining = () => {
    playClickSound();
    const userClub = gameSave.clubs[selectedHomeClubId] || allClubs[0];
    const myTeam = userClub ? buildTeamConfigFromClub(userClub) : buildCustomTeamConfig();

    // Sparring dummy team with 0 AI reaction
    const dummyTeam: ChapasMatchTeamConfig = {
      id: 'sparring_cones',
      name: 'Equipo de Conos y Dianas',
      shortName: 'Dianas',
      primaryColor: '#f97316',
      secondaryColor: '#ffffff',
      textColor: '#ffffff',
      formation: '4-4-2',
      players: Array.from({ length: 11 }).map((_, i) => ({
        id: `cone_${i}`,
        name: `Diana ${i + 1}`,
        number: i + 1,
        position: i === 0 ? 'POR' : 'DEF',
        isGoalkeeper: i === 0,
        disparo: 40,
        fuerza: 40,
        precision: 40,
        tecnica: 40,
      })),
    };

    setMatchHomeTeam(myTeam);
    setMatchAwayTeam(dummyTeam);
    setMatchUserSide('home');
    setMatchAiDifficulty('facil');
    setMatchCompTitle('Modo Entrenamiento — Práctica Libre');
    setIsMatchModalOpen(true);
  };

  // Start Knockout Tournament
  const handleStartNewTournament = () => {
    playClickSound();
    const shuffled = [...allClubs].sort(() => 0.5 - Math.random()).slice(0, 8);
    if (shuffled.length < 8) return;

    const quarters: TournamentMatch[] = [
      {
        id: 'q1',
        round: 'CUARTOS',
        homeTeam: buildTeamConfigFromClub(shuffled[0]),
        awayTeam: buildTeamConfigFromClub(shuffled[1]),
        isPlayed: false,
      },
      {
        id: 'q2',
        round: 'CUARTOS',
        homeTeam: buildTeamConfigFromClub(shuffled[2]),
        awayTeam: buildTeamConfigFromClub(shuffled[3]),
        isPlayed: false,
      },
      {
        id: 'q3',
        round: 'CUARTOS',
        homeTeam: buildTeamConfigFromClub(shuffled[4]),
        awayTeam: buildTeamConfigFromClub(shuffled[5]),
        isPlayed: false,
      },
      {
        id: 'q4',
        round: 'CUARTOS',
        homeTeam: buildTeamConfigFromClub(shuffled[6]),
        awayTeam: buildTeamConfigFromClub(shuffled[7]),
        isPlayed: false,
      },
    ];

    setTournamentMatches(quarters);
    setCurrentTournamentIndex(0);
    setTournamentChampion(null);
  };

  const handlePlayTournamentMatch = (match: TournamentMatch) => {
    playClickSound();
    setMatchHomeTeam(match.homeTeam);
    setMatchAwayTeam(match.awayTeam);
    setMatchUserSide('home');
    setMatchAiDifficulty('normal');
    setMatchCompTitle(`Copa de Chapas — ${match.round}`);
    setIsMatchModalOpen(true);
  };

  // On Match Finished in Hub
  const handleHubMatchFinished = (payload: ChapasMatchFinishedPayload) => {
    setIsMatchModalOpen(false);

    // If currently playing a tournament match, advance the tournament
    if (activeTab === 'torneo' && tournamentMatches[currentTournamentIndex]) {
      const cur = tournamentMatches[currentTournamentIndex];
      const winner = payload.homeScore >= payload.awayScore ? cur.homeTeam : cur.awayTeam;

      const updated = [...tournamentMatches];
      updated[currentTournamentIndex] = {
        ...cur,
        homeScore: payload.homeScore,
        awayScore: payload.awayScore,
        winnerTeamId: winner.id,
        isPlayed: true,
      };

      // Check if quarters done
      const quartersDone = updated.filter((m) => m.round === 'CUARTOS' && m.isPlayed).length === 4;
      const semisDone = updated.filter((m) => m.round === 'SEMIS' && m.isPlayed).length === 2;

      if (quartersDone && updated.length === 4) {
        // Generate Semifinals
        const semi1: TournamentMatch = {
          id: 's1',
          round: 'SEMIS',
          homeTeam: updated[0].homeScore! >= updated[0].awayScore! ? updated[0].homeTeam : updated[0].awayTeam,
          awayTeam: updated[1].homeScore! >= updated[1].awayScore! ? updated[1].homeTeam : updated[1].awayTeam,
          isPlayed: false,
        };
        const semi2: TournamentMatch = {
          id: 's2',
          round: 'SEMIS',
          homeTeam: updated[2].homeScore! >= updated[2].awayScore! ? updated[2].homeTeam : updated[2].awayTeam,
          awayTeam: updated[3].homeScore! >= updated[3].awayScore! ? updated[3].homeTeam : updated[3].awayTeam,
          isPlayed: false,
        };
        updated.push(semi1, semi2);
      } else if (semisDone && updated.length === 6) {
        // Generate Final
        const finalMatch: TournamentMatch = {
          id: 'f1',
          round: 'FINAL',
          homeTeam: updated[4].homeScore! >= updated[4].awayScore! ? updated[4].homeTeam : updated[4].awayTeam,
          awayTeam: updated[5].homeScore! >= updated[5].awayScore! ? updated[5].homeTeam : updated[5].awayTeam,
          isPlayed: false,
        };
        updated.push(finalMatch);
      } else if (updated.length === 7 && updated[6].isPlayed) {
        // Champion crowned!
        const champ = updated[6].homeScore! >= updated[6].awayScore! ? updated[6].homeTeam : updated[6].awayTeam;
        setTournamentChampion(champ);
      }

      setTournamentMatches(updated);
      setCurrentTournamentIndex(currentTournamentIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="pcf-panel rounded-2xl p-5 sm:p-6 border border-emerald-800/50 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700/30 border border-emerald-600/50 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-condensed tracking-wider uppercase text-white">
              Fútbol Chapas — Arcade & Torneo
            </h1>
            <p className="text-xs text-slate-400">
              Videojuego completo de fútbol de chapas con físicas elásticas, inteligencia artificial y partidas en tiempo real.
            </p>
          </div>
        </div>

        {onBackToOffice && (
          <button
            onClick={onBackToOffice}
            className="pcf-btn pcf-btn-gold px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider"
          >
            Volver al Despacho
          </button>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
        {[
          { id: 'rapido', label: 'Partido Rápido', icon: Play },
          { id: 'vs_cpu', label: 'Contra la CPU', icon: Cpu },
          { id: 'dos_jugadores', label: '2 Jugadores (Local)', icon: Users },
          { id: 'torneo', label: 'Modo Torneo', icon: Trophy },
          { id: 'entrenamiento', label: 'Entrenamiento', icon: Target },
          { id: 'personalizador', label: 'Personalizador', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as HubTab);
              }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. PARTIDO RÁPIDO & VS CPU */}
      {(activeTab === 'rapido' || activeTab === 'vs_cpu') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Home Team Card */}
          <div className="pcf-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black font-condensed tracking-wider uppercase text-slate-300">
              Equipo Local
            </h3>
            <select
              value={selectedHomeClubId}
              onChange={(e) => setSelectedHomeClubId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              {allClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.city})
                </option>
              ))}
            </select>

            {/* Club Preview Badge */}
            {gameSave.clubs[selectedHomeClubId] && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                <div
                  className="w-12 h-12 mx-auto rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center font-black text-lg text-white font-condensed"
                  style={{
                    backgroundColor: gameSave.clubs[selectedHomeClubId].primaryColor || '#2563eb',
                  }}
                >
                  {gameSave.clubs[selectedHomeClubId].code || 'LOC'}
                </div>
                <h4 className="font-bold text-sm text-white font-condensed uppercase">
                  {gameSave.clubs[selectedHomeClubId].name}
                </h4>
                <p className="text-xs text-slate-400">
                  {gameSave.clubs[selectedHomeClubId].stadium?.name}
                </p>
              </div>
            )}
          </div>

          {/* Versus & Settings */}
          <div className="pcf-panel rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="text-center space-y-3">
              <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold">
                VS
              </span>
              <h3 className="text-base font-black font-condensed tracking-wider uppercase text-white">
                Configuración del Encuentro
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Dificultad IA:</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as AiDifficulty)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="facil">Fácil (Iniciación)</option>
                  <option value="normal">Normal (Estándar)</option>
                  <option value="dificil">Difícil (Competitivo)</option>
                  <option value="experto">Experto (Maestro de Chapas)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Duración por Parte:</label>
                <select
                  value={matchDurationMin}
                  onChange={(e) => setMatchDurationMin(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value={1}>1 Minuto (Rápido)</option>
                  <option value={2}>2 Minutos (Recomendado)</option>
                  <option value={3}>3 Minutos (Estándar)</option>
                  <option value={5}>5 Minutos (Simulación Real)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleStartQuickMatch('home', selectedDifficulty)}
              className="w-full pcf-btn pcf-btn-emerald py-3 text-sm font-black font-condensed uppercase tracking-wider shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Jugar Partido</span>
            </button>
          </div>

          {/* Away Team Card */}
          <div className="pcf-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black font-condensed tracking-wider uppercase text-slate-300">
              Equipo Visitante (Rival)
            </h3>
            <select
              value={selectedAwayClubId}
              onChange={(e) => setSelectedAwayClubId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              {allClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.city})
                </option>
              ))}
            </select>

            {/* Club Preview Badge */}
            {gameSave.clubs[selectedAwayClubId] && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                <div
                  className="w-12 h-12 mx-auto rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center font-black text-lg text-white font-condensed"
                  style={{
                    backgroundColor: gameSave.clubs[selectedAwayClubId].primaryColor || '#dc2626',
                  }}
                >
                  {gameSave.clubs[selectedAwayClubId].code || 'VIS'}
                </div>
                <h4 className="font-bold text-sm text-white font-condensed uppercase">
                  {gameSave.clubs[selectedAwayClubId].name}
                </h4>
                <p className="text-xs text-slate-400">
                  {gameSave.clubs[selectedAwayClubId].stadium?.name}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DOS JUGADORES LOCAL (PASA Y JUEGA) */}
      {activeTab === 'dos_jugadores' && (
        <div className="pcf-panel rounded-2xl p-6 space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <Users className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-black font-condensed uppercase tracking-wider text-white">
              Modo 2 Jugadores — Pasa y Juega
            </h3>
            <p className="text-xs text-slate-400">
              Dos amigos disputando un partido en el mismo ordenador o dispositivo móvil. Cada jugador controla sus 11 chapas por turnos alternativos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Equipo Jugador 1 (Izquierda):</label>
              <select
                value={selectedHomeClubId}
                onChange={(e) => setSelectedHomeClubId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                {allClubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Equipo Jugador 2 (Derecha):</label>
              <select
                value={selectedAwayClubId}
                onChange={(e) => setSelectedAwayClubId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                {allClubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => handleStartQuickMatch('both')}
              className="pcf-btn pcf-btn-emerald px-8 py-3 text-sm font-black font-condensed uppercase tracking-wider shadow-xl hover:scale-105 transition-transform"
            >
              Comenzar Duelo 1 vs 1
            </button>
          </div>
        </div>
      )}

      {/* 3. MODO TORNEO */}
      {activeTab === 'torneo' && (
        <div className="pcf-panel rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black font-condensed uppercase tracking-wider text-white">
                Copa Élite de Fútbol Chapas (8 Equipos)
              </h3>
              <p className="text-xs text-slate-400">
                Cuadro eliminatorio clásico a partido único. Supera los Cuartos, Semifinal y la Gran Final para levantar el trofeo.
              </p>
            </div>

            <button
              onClick={handleStartNewTournament}
              className="pcf-btn pcf-btn-gold px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sortear Nuevo Cuadro</span>
            </button>
          </div>

          {tournamentChampion && (
            <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500 rounded-2xl p-6 text-center space-y-3">
              <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-2xl font-black font-condensed uppercase tracking-wider text-amber-400">
                ¡¡CAMPEÓN DE LA COPA: {tournamentChampion.name.toUpperCase()}!!
              </h4>
              <p className="text-xs text-slate-300">
                Enhorabuena por conquistar la competición de fútbol chapas.
              </p>
            </div>
          )}

          {tournamentMatches.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-950/50 rounded-xl border border-slate-800">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No hay ningún torneo activo actualmente.</p>
              <button
                onClick={handleStartNewTournament}
                className="pcf-btn pcf-btn-emerald px-6 py-2.5 text-xs font-bold font-condensed uppercase tracking-wider"
              >
                Sortear Torneo de 8 Clubes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournamentMatches.map((match, idx) => (
                  <div
                    key={match.id}
                    className={`bg-slate-950 p-4 rounded-xl border transition-all ${
                      match.isPlayed
                        ? 'border-slate-800 opacity-80'
                        : idx === currentTournamentIndex
                        ? 'border-emerald-500 shadow-lg'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 font-condensed uppercase mb-2">
                      <span>Ronda: {match.round}</span>
                      {match.isPlayed ? (
                        <span className="text-emerald-400 font-bold">FINALIZADO</span>
                      ) : idx === currentTournamentIndex ? (
                        <span className="text-amber-400 font-bold animate-pulse">PRÓXIMO ENCUENTRO</span>
                      ) : (
                        <span>PENDIENTE</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between font-condensed">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: match.homeTeam.primaryColor }}
                        />
                        <span className="font-bold text-sm text-white">{match.homeTeam.name}</span>
                      </div>
                      <div className="font-mono font-bold text-base text-slate-200">
                        {match.isPlayed ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{match.awayTeam.name}</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: match.awayTeam.primaryColor }}
                        />
                      </div>
                    </div>

                    {!match.isPlayed && idx === currentTournamentIndex && (
                      <div className="mt-3 text-right">
                        <button
                          onClick={() => handlePlayTournamentMatch(match)}
                          className="pcf-btn pcf-btn-emerald px-4 py-1.5 text-xs font-bold font-condensed uppercase tracking-wider"
                        >
                          Disputar Partido
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODO ENTRENAMIENTO */}
      {activeTab === 'entrenamiento' && (
        <div className="pcf-panel rounded-2xl p-6 space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <Target className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-black font-condensed uppercase tracking-wider text-white">
              Campo de Entrenamiento y Tiro
            </h3>
            <p className="text-xs text-slate-400">
              Práctica libre de disparos, cálculo de rebotes en bandas y efectos. Sin presión de rival para perfeccionar la potencia y puntería de tus chapas.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <button
              onClick={handleStartPracticeTraining}
              className="w-full pcf-btn pcf-btn-emerald py-3.5 text-sm font-black font-condensed uppercase tracking-wider shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>Entrar al Campo de Prácticas</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. PERSONALIZADOR */}
      {activeTab === 'personalizador' && (
        <div className="pcf-panel rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black font-condensed uppercase tracking-wider text-white">
              Personalizador de Equipos y Chapas
            </h3>
            <p className="text-xs text-slate-400">
              Crea tu propia plantilla personalizada con tus colores favoritos y esquema táctico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre del Club:</label>
                <input
                  type="text"
                  value={customTeamName}
                  onChange={(e) => setCustomTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Color Base:</label>
                  <input
                    type="color"
                    value={customPrimaryColor}
                    onChange={(e) => setCustomPrimaryColor(e.target.value)}
                    className="w-full h-9 bg-slate-950 border border-slate-700 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Color Anillo:</label>
                  <input
                    type="color"
                    value={customSecondaryColor}
                    onChange={(e) => setCustomSecondaryColor(e.target.value)}
                    className="w-full h-9 bg-slate-950 border border-slate-700 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Color Dorsal:</label>
                  <input
                    type="color"
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="w-full h-9 bg-slate-950 border border-slate-700 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Esquema Táctico:</label>
                <select
                  value={customFormation}
                  onChange={(e) => setCustomFormation(e.target.value as '4-4-2' | '4-3-3')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="4-3-3">4-3-3 Ofensivo</option>
                  <option value="4-4-2">4-4-2 Equilibrado</option>
                  <option value="4-2-3-1">4-2-3-1 Posesión</option>
                  <option value="3-5-2">3-5-2 Carrileros</option>
                  <option value="5-3-2">5-3-2 Repliegue</option>
                </select>
              </div>
            </div>

            {/* Chapa Preview */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
              <p className="text-xs text-slate-400 font-condensed uppercase">Vista Previa de la Chapa:</p>
              <div
                className="w-24 h-24 rounded-full border-4 border-slate-400 shadow-2xl flex items-center justify-center relative"
                style={{ backgroundColor: customPrimaryColor }}
              >
                <div
                  className="w-18 h-18 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: customSecondaryColor }}
                >
                  <span
                    className="font-mono font-black text-2xl"
                    style={{ color: customTextColor }}
                  >
                    10
                  </span>
                </div>
              </div>
              <p className="font-bold text-white font-condensed uppercase">{customTeamName}</p>
            </div>
          </div>
        </div>
      )}

      {/* FULL MATCH MODAL */}
      {isMatchModalOpen && matchHomeTeam && matchAwayTeam && (
        <ChapasMatchModal
          isOpen={isMatchModalOpen}
          homeTeam={matchHomeTeam}
          awayTeam={matchAwayTeam}
          userSide={matchUserSide}
          aiDifficulty={matchAiDifficulty}
          halfDurationMinutes={matchDurationMin}
          competitionName={matchCompTitle}
          onMatchFinished={handleHubMatchFinished}
          onClose={() => setIsMatchModalOpen(false)}
        />
      )}
    </div>
  );
};
