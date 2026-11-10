import React, { useState } from 'react';
import { Club } from '../../types/club';
import { Player } from '../../types/player';
import { PlannedSubstitution, SetPieceTakers } from '../../types/tactics';
import { checkSquadEligibility } from '../../engine/tacticsEngine';
import { playClickSound } from '../../utils/audio';
import { 
  Award, 
  Target, 
  Flag, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  UserCheck,
  Zap,
  Activity
} from 'lucide-react';

interface SetPiecesAndEligibilityViewProps {
  club: Club;
  playersMap: Record<string, Player>;
  onUpdateClub: (updatedClub: Club) => void;
}

export const SetPiecesAndEligibilityView: React.FC<SetPiecesAndEligibilityViewProps> = ({
  club,
  playersMap,
  onUpdateClub,
}) => {
  const starters = (club.startingElevenIds || []).map((id) => playersMap[id]).filter(Boolean);
  const bench = (club.benchPlayerIds || []).map((id) => playersMap[id]).filter(Boolean);
  const allSquad = [...starters, ...bench];

  const takers: SetPieceTakers = club.setPieceTakers || {
    captainId: starters[0]?.id || '',
    viceCaptainId: starters[1]?.id || '',
    penaltyTakerId: starters[0]?.id || '',
    secondPenaltyTakerId: starters[1]?.id || '',
    directFreekickTakerId: starters[0]?.id || '',
    longFreekickTakerId: starters[1]?.id || '',
    leftCornerTakerId: starters[0]?.id || '',
    rightCornerTakerId: starters[1]?.id || '',
  };

  const plannedSubs: PlannedSubstitution[] = club.plannedSubs || [];

  // New planned sub form state
  const [newSubMinute, setNewSubMinute] = useState(60);
  const [newSubOutId, setNewSubOutId] = useState(starters[0]?.id || '');
  const [newSubInId, setNewSubInId] = useState(bench[0]?.id || '');
  const [newSubCondition, setNewSubCondition] = useState<PlannedSubstitution['condition']>('SI_PERDIENDO');

  // Automatic eligibility check
  const eligibility = checkSquadEligibility(club, playersMap);

  const handleUpdateTaker = (field: keyof SetPieceTakers, playerId: string) => {
    playClickSound();
    onUpdateClub({
      ...club,
      setPieceTakers: {
        ...takers,
        [field]: playerId,
      },
    });
  };

  const handleAddPlannedSub = () => {
    if (!newSubOutId || !newSubInId) return;
    playClickSound();

    const outP = playersMap[newSubOutId];
    const inP = playersMap[newSubInId];

    const newSub: PlannedSubstitution = {
      id: `sub_${Date.now()}`,
      minute: newSubMinute,
      outPlayerId: newSubOutId,
      inPlayerId: newSubInId,
      condition: newSubCondition,
      reason: `Sustitución en min ${newSubMinute}: ${outP?.lastName} por ${inP?.lastName} (${newSubCondition})`,
    };

    onUpdateClub({
      ...club,
      plannedSubs: [...plannedSubs, newSub],
    });
  };

  const handleDeletePlannedSub = (subId: string) => {
    playClickSound();
    onUpdateClub({
      ...club,
      plannedSubs: plannedSubs.filter((s) => s.id !== subId),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Panel de Auditoría de Elegibilidad, Sanciones y Lesiones */}
      <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
        eligibility.isValid
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-rose-950/30 border-rose-500/50'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {eligibility.isValid ? (
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 animate-pulse" />
            )}
            <div>
              <h4 className="text-sm font-bold text-white font-condensed uppercase tracking-wide">
                {eligibility.isValid
                  ? 'Alineación y Convocatoria 100% Válida para el Partido'
                  : 'Atención: Restricciones Médicas o Sanciones Disciplinarias Detectadas'}
              </h4>
              <p className="text-xs text-slate-400">
                {eligibility.isValid
                  ? 'Todos los futbolistas alineados cuentan con ficha federativa, alta médica y están limpios de sanciones.'
                  : 'Debes corregir la alineación antes del próximo encuentro para no cometer alineación indebida.'}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono-num flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Titulares: {starters.length}/11
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Banquillo: {bench.length}
            </span>
          </div>
        </div>

        {/* Errors list */}
        {eligibility.errors.length > 0 && (
          <div className="mt-3 pt-3 border-t border-rose-500/30 space-y-1">
            {eligibility.errors.map((err, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-rose-300 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warnings list */}
        {eligibility.warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {eligibility.warnings.map((warn, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-amber-300">
                <Activity className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Especialistas a Balón Parado y Capitanía (Left 6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400">
            <Award className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-condensed tracking-wider">
              Especialistas a Balón Parado & Capitanía
            </h4>
          </div>

          <div className="space-y-3">
            {/* Capitán */}
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase font-condensed block">
                  Primer Capitán (Brazalete)
                </span>
                <span className="text-xs text-slate-400">
                  Liderazgo, veteranía e interlocución arbitral.
                </span>
              </div>
              <select
                value={takers.captainId}
                onChange={(e) => handleUpdateTaker('captainId', e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 max-w-[170px]"
              >
                {starters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lastName} (Lid: {p.attributes.liderazgo})
                  </option>
                ))}
              </select>
            </div>

            {/* Segundo Capitán */}
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase font-condensed block">
                  Segundo Capitán
                </span>
                <span className="text-xs text-slate-400">
                  Sustituye al capitán si es sustituido o expulsado.
                </span>
              </div>
              <select
                value={takers.viceCaptainId}
                onChange={(e) => handleUpdateTaker('viceCaptainId', e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 max-w-[170px]"
              >
                {starters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lastName} (Lid: {p.attributes.liderazgo})
                  </option>
                ))}
              </select>
            </div>

            {/* Penaltis (1º y 2º) */}
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase font-condensed block">
                Lanzadores de Penaltis (Pena Máxima)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">1er Especialista:</span>
                  <select
                    value={takers.penaltyTakerId}
                    onChange={(e) => handleUpdateTaker('penaltyTakerId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2 py-1.5 rounded-lg"
                  >
                    {starters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName} (DIS: {p.attributes.disparo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">2º Lanzador:</span>
                  <select
                    value={takers.secondPenaltyTakerId}
                    onChange={(e) => handleUpdateTaker('secondPenaltyTakerId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2 py-1.5 rounded-lg"
                  >
                    {starters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName} (DIS: {p.attributes.disparo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Faltas Directas & Lejanas */}
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] text-sky-400 font-bold uppercase font-condensed block">
                Faltas al Borde del Área & Faltas Lejanas
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Tiro Directo a Puerta:</span>
                  <select
                    value={takers.directFreekickTakerId}
                    onChange={(e) => handleUpdateTaker('directFreekickTakerId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2 py-1.5 rounded-lg"
                  >
                    {starters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName} (DIS: {p.attributes.disparo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Balón Colgado al Área:</span>
                  <select
                    value={takers.longFreekickTakerId}
                    onChange={(e) => handleUpdateTaker('longFreekickTakerId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2 py-1.5 rounded-lg"
                  >
                    {starters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName} (PAS: {p.attributes.pase})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Córners Izquierdo & Derecho */}
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase font-condensed block">
                Lanzadores de Córners
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Córner Izquierdo:</span>
                  <select
                    value={takers.leftCornerTakerId}
                    onChange={(e) => handleUpdateTaker('leftCornerTakerId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2 py-1.5 rounded-lg"
                  >
                    {starters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName} (PAS: {p.attributes.pase})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">Córner Derecho:</span>
                  <select
                    value={takers.rightCornerTakerId}
                    onChange={(e) => handleUpdateTaker('rightCornerTakerId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold px-2 py-1.5 rounded-lg"
                  >
                    {starters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName} (PAS: {p.attributes.pase})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Sustituciones Planificadas (Right 6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sky-400">
              <Clock className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase font-condensed tracking-wider">
                Sustituciones Tácticas Planificadas
              </h4>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Configura cambios automáticos para que se ejecuten durante el transcurso del partido según el marcador y minuto.
            </p>

            {/* List of current planned subs */}
            <div className="mt-4 space-y-2">
              {plannedSubs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                  No hay sustituciones planificadas activas.
                </div>
              ) : (
                plannedSubs.map((sub) => {
                  const outP = playersMap[sub.outPlayerId];
                  const inP = playersMap[sub.inPlayerId];
                  return (
                    <div
                      key={sub.id}
                      className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                          {sub.minute}&apos;
                        </span>
                        <span className="text-rose-400 font-semibold truncate max-w-[90px]">
                          ↓ {outP?.lastName || 'Titular'}
                        </span>
                        <span className="text-emerald-400 font-semibold truncate max-w-[90px]">
                          ↑ {inP?.lastName || 'Suplente'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono-num font-bold">
                          [{sub.condition}]
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeletePlannedSub(sub.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form to add a new planned substitution */}
          <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-3 mt-4">
            <span className="text-[10px] text-slate-300 uppercase font-bold font-condensed block">
              Programar Nueva Sustitución
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Sale del Campo (Titular):</label>
                <select
                  value={newSubOutId}
                  onChange={(e) => setNewSubOutId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium px-2 py-1.5 rounded-lg"
                >
                  {starters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.primaryPosition} · {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Entra al Terreno (Suplente):</label>
                <select
                  value={newSubInId}
                  onChange={(e) => setNewSubInId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium px-2 py-1.5 rounded-lg"
                >
                  {bench.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.primaryPosition} · {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Minuto de Partido:</label>
                <input
                  type="number"
                  min={45}
                  max={88}
                  value={newSubMinute}
                  onChange={(e) => setNewSubMinute(parseInt(e.target.value, 10) || 60)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono-num px-2 py-1.5 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Condición del Marcador:</label>
                <select
                  value={newSubCondition}
                  onChange={(e) => setNewSubCondition(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 font-medium px-2 py-1.5 rounded-lg"
                >
                  <option value="SIEMPRE">Siempre (minuto fijado)</option>
                  <option value="SI_PERDIENDO">Solo si vamos perdiendo</option>
                  <option value="SI_GANANDO">Solo si vamos ganando</option>
                  <option value="SI_EMPATANDO">Solo si estamos empatando</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddPlannedSub}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold font-condensed uppercase tracking-wider text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Regla de Sustitución</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
