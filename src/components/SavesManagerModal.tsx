import React, { useState, useEffect } from 'react';
import { 
  getAllSaveMetadata, 
  getSaveById, 
  deleteSaveById, 
  duplicateSave, 
  renameSave, 
  exportSaveToFile, 
  importSaveFromFile 
} from '../storage/indexedDB';
import { GameSave, SaveMetadata } from '../types/game';
import { playClickSound } from '../utils/audio';
import { 
  FolderOpen, 
  Copy, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  X, 
  Calendar, 
  Trophy, 
  ShieldAlert, 
  Check, 
  Clock 
} from 'lucide-react';

interface SavesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSave: (save: GameSave) => void;
  currentSaveId?: string;
}

export const SavesManagerModal: React.FC<SavesManagerModalProps> = ({
  isOpen,
  onClose,
  onLoadSave,
  currentSaveId,
}) => {
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchSaves = async () => {
    setLoading(true);
    try {
      const all = await getAllSaveMetadata();
      setSaves(all);
    } catch (err) {
      console.error('Error al cargar partidas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSaves();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoad = async (id: string) => {
    playClickSound();
    const save = await getSaveById(id);
    if (save) {
      onLoadSave(save);
      onClose();
    }
  };

  const handleDuplicate = async (id: string) => {
    playClickSound();
    try {
      await duplicateSave(id);
      showNotice('Partida duplicada correctamente.');
      await fetchSaves();
    } catch (err: any) {
      showNotice('Error al duplicar partida.');
    }
  };

  const handleStartRename = (save: SaveMetadata) => {
    playClickSound();
    setEditingId(save.id);
    setEditName(save.saveName);
  };

  const handleSaveRename = async (id: string) => {
    if (!editName.trim()) return;
    playClickSound();
    try {
      await renameSave(id, editName.trim());
      setEditingId(null);
      showNotice('Nombre actualizado.');
      await fetchSaves();
    } catch (err) {
      showNotice('Error al renombrar.');
    }
  };

  const handleDelete = async (id: string) => {
    playClickSound();
    try {
      await deleteSaveById(id);
      setDeleteConfirmId(null);
      showNotice('Partida eliminada.');
      await fetchSaves();
    } catch (err) {
      showNotice('Error al eliminar partida.');
    }
  };

  const handleExport = async (id: string) => {
    playClickSound();
    const save = await getSaveById(id);
    if (save) {
      exportSaveToFile(save);
      showNotice('Archivo de respaldo exportado.');
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playClickSound();
    try {
      const imported = await importSaveFromFile(file);
      showNotice('Partida importada con éxito.');
      await fetchSaves();
      onLoadSave(imported);
      onClose();
    } catch (err: any) {
      showNotice(err?.message || 'Error al importar partida.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-condensed tracking-wide uppercase">
                Administración de Partidas
              </h2>
              <p className="text-xs text-slate-400">
                Almacenamiento persistente IndexedDB · Guarda, duplica, exporta e importa
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        {notification && (
          <div className="px-6 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-850 border-b border-slate-800">
          <span className="text-xs text-slate-400 font-medium">
            Total de partidas: <strong className="text-slate-200">{saves.length}</strong>
          </span>
          <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Importar Archivo .santako.json</span>
            <input
              type="file"
              accept=".json,.santako.json"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>

        {/* Saves List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Cargando partidas almacenadas...
            </div>
          ) : saves.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-medium">No se han encontrado partidas guardadas.</p>
              <p className="text-xs text-slate-500">
                Inicia una "Nueva Partida" en el menú principal para comenzar tu carrera.
              </p>
            </div>
          ) : (
            saves.map((s) => {
              const isCurrent = s.id === currentSaveId;
              const isEditing = editingId === s.id;
              const isDeleting = deleteConfirmId === s.id;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-800/80 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-slate-900 border border-slate-700 px-3 py-1 rounded text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(s.id)}
                            className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 rounded"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-100 truncate text-base">
                            {s.saveName}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                              Activa
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
                        <span className="text-slate-200 font-medium">{s.clubName}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span>{s.managerName}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-300 font-mono-num">Temp. {s.currentSeason}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 font-mono-num">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {s.currentDate}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 font-mono-num text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(s.updatedAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isDeleting ? (
                        <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-800/40 p-1.5 rounded-lg">
                          <span className="text-xs text-rose-300">¿Eliminar?</span>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
                          >
                            Sí, Borrar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 rounded"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleLoad(s.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => handleDuplicate(s.id)}
                            title="Duplicar partida"
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStartRename(s)}
                            title="Renombrar partida"
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExport(s.id)}
                            title="Exportar archivo de respaldo"
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            title="Eliminar partida"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
