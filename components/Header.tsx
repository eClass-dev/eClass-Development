import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  onNavigate: (view: 'upload' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onNavigate }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('upload')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="w-10 h-10 stroke-emerald-600 dark:stroke-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                eClass
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Created by students, for students
              </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('analytics')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Analytics
            </button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
  );
};