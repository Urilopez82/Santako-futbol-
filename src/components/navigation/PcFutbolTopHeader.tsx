import React from 'react';
import { Club } from '../../types/club';
import { Competition, Match } from '../../types/competition';
import { GameSave } from '../../types/game';
import { playClickSound } from '../../utils/audio';
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  Play, 
  FastForward, 
  Save, 
  FolderDown, 
  LogOut, 
  Globe2, 
  Sparkles, 
  CheckCircle,
  Coins,
  User,
  Clock,
  Loader2,
  Gamepad2
} from 'lucide-react';

import { UnifiedFixture } from '../../engine/internationalCompetitionsEngine';

interface PcFutbolTopHeaderProps {
  gameSave: GameSave;
  club: Club;
  competition?: Competition;
  activeTab: string;
  nextMatch?: Match | null;
  unifiedNextMatch?: UnifiedFixture | null;
  isMatchdayToday?: boolean;
  isSeasonFinished: boolean;
  saveSuccessMsg: boolean;
  isAdvancingToMatch?: boolean;
  onOpenPcFutbolMenu: () => void;
  onOpenProfile: () => void;
  onOpenMatch: () => void;
  onAdvanceDate: () => void;
  onAdvanceToMatch?: (targetDateStr: string) => void;
  onAdvanceToNextSeason: () => void;
  onManualSave: () => void;
  onExportSave: () => void;
  onExitToMenu: () => void;
  onOpenWorldCup?: () => void;
  onOpenWorldBrowser?: () => void;
  onOpenAdminPanel?: () => void;
  onSimulateFullMonth?: () => void;
  onOpenChapas?: () => void;
}

