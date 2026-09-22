import React from 'react';
import { Filter, RotateCcw, Tag } from 'lucide-react';
import { StatusFilter, PriorityFilter } from '../types';

interface TaskFiltersProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  availableCategories: string[];
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  selectedCategory,
  onCategoryChange,
  availableCategories,
  onResetFilters,
  hasActiveFilters,
}) => {
  const statusOptions: { id: StatusFilter; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'concluidas', label: 'Concluídas' },
  ];

  return (
    <div
      id="task-filters-bar"
      aria-label="Filtros de tarefas e categorias"
      className="w-full space-y-3"
    >
      {/* Seção "Categories" inspirada diretamente na Tela 2 da referência */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
              Categorias
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={onResetFilters}
              title="Limpar todos os filtros"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Barra de Pills Rolável Horizontalmente estilo Screen 2 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
          <button
            type="button"
            onClick={() => onCategoryChange('todas')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === 'todas'
                ? 'gradient-cyan-sky text-white shadow-md shadow-cyan-400/30'
                : 'bg-white dark:bg-[#132032] text-slate-600 dark:text-slate-300 border border-[#e0f2f4] dark:border-[#1e334a] hover:border-[#2ad0ca]'
            }`}
          >
            Todas
          </button>

          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(isSelected ? 'todas' : cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'gradient-cyan-sky text-white shadow-md shadow-cyan-400/30'
                    : 'bg-white dark:bg-[#132032] text-slate-600 dark:text-slate-300 border border-[#e0f2f4] dark:border-[#1e334a] hover:border-[#2ad0ca]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra Secundária: Filtro de Status + Seletor de Prioridade */}
      <div className="bg-white dark:bg-[#132032] rounded-2xl p-2.5 sm:p-3 border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Abas de Status */}
        <div className="flex items-center gap-1 bg-[#f0fafb] dark:bg-[#0c1826] p-1 rounded-xl">
          {statusOptions.map((filter) => {
            const isActive = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                id={`filter-status-${filter.id}`}
                type="button"
                onClick={() => onStatusChange(filter.id)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#1e334a] text-[#0284c7] dark:text-[#38bdf8] shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Prioridade */}
        <div className="flex items-center gap-2 justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Prioridade:
          </span>
          <select
            id="filter-priority-select"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
            className="bg-[#f0fafb] dark:bg-[#0c1826] text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#d8f0f3] dark:border-[#1e334a] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 cursor-pointer"
          >
            <option value="todas">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>
    </div>
  );
};
