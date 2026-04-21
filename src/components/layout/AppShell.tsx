"use client";
import { AppSidebar } from "@/components/app-sidebar";
import Topbar from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider className="h-screen max-w-screen overflow-hidden">
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-0 rounded-4xl!">
                <Topbar />
                <div className="content-area-scroll rounded-b-4xl">
                    <div className="content-area-container">
                        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading</div>}>
                            {children}
                        </Suspense>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
