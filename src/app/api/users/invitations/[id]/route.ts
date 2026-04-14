/**
 * POST   /api/users/invitations/[id]/resend — Resend invitation
 * DELETE /api/users/invitations/[id] — Revoke invitation (hard delete)
 */

import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/services/authorization.service';
import { resendInvitation, revokeInvitation } from '@/lib/auth/services/admin-user.service';
import { userIdParamSchema } from '@/lib/auth/validation/auth.schemas';
import { apiSuccess, apiError } from '@/lib/auth/utils/api.utils';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('users:invite');

    const { id } = await params;
    const { id: userId } = userIdParamSchema.parse({ id });
    await resendInvitation(userId);

    return apiSuccess({ message: 'Invitation resent' });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('users:delete');

    const { id } = await params;
    const { id: userId } = userIdParamSchema.parse({ id });
    await revokeInvitation(userId);

    return apiSuccess({ message: 'Invitation revoked' });
  } catch (error) {
    return apiError(error);
  }
}
