import { useAuthStore } from '@/store/authStore';
import type { User } from '@/lib/types';

export function useAuth(): User | null {
  return useAuthStore((s) => s.currentUser) || null;
}
