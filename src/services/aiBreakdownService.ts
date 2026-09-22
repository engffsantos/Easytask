import { Subtask } from '../types';

export interface BreakdownApiResponse {
  success?: boolean;
  subtasks?: Subtask[];
  error?: string;
}

/**
 * Chama o endpoint server-side /api/tasks/breakdown
 * com timeout configurado de 15 segundos e proteção contra falhas de rede.
 */
export async function requestTaskBreakdown(
  taskTitle: string,
  taskDescription?: string
): Promise<{ success: boolean; subtasks?: Subtask[]; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('/api/tasks/breakdown', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskTitle,
        taskDescription,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data: BreakdownApiResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: data.error || 'Limite de requisições excedido. Por favor, aguarde alguns instantes.',
        };
      }
      return {
        success: false,
        error: data.error || `Erro no servidor (${response.status}). Tente novamente.`,
      };
    }

    if (!data.subtasks || !Array.isArray(data.subtasks) || data.subtasks.length === 0) {
      return {
        success: false,
        error: 'Nenhuma subtarefa foi retornada pelo assistente.',
      };
    }

    return {
      success: true,
      subtasks: data.subtasks,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        error: 'O tempo limite de espera da IA esgotou (timeout de 15s). Tente novamente.',
      };
    }

    return {
      success: false,
      error: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    };
  }
}
