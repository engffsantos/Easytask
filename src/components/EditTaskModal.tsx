import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, AlignLeft, Calendar, Tag, Loader2 } from 'lucide-react';
import { Task, Priority } from '../types';
import { validateTaskInput } from '../utils/validation';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => Promise<boolean>;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  isSubmitting = false,
  onClose,
  onSave,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<Priority>('media');
  const [dataLimite, setDataLimite] = useState('');
  const [categoria, setCategoria] = useState('');
  const [errors, setErrors] = useState<{ titulo?: string; dataLimite?: string }>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (task && isOpen) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || '');
      setPrioridade(task.prioridade);
      setDataLimite(task.dataLimite || '');
      setCategoria(task.categoria || '');
      setErrors({});
      setSaveError(null);
    }
  }, [task, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = validateTaskInput({
      titulo,
      prioridade,
      descricao,
      dataLimite,
      categoria,
    });

    if (!validation.isValid) {
      setErrors({
        titulo: validation.errors.titulo,
        dataLimite: validation.errors.dataLimite,
      });
      return;
    }

    setSaveError(null);

    const success = await onSave({
      ...task,
      titulo: validation.sanitized.titulo,
      descricao: validation.sanitized.descricao,
      prioridade: validation.sanitized.prioridade,
      dataLimite: validation.sanitized.dataLimite,
      categoria: validation.sanitized.categoria,
    });

    if (success) {
      onClose();
    } else {
      setSaveError('Não foi possível salvar as alterações no Firestore. Tente novamente.');
    }
  };

  const priorityOptions: {
    value: Priority;
    label: string;
    activeClasses: string;
    inactiveClasses: string;
  }[] = [
    {
      value: 'baixa',
      label: 'Baixa',
      activeClasses: 'priority-baixa-gradient shadow-md shadow-emerald-500/20 font-bold',
      inactiveClasses: 'bg-[#f0fafb] dark:bg-[#0c1826] text-slate-600 dark:text-slate-300 border border-[#d8f0f3] dark:border-[#1e334a]',
    },
    {
      value: 'media',
      label: 'Média',
      activeClasses: 'priority-media-gradient shadow-md shadow-cyan-500/20 font-bold',
      inactiveClasses: 'bg-[#f0fafb] dark:bg-[#0c1826] text-slate-600 dark:text-slate-300 border border-[#d8f0f3] dark:border-[#1e334a]',
    },
    {
      value: 'alta',
      label: 'Alta',
      activeClasses: 'priority-alta-gradient shadow-md shadow-orange-500/20 font-bold',
      inactiveClasses: 'bg-[#f0fafb] dark:bg-[#0c1826] text-slate-600 dark:text-slate-300 border border-[#d8f0f3] dark:border-[#1e334a]',
    },
  ];

  return (
    <div
      id="edit-task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-slide-down"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        id="edit-task-modal"
        className="bg-white dark:bg-[#132032] rounded-[32px] p-6 sm:p-7 modern-shadow border border-[#d8f0f3] dark:border-[#1e334a] max-w-lg w-full relative max-h-[90vh] overflow-y-auto text-slate-800 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="edit-modal-title" className="text-xl font-extrabold tracking-tight">
              Editar Tarefa
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Atualize as informações no Cloud Firestore
            </p>
          </div>
          <button
            id="btn-close-edit-modal"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Fechar modal"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saveError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Título */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label htmlFor="edit-task-title-input" className="text-xs font-bold">
                Título <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {titulo.length}/120
              </span>
            </div>
            <input
              id="edit-task-title-input"
              type="text"
              value={titulo}
              disabled={isSubmitting}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errors.titulo) setErrors((prev) => ({ ...prev, titulo: undefined }));
              }}
              className={`w-full bg-[#f8fdfd] dark:bg-[#0c1826] border rounded-2xl px-4 py-2.5 text-sm outline-none transition-all ${
                errors.titulo
                  ? 'border-rose-400 ring-2 ring-rose-200'
                  : 'border-[#d8f0f3] dark:border-[#1e334a] focus:border-[#2ad0ca] focus:ring-2 focus:ring-cyan-400/20'
              }`}
              maxLength={120}
            />
            {errors.titulo && (
              <div className="flex items-center gap-1.5 mt-1.5 px-1 text-xs text-rose-500 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.titulo}</span>
              </div>
            )}
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-xs font-bold mb-1.5 px-1">
              Prioridade <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {priorityOptions.map((opt) => {
                const isSelected = prioridade === opt.value;
                return (
                  <button
                    key={opt.value}
                    id={`edit-priority-btn-${opt.value}`}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSubmitting}
                    onClick={() => setPrioridade(opt.value)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected ? opt.activeClasses : opt.inactiveClasses
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label htmlFor="edit-task-description-input" className="text-xs font-bold flex items-center gap-1">
                <AlignLeft className="w-3 h-3 text-slate-400" />
                <span>Descrição</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {descricao.length}/500
              </span>
            </div>
            <textarea
              id="edit-task-description-input"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes ou anotações..."
              disabled={isSubmitting}
              rows={3}
              className="w-full bg-[#f8fdfd] dark:bg-[#0c1826] border border-[#d8f0f3] dark:border-[#1e334a] rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-[#2ad0ca] resize-none"
              maxLength={500}
            />
          </div>

          {/* Grid Categoria e Data Limite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-task-category-input" className="text-xs font-bold flex items-center gap-1 mb-1.5 px-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Categoria</span>
              </label>
              <input
                id="edit-task-category-input"
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex.: Finanças, Trabalho..."
                disabled={isSubmitting}
                className="w-full bg-[#f8fdfd] dark:bg-[#0c1826] border border-[#d8f0f3] dark:border-[#1e334a] rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#2ad0ca]"
                maxLength={30}
              />
            </div>

            <div>
              <label htmlFor="edit-task-due-date-input" className="text-xs font-bold flex items-center gap-1 mb-1.5 px-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Data Limite</span>
              </label>
              <input
                id="edit-task-due-date-input"
                type="date"
                value={dataLimite}
                disabled={isSubmitting}
                onChange={(e) => {
                  setDataLimite(e.target.value);
                  if (errors.dataLimite) setErrors((prev) => ({ ...prev, dataLimite: undefined }));
                }}
                className="w-full bg-[#f8fdfd] dark:bg-[#0c1826] border border-[#d8f0f3] dark:border-[#1e334a] rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#2ad0ca] cursor-pointer"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              id="btn-cancel-edit"
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-save-edit"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl text-white text-xs font-bold gradient-cyan-sky shadow-md shadow-cyan-400/30 hover:opacity-95 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
