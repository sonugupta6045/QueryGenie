import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  children,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed';

  const widthStyles = fullWidth ? 'w-full' : '';

  const variantStyles = {
    primary:
      'py-3 px-4 text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01]',
    secondary:
      'py-3 px-4 text-sm text-slate-200 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:border-slate-700 hover:text-white',
    ghost:
      'py-2 px-4 text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60',
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${widthStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
