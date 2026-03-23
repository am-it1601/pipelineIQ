import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/layout/ThemeProvider';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Maverics BD Dashboard',
  description: 'Business Development KPI tracking platform for Maverics IT Services',
};

// Script runs synchronously before React hydration — sets data-theme from localStorage
// to avoid flash of wrong theme on first paint.
const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('bd-theme');
    var theme = stored ? JSON.parse(stored).state.theme : 'dark';
    document.documentElement.setAttribute('data-theme', theme || 'dark');
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        {/* Blocking theme script — must be before any paint */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
