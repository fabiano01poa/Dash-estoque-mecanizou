import React, { useState } from 'react';
import { Database, FileText, Download, Sparkles, RefreshCw, Settings, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  sheetUrl: string;
  onUpdateSheetUrl: (url: string) => void;
  onReloadData: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onOpenAiModal: () => void;
  loading: boolean;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  sheetUrl,
  onUpdateSheetUrl,
  onReloadData,
  onExportCsv,
  onExportPdf,
  onOpenAiModal,
  loading,
  alertCount,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(sheetUrl);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSheetUrl(tempUrl);
    setShowConfig(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Dashboard Gerencial & Indicadores
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Tempo Real
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Análise de Entradas (Recebimento) vs Saídas e Alertas Críticos de Desempenho
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {alertCount > 0 && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              {alertCount} {alertCount === 1 ? 'Alerta Crítico' : 'Alertas Críticos'}
            </span>
          )}

          <button
            onClick={onReloadData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            title="Recarregar Planilha"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-xs"
            title="Configurar Link da Planilha"
          >
            <Settings className="w-4 h-4 mr-1.5 text-slate-500" />
            Fonte
          </button>

          <button
            onClick={onOpenAiModal}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-indigo-200" />
            IA Insights
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          <button
            onClick={onExportCsv}
            className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            title="Exportar CSV"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            CSV
          </button>

          <button
            onClick={onExportPdf}
            className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs"
            title="Exportar Relatório PDF"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            PDF
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSaveUrl} className="max-w-4xl flex items-center gap-3">
            <span className="text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
              Google Sheet URL:
            </span>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Cole o link do Google Sheets público..."
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Carregar
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
