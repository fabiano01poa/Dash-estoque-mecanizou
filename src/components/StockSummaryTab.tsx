import React, { useMemo } from 'react';
import { ProcessedRecord } from '../types';
import { Layers, BarChart3, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line, LabelList } from 'recharts';

interface StockSummaryTabProps {
  records: ProcessedRecord[];
  allRecords: ProcessedRecord[];
}

export const StockSummaryTab: React.FC<StockSummaryTabProps> = ({ records, allRecords }) => {
  const sampleRow = records.length > 0 ? records[0].originalRow : (allRecords.length > 0 ? allRecords[0].originalRow : {});
  const columnKeys = Object.keys(sampleRow);
  const colAKey = columnKeys[0] || '';
  
  const qtyKey = columnKeys.find(k => {
    const lk = k.toLowerCase();
    return lk.includes('quant') || lk.includes('qtde') || lk.includes('estoque') || lk.includes('peças') || lk.includes('pecas');
  }) || '';

  const recoveredValueKey = columnKeys.find(k => {
    const lk = k.toLowerCase();
    return lk.includes('recuperado') || lk.includes('recuperada');
  }) || '';

  const isStockAssetRecord = (r: ProcessedRecord): boolean => {
    const row = r.originalRow;
    let locOrAddr = '';
    for (const [k, v] of Object.entries(row)) {
      const kl = k.toLowerCase();
      if (kl.includes('local') || kl.includes('enderec')) {
        locOrAddr += ' ' + String(v || '').toLowerCase().trim();
      }
    }
    if (r.locality) locOrAddr += ' ' + r.locality.toLowerCase().trim();
    if (r.addressing) locOrAddr += ' ' + r.addressing.toLowerCase().trim();

    if (locOrAddr.includes('descarte')) {
      return false;
    }

    const allowed = [
      'mecanizou',
      'mecanizou - garantia',
      'mecanizou - recebimento',
      'mecanizou - expresso',
      'mecanizou - bh'
    ];
    let found = false;
    for (const [k, v] of Object.entries(row)) {
      const kl = k.toLowerCase();
      if (kl.includes('local') || kl.includes('enderec')) {
        const valStr = String(v || '').toLowerCase().trim();
        if (allowed.some(a => valStr === a || valStr.includes(a))) {
          found = true;
          break;
        }
      }
    }
    if (!found && r.locality) {
      const loc = r.locality.toLowerCase().trim();
      if (allowed.some(a => loc === a || loc.includes(a))) {
        found = true;
      }
    }
    if (!found) {
      const addr = (r.addressing || '').toLowerCase();
      if (allowed.some(a => addr.includes(a))) {
        found = true;
      }
    }
    return found;
  };

  const filteredStockRecords = useMemo(() => {
    return records.filter(isStockAssetRecord);
  }, [records]);

  const allFilteredStockRecords = useMemo(() => {
    return allRecords.filter(isStockAssetRecord);
  }, [allRecords]);

  const computeStats = (dataset: ProcessedRecord[]) => {
    const monetaryAsset = dataset.reduce((acc, r) => acc + r.value, 0);
    const pieceQty = dataset.reduce((acc, r) => {
      if (qtyKey && r.originalRow[qtyKey] !== undefined) {
        const val = parseFloat(String(r.originalRow[qtyKey]).replace(/[R$\s]/g, '').replace(',', '.')) || 0;
        return acc + val;
      }
      return acc + 1;
    }, 0);
    const uniqueOIs = dataset.length;

    return { monetaryAsset, pieceQty, uniqueOIs, totalRecords: dataset.length };
  };

  const totalStats = useMemo(() => computeStats(filteredStockRecords), [filteredStockRecords, colAKey, qtyKey]);

  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const curMonthRecords = filteredStockRecords.filter(r => {
      const d = r.receiveDate; // Strictly Data_Recebimento
      if (!d) return false;
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });
    return computeStats(curMonthRecords);
  }, [filteredStockRecords, colAKey, qtyKey]);

  const last6MonthsData = useMemo(() => {
    const now = new Date();
    const monthsList: { key: string; label: string; year: number; month: number; endDate: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }); // e.g. 08/2026
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      monthsList.push({ key: `${year}-${month}`, label, year, month, endDate });
    }

    return monthsList.map(m => {
      // Cumulative storytelling for stock evolution
      const cumulativeRecords = allFilteredStockRecords.filter(r => {
        const d = r.receiveDate || r.outputDate;
        if (!d) return true;
        return d <= m.endDate;
      });

      const stats = computeStats(cumulativeRecords);

      const monthEntriesAll = allRecords.filter(r => {
        const d = r.receiveDate;
        if (!d) return false;
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      });

      const monthOutputsAll = allRecords.filter(r => {
        const d = r.outputDate;
        if (!d) return false;
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      });

      const enteredInMonthCount = monthEntriesAll.length;

      const returnedRecords = monthOutputsAll.filter(r => {
        const addr = (r.addressing || '').toLowerCase();
        const cat = (r.category || '').toLowerCase();
        return addr.includes('devolvida') || addr.includes('fornecedor') || cat.includes('devolvida') || cat.includes('fornecedor');
      });

      const returnedOIsCount = returnedRecords.length;

      const returnPercent = enteredInMonthCount > 0 ? Number(((returnedOIsCount / enteredInMonthCount) * 100).toFixed(1)) : 0;

      // Mecanic Resale for this specific month (exact month output stats for OIs count and monetary value)
      const mecanicResaleRecords = monthOutputsAll.filter(r => {
        const loc = String(r.locality || '').toLowerCase().trim();
        return loc === 'mecanica' || loc === 'mecânica';
      });
      const mecanicResaleValue = mecanicResaleRecords.reduce((acc, r) => {
        if (recoveredValueKey && r.originalRow[recoveredValueKey] !== undefined) {
          const val = parseFloat(String(r.originalRow[recoveredValueKey]).replace(/[R$\s]/g, '').replace(',', '.')) || 0;
          return acc + val;
        }
        return acc + r.value;
      }, 0);
      const mecanicResaleOIsCount = mecanicResaleRecords.length;

      return {
        label: m.label,
        monetaryAsset: stats.monetaryAsset,
        uniqueOIs: stats.uniqueOIs,
        returnPercent,
        enteredInMonthCount,
        returnedOIsCount,
        mecanicResaleValue,
        mecanicResaleOIsCount,
      };
    });
  }, [allFilteredStockRecords, allRecords, colAKey]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Resumo Geral do Estoque (Localidades Mecanizou)</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Visão consolidada restrita às localidades autorizadas (Mecanizou, Garantia, Descarte, Recebimento, Expresso, BH), com cálculo acumulado de ativos, peças e Order Items (OIs).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">ATIVO DO ESTOQUE (TOTAL FILTRADO)</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
              {totalStats.totalRecords} itens
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">ATIVO MONETÁRIO [TOTAL]</span>
              <div className="text-xl font-bold font-mono text-slate-900">
                R$ {totalStats.monetaryAsset.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">QTD PEÇAS [SOMA]</span>
              <div className="text-xl font-bold font-mono text-indigo-700">
                {totalStats.pieceQty.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">ORDER ITEMS [OIS]</span>
              <div className="text-xl font-bold font-mono text-emerald-700">
                {totalStats.uniqueOIs.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Coluna A únicos</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mês Atual Corrente</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase">Ativo Monetário (Mês)</span>
              <div className="text-lg font-bold font-mono text-emerald-900">
                R$ {currentMonthStats.monetaryAsset.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase">Qtd Peças (Mês)</span>
              <div className="text-lg font-bold font-mono text-emerald-900">
                {currentMonthStats.pieceQty.toLocaleString()}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase">Order Items (Mês)</span>
              <div className="text-lg font-bold font-mono text-emerald-900">
                {currentMonthStats.uniqueOIs.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600">OIs únicos no mês</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Evolução Acumulada do Estoque no Ano (Últimos 6 Meses)</h3>
          <p className="text-xs text-slate-500">Histórico progressivo somando as entradas até o estoque atual (Ativo Monetário R$ e OIs únicos).</p>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last6MonthsData} margin={{ top: 25, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#4f46e5" fontSize={11} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                formatter={(value: any, name: string) => {
                  if (name === 'Ativo Monetário Acumulado (R$)') return [`R$ ${Number(value).toLocaleString()}`, name];
                  return [Number(value).toLocaleString(), name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="monetaryAsset" name="Ativo Monetário Acumulado (R$)" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="monetaryAsset"
                  position="top"
                  formatter={(v: any) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
                  style={{ fontSize: '10px', fill: '#4f46e5', fontWeight: 'bold' }}
                />
              </Bar>
              <Bar yAxisId="right" dataKey="uniqueOIs" name="Order Items Acumulados (OIs)" fill="#059669" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="uniqueOIs"
                  position="top"
                  style={{ fontSize: '10px', fill: '#059669', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">% e OIs de Itens Devolvidos (Mês a Mês)</h3>
            <p className="text-xs text-slate-500">Número de OIs devolvidos e % de devolução em cada mês (não acumulado).</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6MonthsData} margin={{ top: 25, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#dc2626" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#ea580c" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(value: any, name: string) => {
                    if (name === '% Devolvido') return [`${value}%`, name];
                    return [`${value} OIs`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="returnPercent" name="% Devolvido" fill="#dc2626" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="returnPercent"
                    position="top"
                    formatter={(v: any) => `${v}%`}
                    style={{ fontSize: '10px', fill: '#dc2626', fontWeight: 'bold' }}
                  />
                </Bar>
                <Bar yAxisId="right" dataKey="returnedOIsCount" name="Qtd OIs Devolvidos" fill="#ea580c" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="returnedOIsCount"
                    position="top"
                    style={{ fontSize: '10px', fill: '#ea580c', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Saídas de Revenda Mecânicas (Mês a Mês)</h3>
            <p className="text-xs text-slate-500">Volume financeiro (R$) e OIs revendidos em cada mês individualmente (não acumulado).</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6MonthsData} margin={{ top: 25, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#7c3aed" fontSize={11} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#2563eb" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Valor Revenda (R$)') return [`R$ ${Number(value).toLocaleString()}`, name];
                    return [`${value} OIs`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="mecanicResaleValue" name="Valor Revenda (R$)" fill="#7c3aed" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="mecanicResaleValue"
                    position="top"
                    formatter={(v: any) => `R$ ${(Number(v) / 1000).toFixed(0)}k`}
                    style={{ fontSize: '10px', fill: '#7c3aed', fontWeight: 'bold' }}
                  />
                </Bar>
                <Bar yAxisId="right" dataKey="mecanicResaleOIsCount" name="Qtd OIs Revendidos" fill="#2563eb" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="mecanicResaleOIsCount"
                    position="top"
                    style={{ fontSize: '10px', fill: '#2563eb', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
