import React, { useState, useEffect } from 'react';
import { Club } from '../../types/club';
import { Terminal, Shield, AlertTriangle, CheckCircle2, X, Lock, Cpu, Zap } from 'lucide-react';

interface HackingTerminalModalProps {
  isOpen: boolean;
  targetClub: Club;
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

export const HackingTerminalModal: React.FC<HackingTerminalModalProps> = ({
  isOpen,
  targetClub,
  onComplete,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[SYS_INIT] Conectando a terminal TOR encubierto v4.19...`,
    `[TARGET] Servidor central del ${targetClub.name} localizado.`,
    `[FIREWALL] Sistema de seguridad: Blindaje Nivel 4 activo.`,
    `[OBJECTIVE] Localiza y activa las 3 claves binarias de bypass antes de que expire la traza de seguridad.`,
  ]);

  // Puzzle node keys: 6 available nodes, 3 correct ones needed
  const [nodes, setNodes] = useState<{ id: number; code: string; isCorrect: boolean; isCracked: boolean }[]>([
    { id: 1, code: '0x4F_TAC', isCorrect: true, isCracked: false },
    { id: 2, code: '0x99_PROXY', isCorrect: false, isCracked: false },
    { id: 3, code: '0x2A_SCOUT', isCorrect: true, isCracked: false },
    { id: 4, code: '0xBB_FIRE', isCorrect: false, isCracked: false },
    { id: 5, code: '0x7E_DIR', isCorrect: true, isCracked: false },
    { id: 6, code: '0x1C_LOG', isCorrect: false, isCracked: false },
  ]);

  const [crackedCount, setCrackedCount] = useState<number>(0);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [hackOutcome, setHackOutcome] = useState<'success' | 'failed' | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || hasFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasFinished(true);
          setHackOutcome('failed');
          setTerminalLogs((logs) => [
            ...logs,
            `[ALARMA CRÍTICA] ¡Tiempo agotado! Cortafuegos del ${targetClub.name} interceptó la intrusión. IP reportada a la Policía Nacional.`,
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, hasFinished, targetClub.name]);

  const handleSelectNode = (nodeId: number) => {
    if (hasFinished) return;

    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode || targetNode.isCracked) return;

    if (targetNode.isCorrect) {
      const nextCracked = crackedCount + 1;
      setCrackedCount(nextCracked);
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, isCracked: true } : n))
      );
      setTerminalLogs((logs) => [
        ...logs,
        `[ACIERTO] Nodo ${targetNode.code} decodificado. Clave de bypass inyectada con éxito.`,
      ]);

      if (nextCracked >= 3) {
        setHasFinished(true);
        setHackOutcome('success');
        setTerminalLogs((logs) => [
          ...logs,
          `[ROOT_ACCESS] ¡ACCESO TOTAL CONCEDIDO! Esquemas tácticos e informes confidenciales del ${targetClub.name} descargados.`,
        ]);
      }
    } else {
      setTimeLeft((t) => Math.max(1, t - 6)); // Penalty for wrong node
      setTerminalLogs((logs) => [
        ...logs,
        `[ERROR] Nodo ${targetNode.code} señuelo activado. ¡Penalización de 6 segundos en la traza!`,
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-black border-2 border-emerald-500 rounded-2xl max-w-2xl w-full flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden font-mono text-emerald-400">
        {/* Terminal Header */}
        <div className="bg-slate-950 border-b border-emerald-800/60 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider text-emerald-300">
              TERMINAL DE INFILTRACIÓN TOR v4.19 — [{targetClub.code}]
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded border text-xs font-bold ${
              timeLeft < 10 
                ? 'bg-red-950 text-red-400 border-red-500 animate-bounce' 
                : 'bg-emerald-950 text-emerald-300 border-emerald-700'
            }`}>
              ⏱️ TRAZA: {timeLeft}s
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Terminal Output Screen */}
        <div className="p-4 bg-black/95 h-52 overflow-y-auto space-y-1 text-xs border-b border-emerald-950 scanlines">
          {terminalLogs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-emerald-600 mr-2">&gt;</span>
              <span className={log.includes('[ERROR]') || log.includes('[ALARMA') ? 'text-red-400 font-bold' : log.includes('[ROOT_ACCESS]') || log.includes('[ACIERTO]') ? 'text-cyan-300 font-bold' : 'text-emerald-400'}>
                {log}
              </span>
            </div>
          ))}
        </div>

        {/* Interactive Puzzle Matrix */}
        <div className="p-4 bg-slate-950 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Selecciona los 3 nodos de acceso correctos:</span>
            <span className="font-bold text-emerald-400">Progreso: {crackedCount} / 3 nodos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {nodes.map((node) => (
              <button
                key={node.id}
                disabled={node.isCracked || hasFinished}
                onClick={() => handleSelectNode(node.id)}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                  node.isCracked
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-900 border-slate-700 hover:border-emerald-500 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <Cpu className={`w-4 h-4 ${node.isCracked ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{node.code}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {node.isCracked ? 'Bypassed ✓' : 'Encriptado'}
                </span>
              </button>
            ))}
          </div>

          {/* Result Outcome Screen */}
          {hasFinished && (
            <div className={`p-4 rounded-xl border text-center space-y-3 ${
              hackOutcome === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                : 'bg-red-950/40 border-red-500 text-red-200'
            }`}>
              <div className="flex items-center justify-center gap-2">
                {hackOutcome === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
                <h4 className="text-sm font-black uppercase tracking-wider">
                  {hackOutcome === 'success' ? '¡Infiltración Cibernética Exitosa!' : '¡Ataque Detectado y Bloqueado!'}
                </h4>
              </div>

              <p className="text-xs">
                {hackOutcome === 'success'
                  ? `Has sustraído los planes tácticos del ${targetClub.name}. La directiva rival entra en crisis de confianza (+2 estrellas policiales).`
                  : `El servidor del ${targetClub.name} ha registrado tu rastro de red. La Policía abre expediente (+4 estrellas policiales).`}
              </p>

              <button
                onClick={() => onComplete(hackOutcome === 'success')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105 ${
                  hackOutcome === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                    : 'bg-red-700 hover:bg-red-600 text-white'
                }`}
              >
                Cerrar Terminal y Registrar Consecuencias
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
