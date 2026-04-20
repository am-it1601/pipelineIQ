"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "../ui/avatar";
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

    const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "Dashboard";

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
                        <DropdownMenuTrigger asChild>
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

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar>
                                <AvatarFallback>{currentUser?.user_metadata.avatar_initials}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto" align="end">
                            <div className="p-2 flex gap-2 items-center whitespace-pre-wrap">
                                <Avatar>
                                    <AvatarFallback>{currentUser?.user_metadata.avatar_initials}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm font-semibold font-heading">
                                    {currentUser?.user_metadata.full_name}
                                    <p className="text-xs font-light text-muted-foreground">{currentUser?.email}</p>

                                    <Button variant="link" size="sm" className="px-0">
                                        <Link href="#">My Profile</Link>
                                    </Button>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <Link href="/settings">
                                <DropdownMenuItem>
                                    <Settings className="size-4" />
                                    Account Settings
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">
                                <LogOut className="size-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
