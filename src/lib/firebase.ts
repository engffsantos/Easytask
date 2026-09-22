import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Inicializa o Cloud Firestore com forceLongPolling para garantir conectividade estável
// em ambientes de contêiner, iframes do AI Studio e redes com proxies restritivos,
// eliminando erros de conexão indisponível ('unavailable' / could not reach backend)
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Força a seleção de conta para facilitar testes e troca de usuário
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Inicia o fluxo de autenticação com o Google via Popup
 */
export async function loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    await signInWithPopup(auth, googleProvider);
    return { success: true };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = (error as { code: string }).code;
      if (code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'A janela do Google foi fechada antes da conclusão do login.',
        };
      }
      if (code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Operação de login cancelada.' };
      }
      if (code === 'auth/popup-blocked') {
        return {
          success: false,
          error:
            'A janela de login foi bloqueada pelo navegador. Permita popups para este endereço.',
        };
      }
    }
    return {
      success: false,
      error: 'Não foi possível autenticar com o Google. Tente novamente.',
    };
  }
}

/**
 * Encerra a sessão do usuário atual
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    await signOut(auth);
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Ocorreu um erro ao tentar sair da sua conta.',
    };
  }
}

/**
 * Tipos de operação para auditoria de erros no Firestore
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

/**
 * Converte códigos de erro do Firestore em mensagens claras em português
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'permission-denied':
        return 'Permissão negada. Você só pode visualizar e gerenciar as suas próprias tarefas.';
      case 'unauthenticated':
        return 'Sua sessão expirou ou não é válida. Faça login novamente para continuar.';
      case 'unavailable':
        return 'O serviço do Firestore está temporariamente indisponível. Verifique sua conexão com a internet.';
      case 'not-found':
        return 'A tarefa solicitada não foi encontrada na nuvem.';
      case 'already-exists':
        return 'Esta tarefa já existe no banco de dados.';
      case 'cancelled':
        return 'A operação foi cancelada.';
      default:
        return 'Ocorreu um erro na comunicação com o banco de dados.';
    }
  }
  return 'Ocorreu um erro inesperado ao salvar ou carregar os dados.';
}
