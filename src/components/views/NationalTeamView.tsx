import React, { useState, useMemo } from 'react';
import { GameSave } from '../../types/game';
import { Club } from '../../types/club';
import { Player } from '../../types/player';
import { NATIONAL_TEAMS_MAP, NATIONAL_TEAMS_80 } from '../../db/worldData/nationalTeams80';
import { getOrBuildNationalSquad, ensureAllNationalTeamsPools } from '../../engine/nationalTeamsEngine';
import { resignFromNationalTeam } from '../../engine/managerCareerEngine';
import { saveGame } from '../../storage/indexedDB';
import { playClickSound, playWhistleSound } from '../../utils/audio';
import { 
  Globe2, 
  Users, 
  Sliders, 
  Trophy, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRightLeft, 
  Sparkles, 
  Calendar, 
  UserMinus, 
  Play, 
  Gamepad2, 
  FileText,
  Search,
  Check
} from 'lucide-react';
import { ChapasMatchModal } from '../chapas/ChapasMatchModal';
import { simulateMatch, SimulatedMatchResult } from '../../engine/matchEngine';

interface NationalTeamViewProps {
  gameSave: GameSave;
  onUpdateSave: (updated: GameSave) => Promise<void>;
  onOpenChapasMatch?: (home: Club, away: Club) => void;
  onBackToOffice?: () => void;
}

type NationalSubTab = 'convocatoria' | 'tactica' | 'calendario_mundial';

