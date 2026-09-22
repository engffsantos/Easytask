import { Task, StatusFilter, PriorityFilter } from '../types';
import { isOverdue } from './date';

export interface TaskFilterOptions {
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  selectedCategory: string;
  selectedDate: string;
  searchQuery?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  completionPercentage: number;
  overdue: number;
}

/**
 * Filtra tarefas com base em status, prioridade, categoria, busca e data.
 * Regras de negócio:
 * 1. Status: 'todas', 'pendentes' (apenas pendente), 'concluidas' (apenas concluida)
 * 2. Prioridade: 'todas', 'baixa', 'media', 'alta'
 * 3. Categoria: 'todas' ou nome exato da categoria
 * 4. Data selecionada:
 *    - Se selectedDate for 'all': exibe todas que passarem pelos demais filtros.
 *    - Se selectedDate for uma data específica (ex: '2026-09-15'):
 *      * Tarefas sem data limite SEMPRE permanecem visíveis (backlog).
 *      * Tarefas atrasadas SEMPRE permanecem visíveis (atenção prioritária).
 *      * Tarefas agendadas para o dia selecionado aparecem.
 *      * Tarefas agendadas para outros dias futuros são ocultadas.
 * 5. Busca textual: case-insensitive no título, descrição e categoria.
 */
export function filterTasks(tasks: Task[], options: TaskFilterOptions): Task[] {
  const { statusFilter, priorityFilter, selectedCategory, selectedDate, searchQuery } = options;
  const normalizedQuery = searchQuery?.trim().toLowerCase();

  return tasks.filter((task) => {
    // 1. Filtro por status
    if (statusFilter === 'pendentes' && task.status !== 'pendente') return false;
    if (statusFilter === 'concluidas' && task.status !== 'concluida') return false;

    // 2. Filtro por prioridade
    if (priorityFilter !== 'todas' && task.prioridade !== priorityFilter) return false;

    // 3. Filtro por categoria
    if (selectedCategory !== 'todas' && task.categoria !== selectedCategory) return false;

    // 4. Filtro por data
    if (selectedDate !== 'all') {
      const hasNoDate = !task.dataLimite || task.dataLimite.trim() === '';
      const isTaskOverdue = isOverdue(task.dataLimite, task.status);
      const matchesSelectedDate = Boolean(
        task.dataLimite && task.dataLimite.startsWith(selectedDate)
      );

      // Oculta apenas tarefas com outra data futura que não estejam atrasadas
      if (!hasNoDate && !isTaskOverdue && !matchesSelectedDate) {
        return false;
      }
    }

    // 5. Filtro por texto de busca (opcional)
    if (normalizedQuery) {
      const titleMatch = task.titulo.toLowerCase().includes(normalizedQuery);
      const descMatch = task.descricao ? task.descricao.toLowerCase().includes(normalizedQuery) : false;
      const catMatch = task.categoria ? task.categoria.toLowerCase().includes(normalizedQuery) : false;

      if (!titleMatch && !descMatch && !catMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calcula métricas e estatísticas agregadas das tarefas.
 */
export function calculateTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.status === 'concluida') {
      completed += 1;
    } else {
      pending += 1;
      if (isOverdue(task.dataLimite, task.status)) {
        overdue += 1;
      }
    }
  }

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    pending,
    completed,
    completionPercentage,
    overdue,
  };
}
