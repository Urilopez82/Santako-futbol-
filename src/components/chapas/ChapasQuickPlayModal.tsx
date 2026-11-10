import React, { useState } from 'react';
import { 
  ChapasMatchModal, 
  ChapasMatchTeamConfig, 
  ChapasMatchFinishedPayload 
} from './ChapasMatchModal';
import { AiDifficulty, ChapasFormation } from '../../engine/chapasPhysicsEngine';
import { 
  Trophy, 
  Target, 
  Users, 
  Bot, 
  Play, 
  X, 
  Sparkles, 
  Shield, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface ChapasQuickPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset clubs for fast selection
const QUICK_TEAMS: ChapasMatchTeamConfig[] = [
  {
    id: 'santako_fc',
    name: 'Santako Fútbol Club',
    shortName: 'Santako FC',
    primaryColor: '#059669', // Emerald
    secondaryColor: '#facc15',
    textColor: '#ffffff',
    formation: '4-3-3',
    players: [
      { id: 'stk_1', name: 'M. Ter Stegen', number: 1, position: 'POR', isGoalkeeper: true, disparo: 45, fuerza: 86, precision: 75, tecnica: 78 },
      { id: 'stk_2', name: 'J. Koundé', number: 23, position: 'DEF', isGoalkeeper: false, disparo: 70, fuerza: 84, precision: 80, tecnica: 79 },
      { id: 'stk_3', name: 'Pau Cubarsí', number: 2, position: 'DEF', isGoalkeeper: false, disparo: 68, fuerza: 80, precision: 86, tecnica: 84 },
      { id: 'stk_4', name: 'Ronald Araújo', number: 4, position: 'DEF', isGoalkeeper: false, disparo: 74, fuerza: 94, precision: 76, tecnica: 75 },
      { id: 'stk_5', name: 'Alejandro Balde', number: 3, position: 'DEF', isGoalkeeper: false, disparo: 72, fuerza: 79, precision: 78, tecnica: 82 },
      { id: 'stk_6', name: 'Pedri González', number: 8, position: 'MED', isGoalkeeper: false, disparo: 82, fuerza: 75, precision: 95, tecnica: 96 },
      { id: 'stk_7', name: 'Gavi', number: 6, position: 'MED', isGoalkeeper: false, disparo: 80, fuerza: 87, precision: 85, tecnica: 88 },
      { id: 'stk_8', name: 'Frenkie de Jong', number: 21, position: 'MED', isGoalkeeper: false, disparo: 81, fuerza: 82, precision: 92, tecnica: 93 },
      { id: 'stk_9', name: 'Lamine Yamal', number: 19, position: 'DEL', isGoalkeeper: false, disparo: 89, fuerza: 76, precision: 94, tecnica: 97 },
      { id: 'stk_10', name: 'Robert Lewandowski', number: 9, position: 'DEL', isGoalkeeper: false, disparo: 94, fuerza: 89, precision: 91, tecnica: 89 },
      { id: 'stk_11', name: 'Raphinha', number: 11, position: 'DEL', isGoalkeeper: false, disparo: 91, fuerza: 82, precision: 89, tecnica: 90 },
    ],
  },
  {
    id: 'real_madrid',
    name: 'Real Madrid CF',
    shortName: 'Real Madrid',
    primaryColor: '#ffffff',
    secondaryColor: '#f59e0b',
    textColor: '#0f172a',
    formation: '4-3-3',
    players: [
      { id: 'rm_1', name: 'Thibaut Courtois', number: 1, position: 'POR', isGoalkeeper: true, disparo: 42, fuerza: 91, precision: 76, tecnica: 74 },
      { id: 'rm_2', name: 'Dani Carvajal', number: 2, position: 'DEF', isGoalkeeper: false, disparo: 74, fuerza: 85, precision: 82, tecnica: 81 },
      { id: 'rm_3', name: 'Éder Militão', number: 3, position: 'DEF', isGoalkeeper: false, disparo: 72, fuerza: 88, precision: 79, tecnica: 78 },
      { id: 'rm_4', name: 'Antonio Rüdiger', number: 22, position: 'DEF', isGoalkeeper: false, disparo: 76, fuerza: 95, precision: 77, tecnica: 76 },
      { id: 'rm_5', name: 'Ferland Mendy', number: 23, position: 'DEF', isGoalkeeper: false, disparo: 69, fuerza: 87, precision: 78, tecnica: 77 },
      { id: 'rm_6', name: 'Federico Valverde', number: 8, position: 'MED', isGoalkeeper: false, disparo: 93, fuerza: 92, precision: 88, tecnica: 87 },
      { id: 'rm_7', name: 'Jude Bellingham', number: 5, position: 'MED', isGoalkeeper: false, disparo: 91, fuerza: 89, precision: 90, tecnica: 93 },
      { id: 'rm_8', name: 'Eduardo Camavinga', number: 6, position: 'MED', isGoalkeeper: false, disparo: 80, fuerza: 86, precision: 87, tecnica: 89 },
      { id: 'rm_9', name: 'Rodrygo Goes', number: 11, position: 'DEL', isGoalkeeper: false, disparo: 88, fuerza: 78, precision: 89, tecnica: 92 },
      { id: 'rm_10', name: 'Kylian Mbappé', number: 9, position: 'DEL', isGoalkeeper: false, disparo: 96, fuerza: 88, precision: 93, tecnica: 95 },
      { id: 'rm_11', name: 'Vinícius Júnior', number: 7, position: 'DEL', isGoalkeeper: false, disparo: 92, fuerza: 82, precision: 91, tecnica: 97 },
    ],
  },
  {
    id: 'atletico_madrid',
    name: 'Atlético de Madrid',
    shortName: 'Atlético',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    formation: '5-3-2',
    players: [
      { id: 'atm_1', name: 'Jan Oblak', number: 13, position: 'POR', isGoalkeeper: true, disparo: 40, fuerza: 88, precision: 78, tecnica: 72 },
      { id: 'atm_2', name: 'Nahuel Molina', number: 16, position: 'DEF', isGoalkeeper: false, disparo: 73, fuerza: 80, precision: 81, tecnica: 80 },
      { id: 'atm_3', name: 'Robin Le Normand', number: 24, position: 'DEF', isGoalkeeper: false, disparo: 68, fuerza: 87, precision: 78, tecnica: 77 },
      { id: 'atm_4', name: 'José María Giménez', number: 2, position: 'DEF', isGoalkeeper: false, disparo: 70, fuerza: 92, precision: 75, tecnica: 74 },
      { id: 'atm_5', name: 'Reinildo Mandava', number: 23, position: 'DEF', isGoalkeeper: false, disparo: 67, fuerza: 88, precision: 76, tecnica: 75 },
      { id: 'atm_6', name: 'Rodrigo De Paul', number: 5, position: 'MED', isGoalkeeper: false, disparo: 84, fuerza: 86, precision: 89, tecnica: 87 },
      { id: 'atm_7', name: 'Koke Resurrección', number: 6, position: 'MED', isGoalkeeper: false, disparo: 80, fuerza: 82, precision: 91, tecnica: 88 },
      { id: 'atm_8', name: 'Conor Gallagher', number: 4, position: 'MED', isGoalkeeper: false, disparo: 82, fuerza: 87, precision: 83, tecnica: 84 },
      { id: 'atm_9', name: 'Antoine Griezmann', number: 7, position: 'DEL', isGoalkeeper: false, disparo: 91, fuerza: 79, precision: 95, tecnica: 95 },
      { id: 'atm_10', name: 'Julián Álvarez', number: 19, position: 'DEL', isGoalkeeper: false, disparo: 92, fuerza: 85, precision: 90, tecnica: 91 },
      { id: 'atm_11', name: 'Alexander Sørloth', number: 9, position: 'DEL', isGoalkeeper: false, disparo: 89, fuerza: 94, precision: 84, tecnica: 82 },
    ],
  },
  {
    id: 'athletic_club',
    name: 'Athletic Club de Bilbao',
    shortName: 'Athletic',
    primaryColor: '#ef4444',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    formation: '4-2-3-1',
    players: [
      { id: 'ath_1', name: 'Unai Simón', number: 1, position: 'POR', isGoalkeeper: true, disparo: 44, fuerza: 87, precision: 80, tecnica: 79 },
      { id: 'ath_2', name: 'Óscar de Marcos', number: 18, position: 'DEF', isGoalkeeper: false, disparo: 72, fuerza: 81, precision: 80, tecnica: 80 },
      { id: 'ath_3', name: 'Dani Vivian', number: 3, position: 'DEF', isGoalkeeper: false, disparo: 70, fuerza: 91, precision: 77, tecnica: 76 },
      { id: 'ath_4', name: 'Yeray Álvarez', number: 5, position: 'DEF', isGoalkeeper: false, disparo: 69, fuerza: 89, precision: 76, tecnica: 75 },
      { id: 'ath_5', name: 'Yuri Berchiche', number: 17, position: 'DEF', isGoalkeeper: false, disparo: 78, fuerza: 87, precision: 79, tecnica: 79 },
      { id: 'ath_6', name: 'Iñigo Ruiz de Galarreta', number: 16, position: 'MED', isGoalkeeper: false, disparo: 79, fuerza: 78, precision: 90, tecnica: 88 },
      { id: 'ath_7', name: 'Beñat Prados', number: 24, position: 'MED', isGoalkeeper: false, disparo: 76, fuerza: 83, precision: 84, tecnica: 85 },
      { id: 'ath_8', name: 'Iñaki Williams', number: 9, position: 'DEL', isGoalkeeper: false, disparo: 87, fuerza: 88, precision: 83, tecnica: 85 },
      { id: 'ath_9', name: 'Oihan Sancet', number: 8, position: 'MED', isGoalkeeper: false, disparo: 88, fuerza: 86, precision: 89, tecnica: 90 },
      { id: 'ath_10', name: 'Nico Williams', number: 10, position: 'DEL', isGoalkeeper: false, disparo: 90, fuerza: 81, precision: 89, tecnica: 94 },
      { id: 'ath_11', name: 'Gorka Guruzeta', number: 12, position: 'DEL', isGoalkeeper: false, disparo: 86, fuerza: 84, precision: 85, tecnica: 82 },
    ],
  },
  {
    id: 'man_city',
    name: 'Manchester City FC',
    shortName: 'Man. City',
    primaryColor: '#38bdf8',
    secondaryColor: '#ffffff',
    textColor: '#0f172a',
    formation: '4-3-3',
    players: [
      { id: 'mci_1', name: 'Ederson Moraes', number: 31, position: 'POR', isGoalkeeper: true, disparo: 55, fuerza: 85, precision: 92, tecnica: 88 },
      { id: 'mci_2', name: 'Kyle Walker', number: 2, position: 'DEF', isGoalkeeper: false, disparo: 74, fuerza: 88, precision: 80, tecnica: 80 },
      { id: 'mci_3', name: 'Rúben Dias', number: 3, position: 'DEF', isGoalkeeper: false, disparo: 70, fuerza: 92, precision: 82, tecnica: 81 },
      { id: 'mci_4', name: 'Manuel Akanji', number: 25, position: 'DEF', isGoalkeeper: false, disparo: 72, fuerza: 89, precision: 83, tecnica: 82 },
      { id: 'mci_5', name: 'Joško Gvardiol', number: 24, position: 'DEF', isGoalkeeper: false, disparo: 82, fuerza: 90, precision: 85, tecnica: 86 },
      { id: 'mci_6', name: 'Rodri Hernández', number: 16, position: 'MED', isGoalkeeper: false, disparo: 91, fuerza: 93, precision: 96, tecnica: 95 },
      { id: 'mci_7', name: 'Kevin De Bruyne', number: 17, position: 'MED', isGoalkeeper: false, disparo: 94, fuerza: 84, precision: 98, tecnica: 97 },
      { id: 'mci_8', name: 'Bernardo Silva', number: 20, position: 'MED', isGoalkeeper: false, disparo: 86, fuerza: 76, precision: 94, tecnica: 96 },
      { id: 'mci_9', name: 'Phil Foden', number: 47, position: 'DEL', isGoalkeeper: false, disparo: 92, fuerza: 78, precision: 93, tecnica: 96 },
      { id: 'mci_10', name: 'Erling Haaland', number: 9, position: 'DEL', isGoalkeeper: false, disparo: 98, fuerza: 97, precision: 92, tecnica: 86 },
      { id: 'mci_11', name: 'Jérémy Doku', number: 11, position: 'DEL', isGoalkeeper: false, disparo: 84, fuerza: 79, precision: 86, tecnica: 93 },
    ],
  },
  {
    id: 'bayern_munich',
    name: 'FC Bayern München',
    shortName: 'Bayern',
    primaryColor: '#b91c1c',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    formation: '4-2-3-1',
    players: [
      { id: 'bay_1', name: 'Manuel Neuer', number: 1, position: 'POR', isGoalkeeper: true, disparo: 48, fuerza: 88, precision: 84, tecnica: 85 },
      { id: 'bay_2', name: 'Joshua Kimmich', number: 6, position: 'DEF', isGoalkeeper: false, disparo: 84, fuerza: 82, precision: 94, tecnica: 92 },
      { id: 'bay_3', name: 'Dayot Upamecano', number: 2, position: 'DEF', isGoalkeeper: false, disparo: 69, fuerza: 92, precision: 79, tecnica: 78 },
      { id: 'bay_4', name: 'Kim Min-jae', number: 3, position: 'DEF', isGoalkeeper: false, disparo: 70, fuerza: 93, precision: 80, tecnica: 77 },
      { id: 'bay_5', name: 'Alphonso Davies', number: 19, position: 'DEF', isGoalkeeper: false, disparo: 79, fuerza: 85, precision: 82, tecnica: 88 },
      { id: 'bay_6', name: 'Aleksandar Pavlović', number: 45, position: 'MED', isGoalkeeper: false, disparo: 78, fuerza: 80, precision: 88, tecnica: 89 },
      { id: 'bay_7', name: 'Leon Goretzka', number: 8, position: 'MED', isGoalkeeper: false, disparo: 86, fuerza: 91, precision: 84, tecnica: 83 },
      { id: 'bay_8', name: 'Michael Olise', number: 17, position: 'DEL', isGoalkeeper: false, disparo: 89, fuerza: 79, precision: 91, tecnica: 93 },
      { id: 'bay_9', name: 'Jamal Musiala', number: 42, position: 'MED', isGoalkeeper: false, disparo: 90, fuerza: 79, precision: 92, tecnica: 97 },
      { id: 'bay_10', name: 'Harry Kane', number: 9, position: 'DEL', isGoalkeeper: false, disparo: 97, fuerza: 90, precision: 96, tecnica: 92 },
      { id: 'bay_11', name: 'Serge Gnabry', number: 7, position: 'DEL', isGoalkeeper: false, disparo: 88, fuerza: 83, precision: 87, tecnica: 88 },
    ],
  },
];

export const ChapasQuickPlayModal: React.FC<ChapasQuickPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [gameMode, setGameMode] = useState<'ai' | 'local2p' | 'training'>('ai');
  const [selectedHomeIndex, setSelectedHomeIndex] = useState<number>(0);
  const [selectedAwayIndex, setSelectedAwayIndex] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<AiDifficulty>('normal');
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const homeTeam = QUICK_TEAMS[selectedHomeIndex] || QUICK_TEAMS[0];
  const awayTeam = QUICK_TEAMS[selectedAwayIndex] || QUICK_TEAMS[1];

  const handleStartGame = () => {
    playClickSound();
    setIsMatchActive(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 select-none">
        <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-condensed tracking-wider uppercase text-white">
                  Fútbol Chapas — Juego Directo
                </h2>
                <p className="text-xs text-slate-400">
                  Accede a partidas rápidas, 2 jugadores o entrenamiento sin necesidad de iniciar una carrera
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1P vs Machine */}
            <button
              onClick={() => {
                playClickSound();
                setGameMode('ai');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                gameMode === 'ai'
                  ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bot className={`w-5 h-5 ${gameMode === 'ai' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="font-bold font-condensed uppercase tracking-wider text-sm text-white">
                  1P vs Máquina
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Partido completo con IA táctica inteligente, física realista y 2:30 por tiempo.
              </p>
            </button>

            {/* 2P Local (Pass & Play) */}
            <button
              onClick={() => {
                playClickSound();
                setGameMode('local2p');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                gameMode === 'local2p'
                  ? 'bg-gradient-to-br from-blue-950/80 to-slate-900 border-blue-500 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-5 h-5 ${gameMode === 'local2p' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="font-bold font-condensed uppercase tracking-wider text-sm text-white">
                  2 Jugadores Local
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Duelo por turnos en el mismo dispositivo. Máxima emoción cara a cara.
              </p>
            </button>

            {/* Dedicated Free Training */}
            <button
              onClick={() => {
                playClickSound();
                setGameMode('training');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                gameMode === 'training'
                  ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className={`w-5 h-5 ${gameMode === 'training' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="font-bold font-condensed uppercase tracking-wider text-sm text-white">
                  Entrenamiento Libre
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Solo tu equipo en el campo con obstáculos/conos. Práctica de disparos y faltas sin presión.
              </p>
            </button>
          </div>

          {/* Team Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team 1 (User / Home) */}
            <div className="space-y-2">
              <label className="text-xs font-bold font-condensed uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>{gameMode === 'training' ? 'Tu Equipo de Entrenamiento' : 'Equipo Local (Tú)'}</span>
              </label>
              <select
                value={selectedHomeIndex}
                onChange={(e) => setSelectedHomeIndex(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
              >
                {QUICK_TEAMS.map((team, idx) => (
                  <option key={team.id} value={idx}>
                    {team.name} ({team.formation})
                  </option>
                ))}
              </select>

              {/* Home Team Preview Card */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: homeTeam.primaryColor }}
                  />
                  <div>
                    <p className="font-bold font-condensed uppercase tracking-wide text-xs text-white">
                      {homeTeam.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">11 Jugadores · Formación {homeTeam.formation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team 2 (Rival / Away) - Hidden in Training Mode */}
            {gameMode !== 'training' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold font-condensed uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>{gameMode === 'ai' ? 'Rival (Máquina / IA)' : 'Equipo Visitante (Jugador 2)'}</span>
                </label>
                <select
                  value={selectedAwayIndex}
                  onChange={(e) => setSelectedAwayIndex(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500 shadow-inner"
                >
                  {QUICK_TEAMS.map((team, idx) => (
                    <option key={team.id} value={idx}>
                      {team.name} ({team.formation})
                    </option>
                  ))}
                </select>

                {/* Away Team Preview Card */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: awayTeam.primaryColor }}
                    />
                    <div>
                      <p className="font-bold font-condensed uppercase tracking-wide text-xs text-white">
                        {awayTeam.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">11 Jugadores · Formación {awayTeam.formation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Training Mode Tips */
              <div className="space-y-2">
                <label className="text-xs font-bold font-condensed uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Configuración del Campo de Prácticas</span>
                </label>
                <div className="p-3 bg-amber-950/20 border border-amber-600/30 rounded-xl space-y-1.5 text-xs text-amber-200/90 leading-relaxed">
                  <p className="font-bold font-condensed uppercase text-amber-300">
                    🥅 Sin rival, sin silbatos de tiempo
                  </p>
                  <p className="text-[11px] text-slate-300">
                    8 conos tácticos colocados como barrera defensiva y slalom. Botones para colocar el balón en el centro, al borde del área para faltas o en el punto de penalti.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Difficulty Selector (Only in 1P vs Machine) */}
          {gameMode === 'ai' && (
            <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold font-condensed uppercase tracking-wider text-slate-300">
                Nivel de la Inteligencia Artificial:
              </span>
              <div className="flex gap-1.5">
                {(['facil', 'normal', 'dificil', 'experto'] as AiDifficulty[]).map((dif) => (
                  <button
                    key={dif}
                    onClick={() => {
                      playClickSound();
                      setDifficulty(dif);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-condensed font-bold uppercase transition-all ${
                      difficulty === dif
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dif}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Launch Action Button */}
          <button
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black font-condensed uppercase tracking-wider text-base rounded-2xl shadow-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 border border-emerald-400/50"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{gameMode === 'training' ? '¡Iniciar Sesión de Entrenamiento!' : '¡Saltar al Terreno de Juego!'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Match Modal */}
      {isMatchActive && (
        <ChapasMatchModal
          isOpen={isMatchActive}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          userSide={gameMode === 'local2p' ? 'both' : 'home'}
          aiDifficulty={difficulty}
          isTrainingMode={gameMode === 'training'}
          competitionName={
            gameMode === 'training'
              ? 'Entrenamiento de Puntería y Faltas'
              : gameMode === 'local2p'
              ? 'Amistoso Local 2 Jugadores'
              : `Partido Amistoso vs IA (${difficulty.toUpperCase()})`
          }
          onMatchFinished={(res) => {
            setIsMatchActive(false);
          }}
          onClose={() => {
            setIsMatchActive(false);
          }}
        />
      )}
    </>
  );
};
