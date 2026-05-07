'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, BellRing, CheckCheck, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useMarkAllRead,
  useMarkOneRead,
  useNotifications,
} from '@/hooks/http/notifications/notifications.hooks';
import type { AppNotification } from '@/lib/services/notifications.service';
import { useAuthStore } from '@/store/authStore';


interface NotifRowProps {
  notification: AppNotification;
  onRead: (id: string) => void;
  onNavigate: (n: AppNotification) => void;
}

function NotifRow({ notification, onRead, onNavigate }: NotifRowProps) {
  const isUnread = !notification.is_read;

  return (
    <button
      type="button"
      className={`
        w-full text-left flex items-start gap-3 px-4 py-3 transition-colors
        hover:bg-accent/60
        ${isUnread ? 'bg-primary/5' : ''}
      `}
      onClick={() => {
        if (isUnread) onRead(notification.id);
        onNavigate(notification);
      }}
    >
      <Avatar className="size-8 shrink-0 mt-0.5">
        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
          {notification.sender?.avatar_initials ?? <MessageSquare className="size-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight ${isUnread ? 'font-semibold' : 'font-medium'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
          {notification.message}
        </p>
        <time className="text-[11px] text-muted-foreground/60 mt-1 block">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </time>
      </div>

      {isUnread && (
        <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" aria-label="Unread" />
      )}
    </button>
  );
}


export default function NotificationBell() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);

  const { data: notifications = [] } = useNotifications(currentUser?.id);
  const markOne = useMarkOneRead(currentUser?.id);
  const markAll = useMarkAllRead(currentUser?.id);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleNavigate(n: AppNotification) {
    if (n.lead_id) router.push(`/leads/${n.lead_id}`);
  }

  function handleMarkAllRead() {
    if (unreadCount > 0) markAll.mutate();
  }

  const BellIcon = unreadCount > 0 ? BellRing : Bell;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="notification-bell-btn"
          variant="ghost"
          size="icon"
          className="topbar__icon-btn relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <BellIcon
            className={`h-5 w-5 transition-all duration-300 ${
              unreadCount > 0 ? 'text-primary animate-[pulse_2s_ease-in-out_infinite]' : ''
            }`}
          />

          {/* Badge */}
          {unreadCount > 0 && (
            <span
              className="
                absolute -top-0.5 -right-0.5
                min-w-[18px] h-[18px] px-1
                flex items-center justify-center
                rounded-full text-[10px] font-bold
                bg-destructive text-destructive-foreground
                ring-2 ring-background
                pointer-events-none
              "
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] max-h-[480px] p-0 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <DropdownMenuLabel className="p-0 text-base font-semibold">
            Notifications
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={markAll.isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground px-6">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="size-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Notifications from @mentions will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => (
                <NotifRow
                  key={n.id}
                  notification={n}
                  onRead={(id) => markOne.mutate(id)}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <div className="px-4 py-2.5 shrink-0">
              <p className="text-center text-[11px] text-muted-foreground/60">
                Showing last {notifications.length} notification
                {notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
