/**
 * Utilitários para formatação e checagem de datas em Português do Brasil (PT-BR)
 */

export function getCurrentFormattedDate() {
  const date = new Date();
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const fullDate = date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    fullDate,
  };
}

export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function formatDueDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function isOverdue(dateStr?: string, status?: 'pendente' | 'concluida'): boolean {
  if (!dateStr || status === 'concluida') return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate.getTime() < today.getTime();
  } catch {
    return false;
  }
}
