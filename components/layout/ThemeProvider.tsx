'use client';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

/** Applies data-theme="dark"|"light" to <html> based on Zustand store */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
