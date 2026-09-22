import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp, Award } from 'lucide-react';

interface TaskSummaryProps {
  total: number;
  pending: number;
  completed: number;
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({
  total,
  pending,
  completed,
}) => {
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Raio e perímetro para o anel de progresso SVG
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <section
      id="task-summary-section"
      aria-label="Resumo e estatísticas de atividades"
      className="w-full space-y-3"
    >
      {/* Card Principal de Desempenho inspirado no "Task Result" da Tela 3 */}
      <div className="w-full bg-white dark:bg-[#132032] rounded-[30px] p-5 sm:p-6 border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
        {/* Esquerda: Anel de Progresso e Título */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
              {/* Fundo do círculo */}
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Progresso com gradiente cyan */}
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="url(#cyanSkyGrad)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="cyanSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2ad0ca" />
                  <stop offset="100%" stopColor="#01b9fe" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-slate-800 dark:text-white">
                {completionPercentage}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#38bdf8]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Desempenho Geral</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-snug">
              {completionPercentage === 100 && total > 0
                ? 'Todas as tarefas concluídas! 🎉'
                : completionPercentage >= 50
                ? 'Mais da metade realizada!'
                : total === 0
                ? 'Nenhuma tarefa cadastrada'
                : 'Foco nas atividades pendentes'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completed} de {total} tarefas finalizadas
            </p>
          </div>
        </div>

        {/* Direita: Mini Gráfico de Atividade Estilo Tela 3 */}
        <div className="flex items-end justify-between sm:justify-end gap-2 bg-[#f0fafb] dark:bg-[#0c1826] p-3 rounded-2xl border border-[#d8f0f3]/60 dark:border-[#1e334a]/60">
          <div className="text-left mr-3 hidden sm:block">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metas</p>
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Visão Semanal</p>
          </div>
          <div className="flex items-end gap-1.5 h-10">
            <div className="w-2.5 h-6 rounded-full bg-[#ff758c] opacity-85" title="Segunda" />
            <div className="w-2.5 h-8 rounded-full bg-[#2ad0ca]" title="Terça" />
            <div className="w-2.5 h-5 rounded-full bg-[#ff7eb3] opacity-70" title="Quarta" />
            <div className="w-2.5 h-9 rounded-full bg-[#01b9fe]" title="Quinta" />
            <div className="w-2.5 h-7 rounded-full bg-[#10b981]" title="Sexta" />
            <div className="w-2.5 h-4 rounded-full bg-slate-300 dark:bg-slate-700" title="Sábado" />
            <div className="w-2.5 h-3 rounded-full bg-slate-300 dark:bg-slate-700" title="Domingo" />
          </div>
        </div>
      </div>

      {/* Grid com os 3 Cards de Métricas */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* Card: Total */}
        <div className="bg-white dark:bg-[#132032] rounded-2xl p-3.5 sm:p-4 border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#e0f7f8] dark:bg-[#163348] text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
              <ListTodo className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            {String(total).padStart(2, '0')}
          </p>
        </div>

        {/* Card: Pendentes */}
        <div className="bg-white dark:bg-[#132032] rounded-2xl p-3.5 sm:p-4 border border-[#ffdce2] dark:border-[#381c24] modern-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
              Pendentes
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-500 dark:text-rose-400">
            {String(pending).padStart(2, '0')}
          </p>
        </div>

        {/* Card: Concluídas */}
        <div className="bg-white dark:bg-[#132032] rounded-2xl p-3.5 sm:p-4 border border-[#d1fae5] dark:border-[#113527] modern-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Concluídas
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {String(completed).padStart(2, '0')}
          </p>
        </div>
      </div>
    </section>
  );
};
