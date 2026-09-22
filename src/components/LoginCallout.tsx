import React from 'react';
import { ShieldCheck, CheckCircle2, Loader2, AlertCircle, Sparkles, Laptop, Mail, MessageSquare, Settings } from 'lucide-react';

interface LoginCalloutProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  errorMessage?: string | null;
}

export const LoginCallout: React.FC<LoginCalloutProps> = ({
  onLogin,
  isLoggingIn,
  errorMessage = null,
}) => {
  return (
    <div className="w-full flex justify-center py-4 sm:py-8 px-2">
      <div
        id="login-card-container"
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-[#132032] rounded-[36px] overflow-hidden modern-shadow border border-[#d8f0f3] dark:border-[#1e334a] transition-all duration-300 flex flex-col"
      >
        {/* Topo Ilustrado inspirado na Tela 1 da referência visual */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-br from-[#2ad0ca] via-[#0ea5e9] to-[#01b9fe] p-6 flex flex-col items-center justify-end overflow-hidden">
          {/* Elementos flutuantes de fundo */}
          <div className="absolute top-4 left-6 w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white animate-float shadow-sm">
            <Mail className="w-5 h-5" />
          </div>

          <div className="absolute top-8 right-8 w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white animate-float shadow-sm" style={{ animationDelay: '1s' }}>
            <Settings className="w-5 h-5" />
          </div>

          <div className="absolute top-28 right-5 w-12 h-9 rounded-xl bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md flex items-center justify-center text-[#0284c7] shadow-md animate-float" style={{ animationDelay: '1.5s' }}>
            <MessageSquare className="w-4 h-4" />
          </div>

          {/* Círculo com Ilustração de Espaço de Trabalho */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border-4 border-white/40 shadow-inner">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff6b6b] to-[#ffa07a] flex items-center justify-center text-white shadow-md relative">
                <Laptop className="w-12 h-12 text-white" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#2ad0ca] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Curva inferior de transição */}
          <div className="absolute -bottom-1 left-0 right-0 h-6 bg-white dark:bg-[#132032] rounded-t-[32px]" />
        </div>

        {/* Conteúdo Principal do Card */}
        <div className="px-6 sm:px-8 pt-2 pb-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f7f8] dark:bg-[#163348] text-[#0284c7] dark:text-[#38bdf8] text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#2ad0ca]" />
            EasyTask Cloud
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight mb-2">
            Gerencie suas tarefas diárias
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed mb-6">
            Mantenha o foco, organize suas prioridades e acompanhe suas metas em tempo real com segurança na nuvem.
          </p>

          {/* Alerta de Erro caso a tentativa de login falhe */}
          {errorMessage && (
            <div
              id="auth-error-banner"
              className="w-full mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5 text-left animate-slide-down"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botão de Login com o Google estilizado no padrão da referência */}
          <button
            id="btn-google-login-main"
            type="button"
            onClick={onLogin}
            disabled={isLoggingIn}
            className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer gradient-cyan-sky hover:opacity-95 ${
              isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>

          {/* Destaques de Segurança */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 w-full flex flex-col gap-2.5 text-left">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#10b981] flex-shrink-0" />
              <span>Isolamento privado com Cloud Firestore</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-[#0ea5e9] flex-shrink-0" />
              <span>Sincronização em tempo real entre abas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
