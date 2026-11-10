import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Layers, Activity, AlertTriangle, Calculator } from 'lucide-react';
import { MetricSummary } from '../types';

interface KpiCardsProps {
  metrics: MetricSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const { 
    totalReceived, 
    totalOutput, 
    netBalance, 
    turnoverRate,
    avgDailyEntries,
    avgDailyOutputs,
    netDailyRate,
    daysRemainingInMonth,
    projectedEndOfMonthStock
  } = metrics;

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Received */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Recebido (Entrada)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalReceived.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <span className="font-medium text-indigo-600 mr-1">Com base na coluna</span> Data Recebimento
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </div>

        {/* Total Output */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Saída (Baixa)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalOutput.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <span className="font-medium text-emerald-600 mr-1">Com base na coluna</span> Data Saída
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Net Balance / Backlog */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saldo Pendente (Backlog)
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netBalance > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-3xl font-extrabold tracking-tight ${netBalance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {netBalance > 0 ? `+${netBalance}` : netBalance}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Entradas não baixadas no período
            </p>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${netBalance > 0 ? 'bg-amber-500' : 'bg-slate-400'}`} />
        </div>

        {/* Turnover Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Taxa de Giro / Conversão
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${turnoverRate >= 80 ? 'bg-emerald-50 text-emerald-600' : turnoverRate >= 50 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-3xl font-extrabold tracking-tight ${turnoverRate >= 80 ? 'text-emerald-600' : turnoverRate >= 50 ? 'text-blue-600' : 'text-rose-600'}`}>
              {turnoverRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              (Saídas / Entradas) × 100
            </p>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${turnoverRate >= 80 ? 'bg-emerald-500' : turnoverRate >= 50 ? 'bg-blue-500' : 'bg-rose-500'}`} />
        </div>
      </div>

      {/* Stock Forecast Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-bold text-white tracking-wide">Previsão de Estoque até o Fim do Mês (Tendência)</h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">Projeção Baseada em Médias</span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1">
              Cálculo contínuo: Média de Entrada ({avgDailyEntries.toFixed(1)} pç/dia) vs. Média de Saída ({avgDailyOutputs.toFixed(1)} pç/dia) por {daysRemainingInMonth} dias restantes.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 shrink-0 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-indigo-300 block">Variação Diária</span>
            <span className={`text-sm font-bold font-mono ${netDailyRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netDailyRate >= 0 ? `+${netDailyRate.toFixed(1)}` : netDailyRate.toFixed(1)} pç/dia
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-indigo-300 block">Estoque Previsto (Fim do Mês)</span>
            <span className="text-xl font-extrabold font-mono text-white">
              {projectedEndOfMonthStock.toLocaleString()} <span className="text-xs font-normal text-slate-300">peças</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
