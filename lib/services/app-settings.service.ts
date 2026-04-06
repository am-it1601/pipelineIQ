import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppSetting } from '@/lib/types';

// ============================================================
// GENERIC HELPERS
// ============================================================

/**
 * Reads a single setting value by key. Returns null if not found.
 */
export async function getSetting(
  supabase: SupabaseClient,
  key: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) return null;
  return (data as AppSetting).value;
}

/**
 * Updates a setting value. Requires admin client.
 */
export async function updateSetting(
  supabase: SupabaseClient,
  key: string,
  value: string
): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .update({ value })
    .eq('key', key);

  if (error) throw new Error(`Failed to update setting "${key}": ${error.message}`);
}

// ============================================================
// TYPED HELPERS — INVITATION EXPIRY
// ============================================================

/**
 * Returns the configured invitation expiry in days (default: 30).
 */
export async function getInvitationExpiryDays(supabase: SupabaseClient): Promise<number> {
  const raw = await getSetting(supabase, 'invitation_expiry_days');
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return isNaN(parsed) ? 30 : parsed;
}

/**
 * Updates the invitation expiry days. Requires admin client.
 */
export async function updateInvitationExpiryDays(
  supabase: SupabaseClient,
  days: number
): Promise<void> {
  if (days < 1 || days > 365) {
    throw new Error('Expiry days must be between 1 and 365');
  }
  await updateSetting(supabase, 'invitation_expiry_days', String(days));
}
