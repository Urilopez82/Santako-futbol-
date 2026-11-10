import React, { useState } from 'react';
import { Club } from '../../types/club';
import { Player } from '../../types/player';
import { 
  DayTrainingSchedule, 
  DEFAULT_WEEKLY_TRAINING, 
  IndividualTrainingFocus, 
  TrainingSessionType, 
  WeeklyTrainingPlan 
} from '../../types/tactics';
import { playClickSound } from '../../utils/audio';
import { 
  Calendar, 
  Dumbbell, 
  Heart, 
  Zap, 
  Shield, 
  Crosshair, 
  RotateCcw, 
  Sun, 
  Moon, 
  Activity, 
  Check, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface WeeklyTrainingViewProps {
  club: Club;
  playersMap: Record<string, Player>;
  onUpdateClub: (updatedClub: Club) => void;
}

const SESSION_LABELS: Record<TrainingSessionType, { label: string; category: string; color: string }> = {
  FISICO_RESISTENCIA: { label: 'Físico: Resistencia & Fondo', category: 'Físico', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
  FISICO_VELOCIDAD: { label: 'Físico: Velocidad & Sprints', category: 'Físico', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
  FISICO_FUERZA: { label: 'Físico: Fuerza & Potencia', category: 'Físico', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
  TECNICA_PASE: { label: 'Técnica: Pase & Rondo', category: 'Técnica', color: 'text-sky-400 bg-sky-950/60 border-sky-500/30' },
  TECNICA_REGATE: { label: 'Técnica: Regate & 1vs1', category: 'Técnica', color: 'text-sky-400 bg-sky-950/60 border-sky-500/30' },
  TECNICA_REMATE: { label: 'Técnica: Definición & Remate', category: 'Técnica', color: 'text-sky-400 bg-sky-950/60 border-sky-500/30' },
  DEFENSA_MARCAJE: { label: 'Defensa: Marcaje Zonal', category: 'Defensa', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' },
  DEFENSA_JUEGO_AEREO: { label: 'Defensa: Juego Aéreo & Despejes', category: 'Defensa', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' },
  DEFENSA_ENTRADAS: { label: 'Defensa: Coberturas & Robos', category: 'Defensa', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' },
  TACTICA_AUTOMATISMOS: { label: 'Táctica: Automatismos de Ataque', category: 'Táctica', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
  TACTICA_ESTRATEGIA: { label: 'Táctica: Estrategia de Partido', category: 'Táctica', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
  TACTICA_BALON_PARADO: { label: 'Táctica: Balón Parado Ofensivo/Defensivo', category: 'Táctica', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
  TACTICA_PREPARACION_RIVAL: { label: 'Táctica: Preparación Específica del Rival', category: 'Táctica', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
  RECUPERACION_FISIOTERAPIA: { label: 'Recuperación: Crioterapia & Fisio', category: 'Recuperación', color: 'text-teal-400 bg-teal-950/60 border-teal-500/30' },
  DESCANSO_TOTAL: { label: 'Descanso Total de la Plantilla', category: 'Descanso', color: 'text-slate-400 bg-slate-950 border-slate-800' },
};

export const WeeklyTrainingView: React.FC<WeeklyTrainingViewProps> = ({
  club,
  playersMap,
  onUpdateClub,
}) => {
  const plan: WeeklyTrainingPlan = club.weeklyTraining || DEFAULT_WEEKLY_TRAINING;
  const allPlayers = (club.playerIds || []).map((id) => playersMap[id]).filter(Boolean);
  const [selectedPlayerForFocus, setSelectedPlayerForFocus] = useState<string>(allPlayers[0]?.id || '');

  const handleUpdateSchedule = (dayIndex: number, slot: 'morning' | 'afternoon', session: TrainingSessionType) => {
    playClickSound();
    const newSchedule = [...plan.schedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      [slot]: session,
    };

    onUpdateClub({
      ...club,
      weeklyTraining: {
        ...plan,
        schedule: newSchedule,
      },
    });
  };

  const handleUpdateIntensity = (intensity: WeeklyTrainingPlan['collectiveIntensity']) => {
    playClickSound();
    onUpdateClub({
      ...club,
      weeklyTraining: {
        ...plan,
        collectiveIntensity: intensity,
      },
    });
  };

  const handleUpdateIndividualFocus = (
    playerId: string,
    attributeFocus: IndividualTrainingFocus['attributeFocus'],
    intensity: IndividualTrainingFocus['intensity']
  ) => {
    playClickSound();
    onUpdateClub({
      ...club,
      weeklyTraining: {
        ...plan,
        individualFoci: {
          ...plan.individualFoci,
          [playerId]: { playerId, attributeFocus, intensity },
        },
      },
    });
  };

  const handleResetSchedule = () => {
    playClickSound();
    onUpdateClub({
      ...club,
      weeklyTraining: { ...DEFAULT_WEEKLY_TRAINING },
    });
  };

  // Calculate training load distribution
  const allSlots = plan.schedule.flatMap((d) => [d.morning, d.afternoon]);
  const counts = {
    fisico: allSlots.filter((s) => s.startsWith('FISICO_')).length,
    tecnica: allSlots.filter((s) => s.startsWith('TECNICA_')).length,
    defensa: allSlots.filter((s) => s.startsWith('DEFENSA_')).length,
    tactica: allSlots.filter((s) => s.startsWith('TACTICA_')).length,
    recuperacion: allSlots.filter((s) => s.includes('RECUPERACION') || s.includes('DESCANSO')).length,
  };

  const focusedPlayer = playersMap[selectedPlayerForFocus] || allPlayers[0];
  const currentFocus = (focusedPlayer && plan.individualFoci[focusedPlayer.id]) || {
    playerId: focusedPlayer?.id || '',
    attributeFocus: 'pase' as const,
    intensity: 'Normal' as const,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wide flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            Planificación y Calendario de Entrenamiento Semanal
          </h3>
          <p className="text-xs text-slate-400">
            Diseña los microciclos de trabajo semanal en doble sesión (mañana y tarde), dosifica la carga física y asigna entrenamientos individualizados.
          </p>
        </div>

        {/* Collective Intensity Selector */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-xl flex items-center gap-1 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-condensed font-bold px-2">
              Carga Global:
            </span>
            {(['Baja', 'Media', 'Alta'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleUpdateIntensity(lvl)}
                className={`px-3 py-1 font-bold font-condensed uppercase rounded-lg transition-all ${
                  plan.collectiveIntensity === lvl
                    ? lvl === 'Alta'
                      ? 'bg-rose-500 text-slate-950 font-black'
                      : lvl === 'Media'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-sky-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetSchedule}
            title="Restablecer microciclo semanal por defecto"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 border border-slate-800 rounded-xl"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Microcycle Load Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono-num">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-amber-400 uppercase font-bold font-condensed block">Físico</span>
          <span className="text-base font-bold text-slate-100">{counts.fisico} Sesiones</span>
          <span className="text-[10px] text-slate-500 block">Resistencia & Fuerza</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-sky-400 uppercase font-bold font-condensed block">Técnica</span>
          <span className="text-base font-bold text-slate-100">{counts.tecnica} Sesiones</span>
          <span className="text-[10px] text-slate-500 block">Pase & Remate</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-rose-400 uppercase font-bold font-condensed block">Defensa</span>
          <span className="text-base font-bold text-slate-100">{counts.defensa} Sesiones</span>
          <span className="text-[10px] text-slate-500 block">Marcaje & Aéreo</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-emerald-400 uppercase font-bold font-condensed block">Táctica</span>
          <span className="text-base font-bold text-slate-100">{counts.tactica} Sesiones</span>
          <span className="text-[10px] text-slate-500 block">Estrategia & Rival</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-teal-400 uppercase font-bold font-condensed block">Recuperación</span>
          <span className="text-base font-bold text-slate-100">{counts.recuperacion} Sesiones</span>
          <span className="text-[10px] text-slate-500 block">Descanso Activo</span>
        </div>
      </div>

      {/* Weekly Schedule Grid (Lunes a Domingo) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Calendario Semanal — Turnos de Mañana y Tarde
          </span>
          <span className="text-[11px] text-slate-400">
            Haz clic en cualquier sesión para cambiar el tipo de entrenamiento.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {plan.schedule.map((day, idx) => {
            const morningMeta = SESSION_LABELS[day.morning];
            const afternoonMeta = SESSION_LABELS[day.afternoon];

            return (
              <div
                key={day.dayName}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-white font-condensed uppercase tracking-wider">
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-num">Día {idx + 1}</span>
                </div>

                {/* Morning Slot */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <Sun className="w-3 h-3" /> Mañana (10:00)
                  </span>
                  <select
                    value={day.morning}
                    onChange={(e) => handleUpdateSchedule(idx, 'morning', e.target.value as any)}
                    className={`w-full text-[10px] font-semibold px-2 py-1.5 rounded-lg border focus:outline-none ${morningMeta.color}`}
                  >
                    {Object.keys(SESSION_LABELS).map((sKey) => (
                      <option key={sKey} value={sKey} className="bg-slate-900 text-slate-100">
                        {SESSION_LABELS[sKey as TrainingSessionType].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Afternoon Slot */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-sky-400 flex items-center gap-1">
                    <Moon className="w-3 h-3" /> Tarde (17:00)
                  </span>
                  <select
                    value={day.afternoon}
                    onChange={(e) => handleUpdateSchedule(idx, 'afternoon', e.target.value as any)}
                    className={`w-full text-[10px] font-semibold px-2 py-1.5 rounded-lg border focus:outline-none ${afternoonMeta.color}`}
                  >
                    {Object.keys(SESSION_LABELS).map((sKey) => (
                      <option key={sKey} value={sKey} className="bg-slate-900 text-slate-100">
                        {SESSION_LABELS[sKey as TrainingSessionType].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Training Focus Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <Zap className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-condensed tracking-wider">
              Entrenamiento Individualizado por Futbolista
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Focaliza horas extra de trabajo técnico o físico en un atributo clave de cada jugador.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Player Selector List */}
          <div className="lg:col-span-5 space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {allPlayers.map((p) => {
              const isSelected = p.id === focusedPlayer?.id;
              const focusData = plan.individualFoci[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedPlayerForFocus(p.id);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {p.primaryPosition}
                    </span>
                    <span className="font-bold truncate">{p.firstName} {p.lastName}</span>
                  </div>

                  <span className="text-[10px] text-amber-400 font-mono-num uppercase font-bold shrink-0">
                    {focusData ? `Foco: ${focusData.attributeFocus}` : 'General'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Focus Editor Card */}
          {focusedPlayer && (
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                    Plan Individual de {focusedPlayer.firstName} {focusedPlayer.lastName}
                  </h5>
                  <span className="text-xs text-slate-400">
                    Posición: {focusedPlayer.primaryPosition} · {focusedPlayer.age} años · Media: {focusedPlayer.overallRating} OVR
                  </span>
                </div>
              </div>

              {/* Attribute Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
                  Atributo de Especialización
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['disparo', 'pase', 'regate', 'defensa', 'velocidad', 'resistencia', 'fuerza', 'vision', 'liderazgo'] as const).map((attr) => {
                    const isSelected = currentFocus.attributeFocus === attr;
                    const val = focusedPlayer.attributes[attr];
                    return (
                      <button
                        key={attr}
                        onClick={() => handleUpdateIndividualFocus(focusedPlayer.id, attr, currentFocus.intensity)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] uppercase block font-condensed">{attr}</span>
                        <span className="text-xs font-mono-num font-bold text-white">{val} / 99</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intensity Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
                  Carga Extra de Trabajo
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['Suave', 'Normal', 'Intensa'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleUpdateIndividualFocus(focusedPlayer.id, currentFocus.attributeFocus, lvl)}
                      className={`p-2 rounded-xl text-center font-bold font-condensed uppercase border ${
                        currentFocus.intensity === lvl
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
