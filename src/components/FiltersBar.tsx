import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Filter, RotateCcw, Check, ChevronDown } from 'lucide-react';

interface FiltersBarProps {
  dateRangeType: 'all' | '30days' | '60days' | '90days' | '6months' | 'year' | 'custom';
  onChangeDateRangeType: (type: 'all' | '30days' | '60days' | '90days' | '6months' | 'year' | 'custom') => void;
  selectedYears: string[];
  onChangeYears: (years: string[]) => void;
  selectedMonths: string[];
  onChangeMonths: (months: string[]) => void;
  availableYears: string[];
  customStart: string;
  onChangeCustomStart: (val: string) => void;
  customEnd: string;
  onChangeCustomEnd: (val: string) => void;
  onResetFilters: () => void;
  totalRecords: number;
  filteredRecords: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  dateRangeType,
  onChangeDateRangeType,
  selectedYears,
  onChangeYears,
  selectedMonths,
  onChangeMonths,
  availableYears,
  customStart,
  onChangeCustomStart,
  customEnd,
  onChangeCustomEnd,
  onResetFilters,
  totalRecords,
  filteredRecords,
}) => {
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const monthsList = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMonth = (val: string) => {
    if (val === 'all') {
      onChangeMonths(['all']);
      return;
    }
    let updated: string[];
    if (selectedMonths.includes('all')) {
      updated = [val];
    } else if (selectedMonths.includes(val)) {
      updated = selectedMonths.filter(m => m !== val);
      if (updated.length === 0) updated = ['all'];
    } else {
      updated = [...selectedMonths, val];
    }
    onChangeMonths(updated);
  };

  const toggleYear = (yr: string) => {
    if (yr === 'all') {
      onChangeYears(['all']);
      return;
    }
    let updated: string[];
    if (selectedYears.includes('all')) {
      updated = [yr];
    } else if (selectedYears.includes(yr)) {
      updated = selectedYears.filter(y => y !== yr);
      if (updated.length === 0) updated = ['all'];
    } else {
      updated = [...selectedYears, yr];
    }
    onChangeYears(updated);
  };

  const getMonthButtonLabel = () => {
    if (selectedMonths.includes('all') || selectedMonths.length === 0) {
      return 'Todos os Meses';
    }
    if (selectedMonths.length === 1) {
      const found = monthsList.find(m => m.value === selectedMonths[0]);
      return found ? found.label : '1 Mês Selecionado';
    }
    return `${selectedMonths.length} Meses Selecionados`;
  };

  const getYearButtonLabel = () => {
    if (selectedYears.includes('all') || selectedYears.length === 0) {
      return 'Todos os Anos';
    }
    if (selectedYears.length === 1) {
      return `Ano ${selectedYears[0]}`;
    }
    return `${selectedYears.length} Anos Selecionados`;
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-slate-700 font-medium text-sm mr-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filtros Rápidos:</span>
          </div>

          <button
            onClick={() => onChangeDateRangeType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tudo
          </button>

          <button
            onClick={() => onChangeDateRangeType('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === '30days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            30 Dias
          </button>

          <button
            onClick={() => onChangeDateRangeType('60days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === '60days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            60 Dias
          </button>

          <button
            onClick={() => onChangeDateRangeType('90days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === '90days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            90 Dias
          </button>

          <button
            onClick={() => onChangeDateRangeType('6months')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === '6months'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Últimos 6 Meses
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Multi-select Year dropdown */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              type="button"
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 px-3 py-1.5 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-slate-100 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{getYearButtonLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isYearDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 p-2 space-y-1">
                <div
                  onClick={() => toggleYear('all')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition"
                >
                  <span>Todos os Anos</span>
                  {(selectedYears.includes('all') || selectedYears.length === 0) && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="h-px bg-slate-100 my-1" />
                {availableYears.map(yr => {
                  const isSelected = selectedYears.includes(yr);
                  return (
                    <div
                      key={yr}
                      onClick={() => toggleYear(yr)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition"
                    >
                      <span>Ano {yr}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Multi-select Month dropdown */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              type="button"
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 px-3 py-1.5 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-slate-100 transition"
            >
              <span>{getMonthButtonLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 p-2 space-y-1">
                <div
                  onClick={() => toggleMonth('all')}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition"
                >
                  <span>Todos os Meses</span>
                  {(selectedMonths.includes('all') || selectedMonths.length === 0) && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="h-px bg-slate-100 my-1" />
                {monthsList.map(m => {
                  const isSelected = selectedMonths.includes(m.value);
                  return (
                    <div
                      key={m.value}
                      onClick={() => toggleMonth(m.value)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition"
                    >
                      <span>{m.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={onResetFilters}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            title="Limpar Filtros"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Limpar
          </button>

          <div className="text-xs text-slate-500 font-medium ml-2">
            Mostrando <span className="font-bold text-slate-800">{filteredRecords}</span> de {totalRecords} registros
          </div>
        </div>
      </div>
    </div>
  );
};
