import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { simulateMatch, SimulatedMatchResult } from '../engine/matchEngine';
import { Club } from '../types/club';
import { Match, MatchEvent } from '../types/competition';
import { GameSave } from '../types/game';
import { Player } from '../types/player';
import { FORMATIONS, DEFAULT_TEAM_INSTRUCTIONS } from '../types/tactics';
import { playClickSound, playGoalSound, playWhistleSound } from '../utils/audio';
import { 
  Trophy, 
  Play, 
  Pause, 
  FastForward, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  X, 
  Flame, 
  Users,
  Zap,
  Sliders,
  ArrowRightLeft,
  Activity,
  CloudSun,
  Thermometer,
  Clock,
  Sparkles,
  Award,
  Eye,
  FileText,
  Star,
  Gamepad2
} from 'lucide-react';
import { calculateMatchdayGate } from '../engine/clubManagementEngine';
import { UnifiedFixture } from '../engine/internationalCompetitionsEngine';
import { FinancialLedgerEntry } from '../types/club';
import { NATIONAL_TEAMS_MAP } from '../db/worldData/nationalTeams80';
import { getOrBuildNationalSquad } from '../engine/nationalTeamsEngine';
import { ChapasMatchModal, ChapasMatchTeamConfig, ChapasMatchFinishedPayload } from './chapas/ChapasMatchModal';
import { ChapaPlayer } from '../engine/chapasPhysicsEngine';
import { PenaltyShootoutModal, PenaltyShooter, PenaltyGoalkeeper } from './modals/PenaltyShootoutModal';

function buildVirtualNationalClub(nationId: string, playersMap: Record<string, Player>): Club {
  const nat = NATIONAL_TEAMS_MAP[nationId];
  const squad = getOrBuildNationalSquad(nationId, playersMap);
  const natName = nat ? nat.name : nationId;
  const natFlag = nat ? nat.flag : '🌐';
  const natCode = nat ? nat.code : nationId;

  let primaryColor = '#dc2626';
  let secondaryColor = '#facc15';
  let textColor = '#ffffff';

  if (nationId === 'BRA') { primaryColor = '#facc15'; secondaryColor = '#15803d'; textColor = '#15803d'; }
  else if (nationId === 'ARG') { primaryColor = '#38bdf8'; secondaryColor = '#ffffff'; textColor = '#0369a1'; }
  else if (nationId === 'FRA') { primaryColor = '#1d4ed8'; secondaryColor = '#ffffff'; textColor = '#ffffff'; }
  else if (nationId === 'GER') { primaryColor = '#ffffff'; secondaryColor = '#000000'; textColor = '#000000'; }
  else if (nationId === 'ENG') { primaryColor = '#ffffff'; secondaryColor = '#dc2626'; textColor = '#1e3a8a'; }
  else if (nationId === 'ITA') { primaryColor = '#2563eb'; secondaryColor = '#ffffff'; textColor = '#ffffff'; }
  else if (nationId === 'POR') { primaryColor = '#b91c1c'; secondaryColor = '#15803d'; textColor = '#ffffff'; }
  else if (nationId === 'NED') { primaryColor = '#ea580c'; secondaryColor = '#ffffff'; textColor = '#ffffff'; }
  else if (nationId === 'MAR') { primaryColor = '#b91c1c'; secondaryColor = '#15803d'; textColor = '#ffffff'; }
  else if (nationId === 'JPN') { primaryColor = '#1e3a8a'; secondaryColor = '#ffffff'; textColor = '#ffffff'; }
  else if (nationId === 'MEX') { primaryColor = '#15803d'; secondaryColor = '#dc2626'; textColor = '#ffffff'; }
  else if (nationId === 'USA') { primaryColor = '#1e3a8a'; secondaryColor = '#dc2626'; textColor = '#ffffff'; }

  return {
    id: nationId,
    name: `Selección de ${natName}`,
    shortName: `${natFlag} ${natName}`,
    code: natCode,
    countryId: nationId,
    divisionId: 'fifa_world_cup_2026',
    foundedYear: 1904,
    city: natName,
    primaryColor,
    secondaryColor,
    textColor,
    stadium: {
      name: `${natFlag} Estadio Mundialista Oficial`,
      city: natName,
      capacity: 75000,
      condition: 100,
      ticketPrice: 65,
      seasonTicketHolders: 0,
      seasonTicketPrice: 350,
    },
    facilities: {
      trainingGroundLevel: 5,
      youthAcademyLevel: 5,
      medicalCenterLevel: 5,
      stadiumLevel: 5,
    },
    finances: {
      balance: 150000000,
      transferBudget: 0,
      weeklyWageBudget: 1500000,
      sponsorName: 'FIFA World Partner',
      sponsorAnnualRevenue: 50000000,
      seasonTicketRevenue: 0,
      recentLedger: [],
    },
    reputation: nat ? Math.round(98 - nat.fifaRanking * 0.3) : 80,
    boardObjective: 'Campeón de Liga',
    boardConfidence: 90,
    playerIds: squad.all23.map((p) => p.id),
    startingElevenIds: squad.starters.map((p) => p.id),
    benchPlayerIds: squad.bench.map((p) => p.id),
    tacticFormation: '4-3-3',
    tacticMentality: 'Ofensiva',
    tacticTempo: 'Rápido',
    tacticPassing: 'Corto',
    tacticPressing: 'Intensa',
    coachName: 'Seleccionador Nacional',
    historyTitles: [],
    teamInstructions: {
      ...DEFAULT_TEAM_INSTRUCTIONS,
      presion: 'Alta',
    },
  };
}

interface LiveMatchModalProps {
  isOpen: boolean;
  gameSave: GameSave;
  targetFixture?: UnifiedFixture | null;
  onMatchFinished: (
    updatedSave: GameSave,
    userMatchResult: SimulatedMatchResult
  ) => void;
  onClose: () => void;
}

export type MatchSimulationMode = 'rapido' | 'texto' | 'tactico';

export const HOME_2D_SLOTS = [
  { pos: 'POR', x: 8, y: 50 },
  { pos: 'LD', x: 25, y: 18 },
  { pos: 'DFC', x: 22, y: 38 },
  { pos: 'DFC', x: 22, y: 62 },
  { pos: 'LI', x: 25, y: 82 },
  { pos: 'MCD', x: 38, y: 50 },
  { pos: 'MC', x: 44, y: 32 },
  { pos: 'MC', x: 44, y: 68 },
  { pos: 'ED', x: 68, y: 20 },
  { pos: 'DC', x: 74, y: 50 },
  { pos: 'EI', x: 68, y: 80 },
];

export const AWAY_2D_SLOTS = [
  { pos: 'POR', x: 92, y: 50 },
  { pos: 'LI', x: 75, y: 18 },
  { pos: 'DFC', x: 78, y: 38 },
  { pos: 'DFC', x: 78, y: 62 },
  { pos: 'LD', x: 75, y: 82 },
  { pos: 'MCD', x: 62, y: 50 },
  { pos: 'MC', x: 56, y: 32 },
  { pos: 'MC', x: 56, y: 68 },
  { pos: 'EI', x: 32, y: 20 },
  { pos: 'DC', x: 26, y: 50 },
  { pos: 'ED', x: 32, y: 80 },
];

