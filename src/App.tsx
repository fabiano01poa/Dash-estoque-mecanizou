import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FiltersBar } from './components/FiltersBar';
import { KpiCards } from './components/KpiCards';
import { AlertsPanel } from './components/AlertsPanel';
import { ChartsSection } from './components/ChartsSection';
import { DataTable } from './components/DataTable';
import { ReturnsTab } from './components/ReturnsTab';
import { MovementMatrixTab } from './components/MovementMatrixTab';
import { StockSummaryTab } from './components/StockSummaryTab';
import { EmailConfigTab } from './components/EmailConfigTab';
import { ActionPlanTab } from './components/ActionPlanTab';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { processSheetData, filterRecords, computeMetrics, computeReturnSummary, computeEmailReportSummary } from './utils/dataProcessor';
import { ProcessedRecord, MetricSummary, ReturnSummary, EmailConfig, ActionPlanItem } from './types';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import { BarChart2, RefreshCw, Calendar, Mail, ClipboardList, Layers } from 'lucide-react';

const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1daGWs2SPXQsN9YLJBggtyX0Wdqpv2kgBcB4mOUrhe7M/edit?gid=1870385864#gid=1870385864";

export default function App() {
  const [sheetUrl, setSheetUrl] = useState<string>(DEFAULT_SHEET_URL);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawCsv, setRawCsv] = useState<string>('');
  const [records, setRecords] = useState<ProcessedRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Navigation tabs: 'overview' | 'returns' | 'daily' | 'summary' | 'email' | 'actionplan'
  const [activeTab, setActiveTab] = useState<'overview' | 'returns' | 'daily' | 'summary' | 'email' | 'actionplan'>('overview');

  // Filter states
  const [dateRangeType, setDateRangeType] = useState<'all' | '30days' | '60days' | '90days' | '6months' | 'year' | 'custom'>('all');
  const [selectedYears, setSelectedYears] = useState<string[]>(['all']);
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['all']);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Email Config state
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    recipients: 'gestao@empresa.com, operacao@empresa.com',
    subject: 'Relatório Gerencial Automático - Indicadores de Estoque',
    scheduleTimes: ['08:00', '13:00', '18:00'],
    frequency: 'Diário',
    includeActionPlan: true,
    includeCharts: true,
    active: true,
  });

  // Action Plans state
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([
    {
      id: 'ap-1',
      title: 'Auditoria de Devoluções de Fornecedores',
      description: 'Verificar divergências nos itens devolvidos nos últimos 7 dias.',
      responsible: 'Carlos Silva',
      deadline: '2026-09-25',
      status: 'Em Andamento',
      priority: 'Alta',
    },
    {
      id: 'ap-2',
      title: 'Redução de Backlog Operacional',
      description: 'Acelerar o processamento de saídas para zerar pendências pendentes.',
      responsible: 'Ana Souza',
      deadline: '2026-09-30',
      status: 'Pendente',
      priority: 'Crítica',
    },
  ]);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const fetchSheetData = async (urlToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fetch-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar dados da planilha.');
      }
      setRawCsv(data.csvText);
      const processed = processSheetData(data.csvText);
      setRecords(processed.records);
      setColumns(processed.columns);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || 'Falha ao conectar com o Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData(sheetUrl);
  }, [sheetUrl]);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    records.forEach(r => {
      if (r.receiveDate) yearsSet.add(r.receiveDate.getFullYear().toString());
      if (r.outputDate) yearsSet.add(r.outputDate.getFullYear().toString());
    });
    return Array.from(yearsSet).sort().reverse();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return filterRecords(records, {
      dateRangeType,
      years: selectedYears,
      months: selectedMonths,
      customStart,
      customEnd,
    });
  }, [records, dateRangeType, selectedYears, selectedMonths, customStart, customEnd]);

  const metrics: MetricSummary = useMemo(() => {
    const isDaily = dateRangeType === '30days';
    return computeMetrics(filteredRecords, !isDaily);
  }, [filteredRecords, dateRangeType]);

  const returnSummary: ReturnSummary = useMemo(() => {
    return computeReturnSummary(filteredRecords);
  }, [filteredRecords]);

  const handleResetFilters = () => {
    setDateRangeType('all');
    setSelectedYears(['all']);
    setSelectedMonths(['all']);
    setCustomStart('');
    setCustomEnd('');
  };

  const handleExportCsv = () => {
    const dataToExport = filteredRecords.map(r => r.originalRow);
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_gerencial_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const summary = computeEmailReportSummary(records);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório Gerencial - Indicadores e Resumo Executivo", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Data do Relatório: ${new Date().toLocaleDateString()} | Total Registros: ${records.length}`, 14, 24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Resumo Executivo (Mês Corrente & Dia / Status):", 14, 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`- Devolvidos no Mês: ${summary.monthReturnedOI} O.I | R$ ${summary.monthReturnedValue.toLocaleString()}`, 18, 41);
    doc.text(`- Devolvidos no Dia: ${summary.dayReturnedOI} O.I | R$ ${summary.dayReturnedValue.toLocaleString()}`, 18, 47);
    doc.text(`- A Negociar + Em Negociação (Mecanizou / Expresso): ${summary.negotiatingOI} O.I | R$ ${summary.negotiatingValue.toLocaleString()}`, 18, 53);
    doc.text(`- Garantias (A negociar / Em negociação): ${summary.garantiasOI} O.I | R$ ${summary.garantiasValue.toLocaleString()}`, 18, 59);
    doc.text(`- Aprovado + Emitir (Geral): ${summary.approvedOI} O.I | R$ ${summary.approvedValue.toLocaleString()}`, 18, 65);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Top Fornecedor + Filial (Mecanizou / Expresso - A Negociar):", 14, 75);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    let y = 82;
    if (summary.topSuppliers.length === 0) {
      doc.text("Nenhum fornecedor encontrado para este filtro.", 18, y);
      y += 6;
    } else {
      summary.topSuppliers.slice(0, 8).forEach((sup, idx) => {
        doc.text(`${idx + 1}. ${sup.name} — O.I: ${sup.orderItems} | R$ ${sup.value.toLocaleString()}`, 18, y);
        y += 6;
      });
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Planos de Ação Ativos:", 14, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y += 13;
    actionPlans.forEach((ap, idx) => {
      doc.text(`- [${ap.status}] ${ap.title} (Resp: ${ap.responsible})`, 18, y + (idx * 6));
    });

    doc.save(`relatorio_gerencial_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Header
        sheetUrl={sheetUrl}
        onUpdateSheetUrl={setSheetUrl}
        onReloadData={() => fetchSheetData(sheetUrl)}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        loading={loading}
        alertCount={metrics.alerts.length}
      />

      <FiltersBar
        dateRangeType={dateRangeType}
        onChangeDateRangeType={setDateRangeType}
        selectedYears={selectedYears}
        onChangeYears={setSelectedYears}
        selectedMonths={selectedMonths}
        onChangeMonths={setSelectedMonths}
        availableYears={availableYears}
        customStart={customStart}
        onChangeCustomStart={setCustomStart}
        customEnd={customEnd}
        onChangeCustomEnd={setCustomEnd}
        onResetFilters={handleResetFilters}
        totalRecords={records.length}
        filteredRecords={filteredRecords.length}
      />

      {/* Tabs Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex space-x-6 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-3 border-b-2 font-semibold text-sm flex items-center space-x-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Visão Geral & Indicadores</span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`py-3.5 px-3 border-b-2 font-semibold text-sm flex items-center space-x-2 transition ${
              activeTab === 'returns'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Devoluções & Endereçamento</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`py-3.5 px-3 border-b-2 font-semibold text-sm flex items-center space-x-2 transition ${
              activeTab === 'daily'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Movimentações</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3.5 px-3 border-b-2 font-semibold text-sm flex items-center space-x-2 transition ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Resumo Geral Estoque</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`py-3.5 px-3 border-b-2 font-semibold text-sm flex items-center space-x-2 transition ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Envio de E-mail & Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('actionplan')}
            className={`py-3.5 px-3 border-b-2 font-semibold text-sm flex items-center space-x-2 transition ${
              activeTab === 'actionplan'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Plano de Ação (Manual)</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-sm flex items-center justify-between">
            <div>
              <strong>Atenção:</strong> {error}
            </div>
            <button
              onClick={() => fetchSheetData(sheetUrl)}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-base font-bold text-slate-800">Lendo Planilha e Calculando Indicadores...</h3>
            <p className="text-xs text-slate-500 mt-1">Carregando dados de recebimento e saída em tempo real.</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                <AlertsPanel alerts={metrics.alerts} />
                <KpiCards metrics={metrics} />
                <ChartsSection metrics={metrics} />
                <DataTable records={filteredRecords} columns={columns} />
              </>
            )}

            {activeTab === 'returns' && (
              <ReturnsTab returnSummary={returnSummary} />
            )}

            {activeTab === 'daily' && (
              <MovementMatrixTab records={filteredRecords} />
            )}

            {activeTab === 'summary' && (
              <StockSummaryTab records={filteredRecords} allRecords={records} />
            )}

            {activeTab === 'email' && (
              <EmailConfigTab emailConfig={emailConfig} onUpdateEmailConfig={setEmailConfig} records={filteredRecords} />
            )}

            {activeTab === 'actionplan' && (
              <ActionPlanTab actionPlans={actionPlans} onUpdateActionPlans={setActionPlans} />
            )}
          </>
        )}
      </main>

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        metrics={metrics}
      />

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        Dashboard Gerencial Integrado • Tomada de Decisão em Tempo Real
      </footer>
    </div>
  );
}

