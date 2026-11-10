import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Zap, Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playGoalSound, playWhistleSound } from '../../utils/audio';
import { chapasAudio } from '../../engine/chapasPhysicsEngine';

export type RPSChoice = 'PIEDRA' | 'PAPEL' | 'TIJERA';

export interface PenaltyShooter {
  id: string;
  name: string;
  number: number;
  disparo: number;
  fuerza: number;
}

export interface PenaltyGoalkeeper {
  id: string;
  name: string;
  paradas: number;
  reflejos: number;
}

interface PenaltyShootoutModalProps {
  isOpen: boolean;
  homeTeamName: string;
  awayTeamName: string;
  homeColor: string;
  awayColor: string;
  isUserHome: boolean;
  homeShooters: PenaltyShooter[];
  awayShooters: PenaltyShooter[];
  homeGoalkeeper: PenaltyGoalkeeper;
  awayGoalkeeper: PenaltyGoalkeeper;
  onFinishShootout: (homeScore: number, awayScore: number, winner: 'home' | 'away') => void;
}

interface ShootoutAttempt {
  round: number;
  team: 'home' | 'away';
  shooterName: string;
  gkName: string;
  shooterChoice: RPSChoice;
  gkChoice: RPSChoice;
  scored: boolean;
  duelWinner: 'shooter' | 'gk' | 'empate';
  details: string;
}

