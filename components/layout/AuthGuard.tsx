'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Wait for client-side hydration and auth loading to complete
    if (isClient && !isLoading && !currentUser && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isClient, isLoading, currentUser, pathname, router]);

  // Show loading state while auth is being checked
  if (!isClient || isLoading || !currentUser) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div className="pulse-glow" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.2)' }} />
      </div>
    );
  }

  return <>{children}</>;
}
