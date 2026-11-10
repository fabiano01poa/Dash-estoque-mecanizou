import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MetricSummary } from '../types';
import { TrendingUp, BarChart3, Columns } from 'lucide-react';

interface ChartsSectionProps {
  metrics: MetricSummary;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ metrics }) => {
  const { combinedTrend } = metrics;

  return (
    <div className="space-y-6 mb-6">
      {/* Composed Chart with Trend */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-5 h-5 text-indigo-600 mr-2" />
              Fluxo de Entradas vs Saídas & Linha de Tendência (Backlog)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativo temporal de movimentações e linha de tendência acumulada no período selecionado
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Tendência em Tempo Real</span>
          </div>
        </div>

        <div className="h-80 w-full">
          {combinedTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Nenhum dado temporal disponível para o período selecionado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="received"
                  name="Entradas (Recebimento)"
                  fill="#6366f1"
                  stroke="#4f46e5"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="output"
                  name="Saídas (Baixa)"
                  fill="#10b981"
                  stroke="#059669"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  name="Linha de Tendência (Backlog)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Side-by-Side Bar Chart for Multi-Month/Period Comparison */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Columns className="w-5 h-5 text-emerald-600 mr-2" />
              Comparativo Lado a Lado (Mês x Mês) - Gráfico de Barras
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparação direta entre volume de Entradas e Saídas por período para análise comparativa
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span>Mês x Mês Comparativo</span>
          </div>
        </div>

        <div className="h-80 w-full">
          {combinedTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Nenhum dado disponível para o comparativo.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="received" name="Entradas (Recebimento)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="output" name="Saídas (Baixa)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
