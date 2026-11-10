import React, { useState, useMemo } from 'react';
import { Club } from '../../types/club';
import { GameSave } from '../../types/game';
import { 
  CompetitionRegulation, 
  DEFAULT_IFAB_RULES, 
  EuropeanLeaguePhaseState, 
  IFABRules 
} from '../../types/regulations';
import { 
  OFFICIAL_COMPETITION_REGULATIONS, 
  validateSquadRegistration 
} from '../../engine/regulationEngine';
import { 
  getUEFAStagesCutoff, 
  initializeUEFAChampionsLeague, 
  simulateEuropeanMatchday 
} from '../../engine/europeanCompetitionEngine';
import { 
  CLUB_HISTORICAL_PALMARES, 
  HISTORICAL_TROPHY_ARCHIVE, 
  MANAGERS_HISTORICAL_PALMARES, 
  PLAYERS_HISTORICAL_PALMARES 
} from '../../engine/palmaresEngine';
import { playClickSound } from '../../utils/audio';
import { 
  Scale, 
  BookOpen, 
  Trophy, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Globe2, 
  Users, 
  Flame, 
  Sparkles, 
  Award, 
  FileText, 
  Clock, 
  Calendar, 
  Search, 
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';

interface RegulationsAndPalmaresViewProps {
  gameSave: GameSave;
}

export type RegulationSubTab = 
  | 'ifab' 
  | 'nacionales' 
  | 'uefa_swiss' 
  | 'palmares' 
  | 'auditoria_plantilla';

export const RegulationsAndPalmaresView: React.FC<RegulationsAndPalmaresViewProps> = ({ gameSave }) => {
  const userClub = gameSave.clubs[gameSave.userClubId];
  const [activeTab, setActiveTab] = useState<RegulationSubTab>('nacionales');
  const [selectedCompKey, setSelectedCompKey] = useState<string>(userClub?.divisionId || 'esp_tier1');
  const [palmaresFilter, setPalmaresFilter] = useState<'TODOS' | 'CLUB' | 'ENTRENADOR' | 'JUGADOR' | 'SELECCION'>('TODOS');
  const [palmaresSearch, setPalmaresSearch] = useState<string>('');

  // European UEFA Swiss phase state
  const [uclPhaseState, setUclPhaseState] = useState<EuropeanLeaguePhaseState>(() => 
    initializeUEFAChampionsLeague(gameSave.currentSeason || '2024/25')
  );

  const selectedRegulation = OFFICIAL_COMPETITION_REGULATIONS[selectedCompKey] || OFFICIAL_COMPETITION_REGULATIONS['esp_tier1'];

  // Live squad legal audit against selected competition
  const squadAudit = useMemo(() => {
    return validateSquadRegistration(userClub, gameSave.players, selectedRegulation);
  }, [userClub, gameSave.players, selectedRegulation]);

  // UEFA 36-team cutoffs
  const uefaCutoffs = useMemo(() => {
    return getUEFAStagesCutoff(uclPhaseState);
  }, [uclPhaseState]);

  // Source of trophies: GameSave trophyArchive merged with HISTORICAL_TROPHY_ARCHIVE
  const allTrophies = useMemo(() => {
    return gameSave.trophyArchive && gameSave.trophyArchive.length > 0
      ? gameSave.trophyArchive
      : HISTORICAL_TROPHY_ARCHIVE;
  }, [gameSave.trophyArchive]);

  // Palmares filtered records
  const filteredTrophies = useMemo(() => {
    return allTrophies.filter((t) => {
      if (palmaresFilter === 'CLUB' && !['LIGA', 'CHAMPIONS', 'COPA', 'SUPERCOPA', 'MUNDIAL_CLUBES'].includes(t.competitionType)) return false;
      if (palmaresFilter === 'SELECCION' && !['SELECCIONES_MUNDIAL', 'SELECCIONES_EUROPA'].includes(t.competitionType)) return false;
      if (palmaresSearch.trim() !== '') {
        const q = palmaresSearch.toLowerCase();
        const matchesChamp = t.championName.toLowerCase().includes(q);
        const matchesComp = t.competitionName.toLowerCase().includes(q);
        const matchesManager = t.winningManagerName.toLowerCase().includes(q);
        return matchesChamp || matchesComp || matchesManager;
      }
      return true;
    });
  }, [allTrophies, palmaresFilter, palmaresSearch]);

  const handleSimulateUCLRound = () => {
    playClickSound();
    if (uclPhaseState.currentMatchday <= uclPhaseState.totalMatchdays) {
      const nextState = simulateEuropeanMatchday(uclPhaseState, uclPhaseState.currentMatchday);
      setUclPhaseState(nextState);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-condensed uppercase tracking-wider flex items-center gap-2">
                Motor Reglamentario Oficial y Palmarés Mundial (FASE 7)
              </h2>
              <p className="text-xs text-slate-400">
                Reglas IFAB, bases de competición por federación, nuevo formato UEFA de 36 equipos y palmarés histórico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-num">
            <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              Versión Normativa: <strong className="text-emerald-400">IFAB 2024/25</strong>
            </span>
            <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              Formato UEFA: <strong className="text-sky-400">Swiss Model (36 Clubes)</strong>
            </span>
          </div>
        </div>

        {/* Tab Buttons (Responsive & Scrollable) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'nacionales', mobileLabel: '1. Bases', label: '1. Bases por País & Federación', icon: BookOpen },
            { id: 'ifab', mobileLabel: '2. Reglas IFAB', label: '2. Reglas del Fútbol (IFAB)', icon: Scale },
            { id: 'uefa_swiss', mobileLabel: '3. Champions 36', label: '3. UEFA Champions League (36)', icon: Trophy },
            { id: 'palmares', mobileLabel: '4. Palmarés', label: '4. Palmarés & Sala de Trofeos', icon: Award },
            { id: 'auditoria_plantilla', mobileLabel: '5. Auditoría', label: '5. Auditoría Legal Plantilla', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id as RegulationSubTab);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold font-condensed uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Bases por País y Federación */}
      {activeTab === 'nacionales' && (
        <div className="space-y-6">
          {/* League Selector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Selecciona Competición Nacional a Consultar
                </span>
                <select
                  value={selectedCompKey}
                  onChange={(e) => {
                    playClickSound();
                    setSelectedCompKey(e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 max-w-sm"
                >
                  <optgroup label="España (RFEF & LaLiga)">
                    <option value="esp_tier1">Primera División (LaLiga EA Sports)</option>
                    <option value="esp_tier2">Segunda División (LaLiga Hypermotion)</option>
                    <option value="esp_tier3_g2">Primera Federación (1ª RFEF Grupo 2)</option>
                    <option value="esp_tier4_g3">Segunda Federación (2ª RFEF Grupo 3)</option>
                    <option value="esp_tier5_g5">Tercera Federación (3ª RFEF Grupo 5 Cataluña)</option>
                  </optgroup>
                  <optgroup label="Inglaterra (The FA & EFL)">
                    <option value="eng_tier1">Premier League</option>
                    <option value="eng_tier2">EFL Championship</option>
                    <option value="eng_tier3">EFL League One</option>
                    <option value="eng_tier4">EFL League Two</option>
                  </optgroup>
                  <optgroup label="Alemania (DFL)">
                    <option value="ger_tier1">Bundesliga</option>
                    <option value="ger_tier2">2. Bundesliga</option>
                  </optgroup>
                  <optgroup label="Italia (FIGC & Lega Serie A)">
                    <option value="ita_tier1">Serie A Enilive</option>
                  </optgroup>
                  <optgroup label="Francia (LFP)">
                    <option value="fra_tier1">Ligue 1 McDonald's</option>
                  </optgroup>
                  <optgroup label="Sudamérica (CONMEBOL, CBF & AFA)">
                    <option value="bra_tier1">Brasileirão Série A Betano (Brasil)</option>
                    <option value="arg_tier1">Liga Profesional de Fútbol (Argentina)</option>
                    <option value="conmebol_libertadores">CONMEBOL Libertadores</option>
                    <option value="conmebol_sudamericana">CONMEBOL Sudamericana</option>
                  </optgroup>
                  <optgroup label="Competiciones Europeas (UEFA 2024/25+)">
                    <option value="uefa_champions_league">UEFA Champions League (36 Equipos)</option>
                    <option value="uefa_europa_league">UEFA Europa League (36 Equipos)</option>
                    <option value="uefa_conference_league">UEFA Conference League</option>
                    <option value="uefa_super_cup">Supercopa de Europa de la UEFA</option>
                  </optgroup>
                  <optgroup label="Competiciones Internacionales FIFA">
                    <option value="fifa_club_world_cup_32">Mundial de Clubes de la FIFA (32 Equipos)</option>
                    <option value="fifa_intercontinental_cup">Copa Intercontinental de la FIFA</option>
                  </optgroup>
                  <optgroup label="Torneos de Selecciones Nacionales">
                    <option value="fifa_world_cup_48">Copa Mundial de la FIFA (48 Selecciones)</option>
                    <option value="uefa_euro_24">Campeonato Europeo UEFA (Eurocopa)</option>
                    <option value="copa_america">CONMEBOL Copa América</option>
                    <option value="uefa_nations_league">UEFA Nations League</option>
                  </optgroup>
                  <optgroup label="Pendientes de Validación Federativa">
                    <option value="usa_mls">Major League Soccer (MLS - EE.UU.) [Pendiente]</option>
                    <option value="mex_tier1">Liga BBVA MX (México) [Pendiente]</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedRegulation.isOfficialVerified ? (
                <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 font-mono-num">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Oficialmente Verificado
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5 font-mono-num">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pendiente de Validación
                </span>
              )}
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono-num rounded-lg">
                Vigencia: {selectedRegulation.season}
              </span>
            </div>
          </div>

          {!selectedRegulation.isOfficialVerified && (
            <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <strong className="text-amber-400 block mb-0.5 font-bold">
                  Competición marcada como Pendiente de Validación Federativa
                </strong>
                Conforme al principio rector de Santako Fútbol, si las bases de una competición extranjera no están 100% verificadas con los reglamentos de la federación organizadora, no se inventan normas. La competición permanece auditada bajo parámetros de contingencia.
              </div>
            </div>
          )}

          {/* Regulation Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Formato y Clasificación */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 font-condensed uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Trophy className="w-4 h-4" /> Formato de Competición
              </h3>

              <div className="space-y-2 text-xs font-mono-num">
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Participantes:</span>
                  <strong className="text-slate-100">{selectedRegulation.participantsCount} Clubes</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Sistema:</span>
                  <strong className="text-slate-100">{selectedRegulation.roundsCount} vueltas (Todos contra todos)</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Puntuación:</span>
                  <strong className="text-slate-100">3 Victoria / 1 Empate / 0 Derrota</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Desempate Principal:</span>
                  <strong className="text-emerald-400 font-sans">{selectedRegulation.tiebreakerPrimary.replace(/_/g, ' ')}</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Tecnología VAR:</span>
                  <strong className={selectedRegulation.hasVAR ? 'text-emerald-400' : 'text-slate-400'}>
                    {selectedRegulation.hasVAR ? 'Habilitado Oficialmente' : 'No Disponible en Categoría'}
                  </strong>
                </div>
              </div>

              {selectedRegulation.notes && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed">
                  <strong className="text-amber-400 block mb-1">Particularidad Reglamentaria:</strong>
                  {selectedRegulation.notes}
                </div>
              )}
            </div>

            {/* Box 2: Ascensos, Descensos y Europa */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-sky-400 font-condensed uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Flame className="w-4 h-4" /> Plazas y Movilidad Deportiva
              </h3>

              <div className="space-y-2 text-xs font-mono-num">
                {selectedRegulation.tier === 1 ? (
                  <>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">UEFA Champions League:</span>
                      <strong className="text-sky-400 font-bold">{selectedRegulation.continentalSlots.championsLeagueGroup} Plazas Directas</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">UEFA Europa League:</span>
                      <strong className="text-amber-400 font-bold">{selectedRegulation.continentalSlots.europaLeagueGroup} Plazas</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">UEFA Conference League:</span>
                      <strong className="text-emerald-400 font-bold">{selectedRegulation.continentalSlots.conferenceLeaguePlayoff} Plaza</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">Descenso Directo:</span>
                      <strong className="text-rose-400 font-bold">{selectedRegulation.directRelegations} Equipos</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">Ascenso Directo:</span>
                      <strong className="text-emerald-400 font-bold">{selectedRegulation.directPromotions} Equipos</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">Playoff de Ascenso:</span>
                      <strong className="text-amber-400 font-bold">{selectedRegulation.playoffTeamsCount} Equipos ({selectedRegulation.playoffPromotionSlots} Plaza)</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">Formato Playoff:</span>
                      <strong className="text-slate-200 text-[11px] font-sans">{selectedRegulation.playoffFormat?.replace(/_/g, ' ') || 'Ida y Vuelta'}</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-400 font-sans">Descenso Directo:</span>
                      <strong className="text-rose-400 font-bold">{selectedRegulation.directRelegations} Equipos</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Box 3: Reglas de Inscripción de Plantilla */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 font-condensed uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Users className="w-4 h-4" /> Requisitos de Plantilla
              </h3>

              <div className="space-y-2 text-xs font-mono-num">
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Máximo Fichas 1er Equipo:</span>
                  <strong className="text-slate-100">{selectedRegulation.squadRules.maxFirstTeamSquadSize} Jugadores</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Límite Extracomunitarios (Non-EU):</span>
                  <strong className={selectedRegulation.squadRules.maxNonEUPlayers === 0 ? 'text-amber-400' : 'text-slate-100'}>
                    {selectedRegulation.squadRules.maxNonEUPlayers} Máximo
                  </strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Mínimo Jugadores Locales:</span>
                  <strong className="text-emerald-400">{selectedRegulation.squadRules.minHomegrownPlayers} Canteranos</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Dorsales Reglamentarios:</span>
                  <strong className="text-slate-100 font-sans">{selectedRegulation.squadRules.officialDorsalsFirstTeam ? '1 al 25 (Fijos)' : 'Libre numeración'}</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-sans">Control Económico / Límite Salarial:</span>
                  <strong className="text-slate-100 font-sans">{selectedRegulation.squadRules.wageCapFinancialFairPlay ? 'Obligatorio LaLiga FFP' : 'No exigido'}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-sans">
                <strong>Fuente Jurídica:</strong> {selectedRegulation.officialSourceCitation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Reglas IFAB */}
      {activeTab === 'ifab' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Leyes del Juego Oficiales — International Football Association Board (IFAB)
              </h3>
              <p className="text-xs text-slate-400">
                Reglamentación universal aplicada en el motor de partido para la temporada de juego vigente
              </p>
            </div>
            <span className="text-xs font-mono-num font-bold px-3 py-1 bg-slate-950 rounded border border-slate-800 text-emerald-400">
              {DEFAULT_IFAB_RULES.version}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {/* Regla 1: Duración y Tiempos */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wide block font-condensed">
                Regla 7: Duración del Partido
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono-num">
                <li>• Tiempo reglamentario: 90 minutos (dos mitades de 45').</li>
                <li>• Descanso oficial: 15 minutos exactos.</li>
                <li>• Prórroga: 30 minutos (dos mitades de 15') en eliminatorias empatadas.</li>
                <li>• Tanda de penaltis: 5 lanzamientos por equipo y muerte súbita posterior.</li>
              </ul>
            </div>

            {/* Regla 2: Número de Jugadores y Sustituciones */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wide block font-condensed">
                Regla 3: Los Jugadores y Sustituciones
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono-num">
                <li>• 11 jugadores en el terreno de juego (mínimo 7 para no incurrir en incomparecencia).</li>
                <li>• Hasta 5 sustituciones permitidas por equipo.</li>
                <li>• Máximo 3 ventanas de sustitución durante el tiempo de juego reglamentario (los cambios al descanso no consumen ventana).</li>
                <li>• +1 cambio adicional permitido en caso de prórroga.</li>
              </ul>
            </div>

            {/* Regla 3: Protocolo VAR */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-sky-400 uppercase tracking-wide block font-condensed">
                Protocolo VAR & Tecnologías
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono-num">
                <li>• Intervención estricta en 4 supuestos: Goles, Penaltis, Tarjetas rojas directas y Confusión de identidad.</li>
                <li>• Detección semiautomática de fuera de juego (SAOT).</li>
                <li>• Tecnología de línea de gol (GLT) con aviso en reloj del árbitro.</li>
              </ul>
            </div>

            {/* Regla 4: Guardameta */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase tracking-wide block font-condensed">
                Reglas del Portero
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono-num">
                <li>• Prohibido atrapar con las manos cesiones voluntarias con el pie de un compañero.</li>
                <li>• Regla de los 6 segundos de retención con el balón en juego.</li>
                <li>• Obligación de mantener al menos un pie sobre o detrás de la línea de meta en penaltis.</li>
              </ul>
            </div>

            {/* Regla 5: Régimen Disciplinario */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 uppercase tracking-wide block font-condensed">
                Régimen Disciplinario y Tarjetas
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono-num">
                <li>• Ciclos de amonestaciones: cada 5 amarillas acumuladas acarrean 1 partido de suspensión.</li>
                <li>• Doble amarilla = Expulsión inmediata y 1 partido de sanción.</li>
                <li>• Tarjeta roja directa = Expulsión y sanción mínima de 2 encuentros por falta grave.</li>
              </ul>
            </div>

            {/* Regla 6: Equipaciones y Césped */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-purple-400 uppercase tracking-wide block font-condensed">
                Regla 1 & 4: Terreno y Equipamiento
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono-num">
                <li>• Dimensiones estándar UEFA: 105 m de longitud por 68 m de anchura.</li>
                <li>• Uso obligatorio de espinilleras homologadas.</li>
                <li>• Diferenciación obligatoria de colores entre ambos conjuntos y el cuerpo arbitral.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: UEFA Champions League (Swiss Model 36 Equipos) */}
      {activeTab === 'uefa_swiss' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-sky-400" />
                <h3 className="text-base font-black text-slate-100 font-condensed uppercase tracking-wider">
                  UEFA Champions League — Fase de Liga Única (36 Equipos)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Formato oficial vigente desde la temporada 2024/25. Clasificación en tabla unificada sin fase de grupos tradicional.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono-num font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                Jornada {uclPhaseState.currentMatchday} de {uclPhaseState.totalMatchdays}
              </span>
              {uclPhaseState.currentMatchday <= uclPhaseState.totalMatchdays && (
                <button
                  onClick={handleSimulateUCLRound}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Simular Jornada {uclPhaseState.currentMatchday}</span>
                </button>
              )}
            </div>
          </div>

          {/* Zones Explanation Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-condensed">
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200">
              <strong className="block font-bold text-emerald-400 uppercase mb-0.5">Fase de Liga (8 Jornadas)</strong>
              36 clubes en tabla única donde cada equipo disputa exactamente 8 partidos contra rivales continentales.
            </div>
            <div className="p-3 bg-sky-950/60 border border-sky-500/40 rounded-xl text-sky-200">
              <strong className="block font-bold text-sky-400 uppercase mb-0.5">Puestos 1º al 32º (Fase Final: 16avos a Gran Final)</strong>
              Los 32 mejores avanzan a las eliminatorias directas desde 16avos de Final, Octavos, Cuartos, Semifinales y Gran Final.
            </div>
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200">
              <strong className="block font-bold text-rose-400 uppercase mb-0.5">Puestos 33º al 36º (Eliminados)</strong>
              Los 4 últimos clasificados quedan eliminados de la competición europea.
            </div>
          </div>

          {/* Table: 36 Teams Swiss Standings */}
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs font-mono-num">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3 text-center">Pos</th>
                  <th className="py-2.5 px-3">Club</th>
                  <th className="py-2.5 px-2 text-center">Bombo</th>
                  <th className="py-2.5 px-2 text-center">PJ</th>
                  <th className="py-2.5 px-2 text-center">V</th>
                  <th className="py-2.5 px-2 text-center">E</th>
                  <th className="py-2.5 px-2 text-center">D</th>
                  <th className="py-2.5 px-2 text-center">GF</th>
                  <th className="py-2.5 px-2 text-center">GC</th>
                  <th className="py-2.5 px-2 text-center">DG</th>
                  <th className="py-2.5 px-3 text-center font-bold">PTS</th>
                  <th className="py-2.5 px-3 text-center font-sans">Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {uclPhaseState.standings.map((team, idx) => {
                  const pos = idx + 1;
                  const isDirectOctavos = pos <= 8;
                  const isPlayoffs = pos > 8 && pos <= 24;
                  const isEliminated = pos > 24;

                  return (
                    <tr
                      key={team.clubId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isDirectOctavos
                          ? 'bg-emerald-950/20'
                          : isPlayoffs
                          ? 'bg-sky-950/20'
                          : 'bg-rose-950/10'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          isDirectOctavos
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : isPlayoffs
                            ? 'bg-sky-950 text-sky-400 border border-sky-500/40'
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}>
                          {pos}º
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-200">
                        {team.clubName} ({team.countryCode})
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400">Bombo {team.pot}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{team.played}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-400">{team.won}</td>
                      <td className="py-2.5 px-2 text-center text-slate-400">{team.drawn}</td>
                      <td className="py-2.5 px-2 text-center text-rose-400">{team.lost}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{team.goalsFor}</td>
                      <td className="py-2.5 px-2 text-center text-slate-400">{team.goalsAgainst}</td>
                      <td className="py-2.5 px-2 text-center text-slate-200">
                        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400 text-sm">
                        {team.points}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans text-[10px] font-bold">
                        {isDirectOctavos ? (
                          <span className="text-emerald-400">OCTAVOS DIRECTOS</span>
                        ) : isPlayoffs ? (
                          <span className="text-sky-400">PLAY-OFF OCTAVOS</span>
                        ) : (
                          <span className="text-rose-400">ELIMINADO</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Palmarés Completo y Sala de Trofeos */}
      {activeTab === 'palmares' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="border-b border-slate-800 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-100 font-condensed uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                Palmarés Histórico y Cuadro de Honor
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Historial de campeones, subcampeones, entrenadores laureados y máximos goleadores
              </p>
            </div>

            {/* Search and Filters (Responsive on Mobile) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={palmaresSearch}
                  onChange={(e) => setPalmaresSearch(e.target.value)}
                  placeholder="Buscar campeón o técnico..."
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 w-full"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto no-scrollbar">
                {(['TODOS', 'CLUB', 'ENTRENADOR', 'JUGADOR', 'SELECCION'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      playClickSound();
                      setPalmaresFilter(f);
                    }}
                    className={`px-2.5 py-1 rounded font-bold font-condensed shrink-0 ${
                      palmaresFilter === f
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-view: Managers Honor Roll */}
          {palmaresFilter === 'ENTRENADOR' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {MANAGERS_HISTORICAL_PALMARES.map((m, i) => (
                <div key={i} className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-100 font-condensed text-sm">{m.managerName}</span>
                    <span className="text-sm font-black text-amber-400 font-mono-num">{m.totalTitles} Títulos</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300 font-sans">
                    {m.trophyList.map((t, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800/60">
                        <strong className="text-emerald-400 block">{t.trophyName}</strong>
                        <span className="text-[10px] text-slate-400 block">{t.season} ({t.clubName})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : palmaresFilter === 'JUGADOR' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {PLAYERS_HISTORICAL_PALMARES.map((p, i) => (
                <div key={i} className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-100 font-condensed text-sm">{p.playerName}</span>
                    <span className="text-sm font-black text-amber-400 font-mono-num">{p.totalTitles} Títulos</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono-num">
                    <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800/60 text-amber-300">
                      Balones de Oro: {p.ballonDOrs}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Botas de Oro: {p.goldenBoots}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {p.trophyList.map((t, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong className="text-emerald-400 block">{t.trophyName}</strong>
                        <span className="text-[10px] text-slate-400 block">{t.season} ({t.clubOrCountry})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {filteredTrophies.map((tr, idx) => (
                <div
                  key={`${tr.id}_${idx}`}
                  className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-condensed shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-condensed uppercase truncate">
                          {tr.competitionName}
                        </h4>
                        <span className="text-[9px] sm:text-[10px] font-mono-num text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                          {tr.season}
                        </span>
                        {tr.isPreGameHistory ? (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-700/60 px-1.5 py-0.2 rounded tracking-wide">
                            HISTÓRICO REAL
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-amber-400 bg-amber-950/90 border border-amber-500/50 px-1.5 py-0.2 rounded tracking-wide flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" /> PARTIDA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Campeón: <strong className="text-emerald-400 font-bold">{tr.championName}</strong>
                        {tr.runnerUpName && <span className="text-slate-500"> · Subcampeón: {tr.runnerUpName}</span>}
                      </p>
                      <span className="text-[11px] text-slate-400 italic block mt-0.5">{tr.scoreOrSummary}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs font-mono-num pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase block">Técnico Campeón</span>
                    <strong className="text-amber-400 block">{tr.winningManagerName}</strong>
                    {tr.topScorer && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Pichichi: {tr.topScorer.playerName} ({tr.topScorer.goals} goles)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Auditoría Legal de Plantilla */}
      {activeTab === 'auditoria_plantilla' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-condensed uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Auditoría de Inscripción Federativa — {userClub.name}
              </h3>
              <p className="text-xs text-slate-400">
                Verificación legal de la plantilla frente a las bases de competición de {selectedRegulation.name}
              </p>
            </div>

            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              squadAudit.isValid
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-950 text-rose-400 border-rose-500/40 animate-pulse'
            }`}>
              {squadAudit.isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{squadAudit.isValid ? 'PLANTILLA TOTALMENTE APTA' : 'RESTRICCIONES PENDIENTES DE RESOLVER'}</span>
            </span>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono-num">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Fichas Primer Equipo</span>
              <strong className="text-base text-slate-100">
                {squadAudit.squadSummary.firstTeamCount} / {selectedRegulation.squadRules.maxFirstTeamSquadSize}
              </strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Extracomunitarios (Non-EU)</span>
              <strong className={`text-base ${
                squadAudit.squadSummary.nonEUCount > selectedRegulation.squadRules.maxNonEUPlayers ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {squadAudit.squadSummary.nonEUCount} / {selectedRegulation.squadRules.maxNonEUPlayers}
              </strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Canteranos / Locales</span>
              <strong className="text-base text-sky-400">
                {squadAudit.squadSummary.homegrownCount} (Mínimo {selectedRegulation.squadRules.minHomegrownPlayers})
              </strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Masa Salarial Semanal</span>
              <strong className="text-base text-amber-400">
                {squadAudit.squadSummary.totalWeeklyWage.toLocaleString()} € / sem
              </strong>
            </div>
          </div>

          {/* Checklists */}
          <div className="space-y-4">
            {/* Passed checks */}
            {squadAudit.passedChecks.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block font-condensed">
                  Requisitos Legales Aprobados
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {squadAudit.passedChecks.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Failed checks */}
            {squadAudit.failedChecks.length > 0 && (
              <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/40 space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wide block font-condensed">
                  Infracciones Reglamentarias Detectadas
                </span>
                <ul className="space-y-1.5 text-xs text-rose-200">
                  {squadAudit.failedChecks.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
