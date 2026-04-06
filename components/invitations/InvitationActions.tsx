'use client';

import type { InvitationStatus } from '@/lib/types';
import { Loader2, Send, Undo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface InvitationActionsProps {
  invitationId: string;
  status: InvitationStatus;
}

export default function InvitationActions({
  invitationId,
  status,
}: InvitationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canResend = status === 'pending' || status === 'expired';
  const canRevoke = status === 'pending';

  if (status === 'accepted' || status === 'revoked') {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const handleAction = (action: 'resend' | 'revoke') => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/invitations/${invitationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? `Failed to ${action} invitation`);
          return;
        }

        toast.success(
          action === 'resend'
            ? 'Invitation resent successfully'
            : 'Invitation revoked successfully'
        );
        router.refresh();
      } catch {
        toast.error(`Failed to ${action} invitation`);
      }
    });
  };

  return (
    <TooltipProvider delay={300}>
      <div className="flex gap-2">
        {canResend && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0 text-primary"
                  disabled={isPending}
                  onClick={() => handleAction('resend')}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              }
            />
            <TooltipContent>Resend Invitation</TooltipContent>
          </Tooltip>
        )}

        {canRevoke && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0 text-destructive"
                  disabled={isPending}
                  onClick={() => handleAction('revoke')}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Undo className="h-4 w-4" />
                  )}
                </Button>
              }
            />
            <TooltipContent>Revoke Invitation</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
