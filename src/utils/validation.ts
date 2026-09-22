import { Priority } from '../types';

export interface TaskValidationInput {
  titulo: string;
  prioridade: string;
  descricao?: string;
  dataLimite?: string;
  categoria?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    titulo?: string;
    prioridade?: string;
    dataLimite?: string;
    descricao?: string;
    categoria?: string;
  };
  sanitized: {
    titulo: string;
    prioridade: Priority;
    descricao?: string;
    dataLimite?: string;
    categoria?: string;
  };
}

const VALID_PRIORITIES: Priority[] = ['baixa', 'media', 'alta'];

export function validateTaskInput(input: TaskValidationInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // 1. Validação de Título (obrigatório, entre 1 e 120 caracteres)
  const trimmedTitulo = (input.titulo || '').trim();
  if (!trimmedTitulo) {
    errors.titulo = 'O título da tarefa é obrigatório.';
  } else if (trimmedTitulo.length > 120) {
    errors.titulo = 'O título deve conter no máximo 120 caracteres.';
  }

  // 2. Validação de Prioridade (obrigatória: baixa, media ou alta)
  const prioridadeValue = input.prioridade as Priority;
  if (!VALID_PRIORITIES.includes(prioridadeValue)) {
    errors.prioridade = 'A prioridade deve ser baixa, média ou alta.';
  }

  // 3. Validação de Data Limite (quando informada, formato AAAA-MM-DD e data real)
  const trimmedDataLimite = (input.dataLimite || '').trim();
  if (trimmedDataLimite) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trimmedDataLimite)) {
      errors.dataLimite = 'Formato de data inválido. Utilize o formato padrão (AAAA-MM-DD).';
    } else {
      const [yearStr, monthStr, dayStr] = trimmedDataLimite.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      const parsedDate = new Date(year, month - 1, day);
      if (
        isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
      ) {
        errors.dataLimite = 'Informe uma data válida no calendário.';
      }
    }
  }

  // 4. Validação de Descrição (máximo de 500 caracteres)
  const trimmedDescricao = (input.descricao || '').trim();
  if (trimmedDescricao.length > 500) {
    errors.descricao = 'A descrição deve conter no máximo 500 caracteres.';
  }

  // 5. Validação de Categoria (máximo de 30 caracteres)
  const trimmedCategoria = (input.categoria || '').trim();
  if (trimmedCategoria.length > 30) {
    errors.categoria = 'A categoria deve conter no máximo 30 caracteres.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      titulo: trimmedTitulo,
      prioridade: VALID_PRIORITIES.includes(prioridadeValue) ? prioridadeValue : 'media',
      descricao: trimmedDescricao || undefined,
      dataLimite: trimmedDataLimite || undefined,
      categoria: trimmedCategoria || undefined,
    },
  };
}
