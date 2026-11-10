import React, { useState, useEffect } from 'react';
import { getLastActiveSaveId, getSaveById, importSaveFromFile } from '../storage/indexedDB';
import { GameSave, SaveMetadata } from '../types/game';
import { isSoundEnabled, playClickSound, toggleSound } from '../utils/audio';
import { 
  Play, 
  Plus, 
  FolderOpen, 
  Settings, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX, 
  Trophy, 
  ShieldCheck, 
  Sparkles,
  Globe2
} from 'lucide-react';

interface StartScreenProps {
  onNewGame: () => void;
  onContinueGame: (save: GameSave) => void;
  onOpenSavesManager: () => void;
  onGameLoaded: (save: GameSave) => void;
  onOpenWorldBrowser: () => void;
  onOpenAdminPanel: () => void;
  onOpenWorldCup?: () => void;
  onOpenChapasQuickPlay?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onNewGame,
  onContinueGame,
  onOpenSavesManager,
  onGameLoaded,
  onOpenWorldBrowser,
  onOpenAdminPanel,
  onOpenWorldCup,
  onOpenChapasQuickPlay,
}) => {
  const [lastSave, setLastSave] = useState<GameSave | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function checkLastSave() {
      try {
        const lastId = await getLastActiveSaveId();
        if (lastId) {
          const save = await getSaveById(lastId);
          if (save) {
            setLastSave(save);
          }
        }
      } catch (err) {
        console.error('Error al comprobar última partida:', err);
      } finally {
        setLoading(false);
      }
    }
    checkLastSave();
  }, []);

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playClickSound();
    try {
      const imported = await importSaveFromFile(file);
      onGameLoaded(imported);
    } catch (err: any) {
      setNotification(err?.message || 'Error al importar partida.');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Background Hero Image with atmospheric gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/santako_stadium_atmosphere_1793749096656.jpg"
          alt="Estadio Santako Fútbol"
          className="w-full h-full object-cover opacity-35 scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-slate-950/90" />
      </div>

      {/* Top Bar with sound and status */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Base de datos persistente (IndexedDB) activa</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              onOpenAdminPanel();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg backdrop-blur-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditoría BBDD</span>
          </button>

          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Desactivar audio' : 'Activar audio'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg backdrop-blur-sm transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundOn ? 'Sonido ON' : 'Silencio'}</span>
          </button>
        </div>
      </header>

      {/* Center Branding & Main Menu */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center">
        {/* Emblem & Title Lockup */}
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.2 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg shadow-emerald-950/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulador Integral de Gestión Futbolística · Edición 2026/27</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black font-condensed tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-2xl">
            SANTAKO FÚTBOL
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            Inspirado en la profundidad clásica de PC Fútbol y el rigor de los grandes simuladores modernos. Comienza en el barro y forja tu dinastía.
          </p>

          {/* Key Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-[10px] font-condensed font-black px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 tracking-wider uppercase">
              🇪🇸 5 Divisiones Españolas
            </span>
            <span className="text-[10px] font-condensed font-black px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 tracking-wider uppercase">
              🛡️ Copa del Rey (Partido Único)
            </span>
            <span className="text-[10px] font-condensed font-black px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 tracking-wider uppercase">
              🇪🇺 Champions & Torneos Continentales
            </span>
            <span className="text-[10px] font-condensed font-black px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 tracking-wider uppercase">
              🌍 80 Selecciones Mundiales
            </span>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mb-4 px-4 py-2 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs shadow-md">
            {notification}
          </div>
        )}

        {/* Menu Buttons Group */}
        <div className="w-full max-w-md space-y-2.5">
          {/* Continue button (if active save exists) */}
          {lastSave && (
            <button
              onClick={() => {
                playClickSound();
                onContinueGame(lastSave);
              }}
              className="w-full group px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/40 flex items-center justify-between transition-all transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 fill-current" />
                <div className="text-left">
                  <span className="block text-sm leading-tight uppercase font-condensed tracking-wider font-black">
                    Continuar Carrera
                  </span>
                  <span className="text-[11px] font-normal text-emerald-100 block">
                    {lastSave.metadata.clubName} · Temp. {lastSave.metadata.currentSeason}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono-num text-emerald-100 bg-emerald-700/60 px-2.5 py-1 rounded font-bold border border-emerald-400/30">
                {lastSave.currentDate}
              </span>
            </button>
          )}

          {/* New Game */}
          <button
            onClick={() => {
              playClickSound();
              onNewGame();
            }}
            className="w-full px-6 py-3 bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 hover:text-white font-semibold text-sm rounded-xl border border-slate-700/80 hover:border-slate-500 shadow-md backdrop-blur-sm flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="uppercase font-condensed tracking-wider text-sm font-bold">
                Nueva Partida (Modo Manager Total)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-condensed uppercase tracking-wider">Crear Manager</span>
          </button>

          {/* Standalone Fútbol Chapas Direct Mode */}
          {onOpenChapasQuickPlay && (
            <button
              onClick={() => {
                playClickSound();
                onOpenChapasQuickPlay();
              }}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-950/50 border-2 border-emerald-400/60 flex items-center justify-between transition-all transform hover:-translate-y-0.5 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-950/70 border border-emerald-400/70 flex items-center justify-center text-base shadow group-hover:scale-110 transition-transform">
                  ⚽
                </div>
                <div className="text-left">
                  <span className="block text-sm leading-tight uppercase font-condensed tracking-wider font-black text-white drop-shadow">
                    Fútbol Chapas (Jugar Directo)
                  </span>
                  <span className="text-[11px] font-medium text-emerald-100 block">
                    1P vs Máquina · 2P Local · Modo Entrenamiento Libre con Conos
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono-num text-emerald-950 bg-emerald-300 px-2 py-0.5 rounded font-black uppercase tracking-wider shadow">
                ¡Jugar Ya!
              </span>
            </button>
          )}

          {/* Standalone World Cup 2026 Mode Button */}
          {onOpenWorldCup && (
            <button
              onClick={() => {
                playClickSound();
                onOpenWorldCup();
              }}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/40 border border-amber-300/70 flex items-center justify-between transition-all transform hover:-translate-y-0.5 group"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-slate-950 fill-amber-950/20 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-sm leading-tight uppercase font-condensed tracking-wider font-black">
                    Copa Mundial FIFA 2026
                  </span>
                  <span className="text-[11px] font-bold text-amber-950/80 block">
                    Modo Torneo Independiente de Selecciones
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono-num text-slate-950 bg-amber-300/80 px-2 py-0.5 rounded font-black border border-amber-950/30">
                80 Países
              </span>
            </button>
          )}

          {/* World Database Browser */}
          <button
            onClick={() => {
              playClickSound();
              onOpenWorldBrowser();
            }}
            className="w-full px-6 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white font-semibold text-sm rounded-xl border border-sky-500/30 hover:border-sky-400/60 shadow-md backdrop-blur-sm flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Globe2 className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="uppercase font-condensed tracking-wider text-sm font-bold text-sky-300">
                Base de Datos Mundial (Enciclopedia)
              </span>
            </div>
            <span className="text-xs text-sky-400 font-mono-num font-bold">211 Países</span>
          </button>

          {/* Load / Manage Saves */}
          <button
            onClick={() => {
              playClickSound();
              onOpenSavesManager();
            }}
            className="w-full px-6 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white font-semibold text-sm rounded-xl border border-slate-700/80 hover:border-slate-500 shadow-md backdrop-blur-sm flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span className="uppercase font-condensed tracking-wider text-sm font-bold">
                Cargar / Administrar Partidas
              </span>
            </div>
            <span className="text-xs text-slate-400 font-condensed">Gestión de BBDD</span>
          </button>

          {/* Import Backup */}
          <label className="w-full px-6 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white font-semibold text-sm rounded-xl border border-slate-700/80 hover:border-slate-500 shadow-md backdrop-blur-sm flex items-center justify-between transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="uppercase font-condensed tracking-wider text-sm font-bold">
                Importar Archivo de Partida
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono-num">.santako.json</span>
            <input
              type="file"
              accept=".json,.santako.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </label>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-5 border-t border-slate-800/80 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">SANTAKO FÚTBOL</span>
          <span>© 2026 · Simulación de fútbol total</span>
        </div>
        <div>
          <span>Español de España · Persistencia local garantizada</span>
        </div>
      </footer>
    </div>
  );
};
