import React from 'react';
import { ReturnSummary } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
} from 'recharts';
import { RefreshCw, ArrowDownLeft, ArrowUpRight, Layers, Tag } from 'lucide-react';

interface ReturnsTabProps {
  returnSummary: ReturnSummary;
}

export const ReturnsTab: React.FC<ReturnsTabProps> = ({ returnSummary }) => {
  const { totalReturnEntries, totalReturnOutputs, returnNetBalance, returnTrend, returnRecords, outputTypeBreakdown } = returnSummary;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <RefreshCw className="w-6 h-6 text-violet-200" />
          <h2 className="text-xl font-bold">Devoluções & Tipos de Saída (Baseado na coluna Endereçamento)</h2>
        </div>
        <p className="text-xs text-violet-100 max-w-2xl">
          Classificação detalhada dos destinos de saída com base na coluna <strong>Endereçamento</strong> (ex: Devolvido Fornecedor, Revenda Mecânica, Sucata, Perdido).
        </p>
      </div>

      {/* Output types breakdown cards matching user screenshot categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {outputTypeBreakdown.map((item, index) => {
          const colors = [
            'from-purple-500 to-indigo-600',
            'from-blue-500 to-cyan-600',
            'from-amber-500 to-orange-600',
            'from-rose-500 to-red-600',
            'from-slate-500 to-slate-700',
          ];
          const colorClass = colors[index % colors.length];

          return (
            <div key={item.categoryName} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate" title={item.categoryName}>
                  {item.categoryName}
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {item.count} <span className="text-xs font-normal text-slate-500">itens</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Valor total: <span className="font-bold text-slate-800">{item.totalValue.toLocaleString()}</span>
                </p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}`} />
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Evolução Diária de Devoluções</h3>
          <p className="text-xs text-slate-500 mb-6">Entradas vs Saídas com tendência</p>

          <div className="h-72 w-full">
            {returnTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Nenhum dado de devolução no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={returnTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="entries" name="Entradas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outputs" name="Saídas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="balance" name="Tendência" stroke="#f59e0b" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Volume por Tipo de Endereçamento</h3>
          <p className="text-xs text-slate-500 mb-6">Distribuição quantitativa de saídas por destino</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outputTypeBreakdown} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="categoryName" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Quantidade" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Registros Detalhados ({returnRecords.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="px-4 py-3">Data Recebimento</th>
                <th className="px-4 py-3">Data Saída</th>
                <th className="px-4 py-3">Endereçamento / Destino</th>
                <th className="px-4 py-3">Descrição / Item</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {returnRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                returnRecords.slice(0, 15).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-violet-700">{r.receiveDateStr || '—'}</td>
                    <td className="px-4 py-3 font-medium text-emerald-700">{r.outputDateStr || '—'}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{r.addressing || 'Geral'}</td>
                    <td className="px-4 py-3">{r.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
