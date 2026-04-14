"use client";

import { useAuthStore } from "@/store/authStore";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ArchiveIcon,
  BriefcaseBusinessIcon,
  ChartNoAxesCombinedIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  SpotlightIcon,
  TerminalIcon,
} from "lucide-react";
import Link from "next/link";

const nav_main = [
  {
    icon: LayoutDashboardIcon,
    name: "Dashboard",
    href: "/dashboard",
  },
];

const nav_lead_management = [
  {
    icon: SparklesIcon,
    name: "Prospects Watchlist",
    href: "/leads",
  },

  {
    icon: BriefcaseBusinessIcon,
    name: "Active Prospects",
    href: "/leads",
  },
  {
    icon: ArchiveIcon,
    name: "Archive",
    href: "/leads",
  },
];

const nav_profiles = [
  {
    icon: SpotlightIcon,
    name: "Profiles",
    href: "/profiles",
  },
];

const nav_reports = [
  {
    icon: ChartNoAxesCombinedIcon,
    name: "Analytics",
    href: "/analytics",
  },
];
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useAuthStore((s) => s.currentUser);

  const user = {
    name: currentUser?.full_name ?? "Guest",
    email: currentUser?.email ?? "",
    avatar: "",
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Maverics IT</span>
                  <span className="truncate text-xs">BD Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="sb-content">
        {/* Dashboard */}
        <SidebarGroup className="sb-group">
          <SidebarGroupLabel className="sb-group_label">Home</SidebarGroupLabel>
          {nav_main && nav_main.length > 0 && (
            <SidebarMenu>
              {nav_main.map((menu) => (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={menu.name} className="sb-menu__btn">
                    <Link href={menu.href}>
                      <span className="text-muted-foreground">{menu.icon && <menu.icon />}</span>
                      <span>{menu.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
        {/* Lead Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="sb-group_label">Lead Management</SidebarGroupLabel>
          {nav_lead_management && nav_lead_management.length > 0 && (
            <SidebarMenu>
              {nav_lead_management.map((menu) => (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={menu.name} className="sb-menu__btn">
                    <Link href={menu.href}>
                      <span className="text-muted-foreground">{menu.icon && <menu.icon />}</span>
                      <span>{menu.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
        <SidebarGroup className="sb-group">
          <SidebarGroupLabel className="sb-group_label">Profile Management</SidebarGroupLabel>
          {nav_profiles && nav_profiles.length > 0 && (
            <SidebarMenu>
              {nav_profiles.map((menu) => (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={menu.name} className="sb-menu__btn">
                    <Link href={menu.href}>
                      <span className="text-muted-foreground">{menu.icon && <menu.icon />}</span>
                      <span>{menu.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="sb-group_label">Reports & Analytics</SidebarGroupLabel>
          {nav_reports && nav_reports.length > 0 && (
            <SidebarMenu>
              {nav_reports.map((menu) => (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={menu.name} className="sb-menu__btn">
                    <Link href={menu.href}>
                      <span className="text-muted-foreground">{menu.icon && <menu.icon />}</span>
                      <span>{menu.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
