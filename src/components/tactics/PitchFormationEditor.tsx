import React, { useState } from 'react';
import { Club } from '../../types/club';
import { Player, Position } from '../../types/player';
import { FORMATIONS, FormationPreset, FormationSlot } from '../../types/tactics';
import { playClickSound } from '../../utils/audio';
import { 
  Users, 
  Move, 
  RotateCcw, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Info,
  Shield,
  Zap,
  Award
} from 'lucide-react';

interface PitchFormationEditorProps {
  club: Club;
  playersMap: Record<string, Player>;
  onUpdateClub: (updatedClub: Club) => void;
}

export const PitchFormationEditor: React.FC<PitchFormationEditorProps> = ({
  club,
  playersMap,
  onUpdateClub,
}) => {
  const [selectedFormationKey, setSelectedFormationKey] = useState<string>(
    club.tacticFormation || '4-3-3'
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [isFineTuningMode, setIsFineTuningMode] = useState(false);

  // Active slots: use custom slots if in Personalizada, else preset
  const preset: FormationPreset = FORMATIONS[selectedFormationKey] || FORMATIONS['4-3-3'];
  const activeSlots: FormationSlot[] =
    selectedFormationKey === 'Personalizada' && club.customFormationSlots && club.customFormationSlots.length === 11
      ? club.customFormationSlots
      : preset.slots;

  const allPlayers = (club.playerIds || []).map((id) => playersMap[id]).filter(Boolean);
  const starters = (club.startingElevenIds || []).map((id) => playersMap[id]).filter(Boolean);
  const bench = (club.benchPlayerIds || []).map((id) => playersMap[id]).filter(Boolean);
  const reserves = allPlayers.filter(
    (p) => !club.startingElevenIds.includes(p.id) && !club.benchPlayerIds.includes(p.id)
  );

  // Formation Change
  const handleFormationSelect = (fKey: string) => {
    playClickSound();
    setSelectedFormationKey(fKey);
    const newPreset = FORMATIONS[fKey] || FORMATIONS['4-3-3'];
    onUpdateClub({
      ...club,
      tacticFormation: fKey,
      customFormationSlots: fKey === 'Personalizada' ? (club.customFormationSlots || newPreset.slots) : newPreset.slots.map(s => ({ ...s })),
    });
  };

  // Click on Pitch slot
  const handleSlotClick = (slotIdx: number, player?: Player) => {
    playClickSound();
    setSelectedSlotIndex(slotIdx);

    if (!selectedPlayerId) {
      if (player) setSelectedPlayerId(player.id);
      return;
    }

    if (player && selectedPlayerId === player.id) {
      setSelectedPlayerId(null);
      return;
    }

    // Swap selectedPlayerId into slotIdx
    executePlayerSwap(selectedPlayerId, player ? player.id : null, slotIdx);
  };

  // Perform swap between two players or between a player and a target slot
  const executePlayerSwap = (playerAId: string, playerBId: string | null, targetSlotIdx?: number) => {
    const newStarters = [...club.startingElevenIds];
    const newBench = [...club.benchPlayerIds];

    const idxStarterA = newStarters.indexOf(playerAId);
    const idxBenchA = newBench.indexOf(playerAId);

    if (playerBId) {
      const idxStarterB = newStarters.indexOf(playerBId);
      const idxBenchB = newBench.indexOf(playerBId);

      if (idxStarterA !== -1 && idxStarterB !== -1) {
        newStarters[idxStarterA] = playerBId;
        newStarters[idxStarterB] = playerAId;
      } else if (idxStarterA !== -1 && idxBenchB !== -1) {
        newStarters[idxStarterA] = playerBId;
        newBench[idxBenchB] = playerAId;
      } else if (idxBenchA !== -1 && idxStarterB !== -1) {
        newBench[idxBenchA] = playerBId;
        newStarters[idxStarterB] = playerAId;
      } else if (idxBenchA !== -1 && idxBenchB !== -1) {
        newBench[idxBenchA] = playerBId;
        newBench[idxBenchB] = playerAId;
      } else if (idxStarterA !== -1 && reserves.some(r => r.id === playerBId)) {
        newStarters[idxStarterA] = playerBId;
      } else if (idxBenchA !== -1 && reserves.some(r => r.id === playerBId)) {
        newBench[idxBenchA] = playerBId;
      }
    } else if (targetSlotIdx !== undefined && targetSlotIdx >= 0 && targetSlotIdx < 11) {
      if (idxBenchA !== -1) {
        const displacedStarter = newStarters[targetSlotIdx];
        newStarters[targetSlotIdx] = playerAId;
        newBench[idxBenchA] = displacedStarter;
      } else if (idxStarterA !== -1) {
        const displacedStarter = newStarters[targetSlotIdx];
        newStarters[targetSlotIdx] = playerAId;
        newStarters[idxStarterA] = displacedStarter;
      }
    }

    setSelectedPlayerId(null);
    onUpdateClub({
      ...club,
      startingElevenIds: newStarters,
      benchPlayerIds: newBench,
    });
  };

  // Coordinate Nudge for Visual Custom Positioning
  const handleNudgeCoordinate = (dx: number, dy: number) => {
    if (selectedSlotIndex === null) return;
    playClickSound();

    const currentSlots = [...activeSlots];
    const target = currentSlots[selectedSlotIndex];
    if (!target) return;

    const newX = Math.max(5, Math.min(95, target.x + dx));
    const newY = Math.max(5, Math.min(95, target.y + dy));

    currentSlots[selectedSlotIndex] = {
      ...target,
      x: newX,
      y: newY,
    };

    setSelectedFormationKey('Personalizada');
    onUpdateClub({
      ...club,
      tacticFormation: 'Personalizada',
      customFormationSlots: currentSlots,
    });
  };

  // Reset to default preset
  const handleResetToPreset = () => {
    playClickSound();
    const originalPreset = FORMATIONS[selectedFormationKey === 'Personalizada' ? '4-3-3' : selectedFormationKey] || FORMATIONS['4-3-3'];
    onUpdateClub({
      ...club,
      tacticFormation: originalPreset.name,
      customFormationSlots: originalPreset.slots.map(s => ({ ...s })),
    });
  };

  // Position compatibility badge helper
  const getSuitabilityColor = (playerPos: Position, slotPos: Position) => {
    if (playerPos === slotPos) return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
    if (
      (playerPos === 'DFC' && ['LD', 'LI', 'MCD'].includes(slotPos)) ||
      (playerPos === 'MC' && ['MCD', 'MCO'].includes(slotPos)) ||
      (playerPos === 'ED' && ['EI', 'MCO', 'DC'].includes(slotPos)) ||
      (playerPos === 'EI' && ['ED', 'MCO', 'DC'].includes(slotPos))
    ) {
      return 'text-amber-400 bg-amber-950/80 border-amber-500/40';
    }
    return 'text-rose-400 bg-rose-950/80 border-rose-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Formation Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-condensed font-bold tracking-wider block">
            Editor de Formaciones Oficiales y Pizarra Personalizada
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.keys(FORMATIONS).map((fKey) => {
              const isSelected = selectedFormationKey === fKey;
              return (
                <button
                  key={fKey}
                  onClick={() => handleFormationSelect(fKey)}
                  className={`px-3 py-1.5 text-xs font-bold font-condensed uppercase tracking-wider rounded-lg transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {fKey}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine Tuning Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              setIsFineTuningMode(!isFineTuningMode);
            }}
            className={`px-3 py-2 text-xs font-bold font-condensed uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 border ${
              isFineTuningMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>{isFineTuningMode ? 'Modo Coordenadas Activo' : 'Ajustar Coordenadas'}</span>
          </button>

          <button
            onClick={handleResetToPreset}
            title="Restablecer posiciones al dibujo estándar"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 border border-slate-800 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Grass Pitch & Fine Tuning on Left, Squad Roster on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual 2D Football Pitch */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 font-condensed uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Pizarra Táctica — {selectedFormationKey}
            </span>
            <span className="text-slate-400 text-[11px]">
              {selectedPlayerId
                ? 'Selecciona otro jugador o casilla para intercambiar'
                : 'Haz clic en un jugador para gestionar su posición'}
            </span>
          </div>

          {/* Grass Pitch Container */}
          <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 rounded-2xl border-2 border-emerald-600/40 p-4 shadow-inner overflow-hidden select-none">
            {/* Pitch Grass Texture & Striping */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_50%,transparent_50%)] bg-[length:100%_12.5%] pointer-events-none" />

            {/* Field Markings */}
            <div className="absolute inset-3 border border-white/20 rounded pointer-events-none" />
            {/* Top Penalty Area (Rival) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-44 h-20 border-b border-x border-white/20 pointer-events-none" />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-8 border-b border-x border-white/20 pointer-events-none" />
            {/* Center Line & Circle */}
            <div className="absolute top-1/2 left-3 right-3 h-px bg-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/20 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full pointer-events-none" />
            {/* Bottom Penalty Area (Own Goal) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-44 h-20 border-t border-x border-white/20 pointer-events-none" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-8 border-t border-x border-white/20 pointer-events-none" />

            {/* 11 Player Nodes on Grass */}
            {activeSlots.map((slot) => {
              const player = starters[slot.slotIndex];
              const isSelected = player && selectedPlayerId === player.id;
              const isCurrentSlotSelected = selectedSlotIndex === slot.slotIndex;
              const roleInfo = player && club.playerInstructions?.[player.id];

              return (
                <div
                  key={slot.slotIndex}
                  onClick={() => handleSlotClick(slot.slotIndex, player)}
                  style={{
                    left: `${slot.x}%`,
                    bottom: `${slot.y}%`,
                    transform: 'translate(-50%, 50%)',
                  }}
                  className={`absolute flex flex-col items-center cursor-pointer transition-all ${
                    isSelected || isCurrentSlotSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'
                  }`}
                >
                  {/* Circle Player Kit Badge */}
                  <div
                    className={`w-11 h-11 rounded-full flex flex-col items-center justify-center font-bold font-condensed shadow-lg transition-transform border-2 ${
                      isSelected
                        ? 'ring-4 ring-amber-400 border-white scale-110 animate-pulse'
                        : isCurrentSlotSelected
                        ? 'ring-2 ring-emerald-400 border-white'
                        : 'border-slate-800'
                    }`}
                    style={{
                      backgroundColor: player ? club.primaryColor : '#1e293b',
                      color: player ? club.textColor : '#94a3b8',
                    }}
                  >
                    <span className="text-[13px] font-black leading-none">
                      {player ? player.overallRating : slot.label}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 leading-none">
                      {slot.label}
                    </span>
                  </div>

                  {/* Player Name Pill */}
                  <div className="mt-1 bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded shadow text-center max-w-[85px] truncate">
                    <span className="text-[10px] font-bold text-slate-100 block truncate">
                      {player ? player.lastName : 'Vacante'}
                    </span>
                    {roleInfo && (
                      <span className="text-[8px] text-emerald-400 font-condensed block truncate">
                        {roleInfo.role.slice(0, 12)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coordinate Adjustment Controls (Active when fine tuning) */}
          {isFineTuningMode && selectedSlotIndex !== null && (
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold font-condensed block">
                  Ajustando Casilla #{selectedSlotIndex + 1} ({activeSlots[selectedSlotIndex]?.label})
                </span>
                <span className="text-xs text-slate-300 font-mono-num">
                  X: {activeSlots[selectedSlotIndex]?.x}% · Y: {activeSlots[selectedSlotIndex]?.y}%
                </span>
              </div>

              {/* D-Pad Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNudgeCoordinate(-2, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                  title="Mover a la izquierda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleNudgeCoordinate(0, 2)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                    title="Adelantar posición"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleNudgeCoordinate(0, -2)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                    title="Retrasar posición"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleNudgeCoordinate(2, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
                  title="Mover a la derecha"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Squad Roster (Starters, Bench, Reserves) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wider">
                Convocatoria y Plantilla Activa
              </h3>
              <span className="text-xs text-slate-400">
                Haz clic en cualquier jugador para intercambiarlo en el once o banquillo.
              </span>
            </div>
            {selectedPlayerId && (
              <button
                onClick={() => setSelectedPlayerId(null)}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold font-condensed uppercase px-2 py-1 bg-rose-950/40 border border-rose-500/30 rounded-lg"
              >
                Cancelar Selección
              </button>
            )}
          </div>

          {/* Once Titular (11) */}
          <div className="space-y-2">
            <span className="text-[10px] text-emerald-400 uppercase font-condensed font-bold tracking-wider block">
              Once Titular ({starters.length}/11)
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {starters.map((p, idx) => {
                const isSelected = selectedPlayerId === p.id;
                const slotPos = activeSlots[idx]?.position || p.primaryPosition;
                const suitClass = getSuitabilityColor(p.primaryPosition, slotPos);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      playClickSound();
                      if (selectedPlayerId) executePlayerSwap(selectedPlayerId, p.id);
                      else setSelectedPlayerId(p.id);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-500 text-xs font-mono-num w-4 text-center">{idx + 1}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${suitClass}`}>
                        {p.primaryPosition}
                      </span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-100 truncate block">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-num">
                          {p.age} años · Moral: {p.morale}% · Condición: {p.fitness}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono-num">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        {p.overallRating} OVR
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banquillo (Suplentes) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-amber-400 uppercase font-condensed font-bold tracking-wider block">
              Banquillo de Suplentes ({bench.length})
            </span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {bench.map((p) => {
                const isSelected = selectedPlayerId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      playClickSound();
                      if (selectedPlayerId) executePlayerSwap(selectedPlayerId, p.id);
                      else setSelectedPlayerId(p.id);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p.primaryPosition}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {p.firstName} {p.lastName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 font-mono-num">
                      {p.overallRating} OVR
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reservas No Convocados */}
          {reserves.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-condensed font-bold tracking-wider block">
                Reservas y No Convocados ({reserves.length})
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {reserves.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      playClickSound();
                      if (selectedPlayerId) executePlayerSwap(selectedPlayerId, p.id);
                      else setSelectedPlayerId(p.id);
                    }}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs hover:bg-slate-800/40 cursor-pointer"
                  >
                    <span className="text-slate-400 truncate">
                      {p.primaryPosition} · {p.firstName} {p.lastName}
                    </span>
                    <span className="text-slate-400 font-mono-num text-[11px]">{p.overallRating} OVR</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
