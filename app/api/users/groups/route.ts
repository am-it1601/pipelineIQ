/**
 * GET /api/users/groups — List all user groups
 */

import { requirePermission } from '@/lib/auth/services/authorization.service';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    await requirePermission('users:list');

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('user_groups')
      .select('id, slug, display_name, description, is_system')
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch groups: ${error.message}`);
    }

    return apiSuccess(data ?? []);
  } catch (error) {
    return apiError(error);
  }
}
