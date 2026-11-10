import React, { useEffect } from 'react';
import { Trophy, Award, Sparkles, Check, ChevronRight, Share2, Star } from 'lucide-react';
import { Club } from '../../types/club';
import { playGoalSound, playClickSound } from '../../utils/audio';

export interface TrophyCelebrationData {
  competitionId: string;
  competitionName: string;
  trophyName: string;
  season: string;
  club: Club;
  managerName: string;
  summaryText: string;
  topScorerName?: string;
  topScorerGoals?: number;
}

interface TrophyCelebrationModalProps {
  isOpen: boolean;
  data: TrophyCelebrationData | null;
  onClose: () => void;
  onViewPalmares?: () => void;
}

export const TrophyCelebrationModal: React.FC<TrophyCelebrationModalProps> = ({
  isOpen,
  data,
  onClose,
  onViewPalmares,
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

  const { club, trophyName, competitionName, season, managerName, summaryText, topScorerName, topScorerGoals } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0a1f14] via-[#09151c] to-[#05090f] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-center text-slate-100 shadow-[0_0_60px_rgba(251,191,36,0.35)] overflow-hidden">
        
        {/* Golden Aura & Stadium Lights */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Decorative Laurel Ribbon */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-black tracking-widest uppercase mb-4 shadow-lg shadow-amber-950/50">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>¡¡¡TÍTULO CONSEGUIDO · SALA DE TROFEOS OFICIAL!!!</span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </div>

        {/* Big Golden Trophy Visual Lockup */}
        <div className="relative z-10 my-4 flex items-center justify-center">
          <div className="relative group">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 blur-xl opacity-60 animate-pulse" />
            
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-700 p-1 shadow-2xl flex items-center justify-center border-4 border-amber-200">
              <div className="w-full h-full rounded-full bg-slate-950/70 flex flex-col items-center justify-center">
                <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-300 drop-shadow-[0_4px_16px_rgba(251,191,36,0.8)] transform hover:scale-110 transition-transform" />
              </div>
            </div>

            {/* Stars */}
            <div className="absolute -top-2 left-2 text-amber-300 animate-bounce">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div className="absolute -top-2 right-2 text-amber-300 animate-bounce delay-150">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>

        {/* Title & Celebration Text */}
        <div className="relative z-10 space-y-2 mt-2">
          <h1 className="text-3xl sm:text-4xl font-black font-condensed tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow-md">
            ¡¡¡CAMPEÓN DE {competitionName.toUpperCase()}!!!
          </h1>

          <div className="flex items-center justify-center gap-2">
            <span
              className="text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: club.primaryColor || '#10b981',
                color: club.textColor || '#ffffff',
                border: `1px solid ${club.secondaryColor || '#fbbf24'}`,
              }}
            >
              {club.name}
            </span>
            <span className="text-xs font-mono-num font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
              Temp. {season}
            </span>
          </div>

          <p className="text-sm text-slate-200 max-w-md mx-auto leading-relaxed pt-2 font-medium">
            ¡Hazaña histórica para los anales del fútbol! Bajo la dirección magistral de <strong className="text-amber-300 font-bold">{managerName}</strong>, el equipo alza con orgullo el <strong className="text-yellow-300 font-bold">{trophyName}</strong>.
          </p>
        </div>

        {/* Milestone Summary Box */}
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-left space-y-2 text-xs font-mono-num">
          <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800">
            <span className="text-slate-400 uppercase font-condensed font-bold">Resumen de la Conquista:</span>
            <span className="text-amber-400 font-bold">{summaryText}</span>
          </div>
          {topScorerName && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Goleador del Torneo:</span>
              <span className="text-emerald-400 font-bold">{topScorerName} ({topScorerGoals} goles)</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Palmarés del Club:</span>
            <span className="text-sky-300 font-bold">+1 Título incorporado a la vitrina oficial</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              onClose();
              if (onViewPalmares) onViewPalmares();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-condensed uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-transform"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Ver Sala de Trofeos & Palmarés</span>
            <ChevronRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs font-condensed uppercase tracking-wider rounded-xl border border-slate-700 transition-colors"
          >
            Continuar Carrera
          </button>
        </div>
      </div>
    </div>
  );
};
