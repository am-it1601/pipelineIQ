'use client';
import { AppSidebar } from "@/components/app-sidebar";
import Topbar from '@/components/layout/Topbar';
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <div className="flex flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>

    </SidebarProvider >
  );
}
