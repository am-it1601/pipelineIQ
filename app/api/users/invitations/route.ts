/**
 * GET  /api/users/invitations — List pending invitations
 * POST /api/users/invitations — Send a new invitation (alias for POST /api/users)
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { listInvitations, inviteUser } from '@/lib/auth/services/admin-user.service';
import { paginationSchema, inviteUserSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('users:list');

    const { searchParams } = new URL(request.url);
    const params = paginationSchema.parse({
      page: searchParams.get('page') ?? undefined,
      perPage: searchParams.get('perPage') ?? undefined,
    });

    const result = await listInvitations(params);

    return apiSuccess(result.users, {
      page: result.page,
      perPage: result.perPage,
      total: result.total,
      lastPage: result.lastPage,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePermission('users:invite');

    const body = await request.json();
    const validated = inviteUserSchema.parse(body);
    const result = await inviteUser({
      ...validated,
      invitedBy: context.userId,
    });

    return apiSuccess(result, undefined, 201);
  } catch (error) {
    return apiError(error);
  }
}
