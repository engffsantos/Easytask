import { describe, it, expect } from 'vitest';
import { getFriendlyErrorMessage } from '../src/lib/firebase';

describe('Mapeamento Amigável de Erros (getFriendlyErrorMessage)', () => {
  it('deve mapear "permission-denied" para mensagem clara de permissão', () => {
    const err = { code: 'permission-denied' };
    const msg = getFriendlyErrorMessage(err);
    expect(msg).toBe('Permissão negada. Você só pode visualizar e gerenciar as suas próprias tarefas.');
  });

  it('deve mapear "unauthenticated" para mensagem de sessão expirada', () => {
    const err = { code: 'unauthenticated' };
    const msg = getFriendlyErrorMessage(err);
    expect(msg).toBe('Sua sessão expirou ou não é válida. Faça login novamente para continuar.');
  });

  it('deve mapear "unavailable" para mensagem de indisponibilidade de rede', () => {
    const err = { code: 'unavailable' };
    const msg = getFriendlyErrorMessage(err);
    expect(msg).toBe('O serviço do Firestore está temporariamente indisponível. Verifique sua conexão com a internet.');
  });

  it('deve mapear "not-found" para mensagem de documento inexistente', () => {
    const err = { code: 'not-found' };
    const msg = getFriendlyErrorMessage(err);
    expect(msg).toBe('A tarefa solicitada não foi encontrada na nuvem.');
  });

  it('deve mapear "already-exists" para mensagem de duplicidade', () => {
    const err = { code: 'already-exists' };
    const msg = getFriendlyErrorMessage(err);
    expect(msg).toBe('Esta tarefa já existe no banco de dados.');
  });

  it('deve mapear "cancelled" para mensagem de cancelamento', () => {
    const err = { code: 'cancelled' };
    const msg = getFriendlyErrorMessage(err);
    expect(msg).toBe('A operação foi cancelada.');
  });

  it('deve fornecer mensagem genérica de banco para outros códigos desconhecidos', () => {
    const err = { code: 'unknown-custom-code' };
    const msg = getFriendlyErrorMessage(err);
    expect(msg).toBe('Ocorreu um erro na comunicação com o banco de dados.');
  });

  it('deve lidar com valores que não são objetos ou não contêm code', () => {
    expect(getFriendlyErrorMessage('Erro como string')).toBe('Ocorreu um erro inesperado ao salvar ou carregar os dados.');
    expect(getFriendlyErrorMessage(null)).toBe('Ocorreu um erro inesperado ao salvar ou carregar os dados.');
    expect(getFriendlyErrorMessage(undefined)).toBe('Ocorreu um erro inesperado ao salvar ou carregar os dados.');
  });
});
