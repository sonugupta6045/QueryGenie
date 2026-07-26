import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl border border-gray-300 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
