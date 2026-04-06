import { Card, CardContent } from '@/components/ui/card';
import { Clock, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function InviteExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <Card className="border-destructive/20">
          <CardContent className="pt-8 pb-8">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Clock className="h-8 w-8 text-destructive" />
            </div>

            <h1 className="mb-2 text-xl font-bold tracking-tight">
              Invitation Link Expired
            </h1>

            <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
              This invitation link is no longer valid. It may have expired or already been
              used. Please contact your administrator to request a new invitation.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Go to Login
              </Link>
            </div>

            {/* Help text */}
            <p className="mt-6 text-xs text-muted-foreground">
              If you believe this is an error, please reach out to your team admin
              to have the invitation re-sent.
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Maverics IT Services. All rights reserved.
        </p>
      </div>
    </div>
  );
}
