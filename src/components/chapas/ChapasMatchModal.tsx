import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  ChapaBody, 
  ChapaBall, 
  ChapaPlayer, 
  ChapasFormation, 
  ChapasPitchConfig, 
  DEFAULT_PITCH_CONFIG, 
  createChapaSquad, 
  createInitialBall, 
  createTrainingCones,
  TrainingCone,
  stepPhysics, 
  calculateImpulse, 
  aiPickMove, 
  AiDifficulty, 
  chapasAudio, 
  resolveKitClash,
  MAX_DRAG_DISTANCE 
} from '../../engine/chapasPhysicsEngine';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Trophy, 
  ChevronRight, 
  X, 
  Sparkles, 
  Flag,
  ArrowRightLeft,
  FastForward,
  Shirt,
  UserCheck,
  Target,
  RotateCcw
} from 'lucide-react';
import { PenaltyShootoutModal } from '../modals/PenaltyShootoutModal';

export interface ChapasMatchTeamConfig {
  id: string;
  name: string;
  shortName: string;
  badge?: string;
  primaryColor: string;
  secondaryColor?: string;
  textColor: string;
  formation?: ChapasFormation;
  players: ChapaPlayer[];
  substitutes?: ChapaPlayer[];
}

export interface ChapasMatchFinishedPayload {
  homeScore: number;
  awayScore: number;
  scorers: { playerId: string; playerName: string; teamId: string; minute: number }[];
  homeStats: { shots: number; fouls: number; possessionTurns: number };
  awayStats: { shots: number; fouls: number; possessionTurns: number };
  homePenalties?: number;
  awayPenalties?: number;
  winnerSide?: 'home' | 'away';
}

interface ChapasMatchModalProps {
  isOpen: boolean;
  homeTeam: ChapasMatchTeamConfig;
  awayTeam: ChapasMatchTeamConfig;
  userSide?: 'home' | 'away' | 'both';
  aiDifficulty?: AiDifficulty;
  halfDurationMinutes?: number; // default 2.5 min (2:30 real seconds per half)
  isKnockout?: boolean;
  competitionName?: string;
  isTrainingMode?: boolean; // Dedicated free training mode with obstacle cones
  onMatchFinished: (result: ChapasMatchFinishedPayload) => void;
  onClose: () => void;
}

