import React, { useState } from 'react';
import { ActionPlanItem } from '../types';
import { ClipboardList, Plus, Trash2, CheckCircle2, Clock, AlertCircle, Edit3 } from 'lucide-react';

interface ActionPlanTabProps {
  actionPlans: ActionPlanItem[];
  onUpdateActionPlans: (items: ActionPlanItem[]) => void;
}

export const ActionPlanTab: React.FC<ActionPlanTabProps> = ({ actionPlans, onUpdateActionPlans }) => {
  const [items, setItems] = useState<ActionPlanItem[]>(actionPlans);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<ActionPlanItem['priority']>('Média');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: ActionPlanItem = {
      id: `ap-${Date.now()}`,
      title,
      description,
      responsible: responsible || 'Não atribuído',
      deadline: deadline || new Date().toISOString().split('T')[0],
      status: 'Pendente',
      priority,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    onUpdateActionPlans(updated);

    // Reset form
    setTitle('');
    setDescription('');
    setResponsible('');
    setDeadline('');
    setPriority('Média');
    setShowModal(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    onUpdateActionPlans(updated);
  };

  const handleToggleStatus = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const nextStatus: ActionPlanItem['status'] =
          item.status === 'Pendente' ? 'Em Andamento' : item.status === 'Em Andamento' ? 'Concluído' : 'Pendente';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    setItems(updated);
    onUpdateActionPlans(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <ClipboardList className="w-6 h-6 text-emerald-300" />
            <h2 className="text-xl font-bold">Plano de Ação & Informações Manuais</h2>
          </div>
          <p className="text-xs text-emerald-100 max-w-2xl">
            Insira e gerencie informações manuais, notas de reuniões operacionais, gargalos identificados e ações corretivas para orientar a tomada de decisão.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-emerald-900 bg-white hover:bg-emerald-50 transition shadow-sm text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Ação / Nota
        </button>
      </div>

      {/* Action Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base mb-1">Nenhum Plano de Ação Cadastrado</h4>
            <p className="text-xs text-slate-500 mb-4">Clique em "Nova Ação / Nota" para adicionar orientações manuais ao dashboard.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition"
            >
              Adicionar Primeira Ação
            </button>
          </div>
        ) : (
          items.map(item => {
            let priorityBadge = 'bg-slate-100 text-slate-800 border-slate-200';
            if (item.priority === 'Alta') priorityBadge = 'bg-amber-50 text-amber-800 border-amber-200';
            if (item.priority === 'Crítica') priorityBadge = 'bg-rose-50 text-rose-800 border-rose-200';

            let statusBadge = 'bg-slate-100 text-slate-700';
            if (item.status === 'Em Andamento') statusBadge = 'bg-blue-50 text-blue-700';
            if (item.status === 'Concluído') statusBadge = 'bg-emerald-50 text-emerald-700';

            return (
              <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityBadge}`}>
                      {item.priority}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition ${statusBadge}`}
                      title="Clique para alternar status"
                    >
                      {item.status}
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 mb-4">{item.description || 'Sem descrição detalhada.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700">Resp:</span> {item.responsible} <br />
                    <span className="font-semibold text-slate-700">Prazo:</span> {item.deadline}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for adding action plan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <Edit3 className="w-5 h-5 text-emerald-600 mr-2" />
              Adicionar Nova Ação ou Nota Operacional
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Título da Ação
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Auditar itens devolvidos pelo fornecedor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Descrição / Detalhes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o plano de ação..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Nome do responsável"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Prazo Limite
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                  Salvar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
