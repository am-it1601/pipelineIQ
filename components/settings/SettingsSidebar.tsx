"use client";

/**
 * Settings Sidebar — Client Component
 *
 * Persistent navigation sidebar for the settings area.
 * Uses pathname-based active state highlighting.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import {
  Settings,
  Users,
  ShieldCheck,
  Code2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Sidebar collapsible="none" className="hidden md:flex border-r bg-sidebar">
      {/* Header */}
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Settings
          </h2>
        </div>
        <p className="text-xs text-muted-foreground pl-9">
          Manage your workspace preferences
        </p>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation Groups */}
      <SidebarContent className="px-2 py-2">
        {settingsNav.map((group) => (
          <SidebarGroup key={group.label} className="px-0 py-1">
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.description}
                        className="h-9 gap-3 px-3 font-medium"
                        render={<Link href={item.href} />}
                      >
                        <span className={isActive ? "text-sidebar-primary" : "text-muted-foreground"}>
                          {item.icon}
                        </span>
                        <span>{item.title}</span>
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
