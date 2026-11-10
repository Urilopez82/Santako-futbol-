import React from 'react';
import { Trophy, FileCheck, CheckCircle2, Award, Calendar, DollarSign, Shield, Sparkles } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

export interface ContractSigningDetails {
  teamName: string;
  badgeOrFlag: string;
  isNationalTeam: boolean;
  roleTitle: string; // 'Primer Entrenador' | 'Seleccionador Nacional'
  startDate: string;
  endSeason: string;
  durationYears: number;
  wageWeekly: number;
  wageAnnual: number;
  sportingObjective: string;
  economicObjective?: string;
  releaseClause?: number;
  promotionBonus?: number;
}

interface ContractSigningModalProps {
  isOpen: boolean;
  details: ContractSigningDetails | null;
  onClose: () => void;
}

export const ContractSigningModal: React.FC<ContractSigningModalProps> = ({
  isOpen,
  details,
  onClose,
}) => {
  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#0b1728] via-[#09111e] to-[#040810] border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* TOP GOLDEN HEADER */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-6 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-950 animate-bounce" />
            <span className="font-black font-condensed tracking-widest text-slate-950 uppercase text-sm sm:text-base">
              COMUNICADO OFICIAL · PRESENTACIÓN
            </span>
          </div>
          <span className="text-xs font-black font-mono bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/40">
            CONTRATO EN VIGOR
          </span>
        </div>

        {/* HERO TEAM BANNER */}
        <div className="p-6 text-center border-b border-slate-800/80 bg-slate-950/50 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-xl flex items-center justify-center text-4xl">
            {details.badgeOrFlag || '⚽'}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-condensed uppercase tracking-wider text-white">
              {details.teamName}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-amber-400 uppercase font-condensed tracking-wide flex items-center justify-center gap-1.5 mt-1">
              <Award className="w-4 h-4" />
              <span>{details.roleTitle}</span>
            </p>
          </div>
        </div>

        {/* CONTRACT CONDITIONS GRID */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-condensed">Duración del Vínculo</span>
              <span className="font-bold text-white text-sm sm:text-base font-mono">
                {details.durationYears} {details.durationYears === 1 ? 'Temporada' : 'Temporadas'}
              </span>
              <span className="text-[10px] text-slate-500 block">Hasta {details.endSeason}</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-condensed">Salario Semanal</span>
              <span className="font-bold text-emerald-400 text-sm sm:text-base font-mono">
                {details.wageWeekly.toLocaleString()} € / sem
              </span>
              <span className="text-[10px] text-slate-500 block">
                {(details.wageAnnual || details.wageWeekly * 52).toLocaleString()} € / año
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-condensed">Fecha de Firma</span>
              <span className="font-bold text-slate-200 text-xs sm:text-sm font-mono">
                {details.startDate}
              </span>
              <span className="text-[10px] text-slate-500 block">Incorporación inmediata</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-condensed">Cláusula de Rescisión</span>
              <span className="font-bold text-amber-400 text-xs sm:text-sm font-mono">
                {details.releaseClause ? `${details.releaseClause.toLocaleString()} €` : 'No aplicable'}
              </span>
              <span className="text-[10px] text-slate-500 block">Libertad federativa</span>
            </div>
          </div>

          {/* OBJECTIVES */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300 uppercase font-condensed text-[11px]">Objetivo Deportivo:</span>
                <p className="text-slate-200">{details.sportingObjective || 'Cumplir las metas fijadas por la Junta'}</p>
              </div>
            </div>

            {details.promotionBonus && details.promotionBonus > 0 && (
              <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-300 uppercase font-condensed text-[11px]">Prima por Éxito:</span>
                  <p className="text-amber-300 font-mono">+{details.promotionBonus.toLocaleString()} € de prima por consecución de objetivos</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER CONFIRM BUTTON */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-full pcf-btn pcf-btn-gold py-3 text-sm font-black font-condensed uppercase tracking-wider shadow-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-slate-950" />
            <span className="text-slate-950">Confirmar e Iniciar Etapa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
