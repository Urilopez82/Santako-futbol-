import React from 'react';
import { playClickSound } from '../../utils/audio';
import { 
  Home, 
  Users, 
  Shield, 
  GraduationCap, 
  Search, 
  Compass, 
  Zap, 
  Sliders, 
  Play, 
  Trophy, 
  Table, 
  BarChart2, 
  Coins, 
  Building, 
  Building2, 
  Handshake, 
  ShoppingBag, 
  UtensilsCrossed, 
  Heart, 
  Newspaper, 
  Briefcase, 
  UserCheck, 
  BookOpen, 
  User, 
  Globe2, 
  X,
  Sparkles,
  Gamepad2,
  HeartPulse,
  Wallet
} from 'lucide-react';

export interface PcFutbolSectionItem {
  id: number;
  label: string;
  category: 'DEPORTIVA' | 'COMPETICIÓN' | 'GESTIÓN' | 'INSTITUCIÓN';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PC_FUTBOL_25_SECTIONS: PcFutbolSectionItem[] = [
  { id: 1, label: 'Inicio', category: 'DEPORTIVA', description: 'Despacho principal del mánager y resumen general del club', icon: Home },
  { id: 2, label: 'Primer equipo', category: 'DEPORTIVA', description: 'Plantilla completa, estados físicos, dorsales y convocatorias', icon: Users },
  { id: 3, label: 'Filial', category: 'DEPORTIVA', description: 'Equipo B y promesas en rodaje competitivo', icon: Shield },
  { id: 4, label: 'Cantera', category: 'DEPORTIVA', description: 'Academia juvenil, informes de progreso y captación sub-19', icon: GraduationCap },
  { id: 5, label: 'Fichajes', category: 'DEPORTIVA', description: 'Mercado de traspasos, ofertas trilaterales y agentes libres', icon: Search },
  { id: 6, label: 'Ojeadores', category: 'DEPORTIVA', description: 'Red de scouts, informes técnicos y seguimiento mundial', icon: Compass },
  { id: 7, label: 'Entrenamiento', category: 'DEPORTIVA', description: 'Cargas semanales, preparación física y sesiones tácticas', icon: Zap },
  { id: 8, label: 'Tácticas', category: 'DEPORTIVA', description: 'Pizarra de juego, roles individuales y lanzadores de balón parado', icon: Sliders },
  { id: 9, label: 'Partidos', category: 'COMPETICIÓN', description: 'Simulador de partidos en directo y comentarios radiofónicos', icon: Play },
  { id: 10, label: 'Competición', category: 'COMPETICIÓN', description: 'Calendario oficial, jornadas de liga y copas en curso', icon: Trophy },
  { id: 11, label: 'Clasificación', category: 'COMPETICIÓN', description: 'Tabla liguera, puntos, coeficientes y puestos europeos/descenso', icon: Table },
  { id: 12, label: 'Estadísticas', category: 'COMPETICIÓN', description: 'Pichichi, zamora, máximos asistentes y registros históricos', icon: BarChart2 },
  { id: 13, label: 'Economía', category: 'GESTIÓN', description: 'Balance contable, auditoría financiera, créditos bancarios y tesorería', icon: Coins },
  { id: 14, label: 'Estadio', category: 'GESTIÓN', description: 'Gradas, aforo, proyectos de ampliación y estado del césped', icon: Building },
  { id: 15, label: 'Instalaciones', category: 'GESTIÓN', description: 'Ciudad deportiva, gimnasio, centro médico y academia', icon: Building2 },
  { id: 16, label: 'Patrocinadores', category: 'GESTIÓN', description: 'Sponsors de camiseta, vallas publicitarias y primas comerciales', icon: Handshake },
  { id: 17, label: 'Merchandising', category: 'GESTIÓN', description: 'Tienda oficial del club, camisetas, bufandas y ventas', icon: ShoppingBag },
  { id: 18, label: 'Restaurante y catering', category: 'GESTIÓN', description: 'Barras del estadio, zonas VIP, menús de día de partido y hostelería', icon: UtensilsCrossed },
  { id: 19, label: 'Afición', category: 'GESTIÓN', description: 'Abonados, precio de localidades por zonas y fidelidad de los hinchas', icon: Heart },
  { id: 20, label: 'Prensa', category: 'INSTITUCIÓN', description: 'Ruedas de prensa, titulares de los diarios y análisis del rival', icon: Newspaper },
  { id: 21, label: 'Directiva', category: 'INSTITUCIÓN', description: 'Objetivos de la junta, confianza presidencial y asamblea de socios', icon: Briefcase },
  { id: 22, label: 'Personal técnico', category: 'INSTITUCIÓN', description: 'Segundo entrenador, preparadores físicos, médicos y cuerpo técnico', icon: UserCheck },
  { id: 23, label: 'Historia del club', category: 'INSTITUCIÓN', description: 'Palmarés de títulos, récords, leyendas retiradas y enciclopedia', icon: BookOpen },
  { id: 24, label: 'Perfil del entrenador', category: 'INSTITUCIÓN', description: 'Ficha profesional, contrato vigente, reputación y ofertas de trabajo', icon: User },
  { id: 25, label: 'Mundo futbolístico', category: 'INSTITUCIÓN', description: 'Evolución dinámica del fútbol, ligas extranjeras y universo perpetuo', icon: Globe2 },
  { id: 26, label: 'Fútbol Chapas', category: 'COMPETICIÓN', description: 'Videojuego completo de fútbol de chapas con físicas 2D, 2 jugadores y modo torneo', icon: Gamepad2 },
  { id: 27, label: 'Enfermería', category: 'DEPORTIVA', description: 'Servicios médicos, diagnóstico de patologías, protocolos y seguimiento de bajas', icon: HeartPulse },
  { id: 28, label: 'Vida Privada', category: 'INSTITUCIÓN', description: 'Patrimonio personal, vehículos de lujo, propiedades inmobiliarias y fundar un club', icon: Wallet },
  { id: 29, label: 'Selección Nacional', category: 'COMPETICIÓN', description: 'Convocatorias, alineaciones y partidos oficiales de selecciones nacionales', icon: Globe2 },
];

interface PcFutbolMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionId: number) => void;
}

