import React from 'react';
import { LogOut, LogIn, Loader2, User, Calendar as CalendarIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { getCurrentFormattedDate } from '../utils/date';
import { UserProfile } from '../types';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  user,
  onLogin,
  onLogout,
  isLoggingIn = false,
}) => {
  const { weekday, fullDate } = getCurrentFormattedDate();

  return (
    <header id="app-header" className="w-full space-y-4">
      {/* Barra Superior inspirada na Tela 2 da referência: "Olá, {Nome}" + Avatar + Ações */}
      <div className="w-full flex items-center justify-between gap-3">
        {/* Saudação ao usuário */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {user ? 'Olá,' : 'Bem-vindo ao'}
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
            {user ? user.displayName || 'Usuário' : 'EasyTask'}
          </h1>
        </div>

        {/* Controles: Tema e Perfil / Login */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          {user ? (
            <div className="flex items-center gap-2 bg-white dark:bg-[#132032] p-1 sm:pr-2.5 rounded-full modern-shadow border border-[#d8f0f3] dark:border-[#1e334a]">
              {user.photoURL ? (
                <div className="relative p-0.5 rounded-full gradient-cyan-sky">
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar do usuário'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-[#132032]"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full gradient-cyan-sky text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className="text-left hidden md:block max-w-[120px]">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {user.displayName?.split(' ')[0] || 'Conta'}
                </p>
              </div>

              <button
                id="btn-logout"
                type="button"
                onClick={onLogout}
                title="Sair da conta"
                aria-label="Sair da conta"
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400/30"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-header-login"
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white gradient-cyan-sky hover:opacity-95 transition-all modern-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
                isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Linha com a Data Atual e Ícone de Calendário Estilo 3D */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
        <div className="w-7 h-7 rounded-xl bg-white dark:bg-[#132032] border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow flex items-center justify-center text-[#0284c7] dark:text-[#38bdf8]">
          <CalendarIcon className="w-3.5 h-3.5" />
        </div>
        <span className="capitalize">{weekday}</span>
        <span className="text-slate-400 dark:text-slate-500">•</span>
        <span className="text-slate-500 dark:text-slate-400 font-normal">{fullDate}</span>
      </div>
    </header>
  );
};