export const NationalTeamView: React.FC<NationalTeamViewProps> = ({
  gameSave,
  onUpdateSave,
  onBackToOffice,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<NationalSubTab>('convocatoria');
  const nationalRole = gameSave.manager?.nationalTeamRole;
  const userNationId = nationalRole?.countryId;

  const nationInfo = useMemo(() => {
    if (!nationalRole) return null;
    if (userNationId && NATIONAL_TEAMS_MAP[userNationId]) {
      return NATIONAL_TEAMS_MAP[userNationId];
    }
    const cleanRoleName = (nationalRole.countryName || '')
      .replace(/^Selección\s+(de\s+|Absoluta\s+de\s+|de\s+Fútbol\s+de\s+)?/i, '')
      .replace(/\s+Sub-2[01]$/i, '')
      .trim()
      .toLowerCase();
    return (
      NATIONAL_TEAMS_80.find(
        (n) => n.id === userNationId || n.name.toLowerCase() === cleanRoleName || cleanRoleName.includes(n.name.toLowerCase())
      ) || null
    );
  }, [nationalRole, userNationId]);

  // Active Formation & Mentality
  const [tacticFormation, setTacticFormation] = useState<string>('4-3-3');
  const [tacticMentality, setTacticMentality] = useState<string>('Ofensiva');

  // Filter for Eligible Players
  const [posFilter, setPosFilter] = useState<'TODOS' | 'POR' | 'DEF' | 'MED' | 'DEL'>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. If user does NOT manage any national team
  const availableVacancies = useMemo(() => {
    return (gameSave.jobOffers || []).filter((o) => o.isNationalTeam);
  }, [gameSave.jobOffers]);

  const [showResignModal, setShowResignModal] = useState<boolean>(false);

  // Resign from national team handler
  const handleConfirmResign = async () => {
    setShowResignModal(false);
    playClickSound();
    const { updatedSave } = resignFromNationalTeam(gameSave);
    await onUpdateSave(updatedSave);
  };

  // Build eligible national citizens pool (at least 50 players guaranteed)
  const allEligibleCitizens = useMemo(() => {
    if (!nationInfo) return [];
    const q = searchQuery.toLowerCase().trim();
    return Object.values(gameSave.players || {})
      .filter((p) => {
        const pNat = p.nationality || '';
        const matchNat =
          pNat === nationInfo.name ||
          pNat === nationInfo.code ||
          pNat === nationInfo.id ||
          pNat.toLowerCase() === nationInfo.name.toLowerCase() ||
          (p as any).countryId === nationInfo.id;
        if (!matchNat) return false;
        if (q) {
          const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
          return fullName.includes(q) || (p.nickname && p.nickname.toLowerCase().includes(q));
        }
        return true;
      })
      .sort((a, b) => b.overallRating - a.overallRating);
  }, [gameSave.players, nationInfo, searchQuery]);

  // Automatically guarantee 50+ selectable players for this nation
  React.useEffect(() => {
    if (nationInfo && allEligibleCitizens.length < 50) {
      const { updatedSave } = ensureAllNationalTeamsPools(gameSave);
      onUpdateSave(updatedSave);
    }
  }, [nationInfo?.id, allEligibleCitizens.length]);

  // Current squad of 23
  const currentSquad = useMemo(() => {
    if (!nationInfo) return { all23: [], starters: [], bench: [] };
    return getOrBuildNationalSquad(nationInfo.id, gameSave.players);
  }, [nationInfo, gameSave.players]);

  const [calledUpIds, setCalledUpIds] = useState<string[]>(() => {
    if (nationalRole?.squadPlayerIds && nationalRole.squadPlayerIds.length >= 23) {
      const valid = nationalRole.squadPlayerIds.filter((id) => gameSave.players[id]);
      if (valid.length >= 23) return valid;
    }
    return currentSquad.all23.map((p) => p.id);
  });

  // Automatically maintain at least 23 players called up
  React.useEffect(() => {
    if (calledUpIds.length < 23 && allEligibleCitizens.length >= 23) {
      const needed = 23 - calledUpIds.length;
      const candidates = allEligibleCitizens.filter((p) => !calledUpIds.includes(p.id)).slice(0, needed);
      if (candidates.length > 0) {
        const newIds = [...calledUpIds, ...candidates.map((c) => c.id)];
        setCalledUpIds(newIds);
        persistCallUp(newIds);
      }
    }
  }, [calledUpIds.length, allEligibleCitizens.length]);

  const persistCallUp = async (newIds: string[]) => {
    if (!nationalRole || !nationInfo) return;
    const updatedRole = {
      ...nationalRole,
      countryId: nationInfo.id,
      countryName: `Selección de ${nationInfo.name}`,
      flag: nationInfo.flag,
      squadPlayerIds: newIds,
    };
    const updatedSave: GameSave = {
      ...gameSave,
      manager: {
        ...gameSave.manager,
        nationalTeamRole: updatedRole,
      },
    };
    await onUpdateSave(updatedSave);
  };

  const toggleCallUp = (playerId: string) => {
    playClickSound();
    if (calledUpIds.includes(playerId)) {
      if (calledUpIds.length <= 23) {
        alert('Debes mantener al menos 23 futbolistas convocados según la normativa oficial FIFA.');
        return;
      }
      const newIds = calledUpIds.filter((id) => id !== playerId);
      setCalledUpIds(newIds);
      persistCallUp(newIds);
    } else {
      if (calledUpIds.length >= 26) {
        alert('El cupo máximo oficial es de 26 futbolistas convocados.');
        return;
      }
      const newIds = [...calledUpIds, playerId];
      setCalledUpIds(newIds);
      persistCallUp(newIds);
    }
  };

  // IF NO NATIONAL TEAM
  if (!nationalRole || !nationInfo) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="pcf-panel rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border border-blue-800/40 text-center max-w-3xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-900/40 border border-blue-500/50 flex items-center justify-center text-4xl shadow-xl">
            🌐
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-condensed uppercase tracking-wider text-white">
            Sin Selección Nacional Asignada
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Actualmente te dedicas en exclusiva a tu club. Puedes solicitar el banquillo de una federación internacional o esperar a recibir ofertas oficiales según tu reputación como entrenador ({gameSave.manager.reputation} REP).
          </p>

          {onBackToOffice && (
            <button
              onClick={onBackToOffice}
              className="pcf-btn pcf-btn-gold px-6 py-2.5 text-xs font-bold font-condensed uppercase tracking-wider"
            >
              Volver al Despacho del Club
            </button>
          )}
        </div>

        {/* National vacancies */}
        <div className="pcf-panel rounded-2xl p-6 space-y-4 max-w-4xl mx-auto">
          <h3 className="text-sm font-black font-condensed uppercase tracking-wider text-amber-400">
            Puestos Vacantes y Selecciones del Mundo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {NATIONAL_TEAMS_80.slice(0, 15).map((nat) => (
              <div
                key={nat.id}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{nat.flag}</span>
                  <div>
                    <p className="font-bold text-xs text-white uppercase font-condensed">{nat.name}</p>
                    <p className="text-[10px] text-slate-400">Ranking FIFA: #{nat.fifaRanking}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {nat.confederation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // USER HAS ACTIVE NATIONAL TEAM
  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="pcf-panel rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-blue-950/90 via-slate-900 to-slate-950 border border-blue-700/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border-2 border-amber-400/60 shadow-xl flex items-center justify-center text-4xl shrink-0">
            {nationInfo.flag}
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-condensed uppercase tracking-wider text-white">
                Selección de {nationInfo.name}
              </h1>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                FIFA #{nationInfo.fifaRanking}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Seleccionador Nacional: <b className="text-slate-200">{gameSave.manager.firstName} {gameSave.manager.lastName}</b> · Confed. {nationInfo.confederation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              playClickSound();
              setShowResignModal(true);
            }}
            title="Dimitir exclusivamente de la selección sin abandonar tu club"
            className="pcf-btn pcf-btn-rose px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider flex items-center gap-1.5"
          >
            <UserMinus className="w-4 h-4" />
            <span>Dimitir de Selección</span>
          </button>

          {onBackToOffice && (
            <button
              onClick={onBackToOffice}
              className="pcf-btn pcf-btn-gold px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider"
            >
              Ir a mi Club
            </button>
          )}
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
        {[
          { id: 'convocatoria', label: `Convocatoria Oficial (${calledUpIds.length}/26)`, icon: Users },
          { id: 'tactica', label: 'Alineación & Táctica', icon: Sliders },
          { id: 'calendario_mundial', label: 'Copa Mundial FIFA', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveSubTab(tab.id as NationalSubTab);
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 text-xs font-bold font-condensed uppercase tracking-wider rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. CONVOCATORIA TAB */}
      {activeSubTab === 'convocatoria' && (
        <div className="pcf-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-condensed uppercase tracking-wider text-white">
                  Lista de Futbolistas Seleccionables
                </h3>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  {allEligibleCitizens.length} Disponibles (Mín. 50)
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  {calledUpIds.length}/26 Convocados (Mín. 23)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecciona a los 23-26 mejores jugadores con nacionalidad de {nationInfo.name}.
              </p>
            </div>

            {/* Position filter and search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar jugador..."
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(['TODOS', 'POR', 'DEF', 'MED', 'DEL'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className={`px-2.5 py-1 rounded font-bold font-condensed ${
                      posFilter === pos ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table of selectable citizens */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase font-condensed border-b border-slate-800">
                  <th className="p-2.5">Estado</th>
                  <th className="p-2.5">Jugador</th>
                  <th className="p-2.5">Pos.</th>
                  <th className="p-2.5">Edad</th>
                  <th className="p-2.5">Club</th>
                  <th className="p-2.5 text-center">Media</th>
                  <th className="p-2.5 text-center">Físico</th>
                  <th className="p-2.5 text-center">Moral</th>
                  <th className="p-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-condensed">
                {allEligibleCitizens
                  .filter((p) => {
                    if (posFilter === 'POR') return p.primaryPosition === 'POR';
                    if (posFilter === 'DEF') return ['DFC', 'LD', 'LI'].includes(p.primaryPosition);
                    if (posFilter === 'MED') return ['MCD', 'MC', 'MCO'].includes(p.primaryPosition);
                    if (posFilter === 'DEL') return ['ED', 'EI', 'DC'].includes(p.primaryPosition);
                    return true;
                  })
                  .map((player) => {
                    const isCalled = calledUpIds.includes(player.id);
                    const clubName = player.clubId ? gameSave.clubs[player.clubId]?.shortName || 'Club' : 'Libre';

                    return (
                      <tr
                        key={player.id}
                        className={`hover:bg-slate-850/60 transition-colors ${
                          isCalled ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="p-2.5">
                          {isCalled ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>CONVOCADO</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No convocado</span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-white">
                          {player.nickname || `${player.firstName} ${player.lastName}`}
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {player.primaryPosition}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-300">{player.age}</td>
                        <td className="p-2.5 text-slate-400">{clubName}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-400">
                          {player.overallRating}
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-300">{player.fitness}%</td>
                        <td className="p-2.5 text-center font-mono text-slate-300">{player.morale}%</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => toggleCallUp(player.id)}
                            className={`px-3 py-1 text-[11px] font-bold rounded uppercase tracking-wider ${
                              isCalled
                                ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                            }`}
                          >
                            {isCalled ? 'Desconvocar' : 'Convocar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TÁCTICA Y ALINEACIÓN TAB */}
      {activeSubTab === 'tactica' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="pcf-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black font-condensed uppercase tracking-wider text-white">
              Esquema de la Selección
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Formación Táctica:</label>
                <select
                  value={tacticFormation}
                  onChange={(e) => setTacticFormation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="4-3-3">4-3-3 Ofensiva Total</option>
                  <option value="4-4-2">4-4-2 Clásica Equilibrada</option>
                  <option value="4-2-3-1">4-2-3-1 Control & Posesión</option>
                  <option value="3-5-2">3-5-2 Carriles Abiertos</option>
                  <option value="5-3-2">5-3-2 Bloque Defensivo</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mentalidad de Juego:</label>
                <select
                  value={tacticMentality}
                  onChange={(e) => setTacticMentality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Muy Defensiva">Muy Defensiva</option>
                  <option value="Defensiva">Defensiva</option>
                  <option value="Equilibrada">Equilibrada</option>
                  <option value="Ofensiva">Ofensiva</option>
                  <option value="Al Ataque">Al Ataque</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-300 uppercase font-condensed">Estado de Convocatoria:</span>
              <p className="text-slate-400">
                {calledUpIds.length} jugadores en la concentración oficial. Los 11 titulares saldrán al campo de inicio en cada partido del torneo.
              </p>
            </div>
          </div>

          {/* Starters list */}
          <div className="md:col-span-2 pcf-panel rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-black font-condensed uppercase tracking-wider text-amber-400">
              Once Titular Previsto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-condensed">
              {calledUpIds.slice(0, 11).map((pid, idx) => {
                const pl = gameSave.players[pid];
                if (!pl) return null;
                return (
                  <div
                    key={pid}
                    className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-600 flex items-center justify-center font-bold text-[11px] text-blue-200">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white text-xs">
                          {pl.nickname || `${pl.firstName} ${pl.lastName}`}
                        </p>
                        <p className="text-[10px] text-slate-400">{pl.primaryPosition}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400">{pl.overallRating}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. CALENDARIO & MUNDIAL TAB */}
      {activeSubTab === 'calendario_mundial' && (
        <div className="pcf-panel rounded-2xl p-6 text-center space-y-4">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-black font-condensed uppercase tracking-wider text-white">
            Copa Mundial de la FIFA
          </h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            La Selección disputará los encuentros mundialistas en el calendario oficial cuatrienal. Podrás jugar cada encuentro tanto con el simulador táctico como en el campo mediante el videojuego de chapas.
          </p>
        </div>
      )}

      {/* CONFIRMATION MODAL (NO WINDOW.CONFIRM) */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white font-condensed uppercase tracking-wider">
                ¿Dimitir como Seleccionador?
              </h3>
              <p className="text-xs text-slate-300">
                ¿Estás seguro de que deseas dimitir como seleccionador de <strong>{nationalRole?.countryName}</strong>? Seguirás dirigiendo a tu club con total normalidad y quedarás libre para recibir ofertas de otras federaciones.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResignModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-condensed uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmResign}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black font-condensed uppercase tracking-wider shadow-lg transition-colors"
              >
                Confirmar Dimisión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
