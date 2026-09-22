import React, { useState, useMemo } from 'react';
import { CheckCircle2, RotateCcw, SearchX, Loader2, AlertCircle, Plus, Calendar, X } from 'lucide-react';
import { Task, StatusFilter, PriorityFilter } from '../types';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { formatDueDate } from '../utils/date';
import { filterTasks } from '../utils/taskFilters';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  readError?: string | null;
  updatingTaskId?: string | null;
  selectedDate: string;
  onClearDateFilter: () => void;
  onOpenCreateModal?: () => void;
  onRetry?: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onBreakdown?: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading = false,
  readError = null,
  updatingTaskId = null,
  selectedDate,
  onClearDateFilter,
  onOpenCreateModal,
  onRetry,
  onToggleComplete,
  onEdit,
  onDelete,
  onBreakdown,
  onToggleSubtask,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  // Extrai categorias dinâmicas das tarefas existentes
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.categoria && t.categoria.trim()) {
        set.add(t.categoria.trim());
      }
    });
    return Array.from(set);
  }, [tasks]);

  const handleResetFilters = () => {
    setStatusFilter('todas');
    setPriorityFilter('todas');
    setSelectedCategory('todas');
    onClearDateFilter();
  };

  const hasActiveFilters =
    statusFilter !== 'todas' ||
    priorityFilter !== 'todas' ||
    selectedCategory !== 'todas' ||
    selectedDate !== 'all';

  // Aplicação dos filtros no frontend com regra de negócio:
  // - Filtro de status, prioridade e categoria operam normalmente
  // - Filtro de data:
  //   * Tarefas sem data SEMPRE aparecem
  //   * Tarefas atrasadas SEMPRE aparecem
  //   * Tarefas agendadas para o dia selecionado aparecem
  //   * Tarefas de outros dias futuros são ocultadas
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, {
      statusFilter,
      priorityFilter,
      selectedCategory,
      selectedDate,
    });
  }, [tasks, statusFilter, priorityFilter, selectedCategory, selectedDate]);

  const totalTasks = tasks.length;

  return (
    <div id="task-list-section" className="w-full space-y-4">
      {/* Alerta de erro na leitura do Firestore */}
      {readError && (
        <div
          id="firestore-read-error"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-down"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{readError}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#132032] border border-rose-200 text-xs font-bold text-rose-600 cursor-pointer hover:bg-rose-50"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Barra de Filtros e Categorias */}
      {!isLoading && totalTasks > 0 && (
        <TaskFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          availableCategories={availableCategories}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Indicador Ativo de Filtro por Data */}
      {selectedDate !== 'all' && (
        <div className="flex items-center justify-between gap-2 text-xs bg-[#e0f7f8] dark:bg-[#163348] text-[#0284c7] dark:text-[#38bdf8] px-3.5 py-2.5 rounded-2xl border border-[#b2ebf2] dark:border-[#1e4663] animate-slide-down">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Dia filtrado:{' '}
              <strong className="font-bold text-slate-800 dark:text-white">
                {formatDueDate(selectedDate)}
              </strong>
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              • Tarefas sem data e atrasadas permanecem visíveis
            </span>
          </div>

          <button
            type="button"
            onClick={onClearDateFilter}
            title="Remover filtro de data"
            className="inline-flex items-center gap-1 font-bold text-xs text-[#0284c7] dark:text-[#38bdf8] hover:underline cursor-pointer flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Ver todas</span>
          </button>
        </div>
      )}

      {/* Título da Lista "Daily Watch" / Tarefas Diárias */}
      <div className="flex items-center justify-between px-1 pt-2">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
            Tarefas do Dia
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-[#0284c7]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Sincronizando com Firestore...
              </span>
            ) : (
              <>
                {filteredTasks.length}{' '}
                {filteredTasks.length === 1 ? 'tarefa listada' : 'tarefas listadas'}
                {hasActiveFilters && ` (de ${totalTasks} totais)`}
              </>
            )}
          </p>
        </div>

        {onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white gradient-cyan-sky shadow-md shadow-cyan-400/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova</span>
          </button>
        )}
      </div>

      {/* Estado de Carregamento */}
      {isLoading ? (
        <div
          id="loading-task-state"
          className="bg-white dark:bg-[#132032] rounded-[28px] p-10 text-center flex flex-col items-center justify-center border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow"
        >
          <div className="w-12 h-12 rounded-full gradient-cyan-sky text-white flex items-center justify-center mb-3 shadow-md shadow-cyan-400/30">
            <Loader2 className="w-6 h-6 animate-spin stroke-[2.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">
            Carregando tarefas...
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Buscando dados no Cloud Firestore
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Estado Vazio */
        <div
          id="empty-task-state"
          className="bg-white dark:bg-[#132032] rounded-[30px] p-8 sm:p-12 text-center flex flex-col items-center justify-center border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow"
        >
          <div className="w-16 h-16 rounded-3xl bg-[#e0f7f8] dark:bg-[#163348] text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center mb-3">
            {totalTasks === 0 ? (
              <CheckCircle2 className="w-8 h-8 opacity-80" />
            ) : (
              <SearchX className="w-8 h-8 opacity-80" />
            )}
          </div>
          <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">
            {totalTasks === 0
              ? 'Nenhuma tarefa cadastrada'
              : 'Nenhuma tarefa encontrada'}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
            {totalTasks === 0
              ? 'Comece criando sua primeira atividade no formulário para organizar seu dia com clareza.'
              : selectedDate !== 'all'
              ? `Nenhuma tarefa agendada para ${formatDueDate(selectedDate)} e não há tarefas pendentes sem data ou atrasadas com os filtros atuais.`
              : 'Nenhuma atividade corresponde aos filtros selecionados. Tente limpar os filtros para ver todas.'}
          </p>

          {hasActiveFilters && (
            <button
              id="btn-empty-reset-filters"
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-cyan-sky shadow-md shadow-cyan-400/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar filtros</span>
            </button>
          )}
        </div>
      ) : (
        /* Grid de Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isUpdating={updatingTaskId === task.id}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onBreakdown={onBreakdown}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
