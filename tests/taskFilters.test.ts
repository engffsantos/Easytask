import { describe, it, expect } from 'vitest';
import { filterTasks, calculateTaskStats } from '../src/utils/taskFilters';
import { Task } from '../src/types';

const now = new Date();
const currentDayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

describe('Filtros e Estatísticas de Tarefas (src/utils/taskFilters.ts)', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      titulo: 'Finalizar relatório financeiro',
      descricao: 'Planilha de despesas do mês',
      prioridade: 'alta',
      status: 'pendente',
      userId: 'user-123',
      criadoEm: 1700000000000,
      dataLimite: currentDayStr,
      categoria: 'Trabalho',
    },
    {
      id: 'task-2',
      titulo: 'Comprar frutas e legumes',
      descricao: 'Maçã, banana e tomate',
      prioridade: 'media',
      status: 'concluida',
      userId: 'user-123',
      criadoEm: 1700000001000,
      dataLimite: currentDayStr,
      categoria: 'Casa',
    },
    {
      id: 'task-3',
      titulo: 'Estudar TypeScript e React',
      prioridade: 'baixa',
      status: 'pendente',
      userId: 'user-123',
      criadoEm: 1700000002000,
      // Sem data definida (backlog)
      categoria: 'Estudos',
    },
    {
      id: 'task-4',
      titulo: 'Pagar conta de energia atrasada',
      prioridade: 'alta',
      status: 'pendente',
      userId: 'user-123',
      criadoEm: 1700000003000,
      dataLimite: '2020-01-01', // Atrasada!
      categoria: 'Finanças',
    },
    {
      id: 'task-5',
      titulo: 'Viagem de férias no fim do ano',
      prioridade: 'baixa',
      status: 'pendente',
      userId: 'user-123',
      criadoEm: 1700000004000,
      dataLimite: '2099-12-25', // Futuro distante
      categoria: 'Pessoal',
    },
  ];

  describe('Filtro por Status', () => {
    it('deve retornar todas as tarefas quando statusFilter for "todas"', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'todas',
        selectedCategory: 'todas',
        selectedDate: 'all',
      });
      expect(result).toHaveLength(5);
    });

    it('deve retornar apenas tarefas pendentes quando statusFilter for "pendentes"', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'pendentes',
        priorityFilter: 'todas',
        selectedCategory: 'todas',
        selectedDate: 'all',
      });
      expect(result).toHaveLength(4);
      expect(result.every((t) => t.status === 'pendente')).toBe(true);
    });

    it('deve retornar apenas tarefas concluídas quando statusFilter for "concluidas"', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'concluidas',
        priorityFilter: 'todas',
        selectedCategory: 'todas',
        selectedDate: 'all',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-2');
    });
  });

  describe('Filtro por Prioridade', () => {
    it('deve filtrar corretamente por prioridade alta', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'alta',
        selectedCategory: 'todas',
        selectedDate: 'all',
      });
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.prioridade === 'alta')).toBe(true);
    });

    it('deve filtrar corretamente por prioridade media', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'media',
        selectedCategory: 'todas',
        selectedDate: 'all',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-2');
    });

    it('deve filtrar corretamente por prioridade baixa', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'baixa',
        selectedCategory: 'todas',
        selectedDate: 'all',
      });
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.prioridade === 'baixa')).toBe(true);
    });
  });

  describe('Filtro por Categoria', () => {
    it('deve filtrar tarefas pela categoria exata', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'todas',
        selectedCategory: 'Finanças',
        selectedDate: 'all',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-4');
    });
  });

  describe('Regra de Negócio de Filtragem por Data', () => {
    it('quando um dia for selecionado, deve exibir: as tarefas do dia, as sem data e as atrasadas; e ocultar apenas futuras de outras datas', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'todas',
        selectedCategory: 'todas',
        selectedDate: currentDayStr,
      });

      const ids = result.map((t) => t.id);

      // Tarefa 1: data 2026-09-15 (do dia) -> deve aparecer
      expect(ids).toContain('task-1');

      // Tarefa 2: data 2026-09-15 (do dia) -> deve aparecer
      expect(ids).toContain('task-2');

      // Tarefa 3: sem data limite (backlog contínuo) -> deve aparecer sempre
      expect(ids).toContain('task-3');

      // Tarefa 4: data 2020-01-01 (atrasada) -> deve aparecer sempre
      expect(ids).toContain('task-4');

      // Tarefa 5: data 2026-12-25 (futura de outro dia) -> DEVE SER OCULTADA
      expect(ids).not.toContain('task-5');
    });
  });

  describe('Busca Textual', () => {
    it('deve encontrar tarefas pelo título (case-insensitive)', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'todas',
        selectedCategory: 'todas',
        selectedDate: 'all',
        searchQuery: 'relatório',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
    });

    it('deve encontrar tarefas pela descrição', () => {
      const result = filterTasks(mockTasks, {
        statusFilter: 'todas',
        priorityFilter: 'todas',
        selectedCategory: 'todas',
        selectedDate: 'all',
        searchQuery: 'tomate',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-2');
    });
  });

  describe('Cálculo de Estatísticas (calculateTaskStats)', () => {
    it('deve calcular corretamente total, pendentes, concluídas, atrasadas e percentual', () => {
      const stats = calculateTaskStats(mockTasks);

      expect(stats.total).toBe(5);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(4);
      expect(stats.overdue).toBe(1); // Apenas task-4 está pendente com data no passado
      expect(stats.completionPercentage).toBe(20); // 1 de 5 = 20%
    });

    it('deve retornar zeros com segurança quando a lista de tarefas estiver vazia', () => {
      const stats = calculateTaskStats([]);

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.overdue).toBe(0);
      expect(stats.completionPercentage).toBe(0);
    });
  });
});