export const ChapasMatchModal: React.FC<ChapasMatchModalProps> = ({
  isOpen,
  homeTeam,
  awayTeam,
  userSide = 'home',
  aiDifficulty = 'normal',
  halfDurationMinutes = 2.5, // 2:30 reales por tiempo
  competitionName = 'Partido de Chapas',
  isKnockout = false,
  isTrainingMode = false,
  onMatchFinished,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Kit clash detection and resolution (away team changes kit if color clashes with home)
  const kitInfo = useMemo(() => {
    return resolveKitClash(
      homeTeam.primaryColor,
      awayTeam.primaryColor,
      awayTeam.secondaryColor || '#ffffff'
    );
  }, [homeTeam.primaryColor, awayTeam.primaryColor, awayTeam.secondaryColor]);

  // Match State
  const [matchPhase, setMatchPhase] = useState<'playing' | 'halftime' | 'fulltime'>('playing');
  const [currentHalf, setCurrentHalf] = useState<1 | 2>(1);
  const [matchClockSec, setMatchClockSec] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scores and Scorers
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [scorers, setScorers] = useState<{ playerId: string; playerName: string; teamId: string; minute: number }[]>([]);
  const [lastScorerBanner, setLastScorerBanner] = useState<{ text: string; sub: string } | null>(null);

  // Turns & AI State
  const [currentTurn, setCurrentTurn] = useState<'home' | 'away'>('home');
  const [isPhysicsMoving, setIsPhysicsMoving] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const aiTurnInProgressRef = useRef<boolean>(false);

  // Initialization & goal debouncing refs
  const hasInitializedRef = useRef<boolean>(false);
  const goalProcessedRef = useRef<boolean>(false);
  const lastGoalTimestampRef = useRef<number>(0);
  const motionStartTimeRef = useRef<number>(0);

  // Stats
  const [homeStats, setHomeStats] = useState({ shots: 0, fouls: 0, possessionTurns: 0 });
  const [awayStats, setAwayStats] = useState({ shots: 0, fouls: 0, possessionTurns: 0 });

  // Substitutions
  const [homeSubs, setHomeSubs] = useState<ChapaPlayer[]>([]);
  const [awaySubs, setAwaySubs] = useState<ChapaPlayer[]>([]);
  const [subsCount, setSubsCount] = useState<{ home: number; away: number }>({ home: 0, away: 0 });
  const [isSubsModalOpen, setIsSubsModalOpen] = useState<boolean>(false);
  const [selectedFieldCapId, setSelectedFieldCapId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [subBanner, setSubBanner] = useState<string | null>(null);
  const [lineupVersion, setLineupVersion] = useState<number>(0);

  // Rock-Paper-Scissors Penalty Shootout state
  const [isShootoutOpen, setIsShootoutOpen] = useState<boolean>(false);
  const [shootoutResult, setShootoutResult] = useState<{
    home: number;
    away: number;
    winner: 'home' | 'away';
  } | null>(null);

  // Physics Bodies Ref
  const config = DEFAULT_PITCH_CONFIG;
  const capsRef = useRef<ChapaBody[]>([]);
  const ballRef = useRef<ChapaBall>(createInitialBall(config));
  const conesRef = useRef<TrainingCone[]>([]);
  const lastTouchPlayerRef = useRef<{ cap: ChapaBody; team: 'home' | 'away' } | null>(null);

  // Persistent active squads (preserves substitutions across kickoffs and halftimes)
  const activeHomePlayersRef = useRef<ChapaPlayer[]>([...homeTeam.players]);
  const activeAwayPlayersRef = useRef<ChapaPlayer[]>([...awayTeam.players]);

  // Interactive Drag-to-Aim State
  const selectedCapRef = useRef<ChapaBody | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [currentPowerRatio, setCurrentPowerRatio] = useState<number>(0);

  // Total seconds per half (2:30 = 150 seconds real time)
  const halfSeconds = Math.round(halfDurationMinutes * 60);
  const currentMinute = Math.min(
    90,
    currentHalf === 1
      ? Math.max(1, Math.round((matchClockSec / halfSeconds) * 45))
      : 45 + Math.max(1, Math.round((matchClockSec / halfSeconds) * 45))
  );

  // Sound sync
  useEffect(() => {
    chapasAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Setup / Reset Squad Positions
  const resetFieldPositions = useCallback((teamToKickoff: 'home' | 'away' = 'home') => {
    const isHomeKickoff = teamToKickoff === 'home';
    const homeCaps = createChapaSquad(
      'home',
      activeHomePlayersRef.current,
      homeTeam.primaryColor,
      homeTeam.secondaryColor || '#facc15',
      homeTeam.textColor,
      homeTeam.formation || '4-3-3',
      config,
      isHomeKickoff
    );

    if (isTrainingMode) {
      // In training mode: only spawn user's team and place training obstacle cones
      capsRef.current = homeCaps;
      conesRef.current = createTrainingCones(config);
    } else {
      const awayCaps = createChapaSquad(
        'away',
        activeAwayPlayersRef.current,
        kitInfo.awayColor,
        kitInfo.isClashing ? '#ffffff' : (awayTeam.secondaryColor || '#ffffff'),
        kitInfo.isClashing ? '#0f172a' : awayTeam.textColor,
        awayTeam.formation || '4-4-2',
        config,
        !isHomeKickoff
      );
      capsRef.current = [...homeCaps, ...awayCaps];
      conesRef.current = [];
    }

    ballRef.current = createInitialBall(config);
    lastTouchPlayerRef.current = null;
    selectedCapRef.current = null;
    dragStartRef.current = null;
    dragCurrentRef.current = null;
    isDraggingRef.current = false;
    goalProcessedRef.current = false;
    aiTurnInProgressRef.current = false;
    setAiThinking(false);
    setCurrentPowerRatio(0);
    setCurrentTurn(isTrainingMode ? 'home' : teamToKickoff);
    setIsPhysicsMoving(false);
  }, [homeTeam, awayTeam, kitInfo, config, isTrainingMode]);


  // Initialize on open (strictly once per modal session to prevent clock resets)
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setHomeScore(0);
      setAwayScore(0);
      setScorers([]);
      setMatchClockSec(0);
      setCurrentHalf(1);
      setMatchPhase('playing');
      setIsPaused(false);
      setLastScorerBanner(null);
      setHomeStats({ shots: 0, fouls: 0, possessionTurns: 0 });
      setAwayStats({ shots: 0, fouls: 0, possessionTurns: 0 });
      setSubsCount({ home: 0, away: 0 });

      // Initialize bench substitutes
      const defaultSubs = (prefix: string, teamName: string): ChapaPlayer[] => [
        { id: `${prefix}_sub_1`, name: `Sup. Defensor`, number: 12, position: 'DEF', isGoalkeeper: false, disparo: 72, fuerza: 75, precision: 74, tecnica: 71 },
        { id: `${prefix}_sub_2`, name: `Sup. Centrocampista`, number: 14, position: 'MED', isGoalkeeper: false, disparo: 76, fuerza: 73, precision: 79, tecnica: 78 },
        { id: `${prefix}_sub_3`, name: `Sup. Delantero`, number: 19, position: 'DEL', isGoalkeeper: false, disparo: 82, fuerza: 77, precision: 75, tecnica: 80 },
        { id: `${prefix}_sub_4`, name: `Sup. Revulsivo`, number: 22, position: 'DEL', isGoalkeeper: false, disparo: 80, fuerza: 74, precision: 76, tecnica: 81 },
        { id: `${prefix}_sub_5`, name: `Sup. Portero`, number: 13, position: 'POR', isGoalkeeper: true, disparo: 45, fuerza: 80, precision: 65, tecnica: 68 },
      ];

      setHomeSubs(homeTeam.substitutes && homeTeam.substitutes.length > 0 ? homeTeam.substitutes : defaultSubs('home', homeTeam.shortName));
      setAwaySubs(awayTeam.substitutes && awayTeam.substitutes.length > 0 ? awayTeam.substitutes : defaultSubs('away', awayTeam.shortName));

      resetFieldPositions('home');
      if (!isTrainingMode) {
        chapasAudio.playWhistle(false);
      }
    } else if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen, resetFieldPositions, homeTeam, awayTeam, isTrainingMode]);

  // Handle Goal Scored: Guaranteed 1 goal only per event with strict debounce
  const handleGoalScored = useCallback((scoringTeam: 'home' | 'away') => {
    const now = Date.now();
    if (now - lastGoalTimestampRef.current < 2500) return;
    lastGoalTimestampRef.current = now;
    goalProcessedRef.current = true;

    // Immediately stop ball and bodies
    ballRef.current.vx = 0;
    ballRef.current.vy = 0;
    capsRef.current.forEach((c) => { c.vx = 0; c.vy = 0; });
    setIsPhysicsMoving(false);

    chapasAudio.playGoalHorn();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const isHomeGoal = scoringTeam === 'home';
    const scorerCap = lastTouchPlayerRef.current?.cap;
    const scorerName = scorerCap ? scorerCap.player.name : (isHomeGoal ? 'Goleador Local' : 'Goleador Visitante');
    const scorerTeamId = isHomeGoal ? homeTeam.id : awayTeam.id;

    if (isHomeGoal) {
      setHomeScore((s) => s + 1);
    } else {
      setAwayScore((s) => s + 1);
    }

    const newScorerEntry = {
      playerId: scorerCap?.player?.id || `scorer_${Date.now()}`,
      playerName: scorerName,
      teamId: scorerTeamId,
      minute: isTrainingMode ? matchClockSec : currentMinute,
    };
    setScorers((prev) => [...prev, newScorerEntry]);

    setLastScorerBanner({
      text: isTrainingMode ? '¡¡GOLAZO EN ENTRENAMIENTO!!' : `¡¡GOOOOOL DE ${isHomeGoal ? homeTeam.shortName : awayTeam.shortName}!!`,
      sub: `${scorerName} ${isTrainingMode ? '🎯' : `(${currentMinute}')`}`,
    });

    // Reset after celebration (2.8 seconds)
    setTimeout(() => {
      setLastScorerBanner(null);
      if (isTrainingMode) {
        ballRef.current = createInitialBall(config);
        goalProcessedRef.current = false;
      } else {
        const nextKickoffTeam = scoringTeam === 'home' ? 'away' : 'home';
        resetFieldPositions(nextKickoffTeam);
        chapasAudio.playWhistle(true);
      }
    }, 2800);
  }, [currentMinute, matchClockSec, homeTeam, awayTeam, isTrainingMode, resetFieldPositions, config]);

  // Match Clock Loop (2:30 real seconds per half for competitive matches, session timer for training)
  useEffect(() => {
    if (!isOpen || isPaused || matchPhase !== 'playing') return;

    const timer = setInterval(() => {
      setMatchClockSec((prev) => {
        const next = prev + 1;
        if (!isTrainingMode && next >= halfSeconds) {
          if (currentHalf === 1) {
            chapasAudio.playWhistle(false);
            setMatchPhase('halftime');
            setIsPaused(true);
            return halfSeconds;
          } else {
            chapasAudio.playWhistle(false);
            setMatchPhase('fulltime');
            setIsPaused(true);
            return halfSeconds;
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, matchPhase, currentHalf, halfSeconds, isTrainingMode]);

  // AI Turn Execution: Reliable, robust, no cleanup cancellation, hard watchdog
  useEffect(() => {
    if (!isOpen || isPaused || matchPhase !== 'playing' || isPhysicsMoving || lastScorerBanner || isTrainingMode) return;

    const isAiTurn = (userSide === 'home' && currentTurn === 'away') || (userSide === 'away' && currentTurn === 'home');
    if (!isAiTurn) {
      aiTurnInProgressRef.current = false;
      setAiThinking(false);
      return;
    }

    if (aiTurnInProgressRef.current) return;
    aiTurnInProgressRef.current = true;
    setAiThinking(true);

    const delay = Math.floor(320 + Math.random() * 260);
    const timer = setTimeout(() => {
      try {
        const move = aiPickMove(currentTurn, capsRef.current, ballRef.current, aiDifficulty, config);
        const cap = capsRef.current.find((c) => c.id === move.capId) || capsRef.current.find((c) => c.team === currentTurn);

        if (cap) {
          chapasAudio.playKick(move.powerRatio);
          cap.vx = move.vx;
          cap.vy = move.vy;
          motionStartTimeRef.current = performance.now();
          setIsPhysicsMoving(true);

          if (currentTurn === 'home') {
            setHomeStats((st) => ({ ...st, possessionTurns: st.possessionTurns + 1, shots: st.shots + 1 }));
          } else {
            setAwayStats((st) => ({ ...st, possessionTurns: st.possessionTurns + 1, shots: st.shots + 1 }));
          }
        } else {
          // Safety: switch turn if no cap was found
          setCurrentTurn((prev) => (prev === 'home' ? 'away' : 'home'));
        }
      } catch (err) {
        console.error('Error executing AI shot:', err);
        setCurrentTurn((prev) => (prev === 'home' ? 'away' : 'home'));
      } finally {
        aiTurnInProgressRef.current = false;
        setAiThinking(false);
      }
    }, delay);

    // Watchdog fallback: if AI doesn't shoot within 1.8 seconds, release lock & switch turn
    const watchdog = setTimeout(() => {
      if (aiTurnInProgressRef.current) {
        aiTurnInProgressRef.current = false;
        setAiThinking(false);
        setCurrentTurn((prev) => (prev === 'home' ? 'away' : 'home'));
      }
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearTimeout(watchdog);
      aiTurnInProgressRef.current = false;
      setAiThinking(false);
    };
  }, [isOpen, isPaused, matchPhase, isPhysicsMoving, currentTurn, userSide, aiDifficulty, config, lastScorerBanner, isTrainingMode]);


  // Physics motion watchdog: automatically stops bodies after 4.2s to prevent indefinite motion
  useEffect(() => {
    if (!isPhysicsMoving) return;

    const watchdog = setTimeout(() => {
      capsRef.current.forEach((c) => { c.vx = 0; c.vy = 0; });
      ballRef.current.vx = 0;
      ballRef.current.vy = 0;
      setIsPhysicsMoving(false);
      if (!isTrainingMode) {
        setCurrentTurn((prev) => (prev === 'home' ? 'away' : 'home'));
      }
    }, 4200);

    return () => clearTimeout(watchdog);
  }, [isPhysicsMoving, isTrainingMode]);

  // -------------------------------------------------------------------------
  // SIMULATE REST OF MATCH (ALWAYS AVAILABLE)
  // -------------------------------------------------------------------------
  const handleSimulateRestOfMatch = () => {
    const currentMin = currentMinute;
    const remainingMins = Math.max(5, 90 - currentMin);

    const homeCaps = capsRef.current.filter((c) => c.team === 'home');
    const awayCaps = capsRef.current.filter((c) => c.team === 'away');

    const homeAvgShooting = homeCaps.reduce((acc, c) => acc + c.player.disparo, 0) / (homeCaps.length || 1);
    const awayAvgShooting = awayCaps.reduce((acc, c) => acc + c.player.disparo, 0) / (awayCaps.length || 1);

    const homePower = homeAvgShooting + 5;
    const awayPower = awayAvgShooting;

    let addHomeGoals = 0;
    let addAwayGoals = 0;
    const newScorers = [...scorers];

    // Simulate in intervals
    let simMin = currentMin + 4;
    while (simMin <= 90) {
      const probHome = 0.13 * (homePower / 75);
      const probAway = 0.12 * (awayPower / 75);

      if (Math.random() < probHome) {
        addHomeGoals++;
        const attackingHome = homeCaps.filter((c) => !c.isGoalkeeper);
        const scorer = attackingHome[Math.floor(Math.random() * attackingHome.length)]?.player;
        newScorers.push({
          playerId: scorer?.id || `scorer_${Date.now()}_${simMin}`,
          playerName: scorer?.name || 'Goleador Local',
          teamId: homeTeam.id,
          minute: Math.min(90, Math.round(simMin)),
        });
      }

      if (Math.random() < probAway) {
        addAwayGoals++;
        const attackingAway = awayCaps.filter((c) => !c.isGoalkeeper);
        const scorer = attackingAway[Math.floor(Math.random() * attackingAway.length)]?.player;
        newScorers.push({
          playerId: scorer?.id || `scorer_${Date.now()}_${simMin}`,
          playerName: scorer?.name || 'Goleador Visitante',
          teamId: awayTeam.id,
          minute: Math.min(90, Math.round(simMin)),
        });
      }

      simMin += 12;
    }

    setHomeScore((s) => s + addHomeGoals);
    setAwayScore((s) => s + addAwayGoals);
    setScorers(newScorers);
    setMatchClockSec(halfSeconds);
    setCurrentHalf(2);
    setMatchPhase('fulltime');
    setIsPaused(true);
    setIsPhysicsMoving(false);
    chapasAudio.playWhistle(false);
  };

  // -------------------------------------------------------------------------
  // SUBSTITUTIONS HANDLER
  // -------------------------------------------------------------------------
  const handlePerformSubstitution = () => {
    if (!selectedFieldCapId || !selectedSubId) return;

    const targetCap = capsRef.current.find((c) => c.id === selectedFieldCapId);
    if (!targetCap) return;

    const team = targetCap.team;
    if (subsCount[team] >= 5) return;

    const subsList = team === 'home' ? homeSubs : awaySubs;
    const incomingPlayer = subsList.find((s) => s.id === selectedSubId);
    if (!incomingPlayer) return;

    const outgoingPlayer = targetCap.player;

    // Swap cap player on field
    targetCap.player = {
      ...incomingPlayer,
      isGoalkeeper: targetCap.isGoalkeeper,
    };

    const baseMass = targetCap.isGoalkeeper ? 1.35 : 1.0;
    const strengthMultiplier = 0.90 + (incomingPlayer.fuerza / 100) * 0.25;
    targetCap.mass = Number((baseMass * strengthMultiplier).toFixed(2));

    // Update persistent active squad lists so resets don't revert substitutions
    if (team === 'home') {
      activeHomePlayersRef.current = activeHomePlayersRef.current.map((p) =>
        p.id === outgoingPlayer.id ? incomingPlayer : p
      );
      setHomeSubs((prev) => prev.filter((p) => p.id !== incomingPlayer.id));
    } else {
      activeAwayPlayersRef.current = activeAwayPlayersRef.current.map((p) =>
        p.id === outgoingPlayer.id ? incomingPlayer : p
      );
      setAwaySubs((prev) => prev.filter((p) => p.id !== incomingPlayer.id));
    }


    setSubsCount((prev) => ({ ...prev, [team]: prev[team] + 1 }));
    setSelectedFieldCapId(null);
    setSelectedSubId(null);
    setIsSubsModalOpen(false);
    setLineupVersion((v) => v + 1);

    chapasAudio.playWhistle(true);
    setSubBanner(
      `🔄 CAMBIO EN ${team === 'home' ? homeTeam.shortName : awayTeam.shortName}: Entra ${incomingPlayer.name} por ${outgoingPlayer.name}`
    );
    setTimeout(() => setSubBanner(null), 3500);
  };

  // -------------------------------------------------------------------------
  // MAIN ANIMATION & CANVAS RENDERING LOOP (60 FPS)
  // -------------------------------------------------------------------------
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(0.04, (time - lastTime) / 1000);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Step physics if bodies are in motion
      if (isPhysicsMoving) {
        const stepRes = stepPhysics(capsRef.current, ballRef.current, dt, config, conesRef.current);

        if (stepRes.postHit) {
          chapasAudio.playPostHit();
        }
        if (stepRes.coneHit) {
          chapasAudio.playConeHit();
        }
        if (stepRes.capCollision) {
          chapasAudio.playCapCollision();
        }

        // Detect touch on ball
        capsRef.current.forEach((cap) => {
          const dist = Math.hypot(cap.x - ballRef.current.x, cap.y - ballRef.current.y);
          if (dist < cap.radius + ballRef.current.radius + 3) {
            lastTouchPlayerRef.current = { cap, team: cap.team };
          }
        });

        // SINGLE GOAL DEBOUNCE: exactly 1 goal per crossing event
        if (stepRes.goalScoredTeam && !goalProcessedRef.current) {
          goalProcessedRef.current = true;
          ballRef.current.vx = 0;
          ballRef.current.vy = 0;
          handleGoalScored(stepRes.goalScoredTeam);
        }

        // Motion completed?
        if (!stepRes.hasMotion && !lastScorerBanner) {
          setIsPhysicsMoving(false);
          if (!isTrainingMode) {
            setCurrentTurn((prev) => (prev === 'home' ? 'away' : 'home'));
          }
        }
      }

      // ---------------------------------------------------------------------
      // DRAW PITCH (1050 x 680)
      // ---------------------------------------------------------------------
      const W = config.width;
      const H = config.height;

      ctx.clearRect(0, 0, W, H);

      // Pitch Grass (Lush vertical bands)
      const bandWidth = W / 14;
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b7a38' : '#1e873e';
        ctx.fillRect(i * bandWidth, 0, bandWidth, H);
      }

      // Outer Pitch Frame
      ctx.strokeStyle = '#125426';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, W, H);

      // Chalk Markings
      ctx.strokeStyle = '#ffffffcc';
      ctx.fillStyle = '#ffffffcc';
      ctx.lineWidth = 3.5;

      // Outer Pitch Lines
      ctx.strokeRect(4, 4, W - 8, H - 8);

      // Halfway Line
      ctx.beginPath();
      ctx.moveTo(W / 2, 4);
      ctx.lineTo(W / 2, H - 4);
      ctx.stroke();

      // Center Circle & Spot
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, config.centerCircleRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Penalty Areas
      const pTop = (H - config.penaltyAreaWidth) / 2;
      ctx.strokeRect(4, pTop, config.penaltyAreaDepth, config.penaltyAreaWidth);
      const gaWidth = 150;
      const gaDepth = 50;
      const gaTop = (H - gaWidth) / 2;
      ctx.strokeRect(4, gaTop, gaDepth, gaWidth);

      // Left Penalty Spot & Arc
      const penSpotDist = 95;
      ctx.beginPath();
      ctx.arc(penSpotDist, H / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(penSpotDist, H / 2, 50, -0.75, 0.75);
      ctx.stroke();

      // Right Penalty Area & Spot
      ctx.strokeRect(W - 4 - config.penaltyAreaDepth, pTop, config.penaltyAreaDepth, config.penaltyAreaWidth);
      ctx.strokeRect(W - 4 - gaDepth, gaTop, gaDepth, gaWidth);
      ctx.beginPath();
      ctx.arc(W - penSpotDist, H / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W - penSpotDist, H / 2, 50, Math.PI - 0.75, Math.PI + 0.75);
      ctx.stroke();

      // Corner Arcs
      const cornerR = 18;
      ctx.beginPath(); ctx.arc(4, 4, cornerR, 0, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(4, H - 4, cornerR, -Math.PI / 2, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(W - 4, 4, cornerR, Math.PI / 2, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(W - 4, H - 4, cornerR, Math.PI, -Math.PI / 2); ctx.stroke();

      // Goal Nets
      const gy0 = config.goalY0;
      const gy1 = config.goalY1;
      const gHeight = gy1 - gy0;
      const gd = config.goalDepth;

      // Left Net
      ctx.fillStyle = '#0a3014';
      ctx.fillRect(-gd, gy0, gd, gHeight);
      ctx.strokeStyle = '#ffffff66';
      ctx.lineWidth = 1;
      for (let y = gy0; y <= gy1; y += 12) {
        ctx.beginPath(); ctx.moveTo(-gd, y); ctx.lineTo(0, y); ctx.stroke();
      }
      for (let x = -gd; x <= 0; x += 10) {
        ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, gy1); ctx.stroke();
      }

      // Right Net
      ctx.fillStyle = '#0a3014';
      ctx.fillRect(W, gy0, gd, gHeight);
      for (let y = gy0; y <= gy1; y += 12) {
        ctx.beginPath(); ctx.moveTo(W, y); ctx.lineTo(W + gd, y); ctx.stroke();
      }
      for (let x = W; x <= W + gd; x += 10) {
        ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, gy1); ctx.stroke();
      }

      // Goal Posts
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      const postRadius = 6;
      [
        { x: 0, y: gy0 },
        { x: 0, y: gy1 },
        { x: W, y: gy0 },
        { x: W, y: gy1 },
      ].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, postRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // ---------------------------------------------------------------------
      // DRAW TRAINING CONES (OBSTACLES)
      // ---------------------------------------------------------------------
      if (isTrainingMode && conesRef.current.length > 0) {
        conesRef.current.forEach((cone) => {
          // Shadow
          ctx.beginPath();
          ctx.arc(cone.x + 2, cone.y + 3, cone.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fill();

          // Black rubber base
          ctx.beginPath();
          ctx.arc(cone.x, cone.y, cone.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bright fluorescent orange cone body
          ctx.beginPath();
          ctx.arc(cone.x, cone.y, cone.radius - 2.5, 0, Math.PI * 2);
          const coneGrad = ctx.createRadialGradient(cone.x - 3, cone.y - 3, 1, cone.x, cone.y, cone.radius);
          coneGrad.addColorStop(0, '#fdba74');
          coneGrad.addColorStop(0.5, cone.color || '#ea580c');
          coneGrad.addColorStop(1, '#9a3412');
          ctx.fillStyle = coneGrad;
          ctx.fill();

          // White reflective band
          ctx.beginPath();
          ctx.arc(cone.x, cone.y, cone.radius * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Tip
          ctx.beginPath();
          ctx.arc(cone.x, cone.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }

      // ---------------------------------------------------------------------
      // DRAW SHADOWS
      // ---------------------------------------------------------------------
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      capsRef.current.forEach((cap) => {
        ctx.beginPath();
        ctx.arc(cap.x + 3, cap.y + 4, cap.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.beginPath();
      ctx.arc(ballRef.current.x + 2.5, ballRef.current.y + 3.5, ballRef.current.radius, 0, Math.PI * 2);
      ctx.fill();

      // ---------------------------------------------------------------------
      // DRAW CAPS (3D BOTTLE CAP STYLING)
      // ---------------------------------------------------------------------
      const isUserTurn =
        isTrainingMode ||
        userSide === 'both' ||
        (userSide === 'home' && currentTurn === 'home') ||
        (userSide === 'away' && currentTurn === 'away');

      capsRef.current.forEach((cap) => {
        const isSelected = selectedCapRef.current?.id === cap.id;
        const isCurrentTeam = isTrainingMode || cap.team === currentTurn;

        // Visual indicator on ALL 11 caps of the active team
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(cap.x, cap.y, cap.radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3.5;
          ctx.stroke();
        } else if (isCurrentTeam && isUserTurn && !isPhysicsMoving && !aiThinking) {
          // Distinct glowing ring showing that ALL 11 user caps are 100% active and selectable
          ctx.beginPath();
          ctx.arc(cap.x, cap.y, cap.radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Cap Outer Metallic Ridge
        ctx.beginPath();
        ctx.arc(cap.x, cap.y, cap.radius, 0, Math.PI * 2);
        const rimGrad = ctx.createLinearGradient(cap.x - cap.radius, cap.y - cap.radius, cap.x + cap.radius, cap.y + cap.radius);
        rimGrad.addColorStop(0, '#e2e8f0');
        rimGrad.addColorStop(0.5, '#64748b');
        rimGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = rimGrad;
        ctx.fill();

        // Inner Colored Cap Face
        ctx.beginPath();
        ctx.arc(cap.x, cap.y, cap.radius - 2.5, 0, Math.PI * 2);
        const baseGrad = ctx.createRadialGradient(cap.x - 4, cap.y - 4, 2, cap.x, cap.y, cap.radius);
        baseGrad.addColorStop(0, '#ffffff55');
        baseGrad.addColorStop(0.3, cap.color);
        baseGrad.addColorStop(1, '#00000088');
        ctx.fillStyle = baseGrad;
        ctx.fill();

        // Secondary Ring / Collar
        ctx.beginPath();
        ctx.arc(cap.x, cap.y, cap.radius - 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = cap.secondaryColor || '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Goalkeeper icon or player number
        ctx.fillStyle = cap.textColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (cap.isGoalkeeper) {
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('🧤', cap.x, cap.y);
        } else {
          ctx.font = 'bold 12px "Barlow Condensed", "Arial Black", sans-serif';
          ctx.fillText(String(cap.player.number), cap.x, cap.y + 0.5);
        }

        // Name tag under cap
        ctx.font = '9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffffcc';
        const displayName = cap.player.name.split(' ').slice(-1)[0].substring(0, 9);
        ctx.fillText(displayName, cap.x, cap.y + cap.radius + 9);
      });

      // ---------------------------------------------------------------------
      // DRAW BALL
      // ---------------------------------------------------------------------
      const ball = ballRef.current;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      const ballGrad = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, ball.radius);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.7, '#f1f5f9');
      ballGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // ---------------------------------------------------------------------
      // DRAW AIMING GUIDE & TRAJECTORY ARROW (WHILE DRAGGING)
      // ---------------------------------------------------------------------
      if (selectedCapRef.current && dragStartRef.current && dragCurrentRef.current) {
        const cap = selectedCapRef.current;
        const cur = dragCurrentRef.current;
        const start = dragStartRef.current;

        const pullDx = start.x - cur.x;
        const pullDy = start.y - cur.y;
        const dist = Math.hypot(pullDx, pullDy);

        if (dist > 5) {
          const power = Math.min(1.0, dist / MAX_DRAG_DISTANCE);
          const angle = Math.atan2(pullDy, pullDx);

          // 1. Pull line (tension string)
          ctx.beginPath();
          ctx.moveTo(cap.x, cap.y);
          ctx.lineTo(cur.x, cur.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // 2. Trajectory forecast arrow (pointing forward)
          const aimLength = 50 + power * 170;
          const aimEndX = cap.x + Math.cos(angle) * aimLength;
          const aimEndY = cap.y + Math.sin(angle) * aimLength;

          ctx.beginPath();
          ctx.moveTo(cap.x, cap.y);
          ctx.lineTo(aimEndX, aimEndY);
          ctx.setLineDash([5, 5]);

          const aimGrad = ctx.createLinearGradient(cap.x, cap.y, aimEndX, aimEndY);
          if (power < 0.45) {
            aimGrad.addColorStop(0, '#10b981');
            aimGrad.addColorStop(1, '#facc15');
          } else {
            aimGrad.addColorStop(0, '#facc15');
            aimGrad.addColorStop(1, '#ef4444');
          }
          ctx.strokeStyle = aimGrad;
          ctx.lineWidth = 3.5 + power * 2.5;
          ctx.stroke();
          ctx.setLineDash([]);

          // 3. Arrow Head
          const arrowAngle = 0.42;
          const arrowHeadLen = 14;
          ctx.beginPath();
          ctx.moveTo(aimEndX, aimEndY);
          ctx.lineTo(
            aimEndX - arrowHeadLen * Math.cos(angle - arrowAngle),
            aimEndY - arrowHeadLen * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(aimEndX, aimEndY);
          ctx.lineTo(
            aimEndX - arrowHeadLen * Math.cos(angle + arrowAngle),
            aimEndY - arrowHeadLen * Math.sin(angle + arrowAngle)
          );
          ctx.strokeStyle = power > 0.7 ? '#ef4444' : '#facc15';
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [config, isPhysicsMoving, currentTurn, aiThinking, lastScorerBanner, userSide, handleGoalScored]);

  // -------------------------------------------------------------------------
  // MOUSE & TOUCH INPUT HANDLERS (SEAMLESS DRAG & BROAD HITBOX)
  // -------------------------------------------------------------------------
  const getCanvasCoords = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = config.width / rect.width;
    const scaleY = config.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [config]);

  const handlePointerDown = (clientX: number, clientY: number) => {
    // If physics was flagged moving but bodies have actually stopped, release motion lock
    const anyMoving = capsRef.current.some((c) => Math.hypot(c.vx, c.vy) > 10) || Math.hypot(ballRef.current.vx, ballRef.current.vy) > 7;
    if (!anyMoving && isPhysicsMoving) {
      setIsPhysicsMoving(false);
    }
    if (anyMoving || isPaused || matchPhase !== 'playing' || lastScorerBanner) return;

    const isUserTurn =
      isTrainingMode ||
      userSide === 'both' ||
      (userSide === 'home' && currentTurn === 'home') ||
      (userSide === 'away' && currentTurn === 'away');

    if (!isUserTurn) return;

    const pt = getCanvasCoords(clientX, clientY);
    if (!pt) return;

    // Generous hitbox selection: find closest cap belonging to current turn team within 65px
    let bestCap: ChapaBody | null = null;
    let bestDist = Infinity;
    const SELECT_MARGIN = 65; // Wide hitbox for fluid touch & drag on all active caps

    for (const cap of capsRef.current) {
      if (!isTrainingMode && cap.team !== currentTurn) continue;
      const dist = Math.hypot(cap.x - pt.x, cap.y - pt.y);
      if (dist < bestDist && dist <= cap.radius + SELECT_MARGIN) {
        bestDist = dist;
        bestCap = cap;
      }
    }


    if (bestCap) {
      selectedCapRef.current = bestCap;
      dragStartRef.current = { x: bestCap.x, y: bestCap.y };
      dragCurrentRef.current = { x: pt.x, y: pt.y };
      isDraggingRef.current = true;
      setCurrentPowerRatio(0);
    }
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !selectedCapRef.current || !dragStartRef.current) return;
    const pt = getCanvasCoords(clientX, clientY);
    if (!pt) return;

    dragCurrentRef.current = { x: pt.x, y: pt.y };
    const dx = dragStartRef.current.x - pt.x;
    const dy = dragStartRef.current.y - pt.y;
    const dist = Math.hypot(dx, dy);
    setCurrentPowerRatio(Math.min(1.0, dist / MAX_DRAG_DISTANCE));
  }, [getCanvasCoords]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current || !selectedCapRef.current || !dragStartRef.current || !dragCurrentRef.current) {
      selectedCapRef.current = null;
      dragStartRef.current = null;
      dragCurrentRef.current = null;
      isDraggingRef.current = false;
      setCurrentPowerRatio(0);
      return;
    }

    const cap = selectedCapRef.current;
    const start = dragStartRef.current;
    const cur = dragCurrentRef.current;

    const impulse = calculateImpulse(start.x, start.y, cur.x, cur.y, cap.player.disparo);

    if (impulse.powerRatio > 0.05) {
      chapasAudio.playKick(impulse.powerRatio);
      cap.vx = impulse.vx;
      cap.vy = impulse.vy;
      motionStartTimeRef.current = performance.now();
      setIsPhysicsMoving(true);

      if (isTrainingMode || currentTurn === 'home') {
        setHomeStats((st) => ({ ...st, possessionTurns: st.possessionTurns + 1, shots: st.shots + 1 }));
      } else {
        setAwayStats((st) => ({ ...st, possessionTurns: st.possessionTurns + 1, shots: st.shots + 1 }));
      }
    }

    selectedCapRef.current = null;
    dragStartRef.current = null;
    dragCurrentRef.current = null;
    isDraggingRef.current = false;
    setCurrentPowerRatio(0);
  }, [currentTurn, isTrainingMode]);

  // Global window pointer listeners: ensures dragging never gets dropped outside the canvas
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        handlePointerMove(e.clientX, e.clientY);
      }
    };
    const onWindowPointerUp = () => {
      if (isDraggingRef.current) {
        handlePointerUp();
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Halftime / Resume
  const handleStartSecondHalf = () => {
    setCurrentHalf(2);
    setMatchClockSec(0);
    setMatchPhase('playing');
    setIsPaused(false);
    resetFieldPositions('away');
    chapasAudio.playWhistle(false);
  };

  // Fulltime / Finish
  const handleCompleteMatch = () => {
    onMatchFinished({
      homeScore,
      awayScore,
      scorers,
      homeStats,
      awayStats,
      homePenalties: shootoutResult?.home,
      awayPenalties: shootoutResult?.away,
      winnerSide: shootoutResult?.winner,
    });
  };

  // Real-time stopwatch formatter
  const formatStopwatch = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-1 sm:p-3 overflow-hidden select-none">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[98dvh] max-h-[900px] overflow-hidden">
        {/* TOP BAR / SCOREBOARD & CONTROLS */}
        <div className="bg-slate-950 px-3 sm:px-6 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          {/* Match Title & Comp / Training Header */}
          <div className="flex items-center gap-2 truncate">
            {isTrainingMode ? (
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold font-condensed tracking-wider uppercase text-slate-200 truncate">
              {isTrainingMode ? 'Entrenamiento Libre de Fútbol Chapas' : competitionName}
            </span>
            <span className="text-xs text-slate-400">·</span>
            {!isTrainingMode && (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-lg shrink-0">
                <span className="text-[11px] sm:text-xs font-mono font-black text-amber-400">
                  {currentHalf === 1 ? '1T' : '2T'} {currentMinute}'
                </span>
                <span className="text-slate-600 text-[10px]">|</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400">
                  ⏱️ {formatStopwatch(matchClockSec)} / 02:30
                </span>
              </div>
            )}
          </div>


          {/* Central Live Scoreboard / Training Stats */}
          {isTrainingMode ? (
            <div className="flex items-center gap-3 bg-slate-900 px-3 sm:px-5 py-1 rounded-xl border border-emerald-500/30">
              <span className="font-bold text-xs sm:text-sm text-emerald-300 uppercase font-condensed">
                {homeTeam.shortName}
              </span>
              <div className="font-mono font-black text-xs sm:text-sm text-white px-2.5 py-0.5 bg-slate-950 rounded border border-slate-800 tracking-wider">
                🎯 {homeScore} GOLES · {homeStats.shots} TIROS
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-5 bg-slate-900 px-3 sm:px-5 py-1 rounded-xl border border-slate-800">
              {/* Home */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: homeTeam.primaryColor }}
                />
                <span className="font-bold text-xs sm:text-sm text-slate-100 uppercase font-condensed truncate max-w-[80px] sm:max-w-[130px]">
                  {homeTeam.shortName}
                </span>
              </div>

              {/* Score */}
              <div className="font-mono font-black text-base sm:text-2xl text-white px-2.5 py-0.5 bg-slate-950 rounded border border-slate-800 tracking-wider">
                {homeScore} - {awayScore}
              </div>

              {/* Away */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-100 uppercase font-condensed truncate max-w-[80px] sm:max-w-[130px]">
                  {awayTeam.shortName}
                </span>
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: kitInfo.awayColor }}
                  title={kitInfo.isClashing ? '2ª Equipación por coincidencia de color' : '1ª Equipación'}
                />
              </div>
            </div>
          )}

          {/* Utility Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isTrainingMode ? (
              <>
                {/* Training Drills: Centro, Falta, Penalti */}
                <button
                  onClick={() => {
                    ballRef.current = createInitialBall(config);
                    goalProcessedRef.current = false;
                    chapasAudio.playWhistle(true);
                  }}
                  title="Colocar el balón en el centro del campo"
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-condensed font-bold uppercase rounded-lg border border-slate-700 transition-colors"
                >
                  Balón al Centro
                </button>
                <button
                  onClick={() => {
                    ballRef.current = {
                      x: Math.round(config.width * 0.70),
                      y: Math.round(config.height * 0.50),
                      vx: 0,
                      vy: 0,
                      radius: 10,
                      mass: 0.35,
                    };
                    goalProcessedRef.current = false;
                    chapasAudio.playWhistle(true);
                  }}
                  title="Colocar el balón para tiro de falta ante la barrera de conos"
                  className="px-2 py-1 bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 text-xs font-condensed font-bold uppercase rounded-lg border border-amber-700/50 transition-colors hidden sm:inline"
                >
                  Tiro de Falta
                </button>
                <button
                  onClick={() => {
                    ballRef.current = {
                      x: config.width - 95,
                      y: Math.round(config.height * 0.50),
                      vx: 0,
                      vy: 0,
                      radius: 10,
                      mass: 0.35,
                    };
                    goalProcessedRef.current = false;
                    chapasAudio.playWhistle(true);
                  }}
                  title="Colocar el balón en el punto de penalti"
                  className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-condensed font-bold uppercase rounded-lg border border-emerald-700/50 transition-colors hidden xs:inline"
                >
                  Penalti
                </button>
                <button
                  onClick={() => {
                    resetFieldPositions('home');
                    chapasAudio.playWhistle(true);
                  }}
                  title="Reiniciar posiciones y conos de entrenamiento"
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Always Available Option: Simular Resto de Partido */}
                <button
                  onClick={handleSimulateRestOfMatch}
                  title="Simular el resto del partido partiendo del resultado actual"
                  className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black font-condensed uppercase tracking-wider text-xs rounded-lg shadow-md hover:scale-[1.02] transition-transform flex items-center gap-1.5"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Simular Resto</span>
                </button>
              </>
            )}

            {/* Substitutions Button */}
            <button
              onClick={() => setIsSubsModalOpen(true)}
              title="Realizar Cambios y Sustituciones"
              className="px-2 sm:px-2.5 py-1.5 text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-condensed font-bold uppercase transition-colors flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cambios</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Silenciar Sonido' : 'Activar Sonido'}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {!isTrainingMode && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Reanudar' : 'Pausar'}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              title="Salir del Partido"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TURN BANNER & STATUS HUD */}
        <div className="bg-slate-950/85 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isTrainingMode ? (
              <span className="font-bold font-condensed uppercase tracking-wider px-2 py-0.5 rounded text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
                🎯 Modo Entrenamiento: ¡Tira con cualquiera de tus chapas! Rebota en los conos y practica puntería a puerta.
              </span>
            ) : (
              <>
                <span className="text-slate-400">Turno de tiro:</span>
                <span
                  className={`font-bold font-condensed uppercase tracking-wider px-2 py-0.5 rounded text-[11px] ${
                    currentTurn === 'home'
                      ? 'bg-blue-900/60 text-blue-200 border border-blue-700/50'
                      : 'bg-red-900/60 text-red-200 border border-red-700/50'
                  }`}
                >
                  {currentTurn === 'home' ? homeTeam.shortName : awayTeam.shortName}
                  {aiThinking ? ' (Calculando tiro...)' : isPhysicsMoving ? ' (En movimiento)' : ' (¡Todas tus chapas listas!)'}
                </span>

                {kitInfo.isClashing && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 hidden md:inline">
                    ⚠️ {awayTeam.shortName} usa 2ª equipación por coincidencia de color
                  </span>
                )}
              </>
            )}
          </div>

          {/* Dynamic Power Bar */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 hidden xs:inline">Potencia:</span>
            <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-75 ${
                  currentPowerRatio > 0.8
                    ? 'bg-rose-500'
                    : currentPowerRatio > 0.4
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.round(currentPowerRatio * 100)}%` }}
              />
            </div>
            <span className="font-mono text-slate-300 w-8 text-right font-bold">
              {Math.round(currentPowerRatio * 100)}%
            </span>
          </div>
        </div>

        {/* CANVAS GAME CONTAINER */}
        <div className="relative flex-1 bg-emerald-950 flex items-center justify-center overflow-hidden p-1 sm:p-3">
          <canvas
            ref={canvasRef}
            width={config.width}
            height={config.height}
            onPointerDown={(e) => {
              e.preventDefault();
              handlePointerDown(e.clientX, e.clientY);
            }}
            className="w-full h-full max-h-[660px] object-contain rounded-xl shadow-2xl border border-emerald-800/40 cursor-crosshair touch-none"
          />

          {/* GOAL CELEBRATION OVERLAY */}
          {lastScorerBanner && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-20 animate-in fade-in zoom-in duration-300">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 rounded-2xl p-6 sm:p-8 text-center max-w-lg shadow-2xl">
                <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-bounce mb-2" />
                <h2 className="text-2xl sm:text-4xl font-black font-condensed tracking-wider uppercase text-amber-400 drop-shadow-md">
                  {lastScorerBanner.text}
                </h2>
                <p className="text-base sm:text-xl font-bold text-white mt-2 font-condensed uppercase tracking-wide">
                  {lastScorerBanner.sub}
                </p>
              </div>
            </div>
          )}

          {/* SUBSTITUTION BANNER TOAST */}
          {subBanner && (
            <div className="absolute top-4 bg-slate-900/90 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-condensed uppercase tracking-wider shadow-2xl animate-in slide-in-from-top duration-200 z-20 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{subBanner}</span>
            </div>
          )}

          {/* HALFTIME OVERLAY */}
          {matchPhase === 'halftime' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-20">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 text-center max-w-md w-full shadow-2xl space-y-5">
                <Flag className="w-12 h-12 text-emerald-400 mx-auto" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-condensed tracking-wider uppercase text-white">
                    Descanso reglamentario (2:30 completados)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Final de los primeros 45 minutos</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-around">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-condensed">{homeTeam.shortName}</p>
                    <p className="text-3xl font-black font-mono text-white">{homeScore}</p>
                  </div>
                  <span className="text-slate-600 font-bold text-lg">-</span>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-condensed">{awayTeam.shortName}</p>
                    <p className="text-3xl font-black font-mono text-white">{awayScore}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSubsModalOpen(true)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                    <span>Realizar Cambios</span>
                  </button>
                  <button
                    onClick={handleStartSecondHalf}
                    className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs sm:text-sm font-black uppercase font-condensed tracking-wider shadow-lg hover:scale-[1.02] transition-transform"
                  >
                    Comenzar 2ª Parte (2:30)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FULLTIME / END OF MATCH OVERLAY */}
          {matchPhase === 'fulltime' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-20">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 text-center max-w-lg w-full shadow-2xl space-y-5">
                <Trophy className="w-14 h-14 text-amber-400 mx-auto" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black font-condensed tracking-wider uppercase text-white">
                    ¡Final del Partido!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Resultado definitivo del encuentro de chapas</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase font-condensed">{homeTeam.shortName}</p>
                    <p className="text-3xl sm:text-4xl font-black font-mono text-white">{homeScore}</p>
                  </div>
                  <span className="text-slate-600 font-bold text-2xl">-</span>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase font-condensed">{awayTeam.shortName}</p>
                    <p className="text-3xl sm:text-4xl font-black font-mono text-white">{awayScore}</p>
                  </div>
                </div>

                {scorers.length > 0 && (
                  <div className="text-left bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase font-condensed">Goleadores:</p>
                    <div className="flex flex-wrap gap-2 text-slate-200">
                      {scorers.map((sc, i) => (
                        <span key={i} className="text-slate-300">
                          ⚽ {sc.playerName} ({sc.minute}')
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* PENALTY SHOOTOUT (PIEDRA, PAPEL O TIJERA) */}
                {shootoutResult ? (
                  <div className="bg-amber-950/70 border border-amber-500/50 p-3 rounded-xl text-center text-xs space-y-1">
                    <span className="text-[10px] uppercase font-condensed text-amber-300 font-bold block">
                      Tanda de Penaltis (Piedra, Papel o Tijera)
                    </span>
                    <span className="text-base font-black font-mono text-white">
                      {homeTeam.shortName} {shootoutResult.home} - {shootoutResult.away} {awayTeam.shortName}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold block">
                      Vencedor: {shootoutResult.winner === 'home' ? homeTeam.shortName : awayTeam.shortName}
                    </span>
                  </div>
                ) : (
                  (isKnockout || homeScore === awayScore) && (
                    <button
                      onClick={() => setIsShootoutOpen(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black uppercase font-condensed tracking-wider shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Disputar Tanda de Penaltis (Piedra, Papel o Tijera)</span>
                    </button>
                  )
                )}

                <button
                  onClick={handleCompleteMatch}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-sm font-black uppercase font-condensed tracking-wider shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <span>Continuar y Registrar Partido</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SUBSTITUTIONS MODAL (CAMBIOS) */}
          {isSubsModalOpen && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 z-30 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base sm:text-lg font-black font-condensed uppercase tracking-wider text-white">
                      Banquillo y Cambios — {homeTeam.shortName}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    Cambios: {subsCount.home} / 5
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFieldCapId(null);
                      setSelectedSubId(null);
                      setIsSubsModalOpen(false);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 overflow-y-auto flex-1">
                  {/* Field Players (Titulares en el campo) */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold font-condensed uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-blue-400" />
                      <span>1. Elige chapa a sustituir (campo)</span>
                    </p>
                    <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                      {capsRef.current
                        .filter((c) => c.team === 'home')
                        .map((c) => (
                          <div
                            key={`${c.id}_${c.player.id}_${lineupVersion}`}
                            onClick={() => setSelectedFieldCapId(c.id)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                              selectedFieldCapId === c.id
                                ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                                {c.isGoalkeeper ? '🧤' : c.player.number}
                              </span>
                              <span className="font-bold truncate">{c.player.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({c.player.position})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                              <span>TIR: {c.player.disparo}</span>
                              <span>TEC: {c.player.tecnica}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Bench Substitutes (Suplentes) */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold font-condensed uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. Elige suplente que entra</span>
                    </p>
                    <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                      {homeSubs.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-3">No hay suplentes disponibles en el banquillo.</p>
                      ) : (
                        homeSubs.map((sub) => (
                          <div
                            key={`${sub.id}_${lineupVersion}`}
                            onClick={() => setSelectedSubId(sub.id)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                              selectedSubId === sub.id
                                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-5 rounded-full bg-emerald-700 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                                {sub.number}
                              </span>
                              <span className="font-bold truncate">{sub.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({sub.position})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                              <span className="text-emerald-400 font-bold">TIR: {sub.disparo}</span>
                              <span>FUE: {sub.fuerza}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Selection Preview Badge */}
                {(selectedFieldCapId || selectedSubId) && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Sale:</span>
                      <span className="text-amber-400 font-bold">
                        {capsRef.current.find((c) => c.id === selectedFieldCapId)?.player.name || 'Selecciona chapa en campo'}
                      </span>
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Entra:</span>
                      <span className="text-emerald-400 font-bold">
                        {homeSubs.find((s) => s.id === selectedSubId)?.name || 'Selecciona suplente'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">

                  <span className="text-xs text-slate-400">
                    {subsCount.home >= 5 ? 'Límite de 5 cambios alcanzado' : 'Máximo 5 sustituciones reglamentarias'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedFieldCapId(null);
                        setSelectedSubId(null);
                        setIsSubsModalOpen(false);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold font-condensed uppercase tracking-wider"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={!selectedFieldCapId || !selectedSubId || subsCount.home >= 5}
                      onClick={handlePerformSubstitution}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 rounded-lg text-xs font-black font-condensed uppercase tracking-wider shadow-md hover:scale-[1.02] transition-transform"
                    >
                      Confirmar Cambio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS & INSTRUCTIONS BAR */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Controles ágiles:</span>
            <span>Toca o arrastra cualquier chapa de tu equipo hacia atrás para dar potencia y dirección. Al soltar se ejecuta el disparo.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Tiros {homeTeam.shortName}: <b className="text-slate-200">{homeStats.shots}</b></span>
            <span>Tiros {awayTeam.shortName}: <b className="text-slate-200">{awayStats.shots}</b></span>
            <span>Duración: <b className="text-amber-400">2:30 / tiempo</b></span>
          </div>
        </div>
      </div>

      {/* ROCK-PAPER-SCISSORS PENALTY SHOOTOUT MODAL */}
      {isShootoutOpen && (
        <PenaltyShootoutModal
          isOpen={isShootoutOpen}
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
          homeColor={homeTeam.primaryColor}
          awayColor={kitInfo.awayColor}
          isUserHome={userSide !== 'away'}
          homeShooters={homeTeam.players.map((p) => ({
            id: p.id,
            name: p.name,
            number: p.number,
            disparo: p.disparo,
            fuerza: p.fuerza,
          }))}
          awayShooters={awayTeam.players.map((p) => ({
            id: p.id,
            name: p.name,
            number: p.number,
            disparo: p.disparo,
            fuerza: p.fuerza,
          }))}
          homeGoalkeeper={{
            id: homeTeam.players.find((p) => p.isGoalkeeper)?.id || 'h_gk',
            name: homeTeam.players.find((p) => p.isGoalkeeper)?.name || 'Portero Local',
            paradas: 78,
            reflejos: 79,
          }}
          awayGoalkeeper={{
            id: awayTeam.players.find((p) => p.isGoalkeeper)?.id || 'a_gk',
            name: awayTeam.players.find((p) => p.isGoalkeeper)?.name || 'Portero Visitante',
            paradas: 77,
            reflejos: 78,
          }}
          onFinishShootout={(hP, aP, win) => {
            setShootoutResult({ home: hP, away: aP, winner: win });
            setIsShootoutOpen(false);
          }}
        />
      )}
    </div>
  );
};
