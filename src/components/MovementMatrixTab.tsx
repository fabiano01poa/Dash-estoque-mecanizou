import React, { useState } from 'react';
import { ProcessedRecord } from '../types';
import { computeMatrixData } from '../utils/dataProcessor';
import { Calendar, Layers, ArrowUpRight, ArrowDownLeft, FileSpreadsheet } from 'lucide-react';

interface MovementMatrixTabProps {
  records: ProcessedRecord[];
}

export const MovementMatrixTab: React.FC<MovementMatrixTabProps> = ({ records }) => {
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [showComparison, setShowComparison] = useState<boolean>(true);

  const matrixColumns = computeMatrixData(records, viewMode);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Movimentações & Posição Consolidada</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Tabela de Posição Consolidada com Ativo Monetário, Quantidade de Peças, Order Items, Entradas, Saídas e Evolução. Escolha a visualização por <strong>Mês</strong> ou por <strong>Dia</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {viewMode === 'month' && matrixColumns.length > 1 && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                showComparison
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <span>{showComparison ? 'Ocultar Comparativo %' : 'Mostrar Comparativo %'}</span>
            </button>
          )}

          <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'month'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Por Mês
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'day'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Por Dia
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <th className="px-4 py-3 border-r border-slate-800 min-w-[280px] sticky left-0 z-20 bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Indicadores</th>
                {matrixColumns.map((col, index) => (
                  <React.Fragment key={col.periodKey}>
                    <th className="px-4 py-3 text-center border-r border-slate-800 whitespace-nowrap min-w-[110px]">
                      {col.label}
                    </th>
                    {showComparison && viewMode === 'month' && index > 0 && (
                      <th className="px-3 py-3 text-center border-r border-slate-800 whitespace-nowrap min-w-[80px] bg-indigo-950 text-indigo-300">
                        Δ % (Prev)
                      </th>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {/* SALDO EM ESTOQUE */}
              <tr className="bg-amber-100/70 font-bold text-amber-900 uppercase">
                <td colSpan={matrixColumns.length + 1} className="px-4 py-2 border-t border-b border-amber-200">
                  Saldo em estoque
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ativo monetário [Total]</td>
                {matrixColumns.map((col, index) => {
                  const prevCol = index > 0 ? matrixColumns[index - 1] : null;
                  const currVal = col.monetaryAsset;
                  const prevVal = prevCol ? prevCol.monetaryAsset : 0;
                  const pct = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;
                  return (
                    <React.Fragment key={col.periodKey}>
                      <td className="px-4 py-2 text-center border-r border-slate-200">
                        R$ {currVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      {showComparison && viewMode === 'month' && index > 0 && (
                        <td className={`px-3 py-2 text-center border-r border-slate-200 font-bold ${pct >= 0 ? 'text-emerald-700 bg-emerald-50/60' : 'text-rose-600 bg-rose-50/60'}`}>
                          {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Quantidade de peças [Total]</td>
                {matrixColumns.map((col, index) => {
                  const prevCol = index > 0 ? matrixColumns[index - 1] : null;
                  const currVal = col.pieceQty;
                  const prevVal = prevCol ? prevCol.pieceQty : 0;
                  const pct = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;
                  return (
                    <React.Fragment key={col.periodKey}>
                      <td className="px-4 py-2 text-center border-r border-slate-200">
                        {currVal.toLocaleString()}
                      </td>
                      {showComparison && viewMode === 'month' && index > 0 && (
                        <td className={`px-3 py-2 text-center border-r border-slate-200 font-bold ${pct >= 0 ? 'text-emerald-700 bg-emerald-50/60' : 'text-rose-600 bg-rose-50/60'}`}>
                          {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Quantidade de Order Item [Total]</td>
                {matrixColumns.map((col, index) => {
                  const prevCol = index > 0 ? matrixColumns[index - 1] : null;
                  const currVal = col.orderItemQty;
                  const prevVal = prevCol ? prevCol.orderItemQty : 0;
                  const pct = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;
                  return (
                    <React.Fragment key={col.periodKey}>
                      <td className="px-4 py-2 text-center border-r border-slate-200">
                        {currVal.toLocaleString()}
                      </td>
                      {showComparison && viewMode === 'month' && index > 0 && (
                        <td className={`px-3 py-2 text-center border-r border-slate-200 font-bold ${pct >= 0 ? 'text-emerald-700 bg-emerald-50/60' : 'text-rose-600 bg-rose-50/60'}`}>
                          {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* ENTRADAS NO ESTOQUE */}
              <tr className="bg-amber-100/70 font-bold text-amber-900 uppercase">
                <td colSpan={matrixColumns.length * (showComparison && viewMode === 'month' ? 2 : 1) + 1} className="px-4 py-2 border-t border-b border-amber-200">
                  Entradas no estoque
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Peças Recebidas [R$]</td>
                {matrixColumns.map((col, index) => {
                  const prevCol = index > 0 ? matrixColumns[index - 1] : null;
                  const currVal = col.receivedValue;
                  const prevVal = prevCol ? prevCol.receivedValue : 0;
                  const pct = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;
                  return (
                    <React.Fragment key={col.periodKey}>
                      <td className="px-4 py-2 text-center border-r border-slate-200 text-emerald-700 font-semibold">
                        R$ {currVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      {showComparison && viewMode === 'month' && index > 0 && (
                        <td className={`px-3 py-2 text-center border-r border-slate-200 font-bold ${pct >= 0 ? 'text-emerald-700 bg-emerald-50/60' : 'text-rose-600 bg-rose-50/60'}`}>
                          {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Order Itens recebidos</td>
                {matrixColumns.map((col, index) => {
                  const prevCol = index > 0 ? matrixColumns[index - 1] : null;
                  const currVal = col.receivedCount;
                  const prevVal = prevCol ? prevCol.receivedCount : 0;
                  const pct = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;
                  return (
                    <React.Fragment key={col.periodKey}>
                      <td className="px-4 py-2 text-center border-r border-slate-200 font-semibold">
                        {currVal.toLocaleString()}
                      </td>
                      {showComparison && viewMode === 'month' && index > 0 && (
                        <td className={`px-3 py-2 text-center border-r border-slate-200 font-bold ${pct >= 0 ? 'text-emerald-700 bg-emerald-50/60' : 'text-rose-600 bg-rose-50/60'}`}>
                          {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* SAÍDAS DO ESTOQUE */}
              <tr className="bg-amber-100/70 font-bold text-amber-900 uppercase">
                <td colSpan={matrixColumns.length + 1} className="px-4 py-2 border-t border-b border-amber-200">
                  Saídas do estoque
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Saída Devolução Custo [R$]</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200 text-violet-700">
                    R$ {col.returnCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Order Itens devolvidos</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200">
                    {col.returnCount}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Saída Revenda Custo [R$]</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200">
                    R$ {col.revendaCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Order Itens revendidos</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200">
                    {col.revendaCount}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">% revendido</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200 font-semibold text-indigo-700">
                    {col.revendaPercent.toFixed(2)}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Saída Sucata Custo [R$]</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200">
                    R$ {col.sucataCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Order Itens Sucata</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200">
                    {col.sucataCount}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Perda inventário Custo [R$]</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200 text-rose-600">
                    -R$ {col.perdaCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Order Itens Perdido</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200 text-rose-600">
                    {col.perdaCount}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50 font-bold bg-slate-50">
                <td className="px-4 py-2 font-sans text-slate-900 border-r border-slate-200 sticky left-0 z-10 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Saídas totais Custo [R$]</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200">
                    R$ {col.totalOutputCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50 font-bold bg-slate-50">
                <td className="px-4 py-2 font-sans text-slate-900 border-r border-slate-200 sticky left-0 z-10 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Order Itens saídas</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200">
                    {col.totalOutputCount}
                  </td>
                ))}
              </tr>

              {/* EVOLUÇÃO DOS SALDOS */}
              <tr className="bg-amber-100/70 font-bold text-amber-900 uppercase">
                <td colSpan={matrixColumns.length + 1} className="px-4 py-2 border-t border-b border-amber-200">
                  Evolução dos saldos em estoque
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Evolução do ativo monetário</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200 text-emerald-700 font-semibold">
                    +{col.growthMonetary}%
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Evolução do ativo quantidade</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200 text-emerald-700 font-semibold">
                    +{col.growthQty}%
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2 font-sans font-medium text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Evolução do ativo Order Item</td>
                {matrixColumns.map(col => (
                  <td key={col.periodKey} className="px-4 py-2 text-center border-r border-slate-200 text-emerald-700 font-semibold">
                    +{col.growthOrderItem}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
