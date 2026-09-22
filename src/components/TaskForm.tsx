import React, { useState } from 'react';
import { Plus, AlertCircle, ChevronDown, ChevronUp, AlignLeft, Calendar, Tag, Loader2, Sparkles } from 'lucide-react';
import { Priority } from '../types';
import { validateTaskInput } from '../utils/validation';

interface TaskFormProps {
  onAddTask: (data: {
    titulo: string;
    prioridade: Priority;
    descricao?: string;
    dataLimite?: string;
    categoria?: string;
  }) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onAddTask,
  isSubmitting = false,
  submitError = null,
}) => {
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState<Priority>('media');
  const [descricao, setDescricao] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [errors, setErrors] = useState<{ titulo?: string; dataLimite?: string }>({});

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
      if (validation.errors.dataLimite && !showOptionalFields) {
        setShowOptionalFields(true);
      }
      return;
    }

    // Tenta salvar no Firestore. Não apaga os dados se a gravação falhar!
    const success = await onAddTask(validation.sanitized);

    if (success) {
      setTitulo('');
      setDescricao('');
      setDataLimite('');
      setCategoria('');
      setPrioridade('media');
      setShowOptionalFields(false);
      setErrors({});
    }
  };

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitulo(e.target.value);
    if (errors.titulo) {
      setErrors((prev) => ({ ...prev, titulo: undefined }));
    }
  };

  const handleDataLimiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataLimite(e.target.value);
    if (errors.dataLimite) {
      setErrors((prev) => ({ ...prev, dataLimite: undefined }));
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
      activeClasses: 'priority-baixa-gradient shadow-md shadow-emerald-500/25 font-bold',
      inactiveClasses: 'bg-[#f0fafb] dark:bg-[#0c1826] text-slate-600 dark:text-slate-300 border border-[#d8f0f3] dark:border-[#1e334a]',
    },
    {
      value: 'media',
      label: 'Média',
      activeClasses: 'priority-media-gradient shadow-md shadow-cyan-500/25 font-bold',
      inactiveClasses: 'bg-[#f0fafb] dark:bg-[#0c1826] text-slate-600 dark:text-slate-300 border border-[#d8f0f3] dark:border-[#1e334a]',
    },
    {
      value: 'alta',
      label: 'Alta',
      activeClasses: 'priority-alta-gradient shadow-md shadow-orange-500/25 font-bold',
      inactiveClasses: 'bg-[#f0fafb] dark:bg-[#0c1826] text-slate-600 dark:text-slate-300 border border-[#d8f0f3] dark:border-[#1e334a]',
    },
  ];

  return (
    <div
      id="task-form-card"
      className="bg-white dark:bg-[#132032] rounded-[30px] p-5 sm:p-7 modern-shadow border border-[#d8f0f3] dark:border-[#1e334a] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-cyan-sky text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
              Criar Nova Tarefa
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Salve suas atividades no Cloud Firestore
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Aviso de erro geral de gravação do Firestore */}
        {submitError && (
          <div
            id="form-submit-error"
            className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5 animate-slide-down"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Input Título */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <label
              htmlFor="task-title-input"
              className="text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Título da Tarefa <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {titulo.length}/120
            </span>
          </div>

          <input
            id="task-title-input"
            type="text"
            value={titulo}
            onChange={handleTituloChange}
            placeholder="Ex.: Desenhar fluxo de navegação..."
            disabled={isSubmitting}
            className={`w-full bg-[#f8fdfd] dark:bg-[#0c1826] border rounded-2xl px-4 py-3 text-slate-800 dark:text-white placeholder-slate-400 text-sm outline-none transition-all duration-200 ${
              errors.titulo
                ? 'border-rose-400 ring-2 ring-rose-200 dark:ring-rose-900/50'
                : 'border-[#d8f0f3] dark:border-[#1e334a] focus:border-[#2ad0ca] focus:ring-2 focus:ring-cyan-400/20'
            } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            maxLength={120}
            aria-required="true"
          />

          {errors.titulo && (
            <div
              id="task-title-error"
              className="flex items-center gap-1.5 mt-1.5 px-1 text-xs text-rose-500 font-medium animate-slide-down"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.titulo}</span>
            </div>
          )}
        </div>

        {/* Seletor de Prioridade */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 px-1">
            Nível de Prioridade <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Nível de Prioridade">
            {priorityOptions.map((opt) => {
              const isSelected = prioridade === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`priority-btn-${opt.value}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isSubmitting}
                  onClick={() => setPrioridade(opt.value)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected ? opt.activeClasses : opt.inactiveClasses
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="w-2 h-2 rounded-full bg-white/80" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Expansão para Detalhes Opcionais */}
        <div className="pt-1">
          <button
            type="button"
            id="toggle-optional-fields-btn"
            onClick={() => setShowOptionalFields((prev) => !prev)}
            aria-expanded={showOptionalFields}
            className="flex items-center gap-1.5 text-xs text-[#0284c7] dark:text-[#38bdf8] font-bold hover:underline cursor-pointer py-1"
          >
            {showOptionalFields ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>
              {showOptionalFields
                ? 'Menos opções'
                : '+ Adicionar descrição, categoria ou prazo'}
            </span>
          </button>
        </div>

        {/* Campos Opcionais */}
        {showOptionalFields && (
          <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 animate-slide-down">
            {/* Descrição Opcional */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label
                  htmlFor="task-description-input"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>Descrição</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {descricao.length}/500
                </span>
              </div>
              <textarea
                id="task-description-input"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes ou anotações..."
                disabled={isSubmitting}
                rows={2}
                className="w-full bg-[#f8fdfd] dark:bg-[#0c1826] border border-[#d8f0f3] dark:border-[#1e334a] rounded-2xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 text-sm outline-none transition-all duration-200 focus:border-[#2ad0ca] focus:ring-2 focus:ring-cyan-400/20 resize-none"
                maxLength={500}
              />
            </div>

            {/* Grid Categoria e Data Limite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Categoria */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <label
                    htmlFor="task-category-input"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Categoria</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {categoria.length}/30
                  </span>
                </div>
                <input
                  id="task-category-input"
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex.: Finanças, Design, Pessoal..."
                  disabled={isSubmitting}
                  className="w-full bg-[#f8fdfd] dark:bg-[#0c1826] border border-[#d8f0f3] dark:border-[#1e334a] rounded-2xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 text-sm outline-none transition-all duration-200 focus:border-[#2ad0ca] focus:ring-2 focus:ring-cyan-400/20"
                  maxLength={30}
                />
              </div>

              {/* Data Limite */}
              <div>
                <label
                  htmlFor="task-due-date-input"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 px-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Data Limite</span>
                </label>
                <input
                  id="task-due-date-input"
                  type="date"
                  value={dataLimite}
                  onChange={handleDataLimiteChange}
                  disabled={isSubmitting}
                  className={`w-full bg-[#f8fdfd] dark:bg-[#0c1826] border rounded-2xl px-4 py-2 text-slate-800 dark:text-white text-sm outline-none transition-all duration-200 cursor-pointer ${
                    errors.dataLimite
                      ? 'border-rose-400 ring-2 ring-rose-200'
                      : 'border-[#d8f0f3] dark:border-[#1e334a] focus:border-[#2ad0ca]'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Botão Principal Cadastrar */}
        <button
          id="btn-add-task"
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-2 py-3.5 px-6 rounded-2xl text-white font-extrabold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-cyan-400/30 hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer gradient-cyan-sky ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Gravando no Firestore...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Tarefa</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
