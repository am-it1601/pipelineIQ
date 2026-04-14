import AppShell from "@/components/layout/AppShell";
import AuthGuard from "@/components/layout/AuthGuard";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
