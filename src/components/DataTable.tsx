import React, { useState } from 'react';
import { ProcessedRecord } from '../types';
import { Search, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface DataTableProps {
  records: ProcessedRecord[];
  columns: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ records, columns }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const filtered = records.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (r.description.toLowerCase().includes(term)) return true;
    if (r.receiveDateStr.includes(term)) return true;
    if (r.outputDateStr.includes(term)) return true;
    // Check original row values
    return Object.values(r.originalRow).some(val =>
      String(val || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = filtered.slice(startIndex, startIndex + rowsPerPage);

  // Pick up to 5 key columns to display neatly
  const displayCols = columns.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 mr-2" />
            Detalhamento dos Registros da Planilha
          </h3>
          <p className="text-xs text-slate-500">
            Visualização de dados filtrados em tempo real ({filtered.length} itens)
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar nos registros..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="px-4 py-3">Data Recebimento</th>
              <th className="px-4 py-3">Data Saída</th>
              {displayCols.map((col, idx) => (
                <th key={idx} className="px-4 py-3 truncate max-w-[150px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={displayCols.length + 2} className="px-6 py-8 text-center text-slate-400">
                  Nenhum registro encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-medium text-indigo-700">
                    {row.receiveDateStr || '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-700">
                    {row.outputDateStr || '—'}
                  </td>
                  {displayCols.map((col, idx) => (
                    <td key={idx} className="px-4 py-3 truncate max-w-[180px]" title={String(row.originalRow[col] || '')}>
                      {String(row.originalRow[col] || '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="text-xs text-slate-500">
          Mostrando <span className="font-semibold">{startIndex + 1}</span> a{' '}
          <span className="font-semibold">{Math.min(startIndex + rowsPerPage, filtered.length)}</span> de{' '}
          <span className="font-semibold">{filtered.length}</span> registros
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-700 px-2">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
