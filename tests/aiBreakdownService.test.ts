import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestTaskBreakdown } from '../src/services/aiBreakdownService';

describe('aiBreakdownService - requestTaskBreakdown', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('deve retornar subtarefas com sucesso quando a resposta da API for 200 OK', async () => {
    const mockSubtasks = [
      { id: 'sub-1', titulo: 'Comprar passagens', concluida: false },
      { id: 'sub-2', titulo: 'Reservar hotel', concluida: false },
      { id: 'sub-3', titulo: 'Montar roteiro', concluida: false },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        subtasks: mockSubtasks,
      }),
    } as unknown as Response);

    const result = await requestTaskBreakdown('Viagem de férias', 'Praia em janeiro');

    expect(result.success).toBe(true);
    expect(result.subtasks).toEqual(mockSubtasks);
    expect(result.error).toBeUndefined();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/tasks/breakdown',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: 'Viagem de férias',
          taskDescription: 'Praia em janeiro',
        }),
      })
    );
  });

  it('deve retornar erro amigável de limite de requisições quando status for 429', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'Limite de requisições excedido. Por favor, aguarde alguns instantes.',
      }),
    } as unknown as Response);

    const result = await requestTaskBreakdown('Tarefa de teste');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite de requisições excedido');
    expect(result.subtasks).toBeUndefined();
  });

  it('deve retornar erro de servidor amigável quando status for 500 ou 502', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({
        error: 'O modelo de IA não retornou conteúdo. Tente novamente.',
      }),
    } as unknown as Response);

    const result = await requestTaskBreakdown('Tarefa de teste');

    expect(result.success).toBe(false);
    expect(result.error).toBe('O modelo de IA não retornou conteúdo. Tente novamente.');
  });

  it('deve lidar com resposta 200 sem subtarefas válidas', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        subtasks: [],
      }),
    } as unknown as Response);

    const result = await requestTaskBreakdown('Tarefa de teste');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Nenhuma subtarefa foi retornada pelo assistente.');
  });

  it('deve tratar erro de timeout (AbortError) informando mensagem específica', async () => {
    // Simula disparo do AbortController
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    globalThis.fetch = vi.fn().mockRejectedValue(abortError);

    const result = await requestTaskBreakdown('Tarefa longa');

    expect(result.success).toBe(false);
    expect(result.error).toContain('O tempo limite de espera da IA esgotou');
  });

  it('deve tratar falha geral de conexão/rede informando mensagem clara em pt-BR', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await requestTaskBreakdown('Tarefa sem internet');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Não foi possível conectar ao servidor. Verifique sua conexão');
  });
});