export const LiveMatchModal: React.FC<LiveMatchModalProps> = ({
  isOpen,
  gameSave,
  targetFixture,
  onMatchFinished,
  onClose,
}) => {
  const userClub = gameSave.clubs[gameSave.userClubId];
  const competition = (userClub?.divisionId && gameSave.competitions[userClub.divisionId]) 
    ? gameSave.competitions[userClub.divisionId] 
    : Object.values(gameSave.competitions)[0];

  // Derive matchToPlay: either from targetFixture or unplayed match
  const matchToPlay: Match | null = useMemo(() => {
    if (targetFixture) {
      return {
        id: targetFixture.id,
        competitionId: targetFixture.competitionId,
        matchday: parseInt(targetFixture.roundOrMatchday.replace(/[^0-9]/g, '') || '1', 10),
        homeTeamId: targetFixture.homeTeamId,
        awayTeamId: targetFixture.awayTeamId,
        homeScore: targetFixture.homeScore,
        awayScore: targetFixture.awayScore,
        played: targetFixture.played,
        date: targetFixture.date,
      };
    }
    return competition?.matches?.find(
      (m) => !m.played && (m.homeTeamId === userClub?.id || m.awayTeamId === userClub?.id)
    ) || null;
  }, [targetFixture, competition, userClub?.id]);

  const isWorldCupMatch = !!targetFixture?.isWorldCup;
  const userNationId = gameSave.worldCupTournament?.userTeamId || gameSave.manager?.nationalTeamRole?.countryId || 'ESP';

  const effectivePlayersMap = useMemo(() => {
    const merged = { ...gameSave.players };
    if (matchToPlay) {
      if (NATIONAL_TEAMS_MAP[matchToPlay.homeTeamId] || isWorldCupMatch) {
        const hSquad = getOrBuildNationalSquad(matchToPlay.homeTeamId, gameSave.players);
        hSquad.all23.forEach((p) => { merged[p.id] = p; });
      }
      if (NATIONAL_TEAMS_MAP[matchToPlay.awayTeamId] || isWorldCupMatch) {
        const aSquad = getOrBuildNationalSquad(matchToPlay.awayTeamId, gameSave.players);
        aSquad.all23.forEach((p) => { merged[p.id] = p; });
      }
    }
    return merged;
  }, [gameSave.players, matchToPlay, isWorldCupMatch]);

  const homeClub = useMemo(() => {
    if (!matchToPlay) return null;
    if (gameSave.clubs[matchToPlay.homeTeamId]) return gameSave.clubs[matchToPlay.homeTeamId];
    if (NATIONAL_TEAMS_MAP[matchToPlay.homeTeamId] || isWorldCupMatch) {
      return buildVirtualNationalClub(matchToPlay.homeTeamId, effectivePlayersMap);
    }
    return null;
  }, [matchToPlay, gameSave.clubs, effectivePlayersMap, isWorldCupMatch]);

  const awayClub = useMemo(() => {
    if (!matchToPlay) return null;
    if (gameSave.clubs[matchToPlay.awayTeamId]) return gameSave.clubs[matchToPlay.awayTeamId];
    if (NATIONAL_TEAMS_MAP[matchToPlay.awayTeamId] || isWorldCupMatch) {
      return buildVirtualNationalClub(matchToPlay.awayTeamId, effectivePlayersMap);
    }
    return null;
  }, [matchToPlay, gameSave.clubs, effectivePlayersMap, isWorldCupMatch]);

  const activeControlledClub = useMemo(() => {
    if (isWorldCupMatch && matchToPlay) {
      if (matchToPlay.homeTeamId === userNationId && homeClub) return homeClub;
      if (matchToPlay.awayTeamId === userNationId && awayClub) return awayClub;
    }
    return userClub;
  }, [isWorldCupMatch, matchToPlay, userNationId, homeClub, awayClub, userClub]);

  // Screen Stage: 'prepartido' | 'partido'
  const [matchPhase, setMatchPhase] = useState<'prepartido' | 'partido'>('prepartido');

  // Active Simulation Mode
  const [activeMode, setActiveMode] = useState<MatchSimulationMode>('tactico');

  // Simulation result and working copy
  const [simResult, setSimResult] = useState<SimulatedMatchResult | null>(null);

  // Playback state
  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2); // 1x, 2x, 5x, 10x
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [currentHomeScore, setCurrentHomeScore] = useState<number>(0);
  const [currentAwayScore, setCurrentAwayScore] = useState<number>(0);
  const [visibleEvents, setVisibleEvents] = useState<MatchEvent[]>([]);
  const [isShootoutActive, setIsShootoutActive] = useState<boolean>(false);
  const [shootoutScores, setShootoutScores] = useState<{ home: number; away: number; winner: 'home' | 'away' } | null>(null);

  // In-Game Tactical State (Point 4)
  const [liveFormation, setLiveFormation] = useState<string>(userClub?.tacticFormation || '4-3-3');
  const [liveMentality, setLiveMentality] = useState<Club['tacticMentality']>(userClub?.tacticMentality || 'Equilibrada');
  const [livePressing, setLivePressing] = useState<'Baja' | 'Media' | 'Alta' | 'Asfixiante'>(
    userClub?.teamInstructions?.presion || 'Media'
  );
  const [subsCount, setSubsCount] = useState<number>(0);
  const [selectedSubOffId, setSelectedSubOffId] = useState<string>('');
  const [selectedSubOnId, setSelectedSubOnId] = useState<string>('');
  const [showSubModal, setShowSubModal] = useState<boolean>(false);
  const [tacticalFeedbackMsg, setTacticalFeedbackMsg] = useState<string>('');

  // Halftime & 2D Simulator States (User request: Cambios en el descanso & Mejorar visor 2D)
  const [isHalftime, setIsHalftime] = useState<boolean>(false);
  const [hasProcessedHalftime, setHasProcessedHalftime] = useState<boolean>(false);
  const [matchView, setMatchView] = useState<'campo2d' | 'narracion'>('campo2d');
  const [halftimeTalk, setHalftimeTalk] = useState<string>('Exigir mayor intensidad y presión en campo rival');

  // Mobile Adaptive Navigation Tabs
  const [isChapasMatchActive, setIsChapasMatchActive] = useState<boolean>(false);
  const [activeMobileSection, setActiveMobileSection] = useState<'campo' | 'tactica' | 'stats'>('campo');
  const [prematchLineupTab, setPrematchLineupTab] = useState<'home' | 'away'>('home');

  // Active Lineup in Match
  const [currentStartersIds, setCurrentStartersIds] = useState<string[]>([]);
  const [currentBenchIds, setCurrentBenchIds] = useState<string[]>([]);

  // Penalty Shootout Shooters and Goalkeepers (BLOQUE 10)
  const homeShooters: PenaltyShooter[] = useMemo(() => {
    if (!homeClub) return [];
    return (homeClub.startingElevenIds || []).slice(0, 11).map((pid, idx) => {
      const p = gameSave.players[pid];
      return {
        id: pid,
        name: p ? `${p.firstName[0]}. ${p.lastName}` : `Lanzador ${idx + 1}`,
        number: p?.squadNumber || idx + 1,
        disparo: p?.attributes?.disparo || 70,
        fuerza: p?.attributes?.fuerza || 70,
      };
    });
  }, [homeClub, gameSave.players]);

  const awayShooters: PenaltyShooter[] = useMemo(() => {
    if (!awayClub) return [];
    return (awayClub.startingElevenIds || []).slice(0, 11).map((pid, idx) => {
      const p = gameSave.players[pid];
      return {
        id: pid,
        name: p ? `${p.firstName[0]}. ${p.lastName}` : `Lanzador ${idx + 1}`,
        number: p?.squadNumber || idx + 1,
        disparo: p?.attributes?.disparo || 70,
        fuerza: p?.attributes?.fuerza || 70,
      };
    });
  }, [awayClub, gameSave.players]);

  const homeGoalkeeper: PenaltyGoalkeeper = useMemo(() => {
    const gkId = homeClub?.startingElevenIds?.[0];
    const p = gkId ? gameSave.players[gkId] : null;
    return {
      id: gkId || 'home_gk',
      name: p ? `${p.firstName[0]}. ${p.lastName}` : 'Portero Local',
      paradas: p?.attributes?.paradas || p?.overallRating || 75,
      reflejos: p?.attributes?.reflejos || p?.overallRating || 75,
    };
  }, [homeClub, gameSave.players]);

  const awayGoalkeeper: PenaltyGoalkeeper = useMemo(() => {
    const gkId = awayClub?.startingElevenIds?.[0];
    const p = gkId ? gameSave.players[gkId] : null;
    return {
      id: gkId || 'away_gk',
      name: p ? `${p.firstName[0]}. ${p.lastName}` : 'Portero Visitante',
      paradas: p?.attributes?.paradas || p?.overallRating || 75,
      reflejos: p?.attributes?.reflejos || p?.overallRating || 75,
    };
  }, [awayClub, gameSave.players]);

  // Pre-Match Briefing Info: Standings, Form, Injuries & Referee (BLOQUE 12)
  const homeStanding = useMemo(() => {
    return competition?.standings?.find((r) => r.teamId === homeClub?.id);
  }, [competition, homeClub]);

  const awayStanding = useMemo(() => {
    return competition?.standings?.find((r) => r.teamId === awayClub?.id);
  }, [competition, awayClub]);

  const homeRank = useMemo(() => {
    if (!competition?.standings) return null;
    const sorted = [...competition.standings].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    const idx = sorted.findIndex((r) => r.teamId === homeClub?.id);
    return idx >= 0 ? idx + 1 : null;
  }, [competition, homeClub]);

  const awayRank = useMemo(() => {
    if (!competition?.standings) return null;
    const sorted = [...competition.standings].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    const idx = sorted.findIndex((r) => r.teamId === awayClub?.id);
    return idx >= 0 ? idx + 1 : null;
  }, [competition, awayClub]);

  const homeInjured = useMemo(() => {
    if (!homeClub) return [];
    return Object.values(gameSave.players).filter((p) => p.clubId === homeClub.id && (p.isInjured || (p.suspensionMatchesLeft && p.suspensionMatchesLeft > 0)));
  }, [homeClub, gameSave.players]);

  const awayInjured = useMemo(() => {
    if (!awayClub) return [];
    return Object.values(gameSave.players).filter((p) => p.clubId === awayClub.id && (p.isInjured || (p.suspensionMatchesLeft && p.suspensionMatchesLeft > 0)));
  }, [awayClub, gameSave.players]);

  const designatedReferee = useMemo(() => {
    const referees = [
      { name: 'J.M. Sánchez Martínez', level: 'Muy Alto', avgCards: '5.4', desc: 'Rigor extremo con protestas y juego brusco' },
      { name: 'Jesús Gil Manzano', level: 'Alto', avgCards: '4.8', desc: 'Minucioso en el chequeo de jugadas en el área' },
      { name: 'Alejandro Hernández Hernández', level: 'Medio-Alto', avgCards: '5.1', desc: 'Otorga ventaja en contragolpes directos' },
      { name: 'César Soto Grado', level: 'Equilibrado', avgCards: '3.9', desc: 'Estilo dialogante y arbitraje continuado' },
      { name: 'Ricardo de Burgos Bengoetxea', level: 'Moderado', avgCards: '4.2', desc: 'Control temprano del tempo del partido' },
    ];
    const hash = (matchToPlay?.id || 'match').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return referees[hash % referees.length];
  }, [matchToPlay?.id]);

  // Ball coordinate simulator on 2D pitch
  const ballPosition = useMemo(() => {
    const currentEvent = visibleEvents.find((e) => e.minute === currentMinute);
    if (currentEvent) {
      if (currentEvent.type === 'GOL' || currentEvent.type === 'GOL_PENALTI') {
        return currentEvent.teamId === homeClub?.id ? { x: 94, y: 50 } : { x: 6, y: 50 };
      }
      if (currentEvent.type === 'TARJETA_AMARILLA' || currentEvent.type === 'TARJETA_ROJA') {
        return { x: 50, y: 50 };
      }
    }
    const homePoss = simResult?.stats?.possessionHome || 50;
    const wave = Math.sin(currentMinute * 0.45);
    const baseX = homePoss > 50 ? 54 + wave * 24 : 46 + wave * 24;
    const baseY = 50 + Math.cos(currentMinute * 0.35) * 28;
    return {
      x: Math.max(12, Math.min(88, Math.round(baseX))),
      y: Math.max(18, Math.min(82, Math.round(baseY))),
    };
  }, [currentMinute, visibleEvents, homeClub?.id, simResult?.stats?.possessionHome]);

  // Featured MVP Player (PC Fútbol "JUGADOR DEL PARTIDO")
  const featuredMvpPlayer = useMemo(() => {
    if (!simResult) return null;
    const goalEvents = simResult.events.filter((e) => e.type === 'GOL' || e.type === 'GOL_PENALTI');
    if (goalEvents.length > 0) {
      const counts: Record<string, number> = {};
      goalEvents.forEach((e) => {
        counts[e.playerId] = (counts[e.playerId] || 0) + 1;
      });
      const topScorerId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      const matchEvent = goalEvents.find((e) => e.playerId === topScorerId);
      const playerObj = gameSave.players[topScorerId];
      const playerName = playerObj ? `${playerObj.firstName} ${playerObj.lastName}` : 'Goleador';
      const teamName = matchEvent?.teamId === homeClub?.id ? homeClub?.name : awayClub?.name;
      return { name: playerName, team: teamName || '' };
    }
    const starId = userClub?.startingElevenIds?.[0];
    const starPlayer = starId ? gameSave.players[starId] : null;
    if (starPlayer) {
      return { name: `${starPlayer.firstName} ${starPlayer.lastName}`, team: userClub.name };
    }
    return null;
  }, [simResult, homeClub, awayClub, userClub, gameSave.players]);

  // Helper to extract a player's display name for goalscorers
  const getScorerDisplayName = (playerId: string): string => {
    const p = effectivePlayersMap[playerId] || gameSave.players[playerId];
    if (!p) return 'Goleador';
    return p.nickname || p.lastName || `${p.firstName} ${p.lastName}`;
  };

  // Real-time visible goal events for home and away clubs
  const homeGoals = useMemo(() => {
    return visibleEvents
      .filter((ev) => (ev.type === 'GOL' || ev.type === 'GOL_PENALTI') && ev.teamId === homeClub?.id)
      .sort((a, b) => a.minute - b.minute);
  }, [visibleEvents, homeClub?.id]);

  const awayGoals = useMemo(() => {
    return visibleEvents
      .filter((ev) => (ev.type === 'GOL' || ev.type === 'GOL_PENALTI') && ev.teamId === awayClub?.id)
      .sort((a, b) => a.minute - b.minute);
  }, [visibleEvents, awayClub?.id]);

  // Initialize match
  useEffect(() => {
    if (isOpen && matchToPlay && homeClub && awayClub) {
      const result = simulateMatch(matchToPlay, homeClub, awayClub, effectivePlayersMap);
      setSimResult(result);
      setMatchPhase('prepartido');
      setCurrentMinute(0);
      setCurrentHomeScore(0);
      setCurrentAwayScore(0);
      setVisibleEvents([]);
      setIsFinished(false);
      setIsHalftime(false);
      setHasProcessedHalftime(false);
      setIsPlaying(false);
      setSubsCount(0);
      setLiveFormation(activeControlledClub?.tacticFormation || '4-3-3');
      setLiveMentality(activeControlledClub?.tacticMentality || 'Equilibrada');
      setCurrentStartersIds([...(activeControlledClub?.startingElevenIds || [])]);
      setCurrentBenchIds([...(activeControlledClub?.benchPlayerIds || [])]);
    }
  }, [isOpen, matchToPlay?.id, homeClub?.id, awayClub?.id]);

  const buildChapasTeamConfig = (club: Club): ChapasMatchTeamConfig => {
    const starterIds = club.startingElevenIds || [];
    const starters = starterIds.map((pid) => effectivePlayersMap[pid]).filter(Boolean);
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

    // Bench substitutes
    const benchIds = (club.benchPlayerIds && club.benchPlayerIds.length > 0)
      ? club.benchPlayerIds
      : (club.playerIds || []).filter((id) => !starterIds.includes(id));
    const benchPlayers = benchIds.map((pid) => effectivePlayersMap[pid]).filter(Boolean);
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
        fuerza: pl.attributes?.fuerza || 74,
        precision: pl.attributes?.pase || 73,
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

  const handleChapasFinished = (payload: ChapasMatchFinishedPayload) => {
    setIsChapasMatchActive(false);
    if (!matchToPlay || !homeClub || !awayClub) return;

    const chapasEvents: MatchEvent[] = payload.scorers.map((sc) => ({
      minute: sc.minute,
      type: 'GOL',
      teamId: sc.teamId,
      playerId: sc.playerId,
      description: `⚽ ¡GOL DE CHAPAS! Marcó ${sc.playerName} (${sc.minute}')`,
    }));

    const updatedMatch: Match = {
      ...matchToPlay,
      played: true,
      homeScore: payload.homeScore,
      awayScore: payload.awayScore,
      events: chapasEvents,
    };

    let updatedUserClub = { ...userClub };
    const isUserHomeMatch = matchToPlay.homeTeamId === (isWorldCupMatch ? userNationId : userClub.id);
    const attendance = homeClub.stadium?.capacity ? Math.round(homeClub.stadium.capacity * 0.88) : 25000;
    const ticketPrice = homeClub.stadium?.ticketPrice || 35;
    const totalMatchRevenue = Math.round(attendance * ticketPrice * 0.9);

    if (isUserHomeMatch && !isWorldCupMatch) {
      const ledgerEntry: FinancialLedgerEntry = {
        id: `gate_${Date.now()}`,
        date: gameSave.currentDate,
        category: 'taquilla',
        description: `Taquilla (${attendance.toLocaleString()} espectadores) y catering vs ${awayClub.name}`,
        amount: totalMatchRevenue,
      };

      updatedUserClub = {
        ...updatedUserClub,
        finances: {
          ...updatedUserClub.finances,
          balance: updatedUserClub.finances.balance + totalMatchRevenue,
          recentLedger: [ledgerEntry, ...updatedUserClub.finances.recentLedger].slice(0, 35),
        },
      };
    }

    const homePoss = Math.round((payload.homeStats.possessionTurns / Math.max(1, payload.homeStats.possessionTurns + payload.awayStats.possessionTurns)) * 100);
    const finalSimResult: SimulatedMatchResult = {
      match: updatedMatch,
      homeScore: payload.homeScore,
      awayScore: payload.awayScore,
      events: chapasEvents,
      stats: {
        possessionHome: homePoss,
        possessionAway: 100 - homePoss,
        xgHome: Number((payload.homeScore * 0.95 + 0.3).toFixed(2)),
        xgAway: Number((payload.awayScore * 0.95 + 0.3).toFixed(2)),
        shotsHome: payload.homeStats.shots,
        shotsAway: payload.awayStats.shots,
        shotsOnTargetHome: Math.round(payload.homeStats.shots * 0.7),
        shotsOnTargetAway: Math.round(payload.awayStats.shots * 0.7),
        foulsHome: payload.homeStats.fouls,
        foulsAway: payload.awayStats.fouls,
        cornersHome: 4,
        cornersAway: 3,
        yellowCardsHome: 0,
        yellowCardsAway: 0,
        redCardsHome: 0,
        redCardsAway: 0,
      },
      attendance,
      ticketRevenue: totalMatchRevenue,
      updatedPlayers: {},
    };

    const updatedSave: GameSave = {
      ...gameSave,
      players: effectivePlayersMap,
      clubs: isWorldCupMatch
        ? gameSave.clubs
        : {
            ...gameSave.clubs,
            [userClub.id]: updatedUserClub,
          },
    };

    onMatchFinished(updatedSave, finalSimResult);
  };

  const handleStartKickoff = () => {
    playClickSound();
    playWhistleSound();
    setMatchPhase('partido');
    if (activeMode === 'rapido' && simResult) {
      setCurrentMinute(90);
      setCurrentHomeScore(simResult.homeScore);
      setCurrentAwayScore(simResult.awayScore);
      setVisibleEvents(simResult.events);
      setIsFinished(true);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  // Clock timer loop
  useEffect(() => {
    if (!isPlaying || isFinished || !simResult || activeMode === 'rapido') return;

    const intervalTime = Math.max(25, 280 / speedMultiplier);
    const interval = setInterval(() => {
      setCurrentMinute((prevMin) => {
        const nextMin = prevMin + 1;

        // Process events occurring at nextMin
        const minuteEvents = simResult.events.filter((ev) => ev.minute === nextMin);
        if (minuteEvents.length > 0) {
          setVisibleEvents((prev) => [...prev, ...minuteEvents]);
          minuteEvents.forEach((ev) => {
            if (ev.type === 'GOL' || ev.type === 'GOL_PENALTI') {
              playGoalSound();
              if (ev.teamId === homeClub?.id) {
                setCurrentHomeScore((s) => s + 1);
              } else {
                setCurrentAwayScore((s) => s + 1);
              }
            }
          });
        }

        // Halftime automatic pause at minute 45 (User request: Cambios en el descanso)
        if (nextMin === 45 && !hasProcessedHalftime) {
          setIsPlaying(false);
          setIsHalftime(true);
          setHasProcessedHalftime(true);
          playWhistleSound();
          return 45;
        }

        // 90 minutes full-time or extra-time resolution
        if (nextMin >= 90) {
          const isKnockout = isWorldCupMatch
            ? (targetFixture?.worldCupMatch?.stage && targetFixture.worldCupMatch.stage !== 'GRUPO')
            : (targetFixture?.isCup && !targetFixture.roundOrMatchday?.startsWith('Fase de Liga'));

          // If knockout and scores level at 90', launch Rock-Paper-Scissors Shootout (BLOQUE 10)
          if (isKnockout && currentHomeScore === currentAwayScore && homeClub && awayClub && !shootoutScores) {
            setIsPlaying(false);
            setIsShootoutActive(true);
            return 90;
          }

          setIsPlaying(false);
          setIsFinished(true);
          playWhistleSound();

          const isUserHome = matchToPlay?.homeTeamId === (isWorldCupMatch ? userNationId : userClub.id);
          const userScore = isUserHome ? currentHomeScore : currentAwayScore;
          const rivalScore = isUserHome ? currentAwayScore : currentHomeScore;

          if (userScore >= rivalScore) {
            confetti({
              particleCount: 85,
              spread: 75,
              origin: { y: 0.6 },
            });
          }
          return 90;
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, isFinished, simResult, speedMultiplier, activeMode, homeClub?.id, awayClub?.id, matchToPlay?.homeTeamId, userClub.id, hasProcessedHalftime, currentHomeScore, currentAwayScore, isWorldCupMatch, targetFixture, userNationId, shootoutScores]);

  const handleResumeSecondHalf = () => {
    playWhistleSound();
    setIsHalftime(false);
    setIsPlaying(true);
    setTacticalFeedbackMsg('¡Comienza la segunda mitad tras las instrucciones tácticas en el vestuario!');
    setTimeout(() => setTacticalFeedbackMsg(''), 4000);
  };

  if (!isOpen || !matchToPlay || !homeClub || !awayClub || !simResult) {
    return null;
  }

  // Instant finish trigger
  const handleInstantFinish = () => {
    playClickSound();
    setCurrentMinute(90);
    setCurrentHomeScore(simResult.homeScore);
    setCurrentAwayScore(simResult.awayScore);
    setVisibleEvents(simResult.events);
    setIsPlaying(false);

    const isKnockout = isWorldCupMatch
      ? (targetFixture?.worldCupMatch?.stage && targetFixture.worldCupMatch.stage !== 'GRUPO')
      : (targetFixture?.isCup && !targetFixture.roundOrMatchday?.startsWith('Fase de Liga'));

    if (isKnockout && simResult.homeScore === simResult.awayScore && homeClub && awayClub && !shootoutScores) {
      setIsShootoutActive(true);
      return;
    }

    setIsFinished(true);
    playWhistleSound();
  };

  const handleFinishShootout = (hScore: number, aScore: number, winner: 'home' | 'away') => {
    setShootoutScores({ home: hScore, away: aScore, winner });
    setIsShootoutActive(false);
    setIsPlaying(false);
    setIsFinished(true);
    playWhistleSound();
    confetti({ particleCount: 95, spread: 80, origin: { y: 0.6 } });
  };

  // Tactical in-match adjustments
  const handleApplyMentality = (newMentality: Club['tacticMentality']) => {
    playClickSound();
    setLiveMentality(newMentality);
    setTacticalFeedbackMsg(`Mentalidad ajustada a: ${newMentality}`);
    setTimeout(() => setTacticalFeedbackMsg(''), 2500);
  };

  const handleApplyFormation = (newFormation: string) => {
    playClickSound();
    setLiveFormation(newFormation);
    setTacticalFeedbackMsg(`Esquema reajustado a: ${newFormation}`);
    setTimeout(() => setTacticalFeedbackMsg(''), 2500);
  };

  const handleApplyPressing = (newPressing: 'Baja' | 'Media' | 'Alta' | 'Asfixiante') => {
    playClickSound();
    setLivePressing(newPressing);
    setTacticalFeedbackMsg(`Línea de presión modificada a: ${newPressing}`);
    setTimeout(() => setTacticalFeedbackMsg(''), 2500);
  };

  // Perform Live Substitution (Up to 5 subs)
  const handleExecuteSubstitution = () => {
    if (!selectedSubOffId || !selectedSubOnId) return;
    if (subsCount >= 5) {
      alert('Has agotado el límite de 5 sustituciones reglamentarias.');
      return;
    }

    playClickSound();
    const offPlayer = gameSave.players[selectedSubOffId];
    const onPlayer = gameSave.players[selectedSubOnId];

    if (!offPlayer || !onPlayer) return;

    // Swap starter and bench lists
    const nextStarters = currentStartersIds.map((id) => (id === selectedSubOffId ? selectedSubOnId : id));
    const nextBench = currentBenchIds.filter((id) => id !== selectedSubOnId);

    setCurrentStartersIds(nextStarters);
    setCurrentBenchIds(nextBench);
    setSubsCount((c) => c + 1);

    // Add in-match substitution event
    const subEvent: MatchEvent = {
      minute: currentMinute,
      type: 'SUSTITUCION',
      teamId: userClub.id,
      playerId: onPlayer.id,
      subOffPlayerId: offPlayer.id,
      description: `Sustitución en ${userClub.shortName}: entra ${onPlayer.lastName} en lugar de ${offPlayer.lastName}.`,
    };

    setVisibleEvents((prev) => [...prev, subEvent]);
    setShowSubModal(false);
    setSelectedSubOffId('');
    setSelectedSubOnId('');
    setTacticalFeedbackMsg(`Cambio realizado (${subsCount + 1}/5): Entra ${onPlayer.lastName}`);
    setTimeout(() => setTacticalFeedbackMsg(''), 3000);
  };

  // Commit result and return to dashboard
  const handleCommitMatchAndReturn = () => {
    playClickSound();
    if (!simResult) return;

    const updatedMatch: Match = {
      ...simResult.match,
      played: true,
      homeScore: currentHomeScore,
      awayScore: currentAwayScore,
      events: visibleEvents,
      stats: simResult.stats,
    };

    const isUserHomeMatch = matchToPlay
      ? matchToPlay.homeTeamId === (isWorldCupMatch ? userNationId : userClub.id)
      : false;

    let updatedUserClub: Club = {
      ...userClub,
      tacticFormation: liveFormation,
      tacticMentality: liveMentality,
      startingElevenIds: currentStartersIds,
      benchPlayerIds: currentBenchIds,
    };

    // Calculate matchday gate & catering revenues if user played at home (and not a neutral World Cup match)
    if (isUserHomeMatch && awayClub && !isWorldCupMatch) {
      const { attendance, gateRevenue, cateringRevenue } = calculateMatchdayGate(updatedUserClub, awayClub, false);
      const totalMatchRevenue = gateRevenue + cateringRevenue;
      const ledgerEntry: FinancialLedgerEntry = {
        id: `ledg_gate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: gameSave.currentDate,
        category: 'taquilla',
        description: `Taquilla (${attendance.toLocaleString()} espectadores) y catering Jornada vs ${awayClub.name}`,
        amount: totalMatchRevenue,
      };

      updatedUserClub = {
        ...updatedUserClub,
        finances: {
          ...updatedUserClub.finances,
          balance: updatedUserClub.finances.balance + totalMatchRevenue,
          recentLedger: [ledgerEntry, ...updatedUserClub.finances.recentLedger].slice(0, 35),
        },
      };
    }

    const finalSimResult: SimulatedMatchResult = {
      ...simResult,
      match: {
        ...updatedMatch,
        homePenalties: shootoutScores ? shootoutScores.home : undefined,
        awayPenalties: shootoutScores ? shootoutScores.away : undefined,
      },
      homeScore: currentHomeScore,
      awayScore: currentAwayScore,
      events: visibleEvents,
    };

    const updatedSave: GameSave = {
      ...gameSave,
      players: effectivePlayersMap,
      clubs: isWorldCupMatch
        ? gameSave.clubs
        : {
            ...gameSave.clubs,
            [userClub.id]: updatedUserClub,
          },
    };

    onMatchFinished(updatedSave, finalSimResult);
  };

  const isUserHome = matchToPlay ? matchToPlay.homeTeamId === (isWorldCupMatch ? userNationId : userClub.id) : false;

  if (!matchToPlay || !homeClub || !awayClub) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
        <div className="pcf-panel rounded-2xl p-6 text-center max-w-md w-full space-y-4">
          <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-lg font-black text-white font-condensed uppercase">Sin Partido Pendiente</h3>
          <p className="text-xs text-slate-300">No hay ningún encuentro pendiente programado para la fecha actual.</p>
          <button onClick={onClose} className="pcf-btn pcf-btn-emerald w-full py-2 text-xs font-bold uppercase">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // PRE-MATCH BRIEFING SCREEN (User Request: Pantalla previa con info, equipos, escudos, campo, alineación y noticias)
  if (matchPhase === 'prepartido') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-1 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[98dvh] sm:h-auto sm:max-h-[92vh]">
          {/* Pre-Match Header */}
          <div className="bg-slate-950 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span className="font-condensed font-black text-xs sm:text-sm tracking-wide text-white uppercase truncate">
                {targetFixture ? targetFixture.competitionName : competition.name} — {targetFixture ? targetFixture.roundOrMatchday : `Jornada ${matchToPlay.matchday}`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono-num flex items-center gap-1 bg-slate-900 px-2 sm:px-3 py-1 rounded-lg border border-slate-800">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" /> {matchToPlay.date}
              </span>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded transition-colors" title="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-6">
            {/* Special Champions League Grand Final Ceremony Banner */}
            {(targetFixture?.competitionId === 'uefa_champions' || targetFixture?.competitionName?.toLowerCase().includes('champions')) &&
              (targetFixture?.roundOrMatchday === 'Gran Final' || targetFixture?.roundOrMatchday?.toLowerCase().includes('final')) && (
                <div className="bg-gradient-to-r from-blue-950 via-[#0a1840] to-blue-950 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 text-center shadow-[0_0_35px_rgba(251,191,36,0.4)] relative overflow-hidden space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-amber-300 fill-current animate-pulse" />
                    <span className="text-xs sm:text-sm font-black font-condensed tracking-widest uppercase text-amber-300">
                      GRAN FINAL OFICIAL DE LA UEFA CHAMPIONS LEAGUE
                    </span>
                    <Star className="w-4 h-4 text-amber-300 fill-current animate-pulse" />
                  </div>
                  <div className="text-base sm:text-2xl font-black font-condensed uppercase tracking-wider text-white">
                    {homeClub.name} VS {awayClub.name}
                  </div>
                  <p className="text-xs sm:text-sm text-sky-200 font-condensed">
                    🏆 Sede Neutral Oficial: {targetFixture?.cupMatch?.neutralVenue || 'Allianz Arena, Múnich'} · Trofeo en disputa: La Orejona (Copa de Europa)
                  </p>
                </div>
              )}

            {/* Visual Matchup Card */}
            <div className="pcf-panel rounded-xl sm:rounded-2xl p-3 sm:p-6 relative overflow-hidden shadow-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 items-center">
                {/* Home Club */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center text-left md:text-right gap-2.5">
                  <div className="flex items-center md:flex-col md:items-end gap-2.5">
                    <div
                      className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-2xl font-condensed shadow-xl shrink-0"
                      style={{
                        backgroundColor: homeClub.primaryColor || '#1e293b',
                        color: homeClub.textColor || '#ffffff',
                        border: `2px solid ${homeClub.secondaryColor || '#475569'}`,
                      }}
                    >
                      {homeClub.code}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-xl font-black text-white font-condensed uppercase tracking-wider">{homeClub.name}</h3>
                      <div className="text-[11px] sm:text-xs text-slate-300 font-condensed">
                        Míster: <span className="text-amber-400 font-bold">{homeClub.coachName || 'Entrenador'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 uppercase font-condensed shrink-0">
                    {isUserHome ? '★ Tu Equipo' : 'Local'} · {homeClub.tacticFormation}
                  </span>
                </div>

                {/* VS Centerpiece Stadium Info */}
                <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2 py-2 border-y md:border-y-0 md:border-x border-slate-800 px-2 sm:px-4 bg-slate-950/40 md:bg-transparent rounded-xl md:rounded-none">
                  <span className="text-base sm:text-2xl font-black text-amber-400 font-condensed tracking-widest uppercase">VS</span>
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="text-[11px] sm:text-xs font-black text-slate-200 font-condensed flex items-center justify-center gap-1.5 truncate">
                      <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{homeClub.stadium?.name || 'Estadio Municipal'}</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono-num">
                      Aforo: {homeClub.stadium?.capacity?.toLocaleString() || '15.000'} esp.
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-emerald-400 font-condensed">
                      Césped: {homeClub.stadium?.condition || 95}% · Clima: Despejado, 20°C
                    </div>
                  </div>
                </div>

                {/* Away Club */}
                <div className="flex items-center md:flex-col md:items-start justify-between md:justify-center text-left gap-2.5">
                  <div className="flex items-center md:flex-col md:items-start gap-2.5">
                    <div
                      className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-2xl font-condensed shadow-xl shrink-0"
                      style={{
                        backgroundColor: awayClub.primaryColor || '#1e293b',
                        color: awayClub.textColor || '#ffffff',
                        border: `2px solid ${awayClub.secondaryColor || '#475569'}`,
                      }}
                    >
                      {awayClub.code}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-xl font-black text-white font-condensed uppercase tracking-wider">{awayClub.name}</h3>
                      <div className="text-[11px] sm:text-xs text-slate-300 font-condensed">
                        Míster: <span className="text-amber-400 font-bold">{awayClub.coachName || 'Entrenador Rival'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40 uppercase font-condensed shrink-0">
                    {!isUserHome ? '★ Tu Equipo' : 'Visitante'} · {awayClub.tacticFormation}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Lineup Switcher */}
            <div className="md:hidden flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPrematchLineupTab('home')}
                className={`flex-1 py-1.5 text-xs font-bold font-condensed uppercase rounded-lg transition-all ${
                  prematchLineupTab === 'home'
                    ? 'bg-emerald-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏠 {homeClub.shortName} (Local)
              </button>
              <button
                onClick={() => setPrematchLineupTab('away')}
                className={`flex-1 py-1.5 text-xs font-bold font-condensed uppercase rounded-lg transition-all ${
                  prematchLineupTab === 'away'
                    ? 'bg-sky-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✈️ {awayClub.shortName} (Visitante)
              </button>
            </div>

            {/* Starting 11 Lineup Preview (Side by Side on desktop, toggled on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Home XI */}
              <div className={`pcf-panel rounded-xl p-3 sm:p-4 space-y-2.5 ${prematchLineupTab === 'away' ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-slate-200 uppercase font-condensed truncate">
                    Alineación {homeClub.shortName} ({homeClub.tacticFormation})
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                    Once Titular
                  </span>
                </div>
                <div className="space-y-1">
                  {(homeClub.startingElevenIds || []).slice(0, 11).map((pid, idx) => {
                    const pl = gameSave.players[pid];
                    if (!pl) return null;
                    return (
                      <div key={`h_${pid}_${idx}`} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 text-center font-mono-num text-[11px] text-slate-400 font-bold shrink-0">{pl.squadNumber || idx + 1}</span>
                          <span className="text-slate-200 font-semibold truncate">{pl.firstName[0]}. {pl.lastName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded font-condensed">{pl.primaryPosition}</span>
                          <span className="text-xs font-mono-num font-black text-emerald-400">{pl.overallRating}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Away XI */}
              <div className={`pcf-panel rounded-xl p-3 sm:p-4 space-y-2.5 ${prematchLineupTab === 'home' ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-slate-200 uppercase font-condensed truncate">
                    Alineación {awayClub.shortName} ({awayClub.tacticFormation})
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                    Once Titular
                  </span>
                </div>
                <div className="space-y-1">
                  {(awayClub.startingElevenIds || []).slice(0, 11).map((pid, idx) => {
                    const pl = gameSave.players[pid];
                    if (!pl) return null;
                    return (
                      <div key={`a_${pid}_${idx}`} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 text-center font-mono-num text-[11px] text-slate-400 font-bold shrink-0">{pl.squadNumber || idx + 1}</span>
                          <span className="text-slate-200 font-semibold truncate">{pl.firstName[0]}. {pl.lastName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded font-condensed">{pl.primaryPosition}</span>
                          <span className="text-xs font-mono-num font-black text-emerald-400">{pl.overallRating}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dossier Completo Pre-Partido (BLOQUE 12) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 font-sans text-xs">
              {/* Box 1: Situación en Liga & Árbitro Oficial */}
              <div className="pcf-panel rounded-xl p-3 sm:p-4 space-y-2 border-l-4 border-sky-400 bg-slate-900/80">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-black text-sky-400 uppercase font-condensed tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>Situación Deportiva & Colegiado</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-num font-bold">
                    {competition.name}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Puesto en tabla:</span>
                    <span>
                      <strong className="text-emerald-400">{homeClub.shortName}: {homeRank ? `${homeRank}º (${homeStanding?.points || 0} pts)` : 'Fase Copa'}</strong>
                      {' · '}
                      <strong className="text-sky-400">{awayClub.shortName}: {awayRank ? `${awayRank}º (${awayStanding?.points || 0} pts)` : 'Fase Copa'}</strong>
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Árbitro Oficial:</span>
                    <strong className="text-slate-200">{designatedReferee.name}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Criterio Arbitral:</span>
                    <span className="text-amber-300 font-semibold">{designatedReferee.level} ({designatedReferee.desc})</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Bajas por Lesión y Sanción */}
              <div className="pcf-panel rounded-xl p-3 sm:p-4 space-y-2 border-l-4 border-rose-400 bg-slate-900/80">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-black text-rose-400 uppercase font-condensed tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Parte Médico & Sanciones</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-num font-bold">
                    Bajas Confirmadas
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className="text-slate-400">{homeClub.shortName}:</span>
                    <span className={homeInjured.length > 0 ? 'text-rose-300 font-bold' : 'text-emerald-400'}>
                      {homeInjured.length > 0
                        ? homeInjured.slice(0, 2).map((p) => `${p.lastName} (${p.isInjured ? 'Lesión' : 'Sanción'})`).join(', ')
                        : 'Sin bajas confirmadas'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">{awayClub.shortName}:</span>
                    <span className={awayInjured.length > 0 ? 'text-rose-300 font-bold' : 'text-emerald-400'}>
                      {awayInjured.length > 0
                        ? awayInjured.slice(0, 2).map((p) => `${p.lastName} (${p.isInjured ? 'Lesión' : 'Sanción'})`).join(', ')
                        : 'Sin bajas confirmadas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informe Táctico del 2º Entrenador */}
            <div className="pcf-panel rounded-xl p-3 sm:p-4 space-y-1.5 border-l-4 border-amber-400 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 font-condensed uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Informe Táctico del Segundo Entrenador</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white font-condensed">
                Análisis de {awayClub.name} ({awayClub.tacticFormation} · Mentalidad {awayClub.tacticMentality})
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans">
                "El rival busca protagonismo mediante transiciones verticales con su esquema {awayClub.tacticFormation}. Para contrarrestar su empuje, debemos mantener el bloque ordenado, cerrar las líneas de pase interior y aprovechar el factor campo en {homeClub.stadium?.commercialName || homeClub.stadium?.name} con posesión paciente y cambios de orientación a las bandas."
              </p>
            </div>
          </div>

          {/* Bottom Pre-match Controls and Saltar al Campo */}
          <div className="bg-slate-950 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <span className="hidden sm:inline text-[10px] font-black uppercase text-slate-400 px-2 font-condensed">Modo:</span>
              {[
                { id: 'rapido', label: '⚡ Rápido' },
                { id: 'texto', label: '📜 Minuto' },
                { id: 'tactico', label: '🎮 2D Táctico' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    playClickSound();
                    setActiveMode(m.id as MatchSimulationMode);
                  }}
                  className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 text-xs font-bold font-condensed uppercase tracking-wider rounded-lg transition-all ${
                    activeMode === m.id
                      ? 'bg-emerald-600 text-white shadow font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none pcf-btn pcf-btn-gold py-2.5 sm:py-2 px-3 sm:px-4 text-xs font-bold uppercase font-condensed tracking-wider"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setIsChapasMatchActive(true);
                }}
                className="flex-[2] sm:flex-none pcf-btn px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 border border-yellow-300 transition-all font-condensed"
              >
                <Gamepad2 className="w-4 h-4 shrink-0" />
                <span>JUGAR AHORA (FÚTBOL CHAPAS)</span>
              </button>
              <button
                onClick={handleStartKickoff}
                className="flex-[2] sm:flex-none pcf-btn pcf-btn-emerald px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] animate-pulse"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>SIMULAR PARTIDO</span>
              </button>
            </div>
          </div>
        </div>

        {/* IN-CAREER CHAPAS MATCH MODAL */}
        {isChapasMatchActive && homeClub && awayClub && (
          <ChapasMatchModal
            isOpen={isChapasMatchActive}
            homeTeam={buildChapasTeamConfig(homeClub)}
            awayTeam={buildChapasTeamConfig(awayClub)}
            userSide={isUserHome ? 'home' : 'away'}
            aiDifficulty="normal"
            halfDurationMinutes={2.5}
            competitionName={competition.name}
            onMatchFinished={handleChapasFinished}
            onClose={() => setIsChapasMatchActive(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-1 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[98dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Top Header & Simulation Mode Selector */}
        <div className="bg-slate-950 px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate max-w-[180px] xs:max-w-[220px] sm:max-w-none">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <span className="font-condensed font-bold text-xs sm:text-sm tracking-wide text-slate-100 uppercase truncate">
              {competition.name} — J.{matchToPlay.matchday}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 sm:p-1 rounded-xl border border-slate-800">
            {[
              { id: 'rapido', label: '⚡ Rápido' },
              { id: 'texto', label: '📜 Minuto' },
              { id: 'tactico', label: '🎮 2D Táctico' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  playClickSound();
                  setActiveMode(m.id as MatchSimulationMode);
                  if (m.id === 'rapido') {
                    handleInstantFinish();
                  }
                }}
                className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold font-condensed uppercase tracking-wider rounded-lg transition-all ${
                  activeMode === m.id
                    ? 'bg-emerald-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-num shrink-0">
            <span className="hidden sm:flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" /> 19°C
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big PC Fútbol Scoreboard Banner */}
        <div className="bg-gradient-to-b from-[#182848] via-[#101b33] to-[#0a1120] px-2 sm:px-6 py-2 sm:py-3.5 border-b-2 border-slate-700/80 relative overflow-hidden shadow-2xl shrink-0">
          <div className="flex items-center justify-between gap-1 sm:gap-4">
            {/* Home Club */}
            <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3 text-right overflow-hidden">
              <div className="truncate flex-1">
                <h2 className="text-xs sm:text-xl md:text-2xl font-black text-slate-100 font-condensed uppercase tracking-wider drop-shadow truncate max-w-[85px] xs:max-w-[130px] sm:max-w-none">
                  {homeClub.shortName || homeClub.name}
                </h2>
                <span className="text-[9px] sm:text-xs text-sky-400 block font-semibold truncate">
                  {isUserHome ? '★ Tu Equipo' : 'Local'}
                </span>
                {/* Home Goalscorers */}
                {homeGoals.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-[10px] sm:text-xs font-condensed">
                    {homeGoals.map((g, i) => (
                      <span key={`hg_${i}`} className="text-amber-300 font-semibold flex items-center gap-0.5 drop-shadow truncate max-w-[140px] sm:max-w-none">
                        <span>⚽</span>
                        <span className="font-bold text-white truncate">{getScorerDisplayName(g.playerId)}</span>
                        <span className="text-amber-400 font-mono-num font-black shrink-0">{g.minute}'{g.type === 'GOL_PENALTI' ? '(pen.)' : ''}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-xl font-condensed shadow-lg shrink-0"
                style={{
                  backgroundColor: homeClub.primaryColor,
                  color: homeClub.textColor,
                  border: `2px solid ${homeClub.secondaryColor || '#475569'}`,
                }}
              >
                {homeClub.code}
              </div>
            </div>

            {/* Central Score & Clock */}
            <div className="px-1.5 sm:px-6 flex flex-col items-center shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-3 text-2xl sm:text-4xl md:text-5xl font-black font-mono-num text-slate-100 tracking-tight bg-slate-950/80 px-2.5 sm:px-6 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border border-slate-700 shadow-inner">
                <span className="text-emerald-400">{currentHomeScore}</span>
                <span className="text-slate-600 text-lg sm:text-3xl">-</span>
                <span className="text-emerald-400">{currentAwayScore}</span>
              </div>

              <div className="mt-1 flex items-center gap-1">
                <span className={`text-[10px] sm:text-xs font-mono-num font-bold px-2 sm:px-3 py-0.5 rounded-full border ${
                  isFinished
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-950 text-rose-400 border-rose-700 animate-pulse'
                }`}>
                  {isFinished ? 'FINAL' : `${currentMinute}'`}
                </span>
                {shootoutScores && (
                  <span className="text-[10px] font-black font-condensed bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded mt-0.5">
                    (Penaltis: {shootoutScores.home} - {shootoutScores.away})
                  </span>
                )}
              </div>

              {/* Expected Goals (xG) */}
              <div className="mt-0.5 flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[11px] font-mono-num text-slate-400">
                <span>xG {simResult.stats.xgHome}</span>
                <span className="text-slate-600">·</span>
                <span>xG {simResult.stats.xgAway}</span>
              </div>
            </div>

            {/* Away Club */}
            <div className="flex-1 flex items-center justify-start gap-1.5 sm:gap-3 text-left overflow-hidden">
              <div
                className="w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-xl font-condensed shadow-lg shrink-0"
                style={{
                  backgroundColor: awayClub.primaryColor,
                  color: awayClub.textColor,
                  border: `2px solid ${awayClub.secondaryColor || '#475569'}`,
                }}
              >
                {awayClub.code}
              </div>
              <div className="truncate flex-1">
                <h2 className="text-xs sm:text-xl md:text-2xl font-black text-slate-100 font-condensed uppercase tracking-wider drop-shadow truncate max-w-[85px] xs:max-w-[130px] sm:max-w-none">
                  {awayClub.shortName || awayClub.name}
                </h2>
                <span className="text-[9px] sm:text-xs text-sky-400 block font-semibold truncate">
                  {!isUserHome ? '★ Tu Equipo' : 'Visitante'}
                </span>
                {/* Away Goalscorers */}
                {awayGoals.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center justify-start gap-x-1.5 gap-y-0.5 text-[10px] sm:text-xs font-condensed">
                    {awayGoals.map((g, i) => (
                      <span key={`ag_${i}`} className="text-amber-300 font-semibold flex items-center gap-0.5 drop-shadow truncate max-w-[140px] sm:max-w-none">
                        <span>⚽</span>
                        <span className="font-bold text-white truncate">{getScorerDisplayName(g.playerId)}</span>
                        <span className="text-amber-400 font-mono-num font-black shrink-0">{g.minute}'{g.type === 'GOL_PENALTI' ? '(pen.)' : ''}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated Goleadores Summary Strip when goals are scored */}
          {(homeGoals.length > 0 || awayGoals.length > 0) && (
            <div className="w-full max-w-2xl mx-auto mt-2.5 px-3 py-1.5 bg-black/60 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex-1 flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5 text-[10px] sm:text-xs font-condensed text-right">
                {homeGoals.map((g, i) => (
                  <span key={`strip_h_${i}`} className="text-amber-300 font-semibold flex items-center gap-1">
                    <span>⚽</span>
                    <span className="font-bold text-white">{getScorerDisplayName(g.playerId)}</span>
                    <span className="text-amber-400 font-mono-num font-bold">{g.minute}'{g.type === 'GOL_PENALTI' ? '(pen.)' : ''}</span>
                  </span>
                ))}
                {homeGoals.length === 0 && <span className="text-slate-500 text-[10px] italic">-</span>}
              </div>

              <div className="shrink-0 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 text-[9px] uppercase tracking-wider font-black font-condensed flex items-center gap-1">
                <span>⚽</span>
                <span>GOLEADORES</span>
              </div>

              <div className="flex-1 flex flex-wrap items-center justify-start gap-x-2 gap-y-0.5 text-[10px] sm:text-xs font-condensed text-left">
                {awayGoals.map((g, i) => (
                  <span key={`strip_a_${i}`} className="text-amber-300 font-semibold flex items-center gap-1">
                    <span>⚽</span>
                    <span className="font-bold text-white">{getScorerDisplayName(g.playerId)}</span>
                    <span className="text-amber-400 font-mono-num font-bold">{g.minute}'{g.type === 'GOL_PENALTI' ? '(pen.)' : ''}</span>
                  </span>
                ))}
                {awayGoals.length === 0 && <span className="text-slate-500 text-[10px] italic">-</span>}
              </div>
            </div>
          )}

          {/* PC Fútbol 3D Possession Bar (Matches Image 1 reference) */}
          <div className="w-full max-w-xl mx-auto mt-2 sm:mt-3 px-2 sm:px-4">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono-num font-bold text-slate-300 mb-1 px-1">
              <span className="text-sky-300 font-black">
                {simResult.stats.possessionHome} %
              </span>
              <span className="text-[9px] sm:text-[10px] font-condensed uppercase tracking-widest text-slate-200 bg-slate-900/90 px-2 sm:px-3 py-0.5 rounded-full border border-slate-600 shadow">
                POSESIÓN
              </span>
              <span className="text-emerald-300 font-black">
                {simResult.stats.possessionAway} %
              </span>
            </div>
            <div className="w-full h-2.5 sm:h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-600 flex p-0.5 shadow-inner">
              <div 
                className="h-full rounded-l-full transition-all duration-500 bg-sky-500" 
                style={{ width: `${simResult.stats.possessionHome}%` }} 
              />
              <div 
                className="h-full rounded-r-full transition-all duration-500 bg-emerald-500" 
                style={{ width: `${simResult.stats.possessionAway}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Speed Controls for Live & Text Modes */}
        {!isFinished && activeMode !== 'rapido' && (
          <div className="bg-slate-950/80 px-3 sm:px-6 py-1.5 sm:py-2 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 sm:px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pausar' : 'Jugar'}</span>
              </button>

              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      playClickSound();
                      setSpeedMultiplier(s);
                    }}
                    className={`px-1.5 sm:px-2 py-0.5 rounded font-bold text-xs ${
                      speedMultiplier === s
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleInstantFinish}
              className="px-2.5 sm:px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Simular al 90'</span>
              <span className="xs:hidden">Al 90'</span>
            </button>
          </div>
        )}

        {/* Mobile Navigation Segment Controller (allows 1-tap switching on phones) */}
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-2 py-1.5 flex items-center justify-around gap-1 shrink-0">
          <button
            onClick={() => setActiveMobileSection('campo')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-condensed uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              activeMobileSection === 'campo'
                ? 'bg-emerald-600 text-white shadow font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚽</span>
            <span>Campo 2D</span>
          </button>
          {activeMode === 'tactico' && (
            <button
              onClick={() => setActiveMobileSection('tactica')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-condensed uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                activeMobileSection === 'tactica'
                  ? 'bg-amber-600 text-white shadow font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🎮</span>
              <span>Táctica ({5 - subsCount})</span>
            </button>
          )}
          <button
            onClick={() => setActiveMobileSection('stats')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-condensed uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              activeMobileSection === 'stats'
                ? 'bg-sky-600 text-white shadow font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📊</span>
            <span>Estadísticas</span>
          </button>
        </div>

        {/* Feedback Alert Pill */}
        {tacticalFeedbackMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-600/40 text-emerald-300 text-xs py-1 px-3 sm:px-6 font-semibold flex items-center gap-2 animate-pulse shrink-0">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{tacticalFeedbackMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 overflow-y-auto">
          {/* Left Column: 2D Pitch Simulator or Timeline */}
          <div
            className={`space-y-3 ${
              activeMobileSection === 'tactica' ? 'hidden lg:block' : 'block'
            } ${activeMode === 'tactico' ? 'lg:col-span-7' : 'lg:col-span-8'}`}
          >
            {/* View Switcher Header (Visible in Campo section or Desktop) */}
            <div
              className={`${
                activeMobileSection === 'stats' ? 'hidden lg:flex' : 'flex'
              } items-center justify-between bg-slate-950/80 p-1 rounded-xl border border-slate-800`}
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playClickSound();
                    setMatchView('campo2d');
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black font-condensed uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    matchView === 'campo2d'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden xs:inline">Visor 2D Interactivo</span>
                  <span className="xs:hidden">2D Campo</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setMatchView('narracion');
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black font-condensed uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    matchView === 'narracion'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Narración en Vivo</span>
                  <span className="xs:hidden">Narración</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pr-2">
                <span className="text-[10px] font-mono-num font-black text-amber-300 uppercase">
                  {currentMinute === 45 && isHalftime ? '☕ DESCANSO' : `${currentMinute}' / 90'`}
                </span>
              </div>
            </div>

            {/* Pitch & Commentary Container (hidden on mobile when Stats section is active) */}
            <div className={activeMobileSection === 'stats' ? 'hidden lg:block' : 'block'}>
              {matchView === 'campo2d' ? (
                /* Enhanced 2D Football Pitch (PC Fútbol simulation) */
                <div className="relative w-full h-[230px] xs:h-[270px] sm:h-[340px] md:h-[360px] rounded-2xl overflow-hidden border-2 border-emerald-600/80 shadow-2xl pcf-grass flex flex-col justify-between p-1.5 sm:p-2 select-none">
                  {/* Field Markings */}
                  <div className="absolute inset-1.5 sm:inset-2 border-2 border-white/60 pointer-events-none rounded">
                    {/* Center line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/60 -translate-x-1/2" />
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-24 sm:h-24 border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
                    </div>
                    {/* Left Area (Home) */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-28 sm:w-24 sm:h-40 border-r-2 border-y-2 border-white/60 flex items-center justify-center">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-14 sm:w-10 sm:h-20 border-r-2 border-y-2 border-white/60" />
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full translate-x-2 sm:translate-x-4" />
                    </div>
                    {/* Left Goal */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-10 sm:w-2.5 sm:h-14 border-y-2 border-l-2 border-white/80 bg-white/20" />
                    {/* Right Area (Away) */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-28 sm:w-24 sm:h-40 border-l-2 border-y-2 border-white/60 flex items-center justify-center">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-14 sm:w-10 sm:h-20 border-l-2 border-y-2 border-white/60" />
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full -translate-x-2 sm:-translate-x-4" />
                    </div>
                    {/* Right Goal */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-10 sm:w-2.5 sm:h-14 border-y-2 border-r-2 border-white/80 bg-white/20" />
                  </div>

                  {/* Home Players */}
                  {HOME_2D_SLOTS.map((slot, i) => {
                    const starter = currentStartersIds[i] ? gameSave.players[currentStartersIds[i]] : null;
                    return (
                      <div
                        key={`h_${i}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-700 z-10"
                        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                      >
                        <div
                          className="w-4 h-4 xs:w-5 xs:h-5 rounded-full flex items-center justify-center text-[8px] xs:text-[9px] font-black text-white shadow-lg border border-white"
                          style={{ backgroundColor: homeClub?.primaryColor || '#dc2626' }}
                        >
                          {starter?.squadNumber || slot.pos}
                        </div>
                        <span className="text-[7px] xs:text-[8px] font-black font-condensed text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] uppercase truncate max-w-[38px] xs:max-w-[50px]">
                          {starter ? starter.lastName : slot.pos}
                        </span>
                      </div>
                    );
                  })}

                  {/* Away Players */}
                  {AWAY_2D_SLOTS.map((slot, i) => {
                    return (
                      <div
                        key={`a_${i}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-700 z-10"
                        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                      >
                        <div
                          className="w-4 h-4 xs:w-5 xs:h-5 rounded-full flex items-center justify-center text-[8px] xs:text-[9px] font-black text-slate-950 shadow-lg border border-slate-900"
                          style={{ backgroundColor: awayClub?.primaryColor || '#facc15' }}
                        >
                          {slot.pos}
                        </div>
                        <span className="text-[7px] xs:text-[8px] font-black font-condensed text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] uppercase truncate max-w-[38px] xs:max-w-[50px]">
                          {slot.pos}
                        </span>
                      </div>
                    );
                  })}

                  {/* Animated Football ⚽ */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-20 pointer-events-none"
                    style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="text-xs sm:text-base drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">⚽</span>
                      <div className="absolute -inset-1 rounded-full bg-white/40 animate-ping" />
                    </div>
                  </div>

                  {/* Live Match Action Ticker */}
                  <div className="relative z-30 bg-black/85 px-2 sm:px-3 py-1 rounded-lg border border-slate-700/80 flex items-center justify-between text-[10px] sm:text-[11px] font-condensed">
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-slate-300 font-bold truncate">
                        {visibleEvents.length > 0
                          ? visibleEvents[visibleEvents.length - 1].description
                          : 'Balón en juego. Ambos equipos disputan la posesión en el centro del campo.'}
                      </span>
                    </div>
                    <span className="text-amber-300 font-black font-mono-num ml-1.5 shrink-0">
                      {currentMinute}'
                    </span>
                  </div>
                </div>
              ) : (
                /* Commentary Log */
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col h-[280px] sm:h-[360px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 sm:mb-3">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide font-condensed flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Narración en Directo
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono-num text-slate-400">
                      {visibleEvents.length} eventos
                    </span>
                  </div>

                  {/* Scrollable event list */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1">
                    {visibleEvents.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                        Esperando las primeras ocasiones del encuentro...
                      </div>
                    ) : (
                      [...visibleEvents].reverse().map((ev, idx) => {
                        const isGoal = ev.type === 'GOL' || ev.type === 'GOL_PENALTI';
                        const isRed = ev.type === 'TARJETA_ROJA';
                        const isYellow = ev.type === 'TARJETA_AMARILLA';
                        const isInjury = ev.type === 'LESION';
                        const isSub = ev.type === 'SUSTITUCION';

                        return (
                          <div
                            key={idx}
                            className={`p-2 sm:p-2.5 rounded-xl border text-xs flex items-start gap-2 transition-all ${
                              isGoal
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 shadow-sm'
                                : isRed
                                ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                                : isYellow
                                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                                : isInjury
                                ? 'bg-orange-950/40 border-orange-500/40 text-orange-200'
                                : isSub
                                ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-bold text-slate-200 shrink-0 font-mono-num px-1 sm:px-1.5 py-0.5 rounded bg-slate-950 text-[10px] sm:text-xs">
                              {ev.minute}'
                            </span>
                            <div className="font-sans flex-1 text-[11px] sm:text-xs">
                              <strong className="block text-slate-100 font-bold mb-0.5">
                                {isGoal
                                  ? '⚽ ¡GOOOL!'
                                  : isRed
                                  ? '🟥 EXPULSIÓN'
                                  : isYellow
                                  ? '🟨 AMONESTACIÓN'
                                  : isInjury
                                  ? '🚑 LESIÓN / ASISTENCIA'
                                  : '🔄 CAMBIO TÁCTICO'}
                              </strong>
                              <span>{ev.description}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Goleadores del Partido Card */}
            <div
              className={`${
                activeMobileSection === 'campo' ? 'hidden lg:block' : 'block'
              } bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-xl`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide font-condensed flex items-center gap-1.5">
                  <span className="text-base">⚽</span>
                  Goleadores del Partido
                </span>
                <span className="text-[10px] font-mono-num font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {homeGoals.length + awayGoals.length} {homeGoals.length + awayGoals.length === 1 ? 'gol' : 'goles'}
                </span>
              </div>

              {homeGoals.length === 0 && awayGoals.length === 0 ? (
                <div className="py-2.5 text-center text-slate-500 text-xs italic font-condensed">
                  Sin goles anotados hasta el momento ({currentHomeScore} - {currentAwayScore})
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 text-xs font-condensed">
                  {/* Home scorers column */}
                  <div className="space-y-1.5 text-right">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider block truncate">
                      {homeClub.shortName || homeClub.name}
                    </span>
                    {homeGoals.length > 0 ? (
                      homeGoals.map((g, i) => (
                        <div
                          key={`col_hg_${i}`}
                          className="bg-slate-900/90 hover:bg-slate-850 px-2 py-1.5 rounded-lg border border-slate-800 flex items-center justify-end gap-1.5 shadow-sm"
                        >
                          <span className="text-white font-bold truncate text-[11px] sm:text-xs">
                            {getScorerDisplayName(g.playerId)}
                          </span>
                          <span className="text-amber-400 font-mono-num font-black shrink-0 text-[10px] sm:text-[11px]">
                            {g.minute}'{g.type === 'GOL_PENALTI' ? '(pen.)' : ''}
                          </span>
                          <span className="text-xs shrink-0">⚽</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-600 text-xs italic block pt-1">-</span>
                    )}
                  </div>

                  {/* Away scorers column */}
                  <div className="space-y-1.5 text-left border-l border-slate-800/80 pl-2.5">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider block truncate">
                      {awayClub.shortName || awayClub.name}
                    </span>
                    {awayGoals.length > 0 ? (
                      awayGoals.map((g, i) => (
                        <div
                          key={`col_ag_${i}`}
                          className="bg-slate-900/90 hover:bg-slate-850 px-2 py-1.5 rounded-lg border border-slate-800 flex items-center justify-start gap-1.5 shadow-sm"
                        >
                          <span className="text-xs shrink-0">⚽</span>
                          <span className="text-white font-bold truncate text-[11px] sm:text-xs">
                            {getScorerDisplayName(g.playerId)}
                          </span>
                          <span className="text-amber-400 font-mono-num font-black shrink-0 text-[10px] sm:text-[11px]">
                            {g.minute}'{g.type === 'GOL_PENALTI' ? '(pen.)' : ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-600 text-xs italic block pt-1">-</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Statistics Comparative Bars */}
            <div
              className={`${
                activeMobileSection === 'campo' ? 'hidden lg:block' : 'block'
              } bg-slate-950/60 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-2.5 sm:space-y-3`}
            >
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide font-condensed block">
                Estadísticas Reales del Partido
              </span>

              {/* Stats rows */}
              {[
                { label: 'Posesión', home: `${simResult.stats.possessionHome}%`, away: `${simResult.stats.possessionAway}%`, homeVal: simResult.stats.possessionHome, awayVal: simResult.stats.possessionAway },
                { label: 'Goles Esperados (xG)', home: simResult.stats.xgHome, away: simResult.stats.xgAway, homeVal: simResult.stats.xgHome * 10, awayVal: simResult.stats.xgAway * 10 },
                { label: 'Remates Totales', home: simResult.stats.shotsHome, away: simResult.stats.shotsAway, homeVal: simResult.stats.shotsHome, awayVal: simResult.stats.shotsAway },
                { label: 'Remates a Puerta', home: simResult.stats.shotsOnTargetHome, away: simResult.stats.shotsOnTargetAway, homeVal: simResult.stats.shotsOnTargetHome, awayVal: simResult.stats.shotsOnTargetAway },
                { label: 'Pases Completados', home: simResult.stats.passesHome || 410, away: simResult.stats.passesAway || 390, homeVal: simResult.stats.passesHome || 410, awayVal: simResult.stats.passesAway || 390 },
                { label: 'Faltas Cometidas', home: simResult.stats.foulsHome, away: simResult.stats.foulsAway, homeVal: simResult.stats.foulsHome, awayVal: simResult.stats.foulsAway },
                { label: 'Córners', home: simResult.stats.cornersHome, away: simResult.stats.cornersAway, homeVal: simResult.stats.cornersHome, awayVal: simResult.stats.cornersAway },
              ].map((row, idx) => (
                <div key={idx} className="space-y-1 text-xs font-mono-num">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-slate-200">{row.home}</span>
                    <span className="font-sans uppercase text-[10px] text-slate-400">{row.label}</span>
                    <span className="font-bold text-slate-200">{row.away}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                    <div
                      style={{ width: `${(Number(row.homeVal) / (Number(row.homeVal) + Number(row.awayVal) || 1)) * 100}%` }}
                      className="bg-emerald-500 h-full"
                    />
                    <div
                      style={{ width: `${(Number(row.awayVal) / (Number(row.homeVal) + Number(row.awayVal) || 1)) * 100}%` }}
                      className="bg-sky-500 h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: In-Game Tactical Directives (Mode 3) or Lineups / Recaudación */}
          <div
            className={`space-y-3 sm:space-y-4 ${
              activeMobileSection !== 'tactica' ? 'hidden lg:block' : 'block'
            } ${activeMode === 'tactico' ? 'lg:col-span-5' : 'lg:col-span-4'}`}
          >
            {activeMode === 'tactico' ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wide font-condensed flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Banquillo & Decisiones Tácticas
                  </span>
                  <span className="text-[10px] font-mono-num text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                    {5 - subsCount} Cambios Disp.
                  </span>
                </div>

                {/* Tactical Mentality Slider / Selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Mentalidad en Vivo
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(['Muy Defensiva', 'Defensiva', 'Equilibrada', 'Ofensiva', 'Al Ataque'] as Club['tacticMentality'][]).map((ment) => (
                      <button
                        key={ment}
                        disabled={isFinished}
                        onClick={() => handleApplyMentality(ment)}
                        className={`p-2 sm:p-1.5 rounded-lg border font-semibold text-center transition-all ${
                          liveMentality === ment
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {ment}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formation in Live */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Variar Esquema Táctico
                  </label>
                  <select
                    disabled={isFinished}
                    value={liveFormation}
                    onChange={(e) => handleApplyFormation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 px-3 py-2 sm:py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    {Object.keys(FORMATIONS).map((f) => (
                      <option key={f} value={f}>
                        {f} ({FORMATIONS[f].name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pressing Intensity */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Presión de Equipo
                  </label>
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 sm:gap-1 text-xs">
                    {(['Baja', 'Media', 'Alta', 'Asfixiante'] as const).map((pr) => (
                      <button
                        key={pr}
                        disabled={isFinished}
                        onClick={() => handleApplyPressing(pr)}
                        className={`p-2 sm:p-1.5 rounded-lg border text-center font-semibold ${
                          livePressing === pr
                            ? 'bg-amber-600 text-white border-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Substitutions Trigger */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    disabled={isFinished || subsCount >= 5}
                    onClick={() => setShowSubModal(true)}
                    className="w-full py-2.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Realizar Sustitución ({subsCount}/5 realizadas)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wide font-condensed block border-b border-slate-800 pb-2">
                  Once Inicial de {userClub.name}
                </span>
                <div className="space-y-1.5 max-h-[300px] sm:max-h-[360px] overflow-y-auto">
                  {currentStartersIds.map((pid, idx) => {
                    const p = gameSave.players[pid];
                    if (!p) return null;
                    return (
                      <div key={`u_${pid}_${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-emerald-400 w-7 shrink-0">{p.primaryPosition}</span>
                          <span className="font-semibold text-slate-200 truncate">{p.firstName} {p.lastName}</span>
                        </div>
                        <span className="font-mono-num font-bold text-slate-400 shrink-0">{p.overallRating} OVR</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stadium Revenue Box */}
            {isUserHome && simResult.ticketRevenue > 0 && (
              <div className="p-2.5 sm:p-3 bg-emerald-950/40 rounded-2xl border border-emerald-800/40 text-xs flex justify-between items-center font-mono-num">
                <span className="text-slate-400">Recaudación Taquilla:</span>
                <strong className="text-emerald-400 font-bold">+{simResult.ticketRevenue.toLocaleString()} €</strong>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Live In-Game Substitution Selector */}
        {showSubModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 p-2 sm:p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-condensed uppercase tracking-wider flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sustitución en Directo (Minuto {currentMinute}')</span>
                </h3>
                <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub Off: Starter to leave */}
              <div>
                <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  1. Jugador que se retira (Sale del campo):
                </label>
                <select
                  value={selectedSubOffId}
                  onChange={(e) => setSelectedSubOffId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecciona al jugador a sustituir...</option>
                  {currentStartersIds.map((id) => {
                    const p = gameSave.players[id];
                    if (!p) return null;
                    return (
                      <option key={id} value={id}>
                        [{p.primaryPosition}] {p.firstName} {p.lastName} — {p.overallRating} OVR ({p.fitness}% forma)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Sub On: Bench player to enter */}
              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  2. Jugador que ingresa (Entra del banquillo):
                </label>
                <select
                  value={selectedSubOnId}
                  onChange={(e) => setSelectedSubOnId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecciona al suplente que entra...</option>
                  {currentBenchIds.map((id) => {
                    const p = gameSave.players[id];
                    if (!p) return null;
                    return (
                      <option key={id} value={id}>
                        [{p.primaryPosition}] {p.firstName} {p.lastName} — {p.overallRating} OVR ({p.fitness}% forma)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex flex-col-reverse xs:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowSubModal(false)}
                  className="w-full xs:w-auto px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg text-center"
                >
                  Cancelar
                </button>
                <button
                  disabled={!selectedSubOffId || !selectedSubOnId}
                  onClick={handleExecuteSubstitution}
                  className="w-full xs:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors disabled:opacity-50 text-center shadow"
                >
                  Confirmar Cambio Táctico
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Halftime Dialogue (User request: Cambios en el descanso) */}
        {isHalftime && !isFinished && (
          <div className="fixed inset-0 z-70 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fadeIn">
            <div className="pcf-panel w-full max-w-lg shadow-2xl p-4 sm:p-6 rounded-2xl border-2 border-amber-500/80 space-y-3 sm:space-y-4 max-h-[92dvh] overflow-y-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-700/80 pb-2 sm:pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">☕</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-amber-400 font-condensed uppercase tracking-wider">
                      Descanso (Minuto 45')
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-300 font-condensed">
                      Ajustes tácticos, sustituciones y charla de vestuario
                    </p>
                  </div>
                </div>
                <div className="text-base sm:text-lg font-black font-mono-num text-white bg-black/60 px-2.5 sm:px-3 py-1 rounded-lg border border-slate-700">
                  {currentHomeScore} - {currentAwayScore}
                </div>
              </div>

              {/* Halftime Goalscorers Summary */}
              <div className="p-2 sm:p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-[10px] font-black uppercase text-amber-400 font-condensed tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span>⚽</span>
                  <span>Goleadores de la Primera Parte (1'-45')</span>
                </div>
                {homeGoals.length === 0 && awayGoals.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-condensed italic">Primera parte sin goles en el marcador.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs font-condensed">
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                        {homeClub.shortName || homeClub.name}
                      </span>
                      {homeGoals.map((g, i) => (
                        <div key={`ht_h_${i}`} className="text-amber-300 font-semibold flex items-center justify-end gap-1">
                          <span className="truncate">{getScorerDisplayName(g.playerId)}</span>
                          <span className="text-amber-400 font-mono-num font-bold">{g.minute}'{g.type === 'GOL_PENALTI' ? '(p.)' : ''}</span>
                          <span>⚽</span>
                        </div>
                      ))}
                      {homeGoals.length === 0 && <span className="text-slate-500 text-[10px] italic block">-</span>}
                    </div>
                    <div className="space-y-1 text-left border-l border-slate-800 pl-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                        {awayClub.shortName || awayClub.name}
                      </span>
                      {awayGoals.map((g, i) => (
                        <div key={`ht_a_${i}`} className="text-amber-300 font-semibold flex items-center justify-start gap-1">
                          <span>⚽</span>
                          <span className="truncate">{getScorerDisplayName(g.playerId)}</span>
                          <span className="text-amber-400 font-mono-num font-bold">{g.minute}'{g.type === 'GOL_PENALTI' ? '(p.)' : ''}</span>
                        </div>
                      ))}
                      {awayGoals.length === 0 && <span className="text-slate-500 text-[10px] italic block">-</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Charla de Vestuario */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-300 font-condensed block">
                  Charla de Vestuario:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'Exigir mayor intensidad y presión en campo rival',
                    'Felicitar por el orden defensivo y mantener la calma',
                    'Adelantar las líneas para buscar el gol de la victoria',
                  ].map((talk) => (
                    <button
                      key={talk}
                      onClick={() => setHalftimeTalk(talk)}
                      className={`p-2 rounded-xl text-xs font-condensed font-bold text-left border transition-all cursor-pointer ${
                        halftimeTalk === talk
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      🗣️ "{talk}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Substitution Button in Halftime */}
              <div className="p-2.5 sm:p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-white font-condensed uppercase block">
                    Sustituciones en el Descanso
                  </span>
                  <span className="text-[10px] text-slate-400 font-condensed">
                    ({subsCount}/5 cambios realizados)
                  </span>
                </div>
                <button
                  disabled={subsCount >= 5}
                  onClick={() => setShowSubModal(true)}
                  className="pcf-btn pcf-btn-gold px-3 sm:px-3.5 py-1.5 text-xs font-black rounded-lg uppercase font-condensed flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Hacer Cambios</span>
                </button>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={handleResumeSecondHalf}
                  className="w-full sm:w-auto pcf-btn pcf-btn-emerald px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Comenzar Segunda Parte (46'-90')</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Footer Actions (PC Fútbol style matching 450_1000_4436412f.png) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-3 sm:px-6 py-2.5 sm:py-3 border-t-2 border-slate-700/80 flex flex-col xs:flex-row items-center justify-between gap-2.5 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between w-full xs:w-auto gap-2 sm:gap-4">
            <span className="text-xs text-slate-300 font-condensed uppercase tracking-wider">
              {isFinished ? 'Encuentro concluido' : `En juego: ${currentMinute}' / 90'`}
            </span>
            {isFinished && featuredMvpPlayer && (
              <div className="flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-lg border border-slate-700 shadow-md">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-amber-400/60 flex items-center justify-center text-[9px]">
                  ⚽
                </div>
                <div className="text-right xs:text-left">
                  <div className="text-[8px] font-black tracking-widest text-slate-400 uppercase font-condensed">MVP</div>
                  <div className="text-[11px] font-bold text-amber-300 font-condensed truncate max-w-[120px] xs:max-w-none">
                    {featuredMvpPlayer.name}
                  </div>
                </div>
              </div>
            )}
            {isFinished && (homeGoals.length > 0 || awayGoals.length > 0) && (
              <div className="hidden sm:flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-condensed max-w-xs md:max-w-md overflow-hidden">
                <span className="text-amber-400 font-black shrink-0">⚽ Goles:</span>
                <div className="truncate text-slate-300 flex items-center gap-1.5">
                  {[...homeGoals, ...awayGoals].map((g, idx) => (
                    <span key={`ft_g_${idx}`} className="text-amber-200 shrink-0 font-medium">
                      {getScorerDisplayName(g.playerId)} <span className="text-amber-400 font-bold">{g.minute}'{g.type === 'GOL_PENALTI' ? '(p.)' : ''}</span>
                      {idx < homeGoals.length + awayGoals.length - 1 && <span className="text-slate-600 ml-1.5">·</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full xs:w-auto flex items-center justify-end">
            {isFinished ? (
              <button
                onClick={handleCommitMatchAndReturn}
                className="w-full xs:w-auto pcf-btn pcf-btn-emerald px-6 py-2 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-xl uppercase font-condensed tracking-wider hover:scale-[1.02]"
                title="Continuar y guardar resultados de todas las ligas"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399]" />
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="font-black text-sm">SEGUIR</span>
              </button>
            ) : (
              <button
                onClick={handleInstantFinish}
                className="w-full xs:w-auto pcf-btn px-4 py-2 text-xs font-bold text-slate-200 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span>Saltar al Pitido Final</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Rock-Paper-Scissors Penalty Shootout Modal (BLOQUE 10) */}
        {isShootoutActive && homeClub && awayClub && (
          <PenaltyShootoutModal
            isOpen={isShootoutActive}
            homeTeamName={homeClub.name}
            awayTeamName={awayClub.name}
            homeColor={homeClub.primaryColor || '#dc2626'}
            awayColor={awayClub.primaryColor || '#2563eb'}
            isUserHome={isUserHome}
            homeShooters={homeShooters}
            awayShooters={awayShooters}
            homeGoalkeeper={homeGoalkeeper}
            awayGoalkeeper={awayGoalkeeper}
            onFinishShootout={handleFinishShootout}
          />
        )}
      </div>
    </div>
  );
};
