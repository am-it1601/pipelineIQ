'use client';

import { useEffect, useState } from 'react';
import type { UpworkProfile } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import SectionHeader from '@/components/ui/SectionHeader';
import { Plus, Pencil, Check, X, Power } from 'lucide-react';

const empty = (): Omit<UpworkProfile, 'id'> => ({ profileName: '', status: 'active', focusArea: '' });

export default function ProfilesPage() {
  const user = useAuthStore((s) => s.currentUser);
  const router = useRouter();
  const [profiles, setProfiles] = useState<UpworkProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<UpworkProfile>>({});
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState(empty());

  useEffect(() => {
    if (user?.role !== 'admin') { router.replace('/dashboard'); return; }
    fetch('/api/profiles').then((r) => r.json()).then((d) => { setProfiles(d); setLoading(false); });
  }, []);

  const startEdit = (p: UpworkProfile) => { setEditingId(p.id); setDraft({ ...p }); };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };

  const saveEdit = async () => {
    const res = await fetch(`/api/profiles/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    if (res.ok) { const updated = await res.json(); setProfiles((prev) => prev.map((p) => p.id === editingId ? updated : p)); }
    setEditingId(null); setDraft({});
  };

  const toggleStatus = async (profile: UpworkProfile) => {
    const newStatus = profile.status === 'active' ? 'inactive' : 'active';
    const res = await fetch(`/api/profiles/${profile.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) { const updated = await res.json(); setProfiles((prev) => prev.map((p) => p.id === profile.id ? updated : p)); }
  };

  const saveNew = async () => {
    if (!newForm.profileName.trim()) return;
    const res = await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) });
    if (res.ok) { const created = await res.json(); setProfiles((prev) => [...prev, created]); setAdding(false); setNewForm(empty()); }
  };

  const inputStyle: React.CSSProperties = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: 'var(--text)', outline: 'none', width: '100%' };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Upwork Profiles"
        subtitle={`${profiles.filter(p => p.status === 'active').length} active profiles`}
        action={
          <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #22d3ee)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} />Add Profile
          </button>
        }
      />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Profile Name', 'Status', 'Focus Area', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr style={{ background: 'rgba(99,102,241,0.07)' }}>
                <td style={{ padding: '8px 14px' }}><input autoFocus placeholder="Profile Name" value={newForm.profileName} onChange={(e) => setNewForm(f => ({ ...f, profileName: e.target.value }))} style={inputStyle} onKeyDown={(e) => { if (e.key === 'Enter') saveNew(); }} /></td>
                <td style={{ padding: '8px 14px' }}><select value={newForm.status} onChange={(e) => setNewForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} style={inputStyle}><option>active</option><option>inactive</option></select></td>
                <td style={{ padding: '8px 14px' }}><input placeholder="e.g. Full-Stack Development" value={newForm.focusArea} onChange={(e) => setNewForm(f => ({ ...f, focusArea: e.target.value }))} style={inputStyle} /></td>
                <td style={{ padding: '8px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={saveNew} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} />Save</button>
                    <button onClick={() => setAdding(false)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} />Cancel</button>
                  </div>
                </td>
              </tr>
            )}

            {profiles.map((p, i) => {
              const isEditing = editingId === p.id;
              return (
                <tr key={p.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)' }}>
                    {isEditing ? <input value={draft.profileName ?? p.profileName} onChange={(e) => setDraft(d => ({ ...d, profileName: e.target.value }))} style={inputStyle} autoFocus /> : p.profileName}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'active' ? '#10b981' : '#ef4444', border: `1px solid ${p.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {isEditing ? <input value={draft.focusArea ?? p.focusArea} onChange={(e) => setDraft(d => ({ ...d, focusArea: e.target.value }))} style={inputStyle} /> : p.focusArea}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={saveEdit} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} />Save</button>
                        <button onClick={cancelEdit} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} />Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => startEdit(p)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} /></button>
                        <button onClick={() => toggleStatus(p)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${p.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, background: 'transparent', color: p.status === 'active' ? '#ef4444' : '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Power size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
