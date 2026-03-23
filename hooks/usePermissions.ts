'use client';
import { useAuthStore } from '@/store/authStore';
import type { Permission } from '@/lib/types';

const ADMIN_PERMISSIONS: Permission[] = [
  'viewAllLeads',
  'editAnyLead',
  'deleteAnyLead',
  'viewTeamAnalytics',
  'manageBDMembers',
  'manageProfiles',
  'viewComparisons',
  'viewPipelineTeam',
];

export function usePermissions() {
  const user = useAuthStore((s) => s.currentUser);
  const isAdmin = user?.role === 'admin';

  function can(permission: Permission): boolean {
    if (isAdmin) return true;
    return !ADMIN_PERMISSIONS.includes(permission);
  }

  return { can, isAdmin, role: user?.role ?? 'bd' };
}
