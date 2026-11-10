import React, { useState } from 'react';
import { EmailConfig, ProcessedRecord } from '../types';
import { computeEmailReportSummary } from '../utils/dataProcessor';
import { Mail, Clock, Send, CheckCircle2, Settings, Users, Bell, AlertTriangle, Trophy } from 'lucide-react';

interface EmailConfigTabProps {
  emailConfig: EmailConfig;
  onUpdateEmailConfig: (config: EmailConfig) => void;
  records: ProcessedRecord[];
}

export const EmailConfigTab: React.FC<EmailConfigTabProps> = ({ emailConfig, onUpdateEmailConfig, records }) => {
  const [config, setConfig] = useState<EmailConfig>(emailConfig);
  const [newTime, setNewTime] = useState('08:00');
  const [testSent, setTestSent] = useState(false);

  const reportSummary = computeEmailReportSummary(records);

  const handleAddTime = () => {
    if (!config.scheduleTimes.includes(newTime)) {
      const updated = { ...config, scheduleTimes: [...config.scheduleTimes, newTime].sort() };
      setConfig(updated);
      onUpdateEmailConfig(updated);
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    const updated = {
      ...config,
      scheduleTimes: config.scheduleTimes.filter(t => t !== timeToRemove),
    };
    setConfig(updated);
    onUpdateEmailConfig(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmailConfig(config);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, reportSummary }),
      });
      const data = await res.json();
      if (data.success) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      } else {
        alert(data.error || 'Erro ao enviar e-mail.');
      }
    } catch (err: any) {
      console.error(err);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-2">
          <Mail className="w-6 h-6 text-indigo-300" />
          <h2 className="text-xl font-bold">Configuração de E-mail & Resumo Executivo</h2>
        </div>
        <p className="text-xs text-indigo-200 max-w-2xl">
          Configure destinatários e horários de disparo. O relatório enviado por e-mail inclui o resumo do mês corrente, dia anterior e Top 10 fornecedores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 text-indigo-600 mr-2" />
              Parâmetros de Envio e Agendamento
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Destinatários (e-mails separados por vírgula)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={config.recipients}
                    onChange={(e) => setConfig({ ...config, recipients: e.target.value })}
                    placeholder="gerencia@empresa.com, diretoria@empresa.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  value={config.subject}
                  onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Frequência de Envio
                  </label>
                  <select
                    value={config.frequency}
                    onChange={(e) => setConfig({ ...config, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Diário">Diário</option>
                    <option value="Semanal">Semanal</option>
                    <option value="A cada 12h">A cada 12h</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Adicionar Horário Agendado
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTime}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700 transition"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Scheduled Times tags */}
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1.5">Horários Programados Ativos:</span>
                <div className="flex flex-wrap gap-2">
                  {config.scheduleTimes.map(time => (
                    <span
                      key={time}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {time}
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(time)}
                        className="ml-2 text-indigo-400 hover:text-rose-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeActionPlan}
                    onChange={(e) => setConfig({ ...config, includeActionPlan: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-medium">Incluir Plano de Ação e notas manuais no relatório</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeCharts}
                    onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-medium">Incluir sumário gráfico de indicadores e alertas críticos</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.active}
                    onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-900">Ativar Disparos Automáticos</span>
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition text-xs"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Salvar & Testar Envio
                </button>
              </div>
            </form>

            {testSent && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Configuração salva com sucesso! Simulação de envio disparada para os destinatários configurados.</span>
              </div>
            )}
          </div>
        </div>

        {/* Email Preview Matching User Screenshot */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
              <Bell className="w-4 h-4 mr-1.5 text-indigo-600" />
              Preview do E-mail (Mês Corrente & Dia Anterior)
            </h4>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-rose-700 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Status do momento: <span className="underline">Em risco</span> — Indicador atual: {reportSummary.currentIndicatorPercent}% — Meta: {reportSummary.targetPercent}%
                </span>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-800">📅 Devolvidos no mês:</span>
                  <span className="font-mono font-medium">{reportSummary.monthReturnedOI} O.I | R$ {reportSummary.monthReturnedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-800">📌 Devolvidos no dia:</span>
                  <span className="font-mono font-medium">{reportSummary.dayReturnedOI} O.I | R$ {reportSummary.dayReturnedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-800">🔄 A negociar + Em negociação:</span>
                  <span className="font-mono font-medium">{reportSummary.negotiatingOI} O.I | R$ {reportSummary.negotiatingValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-800">🛡️ Garantias (A negociar / Em negociação):</span>
                  <span className="font-mono font-medium">{reportSummary.garantiasOI} O.I | R$ {reportSummary.garantiasValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="font-semibold text-slate-800">✅ Aprovado + Emitir:</span>
                  <span className="font-mono font-medium">{reportSummary.approvedOI} O.I | R$ {reportSummary.approvedValue.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900 flex items-center mb-2">
                  <Trophy className="w-4 h-4 text-amber-500 mr-1.5" />
                  Top 10 fornecedores - Negociáveis:
                </span>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="px-2.5 py-1.5">Fornecedor</th>
                        <th className="px-2.5 py-1.5 text-right">O.I</th>
                        <th className="px-2.5 py-1.5 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {reportSummary.topSuppliers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-2.5 py-3 text-center text-slate-400 font-sans">
                            Nenhum fornecedor registrado.
                          </td>
                        </tr>
                      ) : (
                        reportSummary.topSuppliers.map((sup, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-2.5 py-1.5 font-sans font-medium text-slate-800 truncate max-w-[140px]" title={sup.name}>
                              {sup.name}
                            </td>
                            <td className="px-2.5 py-1.5 text-right">{sup.orderItems}</td>
                            <td className="px-2.5 py-1.5 text-right font-bold">R$ {sup.value.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-400 text-center">
            Enviado automaticamente por: Equipe Estoque Mecanizou — appestoque@mecanizou.com
          </div>
        </div>
      </div>
    </div>
  );
};
