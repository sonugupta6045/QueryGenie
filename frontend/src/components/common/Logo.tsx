import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

interface LogoProps {
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ showSubtitle = true, size = 'md', className = '' }: LogoProps) {
  const containerSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <div
        className={`${containerSizes[size]} bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200`}
      >
        <Database className={`${iconSizes[size]} text-white`} />
      </div>
      <div className="flex flex-col text-left">
        <span
          className={`${textSizes[size]} font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-tight`}
        >
          QueryGenie
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-semibold text-indigo-400 -mt-1 tracking-wider uppercase">
            AI SQL Engine
          </span>
        )}
      </div>
    </Link>
  );
}
