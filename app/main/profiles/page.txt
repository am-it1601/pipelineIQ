'use client';

import { useEffect, useState } from 'react';
import type { UpworkProfile } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import SectionHeader from '@/components/ui/SectionHeader';
import { Plus, Pencil, Check, X, Power } from 'lucide-react';

const empty = (): Omit<UpworkProfile, 'id'> => ({ profile_name: '', profile_link: '', status: 'active', focus_area: '', skill_tags: '' } as Omit<UpworkProfile, 'id'>);

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
    if (!newForm.profile_name.trim()) return;
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
              {['Profile Name', 'Profile Link', 'Status', 'Focus Area', 'Skill Tags', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr style={{ background: 'rgba(99,102,241,0.07)' }}>
                <td style={{ padding: '8px 14px' }}><input autoFocus placeholder="Profile Name" value={newForm.profile_name} onChange={(e) => setNewForm(f => ({ ...f, profile_name: e.target.value }))} style={inputStyle} onKeyDown={(e) => { if (e.key === 'Enter') saveNew(); }} /></td>
                <td style={{ padding: '8px 14px' }}><input placeholder="Upwork Link" value={newForm.profile_link || ''} onChange={(e) => setNewForm(f => ({ ...f, profile_link: e.target.value }))} style={inputStyle} /></td>
                <td style={{ padding: '8px 14px' }}><select value={newForm.status} onChange={(e) => setNewForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} style={inputStyle}><option>active</option><option>inactive</option></select></td>
                <td style={{ padding: '8px 14px' }}><input placeholder="e.g. Full-Stack Development" value={newForm.focus_area || ""} onChange={(e) => setNewForm(f => ({ ...f, focus_area: e.target.value }))} style={inputStyle} /></td>
                <td style={{ padding: '8px 14px' }}><input placeholder="React, Node.js" value={newForm.skill_tags || ''} onChange={(e) => setNewForm(f => ({ ...f, skill_tags: e.target.value }))} style={inputStyle} /></td>
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
                    {isEditing ? <input value={draft.profile_name ?? p.profile_name} onChange={(e) => setDraft(d => ({ ...d, profile_name: e.target.value }))} style={inputStyle} autoFocus /> : p.profile_name}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text)' }}>
                    {isEditing ? <input value={(draft.profile_link ?? p.profile_link) || ''} onChange={(e) => setDraft(d => ({ ...d, profile_link: e.target.value }))} style={inputStyle} /> : (p.profile_link ? <a href={p.profile_link} target="_blank" rel="noreferrer" style={{color: '#6366f1', textDecoration: 'none'}}>View</a> : '-')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'active' ? '#10b981' : '#ef4444', border: `1px solid ${p.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {isEditing ? <input value={draft.focus_area ?? p.focus_area ?? ""} onChange={(e) => setDraft(d => ({ ...d, focus_area: e.target.value }))} style={inputStyle} /> : p.focus_area}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                    {isEditing ? <input value={(draft.skill_tags ?? p.skill_tags) || ''} onChange={(e) => setDraft(d => ({ ...d, skill_tags: e.target.value }))} style={inputStyle} /> : p.skill_tags || '-'}
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
