'use client';

import { useEffect, useState } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import BDDashboard from '@/components/dashboard/BDDashboard';

export default function DashboardPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [leads, setLeads] = useState<LeadLogEntry[]>([]);
  const [members, setMembers] = useState<BDMember[]>([]);
  const [profiles, setProfiles] = useState<UpworkProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [leadsRes, membersRes, profilesRes] = await Promise.all([
          fetch('/api/leads').then((r) => r.json()),
          fetch('/api/members').then((r) => r.json()),
          fetch('/api/profiles').then((r) => r.json()),
        ]);
        
        // API returns { data: [], pagination: {} } or just []
        const leadsData = leadsRes.data || leadsRes;
        const membersData = membersRes.data || (Array.isArray(membersRes) ? membersRes : []);
        const profilesData = profilesRes.data || (Array.isArray(profilesRes) ? profilesRes : []);
        
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setMembers(Array.isArray(membersData) ? membersData : []);
        setProfiles(Array.isArray(profilesData) ? profilesData : []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLeads([]);
        setMembers([]);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading dashboard…</div>
      </div>
    );
  }

  if (!currentUser) {
    return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Please select a user from the sidebar.</div>;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard leads={leads} members={members} profiles={profiles} />;
  }

  return <BDDashboard leads={leads} members={members} profiles={profiles} user={currentUser} />;
}
