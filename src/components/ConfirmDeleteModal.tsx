import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  taskTitle: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  taskTitle,
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      id="confirm-delete-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-slide-down"
      onClick={() => {
        if (!isDeleting) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        id="confirm-delete-modal"
        className="bg-white dark:bg-[#132032] rounded-[32px] p-6 sm:p-7 modern-shadow border border-rose-100 dark:border-rose-950/50 max-w-md w-full relative text-slate-800 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="confirm-delete-title" className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Excluir Tarefa?
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Esta ação removerá o documento do Cloud Firestore
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed bg-[#f0fafb] dark:bg-[#0c1826] p-4 rounded-2xl border border-[#d8f0f3] dark:border-[#1e334a]">
          Tem certeza de que deseja excluir permanentemente a atividade{' '}
          <strong className="font-bold text-rose-600 dark:text-rose-400">
            "{taskTitle}"
          </strong>
          ?
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            id="btn-cancel-delete"
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all flex items-center gap-2 cursor-pointer ${
              isDeleting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>Confirmar Exclusão</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
