import React from 'react';
import { Check, Clock, Calendar, Edit3, Trash2, Tag, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';
import { Task, Priority } from '../types';
import { formatTimestamp, formatDueDate, isOverdue } from '../utils/date';

interface TaskCardProps {
  task: Task;
  isUpdating?: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onBreakdown?: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const PRIORITY_BADGES: Record<
  Priority,
  { label: string; gradientClass: string; textClass: string; dotClass: string }
> = {
  alta: {
    label: 'Alta Prioridade',
    gradientClass: 'priority-alta-gradient shadow-xs shadow-orange-500/20',
    textClass: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/40',
    dotClass: 'bg-white',
  },
  media: {
    label: 'Média Prioridade',
    gradientClass: 'priority-media-gradient shadow-xs shadow-cyan-500/20',
    textClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40',
    dotClass: 'bg-white',
  },
  baixa: {
    label: 'Baixa Prioridade',
    gradientClass: 'priority-baixa-gradient shadow-xs shadow-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40',
    dotClass: 'bg-white',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isUpdating = false,
  onToggleComplete,
  onEdit,
  onDelete,
  onBreakdown,
  onToggleSubtask,
}) => {
  const isCompleted = task.status === 'concluida';
  const priority = PRIORITY_BADGES[task.prioridade] || PRIORITY_BADGES.baixa;
  const overdue = isOverdue(task.dataLimite, task.status);
  const hasSubtasks = Array.isArray(task.subtarefas) && task.subtarefas.length > 0;
  const completedSubtasksCount = hasSubtasks
    ? task.subtarefas!.filter((s) => s.concluida).length
    : 0;
  const totalSubtasksCount = hasSubtasks ? task.subtarefas!.length : 0;

  return (
    <article
      id={`task-card-${task.id}`}
      aria-label={`Tarefa: ${task.titulo}`}
      className={`group relative bg-white dark:bg-[#132032] rounded-[28px] p-5 sm:p-6 border modern-shadow transition-all duration-300 flex flex-col justify-between gap-4 ${
        isCompleted
          ? 'opacity-65 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d1624]'
          : overdue
          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
          : 'border-[#d8f0f3] dark:border-[#1e334a] hover:border-[#2ad0ca] hover:shadow-lg hover:-translate-y-0.5'
      } ${isUpdating ? 'pointer-events-none opacity-50' : ''}`}
    >
      {/* Topo do Card: Badge de Prioridade com Gradiente + Categoria + Atrasada + Ações */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Badge de Prioridade com Gradiente vibrante */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${priority.gradientClass}`}
            title={`Prioridade: ${priority.label}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dotClass}`} />
            <span>{priority.label}</span>
          </span>

          {/* Badge de Categoria */}
          {task.categoria && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-[#f0fafb] dark:bg-[#0c1826] text-slate-600 dark:text-slate-300 border border-[#d8f0f3] dark:border-[#1e334a]">
              <Tag className="w-2.5 h-2.5 text-[#0284c7] dark:text-[#38bdf8]" />
              <span className="truncate max-w-[120px]">{task.categoria}</span>
            </span>
          )}

          {/* Badge de Atraso */}
          {overdue && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Atrasada</span>
            </span>
          )}
        </div>

        {/* Botões de Ação (Quebrar com IA, Editar e Excluir) */}
        <div className="flex items-center gap-1">
          {onBreakdown && !isCompleted && (
            <button
              id={`btn-breakdown-task-${task.id}`}
              type="button"
              disabled={isUpdating}
              onClick={() => onBreakdown(task)}
              aria-label={`Quebrar tarefa ${task.titulo} com IA`}
              title="Quebrar com IA em passos práticos"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-cyan-500 animate-pulse" />
              <span className="hidden sm:inline">Quebrar com IA</span>
              <span className="sm:hidden">IA</span>
            </button>
          )}

          <button
            id={`btn-edit-task-${task.id}`}
            type="button"
            disabled={isUpdating}
            onClick={() => onEdit(task)}
            aria-label={`Editar tarefa ${task.titulo}`}
            title="Editar tarefa"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0284c7] dark:hover:text-[#38bdf8] hover:bg-[#e0f7f8] dark:hover:bg-[#163348] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            id={`btn-delete-task-${task.id}`}
            type="button"
            disabled={isUpdating}
            onClick={() => onDelete(task)}
            aria-label={`Excluir tarefa ${task.titulo}`}
            title="Excluir tarefa"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meio do Card: Checkbox Estilo Rounded-Square + Conteúdo */}
      <div className="flex items-start gap-3.5">
        <button
          id={`btn-toggle-task-${task.id}`}
          type="button"
          disabled={isUpdating}
          onClick={() => onToggleComplete(task.id)}
          aria-label={isCompleted ? 'Reabrir tarefa' : 'Marcar como concluída'}
          title={isCompleted ? 'Reabrir tarefa' : 'Concluir tarefa'}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer ${
            isCompleted
              ? 'gradient-cyan-sky text-white shadow-md shadow-cyan-400/30 scale-95'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#2ad0ca] bg-white dark:bg-[#132032]'
          }`}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3] animate-checkmark" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <h4
            className={`text-base sm:text-lg font-bold leading-snug break-words transition-all duration-200 ${
              isCompleted
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-white'
            }`}
          >
            {task.titulo}
          </h4>

          {task.descricao && (
            <p
              className={`text-xs sm:text-sm leading-relaxed break-words line-clamp-3 ${
                isCompleted
                  ? 'text-slate-400 dark:text-slate-500 line-through'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {task.descricao}
            </p>
          )}

          {/* Subtarefas Checklist (se houver) */}
          {hasSubtasks && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  Subtarefas ({completedSubtasksCount}/{totalSubtasksCount})
                </span>
                <span className="text-cyan-600 dark:text-cyan-400">
                  {Math.round((completedSubtasksCount / totalSubtasksCount) * 100)}%
                </span>
              </div>

              {/* Barra de progresso de subtarefas */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all duration-300"
                  style={{ width: `${(completedSubtasksCount / totalSubtasksCount) * 100}%` }}
                />
              </div>

              <div className="space-y-1 pt-1">
                {task.subtarefas!.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onToggleSubtask && onToggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2 text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {sub.concluida ? (
                      <CheckSquare className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                    <span
                      className={`break-words leading-tight ${
                        sub.concluida
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sub.titulo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé do Card: Data de Criação e Prazo */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatTimestamp(task.criadoEm)}</span>
        </span>

        {task.dataLimite ? (
          <span
            className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-xl ${
              overdue
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50'
                : 'text-[#0284c7] dark:text-[#38bdf8] bg-[#e0f7f8] dark:bg-[#163348]'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Prazo: {formatDueDate(task.dataLimite)}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg">
            <span>Sem prazo definido</span>
          </span>
        )}
      </div>
    </article>
  );
};
