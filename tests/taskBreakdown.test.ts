import { describe, it, expect } from 'vitest';
import {
  validateBreakdownInput,
  validateAndSanitizeSubtasks,
} from '../server';

describe('Server-side Task Breakdown Validation & Sanitization', () => {
  describe('validateBreakdownInput (Entrada)', () => {
    it('deve aceitar entrada válida com título e descrição', () => {
      const input = {
        taskTitle: 'Organizar apresentação de resultados',
        taskDescription: 'Preparar slides para a diretoria com métricas do Q3',
      };
      const result = validateBreakdownInput(input);
      expect(result.valid).toBe(true);
      expect(result.sanitizedTitle).toBe('Organizar apresentação de resultados');
      expect(result.sanitizedDescription).toBe('Preparar slides para a diretoria com métricas do Q3');
    });

    it('deve aceitar entrada válida sem descrição', () => {
      const input = {
        taskTitle: 'Comprar materiais de escritório',
      };
      const result = validateBreakdownInput(input);
      expect(result.valid).toBe(true);
      expect(result.sanitizedTitle).toBe('Comprar materiais de escritório');
      expect(result.sanitizedDescription).toBeUndefined();
    });

    it('deve rejeitar corpo vazio ou não-objeto', () => {
      expect(validateBreakdownInput(null).valid).toBe(false);
      expect(validateBreakdownInput(undefined).valid).toBe(false);
      expect(validateBreakdownInput('string').valid).toBe(false);
    });

    it('deve rejeitar título ausente ou vazio', () => {
      expect(validateBreakdownInput({ taskTitle: '' }).valid).toBe(false);
      expect(validateBreakdownInput({ taskTitle: '   ' }).valid).toBe(false);
      expect(validateBreakdownInput({}).valid).toBe(false);
    });

    it('deve rejeitar título menor que 2 caracteres', () => {
      const result = validateBreakdownInput({ taskTitle: 'a' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pelo menos 2 caracteres');
    });

    it('deve rejeitar título excessivamente longo (> 200 caracteres)', () => {
      const result = validateBreakdownInput({ taskTitle: 'a'.repeat(201) });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ultrapassar 200 caracteres');
    });

    it('deve rejeitar descrição excessivamente longa (> 800 caracteres)', () => {
      const result = validateBreakdownInput({
        taskTitle: 'Título normal',
        taskDescription: 'd'.repeat(801),
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ultrapassar 800 caracteres');
    });
  });

  describe('validateAndSanitizeSubtasks (Saída)', () => {
    it('deve aprovar e sanitizar lista entre 3 e 7 subtarefas', () => {
      const raw = [
        { titulo: 'Definir os tópicos principais da reunião' },
        { titulo: 'Coletar dados estatísticos com a equipe' },
        { titulo: 'Montar os slides no template padrão' },
        { titulo: 'Revisar ortografia e formatação' },
      ];

      const result = validateAndSanitizeSubtasks(raw);
      expect(result.valid).toBe(true);
      expect(result.subtasks).toBeDefined();
      expect(result.subtasks?.length).toBe(4);
      expect(result.subtasks?.[0].titulo).toBe('Definir os tópicos principais da reunião');
      expect(result.subtasks?.[0].concluida).toBe(false);
      expect(result.subtasks?.[0].id).toBeDefined();
    });

    it('deve rejeitar se houver menos de 3 subtarefas', () => {
      const raw = [
        { titulo: 'Fazer café' },
        { titulo: 'Ligar o computador' },
      ];
      const result = validateAndSanitizeSubtasks(raw);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('São necessárias entre 3 e 7');
    });

    it('deve limitar a 7 subtarefas caso o modelo retorne mais que o limite', () => {
      const raw = [
        { titulo: 'Passo 1: Planejar escopo' },
        { titulo: 'Passo 2: Definir metas' },
        { titulo: 'Passo 3: Mapear recursos' },
        { titulo: 'Passo 4: Elaborar cronograma' },
        { titulo: 'Passo 5: Alinhar com stakeholders' },
        { titulo: 'Passo 6: Iniciar execução' },
        { titulo: 'Passo 7: Revisar entregas' },
        { titulo: 'Passo 8: Fazer retrospectiva' },
        { titulo: 'Passo 9: Arquivar documentos' },
      ];
      const result = validateAndSanitizeSubtasks(raw);
      expect(result.valid).toBe(true);
      expect(result.subtasks?.length).toBe(7);
    });

    it('deve limpar tags HTML ou scripts maliciosos nos títulos das subtarefas', () => {
      const raw = [
        { titulo: '<script>alert("xss")</script>Definir o escopo' },
        { titulo: 'Montar cronograma detalhado' },
        { titulo: '<b>Revisar</b> os objetivos principais' },
      ];
      const result = validateAndSanitizeSubtasks(raw);
      expect(result.valid).toBe(true);
      expect(result.subtasks?.[0].titulo).toBe('scriptalert("xss")/scriptDefinir o escopo');
      expect(result.subtasks?.[2].titulo).toBe('bRevisar/b os objetivos principais');
    });

    it('deve rejeitar se o valor retornado não for um array', () => {
      const result = validateAndSanitizeSubtasks('não é array');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não contém uma lista de subtarefas');
    });
  });
});
