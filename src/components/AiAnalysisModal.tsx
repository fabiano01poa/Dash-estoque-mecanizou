import React, { useState } from 'react';
import { Sparkles, X, Loader2, Bot, CheckCircle } from 'lucide-react';
import { MetricSummary } from '../types';
import Markdown from 'react-markdown';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricSummary;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({ isOpen, onClose, metrics }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricsSummary: {
            totalReceived: metrics.totalReceived,
            totalOutput: metrics.totalOutput,
            netBalance: metrics.netBalance,
            turnoverRate: metrics.turnoverRate,
            alertsCount: metrics.alerts.length,
            alerts: metrics.alerts,
            recordsCount: metrics.filteredRowsCount,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar relatório com IA.');
      }
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor de IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Análise Executiva com IA (Gemini)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700">
          {!analysis && !loading && !error && (
            <div className="text-center py-10">
              <Bot className="w-12 h-12 text-indigo-600 mx-auto mb-3 opacity-80" />
              <h4 className="font-bold text-slate-900 text-base mb-1">Pronto para Análise Gerencial em Tempo Real</h4>
              <p className="text-slate-500 max-w-md mx-auto text-xs mb-6">
                O Gemini irá processar os indicadores de recebimento, saída, saldo e alertas para fornecer insights estratégicos e recomendações acionáveis.
              </p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Relatório Inteligente
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">Analisando indicadores de desempenho...</p>
              <p className="text-xs text-slate-400 mt-1">Isso pode levar alguns segundos.</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <strong>Erro:</strong> {error}
              <div className="mt-3">
                <button
                  onClick={handleGenerate}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Análise gerada com sucesso via Gemini 2.5 Flash</span>
              </div>
              <div className="markdown-body prose prose-sm max-w-none text-slate-800">
                <Markdown>{analysis}</Markdown>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-xs text-slate-500">Decisões baseadas em dados em tempo real</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
