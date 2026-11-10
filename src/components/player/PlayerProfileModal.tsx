import React, { useState } from 'react';
import { Club } from '../../types/club';
import { Player } from '../../types/player';
import { playClickSound } from '../../utils/audio';
import { 
  User, 
  X, 
  Shield, 
  Coins, 
  Calendar, 
  Activity, 
  Heart, 
  Sparkles, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Star
} from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player | null;
  club?: Club | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTransferList?: (playerId: string) => void;
  onPromoteToFirstTeam?: (playerId: string) => void;
  onDemoteToReserve?: (playerId: string) => void;
  onRenewPlayerContract?: (playerId: string, newWage: number, newEndYear: number, newClause: number) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  club,
  isOpen,
  onClose,
  onToggleTransferList,
  onPromoteToFirstTeam,
  onDemoteToReserve,
  onRenewPlayerContract,
}) => {
  const [activeTab, setActiveTab] = useState<'atributos' | 'contrato' | 'estadisticas'>('atributos');
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewalWage, setRenewalWage] = useState<number>(0);
  const [renewalYears, setRenewalYears] = useState<number>(2);
  const [renewalClause, setRenewalClause] = useState<number>(0);
  const [renewalFeedback, setRenewalFeedback] = useState<{ text: string; success: boolean } | null>(null);

  React.useEffect(() => {
    if (player) {
      const curWage = player.contract?.wagePerWeek || 5000;
      setRenewalWage(Math.round(curWage * 1.15));
      setRenewalYears(2);
      setRenewalClause(Math.max(player.contract?.releaseClause || 0, Math.round(player.marketValue * 3)));
      setRenewalFeedback(null);
      setIsRenewing(false);
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const isGoalkeeper = player.primaryPosition === 'POR';
  const isSuperstar = player.overallRating >= 85 || player.potential >= 90;
  const isWonderkid = player.age <= 21 && player.potential >= 84;

  const getPosBadgeColor = (pos: string) => {
    switch (pos) {
      case 'POR':
        return 'bg-amber-950 text-amber-400 border-amber-600/40';
      case 'DFC':
      case 'LD':
      case 'LI':
        return 'bg-sky-950 text-sky-400 border-sky-600/40';
      case 'MCD':
      case 'MC':
      case 'MCO':
        return 'bg-emerald-950 text-emerald-400 border-emerald-600/40';
      case 'ED':
      case 'EI':
      case 'DC':
        return 'bg-rose-950 text-rose-400 border-rose-600/40';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getAttributeBarColor = (val: number) => {
    if (val >= 85) return 'bg-amber-400';
    if (val >= 75) return 'bg-emerald-400';
    if (val >= 65) return 'bg-sky-400';
    return 'bg-slate-400';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="pcf-panel w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-2 border-slate-600/70">
        {/* Top Header / Player Banner (PC Fútbol simulation style) */}
        <div 
          className="relative px-6 py-4 border-b-2 border-slate-700/80 flex items-center justify-between text-slate-100"
          style={{
            background: club 
              ? `linear-gradient(135deg, #182848 0%, #101b33 100%)` 
              : 'linear-gradient(135deg, #182848 0%, #0a1120 100%)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Player Avatar & Dorsal Badge */}
            <div className="relative">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl font-condensed"
                style={{
                  backgroundColor: club?.primaryColor || '#1e293b',
                  color: club?.textColor || '#f8fafc',
                  border: `2px solid ${club?.secondaryColor || '#475569'}`,
                }}
              >
                {player.squadNumber ? player.squadNumber : player.primaryPosition}
              </div>
              {isSuperstar && (
                <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
              )}
            </div>

            {/* Name, Nationality, Age, Stars */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl font-black font-condensed uppercase tracking-wider text-white drop-shadow">
                  {player.firstName} {player.lastName}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-num font-black border ${getPosBadgeColor(player.primaryPosition)}`}>
                  {player.primaryPosition}
                </span>
                {isWonderkid && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-condensed tracking-wider">
                    <Sparkles className="w-3 h-3" /> WONDERKID
                  </span>
                )}
              </div>

              {/* PC Fútbol Star Rating Bar */}
              <div className="flex items-center gap-2 my-0.5">
                <div className="flex items-center text-amber-400 text-xs font-bold tracking-widest drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const stars = Math.max(1, Math.min(5, Math.round((player.overallRating - 50) / 10)));
                    return (
                      <span key={i} className={i < stars ? 'text-amber-400 opacity-100' : 'text-slate-600 opacity-30'}>
                        ★
                      </span>
                    );
                  })}
                </div>
                <span className="text-[11px] font-condensed text-slate-300 font-bold uppercase tracking-wider">
                  Nivel de Jugador
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-condensed">
                <span>{player.nationality}</span>
                <span aria-hidden="true">·</span>
                <span>{player.age} años ({player.birthDate})</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold">{club?.name || 'Agente Libre'}</span>
                {player.squadCategory && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 text-[11px] font-bold">
                      {player.squadCategory === 'PRIMER_EQUIPO' ? 'Primer Equipo' : 'Filial / Juvenil'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Overall & Potential Badges (PC Fútbol 2001 Style) */}
          <div className="flex items-center gap-3">
            <div className="text-center bg-[#101b33] px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-inner">
              <span className="text-[9px] text-slate-400 uppercase block font-condensed tracking-wider font-bold">CALIFICACIÓN</span>
              <div className="flex items-center justify-center mt-0.5">
                <span className="pcf-rating-badge pcf-rating-super text-lg px-2.5 py-0.5 font-black">
                  {player.overallRating}
                </span>
              </div>
            </div>

            <div className="text-center bg-[#101b33] px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-inner">
              <span className="text-[9px] text-slate-400 uppercase block font-condensed tracking-wider font-bold">POTENCIAL</span>
              <div className="flex items-center justify-center mt-0.5">
                <span className="pcf-rating-badge pcf-rating-high text-lg px-2.5 py-0.5 font-black">
                  {player.potential}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="pcf-btn p-2 text-slate-300 hover:text-white rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/50">
          {[
            { id: 'atributos', label: 'Atributos & Habilidades' },
            { id: 'contrato', label: 'Contrato & Mercado' },
            { id: 'estadisticas', label: 'Estadísticas de Temporada' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: ATRIBUTOS */}
          {activeTab === 'atributos' && (
            <div className="space-y-6">
              {/* Primary Physical / Mental status */}
              <div className="grid grid-cols-3 gap-4 text-xs font-mono-num">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="font-sans flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Forma Física:</span>
                    <strong className="text-slate-100">{player.fitness}%</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${player.fitness}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="font-sans flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-400" /> Moral del Jugador:</span>
                    <strong className="text-slate-100">{player.morale}%</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${player.morale}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="font-sans flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Ritmo Competitivo:</span>
                    <strong className="text-slate-100">{player.matchReadiness}%</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${player.matchReadiness}%` }} />
                  </div>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel 1: Cualidades Técnicas */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-condensed border-b border-slate-800 pb-1.5">
                    Habilidades Técnicas
                  </h4>

                  <div className="space-y-2 text-xs font-mono-num">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Tiro & Definición:</span>
                        <strong className="text-slate-100">{player.attributes.disparo}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.disparo)}`} style={{ width: `${player.attributes.disparo}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Pase & Construcción:</span>
                        <strong className="text-slate-100">{player.attributes.pase}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.pase)}`} style={{ width: `${player.attributes.pase}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Regate & Desborde:</span>
                        <strong className="text-slate-100">{player.attributes.regate}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.regate)}`} style={{ width: `${player.attributes.regate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Defensa & Entrada:</span>
                        <strong className="text-slate-100">{player.attributes.defensa}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.defensa)}`} style={{ width: `${player.attributes.defensa}%` }} />
                      </div>
                    </div>

                    {isGoalkeeper && (
                      <>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400 font-sans">Paradas & Bloqueo:</span>
                            <strong className="text-amber-400">{player.attributes.paradas || player.overallRating}</strong>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-400 h-full" style={{ width: `${player.attributes.paradas || player.overallRating}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400 font-sans">Reflejos bajo Palos:</span>
                            <strong className="text-amber-400">{player.attributes.reflejos || player.overallRating}</strong>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-400 h-full" style={{ width: `${player.attributes.reflejos || player.overallRating}%` }} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Panel 2: Cualidades Físicas & Mentales */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-condensed border-b border-slate-800 pb-1.5">
                    Físico & Mentalidad
                  </h4>

                  <div className="space-y-2 text-xs font-mono-num">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Velocidad punta:</span>
                        <strong className="text-slate-100">{player.attributes.velocidad}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.velocidad)}`} style={{ width: `${player.attributes.velocidad}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Resistencia física:</span>
                        <strong className="text-slate-100">{player.attributes.resistencia}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.resistencia)}`} style={{ width: `${player.attributes.resistencia}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Fuerza & Duelo:</span>
                        <strong className="text-slate-100">{player.attributes.fuerza}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.fuerza)}`} style={{ width: `${player.attributes.fuerza}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Visión táctica:</span>
                        <strong className="text-slate-100">{player.attributes.vision}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.vision)}`} style={{ width: `${player.attributes.vision}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-sans">Liderazgo & Carácter:</span>
                        <strong className="text-slate-100">{player.attributes.liderazgo}</strong>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${getAttributeBarColor(player.attributes.liderazgo)}`} style={{ width: `${player.attributes.liderazgo}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRATO Y VALOR */}
          {activeTab === 'contrato' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-num text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Valor de Mercado Estimado</span>
                  <strong className="text-emerald-400 text-lg">{player.marketValue.toLocaleString()} €</strong>
                  <span className="text-[10px] text-slate-500 block mt-1 font-sans">Basado en media, edad y potencial</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Sueldo Semanal</span>
                  <strong className="text-slate-100 text-lg">{player.contract.wagePerWeek.toLocaleString()} € / sem</strong>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {(player.contract.wagePerWeek * 52).toLocaleString()} € anuales
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Cláusula de Rescisión</span>
                  <strong className="text-amber-400 text-lg">{player.contract.releaseClause.toLocaleString()} €</strong>
                  <span className="text-[10px] text-slate-500 block mt-1 font-sans">Fijada legalmente por contrato</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Vencimiento del contrato:</span>
                  <strong className="text-slate-200 font-mono-num">30 de junio de {player.contract.contractEndYear}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Rol acordado en plantilla:</span>
                  <strong className="text-emerald-400">{player.contract.squadStatus}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Situación de mercado:</span>
                  <span className={player.isTransferListed ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {player.isTransferListed ? 'Declarado Transferible (En Venta)' : 'Intransferible / Convocable'}
                  </span>
                </div>
              </div>

              {/* Management Actions */}
              <div className="flex items-center gap-3 pt-2">
                {onToggleTransferList && (
                  <button
                    onClick={() => {
                      playClickSound();
                      onToggleTransferList(player.id);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                      player.isTransferListed
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {player.isTransferListed ? 'Retirar del Mercado de Traspasos' : 'Poner en Venta (Transferible)'}
                  </button>
                )}

                {onRenewPlayerContract && (
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsRenewing(!isRenewing);
                      setRenewalFeedback(null);
                    }}
                    className="pcf-btn pcf-btn-gold px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>{isRenewing ? 'Cancelar Negociación' : 'Ofrecer Renovación'}</span>
                  </button>
                )}

                {onPromoteToFirstTeam && player.squadCategory !== 'PRIMER_EQUIPO' && (
                  <button
                    onClick={() => {
                      playClickSound();
                      onPromoteToFirstTeam(player.id);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition-colors"
                  >
                    Promocionar al Primer Equipo
                  </button>
                )}

                {onDemoteToReserve && player.squadCategory === 'PRIMER_EQUIPO' && (
                  <button
                    onClick={() => {
                      playClickSound();
                      onDemoteToReserve(player.id);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    Asignar al Filial B
                  </button>
                )}
              </div>

              {/* Interactive Contract Renewal Drawer (BLOQUE 15) */}
              {isRenewing && (
                <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl p-4 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-300 uppercase font-condensed tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Mesa de Negociación: Renovación de {player.firstName} {player.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-num">
                      Sueldo actual: {player.contract.wagePerWeek.toLocaleString()} €/sem
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">
                        Sueldo Semanal Ofrecido (€)
                      </label>
                      <input
                        type="number"
                        step="500"
                        min="1000"
                        value={renewalWage}
                        onChange={(e) => setRenewalWage(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-400 font-mono-num font-bold focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {(renewalWage * 52).toLocaleString()} € anuales
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">
                        Años Adicionales de Contrato
                      </label>
                      <select
                        value={renewalYears}
                        onChange={(e) => setRenewalYears(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-semibold focus:outline-none focus:border-amber-400"
                      >
                        <option value={1}>+1 año (hasta {player.contract.contractEndYear + 1})</option>
                        <option value={2}>+2 años (hasta {player.contract.contractEndYear + 2})</option>
                        <option value={3}>+3 años (hasta {player.contract.contractEndYear + 3})</option>
                        <option value={4}>+4 años (hasta {player.contract.contractEndYear + 4})</option>
                        <option value={5}>+5 años (hasta {player.contract.contractEndYear + 5})</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">
                        Nueva Cláusula de Rescisión (€)
                      </label>
                      <input
                        type="number"
                        step="500000"
                        min="1000000"
                        value={renewalClause}
                        onChange={(e) => setRenewalClause(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-300 font-mono-num font-bold focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Protección antiblindaje
                      </span>
                    </div>
                  </div>

                  {renewalFeedback && (
                    <div
                      className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        renewalFeedback.success
                          ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-200 border border-rose-500/40'
                      }`}
                    >
                      {renewalFeedback.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{renewalFeedback.text}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        const curW = player.contract.wagePerWeek || 5000;
                        const minAcceptableWage = Math.round(curW * (player.overallRating >= 80 ? 1.15 : 1.08));

                        if (renewalWage >= minAcceptableWage) {
                          setRenewalFeedback({
                            text: `¡Acuerdo total! ${player.firstName} ${player.lastName} acepta la renovación por ${renewalYears} años con ${renewalWage.toLocaleString()} € semanales.`,
                            success: true,
                          });
                          if (onRenewPlayerContract) {
                            const curEnd = player.contract.contractEndYear || 2027;
                            onRenewPlayerContract(player.id, renewalWage, curEnd + renewalYears, renewalClause);
                          }
                        } else {
                          setRenewalFeedback({
                            text: `Oferta insuficiente: El representante exige al menos ${minAcceptableWage.toLocaleString()} € semanales para firmar la renovación.`,
                            success: false,
                          });
                        }
                      }}
                      className="pcf-btn pcf-btn-emerald px-4 py-1.5 text-xs font-black uppercase tracking-wider"
                    >
                      Enviar Oferta de Renovación
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ESTADÍSTICAS */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono-num">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Partidos Jugados</span>
                  <strong className="text-xl font-bold text-slate-100">{player.seasonStats?.matchesPlayed || 0}</strong>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Goles Anotados</span>
                  <strong className="text-xl font-bold text-emerald-400">{player.seasonStats?.goals || 0}</strong>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Asistencias</span>
                  <strong className="text-xl font-bold text-sky-400">{player.seasonStats?.assists || 0}</strong>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Nota Media</span>
                  <strong className="text-xl font-bold text-amber-400">
                    {player.seasonStats?.averageRating ? player.seasonStats.averageRating.toFixed(2) : '-'}
                  </strong>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono-num">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-sans">Minutos disputados:</span>
                  <strong className="text-slate-200">{player.seasonStats?.minutesPlayed || 0}'</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-sans">Tarjetas amarillas:</span>
                  <strong className="text-amber-400">{player.seasonStats?.yellowCards || 0}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-sans">Tarjetas rojas:</span>
                  <strong className="text-rose-400">{player.seasonStats?.redCards || 0}</strong>
                </div>
                {isGoalkeeper && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-sans">Porterías a cero (Clean Sheets):</span>
                    <strong className="text-emerald-400">{player.seasonStats?.cleanSheets || 0}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
