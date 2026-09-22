import { describe, it, expect } from 'vitest';
import { formatDueDate, isOverdue, formatTimestamp, getCurrentFormattedDate } from '../src/utils/date';

describe('Utilitários de Data (src/utils/date.ts)', () => {
  describe('formatDueDate', () => {
    it('deve converter AAAA-MM-DD para DD/MM/AAAA', () => {
      expect(formatDueDate('2026-09-15')).toBe('15/09/2026');
      expect(formatDueDate('2025-12-31')).toBe('31/12/2025');
      expect(formatDueDate('2027-01-01')).toBe('01/01/2027');
    });

    it('deve retornar string vazia para valores ausentes ou indefinidos', () => {
      expect(formatDueDate('')).toBe('');
      expect(formatDueDate(undefined)).toBe('');
    });

    it('deve retornar o próprio valor se não puder ser decomposto em 3 partes', () => {
      expect(formatDueDate('invalido')).toBe('invalido');
    });
  });

  describe('isOverdue', () => {
    it('deve retornar true se a data limite for anterior a hoje e a tarefa estiver pendente', () => {
      const pastDate = '2020-01-01';
      expect(isOverdue(pastDate, 'pendente')).toBe(true);
    });

    it('deve retornar false se a tarefa estiver concluída, mesmo com data no passado', () => {
      const pastDate = '2020-01-01';
      expect(isOverdue(pastDate, 'concluida')).toBe(false);
    });

    it('deve retornar false se a data limite estiver no futuro', () => {
      const futureDate = '2099-12-31';
      expect(isOverdue(futureDate, 'pendente')).toBe(false);
    });

    it('deve retornar false para tarefas sem data definida', () => {
      expect(isOverdue('', 'pendente')).toBe(false);
      expect(isOverdue(undefined, 'pendente')).toBe(false);
    });

    it('deve retornar false para o dia de hoje (ainda não expirado)', () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      expect(isOverdue(todayStr, 'pendente')).toBe(false);
    });
  });

  describe('formatTimestamp', () => {
    it('deve formatar timestamps válidos em formato brasileiro', () => {
      const timestamp = new Date('2026-09-15T14:30:00Z').getTime();
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('deve retornar vazio para timestamps inválidos', () => {
      expect(formatTimestamp(NaN)).toBe('');
    });
  });

  describe('getCurrentFormattedDate', () => {
    it('deve retornar dia da semana capitalizado e data completa', () => {
      const { weekday, fullDate } = getCurrentFormattedDate();
      expect(typeof weekday).toBe('string');
      expect(weekday.length).toBeGreaterThan(0);
      // Primeiro caractere deve ser maiúsculo
      expect(weekday.charAt(0)).toBe(weekday.charAt(0).toUpperCase());
      expect(typeof fullDate).toBe('string');
      expect(fullDate).toContain('20');
    });
  });
});
