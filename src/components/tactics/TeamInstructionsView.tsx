import React from 'react';
import { Club } from '../../types/club';
import { DEFAULT_TEAM_INSTRUCTIONS, TeamTacticalInstructions } from '../../types/tactics';
import { playClickSound } from '../../utils/audio';
import { 
  Sliders, 
  Shield, 
  Zap, 
  RotateCcw, 
  Compass, 
  Crosshair, 
  Clock, 
  Flame, 
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

interface TeamInstructionsViewProps {
  club: Club;
  onUpdateClub: (updatedClub: Club) => void;
}

export const TeamInstructionsView: React.FC<TeamInstructionsViewProps> = ({
  club,
  onUpdateClub,
}) => {
  const instructions: TeamTacticalInstructions = club.teamInstructions || DEFAULT_TEAM_INSTRUCTIONS;

  const handleChange = <K extends keyof TeamTacticalInstructions>(
    key: K,
    value: TeamTacticalInstructions[K]
  ) => {
    playClickSound();
    onUpdateClub({
      ...club,
      teamInstructions: {
        ...instructions,
        [key]: value,
      },
    });
  };

  const handleResetDefaults = () => {
    playClickSound();
    onUpdateClub({
      ...club,
      teamInstructions: { ...DEFAULT_TEAM_INSTRUCTIONS },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wide flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Instrucciones Tácticas Colectivas
          </h3>
          <p className="text-xs text-slate-400">
            Define la identidad, ritmo de circulación, altura de bloque y comportamiento sin balón del equipo.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold font-condensed uppercase rounded-xl border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Instrucciones</span>
        </button>
      </div>

      {/* 4 Thematic Tactical Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE 1: FILOSOFÍA, POSESIÓN Y SALIDA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400">
            <Compass className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-condensed tracking-wider">
              1. Filosofía de Juego & Construcción
            </h4>
          </div>

          {/* 1. Estilo de juego */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Estilo de Juego Principal
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['Tiki-Taka', 'Contraataque', 'Juego Directo', 'Gegenpressing', 'Bloque Bajo', 'Equilibrado'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('estiloJuego', opt)}
                  className={`p-2 rounded-xl text-center font-bold text-[11px] font-condensed uppercase tracking-wide transition-all border ${
                    instructions.estiloJuego === opt
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Posesión */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Criterio de Posesión
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['Control Absoluto', 'Dominio', 'Equilibrada', 'Vertical'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('posesion', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.posesion === opt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Salida de balón */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Salida de Balón desde la Zaga
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['En Corto desde Atrás', 'Apoyo en Mediocentros', 'Balón Largo al Punta', 'Salida Mixta'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('salidaBalon', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.salidaBalon === opt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Construcción y Vías de Ataque */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Zona de Construcción Preferente
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Por Banda Izquierda', 'Por Banda Derecha', 'Por el Centro', 'Ambas Bandas', 'Variada'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('construccion', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.construccion === opt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Ritmo de juego */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Ritmo de Circulación
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Frenético', 'Rápido', 'Pausado', 'Control del Tiempo'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('ritmo', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.ritmo === opt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOQUE 2: FASE OFENSIVA & LLEGADA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sky-400">
            <Crosshair className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-condensed tracking-wider">
              2. Fase Ofensiva, Centros & Profundidad
            </h4>
          </div>

          {/* 6. Anchura */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Anchura en Ataque
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Muy Abierto', 'Abierto', 'Estándar', 'Estrecho', 'Por el Centro'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('anchura', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.anchura === opt
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Centros */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Tipo de Centros al Área
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(['Al Primer Palo', 'Al Segundo Palo', 'Centros Tensos', 'Centros Flotados', 'Rasos a la Llegada'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('centros', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.centros === opt
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 8. Juego directo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Tipo de Pase en Último Tercio
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Balón al Pie', 'Pase al Espacio', 'Directo a la Referencia'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('juegoDirecto', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.juegoDirecto === opt
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 9. Contraataque */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Conducta tras Recuperar el Balón
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Inmediato y Vertical', 'Transición Organizada', 'Mantener Posesión'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('contraataque', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.contraataque === opt
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOQUE 3: FASE DEFENSIVA & PRESIÓN */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-rose-400">
            <Shield className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-condensed tracking-wider">
              3. Fase Defensiva, Altura de Bloque & Marcaje
            </h4>
          </div>

          {/* 10. Presión */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Línea e Intensidad de Presión
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Asfixiante', 'Alta', 'Media', 'Baja'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('presion', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.presion === opt
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 11. Altura defensiva */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Altura de la Línea Defensiva
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['Muy Adelantada', 'Adelantada', 'Media', 'Repliegue Intensivo'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('alturaDefensiva', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.alturaDefensiva === opt
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 12. Marcaje */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Tipo de Marcaje Defensivo
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Zonal', 'Al Hombre', 'Mixto con Coberturas'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('marcaje', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.marcaje === opt
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 13. Intensidad de entrada */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Intensidad y Agresividad en las Entradas
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Al Límite', 'Fuerte', 'Controlada', 'Precavida'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('intensidad', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.intensidad === opt
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 14. Fuera de juego */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Trampa del Fuera de Juego
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Tirar el Fuera de Juego', 'Línea Prudente'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('fueraDeJuego', opt)}
                  className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.fueraDeJuego === opt
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOQUE 4: TRANSICIONES & GESTIÓN DEL RESULTADO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400">
            <Flame className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-condensed tracking-wider">
              4. Transición Defensiva & Gestión del Resultado
            </h4>
          </div>

          {/* 15. Transiciones tras pérdida */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Comportamiento Inmediato tras Pérdida de Balón
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {(['Presión tras Pérdida', 'Repliegue Inmediato', 'Reorganización Táctica'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('transiciones', opt)}
                  className={`p-2 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.transiciones === opt
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 16. Gestión del resultado */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
              Manejo del Cronómetro y Gestión del Marcador
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['Perder Tiempo', 'Buscar Sentenciar', 'Enfriar el Partido', 'Normal'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChange('gestionResultado', opt)}
                  className={`p-2 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                    instructions.gestionResultado === opt
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Tactical Summary Readout */}
          <div className="mt-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold font-condensed block">
              Resumen del Modelo de Juego Aplicado
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              Equipo orientado al <strong className="text-emerald-400 font-bold">{instructions.estiloJuego}</strong> con posesión <strong className="text-sky-400 font-bold">{instructions.posesion}</strong> y salida <strong className="text-white font-bold">{instructions.salidaBalon}</strong>. Línea defensiva en <strong className="text-rose-400 font-bold">{instructions.alturaDefensiva}</strong> con presión <strong className="text-amber-400 font-bold">{instructions.presion}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