export const PcFutbolTopHeader: React.FC<PcFutbolTopHeaderProps> = ({
  gameSave,
  club,
  competition,
  activeTab,
  nextMatch,
  unifiedNextMatch,
  isMatchdayToday,
  isSeasonFinished,
  saveSuccessMsg,
  isAdvancingToMatch = false,
  onOpenPcFutbolMenu,
  onOpenProfile,
  onOpenMatch,
  onAdvanceDate,
  onAdvanceToMatch,
  onAdvanceToNextSeason,
  onManualSave,
  onExportSave,
  onExitToMenu,
  onOpenWorldCup,
  onOpenWorldBrowser,
  onOpenAdminPanel,
  onSimulateFullMonth,
  onOpenChapas,
}) => {
  // Parse current game date for prominent sports calendar display
  const dateObj = new Date(gameSave.currentDate);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const shortMonthNames = [
    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
  ];
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const monthStr = monthNames[dateObj.getMonth()] || 'Octubre';
  const shortMonthStr = shortMonthNames[dateObj.getMonth()] || 'OCT';
  const dayNum = dateObj.getDate();
  const dayNameStr = dayNames[dateObj.getDay()] || 'Miércoles';
  const yearNum = dateObj.getFullYear() || 2026;

  // Section title banner mapping
  const getBannerTitle = () => {
    switch (activeTab) {
      case 'despacho': return 'DESPACHO DE DIRECCIÓN';
      case 'plantilla': return 'ALINEACIÓN Y TÁCTICA';
      case 'direccion_deportiva': return 'DIRECCIÓN DEPORTIVA';
      case 'competicion': return 'COMPETICIÓN Y CALENDARIO';
      case 'fichajes': return 'MERCADO DE FICHAJES';
      case 'gestion_club': return 'GESTIÓN TOTAL DEL CLUB';
      case 'finanzas': return 'AUDITORÍA FINANCIERA';
      case 'instalaciones': return 'ESTADIO E INSTALACIONES';
      case 'mercado_managers': return 'MERCADO DE ENTRENADORES';
      case 'enciclopedia_historia': return 'HISTORIA Y PALMARÉS';
      case 'reglamentos_palmares': return 'REGLAMENTOS OFICIALES';
      case 'universo_perpetuo': return 'UNIVERSO PERPETUO';
      case 'futbol_chapas': return 'FÚTBOL CHAPAS — ARCADE';
      case 'seleccion': return 'SELECCIÓN NACIONAL';
      case 'enfermeria': return 'ENFERMERÍA & PARTE MÉDICO';
      case 'vida_privada': return 'VIDA PRIVADA DEL ENTRENADOR';
      default: return 'SANTAKO FÚTBOL';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-[#0e1628] via-[#090f1d] to-[#060a14] border-b border-slate-700/60 shadow-2xl px-2 sm:px-4 py-1.5 sm:py-2 select-none backdrop-blur-md">
      {/* MOBILE LAYOUT (< sm screens) - Zero Overlap & 100% Responsive */}
      <div className="sm:hidden flex flex-col gap-1.5 w-full">
        {/* Mobile Row 1: Club Info, Date Mini-Badge & Primary Match Action */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          {/* Club Info Mini */}
          <div 
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 bg-slate-900/90 p-1 pr-2 rounded-lg border border-slate-700/70 shadow-sm cursor-pointer max-w-[42%] overflow-hidden"
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs font-condensed shadow-sm shrink-0"
              style={{
                backgroundColor: club.primaryColor || '#1e293b',
                color: club.textColor || '#ffffff',
                border: `1.5px solid ${club.secondaryColor || '#475569'}`,
              }}
            >
              {club.code}
            </div>
            <div className="truncate">
              <div className="font-black text-white text-[11px] font-condensed uppercase tracking-wider truncate">
                {club.shortName || club.name}
              </div>
              <div className="text-[9px] text-emerald-400 font-mono-num font-semibold truncate">
                {club.finances.balance.toLocaleString()} €
              </div>
            </div>
          </div>

          {/* Date Mini Badge */}
          <div className="flex items-center gap-1 bg-slate-900/95 border border-emerald-500/35 px-1.5 py-1 rounded-lg shadow-sm shrink-0">
            <div className="bg-gradient-to-b from-red-600 to-red-800 text-white rounded px-1 py-0.5 text-center min-w-[28px] leading-tight">
              <div className="text-[7px] font-black uppercase font-condensed">{shortMonthStr}</div>
              <div className="font-mono-num font-black text-xs leading-none">{dayNum}</div>
            </div>
            <div className="text-[9px] text-slate-300 font-mono-num leading-tight flex flex-col justify-center">
              <span className="font-bold text-white uppercase">{dayNameStr.slice(0, 3)}</span>
              <span className="text-[8px] text-slate-400">{gameSave.currentSeason.slice(0, 7)}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0">
            {isMatchdayToday && unifiedNextMatch ? (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenMatch();
                }}
                className="pcf-btn pcf-btn-gold px-2.5 py-1 text-[11px] flex items-center gap-1 uppercase font-condensed tracking-wider animate-pulse shadow-md"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fbbf24]" />
                <Play className="w-3 h-3 fill-current text-slate-950" />
                <span className="font-black text-slate-950">JUGAR</span>
              </button>
            ) : isSeasonFinished ? (
              <button
                onClick={() => {
                  playClickSound();
                  onAdvanceToNextSeason();
                }}
                className="pcf-btn pcf-btn-gold px-2 py-1 text-[10px] flex items-center gap-1 uppercase font-condensed tracking-wider"
              >
                <Trophy className="w-3 h-3 fill-current text-slate-950" />
                <span className="font-black text-slate-950">NUEVA TEMP</span>
              </button>
            ) : unifiedNextMatch ? (
              <button
                disabled={isAdvancingToMatch}
                onClick={() => {
                  playClickSound();
                  if (onAdvanceToMatch) onAdvanceToMatch(unifiedNextMatch.date);
                }}
                title={`Simular hasta ${unifiedNextMatch.date}`}
                className={`pcf-btn pcf-btn-gold px-2 py-1 text-[10px] flex items-center gap-1 uppercase font-condensed tracking-wider ${
                  isAdvancingToMatch ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {isAdvancingToMatch ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-slate-950" />
                    <span className="font-black text-slate-950">SIMULANDO</span>
                  </>
                ) : (
                  <>
                    <FastForward className="w-3 h-3 text-slate-950" />
                    <span className="font-black text-slate-950">A MATCH ({unifiedNextMatch.date.slice(5)})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled={isAdvancingToMatch}
                onClick={() => {
                  playClickSound();
                  onAdvanceDate();
                }}
                className="pcf-btn px-2 py-1 text-[10px] flex items-center gap-1 uppercase font-condensed tracking-wider"
              >
                <FastForward className="w-3 h-3 text-sky-400" />
                <span className="font-bold">+1 DÍA</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Row 2: Secondary Controls Strip (Menú 25, +1 Día, Mundial, Save/Exit) */}
        <div className="flex items-center justify-between gap-1 w-full pt-0.5 border-t border-slate-800/80">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {/* PC Fútbol 25 Sections Button */}
            <button
              onClick={() => {
                playClickSound();
                onOpenPcFutbolMenu();
              }}
              className="pcf-btn pcf-btn-gold px-2 py-0.5 text-[10px] flex items-center gap-1 uppercase font-condensed tracking-wider shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-950" />
              <span className="font-black text-slate-950">Menú 25</span>
            </button>

            {/* Advance 1 Day when match is pending */}
            {unifiedNextMatch && !isMatchdayToday && (
              <button
                disabled={isAdvancingToMatch}
                onClick={() => {
                  playClickSound();
                  onAdvanceDate();
                }}
                className="pcf-btn px-2 py-0.5 text-[10px] flex items-center gap-1 uppercase font-condensed tracking-wider shrink-0"
              >
                <FastForward className="w-2.5 h-2.5 text-sky-400" />
                <span className="font-bold">+1 DÍA</span>
              </button>
            )}

            {onSimulateFullMonth && (
              <button
                disabled={isAdvancingToMatch}
                onClick={() => {
                  playClickSound();
                  onSimulateFullMonth();
                }}
                className="pcf-btn px-2 py-0.5 text-[10px] flex items-center gap-1 uppercase font-condensed tracking-wider shrink-0 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
              >
                <CalendarIcon className="w-2.5 h-2.5 text-emerald-400" />
                <span className="font-bold">Mes</span>
              </button>
            )}

            {/* World Cup Button */}
            {onOpenWorldCup && (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenWorldCup();
                }}
                className="pcf-btn px-2 py-0.5 text-[10px] flex items-center gap-1 uppercase font-condensed tracking-wider shrink-0 bg-sky-950/50 border border-sky-500/30 text-sky-300"
              >
                <Globe2 className="w-2.5 h-2.5" />
                <span>Mundial</span>
              </button>
            )}
          </div>

          {/* Quick Save and Utility Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {saveSuccessMsg && (
              <span className="text-[9px] text-emerald-400 font-bold px-1 py-0.2 rounded bg-emerald-950 flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> OK
              </span>
            )}
            <button
              onClick={onManualSave}
              title="Guardar partida"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExportSave}
              title="Exportar archivo de partida"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <FolderDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExitToMenu}
              title="Salir al menú principal"
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP / TABLET LAYOUT (>= sm screens) */}
      <div className="hidden sm:flex max-w-7xl mx-auto flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Left: Club Identification & Manager */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            title="Ver Ficha y Contrato del Entrenador"
            className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800/90 p-1.5 pr-3 sm:pr-4 rounded-xl border border-slate-700/70 shadow-md cursor-pointer transition-all group"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-sm font-condensed shadow-md shrink-0 transition-transform group-hover:scale-105"
              style={{
                backgroundColor: club.primaryColor || '#1e293b',
                color: club.textColor || '#ffffff',
                border: `2px solid ${club.secondaryColor || '#475569'}`,
              }}
            >
              {club.code}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-white text-xs sm:text-sm font-condensed uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                  {club.shortName || club.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {competition?.shortName || club.divisionId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono-num">
                <span className="text-emerald-400 font-semibold">{club.finances.balance.toLocaleString()} €</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-bold">{gameSave.manager.lastName}</span>
                <span className="text-[10px] text-sky-400 font-bold bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-500/30">
                  {(gameSave.manager as any).elo ? `${(gameSave.manager as any).elo} ELO` : `${gameSave.manager.reputation} REP`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: CURRENT GAME DATE (ALWAYS VISIBLE - NEVER HIDDEN) */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900/95 via-slate-850 to-slate-900/95 border border-emerald-500/35 px-3 py-1.5 rounded-xl shadow-lg shadow-black/40">
          {/* Calendar Mini-Badge */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-red-600 to-red-800 text-white rounded-lg shadow-md px-2 py-0.5 border border-red-500/40 min-w-[42px] leading-none shrink-0">
            <span className="text-[8px] font-black uppercase font-condensed tracking-wider">
              {shortMonthStr}
            </span>
            <span className="font-mono-num font-black text-sm sm:text-base leading-tight">
              {dayNum}
            </span>
          </div>

          {/* Full date text label */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white uppercase font-condensed tracking-wide">
                {dayNameStr}, {dayNum} {monthStr} {yearNum}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            </div>
            <span className="text-[9px] text-slate-400 font-mono-num">
              Fecha oficial · Temp. {gameSave.currentSeason}
            </span>
          </div>
        </div>

        {/* Center Title (Hidden on smaller screens, sleek pill on lg) */}
        <div className="hidden xl:flex items-center justify-center">
          <div className="bg-slate-900/80 border border-slate-700/60 px-5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
            <span className="text-xs font-black text-slate-200 font-condensed tracking-widest uppercase">
              {getBannerTitle()}
            </span>
          </div>
        </div>

        {/* Right: Actions, Mundial, Menu & Sim button */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* League Matchday badge if applicable */}
          {competition && (
            <div className="hidden md:flex flex-col justify-center bg-slate-900/90 border border-slate-700/70 rounded-xl px-2.5 py-1 text-center font-mono-num shadow-sm">
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                {competition.shortName || 'Liga'}
              </span>
              <span className="text-xs font-black text-slate-200">
                J{competition.currentMatchday}
              </span>
            </div>
          )}

          {/* PC Fútbol 25 Sections Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenPcFutbolMenu();
            }}
            title="Abrir Menú PC Fútbol (Los 25 apartados oficiales)"
            className="pcf-btn pcf-btn-gold px-3 py-1.5 text-xs flex items-center gap-1.5 uppercase font-condensed tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-black">Menú PC Fútbol</span>
          </button>

          {/* Fútbol Chapas Standalone Button */}
          {onOpenChapas && (
            <button
              onClick={() => {
                playClickSound();
                onOpenChapas();
              }}
              title="Jugar a Fútbol Chapas (Arcade, 2 Jugadores, Torneo)"
              className="pcf-btn px-3 py-1.5 text-xs flex items-center gap-1.5 uppercase font-condensed tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border border-emerald-400 shadow-md hover:scale-105 transition-all font-black"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Fútbol Chapas</span>
            </button>
          )}

          {/* World Cup Button (Dynamic for any 4-year cycle: 2026, 2030, 2034...) */}
          {onOpenWorldCup && (
            <button
              onClick={() => {
                playClickSound();
                onOpenWorldCup();
              }}
              title="Modo Copa Mundial de la FIFA (Torneo oficial con 80 selecciones reales)"
              className={`pcf-btn px-3 py-1.5 text-xs flex items-center gap-1.5 uppercase font-condensed tracking-wider transition-all cursor-pointer ${
                gameSave.worldCupTournament && gameSave.worldCupTournament.currentStage !== 'FINALIZADO'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black border-2 border-yellow-300 animate-pulse shadow-lg'
                  : 'bg-gradient-to-r from-sky-900/60 to-blue-900/60 border border-sky-400/50 text-sky-200 hover:text-white hover:border-sky-300'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span className="font-black">
                {gameSave.worldCupTournament ? `Mundial ${gameSave.worldCupTournament.year}` : 'Mundial FIFA'}
              </span>
            </button>
          )}

          {/* Match / Date Advance Button */}
          {isMatchdayToday && unifiedNextMatch ? (
            <button
              onClick={() => {
                playClickSound();
                onOpenMatch();
              }}
              className="pcf-btn pcf-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-2 uppercase font-condensed tracking-wider animate-pulse hover:scale-[1.02]"
            >
              <div className="w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fbbf24]" />
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="font-black">JUGAR PARTIDO ({unifiedNextMatch.competitionName.slice(0, 15)})</span>
            </button>
          ) : isSeasonFinished ? (
            <button
              onClick={() => {
                playClickSound();
                onAdvanceToNextSeason();
              }}
              className="pcf-btn pcf-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-2 uppercase font-condensed tracking-wider hover:scale-[1.02]"
            >
              <Trophy className="w-3.5 h-3.5 fill-current" />
              <span className="font-black">NUEVA TEMPORADA</span>
            </button>
          ) : unifiedNextMatch ? (
            <div className="flex items-center gap-1.5">
              <button
                disabled={isAdvancingToMatch}
                onClick={() => {
                  playClickSound();
                  if (onAdvanceToMatch) onAdvanceToMatch(unifiedNextMatch.date);
                }}
                title={`Avanzar y simular días hasta el día del partido (${unifiedNextMatch.date})`}
                className={`pcf-btn pcf-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5 uppercase font-condensed tracking-wider shadow-md ${
                  isAdvancingToMatch ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02]'
                }`}
              >
                {isAdvancingToMatch ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span className="font-black text-slate-950">SIMULANDO...</span>
                  </>
                ) : (
                  <>
                    <FastForward className="w-3.5 h-3.5 text-slate-950" />
                    <span className="font-black text-slate-950">IR AL PARTIDO ({unifiedNextMatch.date.slice(5)})</span>
                  </>
                )}
              </button>
              <button
                disabled={isAdvancingToMatch}
                onClick={() => {
                  playClickSound();
                  onAdvanceDate();
                }}
                title="Avanzar 1 día en el calendario oficial"
                className={`pcf-btn px-2.5 py-1.5 text-xs flex items-center gap-1 uppercase font-condensed tracking-wider ${
                  isAdvancingToMatch ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FastForward className="w-3 h-3 text-sky-400" />
                <span className="font-bold">+1 DÍA</span>
              </button>
              {onSimulateFullMonth && (
                <button
                  disabled={isAdvancingToMatch}
                  onClick={() => {
                    playClickSound();
                    onSimulateFullMonth();
                  }}
                  title="Simular el mes completo hasta el día 1 del siguiente mes con dossier ejecutivo"
                  className={`pcf-btn px-2.5 py-1.5 text-xs flex items-center gap-1 uppercase font-condensed tracking-wider bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:text-white ${
                    isAdvancingToMatch ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <CalendarIcon className="w-3 h-3 text-emerald-400" />
                  <span className="font-bold">SIMULAR MES</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                disabled={isAdvancingToMatch}
                onClick={() => {
                  playClickSound();
                  onAdvanceDate();
                }}
                className={`pcf-btn px-3 py-1.5 text-xs flex items-center gap-1.5 uppercase font-condensed tracking-wider ${
                  isAdvancingToMatch ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isAdvancingToMatch ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span className="font-bold">AVANZANDO...</span>
                  </>
                ) : (
                  <>
                    <FastForward className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-bold">AVANZAR DÍA</span>
                  </>
                )}
              </button>
              {onSimulateFullMonth && (
                <button
                  disabled={isAdvancingToMatch}
                  onClick={() => {
                    playClickSound();
                    onSimulateFullMonth();
                  }}
                  title="Simular el mes completo hasta el día 1 del siguiente mes con dossier ejecutivo"
                  className={`pcf-btn px-2.5 py-1.5 text-xs flex items-center gap-1 uppercase font-condensed tracking-wider bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:text-white ${
                    isAdvancingToMatch ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <CalendarIcon className="w-3 h-3 text-emerald-400" />
                  <span className="font-bold">SIMULAR MES</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Utility Action Icons */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/70">
            {saveSuccessMsg && (
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> OK
              </span>
            )}

            <button
              onClick={onManualSave}
              title="Guardar partida"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onExportSave}
              title="Exportar archivo de partida"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FolderDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onExitToMenu}
              title="Salir al menú principal"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
