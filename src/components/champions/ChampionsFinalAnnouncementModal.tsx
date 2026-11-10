import React, { useEffect } from 'react';
import { Trophy, Star, Sparkles, MapPin, Calendar, Swords, Shield, ChevronRight, X, Flame } from 'lucide-react';
import { Club } from '../../types/club';
import { Player } from '../../types/player';
import { playGoalSound, playClickSound } from '../../utils/audio';

export interface ChampionsFinalData {
  homeClub: Club;
  awayClub: Club;
  date: string;
  neutralVenue: string;
  season: string;
  userClubId: string;
  homeStarPlayer?: Player | null;
  awayStarPlayer?: Player | null;
}

interface ChampionsFinalAnnouncementModalProps {
  isOpen: boolean;
  data: ChampionsFinalData | null;
  onClose: () => void;
  onPlayFinal?: () => void;
}

export const ChampionsFinalAnnouncementModal: React.FC<ChampionsFinalAnnouncementModalProps> = ({
  isOpen,
  data,
  onClose,
  onPlayFinal,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        playGoalSound();
      } catch (e) {
        console.warn('Audio effect error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const { homeClub, awayClub, date, neutralVenue, season, userClubId, homeStarPlayer, awayStarPlayer } = data;
  const isUserHome = homeClub.id === userClubId;
  const isUserAway = awayClub.id === userClubId;
  const isUserInFinal = isUserHome || isUserAway;

  return (
    <div className="fixed inset-0 z-65 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/92 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#050b1f] via-[#081330] to-[#030612] border-2 border-amber-400 rounded-3xl p-4 sm:p-8 text-center text-slate-100 shadow-[0_0_80px_rgba(37,99,235,0.4)] overflow-hidden max-h-[96dvh] flex flex-col justify-between">
        
        {/* UEFA Starball & Blue Nebula Background Atmosphere */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/25 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/15 blur-3xl rounded-full pointer-events-none" />

        {/* Floating Stars decoration */}
        <div className="absolute top-4 left-6 text-amber-300/60 animate-pulse pointer-events-none">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="absolute top-8 right-12 text-amber-300/60 animate-pulse delay-300 pointer-events-none">
          <Star className="w-4 h-4 fill-current" />
        </div>
        <div className="absolute top-20 left-16 text-sky-400/40 pointer-events-none">
          <Star className="w-3 h-3 fill-current" />
        </div>
        <div className="absolute top-24 right-20 text-sky-400/40 pointer-events-none">
          <Star className="w-3 h-3 fill-current" />
        </div>

        {/* Close Button top-right */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Cerrar presentación"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Official Banner */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-blue-950/80 border border-amber-400/70 text-amber-300 text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>UEFA CHAMPIONS LEAGUE · PRESENTACIÓN OFICIAL</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-condensed tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 drop-shadow-[0_2px_12px_rgba(251,191,36,0.6)]">
            ¡¡¡LA GRAN FINAL DE EUROPA!!!
          </h1>
          <p className="text-xs sm:text-sm text-sky-200 font-condensed tracking-wide font-semibold">
            El partido definitivo por la Copa de Europa tras 8 jornadas de Fase de Liga y 4 rondas eliminatorias
          </p>
        </div>

        {/* Central Matchup Showcase: Home Finalist vs Trophy vs Away Finalist */}
        <div className="relative z-10 my-4 sm:my-6 grid grid-cols-7 items-center gap-2 sm:gap-4 bg-slate-950/70 p-3 sm:p-5 rounded-2xl border border-slate-700/80 shadow-2xl">
          {/* Home Finalist */}
          <div className="col-span-3 flex flex-col items-center text-center space-y-2">
            <div
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl font-condensed shadow-xl border-2 transform hover:scale-105 transition-transform"
              style={{
                backgroundColor: homeClub.primaryColor || '#dc2626',
                color: homeClub.textColor || '#ffffff',
                borderColor: homeClub.secondaryColor || '#facc15',
              }}
            >
              {homeClub.code || 'HOM'}
            </div>
            <div>
              <span className="block text-xs sm:text-base font-black font-condensed uppercase tracking-wider text-white truncate max-w-[140px] sm:max-w-none">
                {homeClub.name}
              </span>
              {isUserHome && (
                <span className="inline-block mt-0.5 text-[9px] font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-400 font-condensed uppercase tracking-wider">
                  ★ Tu Club
                </span>
              )}
            </div>
            {homeStarPlayer && (
              <div className="hidden xs:block text-[10px] text-slate-400 font-condensed bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                <span className="text-slate-300 font-bold block">{homeStarPlayer.firstName} {homeStarPlayer.lastName}</span>
                <span className="text-amber-400 font-mono-num font-bold">{homeStarPlayer.overallRating} OVR · {homeStarPlayer.primaryPosition}</span>
              </div>
            )}
          </div>

          {/* Golden Trophy Centerpiece ("La Orejona") */}
          <div className="col-span-1 flex flex-col items-center justify-center relative">
            <div className="relative group">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 blur-md opacity-70 animate-pulse" />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-700 p-0.5 shadow-xl flex items-center justify-center border-2 border-amber-200">
                <div className="w-full h-full rounded-full bg-slate-950/80 flex items-center justify-center">
                  <Trophy className="w-6 h-6 sm:w-9 sm:h-9 text-yellow-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]" />
                </div>
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-black font-condensed text-amber-400 uppercase tracking-widest mt-2 px-1.5 py-0.5 bg-black/60 rounded border border-amber-500/40">
              VS
            </span>
          </div>

          {/* Away Finalist */}
          <div className="col-span-3 flex flex-col items-center text-center space-y-2">
            <div
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl font-condensed shadow-xl border-2 transform hover:scale-105 transition-transform"
              style={{
                backgroundColor: awayClub.primaryColor || '#2563eb',
                color: awayClub.textColor || '#ffffff',
                borderColor: awayClub.secondaryColor || '#facc15',
              }}
            >
              {awayClub.code || 'AWA'}
            </div>
            <div>
              <span className="block text-xs sm:text-base font-black font-condensed uppercase tracking-wider text-white truncate max-w-[140px] sm:max-w-none">
                {awayClub.name}
              </span>
              {isUserAway && (
                <span className="inline-block mt-0.5 text-[9px] font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-400 font-condensed uppercase tracking-wider">
                  ★ Tu Club
                </span>
              )}
            </div>
            {awayStarPlayer && (
              <div className="hidden xs:block text-[10px] text-slate-400 font-condensed bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                <span className="text-slate-300 font-bold block">{awayStarPlayer.firstName} {awayStarPlayer.lastName}</span>
                <span className="text-amber-400 font-mono-num font-bold">{awayStarPlayer.overallRating} OVR · {awayStarPlayer.primaryPosition}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stadium & Context Ribbon */}
        <div className="relative z-10 flex flex-wrap items-center justify-around gap-2 bg-blue-950/40 border border-blue-500/30 p-2 sm:p-2.5 rounded-xl text-[11px] font-condensed text-slate-300">
          <div className="flex items-center gap-1.5 text-amber-300">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">{neutralVenue}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-300">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold font-mono-num">{date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Temporada {season}</span>
          </div>
        </div>

        {/* Narrative / Manager Storyline */}
        <div className="relative z-10 my-3 sm:my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed text-left">
          {isUserInFinal ? (
            <p className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300 block mb-0.5 font-condensed uppercase tracking-wider">
                  ¡El partido más importante de tu carrera como mánager!
                </strong>
                Has guiado a tu equipo con maestría a lo largo de las 8 jornadas de la Fase de Liga y has superado las 4 eliminatorias a cara o cruz de 16avos de Final, Octavos, Cuartos y Semifinales. Noventa minutos te separan de levantar La Orejona y escribir tu nombre con letras de oro en la historia del fútbol.
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300 block mb-0.5 font-condensed uppercase tracking-wider">
                  La cumbre del fútbol europeo
                </strong>
                Los dos clubes más en forma del continente han sobrevivido a la extenuante Fase de Liga de 36 clubes y a cuatro exigentes eliminatorias directas. Hoy se medirán cara a cara en un duelo épico por el título más prestigioso del planeta.
              </span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 pt-2 border-t border-slate-800 flex flex-col xs:flex-row items-center justify-end gap-2.5">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-full xs:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors text-center"
          >
            Preparar Táctica y Salir
          </button>

          {isUserInFinal && onPlayFinal ? (
            <button
              onClick={() => {
                playClickSound();
                onPlayFinal();
              }}
              className="w-full xs:w-auto pcf-btn pcf-btn-gold px-6 py-2.5 rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.02] cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Disputar la Gran Final</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-full xs:w-auto pcf-btn pcf-btn-emerald px-6 py-2 rounded-xl text-xs font-black uppercase font-condensed tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
