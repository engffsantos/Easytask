import React, { useState } from 'react';
import { Sparkles, Check, X, AlertCircle, RefreshCw, Loader2, ListPlus } from 'lucide-react';
import { Subtask, Task } from '../types';

interface BreakdownModalProps {
  task: Task;
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  suggestedSubtasks: Subtask[];
  onClose: () => void;
  onRetry: () => void;
  onConfirm: (selectedSubtasks: Subtask[]) => Promise<void>;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  task,
  isOpen,
  isLoading,
  isSaving,
  error,
  suggestedSubtasks,
  onClose,
  onRetry,
  onConfirm,
}) => {
  // Mantém controle de quais subtarefas o usuário deseja selecionar/incluir
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(suggestedSubtasks.map((s) => s.id));
  });

  // Atualiza seleção padrão se novas subtarefas forem carregadas
  React.useEffect(() => {
    setSelectedIds(new Set(suggestedSubtasks.map((s) => s.id)));
  }, [suggestedSubtasks]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === suggestedSubtasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suggestedSubtasks.map((s) => s.id)));
    }
  };

  const handleConfirmAction = async () => {
    const chosen = suggestedSubtasks.filter((s) => selectedIds.has(s.id));
    await onConfirm(chosen);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-breakdown-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="modal-breakdown-container"
        className="bg-white dark:bg-[#132032] w-full max-w-lg rounded-[28px] p-6 border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow flex flex-col gap-5 max-h-[90vh] overflow-hidden"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25 flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3
                id="modal-breakdown-title"
                className="text-lg font-extrabold text-slate-800 dark:text-white"
              >
                Quebrar Tarefa com IA
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                Tarefa: <span className="font-semibold text-slate-700 dark:text-slate-300">"{task.titulo}"</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading || isSaving}
            onClick={onClose}
            aria-label="Fechar janela"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Estado de Carregamento */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
                <Loader2 className="w-6 h-6 animate-spin stroke-[2.5]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Analisando e dividindo tarefa...
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Gerando passos curtos e práticos com o Gemini Flash.
                </p>
              </div>
            </div>
          )}

          {/* Mensagem de Erro com botão de Tentar Novamente */}
          {!isLoading && error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex flex-col gap-3 animate-slide-down">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Não foi possível gerar subtarefas</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#132032] border border-rose-200 text-xs font-bold text-rose-600 cursor-pointer hover:bg-rose-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tentar novamente</span>
                </button>
              </div>
            </div>
          )}

          {/* Pré-visualização das Subtarefas Sugeridas para Confirmação Humana */}
          {!isLoading && !error && suggestedSubtasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Selecione os passos que deseja adicionar à tarefa:
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {selectedIds.size === suggestedSubtasks.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>

              <div className="space-y-2">
                {suggestedSubtasks.map((subtask, index) => {
                  const isChecked = selectedIds.has(subtask.id);
                  return (
                    <div
                      key={subtask.id}
                      onClick={() => toggleSelect(subtask.id)}
                      className={`p-3 rounded-2xl border transition-all duration-200 flex items-center gap-3 cursor-pointer select-none ${
                        isChecked
                          ? 'bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-800'
                          : 'bg-slate-50/60 dark:bg-[#0c1826] border-slate-200 dark:border-slate-800/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                          isChecked
                            ? 'bg-gradient-to-tr from-cyan-500 to-sky-500 text-white shadow-xs'
                            : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#132032]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-semibold leading-snug break-words ${
                            isChecked
                              ? 'text-slate-800 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold mr-1.5">
                            {index + 1}.
                          </span>
                          {subtask.titulo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 px-1 italic">
                * As subtarefas selecionadas serão salvas de forma persistente apenas quando você clicar em "Confirmar e Salvar".
              </p>
            </div>
          )}
        </div>

        {/* Rodapé / Ações */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar sem salvar
          </button>

          {!isLoading && !error && suggestedSubtasks.length > 0 && (
            <button
              id="btn-confirm-save-breakdown"
              type="button"
              disabled={isSaving || selectedIds.size === 0}
              onClick={handleConfirmAction}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer shadow-md ${
                selectedIds.size === 0 || isSaving
                  ? 'opacity-50 pointer-events-none bg-slate-400'
                  : 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:opacity-95 shadow-cyan-500/25 active:scale-95'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando no Firestore...</span>
                </>
              ) : (
                <>
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>
                    Salvar {selectedIds.size}{' '}
                    {selectedIds.size === 1 ? 'subtarefa' : 'subtarefas'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
