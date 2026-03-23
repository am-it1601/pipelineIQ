'use client';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { usePathname } from 'next/navigation';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Log',
  '/members': 'BD Members',
  '/profiles': 'Upwork Profiles',
  '/analytics': 'Analytics',
};

export default function Topbar() {
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle } = useThemeStore();

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const iconBtnStyle: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 4,
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-muted)',
    transition: 'background 0.15s, color 0.15s',
  };

  return (
    <header
      style={{
        height: 52,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'background 0.2s',
      }}
    >
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text)' }}>{title}</h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{today}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Role badge */}
        <span style={{
          padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
          background: currentUser?.role === 'admin' ? 'rgba(0, 120, 212, 0.15)' : 'rgba(15, 108, 189, 0.15)',
          color: currentUser?.role === 'admin' ? 'var(--accent)' : 'var(--primary)',
          border: `1px solid ${currentUser?.role === 'admin' ? 'rgba(0, 120, 212, 0.3)' : 'rgba(15, 108, 189, 0.3)'}`,
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {currentUser?.role ?? 'Guest'}
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={iconBtnStyle}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification bell */}
        <button style={iconBtnStyle}><Bell size={16} /></button>

        {/* User avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: currentUser?.role === 'admin' ? 'var(--accent)' : 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
        }}>
          {currentUser?.avatarInitials}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => { logout(); }}
          title="Log out"
          style={{
            width: 32, height: 32, borderRadius: 4,
            background: 'var(--surface-2)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#ef4444',
            transition: 'all 0.15s',
            marginLeft: 4
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
