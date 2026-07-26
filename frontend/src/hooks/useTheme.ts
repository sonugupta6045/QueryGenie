import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const currentAttr = document.documentElement.getAttribute('data-theme') as Theme | null;
    if (currentAttr && currentAttr !== theme) {
      setTheme(currentAttr);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';

    const applyChange = () => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      setTheme(nextTheme);
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(applyChange);
    } else {
      applyChange();
    }
  }, [theme]);

  return { theme, toggleTheme };
}
