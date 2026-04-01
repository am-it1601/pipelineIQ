"use client";
import { AppSidebar } from "@/components/app-sidebar";
import Topbar from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen max-w-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-0">
        <Topbar />
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-8 py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
