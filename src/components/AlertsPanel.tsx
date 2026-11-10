import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsPanelProps {
  alerts: AlertItem[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">Nenhum Alerta Crítico Detectado</h4>
            <p className="text-xs text-emerald-700">Todos os indicadores de desempenho estão dentro dos parâmetros operacionais normais.</p>
          </div>
        </div>
        <span className="text-xs font-medium bg-emerald-200/60 text-emerald-800 px-2.5 py-1 rounded-full">
          Sistema Estável
        </span>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center">
          <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
          Alertas Automáticos de Desempenho ({alerts.length})
        </h3>
        <span className="text-xs text-slate-500">Monitoramento em tempo real</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert) => {
          let bgClass = 'bg-amber-50 border-amber-200 text-amber-900';
          let icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          let badgeClass = 'bg-amber-200 text-amber-900';

          if (alert.type === 'critical') {
            bgClass = 'bg-rose-50 border-rose-200 text-rose-900';
            icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
            badgeClass = 'bg-rose-200 text-rose-900';
          } else if (alert.type === 'info') {
            bgClass = 'bg-blue-50 border-blue-200 text-blue-900';
            icon = <Info className="w-5 h-5 text-blue-600" />;
            badgeClass = 'bg-blue-200 text-blue-900';
          }

          return (
            <div key={alert.id} className={`p-4 rounded-xl border ${bgClass} flex items-start space-x-3 shadow-2xs`}>
              <div className="shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">{alert.title}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeClass}`}>
                    {alert.type}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">{alert.message}</p>
                <div className="mt-2 text-[11px] font-semibold opacity-75">
                  Indicador: {alert.metric} • {alert.timestamp}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
