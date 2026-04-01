import { clsx, type ClassValue } from "clsx";
import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format, parseISO,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subMonths, subQuarters,
  subWeeks
} from 'date-fns';
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}
export function getWeekLabel(dateStr: string): string {
  return format(startOfWeek(parseISO(dateStr), { weekStartsOn: 1 }), 'MMM d');
}
export function getMonthKey(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy-MM');
}
export function getMonthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMM yyyy');
}
export function getWeekKey(dateStr: string): string {
  return format(startOfWeek(parseISO(dateStr), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}
export function getCurrentWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}
export function getCurrentMonthKey(): string {
  return format(startOfMonth(new Date()), 'yyyy-MM');
}
export function generateId(): string {
  return `l${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
export type DatePreset =
  | 'current_week' | 'last_week'
  | 'this_month' | 'last_month'
  | 'this_quarter' | 'last_quarter'
  | 'last_6_months' | 'this_year'
  | 'custom';
export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'current_week', label: 'Current Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'custom', label: 'Custom Range' },
];
const ISO = (d: Date) => format(d, 'yyyy-MM-dd');
export function getDateRange(preset: DatePreset, customFrom?: string, customTo?: string): { from: string; to: string } {
  const now = new Date();
  switch (preset) {
    case 'current_week':
      return { from: ISO(startOfWeek(now, { weekStartsOn: 1 })), to: ISO(endOfWeek(now, { weekStartsOn: 1 })) };
    case 'last_week': {
      const lw = subWeeks(now, 1);
      return { from: ISO(startOfWeek(lw, { weekStartsOn: 1 })), to: ISO(endOfWeek(lw, { weekStartsOn: 1 })) };
    }
    case 'this_month':
      return { from: ISO(startOfMonth(now)), to: ISO(endOfMonth(now)) };
    case 'last_month': {
      const lm = subMonths(now, 1);
      return { from: ISO(startOfMonth(lm)), to: ISO(endOfMonth(lm)) };
    }
    case 'this_quarter':
      return { from: ISO(startOfQuarter(now)), to: ISO(endOfQuarter(now)) };
    case 'last_quarter': {
      const lq = subQuarters(now, 1);
      return { from: ISO(startOfQuarter(lq)), to: ISO(endOfQuarter(lq)) };
    }
    case 'last_6_months':
      return { from: ISO(subMonths(now, 6)), to: ISO(now) };
    case 'this_year':
      return { from: ISO(startOfYear(now)), to: ISO(endOfYear(now)) };
    case 'custom':
      return { from: customFrom ?? ISO(startOfMonth(now)), to: customTo ?? ISO(now) };
  }
}
export function filterLeadsByDate<T extends { date: string }>(leads: T[], from: string, to: string): T[] {
  return leads.filter((l) => l.date >= from && l.date <= to);
}


export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};