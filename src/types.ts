export type Priority = 'baixa' | 'media' | 'alta';
export type TaskStatus = 'pendente' | 'concluida';

export interface Subtask {
  id: string;
  titulo: string;
  concluida: boolean;
}

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  prioridade: Priority;
  categoria?: string;
  dataLimite?: string;
  status: TaskStatus;
  subtarefas?: Subtask[];
  userId: string;
  criadoEm: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type StatusFilter = 'todas' | 'pendentes' | 'concluidas';
export type PriorityFilter = 'todas' | Priority;
