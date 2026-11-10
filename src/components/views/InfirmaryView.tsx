import React, { useState } from 'react';
import { GameSave, NewsItem } from '../../types/game';
import { DetailedInjury, TreatmentType } from '../../types/infirmary';
import { applyTreatmentToInjury, ensureInfirmaryState } from '../../engine/infirmaryEngine';
import { playClickSound, playGoalSound } from '../../utils/audio';
import { 
  HeartPulse, 
  Activity, 
  Stethoscope, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  User,
  FlaskConical
} from 'lucide-react';

interface InfirmaryViewProps {
  gameSave: GameSave;
  onUpdateSave: (newSave: GameSave) => void;
}

export const InfirmaryView: React.FC<InfirmaryViewProps> = ({
  gameSave,
  onUpdateSave,
}) => {
  const userClub = gameSave.clubs[gameSave.userClubId];
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType>('FISIOTERAPIA_INTENSIVA');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Ensure state is updated
  const currentSave = ensureInfirmaryState(gameSave);
  const injuriesMap = currentSave.infirmaryInjuries || {};
  const injuredList = Object.values(injuriesMap);

  const doctorMember = userClub?.staffMembers?.find((s: any) => s.role === 'Médico Jefe' || s.role === 'Fisioterapeuta Jefe');
  const doctor = {
    name: doctorMember?.name || 'Dr. Alejandro Ripoll',
    level: doctorMember ? Math.max(1, Math.min(5, Math.round((doctorMember.ability || 15) / 4))) : 3,
    experience: '12 temporadas',
  };

  const handleApplyTreatment = (playerId: string, treatment: TreatmentType) => {
    playClickSound();
    const { updatedSave } = applyTreatmentToInjury(currentSave, playerId, treatment);
    onUpdateSave(updatedSave);
    playGoalSound();
    setActionNotice(`Nuevo protocolo médico asignado correctamente con supervisión del ${doctor.name}.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* HEADER CLINIC BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 opacity-10 pointer-events-none">
          <HeartPulse className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SERVICIOS MÉDICOS OFICIALES
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {userClub?.shortName || userClub?.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-condensed tracking-wider uppercase text-white mt-0.5">
                Enfermería & Centro de Alto Rendimiento
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Diagnóstico de patologías, seguimiento de readaptación física y protocolos de recuperación acelerada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-emerald-500/30 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-condensed">Jefe Médico</span>
              <span className="text-xs font-bold text-white font-condensed">{doctor.name}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-300 font-mono">
              ★{doctor.level}
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold font-condensed uppercase tracking-wider flex items-center gap-2 shadow-xl animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* QUICK STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-condensed block">Bajas Activas</span>
            <span className="text-xl font-black text-rose-400 font-mono">{injuredList.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-condensed block">Disponibilidad Plantilla</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {Math.max(0, 100 - injuredList.length * 4)}%
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-condensed block">Nivel Instalaciones</span>
            <span className="text-xl font-black text-blue-400 font-mono">
              Nv. {userClub?.facilities?.medicalCenterLevel || 2} / 5
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-condensed block">Efectividad Diagnóstica</span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {80 + (doctor.level || 3) * 4}%
            </span>
          </div>
        </div>
      </div>

      {/* MAIN INJURIES LIST */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-300 uppercase font-condensed tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Ficha de Jugadores en Tratamiento y Readaptación</span>
        </h2>

        {injuredList.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              🏥
            </div>
            <h3 className="text-lg font-black text-white font-condensed uppercase tracking-wider">
              ¡Enfermería Despejada!
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Actualmente no hay ningún futbolista en la enfermería del {userClub?.name}. Toda la plantilla se encuentra en perfectas condiciones físicas y disponible para la competición oficial.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {injuredList.map((inj) => {
              const player = currentSave.players[inj.playerId];
              const completedWeeks = Math.max(0, inj.initialWeeks - inj.weeksRemaining);
              const progressRatio = Math.min(100, Math.round((completedWeeks / Math.max(1, inj.initialWeeks)) * 100));

              let severityBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              if (inj.severity === 'MODERADA') severityBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              if (inj.severity === 'GRAVE') severityBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              if (inj.severity === 'CRÍTICA') severityBadge = 'bg-red-950 text-red-400 border-red-500 animate-pulse';

              return (
                <div 
                  key={inj.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg font-black font-condensed text-amber-400 shadow">
                        {inj.position}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white font-condensed tracking-wide">
                          {inj.playerName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${severityBadge}`}>
                            {inj.severity}
                          </span>
                          <span className="text-xs text-rose-400 font-bold font-condensed truncate">
                            {inj.injuryName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-emerald-400 block">
                        {inj.weeksRemaining} {inj.weeksRemaining === 1 ? 'semana' : 'semanas'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Restante estimado</span>
                    </div>
                  </div>

                  {/* RECOVERY PROGRESS BAR */}
                  <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between text-[11px] font-mono text-slate-300">
                      <span>Proceso de Recuperación:</span>
                      <span className="text-emerald-400 font-bold">{progressRatio}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full transition-all duration-300"
                        style={{ width: `${progressRatio}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Baja desde: {inj.dateOccurred}</span>
                      <span>Alta médica: {inj.estimatedReturnDate}</span>
                    </div>
                  </div>

                  {/* ACTIVE TREATMENT & PROTOCOL */}
                  <div className="text-xs space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-condensed uppercase text-[11px]">Tratamiento en Curso:</span>
                      <span className="text-amber-300 font-bold font-condensed">{inj.treatmentName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Riesgo de recaída:</span>
                      <span className="font-mono text-slate-300">{inj.relapseRiskPercent}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Supervisado por:</span>
                      <span className="text-slate-300 font-condensed">{inj.responsibleDoctor} (Nv. {inj.doctorLevel})</span>
                    </div>
                  </div>

                  {/* SELECT NEW PROTOCOL */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {[
                      { id: 'CONSERVADOR', label: 'Conservador', desc: 'Reposo' },
                      { id: 'FISIOTERAPIA_INTENSIVA', label: 'Fisioterapia', desc: 'Acelerada' },
                      { id: 'INFILTRACION_PRP', label: 'Plasma PRP', desc: 'Regenerativo' },
                      { id: 'CAMARA_HIPERBARICA', label: 'Cámara Hiperbárica', desc: 'Oxigenación' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleApplyTreatment(inj.playerId, t.id as TreatmentType)}
                        className={`text-[10px] font-bold font-condensed uppercase px-2.5 py-1.5 rounded-lg border transition-all ${
                          inj.treatment === t.id
                            ? 'bg-emerald-600 text-slate-950 border-emerald-400 font-black'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* MEDICAL LOG */}
                  {inj.evolutionLog && inj.evolutionLog.length > 0 && (
                    <div className="text-[10px] text-slate-400 font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 max-h-20 overflow-y-auto space-y-1">
                      {inj.evolutionLog.map((log, lIdx) => (
                        <div key={lIdx} className="truncate">
                          • {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
