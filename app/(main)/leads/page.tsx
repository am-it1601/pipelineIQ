'use client';

import { useEffect, useState } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import LeadLogTable from '@/components/leads/LeadLogTable';
import SectionHeader from '@/components/ui/SectionHeader';

export default function LeadsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [leads, setLeads] = useState<LeadLogEntry[]>([]);
  const [members, setMembers] = useState<BDMember[]>([]);
  const [profiles, setProfiles] = useState<UpworkProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [l, m, p] = await Promise.all([
        fetch('/api/leads').then((r) => r.json()),
        fetch('/api/members').then((r) => r.json()),
        fetch('/api/profiles').then((r) => r.json()),
      ]);
      setLeads(l);
      setMembers(m);
      setProfiles(p);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading leads…</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Lead Log"
        subtitle={currentUser.role === 'admin' ? `${leads.length} total entries across all BD members` : `Your personal lead log`}
      />
      <LeadLogTable
        initialLeads={leads}
        members={members}
        profiles={profiles}
        user={currentUser}
      />
    </div>
  );
}
