'use client';

import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { USERS } from '@/lib/data/users';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Globe,
  BarChart3,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/leads', label: 'Lead Log', icon: <FileText size={18} /> },
  { href: '/members', label: 'BD Members', icon: <Users size={18} />, adminOnly: true },
  { href: '/profiles', label: 'Upwork Profiles', icon: <Globe size={18} />, adminOnly: true },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} />, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = usePermissions();
  const { currentUser, login, logout } = useAuthStore();
  const [userOpen, setUserOpen] = useState(false);

  const visible = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Maverics</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>BD Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visible.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 4,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                background: active ? 'rgba(15, 108, 189, 0.05)' : 'transparent',
                borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                }
              }}
            >
              <span style={{ color: active ? 'var(--primary)' : 'inherit' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User switch (simulates auth) */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setUserOpen(!userOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 4,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--text)',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: currentUser?.role === 'admin' ? 'var(--accent)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {currentUser?.avatarInitials}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{currentUser?.name}</div>
            <div
              style={{
                fontSize: 10,
                color: currentUser?.role === 'admin' ? 'var(--accent)' : 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {currentUser?.role}
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" style={{ transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {userOpen && (
          <div
            style={{
              marginTop: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <div style={{ padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Switch User
            </div>
            {USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => { login(u.id); setUserOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: u.id === currentUser?.id ? 'var(--surface-2)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: u.role === 'admin' ? 'var(--accent)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {u.avatarInitials}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: u.id === currentUser?.id ? 600 : 400 }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: u.role === 'admin' ? 'var(--accent)' : 'var(--primary)' }}>{u.role}</div>
                </div>
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
            <button
              onClick={() => { logout(); setUserOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--danger)',
                fontSize: 12,
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
