'use client';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarTrigger
} from "@/components/ui/sidebar";
import { createClient } from '@/lib/supabase/client';
import { cn } from "@/lib/utils";
import { useAuthStore } from '@/store/authStore';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from "next-themes";
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Log',
  '/members': 'BD Members',
  '/profiles': 'Upwork Profiles',
  '/analytics': 'Analytics',
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const { setTheme } = useTheme()

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="sticky top-0 z-auto bg-sidebar flex h-16 shrink-0 items-center justify-between gap-2 shadow-md">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto bg-muted text-pri"
        />
        <div>
          <h1 className="m-0 text-lg font-bold text-foreground">{title}</h1>
          <p className="m-0 text-xs text-muted-foreground">{today}</p>
        </div>
      </div>


      <div className="flex items-center gap-2 mr-4">
        {/* Role badge */}
        <Badge className="rounded-none p-2" variant='secondary'>
          {currentUser?.role ?? 'Guest'}
        </Badge>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" />
            }
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification bell */}
        <Button
          variant='outline'
          size='icon'
        ><Bell size={16} /></Button>

        {/* User avatar */}
        <div
          className={
            cn(currentUser?.role === 'admin' ? 'bg-primary' : 'bg-accent', 'w-8 h-8 flex items-center justify-center text-xs font-bold text-white rounded-full')
          }
        >
          {currentUser?.avatar_initials}
        </div>

        {/* Logout Button */}
        <Button
          variant='outline'
          size='icon'
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            logout();
            router.push('/login');
            router.refresh();
          }}
          title="Log out"
          className="
          w-8 border border-destructive ml-1 transition-all cursor-pointer 
          text-destructive
          "
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
