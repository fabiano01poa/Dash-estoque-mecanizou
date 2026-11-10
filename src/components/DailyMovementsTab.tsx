import React from 'react';
import { DailyMovement } from '../types';
import { Calendar, ArrowDownLeft, ArrowUpRight, TrendingUp, Layers } from 'lucide-react';

interface DailyMovementsTabProps {
  dailyMovements: DailyMovement[];
}

export const DailyMovementsTab: React.FC<DailyMovementsTabProps> = ({ dailyMovements }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <Calendar className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold">Movimentações do Dia (Evolução Diária e Saldo)</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl">
          Acompanhamento diário consolidado das entradas (recebimento) vs saídas (baixa), indicando o saldo diário exato (Ex: Entrou 100, Saiu 110, Saldo de -10).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Extrato Consolidado por Dia</h3>
            <p className="text-xs text-slate-500">Exibindo movimentações e saldo líquido diário</p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            {dailyMovements.length} Dias Registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="px-6 py-3.5">Dia / Data</th>
                <th className="px-6 py-3.5">Total Entradas (Recebido)</th>
                <th className="px-6 py-3.5">Total Saídas (Baixado)</th>
                <th className="px-6 py-3.5">Saldo do Dia</th>
                <th className="px-6 py-3.5 text-right">Qtd Itens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dailyMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Nenhum movimento diário encontrado.
                  </td>
                </tr>
              ) : (
                dailyMovements.map((dm) => {
                  const isNegative = dm.balanceCount < 0;
                  const isPositive = dm.balanceCount > 0;

                  return (
                    <tr key={dm.date} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        <span>{dm.date || 'Data Indefinida'}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">
                        +{dm.receivedCount} itens <span className="text-[10px] text-slate-400 font-normal">({dm.receivedValue.toLocaleString()})</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        -{dm.outputCount} itens <span className="text-[10px] text-slate-400 font-normal">({dm.outputValue.toLocaleString()})</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            isNegative
                              ? 'bg-rose-100 text-rose-800'
                              : isPositive
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {dm.balanceCount > 0 ? `+${dm.balanceCount}` : dm.balanceCount} saldo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {dm.details.length}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
