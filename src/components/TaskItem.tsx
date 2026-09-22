import React from 'react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/**
 * TaskItem - Mantido para compatibilidade e retrocompatibilidade com a estrutura anterior,
 * redirecionando diretamente para o componente modular TaskCard.
 */
export const TaskItem: React.FC<TaskItemProps> = (props) => {
  return <TaskCard {...props} />;
};

export default TaskItem;
