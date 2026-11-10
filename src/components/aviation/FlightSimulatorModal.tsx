import React, { useState, useEffect, useRef } from 'react';
import { AircraftItem } from '../../types/privateLife';
import { 
  Plane, 
  Wind, 
  Gauge, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Play, 
  CloudRain, 
  ShieldAlert,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface FlightSimulatorModalProps {
  isOpen: boolean;
  aircraft: AircraftItem;
  destinationCity: string;
  rivalClubName: string;
  distanceKm?: number;
  initialWeather?: 'Despejado' | 'Lluvioso' | 'Tormenta' | 'Niebla';
  isManagerPilot: boolean;
  onFlightComplete: (result: { success: boolean; landingScore: number; crashCatastrophic: boolean; report: string }) => void;
  onClose: () => void;
}

export const FlightSimulatorModal: React.FC<FlightSimulatorModalProps> = ({
  isOpen,
  aircraft,
  destinationCity,
  rivalClubName,
  distanceKm = 620,
  initialWeather = 'Despejado',
  isManagerPilot,
  onFlightComplete,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<'briefing' | 'arcade' | 'completed'>('briefing');
  const [phase, setPhase] = useState<'takeoff' | 'cruise' | 'landing'>('takeoff');
  const [weather] = useState<'Despejado' | 'Lluvioso' | 'Tormenta' | 'Niebla'>(initialWeather);

  // Flight Physics & Instruments State
  const [throttle, setThrottle] = useState<number>(0); // 0 - 100%
  const [speedKnots, setSpeedKnots] = useState<number>(0);
  const [altitudeFt, setAltitudeFt] = useState<number>(0);
  const [pitchDeg, setPitchDeg] = useState<number>(0); // -15 to +20
  const [turbulenceLevel, setTurbulenceLevel] = useState<number>(0); // 0 to 1
  const [flightProgress, setFlightProgress] = useState<number>(0); // 0 to 100%
  const [landingTouchScore, setLandingTouchScore] = useState<number>(100);
  const [flightStatusMsg, setFlightStatusMsg] = useState<string>('En cabecera de pista. Aplica potencia al 100% y rota a 120 nudos.');
  const [showCrashConfirm, setShowCrashConfirm] = useState<boolean>(false);

  // Auto-simulate flight
  const handleSimulateAuto = () => {
    const isStorm = weather === 'Tormenta';
    const report = isStorm
      ? `Vuelo con turbulencias moderadas a bordo del ${aircraft.model}. La plantilla llegó bien aunque con ligero cansancio.`
      : `Vuelo excelente y plácido en el ${aircraft.model}. La plantilla llega en condiciones óptimas para el choque vs ${rivalClubName}.`;

    onFlightComplete({
      success: true,
      landingScore: isStorm ? 75 : 95,
      crashCatastrophic: false,
      report,
    });
  };

  // Trigger Disaster Crash
  const handleTriggerCatastrophicCrash = () => {
    setShowCrashConfirm(false);
    onFlightComplete({
      success: false,
      landingScore: 0,
      crashCatastrophic: true,
      report: `Fallo catastrófico múltiple en aproximación con pérdida total de la aeronave. Se activa el protocolo de emergencia y solidaridad mundial.`,
    });
  };

  // Start Arcade Simulator
  const handleStartArcade = () => {
    setMode('arcade');
    setPhase('takeoff');
    setThrottle(30);
    setSpeedKnots(40);
    setAltitudeFt(0);
    setPitchDeg(0);
    setFlightProgress(0);
    setLandingTouchScore(100);
    setFlightStatusMsg('Pista 09L libre. Sube potencia al 100% para iniciar carrera de despegue.');
  };

  // Arcade Canvas Game Loop
  useEffect(() => {
    if (mode !== 'arcade' || !isOpen) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;

          // 1. UPDATE ARCADE FLIGHT PHASES
          if (phase === 'takeoff') {
            setSpeedKnots((s) => {
              const targetSpeed = throttle * 1.8;
              const next = s + (targetSpeed - s) * dt * 1.5;
              if (next > 115 && pitchDeg > 5) {
                setAltitudeFt((alt) => alt + (pitchDeg * 35 * dt));
                if (altitudeFt > 400) {
                  setPhase('cruise');
                  setFlightStatusMsg('¡Despegue limpio! Estabiliza crucero a 18.000 pies sorteando turbulencias.');
                }
              }
              return Math.min(260, next);
            });
          } else if (phase === 'cruise') {
            setFlightProgress((p) => {
              const next = p + dt * 6.5; // ~15 seconds cruise
              if (next >= 75) {
                setPhase('landing');
                setFlightStatusMsg('Aproximación final a destino. Reduce potencia a 45% y desciende a pista.');
              }
              return Math.min(100, next);
            });

            // Altitude control
            setAltitudeFt((alt) => {
              const targetAlt = 18000 + pitchDeg * 400;
              return Math.max(1000, alt + (targetAlt - alt) * dt * 0.8);
            });

            // Dynamic turbulence
            if (weather === 'Tormenta') {
              setTurbulenceLevel(0.4 + Math.sin(time * 0.005) * 0.3);
            } else if (weather === 'Lluvioso') {
              setTurbulenceLevel(0.2);
            } else {
              setTurbulenceLevel(0.05);
            }
          } else if (phase === 'landing') {
            setAltitudeFt((alt) => {
              const descentRate = pitchDeg < 0 ? 1200 : 700;
              const next = Math.max(0, alt - descentRate * dt);
              if (next <= 5) {
                // Touchdown!
                const verticalImpact = Math.abs(pitchDeg);
                const score = Math.max(40, Math.round(100 - verticalImpact * 4));
                setLandingTouchScore(score);
                setMode('completed');
              }
              return next;
            });
            setSpeedKnots((s) => Math.max(90, s - dt * 15));
          }

          // 2. RENDER COCKPIT HUD & HORIZON
          ctx.clearRect(0, 0, W, H);

          // Sky & Ground artificial horizon
          const horizonY = H * 0.5 + pitchDeg * 8 + (Math.sin(time * 0.01) * turbulenceLevel * 25);
          const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
          skyGrad.addColorStop(0, weather === 'Tormenta' ? '#0f172a' : '#0284c7');
          skyGrad.addColorStop(1, weather === 'Tormenta' ? '#334155' : '#38bdf8');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, W, horizonY);

          const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
          groundGrad.addColorStop(0, '#15803d');
          groundGrad.addColorStop(1, '#064e3b');
          ctx.fillStyle = groundGrad;
          ctx.fillRect(0, horizonY, W, H - horizonY);

          // Horizon reference line
          ctx.beginPath();
          ctx.moveTo(0, horizonY);
          ctx.lineTo(W, horizonY);
          ctx.strokeStyle = '#ffffff88';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Runway in Takeoff & Landing
          if (phase === 'takeoff' || phase === 'landing') {
            ctx.beginPath();
            ctx.moveTo(W * 0.5 - 20, horizonY);
            ctx.lineTo(W * 0.5 + 20, horizonY);
            ctx.lineTo(W * 0.5 + 180, H);
            ctx.lineTo(W * 0.5 - 180, H);
            ctx.closePath();
            ctx.fillStyle = '#1e293b';
            ctx.fill();

            // Runway center dashes
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 4;
            ctx.setLineDash([16, 16]);
            ctx.beginPath();
            ctx.moveTo(W * 0.5, horizonY);
            ctx.lineTo(W * 0.5, H);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Fluffy Clouds in cruise
          if (phase === 'cruise') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            for (let i = 0; i < 4; i++) {
              const cx = ((time * 0.08 * (i + 1)) % (W + 200)) - 100;
              const cy = 60 + i * 45;
              ctx.beginPath();
              ctx.arc(cx, cy, 35, 0, Math.PI * 2);
              ctx.arc(cx + 25, cy - 10, 42, 0, Math.PI * 2);
              ctx.arc(cx + 50, cy, 35, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Cockpit Crosshair Pitch Reticle
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          // Center dot
          ctx.arc(W * 0.5, H * 0.5, 4, 0, Math.PI * 2);
          // Wings lines
          ctx.moveTo(W * 0.5 - 45, H * 0.5);
          ctx.lineTo(W * 0.5 - 15, H * 0.5);
          ctx.moveTo(W * 0.5 + 15, H * 0.5);
          ctx.lineTo(W * 0.5 + 45, H * 0.5);
          ctx.stroke();

          // Heading Tape at Top
          ctx.fillStyle = '#0f172aee';
          ctx.fillRect(W * 0.5 - 120, 10, 240, 28);
          ctx.strokeStyle = '#10b981';
          ctx.strokeRect(W * 0.5 - 120, 10, 240, 28);
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`HDG 094° · NAV TO ${destinationCity.toUpperCase()}`, W * 0.5, 28);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [mode, phase, throttle, pitchDeg, altitudeFt, weather]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[95vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{aircraft.imageBadge}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-condensed uppercase tracking-wider text-white">
                  Desplazamiento Aéreo: {aircraft.brand} {aircraft.model}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  {aircraft.ownerType === 'CLUB_OFFICIAL' ? 'AVIÓN OFICIAL DEL CLUB' : 'JET PRIVADO DEL ENTRENADOR'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ruta: Base local ➔ {destinationCity} ({rivalClubName}) · {distanceKm} km · Clima: {weather}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {mode === 'briefing' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Flight Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-condensed">Aeronave</span>
                <p className="text-sm font-bold text-white">{aircraft.model}</p>
                <p className="text-xs text-emerald-400 font-mono">Seguridad: {'⭐'.repeat(aircraft.safetyRating)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-condensed">Piloto al mando</span>
                <p className="text-sm font-bold text-white">
                  {isManagerPilot ? 'Comandante Técnico (Tú mismo)' : 'Comandante Comercial Titulado'}
                </p>
                <p className="text-xs text-blue-400 font-mono">
                  {isManagerPilot ? 'Licencia Comercial Oficial en vigor' : 'Tripulación certificada del club'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-condensed">Condiciones meteorológicas</span>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span>{weather}</span>
                </p>
                <p className="text-xs text-slate-400 font-mono">Viento: 12 nudos cruzado</p>
              </div>
            </div>

            {/* Flight Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white uppercase font-condensed">
                      Opción A: Simulación Rápida de Vuelo
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    El vuelo se resuelve instantáneamente mediante los cálculos de navegación automática. La plantilla descansará en cabina y llegará con óptima frescura y moral alta al estadio.
                  </p>
                </div>
                <button
                  onClick={handleSimulateAuto}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase font-condensed tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 text-blue-400" />
                  <span>Simular Vuelo Automático</span>
                </button>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border-2 border-emerald-500/40 hover:border-emerald-500 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-emerald-300 uppercase font-condensed">
                      Opción B: Pilotar el Avión en Cabina
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Toma los mandos en un minijuego arcade en 3 fases: Despegue a máxima potencia, Crucero esquivando turbulencias y Aterrizaje suave en destino. Si realizas una maniobra perfecta, ¡la plantilla recibirá un bonus extra de moral!
                  </p>
                </div>
                <button
                  onClick={handleStartArcade}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs sm:text-sm font-black uppercase font-condensed tracking-wider shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" />
                  <span>Tomar los Mandos y Pilotar</span>
                </button>
              </div>
            </div>

            {/* Emergency Disaster Option (For extreme storytelling) */}
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-[11px] text-red-300">
                  Evento extremo de catástrofe aérea (accidente, luto oficial y rescate solidario de 25M € para reconstruir el club).
                </span>
              </div>
              <button
                onClick={() => setShowCrashConfirm(true)}
                className="px-3 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-[10px] font-bold uppercase rounded font-mono"
              >
                Provocar Accidente Crítico
              </button>
            </div>
          </div>
        )}

        {/* Arcade Cockpit Simulator View */}
        {mode === 'arcade' && (
          <div className="flex-1 flex flex-col bg-slate-950 p-2 sm:p-4 space-y-3">
            {/* Instruments Top Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-condensed block">Fase</span>
                <span className="text-xs sm:text-sm font-black text-amber-400 uppercase">
                  {phase === 'takeoff' ? '1. Despegue' : phase === 'cruise' ? '2. Crucero' : '3. Aterrizaje'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-condensed block">Velocidad</span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {Math.round(speedKnots)} kts
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-condensed block">Altitud</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400">
                  {Math.round(altitudeFt).toLocaleString()} ft
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-condensed block">Progreso Ruta</span>
                <span className="text-xs sm:text-sm font-black text-cyan-400">
                  {Math.round(flightProgress)}%
                </span>
              </div>
            </div>

            {/* Flight Canvas HUD */}
            <div className="relative flex-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 min-h-[300px] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-full max-h-[380px] object-contain rounded-lg"
              />

              {/* Status Message Overlay Banner */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-700 text-center p-2 rounded-lg text-xs font-bold text-slate-200">
                {flightStatusMsg}
              </div>
            </div>

            {/* Flight Controls (Accessible Touch and Click Buttons) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 items-center">
              {/* Throttle Controls */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Gases / Potencia:</span>
                  <span className="text-white font-bold">{throttle}%</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setThrottle((t) => Math.max(0, t - 20))}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white"
                  >
                    - Potencia
                  </button>
                  <button
                    onClick={() => setThrottle((t) => Math.min(100, t + 20))}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded text-slate-950"
                  >
                    + Potencia
                  </button>
                </div>
              </div>

              {/* Pitch Controls (Subir / Bajar Morro) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Cabeceo (Pitch):</span>
                  <span className="text-white font-bold">{pitchDeg > 0 ? `+${pitchDeg}°` : `${pitchDeg}°`}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPitchDeg((p) => Math.max(-12, p - 3))}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white flex items-center justify-center gap-1"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bajar Morro</span>
                  </button>
                  <button
                    onClick={() => setPitchDeg((p) => Math.min(15, p + 3))}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white flex items-center justify-center gap-1"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Subir Morro</span>
                  </button>
                </div>
              </div>

              {/* Abort / Finish Helper */}
              <div>
                <button
                  onClick={() => {
                    setLandingTouchScore(90);
                    setMode('completed');
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold font-condensed uppercase tracking-wider"
                >
                  Finalizar Vuelo Ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flight Completed Results */}
        {mode === 'completed' && (
          <div className="p-8 text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black font-condensed uppercase tracking-wider text-white">
                ¡Aterrizaje en {destinationCity} completado!
              </h3>
              <p className="text-sm text-slate-300">
                Puntuación de toma en pista: <span className="font-mono font-bold text-emerald-400">{landingTouchScore} / 100</span>
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Moral de la plantilla:</span>
                <span className="text-emerald-400 font-bold">+6 puntos de motivación</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Condición física:</span>
                <span className="text-white font-bold">Óptima (viaje en jet de lujo)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Horas de vuelo anotadas:</span>
                <span className="text-blue-400 font-bold">+2.0 horas al historial de piloto</span>
              </div>
            </div>

            <button
              onClick={() => {
                onFlightComplete({
                  success: true,
                  landingScore: landingTouchScore,
                  crashCatastrophic: false,
                  report: `Aterrizaje impecable en ${destinationCity} (${landingTouchScore}/100). La plantilla del club llega motivada y en óptima forma.`,
                });
              }}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-sm font-black uppercase font-condensed tracking-wider shadow-lg hover:scale-105 transition-transform"
            >
              Continuar hacia el Estadio
            </button>
          </div>
        )}

        {/* Modal Confirm Accident Crash */}
        {showCrashConfirm && (
          <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center p-4 z-50">
            <div className="bg-red-950 border border-red-700 p-6 rounded-2xl max-w-md w-full text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
              <h3 className="text-xl font-black font-condensed uppercase text-white">
                ¿Confirmar Accidente Aéreo Catastrófico?
              </h3>
              <p className="text-xs text-red-200">
                Esta acción destruirá el avión del club y retirará a la actual plantilla por luto. Se recibirán 25.000.000 € del fondo solidario internacional y 18 nuevos canteranos para refundar deportivamente la entidad desde abajo.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCrashConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTriggerCatastrophicCrash}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black uppercase"
                >
                  Confirmar Tragedia
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
