import { describe, it, expect } from 'vitest';

/**
 * Emula a função isValidTarefa(data) das Firestore Security Rules
 * para validar em tempo de teste a conformidade das regras de segurança.
 */
function emulateIsValidTarefa(data: Record<string, unknown>, authUid: string): { valid: boolean; reason?: string } {
  const requiredKeys = ['titulo', 'prioridade', 'status', 'userId', 'criadoEm'];
  const allowedKeys = [
    'titulo',
    'descricao',
    'prioridade',
    'categoria',
    'dataLimite',
    'status',
    'subtarefas',
    'userId',
    'criadoEm',
  ];

  const keys = Object.keys(data);

  // 1. Deve conter todas as chaves obrigatórias
  for (const req of requiredKeys) {
    if (!keys.includes(req)) {
      return { valid: false, reason: `Chave obrigatória ausente: ${req}` };
    }
  }

  // 2. Não deve conter campos arbitrários não permitidos
  for (const k of keys) {
    if (!allowedKeys.includes(k)) {
      return { valid: false, reason: `Campo não permitido: ${k}` };
    }
  }

  // 3. Validação do título (1 a 120 caracteres)
  if (typeof data.titulo !== 'string' || data.titulo.length < 1 || data.titulo.length > 120) {
    return { valid: false, reason: 'Título inválido (tamanho entre 1 e 120)' };
  }

  // 4. Validação da descrição (opcional, até 500 caracteres)
  if ('descricao' in data && (typeof data.descricao !== 'string' || data.descricao.length > 500)) {
    return { valid: false, reason: 'Descrição inválida (máx 500 caracteres)' };
  }

  // 5. Validação de prioridade ('baixa' | 'media' | 'alta')
  if (typeof data.prioridade !== 'string' || !['baixa', 'media', 'alta'].includes(data.prioridade)) {
    return { valid: false, reason: 'Prioridade inválida' };
  }

  // 6. Validação de categoria (opcional, até 30 caracteres)
  if ('categoria' in data && (typeof data.categoria !== 'string' || data.categoria.length > 30)) {
    return { valid: false, reason: 'Categoria inválida (máx 30 caracteres)' };
  }

  // 7. Validação de dataLimite (opcional, até 10 caracteres)
  if ('dataLimite' in data && (typeof data.dataLimite !== 'string' || data.dataLimite.length > 10)) {
    return { valid: false, reason: 'Data limite inválida (máx 10 caracteres)' };
  }

  // 8. Validação de status ('pendente' | 'concluida')
  if (typeof data.status !== 'string' || !['pendente', 'concluida'].includes(data.status)) {
    return { valid: false, reason: 'Status inválido' };
  }

  // 9. userId obrigatório e estritamente igual a auth.uid
  if (typeof data.userId !== 'string' || data.userId !== authUid) {
    return { valid: false, reason: 'userId diferente do usuário autenticado' };
  }

  // 10. criadoEm deve ser number
  if (typeof data.criadoEm !== 'number') {
    return { valid: false, reason: 'criadoEm deve ser um número' };
  }

  return { valid: true };
}

describe('Conformidade com Firestore Security Rules', () => {
  const mockAuthUid = 'user_abc_123';

  it('deve aprovar um documento de tarefa perfeitamente formatado', () => {
    const payload = {
      titulo: 'Estudar arquitetura limpa',
      descricao: 'Ler artigos sobre Clean Architecture',
      prioridade: 'alta',
      categoria: 'Estudos',
      dataLimite: '2026-09-20',
      status: 'pendente',
      userId: mockAuthUid,
      criadoEm: Date.now(),
    };

    const result = emulateIsValidTarefa(payload, mockAuthUid);
    expect(result.valid).toBe(true);
  });

  it('deve rejeitar se o userId não pertencer ao usuário autenticado', () => {
    const payload = {
      titulo: 'Tentativa de forjar autor',
      prioridade: 'media',
      status: 'pendente',
      userId: 'outro_usuario_vitima',
      criadoEm: Date.now(),
    };

    const result = emulateIsValidTarefa(payload, mockAuthUid);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('userId diferente do usuário autenticado');
  });

  it('deve rejeitar se campos não permitidos forem injetados (ex: isAdmin)', () => {
    const payload = {
      titulo: 'Tentativa de injeção de privilégio',
      prioridade: 'media',
      status: 'pendente',
      userId: mockAuthUid,
      criadoEm: Date.now(),
      isAdmin: true, // Campo invasor
    };

    const result = emulateIsValidTarefa(payload, mockAuthUid);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Campo não permitido: isAdmin');
  });

  it('deve rejeitar documento sem o timestamp criadoEm', () => {
    const payload = {
      titulo: 'Sem criadoEm',
      prioridade: 'media',
      status: 'pendente',
      userId: mockAuthUid,
    };

    const result = emulateIsValidTarefa(payload, mockAuthUid);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Chave obrigatória ausente: criadoEm');
  });

  it('deve rejeitar se o status não for "pendente" ou "concluida"', () => {
    const payload = {
      titulo: 'Status arbitrário',
      prioridade: 'media',
      status: 'arquivada',
      userId: mockAuthUid,
      criadoEm: Date.now(),
    };

    const result = emulateIsValidTarefa(payload, mockAuthUid);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Status inválido');
  });
});
