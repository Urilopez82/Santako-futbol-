import React, { useState } from 'react';
import { Club } from '../../types/club';
import { Player } from '../../types/player';
import { PlayerTacticalRole, POSITION_ROLES_MAP } from '../../types/tactics';
import { playClickSound } from '../../utils/audio';
import { 
  User, 
  Shield, 
  Crosshair, 
  Sparkles, 
  Move, 
  Flame, 
  Zap, 
  RotateCcw,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface IndividualInstructionsViewProps {
  club: Club;
  playersMap: Record<string, Player>;
  onUpdateClub: (updatedClub: Club) => void;
}

export const IndividualInstructionsView: React.FC<IndividualInstructionsViewProps> = ({
  club,
  playersMap,
  onUpdateClub,
}) => {
  const starters = (club.startingElevenIds || []).map((id) => playersMap[id]).filter(Boolean);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(starters[0]?.id || '');

  const activePlayer = playersMap[selectedPlayerId] || starters[0];
  const instructionsMap = club.playerInstructions || {};

  const currentRole: PlayerTacticalRole = (activePlayer && instructionsMap[activePlayer.id]) || {
    playerId: activePlayer?.id || '',
    role: POSITION_ROLES_MAP[activePlayer?.primaryPosition || 'DC']?.[0] || 'Jugador de Equipo',
    duty: 'Apoyo',
    mentalidad: 'Equilibrada',
    libertadMovimiento: 'Ceñirse a la Posición',
    responsabilidadDefensiva: 'Ayudar en Defensa',
    posicionPartida: 'Centrado',
    instruccionesConBalon: 'Asegurar Posesión',
    instruccionesSinBalon: 'Cerrar Líneas',
  };

  const availableRoles = activePlayer ? POSITION_ROLES_MAP[activePlayer.primaryPosition] || ['Jugador de Equipo'] : [];

  const handleUpdateRole = (updates: Partial<PlayerTacticalRole>) => {
    if (!activePlayer) return;
    playClickSound();

    const updatedRole: PlayerTacticalRole = {
      ...currentRole,
      ...updates,
      playerId: activePlayer.id,
    };

    onUpdateClub({
      ...club,
      playerInstructions: {
        ...instructionsMap,
        [activePlayer.id]: updatedRole,
      },
    });
  };

  const handleApplyPresetRole = (roleName: string) => {
    let duty: PlayerTacticalRole['duty'] = 'Apoyo';
    let mentalidad: PlayerTacticalRole['mentalidad'] = 'Equilibrada';
    let conBalon: PlayerTacticalRole['instruccionesConBalon'] = 'Asegurar Posesión';
    let sinBalon: PlayerTacticalRole['instruccionesSinBalon'] = 'Cerrar Líneas';
    let libertad: PlayerTacticalRole['libertadMovimiento'] = 'Ceñirse a la Posición';

    if (roleName === 'Portero Líbero') {
      duty = 'Defensa';
      conBalon = 'Arriesgar en el Pase';
      sinBalon = 'Presión Feroz';
    } else if (roleName === 'Carrilero Ofensivo' || roleName === 'Extremo Invertido') {
      duty = 'Ataque';
      mentalidad = 'Ofensiva';
      conBalon = 'Conducir y Desbordar';
      sinBalon = 'Desmarques de Ruptura';
      libertad = 'Libertad Relativa';
    } else if (roleName === 'Falso Nueve' || roleName === 'Enganche Clásico' || roleName === 'Mediapunta Creador') {
      duty = 'Apoyo';
      mentalidad = 'Ofensiva';
      conBalon = 'Arriesgar en el Pase';
      sinBalon = 'Ofrecer Apoyo';
      libertad = 'Libertad Total';
    } else if (roleName === 'Hombre Objetivo' || roleName === 'Cazagoles de Área') {
      duty = 'Ataque';
      mentalidad = 'Ofensiva';
      conBalon = 'Disparar en Cuanto Haya Hueco';
      sinBalon = 'Desmarques de Ruptura';
    } else if (roleName === 'Pivote Destructor' || roleName === 'Marcador al Hombre') {
      duty = 'Defensa';
      mentalidad = 'Defensiva';
      conBalon = 'Asegurar Posesión';
      sinBalon = 'Presión Feroz';
    }

    handleUpdateRole({
      role: roleName,
      duty,
      mentalidad,
      instruccionesConBalon: conBalon,
      instruccionesSinBalon: sinBalon,
      libertadMovimiento: libertad,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wide flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Instrucciones Individuales y Asignación de Roles
          </h3>
          <p className="text-xs text-slate-400">
            Define la función táctica, rol específico, mentalidad y comportamiento con y sin balón de cada futbolista.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Starters Selector List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-md">
          <span className="text-[10px] text-slate-400 uppercase font-condensed font-bold tracking-wider block pb-2 border-b border-slate-800">
            Futbolistas del Once Titular ({starters.length})
          </span>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {starters.map((p, idx) => {
              const isSelected = p.id === activePlayer?.id;
              const roleAssigned = instructionsMap[p.id];

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedPlayerId(p.id);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-500 font-mono-num text-xs w-4">{idx + 1}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                      {p.primaryPosition}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-bold block text-slate-100 truncate">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {roleAssigned?.role || 'Rol Estándar'} · {roleAssigned?.duty || 'Apoyo'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-200 font-mono-num shrink-0">
                    {p.overallRating}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Player Role & Tactical Settings Drawer */}
        {activePlayer ? (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
            {/* Player Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold font-condensed text-base shadow border"
                  style={{
                    backgroundColor: club.primaryColor,
                    color: club.textColor,
                    borderColor: club.secondaryColor,
                  }}
                >
                  {activePlayer.primaryPosition}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                      {activePlayer.firstName} {activePlayer.lastName}
                    </h4>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-mono-num">
                      {activePlayer.overallRating} OVR
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {activePlayer.age} años · Pierna: Derecha · Moral: {activePlayer.morale}% · Condición: {activePlayer.fitness}%
                  </span>
                </div>
              </div>

              {/* Quick Stat Pill Bar */}
              <div className="flex items-center gap-3 text-xs font-mono-num bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-500 block">DIS</span>
                  <span className="font-bold text-slate-200">{activePlayer.attributes.disparo}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">PAS</span>
                  <span className="font-bold text-slate-200">{activePlayer.attributes.pase}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">REG</span>
                  <span className="font-bold text-slate-200">{activePlayer.attributes.regate}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">DEF</span>
                  <span className="font-bold text-slate-200">{activePlayer.attributes.defensa}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">VEL</span>
                  <span className="font-bold text-slate-200">{activePlayer.attributes.velocidad}</span>
                </div>
              </div>
            </div>

            {/* 1. Rol Táctico Específico */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase font-condensed tracking-wider block">
                1. Rol y Función en el Sistema (según demarcación {activePlayer.primaryPosition})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableRoles.map((rName) => {
                  const isCurrent = currentRole.role === rName;
                  return (
                    <button
                      key={rName}
                      onClick={() => handleApplyPresetRole(rName)}
                      className={`p-2.5 rounded-xl text-center font-bold text-xs font-condensed uppercase tracking-wider transition-all border ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {rName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Duty (Función) & Mentalidad Individual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
                  2. Tarea / Función Asignada
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Defensa', 'Apoyo', 'Ataque', 'Automática'] as const).map((dutyOpt) => (
                    <button
                      key={dutyOpt}
                      onClick={() => handleUpdateRole({ duty: dutyOpt })}
                      className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                        currentRole.duty === dutyOpt
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {dutyOpt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
                  3. Mentalidad Individual
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Defensiva', 'Equilibrada', 'Ofensiva'] as const).map((ment) => (
                    <button
                      key={ment}
                      onClick={() => handleUpdateRole({ mentalidad: ment })}
                      className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                        currentRole.mentalidad === ment
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {ment}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Libertad de Movimiento & Responsabilidad Defensiva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
                  4. Libertad de Movimiento
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Ceñirse a la Posición', 'Libertad Relativa', 'Libertad Total'] as const).map((lib) => (
                    <button
                      key={lib}
                      onClick={() => handleUpdateRole({ libertadMovimiento: lib })}
                      className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                        currentRole.libertadMovimiento === lib
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {lib}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
                  5. Responsabilidad Defensiva
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Ayudar en Defensa', 'Bajar en Córners', 'Descolgarse para la Contra'] as const).map((resp) => (
                    <button
                      key={resp}
                      onClick={() => handleUpdateRole({ responsabilidadDefensiva: resp })}
                      className={`p-1.5 rounded-lg text-center font-bold text-[10px] font-condensed uppercase transition-all border ${
                        currentRole.responsabilidadDefensiva === resp
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {resp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Posición de Partida */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase font-condensed block">
                6. Posición de Partida y Ocupación del Espacio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pegado a Banda', 'Pasillo Interior', 'Centrado'] as const).map((posP) => (
                  <button
                    key={posP}
                    onClick={() => handleUpdateRole({ posicionPartida: posP })}
                    className={`p-2 rounded-xl text-center font-bold text-xs font-condensed uppercase transition-all border ${
                      currentRole.posicionPartida === posP
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {posP}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Con Balón vs Sin Balón */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-400 uppercase font-condensed block">
                  7. Instrucciones CON Balón
                </label>
                <div className="space-y-1">
                  {(['Arriesgar en el Pase', 'Asegurar Posesión', 'Disparar en Cuanto Haya Hueco', 'Centrar a Menudo', 'Conducir y Desbordar'] as const).map((cb) => (
                    <button
                      key={cb}
                      onClick={() => handleUpdateRole({ instruccionesConBalon: cb })}
                      className={`w-full p-1.5 rounded-lg text-left text-xs font-medium transition-all border flex items-center justify-between ${
                        currentRole.instruccionesConBalon === cb
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{cb}</span>
                      {currentRole.instruccionesConBalon === cb && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-rose-400 uppercase font-condensed block">
                  8. Instrucciones SIN Balón
                </label>
                <div className="space-y-1">
                  {(['Presión Feroz', 'Cerrar Líneas', 'Desmarques de Ruptura', 'Ofrecer Apoyo'] as const).map((sb) => (
                    <button
                      key={sb}
                      onClick={() => handleUpdateRole({ instruccionesSinBalon: sb })}
                      className={`w-full p-1.5 rounded-lg text-left text-xs font-medium transition-all border flex items-center justify-between ${
                        currentRole.instruccionesSinBalon === sb
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{sb}</span>
                      {currentRole.instruccionesSinBalon === sb && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            Selecciona un futbolista del once titular para configurar su rol e instrucciones.
          </div>
        )}
      </div>
    </div>
  );
};