export const PcFutbolMenuModal: React.FC<PcFutbolMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectSection,
}) => {
  if (!isOpen) return null;

  const categories: Array<{ id: PcFutbolSectionItem['category']; label: string; color: string }> = [
    { id: 'DEPORTIVA', label: 'Área Deportiva & Plantilla', color: 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/40' },
    { id: 'COMPETICIÓN', label: 'Competición & Torneos', color: 'from-amber-500/20 to-amber-950/40 border-amber-500/40' },
    { id: 'GESTIÓN', label: 'Club, Negocio & Estadio', color: 'from-sky-500/20 to-sky-950/40 border-sky-500/40' },
    { id: 'INSTITUCIÓN', label: 'Prensa, Historia & Mánager', color: 'from-purple-500/20 to-purple-950/40 border-purple-500/40' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fadeIn">
      <div className="pcf-panel w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] border-2 border-slate-600/60">
        {/* Header */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#182848] via-[#1c2e54] to-[#182848] border-b-2 border-slate-700/80 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg border border-amber-200 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-black font-condensed uppercase tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Menú General PC Fútbol
                </h2>
                <span className="text-[9px] sm:text-[10px] font-black text-amber-300 bg-black/60 border border-amber-500/60 px-1.5 sm:px-2 py-0.5 rounded font-mono-num uppercase tracking-wider">
                  25 APARTADOS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-condensed tracking-wide line-clamp-1 sm:line-clamp-none">
                Selecciona cualquier área deportiva, de competición, económica o institucional para navegar directamente.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="pcf-btn p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 25 Sections Grid grouped by category */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-gradient-to-b from-slate-950/90 to-slate-900/95">
          {categories.map((cat) => {
            const items = PC_FUTBOL_25_SECTIONS.filter((s) => s.category === cat.id);

            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-700/60 pb-1.5">
                  <span className="text-xs font-black font-condensed tracking-wider uppercase text-amber-400 drop-shadow">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-num font-bold">({items.length} secciones)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          playClickSound();
                          onSelectSection(item.id);
                          onClose();
                        }}
                        className="group flex items-start gap-3 p-3 rounded-xl bg-gradient-to-b from-[#1c2e54]/50 to-[#101b33]/70 hover:from-[#243b6b]/70 hover:to-[#182848]/90 border border-slate-700/80 hover:border-amber-400/70 text-left transition-all hover:scale-[1.01] shadow-md cursor-pointer"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-950/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-amber-300 group-hover:border-amber-400/50 transition-colors shadow-inner">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono-num font-black text-amber-400/90 group-hover:text-amber-300">
                              {String(item.id).padStart(2, '0')}.
                            </span>
                            <span className="text-xs font-bold text-slate-100 group-hover:text-white uppercase tracking-wide truncate font-condensed">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 group-hover:text-slate-200 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
