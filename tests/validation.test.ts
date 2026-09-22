import { describe, it, expect } from 'vitest';
import { validateTaskInput } from '../src/utils/validation';

describe('Validação de Tarefas (validateTaskInput)', () => {
  describe('Validação de Título', () => {
    it('deve rejeitar título vazio', () => {
      const result = validateTaskInput({
        titulo: '',
        prioridade: 'media',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.titulo).toBe('O título da tarefa é obrigatório.');
    });

    it('deve rejeitar título composto apenas por espaços', () => {
      const result = validateTaskInput({
        titulo: '    ',
        prioridade: 'alta',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.titulo).toBe('O título da tarefa é obrigatório.');
    });

    it('deve rejeitar título com mais de 120 caracteres', () => {
      const longTitle = 'A'.repeat(121);
      const result = validateTaskInput({
        titulo: longTitle,
        prioridade: 'baixa',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.titulo).toBe('O título deve conter no máximo 120 caracteres.');
    });

    it('deve aceitar título válido e realizar trim de espaços excedentes', () => {
      const result = validateTaskInput({
        titulo: '  Comprar mantimentos no mercado  ',
        prioridade: 'media',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized.titulo).toBe('Comprar mantimentos no mercado');
      expect(result.errors.titulo).toBeUndefined();
    });
  });

  describe('Validação de Prioridade', () => {
    it('deve aceitar prioridades válidas: baixa, media e alta', () => {
      const p1 = validateTaskInput({ titulo: 'Tarefa 1', prioridade: 'baixa' });
      const p2 = validateTaskInput({ titulo: 'Tarefa 2', prioridade: 'media' });
      const p3 = validateTaskInput({ titulo: 'Tarefa 3', prioridade: 'alta' });

      expect(p1.isValid).toBe(true);
      expect(p1.sanitized.prioridade).toBe('baixa');

      expect(p2.isValid).toBe(true);
      expect(p2.sanitized.prioridade).toBe('media');

      expect(p3.isValid).toBe(true);
      expect(p3.sanitized.prioridade).toBe('alta');
    });

    it('deve rejeitar prioridade inválida e aplicar fallback seguro', () => {
      const result = validateTaskInput({
        titulo: 'Tarefa com prioridade incorreta',
        prioridade: 'urgente',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.prioridade).toBe('A prioridade deve ser baixa, média ou alta.');
      expect(result.sanitized.prioridade).toBe('media');
    });
  });

  describe('Validação de Data Limite', () => {
    it('deve aceitar tarefa sem data limite', () => {
      const result = validateTaskInput({
        titulo: 'Tarefa contínua',
        prioridade: 'baixa',
        dataLimite: '',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized.dataLimite).toBeUndefined();
      expect(result.errors.dataLimite).toBeUndefined();
    });

    it('deve aceitar data limite no formato válido AAAA-MM-DD', () => {
      const result = validateTaskInput({
        titulo: 'Entrega do relatório',
        prioridade: 'alta',
        dataLimite: '2026-09-30',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized.dataLimite).toBe('2026-09-30');
    });

    it('deve rejeitar formatos incorretos de data (ex: DD/MM/AAAA)', () => {
      const result = validateTaskInput({
        titulo: 'Teste formato',
        prioridade: 'media',
        dataLimite: '30/09/2026',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dataLimite).toContain('Formato de data inválido');
    });

    it('deve rejeitar datas inexistentes no calendário (ex: 30 de fevereiro)', () => {
      const result = validateTaskInput({
        titulo: 'Data fictícia',
        prioridade: 'media',
        dataLimite: '2026-02-30',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dataLimite).toBe('Informe uma data válida no calendário.');
    });

    it('deve rejeitar 29 de fevereiro em anos não bissextos (2026)', () => {
      const result = validateTaskInput({
        titulo: 'Fevereiro não bissexto',
        prioridade: 'baixa',
        dataLimite: '2026-02-29',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dataLimite).toBe('Informe uma data válida no calendário.');
    });

    it('deve aceitar 29 de fevereiro em anos bissextos (2028)', () => {
      const result = validateTaskInput({
        titulo: 'Ano bissexto',
        prioridade: 'alta',
        dataLimite: '2028-02-29',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized.dataLimite).toBe('2028-02-29');
    });
  });

  describe('Validação de Descrição e Categoria', () => {
    it('deve rejeitar descrição superior a 500 caracteres', () => {
      const longDesc = 'D'.repeat(501);
      const result = validateTaskInput({
        titulo: 'Tarefa detalhada',
        prioridade: 'media',
        descricao: longDesc,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.descricao).toBe('A descrição deve conter no máximo 500 caracteres.');
    });

    it('deve rejeitar categoria superior a 30 caracteres', () => {
      const longCat = 'C'.repeat(31);
      const result = validateTaskInput({
        titulo: 'Tarefa categorizada',
        prioridade: 'media',
        categoria: longCat,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.categoria).toBe('A categoria deve conter no máximo 30 caracteres.');
    });

    it('deve higienizar descrição e categoria válidas com trim', () => {
      const result = validateTaskInput({
        titulo: 'Tarefa completa',
        prioridade: 'alta',
        descricao: '  Detalhamento da atividade com espaços  ',
        categoria: '  Trabalho  ',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized.descricao).toBe('Detalhamento da atividade com espaços');
      expect(result.sanitized.categoria).toBe('Trabalho');
    });
  });
});
