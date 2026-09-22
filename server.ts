import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização segura do cliente GoogleGenAI server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface BreakdownRequestBody {
  taskTitle: string;
  taskDescription?: string;
  priority?: string;
}

export interface GeneratedSubtask {
  id: string;
  titulo: string;
  concluida: boolean;
}

/**
 * Validação rigorosa dos dados de entrada (input sanitization)
 */
export function validateBreakdownInput(body: unknown): {
  valid: boolean;
  error?: string;
  sanitizedTitle?: string;
  sanitizedDescription?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'O corpo da requisição deve ser um objeto JSON.' };
  }

  const { taskTitle, taskDescription } = body as Record<string, unknown>;

  if (typeof taskTitle !== 'string') {
    return { valid: false, error: 'O título da tarefa (taskTitle) é obrigatório e deve ser um texto.' };
  }

  const cleanTitle = taskTitle.trim();
  if (cleanTitle.length < 2) {
    return { valid: false, error: 'O título da tarefa deve ter pelo menos 2 caracteres.' };
  }

  if (cleanTitle.length > 200) {
    return { valid: false, error: 'O título da tarefa não pode ultrapassar 200 caracteres.' };
  }

  let cleanDescription: string | undefined = undefined;
  if (taskDescription !== undefined && taskDescription !== null) {
    if (typeof taskDescription !== 'string') {
      return { valid: false, error: 'A descrição da tarefa deve ser um texto.' };
    }
    cleanDescription = taskDescription.trim();
    if (cleanDescription.length > 800) {
      return { valid: false, error: 'A descrição da tarefa não pode ultrapassar 800 caracteres.' };
    }
  }

  return {
    valid: true,
    sanitizedTitle: cleanTitle,
    sanitizedDescription: cleanDescription,
  };
}

/**
 * Valida a lista de subtarefas retornada pelo Gemini
 * Garante:
 * - Quantidade entre 3 e 7 subtarefas;
 * - Cada subtarefa tem título válido, sem código injetado;
 * - Sem datas ou responsáveis inventados;
 * - Concluída inicia sempre como false.
 */
