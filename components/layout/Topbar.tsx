"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Lead Log",
  "/members": "BD Members",
  "/profiles": "Upwork Profiles",
  "/analytics": "Analytics",
};

export default function Topbar() {
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { setTheme } = useTheme();

  const title =
    Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "Dashboard";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__left">
          <SidebarTrigger className="topbar__trigger" />

          <div className="topbar__title-wrap">
            <h1 className="topbar__title">{title}</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
        </div>

        <div className="topbar__right">
          <Badge className="topbar__role-badge" variant="secondary">
            {currentUser?.role ?? "Guest"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="topbar__icon-btn">
                <Sun className="topbar__theme-icon topbar__theme-icon--sun" />
                <Moon className="topbar__theme-icon topbar__theme-icon--moon" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            className={cn(
              "topbar__avatar",
              currentUser?.role === "admin" ? "topbar__avatar--admin" : "topbar__avatar--default"
            )}
          >
            {currentUser?.avatar_initials}
          </div>
        </div>
      </div>
    </header>
  );
}
