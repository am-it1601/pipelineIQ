/**
 * Upwork Profiles — Hook Barrel Export
 *
 * Single import point for all profile query/mutation hooks.
 *
 * Usage:
 *   import { useProfileList, useCreateProfile, profileKeys } from '@/hooks/profiles';
 */

export { profileKeys } from './profile.keys';
export { useProfileList, useProfileDetail } from './profile.queries';
export { useCreateProfile, useUpdateProfile, useDeleteProfile } from './profile.mutations';