export function validateAndSanitizeSubtasks(rawSubtasks: unknown): {
  valid: boolean;
  subtasks?: GeneratedSubtask[];
  error?: string;
} {
  if (!Array.isArray(rawSubtasks)) {
    return { valid: false, error: 'A resposta do modelo não contém uma lista de subtarefas.' };
  }

  const validItems: GeneratedSubtask[] = [];

  for (let i = 0; i < rawSubtasks.length; i++) {
    const item = rawSubtasks[i];
    if (!item || typeof item !== 'object') continue;

    const rawTitle = (item as Record<string, unknown>).titulo;
    if (typeof rawTitle !== 'string') continue;

    const cleanTitle = rawTitle.trim().replace(/[<>]/g, ''); // Previne injeção HTML
    if (cleanTitle.length >= 3 && cleanTitle.length <= 150) {
      validItems.push({
        id: `sub-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        titulo: cleanTitle,
        concluida: false,
      });
    }
  }

  if (validItems.length < 3) {
    return {
      valid: false,
      error: `Foram geradas apenas ${validItems.length} subtarefas válidas. São necessárias entre 3 e 7.`,
    };
  }

  // Corta para no máximo 7 subtarefas conforme requisito estrito
  const boundedItems = validItems.slice(0, 7);

  return {
    valid: true,
    subtasks: boundedItems,
  };
}

/**
 * Schema estrito com Types do @google/genai para o Structured Output
 */
export const SUBTASKS_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subtarefas: {
      type: Type.ARRAY,
      description: 'Lista de 3 a 7 passos curtos, práticos e executáveis em português do Brasil.',
      items: {
        type: Type.OBJECT,
        properties: {
          titulo: {
            type: Type.STRING,
            description: 'Ação objetiva e clara da subtarefa, sem datas ou nomes inventados (máximo 120 caracteres).',
          },
        },
        required: ['titulo'],
      },
    },
  },
  required: ['subtarefas'],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Endpoint de Saúde
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'EasyTask AI Backend' });
  });

  // Endpoint Server-Side: Quebrar Tarefa com IA
  app.post('/api/tasks/breakdown', async (req: Request, res: Response) => {
    try {
      // 1. Validação defensiva do input
      const validation = validateBreakdownInput(req.body);
      if (!validation.valid || !validation.sanitizedTitle) {
        return res.status(400).json({
          error: validation.error || 'Dados de entrada inválidos.',
        });
      }

      // 2. Verificação da secret server-side
      const activeApiKey = process.env.GEMINI_API_KEY;
      if (!activeApiKey) {
        console.error('GEMINI_API_KEY não configurada no ambiente server-side.');
        return res.status(500).json({
          error: 'Chave do serviço de IA (GEMINI_API_KEY) não configurada no servidor.',
        });
      }

      // 3. Montagem do prompt seguro (sem dados sensíveis ou PII do usuário)
      const prompt = `Você é um assistente de produtividade e organização pessoal.
Sua tarefa é decompor a atividade a seguir em passos curtos, sequenciais, objetivos e acionáveis em Português do Brasil (pt-BR).

Regras obrigatórias:
1. Gere entre 3 e 7 subtarefas claras e objetivas.
2. Cada subtarefa deve ser curta (máximo 120 caracteres) e começar com um verbo de ação (ex: "Definir...", "Listar...", "Revisar...").
3. NUNCA invente datas ou prazos.
4. NUNCA invente nomes de pessoas ou responsáveis.
5. Concentre-se estritamente na tarefa fornecida.

Tarefa principal: "${validation.sanitizedTitle}"
${validation.sanitizedDescription ? `Detalhes adicionais: "${validation.sanitizedDescription}"` : ''}
`;

      // 4. Chamada ao Gemini via Interactions API com Structured Output
      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
        response_format: SUBTASKS_JSON_SCHEMA,
      });

      // 5. Extração robusta da saída da Interactions API
      let jsonString = '';
      if (interaction.output_text) {
        jsonString = interaction.output_text.trim();
      } else if (Array.isArray(interaction.steps)) {
        for (const step of interaction.steps) {
          if (step.type === 'model_output' && Array.isArray(step.content)) {
            const textItem = step.content.find((c) => c.type === 'text');
            if (textItem && 'text' in textItem && textItem.text) {
              jsonString += textItem.text;
            }
          }
        }
      }

      if (!jsonString) {
        return res.status(502).json({
          error: 'O modelo de IA não retornou conteúdo. Tente novamente.',
        });
      }

      // Parsing seguro com suporte a markdown code blocks se houver
      let parsedData: { subtarefas?: unknown } = {};
      try {
        const cleaned = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedData = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('Falha ao interpretar JSON retornado pelo Gemini:', jsonString, parseErr);
        return res.status(502).json({
          error: 'Formato de resposta inválido retornado pelo serviço de IA.',
        });
      }

      // 6. Validação e sanitização estrita da saída (3 a 7 subtarefas)
      const sanitizeResult = validateAndSanitizeSubtasks(parsedData.subtarefas);
      if (!sanitizeResult.valid || !sanitizeResult.subtasks) {
        return res.status(502).json({
          error: sanitizeResult.error || 'Não foi possível validar as subtarefas sugeridas.',
        });
      }

      // 7. Retorno com sucesso ao frontend
      return res.status(200).json({
        success: true,
        subtasks: sanitizeResult.subtasks,
      });
    } catch (err: unknown) {
      console.error('Erro no processamento de quebra de tarefa:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Tratamento específico de Rate Limit (429) ou Erros da API
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
        return res.status(429).json({
          error: 'Limite de requisições à IA temporariamente atingido. Aguarde alguns instantes e tente novamente.',
        });
      }

      return res.status(500).json({
        error: 'Ocorreu um erro interno no servidor ao processar a quebra da tarefa. Tente novamente.',
      });
    }
  });

  // Integração com Vite em desenvolvimento e produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EasyTask Server rodando na porta ${PORT}`);
  });
}

// Inicializa o servidor apenas se for o script principal executado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().catch((err) => {
    console.error('Falha crítica ao iniciar o servidor:', err);
    process.exit(1);
  });
}
