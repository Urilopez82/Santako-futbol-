import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';
import { clearActiveSaveId } from '../storage/indexedDB';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleResetToMenu = () => {
    window.location.reload();
  };

  private handleHardReset = async () => {
    try {
      await clearActiveSaveId();
      localStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-gradient-to-b from-slate-900 via-[#0d1627] to-[#070b14] border-2 border-rose-500/50 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-condensed font-black tracking-widest uppercase px-3 py-1 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-full">
                SISTEMA DE RECUPERACIÓN DE PARTIDA
              </span>
              <h2 className="text-2xl font-black text-white font-condensed uppercase tracking-wider">
                Se detectó una discrepancia en el simulador
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                El motor ha capturado un error en los datos de la partida. Puedes reintentar la carga, volver al menú principal o reiniciar la caché del navegador.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-[11px] font-mono-num text-rose-300 overflow-x-auto max-h-32">
                <span className="font-bold text-slate-400 block mb-1">Diagnóstico técnico:</span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleResetToMenu}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-condensed uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <RefreshCw className="w-4 h-4 text-slate-950" />
                <span>Recargar Aplicación</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs font-condensed uppercase tracking-wider rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                title="Limpia la sesión activa de IndexedDB y vuelve al inicio"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Restablecer al Menú</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
