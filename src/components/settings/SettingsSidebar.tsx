"use client";

/**
 * Settings Sidebar — Client Component
 *
 * Persistent navigation sidebar for the settings area.
 * Uses pathname-based active state highlighting.
 */

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ArrowLeft, Code2, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================================
// Navigation Config
// ============================================================

interface SettingsNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

interface SettingsNavGroup {
  label: string;
  items: SettingsNavItem[];
}

const settingsNav: SettingsNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "General Settings",
        href: "/settings/general",
        icon: <Settings className="size-4" />,
        description: "App preferences and configuration",
      },
    ],
  },
  {
    label: "Access Management",
    items: [
      {
        title: "Users",
        href: "/settings/users",
        icon: <Users className="size-4" />,
        description: "Manage users and invitations",
      },
      {
        title: "Groups",
        href: "/settings/groups",
        icon: <ShieldCheck className="size-4" />,
        description: "Roles, groups, and permissions",
      },
    ],
  },
  {
    label: "Advanced",
    items: [
      {
        title: "Developer Space",
        href: "/settings/developer",
        icon: <Code2 className="size-4" />,
        description: "API keys, webhooks, and logs",
      },
    ],
  },
];

// ============================================================
// Component
// ============================================================

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="hidden md:flex rounded-4xl shadow">
      {/* Header */}
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="icon" className="size-7 shrink-0" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Settings</h2>
        </div>
        <p className="text-xs text-muted-foreground pl-9">Manage your workspace preferences</p>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation Groups */}
      <SidebarContent className="sb-content">
        {settingsNav.map((group) => (
          <SidebarGroup key={group.label} className="sb-group">
            <SidebarGroupLabel className="sb-group_label">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.description}
                        className="sb-menu__btn"
                        asChild
                      >
                        <Link href={item.href}>
                          <span
                            className={isActive ? "text-sidebar-primary" : "text-muted-foreground"}
                          >
                            {item.icon}
                          </span>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
