import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="w-9 h-9 rounded-full bg-white dark:bg-[#132032] border border-[#d8f0f3] dark:border-[#1e334a] text-slate-500 dark:text-slate-300 hover:text-[#0284c7] dark:hover:text-[#38bdf8] modern-shadow flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/40 active:scale-95"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
};
