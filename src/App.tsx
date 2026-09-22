import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  deleteField,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  db,
  auth,
  loginWithGoogle,
  logoutUser,
  getFriendlyErrorMessage,
} from './lib/firebase';
import { Task, Priority, TaskStatus, UserProfile, Subtask } from './types';
import { Header } from './components/Header';
import { CalendarStrip } from './components/CalendarStrip';
import { TaskSummary } from './components/TaskSummary';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { EditTaskModal } from './components/EditTaskModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { BreakdownModal } from './components/BreakdownModal';
import { LoginCallout } from './components/LoginCallout';
import { requestTaskBreakdown } from './services/aiBreakdownService';
import { Loader2, Plus, Sparkles } from 'lucide-react';

const THEME_STORAGE_KEY = 'easytask_theme_pref';

export default function App() {
  // Estado de Autenticação
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Estado das Tarefas Privadas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filtro por Data do Calendário (Mini Calendário estilo Screen 2)
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // Estados de Operações Assíncronas
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdatingModal, setIsUpdatingModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Estados específicos para "Quebrar tarefa com IA"
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);
  const [isBreakingDown, setIsBreakingDown] = useState<boolean>(false);
  const [isSavingSubtasks, setIsSavingSubtasks] = useState<boolean>(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<Subtask[]>([]);

  // Controle de exibição do formulário / scroll
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sincronizar tema no elemento raiz e no localStorage
  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
      }
    } catch {
      // Ignora erro de storage
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // 1. Observar estado de autenticação (onAuthStateChanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
        setAuthError(null);
      } else {
        setCurrentUser(null);
        setTasks([]); // Limpa os dados privados da memória ao sair
        setEditingTask(null);
        setDeletingTask(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. READ: Consulta isolada por usuário via Firestore (where('userId', '==', currentUser.uid))
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    setIsLoadingTasks(true);
    setReadError(null);

    const tarefasCollection = collection(db, 'tarefas');
    const userTasksQuery = query(
      tarefasCollection,
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      userTasksQuery,
      (snapshot) => {
        const loadedTasks: Task[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            titulo: data.titulo || '',
            descricao: data.descricao,
            prioridade: (data.prioridade as Priority) || 'media',
            categoria: data.categoria,
            dataLimite: data.dataLimite,
            status: (data.status as TaskStatus) || 'pendente',
            subtarefas: Array.isArray(data.subtarefas) ? data.subtarefas : undefined,
            userId: data.userId || currentUser.uid,
            criadoEm: typeof data.criadoEm === 'number' ? data.criadoEm : Date.now(),
          };
        });

        // Ordenação cronológica decrescente dos dados do usuário
        loadedTasks.sort((a, b) => b.criadoEm - a.criadoEm);

        setTasks(loadedTasks);
        setIsLoadingTasks(false);
        setReadError(null);
      },
      (error) => {
        console.error('Erro ao ler tarefas do Firestore:', error);
        setReadError(getFriendlyErrorMessage(error));
        setIsLoadingTasks(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Ação de Login com Google
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    const result = await loginWithGoogle();
    if (!result.success && result.error) {
      setAuthError(result.error);
    }
    setIsLoggingIn(false);
  };

  // Ação de Logout
  const handleLogout = async () => {
    await logoutUser();
  };

  // 3. CREATE: Cadastrar nova tarefa com vínculo obrigatório de userId
  const handleAddTask = async (data: {
    titulo: string;
    prioridade: Priority;
    descricao?: string;
    dataLimite?: string;
    categoria?: string;
  }): Promise<boolean> => {
    if (!currentUser) {
      setSubmitError('Você precisa estar autenticado para criar uma tarefa.');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const docData: {
        titulo: string;
        prioridade: Priority;
        status: TaskStatus;
        userId: string;
        criadoEm: number;
        descricao?: string;
        categoria?: string;
        dataLimite?: string;
      } = {
        titulo: data.titulo,
        prioridade: data.prioridade,
        status: 'pendente',
        userId: currentUser.uid,
        criadoEm: Date.now(),
      };

      if (data.descricao) docData.descricao = data.descricao;
      if (data.categoria) docData.categoria = data.categoria;
      if (data.dataLimite) docData.dataLimite = data.dataLimite;

      await addDoc(collection(db, 'tarefas'), docData);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar tarefa no Firestore:', error);
      setSubmitError(getFriendlyErrorMessage(error));
      setIsSubmitting(false);
      return false;
    }
  };

  // 4. UPDATE: Alternar status entre 'pendente' e 'concluida'
  const handleToggleComplete = async (id: string) => {
    if (!currentUser) return;
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask) return;

    setUpdatingTaskId(id);
    const newStatus: TaskStatus =
      currentTask.status === 'pendente' ? 'concluida' : 'pendente';

    try {
      const taskRef = doc(db, 'tarefas', id);
      await updateDoc(taskRef, {
        status: newStatus,
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      alert(getFriendlyErrorMessage(error));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // 5. UPDATE: Abrir modal de edição
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
  };

  // 6. UPDATE: Salvar alterações mantendo imutável o proprietário original (userId)
  const handleSaveEditedTask = async (updatedTask: Task): Promise<boolean> => {
    if (!currentUser) return false;
    setIsUpdatingModal(true);

    try {
      const taskRef = doc(db, 'tarefas', updatedTask.id);
      const payload: Record<string, unknown> = {
        titulo: updatedTask.titulo,
        prioridade: updatedTask.prioridade,
        descricao: updatedTask.descricao ? updatedTask.descricao : deleteField(),
        categoria: updatedTask.categoria ? updatedTask.categoria : deleteField(),
        dataLimite: updatedTask.dataLimite ? updatedTask.dataLimite : deleteField(),
      };

      await updateDoc(taskRef, payload);
      setIsUpdatingModal(false);
      setEditingTask(null);
      return true;
    } catch (error) {
      console.error('Erro ao salvar alterações no Firestore:', error);
      setIsUpdatingModal(false);
      return false;
    }
  };

  // 7. DELETE: Iniciar processo de exclusão segura
  const handleRequestDelete = (task: Task) => {
    setDeletingTask(task);
  };

  // 8. DELETE: Confirmar e excluir somente pelo proprietário
  const handleConfirmDelete = async () => {
    if (!deletingTask || !currentUser) return;

    setIsDeleting(true);
    try {
      const taskRef = doc(db, 'tarefas', deletingTask.id);
      await deleteDoc(taskRef);
      setDeletingTask(null);
    } catch (error) {
      console.error('Erro ao excluir tarefa do Firestore:', error);
      alert(getFriendlyErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  // 9. AI BREAKDOWN: Iniciar quebra de tarefa com IA
  const handleStartBreakdown = async (task: Task) => {
    if (!currentUser) {
      alert('Você precisa estar autenticado para usar a quebra de tarefa com IA.');
      return;
    }

    setBreakdownTask(task);
    setSuggestedSubtasks([]);
    setBreakdownError(null);
    setIsBreakingDown(true);

    const result = await requestTaskBreakdown(task.titulo, task.descricao);
    setIsBreakingDown(false);

    if (result.success && result.subtasks) {
      setSuggestedSubtasks(result.subtasks);
    } else {
      setBreakdownError(result.error || 'Não foi possível gerar as subtarefas.');
    }
  };

  // 10. AI BREAKDOWN: Tentar novamente
  const handleRetryBreakdown = async () => {
    if (!breakdownTask) return;
    setBreakdownError(null);
    setIsBreakingDown(true);

    const result = await requestTaskBreakdown(breakdownTask.titulo, breakdownTask.descricao);
    setIsBreakingDown(false);

    if (result.success && result.subtasks) {
      setSuggestedSubtasks(result.subtasks);
    } else {
      setBreakdownError(result.error || 'Não foi possível gerar as subtarefas.');
    }
  };

  // 11. AI BREAKDOWN: Confirmar e persistir no Firestore
  const handleConfirmBreakdown = async (selectedSubtasks: Subtask[]) => {
    if (!breakdownTask || !currentUser) return;

    setIsSavingSubtasks(true);
    try {
      const taskRef = doc(db, 'tarefas', breakdownTask.id);
      // Mescla com subtarefas existentes se houver
      const existing = breakdownTask.subtarefas || [];
      const mergedSubtasks = [...existing, ...selectedSubtasks];

      await updateDoc(taskRef, {
        subtarefas: mergedSubtasks,
      });

      setBreakdownTask(null);
      setSuggestedSubtasks([]);
    } catch (error) {
      console.error('Erro ao salvar subtarefas no Firestore:', error);
      alert(getFriendlyErrorMessage(error));
    } finally {
      setIsSavingSubtasks(false);
    }
  };

  // 12. SUBTASK: Alternar conclusão de uma subtarefa individual
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    if (!currentUser) return;
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || !targetTask.subtarefas) return;

    const updatedList = targetTask.subtarefas.map((sub) =>
      sub.id === subtaskId ? { ...sub, concluida: !sub.concluida } : sub
    );

    try {
      const taskRef = doc(db, 'tarefas', taskId);
      await updateDoc(taskRef, {
        subtarefas: updatedList,
      });
    } catch (error) {
      console.error('Erro ao atualizar status da subtarefa:', error);
    }
  };

  const handleScrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = document.getElementById('task-title-input');
      if (input) input.focus();
    }
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'concluida').length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-[#eef8f9] dark:bg-[#0b1320] text-slate-800 dark:text-slate-100 flex flex-col items-center py-5 sm:py-8 px-3 sm:px-6 lg:px-8 selection:bg-cyan-200 dark:selection:bg-cyan-900 transition-colors duration-300">
      <main className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl space-y-6 sm:space-y-7 pb-16">
        {/* Cabeçalho estilo Tela 2: Saudação personalizada, avatar com anel gradiente e alternador de tema */}
        <Header
          isDark={isDark}
          onToggleTheme={toggleTheme}
          user={currentUser}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          isLoggingIn={isLoggingIn}
        />

        {/* Estado 1: Carregando a autenticação inicial */}
        {isAuthLoading ? (
          <div
            id="auth-loading-state"
            className="bg-white dark:bg-[#132032] rounded-[32px] p-12 text-center flex flex-col items-center justify-center border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow"
          >
            <div className="w-12 h-12 rounded-full gradient-cyan-sky text-white flex items-center justify-center mb-3 shadow-md shadow-cyan-400/30">
              <Loader2 className="w-6 h-6 animate-spin stroke-[2.5]" />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">
              Verificando sua conta...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Preparando seu ambiente seguro
            </p>
          </div>
        ) : !currentUser ? (
          /* Estado 2: Visitante não autenticado (Card de entrada com a arte e gradientes da Tela 1) */
          <LoginCallout
            onLogin={handleGoogleLogin}
            isLoggingIn={isLoggingIn}
            errorMessage={authError}
          />
        ) : (
          /* Estado 3: Usuário autenticado (Interface inspirada nas Telas 2 e 3) */
          <>
            {/* Mini Calendário Horizontal (Horizontal Days Bar) inspirado na Tela 2 */}
            <section aria-label="Calendário semanal">
              <CalendarStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </section>

            {/* Resumo de Desempenho e Metas (Inspirado no "Task Result" da Tela 3) */}
            <TaskSummary
              total={totalCount}
              pending={pendingCount}
              completed={completedCount}
            />

            {/* Formulário de Criação de Tarefa com Gradientes e Bordas Arredondadas */}
            <section
              id="form-section"
              ref={formSectionRef}
              aria-label="Cadastrar nova tarefa"
            >
              <TaskForm
                onAddTask={handleAddTask}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            </section>

            {/* Lista e Filtros de Tarefas Diárias ("Daily Watch") */}
            <section id="list-section" aria-label="Lista de tarefas">
              <TaskList
                tasks={tasks}
                isLoading={isLoadingTasks}
                readError={readError}
                updatingTaskId={updatingTaskId}
                selectedDate={selectedDate}
                onClearDateFilter={() => setSelectedDate('all')}
                onOpenCreateModal={handleScrollToForm}
                onRetry={() => {}}
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEdit}
                onDelete={handleRequestDelete}
                onBreakdown={handleStartBreakdown}
                onToggleSubtask={handleToggleSubtask}
              />
            </section>
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) Mobile-first para adicionar nova tarefa rapidamente */}
      {currentUser && (
        <aside aria-label="Ação rápida">
          <button
            type="button"
            onClick={handleScrollToForm}
            title="Adicionar nova tarefa"
            aria-label="Adicionar nova tarefa"
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-cyan-sky text-white flex items-center justify-center shadow-xl shadow-cyan-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-[#132032]"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </aside>
      )}

      {/* Rodapé Moderno */}
      <footer className="mt-auto pt-6 pb-4 flex flex-col items-center gap-2">
        {currentUser ? (
          <div className="px-4 py-2 bg-white/80 dark:bg-[#132032]/80 rounded-full border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow backdrop-blur-xs flex items-center gap-2.5">
            <span
              className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"
              title="Sessão autenticada e protegida"
            />
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {pendingCount === 1
                ? '01 tarefa pendente'
                : `${String(pendingCount).padStart(2, '0')} tarefas pendentes`}
            </p>
          </div>
        ) : (
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            EasyTask Cloud • Organizador Pessoal
          </p>
        )}
      </footer>

      {/* Modal de Edição de Tarefa (UPDATE) */}
      <EditTaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        isSubmitting={isUpdatingModal}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditedTask}
      />

      {/* Modal de Confirmação de Exclusão (DELETE) */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingTask)}
        taskTitle={deletingTask?.titulo || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTask(null)}
      />

      {/* Modal de Quebrar Tarefa com IA */}
      {breakdownTask && (
        <BreakdownModal
          task={breakdownTask}
          isOpen={Boolean(breakdownTask)}
          isLoading={isBreakingDown}
          isSaving={isSavingSubtasks}
          error={breakdownError}
          suggestedSubtasks={suggestedSubtasks}
          onClose={() => {
            if (!isSavingSubtasks) {
              setBreakdownTask(null);
              setSuggestedSubtasks([]);
              setBreakdownError(null);
            }
          }}
          onRetry={handleRetryBreakdown}
          onConfirm={handleConfirmBreakdown}
        />
      )}
    </div>
  );
}
