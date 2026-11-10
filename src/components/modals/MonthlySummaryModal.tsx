import React from 'react';
import { playClickSound } from '../../utils/audio';
import { 
  Calendar, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  X, 
  ArrowRight,
  Flame,
  Award,
  Swords,
  Heart
} from 'lucide-react';

export interface MonthlySimulationSummary {
  monthName: string;
  season: string;
  startDate: string;
  endDate: string;
  daysSimulated: number;
  matchesPlayed: {
    id: string;
    competitionName: string;
    opponentName: string;
    isHome: boolean;
    homeScore: number;
    awayScore: number;
    scorers: string[];
    result: 'W' | 'D' | 'L';
    date: string;
  }[];
  record: {
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    gc: number;
  };
  financials: {
    initialBalance: number;
    finalBalance: number;
    delta: number;
    weeklyWagesPaid: number;
  };
  squadStatus: {
    avgMorale: number;
    avgCondition: number;
    injuredPlayers: { name: string; position: string; weeks: number }[];
    suspendedPlayers: { name: string; position: string; matches: number }[];
  };
  topPerformers: {
    name: string;
    position: string;
    rating: number;
    goals: number;
  }[];
  upcomingFixtures: {
    competitionName: string;
    opponentName: string;
    date: string;
    isHome: boolean;
  }[];
  headlines: string[];
}

interface MonthlySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthlySimulationSummary | null;
  clubName: string;
}