export const PenaltyShootoutModal: React.FC<PenaltyShootoutModalProps> = ({
  isOpen,
  homeTeamName,
  awayTeamName,
  homeColor,
  awayColor,
  isUserHome,
  homeShooters,
  awayShooters,
  homeGoalkeeper,
  awayGoalkeeper,
  onFinishShootout,
}) => {
  // Shootout tracking
  const [currentTurn, setCurrentTurn] = useState<'home' | 'away'>('home');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [homeAttempts, setHomeAttempts] = useState<boolean[]>([]);
  const [awayAttempts, setAwayAttempts] = useState<boolean[]>([]);
  const [history, setHistory] = useState<ShootoutAttempt[]>([]);

  // Interactive Duel State
  const [selectedChoice, setSelectedChoice] = useState<RPSChoice | null>(null);
  const [isDuelRevealing, setIsDuelRevealing] = useState<boolean>(false);
  const [lastDuelResult, setLastDuelResult] = useState<{
    shooterChoice: RPSChoice;
    gkChoice: RPSChoice;
    scored: boolean;
    duelWinner: 'shooter' | 'gk' | 'empate';
    message: string;
  } | null>(null);

  // Winner declaration
  const [winner, setWinner] = useState<'home' | 'away' | null>(null);

  const homeGoals = homeAttempts.filter(Boolean).length;
  const awayGoals = awayAttempts.filter(Boolean).length;

  const isUserTurn = (isUserHome && currentTurn === 'home') || (!isUserHome && currentTurn === 'away');
  const isUserShooting = (isUserHome && currentTurn === 'home') || (!isUserHome && currentTurn === 'away');

  // Active shooter & GK
  const currentShooter: PenaltyShooter =
    currentTurn === 'home'
      ? homeShooters[currentRoundIndex % Math.max(1, homeShooters.length)] || {
          id: 'h_s',
          name: 'Lanzador Local',
          number: 9,
          disparo: 78,
          fuerza: 75,
        }
      : awayShooters[currentRoundIndex % Math.max(1, awayShooters.length)] || {
          id: 'a_s',
          name: 'Lanzador Visitante',
          number: 10,
          disparo: 78,
          fuerza: 75,
        };

  const currentGK: PenaltyGoalkeeper =
    currentTurn === 'home'
      ? awayGoalkeeper || { id: 'a_gk', name: 'Portero Visitante', paradas: 78, reflejos: 76 }
      : homeGoalkeeper || { id: 'h_gk', name: 'Portero Local', paradas: 78, reflejos: 76 };

  // Helper to determine winner of RPS
  const evaluateRPSDuel = (
    c1: RPSChoice,
    c2: RPSChoice
  ): 'p1' | 'p2' | 'draw' => {
    if (c1 === c2) return 'draw';
    if (
      (c1 === 'PIEDRA' && c2 === 'TIJERA') ||
      (c1 === 'PAPEL' && c2 === 'PIEDRA') ||
      (c1 === 'TIJERA' && c2 === 'PAPEL')
    ) {
      return 'p1';
    }
    return 'p2';
  };

  const executeShot = (playerChoice: RPSChoice) => {
    playClickSound();
    setIsDuelRevealing(true);
    setSelectedChoice(playerChoice);

    const choices: RPSChoice[] = ['PIEDRA', 'PAPEL', 'TIJERA'];
    const aiChoice: RPSChoice = choices[Math.floor(Math.random() * 3)];

    const shooterChoice = isUserShooting ? playerChoice : aiChoice;
    const gkChoice = isUserShooting ? aiChoice : playerChoice;

    const rpsOutcome = evaluateRPSDuel(shooterChoice, gkChoice);
    let duelWinner: 'shooter' | 'gk' | 'empate' = 'empate';
    if (rpsOutcome === 'p1') duelWinner = 'shooter';
    else if (rpsOutcome === 'p2') duelWinner = 'gk';

    // Calculate goal probability based on duel winner + stats
    let goalProb = 0.50; // base draw probability
    if (duelWinner === 'shooter') {
      // Shooter won duel: engañó al portero
      goalProb = 0.88 + ((currentShooter.disparo - 70) * 0.003);
    } else if (duelWinner === 'gk') {
      // GK won duel: adivinó el lado
      goalProb = 0.18 + ((currentShooter.fuerza - currentGK.paradas) * 0.004);
    } else {
      // Draw: stats face-off
      goalProb = 0.52 + ((currentShooter.disparo - currentGK.reflejos) * 0.005);
    }

    goalProb = Math.max(0.08, Math.min(0.96, goalProb));
    const scored = Math.random() < goalProb;

    setTimeout(() => {
      if (scored) {
        playGoalSound();
        chapasAudio.playGoalHorn();
      } else {
        chapasAudio.playPostHit();
      }

      let message = '';
      if (scored) {
        if (duelWinner === 'shooter') {
          message = `¡GOL! ${currentShooter.name} engaña por completo al portero y manda el balón a la red.`;
        } else if (duelWinner === 'gk') {
          message = `¡GOL MILAGROSO! Aunque ${currentGK.name} rozó el balón, entró con potencia.`;
        } else {
          message = `¡GOLAZO! Ajustado al palo derecho imparable.`;
        }
      } else {
        if (duelWinner === 'gk') {
          message = `¡PARADÓN! ${currentGK.name} adivinó la intención y despeja con una mano soberbia.`;
        } else if (duelWinner === 'shooter') {
          message = `¡FUERA! Engañó al guardameta pero el disparo se estrelló en la madera.`;
        } else {
          message = `¡FALLO! El disparo centrado es atrapado por ${currentGK.name}.`;
        }
      }

      setLastDuelResult({
        shooterChoice,
        gkChoice,
        scored,
        duelWinner,
        message,
      });

      // Update attempts
      let nextHomeAttempts = [...homeAttempts];
      let nextAwayAttempts = [...awayAttempts];

      if (currentTurn === 'home') {
        nextHomeAttempts.push(scored);
        setHomeAttempts(nextHomeAttempts);
      } else {
        nextAwayAttempts.push(scored);
        setAwayAttempts(nextAwayAttempts);
      }

      setHistory((prev) => [
        ...prev,
        {
          round: currentRoundIndex + 1,
          team: currentTurn,
          shooterName: currentShooter.name,
          gkName: currentGK.name,
          shooterChoice,
          gkChoice,
          scored,
          duelWinner,
          details: message,
        },
      ]);

      // Check for winner
      const hCount = nextHomeAttempts.length;
      const aCount = nextAwayAttempts.length;
      const hG = nextHomeAttempts.filter(Boolean).length;
      const aG = nextAwayAttempts.filter(Boolean).length;

      let foundWinner: 'home' | 'away' | null = null;

      // Check standard 5 rounds
      if (hCount <= 5 && aCount <= 5) {
        const hRemaining = 5 - hCount;
        const aRemaining = 5 - aCount;

        if (hG > aG + aRemaining) {
          foundWinner = 'home';
        } else if (aG > hG + hRemaining) {
          foundWinner = 'away';
        } else if (hCount === 5 && aCount === 5) {
          if (hG > aG) foundWinner = 'home';
          else if (aG > hG) foundWinner = 'away';
        }
      } else {
        // Sudden death (after 5 rounds and equal attempts)
        if (hCount === aCount && hG !== aG) {
          foundWinner = hG > aG ? 'home' : 'away';
        }
      }

      if (foundWinner) {
        setWinner(foundWinner);
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        playWhistleSound();
      } else {
        // Toggle turn
        if (currentTurn === 'home') {
          setCurrentTurn('away');
        } else {
          setCurrentTurn('home');
          setCurrentRoundIndex((r) => r + 1);
        }
      }

      setIsDuelRevealing(false);
      setSelectedChoice(null);
    }, 1200);
  };

  // AI Turn Automatic Execution if CPU is playing
  useEffect(() => {
    if (!isOpen || winner || isDuelRevealing) return;

    if (!isUserTurn) {
      const timer = setTimeout(() => {
        const choices: RPSChoice[] = ['PIEDRA', 'PAPEL', 'TIJERA'];
        const aiPick = choices[Math.floor(Math.random() * 3)];
        executeShot(aiPick);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isOpen, winner, isUserTurn, isDuelRevealing, currentTurn]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0e1628] via-[#09101f] to-[#040810] border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* TOP SCOREBOARD */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-black font-condensed tracking-wider uppercase text-white text-sm sm:text-base">
              Tanda de Penaltis · Duelo Psicológico
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/40">
            {currentRoundIndex >= 5 ? 'Muerte Súbita' : `Ronda ${currentRoundIndex + 1} de 5`}
          </span>
        </div>

        {/* TEAMS AND PENALTY DOTS */}
        <div className="bg-slate-900/90 p-4 border-b border-slate-800 grid grid-cols-2 gap-4">
          {/* Home Team */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20"
                style={{ backgroundColor: homeColor }}
              />
              <span className="font-black text-sm sm:text-base text-white font-condensed uppercase truncate">
                {homeTeamName}
              </span>
              <span className="font-mono font-black text-xl text-amber-400 ml-auto hidden sm:inline">
                {homeGoals}
              </span>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              {Array.from({ length: Math.max(5, homeAttempts.length) }).map((_, i) => {
                const att = homeAttempts[i];
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      att === true
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : att === false
                        ? 'bg-rose-600 text-white border-rose-500'
                        : i === homeAttempts.length && currentTurn === 'home'
                        ? 'border-amber-400 bg-amber-400/30 animate-pulse'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {att === true ? '✓' : att === false ? '✗' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Away Team */}
          <div className="space-y-2 text-center sm:text-right border-l border-slate-800 pl-4">
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <span className="font-mono font-black text-xl text-amber-400 mr-auto hidden sm:inline">
                {awayGoals}
              </span>
              <span className="font-black text-sm sm:text-base text-white font-condensed uppercase truncate">
                {awayTeamName}
              </span>
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20"
                style={{ backgroundColor: awayColor }}
              />
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center sm:justify-end gap-1.5">
              {Array.from({ length: Math.max(5, awayAttempts.length) }).map((_, i) => {
                const att = awayAttempts[i];
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      att === true
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : att === false
                        ? 'bg-rose-600 text-white border-rose-500'
                        : i === awayAttempts.length && currentTurn === 'away'
                        ? 'border-amber-400 bg-amber-400/30 animate-pulse'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {att === true ? '✓' : att === false ? '✗' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACTIVE DUEL ARENA */}
        <div className="p-6 text-center space-y-5 flex-1 flex flex-col justify-center">
          {winner ? (
            /* WINNER BANNER */
            <div className="space-y-4 py-4 animate-in zoom-in-95 duration-300">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-2xl sm:text-3xl font-black font-condensed uppercase tracking-wider text-amber-400">
                ¡{winner === 'home' ? homeTeamName.toUpperCase() : awayTeamName.toUpperCase()} GANA LA TANDA!
              </h3>
              <p className="font-mono text-xl text-white font-bold">
                Resultado de penaltis: {homeGoals} - {awayGoals}
              </p>
              <button
                onClick={() => onFinishShootout(homeGoals, awayGoals, winner)}
                className="pcf-btn pcf-btn-gold px-8 py-3 text-sm font-black font-condensed uppercase tracking-wider shadow-2xl hover:scale-105 transition-transform"
              >
                Continuar y Registrar Partido
              </button>
            </div>
          ) : (
            <>
              {/* CURRENT FACEOFF INFO */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-around text-xs">
                <div>
                  <span className="text-slate-400 block font-condensed uppercase text-[11px]">Lanzador</span>
                  <span className="font-bold text-white text-sm">{currentShooter.name}</span>
                  <span className="text-[10px] text-amber-400 block">Disp. {currentShooter.disparo} · Fza. {currentShooter.fuerza}</span>
                </div>

                <div className="font-mono font-black text-amber-400 text-base">VS</div>

                <div>
                  <span className="text-slate-400 block font-condensed uppercase text-[11px]">Guardameta</span>
                  <span className="font-bold text-white text-sm">{currentGK.name}</span>
                  <span className="text-[10px] text-sky-400 block">Par. {currentGK.paradas} · Ref. {currentGK.reflejos}</span>
                </div>
              </div>

              {/* DUEL VISUAL FEEDBACK */}
              {lastDuelResult && (
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-center space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-center gap-4 text-2xl">
                    <span title="Elección Lanzador">
                      {lastDuelResult.shooterChoice === 'PIEDRA' ? '🪨' : lastDuelResult.shooterChoice === 'PAPEL' ? '📄' : '✂️'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">VS</span>
                    <span title="Elección Portero">
                      {lastDuelResult.gkChoice === 'PIEDRA' ? '🪨' : lastDuelResult.gkChoice === 'PAPEL' ? '📄' : '✂️'}
                    </span>
                  </div>
                  <p className={`text-xs font-bold font-condensed uppercase ${lastDuelResult.scored ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {lastDuelResult.message}
                  </p>
                </div>
              )}

              {/* INTERACTIVE CHOICE BUTTONS */}
              {isUserTurn && !isDuelRevealing ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-amber-300 font-condensed uppercase tracking-wider">
                    {isUserShooting
                      ? 'Elige tu lanzamiento (Piedra, Papel o Tijera):'
                      : 'Elige tu estirada de portero (Piedra, Papel o Tijera):'}
                  </p>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    {[
                      { id: 'PIEDRA' as RPSChoice, label: 'Piedra (Fuerza)', icon: '🪨', desc: 'Disparo raso potente' },
                      { id: 'PAPEL' as RPSChoice, label: 'Papel (Colocación)', icon: '📄', desc: 'Disparo suave colocado' },
                      { id: 'TIJERA' as RPSChoice, label: 'Tijera (Efecto)', icon: '✂️', desc: 'Tiro con rosca a la escuadra' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => executeShot(btn.id)}
                        className="bg-gradient-to-b from-slate-800 to-slate-900 hover:from-amber-600 hover:to-amber-700 hover:text-slate-950 p-3 sm:p-4 rounded-xl border border-slate-700 hover:border-amber-400 transition-all shadow-lg group flex flex-col items-center justify-center space-y-1.5 cursor-pointer active:scale-95"
                      >
                        <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">{btn.icon}</span>
                        <span className="font-black text-xs font-condensed uppercase">{btn.label}</span>
                        <span className="text-[9px] text-slate-400 group-hover:text-slate-950 font-normal hidden sm:inline">
                          {btn.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : isDuelRevealing ? (
                <div className="py-6 space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold font-condensed uppercase text-amber-400 tracking-wider">
                    Lanzando penalti y resolviendo duelo...
                  </p>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse mx-auto flex items-center justify-center text-slate-400">
                    ⏱️
                  </div>
                  <p className="text-xs text-slate-400 font-condensed uppercase">
                    Turno del rival calculando lanzamiento...
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* BOTTOM RULES SUMMARY */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Reglas: Piedra gana a Tijera · Papel gana a Piedra · Tijera gana a Papel.</span>
          <span>Influencia de calidad técnica y reflejos en empates.</span>
        </div>
      </div>
    </div>
  );
};
