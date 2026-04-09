"use client";

import { useAuthStore } from "@/store/authStore";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ChartPieIcon,
  FlagIcon,
  FunnelIcon,
  LayoutDashboardIcon,
  Table2Icon,
  TagIcon,
  TerminalIcon,
  Users2Icon,
} from "lucide-react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
    {
      title: "Leads",
      icon: <FunnelIcon />,
      items: [
        {
          title: "Hot Leads",
          url: "/leads",
          icon: <Table2Icon />,
        },

        {
          title: "Leads Log Entry",
          url: "/leads",
          icon: <Table2Icon />,
        },
      ],
    },
    {
      title: "Team Roaster",
      url: "/roaster",
      icon: <Users2Icon />,
    },
    {
      title: "Upwork Profiles",
      url: "/profiles",
      icon: <TagIcon />,
    },
  ],
  projects: [
    {
      name: "Sales Pipeline Analytics",
      url: "/analytics",
      icon: <ChartPieIcon />,
    },
    {
      name: "Reports",
      url: "#",
      icon: <FlagIcon />,
    },
  ],
};
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
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Maverics IT</span>
                <span className="truncate text-xs">BD Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