export const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  clubName,
}) => {
  if (!isOpen || !summary) return null;

  const isProfitable = summary.financials.delta >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-gradient-to-b from-slate-900 via-[#0a1220] to-[#050a12] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 px-5 py-4 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase font-condensed tracking-wider">
                  Dossier Ejecutivo Mensual — {summary.monthName}
                </h2>
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded uppercase font-mono-num">
                  {summary.daysSimulated} días simulados
                </span>
              </div>
              <p className="text-xs text-slate-300 font-condensed">
                Resumen oficial de rendimiento deportivo, tesorería, plantilla y calendario de {clubName} ({summary.startDate} al {summary.endDate})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Record */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed font-bold">
                Balance de Partidos
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-black text-white font-mono-num">
                  {summary.record.won}V - {summary.record.drawn}E - {summary.record.lost}D
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-num">
                Goles: <strong className="text-emerald-400">{summary.record.gf}</strong> a favor / <strong className="text-rose-400">{summary.record.gc}</strong> en contra
              </span>
            </div>

            {/* Financial Delta */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed font-bold">
                Flujo de Caja del Mes
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-mono-num">
                {isProfitable ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                )}
                <span className={`text-lg font-black ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isProfitable ? `+${summary.financials.delta.toLocaleString()} €` : `${summary.financials.delta.toLocaleString()} €`}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-num">
                Tesorería actual: {summary.financials.finalBalance.toLocaleString()} €
              </span>
            </div>

            {/* Squad Condition */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed font-bold">
                Estado Físico & Moral
              </span>
              <div className="flex items-center gap-3 mt-1 font-mono-num">
                <span className="text-base font-black text-amber-300">
                  ⚡ {summary.squadStatus.avgCondition}%
                </span>
                <span className="text-base font-black text-sky-300">
                  ❤️ {summary.squadStatus.avgMorale}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Media del primer equipo
              </span>
            </div>

            {/* Medical & Disciplinary */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-condensed font-bold">
                Bajas & Sanciones
              </span>
              <div className="flex items-center gap-3 mt-1 font-mono-num font-bold">
                <span className="text-rose-400">
                  🏥 {summary.squadStatus.injuredPlayers.length} lesiones
                </span>
                <span className="text-amber-400">
                  🟥 {summary.squadStatus.suspendedPlayers.length} sanciones
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Afectan al próximo encuentro
              </span>
            </div>
          </div>

          {/* Section: Partidos del Mes & Goleadores */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider font-condensed flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              Partidos Disputados en el Mes ({summary.matchesPlayed.length})
            </h3>

            {summary.matchesPlayed.length === 0 ? (
              <p className="text-slate-500 italic py-2">
                No se disputaron encuentros oficiales del club durante este periodo (mes de preparación o parón estival).
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {summary.matchesPlayed.map((m) => {
                  const isWin = m.result === 'W';
                  const isDraw = m.result === 'D';
                  return (
                    <div key={m.id} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-condensed uppercase ${
                          isWin ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' :
                          isDraw ? 'bg-amber-950 text-amber-400 border border-amber-500/50' :
                          'bg-rose-950 text-rose-400 border border-rose-500/50'
                        }`}>
                          {isWin ? 'VICTORIA' : isDraw ? 'EMPATE' : 'DERROTA'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                            <span>{m.isHome ? clubName : m.opponentName}</span>
                            <span className="px-1.5 py-0.5 bg-slate-900 rounded font-mono-num text-amber-300">
                              {m.homeScore} - {m.awayScore}
                            </span>
                            <span>{m.isHome ? m.opponentName : clubName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-condensed">
                            {m.competitionName} · {m.date}
                          </div>
                        </div>
                      </div>

                      {m.scorers.length > 0 && (
                        <div className="text-[11px] text-slate-300 font-sans flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-slate-400">Goles:</span>
                          <span className="font-semibold text-amber-200">{m.scorers.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dual Columns: Top Performers & Injuries/Sanctions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Performers */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-black text-sky-400 uppercase tracking-wider font-condensed flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                Jugadores Más Destacados del Mes
              </h3>

              {summary.topPerformers.length === 0 ? (
                <p className="text-slate-500 italic">Sin datos de rendimiento en este mes.</p>
              ) : (
                <div className="space-y-2">
                  {summary.topPerformers.map((tp, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-sky-950 text-sky-300 font-black text-[10px] flex items-center justify-center font-mono-num">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white text-xs block">{tp.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{tp.position}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono-num">
                        <span className="text-xs font-black text-amber-400 block">{tp.rating} OVR</span>
                        {tp.goals > 0 && (
                          <span className="text-[10px] text-emerald-400 font-bold">{tp.goals} goles este mes</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bajas Médicas y Disciplinarias */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider font-condensed flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Informe Médico y Disciplinario
              </h3>

              {summary.squadStatus.injuredPlayers.length === 0 && summary.squadStatus.suspendedPlayers.length === 0 ? (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Enfermería limpia y sin jugadores sancionados. ¡Plantilla al 100% disponible!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.squadStatus.injuredPlayers.map((inj, idx) => (
                    <div key={`inj_${idx}`} className="bg-rose-950/30 border border-rose-500/30 px-3 py-2 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-rose-200">{inj.name} ({inj.position})</span>
                        <span className="text-[10px] text-rose-400 block">Lesión muscular en recuperación</span>
                      </div>
                      <span className="font-mono-num font-bold text-rose-300 text-xs">
                        {inj.weeks} {inj.weeks === 1 ? 'semana' : 'semanas'}
                      </span>
                    </div>
                  ))}

                  {summary.squadStatus.suspendedPlayers.map((susp, idx) => (
                    <div key={`susp_${idx}`} className="bg-amber-950/30 border border-amber-500/30 px-3 py-2 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-amber-200">{susp.name} ({susp.position})</span>
                        <span className="text-[10px] text-amber-400 block">Sanción por acumulación de tarjetas / expulsión</span>
                      </div>
                      <span className="font-mono-num font-bold text-amber-300 text-xs">
                        {susp.matches} {susp.matches === 1 ? 'partido' : 'partidos'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: Próximos Encuentros del Siguiente Mes */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-condensed flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Calendario de Partidos del Próximo Mes ({summary.upcomingFixtures.length})
            </h3>

            {summary.upcomingFixtures.length === 0 ? (
              <p className="text-slate-500 italic">No hay partidos oficiales programados para el próximo mes.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {summary.upcomingFixtures.slice(0, 6).map((up, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-condensed">
                      <span>{up.competitionName}</span>
                      <span className="font-mono-num font-bold text-amber-400">{up.date}</span>
                    </div>
                    <div className="font-bold text-slate-100 flex items-center gap-1 truncate">
                      <span className="text-[10px] text-slate-400">{up.isHome ? 'vs' : '@'}</span>
                      <span className="truncate">{up.opponentName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-condensed">
            Temporada {summary.season} · Estado de partida guardado y listo para continuar
          </span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="pcf-btn pcf-btn-gold px-6 py-2 text-xs font-black uppercase tracking-wider shadow-lg"
          >
            Continuar la Temporada
          </button>
        </div>

      </div>
    </div>
  );
};
