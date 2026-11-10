import React, { useState } from 'react';
import { dataService, QualityAuditReport } from '../../services/dataService';
import { playClickSound, playGoalSound } from '../../utils/audio';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Database, 
  CheckCircle, 
  Layers, 
  Globe2, 
  Users, 
  Building2, 
  X, 
  Link2 
} from 'lucide-react';

interface DatabaseAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseAdminPanel: React.FC<DatabaseAdminPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<QualityAuditReport>(dataService.generateQualityReport());
  const [activeTab, setActiveTab] = useState<'AUDITORIA' | 'CONECTORES' | 'IMPORTADOR'>('AUDITORIA');
  const [csvInput, setCsvInput] = useState('');
  const [importNotice, setImportNotice] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const refreshReport = () => {
    setReport(dataService.generateQualityReport());
  };

  const handleExportFullJson = () => {
    playClickSound();
    const jsonStr = dataService.exportFullDatabaseAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SantakoFutbol_WorldDatabase_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = () => {
    playClickSound();
    if (!csvInput.trim()) {
      setImportNotice({ success: false, msg: 'Pega primero el texto CSV en el recuadro.' });
      return;
    }
    try {
      const res = dataService.importPlayersFromCsv(csvInput);
      playGoalSound();
      setImportNotice({ success: true, msg: res.message });
      setCsvInput('');
      refreshReport();
    } catch (err: any) {
      setImportNotice({ success: false, msg: err.message });
    }
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playClickSound();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = dataService.importFromJson(text);
        playGoalSound();
        setImportNotice({ success: true, msg: res.message });
        refreshReport();
      } catch (err: any) {
        setImportNotice({ success: false, msg: err.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const connectors = dataService.getConnectors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-condensed tracking-wide uppercase">
                Panel de Calidad & Administración de Datos
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría del universo futbolístico mundial · Control de completitud y conectores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFullJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar BBDD JSON</span>
            </button>
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
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/60 gap-4 text-xs font-bold font-condensed uppercase tracking-wider">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('AUDITORIA');
            }}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'AUDITORIA'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Informe de Calidad & Resumen
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('CONECTORES');
            }}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'CONECTORES'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Conectores de Datos ({connectors.length})
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('IMPORTADOR');
            }}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'IMPORTADOR'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Importador CSV / JSON
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {importNotice && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                importNotice.success
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}
            >
              <span>{importNotice.msg}</span>
              <button onClick={() => setImportNotice(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: AUDIT REPORT */}
          {activeTab === 'AUDITORIA' && (
            <div className="space-y-6">
              {/* Metric KPI Strips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono-num text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1 font-sans">Países FIFA</span>
                  <span className="text-xl font-black text-slate-100">{report.totalCountries}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1 font-sans">Competiciones</span>
                  <span className="text-xl font-black text-slate-100">{report.totalCompetitions}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1 font-sans">Clubes Reales</span>
                  <span className="text-xl font-black text-slate-100">{report.totalClubs}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1 font-sans">Estadios Reales</span>
                  <span className="text-xl font-black text-slate-100">{report.totalStadiums}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1 font-sans">Jugadores BBDD</span>
                  <span className="text-xl font-black text-emerald-400">{report.totalPlayers}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block mb-1 font-sans">Cuerpos Técnicos</span>
                  <span className="text-xl font-black text-amber-400">{report.totalStaff}</span>
                </div>
              </div>

              {/* Data Verification Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Auditoría de Procedencia de Jugadores
                  </h3>
                  <div className="space-y-2 text-xs font-mono-num">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Fuentes Oficiales Verificadas (RFEF, FIFA, Clubes):</span>
                      <strong className="text-emerald-400 font-bold">{report.officialPlayersCount} fichas</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Estimaciones Ponderadas de Motor:</span>
                      <strong className="text-amber-400 font-bold">{report.estimatedPlayersCount} fichas</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Posibles Duplicados por Nombre / Fecha:</span>
                      <strong className={report.potentialDuplicates.length > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {report.potentialDuplicates.length === 0 ? 'Ninguno detectado' : `${report.potentialDuplicates.length} alertas`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 font-condensed uppercase tracking-wider flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-sky-400" />
                    Cobertura por Confederaciones FIFA
                  </h3>
                  <div className="space-y-1.5 text-xs font-mono-num">
                    {Object.entries(report.confederationBreakdown).map(([conf, data]) => (
                      <div key={conf} className="flex justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                        <span className="font-bold text-slate-300">{conf}:</span>
                        <span className="text-slate-400">
                          {data.countries} países · {data.competitions} competiciones · {data.clubs} clubes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Integrity Alerts */}
              {report.incompleteClubs.length > 0 && (
                <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-condensed uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Control de Calidad: Clubes con Plantillas en Proceso de Documentación</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Conforme a la regla 7 ("No declarar una liga completa si faltan participantes"), estos clubes tienen fichas iniciales y admiten ampliación mediante el importador:
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono-num text-amber-200">
                    {report.incompleteClubs.map((clubStr, idx) => (
                      <span key={idx} className="bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                        {clubStr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONNECTORS */}
          {activeTab === 'CONECTORES' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Cada conector documenta estrictamente qué datos provee y cuáles omite para garantizar la veracidad de la base de datos de SANTAKO FÚTBOL.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectors.map((conn) => (
                  <div key={conn.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-slate-100 text-xs">{conn.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono-num font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        {conn.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{conn.description}</p>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Campos que proporciona:</span>
                      <ul className="text-slate-300 text-[11px] list-disc list-inside space-y-0.5 pl-1">
                        {conn.providedFields.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block">Campos no proporcionados (vacíos):</span>
                      <ul className="text-slate-400 text-[11px] list-disc list-inside space-y-0.5 pl-1">
                        {conn.missingFields.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 font-mono-num">
                      Licencia: {conn.licenseNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CSV/JSON IMPORTER */}
          {activeTab === 'IMPORTADOR' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* JSON Upload */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-condensed flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    Importar Paquete BBDD en JSON
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sube un archivo `.json` que contenga una colección de clubes o jugadores. Se integrarán y actualizarán automáticamente en la base de datos local.
                  </p>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer text-xs font-medium text-slate-300 hover:text-white transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar archivo .json</span>
                    <input type="file" accept=".json" className="hidden" onChange={handleJsonFileUpload} />
                  </label>
                </div>

                {/* CSV Format spec */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-condensed flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    Formato de Cabecera CSV Admitido
                  </h4>
                  <p className="text-xs text-slate-400">
                    Estructura requerida para importación masiva de futbolistas en CSV:
                  </p>
                  <pre className="text-[10px] font-mono-num bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 overflow-x-auto">
                    id,fullName,primaryPosition,age,currentClubId
                  </pre>
                  <p className="text-[11px] text-slate-500">
                    Ejemplo: <code className="text-emerald-400 font-mono-num">p_001,Pau Torres,DFC,26,ce_europa</code>
                  </p>
                </div>
              </div>

              {/* Direct CSV Text Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-200 uppercase font-condensed tracking-wider">
                  Pegar Datos CSV Directos
                </label>
                <textarea
                  rows={5}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="id,fullName,primaryPosition,age,currentClubId&#10;p_extra_1,Marc Jurado,MC,22,fe_grama"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono-num text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleImportCsv}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
                >
                  Procesar e Incorporar Registros CSV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono-num">
          <span>SANTAKO FÚTBOL · Base de Datos Oficial v1.0.0</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-sans"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
